function Shape() {
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
});
