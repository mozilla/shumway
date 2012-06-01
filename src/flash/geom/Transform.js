function Transform(target) {
  this._target = target;
  this._colorTransform = new ColorTransform;
  target.transform = this;
}

Transform.prototype = Object.create(null, {
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
      target.x = val.tx;
      target.y = val.ty;
      var sx = Math.sqrt(d * d + c * c);
      target.scaleX = a > 0 ? sx : -sx;
      var sy = Math.sqrt(a * a + b * b);
      target.scaleY = d > 0 ? sy : -sy;
      target.rotation = Math.atan(a/b) * 180 / Math.PI;
    }
  ),
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
  concatenatedMatrix: descAccessor(function () {
    var m = this.matrix;

    m.concat(this._target.parent.transform.concatenatedMatrix);

    return m;
  }),
  concatenatedColorTransform: descAccessor(function () {
    var cxform = this.colorTransform;

    cxform.concat(this._target.parent.transform.concatenatedColorTransform);

    return cxform;
  })
});
