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
import sqlite3
from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
from SocketServer import ThreadingMixIn
from optparse import OptionParser
from urlparse import urlparse, parse_qs
from threading import Lock

USAGE_EXAMPLE = "%prog"

# The local web server uses the git repo as the document root.
DOC_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__),"../.."))

VERBOSE = False
BROWSER_TIMEOUT = 30

SERVER_HOST = "localhost"

lock = Lock()
initialized = False
stopped = False

class TestOptions(OptionParser):
    def __init__(self, **kwargs):
        OptionParser.__init__(self, **kwargs)
        self.add_option("-b", "--browser", action="store", type="string", dest="browser",
                        help="The path to a single browser (right now, only Firefox is supported).")
        self.add_option("--port", action="store", dest="port", type="int",
                        help="The port the HTTP server should listen on.", default=8087)
        self.set_usage(USAGE_EXAMPLE)

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
    '.png': 'image/png',
    '.log': 'text/plain',
    '.properties': 'text/plain',
    '.stas': 'text/plain',
    '.trace': 'text/plain',
    '.abc': 'application/octet-stream',
    '.bin': 'application/octet-stream',
    '.txt': 'text/plain',
}


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
        global initialized, stopped

        with lock:
          url = urlparse(self.path)

          # Ignore query string
          path, query = urllib.unquote_plus(url.path), url.query
          path = os.path.abspath(os.path.realpath(DOC_ROOT + os.sep + path))
          prefix = os.path.commonprefix(( path, DOC_ROOT ))
          _, ext = os.path.splitext(path.lower())

          if url.path == "/initialize":
              self.send_error(204)
              initialized = True
              return

          if url.path == "/checkpoint":
              self.send_error(204)
              stopped = True
              return

          if url.path == "/favicon.ico":
              self.sendFile(os.path.join(DOC_ROOT, "test", "resources", "favicon.ico"), ext)
              return

          if not (prefix == DOC_ROOT
                  and os.path.isfile(path)
                  and ext in MIMEs):
              print path
              self.send_error(404)
              return

          self.sendFile(path, ext)

def patchPerfs(basePath, params):
    infile = file(os.path.join(basePath, 'prefs.js'), 'r')
    whole = infile.readlines()
    infile.close()

    outfile = file(os.path.join(basePath, 'prefs.js'), 'w')
    for line in whole:
      if line.find('extensions.bootstrappedAddons') == -1:
        outfile.write(line)
      else:
        obj = dict()
        obj[params[0]] = dict(version=params[1], type=params[2], descriptor=params[3])
        outfile.write('user_pref("extensions.bootstrappedAddons", ' + json.dumps(json.dumps(obj)) + ');\n');
    outfile.close()

def main():
    optionParser = TestOptions()
    options, args = optionParser.parse_args()
    path = options.browser
    if path == None:
        print "Specify browser (see -b option)"
        exit(1)
    if platform.system() == "Darwin" and (path.endswith(".app") or path.endswith(".app/")):
        path = os.path.join(path, "Contents", "MacOS", "firefox-bin")

    baseUrl = 'http://' + SERVER_HOST + ':' + str(options.port)

    httpd = TestServer((SERVER_HOST, options.port), TestHandlerBase)
    httpd_thread = threading.Thread(target=httpd.serve_forever)
    httpd_thread.setDaemon(True)
    httpd_thread.start()

    tmpProfilePath = os.path.abspath("tmp_profile/")
    if os.path.exists(tmpProfilePath):
        shutil.rmtree(tmpProfilePath)
    shutil.copytree(os.path.join(DOC_ROOT, "test", "resources", "firefox"),
                    tmpProfilePath)
    shutil.copytree(os.path.join(DOC_ROOT, "build", "firefox"),
                    os.path.join(tmpProfilePath, "extensions", "shumway@research.mozilla.org"));

    cmds = [path]
    if platform.system() == "Darwin":
        cmds.append("-foreground")
    cmds.extend(["-no-remote", "-profile", tmpProfilePath, baseUrl + "/initialize"])
    process = subprocess.Popen(cmds)
    while not initialized:
        time.sleep(1)

    process.terminate()
    process.wait()

    # forcing extension to be activated
    extensionsDb = os.path.join(tmpProfilePath, "extensions.sqlite");
    conn = sqlite3.connect(extensionsDb)
    c = conn.cursor()
    c.execute("update addon set active = 1,userDisabled=0,bootstrap=1 where id like 'shumway%'");
    conn.commit()
    c = conn.cursor()
    c.execute("select id,version,type,descriptor from addon where id like 'shumway%'")
    extensionsParams = c.fetchone()
    conn.close()
    patchPerfs(tmpProfilePath, extensionsParams)


    process = subprocess.Popen([path, "-no-remote", "-profile", tmpProfilePath, baseUrl + "/test/extension/check.html"])
    t1 = int(time.time())
    while not stopped and (int(time.time()) - t1 <= BROWSER_TIMEOUT):
        time.sleep(1)

    process.terminate()
    process.wait()

    if not stopped:
        print "FAILED: flash movie is not responding"
        exit(1)
    else:
        print "SUCCESS: flash movie responded"

if __name__ == '__main__':
    main()
