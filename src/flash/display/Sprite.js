/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2013 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*global Multiname, executeActions, Counter */

var SpriteDefinition = (function () {
  var def = {
    __class__: 'flash.display.Sprite',

    initialize: function () {
      this._buttonMode = false;
      this._hitArea = null;
      this._useHandCursor = true;
      this._hitTarget = null;
      this._currentDisplayList = null;

      var s = this.symbol;
      if (s) {
        this._graphics = s.graphics || new flash.display.Graphics();

        if (s.timeline) {
          var displayList = s.timeline[0];
          if (displayList) {
            var depths = displayList.depths;
            for (var i = 0; i < depths.length; i++) {
              var cmd = displayList[depths[i]];
              if (cmd) {
                var displayListItem = this._addTimelineChild(cmd);
                displayListItem.next = this._currentDisplayList;
                this._currentDisplayList = displayListItem;
              }
            }
          }
        }
      } else {
        this._graphics = new flash.display.Graphics();
      }
      this._graphics._parent = this;
    },

    _addTimelineChild: function addTimelineChild(cmd, index) {
      var symbolPromise = cmd.promise;
      var symbolInfo = symbolPromise.value;
      var props = Object.create(symbolInfo.props);

      props.symbolId = cmd.symbolId;
      props.depth = cmd.depth;

      if (cmd.clip) {
        props.clipDepth = cmd.clipDepth;
      }
      if (cmd.hasCxform) {
        props.cxform = cmd.cxform;
      }
      if (cmd.hasMatrix) {
        props.currentTransform = cmd.matrix;
      }
      if (cmd.hasName) {
        props.name = cmd.name;
      }
      if (cmd.hasRatio) {
        props.ratio = cmd.ratio / 0xffff;
      }
      if (cmd.blend) {
        props.blendMode = cmd.blendMode;
      }

      var displayListItem = {
        cmd: cmd,
        depth: cmd.depth,
        className: symbolInfo.className,
        props: props,
        events: cmd.events,
        obj: null
      };

      if (index !== undefined) {
        this._children.splice(index, 0, displayListItem);
      } else {
        this._children.push(displayListItem);
      }

      this._sparse = true;

      return displayListItem;
    },
    _constructChildren: function () {
      if (!this._sparse) {
        return;
      }

      var loader = this._loader;

      var children = this._children;
      for (var i = 0; i < children.length; i++) {
        var displayListItem = children[i];
        Counter.count("constructChild");
        if (flash.display.DisplayObject.class.isInstanceOf(displayListItem)) {
          displayListItem._index = i;
        } else {
          // HACK application domain may have the symbol class --
          // checking which domain has a symbol class
          var symbolClass = avm2.systemDomain.findClass(displayListItem.className) ?
            avm2.systemDomain.getClass(displayListItem.className) :
            avm2.applicationDomain.getClass(displayListItem.className);

          var props = Object.create(displayListItem.props);
          var name = props.name;

          props.animated = true;
          props.owned = true;
          props.parent = this;
          props.stage = this._stage;

          if (this._level > -1) {
            props.level = this._level + 1;
          }

          props.index = i;

          var instance = symbolClass.createAsSymbol(props);

          // If we bound the instance to a name, set it.
          //
          // XXX: I think this always has to be a trait.
          if (name) {
            this[Multiname.getPublicQualifiedName(name)] = instance;
          }

          // Call the constructor now that we've made the symbol instance,
          // instantiated all its children, and set the display list-specific
          // properties.
          //
          // XXX: I think we're supposed to throw if the symbol class
          // constructor is not nullary.
          symbolClass.instanceConstructor.call(instance);

          if (flash.display.BitmapData.class.isInstanceOf(instance)) {
            var bitmapData = instance;
            instance = flash.display.Bitmap.class.createAsSymbol(props);
            flash.display.Bitmap.class.instanceConstructor.call(instance, bitmapData);
          }

          if (!loader._isAvm2Enabled) {
            this._initAvm1Bindings(instance, name, displayListItem.events);
            instance._dispatchEvent("init");
            instance._dispatchEvent("construct");
            instance._needLoadEvent = true;
          } else {
            instance._dispatchEvent("load");
          }

          instance._dispatchEvent("added", undefined, true);
          if (this._stage) {
            this._stage._addToStage(instance);
          }

          children[i] = instance;

          displayListItem.obj = instance;
        }
      }

      this._sparse = false;
    },
    _postConstructChildren: function () {
      var loader = this._loader;
      if (!loader || loader._isAvm2Enabled) {
        return;
      }

      var children = this._children;
      for (var i = 0; i < children.length; i++) {
        var instance = children[i];
        if (instance._needLoadEvent) {
          delete instance._needLoadEvent;
          instance._dispatchEvent("load");
        }
      }
    },

    _duplicate: function (name, depth, initObject) {
      // TODO proper child cloning, initObject and display list insertion
      // for now just created symbol based on previous timeline information
      // (code is borrowed from the _constructChildren)

      var loader = this._loader;
      var parent = this._parent;
      var children = parent._children;
      var symbolClass = this.class;
      var symbolInfo = this.symbol;

      var props = Object.create(symbolInfo);
      props.name = name;
      props.parent = parent;
      props.depth = depth;

      var instance = symbolClass.createAsSymbol(props);
      if (name && loader && !loader._isAvm2Enabled &&
          !parent.asHasProperty(undefined, name, 0, false)) {
        parent.asSetPublicProperty(name, instance);
      }

      symbolClass.instanceConstructor.call(instance);

      // TODO Insert child at specified depth
      instance._index = children.length;
      children.push(instance);


      if (!loader._isAvm2Enabled) {
        parent._initAvm1Bindings(instance, name, symbolInfo && symbolInfo.events);
        instance._dispatchEvent("init");
        instance._dispatchEvent("construct");
      }

      instance._dispatchEvent("load");
      instance._dispatchEvent("added");
      if (this._stage) {
        instance._invalidate();
      }

      return instance;
    },
    _insertChildAtDepth: function (child, depth) {
      // TODO insert with specific depth
      this.addChild(child);
      var name = child._name;
      var loader = this._loader;
      // HACK attempting to add movie clip as a variable
      if (name && loader && !loader._isAvm2Enabled &&
          !this._getAS2Object().asHasProperty(undefined, name, 0, true)) {
        this._getAS2Object().asSetPublicProperty(name, child._getAS2Object());
      }
    },
    _initAvm1Bindings: function (instance, name, events) {
      var loader = this._loader;
      var avm1Context = loader._avm1Context;
      var symbolProps = instance.symbol;

      if (symbolProps && symbolProps.variableName) {
        instance._getAS2Object().asSetPublicProperty('variable',
                                                     symbolProps.variableName);
      }

      if (events) {
        var eventsBound = [];
        for (var i = 0; i < events.length; i++) {
          var event = events[i];
          if (event.eoe) {
            break;
          }
          /*jshint -W083 */
          var fn = function(actionBlock) {
            return executeActions(actionBlock, avm1Context, this._getAS2Object());
          }.bind(instance, event.actionsData);
          for (var eventName in event) {
            if (eventName.indexOf("on") !== 0 || !event[eventName])
              continue;
            var avm2EventName = eventName[2].toLowerCase() + eventName.substring(3);
            if (avm2EventName === 'enterFrame') {
              avm2EventName = 'frameConstructed';
            }
            var avm2EventTarget = instance;
            if (avm2EventName === 'mouseDown' || avm2EventName === 'mouseUp' || avm2EventName === 'mouseMove') {
              avm2EventTarget = this._stage;
            }
            avm2EventTarget._addEventListener(avm2EventName, fn, false);
            eventsBound.push({name: avm2EventName, fn: fn, target: avm2EventTarget});
          }
        }
        if (eventsBound.length > 0) {
          instance._addEventListener('removed', function (eventsBound) {
            for (var i = 0; i < eventsBound.length; i++) {
              eventsBound[i].target._removeEventListener(eventsBound[i].name, eventsBound[i].fn, false);
            }
          }.bind(instance, eventsBound), false);
        }
      }

      // Only set the name property for display objects that have AS2
      // reflections. Some SWFs contain AS2 names for things like Shapes.
      if (name && this._getAS2Object && instance._getAS2Object) {
        this._getAS2Object().asSetPublicProperty(name, instance._getAS2Object());
      }
    },

    _gotoButtonState: function gotoButtonState(stateName) {
      // does nothing for sprite?
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
      if (this._hitArea === val) {
        return;
      }

      if (val && val._hitTarget) {
        val._hitTarget.hitArea = null;
      }

      this._hitArea = val;
      if (val) {
        val._hitTarget = this;
      }
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
      if (this._stage) {
        this._stage._mouseMoved = true;
      }
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
