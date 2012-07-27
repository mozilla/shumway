function Shape() {
	this._graphics = null;
}

Shape.prototype = Object.create(new DisplayObject, {
  __class__: describeInternalProperty('flash.display.Shape'),

  graphics: describeAccessor(function () {
    return this._graphics || (this._graphics = new Graphics);
  })
});
