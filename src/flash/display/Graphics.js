function Graphics() {
  this._drawingStyles = null;
  this._fillStyle = null;
  this._strokeStyle = null;
  this._subpaths = [];
}

function toRgba(color, alpha) {
  var red = color >> 16 & 0xFF;
  var green = color >> 8 & 0xF;
  var blue = color & 0xFF;
  return 'rgba(' + [red, green, blue, alpha] + ')';
}

Graphics.prototype = Object.create(null, {
  beginFill: describeMethod(function (color, alpha) {
    if (alpha === undefined)
      alpha = 1;

    delete this._currentPath;

    this._fillStyle = toRgba(color, alpha);
  }),
  beginGradientFill: describeMethod(
    function (type, colors, alphas, ratios, matrix, spreadMethod, interpolationMethod, focalPoint) {
      if (type !== 'linear' || type !== 'radial')
       throw ArgumentError();

      notImplemented();
    }
  ),
  beginBitmapFill: describeMethod(function (bitmap, matrix, repeat, smooth) {
   notImplemented();
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
  cubicCurveTo: describeMethod(function (controlX1, controlY1, controlX2, controlY2, anchorX, anchorY) {
    this._currentPath.bezierCurveTo(controlX1, controlY1, controlX2, controlY2, anchorX, anchorY);
  }),
  curveTo: describeMethod(function (controlX, controlY, anchorX, anchorY) {
    this._currentPath.quadraticCurveTo(controlX, controlY, anchorX, anchorY);
  }),
  drawPath: describeMethod(function (commands, data, winding) {
    notImplemented();
  }),
  drawRect: describeMethod(function (x, y, w, h) {
    if (isNaN(w + h))
      throw ArgumentError();

    this._currentPath.rect(x, y, w, h);
  }),
  drawRoundRect: describeMethod(function (x, y, w, h, ellipseWidth, ellipseHeight) {
    if (isNaN(w + h + ellipseWidth) ||
        (ellipseHeight !== undefined && isNaN(ellipseHeight)))
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
    function (type, colors, alphas, ratios, matrix, spreadMethod, interpolationMethod, focalPoint) {
      notImplemented();
    }
  ),
  lineStyle: describeMethod(
    function (thickness, color, alpha, pixelHinting, scaleMode, caps, joints, miterLimit) {
      delete this._currentPath;

      if (thickness) {
        if (alpha === undefined)
          alpha = 1;

        this._drawingStyles = { lineWidth: thickness };
        this._strokeStyle = toRgba(color, alpha);
      } else {
        this._drawingStyles = null;
        this._strokeStyle = null;
      }
    }
  ),
  moveTo: describeMethod(function (x, y) {
    this._currentPath.moveTo(x, y);
  }),
  lineTo: describeMethod(function (x, y) {
    this._currentPath.lineTo(x, y);
  }),

  _currentPath: describeLazyProperty('_currentPath', function () {
    var path = new Kannvas.Path;
    path.drawingStyles = this._drawingStyles;
    path.fillStyle = this._fillStyle;
    path.strokeStyle = this._lineStyle;

    this._subpaths.push(path);

    return path;
  })
});
