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
      this._fillTransform = null;
      this._revision = 0;
      this._scale = 1;
      this._strokeStyle = null;
      this._subpaths = [];

      var hitCanvas = document.createElement('canvas');
      hitCanvas.width = hitCanvas.height = 1;
      this._hitCtx = hitCanvas.getContext('2d');
    },

    _beginFillObject: function (fill) {
      if (fill === null) {
        this.endFill();
      } else {
        switch (fill.__class__) {
        case 'flash.display.GraphicsEndFill':
          this.endFill();
          break;
        case 'flash.display.GraphicsSolidFill':
          this.beginFill(fill.color, fill.alpha);
          break;
        case 'flash.display.GraphicsGradientFill':
          this.beginGradientFill(
            fill.type,
            fill.colors,
            fill.alphas,
            fill.ratios,
            fill.matrix,
            fill.spreadMethod,
            fill.interpolationMethod,
            fill.focalPointRatio
          );
          break;
        case 'flash.display.GraphicsBitmapFill':
          this.beginBitmapFill(fill.bitmapData, fill.matrix, fill.repeat, fill.smooth);
          break;
        case 'flash.display.GraphicsShaderFill':
          this.beginShaderFill(fill.shader, fill.matrix);
          break;
        }
      }
    },
    _beginStrokeObject: function (istroke) {
      var stroke = null;
      var fill = null;

      if (istroke !== null && istroke.__class__ === 'flash.display.GraphicsStroke')
        stroke = istroke;
      if (stroke && stroke.fill && stroke.fill.__isIGraphicsFill__)
        fill = stroke.fill;

      if (stroke === null || fill === null) {
        this.lineStyle(null);
      } else if (fill.__class__ === 'flash.display.GraphicsSolidFill') {
        this.lineStyle(
          stroke.thickness,
          fill.color,
          fill.alpha,
          stroke.pixelHinting,
          stroke.scaleMode,
          stroke.caps,
          stroke.joints,
          stroke.miterLimit
        );
      } else {
        this.lineStyle(
          stroke.thickness,
          0,
          1,
          stroke.pixelHinting,
          stroke.scaleMode,
          stroke.caps,
          stroke.joints,
          stroke.miterLimit
        );

        switch (fill.__class__) {
        case 'flash.display.GraphicsGradientFill':
          this.lineGradientStyle(
            fill.type,
            fill.colors,
            fill.alphas,
            fill.ratios,
            fill.matrix,
            fill.spreadMethod,
            fill.interpolationMethod,
            fill.focalPointRatio
          );
          break;
        case 'flash.display.GraphicsBitmapFill':
          this.lineBitmapStyle(fill.bitmapData, fill.matrix, fill.repeat, fill.smooth);
          break;
        case 'flash.display.GraphicsShaderFill':
          this.lineShaderStyle(fill.shader, fill.matrix);
          break;
        }
      }
    },
    _cacheAsBitmap: function (bbox) {
      var bounds = this._getBounds();
      var canvas = document.createElement('canvas');
      canvas.width = bounds.width;
      canvas.height = bounds.height;
      var ctx = canvas.getContext('kanvas-2d');
      ctx.translate(-bbox.left, -bbox.top);
      var scale = this._scale;
      if (scale !== 1)
        ctx.scale(scale, scale);
      var subpaths = this._subpaths;
      for (var i = 0; i < subpaths.length; i++) {
        var pathTracker = subpaths[i];
        var path = pathTracker.target;
        if (path.fillStyle) {
          ctx.fillStyle = path.fillStyle;
          if (path.fillTransform) {
            var m = path.fillTransform;
            ctx.beginPath();
            ctx.__draw__(path);
            ctx.save();
            ctx.transform(m.a, m.b, m.c, m.d, m.tx, m.ty);
            ctx.fill();
            ctx.restore();
          } else {
            ctx.fill(path);
          }
        }
        if (path.strokeStyle) {
          ctx.strokeStyle = path.strokeStyle;
          var drawingStyles = pathTracker.drawingStyles;
          for (var prop in drawingStyles)
            ctx[prop] = drawingStyles[prop];
          ctx.stroke(path);
        }
      }
      this._bitmap = canvas;
    },
    _drawPathObject: function (path) {
      if (path.__class__ === 'flash.display.GraphicsPath')
        this.drawPath(path.commands, path.data, path.winding);
      else if (path.__class__ === 'flash.display.GraphicsTrianglePath')
        this.drawTriangles(path.vertices, path.indices, path.uvtData, path.culling);
    },

    get _currentPath() {
      var path = new Kanvas.Path;
      var pathTracker = new PolygonTracker(path, this._hitCtx);
      pathTracker.drawingStyles = this._drawingStyles;
      path.fillStyle = this._fillStyle;
      path.fillTransform = this._fillTransform;
      path.strokeStyle = this._strokeStyle;
      this._subpaths.push(pathTracker);
      // Cache as an own property.
      Object.defineProperty(this, '_currentPath', describeProperty(pathTracker));
      return pathTracker;
    },

    beginFill: function (color, alpha) {
      if (alpha === undefined)
        alpha = 1;

      delete this._currentPath;

      this._fillStyle = alpha ? toRgba(color, alpha) : null;
      this._fillTransform = null;
    },
    beginGradientFill: function (type, colors, alphas, ratios, matrix, spreadMethod, interpolationMethod, focalPos) {
      var gradient;
      if (type === 'linear')
        gradient = fillContext.createLinearGradient(-1, 0, 1, 0);
      else if (type == 'radial')
        gradient = fillContext.createRadialGradient((focalPos || 0), 0, 0, 0, 0, 1);
      else
        throw ArgumentError();

      for (var i = 0, n = colors.length; i < n; i++)
        gradient.addColorStop(ratios[i], toRgba(colors[i], alphas[i]));

      this._fillStyle = gradient;

      // NOTE firefox really sensitive to really small scale when painting gradients
      var scale = 819.2;
      this._fillTransform = matrix ?
        { a: scale * matrix.a, b: scale * matrix.b, c: scale * matrix.c, d: scale * matrix.d, tx: matrix.tx, ty: matrix.ty } :
        { a: scale, b: 0, c: 0, d: scale, tx: 0, ty: 0 };
    },
    beginBitmapFill: function (bitmap, matrix, repeat, smooth) {
      var repeatStyle = repeat ? 'repeat' : 'no-repeat';
      this._fillStyle = fillContext.createPattern(bitmap._drawable, repeatStyle);

      var scale = this._scale;
      this._fillTransform = matrix ?
        { a: scale * matrix.a, b: scale * matrix.b, c: scale * matrix.c, d: scale * matrix.d, tx: matrix.tx, ty: matrix.ty } :
        { a: scale, b: 0, c: 0, d: scale, tx: 0, ty: 0 };
    },
    clear: function () {
      delete this._currentPath;

      this._drawingStyles = null;
      this._fillStyle = null;
      this._fillTransform = null;
      this._strokeStyle = null;
      this._subpaths.length = 0;

      this._hitCtx.beginPath();
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
    drawGraphicsData: function (graphicsData) {
      for (var i = 0, n = graphicsData.length; i < n; i++) {
        var item = graphicsData[i];
        if (item.__isIGraphicsPath__)
          this._drawPathObject(item);
        else if (item.__isIGraphicsFill__)
          this._beginFillObject(item);
        else if (item.__isIGraphicsStroke__)
          this._beginStrokeObject(item);
      }
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

      //    A-----B
      //  H         C
      //  G         D
      //    F-----E
      //
      // Through some testing, it has been discovered
      // tha the Flash player starts and stops the pen
      // at 'D', so we will too.

      this._currentPath.moveTo(x+w, y+h-radiusH);
      this._currentPath.arcTo(x+w, y+h, x+w-radiusW, y+h-radiusH, radiusW, radiusH);
      this._currentPath.arcTo(x, y+h, x, y+h-radiusH, radiusW, radiusH);
      this._currentPath.arcTo(x, y, x+radiusW, y, radiusW, radiusH);
      this._currentPath.arcTo(x+w, y, x+w, y+radiusH, radiusW, radiusH);
    },
    drawRoundRectComplex: function (x, y, w, h, topLeftRadius, topRightRadius, bottomLeftRadius, bottomRightRadius) {
      if (isNaN(w + h + topLeftRadius + topRightRadius + bottomLeftRadius + bottomRightRadius))
        throw ArgumentError();

      this._currentPath.moveTo(x+w, y+h-radiusH);
      this._currentPath.arcTo(x+w, y+h, x+w-bottomRightRadius, y+h-bottomRightRadius, bottomRightRadius);
      this._currentPath.arcTo(x, y+h, x, y+h-bottomLeftRadius, bottomLeftRadius);
      this._currentPath.arcTo(x, y, x+topLeftRadius, y, topLeftRadius);
      this._currentPath.arcTo(x+w, y, x+w, y+topRightRadius, topRightRadius);
    },
    drawTriangles: function (vertices, indices, uvtData, culling) {
      notImplemented();
    },
    endFill: function () {
      delete this._currentPath;

      this._fillStyle = null;
      this._fillTransform = null;
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
      this._currentPath.moveTo(x, y);
      this._revision++;
    },
    _getBounds: function (includeStroke) {
      var subpaths = this._subpaths;
      var xMins = [], yMins = [], xMaxs = [], yMaxs = [];
      for (var i = 0, n = subpaths.length; i < n; i++) {
        var pathTracker = subpaths[i];
        var b = pathTracker.getBounds();
        if (b) {
          xMins.push(b.minX); yMins.push(b.minY); xMaxs.push(b.maxX); yMaxs.push(b.maxY);
        }
        if (includeStroke && pathTracker.target.strokeStyle) {
          var strokeTracker = new PolygonTracker();
          var drawingStyles = pathTracker.drawingStyles;
          pathTracker.strokeToPath(strokeTracker, {
            strokeWidth: drawingStyles.lineWidth,
            startCap: drawingStyles.lineCap,
            endCap: drawingStyles.lineCap,
            join: drawingStyles.lineJoin,
            miterLimit: drawingStyles.miterLimit
          });
          var b = strokeTracker.getBounds();
          if (b) {
            xMins.push(b.minX); yMins.push(b.minY); xMaxs.push(b.maxX); yMaxs.push(b.maxY);
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

  var PolygonTracker = (function PolygonTrackerClosure() {
    var CURVE_APPROX_POINTS = 8;
    var CIRCLE_APPROX_POINTS = 12; // per PI
    var CIRCLE_APPROX_SIN = Math.sin(Math.PI / CIRCLE_APPROX_POINTS);
    var CIRCLE_APPROX_COS = Math.cos(Math.PI / CIRCLE_APPROX_POINTS);
    function strokeToPath(tracker, options, output) {
      function buildCap(lines, capStyle, line1, line2) {
         line1.type = 3;
         switch (capStyle) {
         case 'round':
           var cx = (line1.x2 + line2.x1) / 2;
           var cy = (line1.y2 + line2.y1) / 2;
           var dx = (line1.x2 - cx), dy = (line1.y2 - cy);
           for (var i = 0; i < CIRCLE_APPROX_POINTS; i++) {
             var dx1 = dx * CIRCLE_APPROX_COS - dy * CIRCLE_APPROX_SIN;
             var dy1 = dx * CIRCLE_APPROX_SIN + dy * CIRCLE_APPROX_COS;
             lines.push({
               x1: cx + dx, y1: cy + dy,
               x2: cx + dx1, y2: cy + dy1,
               type: 3});
             dx = dx1; dy = dy1;
           }
           break;
         case 'square':
           var capHeight = options.strokeWidth / 2;
           var dx = line1.x2 - line1.x1, dy = line1.y2 - line1.y1;
           var d = Math.sqrt(dx * dx + dy * dy);
           line1.x2 += dx * capHeight / d;
           line1.y2 += dy * capHeight / d;
           line2.x1 += dx * capHeight / d;
           line2.y1 += dy * capHeight / d;
           // fall throw
         case 'none':
         default:
           lines.push({
             x1: line1.x2, y1: line1.y2,
             x2: line2.x1, y2: line2.y1,
             type: 3});
           break;
         }
      }
      function joinLines(cmds, line1, line2, type) {
         // (x - x1) * (y2 - y1) - (y - y1) * (x2 - x1) = 0, a*x + b*y = c
        var a1 = (line1.y2 - line1.y1), b1 = -(line1.x2 - line1.x1), c1 = line1.x1 * line1.y2 - line1.x2 * line1.y1;
        var a2 = (line2.y2 - line2.y1), b2 = -(line2.x2 - line2.x1), c2 = line2.x1 * line2.y2 - line2.x2 * line2.y1;
        var d = a1 * b2 - b1 * a2;
        if (d == 0) {
          // parellel lines doing bevel
          cmds.push({type: 'lineTo', args: [line1.x2, line1.y2]});
          cmds.push({type: 'lineTo', args: [line2.x1, line2.y1]});
          return;
        }
        var x = (c1 * b2 - b1 * c2) / d;
        var y = (a1 * c2 - c1 * a2) / d;
        var onLine1 = !(
          (x < line1.x1 && x < line1.x2) || (x > line1.x1 && x > line1.x2) ||
          (y < line1.y1 && y < line1.y2) || (y > line1.y1 && y > line1.y2));
        var onLine2 = !(
          (x < line2.x1 && x < line2.x2) || (x > line2.x1 && x > line2.x2) ||
          (y < line2.y1 && y < line2.y2) || (y > line2.y1 && y > line2.y2));
        if (!onLine1 && !onLine2) {
          switch (type) {
          default:
          case 'bevel':
            cmds.push({type: 'lineTo', args: [line1.x2, line1.y2]});
            cmds.push({type: 'lineTo', args: [line2.x1, line2.y1]});
            break;
          case 'round':
            cmds.push({type: 'lineTo', args: [line1.x2, line1.y2]});
            cmds.push({type: 'quadraticCurveTo', args: [x, y, line2.x1, line2.y1]});
            break;
          case 'miter':
            cmds.push({type: 'lineTo', args: [line1.x2, line1.y2]});
            var a = -(line1.y2 - line2.y1), b = line1.x2 - line2.x1;
            var d = Math.sqrt(a * a + b * b);
            var miterLength = (a * (x - line2.x1) + b * (y - line2.y1)) / d;
            var maxAllowedLength = options.miterLimit * options.strokeWidth / 2;
            if (miterLength > maxAllowedLength) {
              var p2 = maxAllowedLength / miterLength, p1 = 1 - p2;
              cmds.push({type: 'lineTo', args: [line1.x2 * p1 + x * p2, line1.y2 * p1 + y * p2]});
              cmds.push({type: 'lineTo', args: [line2.x1 * p1 + x * p2, line2.y1 * p1 + y * p2]});
            } else {
              cmds.push({type: 'lineTo', args: [x, y]});
            }
            cmds.push({type: 'lineTo', args: [line2.x1, line2.y1]});
            break;
          }
        } else if (!onLine1 || !onLine2) {
          cmds.push({type: 'lineTo', args: onLine1 ? [x, y] : [line1.x2, line1.y2]});
          cmds.push({type: 'lineTo', args: onLine2 ? [x, y] : [line2.x1, line2.y1]});
        } else {
          cmds.push({type: 'lineTo', args: [x, y]});
        }
      }
      function buildPath(lines) {
        var moveCmd = {type: 'moveTo', args: null};
        var cmds = [moveCmd];
        var joinType = options.join;
        for (var j = 0; j < lines.length; j++) {
          var type = lines[j].type;
          switch (type) {
          default:
            joinLines(cmds, lines[j], lines[(j + 1) % lines.length], joinType);
            break;
          case 3: // simple line
            cmds.push({type: 'lineTo', args: [lines[j].x2, lines[j].y2]});
            break;
          case 4: // curve segment connector
            joinLines(cmds, lines[j], lines[(j + 1) % lines.length], 'bevel');
            break;
          }
        }
        moveCmd.args = cmds[cmds.length - 1].args.slice(-2);
        cmds.push({type: 'closePath'});
        for (var i = 0; i < cmds.length; i++) {
          output[cmds[i].type].apply(output, cmds[i].args);
        }
      }
      var i = 0;
      var segments = tracker.segments;
      var points = tracker.points;
      var start = segments[0];
      do {
        ++i;
        var end = i < segments.length ? segments[i] : points.length;
        if (points[start].type !== 0) {
          throw 'invalid points structure';
        }
        if (start + 1 >= end) {
          // only moveTo operation
          end = start;
          continue;
        }
        var pathClosed = points[end - 1].type === 2;
        var lastX = points[start].x;
        var lastY = points[start].y;
        var lastType = 0;
        start++;
        // building paths
        var forward = [], backward = [];
        var strokeHalfWidth = options.strokeWidth / 2;
        for (var j = start; j < end; j++) {
          var x = points[j].x, y = points[j].y, type = points[j].type;
          var dx = x - lastX;
          var dy = y - lastY;
          if (dx == 0 && dy == 0) continue;
          var k = strokeHalfWidth / Math.sqrt(dx * dx + dy * dy);
          dx *= k; dy *= k;
          forward.push({
            x1: lastX + dy, y1: lastY - dx,
            x2: x + dy, y2: y - dx,
            type: type
          });
          backward.push({
            x1: x - dy, y1: y + dx,
            x2: lastX - dy, y2: lastY + dx,
            type: lastType
          });
          lastX = x; lastY = y; lastType = type;
        }
        if (forward.length === 0) {
          // no segments are created, skipping the stroke
          start = end;
          continue;
        }

        backward.reverse();
        if (!pathClosed) {
          buildCap(forward, options.endCap, forward[forward.length - 1], backward[0]);
          buildCap(backward, options.startCap, backward[backward.length - 1], forward[0]);
          forward = forward.concat(backward);
          buildPath(forward);
        } else {
          buildPath(forward);
          buildPath(backward);
        }
        start = end;
      } while (i < segments.length);
    }

    function pushCurveApprox(points, x1, y1, x2, y2) {
      var x0 = points[points.length - 1].x;
      var y0 = points[points.length - 1].y;
      for (var i = 0; i < CURVE_APPROX_POINTS; i++) {
        var p2 = (i + 1) / CURVE_APPROX_POINTS, p1 = 1 - p2;
        var x01 = x0 * p1 + x1 * p2, y01 = y0 * p1 + y1 * p2;
        var x12 = x1 * p1 + x2 * p2, y12 = y1 * p1 + y2 * p2;
        var x = x01 * p1 + x12 * p2, y = y01 * p1 + y12 * p2;
        points.push({x: x, y: y, type: 4});
      }
      points[points.length - 1].type = 1;
    }
    function pushBezierCurveApprox(points, x1, y1, x2, y2, x3, y3) {
      var x0 = points[points.length - 1].x;
      var y0 = points[points.length - 1].y;
      for (var i = 0; i < CURVE_APPROX_POINTS; i++) {
        var p2 = (i + 1) / CURVE_APPROX_POINTS, p1 = 1 - p2;
        var x01 = x0 * p1 + x1 * p2, y01 = y0 * p1 + y1 * p2;
        var x12 = x1 * p1 + x2 * p2, y12 = y1 * p1 + y2 * p2;
        var x23 = x2 * p1 + x3 * p2, y23 = y2 * p1 + y3 * p2;
        var x012 = x01 * p1 + x12 * p2, y012 = y01 * p1 + y12 * p2;
        var x123 = x12 * p1 + x23 * p2, y123 = y12 * p1 + y23 * p2;
        var x = x012 * p1 + x123 * p2, y = y012 * p1 + y123 * p2;
        points.push({x: x, y: y, type: 4});
      }
      points[points.length - 1].type = 1;
    }
    function normalizeAngle(angle) {
      while (angle > Math.PI)
        angle -= 2 * Math.PI;
      while (angle <= -Math.PI)
        angle += 2 * Math.PI;
      return angle;
    }
    function pushArcApprox(points, x1, y1, x2, y2, radiusX, radiusY, rotation) {
      var x0 = points[points.length - 1].x;
      var y0 = points[points.length - 1].y;
      var dx01 = x1 - x0, dy01 = y1 - y0, dx12 = x2 - x1, dy12 = y2 - y1;
      var winding = dx01 * dy12 - dy01 * dx12;
      // if radiusX or radiusY == 0, or points #0, #1, and #2 are on one line,
      // just draw simple line to point #1
      if (radiusX <= 0 || radiusY <= 0 || winding == 0) {
        points.push({x: x1, y: y1, type: 1});
        return;
      }
      var rotationCos = 1, rotationSin = 0;
      if (rotation) {
        rotationCos = Math.cos(rotation);
        rotationSin = Math.sin(rotation);
      }
      // placing major axis to x
      var dx01_ = dx01 * rotationCos + dy01 * rotationSin;
      var dy01_ = -dx01 * rotationSin + dy01 * rotationCos;
      var dx12_ = dx12 * rotationCos + dy12 * rotationSin;
      var dy12_ = -dx12 * rotationSin + dy12 * rotationCos;
      var alpha1 = Math.atan2(-dx01_ * radiusY, dy01_ * radiusX);
      var alpha2 = Math.atan2(-dx12_ * radiusY, dy12_ * radiusX);
      if (winding < 0) {
        alpha1 = (alpha1 >= 0 ? -Math.PI : Math.PI) + alpha1;
        alpha2 = (alpha2 >= 0 ? -Math.PI : Math.PI) + alpha2;
      }

      // start and end offsets of the arc from center
      var bx1_ = radiusX * Math.cos(alpha1), by1_ = radiusY * Math.sin(alpha1);
      var bx2_ = radiusX * Math.cos(alpha2), by2_ = radiusY * Math.sin(alpha2);
      var bx1 = bx1_ * rotationCos - by1_ * rotationSin;
      var by1 = bx1_ * rotationSin + by1_ * rotationCos;
      var bx2 = bx2_ * rotationCos - by2_ * rotationSin;
      var by2 = bx2_ * rotationSin + by2_ * rotationCos;

      // finding center
      // (x1 - bx1 - cx) * (y1 - y0) - (y1 - by1 - cy) * (x1 - x0) = 0
      var a1 = y1 - y0, b1 = -(x1 - x0), c1 = (x1 - bx1) * (y1 - y0) - (y1 - by1) * (x1 - x0);
      var a2 = y2 - y1, b2 = -(x2 - x1), c2 = (x2 - bx2) * (y2 - y1) - (y2 - by2) * (x2 - x1);
      var d = a1 * b2 - b1 * a2;
      var cx = (c1 * b2 - b1 * c2) / d;
      var cy = (a1 * c2 - c1 * a2) / d;

      points.push({x: bx1 + cx, y: by1 + cy, type: 1}); // line from point #0

      // building arc segments
      var angleDistance = normalizeAngle(alpha2 - alpha1);
      var stepsCount = Math.ceil(Math.abs(angleDistance) / Math.PI * CIRCLE_APPROX_POINTS);
      var step = angleDistance / stepsCount;
      for (var i = 1; i <= stepsCount; i++) {
        var alpha = alpha1 + (angleDistance * i / stepsCount);
        var x_ = radiusX * Math.cos(alpha), y_ = radiusY * Math.sin(alpha);
        var x = x_ * rotationCos - y_ * rotationSin + cx;
        var y = x_ * rotationSin + y_ * rotationCos + cy;
        points.push({x: x, y: y, type: 4});
      }
      points[points.length - 1].type = 1;
    }

    function PolygonTrackerNullOutput() {}
    PolygonTrackerNullOutput.prototype = {
      moveTo: function () {},
      lineTo: function () {},
      quadraticCurveTo: function () {},
      closePath: function () {}
    };

    function PolygonTracker(target, hitCtx) {
      this.target = target || new PolygonTrackerNullOutput;
      this.segments = [0];
      this.points = [{x: 0, y: 0, type: 0}];
      this.hitCtx = hitCtx;
    }
    PolygonTracker.prototype = {
      get lineWidth() {
        return this.target.lineWidth;
      },
      set lineWidth(value) {
        this.target.lineWidth = value;
      },
      get lineCap() {
        return this.target.lineCap;
      },
      set lineCap(value) {
        this.target.lineCap = value;
      },
      get lineJoin() {
        return this.target.lineJoin;
      },
      set lineJoin(value) {
        this.target.lineJoin = value;
      },
      get miterLimit() {
        return this.target.miterLimit;
      },
      set miterLimit(value) {
        this.target.miterLimit = value;
      },
      moveTo: function (x, y) {
        var segmentStartIndex = this.segments[this.segments.length - 1];
        if (segmentStartIndex === this.points.length - 1) {
          this.points[segmentStartIndex].x = x;
          this.points[segmentStartIndex].y = y;
        } else {
          this.segments.push(this.points.length);
          this.points.push({x: x, y: y, type: 0});
        }
        this.target.moveTo(x, y);
        if (this.hitCtx)
          this.hitCtx.moveTo(x, y);
      },
      lineTo: function (x, y) {
        this.points.push({x: x, y: y, type: 1});
        this.target.lineTo(x, y);
        if (this.hitCtx)
          this.hitCtx.lineTo(x, y);
      },
      closePath: function () {
        var segmentStartIndex = this.segments[this.segments.length - 1];
        this.points.push({x: this.points[segmentStartIndex].x,
                          y: this.points[segmentStartIndex].y,
                          type: 2});

        this.target.closePath();
        if (this.hitCtx)
          this.hitCtx.closePath();

        this.segments.push(this.points.length);
        this.points.push({x: this.points[segmentStartIndex].x,
                          y: this.points[segmentStartIndex].y,
                          type: 0});
      },
      quadraticCurveTo: function (cpx, cpy, x, y) {
        pushCurveApprox(this.points, cpx, cpy, x, y);
        this.target.quadraticCurveTo(cpx, cpy, x, y);
        if (this.hitCtx)
          this.hitCtx.quadraticCurveTo(cpx, cpy, x, y);
      },
      bezierCurveTo: function (cpx1, cpy1, cpx2, cpy2, x, y) {
        pushBezierCurveApprox(this.points, cpx1, cpy1, cpx2, cpy2, x, y);
        this.target.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, x, y);
        if (this.hitCtx)
          this.hitCtx.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, x, y);
      },
      arcTo: function (x1, y1, x2, y2, radiusX, radiusY, rotation) {
        pushArcApprox(this.points, x1, y1, x2, y2, radiusX,
                      arguments.length < 6 ? radiusX : radiusY,
                      rotation);
        this.target.arcTo.apply(this.target, arguments);
        if (this.hitCtx)
          this.hitCtx.arcTo.apply(this.target, arguments);
      },
      rect: function (x, y, w, h) {
        var segmentStartIndex = this.segments[this.segments.length - 1];
        if (segmentStartIndex === this.points.length - 1) {
          this.points[segmentStartIndex].x = x;
          this.points[segmentStartIndex].y = y;
        } else {
          this.segments.push(this.points.length);
          this.points.push({x: x, y: y, type: 0});
        }
        this.points.push({x: x + w, y: y, type: 1});
        this.points.push({x: x + w, y: y + h, type: 1});
        this.points.push({x: x, y: y + h, type: 1});
        this.points.push({x: x, y: y, type: 2});

        this.target.rect(x, y, w, h);
        if (this.hitCtx)
          this.hitCtx.rect(x, y, w, h);
      },
      strokeToPath: function (output, options) {
        strokeToPath(this, options || {
          strokeWidth: this.lineWidth,
          startCap: this.lineCap,
          endCap: this.lineCap,
          join: this.lineJoin,
          miterLimit: this.miterLimit
        }, output);
      },
      getBounds: function () {
        var points = this.points;
        if (points.length <= 1) { // HACK only moveTo
          return null;
        }
        var minX, minY, maxX, maxY;
        minX = maxX = points[0].x;
        minY = maxY = points[0].y;
        for (var i = 1; i < points.length; i++) {
          var x = points[i].x, y = points[i].y;
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
        return {minX: minX, minY: minY, maxX: maxX, maxY: maxY};
      }
    };
    return PolygonTracker;
  })();

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
        drawPath: def.drawPath,
        drawPathObject: def.drawPathObject,
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
