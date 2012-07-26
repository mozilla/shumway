var GRAPHICS_PATH_COMMAND_CUBIC_CURVE_TO = 6;
var GRAPHICS_PATH_COMMAND_CURVE_TO       = 3;
var GRAPHICS_PATH_COMMAND_LINE_TO        = 2;
var GRAPHICS_PATH_COMMAND_MOVE_TO        = 1;
var GRAPHICS_PATH_COMMAND_WIDE_LINE_TO   = 5;
var GRAPHICS_PATH_COMMAND_WIDE_MOVE_TO   = 4;

var GRAPHICS_PATH_WINDING_EVEN_ODD = 'evenOdd';
var GRAPHICS_PATH_WINDING_NON_ZERO = 'nonZero';

var fillContext = document.createElement('canvas').getContext('2d');

function Graphics() {
  this._drawingStyles = null;
  this._fillStyle = null;
  this._strokeStyle = null;
  this._subpaths = [];
}

function toRgba(color, alpha) {
  var red = color >> 16 & 0xFF;
  var green = color >> 8 & 0xFF;
  var blue = color & 0xFF;
  return 'rgba(' + red + ',' + green + ',' + blue + ',' + alpha + ')';
}

Graphics.prototype = Object.create(null, {
  __class__: describeInternalProperty('flash.display.Graphics'),

  beginFill: describeMethod(function (color, alpha) {
    if (alpha === undefined)
      alpha = 1;

    delete this._currentPath;

    this._fillStyle = toRgba(color, alpha);
  }),
  beginGradientFill: describeMethod(
    function (type, colors, alphas, ratios, matrix, spreadMethod, interpolationMethod, focalPos) {
      var gradient;

      if (type === 'linear')
        gradient = fillContext.createLinearGradient(-819.2, 0, 819.2, 0);
      else if (type == 'radial')
        gradient = fillContext.createRadialGradient(819.2 * (focalPos || 0), 0, 0, 0, 0, 819.2);
      else
       throw ArgumentError();

      for (var i = 0, n = colors.length; i < n; i++)
        gradient.addColorStop(ratios[i], toRgba(colors[i], alphas[i]));

      this._fillStyle = gradient;
    }
  ),
  beginBitmapFill: describeMethod(function (bitmap, matrix, repeat, smooth) {
    notImplemented();
  }),
  beginFillObject: describeMethod(function (fill) {
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
  }),
  beginStrokeObject: describeMethod(function (istroke) {
    var stroke = null;
    var fill = null;

    if (stroke !== null && stroke.__class__ === 'flash.display.GraphicsStroke')
      stroke = istroke;
    if (stroke && stroke.fill && stroke.fill.__isIGraphicsFill__)
      fill = stroke.fill;

    if (stroke === null || fill === null) {
      this.lineStyle();
    } else if (fill.__isGraphicsSolidFill__) {
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
  }),
  clear: describeMethod(function () {
    delete this._currentPath;

    this._drawingStyles = null;
    this._fillStyle = null;
    this._strokeStyle = null;
    this._subpaths.length = 0;
  }),
  copyFrom: describeMethod(function (sourceGraphics) {
   notImplemented();
  }),
  cubicCurveTo: describeMethod(function (cp1x, cp1y, cp2x, cp2y, x, y) {
    this._currentPath.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
  }),
  curveTo: describeMethod(function (cpx, cpy, x, y) {
    this._currentPath.quadraticCurveTo(cpx, cpy, x, y);
  }),
  drawGraphicsData: describeMethod(function (graphicsData) {
    for (var i = 0, n = graphicsData.length; i < n; i++) {
      var item = graphicsData[i];
      if (item.__isIGraphicsPath__)
        this.drawPathObject(item);
      else if (item.__isIGraphicsFill__)
        this.beginFillObject(item);
      else if (item.__isIGraphicsStroke__)
        this.beginStrokeObject(item);
    }
  }),
  drawPath: describeMethod(function (commands, data, winding) {
    delete this._currentPath;
    this._currentPath.fillRule = winding || GRAPHICS_PATH_WINDING_EVEN_ODD;

    for (var i = 0, j = 0, n = commands.length; i < n; i++) {
      switch (commands[i]) {
      case GRAPHICS_PATH_COMMAND_CUBIC_CURVE_TO:
        this.cubicCurveTo(data[j++], data[j++], data[j++], data[j++], data[j++], data[j++]);
        break;
      case GRAPHICS_PATH_COMMAND_CURVE_TO:
        this.curveTo(data[j++], data[j++], data[j++], data[j++]);
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
  }),
  drawPathObject: describeMethod(function (path) {
    if (path.__class__ === 'flash.display.GraphicsPath')
      this.drawPath(item.commands, item.data, item.winding);
    else if (path.__class__ === 'flash.display.GraphicsTrianglePath')
      this.drawTriangles(item.vertices, item.indices, item.uvtData, item.culling);
  }),
  drawRect: describeMethod(function (x, y, w, h) {
    if (isNaN(w + h))
      throw ArgumentError();

    this._currentPath.rect(x, y, w, h);
  }),
  drawRoundRect: describeMethod(function (x, y, w, h, ellipseWidth, ellipseHeight) {
    if (isNaN(w + h + ellipseWidth) || (ellipseHeight !== undefined && isNaN(ellipseHeight)))
      throw ArgumentError();

    notImplemented();
  }),
  drawRoundRectComplex: describeMethod(
    function (x, y, w, h, topLeftRadius, topRightRadius, bottomLeftRadius, bottomRightRadius) {
      if (isNaN(h + topLeftRadius + topRightRadius + bottomLeftRadius + bottomRightRadius))
       throw ArgumentError();

      notImplemented();
    }
  ),
  drawTriangles: describeMethod(function (vertices, indices, uvtData, culling) {
   notImplemented();
  }),
  endFill: describeMethod(function () {
    this._currentPath.closePath();
  }),
  lineBitmapStyle: describeMethod(function (bitmap, matrix, repeat, smooth) {
   notImplemented();
  }),
  lineGradientStyle: describeMethod(
    function (type, colors, alphas, ratios, matrix, spreadMethod, interpolationMethod, focalPos) {
      notImplemented();
    }
  ),
  lineStyle: describeMethod(function (width, color, alpha, pxHinting, scale, cap, joint, mlimit) {
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
        miterLimit: mlimit
      };
      this._strokeStyle = toRgba(color, alpha);
    } else {
      this._drawingStyles = null;
      this._strokeStyle = null;
    }
  }),
  moveTo: describeMethod(function (x, y) {
    this._currentPath.moveTo(x, y);
  }),
  lineTo: describeMethod(function (x, y) {
    this._currentPath.lineTo(x, y);
  }),

  _currentPath: describeLazyProperty('_currentPath', function () {
    var path = new Kanvas.Path;
    path.drawingStyles = this._drawingStyles;
    path.fillStyle = this._fillStyle;
    path.strokeStyle = this._lineStyle;
    path.winding = this._winding;

    this._subpaths.push(path);

    return path;
  })
});
