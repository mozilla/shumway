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
/*global describeProperty, ShapePath, factoryCtx, rgbIntAlphaToStr,
  buildLinearGradientFactory, buildRadialGradientFactory,
  SHAPE_MOVE_TO, SHAPE_LINE_TO, SHAPE_CURVE_TO, SHAPE_WIDE_MOVE_TO,
  SHAPE_WIDE_LINE_TO, SHAPE_CUBIC_CURVE_TO, SHAPE_CIRCLE, SHAPE_ELLIPSE,
  SHAPE_ROUND_CORNER, Errors, throwError, Counter */

var GraphicsDefinition = (function () {
  var GRAPHICS_PATH_WINDING_EVEN_ODD       = 'evenOdd';
  var GRAPHICS_PATH_WINDING_NON_ZERO       = 'nonZero';

  var def = {
    __class__: 'flash.display.Graphics',

    initialize: function () {
      this._paths = [];
      this.beginPath();
      this._bitmap = null;
      this._parent = 0;
      this.bbox = null;
      this.strokeBbox = null;
    },

    _invalidate: function () {
      this.bbox = null;
      this.strokeBbox = null;
      if (this._parent._stage) {
        this._parent._stage._invalidateOnStage(this._parent);
      }
      this._parent._invalidateBounds();
    },

    beginPath: function() {
      var oldPath = this._currentPath;
      if (oldPath &&
          (oldPath.commands.length === 0 || oldPath.commands.length === 1 &&
           oldPath.commands[0] === SHAPE_MOVE_TO))
      {
        return;
      }
      var path = this._currentPath = new ShapePath(null, null);
      this._paths.push(path);
      if (oldPath) {
        path.fillStyle = oldPath.fillStyle;
        path.lineStyle = oldPath.lineStyle;
        path.fillRule = oldPath.fillRule;
      }
    },

    _drawPathObject: function (path) {
      if (path.__class__ === 'flash.display.GraphicsPath')
        this.drawPath(path.commands, path.data, path.winding);
      else if (path.__class__ === 'flash.display.GraphicsTrianglePath')
        this.drawTriangles(path.vertices, path.indices, path.uvtData, path.culling);
    },

    draw: function(ctx, clip, ratio, colorTransform) {
      var paths = this._paths;
      for (var i = 0; i < paths.length; i++) {
        paths[i].draw(ctx, clip, ratio, colorTransform);
      }
    },
    beginFill: function (color, alpha) {
      if (alpha === undefined)
        alpha = 1;

      this.beginPath();
      this._currentPath.fillStyle = alpha ?
                                    {style:rgbIntAlphaToStr(color, alpha)} :
                                    null;
    },
    beginGradientFill: function(type, colors, alphas, ratios, matrix,
                                spreadMethod, interpolationMethod, focalPos)
    {
      var style = createGradientStyle(type, colors, alphas, ratios, matrix,
                                      spreadMethod, interpolationMethod,
                                      focalPos);
      this.beginPath();
      this._currentPath.fillStyle = style;
    },
    beginBitmapFill: function (bitmap, matrix, repeat, smooth) {
      this.beginPath();
      repeat = repeat !== false;
      this._currentPath.fillStyle = createPatternStyle(bitmap, matrix, repeat,
                                                       !!smooth);
    },
    clear: function () {
      this._invalidate();
      this._paths = [];
      this._currentPath = null;
      this.beginPath();
    },
    copyFrom: function (sourceGraphics) {
      notImplemented("Graphics#copyFrom");
    },
    cubicCurveTo: function (cp1x, cp1y, cp2x, cp2y, x, y) {
      this._invalidate();
      this._currentPath.cubicCurveTo((cp1x * 20)|0, (cp1y * 20)|0,
                                     (cp2x * 20)|0, (cp2y * 20)|0,
                                     (x * 20)|0, (y * 20)|0);
    },
    curveTo: function (cpx, cpy, x, y) {
      this._invalidate();
      this._currentPath.curveTo((cpx * 20)|0, (cpy * 20)|0,
                                (x * 20)|0, (y * 20)|0);
    },
    drawCircle: function (x, y, radius) {
      this._invalidate();
      this._currentPath.circle((x * 20)|0, (y * 20)|0, (radius * 20)|0);
    },
    drawEllipse: function (x, y, width, height) {
      this._invalidate();
      var radiusX = (width / 2 * 20)|0;
      var radiusY = (height / 2 * 20)|0;
      this._currentPath.ellipse((x * 20)|0 + radiusX, (y * 20)|0 + radiusY,
                                radiusX, radiusY);
    },
    drawPath: function (commands, data, winding) {
      this._invalidate();
      this.beginPath();
      this._currentPath.fillRule = winding || GRAPHICS_PATH_WINDING_EVEN_ODD;
      this._currentPath.commands = commands;
      // TODO: convert to twips
      this._currentPath.data = data;
    },
    drawRect: function (x, y, w, h) {
      if (isNaN(w + h))
        throwError('ArgumentError', Errors.InvalidParamError);

      this._invalidate();
      this._currentPath.rect((x * 20)|0, (y * 20)|0, (w * 20)|0, (h * 20)|0);
    },
    drawRoundRect: function (x, y, w, h, ellipseWidth, ellipseHeight) {
      if (isNaN(w + h + ellipseWidth) ||
          (ellipseHeight !== undefined && isNaN(ellipseHeight)))
      {
        throwError('ArgumentError', Errors.InvalidParamError);
      }
      this._invalidate();

      if (ellipseHeight === undefined) {
        ellipseHeight = ellipseWidth;
      }

      x = (x * 20)|0;
      y = (y * 20)|0;
      w = (w * 20)|0;
      h = (h * 20)|0;

      if (!ellipseHeight || !ellipseWidth) {
        this._currentPath.rect(x, y, w, h);
        return;
      }

      var radiusX = (ellipseWidth / 2 * 20)|0;
      var radiusY = (ellipseHeight / 2 * 20)|0;

      var hw = (w / 2)|0;
      var hh = (h / 2)|0;
      if (radiusX > hw) {
        radiusX = hw;
      }
      if (radiusY > hh) {
        radiusY = hh;
      }

      if (hw === radiusX && hh === radiusY) {
        if (radiusX === radiusY)
          this._currentPath.circle(x+radiusX, y+radiusY, radiusX);
        else
          this._currentPath.ellipse(x+radiusX, y+radiusY, radiusX, radiusY);
        return;
      }

      var right = x + w;
      var bottom = y + h;

      var xlw = x + radiusX;
      var xrw = right - radiusX;
      var ytw = y + radiusY;
      var ybw = bottom - radiusY;

      //    A-----B
      //  H         C
      //  G         D
      //    F-----E
      //
      // Through some testing, it has been discovered
      // tha the Flash player starts and stops the pen
      // at 'D', so we will, too.
      this._currentPath.moveTo(right, ybw);
      this._currentPath.curveTo(right, bottom, xrw, bottom);
      this._currentPath.lineTo(xlw, bottom);
      this._currentPath.curveTo(x, bottom, x, ybw);
      this._currentPath.lineTo(x, ytw);
      this._currentPath.curveTo(x, y, xlw, y);
      this._currentPath.lineTo(xrw, y);
      this._currentPath.curveTo(right, y, right, ytw);
      this._currentPath.lineTo(right, ybw);
    },
    drawRoundRectComplex: function (x, y, w, h, topLeftRadius, topRightRadius,
                                    bottomLeftRadius, bottomRightRadius)
    {
      if (isNaN(w + h + topLeftRadius + topRightRadius + bottomLeftRadius +
                bottomRightRadius))
      {
        throwError('ArgumentError', Errors.InvalidParamError);
      }
      this._invalidate();

      x = (x * 20)|0;
      y = (y * 20)|0;
      w = (w * 20)|0;
      h = (h * 20)|0;

      if (!topLeftRadius && !topRightRadius && !bottomLeftRadius && !bottomRightRadius) {
        this._currentPath.rect(x, y, w, h);
        return;
      }

      topLeftRadius = (topLeftRadius * 20)|0;
      topRightRadius = (topRightRadius * 20)|0;
      bottomLeftRadius = (bottomLeftRadius * 20)|0;
      bottomRightRadius = (bottomRightRadius * 20)|0;

      var right = x + w;
      var bottom = y + h;
      var xtl = x + topLeftRadius;

      this._currentPath.moveTo(right, bottom - bottomRightRadius);
      this._currentPath.curveTo(right, bottom, right - bottomRightRadius, bottom);
      this._currentPath.lineTo(x + bottomLeftRadius, bottom);
      this._currentPath.curveTo(x, bottom, x, bottom - bottomLeftRadius);
      this._currentPath.lineTo(x, y + topLeftRadius);
      this._currentPath.curveTo(x, y, xtl, y);
      this._currentPath.lineTo(right - topRightRadius, y);
      this._currentPath.curveTo(right, y, right, y + topRightRadius);
      this._currentPath.lineTo(right, bottom - bottomRightRadius);
    },
    drawTriangles: function(vertices, indices, uvtData, culling) {
      notImplemented("Graphics#drawTriangles");
    },
    endFill: function () {
      this.beginPath();
      this._currentPath.fillStyle = null;
    },
    lineBitmapStyle: function(bitmap, matrix, repeat, smooth) {
      this.beginPath();
      this._currentPath.lineStyle = createPatternStyle(bitmap, matrix, repeat,
                                                       smooth);
    },
    lineGradientStyle: function(type, colors, alphas, ratios, matrix,
                                spreadMethod, interpolationMethod, focalPos)
    {
      var style = createGradientStyle(type, colors, alphas, ratios, matrix,
                                      spreadMethod, interpolationMethod,
                                      focalPos);
      this.beginPath();
      this._currentPath.lineStyle = style;
    },

    lineStyle: function (width, color, alpha, pxHinting, scale, cap, joint,
                         mlimit)
    {
      this.beginPath();

      if (width) {
        if (alpha === undefined)
          alpha = 1;
        if (mlimit === undefined)
          mlimit = 3;

        this._currentPath.lineStyle = {
          style: rgbIntAlphaToStr(color, alpha),
          lineCap: cap || 'round',
          lineJoin: cap || 'round',
          width: (width * 20)|0,
          miterLimit: mlimit * 2
        };
      } else {
        this._currentPath.lineStyle = null;
      }
    },
    lineTo: function (x, y) {
      this._invalidate();
      this._currentPath.lineTo((x * 20)|0, (y * 20)|0);
    },
    moveTo: function (x, y) {
      this._currentPath.moveTo((x * 20)|0, (y * 20)|0);
    },
    _getBounds: function(includeStroke) {
      var bbox;
      if (includeStroke && this.strokeBbox) {
        bbox = this.strokeBox;
      } else if (this.bbox) {
        bbox = this.bbox;
      }
      if (bbox) {
        return bbox;
      }
      // TODO: support cached includeStroke bbox without strokeBox from shape.js
      if (this.bbox) {
        return this.bbox;
      }
      Counter.count("CACHE ME: Graphics._getBounds");
      var subpaths = this._paths;
      var xMins = [], yMins = [], xMaxs = [], yMaxs = [];
      for (var i = 0, n = subpaths.length; i < n; i++) {
        var path = subpaths[i];
        if (path.commands.length) {
          var b = path.getBounds(includeStroke);
          if (b) {
            xMins.push(b.xMin);
            yMins.push(b.yMin);
            xMaxs.push(b.xMax);
            yMaxs.push(b.yMax);
          }
        }
      }
      if (xMins.length === 0) {
        return 0;
      }

      bbox = {
        xMin : Math.min.apply(Math, xMins),
        yMin : Math.min.apply(Math, yMins),
        xMax : Math.max.apply(Math, xMaxs),
        yMax : Math.max.apply(Math, yMaxs)
      };
      if (includeStroke) {
        this.strokeBbox = bbox;
      } else {
        this.bbox = bbox;
      }
      return bbox;
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

  return {style: pattern, transform: transform, smooth: smooth};
}

function createGradientStyle(type, colors, alphas, ratios, matrix, spreadMethod,
                             interpolationMethod, focalPos)
{
  type === null || type === undefined &&
                   throwError('TypeError', Errors.NullPointerError, 'type');
  colors === null || type === undefined &&
                     throwError('TypeError', Errors.NullPointerError, 'colors');
  if (!(type === 'linear' || type === 'radial')) {
    throwError('ArgumentError', Errors.InvalidEnumError, 'type');
  }
  // TODO: add coercion checks for all args
  var colorStops = [];
  for (var i = 0, n = colors.length; i < n; i++) {
    colorStops.push({
      ratio: ratios[i] / 255,
      color: rgbIntAlphaToStr(colors[i], alphas[i])
    });
  }

  var gradientConstructor;
  if (type === 'linear') {
    gradientConstructor = buildLinearGradientFactory(colorStops);
  } else {
    gradientConstructor = buildRadialGradientFactory((focalPos || 0), colorStops);
  }

  // NOTE firefox is really sensitive to very small scale when painting gradients
  var scale = 819.2;
  var transform = matrix ?
                  { a: scale * matrix.a, b: scale * matrix.b,
                    c: scale * matrix.c, d: scale * matrix.d,
                    e: matrix.tx, f: matrix.ty
                  } :
                  {a: scale, b: 0, c: 0, d: scale, e: 0, f: 0};

  return {style: gradientConstructor, transform: transform};
}

