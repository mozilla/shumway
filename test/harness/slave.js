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

var gfxWindow, playerWindow;

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
        var snapshot = gfxWindow.getCanvasData();
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

  var easel = gfxWindow.createEasel();
  var flashParams = {
    url: path,
    baseUrl: path,
    movieParams: {},
    objectParams: {},
    compilerSettings: {
      sysCompiler: true,
      appCompiler: true,
      verifier: true
    },
    displayParameters: easel.getDisplayParameters()
  };
  playerWindow.runSwfPlayer(flashParams, null, gfxWindow);

  var easelHost = gfxWindow.createEaselHost(playerWindow);
  easelHost.processFrame = onFrameCallback;
  easelHost.processFSCommand = function (command) {
    if (command === 'quit') {
      terminate();
    }
  };
}

var traceMessages = '';
function addTraceMessage(msg) {
  traceMessages += msg + '\n';
}

function sendResponse(data) {
  window.parent.postMessage({
    type: 'test-response',
    result: data
  }, '*');
}

var mouseOutside = true;

function sendMouseEvent(type, x, y) {
  var event = { type: type };
  SpecialPowers.synthesizeMouse(gfxWindow, x, y, event);
}

var advanceTimeout = null, ignoreAdanvances = false;

function combineUrl(baseUrl, url) {
  if (!url) {
    return baseUrl;
  }
  return new URL(url, baseUrl).href;
}

function advanceCallback() {
  advanceTimeout = null;
  sendResponse();
}

var playerReady = new Promise(function (resolve) {
  function iframeLoaded() {
    if (--iframesToLoad > 0) {
      return;
    }

    gfxWindow = document.getElementById('gfxIframe').contentWindow;
    playerWindow = document.getElementById('playerIframe').contentWindow;

    playerWindow.print = function (msg) {
      addTraceMessage(msg);
      console.log(msg);
    };

    resolve();
  }

  var iframesToLoad = 2;
  document.getElementById('gfxIframe').addEventListener('load', iframeLoaded);
  document.getElementById('playerIframe').addEventListener('load', iframeLoaded);
});

window.addEventListener('message', function (e) {
  var data = e.data;
  if (typeof data !== 'object' || data === null) {
    return;
  }

  if (data.type !== 'test-message') {
    return;
  }
  switch (data.topic) {
  case 'load':
    var path = data.path;
    var reportFrames = data.reportFrames;
    playerReady.then(function () {
      loadMovie(path, reportFrames);
    });
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
    // we need to flush pending gfx/player requests
    setTimeout(function () {
      sendResponse(traceMessages);
    });
    break;
  case 'get-image':
    // we need to flush pending gfx/player requests
    setTimeout(function () {
      sendResponse(gfxWindow.getCanvasData());
    });
    break;
  }
});
