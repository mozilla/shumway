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

var SHUMWAY_ROOT = "../src/";

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
    compilerSettings: {sysCompiler: true, appCompiler: true, verifier: true}
  };
}

function runViewer() {
  var flashParams = getPluginParams();
  FileLoadingService.setBaseUrl(flashParams.baseUrl);

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

var TelemetryService = {
  reportTelemetry: function (data) {}
};

var FileLoadingService = {
  createSession: function () {
    return {
      open: function (request) {
        var self = this;
        var path = FileLoadingService.resolveUrl(request.url);
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
    FileLoadingService.baseUrl = a.href;
    document.body.removeChild(a);
  },
  resolveUrl: function (url) {
    if (url.indexOf('://') >= 0) return url;

    var base = FileLoadingService.baseUrl;
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
  enableVerifier.value = compilerSettings.verifier;

  console.log("Compiler settings: " + JSON.stringify(compilerSettings));
  console.log("Parsing " + url + "...");
  function loaded() { }
  function frame(e) {}

  createAVM2(builtinPath, playerGlobalPath, avm1Path,
    compilerSettings.sysCompiler ? EXECUTION_MODE.COMPILE : EXECUTION_MODE.INTERPRET,
    compilerSettings.appCompiler ? EXECUTION_MODE.COMPILE : EXECUTION_MODE.INTERPRET,
    function (avm2) {
      console.time("Initialize Renderer");
      SWF.embed(url, document, document.getElementById("viewer"), {
         url: url,
         movieParams: movieParams,
         objectParams: objectParams,
         onComplete: loaded,
         onBeforeFrame: frame
      });
  });
}

