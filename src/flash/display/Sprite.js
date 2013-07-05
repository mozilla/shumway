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
/*global Multiname, executeActions */

var SpriteDefinition = (function () {
  var def = {
    __class__: 'flash.display.Sprite',

    initialize: function () {
      this._buttonMode = false;
      this._useHandCursor = true;

      var s = this.symbol;
      if (s) {
        this._graphics = s.graphics || new flash.display.Graphics();

        if (s.timeline) {
          var displayList = s.timeline[0];
          if (displayList) {
            var children = this._children;
            for (var depth in displayList) {
              var cmd = displayList[depth];
              this._addTimelineChild(cmd);
            }
          }
        }
      } else {
        this._graphics = new flash.display.Graphics();
      }
    },

    _addTimelineChild: function(cmd, index, replace) {
      var symbolPromise = cmd.promise;
      var symbolInfo = symbolPromise.value;
      var props = Object.create(symbolInfo.props);

      props.depth = cmd.depth;
      props.symbolId = cmd.symbolId;

      if (cmd.clip)
        props.clipDepth = cmd.clipDepth;
      if (cmd.hasCxform)
        props.cxform = cmd.cxform;
      if (cmd.hasMatrix)
        props.currentTransform = cmd.matrix;
      if (cmd.hasName)
        props.name = cmd.name;
      if (cmd.hasRatio)
        props.ratio = cmd.ratio / 0xffff;

      var child = {
        className: symbolInfo.className,
        events: cmd.events,
        props: props
      };

      if (index !== undefined)
        this._children.splice(index, replace ? 1 : 0, child);
      else
        this._children.push(child);
    },
    _constructChildren: function () {
      var loader = this._loader;

      var children = this._children;
      for (var i = 0, n = children.length; i < n; i++) {
        var symbolInfo = children[i];

        if (!flash.display.DisplayObject.class.isInstanceOf(symbolInfo)) {
          // HACK application domain may have the symbol class --
          // checking which domain has a symbol class
          var symbolClass = avm2.systemDomain.findClass(symbolInfo.className) ?
            avm2.systemDomain.getClass(symbolInfo.className) :
            avm2.applicationDomain.getClass(symbolInfo.className);

          var props = Object.create(symbolInfo.props);
          var name = props.name;

          props.animated = true;
          props.owned = true;
          props.parent = this;
          props.stage = this.stage;

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
          symbolClass.instanceConstructor.call(instance);

          if (flash.display.BitmapData.class.isInstanceOf(instance)) {
            var bitmapData = instance;
            instance = flash.display.Bitmap.class.createAsSymbol(props);
            flash.display.Bitmap.class.instanceConstructor.call(instance, bitmapData);
          }

          assert(instance._control);
          this._control.appendChild(instance._control);

          if (!loader._isAvm2Enabled)
            this._initAvm1Bindings(instance, name, symbolInfo.events);

          instance._markAsDirty();

          instance._dispatchEvent(new flash.events.Event("load"));
          instance._dispatchEvent(new flash.events.Event("added"));
          if (this.stage)
            instance._dispatchEvent(new flash.events.Event("addedToStage"));

          children[i] = instance;
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
      props.depth = depth;
      props.parent = parent;

      var instance = symbolClass.createAsSymbol(props);
      if (name)
        parent[Multiname.getPublicQualifiedName(name)] = instance;

      symbolClass.instanceConstructor.call(instance);

      assert(instance._control);
      parent._control.appendChild(instance._control);

      if (!loader._isAvm2Enabled)
        parent._initAvm1Bindings(instance, name, symbolInfo && symbolInfo.events);

      instance._markAsDirty();

      instance._dispatchEvent(new flash.events.Event("load"));
      instance._dispatchEvent(new flash.events.Event("added"));

      children.push(instance);

      return instance;
    },
    _initAvm1Bindings: function (instance, name, events) {
      var loader = this._loader;
      var avm1Context = loader._avm1Context;
      var symbolProps = instance.symbol;

      if (symbolProps && symbolProps.variableName) {
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
        instance._addEventListener('constructFrame', function() {
          instance.text = clip[variableName];
        });
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
            this._addEventListener(avm2EventName, fn, false);
            eventsBound.push({name: avm2EventName, fn: fn});
          }
        }
        if (eventsBound.length > 0) {
          instance._addEventListener('removed', function (eventsBound) {
            for (var i = 0; i < eventsBound.length; i++) {
              this._removeEventListener(eventsBound[i].name, eventsBound[i].fn, false);
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
      if (this.stage) {
        this.stage._syncCursor();
      }
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
