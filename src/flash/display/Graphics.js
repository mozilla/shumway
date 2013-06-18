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
/*global Kanvas, describeProperty */

var GraphicsDefinition = (function () {
  var GRAPHICS_PATH_COMMAND_CUBIC_CURVE_TO = 6;
  var GRAPHICS_PATH_COMMAND_CURVE_TO       = 3;
  var GRAPHICS_PATH_COMMAND_LINE_TO        = 2;
  var GRAPHICS_PATH_COMMAND_MOVE_TO        = 1;
  var GRAPHICS_PATH_COMMAND_WIDE_LINE_TO   = 5;
  var GRAPHICS_PATH_COMMAND_WIDE_MOVE_TO   = 4;

  var GRAPHICS_PATH_WINDING_EVEN_ODD       = 'evenOdd';
  var GRAPHICS_PATH_WINDING_NON_ZERO       = 'nonZero';

  var fillContext = document.createElement('canvas').getContext('2d');

  function toRgba(color, alpha) {
    var red = color >> 16 & 0xFF;
    var green = color >> 8 & 0xFF;
    var blue = color & 0xFF;
    return 'rgba(' + red + ',' + green + ',' + blue + ',' + alpha + ')';
  }

  var def = {
    __class__: 'flash.display.Graphics',

    initialize: function () {
      this._bitmap = null;
      this._drawingStyles = null;
      this._fillStyle = null;
      this._mx = null;
      this._my = null;
      this._revision = 0;
      this._scale = 1;
      this._strokeStyle = null;
      this._subpaths = [];
    },

    _createLinearGradient: function (x0, y0, x1, y1) {
      return fillContext.createLinearGradient(x0, y0, x1, y1);
    },
    _createRadialGradient: function (x0, y0, r0, x1, y1, r1) {
      return fillContext.createRadialGradient(x0, y0, r0, x1, y1, r1);
    },
    _createPattern: function(image, repetition) {
      return fillContext.createPattern(image, repetition);
    },
    _drawPathObject: function (path) {
      if (path.__class__ === 'flash.display.GraphicsPath')
        this.drawPath(path.commands, path.data, path.winding);
      else if (path.__class__ === 'flash.display.GraphicsTrianglePath')
        this.drawTriangles(path.vertices, path.indices, path.uvtData, path.culling);
    },

    get _currentPath() {
      var path = new Kanvas.Path();
      if (this._mx !== null || this._my !== null) {
        path.moveTo(this._mx, this._my);
        this._mx = this._my = null;
      }
      path.drawingStyles = this._drawingStyles;
      path.fillStyle = this._fillStyle;
      path.strokeStyle = this._strokeStyle;
      this._subpaths.push(path);
      // Cache as an own property.
      Object.defineProperty(this, '_currentPath', { value: path, configurable: true });
      return path;
    },

    beginFill: function (color, alpha) {
      if (alpha === undefined)
        alpha = 1;

      delete this._currentPath;

      this._fillStyle = alpha ? toRgba(color, alpha) : null;
    },
    beginGradientFill: function (type, colors, alphas, ratios, matrix, spreadMethod, interpolationMethod, focalPos) {
      var gradient;
      if (type === 'linear')
        gradient = this._createLinearGradient(-1, 0, 1, 0);
      else if (type == 'radial')
        gradient = this._createRadialGradient((focalPos || 0), 0, 0, 0, 0, 1);
      else
        throw ArgumentError();

      for (var i = 0, n = colors.length; i < n; i++)
        gradient.addColorStop(ratios[i] / 255, toRgba(colors[i], alphas[i]));

      this._fillStyle = gradient;

      // NOTE firefox really sensitive to really small scale when painting gradients
      var scale = 819.2;
      gradient.currentTransform = matrix ?
        { a: scale * matrix.a, b: scale * matrix.b, c: scale * matrix.c, d: scale * matrix.d, e: matrix.tx, f: matrix.ty } :
        { a: scale, b: 0, c: 0, d: scale, e: 0, f: 0 };
    },
    beginBitmapFill: function (bitmap, matrix, repeat, smooth) {
      var repeatStyle = repeat ? 'repeat' : 'no-repeat';
      var pattern = this._createPattern(bitmap._drawable, repeatStyle);

      this._fillStyle = pattern;

      // NOTE firefox really sensitive to really small scale when painting gradients
      var scale = 819.2;
      pattern.currentTransform = matrix ?
        { a: matrix.a, b: matrix.b, c: matrix.c, d: matrix.d, e: matrix.tx, f: matrix.ty } :
        { a: scale, b: 0, c: 0, d: scale, e: 0, f: 0 };
    },
    clear: function () {
      delete this._currentPath;

      this._drawingStyles = null;
      this._fillStyle = null;
      this._strokeStyle = null;
      this._subpaths = [];
    },
    copyFrom: function (sourceGraphics) {
      notImplemented();
    },
    cubicCurveTo: function (cp1x, cp1y, cp2x, cp2y, x, y) {
      this._currentPath.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
      this._revision++;
    },
    curveTo: function (cpx, cpy, x, y) {
      this._currentPath.quadraticCurveTo(cpx, cpy, x, y);
      this._revision++;
    },
    drawCircle: function (x, y, radius) {
      this._currentPath.arc(x, y, radius, 0, Math.PI * 2);
      this._revision++;
    },
    drawEllipse: function (x, y, width, height) {
      this._currentPath.ellipse(x, y, width / 2, height / 2, 0, 0, Math.PI * 2);
      this._revision++;
    },
    drawPath: function (commands, data, winding) {
      delete this._currentPath;
      this._currentPath.fillRule = winding || GRAPHICS_PATH_WINDING_EVEN_ODD;

      for (var i = 0, j = 0, n = commands.length; i < n; i++) {
        switch (commands[i]) {
        case GRAPHICS_PATH_COMMAND_CUBIC_CURVE_TO:
          this.cubicCurveTo(data[j++], data[j++], data[j++], data[j++], data[j++], data[j++]);
          break;
        case GRAPHICS_PATH_COMMAND_CURVE_TO:
          this.curveTo(data[j++], data[j++], data[j++], data[j++]);
          break;
        case GRAPHICS_PATH_COMMAND_LINE_TO:
          this.lineTo(data[j++], data[j++]);
          break;
        case GRAPHICS_PATH_COMMAND_MOVE_TO:
          this.moveTo(data[j++], data[j++]);
          break;
        case GRAPHICS_PATH_COMMAND_WIDE_LINE_TO:
        case GRAPHICS_PATH_COMMAND_WIDE_MOVE_TO:
          this.curveTo(0, 0, data[j++], data[j++]);
          break;
        }
      }
    },
    drawRect: function (x, y, w, h) {
      if (isNaN(w + h))
        throw ArgumentError();

      this._currentPath.rect(x, y, w, h);
      this._revision++;
    },
    drawRoundRect: function (x, y, w, h, ellipseWidth, ellipseHeight) {
      if (isNaN(w + h + ellipseWidth) || (ellipseHeight !== undefined && isNaN(ellipseHeight)))
        throw ArgumentError();

      var radiusW = ellipseWidth / 2;
      var radiusH = ellipseHeight / 2;

      this._currentPath.moveTo(x+w, y+h-radiusH);

      if (w === ellipseWidth && h === ellipseHeight) {
        if (ellipseWidth === ellipseHeight)
          this._currentPath.arc(x+radiusW, y+radiusH, radiusW, 0, Math.PI * 2);
        else
          this._currentPath.ellipse(x+radiusW, y+radiusH, radiusW, radiusH, 0, 0, Math.PI * 2);
        this._revision++;
        return;
      }

      //    A-----B
      //  H         C
      //  G         D
      //    F-----E
      //
      // Through some testing, it has been discovered
      // tha the Flash player starts and stops the pen
      // at 'D', so we will too.

      this._currentPath.arcTo(x+w, y+h, x+w-radiusW, y+h, radiusW, radiusH);
      this._currentPath.arcTo(x, y+h, x, y+h-radiusH, radiusW, radiusH);
      this._currentPath.arcTo(x, y, x+radiusW, y, radiusW, radiusH);
      this._currentPath.arcTo(x+w, y, x+w, y+radiusH, radiusW, radiusH);
      this._revision++;
    },
    drawRoundRectComplex: function (x, y, w, h, topLeftRadius, topRightRadius, bottomLeftRadius, bottomRightRadius) {
      if (isNaN(w + h + topLeftRadius + topRightRadius + bottomLeftRadius + bottomRightRadius))
        throw ArgumentError();

      this._currentPath.moveTo(x+w, y+h-bottomRightRadius);
      this._currentPath.arcTo(x+w, y+h, x+w-bottomRightRadius, y+h, bottomRightRadius);
      this._currentPath.arcTo(x, y+h, x, y+h-bottomLeftRadius, bottomLeftRadius);
      this._currentPath.arcTo(x, y, x+topLeftRadius, y, topLeftRadius);
      this._currentPath.arcTo(x+w, y, x+w, y+topRightRadius, topRightRadius);
      this._revision++;
    },
    drawTriangles: function (vertices, indices, uvtData, culling) {
      notImplemented();
    },
    endFill: function () {
      delete this._currentPath;

      this._fillStyle = null;
    },
    lineBitmapStyle: function (bitmap, matrix, repeat, smooth) {
      notImplemented();
    },
    lineGradientStyle: function (type, colors, alphas, ratios, matrix, spreadMethod, interpolationMethod, focalPos) {
      notImplemented();
    },

    lineStyle: function (width, color, alpha, pxHinting, scale, cap, joint, mlimit) {
      delete this._currentPath;

      if (width) {
        if (alpha === undefined)
          alpha = 1;
        if (mlimit === undefined)
          mlimit = 3;

        this._drawingStyles = {
          lineCap: cap || 'round',
          lineJoin: cap || 'round',
          lineWidth: width,
          miterLimit: mlimit * 2
        };
        this._strokeStyle = toRgba(color, alpha);
      } else {
        this._drawingStyles = null;
        this._strokeStyle = null;
      }
    },
    lineTo: function (x, y) {
      this._currentPath.lineTo(x, y);
      this._revision++;
    },
    moveTo: function (x, y) {
      delete this._currentPath;

      this._mx = x;
      this._my = y;
    },
    _getBounds: function (includeStroke) {
      var subpaths = this._subpaths;
      var xMins = [], yMins = [], xMaxs = [], yMaxs = [];
      for (var i = 0, n = subpaths.length; i < n; i++) {
        var path = subpaths[i];
        var b = path.getBounds();
        if (b) {
          if (includeStroke && path.strokeStyle) {
            var lh = path.drawingStyles.lineWidth / 2;
            xMins.push(b.x - lh); yMins.push(b.y - lh); xMaxs.push(b.x + b.width + lh); yMaxs.push(b.y + b.height + lh);
          } else {
            xMins.push(b.x); yMins.push(b.y); xMaxs.push(b.x + b.width); yMaxs.push(b.y + b.height);
          }
        }

      }
      if (xMins.length === 0) {
        return 0;
      }
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
