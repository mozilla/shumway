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
/*global Kanvas, describeProperty, ShapePath, factoryCtx, rgbIntAlphaToStr */

var GraphicsDefinition = (function () {
  var GRAPHICS_PATH_COMMAND_MOVE_TO        = 1;
  var GRAPHICS_PATH_COMMAND_LINE_TO        = 2;
  var GRAPHICS_PATH_COMMAND_CURVE_TO       = 3;
  var GRAPHICS_PATH_COMMAND_WIDE_MOVE_TO   = 4;
  var GRAPHICS_PATH_COMMAND_WIDE_LINE_TO   = 5;
  var GRAPHICS_PATH_COMMAND_CUBIC_CURVE_TO = 6;
  // The following commands aren't available in the Flash Player. We use them as
  // shortcuts for complex operations that exist natively on Canvas.
  var SHAPE_ARC_TO         = 7;
  var SHAPE_CIRCLE         = 8;
  var SHAPE_ELLIPSE        = 9;

  var GRAPHICS_PATH_WINDING_EVEN_ODD       = 'evenOdd';
  var GRAPHICS_PATH_WINDING_NON_ZERO       = 'nonZero';

  function morph(start, end, ratio) {
    return start + (end - start) * ratio;
  }

  var def = {
    __class__: 'flash.display.Graphics',

    initialize: function () {
      this._bitmap = null;
      this._fillStyle = null;
      this._mx = null;
      this._my = null;
      this._scale = 1;
      this._lineStyle = null;
      this._paths = [];
      this._parent = 0;
    },

    _invalidate: function () {
      if (this._parent._stage) {
        this._parent._stage._invalidateOnStage(this._parent);
      }
      this._parent._bounds = null;
    },

    _drawPathObject: function (path) {
      if (path.__class__ === 'flash.display.GraphicsPath')
        this.drawPath(path.commands, path.data, path.winding);
      else if (path.__class__ === 'flash.display.GraphicsTrianglePath')
        this.drawTriangles(path.vertices, path.indices, path.uvtData, path.culling);
    },

    get _currentPath() {
      var path = new ShapePath();
      if (this._mx !== null || this._my !== null) {
        path.moveTo(this._mx, this._my);
        this._mx = this._my = null;
      }
      path.fillStyle = this._fillStyle;
      path.lineStyle = this._lineStyle;
      this._paths.push(path);
      // Cache as an own property.
      Object.defineProperty(this, '_currentPath', { value: path, configurable: true });
      return path;
    },

    draw: function(ctx, clip, ratio) {
      var scale = this._scale;
      if (scale !== 1) {
        ctx.scale(scale, scale);
      }

      var subpaths = this._paths;
      for (var i = 0, o = subpaths.length; i < o; i++) {
        var path = subpaths[i];
        if (clip && !path.fillStyle) {
          continue;
        }
        ctx.beginPath();
        var commands = path.commands;
        var data = path.data;
        var morphData = path.morphData;
        var formOpen = false;
        var formOpenX = 0;
        var formOpenY = 0;
        for (var j = 0, k = 0; j < commands.length; j++) {
          if (!path.isMorph) {
            switch (commands[j]) {
              case GRAPHICS_PATH_COMMAND_MOVE_TO:
                formOpen = true;
                formOpenX = data[k++];
                formOpenY = data[k++];
                ctx.moveTo(formOpenX, formOpenY);
                break;
              case GRAPHICS_PATH_COMMAND_WIDE_MOVE_TO:
                ctx.moveTo(data[k++], data[k++]);
                k += 2;
                break;
              case GRAPHICS_PATH_COMMAND_LINE_TO:
                ctx.lineTo(data[k++], data[k++]);
                break;
              case GRAPHICS_PATH_COMMAND_WIDE_LINE_TO:
                ctx.lineTo(data[k++], data[k++]);
                k += 2;
                break;
              case GRAPHICS_PATH_COMMAND_CURVE_TO:
                ctx.quadraticCurveTo(data[k++], data[k++],
                                     data[k++], data[k++]);
                break;
              case GRAPHICS_PATH_COMMAND_CUBIC_CURVE_TO:
                ctx.bezierCurveTo(data[k++], data[k++], data[k++], data[k++],
                                  data[k++], data[k++]);
                break;
              case SHAPE_ARC_TO:
                ctx.arcTo(data[k++], data[k++], data[k++], data[k++],
                          data[k++]);
                break;
              case SHAPE_CIRCLE:
                if (formOpen) {
                  ctx.lineTo(formOpenX, formOpenY);
                  formOpen = false;
                }
                ctx.moveTo(data[k] + data[k+2], data[k+1]);
                ctx.arc(data[k++], data[k++], data[k++], 0, Math.PI * 2, false);
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
                ctx.moveTo(x + radius, y);
                ctx.arc(x, y, radius, 0, Math.PI * 2, false);
                if (rX !== rY) {
                  ctx.restore();
                }
                break;
              default:
                console.warn("Unknown drawing command encountered: " +
                             commands[j]);
            }
          } else {
            switch (commands[j]) {
              case GRAPHICS_PATH_COMMAND_MOVE_TO:
                ctx.moveTo(morph(data[k], morphData[k++], ratio),
                           morph(data[k], morphData[k++], ratio));
                break;
              case GRAPHICS_PATH_COMMAND_LINE_TO:
                ctx.lineTo(morph(data[k], morphData[k++], ratio),
                           morph(data[k], morphData[k++], ratio));
                break;
              case GRAPHICS_PATH_COMMAND_CURVE_TO:
                ctx.quadraticCurveTo(morph(data[k], morphData[k++], ratio),
                                     morph(data[k], morphData[k++], ratio),
                                     morph(data[k], morphData[k++], ratio),
                                     morph(data[k], morphData[k++], ratio));
                break;
              default:
                console.warn("Drawing command not supported for morph " +
                             "shapes: " + commands[j]);
            }
          }
        }
        if (!clip) {
          var fillStyle = path.fillStyle;
          if (fillStyle) {
            ctx.fillStyle = fillStyle.style;
            var m = fillStyle.transform;
            if (m) {
              ctx.save();
              ctx.transform(m.a, m.b, m.c, m.d, m.e, m.f);
              ctx.fill();
              ctx.restore();
            } else {
              ctx.fill();
            }
          }
          var lineStyle = path.lineStyle;
          if (lineStyle) {
            ctx.lineWidth = lineStyle.width;
            ctx.strokeStyle = lineStyle.style;
            ctx.lineCap = lineStyle.lineCap;
            ctx.lineJoin = lineStyle.lineJoin;
            ctx.miterLimit = lineStyle.miterLimit;
            ctx.stroke();
          }
        }
        ctx.closePath();
      }
    },
    beginFill: function (color, alpha) {
      if (alpha === undefined)
        alpha = 1;

      delete this._currentPath;

      this._fillStyle = alpha ? {style:rgbIntAlphaToStr(color, alpha)} : null;
    },
    beginGradientFill: function(type, colors, alphas, ratios, matrix,
                                spreadMethod, interpolationMethod, focalPos)
    {
      this._fillStyle = createGradientStyle(type, colors, alphas, ratios,
                                            matrix, spreadMethod,
                                            interpolationMethod, focalPos);
    },
    beginBitmapFill: function (bitmap, matrix, repeat, smooth) {
      this._fillStyle = createPatternStyle(bitmap, matrix, repeat, smooth);
    },
    clear: function () {
      this._invalidate();

      delete this._currentPath;

      this._fillStyle = null;
      this._lineStyle = null;
      this._paths = [];
    },
    copyFrom: function (sourceGraphics) {
      notImplemented("Graphics#copyFrom");
    },
    cubicCurveTo: function (cp1x, cp1y, cp2x, cp2y, x, y) {
      this._invalidate();
      this._currentPath.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
    },
    curveTo: function (cpx, cpy, x, y) {
      this._invalidate();
      this._currentPath.curveTo(cpx, cpy, x, y);
    },
    drawCircle: function (x, y, radius) {
      this._invalidate();
      this._currentPath.circle(x, y, radius);
    },
    drawEllipse: function (x, y, width, height) {
      this._invalidate();
      var radiusX = width / 2;
      var radiusY = height / 2;
      this._currentPath.ellipse(x + radiusX, y + radiusY, radiusX, radiusY);
    },
    drawPath: function (commands, data, winding) {
      this._invalidate();
      delete this._currentPath;
      this._currentPath.fillRule = winding || GRAPHICS_PATH_WINDING_EVEN_ODD;
      this.currentPath.commands = commands;
      this.currentPath.data = data;
      this._revision++;
    },
    drawRect: function (x, y, w, h) {
      if (isNaN(w + h))
        throw ArgumentError();

      this._invalidate();
      this._currentPath.rect(x, y, w, h);
    },
    drawRoundRect: function (x, y, w, h, ellipseWidth, ellipseHeight) {
      if (isNaN(w + h + ellipseWidth) ||
          (ellipseHeight !== undefined && isNaN(ellipseHeight)))
      {
        throw ArgumentError();
      }
      this._invalidate();

      var radiusX = ellipseWidth / 2;
      var radiusY = ellipseHeight / 2;


      if (w === ellipseWidth && h === ellipseHeight) {
        if (ellipseWidth === ellipseHeight)
          this._currentPath.circle(x+radiusX, y+radiusY, radiusX);
        else
          this._currentPath.ellipse(x+radiusX, y+radiusY, radiusX, radiusY,
                                    0, 0, Math.PI * 2);
        return;
      }

      //    A-----B
      //  H         C
      //  G         D
      //    F-----E
      //
      // Through some testing, it has been discovered
      // tha the Flash player starts and stops the pen
      // at 'D', so we will, too.
      var x2 = x + w;
      var y2 = y + h;
      this._currentPath.moveTo(x2, y2 - radiusY);

      this._currentPath.arcTo(x2, y2, x2-radiusX, y2, radiusX, radiusY);
      this._currentPath.arcTo(x, y2, x, y2-radiusY, radiusX, radiusY);
      this._currentPath.arcTo(x, y, x+radiusX, y, radiusX, radiusY);
      this._currentPath.arcTo(x2, y, x2, y+radiusY, radiusX, radiusY);
      this._currentPath.lineTo(x2, y2-radiusY);
    },
    drawRoundRectComplex: function (x, y, w, h, topLeftRadius, topRightRadius,
                                    bottomLeftRadius, bottomRightRadius)
    {
      if (isNaN(w + h + topLeftRadius + topRightRadius + bottomLeftRadius +
                bottomRightRadius))
      {
        throw ArgumentError();
      }
      this._invalidate();

      var x2 = x + w;
      var y2 = y + h;
      this._currentPath.moveTo(x2, y2-bottomRightRadius);
      this._currentPath.arcTo(x2, y2, x2-bottomRightRadius, y2,
                              bottomRightRadius);
      this._currentPath.arcTo(x, y2, x, y2-bottomLeftRadius, bottomLeftRadius);
      this._currentPath.arcTo(x, y, x+topLeftRadius, y, topLeftRadius);
      this._currentPath.arcTo(x2, y, x2, y+topRightRadius, topRightRadius);
    },
    drawTriangles: function(vertices, indices, uvtData, culling) {
      notImplemented("Graphics#drawTriangles");
    },
    endFill: function () {
      delete this._currentPath;

      this._fillStyle = null;
    },
    lineBitmapStyle: function(bitmap, matrix, repeat, smooth) {
      this._lineStyle = createPatternStyle(bitmap, matrix, repeat, smooth);
    },
    lineGradientStyle: function(type, colors, alphas, ratios, matrix,
                                spreadMethod, interpolationMethod, focalPos)
    {
      this._lineStyle = createGradientStyle(type, colors, alphas, ratios,
                                            matrix, spreadMethod,
                                            interpolationMethod, focalPos);
    },

    lineStyle: function (width, color, alpha, pxHinting, scale, cap, joint,
                         mlimit)
    {
      delete this._currentPath;

      if (width) {
        if (alpha === undefined)
          alpha = 1;
        if (mlimit === undefined)
          mlimit = 3;

        this._lineStyle = {
          style: rgbIntAlphaToStr(color, alpha),
          lineCap: cap || 'round',
          lineJoin: cap || 'round',
          width: width,
          miterLimit: mlimit * 2
        };
      } else {
        this._lineStyle = null;
      }
    },
    lineTo: function (x, y) {
      this._invalidate();
      this._currentPath.lineTo(x, y);
    },
    moveTo: function (x, y) {
      this._currentPath.moveTo(x, y);
    },
    _getBounds: function (includeStroke) {
      var bbox;
      if (includeStroke && this.strokeBbox) {
        bbox = this.strokeBox;
      } else if (this.bbox) {
        bbox = this.bbox;
      }
      if (bbox) {
        return {
          x: bbox.xMin,
          y: bbox.yMin,
          width: bbox.xMax - bbox.xMin,
          height: bbox.yMax - bbox.yMin
        };
      }
      // TODO: support cached includeStroke bbox without strokeBox from shape.js
      if (this.bbox) {
        return this.bbox;
      }
      var subpaths = this._paths;
      var xMins = [], yMins = [], xMaxs = [], yMaxs = [];
      for (var i = 0, n = subpaths.length; i < n; i++) {
        var path = subpaths[i];
        var b = path.getBounds(true);
        if (b) {
          xMins.push(b.xMin);
          yMins.push(b.yMin);
          xMaxs.push(b.xMax);
          yMaxs.push(b.yMax);
        }

      }
      if (xMins.length === 0) {
        return 0;
      }

      // TODO: cache bbox
      var scale = this._scale;
      var xMin = Math.min.apply(Math, xMins) * scale;
      var yMin = Math.min.apply(Math, yMins) * scale;
      var xMax = Math.max.apply(Math, xMaxs) * scale;
      var yMax = Math.max.apply(Math, yMaxs) * scale;
      return { x: xMin, y: yMin, width: xMax - xMin, height: yMax - yMin};
    }
  };

  def.__glue__ = {
    native: {
      instance: {
        beginFill: def.beginFill,
        beginGradientFill: def.beginGradientFill,
        beginBitmapFill: def.beginBitmapFill,
        beginFillObject: def.beginFillObject,
        beginStrokeObject: def.beginStrokeObject,
        clear: def.clear,
        copyFrom: def.copyFrom,
        cubicCurveTo: def.cubicCurveTo,
        curveTo: def.curveTo,
        drawCircle: def.drawCircle,
        drawEllipse: def.drawEllipse,
        drawPath: def.drawPath,
        drawRect: def.drawRect,
        drawRoundRect: def.drawRoundRect,
        drawRoundRectComplex: def.drawRoundRectComplex,
        drawTriangles: def.drawTriangles,
        endFill: def.endFill,
        lineBitmapStyle: def.lineBitmapStyle,
        lineGradientStyle: def.lineGradientStyle,
        lineStyle: def.lineStyle,
        moveTo: def.moveTo,
        lineTo: def.lineTo
      }
    }
  };

  return def;
}).call(this);



function createPatternStyle(bitmap, matrix, repeat, smooth) {
  var repeatStyle = (repeat === false) ? 'no-repeat' : 'repeat';
  var pattern = factoryCtx.createPattern(bitmap._drawable, repeatStyle);

  var transform = matrix ?
                  { a: matrix.a, b: matrix.b, c: matrix.c,
                    d: matrix.d, e: matrix.tx, f: matrix.ty
                  } :
                  { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };

  return {style: pattern, transform: transform};
}

function createGradientStyle(type, colors, alphas, ratios, matrix, spreadMethod,
                             interpolationMethod, focalPos)
{
  var gradient;
  if (type === 'linear') {
    gradient = factoryCtx.createLinearGradient(-1, 0, 1, 0);
  } else if (type == 'radial') {
    gradient = factoryCtx.createRadialGradient((focalPos || 0), 0, 0, 0, 0, 1);
  } else {
    throw ArgumentError();
  }

  for (var i = 0, n = colors.length; i < n; i++) {
    gradient.addColorStop(ratios[i] / 255,
                          rgbIntAlphaToStr(colors[i], alphas[i]));
  }

  // NOTE firefox is really sensitive to very small scale when painting gradients
  var scale = 819.2;
  var transform = matrix ?
                  { a: scale * matrix.a, b: scale * matrix.b,
                    c: scale * matrix.c, d: scale * matrix.d,
                    e: matrix.tx, f: matrix.ty
                  } :
                  {a: scale, b: 0, c: 0, d: scale, e: 0, f: 0};

  return {style: gradient, transform: transform};
}

