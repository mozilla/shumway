function Sprite() {
}

Sprite.prototype = Object.create(new DisplayObjectContainer, {
  buttonMode: describeAccessor(
    function () {
      return false;
    },
    function (val) {
      notImplemented();
    }
  ),
  graphics: describeAccessor(
    function () {
      notImplemented();
    },
    function (val) {
      notImplemented();
    }
  ),
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
  toString: describeMethod(function () {
    return '[object Sprite]';
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
