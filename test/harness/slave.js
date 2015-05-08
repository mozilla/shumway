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

var SHUMWAY_ROOT = "../../src/";

var builtinPath = "../../build/libs/builtin.abc";
var shellAbcPath = "../../build/libs/shell.abc";

// different playerglobals can be used here
var playerglobalInfo = {
  abcs: "../../build/playerglobal/playerglobal.abcs",
  catalog: "../../build/playerglobal/playerglobal.json"
};

var easel, easelHost, player;

function loadMovie(path, reportFrames) {
  path = combineUrl(document.location.href, path);

  var expectedFrameIndex = 0, currentFrame = -1;
  function onFrameCallback() {
    if (currentFrame < 0) {
      sendResponse();
    }
    if (reportFrames) {
      while (expectedFrameIndex < reportFrames.length &&
        currentFrame >= reportFrames[expectedFrameIndex]) {
        var snapshot = getCanvasData();
        sendResponse({
          index: expectedFrameIndex,
          frame: currentFrame,
          snapshot: snapshot
        });
        expectedFrameIndex++;
      }
    }
    currentFrame++;
  }

  function initEaselHostCallbacks() {
    easelHost.processFrame = onFrameCallback;
    easelHost.processFSCommand = function (command) {
      if (command === 'quit') {
        terminate();
      }
    };
  }

  function terminate() {
    ignoreAdanvances = true;
    // cleaning up
    if (advanceTimeout) { // invoke current timeout
      clearTimeout(advanceTimeout);
      advanceCallback();
    }
    // reports unreported frames
    while (reportFrames && i < reportFrames.length) {
      onFrameCallback();
    }
  }

  easel = createEasel();
  if (TEST_MODE === 'iframe') {
    var flashParams = {
      url: path,
      baseUrl: path,
      movieParams: {},
      objectParams: {},
      compilerSettings: {
        sysCompiler: true,
        appCompiler: true,
        verifier: true
      }
    };
    var playerElement = document.getElementById('playerWindow');
    playerElement.src = 'slave-iframe.html';
    playerElement.onload = function () {
      var data = {
        type: 'runSwf',
        settings: Shumway.Settings.getSettings(),
        flashParams: flashParams
      };
      var playerWindow = playerElement.contentWindow;
      playerWindow.postMessage(data, '*');

      easelHost = new Shumway.GFX.Window.WindowEaselHost(easel, playerWindow, window);
      initEaselHostCallbacks();
    };
  } else {
    // non-iframe mode
    Shumway.dontSkipFramesOption.value = true;
    Shumway.frameRateOption.value = 60; // turbo mode

    var sysMode = Shumway.AVM2.Runtime.ExecutionMode.COMPILE; // .INTERPRET
    var appMode = Shumway.AVM2.Runtime.ExecutionMode.COMPILE; // .INTERPRET

    Shumway.FileLoadingService.instance = new Shumway.Player.BrowserFileLoadingService();
    Shumway.FileLoadingService.instance.init(path);

    Shumway.SystemResourcesLoadingService.instance =
      new Shumway.Player.BrowserSystemResourcesLoadingService(builtinPath, playerglobalInfo);

    Shumway.createSecurityDomain(Shumway.AVM2LoadLibrariesFlags.Builtin | Shumway.AVM2LoadLibrariesFlags.Playerglobal).then(function (securityDomain) {
      easelHost = new Shumway.GFX.Test.TestEaselHost(easel);
      initEaselHostCallbacks();

      var gfxService = new Shumway.Player.Test.TestGFXService(securityDomain);
      player = new Shumway.Player.Player(securityDomain, gfxService);
      player.stageAlign = 'tl';
      player.stageScale = 'noscale';
      player.displayParameters = easel.getDisplayParameters();
      player.load(path);

    });
  }
}

function createEasel() {
  Shumway.GFX.hud.value = true;
  Shumway.GFX.WebGL.SHADER_ROOT = "../../src/gfx/gl/shaders/";
  var easel = new Shumway.GFX.Easel(document.getElementById("easelContainer"), true);
  easel.startRendering();
  return easel;
}

Shumway.Telemetry.instance = {
  reportTelemetry: function (data) {}
};

var traceMessages = '';
window.print = function(s) {
  traceMessages += s + '\n';
};

function sendResponse(data) {
  window.parent.postMessage({
    type: 'test-response',
    result: data
  }, '*');
}

function getCanvas() {
  return document.getElementsByTagName('canvas')[0];
}

var tmpCanvas = document.createElement('canvas');

function getCanvasData() {
  // flush rendering buffers
  easel.render();
  return easel.screenShot(null, true, false).dataURL;
}

var mouseOutside = true;

function sendMouseEvent(type, x, y) {
  var isMouseMove = type == 'mousemove';
  var canvas = getCanvas();
  var e = document.createEvent('MouseEvents');
  e.initMouseEvent(type, true, !isMouseMove,
                   document.defaultView, isMouseMove ? 0 : 1,
                   x, y, x, y,
                   false, false, false, false, 0, canvas);
  canvas.dispatchEvent(e);
}

var advanceTimeout = null, ignoreAdanvances = false;

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

function advanceCallback() {
  advanceTimeout = null;
  sendResponse();
}

window.addEventListener('message', function (e) {
  var data = e.data;
  if (typeof data !== 'object' || data === null) {
    return;
  }

  if (data.type === 'console-log') {
    print(data.msg);
  }

  if (data.type !== 'test-message') {
    return;
  }
  switch (data.topic) {
  case 'load':
    loadMovie(data.path, data.reportFrames);
    break;
  case 'advance':
    if (ignoreAdanvances) {
      advanceCallback();
      break;
    }
    var delay = data.args[0];
    advanceTimeout = setTimeout(advanceCallback, delay);
    break;
  case 'mouse-move':
    if (mouseOutside) {
      sendMouseEvent('mouseover', data.args[0], data.args[1]);
      mouseOutside = false;
    }
    sendMouseEvent('mousemove', data.args[0], data.args[1]);
    break;
  case 'mouse-press':
    sendMouseEvent('mousedown', data.args[0], data.args[1]);
    sendMouseEvent('click', data.args[0], data.args[1]);
    break;
  case 'mouse-release':
    sendMouseEvent('mouseup', data.args[0], data.args[1]);
    break;
  case 'get-trace':
    sendResponse(traceMessages);
    break;
  case 'get-image':
    sendResponse(getCanvasData());
    break;
  }
});
