function Graphics() {
  this.statements = [];
}

var p = Graphics.prototype;
p.clear = function () {
  this.statements = [];
}

p.beginFill = function (color, alpha) {
  this.statements.push('fillStyle=' + toStringRgba(color));
};

p.beginGradientFill = function (type,
                                colors,
                                alphas,
                                ratios,
                                matrix,
                                spreadMethod,
                                interpolationMethod,
                                focalPointRatio) {
  notImplemented();
};

p.beginBitmapFill = function (bitmap, matrix, repeat, smooth) { notImplemented(); };
p.beginShaderFill = function (shader, matrix) { notImplemented(); };
p.lineGradientStyle = function (type,
                                colors,
                                alphas,
                                ratios,
                                matrix,
                                spreadMethod,
                                interpolationMethod,
                                focalPointRatio) {
  notImplemented();
};

p.lineStyle = function (thickness,
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

p.drawRect = function (x, y, width, height) {
  this.statements.push('drawRect(' + [x, y, width, height].join(',') + ')');
};

p.drawRoundRect = function (x, y, width, height, ellipseWidth, ellipseHeight) {
  notImplemented();
};

p.drawRoundRectComplex = function (x, y,
                                   width, height,
                                   topLeftRadius, topRightRadius,
                                   bottomLeftRadius, bottomRightRadius) {
  notImplemented();
};

p.moveTo = function (x, y) {
  this.statements.push('moveTo(' + x + ',' + y + ')');
};

p.lineTo = function (x, y) {
  this.statements.push('lineTo(' + x + ',' + y + ')');
};

p.curveTo = function (controlX, controlY, anchorX, anchorY) {
  this.statements.push('quadraticCurveTo(' + slice.call(arguments).join(',') + ')');
};

p.cubicCurveTo = function (controlX1, controlY1, controlX2, controlY2, anchorX, anchorY) {
  this.statements.push('bezierCurveTo(' + slice.call(arguments).join(',') + ')');
};

p.endFill = function () {
  this.statements.push('fill()');
  this.statements.push('stroke()');
};

p.copyFrom = function (sourceGraphics) { notImplemented(); };
p.lineBitmapStyle = function (bitmap, matrix, repeat, smooth) { notImplemented(); };
p.lineShaderStyle = function (shader, matrix) { notImplemented(); };
p.drawPath = function (commands, data, winding) { notImplemented(); };
p.drawTriangles = function (vertices, indices, uvtData, culling) { notImplemented(); };

natives.GraphicsClass = function (scope, instance, baseClass) {
  var c = new Class("Graphics", Graphics, Class.passthroughCallable(Graphics));
  c.baseClass = baseClass;
  c.nativeMethods = p;
  return c;
};
