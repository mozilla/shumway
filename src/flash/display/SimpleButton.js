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
/*global avm1lib, executeActions */

var SimpleButtonDefinition = (function () {
  var AVM1KeyCodeMap = [0, 37, 39, 36, 35, 45, 46, 0, 8, 0, 0, 0, 0, 13, 38, 40, 33, 34, 9, 27];
  var AVM1MouseTransitionEvents = [0, 0, 1, 128, 64, 0, 0, 32, 2, 0, 0, 4, 256, 16, 8, 0];

  return {
    // (upState:DisplayObject = null, overState:DisplayObject = null, downState:DisplayObject = null, hitTestState:DisplayObject = null)
    __class__: "flash.display.SimpleButton",
    initialize: function () {
      this._useHandCursor = true;
      this._enabled = true;
      this._trackAsMenu = false;
      this._upState = null;
      this._overState = null;
      this._downState = null;
      this._hitTestState = null;
      this._currentButtonState = 'up';
      this._mouseChildren = false;
      this._buttonMode = true;
      this._prevAvm1StateCode = 0;
      this._avm1StateCode = 0;
      this._avm1MouseEvents = null;
      this._isContainer = true;

      var s = this.symbol;
      if (s) {
        var states = s.states;
        if (states.down) {
          this._downState = this._constructState(states.down.value, this);
        }
        if (states.hitTest) {
          this._hitTestState = this._constructState(states.hitTest.value, this);
        }
        if (states.over) {
          this._overState = this._constructState(states.over.value, this);
        }
        if (states.up) {
          this._upState = this._constructState(states.up.value, this);
        }
      }

      if (this._loader && !this._loader._isAvm2Enabled && s && s.buttonActions) {
        this._addEventListener("addedToStage", function (e) {
          this._initAvm1Events(s.buttonActions);
        }.bind(this), false);
      }
    },

    _constructState: function constructState(symbolInfo) {
      var symbolClass = avm2.systemDomain.findClass(symbolInfo.className) ?
                          avm2.systemDomain.getClass(symbolInfo.className) :
                          avm2.applicationDomain.getClass(symbolInfo.className);

      var instance = symbolClass.createAsSymbol(symbolInfo.props);
      symbolClass.instanceConstructor.call(instance);

      if (instance._children.length === 1) {
        instance = instance._children[0];
        instance._parent = null;
        instance._index = -1;
      }

      return instance;
    },
    _updateButton: function updateButton() {
      var state = null;
      switch (this._currentButtonState) {
        case 'up': state = this._upState; break;
        case 'over': state = this._overState; break;
        case 'down': state = this._downState; break;
      }

      if (!state) {
        // XXX: no state found for the button, are we doing the right thing here?
        return;
      }

      var currentChild = this._children[0];
      if (currentChild) {
        if (currentChild === state) {
          return;
        }

        if (this._stage) {
          this._stage._removeFromStage(currentChild);
        }

        currentChild._invalidateTransform();
      }

      if (!state) {
        this._children.shift();
        return;
      }

      this._children[0] = state;

      state._parent = this;
      state._invalidateTransform();

      if (this._stage) {
        this._stage._addToStage(state);
      }
    },
    _gotoButtonState: function gotoButtonState(buttonState) {
      this._invalidateBounds();
      this._currentButtonState = buttonState;
      this._updateButton();

      if (this._avm1MouseEvents) {
        this._processAvm1MouseEvents(this._avm1MouseEvents);
      }
    },

    _getRegion: function getRegion(targetCoordSpace) {
      if (!this._hitTestState) {
        return { xMin: 0, yMin: 0, xMax: 0, yMax: 0 };
      }

      var b = this._hitTestState.getBounds(null);
      return this._getTransformedRect(b, targetCoordSpace);
    },

    _getAS2Object: function () {
      if (!this.$as2Object) {
        new avm1lib.AS2Button(this);
      }
      return this.$as2Object;
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
        this._addEventListener('removedFromStage', function (stage) {
          stage._removeEventListener(KeyboardEventClass.class.KEY_DOWN, keyListener, false);
        }.bind(this, this.stage), false);
      }
    },
    _processAvm1MouseEvents: function (mouseEvents) {
      // state codes: 0 - idle, 1 - outDown, 2 - overUp, 3 - overDown
      var prevAvm1StateCode = this._avm1StateCode;
      var avm1StateCode = (this._currentButtonState === 'down' ? 1 : 0) |
                          (this._currentButtonState !== 'up' ? 2 : 0);
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

    __glue__: {
      native: {
        instance: {
          _updateButton: function _updateButton() { // (void) -> void
            this._updateButton();
          },
          useHandCursor: {
            get: function useHandCursor() { // (void) -> Boolean
              return this._useHandCursor;
            },
            set: function useHandCursor(value) { // (value:Boolean) -> void
              this._useHandCursor = value;
            }
          },
          enabled: {
            get: function enabled() { // (void) -> Boolean
              return this._enabled;
            },
            set: function enabled(value) { // (value:Boolean) -> void
              this._enabled = value;
            }
          },
          trackAsMenu: {
            get: function trackAsMenu() { // (void) -> Boolean
              notImplemented("SimpleButton.trackAsMenu");
              return this._trackAsMenu;
            },
            set: function trackAsMenu(value) { // (value:Boolean) -> void
              notImplemented("SimpleButton.trackAsMenu");
              this._trackAsMenu = value;
            }
          },
          upState: {
            get: function upState() { // (void) -> DisplayObject
              return this._upState;
            },
            set: function upState(value) { // (value:DisplayObject) -> void
              this._upState = value;
              this._updateButton();
            }
          },
          overState: {
            get: function overState() { // (void) -> DisplayObject
              return this._overState;
            },
            set: function overState(value) { // (value:DisplayObject) -> void
              this._overState = value;
              this._updateButton();
            }
          },
          downState: {
            get: function downState() { // (void) -> DisplayObject
              return this._downState;
            },
            set: function downState(value) { // (value:DisplayObject) -> void
              this._downState = value;
              this._updateButton();
            }
          },
          hitTestState: {
            get: function hitTestState() { // (void) -> DisplayObject
              return this._hitTestState;
            },
            set: function hitTestState(value) { // (value:DisplayObject) -> void
              if (value === this._hitTestState) {
                return;
              }

              this._invalidate();

              this._hitTestState = value;
            }
          },
          soundTransform: {
            get: function soundTransform() { // (void) -> SoundTransform
              notImplemented("SimpleButton.soundTransform");
              return this._soundTransform;
            },
            set: function soundTransform(value) { // (value:SoundTransform) -> void
              notImplemented("SimpleButton.soundTransform");
              this._soundTransform = value;
            }
          }
        }
      }
    }
  };
}).call(this);
