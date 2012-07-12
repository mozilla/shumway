function Graphics() {
  this._drawingStyles = null;
  this._fillStyle = null;
  this._strokeStyle = null;
  this._subpaths = [];
}

function toRgba(color, alpha) {
  return 'rgba(' + [color >> 16 & 0xFF, color >> 8 & 0xFF, color & 0xFF, alpha] + ')';
}

Graphics.prototype = Object.create(null, {
	beginFill: descMethod(function (color, alpha) {
    if (alpha === undefined)
      alpha = 1;

    delete this._currentPath;

    this._fillStyle = toRgba(color, alpha);
	}),
	beginGradientFill: descMethod(
    function (type, colors, alphas, ratios, matrix, spreadMethod, interpolationMethod, focalPoint) {
		  if (type !== 'linear' || type !== 'radial')
			 throw ArgumentError();

      notImplemented();
	  }
  ),
	beginBitmapFill: descMethod(function (bitmap, matrix, repeat, smooth) {
	 notImplemented();
  }),
	clear: descMethod(function () {
    delete this._currentPath;

    this._drawingStyles = null;
    this._fillStyle = null;
    this._strokeStyle = null;
    this._subpaths.length = 0;
  }),
	copyFrom: descMethod(function (sourceGraphics) {
	 notImplemented();
  }),
	cubicCurveTo: descMethod(function (controlX1, controlY1, controlX2, controlY2, anchorX, anchorY) {
	  this._currentPath.bezierCurveTo(controlX1, controlY1, controlX2, controlY2, anchorX, anchorY);
  }),
	curveTo: descMethod(function (controlX, controlY, anchorX, anchorY) {
    this._currentPath.quadraticCurveTo(controlX, controlY, anchorX, anchorY);
	}),
  drawPath: descMethod(function (commands, data, winding) {
    notImplemented();
  }),
	drawRect: descMethod(function (x, y, w, h) {
		if (isNaN(w + h))
			throw ArgumentError();

    this._currentPath.rect(x, y, w, h);
	}),
	drawRoundRect: descMethod(function (x, y, w, h, ellipseWidth, ellipseHeight) {
		if (isNaN(w + h + ellipseWidth) ||
				(ellipseHeight !== undefined && isNaN(ellipseHeight)))
			throw ArgumentError();

    notImplemented();
  }),
	drawRoundRectComplex: descMethod(
    function (x, y, w, h, topLeftRadius, topRightRadius, bottomLeftRadius, bottomRightRadius) {
		  if (isNaN(h + topLeftRadius + topRightRadius + bottomLeftRadius + bottomRightRadius))
			 throw ArgumentError();

      notImplemented();
    }
  ),
	drawTriangles: descMethod(function (vertices, indices, uvtData, culling) {
	 notImplemented();
  }),
	endFill: descMethod(function () {
    this._currentPath.closePath();
  }),
	lineBitmapStyle: descMethod(function (bitmap, matrix, repeat, smooth) {
	 notImplemented();
  }),
	lineGradientStyle: descMethod(
    function (type, colors, alphas, ratios, matrix, spreadMethod, interpolationMethod, focalPoint) {
      notImplemented();
	  }
  ),
	lineStyle: descMethod(
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
	moveTo: descMethod(function (x, y) {
    this._currentPath.moveTo(x, y);
  }),
	lineTo: descMethod(function (x, y) {
    this._currentPath.lineTo(x, y);
  }),

  _currentPath: descLazyProp('_currentPath', function () {
    var path = new Kannvas.Path;
    path.drawingStyles = this._drawingStyles;
    path.fillStyle = this._fillStyle;
    path.strokeStyle = this._lineStyle;

    this._subpaths.push(path);

    return path;
  })
});
