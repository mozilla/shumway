function Shape() {
}

Shape.prototype = Object.create(new DisplayObject, {
  graphics: descAccessor(
    function () {
      notImplemented();
    },
    function (val) {
      notImplemented();
    }
  )
});
