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

// turbo mode introduces intermittent failures in timeline and timeline_scene
// tests since frames are not parsed fast enough for gotoAndPlay/gotoAndStop
// turboMode.value = true;

skipFrameDraw.value = false;

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

  createAVM2(builtinPath, playerglobalInfo, avm1Path, EXECUTION_MODE.INTERPRET, EXECUTION_MODE.COMPILE, function (avm2) {
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

    Shumway.FileLoadingService.instance.baseUrl = path;
    new BinaryFileReader(path).readAll(null, function(buffer) {
      if (!buffer) {
        throw "Unable to open the file " + SWF_PATH + ": " + error;
      }
      SWF.embed(buffer, document, document.getElementById("stage"), {
        url: path,
        startPromise: movieReady,
        onParsed: loaded,
        onAfterFrame: onFrameCallback,
        onTerminated: terminate
      });
    });
  });
}

var sanityTests = {
  tests: [],
  push: function () {
    this.tests.push.apply(this.tests, arguments);
    this.onload();
  },
  onload: null
};

function loadScripts(files) {
  sanityTests.onload = next;

  var i = 0;
  function next() {
    if (i >= files.length) {
      return runSanityTests(sanityTests.tests);
    }
    var script = document.createElement('script');
    script.src = files[i++];
    document.getElementsByTagName('head')[0].appendChild(script);
  }
  next();
}

function runSanityTests(tests) {
  createAVM2(builtinPath, playerglobalInfo, avm1Path, EXECUTION_MODE.INTERPRET, EXECUTION_MODE.COMPILE, function (avm2) {
    sendResponse();
    for (var i = 0; i < tests.length; i++) {
      var failed = false;
      try {
        tests[i]({
          info: function (m) {
            console.info(m);
          },
          error: function (m) {
            console.error(m);
            failed = true;
          }
        }, avm2);
      } catch (ex) {
        failed = true;
      }
      sendResponse({index: i, failure: failed});
    }
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
        new BinaryFileReader(path).readAsync(
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
natives.print = function() {
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

function getCanvasData() {
  var canvas = document.getElementsByTagName('canvas')[0];
  return canvas.toDataURL('image/png');
}

var mouseOutside = true;

function sendMouseEvent(type, x, y) {
  var isMouseMove = type == 'mousemove';
  var canvas = document.getElementsByTagName('canvas')[0];
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
