var SpriteDefinition = (function () {
  var def = {
    __class__: 'flash.display.Sprite',

    initialize: function () {
      this._buttonMode = false;
      this._useHandCursor = true;
      var s = this.symbol;
      if (s) {
        this._graphics = s.graphics || new flash.display.Graphics;
      } else {
        this._graphics = new flash.display.Graphics;
      }
    },

    _constructChildren: function () {
      var children = this._children;
      for (var i = 0, n = children.length; i < n; i++) {
        var symbolPromise = children[i];
        var symbolInfo = symbolPromise.value;
        var symbolClass = avm2.systemDomain.findClass(symbolInfo.className) ?
          avm2.systemDomain.getClass(symbolInfo.className) :
          avm2.applicationDomain.getClass(symbolInfo.className);
        var child = symbolClass.createAsSymbol(symbolInfo.props);
        symbolClass.instance.call(child);
        children[i] = child;
        child._owned = false;
        child._parent = this;
      }
    },

    get buttonMode() {
      return this._buttonMode;
    },
    set buttonMode(val) {
      this._buttonMode = val;
    },
    get graphics() {
      return this._graphics;
    },
    get hitArea() {
      return this._hitArea;
    },
    set hitArea(val) {
      this._hitArea = val;
    },
    get soundTransform() {
      notImplemented();
    },
    set soundTransform(val) {
      notImplemented();
    },
    get useHandCursor() {
      return this._useHandCursor;
    },
    set useHandCursor(val) {
      this._useHandCursor = val;
      this._stage._syncCursor();
    },
    get shouldHaveHandCursor() {
      return this._buttonMode && this._useHandCursor;
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
    }
  };

  var desc = Object.getOwnPropertyDescriptor;

  def.__glue__ = {
    native: {
      instance: {
        graphics: desc(def, "graphics"),
        buttonMode: desc(def, "buttonMode"),
        dropTarget: desc(def, "dropTarget"),
        startDrag: def.startDrag,
        stopDrag: def.stopDrag,
        startTouchDrag: def.startTouchDrag,
        stopTouchDrag: def.stopTouchDrag,
        constructChildren: def._constructChildren,
        hitArea: desc(def, "hitArea"),
        useHandCursor: desc(def, "useHandCursor"),
        soundTransform: desc(def, "soundTransform")
      }
    }
  };

  return def;
}).call(this);
