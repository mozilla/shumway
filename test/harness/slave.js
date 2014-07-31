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

var SHUMWAY_ROOT = "../../src/";

var avm2Root = "../../src/avm2/";
var builtinPath = avm2Root + "generated/builtin/builtin.abc";
var shellAbcPath = avm2Root + "generated/shell/shell.abc";
var avm1Path = avm2Root + "generated/avm1lib/avm1lib.abc";

// different playerglobals can be used here
var playerglobalInfo = {
  abcs: "../../build/playerglobal/playerglobal.abcs",
  catalog: "../../build/playerglobal/playerglobal.json"
};

var easel, easelHost, player;

function loadMovie(path, reportFrames) {
  path = combineUrl(document.location.href, path);

  var movieReadyResolve;
  var movieReady = new Promise(function (resolve) {
    movieReadyResolve = resolve;
  });
  movieReady.then(function() { sendResponse(); });

  var onFrameCallback = null;
  if (reportFrames) {
    var i = 0, frame = -1;
    onFrameCallback = function () {
      while (i < reportFrames.length && frame >= reportFrames[i]) {
        var snapshot = getCanvasData();
        movieReady.then(sendResponse.bind(null, {
          index: i,
          frame: frame,
          snapshot: snapshot
        }));
        i++;
      }
      frame++;
    };
  }

  function initialized() {
    setTimeout(function () {
      movieReadyResolve(); // startPromise
      loaded(); // onParsed
    }, 1000);

    // terminate();
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
      easelHost.processFrame = onFrameCallback;
      initialized();
    };
    return;
  }

  function loaded() { movieReadyResolve(); }
  function terminate() {
    ignoreAdanvances = true;
    // cleaning up
    if (!movieReady.resolved) { // movieReady needs to be resolved
      movieReadyResolve();
    }
    if (advanceTimeout) { // invoke current timeout
      clearTimeout(advanceTimeout);
      advanceCallback();
    }
    // reports unreported frames
    while (reportFrames && i < reportFrames.length) {
      onFrameCallback();
    }
  }


  Shumway.dontSkipFramesOption.value = true;

  var sysMode = Shumway.AVM2.Runtime.ExecutionMode.COMPILE; // .INTERPRET
  var appMode = Shumway.AVM2.Runtime.ExecutionMode.COMPILE; // .INTERPRET

  Shumway.FileLoadingService.instance.baseUrl = path;

  Shumway.createAVM2(builtinPath, playerglobalInfo, avm1Path, sysMode, appMode, function (avm2) {

    easelHost = new Shumway.GFX.Test.TestEaselHost(easel);
    easelHost.processFrame = onFrameCallback;

    player = new Shumway.Player.Test.TestPlayer();
    player.load(path);

    initialized();
  });
}

function createEasel() {
  Shumway.GFX.WebGL.SHADER_ROOT = "../../src/gfx/gl/shaders/";
  var backend = Shumway.GFX.backend.value | 0;
  var easel = new Shumway.GFX.Easel(document.getElementById("stageContainer"), backend, true);
  return easel;
}

Shumway.Telemetry.instance = {
  reportTelemetry: function (data) {}
};

Shumway.FileLoadingService.instance = {
  createSession: function () {
    return {
      open: function (request) {
        var self = this;
        var base = Shumway.FileLoadingService.instance.baseUrl || '';
        var path = combineUrl(base, request.url);
        console.log('FileLoadingService: loading ' + path);
        new Shumway.BinaryFileReader(path).readAsync(
          function (data, progress) {
            self.onprogress(data, {bytesLoaded: progress.loaded, bytesTotal: progress.total});
          },
          function (e) { self.onerror(e); },
          self.onopen,
          self.onclose);
      }
    };
  }
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
  var canvasList = document.getElementsByTagName('canvas');
  return canvasList[canvasList.length - 1]; // we need last one
}

var tmpCanvas = document.createElement('canvas');

function getCanvasData() {
  var canvas = getCanvas();

  var bounds = easel._stage._bounds;
  tmpCanvas.width = bounds.w;
  tmpCanvas.height = bounds.h;
  var ctx = tmpCanvas.getContext('2d');
  ctx.drawImage(canvas, 0, 0);

  return tmpCanvas.toDataURL('image/png');
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
