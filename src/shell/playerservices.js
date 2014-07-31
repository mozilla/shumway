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

var BinaryFileReader = (function binaryFileReader() {
  function constructor(url, method, mimeType, data) {
    this.url = url;
    this.method = method;
    this.mimeType = mimeType;
    this.data = data;
  }

  constructor.prototype = {
    readAll: function(progress, complete) {
      setTimeout(function () {
        console.log('Reading: ' + this.url);
        try {
          complete(read(this.url, 'binary'));
        } catch (e) {
          complete(null, e.message);
        }
      }.bind(this));
    },
    readAsync: function(ondata, onerror, onopen, oncomplete, onhttpstatus) {
      onopen && setTimeout(onopen);
      this.readAll(null, function (data, err) {
        if (data) {
          ondata(data, { loaded: data.byteLength,  total: data.byteLength});
        } else {
          onerror(err);
        }
        oncomplete();
      });
    }
  };
  return constructor;
})();
Shumway.BinaryFileReader = BinaryFileReader;

Shumway.Telemetry.instance = {
  reportTelemetry: function (data) { }
};

Shumway.FileLoadingService.instance = {
  createSession: function () {
    return {
      open: function (request) {
        var self = this;
        var path = Shumway.FileLoadingService.instance.resolveUrl(request.url);
        new BinaryFileReader(path, request.method, request.mimeType, request.data).readAsync(
          function (data, progress) {
            self.onprogress(data, {bytesLoaded: progress.loaded, bytesTotal: progress.total});
          },
          function (e) { self.onerror(e); },
          self.onopen,
          self.onclose,
          self.onhttpstatus);
      }
    };
  },
  setBaseUrl: function (url) {
    Shumway.FileLoadingService.instance.baseUrl = url;
    return url;
  },
  resolveUrl: function (url) {
    if (url.indexOf('://') >= 0) {
      return url;
    }

    var base = Shumway.FileLoadingService.instance.baseUrl || '';
    if (base === url) {
      return url;
    }

    base = base.lastIndexOf('/') >= 0 ? base.substring(0, base.lastIndexOf('/') + 1) : '';
    if (url.indexOf('/') === 0) {
      var m = /^[^:]+:\/\/[^\/]+/.exec(base);
      if (m) base = m[0];
    }
    return base + url;
  }
};
