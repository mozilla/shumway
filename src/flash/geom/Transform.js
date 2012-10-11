const TransformDefinition = (function () {
  var def = {
    __class__: 'flash.geom.Transform',

    ctor: function (target) {
      this._target = target;

      target._transform = this;
    },
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
      var target = this._target;
      var m = new flash.geom.Matrix;
      m.createBox(
        target._scaleX,
        target._scaleY,
        target._rotation * Math.PI / 180,
        target._x,
        target._y
      );
      return m;
    },
    set matrix(val) {
      var MatrixClass = avm2.systemDomain.getClass("flash.geom.Matrix");
      if (!MatrixClass.isInstanceOf(val))
        throw TypeError();

      var target = this._target;
      target._rotation = Math.atan2(val.b, val.a) * 180 / Math.PI;
      var sx = Math.sqrt(val.a * val.a + val.b * val.b);
      target._scaleX = val.a > 0 ? sx : -sx;
      var sy = Math.sqrt(val.d * val.d + val.c * val.c);
      target._scaleY = val.d > 0 ? sy : -sy;
      target._x = val.tx;
      target._y = val.ty;
    }
  };

  const desc = Object.getOwnPropertyDescriptor;

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
