function Shape() {
	this._graphics = new Graphics;
}

Shape.prototype = Object.create(new DisplayObject, {
  __class__: describeInternalProperty('flash.display.Shape'),

  graphics: describeAccessor(function () {
    return this._graphics;
  }),
});
