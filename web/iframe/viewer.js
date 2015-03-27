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

var release = true;

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

var playerWindowIframe, playerWindowIframeReady;
var easelHost;

function runViewer(flashParams) {
  playerWindowIframeReady.then(function () {
    var playerWindow = playerWindowIframe.contentWindow;

    var easel = createEasel();
    easelHost = new Shumway.GFX.Window.WindowEaselHost(easel, playerWindow, window);
    var data = {
      type: 'runSwf',
      settings: Shumway.Settings.getSettings(),
      flashParams: {
        url: flashParams.url,
        baseUrl: flashParams.baseUrl || flashParams.url,
        movieParams: flashParams.movieParams || {},
        objectParams: flashParams.objectParams || {},
        compilerSettings: flashParams.compilerSettings || {
          sysCompiler: true,
          appCompiler: true,
          verifier: true
        },
        isRemote: flashParams.isRemote,
        bgcolor: undefined,
        displayParameters: easel.getDisplayParameters()
      }
    };
    playerWindow.postMessage(data,  '*');
  });
}

function createEasel() {
  var Stage = Shumway.GFX.Stage;
  var Easel = Shumway.GFX.Easel;
  var Canvas2DRenderer = Shumway.GFX.Canvas2DRenderer;

  Shumway.GFX.WebGL.SHADER_ROOT = "../src/gfx/gl/shaders/";
  var easel = new Easel(document.getElementById("easelContainer"));
  easel.startRendering();
  return easel;
}

function waitForParametersMessage(e) {
  if (e.data && typeof e.data === 'object' && e.data.type === 'pluginParams') {
    window.removeEventListener('message', waitForParametersMessage);
    runViewer(e.data.flashParams);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  playerWindowIframe = document.getElementById("playerWindow");
  playerWindowIframeReady = new Promise(function (resolve) {
    playerWindowIframe.addEventListener('load', function load() {
      playerWindowIframe.removeEventListener('load', load);
      resolve();
    });
  });

  var flashParams = getPluginParams();
  if (!flashParams.url) {
    // no movie url provided -- waiting for parameters via postMessage
    window.addEventListener('message', waitForParametersMessage);
  } else {
    runViewer(flashParams);
  }
});
