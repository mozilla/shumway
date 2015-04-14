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
            console.warn('Unknown AVM1 button action type: ' + action.stateTransitionFlags);
            continue;
        }
        requiredListeners[type] = this._mouseEventHandler.bind(this, action.stateTransitionFlags);
      }
      this._initEventsHandlers();
    }

    public get_alpha() {
      return this._as3Object.alpha;
    }

    public set_alpha(value) {
      this._as3Object.alpha = value;
    }

    public getBlendMode() {
      return this._as3Object.blendMode;
    }

    public setBlendMode(value) {
      this._as3Object.blendMode = value;
    }

    public getCacheAsBitmap() {
      return this._as3Object.cacheAsBitmap;
    }

    public setCacheAsBitmap(value) {
      this._as3Object.cacheAsBitmap = value;
    }

    public getEnabled() {
      return this._as3Object.enabled;
    }

    public setEnabled(value) {
      this._as3Object.enabled = value;
    }

    public getFilters() {
      throw 'Not implemented: get$filters';
    }

    public setFilters(value) {
      throw 'Not implemented: set$filters';
    }

    public get_focusrect() {
      throw 'Not implemented: get$_focusrect';
    }

    public set_focusrect(value) {
      throw 'Not implemented: set$_focusrect';
    }

    public getDepth() {
      return (<any>this._as3Object)._clipDepth;
    }

    public get_height() {
      return this._as3Object.height;
    }

    public set_height(value) {
      if (isNaN(value)) {
        return;
      }
      this._as3Object.height = value;
    }

    public get_highquality() {
      return 1;
    }

    public set_highquality(value) {
      // TODO
    }

    public getMenu() {
      return this._as3Object.contextMenu;
    }

    public setMenu(value) {
      this._as3Object.contextMenu = value;
    }

    public get_name() {
      return this._as3Object.contextMenu;
    }

    public set_name(value) {
      this._as3Object.contextMenu = value;
    }

    public get_parent() {
      return getAVM1Object(this._as3Object.parent, this.context);
    }

    public set_parent(value) {
      throw 'Not implemented: set$_parent';
    }

    public get_quality() {
      return 'HIGH';
    }

    public set_quality(value) {
    }

    public get_rotation() {
      return this._as3Object.rotation;
    }

    public set_rotation(value) {
      this._as3Object.rotation = value;
    }

    public getScale9Grid() {
      throw 'Not implemented: get$scale9Grid';
    }

    public setScale9Grid(value) {
      throw 'Not implemented: set$scale9Grid';
    }

    public get_soundbuftime() {
      throw 'Not implemented: get$_soundbuftime';
    }

    public set_soundbuftime(value) {
      throw 'Not implemented: set$_soundbuftime';
    }

    public getTabEnabled() {
      return this._as3Object.tabEnabled;
    }

    public setTabEnabled(value) {
      this._as3Object.tabEnabled = value;
    }

    public getTabIndex() {
      return this._as3Object.tabIndex;
    }

    public setTabIndex(value) {
      this._as3Object.tabIndex = value;
    }

    public get_target() {
      return AVM1Utils.getTarget(this);
    }

    public getTrackAsMenu() {
      throw 'Not implemented: get$trackAsMenu';
    }

    public setTrackAsMenu(value) {
      throw 'Not implemented: set$trackAsMenu';
    }

    public get_url() {
      return this._as3Object.loaderInfo.url;
    }

    public getUseHandCursor() {
      return this._as3Object.useHandCursor;
    }

    public setUseHandCursor(value) {
      this._as3Object.useHandCursor = value;
    }

    public get_visible() {
      return this._as3Object.visible;
    }

    public set_visible(value) {
      this._as3Object.visible = +value !== 0;
    }

    public get_width() {
      return this._as3Object.width;
    }

    public set_width(value) {
      if (isNaN(value)) {
        return;
      }
      this._as3Object.width = value;
    }

    public get_x() {
      return this._as3Object.x;
    }

    public set_x(value) {
      if (isNaN(value)) {
        return;
      }
      this._as3Object.x = value;
    }

    public get_xmouse() {
      return this._as3Object.mouseX;
    }

    public get_xscale() {
      return this._as3Object.scaleX;
    }

    public set_xscale(value) {
      if (isNaN(value)) {
        return;
      }
      this._as3Object.scaleX = value;
    }

    public get_y() {
      return this._as3Object.y;
    }

    public set_y(value) {
      if (isNaN(value)) {
        return;
      }
      this._as3Object.y = value;
    }

    public get_ymouse() {
      return this._as3Object.mouseY;
    }

    public get_yscale() {
      return this._as3Object.scaleY;
    }

    public set_yscale(value) {
      if (isNaN(value)) {
        return;
      }
      this._as3Object.scaleY = value;
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
