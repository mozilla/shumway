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
/*global Kanvas, describeProperty, ShapePath, factoryCtx, rgbIntAlphaToStr,
  SHAPE_MOVE_TO, SHAPE_LINE_TO, SHAPE_CURVE_TO, SHAPE_WIDE_MOVE_TO,
  SHAPE_WIDE_LINE_TO, SHAPE_CUBIC_CURVE_TO, SHAPE_CIRCLE, SHAPE_ELLIPSE,
  SHAPE_ROUND_CORNER */

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
    },

    _invalidate: function () {
      if (this._parent._stage) {
        this._parent._stage._invalidateOnStage(this._parent);
      }
      this._parent._bounds = null;
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
      this.beginPath();
      this._currentPath.fillStyle = createGradientStyle(type, colors, alphas,
                                                        ratios, matrix,
                                                        spreadMethod,
                                                        interpolationMethod,
                                                        focalPos);
    },
    beginBitmapFill: function (bitmap, matrix, repeat, smooth) {
      this.beginPath();
      this._currentPath.fillStyle = createPatternStyle(bitmap, matrix, repeat,
                                                       smooth);
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
        throw ArgumentError();

      this._invalidate();
      this._currentPath.rect((x * 20)|0, (y * 20)|0, (w * 20)|0, (h * 20)|0);
    },
    drawRoundRect: function (x, y, w, h, ellipseWidth, ellipseHeight) {
      if (isNaN(w + h + ellipseWidth) ||
          (ellipseHeight !== undefined && isNaN(ellipseHeight)))
      {
        throw ArgumentError();
      }
      this._invalidate();

      var x2 = ((x + w) * 20)|0;
      var y2 = ((y + h) * 20)|0;
      x = (x * 20)|0;
      y = (y * 20)|0;
      var radiusX = (ellipseWidth / 2 * 20)|0;
      var radiusY = (ellipseHeight / 2 * 20)|0;


      if (w === ellipseWidth && h === ellipseHeight) {
        if (ellipseWidth === ellipseHeight)
          this._currentPath.circle(x+radiusX, y+radiusY, radiusX);
        else
          this._currentPath.ellipse(x+radiusX, y+radiusY, radiusX, radiusY,
                                    0, Math.PI * 2);
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
      this._currentPath.moveTo(x2, y2 - radiusY);

      this._currentPath.drawRoundCorner(x2, y2, x2-radiusX, y2,
                                        radiusX, radiusY);
      this._currentPath.lineTo(x + radiusX, y2);
      this._currentPath.drawRoundCorner(x, y2, x, y2-radiusY, radiusX, radiusY);
      this._currentPath.lineTo(x, y + radiusY);
      this._currentPath.drawRoundCorner(x, y, x+radiusX, y, radiusX, radiusY);
      this._currentPath.lineTo(x2 - radiusX, y);
      this._currentPath.drawRoundCorner(x2, y, x2, y+radiusY, radiusX, radiusY);
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

      var x2 = ((x + w) * 20)|0;
      var y2 = ((y + h) * 20)|0;
      x = (x * 20)|0;
      y = (y * 20)|0;
      topLeftRadius = (topLeftRadius * 20)|0;
      topRightRadius = (topRightRadius * 20)|0;
      bottomLeftRadius = (bottomLeftRadius * 20)|0;
      bottomRightRadius = (bottomRightRadius * 20)|0;

      this._currentPath.moveTo(x2, y2-bottomRightRadius);
      this._currentPath.drawRoundCorner(x2, y2, x2-bottomRightRadius, y2,
                                        bottomRightRadius);
      this._currentPath.lineTo(x + bottomLeftRadius, y2);
      this._currentPath.drawRoundCorner(x, y2, x, y2-bottomLeftRadius,
                                        bottomLeftRadius);
      this._currentPath.lineTo(x, y + topLeftRadius);
      this._currentPath.drawRoundCorner(x, y, x+topLeftRadius, y,
                                        topLeftRadius);
      this._currentPath.lineTo(x2 - topRightRadius, y);
      this._currentPath.drawRoundCorner(x2, y, x2, y+topRightRadius,
                                        topRightRadius);
      this._currentPath.lineTo(x2, y2-bottomRightRadius);
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
      this.beginPath();
      this._currentPath.lineStyle = createGradientStyle(type, colors, alphas,
                                                        ratios, matrix,
                                                        spreadMethod,
                                                        interpolationMethod,
                                                        focalPos);
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
    _getBounds: function (includeStroke) {
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
      var xMin = Math.min.apply(Math, xMins);
      var yMin = Math.min.apply(Math, yMins);
      var xMax = Math.max.apply(Math, xMaxs);
      var yMax = Math.max.apply(Math, yMaxs);
      return { xMin: xMin, yMin: yMin, xMax: xMax, yMax: yMax};
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

