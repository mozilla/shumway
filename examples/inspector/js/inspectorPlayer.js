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

var avm2Root = "../../src/avm2/";
var builtinPath = avm2Root + "generated/builtin/builtin.abc";

// different playerglobals can be used here
var playerglobalInfo = {
  abcs: "../../build/playerglobal/playerglobal.abcs",
  catalog: "../../build/playerglobal/playerglobal.json"
};

Shumway.Telemetry.instance = {
  reportTelemetry: function (data) { }
};

var fileReadChunkSize = 0;
Shumway.FileLoadingService.instance = {
  createSession: function () {
    return {
      open: function (request) {
        var self = this;
        var path = Shumway.FileLoadingService.instance.resolveUrl(request.url);
        console.log('FileLoadingService: loading ' + path + ", data: " + request.data);
        var BinaryFileReader = Shumway.BinaryFileReader;
        new BinaryFileReader(path, request.method, request.mimeType, request.data).readChunked(
          fileReadChunkSize,
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
  },
  navigateTo: function (url, target) {
    window.parent.open(this.resolveUrl(url), target || '_blank');
  }
};

function runSwfPlayer(data) {
  var sysMode = data.sysMode;
  var appMode = data.appMode;
  var asyncLoading = data.asyncLoading;
  var loaderURL = data.loaderURL;
  var movieParams = data.movieParams;
  var stageAlign = data.stageAlign;
  var stageScale = data.stageScale;
  var displayParameters = data.displayParameters;
  fileReadChunkSize = data.fileReadChunkSize;
  var file = data.file;
  configureExternalInterfaceMocks(file);
  Shumway.createAVM2(builtinPath, playerglobalInfo, sysMode, appMode, function (avm2) {
    function runSWF(file) {
      var player = new Shumway.Player.Window.WindowPlayer(window);
      player.movieParams = movieParams;
      player.stageAlign = stageAlign;
      player.stageScale = stageScale;
      player.displayParameters = displayParameters;
      player.load(file);
    }
    file = Shumway.FileLoadingService.instance.setBaseUrl(file);
    if (asyncLoading) {
      runSWF(file);
    } else {
      new Shumway.BinaryFileReader(file).readAll(null, function(buffer, error) {
        if (!buffer) {
          throw "Unable to open the file " + file + ": " + error;
        }
        runSWF(file, buffer);
      });
    }
  });
}

window.addEventListener('message', function onWindowMessage(e) {
  var data = e.data;
  if (typeof data !== 'object' || data === null || data.type !== 'runSwf') {
    return;
  }
  window.removeEventListener('message', onWindowMessage);

  if (data.settings) {
    Shumway.Settings.setSettings(data.settings);
  }
  runSwfPlayer(data);
  document.body.style.backgroundColor = 'green';
});
