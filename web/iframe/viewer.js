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

// IE10 has no console.time functions
console.time || (console.time = console.timeEnd = function () {});
console.profile || (console.profile = console.profileEnd = function () {});
// Safari has no perfomance
if (typeof performance === 'undefined') {
  window.performance = { now: Date.now };
}

var SHUMWAY_ROOT = "../../src/";

var viewerPlayerglobalInfo = {
  abcs: "../../build/playerglobal/playerglobal.abcs",
  catalog: "../../build/playerglobal/playerglobal.json"
};


function parseQueryString(qs) {
  if (!qs)
    return {};

  if (qs.charAt(0) == '?')
    qs = qs.slice(1);

  var values = qs.split('&');
  var obj = {};
  for (var i = 0; i < values.length; i++) {
    var kv = values[i].split('=');
    var key = kv[0], value = kv[1];
    obj[decodeURIComponent(key)] = decodeURIComponent(value);
  }

  return obj;
}

function getPluginParams() {
  var params = parseQueryString(window.location.search);
  return {
    baseUrl: params.base || document.location.href,
    url: params.swf,
    movieParams: {},
    objectParams: {},
    compilerSettings: {
      sysCompiler: true,
      appCompiler: true,
      verifier: true,
      forceHidpi: (typeof params.forceHidpi === "undefined") ? false : !!params.forceHidpi
    }
  };
}

function runViewer() {
  var flashParams = getPluginParams();
  Shumway.FileLoadingService.instance.setBaseUrl(flashParams.baseUrl);

  movieUrl = flashParams.url;
  if (!movieUrl) {
    console.log("no movie url provided -- stopping here");
    return;
  }

  var compilerSettings = flashParams.compilerSettings;
  movieParams = flashParams.movieParams;
  objectParams = flashParams.objectParams;
  parseSwf(movieUrl, movieParams, objectParams, compilerSettings);
}

var movieUrl, movieParams, objectParams;

Shumway.Telemetry.instance = {
  reportTelemetry: function (data) {}
};

Shumway.FileLoadingService.instance = {
  createSession: function () {
    return {
      open: function (request) {
        var self = this;
        var path = Shumway.FileLoadingService.instance.resolveUrl(request.url);
        console.log('FileLoadingService: loading ' + path);
        new BinaryFileReader(path).readAsync(
          function (data, progress) {
            self.onprogress(data, {bytesLoaded: progress.loaded, bytesTotal: progress.total});
          },
          function (e) { self.onerror(e); },
          self.onopen,
          self.onclose);
      }
    };
  },
  setBaseUrl: function (url) {
    var a = document.createElement('a');
    a.href = url || '#';
    a.setAttribute('style', 'display: none;');
    document.body.appendChild(a);
    Shumway.FileLoadingService.instance.baseUrl = a.href;
    document.body.removeChild(a);
  },
  resolveUrl: function (url) {
    if (url.indexOf('://') >= 0) return url;

    var base = Shumway.FileLoadingService.instance.baseUrl;
    base = base.split(/[#?]/)[0];
    base = base.lastIndexOf('/') >= 0 ? base.substring(0, base.lastIndexOf('/') + 1) : '';
    if (url.indexOf('/') === 0) {
      var m = /^[^:]+:\/\/[^\/]+/.exec(base);
      if (m) base = m[0];
    }
    return base + url;
  }
};

function parseSwf(url, movieParams, objectParams, compilerSettings) {
  var enableVerifier = Shumway.AVM2.Runtime.enableVerifier;
  var EXECUTION_MODE = Shumway.AVM2.Runtime.ExecutionMode;

//  enableVerifier.value = compilerSettings.verifier;
//  forceHidpi.value = compilerSettings.forceHidpi;

  console.log("Compiler settings: " + JSON.stringify(compilerSettings));
  console.log("Parsing " + url + "...");
  function loaded() { }
  function frame(e) {}

  Shumway.createAVM2(builtinPath, viewerPlayerglobalInfo, avm1Path,
    compilerSettings.sysCompiler ? EXECUTION_MODE.COMPILE : EXECUTION_MODE.INTERPRET,
    compilerSettings.appCompiler ? EXECUTION_MODE.COMPILE : EXECUTION_MODE.INTERPRET,
    function (avm2) {
      console.time("Initialize Renderer");

      var swfURL = Shumway.FileLoadingService.instance.resolveUrl(url);
      //var loaderURL = getQueryVariable("loaderURL") || swfURL;

      var easel = createEasel();

      var player = new Shumway.EaselEmbedding(easel).embed();
      player.load(url);
//      SWF.embed(url, document, document.getElementById("viewer"), {
//         url: url,
//         movieParams: movieParams,
//         objectParams: objectParams,
//         onComplete: loaded,
//         onBeforeFrame: frame
//      });
  });
}

var avm2Root = "../../src/avm2/";
var builtinPath = avm2Root + "generated/builtin/builtin.abc";
var avm1Path = avm2Root + "generated/avm1lib/avm1lib.abc";

var Stage = Shumway.GFX.Stage;
var Easel = Shumway.GFX.Easel;
var Canvas2DStageRenderer = Shumway.GFX.Canvas2DStageRenderer;
var _easel;

function createEasel() {
  Shumway.GFX.GL.SHADER_ROOT = "../../src/gfx/gl/shaders/";
  var canvas = document.createElement("canvas");
  canvas.style.backgroundColor = "#14171a";
  document.getElementById("stageContainer").appendChild(canvas);
  var backend = Shumway.GFX.backend.value | 0;
  _easel = new Easel(canvas, backend);
  return _easel;
}

var frameWriter = new Shumway.IndentingWriter(false, function (str){
  console.info(str);
});
Shumway.GFX.writer = frameWriter;

runViewer();