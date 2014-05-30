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
          complete(snarf(this.url, 'binary'));
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

var avm2;
function createAVM2(builtinPath, libraryPath, avm1Path, sysMode, appMode, next) {
  function loadAVM1(next) {
    new BinaryFileReader(avm1Path).readAll(null, function (buffer) {
      avm2.systemDomain.executeAbc(new AbcFile(new Uint8Array(buffer), "avm1.abc"));
      next();
    });
  }

  var AVM2 = Shumway.AVM2.Runtime.AVM2;

  new BinaryFileReader(builtinPath).readAll(null, function (buffer) {
    if (!buffer) {
      throw new Error('no builtin');
    }
    AVM2.initialize(sysMode, appMode, avm1Path && loadAVM1);

    avm2 = AVM2.instance;
    console.time("Execute builtin.abc");
    avm2.loadedAbcs = {};
    // Avoid loading more Abcs while the builtins are loaded
    avm2.builtinsLoaded = false;
    // avm2.systemDomain.onMessage.register('classCreated', Stubs.onClassCreated);
    avm2.systemDomain.executeAbc(new AbcFile(new Uint8Array(buffer), "builtin.abc"));
    avm2.builtinsLoaded = true;
    console.timeEnd("Execute builtin.abc");

    // If library is shell.abc, then just go ahead and run it now since
    // it's not worth doing it lazily given that it is so small.
    if (typeof libraryPath === 'string') {
      new BinaryFileReader(libraryPath).readAll(null, function (buffer) {
        avm2.systemDomain.executeAbc(new AbcFile(new Uint8Array(buffer), libraryPath));
        next(avm2);
      });
      return;
    }

    if (!AVM2.isPlayerglobalLoaded()) {
      AVM2.loadPlayerglobal(libraryPath.abcs, libraryPath.catalog).then(function () {
        next(avm2);
      });
    }
  });
}

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
    base = base.lastIndexOf('/') >= 0 ? base.substring(0, base.lastIndexOf('/') + 1) : '';
    if (url.indexOf('/') === 0) {
      var m = /^[^:]+:\/\/[^\/]+/.exec(base);
      if (m) base = m[0];
    }
    return base + url;
  }
};
