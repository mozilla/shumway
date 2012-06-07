function Sprite() {
}

Sprite.prototype = Object.create(new DisplayObjectContainer, {
  buttonMode: descAccessor(
    function () {
      return false;
    },
    function (val) {
      notImplemented();
    }
  ),
  graphics: descAccessor(
    function () {
      notImplemented();
    },
    function (val) {
      notImplemented();
    }
  ),
  hitArea: descAccessor(
    function () {
      return null;
    },
    function (val) {
      notImplemented();
    }
  ),
  soundTransform: descAccessor(
    function () {
      notImplemented();
    },
    function (val) {
      notImplemented();
    }
  ),
  startDrag: descMethod(function (lockCenter, bounds) {
    notImplemented();
  }),
  startTouchDrag: descMethod(function (touchPointID, lockCenter, bounds) {
    notImplemented();
  }),
  stopDrag: descMethod(function () {
    notImplemented();
  }),
  stopTouchDrag: descMethod(function (touchPointID) {
    notImplemented();
  }),
  toString: descMethod(function () {
    return '[object Sprite]';
  }),
  useHandCursor: descAccessor(
    function () {
      return true;
    },
    function (val) {
      notImplemented();
    }
  )
});
