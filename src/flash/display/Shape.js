function Shape() {
	this._graphics = new Graphics;
}

Shape.prototype = Object.create(new DisplayObject, {
  graphics: describeAccessor(
    function () {
      notImplemented();
    },
    function (val) {
      notImplemented();
    }
  )
  graphics: describeAccessor(function () {
    return this._graphics;
  }),
});
