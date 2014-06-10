/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var console = {
  log: print,
  info: print,
  error: print,
  warn: print,
  time: function () {},
  timeEnd: function () {}
};

var addEventListener = function (type) {
  // console.log('Add listener: ' + type);
};

var microTasks = [];
var setTimeout = function (fn) { microTasks.push(fn); };

var self = this, window = this;

var XMLHttpRequest = function () {};
XMLHttpRequest.prototype = {
  open: function (method, url, async) {
    this.url = url;
    if (async === false) {
      throw new Error('Unsupported sync');
    }
  },
  send: function (data) {
    setTimeout(function () {
      try {
        console.log('XHR: ' + this.url);
        var response = this.responseType === 'arraybuffer' ?
          snarf(this.url, 'binary').buffer : snarf(this.url);
        if (this.responseType === 'json') {
          response = JSON.parse(response);
        }
        this.response = response;
        this.readyState = 4;
        this.status = 200;
        this.onreadystatechange && this.onreadystatechange();
        this.onload && this.onload();
      } catch (e) {
        this.error = e;
        this.readyState = 4;
        this.status = 404;
        this.onreadystatechange && this.onreadystatechange();
        this.onerror && this.onerror();
      }
    }.bind(this));
  }
}

var runMicroTaskQueue = function (duration) {
  var stopAt = Date.now() + duration;
  while (microTasks.length > 0 && Date.now() < stopAt) {
    var task = microTasks.shift();
    task.call(this);
  }
};
