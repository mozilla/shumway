const SpriteDefinition = (function () {
  var def = {
    __class__: 'flash.display.Sprite',

    initialize: function () {
      this._graphics = new Graphics;
    },

    get buttonMode() {
      return false;
    },
    set buttonMode(val) {
      notImplemented();
    },
    get graphics() {
      return this._graphics;
    },
    get hitArea() {
      return null;
    },
    set hitArea(val) {
      notImplemented();
    },
    get soundTransform() {
      notImplemented();
    },
    set soundTransform(val) {
      notImplemented();
    },
    startDrag: function (lockCenter, bounds) {
      notImplemented();
    },
    startTouchDrag: function (touchPointID, lockCenter, bounds) {
      notImplemented();
    },
    stopDrag: function () {
      notImplemented();
    },
    stopTouchDrag: function (touchPointID) {
      notImplemented();
    },
    get useHandCursor() {
      return true;
    },
    set useHandCursor(val) {
      notImplemented();
    }
  };

  return def;
}).call(this);

