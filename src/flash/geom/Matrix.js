function Matrix(a, b, c, d, tx, ty) {
  this.a = a || 1;
  this.b = b || 0;
  this.c = c || 0;
  this.d = d || 1;
  this.tx = tx || 0;
  this.ty = ty || 0;
}

Matrix.prototype = Object.create(null, {
  clone: descMethod(function () {
    return new Matrix(this.a, this.b, this.c, this.d, this.tx, this.ty);
  }),
  concat: descMethod(function (m) {
    this.a = this.a * m.a + this.b * m.c;
    this.b = this.a * m.b + this.b * m.d;
    this.c = this.c * m.a + this.d * m.c;
    this.d = this.d * m.d + this.c * m.b;
    this.tx = (this.tx * m.a + m.tx) + this.ty * m.c;
    this.ty = (this.ty * m.d + m.ty) + this.tx * m.b;
  }),
  invert: descMethod(function () {
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
  identity: descMethod(function () {
    this.a = this.d = 1;
    this.b = this.c = this.tx = this.ty = 0;
  }),
  createBox: descMethod(function (scaleX, scaleY, rotation, tx, ty) {
    var u = Math.cos(rotation);
    var v = Math.sin(rotation);
    this.a = u * scaleX;
    this.b = v * scaleY;
    this.c = -v * scaleX;
    this.d = u * scaleY;
    this.tx = tx;
    this.ty = ty;
  }),
  createGradientBox: descMethod(function (width, height, rotation, tx, ty) {
    this.createBox(
      width / 1638.4,
      height / 1638.4,
      rotation,
      tx + width / 2,
      ty + height / 2
    );
  }),
  rotate: descMethod(function (angle) {
    var u = Math.cos(angle);
    var v = Math.sin(angle);
    this.a = u * this.a - v * this.b;
    this.b = v * this.a + u * this.b;
    this.c = u * this.c - v * this.d;
    this.d = v * this.c + u * this.d;
    this.tx = u * this.tx - v * this.ty;
    this.ty = v * this.tx + u * this.ty;
  }),
  translate: descMethod(function (dx, dy) {
    this.tx += dx;
    this.ty += dy;
  }),
  scale: descMethod(function (sx, sy) {
    this.a *= sx;
    this.b *= sy;
    this.c *= sx;
    this.d *= sy;
    this.tx *= sx;
    this.ty *= sy;
  }),
  deltaTransformPoint: descMethod(function (pt) {
    return new Point(
      this.a * pt.x + this.c * pt.y,
      this.d * pt.y + this.b * pt.x
    );
  }),
  transformPoint: descMethod(function (pt) {
    return new Point(
      this.a * pt.x + this.c * pt.y + this.tx,
      this.d * pt.y + this.b * pt.x + this.ty
    );
  }),
  toString: descMethod(function () {
    return '(a=' + this.a + ',' +
           ' b=' + this.b + ',' +
           ' c=' + this.c + ',' +
           ' d=' + this.d + ',' +
           ' tx=' + this.tx + ',' +
           ' ty=' + this.ty + ')';
  }),
  copyFrom: descMethod(function (m) {
    this.a = m.a;
    this.b = m.b;
    this.c = m.c;
    this.d = m.d;
    this.tx = m.tx;
    this.ty = m.ty;
  }),
  setTo: descMethod(function (a, b, c, d, tx, ty) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.tx = tx;
    this.ty = ty;
  })
});
