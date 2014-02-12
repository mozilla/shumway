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

var timeline;
var hudTimeline;

function timelineEnter(name) {
  timeline && timeline.enter(name);
  hudTimeline && hudTimeline.enter(name);
}

function timelineLeave(name) {
  timeline && timeline.leave(name);
  hudTimeline && hudTimeline.leave(name);
}

function timelineWrapBroadcastMessage(domain, message) {
  timelineEnter(message);
  domain.broadcastMessage(message);
  timelineLeave(message);
}

function initializeHUD(stage, parentCanvas) {
  var canvas = document.createElement('canvas');
  var canvasContainer = document.createElement('div');
  canvasContainer.appendChild(canvas);
  canvasContainer.style.position = "absolute";
  canvasContainer.style.top = "0px";
  canvasContainer.style.left = "0px";
  canvasContainer.style.width = "100%";
  canvasContainer.style.height = "150px";
  canvasContainer.style.backgroundColor = "rgba(0, 0, 0, 0.4)";
  canvasContainer.style.pointerEvents = "none";
  parentCanvas.parentElement.appendChild(canvasContainer);
  hudTimeline = new Timeline(canvas);
  hudTimeline.setFrameRate(stage._frameRate);
  hudTimeline.refreshEvery(10);
}

var BlendModeNameMap = {
  "normal": 'normal',
  "multiply": 'multiply',
  "screen": 'screen',
  "lighten": 'lighten',
  "darken": 'darken',
  "difference": 'difference',
  "overlay": 'overlay',
  "hardlight": 'hard-light'
};

function getBlendModeName(blendMode) {
  // TODO:

  // These Flash blend modes have no canvas equivalent:
  // - blendModeClass.SUBTRACT
  // - blendModeClass.INVERT
  // - blendModeClass.SHADER
  // - blendModeClass.ADD

  // These blend modes are actually Porter-Duff compositing operators.
  // The backdrop is the nearest parent with blendMode set to LAYER.
  // When there is no LAYER parent, they are ignored (treated as NORMAL).
  // - blendModeClass.ALPHA (destination-in)
  // - blendModeClass.ERASE (destination-out)
  // - blendModeClass.LAYER [defines backdrop]

  return BlendModeNameMap[blendMode] || 'normal';
}

var head = document.head;
head.insertBefore(document.createElement('style'), head.firstChild);
var style = document.styleSheets[0];

// Used for creating gradients and patterns
var factoryCtx = !inWorker ?
                 document.createElement('canvas').getContext('2d') :
                 null;

function Renderer(target) {
  this._renderables = { };
  this._layers = { };
  this._promises = { };

  this._target = target;
  this._stage = null;

  var renderer = this;
  window.onmessage = function (e) {
    var data = e.data;
    if (data.command === 'render') {
      data = data.data;

      if (data instanceof ArrayBuffer) {
        var i32 = new Int32Array(data);
        var f32 = new Float32Array(data);
        var p = 0;
        var len = data.byteLength / 4;
        while (p < len) {
          switch (i32[p++]) {
          case 0:
            return;
          case 2:
            var n = i32[p++];
            var callbackId = i32[p++];
            var dependencies = i32.subarray(p, p += n);
            renderer.requireRenderables(dependencies, function () {
              postMessage({
                command: 'callback',
                data: callbackId
              }, '*');
            });
            break;
          case 3:
            var width = i32[p++];
            var height = i32[p++];
            var pixelRatio = renderer._target._contentsScaleFactor;
            renderer._stage = new Shumway.Layers.Stage(width, height, width * pixelRatio, height * pixelRatio);
            renderer._stage.transform = new Shumway.Geometry.Matrix.createIdentity().scale(2, 2);
            break;
          case 4:
            var isContainer = i32[p++];
            var parentId = i32[p++];
            var index = i32[p++];
            var layerId = i32[p++];
            var renderableId = i32[p++];

            var layer = renderer._layers[layerId];
            if (!layer) {
              if (isContainer) {
                layer = new Shumway.Layers.FrameContainer();
              } else {
                var renderable = renderer._renderables[renderableId];
                layer = new Shumway.Layers.Shape(renderable);
                layer.origin = new Shumway.Geometry.Point(renderable.rect.x,
                                                          renderable.rect.y);
              }
              renderer._layers[layerId] = layer;

              var parent = renderer._layers[parentId] || renderer._stage;
              parent.addChild(layer);
            }

            var a = f32[p++];
            var b = f32[p++];
            var c = f32[p++];
            var d = f32[p++];
            var tx = i32[p++];
            var ty = i32[p++];

            layer.transform = new Shumway.Geometry.Matrix(a, b, c, d, tx, ty);

            layer.alpha = f32[p++];

            var hasColorTransform = i32[p++];
            if (hasColorTransform) {
              layer.colorTransform =
                Shumway.Layers.ColorTransform.fromMultipliersAndOffsets(f32[p++],
                                                                        f32[p++],
                                                                        f32[p++],
                                                                        f32[p++],
                                                                        i32[p++],
                                                                        i32[p++],
                                                                        i32[p++],
                                                                        i32[p++]);
            }
            break;
          case 5:
            var layerId = i32[p++];
            var layer = renderer._layers[layerId];
            layer.parent.removeChild(layer);
            break;
          }
        }
      } else {
        renderer.defineRenderable(data.id, data.type, data);
      }
    } else if (data.command === 'callback') {
      renderer._target._callback(data.data);
    }
  };
}
Renderer.prototype.nextId = 0xffff;

Renderer.SHAPE = 1;
Renderer.GRADIENT = 2;
Renderer.PATTERN = 3;
Renderer.IMAGE = 4;
Renderer.FONT = 5;
Renderer.TEXT = 6;
Renderer.LABEL = 7;

Renderer.prototype.defineRenderable = function defineRenderable(id, type, symbol) {
  var renderer = this;
  var rendererable = null;
  var promise = new Promise(function (resolve) {
    switch (type) {
    case 'shape':
      rendererable = new RenderableShape(symbol, renderer, resolve);
      break;
    case 'gradient':
      rendererable = new RenderableGradient(symbol, renderer, resolve);
      break;
    case 'pattern':
      rendererable = new RenderablePattern(symbol, renderer, resolve);
      break;
    case 'image':
      rendererable = new RenderableBitmap(symbol, renderer, resolve);
      break;
    case 'font':
      rendererable = new RenderableFont(symbol, renderer, resolve);
      break;
    case 'text':
    case 'label':
      rendererable = new RenderableText(symbol, renderer, resolve);
      break;
    default:
      resolve();
    }
  });

  var dependencies = symbol.require;

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
    promiseQueue.push(this._promises[ids[i]]);
  }
  Promise.all(promiseQueue).then(callback);
};

function RenderableShape(symbol, renderer, resolve) {
  var bbox = symbol.strokeBbox || symbol.bbox;

  this.rect = new Shumway.Geometry.Rectangle(bbox.xMin / 20,
                                             bbox.yMin / 20,
                                             (bbox.xMax - bbox.xMin) / 20,
                                             (bbox.yMax - bbox.yMin) / 20);

  var paths = symbol.paths;

  for (var i = 0; i < paths.length; i++) {
    paths[i] = finishShapePath(paths[i], renderer);
  }

  this.commands = symbol.commands;
  this.properties = { renderer: renderer, paths: paths };

  resolve();
}
RenderableShape.prototype.getBounds = function getBounds() {
  return this.rect;
};
RenderableShape.prototype.render = function render(ctx) {
  ctx.save();
  ctx.translate(-this.rect.x, -this.rect.y);

  var paths = this.properties.paths;
  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];

    if (!path.fillStyle) {
      continue;
    }

    ctx.beginPath();
    var commands = path.commands;
    var data = path.data;
    var morphData = path.morphData;
    var formOpen = false;
    var formOpenX = 0;
    var formOpenY = 0;
    if (!path.isMorph) {
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
    } else {
      for (var j = 0, k = 0; j < commands.length; j++) {
        switch (commands[j]) {
          case SHAPE_MOVE_TO:
            ctx.moveTo(morph(data[k]/20, morphData[k++]/20, ratio),
                       morph(data[k]/20, morphData[k++]/20, ratio));
            break;
          case SHAPE_LINE_TO:
            ctx.lineTo(morph(data[k]/20, morphData[k++]/20, ratio),
                       morph(data[k]/20, morphData[k++]/20, ratio));
            break;
          case SHAPE_CURVE_TO:
            ctx.quadraticCurveTo(morph(data[k]/20, morphData[k++]/20, ratio),
                                 morph(data[k]/20, morphData[k++]/20, ratio),
                                 morph(data[k]/20, morphData[k++]/20, ratio),
                                 morph(data[k]/20, morphData[k++]/20, ratio));
            break;
          default:
            console.warn("Drawing command not supported for morph " +
                         "shapes: " + commands[j]);
        }
      }
    }
    // TODO: enable in-path line-style changes
    if (formOpen) {
      ctx.lineTo(formOpenX, formOpenY);
    }
    var fillStyle = path.fillStyle;
    if (fillStyle) {
      if (isNaN(fillStyle.style)) {
        ctx.fillStyle = fillStyle.style;
      } else {
        var renderable = this.properties.renderer.getRenderable(fillStyle.style);
        ctx.fillStyle = renderable.properties.fillStyle;
      }
      ctx.imageSmoothingEnabled = ctx.mozImageSmoothingEnabled =
                                  fillStyle.smooth;
      var m = fillStyle.transform;
      ctx.save();
      if (m) {
        ctx.transform(m.a, m.b, m.c, m.d, m.e/20, m.f/20);
      }
      ctx.fill();
      ctx.restore();
    }
    var lineStyle = path.lineStyle;
    // TODO: All widths except for `undefined` and `NaN` draw something
    if (lineStyle) {
      ctx.strokeStyle = lineStyle.style;
      ctx.save();
      // Flash's lines are always at least 1px/20twips
      ctx.lineWidth = Math.max(lineStyle.width/20, 1);
      ctx.lineCap = lineStyle.lineCap;
      ctx.lineJoin = lineStyle.lineJoin;
      ctx.miterLimit = lineStyle.miterLimit;
      ctx.stroke();
      ctx.restore();
    }
    ctx.closePath();
  }

  ctx.restore();
};

function RenderableGradient(symbol, renderer, resolve) {
  this.rect = new Shumway.Geometry.Rectangle(0, 0, 0, 0);

  var gradient;
  if (symbol.type === GRAPHICS_FILL_LINEAR_GRADIENT) {
    gradient = factoryCtx.createLinearGradient(-1, 0, 1, 0);
  } else {
    gradient = factoryCtx.createRadialGradient((symbol.focalPoint | 0) / 20,
                                               0, 0, 0, 0, 1);
  }

  var records = symbol.records;
  for (var i = 0; i < records.length; i++) {
    var record = records[i];
    var colorStr = rgbaObjToStr(record.color);
    gradient.addColorStop(record.ratio / 255, colorStr);
  }

  this.properties = { renderer: renderer, fillStyle: gradient };

  resolve();
}
RenderableGradient.prototype.getBounds = function getBounds() {
  return this.rect;
};
RenderableGradient.prototype.render = function render(ctx) {
  // TODO
};

function RenderablePattern(symbol, renderer, resolve) {
  var properties = { renderer: renderer, fillStyle: 'green' };

  renderer.requireRenderables([symbol.bitmapId], function () {
    var bitmap = renderer.getRenderable(symbol.bitmapId);
    var rect = bitmap.rect;
    this.rect = new Shumway.Geometry.Rectangle(rect.x, rect.y, rect.w, rect.h);

    var repeat = (symbol.type === GRAPHICS_FILL_REPEATING_BITMAP) ||
                 (symbol.type === GRAPHICS_FILL_NONSMOOTHED_REPEATING_BITMAP);
    var pattern = factoryCtx.createPattern(bitmap.properties.img,
                                           repeat ? 'repeat' : 'no-repeat');

    properties.fillStyle = pattern;

    resolve();
  });

  this.properties = properties;
}
RenderablePattern.prototype.getBounds = function getBounds() {
  return this.rect;
};
RenderablePattern.prototype.render = function render(ctx) {
  // TODO
};

function RenderableBitmap(symbol, renderer, resolve) {
  this.rect = new Shumway.Geometry.Rectangle(symbol.width / 20,
                                             symbol.height / 20);

  var img = new Image();
  var properties = { renderer: renderer, img: img };

  if (symbol.data) {
    img.onload = function () {
      if (symbol.mask) {
        // Write the image into new canvas and apply the mask.
        var maskCanvas = document.createElement('canvas');
        maskCanvas.width = symbol.width;
        maskCanvas.height = symbol.height;
        var maskContext = maskCanvas.getContext('2d');
        maskContext.drawImage(img, 0, 0);
        var maskImageData = maskContext.getImageData(0, 0, symbol.width, symbol.height);
        var maskImageDataBytes = maskImageData.data;
        var symbolMaskBytes = symbol.mask;
        var length = maskImageData.width * maskImageData.height;
        for (var i = 0, j = 3; i < length; i++, j += 4) {
          maskImageDataBytes[j] = symbolMaskBytes[i];
        }
        maskContext.putImageData(maskImageData, 0, 0);
        // Use the result canvas as renderable image
        properties.img = maskCanvas;
      }

      resolve();
    };
    img.src = URL.createObjectURL(symbol.data);
  } else {
    resolve();
  }

  this.properties = properties;
}
RenderableBitmap.prototype.getBounds = function getBounds() {
  return this.rect;
};
RenderableBitmap.prototype.render = function render(ctx) {
  //  if (!this._bitmapData) {
  //    return;
  //  }
  //  var scaledImage;
  //  ctx.save();
  //  if (this._pixelSnapping === 'auto' || this._pixelSnapping === 'always') {
  //    var transform = this._getConcatenatedTransform(null, true);
  //    var EPSILON = 0.001;
  //    var aInt = Math.abs(Math.round(transform.a));
  //    var dInt = Math.abs(Math.round(transform.d));
  //    var snapPixels;
  //    if (aInt >= 1 && aInt <= MAX_SNAP_DRAW_SCALE_TO_CACHE &&
  //        dInt >= 1 && dInt <= MAX_SNAP_DRAW_SCALE_TO_CACHE &&
  //        Math.abs(Math.abs(transform.a) / aInt - 1) <= EPSILON &&
  //        Math.abs(Math.abs(transform.d) / dInt - 1) <= EPSILON &&
  //        Math.abs(transform.b) <= EPSILON && Math.abs(transform.c) <= EPSILON) {
  //      if (aInt === 1 && dInt === 1) {
  //        snapPixels = true;
  //      } else {
  //        var sizeKey = aInt + 'x' + dInt;
  //        if (this._snapImageCache.size !== sizeKey) {
  //          this._snapImageCache.size = sizeKey;
  //          this._snapImageCache.hits = 0;
  //          this._snapImageCache.image = null;
  //        }
  //        if (++this._snapImageCache.hits === CACHE_SNAP_DRAW_AFTER) {
  //          this._cacheSnapImage(sizeKey, aInt, dInt);
  //        }
  //        scaledImage = this._snapImageCache.image;
  //        snapPixels = !!scaledImage;
  //      }
  //    } else {
  //      snapPixels = false;
  //    }
  //    if (snapPixels) {
  //      ctx.setTransform(transform.a < 0 ? -1 : 1, 0,
  //                       0, transform.d < 0 ? -1 : 1,
  //                       (transform.tx/20)|0, (transform.ty/20)|0);
  //    }
  //    // TODO this._pixelSnapping === 'always'; does it even make sense in other cases?
  //  }
  //
  //  colorTransform.setAlpha(ctx, true);
  //  ctx.imageSmoothingEnabled = ctx.mozImageSmoothingEnabled =
  //                              this._smoothing;
  //  ctx.drawImage(scaledImage || this._bitmapData._getDrawable(), 0, 0);
  //  ctx.imageSmoothingEnabled = ctx.mozImageSmoothingEnabled = false;
  //  ctx.restore();
  //  traceRenderer.value && frameWriter.writeLn("Bitmap.draw() snapping: " + this._pixelSnapping +
  //    ", dimensions: " + this._bitmapData._drawable.width + " x " + this._bitmapData._drawable.height);
  ctx.drawImage(this.img, 0, 0);
};

function RenderableFont(symbol, renderer, resolve) {
  var charset = fromCharCode.apply(null, symbol.codes);
  if (charset) {
    style.insertRule(
      '@font-face{' +
        'font-family:"' + symbol.uniqueName + '";' +
        'src:url(data:font/opentype;base64,' + btoa(symbol.data) + ')' +
        '}',
      style.cssRules.length
    );

    // HACK non-Gecko browsers need time to load fonts
    if (!/Mozilla\/5.0.*?rv:(\d+).*? Gecko/.test(window.navigator.userAgent)) {
      var testDiv = document.createElement('div');
      testDiv.setAttribute('style', 'position: absolute; top: 0; right: 0;' +
                                    'visibility: hidden; z-index: -500;' +
                                    'font-family:"' + symbol.uniqueName + '";');
      testDiv.textContent = 'font test';
      document.body.appendChild(testDiv);

      setTimeout(function () {
        resolve();
        document.body.removeChild(testDiv);
      }, 200);
    } else {
      resolve();
    }
  }
}
RenderableFont.prototype.getBounds = function getBounds() {
  // TODO
};
RenderableFont.prototype.render = function render(ctx) {
  // TODO
};

function RenderableText(symbol, renderer, resolve) {
  var bbox = symbol.bbox || symbol.tag.bbox;

  this.rect = new Shumway.Geometry.Rectangle(bbox.xMin / 20,
                                             bbox.yMin / 20,
                                             (bbox.xMax - bbox.xMin) / 20,
                                             (bbox.yMax - bbox.yMin) / 20);

  var properties = { renderer: renderer };

  if (symbol.type === 'label') {
    this.render = new Function('c', symbol.data);
  }

  this.properties = properties;

  resolve();
}
RenderableText.prototype.getBounds = function getBounds() {
  return this.rect;
};
RenderableText.prototype.render = function render(ctx) {
  //this.ensureDimensions();
  //var bounds = this._bbox;
  //var width = bounds.xMax / 20;
  //var height = bounds.yMax / 20;
  //if (width <= 0 || height <= 0) {
  //  return;
  //}

  //ctx.save();
  //ctx.beginPath();
  //ctx.rect(0, 0, width + 1, height + 1);
  //ctx.clip();
  //if (this._background) {
  //  colorTransform.setFillStyle(ctx, this._backgroundColorStr);
  //  ctx.fill();
  //}
  //if (this._border) {
  //  colorTransform.setStrokeStyle(ctx, this._borderColorStr);
  //  ctx.lineCap = "square";
  //  ctx.lineWidth = 1;
  //  ctx.strokeRect(0.5, 0.5, width|0, height|0);
  //}
  //ctx.closePath();

  //if (this._content.lines.length === 0) {
  //  ctx.restore();
  //  return;
  //}

  //ctx.translate(2, 2);
  //ctx.save();
  //colorTransform.setAlpha(ctx);
  //var runs = this._content._textRuns;
  //var offsetY = this._content.lines[this._scrollV - 1].y;
  //for (var i = 0; i < runs.length; i++) {
  //  var run = runs[i];
  //  if (run.type === 'f') {
  //    ctx.restore();
  //    ctx.font = run.format.str;
  //    // TODO: only apply color and alpha if it actually changed
  //    colorTransform.setFillStyle(ctx, run.format.color);
  //    ctx.save();
  //    colorTransform.setAlpha(ctx);
  //  } else {
  //    assert(run.type === 't', 'Invalid run type: ' + run.type);
  //    if (run.y < offsetY) {
  //      continue;
  //    }
  //    ctx.fillText(run.text, run.x - this._drawingOffsetH, run.y - offsetY);
  //  }
  //}
  //ctx.restore();
  //ctx.restore();
};

function initStyle(style, renderer) {
  if (style.type === undefined) {
    return;
  }

  if (style.type === GRAPHICS_FILL_SOLID) {
    // Solid fill styles are fully processed in shape.js's processStyle
    return;
  }

  var id = renderer.nextId++;

  switch (style.type) {
    case GRAPHICS_FILL_LINEAR_GRADIENT:
    case GRAPHICS_FILL_RADIAL_GRADIENT:
    case GRAPHICS_FILL_FOCAL_RADIAL_GRADIENT:
      renderer.defineRenderable(id, 'gradient', style);
      break;
    case GRAPHICS_FILL_REPEATING_BITMAP:
    case GRAPHICS_FILL_CLIPPED_BITMAP:
    case GRAPHICS_FILL_NONSMOOTHED_REPEATING_BITMAP:
    case GRAPHICS_FILL_NONSMOOTHED_CLIPPED_BITMAP:
      renderer.defineRenderable(id, 'pattern', style);
      break;
    default:
      fail('invalid fill style', 'shape');
  }

  style.style = id;
}

/**
 * For shapes parsed in a worker thread, we have to finish their
 * paths after receiving the data in the main thread.
 *
 * This entails creating proper instances for all the contained data types.
 */
function finishShapePath(path, renderer) {
  assert(!inWorker);

  if (path.fullyInitialized) {
    return path;
  }
  if (!(path instanceof ShapePath)) {
    var untypedPath = path;
    path = new ShapePath(path.fillStyle, path.lineStyle, 0, 0, path.isMorph);
    // See the comment in the ShapePath ctor for why we're recreating the
    // typed arrays here.
    path.commands = new Uint8Array(untypedPath.buffers[0]);
    path.data = new Int32Array(untypedPath.buffers[1]);
    if (untypedPath.isMorph) {
      path.morphData = new Int32Array(untypedPath.buffers[2]);
    }
    path.buffers = null;
  }
  path.fillStyle && initStyle(path.fillStyle, renderer);
  path.lineStyle && initStyle(path.lineStyle, renderer);
  path.fullyInitialized = true;
  return path;
}

function TextFieldContent(initialFormat) {
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
  this._htmlParser = document.createElement('p');

  // Used for measuring text runs, not for rendering
  this._measureCtx = document.createElement('canvas').getContext('2d');
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
  calculateMetrics: function(bounds, embedFonts) {
    var initialFormat = this.defaultTextFormat;
    FontDefinition.resolveFont(initialFormat, embedFonts);
    this.lines = [];
    this._textRuns = [{type: 'f', format: initialFormat}];
    var width = Math.max(bounds.xMax / 20 - 4, 1);
    var height = Math.max(bounds.yMax / 20 - 4, 1);
    var state = {ctx: this._measureCtx, w: width, h: height, maxLineWidth: 0,
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
    this._htmlParser.innerHTML = val;
    var rootElement = this._htmlParser.childNodes.length !== 1 ?
                      this._htmlParser :
                      this._htmlParser.childNodes[0];
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
        state.line.y += format.font._metrics.height * format.size +
                        format.leading|0;
      }
      return;
    }
    var runs = line.runs;
    var format = line.largestFormat;
    var baselinePos = line.y + format.font._metrics.ascent * format.size;
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
    line.height = format.font._metrics.height * format.size + line.leading|0;
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
      format.color = rgbIntAlphaToStr(state.textColor, 1);
    }
    if (fontChanged) {
      FontDefinition.resolveFont(format, state.embedFonts);
    }
    format.str = FontDefinition.makeFormatString(format);
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
