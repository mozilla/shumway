var SpriteDefinition = (function () {
  var def = {
    __class__: 'flash.display.Sprite',

    initialize: function () {
      this._buttonMode = false;
      this._depthMap = [];
      this._useHandCursor = true;

      var s = this.symbol;
      if (s) {
        this._graphics = s.graphics || new flash.display.Graphics;

        if (s.timeline) {
          var framePromise = s.timeline[0];
          if (framePromise) {
            var children = this._children;
            var displayList = framePromise.value;
            for (var depth in displayList) {
              var cmd = displayList[depth];
              var symbolPromise = cmd.promise;
              var symbolInfo = symbolPromise.value;
              var props = Object.create(symbolInfo.props);

              if (cmd.clipDepth)
                props.clipDepth = cmd.clipDepth;
              if (cmd.cxform)
                props.cxform = cmd.cxform;
              if (cmd.matrix)
                props.currentTransform = cmd.matrix;

              children.push({
                className: symbolInfo.className,
                events: cmd.events,
                depth: depth,
                name: cmd.name,
                props: props
              });
            }
          }
        }
      } else {
        this._graphics = new flash.display.Graphics;
      }
    },
    _constructChildren: function () {
      var depthMap = this._depthMap;
      var loader = this._loader;
      var DisplayObjectClass = avm2.systemDomain.getClass("flash.display.DisplayObject");

      var children = this._children;
      for (var i = 0, n = children.length; i < n; i++) {
        var symbolInfo = children[i];

        if (!DisplayObjectClass.isInstanceOf(symbolInfo)) {
          // HACK application domain may have the symbol class --
          // checking which domain has a symbol class
          var symbolClass = avm2.systemDomain.findClass(symbolInfo.className) ?
            avm2.systemDomain.getClass(symbolInfo.className) :
            avm2.applicationDomain.getClass(symbolInfo.className);

          var name = symbolInfo.name;

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

          this._control.appendChild(instance._control);

          if (!loader._isAvm2Enabled)
            this._initAvm1Bindings(instance, name, symbolInfo.events);

          instance._markAsDirty();

          instance.dispatchEvent(new flash.events.Event("load"));
          instance.dispatchEvent(new flash.events.Event("added"));

          children[i] = instance;
          depthMap[symbolInfo.depth] = instance;
        }
      }
    },
    _initAvm1Bindings: function (instance, name, events) {
      var loader = this._loader;
      var avm1Context = loader._avm1Context;
      var symbolProps = instance.symbol;

      if (symbolProps.variableName) {
        var variableName = symbolProps.variableName;
        var i = variableName.lastIndexOf('.');
        var clip;
        if (i >= 0) {
          var targetPath = variableName.substring(0, i).split('.');
          if (targetPath[0] == '_root') {
            clip = this.root._getAS2Object();
            targetPath.shift();
          } else {
            clip = instance._getAS2Object();
          }
          while (targetPath.length > 0) {
            if (!(targetPath[0] in clip))
              throw 'Cannot find ' + variableName + ' variable';
            clip = clip[targetPath.shift()];
          }
          variableName = variableName.substring(i + 1);
        } else
          clip = instance._getAS2Object();
        if (!(variableName in clip))
          clip[variableName] = instance.text;
        instance._refreshAS2Variables = function() {
          instance.text = clip[variableName];
        };
      }

      if (events) {
        var eventsBound = [];
        for (var i = 0; i < events.length; i++) {
          var event = events[i];
          if (event.eoe) {
            break;
          }
          var fn = function(actionBlock) {
            return executeActions(actionBlock, avm1Context, this._getAS2Object());
          }.bind(instance, event.actionsData);
          for (var eventName in event) {
            if (eventName.indexOf("on") !== 0 || !event[eventName])
              continue;
            var avm2EventName = eventName[2].toLowerCase() + eventName.substring(3);
            this.addEventListener(avm2EventName, fn, false);
            eventsBound.push({name: avm2EventName, fn: fn});
          }
        }
        if (eventsBound.length > 0) {
          instance.addEventListener('removed', function (eventsBound) {
            for (var i = 0; i < eventsBound.length; i++) {
              this.removeEventListener(eventsBound[i].name, eventsBound[i].fn, false);
            }
          }.bind(instance, eventsBound), false);
        }
      }

      if (name) {
        this._getAS2Object()[name] = instance._getAS2Object();
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
