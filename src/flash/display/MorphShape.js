function MorphShape() {
  DisplayObject.call(this);
}

MorphShape.prototype = Object.create(DisplayObject.prototype, {
  __class__: describeInternalProperty('flash.display.MorphShape')
});
