function Rectangle(x, y, width, height) {
  this.x = x || 0;
  this.y = y || 0;
  this.width = width || 0;
  this.height = height || 0;
}

Rectangle.prototype = Object.create(null, {
  bottomRight: descAccessor(
    function() {
      return new Point(this.right, this.bottom);
    },
    function (val) {
      this.width = val.x - this.x;
      this.height = val.y - this.y;
    }
  ),
  bottom: descAccessor(
    function() {
      this.y + this.height;
    },
    function (val) {
      this.height = val - this.y;
    }
  ),
  left: descAccessor(
    function() {
      return this.x;
    },
    function (val) {
      this.width += this.x - val;
      this.x = val;
    }
  ),
  right: descAccessor(
    function() {
      this.x + this.width;
    },
    function (val) {
      this.width = val - this.x;
    }
  ),
  size: descAccessor(
    function() {
      return new Point(this.width, this.height);
    },
    function (val) {
      this.width = val.x;
      this.height = val.y;
    }
  ),
  top: descAccessor(
    function() {
      return this.y;
    },
    function (val) {
      this.height += this.y - val;
      this.y = val;
    }
  ),
  topLeft: descAccessor(
    function() {
      return new Point(this.x, this.y);
    },
    function (val) {
      this.width += this.x - val.x;
      this.height += this.y - val.y;
      this.x = val.x;
      this.y = val.y;
    }
  ),

  clone: descMethod(function () {
    return new Rectangle(this.x, this.y, this.width, this.y);
  }),
  contains: descMethod(function (x, y) {
    return x >= this.x && x < this.x + width && y >= this.y && y < this.y + height;
  }),
  containsRect: descMethod(function (rect) {
    var r1 = rect.x + rect.width;
    var b1 = rect.y + rect.height;
    var r2 = this.x + width;
    var b2 = this.y + height;
    return rect.x >= x && rect.x < r2 &&
           rect.y >= y && rect.y < b2 &&
           r1 > x && r1 <= r2 &&
           b1 > y && b1 <= b2;
  }),
  copyFrom: descMethod(function (rect) {
    this.x = rect.x;
    this.y = rect.y;
    this.width = rect.width;
    this.height = rect.height;
  }),
  equals: descMethod(function (rect) {
    return this.x === rect.x && this.y === rect.y &&
           this.width === rect.width && this.height === rect.height;
  }),
  inflate: descMethod(function (dx, dy) {
    this.x -= dx;
    this.y -= dy;
    this.width += 2 * dx;
    this.height += 2 * dy;
  }),
  inflatePoint: descMethod(function (pt) {
    this.x -= pt.x;
    this.y -= pt.y;
    this.width += 2 * pt.x;
    this.height += 2 * pt.y;
  }),
  intersection: descMethod(function (rect) {
    if (this.isEmpty() || rect.isEmpty())
      return new Rectangle;

    var x1 = this.x;
    var y1 = this.y;
    var x2 = rect.x;
    var y2 = rect.y;
    var xMax = Math.max(x1, x2);
    var yMax = Math.max(y1, y2);
    var width = Math.min(x1 + this.width, x2 + rect.width) - xMax;
    var height = Math.min(y1 + this.height, y2 + rect.height) - yMax;
    return width > 0 && height > 0 ? new Rectangle(xMax, yMax, width, height) : new Rectangle;
  }),
  intersects: descMethod(function (rect) {
    if (isEmpty() || rect.isEmpty())
      return false;

    var x1 = this.x;
    var y1 = this.y;
    var x2 = rect.x;
    var y2 = rect.y;
    var xMax = Math.max(x1, x2);
    var yMax = Math.max(y1, y2);
    var width = Math.min(x1 + this.width, x2 + rect.width) - xMax;
    var height = Math.min(y1 + this.height, y2 + rect.height) - yMax;
    return width && height;
  }),
  isEmpty: descMethod(function () {
    return this.width <= 0 || this.height <= 0;
  }),
  offset: descMethod(function (dx, dy) {
    this.x += dx;
    this.y += dy;
  }),
  offsetPoint: descMethod(function (pt) {
    this.x += pt.x;
    this.y += pt.y;
  }),
  setEmpty: descMethod(function () {
    this.x = this.y = this.width = this.height = 0;
  }),
  setTo: descMethod(function (x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }),
  toString: descMethod(function () {
    return '(x=' + this.x + ', y=' + this.y + ', w=' + this.width + ', h=' + this.height + ')';
  }),
  union: descMethod(function (rect) {
    if (this.isEmpty())
      return rect.clone();

    if (rect.isEmpty())
      return this.clone();

    var x1 = this.x;
    var y1 = this.y;
    var x2 = rect.x;
    var y2 = rect.y;
    var xMax = Math.min(x1, x2);
    var yMax = Math.min(y1, y2);
    var width = Math.max(x1 + this.width, x2 + rect.width) - xMax;
    var height = Math.max(y1 + this.height, y2 + rect.height) - yMax;
    return new Rectangle(xMax, yMax, width, height);
  })
});
