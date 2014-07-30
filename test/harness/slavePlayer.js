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

Shumway.dontSkipFramesOption.value = true;

var release = true;
var SHUMWAY_ROOT = "../../src/";

var viewerPlayerglobalInfo = {
  abcs: "../../build/playerglobal/playerglobal.abcs",
  catalog: "../../build/playerglobal/playerglobal.json"
};

var avm2Root = SHUMWAY_ROOT + "avm2/";
var builtinPath = avm2Root + "generated/builtin/builtin.abc";
var avm1Path = avm2Root + "generated/avm1lib/avm1lib.abc";

window.print = function (msg) {
  window.parent.postMessage({type: 'console-log', msg: msg}, '*');
};

Shumway.Telemetry.instance = {
  reportTelemetry: function (data) { }
};

Shumway.FileLoadingService.instance = {
  createSession: function () {
    return {
      open: function (request) {
        var self = this;
        var path = Shumway.FileLoadingService.instance.resolveUrl(request.url);
        console.log('FileLoadingService: loading ' + path + ", data: " + request.data);
        var BinaryFileReader = Shumway.BinaryFileReader;
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
    return combineUrl(base, url);
  }
};

// Combines two URLs. The baseUrl shall be absolute URL. If the url is an
// absolute URL, it will be returned as is.
function combineUrl(baseUrl, url) {
  if (!url) {
    return baseUrl;
  }
  if (/^[a-z][a-z0-9+\-.]*:/i.test(url)) {
    return url;
  }
  var i;
  if (url.charAt(0) == '/') {
    // absolute path
    i = baseUrl.indexOf('://');
    if (url.charAt(1) === '/') {
      ++i;
    } else {
      i = baseUrl.indexOf('/', i + 3);
    }
    return baseUrl.substring(0, i) + url;
  } else {
    // relative path
    var pathLength = baseUrl.length;
    i = baseUrl.lastIndexOf('#');
    pathLength = i >= 0 ? i : pathLength;
    i = baseUrl.lastIndexOf('?', pathLength);
    pathLength = i >= 0 ? i : pathLength;
    var prefixLength = baseUrl.lastIndexOf('/', pathLength);
    return baseUrl.substring(0, prefixLength + 1) + url;
  }
}

function runSwfPlayer(flashParams) {
  var EXECUTION_MODE = Shumway.AVM2.Runtime.ExecutionMode;

  var compilerSettings = flashParams.compilerSettings;
  var sysMode = compilerSettings.sysCompiler ? EXECUTION_MODE.COMPILE : EXECUTION_MODE.INTERPRET;
  var appMode = compilerSettings.appCompiler ? EXECUTION_MODE.COMPILE : EXECUTION_MODE.INTERPRET;
  var asyncLoading = true;
  var baseUrl = flashParams.baseUrl;
  var movieParams = flashParams.movieParams;
  var objectParams = flashParams.objectParams;
  var movieUrl = flashParams.url;
  Shumway.createAVM2(builtinPath, viewerPlayerglobalInfo, avm1Path, sysMode, appMode, function (avm2) {
    function runSWF(file) {
      var player = new Shumway.Player.Window.WindowPlayer(window, window.parent);
      player.load(file);
    }
    file = Shumway.FileLoadingService.instance.setBaseUrl(baseUrl);
    if (asyncLoading) {
      runSWF(movieUrl);
    } else {
      new Shumway.BinaryFileReader(movieUrl).readAll(null, function(buffer, error) {
        if (!buffer) {
          throw "Unable to open the file " + file + ": " + error;
        }
        runSWF(movieUrl, buffer);
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
  runSwfPlayer(data.flashParams);
  document.body.style.backgroundColor = 'green';
});
