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

// Misc patches to fix older/legacy browsers' deficiencies.

(function isStackPresentInError() {
  if (new Error().stack) {
    return; // stack present
  }

  // Fixes IE10,11
  Object.defineProperty(Error.prototype, 'stack', {
    get: function () {
      try {
        throw this;
      } catch (e) { }
      return this.stack;
    },
    enumerable: true,
    configurable: true
  });
})();

(function isURLConstructorPresent() {
  if (window.URL.length) {
    return; // URL is a constructor
  }

  // Fixes IE10,11
  function newURL(url, baseURL) {
    // Just enough to make viewer working.
    if (!baseURL || url.indexOf('://') >= 0) {
      this._setURL(url);
      return;
    }

    var base = baseURL.split(/[#\?]/g)[0];
    base = base.lastIndexOf('/') >= 0 ? base.substring(0, base.lastIndexOf('/') + 1) : '';
    if (url.indexOf('/') === 0) {
      var m = /^[^:]+:\/\/[^\/]+/.exec(base);
      if (m) {
        base = m[0];
      }
    }
    this._setURL(base + url);
  }
  newURL.prototype = {
    _setURL: function (url) {
      this.href = url;
      // Simple parsing to extract protocol, hostname and port.
      var m = /^(\w+:)\/\/([^:/]+)(:([0-9]+))?/.exec(url.toLowerCase());
      if (m) {
        this.protocol = m[1];
        this.hostname = m[2];
        this.port = m[4] || '';
      }
    },
    toString: function () {
      return this.href;
    }
  };

  var keys = Object.keys(window.URL);
  for (var i = 0; i < keys.length; i++) {
    newURL[keys[i]] = window.URL[keys[i]];
  }
  window.URL = newURL;
})();
