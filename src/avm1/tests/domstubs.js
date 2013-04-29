/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2013 Mozilla Foundation
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
