/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*jslint node: true */

'use strict';

var WebServer = require('./webserver.js').WebServer;
var WebBrowser = require('./webbrowser.js').WebBrowser;
var path = require('path');
var fs = require('fs');
var os = require('os');
var url = require('url');
var testUtils = require('./testutils.js');

function parseOptions() {
  function describeCheck(fn, text) {
    fn.toString = function () {
      return text;
    };
    return fn;
  }

  var yargs = require('yargs')
    .usage('Usage: $0')
    .boolean(['help', 'masterMode', 'reftest', 'noPrompts', 'extension'])
    .string(['manifestFile', 'browser', 'browserManifestFile',
             'port', 'statsFile', 'statsDelay'])
    .alias('browser', 'b').alias('help', 'h').alias('masterMode', 'm').alias('extension', 'e')
    .describe('help', 'Show this help message')
    .describe('masterMode', 'Run the script in master mode.')
    .describe('noPrompts',
      'Uses default answers (intended for CLOUD TESTS only!).')
    .describe('extension', 'Run tests in the extension.')
    .describe('manifestFile',
      'A path to JSON file in the form of test_manifest.json')
    .default('manifestFile', 'test_manifest.json')
    .describe('browser', 'The path to a single browser ')
    .describe('browserManifestFile', 'A path to JSON file in the form of ' +
      'those found in resources/browser_manifests/')
    .describe('reftest', 'Automatically start reftest showing comparison ' +
      'test failures, if there are any.')
    .describe('port', 'The port the HTTP server should listen on.')
    .default('port', 8080)
    .describe('port_ssl', 'The port the HTTPS server should listen on.')
    .default('port_ssl', 0)
    .describe('statsFile', 'The file where to store stats.')
    .describe('statsDelay', 'The amount of time in milliseconds the browser ' +
      'should wait before starting stats.')
    .default('statsDelay', 0)
    .check(describeCheck(function (argv) {
      return +argv.reftest + argv.masterMode <= 1;
    }, '--reftest, --masterMode must not be specified at the same time.'))
    .check(describeCheck(function (argv) {
      return !argv.masterMode || argv.manifestFile === 'test_manifest.json';
    }, 'when --masterMode is specified --manifestFile shall be equal ' +
      'test_manifest.json'))
    .check(describeCheck(function (argv) {
      return !argv.browser || !argv.browserManifestFile;
    }, '--browser and --browserManifestFile must not be specified at the ' +'' +
      'same time.'));
  var result = yargs.argv;
  if (result.help) {
    yargs.showHelp();
    process.exit(0);
  }
  return result;
}

var refsTmpDir = 'tmp';
var testResultDir = 'test_snapshots';
var refsDir = 'ref';
var eqLog = 'eq.log';
var traceLog = 'reftrace.log';
var browserTimeout = 120;

function monitorBrowserTimeout(session, onTimeout) {
  if (session.timeoutMonitor) {
    clearTimeout(session.timeoutMonitor);
  }
  if (!onTimeout) {
    session.timeoutMonitor = null;
    return;
  }
  session.timeoutMonitor = setTimeout(function () {
    onTimeout(session);
  }, browserTimeout * 1000);
}

function updateRefImages() {
  function sync(removeTmp) {
    console.log('  Updating ref/ ... ');
    testUtils.copySubtreeSync(refsTmpDir, refsDir);
    if (removeTmp) {
      testUtils.removeDirSync(refsTmpDir);
    }
    console.log('done');
  }

  if (options.noPrompts) {
    sync(false); // don't remove tmp/ for botio
    return;
  }
  testUtils.confirm('Would you like to update the master copy in ref/? [yn] ',
    function (confirmed) {
      if (confirmed) {
        sync(true);
      } else {
        console.log('  OK, not updating.');
      }
    });
}

function examineRefImages() {
  startServer();
  var startUrl = 'http://' + server.host + ':' + server.port +
                 '/test/resources/reftest-analyzer.html#web=/test/eq.log';
  var browser = WebBrowser.create(sessions[0].config);
  browser.start(startUrl);
}

function startRefTest(masterMode, showRefImages) {
  function finalize() {
    stopServer();
    var numErrors = 0;
    var numStasFailures = 0;
    var numEqFailures = 0;
    var numEqNoSnapshot = 0;
    sessions.forEach(function (session) {
      numErrors += session.numErrors;
      numStasFailures += session.numStasFailures;
      numEqFailures += session.numEqFailures;
      numEqNoSnapshot += session.numEqNoSnapshot;
    });
    var numFatalFailures = numErrors + numStasFailures;
    console.log();
    if (numFatalFailures + numEqFailures > 0) {
      console.log('OHNOES!  Some tests failed!');
      if (numErrors > 0) {
        console.log('  errors: ' + numErrors);
      }
      if (numEqFailures > 0) {
        console.log('  different ref/snapshot: ' + numEqFailures);
      }
      if (numStasFailures > 0) {
        console.log('  failed stas: ' + numStasFailures);
      }
    } else {
      console.log('All regression tests passed.');
    }
    var runtime = (Date.now() - startTime) / 1000;
    console.log('Runtime was ' + runtime.toFixed(1) + ' seconds');

    if (options.statsFile) {
      fs.writeFileSync(options.statsFile, JSON.stringify(stats, null, 2));
    }
    if (masterMode) {
      if (numEqFailures + numEqNoSnapshot > 0) {
        console.log();
        console.log('Some eq tests failed or didn\'t have snapshots.');
        console.log('Checking to see if master references can be updated...');
        if (numFatalFailures > 0 && !options.noPrompts) {
          console.log('  No.  Some non-eq tests failed.');
        } else {
          console.log(
            '  Yes!  The references in tmp/ can be synced with ref/.');
          updateRefImages();
        }
      }
    } else if (showRefImages && numEqFailures > 0) {
      console.log();
      console.log('Starting reftest harness to examine ' + numEqFailures +
                  ' eq test failures.');
      examineRefImages(numEqFailures);
    }
  }

  function setup() {
    if (fs.existsSync(refsTmpDir)) {
      console.error('tmp/ exists -- unable to proceed with testing');
      process.exit(1);
    }

    if (fs.existsSync(eqLog)) {
      fs.unlink(eqLog);
    }
    if (fs.existsSync(traceLog)) {
      fs.unlink(traceLog);
    }
    if (fs.existsSync(testResultDir)) {
      testUtils.removeDirSync(testResultDir);
    }

    startTime = Date.now();
    startServer();
    server.hooks['POST'].push(refTestPostHandler);
    onAllSessionsClosed = finalize;

    startBrowsers('/test/test.html', function (session) {
      session.masterMode = masterMode;
      session.taskResults = {};
      session.tasks = {};
      session.remaining = manifest.length;
      manifest.forEach(function (item) {
        session.taskResults[item.id] = [];
        session.tasks[item.id] = item;
      });
      session.numErrors = 0;
      session.numStasFailures = 0;
      session.numEqNoSnapshot = 0;
      session.numEqFailures = 0;
      session.currentTestId = 'n/a';
      monitorBrowserTimeout(session, handleSessionTimeout);
    });
  }
  function checkRefsTmp() {
    if (masterMode && fs.existsSync(refsTmpDir)) {
      if (options.noPrompts) {
        testUtils.removeDirSync(refsTmpDir);
        setup();
        return;
      }
      console.log('Temporary snapshot dir tmp/ is still around.');
      console.log('tmp/ can be removed if it has nothing you need.');
      testUtils.confirm('SHOULD THIS SCRIPT REMOVE tmp/? THINK CAREFULLY [yn] ',
        function (confirmed) {
          if (confirmed) {
            testUtils.removeDirSync(refsTmpDir);
          }
          setup();
        });
    } else {
      setup();
    }
  }

  var startTime;
  var manifest = JSON.parse(fs.readFileSync(options.manifestFile));
  checkRefsTmp();
}

function handleSessionTimeout(session) {
  if (session.closed) {
    return;
  }
  var browser = session.name;
  var id = session.currentTestId;
  console.log('TEST-UNEXPECTED-FAIL | test ' + id + ' failed ' + browser +
              ' has not responded in ' + browserTimeout + 's');
  session.numErrors += session.remaining;
  session.remaining = 0;
  closeSession(browser);
}

// TODO remove shortly after landing
function migrateRefPng(src, dest) {
  var text = fs.readFileSync(src).toString();
  var i = text.indexOf('base64,');
  if (i < 0) {
    return;
  }
  fs.writeFileSync(dest, new Buffer(text.substr(i + 7), 'base64'));
}

function checkEq(task, results, browser, masterMode) {
  var taskId = task.id;
  var refSnapshotDir = path.join(refsDir, os.platform(), browser, taskId);
  var testSnapshotDir = path.join(testResultDir, os.platform(), browser,
                                  taskId);

  var taskType = task.type;
  var numEqNoSnapshot = 0;
  var numEqFailures = 0;
  for (var i = 0; i < results.length; i++) {
    if (!results[i]) {
      continue;
    }
    var testSnapshot = results[i].snapshot;
    if (testSnapshot && testSnapshot.indexOf('data:image/png;base64,') === 0) {
      testSnapshot = new Buffer(testSnapshot.substring(22), 'base64');
    } else {
      console.error('Valid snapshot was not found.');
    }

    var refSnapshot = null;
    var eq = false;
    var refPath = path.join(refSnapshotDir, (i + 1) + '.png');
    if (!fs.existsSync(refPath) &&
        fs.existsSync(path.join(refSnapshotDir, (i + 1).toString()))) {
      // old format, converting
      migrateRefPng(path.join(refSnapshotDir, (i + 1).toString()), refPath);
      // TODO delete old file?
    }
    if (!fs.existsSync(refPath)) {
      numEqNoSnapshot++;
      if (!masterMode) {
        console.log('WARNING: no reference snapshot ' + refPath);
      }
    } else {
      refSnapshot = fs.readFileSync(refPath);
      eq = (refSnapshot.toString('hex') === testSnapshot.toString('hex'));
      if (!eq) {
        console.log('TEST-UNEXPECTED-FAIL | ' + taskType + ' ' + taskId +
                    ' | in ' + browser + ' | rendering of item ' + (i + 1) +
                    ' != reference rendering');

        testUtils.ensureDirSync(testSnapshotDir);
        fs.writeFileSync(path.join(testSnapshotDir, (i + 1) + '.png'),
                         testSnapshot);
        fs.writeFileSync(path.join(testSnapshotDir, (i + 1) + '_ref.png'),
                         refSnapshot);

        // NB: this follows the format of Mozilla reftest output so that
        // we can reuse its reftest-analyzer script
        fs.appendFileSync(eqLog, 'REFTEST TEST-UNEXPECTED-FAIL | ' + browser +
          '-' + taskId + '-item' + (i + 1) + ' | image comparison (==)\n' +
          'REFTEST   IMAGE 1 (TEST): ' +
          path.join(testSnapshotDir, (i + 1) + '.png') + '\n' +
          'REFTEST   IMAGE 2 (REFERENCE): ' +
          path.join(testSnapshotDir, (i + 1) + '_ref.png') + '\n');
        numEqFailures++;
      }
    }
    if (masterMode && (!refSnapshot || !eq)) {
      var tmpSnapshotDir = path.join(refsTmpDir, os.platform(), browser,
                                     taskId);
      testUtils.ensureDirSync(tmpSnapshotDir);
      fs.writeFileSync(path.join(tmpSnapshotDir, (i + 1) + '.png'),
                       testSnapshot);
    }
  }

  var session = getSession(browser);
  session.numEqNoSnapshot += numEqNoSnapshot;
  if (numEqFailures > 0) {
    session.numEqFailures += numEqFailures;
  } else {
    console.log('TEST-PASS | ' + taskType + ' test ' + taskId + ' | in ' +
                browser);
  }
}

var diffRunQueue = [];
function diffData(testData, refData, callback) {
  diffRunQueue.push([testData, refData, callback]);
  if (diffRunQueue.length > 1) {
    return;
  }
  (function run() {
    var diffRun = diffRunQueue[0];
    fs.writeFileSync('refdata~', diffRun[1]);
    fs.writeFileSync('testdata~', diffRun[0]);
    var diff = require('child_process').
        exec('diff -U 2 refdata~ testdata~', function (error, stdout, stderr) {
      fs.unlinkSync('refdata~');
      fs.unlinkSync('testdata~');

      var callback = diffRun[2];
      if (!stdout) {
        callback('<<<< reference\n' + diffRun[1] + '====\n' + diffRun[0] + '>>>> test\n');
      } else {
        callback(stdout);
      }
      diffRunQueue.shift();
      if (diffRunQueue.length > 0) {
        run();
      }
    });
  })();
}

function checkStas(task, results, browser) {
  var taskId = task.id;
  var taskType = task.type;

  var numStasFailures = 0;
  for (var i = 0; i < results.length; i++) {
    var snapshot = results[i].snapshot;
    var item = results[i].item;

    if (snapshot.isDifferent) {
      console.log('TEST-UNEXPECTED-FAIL | ' + taskType + ' ' + taskId, ' | in ' +
        browser + ' | trace of ' + (i + 1) + ' != reference trace');

      diffData(snapshot['data1'], snapshot['data2'], function (item, diff) {
        fs.appendFileSync(traceLog,
            'REFTEST TEST-UNEXPECTED-FAIL | ' + browser + '-' + taskId + '-item' + (i + 1) +
            ' | ' + item + ' | trace\n' + diff + '\n');
      }.bind(null, item));

      numStasFailures++;
    }
  }

  if (numStasFailures > 0) {
    getSession(browser).numStasFailures += numStasFailures;
  } else {
    console.log('TEST-PASS | stas test ' + taskId + ' | in ' + browser);
  }
}

function checkRefTestResults(browser, id, results) {
  var failed = false;
  var session = getSession(browser);
  var task = session.tasks[id];
  results.forEach(function (itemResult, index) {
    if (!itemResult) {
      return; // no results
    }
    if (itemResult.failure) {
      failed = true;
      if (fs.existsSync(task.file + '.error')) {
        console.log('TEST-SKIPPED | SWF was not downloaded ' + id + ' | in ' +
                    browser + ' | item' + (index + 1) + ' | ' + itemResult.failure);
      } else {
        session.numErrors++;
        console.log('TEST-UNEXPECTED-FAIL | test failed ' + id + ' | in ' +
          browser + ' | item' + (index + 1) + ' | ' + itemResult.failure);
      }
    }
  });
  if (failed) {
    return;
  }
  switch (task.type) {
    case 'eq':
      checkEq(task, results, browser, session.masterMode);
      break;
    case 'stas':
      checkStas(task, results, browser);
      break;
    default:
      throw new Error('Unknown test type');
  }
  // clear memory
  results.forEach(function (result, index) {
    result.snapshot = null;
  });
}

function refTestPostHandler(req, res) {
  var parsedUrl = url.parse(req.url, true);
  var pathname = parsedUrl.pathname;
  if (pathname !== '/tellMeToQuit' &&
    pathname !== '/info' &&
    pathname !== '/progress' &&
    pathname !== '/result') {
    return false;
  }

  var body = '';
  req.on('data', function (data) {
    body += data;
  });
  req.on('end', function () {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end();

    var session;
    if (pathname === '/tellMeToQuit') {
      // finding by path
      var browser = parsedUrl.query.browser;
      session = getSession(browser);
      monitorBrowserTimeout(session, null);
      closeSession(session.name);
      return;
    }

    var data = JSON.parse(body);
    if (pathname === '/info') {
      console.log(data.message);
      return;
    }
    if (pathname === '/progress') {
      session = getSession(data.browser);
      monitorBrowserTimeout(session, handleSessionTimeout);
      session.currentTestId = data.id;
      return;
    }

    var browser = data.browser;
    var id = data.id;
    var item = data.item;
    var failure = data.failure;
    var snapshot = data.snapshot;
    var numItems = data.numItems;

    session = getSession(browser);
    monitorBrowserTimeout(session, handleSessionTimeout);

    var taskResults = session.taskResults[id];
    var itemIndex = taskResults.length;
    taskResults[itemIndex] = {
      item: item,
      failure: failure,
      snapshot: snapshot
    };
    if (stats) {
      stats.push({
        'browser': browser,
        'swf': id,
        'item': itemIndex,
        'stats': data.stats
      });
    }

    var isDone = taskResults[numItems - 1];
    if (isDone) {
      checkRefTestResults(browser, id, taskResults);
      session.remaining--;
    }
  });
  return true;
}

function startBrowsers(url, initSessionCallback) {
  var browsers;
  if (options.browserManifestFile) {
    browsers = JSON.parse(fs.readFileSync(options.browserManifestFile));
  } else if (options.browser) {
    var browserPath = options.browser;
    var name = path.basename(browserPath, path.extname(browserPath));
    browsers = [{name: name, path: browserPath}];
  } else {
    console.error('Specify either browser or browserManifestFile.');
    process.exit(1);
  }
  sessions = [];
  browsers.forEach(function (b) {
    var browser = WebBrowser.create(b, options.extension);
    var startUrl = getServerBaseAddress() + url +
      '?browser=' + encodeURIComponent(b.name) +
      '&manifestFile=' + encodeURIComponent('/test/' + options.manifestFile) +
      '&path=' + encodeURIComponent(b.path) +
      '&delay=' + options.statsDelay +
      '&masterMode=' + options.masterMode +
      '&extension=' + options.extension;
    browser.start(startUrl);
    var session = {
      name: b.name,
      config: b,
      browser: browser,
      closed: false
    };
    if (initSessionCallback) {
      initSessionCallback(session);
    }
    sessions.push(session);
  });
}

function getServerBaseAddress() {
  return 'http://' + host + ':' + server.port;
}

function startServer() {
  server = new WebServer();
  server.host = host;
  server.port = options.port;
  server.port_ssl = options.port_ssl;
  server.root = '..';
  server.cacheExpirationTime = 3600;
  server.start();
}

function stopServer() {
  server.stop();
}

function getSession(browser) {
  return sessions.filter(function (session) {
    return session.name === browser;
  })[0];
}

function closeSession(browser) {
  var i = 0;
  while (i < sessions.length && sessions[i].name !== browser) {
    i++;
  }
  if (i < sessions.length) {
    var session = sessions[i];
    session.browser.stop(function () {
      session.closed = true;
      var allClosed = sessions.every(function (s) {
        return s.closed;
      });
      if (allClosed && onAllSessionsClosed) {
        onAllSessionsClosed();
      }
    });
  }
}

function main() {
  if (options.statsFile) {
    stats = [];
  }

  if (!options.browser && !options.browserManifestFile) {
    startServer();
  } else {
    startRefTest(options.masterMode, options.reftest && !options.noPrompts);
  }
}

var server;
var sessions;
var onAllSessionsClosed;
var host = '127.0.0.1';
var options = parseOptions();
var stats;

main();
