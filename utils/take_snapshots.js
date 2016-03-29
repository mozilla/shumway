/*
 * Copyright 2015 Mozilla Foundation
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

var WebServer = require('../test/webserver.js').WebServer;
var WebBrowser = require('../test/webbrowser.js').WebBrowser;
var path = require('path');
var testutils = require('../test/testutils.js');

var server;
var host = 'localhost';

function startServer() {
  server = new WebServer();
  server.host = host;
  server.port = options.port;
  server.root = '.';
  server.cacheExpirationTime = 3600;

  var url = require('url'), fs = require('fs');
  server.hooks['POST'].push(function (req, res) {
    var parsedUrl = url.parse(req.url, true);
    var pathname = parsedUrl.pathname;
    if (!/^\/snapshots\/[\w\-_]+\/\d+$/.test(pathname)) {
      return false;
    }
    var filename = 'build' + pathname + '.png';
    testutils.ensureDirSync(path.dirname(filename));

    var body = '';
    req.on('data', function (data) {
      body += data;
    });
    req.on('end', function () {
      var i = body.indexOf('base64,');
      var buffer = new Buffer(body.substring(i + 'base64,'.length), 'base64');
      fs.writeFile(filename, buffer, function () {
        res.writeHead(204, {'Content-Type': 'text/plain'});
        res.end();
      });
    });

    return true;
  });

  server.hooks['GET'].push(function (req, res) {
    var parsedUrl = url.parse(req.url, true);
    var pathname = parsedUrl.pathname;
    if (pathname !== '/quit') {
      return false;
    }

    console.log('Finishing');
    server.stop();
    browser.stop();
  });

  server.start();
}

function stopServer() {
  server.stop();
}

var browser;

function normalizePath(s) {
  return s[0] !== '/' ? '../../' + s : s;
}

function startBrowser() {
  var listPath = normalizePath(options._[0]);

  var startUrl = 'http://' + host + ':' + port +
    '/utils/take_snapshots/index.html?list=' + listPath + '&frames=' + options.frames;
  var browserPath = options.browser;
  var name = path.basename(browserPath, path.extname(browserPath));
  browser = WebBrowser.create({name: name, path: browserPath});
  browser.start(startUrl);
}

function parseOptions() {
  var yargs = require('yargs')
    .usage('Usage: $0 <swfs-list>')
    .demand(1)
    .boolean(['help'])
    .string(['manifestFile', 'browser', 'frames', 'port'])
    .alias('browser', 'b').alias('help', 'h').alias('frames', 'f')
    .describe('help', 'Show this help message')
    .describe('browser', 'The path to a single browser ')
    .demand('browser')
    .describe('port', 'The port the HTTP server should listen on.')
    .default('port', 8092)
    .describe('frames', 'The frame(s) to take snapshots at.')
    .default('frames', '1');

  var result = yargs.argv;
  if (result.help) {
    yargs.showHelp();
    process.exit(0);
  }
  return result;
}

var options = parseOptions();
port = options.port;

startServer();
startBrowser('/Gruntfile.js');
