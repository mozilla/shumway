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

var easelHost;

function runViewer() {
  var flashParams = getPluginParams();
  if (!flashParams.url) {
    console.log("no movie url provided -- stopping here");
    return;
  }

  var playerWindowIframe = document.getElementById("playerWindow");
  playerWindowIframe.addEventListener('load', function () {
    var playerWindow = playerWindowIframe.contentWindow;

    var easel = createEasel();
    easelHost = new Shumway.GFX.Window.WindowEaselHost(easel, playerWindow, window);

    var data = {
      type: 'runSwf',
      settings: Shumway.Settings.getSettings(),
      flashParams: flashParams
    };
    playerWindow.postMessage(data,  '*');
  });
}

function createEasel() {
  var Stage = Shumway.GFX.Stage;
  var Easel = Shumway.GFX.Easel;
  var Canvas2DStageRenderer = Shumway.GFX.Canvas2DStageRenderer;

  Shumway.GFX.WebGL.SHADER_ROOT = "../../src/gfx/gl/shaders/";
  var backend = Shumway.GFX.backend.value | 0;
  return new Easel(document.getElementById("stageContainer"), backend);
}

document.addEventListener("DOMContentLoaded", runViewer);
