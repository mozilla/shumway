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

var gfxWindow, playerWindow;

function runViewer(flashParams) {
  var easel = gfxWindow.createEasel();
  var easelHost = gfxWindow.createEaselHost(playerWindow);
  var flashParams = {
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
  };
  playerWindow.runSwfPlayer(flashParams, null, gfxWindow);
}

function waitForParametersMessage(e) {
  if (e.data && typeof e.data === 'object' && e.data.type === 'pluginParams') {
    window.removeEventListener('message', waitForParametersMessage);
    runViewer(e.data.flashParams);
  }
}

var playerReady = new Promise(function (resolve) {
  function iframeLoaded() {
    if (--iframesToLoad > 0) {
      return;
    }
    resolve();
  }

  var iframesToLoad = 2;
  document.getElementById('gfxIframe').addEventListener('load', iframeLoaded);
  document.getElementById('playerIframe').addEventListener('load', iframeLoaded);
});

playerReady.then(function() {
  gfxWindow = document.getElementById('gfxIframe').contentWindow;
  playerWindow = document.getElementById('playerIframe').contentWindow;

  var flashParams = getPluginParams();
  if (!flashParams.url) {
    // no movie url provided -- waiting for parameters via postMessage
    window.addEventListener('message', waitForParametersMessage);
  } else {
    runViewer(flashParams);
  }
});
