function Point(x, y) {
  this.x = x || 0;
  this.y = y || 0;
}

Object.defineProperties(Point, {
  distance: descMethod(function (pt1, pt2) {
    return pt1.subtract(pt2).length;
  }),
  interpolate: descMethod(function (pt1, pt2, f) {
    return new Point(pt2.x + f * (pt1.x - pt2.x), pt2.y + f * (pt1.y - pt2.y));
  }),
  polar: descMethod(function (len, angle) {
    return new Point(len * Math.cos(angle), len * Math.sin(angle));
  })
});

Point.prototype = Object.create(null, {
  length: descAccessor(
    function () {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    }
  ),

  add: descMethod(function (v) {
    return new Point(this.x + v.x, this.y + v.y);
  }),
  clone: descMethod(function () {
    return new Point(this.x, this.y);
  }),
  copyFrom: descMethod(function (pt) {
    this.x = pt.x;
    this.y = pt.y;
  }),
  equals: descMethod(function (pt) {
    return this.x === pt.x && this.y === pt.y;
  }),
  normalize: descMethod(function (len) {
    var current = Math.sqrt(this.x * this.x + this.y * this.y);
    if (current > 0) {
      var scale = len / current;
      this.x *= scale;
      this.y *= scale;
    }
  }),
  offset: descMethod(function (dx, dy) {
    this.x += dx;
    this.y += dy;
  }),
  setTo: descMethod(function (x, y) {
    this.x = x;
    this.y = y;
  }),
  subtract: descMethod(function (v) {
    return new Point(this.x - v.x, this.y - v.y);
  }),
  toString: descMethod(function () {
    return '(x=' + this.x + ', y=' + this.y + ')';
  })
});
