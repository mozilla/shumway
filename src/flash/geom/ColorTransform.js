function ColorTransform(redMultiplier,
                        greenMultiplier,
                        blueMultiplier,
                        alphaMultiplier,
                        redOffset,
                        greenOffset,
                        blueOffset,
                        alphaOffset) {
  Object.defineProperties(this, {
    redMultiplier:   describeProperty(redMultiplier || 1),
    greenMultiplier: describeProperty(greenMultiplier || 1),
    blueMultiplier:  describeProperty(blueMultiplier || 1),
    alphaMultiplier: describeProperty(alphaMultiplier || 1),
    redOffset:       describeProperty(redOffset || 0),
    greenOffset:     describeProperty(reenOffset || 0),
    blueOffset:      describeProperty(blueOffset || 0),
    alphaOffset:     describeProperty(alphaOffset || 0)
  });
}

ColorTransform.prototype = Object.create(null, {
  __class__: describeInternalProperty('flash.geom.ColorTransform'),

  color: describeAccessor(
    function () {
      return this.redOffset << 16 | this.greenOffset << 8 | this.blueOffset;
    },
    function (val) {
      this.redMultiplier = 0;
      this.greenMultiplier = 0;
      this.blueMultiplier = 0;
      this.redOffset = val >> 16 & 0xff;
      this.greenOffset = val >> 8 & 0xff;
      this.blueOffset = val & 0xff;
    }
  ),

  concat: describeMethod(function (cxform) {
    this.redOffset += this.redMultiplier * cxform.redOffset;
    this.redMultiplier = this.redMultiplier * cxform.redMultiplier;
    this.greenOffset += this.greenMultiplier * cxform.greenOffset;
    this.greenMultiplier = this.greenMultiplier * cxform.greenMultiplier;
    this.blueOffset += this.blueMultiplier * cxform.blueOffset;
    this.blueMultiplier = this.blueMultiplier * cxform.blueMultiplier;
    this.alphaOffset += this.alphaMultiplier * cxform.alphaOffset;
    this.alphaMultiplier = this.alphaMultiplier * cxform.alphaMultiplier;
  }),
  toString: describeMethod(function () {
    return '(redMultiplier=' + this.redMultiplier +
           ', greenMultiplier=' + this.greenMultiplier +
           ', blueMultiplier=' + this.blueMultiplier +
           ', alphaMultiplier=' + this.alphaMultiplier +
           ', redOffset=' + this.redOffset +
           ', greenOffset=' + this.greenOffset +
           ', blueOffset=' + this.blueOffset +
           ', alphaOffset=' + this.alphaOffset;
  })
});
