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

var FlashLog = Shumway.FlashLog;

function WebServerFlashLog() {
  FlashLog.call(this);
  this.filename = '/logs/flashlog.txt';
  this.cached = [];
  this.timeout = setTimeout(this._clean.bind(this));
}

WebServerFlashLog.prototype = Object.create(FlashLog.prototype);
WebServerFlashLog.prototype._writeLine = function (line) {
  this.cached.push(line);
  this._ensureSubmit();
};
WebServerFlashLog.prototype._flush = function (line) {
  var data = this.cached.join('\n') + '\n';
  this.cached.length = 0;
  var xhr = new XMLHttpRequest();
  xhr.open('POST', this.filename, true);
  var self = this;
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      self.timeout = null;
      self._ensureSubmit();
    }
  };
  xhr.send(data);
};
WebServerFlashLog.prototype._clean = function (line) {
  var xhr = new XMLHttpRequest();
  xhr.open('DELETE', this.filename, true);
  var self = this;
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      self.timeout = null;
      self._ensureSubmit();
    }
  };
  xhr.send(null);
};
WebServerFlashLog.prototype._ensureSubmit = function () {
  if (this.cached.length === 0 ||
    this.timeout !== null) {
    return;
  }
  this.timeout = setTimeout(this._flush.bind(this), 2000);
};
