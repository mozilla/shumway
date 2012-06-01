function ColorTransform(redMultiplier,
						            greenMultiplier,
						            blueMultiplier,
						            alphaMultiplier,
						            redOffset,
						            greenOffset,
						            blueOffset,
						            alphaOffset) {
  this.redMultiplier = redMultiplier || 1;
  this.greenMultiplier = greenMultiplier || 1;
  this.blueMultiplier = blueMultiplier || 1;
  this.alphaMultiplier = alphaMultiplier || 1;
  this.redOffset = redOffset || 0;
  this.greenOffset = greenOffset || 0;
  this.blueOffset = blueOffset || 0;
  this.alphaOffset = alphaOffset || 0;
}

ColorTransform.prototype = Object.create(null, {
  color: descAccessor(
    function () {
      return this.redOffset << 16 | this.greenOffset << 8 | this.blueOffset;
    },
    function (val) {
      this.redMultiplier = this.greenMultiplier = this.blueMultiplier = 0;
      this.redOffset = val >> 16 & 0xff;
      this.greenOffset = val >> 8 & 0xff;
      this.blueOffset = val & 0xff;
    }
  ),

  concat: descMethod(function (cxform) {
    this.redOffset += this.redMultiplier * cxform.redOffset;
    this.redMultiplier = this.redMultiplier * cxform.redMultiplier;
    this.greenOffset += this.greenMultiplier * cxform.greenOffset;
    this.greenMultiplier = this.greenMultiplier * cxform.greenMultiplier;
    this.blueOffset += this.blueMultiplier * cxform.blueOffset;
    this.blueMultiplier = this.blueMultiplier * cxform.blueMultiplier;
    this.alphaOffset += this.alphaMultiplier * cxform.alphaOffset;
    this.alphaMultiplier = this.alphaMultiplier * cxform.alphaMultiplier;
  }),
  toString: descMethod(function () {
    return '(redMultiplier=' + this.redMultiplier + ',' +
           ' greenMultiplier=' + this.greenMultiplier + ',' +
           ' blueMultiplier=' + this.blueMultiplier + ',' +
           ' alphaMultiplier=' + this.alphaMultiplier + ',' +
           ' redOffset=' + this.redOffset + ',' +
           ' greenOffset=' + this.greenOffset + ',' +
           ' blueOffset=' + this.blueOffset + ',' +
           ' alphaOffset=' + this.alphaOffset +')';
  })
});
