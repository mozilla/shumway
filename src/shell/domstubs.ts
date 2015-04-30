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

var microTaskQueue: Shumway.Shell.MicroTasksQueue = null;

this.self = this;
this.window = this;

declare function print(message: string): void;
this.console = {
  _print: print,
  log: print,
  info: function() {
    if (!Shumway.Shell.verbose) {
      return;
    }
    print(Shumway.IndentingWriter.YELLOW + Shumway.argumentsToString(arguments) +
          Shumway.IndentingWriter.ENDC);
  },
  warn: function() {
    print(Shumway.IndentingWriter.RED + Shumway.argumentsToString(arguments) +
          Shumway.IndentingWriter.ENDC);
  },
  error: function() {
    print(Shumway.IndentingWriter.BOLD_RED + Shumway.argumentsToString(arguments) +
          Shumway.IndentingWriter.ENDC + '\nstack:\n' + (new Error().stack));
  },
  time: function () {},
  timeEnd: function () {}
};

declare var putstr;
this.dump = function (message) {
  putstr(Shumway.argumentsToString(arguments));
};

this.addEventListener = function (type) {
  // console.log('Add listener: ' + type);
};

var defaultTimerArgs = [];
this.setTimeout = function (fn, interval) {
  var args = arguments.length > 2 ? Array.prototype.slice.call(arguments, 2) : defaultTimerArgs;
  var task = microTaskQueue.scheduleInterval(fn, args, interval, false);
  return task.id;
};
this.setInterval = function (fn, interval) {
  var args = arguments.length > 2 ? Array.prototype.slice.call(arguments, 2) : defaultTimerArgs;
  var task = microTaskQueue.scheduleInterval(fn, args, interval, true);
  return task.id;
};
this.clearTimeout = function (id) {
  microTaskQueue.remove(id);
};
this.clearInterval = clearTimeout;

this.navigator = {
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.6; rv:4.0) Gecko/20100101 Firefox/4.0'
};

// TODO remove document stub
this.document = {
  createElementNS: function (ns, qname) {
    if (qname !== 'svg') {
      throw new Error('only supports svg and create SVGMatrix');
    }
    return {
      createSVGMatrix: function () {
        return {a: 0, b: 0, c: 0, d: 0, e: 0, f: 0};
      }
    };
  },
  createElement: function (name) {
    if (name !== 'canvas') {
      throw new Error('only supports canvas');
    }
    return {
      getContext: function (type) {
        if (type !== '2d') {
          throw new Error('only supports canvas 2d');
        }
        return {};
      }
    }
  },
  location: {
    href: {
      resource: ""//shumway/build/ts/shell.js"
    }
  }
};

this.Image = function () {};
this.Image.prototype = {
};

this.URL = function (url, baseURL) {
  if (url.indexOf('://') >= 0 || baseURL === url) {
    this._setURL(url);
    return;
  }

  var base = baseURL || '';
  var base = base.lastIndexOf('/') >= 0 ? base.substring(0, base.lastIndexOf('/') + 1) : '';
  if (url.indexOf('/') === 0) {
    var m = /^[^:]+:\/\/[^\/]+/.exec(base);
    if (m) base = m[0];
  }
  this._setURL(base + url);
};
this.URL.prototype = {
  _setURL: function (url) {
    this.href = url;
    // Simple parsing to extract protocol, hostname and port.
    var m = /^(\w+:)\/\/([^:/]+)(:([0-9]+))?/.exec(url.toLowerCase());
    if (m) {
      this.protocol = m[1];
      this.hostname = m[2];
      this.port = m[4] || '';
    } else {
      this.protocol = 'file:';
      this.hostname = '';
      this.port = '';
    }
  },
  toString: function () {
    return this.href;
  }
};
this.URL.createObjectURL = function createObjectURL() {
  return "";
};

this.Blob = function () {};
this.Blob.prototype = {
};

this.XMLHttpRequest = function () {};
this.XMLHttpRequest.prototype = {
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
          read(this.url, 'binary').buffer : read(this.url);
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

this.window.screen = {
  width: 1024,
  height: 1024
};

/**
 * sessionStorage polyfill.
 */
var sessionStorageObject = {};
this.window.sessionStorage = {
  getItem: function (key: string): string {
    return sessionStorageObject[key];
  },
  setItem(key: string, value: string): void {
    sessionStorageObject[key] = value;
  },
  removeItem(key: string): void {
    delete sessionStorageObject[key];
  }
};
