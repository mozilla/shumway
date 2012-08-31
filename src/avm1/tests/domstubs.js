/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

var fs = require('fs');

var logBuffer = [];
function log(message) {
  logBuffer.push(message);
}

GLOBAL.window = {
  setTimeout: function () {
    log('window.setTimeout');
  }
};

GLOBAL.XMLHttpRequest = function () {
  var url;
  var encoding = 'utf8';
  var async;
  this.open = function(aMethod, aUrl, aAsync) {
    url = aUrl;
    async = aAsync !== false;
  };
  this.overrideMimeType = function(mimeType) {
    encoding = 'binary';
  };
  this.send = function(aData) {
    if (async) throw 'not implemented';
    try {
      var data = fs.readFileSync(url, encoding);
      this.status = 200;
      this.responseText = data;
    } catch (e) {
      this.status = 404;
    }
  };
};
