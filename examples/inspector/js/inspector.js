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

SHUMWAY_ROOT = "../../src/";

document.createElement = (function () {
  var counter = Shumway.Metrics.Counter.instance;
  var nativeCreateElement = document.createElement;
  return function (x) {
    counter.count("createElement: " + x);
    return nativeCreateElement.call(document, x);
  };
})();

var shumwayOptions = Shumway.Settings.shumwayOptions;
var avm2Options = shumwayOptions.register(new Shumway.Options.OptionSet("AVM2"));
var sysCompiler = avm2Options.register(new Shumway.Options.Option("sysCompiler", "sysCompiler", "boolean", true, "system compiler/interpreter (requires restart)"));
var appCompiler = avm2Options.register(new Shumway.Options.Option("appCompiler", "appCompiler", "boolean", true, "application compiler/interpreter (requires restart)"));

var asyncLoading = getQueryVariable("async") === "true";
asyncLoading = true;
var simpleMode = getQueryVariable("simpleMode") === "true";
var pauseExecution = getQueryVariable("paused") === "true";
var remoteFile = getQueryVariable("rfile");
var yt = getQueryVariable('yt');

//var swfController = new SWFController(timeline, pauseExecution);

function timeAllocation(C, count) {
  var s = Date.now();
  for (var i = 0; i < count; i++) {
    var o = new C();
  }
  console.info("Took: " + (Date.now() - s) + " " + C);
}


var avm2Root = "../../src/avm2/";
var builtinPath = avm2Root + "generated/builtin/builtin.abc";
var shellAbcPath = avm2Root + "generated/shell/shell.abc";
var avm1Path = avm2Root + "generated/avm1lib/avm1lib.abc";

// different playerglobals can be used here
var playerglobalInfo = {
  abcs: "../../build/playerglobal/playerglobal.abcs",
  catalog: "../../build/playerglobal/playerglobal.json"
};

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
showOpenFileButton(true);
if (remoteFile) {
  showOpenFileButton(false);
  setTimeout(function () {
    executeFile(remoteFile, null, parseQueryString(window.location.search));
  });
}
if (yt) {
  requestYT(yt).then(function (config) {
    showOpenFileButton(false);
    executeFile(config.url, null, config.args);
  });
}
if (remoteFile) {
  configureMocks(remoteFile);
}

if (simpleMode) {
  document.body.classList.add("simple");
}

function showMessage(msg) {
  document.getElementById('message').textContent = "(" + msg + ")";
}
function showOpenFileButton(show) {
  document.getElementById('openFile').classList.toggle('active', show);
  document.getElementById('debugInfoToolbarTabs').classList.toggle('active', !show);
}

var easelHost;
function runIFramePlayer(data) {
  data.type = 'runSwf';
  data.settings = Shumway.Settings.getSettings();
  var playerWorkerIFrame = document.getElementById('playerWorker');
  playerWorkerIFrame.addEventListener('load', function () {
    var playerWorker = playerWorkerIFrame.contentWindow;
    playerWorker.postMessage(data, '*');

    var easel = createEasel();
    easelHost = new Shumway.GFX.Window.WindowEaselHost(easel, playerWorker, window);
  });
}

function executeFile(file, buffer, movieParams) {
  var filename = file.split('?')[0].split('#')[0];

  var isFramePlayerEnabled = !!document.getElementById('playerWorker');
  if (isFramePlayerEnabled && filename.endsWith(".swf")) {
    var swfURL = Shumway.FileLoadingService.instance.setBaseUrl(file);
    var loaderURL = getQueryVariable("loaderURL") || swfURL;
    runIFramePlayer({sysMode: sysMode, appMode: appMode, loaderURL: loaderURL,
      movieParams: movieParams, file: file, asyncLoading: asyncLoading});
    return;
  }

  var BinaryFileReader = Shumway.BinaryFileReader;
  var EXECUTION_MODE = Shumway.AVM2.Runtime.ExecutionMode;

  // All execution paths must now load AVM2.
  if (!appCompiler.value) {
    showMessage("Running in the Interpreter");
  }
  var sysMode = sysCompiler.value ? EXECUTION_MODE.COMPILE : EXECUTION_MODE.INTERPRET;
  var appMode = appCompiler.value ? EXECUTION_MODE.COMPILE : EXECUTION_MODE.INTERPRET;

  if (filename.endsWith(".abc")) {
    libraryScripts = {};
    Shumway.createAVM2(builtinPath, shellAbcPath, null, sysMode, appMode, function (avm2) {
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
    Shumway.createAVM2(builtinPath, playerglobalInfo, avm1Path, sysMode, appMode, function (avm2) {
      function runSWF(file, buffer) {
        var swfURL = Shumway.FileLoadingService.instance.resolveUrl(file);
        var loaderURL = getQueryVariable("loaderURL") || swfURL;

        var easel = createEasel();

        document.addEventListener('shumwayOptionsChanged', function () {
          syncGFXOptions(easel.options);
          easel.stage.invalidatePaint();
        });
        syncGFXOptions(easel.options);
        var player = new Shumway.Player.Test.TestPlayer();
        easelHost = new Shumway.GFX.Test.TestEaselHost(easel);
        player.load(file);

        // embedding.loader

//        SWF.embed(buffer || file, document, document.getElementById('stage'), {
//          onComplete: swfController.completeCallback.bind(swfController),
//          onBeforeFrame: swfController.beforeFrameCallback.bind(swfController),
//          onAfterFrame: swfController.afterFrameCallback.bind(swfController),
//          onStageInitialized: swfController.stageInitializedCallback.bind(swfController),
//          url: swfURL,
//          loaderURL: loaderURL,
//          movieParams: movieParams || {},
//        });

//        SWF.embed(buffer || file, document, document.getElementById('stage'), {
//          onComplete: swfController.completeCallback.bind(swfController),
//          onBeforeFrame: swfController.beforeFrameCallback.bind(swfController),
//          onAfterFrame: swfController.afterFrameCallback.bind(swfController),
//          onStageInitialized: swfController.stageInitializedCallback.bind(swfController),
//          url: swfURL,
//          loaderURL: loaderURL,
//          movieParams: movieParams || {},
//        });

      }
      file = Shumway.FileLoadingService.instance.setBaseUrl(file);
      if (!buffer && asyncLoading) {
        runSWF(file);
      } else if (!buffer) {
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
    Shumway.createAVM2(builtinPath, playerglobalInfo, null, sysMode, appMode, function (avm2) {
      executeUnitTests(file, avm2);
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

Shumway.Telemetry.instance = {
  reportTelemetry: function (data) { }
};

Shumway.FileLoadingService.instance = {
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
        var path = Shumway.FileLoadingService.instance.resolveUrl(request.url);
        console.log('FileLoadingService: loading ' + path + ", data: " + request.data);
        new Shumway.BinaryFileReader(path, request.method, request.mimeType, request.data).readAsync(
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
    var baseUrl;
    if (typeof URL !== 'undefined') {
      baseUrl = new URL(url, document.location.href).href;
    } else {
      var a = document.createElement('a');
      a.href = url || '#';
      a.setAttribute('style', 'display: none;');
      document.body.appendChild(a);
      baseUrl = a.href;
      document.body.removeChild(a);
    }
    Shumway.FileLoadingService.instance.baseUrl = baseUrl;
    return baseUrl;
  },
  resolveUrl: function (url) {
    var base = Shumway.FileLoadingService.instance.baseUrl || '';
    if (typeof URL !== 'undefined') {
      return new URL(url, base).href;
    }

    if (url.indexOf('://') >= 0) {
      return url;
    }

    base = base.lastIndexOf('/') >= 0 ? base.substring(0, base.lastIndexOf('/') + 1) : '';
    if (url.indexOf('/') === 0) {
      var m = /^[^:]+:\/\/[^\/]+/.exec(base);
      if (m) base = m[0];
    }
    return base + url;
  }
};

// toggle info panels (debug info, display list, settings, none)
var panelToggleButtonSelector = "#topToolbar > .toolbarButtonBar > .toolbarButton";
function panelToggleButtonClickHandler(event) {
  Array.prototype.forEach.call(event.target.parentElement.children, function (button) {
    var isActive = (button == event.target);
    button.classList.toggle("pressedState", isActive);
    togglePanelVisibility(button.dataset.panelid, isActive);
  });
  state.debugPanelId = event.target.dataset.panelid;
  saveInspectorState();
}
Array.prototype.forEach.call(document.querySelectorAll(panelToggleButtonSelector), function (element) {
  element.addEventListener("click", panelToggleButtonClickHandler);
  if (element.dataset.panelid === state.debugPanelId) {
    element.click();
  }
});
function togglePanelVisibility(id, visible) {
  if (id !== "none") {
    var panel = document.getElementById(id);
    panel.classList.toggle("active", visible);
  } else {
    document.body.classList.toggle("hideDebugInfoPanels", visible);
  }
  profiler.resize();
  traceTerminal.resize();
}

var nativeGetContext = HTMLCanvasElement.prototype.getContext;
var INJECT_DEBUG_CANVAS = false;
HTMLCanvasElement.prototype.getContext = function getContext(contextId, args) {
  if (INJECT_DEBUG_CANVAS && contextId === "2d") {
    if (args && args.original) {
      return nativeGetContext.call(this, contextId, args);
    }
    var target = nativeGetContext.call(this, contextId, args);
    return new DebugCanvasRenderingContext2D(target,
      Shumway.GFX.frameCounter, DebugCanvasRenderingContext2D.Options);
  }
  return nativeGetContext.call(this, contextId, args);
};


var Stage = Shumway.GFX.Stage;
var Easel = Shumway.GFX.Easel;
var Canvas2DStageRenderer = Shumway.GFX.Canvas2DStageRenderer;
var _easel;

function createEasel() {
  Shumway.GFX.WebGL.SHADER_ROOT = "../../src/gfx/gl/shaders/";
  var backend = Shumway.GFX.backend.value | 0;
  _easel = new Easel(document.getElementById("stageContainer"), backend);
  return _easel;
}

function registerScratchCanvas(scratchCanvas) {
  document.getElementById("scratchCanvasContainer").appendChild(scratchCanvas);
}

function registerInspectorAsset(id, symbolId, asset) {
  if (!state.logAssets) {
    return;
  }
  var li = document.createElement("li");
  var div = document.createElement("div");
  var bounds = asset.getBounds();
  var details = asset.constructor.name + ": " + id + " (" + symbolId + "), bounds: " + bounds;
  var canvas = null;
  var renderTime = 0;
  if (asset instanceof Shumway.GFX.RenderableBitmap) {
    canvas = asset._canvas;
  } else {
    canvas = document.createElement("canvas");
    canvas.width = bounds.w;
    canvas.height = bounds.h;
    var context = canvas.getContext("2d");
    context.translate(-bounds.x, -bounds.y);
    // Draw axis if not at origin.
    if (bounds.x !== 0 || bounds.y !== 0) {
      context.beginPath();
      context.lineWidth = 2;
      context.strokeStyle = "white";
      context.moveTo(-4, 0); context.lineTo(4, 0);
      context.moveTo( 0,-4); context.lineTo(0, 4);
      context.stroke();
    }
    var start = performance.now();
    asset.render(context);
    renderTime = (performance.now() - start)
  }
  if (asset instanceof Shumway.GFX.RenderableText) {
    details += ", text: " + asset._plainText;
  }
  if (renderTime) {
    details += " (" + renderTime.toFixed(3) + " ms)";
  }
  div.innerHTML = details
  li.appendChild(div);
  li.appendChild(canvas);
  document.getElementById("assetList").appendChild(li);
}