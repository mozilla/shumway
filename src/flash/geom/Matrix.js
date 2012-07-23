function Matrix(a, b, c, d, tx, ty) {
  Object.defineProperties(this, {
    a:  describeProperty(a || 1),
    b:  describeProperty(b || 0),
    c:  describeProperty(c || 0),
    d:  describeProperty(d || 1),
    tx: describeProperty(tx || 0),
    ty: describeProperty(ty || 0)
  });
}

Matrix.prototype = Object.create(null, {
  __class__: describeProperty('flash.geom.Matrix'),

  clone: describeMethod(function () {
    return new Matrix(this.a, this.b, this.c, this.d, this.tx, this.ty);
  }),
  concat: describeMethod(function (m) {
    var a1 = this.a;
    var b1 = this.b;
    var c1 = this.c;
    var d1 = this.d;
    var tx1 = this.tx;
    var ty1 = this.ty;
    var a2 = m.a;
    var b2 = m.b;
    var c2 = m.c;
    var d2 = m.d;
    var tx2 = m.tx;
    var ty2 = m.ty;
    this.a = a1 * a2 + b1 * c2;
    this.b = a1 * b2 + b1 * d2;
    this.c = c1 * a2 + d1 * c2;
    this.d = d1 * d2 + c1 * b2;
    this.tx = (tx1 * a2 + tx2) + ty1 * c2;
    this.ty = (ty1 * d2 + ty2) + tx1 * b2;
  }),
  copyFrom: describeMethod(function (m) {
    this.a = m.a;
    this.b = m.b;
    this.c = m.c;
    this.d = m.d;
    this.tx = m.tx;
    this.ty = m.ty;
  }),
  createBox: describeMethod(function (scaleX, scaleY, rotation, tx, ty) {
    var u = Math.cos(rotation);
    var v = Math.sin(rotation);
    this.a = u * scaleX;
    this.b = v * scaleY;
    this.c = -v * scaleX;
    this.d = u * scaleY;
    this.tx = tx;
    this.ty = ty;
  }),
  createGradientBox: describeMethod(function (width, height, rotation, tx, ty) {
    this.createBox(
      width / 1638.4,
      height / 1638.4,
      rotation,
      tx + width / 2,
      ty + height / 2
    );
  }),
  deltaTransformPoint: describeMethod(function (pt) {
    return new Point(this.a * pt.x + this.c * pt.y, this.d * pt.y + this.b * pt.x);
  }),
  identity: describeMethod(function () {
    this.a = 1;
    this.b = 0;
    this.c = 0;
    this.d = 1;
    this.tx = 0;
    this.ty = 0;
  }),
  invert: describeMethod(function () {
    var a = this.a;
    var b = this.b;
    var c = this.c;
    var d = this.d;
    var tx = this.tx;
    var ty = this.ty;
    var det = a * d - b * c;
    if (!det) {
      this.identity();
      return;
    }
    det = 1 / det;
    this.a = d * det;
    this.b = -b * det;
    this.c = -c * det;
    this.d = a * det;
    this.tx = -(a * tx + c * ty);
    this.ty = -(b * tx + d * ty);
  }),

  rotate: describeMethod(function (angle) {
    var a = this.a;
    var b = this.b;
    var c = this.c;
    var d = this.d;
    var tx = this.tx;
    var ty = this.ty;
    var u = Math.cos(angle);
    var v = Math.sin(angle);
    this.a = u * a - v * b;
    this.b = v * a + u * b;
    this.c = u * c - v * d;
    this.d = v * c + u * d;
    this.tx = u * tx - v * ty;
    this.ty = v * tx + u * ty;
  }),
  scale: describeMethod(function (sx, sy) {
    this.a *= sx;
    this.b *= sy;
    this.c *= sx;
    this.d *= sy;
    this.tx *= sx;
    this.ty *= sy;
  }),
  setTo: describeMethod(function (a, b, c, d, tx, ty) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.tx = tx;
    this.ty = ty;
  }),
  toString: describeMethod(function () {
    return '(a=' + this.a +
           ', b=' + this.b +
           ', c=' + this.c +
           ', d=' + this.d +
           ', tx=' + this.tx +
           ', ty=' + this.ty;
  }),
  transformPoint: describeMethod(function (pt) {
    return new Point(
      this.a * pt.x + this.c * pt.y + this.tx,
      this.d * pt.y + this.b * pt.x + this.ty
    );
  }),
  translate: describeMethod(function (dx, dy) {
    this.tx += dx;
    this.ty += dy;
  })
});
