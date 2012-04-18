function Graphics() {
  this.statements = [];
}

Graphics.prototype.clear = function () {
  this.statements = [];
}

Graphics.prototype.beginFill = function (color, alpha) {
  this.statements.push('fillStyle=' + toStringRgba(color));
};

Graphics.prototype.beginGradientFill = function (type,
                                colors,
                                alphas,
                                ratios,
                                matrix,
                                spreadMethod,
                                interpolationMethod,
                                focalPointRatio) {
  notImplemented();
};

Graphics.prototype.beginBitmapFill = function (bitmap, matrix, repeat, smooth) {
  notImplemented();
};
Graphics.prototype.beginShaderFill = function (shader, matrix) { notImplemented(); };
Graphics.prototype.lineGradientStyle = function (type,
                                colors,
                                alphas,
                                ratios,
                                matrix,
                                spreadMethod,
                                interpolationMethod,
                                focalPointRatio) {
  notImplemented();
};

Graphics.prototype.lineStyle = function (thickness,
                        color,
                        alpha,
                        pixelHinting,
                        scaleMode,
                        caps,
                        joints,
                        miterLimit) {
  var s = this.statements;
  s.push('lineWidth=' + thickness);
  s.push('strokeStyle=' + toStringRgba(color));
  s.push('lineCap=' + caps);
  s.push('lineJoin=' + joints);
  s.push('miterLimit=' + miterLimit);
};

Graphics.prototype.drawRect = function (x, y, width, height) {
  this.statements.push('drawRect(' + [x, y, width, height].join(',') + ')');
};

Graphics.prototype.drawRoundRect = function (x, y, width, height, ellipseWidth, ellipseHeight) {
  notImplemented();
};

Graphics.prototype.drawRoundRectComplex = function (x, y,
                                   width, height,
                                   topLeftRadius, topRightRadius,
                                   bottomLeftRadius, bottomRightRadius) {
  notImplemented();
};

Graphics.prototype.moveTo = function (x, y) {
  this.statements.push('moveTo(' + x + ',' + y + ')');
};

Graphics.prototype.lineTo = function (x, y) {
  this.statements.push('lineTo(' + x + ',' + y + ')');
};

Graphics.prototype.curveTo = function (controlX, controlY, anchorX, anchorY) {
  this.statements.push('quadraticCurveTo(' + slice.call(arguments).join(',') + ')');
};

Graphics.prototype.cubicCurveTo = function (controlX1, controlY1,
                                            controlX2, controlY2,
                                            anchorX, anchorY) {
  this.statements.push('bezierCurveTo(' + slice.call(arguments).join(',') + ')');
};

Graphics.prototype.endFill = function () {
  this.statements.push('fill()');
  this.statements.push('stroke()');
};

Graphics.prototype.copyFrom = function (sourceGraphics) { notImplemented(); };
Graphics.prototype.lineBitmapStyle = function (bitmap, matrix, repeat, smooth) {
  notImplemented();
};
Graphics.prototype.lineShaderStyle = function (shader, matrix) { notImplemented(); };
Graphics.prototype.drawPath = function (commands, data, winding) { notImplemented(); };
Graphics.prototype.drawTriangles = function (vertices, indices, uvtData, culling) {
  notImplemented();
};

natives.GraphicsClass = function (scope, instance, baseClass) {
  var c = new Class("Graphics", Graphics, Class.passthroughCallable(Graphics));
  c.baseClass = baseClass;
  c.nativeMethods = Graphics.prototype;
  return c;
};
