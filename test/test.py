# Copyright 2012 Mozilla Foundation
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import json, platform, os, shutil, sys, subprocess, tempfile, threading
import time, urllib, urllib2, hashlib, re, base64, uuid, socket, errno
from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
from SocketServer import ThreadingMixIn
from optparse import OptionParser
from urlparse import urlparse, parse_qs
from threading import Lock

USAGE_EXAMPLE = "%prog"

# The local web server uses the git repo as the document root.
DOC_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__),".."))

DEFAULT_MANIFEST_FILE = 'test_manifest.json'
EQLOG_FILE = 'eq.log'
BROWSERLOG_FILE = 'browser.log'
TRACELOG_FILE = 'trace.log'
REFDIR = 'ref'
TMPDIR = 'tmp'
VERBOSE = False
BROWSER_TIMEOUT = 90

SERVER_HOST = "localhost"

lock = Lock()

class TestOptions(OptionParser):
    def __init__(self, **kwargs):
        OptionParser.__init__(self, **kwargs)
        self.add_option("-m", "--masterMode", action="store_true", dest="masterMode",
                        help="Run the script in master mode.", default=False)
        self.add_option("--noPrompts", action="store_true", dest="noPrompts",
                        help="Uses default answers (intended for CLOUD TESTS only!).", default=False)
        self.add_option("--manifestFile", action="store", type="string", dest="manifestFile",
                        help="A JSON file in the form of test_manifest.json (the default).")
        self.add_option("-b", "--browser", action="store", type="string", dest="browser",
                        help="The path to a single browser (right now, only Firefox is supported).")
        self.add_option("--browserManifestFile", action="store", type="string",
                        dest="browserManifestFile",
                        help="A JSON file in the form of those found in resources/browser_manifests")
        self.add_option("--reftest", action="store_true", dest="reftest",
                        help="Automatically start reftest showing comparison test failures, if there are any.",
                        default=False)
        self.add_option("--bundle", action="store_true", dest="bundle",
                        help="Runs tests for compiled/bundled files.",
                        default=False)
        self.add_option("--port", action="store", dest="port", type="int",
                        help="The port the HTTP server should listen on.", default=8080)
        self.set_usage(USAGE_EXAMPLE)

    def verifyOptions(self, options):
        if options.masterMode and options.manifestFile:
            self.error("--masterMode and --manifestFile must not be specified at the same time.")
        if not options.manifestFile:
            options.manifestFile = DEFAULT_MANIFEST_FILE
        if options.browser and options.browserManifestFile:
            print "Warning: ignoring browser argument since manifest file was also supplied"
        if not options.browser and not options.browserManifestFile:
            print "Starting server on port %s." % options.port

        return options
        
def prompt(question):
    '''Return True if the user answered "yes" to |question|.'''
    inp = raw_input(question +' [yes/no] > ')
    return inp == 'yes'

MIMEs = {
    '.css': 'text/css',
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.svg': 'image/svg+xml',
    '.swf': 'application/x-shockwave-flash',
    '.xhtml': 'application/xhtml+xml',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.jpg': 'image/jpeg',
    '.png': 'image/png',
    '.log': 'text/plain',
    '.properties': 'text/plain',
    '.stas': 'text/plain',
    '.trace': 'text/plain',
    '.as': 'text/plain',
    '.abc': 'application/octet-stream',
    '.abcs': 'application/octet-stream',
    '.bin': 'application/octet-stream',
    '.txt': 'text/plain',
    '.map': 'text/plain',
}

class State:
    browsers = [ ]
    manifest = { }
    taskResults = { }
    remaining = { }
    results = { }
    done = False
    numErrors = 0
    numEqFailures = 0
    numEqNoSnapshot = 0
    numStasFailures = 0
    eqLog = None
    traceLog = None
    lastPost = { }
    currentTest = { }

class Result:
    def __init__(self, snapshot, failure, item):
        self.snapshot = snapshot
        self.failure = failure
        self.item = item

class TestServer(ThreadingMixIn, HTTPServer):
    pass

class TestHandlerBase(BaseHTTPRequestHandler):
    # Disable annoying noise by default
    def log_request(code=0, size=0):
        if VERBOSE:
            BaseHTTPRequestHandler.log_request(code, size)

    def handle_one_request(self):
        try:
            BaseHTTPRequestHandler.handle_one_request(self)
        except socket.error, v:
            # Ignoring connection reset by peer exceptions
            if v[0] != errno.ECONNRESET:
                raise

    def sendFile(self, path, ext):
        self.send_response(200)
        self.send_header("Content-Type", MIMEs[ext])
        self.send_header("Content-Length", os.path.getsize(path))
        self.end_headers()
        with open(path, "rb") as f:
            self.wfile.write(f.read())

    def do_GET(self):
        with lock:
          url = urlparse(self.path)

          # Ignore query string
          path, _ = urllib.unquote_plus(url.path), url.query
          path = os.path.abspath(os.path.realpath(DOC_ROOT + os.sep + path))
          prefix = os.path.commonprefix(( path, DOC_ROOT ))
          _, ext = os.path.splitext(path.lower())

          if url.path == "/favicon.ico":
              self.sendFile(os.path.join(DOC_ROOT, "test", "resources", "favicon.ico"), ext)
              return

          if os.path.isdir(path):
              self.sendIndex(url.path, url.query)
              return

          if not (prefix == DOC_ROOT
                  and os.path.isfile(path)
                  and ext in MIMEs):
              print path
              self.send_error(404)
              return

          if 'Range' in self.headers:
              # TODO for fetch-as-you-go
              self.send_error(501)
              return

          self.sendFile(path, ext)

class PDFTestHandler(TestHandlerBase):

    def sendIndex(self, path, query):
        if not path.endswith("/"):
          # we need trailing slash
          self.send_response(301)
          redirectLocation = path + "/"
          if query:
            redirectLocation += "?" + query
          self.send_header("Location",  redirectLocation)
          self.end_headers()
          return

        self.send_response(200)
        self.send_header("Content-Type", "text/html")
        self.end_headers()
        if query == "frame":
          self.wfile.write("<html><frameset cols=*,200><frame name=swf>" +
            "<frame src='" + path + "'></frameset></html>")
          return

        location = os.path.abspath(os.path.realpath(DOC_ROOT + os.sep + path))
        self.wfile.write("<html><body><h1>SWFs of " + path + "</h1>\n")
        for filename in os.listdir(location):
          if filename.lower().endswith('.swf'):
            self.wfile.write("<a href='/examples/inspector/inspector.html?rfile=" +
              urllib.quote_plus(path + filename, '/') + "' target=swf>" +
              filename + "</a><br>\n")
        self.wfile.write("</body></html>")


    def do_POST(self):
        with lock:
          numBytes = int(self.headers['Content-Length'])

          self.send_response(200)
          self.send_header('Content-Type', 'text/plain')
          self.end_headers()

          url = urlparse(self.path)
          if url.path == "/tellMeToQuit":
              tellAppToQuit(url.path, url.query)
              return
          if url.path == "/progress":
              progressInfo = parse_qs(url.query)
              browser = progressInfo['browser'][0]
              State.lastPost[browser] = int(time.time())
              State.currentTest[browser] = progressInfo['id'][0]
              return

          result = json.loads(self.rfile.read(numBytes))
          browser, id, failure, item, snapshot = result['browser'], result['id'], result['failure'], result['item'], result['snapshot']
          State.lastPost[browser] = int(time.time())
          taskResults = State.taskResults[browser][id]
          taskResults.append(Result(snapshot, failure, item))

          def isTaskDone():
              numItems = result["numItems"]
              if len(taskResults) < numItems:
                  return False
              return True

          if isTaskDone():
              check(State.manifest[id], taskResults, browser,
                    self.server.masterMode)
              # Please oh please GC this ...
              del State.taskResults[browser][id]
              State.remaining[browser] -= 1

              checkIfDone()

def checkIfDone():
    State.done = True
    for key in State.remaining:
        if State.remaining[key] != 0:
            State.done = False
            return

# Applescript hack to quit Chrome on Mac
def tellAppToQuit(path, query):
    if platform.system() != "Darwin":
        return
    d = parse_qs(query)
    path = d['path'][0]
    cmd = """osascript<<END
tell application "%s"
quit
end tell
END""" % path
    os.system(cmd)

class BaseBrowserCommand(object):
    def __init__(self, browserRecord):
        self.name = browserRecord["name"]
        self.path = browserRecord["path"]
        self.tempDir = None
        self.process = None

        if platform.system() == "Darwin" and (self.path.endswith(".app") or self.path.endswith(".app/")):
            self._fixupMacPath()

        if not os.path.exists(self.path):
            raise Exception("Path to browser '%s' does not exist." % self.path)

    def setup(self):
        self.tempDir = tempfile.mkdtemp()
        self.profileDir = os.path.join(self.tempDir, "profile")
        self.browserLog = open(BROWSERLOG_FILE, "w")

    def teardown(self):
        print "Tearing down %s ..." % self.name
        self.process.terminate()

        # Waiting up to ten seconds for it to quit
        checks = 0
        while self.process.poll() is None and checks < 20:
            checks += 1
            time.sleep(.5)
        # If it's still not dead, trying to kill it
        if self.process.poll() is None:
            print "Process %s is still running. Killing." % self.name
            self.process.kill()
            self.process.wait()

        self.process = None
        time.sleep(1)

        if self.tempDir is not None and os.path.exists(self.tempDir):
            shutil.rmtree(self.tempDir)

        self.browserLog.close()

    def start(self, url):
        raise Exception("Can't start BaseBrowserCommand")

class FirefoxBrowserCommand(BaseBrowserCommand):
    def _fixupMacPath(self):
        self.path = os.path.join(self.path, "Contents", "MacOS", "firefox-bin")

    def setup(self):
        super(FirefoxBrowserCommand, self).setup()
        shutil.copytree(os.path.join(DOC_ROOT, "test", "resources", "firefox"),
                        self.profileDir)

    def start(self, url):
        cmds = [self.path]
        if platform.system() == "Darwin":
            cmds.append("-foreground")
        cmds.extend(["-no-remote", "-profile", self.profileDir, url])
        self.process = subprocess.Popen(cmds, stdout = self.browserLog, stderr = self.browserLog)

class ChromeBrowserCommand(BaseBrowserCommand):
    def _fixupMacPath(self):
        self.path = os.path.join(self.path, "Contents", "MacOS", "Google Chrome")

    def start(self, url):
        cmds = [self.path]
        cmds.extend(["--user-data-dir=%s" % self.profileDir,
                     "--no-first-run", "--disable-sync", url])
        self.process = subprocess.Popen(cmds, stdout = self.browserLog, stderr = self.browserLog)

def makeBrowserCommand(browser):
    path = browser["path"].lower()
    name = browser["name"]
    if name is not None:
        name = name.lower()

    types = {"firefox": FirefoxBrowserCommand,
             "chrome": ChromeBrowserCommand }
    command = None
    for key in types.keys():
        if (name and name.find(key) > -1) or path.find(key) > -1:
            command = types[key](browser)
            command.name = command.name or key
            break

    if command is None:
        raise Exception("Unrecognized browser: %s" % browser)

    return command 

def makeBrowserCommands(browserManifestFile):
    with open(browserManifestFile) as bmf:
        browsers = [makeBrowserCommand(browser) for browser in json.load(bmf)]
    return browsers

def getTestBrowsers(options):
    testBrowsers = []
    if options.browserManifestFile:
        testBrowsers = makeBrowserCommands(options.browserManifestFile)
    elif options.browser:
        testBrowsers = [makeBrowserCommand({"path":options.browser, "name":None})]

    if options.browserManifestFile or options.browser:
        assert len(testBrowsers) > 0
    return testBrowsers

def setUp(options):
    if options.masterMode and os.path.isdir(TMPDIR):
        print 'Temporary snapshot dir tmp/ is still around.'
        print 'tmp/ can be removed if it has nothing you need.'
        if options.noPrompts or prompt('SHOULD THIS SCRIPT REMOVE tmp/?  THINK CAREFULLY'):
            subprocess.call(( 'rm', '-rf', 'tmp' ))

    assert not os.path.isdir(TMPDIR)

    testBrowsers = getTestBrowsers(options)

    with open(options.manifestFile) as mf:
        manifestList = json.load(mf)

    for b in testBrowsers:
        State.taskResults[b.name] = { }
        State.remaining[b.name] = len(manifestList)
        State.lastPost[b.name] = int(time.time())
        for item in manifestList:
            id = item['id']
            State.manifest[id] = item
            taskResults = [ ]
            State.taskResults[b.name][id] = taskResults

    return testBrowsers

def setUpUnitTests(options):
    # Only serve files from a pdf.js clone
    assert not GIT_CLONE_CHECK or os.path.isfile('../src/pdf.js') and os.path.isdir('../.git')

    testBrowsers = getTestBrowsers(options)

    UnitTestState.browsersRunning = len(testBrowsers)
    for b in testBrowsers:
        UnitTestState.lastPost[b.name] = int(time.time())
    return testBrowsers

def startBrowsers(browsers, options, path):
    for b in browsers:
        b.setup()
        print 'Launching', b.name
        host = 'http://%s:%s' % (SERVER_HOST, options.port) 
        qs = '?browser='+ urllib.quote(b.name) +'&manifestFile='+ urllib.quote(options.manifestFile)
        if options.bundle:
          qs += '&bundle=true'
        qs += '&path=' + b.path
        b.start(host + path + qs)

def teardownBrowsers(browsers):
    for b in browsers:
        try:
            b.teardown()
        except:
            print "Error cleaning up after browser at ", b.path
            print "Temp dir was ", b.tempDir
            print "Error:", sys.exc_info()[0]

def check(task, results, browser, masterMode):
    failed = False
    for p in xrange(len(results)):
        itemResult = results[p]
        if itemResult is None:
            continue
        failure = itemResult.failure
        if failure:
            failed = True
            State.numErrors += 1
            print 'TEST-UNEXPECTED-FAIL | test failed', task['id'], '| in', browser, '|', itemResult.item, '|', failure

    if failed:
        return

    kind = task['type']
    if 'eq' == kind:
        checkEq(task, results, browser, masterMode)
    elif 'stas' == kind:
        checkStas(task, results, browser)
    elif 'sanity' == kind:
        checkSanity(task, results, browser)
    else:
        assert 0 and 'Unknown test type'


def checkEq(task, results, browser, masterMode):
    pfx = os.path.join(REFDIR, sys.platform, browser, task['id'])
    taskId = task['id']
    taskType = task['type']

    passed = True
    for p in xrange(len(results)):
        snapshot = results[p].snapshot
        ref = None
        eq = True

        path = os.path.join(pfx, str(p + 1))
        if not os.access(path, os.R_OK):
            State.numEqNoSnapshot += 1
            if not masterMode:
                print 'WARNING: no reference snapshot', path
        else:
            f = open(path)
            ref = f.read()
            f.close()

            eq = (ref == snapshot)
            if not eq:
                print 'TEST-UNEXPECTED-FAIL |', taskType, taskId, '| in', browser, '| rendering of snapshot', p + 1, '!= reference rendering'

                if not State.eqLog:
                    State.eqLog = open(EQLOG_FILE, 'w')
                eqLog = State.eqLog

                # NB: this follows the format of Mozilla reftest
                # output so that we can reuse its reftest-analyzer
                # script
                eqLog.write('REFTEST TEST-UNEXPECTED-FAIL | ' + browser +'-'+ taskId +'-item'+ str(p + 1) + ' | image comparison (==)\n')
                eqLog.write('REFTEST   IMAGE 1 (TEST): ' + snapshot + '\n')
                eqLog.write('REFTEST   IMAGE 2 (REFERENCE): ' + ref + '\n')

                passed = False
                State.numEqFailures += 1

        if masterMode and (ref is None or not eq):
            tmpTaskDir = os.path.join(TMPDIR, sys.platform, browser, task['id'])
            try:
                os.makedirs(tmpTaskDir)
            except OSError, e:
                if e.errno != 17: # file exists
                    print >>sys.stderr, 'Creating', tmpTaskDir, 'failed!'
        
            of = open(os.path.join(tmpTaskDir, str(p + 1)), 'w')
            of.write(snapshot)
            of.close()

    if passed:
        print 'TEST-PASS |', taskType, 'test', task['id'], '| in', browser

def checkStas(task, results, browser):
    taskId = task['id']
    taskType = task['type']

    passed = True
    for p in xrange(len(results)):
        snapshot = results[p].snapshot
        ref = None
        eq = True

        if snapshot['isDifferent']:
          print 'TEST-UNEXPECTED-FAIL |', taskType, taskId, '| in', browser, '| trace of ', p + 1, '!= reference trace'

          if not State.traceLog:
              State.traceLog = open(TRACELOG_FILE, 'w')
          traceLog = State.traceLog

          traceLog.write('REFTEST TEST-UNEXPECTED-FAIL | ' + browser +'-'+ taskId +'-item'+ str(p + 1) + ' | ' + results[p].item + ' | trace\n')
          traceLog.write(diffData(snapshot['data1'], snapshot['data2']))

          passed = False
          State.numStasFailures += 1

    if passed:
        print 'TEST-PASS | stas test', task['id'], '| in', browser

def diffData(testData, refData):
  try:
    with open("refdata~", "wb") as f1:
      f1.write(refData)
    with open("testdata~", "wb") as f2:
      f2.write(testData)
    with open("diffresult~", "wb") as fresult:
      process = subprocess.Popen(['diff', '-U', '2', 'refdata~', 'testdata~'], stdout = fresult)
      process.wait()
    with open("diffresult~", "rb") as fresult:
      result = fresult.read()
    os.remove("diffresult~")
    os.remove("refdata~")
    os.remove("testdata~")
    return result

  except:
    return '<<<< reference\n' + refData.encode('utf-8') + '====\n' + testData.encode('utf-8') + '>>>> test\n';

def checkSanity(task, results, browser):
    taskId = task['id']
    taskType = task['type']

    passed = True
    for p in xrange(len(results)):
        if results[p].failure:
          print 'TEST-UNEXPECTED-FAIL |', taskType, taskId, '| in', browser, '| trace of ', p + 1, '!= reference trace'

          passed = False

    if passed:
        print 'TEST-PASS | sanity test', task['id'], '| in', browser


def processResults():
    print ''
    numFatalFailures = (State.numErrors + State.numStasFailures)
    if 0 == State.numEqFailures and 0 == numFatalFailures:
        print 'All regression tests passed.'
    else:
        print 'OHNOES!  Some tests failed!'
        if 0 < State.numErrors:
            print '  errors:', State.numErrors
        if 0 < State.numEqFailures:
            print '  different ref/snapshot:', State.numEqFailures
        if 0 < State.numStasFailures:
            print '  failed stas:', State.numStasFailures


def maybeUpdateRefImages(options, browser):
    if options.masterMode and (0 < State.numEqFailures or 0 < State.numEqNoSnapshot): 
        print "Some eq tests failed or didn't have snapshots."
        print 'Checking to see if master references can be updated...'
        numFatalFailures = State.numErrors
        if 0 < numFatalFailures:
            print '  No.  Some non-eq tests failed.'
        else:
            print '  Yes!  The references in tmp/ can be synced with ref/.'
            if options.reftest:                                                                                                              
                startReftest(browser, options)
            if options.noPrompts or prompt('Would you like to update the master copy in ref/?'):
                sys.stdout.write('  Updating ref/ ... ')

                if not os.path.exists('ref'):
                    subprocess.check_call('mkdir ref', shell = True)
                subprocess.check_call('cp -Rf tmp/* ref/', shell = True)
                subprocess.check_call('rm -rf tmp', shell = True)

                print 'done'
            else:
                print '  OK, not updating.'

def startReftest(browser, options):
    if options.noPrompts:
        return

    url = "http://%s:%s" % (SERVER_HOST, options.port)
    url += "/test/resources/reftest-analyzer.xhtml"
    url += "#web=/test/eq.log"
    try:
        browser.setup()
        browser.start(url)
        print "Waiting for browser..."
        browser.process.wait()
    finally:
        teardownBrowsers([browser])
    print "Completed reftest usage."

def runTests(options, browsers):
    t1 = time.time()
    try:
        startBrowsers(browsers, options, '/test/test.html')
        while not State.done:
            for b in State.lastPost:
                if State.remaining[b] > 0 and int(time.time()) - State.lastPost[b] > BROWSER_TIMEOUT:
                    print 'TEST-UNEXPECTED-FAIL | test', State.currentTest[b], 'failed', b, "has not responded in", BROWSER_TIMEOUT, "s"
                    State.numErrors += State.remaining[b]
                    State.remaining[b] = 0
                    checkIfDone()
            time.sleep(1)
        processResults()
    finally:
        teardownBrowsers(browsers)
    t2 = time.time()
    print "Runtime was", int(t2 - t1), "seconds"
    if State.eqLog:
        State.eqLog.close();
    if State.traceLog:
        State.traceLog.close();
    if options.masterMode:
        maybeUpdateRefImages(options, browsers[0])
    elif options.reftest and State.numEqFailures > 0:
        print "\nStarting reftest harness to examine %d eq test failures." % State.numEqFailures
        startReftest(browsers[0], options)

def main():
    optionParser = TestOptions()
    options, args = optionParser.parse_args()
    options = optionParser.verifyOptions(options)
    if options == None:
        sys.exit(1)

    httpd = TestServer((SERVER_HOST, options.port), PDFTestHandler)
    httpd.masterMode = options.masterMode
    httpd_thread = threading.Thread(target=httpd.serve_forever)
    httpd_thread.setDaemon(True)
    httpd_thread.start()

    browsers = setUp(options)
    if len(browsers) > 0:
        runTests(options, browsers)
    else:
        # just run the server
        print "Running HTTP server. Press Ctrl-C to quit."
        try:
            while True:
                time.sleep(1)
        except (KeyboardInterrupt):
            print "\nExiting."

if __name__ == '__main__':
    main()
