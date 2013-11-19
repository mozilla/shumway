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

var asyncLoading = getQueryVariable("async") === "true";
var simpleMode = getQueryVariable("simpleMode") === "true";
var pauseExecution = getQueryVariable("paused") === "true";
var remoteFile = getQueryVariable("rfile");
var yt = getQueryVariable('yt');

var swfController = new SWFController(timeline, pauseExecution);

var libraryAbcs;
var libraryScripts;
function grabAbc(abcName) {
  var entry = libraryScripts[abcName];
  if (entry) {
    var offset = entry.offset;
    var length = entry.length;
    return new AbcFile(new Uint8Array(libraryAbcs, offset, length), abcName);
  }
  return null
}

function findDefiningAbc(mn) {
  if (!avm2.builtinsLoaded) {
    return null;
  }
  var name;
  for (var i = 0; i < mn.namespaces.length; i++) {
    var name = mn.namespaces[i].originalURI + ":" + mn.name;
    var abcName = playerGlobalNames[name];
    if (abcName) {
      break;
    }
  }
  if (abcName) {
    return grabAbc(abcName);
  }
  return null;
}

/** Global sanityTests array, sanity tests add themselves to this */
var sanityTests = [];

// avm2 must be global.
var avm2;
function createAVM2(builtinPath, libraryPath, avm1Path, sysMode, appMode, next) {
  function loadAVM1(next) {
    new BinaryFileReader(avm1Path).readAll(null, function (buffer) {
      avm2.systemDomain.executeAbc(new AbcFile(new Uint8Array(buffer), "avm1.abc"));
      next();
    });
  }

  assert (builtinPath);
  new BinaryFileReader(builtinPath).readAll(null, function (buffer) {
    avm2 = new AVM2(sysMode, appMode, findDefiningAbc, avm1Path && loadAVM1);
    console.time("Execute builtin.abc");
    avm2.loadedAbcs = {};
    // Avoid loading more Abcs while the builtins are loaded
    avm2.builtinsLoaded = false;
    avm2.systemDomain.onMessage.register('classCreated', Stubs.onClassCreated);
    avm2.systemDomain.executeAbc(new AbcFile(new Uint8Array(buffer), "builtin.abc"));
    avm2.builtinsLoaded = true;
    console.timeEnd("Execute builtin.abc");

    new BinaryFileReader(libraryPath).readAll(null, function (buffer) {
      // If library is shell.abc, then just go ahead and run it now since
      // it's not worth doing it lazily given that it is so small.
      if (libraryPath === shellAbcPath) {
        avm2.systemDomain.executeAbc(new AbcFile(new Uint8Array(buffer), libraryPath));
      } else {
        libraryAbcs = buffer;
      }
      next(avm2);
    });
  });
}

var avm2Root = "../../src/avm2/";
var builtinPath = avm2Root + "generated/builtin/builtin.abc";
var shellAbcPath = avm2Root + "generated/shell/shell.abc";
var avm1Path = avm2Root + "generated/avm1lib/avm1lib.abc";
var playerGlobalAbcPath = "../../src/flash/playerglobal.abc";

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

/**
 * You can also specify a remote file as a query string parameters, ?rfile=... to load it automatically
 * when the page loads.
 */
if (remoteFile) {
  document.getElementById('openFile').setAttribute('hidden', true);
  executeFile(remoteFile, null, parseQueryString(window.location.search));
}

if (yt) {
  var xhr = new XMLHttpRequest({mozSystem: true});
  xhr.open('GET', 'http://www.youtube.com/watch?v=' + yt, true);
  xhr.onload = function (e) {
    var config = JSON.parse(/ytplayer\.config\s*=\s*(.+?);<\/script/.exec(xhr.responseText)[1]);
    // HACK removing FLVs from the fmt_list
    config.args.fmt_list = config.args.fmt_list.split(',').filter(function (s) {
      var fid = s.split('/')[0];
      return fid !== '5' && fid !== '34' && fid !== '35'; // more?
    }).join(',');

    var swf = config.url;

    document.getElementById('openFile').setAttribute('hidden', true);
    executeFile(swf, null, config.args);
  };
  xhr.send(null);
}

if (simpleMode) {
  document.body.setAttribute('class', 'simple');
}

function showMessage(msg) {
  document.getElementById('message').textContent = "(" + msg + ")";
}

function executeFile(file, buffer, movieParams) {
  // All execution paths must now load AVM2.
  if (!state.appCompiler) {
    showMessage("Running in the Interpreter");
  }
  var sysMode = state.sysCompiler ? EXECUTION_MODE.COMPILE : EXECUTION_MODE.INTERPRET;
  var appMode = state.appCompiler ? EXECUTION_MODE.COMPILE : EXECUTION_MODE.INTERPRET;

  var filename = file.split('?')[0].split('#')[0];
  if (filename.endsWith(".abc")) {
    libraryScripts = {};
    createAVM2(builtinPath, shellAbcPath, null, sysMode, appMode, function (avm2) {
      function runAbc(file, buffer) {
        avm2.applicationDomain.executeAbc(new AbcFile(new Uint8Array(buffer), file));
      }
      if (!buffer) {
        new BinaryFileReader(file).readAll(null, function(buffer) {
          runAbc(file, buffer);
        });
      } else {
        runAbc(file, buffer);
      }
    });
  } else if (filename.endsWith(".swf")) {
    libraryScripts = playerGlobalScripts;
    createAVM2(builtinPath, playerGlobalAbcPath, avm1Path, sysMode, appMode, function (avm2) {
      function runSWF(file, buffer) {
        var swfURL = FileLoadingService.resolveUrl(file);
        var loaderURL = getQueryVariable("loaderURL") || swfURL;
        SWF.embed(buffer || file, document, document.getElementById('stage'), {
          onComplete: swfController.completeCallback.bind(swfController),
          onBeforeFrame: swfController.beforeFrameCallback.bind(swfController),
          onAfterFrame: swfController.afterFrameCallback.bind(swfController),
          onStageInitialized: swfController.stageInitializedCallback.bind(swfController),
          url: swfURL,
          loaderURL: loaderURL,
          movieParams: movieParams || {},
        });
      }
      if (!buffer && asyncLoading) {
        FileLoadingService.setBaseUrl(file);
        runSWF(file);
      } else if (!buffer) {
        FileLoadingService.setBaseUrl(file);
        new BinaryFileReader(file).readAll(null, function(buffer, error) {
          if (!buffer) {
            throw "Unable to open the file " + file + ": " + error;
          }
          runSWF(file, buffer);
        });
      } else {
        runSWF(file, buffer);
      }
    });
  } else if (filename.endsWith(".js") || filename.endsWith("/")) {
    libraryScripts = playerGlobalScripts;
    createAVM2(builtinPath, playerGlobalAbcPath, null, sysMode, appMode, function (avm2) {
      if (file.endsWith("/")) {
        readDirectoryListing(file, function (files) {
          function loadNextScript(done) {
            if (!files.length) {
              done();
              return;
            }
            var sanityTest = files.pop();
            console.info("Loading Sanity Test: " + sanityTest);
            loadScript(sanityTest, function () {
              loadNextScript(done);
            });
          }
          loadNextScript(function whenAllScriptsAreLoaded() {
            console.info("Executing Sanity Test");
            sanityTests.forEach(function (test) {
              test(console, avm2);
            });
          });
        });
      } else {
        loadScript(file, function () {
          sanityTests.forEach(function (test) {
            test(console, avm2);
          });
        });
      }
    });
  }
}

(function setStageSize() {
  var stageSize = getQueryVariable("size");
  if (stageSize && /^\d+x\d+$/.test(stageSize)) {
    var dims = stageSize.split('x');
    var stage = document.getElementById('stage');
    stage.style.width = dims[0] + "px";
    stage.style.height = dims[1] + "px";
  }
})();

var TelemetryService = {
  reportTelemetry: function (data) { }
};

var FileLoadingService = {
  createSession: function () {
    return {
      open: function (request) {
        if (request.url.indexOf('http://s.youtube.com/stream_204') === 0) {
          // No reason to send error report yet, let's keep it this way for now.
          // 204 means no response, so no data will be expected.
          console.error('YT_CALLBACK: ' + request.url);
          this.onopen && this.onopen();
          this.onclose && this.onclose();
          return;
        }

        var self = this;
        var path = FileLoadingService.resolveUrl(request.url);
        console.log('FileLoadingService: loading ' + path + ", data: " + request.data);
        new BinaryFileReader(path, request.method, request.mimeType, request.data).readAsync(
          function (data, progress) {
            self.onprogress(data, {bytesLoaded: progress.loaded, bytesTotal: progress.total});
          },
          function (e) { self.onerror(e); },
          self.onopen,
          self.onclose,
          self.onhttpstatus);
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
    if (url.indexOf('://') >= 0) {
      return url;
    }

    var base = FileLoadingService.baseUrl || '';
    base = base.lastIndexOf('/') >= 0 ? base.substring(0, base.lastIndexOf('/') + 1) : '';
    if (url.indexOf('/') === 0) {
      var m = /^[^:]+:\/\/[^\/]+/.exec(base);
      if (m) base = m[0];
    }
    return base + url;
  }
};

// toggle button states in button bars
Array.prototype.forEach.call(document.querySelectorAll(".toolbarButtonBar > .toolbarButton"), function (element) {
  element.addEventListener("click", function (event) {
    Array.prototype.forEach.call(event.target.parentElement.children, function (button) {
      if (button == event.target) {
        button.classList.add("pressedState");
      } else {
        button.classList.remove("pressedState");
      }
    });
  });
});

// toggle info panels (debug info, display list)
var panelToggleButtonSelector = "#debugInfoToolbar > .toolbarButtonBar > .toolbarButton";
function panelToggleButtonClickHandler(event) {
  Array.prototype.forEach.call(document.querySelectorAll(panelToggleButtonSelector), function (element) {
    var panelId = element.dataset.panelid;
    var panel = document.getElementById(panelId);
    if (event.target == element) {
      panel.classList.add("active");
    } else {
      panel.classList.remove("active");
    }
  });
  switch (event.target.dataset.panelid) {
    case "displayListContainer":
      if (swfController.isPlaying()) {
        swfController.pause(function() {
          updateDisplayListTree();
        });
      } else {
        updateDisplayListTree();
      }
      document.getElementById("ctrlLogToConsole").classList.remove("active");
      break;
    default:
      document.getElementById("ctrlLogToConsole").classList.add("active");
      break;
  }
}
Array.prototype.forEach.call(document.querySelectorAll(panelToggleButtonSelector), function (element) {
  element.addEventListener("click", panelToggleButtonClickHandler);
});

swfController.onStateChange = function onStateChange(newState, oldState) {
  if (oldState === swfController.STATE_INIT) {
    initUI();
  }
  var pauseButton = document.getElementById("pauseButton");
  var stepButton = document.getElementById("stepButton");
  switch (newState) {
    case swfController.STATE_PLAYING:
      pauseButton.classList.remove("icon-play");
      pauseButton.classList.add("icon-pause");
      stepButton.classList.add("disabled");
      break;
    case swfController.STATE_PAUSED:
      pauseButton.classList.add("icon-play");
      pauseButton.classList.remove("icon-pause");
      stepButton.classList.remove("disabled");
      updateDisplayListTree();
      break;
  }
}

function initUI() {
  document.querySelector("#debugInfoToolbar > .toolbarButtonBar").classList.add("active");
  document.getElementById("ctrlLogToConsole").classList.add("active");
  document.getElementById("muteButton").classList.add("active");
  document.getElementById("pauseButton").classList.add("active");
  document.getElementById("stepButton").classList.add("active");

  avm2.systemDomain.getClass("flash.media.SoundMixer").native.static._setMasterVolume(state.mute ? 0 : 1);

  document.getElementById("pauseButton").addEventListener("click", function (event) {
    swfController.togglePause();
  });
  document.getElementById("stepButton").addEventListener("click", function (event) {
    if (swfController.isPaused()) {
      swfController.play(1);
    }
  });
}

function updateDisplayListTree() {
  var displayList = new DisplayListTree();
  displayList.update(swfController.stage, document.getElementById("displayListContainer"));
}

var nativeGetContext = HTMLCanvasElement.prototype.getContext;
var INJECT_DEBUG_CANVAS = false;
HTMLCanvasElement.prototype.getContext = function getContext(contextId, args) {
  if (INJECT_DEBUG_CANVAS && contextId === "2d") {
    if (args && args.original) {
      return nativeGetContext.call(this, contextId, args);
    }
    var target = nativeGetContext.call(this, contextId, args);
    return new DebugCanvasRenderingContext2D(target, FrameCounter, DebugCanvasRenderingContext2D.Options);
  }
  return nativeGetContext.call(this, contextId, args);
};
