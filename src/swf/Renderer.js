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

var head = document.head;
head.insertBefore(document.createElement('style'), head.firstChild);
var style = document.styleSheets[0];

Renderer.MESSAGE_DEFINE_RENDERABLE = 1;
Renderer.MESSAGE_REQUIRE_RENDERABLES = 2;
Renderer.MESSAGE_SETUP_STAGE = 3;
Renderer.MESSAGE_ADD_LAYER = 4;
Renderer.MESSAGE_REMOVE_LAYER = 5;

Renderer.RENDERABLE_TYPE_SHAPE = 1;
Renderer.RENDERABLE_TYPE_BITMAP = 2;
Renderer.RENDERABLE_TYPE_FONT = 3;
Renderer.RENDERABLE_TYPE_LABEL = 4;
Renderer.RENDERABLE_TYPE_TEXT = 5;

Renderer.BITMAP_TYPE_RAW = 1;
Renderer.BITMAP_TYPE_DATA = 2;
Renderer.BITMAP_TYPE_DRAW = 3;

var ALIGN_TYPES = ['LEFT', 'RIGHT', 'CENTER', 'JUSTIFIED'];

function rgbaUintToStr(rgba) {
  return 'rgba(' + (rgba >>> 24 & 0xff) + ',' + (rgba >>> 16 & 0xff) + ',' +
         (rgba >>> 8 & 0xff) + ',' + (rgba & 0xff) / 0xff + ')';
}

function Renderer(container, bgcolor, options) {
  this._container = container;
  this._bgcolor = bgcolor;
  this._options = options || { };
  this._canvas = document.createElement('canvas');
  this._canvas.dataset['contentsScaleFactor'] = 1;
  this._promises = Object.create(null);
  this._renderables = Object.create(null);
  this._layers = Object.create(null);
  this._fonts = Object.create(null);
  this._fontsByNameStyleType = Object.create(null);

  var renderer = this;
  var layers = this._layers;

  MessageCenter.subscribe('render', function (data) {
    var i32 = new Int32Array(data);
    handleRenderMessages(renderer, layers, i32);
  });
}

function handleRenderMessages(renderer, layers, i32) {
  var f32 = new Float32Array(i32.buffer, i32.byteOffset);
  var p = 0;
  var len = i32.length;
  while (p < len) {
    var type = i32[p++];
    var n = i32[p++];
    var offset = p;
    switch (type) {
    case 0:
      return;
    case Renderer.MESSAGE_DEFINE_RENDERABLE:
      var id = i32[p++];
      var numDependencies = i32[p++];
      var dependencies = i32.subarray(p, p + numDependencies);
      p += numDependencies;
      var renderableType = i32[p++];
      var renderableData = i32.subarray(p, offset + n);
      p = offset + n;
      renderer.defineRenderable(
        id, renderableType, dependencies, renderableData
      );
      break;
    case Renderer.MESSAGE_REQUIRE_RENDERABLES:
      var callbackId = i32[p++];
      var dependencies = i32.subarray(p, offset + n);
      p = offset + n;
      renderer.requireRenderables(dependencies, function () {
        MessageCenter.post('callback', callbackId);
      });
      break;
    case Renderer.MESSAGE_SETUP_STAGE:
      var bgcolor = i32[p++];
      var width = i32[p++];
      var height = i32[p++];
      var contentsScaleFactor = i32[p++];

      var container = renderer._container;
      var canvas = renderer._canvas;

      canvas.dataset['contentsScaleFactor'] = contentsScaleFactor;

      if (!isNaN(renderer._bgcolor)) {
        bgcolor = renderer._bgcolor;
      }

      if (bgcolor) {
        canvas.style.backgroundColor = rgbaUintToStr(bgcolor);
      }

      if (container.clientHeight) {
        renderer.fitCanvas(container);
        window.addEventListener('resize', function () {
          renderer.fitCanvas(container);
        });
      } else {
        renderer.setCanvasSize(width, height);
      }

      container.appendChild(canvas);

      var stage = new Shumway.Layers.Stage(
        // width, height, width * contentsScaleFactor, height * contentsScaleFactor
        width * contentsScaleFactor, height * contentsScaleFactor
      );
      stage.transform =
        new Shumway.Geometry.Matrix.createIdentity()
                                   .scale(contentsScaleFactor, contentsScaleFactor);
      layers[0] = stage;

      renderer.enterRenderingLoop();
      break;
    case Renderer.MESSAGE_ADD_LAYER:
      var layerId = i32[p++];
      var isContainer = !!i32[p++];
      var parentId = i32[p++];
      var index = i32[p++];
      var renderableId = i32[p++];
      var renderable = renderer._renderables[renderableId];

      var transform = new Shumway.Geometry.Matrix(
        f32[p++], f32[p++], f32[p++], f32[p++], i32[p++], i32[p++]
      );
      var alpha = f32[p++];
      var visible = !!i32[p++];
      var blendMode = i32[p++];
      var maskId = i32[p++];
      var clip = maskId ? !!i32[p++] : false;

      var colorTransform = null;
      var hasColorTransform = i32[p++];
      if (hasColorTransform) {
        colorTransform =
          Shumway.Layers.ColorTransform.fromMultipliersAndOffsets(
            f32[p++], f32[p++], f32[p++], f32[p++],
            i32[p++], i32[p++], i32[p++], i32[p++]
          );
      }

      var updateRenderable = i32[p++];
      if (updateRenderable) {
        var renderableType = i32[p++];
        var renderableData = i32.subarray(p, offset + n);
        p = offset + n;
        if (renderable) {
          renderable.constructor.call(renderable, renderableData, renderer);
        } else {
          renderable = renderer.defineRenderable(renderableId,
                                                 renderableType,
                                                 null,
                                                 renderableData);
        }
      }

      if (!renderable) {
        renderable = RenderableNoop;
      }

      var layer = layers[layerId];
      var parent = layers[parentId];

      if (parentId && parent) {
        index += 1;
      } else {
        parent = layers[0];
      }

      if (layer) {
        var target = layer;

        if (isContainer) {
          target = layer.children[0];
          if (!target) {
            target = new Shumway.Layers.Shape(renderable);
            target.origin = new Shumway.Geometry.Point(
              -renderable.rect.x, -renderable.rect.y
            );
            layer.addChild(target);
          }
        }

        if (target.source !== renderable) {
          target.source = renderable;
        }

        if (updateRenderable) {
          var bounds = renderable.getBounds();
          target.w = bounds.w;
          target.h = bounds.h;

          var origin = target.origin;
          origin.x = -bounds.x;
          origin.y = -bounds.y;
          target.origin = origin;
        }
      } else {
        if (isContainer) {
          layer = new Shumway.Layers.FrameContainer();
          var child = new Shumway.Layers.Shape(renderable);
          child.origin = new Shumway.Geometry.Point(
            -renderable.rect.x, -renderable.rect.y
          );
          layer.addChild(child);
        } else {
          layer = new Shumway.Layers.Shape(renderable);
          layer.origin = new Shumway.Geometry.Point(
            renderable.rect.x, renderable.rect.y
          );
        }
        layers[layerId] = layer;
      }

      if (index < 0) {
        index = 0;
      } else if (index > parent.children.length) {
        index = parent.children.length;
      }

      if (layer.parent !== parent) {
        parent.addChildAt(layer, index);
      } else if (layer.index !== index) {
        parent.removeChild(layer);
        parent.addChildAt(layer, index);
      }

      layer.transform = transform;
      layer.alpha = alpha;
      layer.isVisible = visible;

      if (maskId) {
        layer.mask = layers[maskId];
        if (clip) {
          layer.ignoreMaskAlpha = true;
        }
      } else {
        layer.mask = null;
        layer.ignoreMaskAlpha = false;
      }

      layer.colorTransform = colorTransform;
      layer.index = index;
      break;
    case Renderer.MESSAGE_REMOVE_LAYER:
      var layerId = i32[p++];
      var layer = layers[layerId];
      if (layer) {
        layer.parent.removeChild(layer);
      }
      break;
    }
  }
};

var renderingTerminated = false;

var samplesLeftPlusOne = 0;

function sampleStart() {
  if (!samplesLeftPlusOne) {
    return;
  }
  if (samplesLeftPlusOne < 0) {
    console.profile("Sample");
    samplesLeftPlusOne *= -1;
  }
  if (samplesLeftPlusOne > 0) {
    console.info("Sampling Frame: " + (samplesLeftPlusOne - 1));
  }
}

function sampleEnd() {
  if (!samplesLeftPlusOne) {
    return;
  }
  samplesLeftPlusOne --;
  if (samplesLeftPlusOne === 1) {
    console.profileEnd("Sample");
  }
}

function timelineEnter(name) {
  timeline && timeline.enter(name);
  hudTimeline && hudTimeline.enter(name);
}

function timelineLeave(name) {
  timeline && timeline.leave(name);
  hudTimeline && hudTimeline.leave(name);
}

Renderer.prototype.setCanvasSize = function setCanvasSize(width, height) {
  var canvas = this._canvas;
  var contentsScaleFactor = canvas.dataset['contentsScaleFactor'];
  if (contentsScaleFactor === 1.0) {
    canvas.width = width | 0;
    canvas.height = height | 0;
    return;
  }
  var canvasWidth = Math.floor(width * contentsScaleFactor);
  var canvasHeight = Math.floor(height * contentsScaleFactor);
  // trying fit into fractional amount of pixels if pixelRatio is not int
  canvas.style.width = (canvasWidth / contentsScaleFactor) + 'px';
  canvas.style.height = (canvasHeight / contentsScaleFactor) + 'px';
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
}

Renderer.prototype.fitCanvas = function fitCanvas(container) {
  this.setCanvasSize(container.clientWidth, container.clientHeight);
  //stage._invalid = true;
}

Renderer.prototype.enterRenderingLoop = function enterRenderingLoop() {
  var timeline = new Timeline(document.getElementById("frameTimeline"));
  timeline.setFrameRate(60);
  timeline.refreshEvery(60);
  Shumway.GL.timeline = timeline;

  Shumway.GL.SHADER_ROOT = "../../src/stage/shaders/";

  var canvas = this._canvas;

  var WebGLContext = Shumway.GL.WebGLContext;
  var WebGLStageRenderer = Shumway.GL.WebGLStageRenderer;
  var Canvas2DStageRenderer = Shumway.Layers.Canvas2DStageRenderer;

  var sceneOptions = {
    redraw: 1,
    maxTextures: 4,
    maxTextureSize: 1024 * 2,
    useStencil: false,
    render: true,
    drawElements: true,
    drawTiles: false,
    drawTextures: false,
    ignoreViewport: false,
    ignoreColorTransform: false,
    drawTexture: -1,
    drawDirtyRegions: false,
    drawLayers: false,
    clear: true,
    imageSmoothing: true,
    snap: false,
    alpha: true
  };

  var useWebGL = false;
  if (useWebGL) {
    var webGLContext = new WebGLContext(canvas, sceneOptions);
    stageRenderer = new WebGLStageRenderer(webGLContext, canvas.width, canvas.height);
  } else {
    stageRenderer = new Canvas2DStageRenderer(canvas.getContext("2d"), Shumway.Layers.FillRule.EVENODD);
  }

  var domain = avm2.systemDomain;
  var firstRun = true;

  var renderer = this;
  var options = this._options;

  (function tick() {
    if (renderingTerminated) {
      return;
    }

    sceneOptions.perspectiveCamera = perspectiveCamera.value;
    sceneOptions.perspectiveCameraFOV = perspectiveCameraFOV.value;
    sceneOptions.perspectiveCameraDistance = perspectiveCameraDistance.value;
    sceneOptions.drawTiles = drawTiles.value;
    sceneOptions.drawTextures = drawTextures.value;
    sceneOptions.drawTexture = drawTexture.value;
    sceneOptions.drawElements = drawElements.value;
    sceneOptions.ignoreViewport = ignoreViewport.value;
    sceneOptions.ignoreColorTransform = ignoreColorTransform.value;
    sceneOptions.clipDirtyRegions = clipDirtyRegions.value;
    sceneOptions.clipCanvas = clipCanvas.value;
    sceneOptions.paintFlashing = paintFlashing.value;
    sceneOptions.cull = cull.value;
    sceneOptions.disableMasking = disableMasking.value;
    sceneOptions.debug = debugStage.value;
    sceneOptions.compositeMask = compositeMask.value;
    sceneOptions.useUploadCanvas = useUploadCanvas.value;
    sceneOptions.disableTextureUploads = disableTextureUploads.value;

    if (perspectiveCameraAngleRotate.value) {
      sceneOptions.perspectiveCameraAngle = Math.sin(Date.now() / 1000) * 100;
    } else {
      sceneOptions.perspectiveCameraAngle = perspectiveCameraAngle.value;
    }
    if (perspectiveCameraSpacingInflate.value) {
      sceneOptions.frameSpacing = (1.01 + Math.sin(Date.now() / 1000)) * 5;
    } else {
      sceneOptions.frameSpacing = sceneOptions.perspectiveCamera ? Math.max(0.01, perspectiveCameraSpacing.value) : 0.1;
    }

    if (options.onBeforeFrame) {
      var e = { cancel: false };
      options.onBeforeFrame(e);
      if (e.cancel) {
        requestAnimationFrame(tick);
        return;
      }
    }

    FrameCounter.clear();
    timelineEnter("FRAME");

    if (sceneOptions.render && !disableRendering.value && renderer._layers[0]) {
      timelineEnter("Renderer");
      traceRenderer.value && frameWriter.enter("> Rendering");
      // HACK: Setting this flag should be nicer.
      renderer._layers[0].trackDirtyRegions = stageRenderer instanceof Canvas2DStageRenderer;
      stageRenderer.render(renderer._layers[0], sceneOptions);
      traceRenderer.value && frameWriter.leave("< Rendering");
      timelineLeave("Renderer");
    }

    timelineLeave("FRAME");

    if (options.onAfterFrame) {
      options.onAfterFrame();
    }

    if (renderingTerminated) {
      if (options.onTerminated) {
        options.onTerminated();
      }
      return;
    }

    requestAnimationFrame(tick);
  })();
};

Renderer.prototype.defineRenderable = function defineRenderable(id, type,
                                                                dependencies,
                                                                data) {
  var renderer = this;
  var rendererable = null;
  var promise = new Promise(function (resolve) {
    switch (type) {
    case Renderer.RENDERABLE_TYPE_SHAPE:
      rendererable = new RenderableShape(data, renderer, resolve);
      break;
    case Renderer.RENDERABLE_TYPE_BITMAP:
      rendererable = new RenderableBitmap(data, renderer, resolve);
      break;
    case Renderer.RENDERABLE_TYPE_FONT:
      var uniqueName = 'swf-font-' + id;
      var len = data[0];
      var fontData = new Uint8Array(data.buffer, data.byteOffset + 4, len);
      var fontInfo = { type: 'embeded', uniqueName: uniqueName };

      var view = new DataView(fontData.buffer, fontData.byteOffset);
      var p = 8;
      while (p < fontData.length) {
        var tableType = view.getUint32(p += 4);
        var offset = view.getUint32(p += 8);
        var length = view.getUint32(p += 4);
        length = (length + 3) & ~0x3;
        offset = (offset + 3) & ~0x3;
        if (tableType === 0x68686561) {
          fontInfo.ascent = view.getInt16(offset += 4) / 1024;
          fontInfo.descent = view.getInt16(offset += 2) / 1024;
          fontInfo.leading = view.getInt16(offset += 2) / 1024;
          fontInfo.height = fontInfo.ascent + fontInfo.descent + fontInfo.leading;
        } else if (tableType === 0x6e616d65) {
          var stringOffset = offset + view.getUint16(offset += 4);
          length = view.getUint16(offset += 22);
          offset = stringOffset + view.getUint16(offset += 2);
          var chars = fontData.subarray(offset, offset + length);
          fontInfo.name = String.fromCharCode.apply(null, chars);
          break;
        }
      }

      renderer._fonts[id] = fontInfo;

      var ident = fontInfo.name.toLowerCase() + '_embedded';
      renderer._fontsByNameStyleType[ident] = fontInfo;

      style.insertRule(
        '@font-face{' +
          'font-family:"' + uniqueName + '";' +
          'src:url(data:font/opentype;base64,' + base64ArrayBuffer(fontData) + ')' +
        '}',
        style.cssRules.length
      );

      // HACK non-Gecko browsers need time to load fonts
      if (!/Mozilla\/5.0.*?rv:(\d+).*? Gecko/.test(window.navigator.userAgent)) {
        var testDiv = document.createElement('div');
        testDiv.setAttribute('style', 'position: absolute; top: 0; right: 0;' +
                                      'visibility: hidden; z-index: -500;' +
                                      'font-family:"' + uniqueName + '";');
        testDiv.textContent = 'font test';
        document.body.appendChild(testDiv);

        setTimeout(function () {
          resolve();
          document.body.removeChild(testDiv);
        }, 200);
      } else {
        resolve();
      }
      break;
    case Renderer.RENDERABLE_TYPE_LABEL:
      rendererable = new RenderableLabel(data, renderer, resolve);
      break;
    case Renderer.RENDERABLE_TYPE_TEXT:
      rendererable = new RenderableText(data, renderer, resolve);
      break;
    default:
      resolve();
    }
  });

  if (dependencies && dependencies.length) {
    var promiseQueue = [promise];
    for (var i = 0; i < dependencies.length; i++) {
      var promise = this._promises[dependencies[i]];
      promiseQueue.push(promise);
    }
    promise = Promise.all(promiseQueue);
  }

  this._promises[id] = promise.then(function () {
    renderer._renderables[id] = rendererable;
  });

  return rendererable;
};
Renderer.prototype.getRenderable = function getRenderable(id) {
  return this._renderables[id];
};
Renderer.prototype.undefineRenderable = function undefineRenderable(id) {
  var renderable = this._renderables[id];
  delete this._renderables[id];
  return renderable;
};
Renderer.prototype.requireRenderables = function requireRenderables(ids, callback) {
  var promiseQueue = [];
  for (var i = 0; i < ids.length; i++) {
    var promise = this._promises[ids[i]];
    if (promise) {
      promiseQueue.push(promise);
    }
  }
  Promise.all(promiseQueue).then(callback);
};
Renderer.prototype.getFont = function(name, embedded /* true|false */) {
  var ident = name.toLowerCase() + (embedded ? '_embedded' : '_device');
  var font = this._fontsByNameStyleType[ident];
  if (font) {
    return font;
  }
  font = { };
  font.name = name;
  font.type = 'device';
  var metrics = deviceFontMetrics()[name];
  if (!metrics) {
    metrics = deviceFontMetrics().serif;
    assert(metrics);
    font._fontName = font._uniqueName = 'serif';
  }
  font.ascent = metrics[0];
  font.descent = metrics[1];
  font.leading = metrics[2];
  font.height = metrics[0] + metrics[1] + metrics[2];
  this._fontsByNameStyleType[ident] = font;
  return font;
};
Renderer.prototype.resolveFont = function(format, embedded) {
  var face = format.face.toLowerCase();
  if (face === '_sans') {
    face = 'sans-serif';
  } else if (face === '_serif') {
    face = 'serif';
  } else if (face === '_typewriter') {
    face = 'monospace';
  }
  var style;
  if (format.bold) {
    if (format.italic) {
      style = 'boldItalic';
    } else {
      style = 'bold';
    }
  } else if (format.italic) {
    style = 'italic';
  } else {
    style = 'regular';
  }
  var font = this.getFont(face, embedded);
  assert(font);
  format.font = font;
};

var RenderableNoop = {
  rect: new Shumway.Geometry.Rectangle(0, 0, 0, 0),
  getBounds: function () {
    return this.rect;
  },
  properties: { },
  render: function () { }
}

function RenderableShape(data, renderer, resolve) {
  var xMin = (data[0] / 20) | 0;
  var xMax = (data[1] / 20) | 0;
  var yMin = (data[2] / 20) | 0;
  var yMax = (data[3] / 20) | 0;
  this.rect = new Shumway.Geometry.Rectangle(xMin, yMin, xMax - xMin, yMax - yMin);

  if (!this.properties) {
    this.properties = { };
  }

  this.renderer = renderer;
  this.data = data.subarray(4);

  if (resolve) {
    resolve();
  }
}
RenderableShape.prototype.isScalable = true;
RenderableShape.prototype.getBounds = function getBounds() {
  return this.rect;
};
RenderableShape.prototype.render = function render(ctx) {
  ctx.save();
  ctx.translate(-this.rect.x, -this.rect.y);

  var i32 = this.data;
  var f32 = new Float32Array(i32.buffer, i32.byteOffset);
  var p = 0;
  while (p < i32.length) {
    var styles = [];
    for (var i = 0; i < 2; i++) {
      var style = null;
      var fillStyleType = i32[p++];
      switch (fillStyleType) {
      case GRAPHICS_FILL_SOLID:
        style = i32[p++];
        break;
      case GRAPHICS_FILL_LINEAR_GRADIENT:
        style = ctx.createLinearGradient(-1, 0, 1, 0);
      case GRAPHICS_FILL_RADIAL_GRADIENT:
      case GRAPHICS_FILL_FOCAL_RADIAL_GRADIENT:
        var focalPoint = (i32[p++] / 20) | 0;

        if (!style) {
          style = ctx.createRadialGradient(focalPoint, 0, 0, 0, 0, 1);
        }

        var n = i32[p++];
        for (var j = 0; j < n; j++) {
          var ratio = f32[p++];
          var color = rgbaUintToStr(i32[p++]);
          style.addColorStop(ratio, color);
        }
        break;
      case GRAPHICS_FILL_REPEATING_BITMAP:
      case GRAPHICS_FILL_CLIPPED_BITMAP:
      case GRAPHICS_FILL_NONSMOOTHED_REPEATING_BITMAP:
      case GRAPHICS_FILL_NONSMOOTHED_CLIPPED_BITMAP:
        var bitmapId = i32[p++];
        var repeat = !!i32[p++];
        var smooth = !!i32[p++];

        var bitmap = this.renderer.getRenderable(bitmapId);
        style = ctx.createPattern(
          bitmap.drawable, repeat ? 'repeat' : 'no-repeat'
        );
        style.smooth = smooth;
        break;
      }
      if (isNaN(style)) {
        style.transform = { a: f32[p++],
                            b: f32[p++],
                            c: f32[p++],
                            d: f32[p++],
                            e: (i32[p++] / 20) | 0,
                            f: (i32[p++] / 20) | 0 };
      }
      styles.push(style);
    }

    var fillStyle = styles[0];
    var strokeStyle = styles[1];

    if (strokeStyle) {
      // Flash's lines are always at least 1px/20twips
      ctx.lineWidth = Math.max(i32[p++] / 20, 1);
      ctx.lineCap = CAPS_STYLE_TYPES[i32[p++]];
      ctx.lineJoin = JOIN_STYLE_TYPES[i32[p++]];
      ctx.miterLimit = i32[p++];
    }

    ctx.beginPath();

    var n = i32[p++];
    var commands = new Uint8Array(i32.buffer, i32.byteOffset + (p * 4), n);
    p += (n + (4 - (n % 4)) % 4) / 4;
    n = i32[p++];
    var data = i32.subarray(p, p + n);
    p += n;

    var formOpen = false;
    var formOpenX = 0;
    var formOpenY = 0;
    //if (!path.isMorph) {
      for (var j = 0, k = 0; j < commands.length; j++) {
        switch (commands[j]) {
          case SHAPE_MOVE_TO:
            formOpen = true;
            formOpenX = data[k++]/20;
            formOpenY = data[k++]/20;
            ctx.moveTo(formOpenX, formOpenY);
            break;
          case SHAPE_WIDE_MOVE_TO:
            ctx.moveTo(data[k++]/20, data[k++]/20);
            k += 2;
            break;
          case SHAPE_LINE_TO:
            ctx.lineTo(data[k++]/20, data[k++]/20);
            break;
          case SHAPE_WIDE_LINE_TO:
            ctx.lineTo(data[k++]/20, data[k++]/20);
            k += 2;
            break;
          case SHAPE_CURVE_TO:
            ctx.quadraticCurveTo(data[k++]/20, data[k++]/20,
                                 data[k++]/20, data[k++]/20);
            break;
          case SHAPE_CUBIC_CURVE_TO:
            ctx.bezierCurveTo(data[k++]/20, data[k++]/20,
                              data[k++]/20, data[k++]/20,
                              data[k++]/20, data[k++]/20);
            break;
          case SHAPE_CIRCLE:
            if (formOpen) {
              ctx.lineTo(formOpenX, formOpenY);
              formOpen = false;
            }
            ctx.moveTo((data[k] + data[k+2])/20, data[k+1]/20);
            ctx.arc(data[k++]/20, data[k++]/20, data[k++]/20, 0, Math.PI * 2,
                    false);
            break;
          case SHAPE_ELLIPSE:
            if (formOpen) {
              ctx.lineTo(formOpenX, formOpenY);
              formOpen = false;
            }
            var x = data[k++];
            var y = data[k++];
            var rX = data[k++];
            var rY = data[k++];
            var radius;
            if (rX !== rY) {
              ctx.save();
              var ellipseScale;
              if (rX > rY) {
                ellipseScale = rX / rY;
                radius = rY;
                x /= ellipseScale;
                ctx.scale(ellipseScale, 1);
              } else {
                ellipseScale = rY / rX;
                radius = rX;
                y /= ellipseScale;
                ctx.scale(1, ellipseScale);
              }
            }
            ctx.moveTo((x + radius)/20, y/20);
            ctx.arc(x/20, y/20, radius/20, 0, Math.PI * 2, false);
            if (rX !== rY) {
              ctx.restore();
            }
            break;
          default:
            // Sometimes, the very last command isn't properly set. Ignore it.
            if (commands[j] === 0 && j === commands.length -1) {
              break;
            }
            console.warn("Unknown drawing command encountered: " +
                         commands[j]);
        }
      }

    // TODO: support mophing shapes

    //} else {
    //  for (var j = 0, k = 0; j < commands.length; j++) {
    //    switch (commands[j]) {
    //      case SHAPE_MOVE_TO:
    //        ctx.moveTo(morph(data[k]/20, morphData[k++]/20, ratio),
    //                   morph(data[k]/20, morphData[k++]/20, ratio));
    //        break;
    //      case SHAPE_LINE_TO:
    //        ctx.lineTo(morph(data[k]/20, morphData[k++]/20, ratio),
    //                   morph(data[k]/20, morphData[k++]/20, ratio));
    //        break;
    //      case SHAPE_CURVE_TO:
    //        ctx.quadraticCurveTo(morph(data[k]/20, morphData[k++]/20, ratio),
    //                             morph(data[k]/20, morphData[k++]/20, ratio),
    //                             morph(data[k]/20, morphData[k++]/20, ratio),
    //                             morph(data[k]/20, morphData[k++]/20, ratio));
    //        break;
    //      default:
    //        console.warn("Drawing command not supported for morph " +
    //                     "shapes: " + commands[j]);
    //    }
    //  }
    //}

    // TODO: enable in-path line-style changes
    //if (formOpen) {
    //  ctx.lineTo(formOpenX, formOpenY);
    //}
    if (fillStyle) {
      ctx.save();
      if (isNaN(fillStyle)) {
        ctx.fillStyle = fillStyle;
        ctx.imageSmoothingEnabled = ctx.mozImageSmoothingEnabled = fillStyle.smooth;
        var m = fillStyle.transform;
        ctx.transform(m.a, m.b, m.c, m.d, m.e, m.f);
      } else {
        ctx.fillStyle = rgbaUintToStr(fillStyle);
      }
      ctx.fill();
      ctx.restore();
    }
    // TODO: All widths except for `undefined` and `NaN` draw something
    if (strokeStyle) {
      if (isNaN(strokeStyle)) {
        // TODO: support extended lines
      } else {
        ctx.strokeStyle = rgbaUintToStr(strokeStyle);
        ctx.stroke();
      }
    }
    ctx.closePath();
  }

  ctx.restore();
};

function RenderableBitmap(data, renderer, resolve) {
  var width = data[0];
  var height = data[1];

  this.rect = new Shumway.Geometry.Rectangle(0, 0, width, height);

  var type = data[2];
  var len = data[3];
  var bmpData = new Uint8Array(data.buffer, data.byteOffset + 16, len);
  var drawable;

  switch (type) {
  case Renderer.BITMAP_TYPE_RAW:
    drawable = document.createElement('canvas');
    var ctx = drawable.getContext('2d');
    drawable.width = width;
    drawable.height = height;
    imageData = ctx.createImageData(width, height);
    imageData.data.set(bmpData);
    ctx.putImageData(imageData, 0, 0);
    if (resolve) {
      resolve();
    }
    break;
  case Renderer.BITMAP_TYPE_DATA:
    drawable = new Image();
    var blob = new Blob([bmpData]);
    if (resolve) {
      drawable.onload = resolve;
    }
    drawable.src = URL.createObjectURL(blob);
    break;
  case Renderer.BITMAP_TYPE_DRAW:
    var layers = Object.create(null);
    var stage = new Shumway.Layers.Stage(width, height);
    layers[0] = stage;

    var i32 = new Int32Array(bmpData.buffer, bmpData.byteOffset, len / 4);
    handleRenderMessages(renderer, layers, i32);

    drawable = document.createElement('canvas');
    drawable.width = width;
    drawable.height = height;
    break;
  }

  if (!this.properties) {
    this.properties = { };
  }

  this.renderer = renderer;
  this.drawable = drawable;
}
RenderableBitmap.prototype.isScalable = false;
RenderableBitmap.prototype.getBounds = function getBounds() {
  return this.rect;
};
RenderableBitmap.prototype.render = function render(ctx) {
  ctx.drawImage(this.drawable, 0, 0);
};

function RenderableLabel(data, renderer, resolve) {
  var xMin = (data[0] / 20) | 0;
  var xMax = (data[1] / 20) | 0;
  var yMin = (data[2] / 20) | 0;
  var yMax = (data[3] / 20) | 0;
  this.rect = new Shumway.Geometry.Rectangle(xMin, yMin, xMax - xMin, yMax - yMin);

  var n = data[4];
  var code = String.fromCharCode.apply(null, data.subarray(5, 5 + n));
  this.render = new Function('c', code);

  if (!this.properties) {
    this.properties = { };
  }

  this.renderable = true;

  if (resolve) {
    resolve();
  }
}
RenderableLabel.prototype.isScalable = true;
RenderableLabel.prototype.getBounds = function getBounds() {
  return this.rect;
};

function RenderableText(data, renderer, resolve) {
  var p = 0;

  var xMin = (data[p++] / 20) | 0;
  var xMax = (data[p++] / 20) | 0;
  var yMin = (data[p++] / 20) | 0;
  var yMax = (data[p++] / 20) | 0;

  var width = xMax - xMin + 4;
  var height = yMax - yMin + 4;

  var fontId = data[p++];
  var bold = !!data[p++];
  var italic = !!data[p++];
  var size = data[p++];

  var color = data[p++];
  var backgroundColor = data[p++];
  var borderColor = data[p++];

  var autoSize = data[p++];
  var align = data[p++];
  var wordWrap = !!data[p++];
  var multiline = !!data[p++];
  var leading = data[p++];
  var letterspacing = data[p++];
  var kerning = data[p++];
  var isHtml = data[p++];
  var condenseWhite = data[p++];
  var scrollV = data[p++];

  var n = data[p++];
  var text = String.fromCharCode.apply(null, data.subarray(p, p + n));

  var fontInfo = renderer._fonts[fontId];
  var content = new TextFieldContent(renderer, { align: ALIGN_TYPES[align],
                                                 font: null,
                                                 bold: bold,
                                                 italic: italic,
                                                 face: fontInfo.name,
                                                 size: size,
                                                 letterSpacing: letterspacing,
                                                 kerning: kerning,
                                                 color: color >>> 0,
                                                 leading: leading });

  content.wordWrap = wordWrap;
  content.multiline = multiline;
  content.textColor = color;

  if (isHtml) {
    content.htmlText = text;
  } else {
    content.text = text;
  }

  var combinedAlign = content.calculateMetrics(width, height, true);

  if (autoSize) {
    var targetWidth = content.textWidth;
    var diffX = 0;
    if (combinedAlign !== 'mixed') {
      switch (ALIGN_TYPES[autoSize]) {
        case 'LEFT':
          break;
        case 'CENTER':
          diffX = (width - targetWidth) >> 1;
          break;
        case 'RIGHT':
          diffX = width - targetWidth;
      }
      width = targetWidth + 4;
    }
    height = textHeight + 4;
  }

  ////////////// SYNC WITH SCRIPT THREAD //////////////
  // SEND lines
  // SEND textWidth
  // SEND textHeight
  // SEND diffX

  this.rect = new Shumway.Geometry.Rectangle(0, 0, width, height);

  if (this.properties) {
    this.isInvalid = true;
  } else  {
    this.properties = { };
  }

  this.renderer = renderer;
  this.backgroundColor = backgroundColor;
  this.borderColor = borderColor;
  this.content = content;
  this.scrollV = scrollV;

  if (resolve) {
    resolve();
  }
}
RenderableText.prototype.isScalable = true;
RenderableText.prototype.isDynamic = true;
RenderableText.prototype.getBounds = function getBounds() {
  return this.rect;
};
RenderableText.prototype.render = function render(ctx) {
  this.isInvalid = false;

  var width = this.rect.w;
  var height = this.rect.h;
  if (width <= 0 || height <= 0) {
    return;
  }

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, width, height);
  ctx.clip();
  if (this.backgroundColor) {
    ctx.fillStyle = rgbaUintToStr(this.backgroundColor);
    ctx.fill();
  }
  if (this.borderColor) {
    ctx.strokeStyle = rgbaUintToStr(this.borderColor);
    ctx.lineCap = "square";
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, width|0, height|0);
  }
  ctx.closePath();

  var content = this.content;

  if (content.lines.length === 0) {
    ctx.restore();
    return;
  }

  var scrollV = this.scrollV;

  ctx.translate(2, 2);
  ctx.save();
  var runs = content._textRuns;
  var offsetY = content.lines[scrollV - 1].y;
  for (var i = 0; i < runs.length; i++) {
    var run = runs[i];
    if (run.type === 'f') {
      ctx.restore();
      ctx.font = makeFormatString(run.format);
      ctx.fillStyle = rgbaUintToStr(run.format.color);
      ctx.save();
    } else {
      assert(run.type === 't', 'Invalid run type: ' + run.type);
      if (run.y < offsetY) {
        continue;
      }
      ctx.fillText(run.text, run.x, run.y - offsetY);
    }
  }
  ctx.restore();
  ctx.restore();
};

var _deviceFontMetrics;

function deviceFontMetrics() {
  if (_deviceFontMetrics) {
    return _deviceFontMetrics;
  }
  var userAgent = window.navigator.userAgent;
  if (userAgent.indexOf("Windows") > -1) {
    _deviceFontMetrics = DEVICE_FONT_METRICS_WIN;
  } else if (/(Macintosh|iPad|iPhone|iPod|Android)/.test(userAgent)) {
    _deviceFontMetrics = DEVICE_FONT_METRICS_MAC;
  } else {
    _deviceFontMetrics = DEVICE_FONT_METRICS_LINUX;
  }
  return _deviceFontMetrics;
}

var DEVICE_FONT_METRICS_WIN = {
  "serif": [1,0.25,0],
  "sans-serif": [1,0.25,0],
  "monospace": [1,0.25,0],
  "birch std": [0.9167,0.25,0],
  "blackoak std": [1,0.3333,0],
  "chaparral pro": [0.8333,0.3333,0],
  "chaparral pro light": [0.8333,0.3333,0],
  "charlemagne std": [0.9167,0.25,0],
  "cooper std black": [0.9167,0.25,0],
  "giddyup std": [0.8333,0.3333,0],
  "hobo std": [1.0833,0.3333,0],
  "kozuka gothic pro b": [1,0.4167,0],
  "kozuka gothic pro el": [1.0833,0.25,0],
  "kozuka gothic pro h": [1,0.4167,0],
  "kozuka gothic pro l": [1,0.3333,0],
  "kozuka gothic pro m": [1.0833,0.3333,0],
  "kozuka gothic pro r": [1,0.3333,0],
  "kozuka mincho pro b": [1.0833,0.25,0],
  "kozuka mincho pro el": [1.0833,0.25,0],
  "kozuka mincho pro h": [1.1667,0.25,0],
  "kozuka mincho pro l": [1.0833,0.25,0],
  "kozuka mincho pro m": [1.0833,0.25,0],
  "kozuka mincho pro r": [1.0833,0.25,0],
  "mesquite std": [0.9167,0.25,0],
  "minion pro cond": [1,0.3333,0],
  "minion pro med": [1,0.3333,0],
  "minion pro smbd": [1,0.3333,0],
  "myriad arabic": [1,0.4167,0],
  "nueva std": [0.75,0.25,0],
  "nueva std cond": [0.75,0.25,0],
  "ocr a std": [0.8333,0.25,0],
  "orator std": [1.0833,0.25,0],
  "poplar std": [0.9167,0.25,0],
  "prestige elite std": [0.9167,0.25,0],
  "rosewood std regular": [0.8333,0.3333,0],
  "stencil std": [1,0.3333,0],
  "trajan pro": [1,0.25,0],
  "kozuka gothic pr6n b": [1.4167,0.4167,0],
  "kozuka gothic pr6n el": [1.4167,0.3333,0],
  "kozuka gothic pr6n h": [1.4167,0.4167,0],
  "kozuka gothic pr6n l": [1.4167,0.3333,0],
  "kozuka gothic pr6n m": [1.5,0.3333,0],
  "kozuka gothic pr6n r": [1.4167,0.3333,0],
  "kozuka mincho pr6n b": [1.3333,0.3333,0],
  "kozuka mincho pr6n el": [1.3333,0.3333,0],
  "kozuka mincho pr6n h": [1.4167,0.3333,0],
  "kozuka mincho pr6n l": [1.3333,0.3333,0],
  "kozuka mincho pr6n m": [1.3333,0.3333,0],
  "kozuka mincho pr6n r": [1.3333,0.3333,0],
  "letter gothic std": [1,0.25,0],
  "minion pro": [1,0.3333,0],
  "myriad hebrew": [0.8333,0.3333,0],
  "myriad pro": [0.9167,0.25,0],
  "myriad pro cond": [0.9167,0.25,0],
  "myriad pro light": [1,0.25,0],
  "marlett": [1,0,0],
  "arial": [1,0.25,0],
  "arabic transparent": [1,0.25,0],
  "arial baltic": [1,0.25,0],
  "arial ce": [1,0.25,0],
  "arial cyr": [1,0.25,0],
  "arial greek": [1,0.25,0],
  "arial tur": [1,0.25,0],
  "batang": [0.8333,0.1667,0],
  "batangche": [0.8333,0.1667,0],
  "gungsuh": [0.8333,0.1667,0],
  "gungsuhche": [0.8333,0.1667,0],
  "courier new": [1,0.25,0],
  "courier new baltic": [1,0.25,0],
  "courier new ce": [1,0.25,0],
  "courier new cyr": [1,0.25,0],
  "courier new greek": [1,0.25,0],
  "courier new tur": [1,0.25,0],
  "daunpenh": [0.6667,0.6667,0],
  "dokchampa": [1.4167,0.5833,0],
  "estrangelo edessa": [0.75,0.3333,0],
  "euphemia": [1.0833,0.3333,0],
  "gautami": [1.1667,0.8333,0],
  "vani": [1.0833,0.75,0],
  "gulim": [0.8333,0.1667,0],
  "gulimche": [0.8333,0.1667,0],
  "dotum": [0.8333,0.1667,0],
  "dotumche": [0.8333,0.1667,0],
  "impact": [1.0833,0.25,0],
  "iskoola pota": [1,0.3333,0],
  "kalinga": [1.0833,0.5,0],
  "kartika": [1,0.4167,0],
  "khmer ui": [1.0833,0.3333,0],
  "lao ui": [1,0.25,0],
  "latha": [1.0833,0.4167,0],
  "lucida console": [0.75,0.25,0],
  "malgun gothic": [1,0.25,0],
  "mangal": [1.0833,0.3333,0],
  "meiryo": [1.0833,0.4167,0],
  "meiryo ui": [1,0.25,0],
  "microsoft himalaya": [0.5833,0.4167,0],
  "microsoft jhenghei": [1,0.3333,0],
  "microsoft yahei": [1.0833,0.3333,0],
  "mingliu": [0.8333,0.1667,0],
  "pmingliu": [0.8333,0.1667,0],
  "mingliu_hkscs": [0.8333,0.1667,0],
  "mingliu-extb": [0.8333,0.1667,0],
  "pmingliu-extb": [0.8333,0.1667,0],
  "mingliu_hkscs-extb": [0.8333,0.1667,0],
  "mongolian baiti": [0.8333,0.25,0],
  "ms gothic": [0.8333,0.1667,0],
  "ms pgothic": [0.8333,0.1667,0],
  "ms ui gothic": [0.8333,0.1667,0],
  "ms mincho": [0.8333,0.1667,0],
  "ms pmincho": [0.8333,0.1667,0],
  "mv boli": [1.1667,0.25,0],
  "microsoft new tai lue": [1,0.4167,0],
  "nyala": [0.9167,0.3333,0],
  "microsoft phagspa": [1.0833,0.25,0],
  "plantagenet cherokee": [1,0.4167,0],
  "raavi": [1.0833,0.6667,0],
  "segoe script": [1.0833,0.5,0],
  "segoe ui": [1,0.25,0],
  "segoe ui semibold": [1,0.25,0],
  "segoe ui light": [1,0.25,0],
  "segoe ui symbol": [1,0.25,0],
  "shruti": [1.0833,0.5,0],
  "simsun": [0.8333,0.1667,0],
  "nsimsun": [0.8333,0.1667,0],
  "simsun-extb": [0.8333,0.1667,0],
  "sylfaen": [1,0.3333,0],
  "microsoft tai le": [1,0.3333,0],
  "times new roman": [1,0.25,0],
  "times new roman baltic": [1,0.25,0],
  "times new roman ce": [1,0.25,0],
  "times new roman cyr": [1,0.25,0],
  "times new roman greek": [1,0.25,0],
  "times new roman tur": [1,0.25,0],
  "tunga": [1.0833,0.75,0],
  "vrinda": [1,0.4167,0],
  "shonar bangla": [0.8333,0.5,0],
  "microsoft yi baiti": [0.8333,0.1667,0],
  "tahoma": [1,0.1667,0],
  "microsoft sans serif": [1.0833,0.1667,0],
  "angsana new": [0.9167,0.4167,0],
  "aparajita": [0.75,0.4167,0],
  "cordia new": [0.9167,0.5,0],
  "ebrima": [1.0833,0.5,0],
  "gisha": [0.9167,0.25,0],
  "kokila": [0.8333,0.3333,0],
  "leelawadee": [0.9167,0.25,0],
  "microsoft uighur": [1.0833,0.5,0],
  "moolboran": [0.6667,0.6667,0],
  "symbol": [1,0.25,0],
  "utsaah": [0.8333,0.4167,0],
  "vijaya": [1.0833,0.25,0],
  "wingdings": [0.9167,0.25,0],
  "andalus": [1.3333,0.4167,0],
  "arabic typesetting": [0.8333,0.5,0],
  "simplified arabic": [1.3333,0.5,0],
  "simplified arabic fixed": [1,0.4167,0],
  "sakkal majalla": [0.9167,0.5,0],
  "traditional arabic": [1.3333,0.5,0],
  "aharoni": [0.75,0.25,0],
  "david": [0.75,0.25,0],
  "frankruehl": [0.75,0.25,0],
  "fangsong": [0.8333,0.1667,0],
  "simhei": [0.8333,0.1667,0],
  "kaiti": [0.8333,0.1667,0],
  "browallia new": [0.8333,0.4167,0],
  "lucida sans unicode": [1.0833,0.25,0],
  "arial black": [1.0833,0.3333,0],
  "calibri": [0.9167,0.25,0],
  "cambria": [0.9167,0.25,0],
  "cambria math": [3.0833,2.5,0],
  "candara": [0.9167,0.25,0],
  "comic sans ms": [1.0833,0.3333,0],
  "consolas": [0.9167,0.25,0],
  "constantia": [0.9167,0.25,0],
  "corbel": [0.9167,0.25,0],
  "franklin gothic medium": [1,0.3333,0],
  "gabriola": [1.1667,0.6667,0],
  "georgia": [1,0.25,0],
  "palatino linotype": [1.0833,0.3333,0],
  "segoe print": [1.25,0.5,0],
  "trebuchet ms": [1.0833,0.4167,0],
  "verdana": [1,0.1667,0],
  "webdings": [1.0833,0.5,0],
  "lucida bright": [0.9167,0.25,0],
  "lucida sans": [0.9167,0.25,0],
  "lucida sans typewriter": [0.9167,0.25,0],
  "gentium basic": [0.8333,0.25,0],
  "dejavu serif condensed": [0.9167,0.25,0],
  "arimo": [1,0.25,0],
  "dejavu sans condensed": [0.9167,0.25,0],
  "dejavu sans": [0.9167,0.25,0],
  "dejavu sans light": [0.9167,0.25,0],
  "opensymbol": [0.8333,0.1667,0],
  "gentium book basic": [0.8333,0.25,0],
  "dejavu sans mono": [0.9167,0.25,0],
  "dejavu serif": [0.9167,0.25,0],
  "calibri light": [0.9167,0.25,0],
};

var DEVICE_FONT_METRICS_MAC = {
  "al bayan plain": [1,0.5,0],
  "al bayan bold": [1,0.5833,0],
  "american typewriter": [0.9167,0.25,0],
  "american typewriter bold": [0.9167,0.25,0],
  "american typewriter condensed": [0.9167,0.25,0],
  "american typewriter condensed bold": [0.9167,0.25,0],
  "american typewriter condensed light": [0.8333,0.25,0],
  "american typewriter light": [0.9167,0.25,0],
  "andale mono": [0.9167,0.25,0],
  "apple symbols": [0.6667,0.25,0],
  "arial bold italic": [0.9167,0.25,0],
  "arial bold": [0.9167,0.25,0],
  "arial italic": [0.9167,0.25,0],
  "arial hebrew": [0.75,0.3333,0],
  "arial hebrew bold": [0.75,0.3333,0],
  "arial": [0.9167,0.25,0],
  "arial narrow": [0.9167,0.25,0],
  "arial narrow bold": [0.9167,0.25,0],
  "arial narrow bold italic": [0.9167,0.25,0],
  "arial narrow italic": [0.9167,0.25,0],
  "arial rounded mt bold": [0.9167,0.25,0],
  "arial unicode ms": [1.0833,0.25,0],
  "avenir black": [1,0.3333,0],
  "avenir black oblique": [1,0.3333,0],
  "avenir book": [1,0.3333,0],
  "avenir book oblique": [1,0.3333,0],
  "avenir heavy": [1,0.3333,0],
  "avenir heavy oblique": [1,0.3333,0],
  "avenir light": [1,0.3333,0],
  "avenir light oblique": [1,0.3333,0],
  "avenir medium": [1,0.3333,0],
  "avenir medium oblique": [1,0.3333,0],
  "avenir oblique": [1,0.3333,0],
  "avenir roman": [1,0.3333,0],
  "avenir next bold": [1,0.3333,0],
  "avenir next bold italic": [1,0.3333,0],
  "avenir next demi bold": [1,0.3333,0],
  "avenir next demi bold italic": [1,0.3333,0],
  "avenir next heavy": [1,0.3333,0],
  "avenir next heavy italic": [1,0.3333,0],
  "avenir next italic": [1,0.3333,0],
  "avenir next medium": [1,0.3333,0],
  "avenir next medium italic": [1,0.3333,0],
  "avenir next regular": [1,0.3333,0],
  "avenir next ultra light": [1,0.3333,0],
  "avenir next ultra light italic": [1,0.3333,0],
  "avenir next condensed bold": [1,0.3333,0],
  "avenir next condensed bold italic": [1,0.3333,0],
  "avenir next condensed demi bold": [1,0.3333,0],
  "avenir next condensed demi bold italic": [1,0.3333,0],
  "avenir next condensed heavy": [1,0.3333,0],
  "avenir next condensed heavy italic": [1,0.3333,0],
  "avenir next condensed italic": [1,0.3333,0],
  "avenir next condensed medium": [1,0.3333,0],
  "avenir next condensed medium italic": [1,0.3333,0],
  "avenir next condensed regular": [1,0.3333,0],
  "avenir next condensed ultra light": [1,0.3333,0],
  "avenir next condensed ultra light italic": [1,0.3333,0],
  "ayuthaya": [1.0833,0.3333,0],
  "baghdad": [0.9167,0.4167,0],
  "bangla mn": [0.9167,0.6667,0],
  "bangla mn bold": [0.9167,0.6667,0],
  "bangla sangam mn": [0.9167,0.4167,0],
  "bangla sangam mn bold": [0.9167,0.4167,0],
  "baskerville": [0.9167,0.25,0],
  "baskerville bold": [0.9167,0.25,0],
  "baskerville bold italic": [0.9167,0.25,0],
  "baskerville italic": [0.9167,0.25,0],
  "baskerville semibold": [0.9167,0.25,0],
  "baskerville semibold italic": [0.9167,0.25,0],
  "big caslon medium": [0.9167,0.25,0],
  "brush script mt italic": [0.9167,0.3333,0],
  "chalkboard": [1,0.25,0],
  "chalkboard bold": [1,0.25,0],
  "chalkboard se bold": [1.1667,0.25,0],
  "chalkboard se light": [1.1667,0.25,0],
  "chalkboard se regular": [1.1667,0.25,0],
  "chalkduster": [1,0.25,0],
  "charcoal cy": [1,0.25,0],
  "cochin": [0.9167,0.25,0],
  "cochin bold": [0.9167,0.25,0],
  "cochin bold italic": [0.9167,0.25,0],
  "cochin italic": [0.9167,0.25,0],
  "comic sans ms": [1.0833,0.25,0],
  "comic sans ms bold": [1.0833,0.25,0],
  "copperplate": [0.75,0.25,0],
  "copperplate bold": [0.75,0.25,0],
  "copperplate light": [0.75,0.25,0],
  "corsiva hebrew": [0.6667,0.3333,0],
  "corsiva hebrew bold": [0.6667,0.3333,0],
  "courier": [0.75,0.25,0],
  "courier bold": [0.75,0.25,0],
  "courier bold oblique": [0.75,0.25,0],
  "courier oblique": [0.75,0.25,0],
  "courier new bold italic": [0.8333,0.3333,0],
  "courier new bold": [0.8333,0.3333,0],
  "courier new italic": [0.8333,0.3333,0],
  "courier new": [0.8333,0.3333,0],
  "biaukai": [0.8333,0.1667,0],
  "damascus": [0.5833,0.4167,0],
  "damascus bold": [0.5833,0.4167,0],
  "decotype naskh": [1.1667,0.6667,0],
  "devanagari mt": [0.9167,0.6667,0],
  "devanagari mt bold": [0.9167,0.6667,0],
  "devanagari sangam mn": [0.9167,0.4167,0],
  "devanagari sangam mn bold": [0.9167,0.4167,0],
  "didot": [0.9167,0.3333,0],
  "didot bold": [1,0.3333,0],
  "didot italic": [0.9167,0.25,0],
  "euphemia ucas": [1.0833,0.25,0],
  "euphemia ucas bold": [1.0833,0.25,0],
  "euphemia ucas italic": [1.0833,0.25,0],
  "futura condensed extrabold": [1,0.25,0],
  "futura condensed medium": [1,0.25,0],
  "futura medium": [1,0.25,0],
  "futura medium italic": [1,0.25,0],
  "gb18030 bitmap": [1,0.6667,0],
  "geeza pro": [0.9167,0.3333,0],
  "geeza pro bold": [0.9167,0.3333,0],
  "geneva": [1,0.25,0],
  "geneva cy": [1,0.25,0],
  "georgia": [0.9167,0.25,0],
  "georgia bold": [0.9167,0.25,0],
  "georgia bold italic": [0.9167,0.25,0],
  "georgia italic": [0.9167,0.25,0],
  "gill sans": [0.9167,0.25,0],
  "gill sans bold": [0.9167,0.25,0],
  "gill sans bold italic": [0.9167,0.25,0],
  "gill sans italic": [0.9167,0.25,0],
  "gill sans light": [0.9167,0.25,0],
  "gill sans light italic": [0.9167,0.25,0],
  "gujarati mt": [0.9167,0.6667,0],
  "gujarati mt bold": [0.9167,0.6667,0],
  "gujarati sangam mn": [0.8333,0.4167,0],
  "gujarati sangam mn bold": [0.8333,0.4167,0],
  "gurmukhi mn": [0.9167,0.25,0],
  "gurmukhi mn bold": [0.9167,0.25,0],
  "gurmukhi sangam mn": [0.9167,0.3333,0],
  "gurmukhi sangam mn bold": [0.9167,0.3333,0],
  "helvetica": [0.75,0.25,0],
  "helvetica bold": [0.75,0.25,0],
  "helvetica bold oblique": [0.75,0.25,0],
  "helvetica light": [0.75,0.25,0],
  "helvetica light oblique": [0.75,0.25,0],
  "helvetica oblique": [0.75,0.25,0],
  "helvetica neue": [0.9167,0.25,0],
  "helvetica neue bold": [1,0.25,0],
  "helvetica neue bold italic": [1,0.25,0],
  "helvetica neue condensed black": [1,0.25,0],
  "helvetica neue condensed bold": [1,0.25,0],
  "helvetica neue italic": [0.9167,0.25,0],
  "helvetica neue light": [1,0.25,0],
  "helvetica neue light italic": [0.9167,0.25,0],
  "helvetica neue medium": [1,0.25,0],
  "helvetica neue ultralight": [0.9167,0.25,0],
  "helvetica neue ultralight italic": [0.9167,0.25,0],
  "herculanum": [0.8333,0.1667,0],
  "hiragino kaku gothic pro w3": [0.9167,0.0833,0],
  "hiragino kaku gothic pro w6": [0.9167,0.0833,0],
  "hiragino kaku gothic pron w3": [0.9167,0.0833,0],
  "hiragino kaku gothic pron w6": [0.9167,0.0833,0],
  "hiragino kaku gothic std w8": [0.9167,0.0833,0],
  "hiragino kaku gothic stdn w8": [0.9167,0.0833,0],
  "hiragino maru gothic pro w4": [0.9167,0.0833,0],
  "hiragino maru gothic pron w4": [0.9167,0.0833,0],
  "hiragino mincho pro w3": [0.9167,0.0833,0],
  "hiragino mincho pro w6": [0.9167,0.0833,0],
  "hiragino mincho pron w3": [0.9167,0.0833,0],
  "hiragino mincho pron w6": [0.9167,0.0833,0],
  "hiragino sans gb w3": [0.9167,0.0833,0],
  "hiragino sans gb w6": [0.9167,0.0833,0],
  "hoefler text black": [0.75,0.25,0],
  "hoefler text black italic": [0.75,0.25,0],
  "hoefler text italic": [0.75,0.25,0],
  "hoefler text ornaments": [0.8333,0.1667,0],
  "hoefler text": [0.75,0.25,0],
  "impact": [1,0.25,0],
  "inaimathi": [0.8333,0.4167,0],
  "headlinea regular": [0.8333,0.1667,0],
  "pilgi regular": [0.8333,0.25,0],
  "gungseo regular": [0.8333,0.25,0],
  "pcmyungjo regular": [0.8333,0.25,0],
  "kailasa regular": [1.0833,0.5833,0],
  "kannada mn": [0.9167,0.25,0],
  "kannada mn bold": [0.9167,0.25,0],
  "kannada sangam mn": [1,0.5833,0],
  "kannada sangam mn bold": [1,0.5833,0],
  "kefa bold": [0.9167,0.25,0],
  "kefa regular": [0.9167,0.25,0],
  "khmer mn": [1,0.6667,0],
  "khmer mn bold": [1,0.6667,0],
  "khmer sangam mn": [1.0833,0.6667,0],
  "kokonor regular": [1.0833,0.5833,0],
  "krungthep": [1,0.25,0],
  "kufistandardgk": [0.9167,0.5,0],
  "lao mn": [0.9167,0.4167,0],
  "lao mn bold": [0.9167,0.4167,0],
  "lao sangam mn": [1,0.3333,0],
  "apple ligothic medium": [0.8333,0.1667,0],
  "lihei pro": [0.8333,0.1667,0],
  "lisong pro": [0.8333,0.1667,0],
  "lucida grande": [1,0.25,0],
  "lucida grande bold": [1,0.25,0],
  "malayalam mn": [1,0.4167,0],
  "malayalam mn bold": [1,0.4167,0],
  "malayalam sangam mn": [0.8333,0.4167,0],
  "malayalam sangam mn bold": [0.8333,0.4167,0],
  "marion bold": [0.6667,0.3333,0],
  "marion italic": [0.6667,0.3333,0],
  "marion regular": [0.6667,0.3333,0],
  "marker felt thin": [0.8333,0.25,0],
  "marker felt wide": [0.9167,0.25,0],
  "menlo bold": [0.9167,0.25,0],
  "menlo bold italic": [0.9167,0.25,0],
  "menlo italic": [0.9167,0.25,0],
  "menlo regular": [0.9167,0.25,0],
  "microsoft sans serif": [0.9167,0.25,0],
  "monaco": [1,0.25,0],
  "gurmukhi mt": [0.8333,0.4167,0],
  "mshtakan": [0.9167,0.25,0],
  "mshtakan bold": [0.9167,0.25,0],
  "mshtakan boldoblique": [0.9167,0.25,0],
  "mshtakan oblique": [0.9167,0.25,0],
  "myanmar mn": [1,0.4167,0],
  "myanmar mn bold": [1,0.4167,0],
  "myanmar sangam mn": [0.9167,0.4167,0],
  "nadeem": [0.9167,0.4167,0],
  "nanum brush script": [0.9167,0.25,0],
  "nanumgothic": [0.9167,0.25,0],
  "nanumgothic bold": [0.9167,0.25,0],
  "nanumgothic extrabold": [0.9167,0.25,0],
  "nanummyeongjo": [0.9167,0.25,0],
  "nanummyeongjo bold": [0.9167,0.25,0],
  "nanummyeongjo extrabold": [0.9167,0.25,0],
  "nanum pen script": [0.9167,0.25,0],
  "optima bold": [0.9167,0.25,0],
  "optima bold italic": [0.9167,0.25,0],
  "optima extrablack": [1,0.25,0],
  "optima italic": [0.9167,0.25,0],
  "optima regular": [0.9167,0.25,0],
  "oriya mn": [0.9167,0.25,0],
  "oriya mn bold": [0.9167,0.25,0],
  "oriya sangam mn": [0.8333,0.4167,0],
  "oriya sangam mn bold": [0.8333,0.4167,0],
  "osaka": [1,0.25,0],
  "osaka-mono": [0.8333,0.1667,0],
  "palatino bold": [0.8333,0.25,0],
  "palatino bold italic": [0.8333,0.25,0],
  "palatino italic": [0.8333,0.25,0],
  "palatino": [0.8333,0.25,0],
  "papyrus": [0.9167,0.5833,0],
  "papyrus condensed": [0.9167,0.5833,0],
  "plantagenet cherokee": [0.6667,0.25,0],
  "raanana": [0.75,0.25,0],
  "raanana bold": [0.75,0.25,0],
  "hei regular": [0.8333,0.1667,0],
  "kai regular": [0.8333,0.1667,0],
  "stfangsong": [0.8333,0.1667,0],
  "stheiti": [0.8333,0.1667,0],
  "heiti sc light": [0.8333,0.1667,0],
  "heiti sc medium": [0.8333,0.1667,0],
  "heiti tc light": [0.8333,0.1667,0],
  "heiti tc medium": [0.8333,0.1667,0],
  "stkaiti": [0.8333,0.1667,0],
  "kaiti sc black": [1.0833,0.3333,0],
  "kaiti sc bold": [1.0833,0.3333,0],
  "kaiti sc regular": [1.0833,0.3333,0],
  "stsong": [0.8333,0.1667,0],
  "songti sc black": [1.0833,0.3333,0],
  "songti sc bold": [1.0833,0.3333,0],
  "songti sc light": [1.0833,0.3333,0],
  "songti sc regular": [1.0833,0.3333,0],
  "stxihei": [0.8333,0.1667,0],
  "sathu": [0.9167,0.3333,0],
  "silom": [1,0.3333,0],
  "sinhala mn": [0.9167,0.25,0],
  "sinhala mn bold": [0.9167,0.25,0],
  "sinhala sangam mn": [1.1667,0.3333,0],
  "sinhala sangam mn bold": [1.1667,0.3333,0],
  "skia regular": [0.75,0.25,0],
  "symbol": [0.6667,0.3333,0],
  "tahoma negreta": [1,0.1667,0],
  "tamil mn": [0.9167,0.25,0],
  "tamil mn bold": [0.9167,0.25,0],
  "tamil sangam mn": [0.75,0.25,0],
  "tamil sangam mn bold": [0.75,0.25,0],
  "telugu mn": [0.9167,0.25,0],
  "telugu mn bold": [0.9167,0.25,0],
  "telugu sangam mn": [1,0.5833,0],
  "telugu sangam mn bold": [1,0.5833,0],
  "thonburi": [1.0833,0.25,0],
  "thonburi bold": [1.0833,0.25,0],
  "times bold": [0.75,0.25,0],
  "times bold italic": [0.75,0.25,0],
  "times italic": [0.75,0.25,0],
  "times roman": [0.75,0.25,0],
  "times new roman bold italic": [0.9167,0.25,0],
  "times new roman bold": [0.9167,0.25,0],
  "times new roman italic": [0.9167,0.25,0],
  "times new roman": [0.9167,0.25,0],
  "trebuchet ms bold italic": [0.9167,0.25,0],
  "trebuchet ms": [0.9167,0.25,0],
  "trebuchet ms bold": [0.9167,0.25,0],
  "trebuchet ms italic": [0.9167,0.25,0],
  "verdana": [1,0.25,0],
  "verdana bold": [1,0.25,0],
  "verdana bold italic": [1,0.25,0],
  "verdana italic": [1,0.25,0],
  "webdings": [0.8333,0.1667,0],
  "wingdings 2": [0.8333,0.25,0],
  "wingdings 3": [0.9167,0.25,0],
  "yuppy sc regular": [1.0833,0.3333,0],
  "yuppy tc regular": [1.0833,0.3333,0],
  "zapf dingbats": [0.8333,0.1667,0],
  "zapfino": [1.9167,1.5,0]
};

var DEVICE_FONT_METRICS_LINUX = {
  "kacstfarsi": [1.0831,0.5215,0],
  "meera": [0.682,0.4413,0],
  "freemono": [0.8023,0.2006,0],
  "undotum": [1.0029,0.2808,0],
  "loma": [1.1634,0.4814,0],
  "century schoolbook l": [1.0029,0.3209,0],
  "kacsttitlel": [1.0831,0.5215,0],
  "undinaru": [1.0029,0.2407,0],
  "ungungseo": [1.0029,0.2808,0],
  "garuda": [1.3238,0.6017,0],
  "rekha": [1.1232,0.2808,0],
  "purisa": [1.1232,0.5215,0],
  "dejavu sans mono": [0.9628,0.2407,0],
  "vemana2000": [0.8825,0.8424,0],
  "kacstoffice": [1.0831,0.5215,0],
  "umpush": [1.2837,0.682,0],
  "opensymbol": [0.8023,0.2006,0],
  "sawasdee": [1.1232,0.4413,0],
  "urw palladio l": [1.0029,0.3209,0],
  "freeserif": [0.9227,0.3209,0],
  "kacstdigital": [1.0831,0.5215,0],
  "ubuntu condensed": [0.9628,0.2006,0],
  "unpilgi": [1.0029,0.4413,0],
  "mry_kacstqurn": [1.4442,0.7221,0],
  "urw gothic l": [1.0029,0.2407,0],
  "dingbats": [0.8424,0.1605,0],
  "urw chancery l": [1.0029,0.3209,0],
  "phetsarath ot": [1.0831,0.5215,0],
  "tlwg typist": [0.8825,0.4012,0],
  "kacstletter": [1.0831,0.5215,0],
  "utkal": [1.2035,0.6418,0],
  "dejavu sans light": [0.9628,0.2407,0],
  "norasi": [1.2436,0.5215,0],
  "dejavu serif condensed": [0.9628,0.2407,0],
  "kacstone": [1.2436,0.6418,0],
  "liberation sans narrow": [0.9628,0.2407,0],
  "symbol": [1.043,0.3209,0],
  "nanummyeongjo": [0.9227,0.2407,0],
  "untitled1": [0.682,0.5616,0],
  "lohit gujarati": [0.9628,0.4012,0],
  "liberation mono": [0.8424,0.3209,0],
  "kacstart": [1.0831,0.5215,0],
  "mallige": [1.0029,0.682,0],
  "bitstream charter": [1.0029,0.2407,0],
  "nanumgothic": [0.9227,0.2407,0],
  "liberation serif": [0.9227,0.2407,0],
  "dejavu sans condensed": [0.9628,0.2407,0],
  "ubuntu": [0.9628,0.2006,0],
  "courier 10 pitch": [0.8825,0.3209,0],
  "nimbus sans l": [0.9628,0.3209,0],
  "takaopgothic": [0.8825,0.2006,0],
  "wenquanyi micro hei mono": [0.9628,0.2407,0],
  "dejavu sans": [0.9628,0.2407,0],
  "kedage": [1.0029,0.682,0],
  "kinnari": [1.3238,0.5215,0],
  "tlwgmono": [0.8825,0.4012,0],
  "standard symbols l": [1.043,0.3209,0],
  "lohit punjabi": [1.2035,0.682,0],
  "nimbus mono l": [0.8424,0.2808,0],
  "rachana": [0.682,0.5616,0],
  "waree": [1.2436,0.4413,0],
  "kacstposter": [1.0831,0.5215,0],
  "khmer os": [1.2837,0.7622,0],
  "freesans": [1.0029,0.3209,0],
  "gargi": [0.9628,0.2808,0],
  "nimbus roman no9 l": [0.9628,0.3209,0],
  "dejavu serif": [0.9628,0.2407,0],
  "wenquanyi micro hei": [0.9628,0.2407,0],
  "ubuntu light": [0.9628,0.2006,0],
  "tlwgtypewriter": [0.9227,0.4012,0],
  "kacstpen": [1.0831,0.5215,0],
  "tlwg typo": [0.8825,0.4012,0],
  "mukti narrow": [1.2837,0.4413,0],
  "ubuntu mono": [0.8424,0.2006,0],
  "lohit bengali": [1.0029,0.4413,0],
  "liberation sans": [0.9227,0.2407,0],
  "unbatang": [1.0029,0.2808,0],
  "kacstdecorative": [1.1232,0.5215,0],
  "khmer os system": [1.2436,0.6017,0],
  "saab": [1.0029,0.682,0],
  "kacsttitle": [1.0831,0.5215,0],
  "mukti narrow bold": [1.2837,0.4413,0],
  "lohit hindi": [1.0029,0.5215,0],
  "kacstqurn": [1.0831,0.5215,0],
  "urw bookman l": [0.9628,0.2808,0],
  "kacstnaskh": [1.0831,0.5215,0],
  "kacstscreen": [1.0831,0.5215,0],
  "pothana2000": [0.8825,0.8424,0],
  "ungraphic": [1.0029,0.2808,0],
  "lohit tamil": [0.8825,0.361,0],
  "kacstbook": [1.0831,0.5215,0]
};

/*jshint proto:true */
DEVICE_FONT_METRICS_MAC.__proto__ = DEVICE_FONT_METRICS_WIN;
DEVICE_FONT_METRICS_LINUX.__proto__ = DEVICE_FONT_METRICS_MAC;

function makeFormatString(format) {
    // Order of the font arguments: <style> <weight> <size> <family>
  var boldItalic = '';
  if (format.italic) {
    boldItalic += 'italic';
  }
  if (format.bold) {
    boldItalic += ' bold';
  }
  // We don't use format.face because format.font contains the resolved name.
  return boldItalic + ' ' + format.size + 'px ' +
          (format.font.uniqueName || format.font.name);
}

var htmlParser = document.createElement('p');
// Used for measuring text runs, not for rendering
var measureCtx = document.createElement('canvas').getContext('2d');

function TextFieldContent(renderer, initialFormat) {
  this.renderer = renderer;
  this.defaultTextFormat = initialFormat;
  this.textWidth = 0;
  this.textHeight = 0;
  this.condenseWhite = false;
  this.wordWrap = false;
  this.multiline = false;
  this.textColor = null;

  this._text = '';
  this._htmlText = '';
  this._createTrunk();
  this._textRuns = null;
}

TextFieldContent.knownNodeTypes = {
  'BR': true,
  'LI': true,
  'P': true,
  'B': true,
  'I': true,
  'FONT': true,
  'TEXTFORMAT': true,
  'U': true,
  'A': true,
  'IMG': true,
  'SPAN': true
};
TextFieldContent.WRAP_OPPORTUNITIES = {
  " ": true,
  ".": true,
  "-": true,
  "\t": true
};
TextFieldContent.TextLine = function(y) {
  this.x = 0;
  this.width = 0;
  this.y = y;
  this.height = 0;
  this.leading = 0;
  this.runs = [];
  this.largestFormat = null;
};

TextFieldContent.prototype = {
  get text() {
    return this._text;
  },
  set text(val) {
    val = val + '';
    if (this._text === val) {
      return;
    }
    var lines = [];
    var lineOffset = 0;
    for (var index = 0; index < val.length;) {
      var char = val[index];
      if (char === '\r' || char === '\n') {
        lines.push(val.substring(lineOffset, index));
        lineOffset = index;
        if (char === '\r' && val[index + 1] === '\n') {
          index++;
        }
      }
      index++;
    }
    lines.push(val.substring(lineOffset, index));
    this._createTrunk();
    this._text = val;
    this._htmlText = val;
    this._tree.children[0].children[0] = {
      type: 'plain-text', lines: lines
    };
  },
  get htmlText() {
    return this._htmlText;
  },
  set htmlText(val) {
    if (this._htmlText === val) {
      return;
    }
    // Flash resets the bold and italic flags when an html value is set.
    this.defaultTextFormat.bold = false;
    this.defaultTextFormat.italic = false;
    this._parseHtml(val);
  },
  calculateMetrics: function(width, height, embedFonts) {
    var initialFormat = this.defaultTextFormat;
    this.renderer.resolveFont(initialFormat, embedFonts);
    this.lines = [];
    this._textRuns = [{type: 'f', format: initialFormat}];
    var width = Math.max(width - 4, 1);
    var height = Math.max(height - 4, 1);
    var state = {ctx: measureCtx, w: width, h: height, maxLineWidth: 0,
      formats: [initialFormat], currentFormat: initialFormat,
      line: new TextFieldContent.TextLine(0),
      wordWrap: this.wordWrap, combinedAlign: null,
      textColor: this.textColor, embedFonts: embedFonts};
    this._collectRuns(state, this._tree);
    this._finishLine(state, false);
    this.textWidth = state.maxLineWidth|0;
    this.textHeight = state.line.y|0;
    return state.combinedAlign;
  },
  /*
   * Parsing, in this context, actually means using the browser's html parser
   * and then removing any tags and attributes that mustn't be supported.
   *
   * After that, two things are generated: a plain-text version of the content,
   * and a tree of objects with types and attributes, representing all nodes.
   */
  _parseHtml: function(val) {
    htmlParser.innerHTML = val;
    var rootElement = htmlParser.childNodes.length !== 1 ?
                      htmlParser :
                      htmlParser.childNodes[0];
    // TODO: create the htmlText by serializing the converted tree
    this._text = '';
    this._htmlText = val;
    this._createTrunk();

    if (rootElement.nodeType === 3) {
      this._convertNode(rootElement, this._tree.children[0].children);
    }

    var initialNodeList = [rootElement];
    // If the outermost node is a <P>, merge its attributes and discard it
    var attributes;
    var format;
    var key;
    if (initialNodeList.length == 1 &&
        rootElement.localName.toUpperCase() == 'P')
    {
      attributes = this._extractAttributes(rootElement);
      format = this._tree.format;
      for (key in attributes) {
        format[key] = attributes[key];
      }
      initialNodeList = rootElement.childNodes;
      rootElement = rootElement.childNodes[0];
    }
    // If the now-outermost node is a <FONT>, do the same with it
    if (initialNodeList.length == 1 &&
        rootElement.localName.toUpperCase() == 'FONT')
    {
      attributes = this._extractAttributes(rootElement);
      format = this._tree.children[0].format;
      for (key in attributes) {
        format[key] = attributes[key];
      }
      initialNodeList = rootElement.childNodes;
    }
    this._convertNodeList(initialNodeList, this._tree.children[0].children);
  },
  _createTrunk: function() {
    var initialFormat = this.defaultTextFormat;
    // The outermost node is always a <P>, with an ALIGN attribute
    this._tree = {
      type: 'SPAN',
      format: {ALIGN: initialFormat.align},
      children: []
    };
    // The first child is then a <FONT>, with FACE, LETTERSPACING and KERNING
    var fontAttributes = {
      FACE: initialFormat.face,
      LETTERSPACING: initialFormat.letterSpacing,
      KERNING: initialFormat.kerning,
      LEADING: initialFormat.leading,
      COLOR: initialFormat.color
    };
    this._tree.children[0] = {
      type: 'FONT',
      format: fontAttributes,
      children: []
    };
  },
  _convertNode: function(input, destinationList) {
    // Ignore all comments, processing instructions and namespaced nodes.
    if (!(input.nodeType === 1 || input.nodeType === 3) || input.prefix) {
      return;
    }

    var node;

    if (input.nodeType === 3) {
      var text = input.textContent;
      node = { type: 'text', text: text, format: null, children: null };
      this._text += text;
      destinationList.push(node);
      return;
    }
    // For unknown node types, skip the node itself, but convert its children
    // and add them to the parent's child list.
    // If |multiline| is false, skip line-breaking nodes, too.
    var nodeType = input.localName.toUpperCase();
    if (!TextFieldContent.knownNodeTypes[nodeType] ||
        this.multiline === false && (nodeType === 'P' || nodeType === 'BR'))
    {
      // <sbr /> is a tag the Flash TextField supports for unknown reasons. It
      // apparently acts just like <br>. Unfortunately, the html parser doesn't
      // treat it as a self-closing tag, so the siblings following it are nested
      // after parsing. Hence, we un-nest them manually, and convert the tag to
      // <br>.
      if (nodeType === 'SBR') {
        destinationList.push({type: 'BR', text: null,
                              format: null, children: null});
      }
      this._convertNodeList(input.childNodes, destinationList);
      return;
    }
    node = {
      type: nodeType,
      text: null,
      format: this._extractAttributes(input),
      children: []
    };

    this._convertNodeList(input.childNodes, node.children);
    destinationList.push(node);
  },
  _convertNodeList: function(from, to) {
    var childCount = from.length;
    for (var i = 0; i < childCount; i++) {
      this._convertNode(from[i], to);
    }
  },
  /**
   * Creates an object containing all attributes with their localName as keys.
   * Ignores all namespaced attributes, as we don't need them for the
   * TextField's purposes.
   * TODO: Whitelist known attributes and throw out the rest.
   */
  _extractAttributes: function(node) {
    var attributesList = node.attributes;
    var attributesMap = {};
    for (var i = 0; i < attributesList.length; i++) {
      var attr = attributesList[i];
      if (attr.prefix) {
        continue;
      }
      attributesMap[attr.localName.toUpperCase()] = attr.value;
    }
    return attributesMap;
  },
  _collectRuns: function(state, node) {
    // for formatNodes, the format is popped after child processing
    var formatNode = false;
    // for blockNodes, the current line is finished after child processing
    var blockNode = false;
    switch (node.type) {
      case 'plain-text':
        var lines = node.lines;
        for (var i = 0; i < lines.length; i++) {
          this._addRunsForText(state, lines[i]);
          // The last line is finished by the enclosing block
          if (i < lines.length - 1) {
            this._finishLine(state, true);
          }
        }
        return;
      case 'text':
        this._addRunsForText(state, node.text);
        return;
      case 'BR':
        this._finishLine(state, true);
        return;
      case 'LI': /* TODO: draw bullet points. */ /* falls through */
      case 'P':
        this._finishLine(state, false);
        this._pushFormat(state, node);
        blockNode = true;
        break;

      case 'B': /* falls through */
      case 'I': /* falls through */
      case 'FONT': /* falls through */
      case 'TEXTFORMAT':
        this._pushFormat(state, node);
        formatNode = true;
        break;

      case 'U': /* TODO: implement <u>-support. */ /* falls through */
      case 'A': /* TODO: implement <a>-support. */ /* falls through */
      case 'IMG': /* TODO: implement <img>-support. */ /* falls through */
      case 'SPAN': /* TODO: implement what puny support for CSS Flash has. */
      /* falls through */
      default:
      // For all unknown nodes, we just emit their children.
    }
    for (var i = 0; i < node.children.length; i++) {
      var child = node.children[i];
      this._collectRuns(state, child);
    }
    if (formatNode) {
      this._popFormat(state);
    }
    if (blockNode) {
      this._finishLine(state, true);
    }
  },
  _addRunsForText: function(state, text) {
    if (!text) {
      return;
    }
    if (!state.wordWrap) {
      this._addTextRun(state, text, state.ctx.measureText(text).width);
      return;
    }
    while (text.length) {
      var width = state.ctx.measureText(text).width;
      var availableWidth = state.w - state.line.width;
      if (availableWidth <= 0) {
        this._finishLine(state, false);
        availableWidth = state.w - state.line.width;
      }
      assert(availableWidth > 0);
      if (width <= availableWidth) {
        this._addTextRun(state, text, width);
        break;
      } else {
        // Find offset close to where we can wrap by treating all chars as
        // same-width.
        var offset = (text.length / width * availableWidth)|0;
        // Expand to offset we know to be to the right of wrapping position
        while (state.ctx.measureText(text.substr(0, offset)).width <
               availableWidth && offset < text.length)
        {
          offset++;
        }
        // Find last wrapping-allowing character before that
        var wrapOffset = offset;
        while (wrapOffset > -1) {
          if (TextFieldContent.WRAP_OPPORTUNITIES[text[wrapOffset]]) {
            wrapOffset++;
            break;
          }
          wrapOffset--;
        }
        if (wrapOffset === -1) {
          if (state.line.width > 0) {
            this._finishLine(state, false);
            continue;
          }
          // No wrapping opportunity found, wrap mid-word
          while (state.ctx.measureText(text.substr(0, offset)).width >
                 availableWidth)
          {
            offset--;
          }
          if (offset === 0) {
            offset = 1;
          }
          wrapOffset = offset;
        }
        var runText = text.substr(0, wrapOffset);
        width = state.ctx.measureText(runText).width;
        this._addTextRun(state, runText, width);

        if (state.wordWrap) {
          this._finishLine(state, false);
        }

        text = text.substr(wrapOffset);
      }
    }
  },
  _addTextRun: function(state, text, width) {
    if (text.length === 0) {
      return;
    }
    // `y` is set by `_finishLine`
    var line = state.line;
    var format = state.currentFormat;
    var size = format.size;
    var run = {type: 't', text: text, x: line.width};
    this._textRuns.push(run);
    state.line.runs.push(run);
    line.width += width|0;
    // TODO: Implement Flash's absurd behavior for leading
    // Specifically, leading is only used if it is set by a <div> tag, or by
    // a <textformat> tag that is the first node in a new line. Whether that
    // line is caused by a <div> tag, <br> or \n is immaterial. I didn't check
    // what happens with word wrapping or setTextFormat, but you should.
    if (line.leading === 0 && format.leading > line.leading) {
      line.leading = format.leading;
    }
    if (!line.largestFormat || size > line.largestFormat.size) {
      line.largestFormat = format;
    }
  },
  // When ending a block or processing a <br> tag, we always want to insert
  // vertical space, even if the current line is empty. `forceNewline` does that
  // by advancing the next line's vertical position.
  _finishLine: function(state, forceNewline) {
    var line = state.line;
    if (line.runs.length === 0) {
      if (forceNewline) {
        var format = state.currentFormat;
        state.line.y += format.font.height * format.size +
                        format.leading|0;
      }
      return;
    }
    var runs = line.runs;
    var format = line.largestFormat;
    var baselinePos = line.y + format.font.ascent * format.size;
    for (var i = runs.length; i--;) {
      runs[i].y = baselinePos;
    }
    var align = (state.currentFormat.align || '').toLowerCase();
    if (state.combinedAlign === null) {
      state.combinedAlign = align;
    } else if (state.combinedAlign !== align) {
      state.combinedAlign = 'mixed';
    }
    // TODO: maybe support justified text somehow
    if (align === 'center' || align === 'right') {
      var offset = Math.max(state.w - line.width, 0);
      if (align === 'center') {
        offset >>= 1;
      }
      for (i = runs.length; i--;) {
        runs[i].x += offset;
      }
    }
    line.height = format.font.height * format.size + line.leading|0;
    state.maxLineWidth = Math.max(state.maxLineWidth, line.width);
    this.lines.push(line);
    state.line = new TextFieldContent.TextLine(line.y + line.height);
  },
  _pushFormat: function(state, node) {
    var attributes = node.format;
    var format = Object.create(state.formats[state.formats.length - 1]);
    var fontChanged = false;
    switch (node.type) {
      case 'P':
        if (attributes.ALIGN === format.align) {
          return;
        }
        format.align = attributes.ALIGN;
        break;
      case 'B':
        format.bold = true;
        fontChanged = true;
        break;
      case 'I':
        format.italic = true;
        fontChanged = true;
        break;
      case 'FONT':
        if (attributes.COLOR !== undefined) {
          format.color = attributes.COLOR;
        }
        if (attributes.FACE !== undefined) {
          format.face = attributes.FACE;
          fontChanged = true;
        }
        if (attributes.SIZE !== undefined) {
          format.size = parseFloat(attributes.SIZE);
        }
        if (attributes.LETTERSPACING !== undefined) {
          format.letterspacing = parseFloat(attributes.LETTERSPACING);
        }
        if (attributes.KERNING !== undefined) {
          // TODO: properly parse this in extractAttributes
          format.kerning = attributes.KERNING && true;
        }
      /* falls through */
      case 'TEXTFORMAT':
        // `textFormat` has, among others, the same attributes as `font`
        if (attributes.LEADING !== undefined) {
          format.leading = parseFloat(attributes.LEADING);
        }
        if (attributes.INDENT !== undefined) {
          // TODO: figure out if indents accumulate and how they apply to text
          // already in the line
          state.line.x = attributes.INDENT;
          state.line.width += attributes.INDENT|0;
        }
        // TODO: support leftMargin, rightMargin & blockIndent
        // TODO: support tabStops
        break;
      default:
        warning('Unknown format node encountered: ' + node.type); return;
    }
    if (state.textColor !== null) {
      format.color = state.textColor;
    }
    if (fontChanged) {
      this.renderer.resolveFont(format, state.embedFonts);
    }
    format.str = makeFormatString(format);
    state.formats.push(format);
    this._textRuns.push({type: 'f', format: format});
    state.currentFormat = format;
    state.ctx.font = format.str;
  },
  _popFormat: function(state) {
    state.formats.pop();
    var format = state.currentFormat = state.formats[state.formats.length - 1];
    this._textRuns.push({type: 'f', format: format});
    state.ctx.font = state.str;
  }
};
