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
 * limitations under the License.
 */

///<reference path='../references.ts' />

module Shumway.AVM1.Lib {
  import flash = Shumway.AVMX.AS.flash;
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

  export class AVM1Button extends AVM1SymbolBase<flash.display.SimpleButton> {
    private _requiredListeners: any;
    private _actions: ButtonAction[];

    static createAVM1Class(context: AVM1Context) : AVM1Object {
      return wrapAVM1NativeClass(context, true, AVM1Button,
        [],
        [ '_alpha#', 'blendMode#', 'cacheAsBitmap#', 'enabled#', 'filters#', '_focusrect#',
          'getDepth', '_height#', '_highquality#', 'menu#', '_name#', '_parent#', '_quality#',
          '_rotation#', 'scale9Grid#', '_soundbuftime#', 'tabEnabled#', 'tabIndex#', '_target#',
          'trackAsMenu#', '_url#', 'useHandCursor#', '_visible#', '_width#',
          '_x#', '_xmouse#', '_xscale#', '_y#', '_ymouse#', '_yscale#']);
    }

    public initAVM1SymbolInstance(context: AVM1Context, as3Object: flash.display.SimpleButton) {
      super.initAVM1SymbolInstance(context, as3Object);

      var nativeButton = this._as3Object;
      if (!nativeButton._symbol || !nativeButton._symbol.data.buttonActions) {
        this._initEventsHandlers();
        return;
      }
      nativeButton.buttonMode = true;
      nativeButton.addEventListener('addedToStage', this._addListeners.bind(this));
      nativeButton.addEventListener('removedFromStage', this._removeListeners.bind(this));
      var requiredListeners = this._requiredListeners = Object.create(null);
      var actions = this._actions = nativeButton._symbol.data.buttonActions;
      for (var i = 0; i < actions.length; i++) {
        var action = actions[i];
        if (!action.actionsBlock) {
          action.actionsBlock = context.actionsDataFactory.createActionsData(
            action.actionsData, 's' + nativeButton._symbol.id + 'e' + i);
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
            context.utils.warn('Unknown AVM1 button action type: ' + action.stateTransitionFlags);
            continue;
        }
        requiredListeners[type] = this._mouseEventHandler.bind(this, action.stateTransitionFlags);
      }
      this._initEventsHandlers();
    }

    public getEnabled(): boolean {
      return this._as3Object.enabled;
    }

    public setEnabled(value: boolean) {
      this._as3Object.enabled = alToBoolean(this.context, value);;
    }

    public getTrackAsMenu(): boolean {
      return this.as3ObjectOrTemplate.trackAsMenu;
    }

    public setTrackAsMenu(value: boolean) {
      this.as3ObjectOrTemplate.trackAsMenu = alToBoolean(this.context, value);
    }

    public getUseHandCursor(): boolean {
      return this._as3Object.useHandCursor;
    }

    public setUseHandCursor(value: boolean) {
      this._as3Object.useHandCursor = alToBoolean(this.context, value);
    }


    private _addListeners() {
      for (var type in this._requiredListeners) {
        // on(key) works even if the button doesn't have focus, so we listen on the stage.
        // TODO: we probably need to filter these events somehow if an AVM1 swf is loaded into
        // an AVM2 one.
        var target: flash.events.EventDispatcher = type === 'keyDown' ?
          this._as3Object.stage :
          this._as3Object;
        target.addEventListener(type, this._requiredListeners[type]);
      }
    }
    private _removeListeners() {
      for (var type in this._requiredListeners) {
        var target: flash.events.EventDispatcher = type === 'keyDown' ?
          this._as3Object.stage :
          this._as3Object;
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
          AVM1KeyCodeMap[action.keyCode] === event.axGetPublicProperty('keyCode')) ||
          action.keyCode === event.axGetPublicProperty('charCode'))
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
      var avm1Context = this._as3Object.loaderInfo._avm1Context;
      avm1Context.executeActions(action.actionsBlock,
        getAVM1Object(this._as3Object._parent, this.context));
    }

    private _initEventsHandlers() {
      this.bindEvents([
        new AVM1EventHandler('onDragOut', 'dragOut'),
        new AVM1EventHandler('onDragOver', 'dragOver'),
        new AVM1EventHandler('onKeyDown', 'keyDown'),
        new AVM1EventHandler('onKeyUp', 'keyUp'),
        new AVM1EventHandler('onKillFocus', 'focusOut', function (e) {
          return [e.relatedObject];
        }),
        new AVM1EventHandler('onLoad', 'load'),
        new AVM1EventHandler('onMouseDown', 'mouseDown'),
        new AVM1EventHandler('onMouseUp', 'mouseUp'),
        new AVM1EventHandler('onPress', 'mouseDown'),
        new AVM1EventHandler('onRelease', 'mouseUp'),
        new AVM1EventHandler('onReleaseOutside', 'releaseOutside'),
        new AVM1EventHandler('onRollOut', 'mouseOut'),
        new AVM1EventHandler('onRollOver', 'mouseOver'),
        new AVM1EventHandler('onSetFocus', 'focusIn', function (e) {
          return [e.relatedObject];
        })
      ]);
    }
  }
}
