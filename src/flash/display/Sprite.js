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
      var DisplayObjectClass = avm2.systemDomain.getClass("flash.display.DisplayObject");

      var children = this._children;
      for (var i = 0, n = children.length; i < n; i++) {
        var symbolPromise = children[i];

        if (!DisplayObjectClass.isInstanceOf(symbolPromise)) {
          var symbolInfo = symbolPromise.value;
          var symbolClass = avm2.systemDomain.findClass(symbolInfo.className) ?
            avm2.systemDomain.getClass(symbolInfo.className) :
            avm2.applicationDomain.getClass(symbolInfo.className);

          var props = Object.create(symbolInfo.props);
          props.parent = this;

          var child = symbolClass.createAsSymbol(props);
          symbolClass.instance.call(child);

          children[i] = child;
        }
      }
    },
    _constructSymbol: function(symbolId, name) {
      var loader = this.loaderInfo._loader;
      var symbolPromise = loader._dictionary[symbolId];
      var symbolInfo = symbolPromise.value;
      // HACK application domain may have the symbol class --
      // checking which domain has a symbol class
      var symbolClass = avm2.systemDomain.findClass(symbolInfo.className) ?
        avm2.systemDomain.getClass(symbolInfo.className) :
        avm2.applicationDomain.getClass(symbolInfo.className);

      var props = Object.create(symbolInfo.props);
      props.animated = true;
      props.owned = true;
      props.parent = this;
      props.name = name || null;

      var instance = symbolClass.createAsSymbol(props);

      // If we bound the instance to a name, set it.
      //
      // XXX: I think this always has to be a trait.
      if (name)
        this[Multiname.getPublicQualifiedName(name)] = instance;

      // Call the constructor now that we've made the symbol instance,
      // instantiated all its children, and set the display list-specific
      // properties.
      //
      // XXX: I think we're supposed to throw if the symbol class
      // constructor is not nullary.
      symbolClass.instance.call(instance);

      instance._markAsDirty();

      instance.dispatchEvent(new flash.events.Event("load"));

      return instance;
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
