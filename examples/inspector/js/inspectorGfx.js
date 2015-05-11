
var Stage = Shumway.GFX.Stage;
var Easel = Shumway.GFX.Easel;
var Canvas2DRenderer = Shumway.GFX.Canvas2DRenderer;

var easelHost;
function createEaselHost(playerWindow) {
  easelHost = new Shumway.GFX.Window.WindowEaselHost(easel, playerWindow, window);
  return easelHost;
}

function createRecordingEaselHost(playerWindow, recordingLimit) {
  easelHost = new Shumway.GFX.Test.RecordingEaselHost(easel, playerWindow, window, recordingLimit);
  return easelHost;
}

function createPlaybackEaselHost(file) {
  easelHost = new Shumway.GFX.Test.PlaybackEaselHost(easel);
  easelHost.playUrl(file);
  return easelHost;
}

var easel;
function createEasel() {
  Shumway.GFX.WebGL.SHADER_ROOT = "../../src/gfx/gl/shaders/";
  easel = new Easel(document.getElementById("easelContainer"));
  easel.startRendering();
  return easel;
}

function setRelease(release) {
  window.release = release;
  Shumway.GFX.Canvas2D.notifyReleaseChanged();
}

function setProfile(enabled) {
  window.profile = enabled;
}

var logAssets = false;
function setLogAssets(enabled, assetListContainer_) {
  logAssets = enabled;
  assetListContainer = assetListContainer_;
}

var logScratchCanvases = false;
function setLogScratchCanvases(enabled, scratchCanvasContainer_) {
  logScratchCanvases = enabled;
  scratchCanvasContainer = scratchCanvasContainer_;
}

function resizeEaselContainer(width, height) {
  var easelContainer = document.getElementById('easelContainer');
  if (width < 0) {
    easelContainer.style.width = '';
  } else {
    easelContainer.style.width = width + 'px';
  }
  if (height < 0) {
    easelContainer.style.height = '';
  } else {
    easelContainer.style.height = height + 'px';
  }
}

var flashOverlay;
function ensureFlashOverlay(swfUrl, scale, align) {
  if (flashOverlay) {
    return;
  }
  flashOverlay = document.createElement("div");
  flashOverlay.id = 'flashContainer';
  flashOverlay.style.display = 'inline-block';
  flashOverlay.innerHTML =
    '<object type="application/x-shockwave-flash" data="' + swfUrl +
    '" width="100" height="100"><param name="quality" value="high" />' +
    '<param name="play" value="true" />' +
    '<param name="loop" value="true" />' +
    '<param name="wmode" value="opaque" />' +
    '<param name="scale" value="' + scale + '" />' +
    '<param name="menu" value="true" />' +
    '<param name="devicefont" value="false" />' +
    '<param name="salign" value="' + align + '" />' +
    '<param name="allowScriptAccess" value="sameDomain" />' +
    '<param name="shumwaymode" value="off" />' +
    '</object>';
  document.getElementById("easelContainer").appendChild(flashOverlay);

  maybeSetFlashOverlayDimensions();
}
function setFlashOverlayState(visible) {
  if (flashOverlay) {
    flashOverlay.style.display = visible ? 'inline-block' : 'none';
  }
}
function maybeSetFlashOverlayDimensions() {
  var canvas = document.getElementById("easelContainer").getElementsByTagName('canvas')[0];
  if (!canvas || !flashOverlay) {
    return;
  }
  flashOverlay.children[0].width = canvas.offsetWidth;
  flashOverlay.children[0].height = canvas.offsetHeight;
}
window.addEventListener('resize', function () {
  setTimeout(maybeSetFlashOverlayDimensions, 0);
}, false);

Shumway.Telemetry.instance = {
  reportTelemetry: function (data) { }
};

function invalidateStage() {
  easel.stage.invalidate();
}

function syncGFXOptions() {
  var GFX = Shumway.GFX;

  var options = easel.options;
  options.perspectiveCamera = GFX.perspectiveCamera.value;
  options.perspectiveCameraFOV = GFX.perspectiveCameraFOV.value;
  options.perspectiveCameraAngle = GFX.perspectiveCameraAngle.value;
  options.perspectiveCameraDistance = GFX.perspectiveCameraDistance.value;

  options.drawTiles = GFX.drawTiles.value;
  options.drawSurfaces = GFX.drawSurfaces.value;
  options.drawSurface = GFX.drawSurface.value;
  options.drawElements = GFX.drawElements.value;
  options.clipDirtyRegions = GFX.clipDirtyRegions.value;
  options.clipCanvas = GFX.clipCanvas.value;

  options.premultipliedAlpha = GFX.premultipliedAlpha.value;
  options.unpackPremultiplyAlpha = GFX.unpackPremultiplyAlpha.value;

  options.sourceBlendFactor = GFX.sourceBlendFactor.value;
  options.destinationBlendFactor = GFX.destinationBlendFactor.value;

  options.masking = GFX.masking.value;
  options.disableSurfaceUploads = GFX.disableSurfaceUploads.value;

  options.snapToDevicePixels = GFX.snapToDevicePixels.value;
  options.imageSmoothing = GFX.imageSmoothing.value;
  options.blending = GFX.blending.value;
  options.debugLayers = GFX.debugLayers.value;

  options.filters = GFX.filters.value;
  options.cacheShapes = GFX.cacheShapes.value;
  options.cacheShapesMaxSize = GFX.cacheShapesMaxSize.value;
  options.cacheShapesThreshold = GFX.cacheShapesThreshold.value;
}

document.createElement = (function () {
  var counter = Shumway.Metrics.Counter.instance;
  var nativeCreateElement = document.createElement;
  return function (x) {
    counter.count("createElement: " + x);
    return nativeCreateElement.call(document, x);
  };
})();

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


var scratchCanvasContainer;
function registerScratchCanvas(scratchCanvas) {
  if (logScratchCanvases) {
    scratchCanvasContainer.appendChild(scratchCanvas);
  } else {
    // Temporary hack to work around a bug that prevents SVG filters to work for off-screen canvases.
    // TODO remove
    scratchCanvas.style.display = 'none';
    document.body.appendChild(scratchCanvas);
  }
}

var currentStage = null;
function registerInspectorStage(stage) {
  currentStage = stage;
}

var assetListContainer;
function registerInspectorAsset(id, symbolId, asset) {
  if (!logAssets || !assetListContainer) {
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
      renderable.render(context, 0);
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
  assetListContainer.appendChild(li);
}
