function Sprite() {
}

Sprite.prototype = Object.create(new DisplayObjectContainer, {
  graphics: descAccessor(
    function () {
      notImplemented();
    },
    function (val) {
      notImplemented();
    }
  ),
  buttonMode: descAccessor(
    function () {
      return false;
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
  useHandCursor: descAccessor(
    function () {
      return true;
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

  toString: descMethod(function () {
    return '[object Sprite]';
  }),
  startDrag: descMethod(function (lockCenter, bounds) {
    notImplemented();
  }),
  stopDrag: descMethod(function () {
    notImplemented();
  }),
  startTouchDrag: descMethod(function (touchPointID, lockCenter, bounds) {
    notImplemented();
  }),
  stopTouchDrag: descMethod(function (touchPointID) {
    notImplemented();
  })
});
