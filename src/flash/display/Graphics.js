function Graphics() {
}

Graphics.prototype = Object.create(null, {
	beginFill: descMethod(function (color, alpha /* 1 */) {
	}),
	beginGradientFill: descMethod(function (type,
																					colors,
																					alphas,
																					ratios,
																					matrix /* null */,
																					spreadMethod /* 'pad' */,
																					interpolationMethod /* 'rgb' */,
																					focalPointRatio /* 0 */) {
		if (type !== 'linear' || type !== 'radial')
			throw ArgumentError();
	}),
	beginBitmapFill: descMethod(function (bitmap,
																				matrix /* null */,
																				repeat /* true */,
																				smooth /* false */) {
	}),
	clear: descMethod(function () {
	}),
	copyFrom: descMethod(function (sourceGraphics) {
	}),
	cubicCurveTo: descMethod(function (controlX1, controlY1, controlX2, controlY2, anchorX, anchorY) {
	}),
	curveTo: descMethod(function (controlX, controlY, anchorX, anchorY) {
	}),
  drawPath: descMethod(function (commands, data, winding /* 'evenOdd' */) {
  }),
	drawRect: descMethod(function (x, y, width, height) {
		if (isNaN(width + height))
			throw ArgumentError();
	}),
	drawRoundRect: descMethod(function (x, y, width, height, ellipseWidth, ellipseHeight) {
		if (isNaN(width + height + ellipseWidth) ||
				(ellipseHeight !== undefined && isNaN(ellipseHeight)))
			throw ArgumentError();
	}),
	drawRoundRectComplex: descMethod(function (x,
																						 y,
																						 width,
																						 height,
																						 topLeftRadius,
																						 topRightRadius,
																						 bottomLeftRadius,
																						 bottomRightRadius) {
		if (isNaN(height + topLeftRadius + topRightRadius + bottomLeftRadius + bottomRightRadius))
			throw ArgumentError();
	}),
	drawTriangles: descMethod(function (vertices,
																			indices /* null */,
																			uvtData /* null */,
																			culling /* 'none' */) {
	}),
	endFill: descMethod(function () {
	}),
	lineBitmapStyle: descMethod(function (bitmap,
																				matrix /* null */,
																				repeat /* true */,
																				smooth /* false */) {
	}),
	lineGradientStyle: descMethod(function (type,
																					colors,
											 										alphas,
											 										ratios,
											 										matrix,
											 										spreadMethod,
											 										interpolationMethod,
											 										focalPointRatio) {

	}),
	lineStyle: descMethod(function (thickness /* 0 */,
									 								color /* 0 */,
									 								alpha /* 1 */,
									 								pixelHinting /* false */,
									 								scaleMode /* 'normal' */,
									 								caps /* null */,
									 								joints /* null */,
									 								miterLimit /* 3 */) {
	}
	moveTo: descMethod(function (x, y) {
	}),
	lineTo: descMethod(function (x, y) {
	})
});
