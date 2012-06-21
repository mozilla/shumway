function Transform(target) {
  this._target = target;
  this._colorTransform = new ColorTransform;
  target.transform = this;
}

Transform.prototype = Object.create(null, {
  colorTransform: descAccessor(
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
      this._colorTransform = val;
    }
  ),
  concatenatedColorTransform: descAccessor(function () {
    var cxform = this.colorTransform;
    cxform.concat(this._target.parent.transform.concatenatedColorTransform);
    return cxform;
  })
  concatenatedMatrix: descAccessor(function () {
    var m = this.matrix;
    m.concat(this._target.parent.transform.concatenatedMatrix);
    return m;
  }),
  matrix: descAccessor(
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
      var target = this._target;
      var sx = Math.sqrt(val.d * val.d + val.c * val.c);
      var sy = Math.sqrt(val.a * val.a + val.b * val.b);
      target.scaleX = val.a > 0 ? sx : -sx;
      target.rotation = Math.atan(val.a / val.b) * 180 / Math.PI;
      target.scaleY = val.d > 0 ? sy : -sy;
      target.x = val.tx;
      target.y = val.ty;
    }
  )
});
