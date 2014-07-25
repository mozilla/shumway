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

function loadMovie(path, reportFrames) {
  var movieReadyResolve;
  var movieReady = new Promise(function (resolve) {
    movieReadyResolve = resolve;
  });
  movieReady.then(function() { sendResponse(); });

  var onFrameCallback = null;
  if (reportFrames) {
    var i = 0, frame = 0;
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

  var sysMode = EXECUTION_MODE.COMPILE // EXECUTION_MODE.INTERPRET
  var appMode = EXECUTION_MODE.COMPILE // EXECUTION_MODE.INTERPRET

  Shumway.createAVM2(builtinPath, playerglobalInfo, avm1Path, sysMode, appMode, function (avm2) {
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

    var easel = createEasel();
    easelHost = new Shumway.Player.Test.TestEaselHost(easel);
    easelHost.processFrame = onFrameCallback;

    var player = new Shumway.Player.Test.TestPlayer();
    player.load(path);
    setTimeout(function () {
      movieReadyResolve(); // startPromise
      loaded(); // onParsed
    }, 1000);

    // terminate();
  });
}

function createEasel() {
  Shumway.GFX.WebGL.SHADER_ROOT = "../../src/gfx/gl/shaders/";
  var backend = Shumway.GFX.backend.value | 0;
  _easel = new Shumway.GFX.Easel(document.getElementById("stageContainer"), backend);
  return _easel;
}

var unitTests = [];

function loadScripts(files) {
  function mergeTests(tests) {
    return function (avm2) {
      var lastTest = Promise.resolve();
      tests.forEach(function (test) {
        lastTest = lastTest.then(function () {
          test(avm2);
        });
      });
      return lastTest;
    };
  }

  function next() {
    if (unitTests.length < i) {
      unitTests.push(function () {
        throw new Error('Test was not found');
      });
    }
    if (unitTests.length > i) {
      unitTests.push(mergeTests(unitTests.splice(i - 1, unitTests.length - i + 1)));
    }
    if (i >= files.length) {
      return runSanityTests(unitTests);
    }
    var script = document.createElement('script');
    script.src = files[i++];
    script.onload = next;
    document.getElementsByTagName('head')[0].appendChild(script);
  }

  var i = 0;
  next();
}

function runSanityTests(tests) {
  Shumway.createAVM2(builtinPath, playerglobalInfo, avm1Path, EXECUTION_MODE.COMPILE, EXECUTION_MODE.COMPILE, function (avm2) {
    sendResponse();
    var lastTestPromise = Promise.resolve();
    var i = 0;
    tests.forEach(function (test) {
      lastTestPromise = lastTestPromise.then(function () {
        test(avm2);
      }).then(function () {
        sendResponse({index: i++, failure: false});
      }, function () {
        sendResponse({index: i++, failure: true});
      });
    });
  });
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
        base = base.lastIndexOf('/') >= 0 ? base.substring(0, base.lastIndexOf('/') + 1) : '';
        var path = base ? base + request.url : request.url;
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
window.print = function() {
   return function(s) {
     traceMessages += s + '\n';
   };
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
function getCanvasData() {
  var canvas = getCanvas();
  return canvas.toDataURL('image/png');
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

function advanceCallback() {
  advanceTimeout = null;
  sendResponse();
}

window.addEventListener('message', function (e) {
  var data = e.data;
  if (typeof data !== 'object' || data.type !== 'test-message')
    return;
  switch (data.topic) {
  case 'load':
    loadMovie(data.path, data.reportFrames);
    break;
  case 'js':
    loadScripts(data.files);
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
