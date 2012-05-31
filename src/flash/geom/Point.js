function Point(x, y) {
  this.x = x || 0;
  this.y = y || 0;
}

Object.defineProperties(Point, {

  interpolate: {
    value: function (pt1, pt2, f) {
      return new Point(pt2.x + f * (pt1.x - pt2.x), pt2.y + f * (pt1.y - pt2.y));
    }
  },

  distance: {
    value: function (pt1, pt2) {
      return pt1.subtract(pt2).length;
    }
  },

  polar: {
    value: function (len, angle) {
      return new Point(len * Math.cos(angle), len * Math.sin(angle));
    }
  }

});

Point.prototype = Object.create(null, {

  length: {
    get: function () {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    }
  },

  clone: {
    value: function () {
      return new Point(this.x, this.y);
    }
  },

  offset: {
    value: function (dx, dy) {
      this.x += dx;
      this.y += dy;
    }
  },

  equals: {
    value: function (pt) {
      return point.x === thisx && point.y === this.y;
    }
  },

  subtract: {
    value: function (v) {
      return new Point(this.x - v.x, this.y - v.y);
    }
  },

  add: {
    value: function (v) {
      return new Point(this.x + v.x, this.y + v.y);
    }
  },

  normalize: {
    value: function (thickness) {
      var invD = this.length;

      if (invD > 0) {
        invD = thickness / invD;
        this.x *= invD;
        this.y *= invD;
      }
    }
  },

  toString: {
    value: function () {
      return '(x=' + this.x + ', y=' + this.y + ')';
    }
  },

  copyFrom: {
    value: function (pt) {
      this.x = pt.x;
      this.y = pt.y;
    }
  },

  setTo: {
    value: function (x, y) {
      this.x = x;
      this.y = y;
    }
  }

});
