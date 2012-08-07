function Shape() {
  DisplayObject.call(this);

	this._graphics = new Graphics;
}

Shape.prototype = Object.create(DisplayObject.prototype, {
  __class__: describeInternalProperty('flash.display.Shape'),

  graphics: describeAccessor(function () {
    return this._graphics;
  })
});
