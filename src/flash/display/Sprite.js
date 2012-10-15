const SpriteDefinition = (function () {
  var def = {
    __class__: 'flash.display.Sprite',

    initialize: function () {
      var s = this.symbol;
      if (s) {
        this._graphics = s.graphics || new flash.display.Graphics;
      } else {
        this._graphics = new flash.display.Graphics;
      }
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

  const desc = Object.getOwnPropertyDescriptor;

  def.__glue__ = {
    instance: {
      graphics: desc(def, "graphics"),
      buttonMode: desc(def, "buttonMode"),
      dropTarget: desc(def, "dropTarget"),
      startDrag: def.startDrag,
      stopDrag: def.stopDrag,
      startTouchDrag: def.startTouchDrag,
      stopTouchDrag: def.stopTouchDrag,
      constructChildren: def.constructChildren,
      hitArea: desc(def, "hitArea"),
      useHandCursor: desc(def, "useHandCursor"),
      soundTransform: desc(def, "soundTransform")
    }
  };

  return def;
}).call(this);

