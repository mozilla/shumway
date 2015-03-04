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

function timeAllocation(C, count) {
  var s = Date.now();
  for (var i = 0; i < count; i++) {
    var o = new C();
  }
  console.info("Took: " + (Date.now() - s) + " " + C);
}


var builtinPath = "../../build/libs/builtin.abc";
var shellAbcPath = "../../build/libs/shell.abc";

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

var queryVariables = parseQueryString(window.location.search);

var startPromise = configureMocks(queryVariables);

var asyncLoading = true; // queryVariables['async'] === "true";
var simpleMode = queryVariables['simpleMode'] === "true";

/**
 * Files can either be specified via the GET param `rfile`, or by manually selecting a local file.
 */
if (queryVariables['rfile'] && !startPromise) {
  startPromise = Promise.resolve({
    url: queryVariables['rfile'],
    args: parseQueryString(queryVariables['flashvars'])
  });
} else {
  if (state.remoteEnabled) {
    initRemoteDebugging();
  }
}
if (startPromise) {
  startPromise.then(function (config) {
    executeFile(config.url, null, config.args);
  });
} else {
  showOpenFileButton(true);
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

var flashOverlay;
var currentSWFUrl;
var currentPlayer;

var easelHost;
function runIFramePlayer(data) {
  var container = document.createElement('div');
  container.setAttribute('style', 'position:absolute; top:0; left: 0; width: 9; height:9');
  document.body.appendChild(container);

  var playerWorkerIFrame = document.createElement('iframe');
  playerWorkerIFrame.id = 'playerWorker';
  playerWorkerIFrame.width = 3;
  playerWorkerIFrame.height = 3;
  playerWorkerIFrame.src = "inspector.player.html";
  playerWorkerIFrame.addEventListener('load', function () {
    var easel = createEasel();

    data.type = 'runSwf';
    data.settings = Shumway.Settings.getSettings();
    data.release = state.release;
    data.displayParameters = easel.getDisplayParameters();

    var playerWorker = playerWorkerIFrame.contentWindow;
    playerWorker.postMessage(data, '*');

    easelHost = new Shumway.GFX.Window.WindowEaselHost(easel, playerWorker, window);
  });
  container.appendChild(playerWorkerIFrame);
}

function executeFile(file, buffer, movieParams, remoteDebugging) {
  var filename = file.split('?')[0].split('#')[0];

  file = new URL(file, document.location.href).href;

  var EXECUTION_MODE = Shumway.AVM2.Runtime.ExecutionMode;
  var sysMode = sysCompiler.value ? EXECUTION_MODE.COMPILE : EXECUTION_MODE.INTERPRET;
  var appMode = appCompiler.value ? EXECUTION_MODE.COMPILE : EXECUTION_MODE.INTERPRET;

  if (state.useIFramePlayer && filename.endsWith(".swf")) {
    runIFramePlayer({sysMode: sysMode, appMode: appMode,
      movieParams: movieParams, file: file, asyncLoading: asyncLoading,
      stageAlign: state.salign, stageScale: state.scale,
      fileReadChunkSize: state.fileReadChunkSize, loaderURL: state.loaderURL,
      remoteDebugging: !!remoteDebugging});
    return;
  }

  if (file.endsWith(".swfm")) {
    var easel = createEasel();

    document.addEventListener('shumwayOptionsChanged', function () {
      syncGFXOptions(easel.options);
      easel.stage.invalidate();
    });
    syncGFXOptions(easel.options);

    easelHost = new Shumway.GFX.Test.PlaybackEaselHost(easel);
    easelHost.playUrl(file);
    return;
  }

  var BinaryFileReader = Shumway.BinaryFileReader;

  if (remoteDebugging) {
    Shumway.ClipboardService.instance = new Shumway.Player.ShumwayComClipboardService();
    Shumway.ExternalInterfaceService.instance = new Shumway.Player.ShumwayComExternalInterface();
    Shumway.FileLoadingService.instance = new Shumway.Player.ShumwayComFileLoadingService();
    Shumway.FileLoadingService.instance.init(file);
  } else {
    Shumway.FileLoadingService.instance = new Shumway.Player.BrowserFileLoadingService();
    Shumway.FileLoadingService.instance.init(file, state.fileReadChunkSize);
  }

  // All execution paths must now load AVM2.
  if (!appCompiler.value) {
    showMessage("Running in the Interpreter");
  }

  Shumway.SystemResourcesLoadingService.instance =
    new Shumway.Player.BrowserSystemResourcesLoadingService(builtinPath, playerglobalInfo, shellAbcPath);

  if (filename.endsWith(".abc")) {
    Shumway.createAVM2(Shumway.AVM2LoadLibrariesFlags.Builtin | Shumway.AVM2LoadLibrariesFlags.Shell, sysMode, appMode).then(function (avm2) {
      function runAbc(file, buffer) {
        avm2.applicationDomain.executeAbc(new Shumway.AVM2.ABC.AbcFile(new Uint8Array(buffer), file));
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
    Shumway.createAVM2(Shumway.AVM2LoadLibrariesFlags.Builtin | Shumway.AVM2LoadLibrariesFlags.Playerglobal, sysMode, appMode).then(function (avm2) {
      function runSWF(file, buffer) {
        var swfURL = Shumway.FileLoadingService.instance.resolveUrl(file);

        var easel = createEasel();

        document.addEventListener('shumwayOptionsChanged', function () {
          syncGFXOptions(easel.options);
          easel.stage.invalidate();
        });
        syncGFXOptions(easel.options);
        var gfxService = new Shumway.Player.Test.TestGFXService();
        var player = new Shumway.Player.Player(gfxService);
        player.movieParams = movieParams;
        player.stageAlign = state.salign;
        player.stageScale = state.scale;
        player.displayParameters = easel.getDisplayParameters();
        player.loaderUrl = state.loaderURL;

        var useRecorder = state.recordingLimit > 0;
        easelHost = useRecorder ?
          new Shumway.GFX.Test.RecordingEaselHost(easel, state.recordingLimit) :
          new Shumway.GFX.Test.TestEaselHost(easel);

        player.load(file, buffer);

        currentSWFUrl = swfURL;
        currentPlayer = player;
        if (state.overlayFlash) {
          ensureFlashOverlay();
        }
      }
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
    Shumway.createAVM2(Shumway.AVM2LoadLibrariesFlags.Builtin | Shumway.AVM2LoadLibrariesFlags.Playerglobal, sysMode, appMode).then(function (avm2) {
      executeUnitTests(file, avm2);
    });
  }
}

function ensureFlashOverlay() {
  if (flashOverlay) {
    return;
  }
  flashOverlay = document.createElement("div");
  flashOverlay.id = 'flashContainer';
  flashOverlay.innerHTML =  '<object type="application/x-shockwave-flash" data="' + currentSWFUrl +
                            '" width="100" height="100"><param name="quality" value="high" />' +
                            '<param name="play" value="true" />' +
                            '<param name="loop" value="true" />' +
                            '<param name="wmode" value="opaque" />' +
                            '<param name="scale" value="' + state.scale + '" />' +
                            '<param name="menu" value="true" />' +
                            '<param name="devicefont" value="false" />' +
                            '<param name="salign" value="' + state.salign + '" />' +
                            '<param name="allowScriptAccess" value="sameDomain" />' +
                            '<param name="shumwaymode" value="off" />' +
                            '</object>';
  document.getElementById("easelContainer").appendChild(flashOverlay);

  maybeSetFlashOverlayDimensions();
}
function maybeSetFlashOverlayDimensions() {
  var canvas = document.getElementById("easelContainer").getElementsByTagName('canvas')[0];
  if (!canvas || !flashOverlay) {
    return;
  }
  flashOverlay.children[0].width = canvas.offsetWidth;
  flashOverlay.children[0].height = canvas.offsetHeight;
  if (state.overlayFlash) {
    flashOverlay.style.display = 'inline-block';
  }
}
window.addEventListener('resize', function () {
  setTimeout(maybeSetFlashOverlayDimensions, 0);
}, false);

Shumway.Telemetry.instance = {
  reportTelemetry: function (data) { }
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
var Canvas2DRenderer = Shumway.GFX.Canvas2DRenderer;
var currentEasel;

function createEasel() {
  Shumway.GFX.WebGL.SHADER_ROOT = "../../src/gfx/gl/shaders/";
  currentEasel = new Easel(document.getElementById("easelContainer"));
  return currentEasel;
}

function registerScratchCanvas(scratchCanvas) {
  document.getElementById("scratchCanvasContainer").appendChild(scratchCanvas);
}

var currentStage = null;

function registerInspectorStage(stage) {
  currentStage = stage;
}

function registerInspectorAsset(id, symbolId, asset) {
  if (!state.logAssets) {
    return;
  }
  var li = document.createElement("li");
  var div = document.createElement("div");

  function refreshAsset(renderable) {
    var bounds = renderable.getBounds();
    var details = renderable.constructor.name + ": " + id + " (" + symbolId + "), bounds: " + bounds;
    var canvas = null;
    var renderTime = 0;
    if (renderable instanceof Shumway.GFX.RenderableVideo) {
      if (!renderable.isRegistered) {
        renderable.isRegistered = true;
        div.appendChild(renderable._video);
      }
      return;
    }
    if (renderable instanceof Shumway.GFX.RenderableBitmap) {
      canvas = renderable.renderSource;
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
      renderable.render(context);
      renderTime = (performance.now() - start);
    }
    if (renderable instanceof Shumway.GFX.RenderableText) {
      details += ", text: " + renderable._plainText;
    }
    if (renderTime) {
      details += " (" + renderTime.toFixed(3) + " ms)";
    }
    div.innerHTML = details + "<br>";
    div.appendChild(canvas);
  }
  refreshAsset(asset);
  asset.addInvalidateEventListener(refreshAsset);
  li.appendChild(div);
  document.getElementById("assetList").appendChild(li);
}
