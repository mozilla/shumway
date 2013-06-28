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
/*global AS2Button, executeActions */

var SimpleButtonDefinition = (function () {
  var def = {
    __class__: 'flash.display.SimpleButton',

    get downState() {
      return this._downState;
    },
    set downState(val) {
      this._downState = val;
    },
    get hitTestState() {
      return this._hitArea;
    },
    set hitTestState(val) {
      this._hitArea = val;
    },
    get overState() {
      return this._overState;
    },
    set overState(val) {
      this._overState = val;
    },
    get upState() {
      return this._upState;
    },
    set upState(val) {
      this._upState = val;
    },
    get useHandCursor() {
      return this._useHandCursor;
    },
    set useHandCursor(val) {
      this._useHandCursor = val;
    },

    _getAS2Object: function () {
      if (!this.$as2Object) {
        new AS2Button().$attachNativeObject(this);
      }
      return this.$as2Object;
    },
    initialize: function () {
      this._downState = null;
      this._hitArea = null;
      this._isMouseDown = false;
      this._isMouseOver = false;
      this._mouseChildren = false;
      this._overState = null;
      this._upState = null;
      this._useHandCursor = true;
      this._prevAvm1StateCode = 0;
      this._avm1StateCode = 0;
      this._avm1MouseEvents = null;

      var s = this.symbol;
      if (s) {
        var states = s.states;
        if (states.down)
          this._downState = createState(states.down.value, this);
        if (states.hitTest)
          this._hitArea = createState(states.hitTest.value, this);
        if (states.over)
          this._overState = createState(states.over.value, this);
        if (states.up)
          this._upState = createState(states.up.value, this);
      }

      // binding mouse events
      var MouseEventClass = flash.events.MouseEvent;
      this._addEventListener(MouseEventClass.class.MOUSE_DOWN, function (evt) {
        this._isMouseDown = true;
        this._updateButton();
      }.bind(this), false);
      this._addEventListener(MouseEventClass.class.MOUSE_OUT, function (evt) {
        this._isMouseOver = false;
        this._updateButton();
      }.bind(this), false);
      this._addEventListener(MouseEventClass.class.MOUSE_OVER, function (evt) {
        this._isMouseOver = true;
        this._updateButton();
      }.bind(this), false);
      this._addEventListener(MouseEventClass.class.MOUSE_UP, function (evt) {
        this._isMouseDown = false;
        this._updateButton();
      }.bind(this), false);

      if (!this._loader._isAvm2Enabled && s && s.buttonActions) {
        this._addEventListener("addedToStage", function (e) {
          this._initAvm1Events(s.buttonActions);
        }.bind(this), false);
      }
    },

    _updateButton: function () {
      this._markAsDirty();

      var state = this._upState;
      if (this._isMouseDown && this._isMouseOver && this._downState)
        state = this._downState;
      else if (this._isMouseOver && this._overState)
        state = this._overState;
      if (this._children.length > 0) {
        this._control.removeChild(this._children[0]._control);
      }
      this._children = [state];
      this._control.appendChild(state._control);

      if (this._avm1MouseEvents) {
        this._processAvm1MouseEvents(this._avm1MouseEvents);
      }
    },

    _processAvm1MouseEvents: function (mouseEvents) {
      // state codes: 0 - idle, 1 - outDown, 2 - overUp, 3 - overDown
      var prevAvm1StateCode = this._avm1StateCode;
      var avm1StateCode = (this._isMouseDown ? 1 : 0) |
                            (this._isMouseOver ? 2 : 0);
      if (prevAvm1StateCode !== avm1StateCode) {
        this._prevAvm1StateCode = prevAvm1StateCode;
        this._avm1StateCode = avm1StateCode;
        var flag = AVM1MouseTransitionEvents[(prevAvm1StateCode << 2) | avm1StateCode];
        for (var i = 0; i < mouseEvents.length; i++) {
          var mouseEvent = mouseEvents[i];
          if ((mouseEvent.flags & flag) !== 0) {
            mouseEvent.listener();
          }
        }
      }
    },

    _initAvm1Events: function (buttonActions) {
      var loader = this._loader;
      var avm1Context = loader._avm1Context;
      var keyEvents = null;
      for (var i = 0; i < buttonActions.length; i++) {
        var buttonAction = buttonActions[i];
        /*jshint -W083 */
        var fn = function (actionBlock) {
          return executeActions(actionBlock, avm1Context, this._getAS2Object());
        }.bind(this.parent, buttonAction.actionsData);
        var mouseEventFlags = buttonAction.mouseEventFlags;
        if (mouseEventFlags) {
          var mouseEvents = this._avm1MouseEvents || (this._avm1MouseEvents = []);
          mouseEvents.push({flags: mouseEventFlags, listener: fn});
        }
        var keyPress = buttonAction.keyPress;
        if (keyPress) {
          keyEvents = keyEvents || (keyEvents = []);
          keyEvents.push({keyCode: AVM1KeyCodeMap[keyPress] || 0,
                          charCode: keyPress,
                          listener: fn});
        }
      }
      if (keyEvents) {
        var keyListener = function (e) {
          for (var i = 0; i < keyEvents.length; i++) {
            var keyEvent = keyEvents[i];
            if (keyEvent.keyCode ? keyEvent.keyCode === e.keyCode :
                                   keyEvent.charCode === e.charCode) {
              keyEvent.listener();
            }
          }
        };
        // XXX: attaching events to the stage for now
        var KeyboardEventClass = flash.events.KeyboardEvent;
        this.stage._addEventListener(KeyboardEventClass.class.KEY_DOWN, keyListener, false);
        this._addEventListener('removedFromStage', function () {
          this.stage._removeEventListener(KeyboardEventClass.class.KEY_DOWN, keyListener, false);
        }.bind(this), false);
      }
    },

    get shouldHaveHandCursor() {
      return this._useHandCursor;
    }
  };

  function createState(symbolInfo, parent) {
    if (!symbolInfo)
      return null;

    var symbolClass = avm2.systemDomain.findClass(symbolInfo.className) ?
      avm2.systemDomain.getClass(symbolInfo.className) :
      avm2.applicationDomain.getClass(symbolInfo.className);
    var props = Object.create(symbolInfo.props);
    props.animated = true;
    props.parent = parent;
    var instance = symbolClass.createAsSymbol(props);
    symbolClass.instanceConstructor.call(instance);

    if (instance._children.length === 1) {
      return instance._children[0];
    }

    return instance;
  }

  var AVM1KeyCodeMap = [0, 37, 39, 36, 35, 45, 46, 0, 8, 0, 0, 0, 0, 13, 38, 40, 33, 34, 9, 27];
  var AVM1MouseTransitionEvents = [0, 0, 1, 128, 64, 0, 0, 32, 2, 0, 0, 4, 256, 16, 8, 0];

  var desc = Object.getOwnPropertyDescriptor;

  def.__glue__ = {
    native: {
      instance: {
        downState: desc(def, "downState"),
        hitTestState: desc(def, "hitTestState"),
        overState: desc(def, "overState"),
        upState: desc(def, "upState"),
        useHandCursor: desc(def, "useHandCursor"),
        _updateButton: def._updateButton,
      }
    }
  };

  return def;
}).call(this);
