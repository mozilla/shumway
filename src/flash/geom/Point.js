function Point(x, y) {
  Object.defineProperties(this, {
    x: describeProperty(x || 0),
    y: describeProperty(y || 0)
  });
}

Object.defineProperties(Point, {
  distance: describeMethod(function (pt1, pt2) {
    return pt1.subtract(pt2).length;
  }),
  interpolate: describeMethod(function (pt1, pt2, f) {
    return new Point(pt2.x + f * (pt1.x - pt2.x), pt2.y + f * (pt1.y - pt2.y));
  }),
  polar: describeMethod(function (len, angle) {
    return new Point(len * Math.cos(angle), len * Math.sin(angle));
  })
});

Point.prototype = Object.create(null, {
  __class__: describeProperty('flash.geom.Point'),

  length: describeAccessor(
    function () {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    }
  ),

  add: describeMethod(function (v) {
    return new Point(this.x + v.x, this.y + v.y);
  }),
  clone: describeMethod(function () {
    return new Point(this.x, this.y);
  }),
  copyFrom: describeMethod(function (pt) {
    this.x = pt.x;
    this.y = pt.y;
  }),
  equals: describeMethod(function (pt) {
    return this.x === pt.x && this.y === pt.y;
  }),
  normalize: describeMethod(function (len) {
    var current = Math.sqrt(this.x * this.x + this.y * this.y);
    if (current > 0) {
      var scale = len / current;
      this.x *= scale;
      this.y *= scale;
    }
  }),
  offset: describeMethod(function (dx, dy) {
    this.x += dx;
    this.y += dy;
  }),
  setTo: describeMethod(function (x, y) {
    this.x = x;
    this.y = y;
  }),
  subtract: describeMethod(function (v) {
    return new Point(this.x - v.x, this.y - v.y);
  }),
  toString: describeMethod(function () {
    return '(x=' + this.x + ', y=' + this.y + ')';
  })
});
