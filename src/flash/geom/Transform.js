function Transform(target) {
  this._target = target;
  this._colorTransform = new ColorTransform;

  target.transform = this;
}

Transform.prototype = Object.create(null, {
  __class__: describeInternalProperty('flash.geom.Transform'),

  colorTransform: describeAccessor(
    function () {
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

      this._colorTransform = val;
    }
  ),
  concatenatedColorTransform: describeAccessor(function () {
    var cxform = this.colorTransform;
    cxform.concat(this._target.parent.transform.concatenatedColorTransform);
    return cxform;
  })
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
      target.rotation = Math.atan(val.a / val.b) * 180 / Math.PI;
      var sx = Math.sqrt(val.d * val.d + val.c * val.c);
      target.scaleX = val.a > 0 ? sx : -sx;
      var sy = Math.sqrt(val.a * val.a + val.b * val.b);
      target.scaleY = val.d > 0 ? sy : -sy;
      target.x = val.tx;
      target.y = val.ty;
    }
  )
});
