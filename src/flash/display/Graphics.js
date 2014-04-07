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
/*global describeProperty, ShapePath, factoryCtx,
  buildLinearGradientFactory, buildRadialGradientFactory,
  SHAPE_MOVE_TO, SHAPE_LINE_TO, SHAPE_CURVE_TO, SHAPE_WIDE_MOVE_TO,
  SHAPE_WIDE_LINE_TO, SHAPE_CUBIC_CURVE_TO, SHAPE_CIRCLE, SHAPE_ELLIPSE,
  SHAPE_ROUND_CORNER, Errors, throwError, Counter */

var GraphicsDefinition = (function () {
  var GRAPHICS_PATH_WINDING_EVEN_ODD       = 'evenOdd';
  var GRAPHICS_PATH_WINDING_NON_ZERO       = 'nonZero';

  function createPatternStyle(bitmap, matrix, repeat, smooth) {
    var transform = matrix ?
                    { a: matrix.a, b: matrix.b, c: matrix.c,
                      d: matrix.d, tx: matrix.tx, ty: matrix.ty
                    } :
                    { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 };

    return {type: repeat ? GRAPHICS_FILL_REPEATING_BITMAP :
                           GRAPHICS_FILL_CLIPPED_BITMAP,
            bitmapId: bitmap._renderableId,
            transform: transform,
            smooth: smooth};
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
        ratio: ratios[i],
        color: (colors[i] << 8) | (alphas[i] * 255)
      });
    }

    // NOTE firefox is really sensitive to very small scale when painting gradients
    var scale = 819.2;
    var transform = matrix ?
                    { a: scale * matrix.a, b: scale * matrix.b,
                      c: scale * matrix.c, d: scale * matrix.d,
                      tx: matrix.tx, ty: matrix.ty
                    } :
                    {a: scale, b: 0, c: 0, d: scale, tx: 0, ty: 0};

    return {type: type === 'linear' ? GRAPHICS_FILL_LINEAR_GRADIENT :
                                      GRAPHICS_FILL_RADIAL_GRADIENT,
            records: colorStops,
            transform: transform,
            focalPoint: focalPos};
  }

  function serializeStyle(style, message) {
    if (!style) {
      message.ensureAdditionalCapacity(8);
      message.writeIntUnsafe(GRAPHICS_FILL_SOLID);
      message.writeIntUnsafe(0);
      return;
    }

    message.ensureAdditionalCapacity(8);
    message.writeIntUnsafe(style.type);

    switch (style.type) {
    case GRAPHICS_FILL_SOLID:
      message.writeIntUnsafe(style.color);
      return;
    case GRAPHICS_FILL_LINEAR_GRADIENT:
    case GRAPHICS_FILL_RADIAL_GRADIENT:
    case GRAPHICS_FILL_FOCAL_RADIAL_GRADIENT:
      var records = style.records;
      var n = records.length;
      message.ensureAdditionalCapacity((2 + n * 2) * 4);
      message.writeIntUnsafe(style.focalPoint);
      message.writeIntUnsafe(n);
      for (var i = 0; i < n; i++) {
        var record = records[i];
        message.writeFloatUnsafe(record.ratio / 255);
        message.writeIntUnsafe(record.color);
      }
      break;
    case GRAPHICS_FILL_REPEATING_BITMAP:
    case GRAPHICS_FILL_CLIPPED_BITMAP:
    case GRAPHICS_FILL_NONSMOOTHED_REPEATING_BITMAP:
    case GRAPHICS_FILL_NONSMOOTHED_CLIPPED_BITMAP:
      message.ensureAdditionalCapacity(12);
      message.writeIntUnsafe(style.bitmapId);
      message.writeIntUnsafe(style.repeat);
      message.writeIntUnsafe(style.smooth);
      break;
    default:
      fail('invalid fill style', 'shape');
    }

    var t = style.transform;
    message.ensureAdditionalCapacity(24);
    message.writeFloatUnsafe(t.a);
    message.writeFloatUnsafe(t.b);
    message.writeFloatUnsafe(t.c);
    message.writeFloatUnsafe(t.d);
    message.writeIntUnsafe(t.tx);
    message.writeIntUnsafe(t.ty);
  }

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
      this._parent._invalidate();
      this._parent._invalidateBounds();
      this._parent._invalidateRenderable();
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
                                    { type: GRAPHICS_FILL_SOLID,
                                      color: (color << 8) | (alpha * 255) } :
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
      var radius2 = radius * 2;
      this.drawRoundRect(x - radius, y - radius, radius2, radius2, radius2, radius2);
    },
    drawEllipse: function (x, y, width, height) {
      this.drawRoundRect(x, y, width, height, width, height);
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
    drawTriangles: function(vertices, indices, uvtData, cullingStr) {
      if (vertices === null || vertices.length === 0) {
        return;
      }

      var numVertices = vertices.length/2;
      var numTriangles = 0;

      // check for valid triangles
      if (indices) {
        if(indices.length % 3 ) {
          throwError('ArgumentError', Errors.InvalidParamError);
        } else {
          numTriangles = indices.length / 3;
        }
      } else {
        if (vertices.length % 6) {
          throwError('ArgumentError', Errors.InvalidParamError);
        } else {
          numTriangles = vertices.length / 6;
        }
      }

      // check for valid uv data count
      var numStrides = 0;
      if (uvtData) {
        if ( uvtData.length == numVertices * 2 ) {
          numStrides = 2;
        }
        else if ( uvtData.length == numVertices * 3 ) {
          numStrides = 3;
        }
        else {
          throwError('ArgumentError', Errors.InvalidParamError);
        }
      }

      var culling = 0;
      if ( cullingStr ===  'none' ) {
        culling = 0;
      } else if ( cullingStr === 'negative' ) {
        culling = -1;
      } else if ( cullingStr === 'positive' ) {
        culling = 1;
      } else {
        throwError('ArgumentError', Errors.InvalidEnumError, 'culling');
      }

      notImplemented("Graphics#drawTriangles");

    },
    endFill: function () {
      this.beginPath();
      this._currentPath.fillStyle = null;
    },
    lineBitmapStyle: function(bitmap, matrix, repeat, smooth) {
      notImplemented("Graphics#lineBitmapStyle");
      //this.beginPath();
      //this._currentPath.lineStyle = createPatternStyle(bitmap, matrix, repeat,
      //                                                 smooth);
    },
    lineGradientStyle: function(type, colors, alphas, ratios, matrix,
                                spreadMethod, interpolationMethod, focalPos)
    {
      notImplemented("Graphics#lineGradientStyle");
      //var style = createGradientStyle(type, colors, alphas, ratios, matrix,
      //                                spreadMethod, interpolationMethod,
      //                                focalPos);
      //this.beginPath();
      //this._currentPath.lineStyle = style;
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
          type: GRAPHICS_FILL_SOLID,
          color: (color << 8) | (alpha * 255),
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
      var bbox = includeStroke ? this.strokeBbox : this.bbox;
      if (bbox) {
        return bbox;
      }

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
        bbox = {xMin: 0, yMin: 0, xMax: 0, yMax: 0};
      } else {
        bbox = {
          xMin : Math.min.apply(Math, xMins),
          yMin : Math.min.apply(Math, yMins),
          xMax : Math.max.apply(Math, xMaxs),
          yMax : Math.max.apply(Math, yMaxs)
        };
      }
      if (includeStroke) {
        this.strokeBbox = bbox;
      } else {
        this.bbox = bbox;
      }
      return bbox;
    },

    _serialize: function (message) {
      message.ensureAdditionalCapacity(16);

      var bounds = this._getBounds(true);
      message.writeIntUnsafe(bounds.xMin);
      message.writeIntUnsafe(bounds.xMax);
      message.writeIntUnsafe(bounds.yMin);
      message.writeIntUnsafe(bounds.yMax);

      var paths = this._paths;
      for (var i = 0; i < paths.length; i++) {
        var path = paths[i];

        serializeStyle(path.fillStyle, message);

        var lineStyle = path.lineStyle;
        serializeStyle(lineStyle, message);
        if (lineStyle &&
            (lineStyle.type !== GRAPHICS_FILL_SOLID || (lineStyle.color & 0xff)))
        {
          message.ensureAdditionalCapacity(16);
          message.writeIntUnsafe(lineStyle.width);
          message.writeIntUnsafe(CAPS_STYLE_TYPES.indexOf(lineStyle.lineCap));
          message.writeIntUnsafe(JOIN_STYLE_TYPES.indexOf(lineStyle.lineJoin));
          message.writeIntUnsafe(lineStyle.miterLimit);
        }

        var n = path.commands.length;
        message.writeInt(n);
        var offset = message.getIndex(1);
        message.reserve(n);
        message.subU8View().set(path.commands, offset);

        n = path.data.length;
        message.ensureAdditionalCapacity((1 + n) * 4);
        message.writeIntUnsafe(n);
        offset = message.getIndex(4);
        message.reserve(n * 4);
        message.subI32View().set(path.data, offset);

        // TODO: support mophing shapes

        //n = path.isMorph ? path.morphData.length : 0;
        //if (n) {
        //  message.ensureAdditionalCapacity((1 + n) * 4);
        //  message.writeIntUnsafe(n);
        //  message.subF32View().set(path.morphData);
        //  message.offset += n;
        //}
      }
    },
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
