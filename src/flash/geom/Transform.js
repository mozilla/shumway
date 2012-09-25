function Transform(target) {
  this._cxform = { };
  this._target = target;

  target._transform = this;
}

Transform.prototype = describePrototype({
  __class__: describeInternalProperty('flash.geom.Transform'),

  colorTransform: describeAccessor(
    function () {
      var cxform = this._cxform;
      return new ColorTransform(
        cxform.redMultiplier,
        cxform.greenMultiplier,
        cxform.blueMultiplier,
        cxform.alphaMultiplier,
        cxform.redOffset,
        cxform.greenOffset,
        cxform.blueOffset,
        cxform.alphaOffset
      );
    },
    function (val) {
      if (!(val instanceof ColorTransform))
        throw TypeError();

      this._cxform = {
        redMultiplier: val.redMultiplier,
        greenMultiplier: val.greenMultiplier,
        blueMultiplier: val.blueMultiplier,
        alphaMultiplier: val.alphaMultiplier,
        redOffset: val.redOffset,
        greenOffset: val.greenOffset,
        blueOffset: val.blueOffset,
        alphaOffset: val.alphaOffset
      };
    }
  ),
  concatenatedColorTransform: describeAccessor(function () {
    var cxform = this.colorTransform;
    cxform.concat(this._target.parent.transform.concatenatedColorTransform);
    return cxform;
  }),
  concatenatedMatrix: describeAccessor(function () {
    var m = this.matrix;
    m.concat(this._target.parent.transform.concatenatedMatrix);
    return m;
  }),
  matrix: describeAccessor(
    function () {
      var target = this._target;
      var m = new Matrix;
      m.createBox(
        target.scaleX,
        target.rotation * Math.PI / 180,
        target.scaleY,
        target.x,
        target.y
      );
      return m;
    },
    function (val) {
      if (!(val instanceof Matrix))
        throw TypeError();

      var target = this._target;
      target.rotation = Math.atan2(val.a, val.b) * 180 / Math.PI;
      var sx = Math.sqrt(val.d * val.d + val.c * val.c);
      target.scaleX = val.a > 0 ? sx : -sx;
      var sy = Math.sqrt(val.a * val.a + val.b * val.b);
      target.scaleY = val.d > 0 ? sy : -sy;
      target.x = val.tx;
      target.y = val.ty;
    }
  )
});
