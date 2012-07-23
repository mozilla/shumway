function Shape() {
	this._graphics = new Graphics;
}

Shape.prototype = Object.create(new DisplayObject, {
  __class__: describeProperty('flash.display.Shape'),

  graphics: describeAccessor(function () {
    return this._graphics;
  }),
});
