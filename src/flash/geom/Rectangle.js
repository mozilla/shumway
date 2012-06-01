function Rectangle(x, y, width, height) {
  this.x = x || 0;
  this.y = y || 0;
  this.width = width || 0;
  this.height = height || 0;
}

Rectangle.prototype = Object.create(null, {
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
  top: descAccessor(
    function() {
      return this.y;
    },
    function (val) {
      this.height += this.y - val;
      this.y = val;
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
  bottomRight: descAccessor(
    function() {
      return new Point(this.right, this.bottom);
    },
    function (val) {
      this.width = val.x - this.x;
      this.height = val.y - this.y;
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

  clone: descMethod(function () {
    return new Rectangle(this.x, this.y, this.width, this.y);
  }),
  isEmpty: descMethod(function () {
    return this.width <= 0 || this.height <= 0;
  }),
  setEmpty: descMethod(function () {
    this.x = this.y = this.width = this.height = 0;
  }),
  inflate: descMethod(function (dx, dy) {
    this.x -= dx;
    this.width += 2 * dx;
    this.y -= dy;
    this.height += 2 * dy;
  }),
  inflatePoint: descMethod(function (pt) {
    this.x -= pt.x;
    this.width += 2 * pt.x;
    this.y -= pt.y;
    this.height += 2 * pt.y;
  }),
  offset: descMethod(function (dx, dy) {
    this.x += dx;
    this.y += dy;
  }),
  offsetPoint: descMethod(function (pt) {
    this.x += pt.x;
    this.y += pt.y;
  }),
  contains: descMethod(function (x, y) {
    return x >= this.x &&
           x < this.x + width &&
           y >= this.y &&
           y < this.y + height;
  }),
  containsRect: descMethod(function (rect) {
    var r1 = rect.x + rect.width;
    var b1 = rect.y + rect.height;
    var r2 = this.x + width;
    var b2 = this.y + height;

    return rect.x >= x &&
           rect.x < r2 &&
           rect.y >= y &&
           rect.y < b2 &&
           r1 > x &&
           r1 <= r2 &&
           b1 > y &&
           b1 <= b2;
  }),
  intersection: descMethod(function (rect) {
    if (this.isEmpty() || rect.isEmpty())
      return new Rectangle;

    var x = Math.max(this.x, rect.x);
    var y = Math.max(this.y, rect.y);
    var width = Math.min(this.x + this.width, rect.x + rect.width) - x;
    var height = Math.min(this.y + this.height, rect.y + rect.height) - y;

    if (width <= 0 || height <= 0)
      x = y = width = height = 0;

    return new Rectangle(x, y, width, height);
  }),
  intersects: descMethod(function (rect) {
    if (isEmpty() || rect.isEmpty())
      return false;

    var x = Math.max(this.x, rect.x);
    var y = Math.max(this.y, rect.y);
    var width = Math.min(this.x + this.width, rect.x + rect.width) - x;
    var height = Math.min(this.y + this.height, rect.y + rect.height) - y;

    return width && height;
  }),
  union: descMethod(function (rect) {
    if (this.isEmpty())
      return rect.clone();

    if (rect.isEmpty())
      return this.clone();

    var x = Math.min(this.x, rect.x);
    var y = Math.min(this.y, rect.y);
    var width = Math.max(this.x + this.width, rect.x + rect.width) - x;
    var height = Math.max(this.y + this.height, rect.y + rect.height) - y;

    return new Rectangle(x, y, width, height);
  }),
  equals: descMethod(function (rect) {
    return rect.x  === this.x && rect.y === this.y &&
           rect.width === this.width && rect.height === this.height;
  }),
  toString: descMethod(function () {
    return '(x=' + this.x + ',' +
           ' y=' + this.y + ',' +
           ' w=' + this.width + ',' +
           ' h=' + this.height + ')';
  }),
  copyFrom: descMethod(function (rect) {
    this.x = rect.x;
    this.y = rect.y;
    this.width = rect.width;
    this.height = rect.height;
  }),
  setTo: descMethod(function (x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  })
});
