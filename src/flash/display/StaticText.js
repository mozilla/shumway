function StaticText() {
  DisplayObject.call(this);
}

StaticText.prototype = Object.create(DisplayObject.prototype, {
  __class__: describeInternalProperty('flash.display.StaticText')
});
