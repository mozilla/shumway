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

var http = require('http'),
  path = require('path'),
  fs = require('fs');

var mimeTypes = {
  '.html': 'text/html',
  '.swf': 'application/x-shockwave-flash',
  '.txt': 'text/plain',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.jpg': 'image/jpg',
  '.png': 'image/png',
  '': 'text/plain',
  '.md': 'text/plain',
  '.as': 'text/plain',
  '.ts': 'text/plain',
  '.json': 'text/javascript'
};
var defaultMimeType = 'application/octet-stream';

function WebServer() {
  this.root = '.';
  this.host = 'localhost';
  this.port = 8000;
  this.noCache = true;
  this.server = null;
  this.hooks = {
    'GET': [],
    'POST': []
  };
}
WebServer.prototype = {
  start: function (callback) {
    this.server = http.createServer(this._handler.bind(this));
    this.server.listen(this.port, this.host, callback);
    console.log('Server running at http://' + this.host + ':' + this.port + '/');
  },
  stop: function (callback) {
    this.server.close(callback);
    this.server = null;
  },
  _handler: function (req, res) {
    var url = req.url;
    var urlParts = /([^?]*)((?:\?(.*))?)/.exec(url);
    var pathPart = decodeURI(urlParts[1]), queryPart = urlParts[3];
    var noCache = this.noCache;

    var methodHooks = this.hooks[req.method];
    if (!methodHooks) {
      res.writeHead(405);
      res.end('Unsupported request method', 'utf8');
      return;
    }
    var handled = methodHooks.some(function (hook) {
      return hook(req, res);
    });
    if (handled) {
      return;
    }

    var filePath;
    fs.realpath(path.join(this.root, pathPart), checkFile);

    function checkFile(err, file) {
      if (err) {
        res.writeHead(404);
        res.end();
        return;
      }
      filePath = file;
      fs.stat(filePath, statFile);
    }

    var fileSize;

    function statFile(err, stats) {
      if (err) {
        res.writeHead(500);
        res.end();
        return;
      }

      fileSize = stats.size;
      var isDir = stats.isDirectory();
      if (isDir && !/\/$/.test(pathPart)) {
        res.setHeader('Location', pathPart + '/' + urlParts[2]);
        res.writeHead(301);
        res.end('Redirected', 'utf8');
        return;
      }
      if (isDir) {
        serveDirectoryIndex(filePath);
        return;
      }

      serveRequestedFile(filePath);
    }

    function serveDirectoryIndex(dir) {
      res.setHeader('Content-Type', 'text/html');
      res.writeHead(200);

      var content = '';
      if (queryPart === 'frame') {
        res.end("<html><frameset cols=*,200><frame name=swf>" +
          "<frame src='" + encodeURI(pathPart) + "?side'></frameset></html>", 'utf8');
        return;
      }
      var all = queryPart === 'all';
      fs.readdir(dir, function (err, files) {
        if (err) {
          res.end();
          return;
        }
        res.write("<html><body><h1>SWFs of " + pathPart + "</h1>\n");
        if (pathPart !== '/') {
          res.write("<a href='..'>..</a><br>\n");
        }
        files.forEach(function (file) {
          var stat = fs.statSync(path.join(dir, file));
          var item = pathPart + file;
          if (stat.isDirectory()) {
            res.write("<a href='" + encodeURI(item) + "/'>" + file + "/</a><br>\n");
            return;
          }
          var ext = path.extname(file).toLowerCase();
          if (ext === '.swf') {
            res.write("<a href='/examples/inspector/inspector.html?rfile=" +
              encodeURI(item) + "' target=swf>" +
              file + "</a><br>\n");
          } else if (all) {
            res.write("<a href='" + encodeURI(item) + "'>" + file + "</a><br>\n");
          }
        });
        if (files.length === 0) {
          res.write("<p>no files found</p>\n");
        }
        if (!all && queryPart !== 'side') {
          res.write("<hr><p>(only SWF files are shown, <a href='?all'>show all</a>)</p>\n");
        }
        res.end("</body></html>");
      });
    }

    function serveRequestedFile(filePath) {
      var stream = fs.createReadStream(filePath);

      stream.on('error', function (error) {
        res.writeHead(500);
        res.end();
      });

      var ext = path.extname(filePath).toLowerCase();
      var contentType = mimeTypes[ext] || defaultMimeType;

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', fileSize);
      if (noCache) {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate")
        res.setHeader("Pragma", "no-cache")
        res.setHeader("Expires", "0")
      }
      res.writeHead(200);

      stream.pipe(res, function (error) {
        res.end();
      });
    }
  }
};

exports.WebServer = WebServer;
