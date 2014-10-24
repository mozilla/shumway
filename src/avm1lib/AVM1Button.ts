/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations undxr the License.
 */
// Class: AVM1Button
module Shumway.AVM2.AS.avm1lib {
  import ButtonAction = Shumway.Timeline.AVM1ButtonAction;
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;

  enum StateTransitions {
    IdleToOverUp =      0x001, // roll over
    OverUpToIdle =      0x002, // roll out
    OverUpToOverDown =  0x004, // press
    OverDownToOverUp =  0x008, // release
    OverDownToOutDown = 0x010, // drag out
    OutDownToOverDown = 0x020, // drag over
    OutDownToIdle =     0x040, // release outside
    IdleToOverDown =    0x080, // ???
    OverDownToIdle =    0x100  // ???
  }
  /**
   * Key codes below 32 aren't interpreted as char codes, but are mapped to specific buttons instead.
   * This array uses the key code as the index and KeyboardEvent.keyCode values matching the
   * specific keys as the value.
   * @type {number[]}
   */
  var AVM1KeyCodeMap = [-1, 37, 39, 36, 35, 45, 46, -1, 8, -1, -1, -1, -1, 13, 38, 40, 33, 34, 9, 27];

  export class AVM1Button extends ASNative {

    // Called whenever the class is initialized.
    static classInitializer: any = null;

    // Called whenever an instance of the class is initialized.
    static initializer: any = null;

    // List of static symbols to link.
    static classSymbols: string [] = null;

    // List of instance symbols to link.
    static instanceSymbols: string [] = null;

    constructor (nativeButton: flash.display.SimpleButton) {
      false && super();
      if (nativeButton) {
        this._init(nativeButton);
      }
    }

    private _requiredListeners: any;
    private _actions: ButtonAction[];
    private _nativeAS3Object: flash.display.SimpleButton;

    // JS -> AS Bindings

    // AS -> JS Bindings

    // __as3Object: flash.display.SimpleButton;
    _init(nativeButton: flash.display.SimpleButton): any {
      this._nativeAS3Object = nativeButton;
      initDefaultListeners(this);
      if (!nativeButton._symbol || !nativeButton._symbol.data.buttonActions) {
        return;
      }
      this._nativeAS3Object.addEventListener('addedToStage', this._addListeners.bind(this));
      this._nativeAS3Object.addEventListener('removedFromStage', this._removeListeners.bind(this));
      var requiredListeners = this._requiredListeners = Object.create(null);
      var actions = this._actions = nativeButton._symbol.data.buttonActions;
      for (var i = 0; i < actions.length; i++) {
        var action = actions[i];
        if (!action.actionsBlock) {
          action.actionsBlock = new AVM1.AVM1ActionsData(action.actionsData, 'i' + i);
        }
        if (action.keyCode) {
          requiredListeners['keyDown'] = this._keyDownHandler.bind(this);
          continue;
        }
        var type: string;
        switch (action.stateTransitionFlags) {
          case StateTransitions.OutDownToIdle:
            type = 'releaseOutside';
            break;
          case StateTransitions.IdleToOverUp:
            type = 'rollOver';
            break;
          case StateTransitions.OverUpToIdle:
            type = 'rollOut';
            break;
          case StateTransitions.OverUpToOverDown:
            type = 'mouseDown';
            break;
          case StateTransitions.OverDownToOverUp:
            type = 'mouseUp';
            break;
          case StateTransitions.OverDownToOutDown:
          case StateTransitions.OutDownToOverDown:
            somewhatImplemented('AVM1 drag over/out button actions');
            break;
          case StateTransitions.IdleToOverDown:
          case StateTransitions.OverDownToIdle:
            somewhatImplemented('AVM1 drag trackAsMenu over/out button actions');
            break;
          default:
            warn('Unknown AVM1 button action type: ' + action.stateTransitionFlags);
            continue;
        }
        requiredListeners[type] = this._mouseEventHandler.bind(this, action.stateTransitionFlags);
      }
    }

    private _addListeners() {
      for (var type in this._requiredListeners) {
        // on(key) works even if the button doesn't have focus, so we listen on the stage.
        // TODO: we probably need to filter these events somehow if an AVM1 swf is loaded into
        // an AVM2 one.
        var target: flash.events.EventDispatcher = type === 'keyDown' ?
                                                   this._nativeAS3Object.stage :
                                                   this._nativeAS3Object;
        target.addEventListener(type, this._requiredListeners[type]);
      }
    }
    private _removeListeners() {
      for (var type in this._requiredListeners) {
        var target: flash.events.EventDispatcher = type === 'keyDown' ?
                                                   this._nativeAS3Object.stage :
                                                   this._nativeAS3Object;
        target.removeEventListener(type, this._requiredListeners[type]);
      }
    }

    private _keyDownHandler(event) {
      var actions = this._actions;
      for (var i = 0; i < actions.length; i++) {
        var action = actions[i];
        if (!action.keyCode) {
          continue;
        }
        if ((action.keyCode < 32 &&
            AVM1KeyCodeMap[action.keyCode] === event.asGetPublicProperty('keyCode')) ||
            action.keyCode === event.asGetPublicProperty('charCode'))
        {
          this._runAction(action);
        }
      }
    }

    private _mouseEventHandler(type: number) {
      var actions = this._actions;
      for (var i = 0; i < actions.length; i++) {
        var action = actions[i];
        if (action.stateTransitionFlags === type) {
          this._runAction(action);
        }
      }
    }

    private _runAction(action: ButtonAction) {
      var avm1Context = this._nativeAS3Object.loaderInfo._avm1Context;
      avm1Context.executeActions(action.actionsBlock, getAVM1Object(this._nativeAS3Object._parent));
    }
    get _as3Object(): flash.display.SimpleButton {
      return this._nativeAS3Object;
    }
  }
}
