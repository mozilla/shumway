function Sprite() {
  this._graphics = new Graphics;
}

Sprite.prototype = Object.create(new DisplayObjectContainer, {
  __class__: describeInternalProperty('flash.display.Sprite'),

  buttonMode: describeAccessor(
    function () {
      return false;
    },
    function (val) {
      notImplemented();
    }
  ),
  graphics: describeAccessor(function () {
    return this._graphics;
  }),
  hitArea: describeAccessor(
    function () {
      return null;
    },
    function (val) {
      notImplemented();
    }
  ),
  soundTransform: describeAccessor(
    function () {
      notImplemented();
    },
    function (val) {
      notImplemented();
    }
  ),
  startDrag: describeMethod(function (lockCenter, bounds) {
    notImplemented();
  }),
  startTouchDrag: describeMethod(function (touchPointID, lockCenter, bounds) {
    notImplemented();
  }),
  stopDrag: describeMethod(function () {
    notImplemented();
  }),
  stopTouchDrag: describeMethod(function (touchPointID) {
    notImplemented();
  }),
  useHandCursor: describeAccessor(
    function () {
      return true;
    },
    function (val) {
      notImplemented();
    }
  )
});
