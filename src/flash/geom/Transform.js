var TransformDefinition = (function () {
  var def = {
    __class__: 'flash.geom.Transform',

    get colorTransform() {
      var cxform = this._target._cxform;
      if (cxform) {
        return new flash.geom.ColorTransform(
          cxform.redMultiplier,
          cxform.greenMultiplier,
          cxform.blueMultiplier,
          cxform.alphaMultiplier,
          cxform.redOffset,
          cxform.greenOffset,
          cxform.blueOffset,
          cxform.alphaOffset
        );
      } else {
        return new flash.geom.ColorTransform;
      }
    },
    set colorTransform(val) {
      var CTClass = avm2.systemDomain.getClass("flash.geom.ColorTransform");
      if (!CTClass.isInstanceOf(val))
        throw TypeError();

      this._target._cxform = {
        redMultiplier: val.redMultiplier,
        greenMultiplier: val.greenMultiplier,
        blueMultiplier: val.blueMultiplier,
        alphaMultiplier: val.alphaMultiplier,
        redOffset: val.redOffset,
        greenOffset: val.greenOffset,
        blueOffset: val.blueOffset,
        alphaOffset: val.alphaOffset
      };
    },
    get concatenatedColorTransform() {
      var cxform = this.colorTransform;
      cxform.concat(this._target.parent.transform.concatenatedColorTransform);
      return cxform;
    },
    get concatenatedMatrix() {
      var m = this.matrix;
      m.concat(this._target.parent.transform.concatenatedMatrix);
      return m;
    },
    get matrix() {
      var m = this._target._currentTransform;
      return new flash.geom.Matrix(m.a, m.b, m.c, m.d, m.tx, m.ty);
    },
    set matrix(val) {
      var MatrixClass = avm2.systemDomain.getClass("flash.geom.Matrix");
      if (!MatrixClass.isInstanceOf(val))
        throw TypeError();

      var a = val.a;
      var b = val.b;
      var c = val.c;
      var d = val.d;
      var tx = val.tx;
      var ty = val.ty;

      var target = this._target;
      target._rotation = Math.atan2(b, a) * 180 / Math.PI;
      var sx = Math.sqrt(a * a + b * b);
      target._scaleX = a > 0 ? sx : -sx;
      var sy = Math.sqrt(d * d + c * c);
      target._scaleY = d > 0 ? sy : -sy;
      target._x = val.tx;
      target._y = val.ty;

      target._currentTransform = {
        a: a,
        b: b,
        c: c,
        d: d,
        tx: tx,
        ty: ty
      };
    },

    ctor: function (target) {
      this._target = target;

      target._transform = this;
    }
  };

  var desc = Object.getOwnPropertyDescriptor;

  def.__glue__ = {
    native: {
      instance: {
        colorTransform: desc(def, "colorTransform"),
        concatenatedColorTransform: desc(def, "concatenatedColorTransform"),
        concatenatedMatrix: desc(def, "concatenatedMatrix"),
        matrix: desc(def, "matrix"),
        ctor: def.ctor
      }
    }
  };

  return def;
}).call(this);
