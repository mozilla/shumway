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

var swfContainer = document.getElementById('swfContainer');
var onFrameCallback, terminate;

swfContainer.addEventListener('message', function (e) {
  switch (e.detail.type) {
    case 'processFrame':
      onFrameCallback();
      break;
    case 'processFSCommand':
      if (e.detail.data.command === 'quit') {
        terminate();
      }
      break;
    case 'print':
      print(e.detail.data);
      break;
  }
});

function loadMovie(path, reportFrames) {
  path = combineUrl(document.location.href, path);

  var expectedFrameIndex = 0, currentFrame = -1;
  onFrameCallback = function () {
    if (currentFrame < 0) {
      sendResponse();
    }
    if (reportFrames) {
      while (expectedFrameIndex < reportFrames.length &&
        currentFrame >= reportFrames[expectedFrameIndex]) {
        var snapshot = swfContainer.getCanvasData();
        sendResponse({
          index: expectedFrameIndex,
          frame: currentFrame,
          snapshot: snapshot
        });
        expectedFrameIndex++;
      }
    }
    currentFrame++;
  };

  terminate = function () {
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
  };

  swfContainer.setAttribute('base', path);
  swfContainer.src = path;
}

var traceMessages = '';
function addTraceMessage(msg) {
  traceMessages += msg + '\n';
}

function print(msg) {
  addTraceMessage(msg);
  console.log(msg);
}

function sendResponse(data) {
  window.parent.postMessage({
    type: 'test-response',
    result: data
  }, '*');
}

var mouseOutside = true;

function sendMouseEvent(type, x, y) {
  var event = { type: type === 'click' ? null : type };
  SpecialPowers.synthesizeMouse(swfContainer, x, y, event, window);
}

function sendMouseEvent(type, x, y) {
  var event = { type: type };
  SpecialPowers.synthesizeMouse(window, x, y, event);
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
    loadMovie(path, reportFrames);
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
      sendResponse(swfContainer.getCanvasData());
    });
    break;
  }
});
