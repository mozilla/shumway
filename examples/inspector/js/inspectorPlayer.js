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

var shumwayOptions = Shumway.Settings.shumwayOptions;
var avm2Options = shumwayOptions.register(new Shumway.Options.OptionSet("AVM2"));
var sysCompiler = avm2Options.register(new Shumway.Options.Option("sysCompiler", "sysCompiler", "boolean", true, "system compiler/interpreter (requires restart)"));
var appCompiler = avm2Options.register(new Shumway.Options.Option("appCompiler", "appCompiler", "boolean", true, "application compiler/interpreter (requires restart)"));


// avm2 must be global.
var avm2;
function createAVM2(builtinPath, libraryPath, avm1Path, sysMode, appMode, next) {
  function loadAVM1(next) {
    new BinaryFileReader(avm1Path).readAll(null, function (buffer) {
      avm2.systemDomain.executeAbc(new AbcFile(new Uint8Array(buffer), "avm1.abc"));
      next();
    });
  }

  assert (builtinPath);
  new BinaryFileReader(builtinPath).readAll(null, function (buffer) {
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

var avm2Root = "../../src/avm2/";
var builtinPath = avm2Root + "generated/builtin/builtin.abc";
var avm1Path = avm2Root + "generated/avm1lib/avm1lib.abc";

// different playerglobals can be used here
var playerglobalInfo = {
  abcs: "../../build/playerglobal/playerglobal.abcs",
  catalog: "../../build/playerglobal/playerglobal.json"
};

Shumway.Telemetry.instance = {
  reportTelemetry: function (data) { }
};

Shumway.FileLoadingService.instance = {
  createSession: function () {
    return {
      open: function (request) {
        if (request.url.indexOf('http://s.youtube.com/stream_204') === 0) {
          // No reason to send error report yet, let's keep it this way for now.
          // 204 means no response, so no data will be expected.
          console.error('YT_CALLBACK: ' + request.url);
          this.onopen && this.onopen();
          this.onclose && this.onclose();
          return;
        }

        var self = this;
        var path = Shumway.FileLoadingService.instance.resolveUrl(request.url);
        console.log('FileLoadingService: loading ' + path + ", data: " + request.data);
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
    var baseUrl;
    if (typeof URL !== 'undefined') {
      baseUrl = new URL(url, document.location.href).href;
    } else {
      var a = document.createElement('a');
      a.href = url || '#';
      a.setAttribute('style', 'display: none;');
      document.body.appendChild(a);
      baseUrl = a.href;
      document.body.removeChild(a);
    }
    Shumway.FileLoadingService.instance.baseUrl = baseUrl;
    return baseUrl;
  },
  resolveUrl: function (url) {
    var base = Shumway.FileLoadingService.instance.baseUrl || '';
    if (typeof URL !== 'undefined') {
      return new URL(url, base).href;
    }

    if (url.indexOf('://') >= 0) {
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

function onWindowMessage(e) {
  var data = e.data;
  if (typeof data === 'object' && data !== null) {
    switch (data.type) {
      case 'runSwf':
        runSwfPlayer(data);
        document.body.style.backgroundColor = 'green';
        break;
      case 'gfx':
        IFramePlayerChannel.sendEventUpdates(data);
        break;
    }
  }
}

function IFramePlayerChannel() { }
IFramePlayerChannel._eventUpdatesListener = null;
IFramePlayerChannel.sendEventUpdates = function (data) {
  if (!IFramePlayerChannel._eventUpdatesListener) {
    return;
  }
  var DataBuffer = Shumway.ArrayUtilities.DataBuffer;
  var updates = DataBuffer.FromArrayBuffer(data.updates.buffer);
  IFramePlayerChannel._eventUpdatesListener(updates);
};
IFramePlayerChannel.prototype = {
  sendUpdates: function (updates, assets) {
    var bytes = updates.getBytes();
    var assetLengths = [];
    var assetsBytes = assets.map(function (asset) {
      assetLengths.push(asset.length);
      return asset.getBytes();
    });
    window.parent.postMessage({
      type: 'player',
      updates: bytes,
      assets: assetsBytes,
      assetLengths: assetLengths
    }, '*', [bytes.buffer]);
  },
  registerForEventUpdates: function (listener) {
    IFramePlayerChannel._eventUpdatesListener = listener;
  }
};

function runSwfPlayer(data) {
  var sysMode = data.sysMode;
  var appMode = data.appMode;
  var asyncLoading = data.asyncLoading;
  var loaderURL = data.loaderURL;
  var movieParams = data.movieParams;
  var file = data.file;
  createAVM2(builtinPath, playerglobalInfo, avm1Path, sysMode, appMode, function (avm2) {
    function runSWF(file) {
      var player = new Shumway.Player(new IFramePlayerChannel());
      player.load(file);
    }
    file = Shumway.FileLoadingService.instance.setBaseUrl(file);
    if (asyncLoading) {
      runSWF(file);
    } else {
      new BinaryFileReader(file).readAll(null, function(buffer, error) {
        if (!buffer) {
          throw "Unable to open the file " + file + ": " + error;
        }
        runSWF(file, buffer);
      });
    }
  });
}

window.addEventListener('message', onWindowMessage);
