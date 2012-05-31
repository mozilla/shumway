function Matrix(a, b, c, d, tx, ty) {
  this.a = a || 1;
  this.b = b || 0;
  this.c = c || 0;
  this.d = d || 1;
  this.tx = tx || 0;
  this.ty = ty || 0;
}

Matrix.prototype = Object.create(null, {

  clone: {
    value: function () {
      return new Matrix(this.a, this.b, this.c, this.d, this.tx, this.ty);
    }
  },

  concat: {
    value: function (matrix) {
      this.a = this.a * matrix.a + this.b * matrix.c;
      this.b = this.a * matrix.b + this.b * matrix.d;
      this.c = this.c * matrix.a + this.d * matrix.c;
      this.d = this.d * matrix.d + this.c * matrix.b;
      this.tx = (this.tx * matrix.a + matrix.tx) + this.ty * matrix.c;
      this.ty = (this.ty * matrix.d + matrix.ty) + this.tx * matrix.b;
    }
  },

  invert: {
    value: function () {
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
    }
  },

  identity: {
    value: function () {
      this.a = this.d = 1;
      this.b = this.c = this.tx = this.ty = 0;
    }
  },

  createBox: {
    value: function (scaleX, scaleY, rotation, tx, ty) {
      var u = Math.cos(rotation);
      var v = Math.sin(rotation);
      this.a = u * scaleX;
      this.b = v * scaleY;
      this.c = -v * scaleX;
      this.d = u * scaleY;
      this.tx = tx;
      this.ty = ty;
    }
  },

  createGradientBox: {
    value: function (width, height, rotation, tx, ty) {
      this.createBox(width / 1638.4, height / 1638.4,
                     rotation,
                     tx + width / 2, ty + height / 2
      );
    }
  },

  rotate: {
    value: function (angle) {
      var u = Math.cos(angle);
      var v = Math.sin(angle);
      this.a = u * this.a  - v * this.b;
      this.b = v * this.a  + u * this.b;
      this.c = u * this.c  - v * this.d;
      this.d = v * this.c  + u * this.d;
      this.tx = u * this.tx - v * this.ty;
      this.ty = v * this.tx + u * this.ty;
    }
  },

  translate: {
    value: function (dx, dy) {
      this.tx += dx;
      this.ty += dy;
    }
  },

  scale: {
    value: function (sx, sy) {
      this.a *= sx;
      this.b *= sy;
      this.c *= sx;
      this.d *= sy;
      this.tx *= sx;
      this.ty *= sy;
    }
  },

  deltaTransformPoint: {
    value: function (point) {
      return new Point(this.a * point.x + this.c * point.y, this.d * point.y + this.b * point.x);
    }
  },

  transformPoint: {
    value: function (point) {
      return new Point(this.a * point.x + this.c * point.y + this.tx,
                       this.d * point.y + this.b * point.x + this.ty);
    }
  },

  toString: {
    value: function () {
      return '(a=' + this.a + ',' +
             ' b=' + this.b + ',' +
             ' c=' + this.c + ',' +
             ' d=' + this.d + ',' +
             ' tx=' + this.tx + ',' +
             ' ty=' + this.ty + ')';
    }
  },

  copyFrom: {
    value: function (matrix) {
      this.a = matrix.a;
      this.b = matrix.b;
      this.c = matrix.c;
      this.d = matrix.d;
      this.tx = matrix.tx;
      this.ty = matrix.ty;
    }
  },

  setTo: {
    value: function (a, b, c, d, tx, ty) {
      this.a = a;
      this.b = b;
      this.c = c;
      this.d = d;
      this.tx = tx;
      this.ty = ty;
    }
  }

});
