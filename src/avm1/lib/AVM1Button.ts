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
  import flash = Shumway.AVM2.AS.flash;
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

    static createAVM1Class() : typeof AVM1Button {
      var wrapped = wrapAVM1Class(AVM1Button,
        [],
        [ '_alpha', 'blendMode', 'cacheAsBitmap', 'enabled', 'filters', '_focusrect',
          'getDepth', '_height', '_highquality', 'menu', '_name', '_parent', '_quality',
          '_rotation', 'scale9Grid', '_soundbuftime', 'tabEnabled', 'tabIndex', '_target',
          'trackAsMenu', '_url', 'useHandCursor', '_visible', '_width',
          '_x', '_xmouse', '_xscale', '_y', '_ymouse', '_yscale']);
      AVM1Button._initEventsHandlers(wrapped);
      return wrapped;
    }

    public initAVM1Instance(as3Object: flash.display.SimpleButton, context: AVM1Context) {
      super.initAVM1Instance(as3Object, context);

      var nativeButton = this._as3Object;
      initDefaultListeners(this);
      if (!nativeButton._symbol || !nativeButton._symbol.data.buttonActions) {
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
            console.warn('Unknown AVM1 button action type: ' + action.stateTransitionFlags);
            continue;
        }
        requiredListeners[type] = this._mouseEventHandler.bind(this, action.stateTransitionFlags);
      }
    }

    public get _alpha() {
      return this._as3Object.alpha;
    }

    public set _alpha(value) {
      this._as3Object.alpha = value;
    }

    public get blendMode() {
      return this._as3Object.blendMode;
    }

    public set blendMode(value) {
      this._as3Object.blendMode = value;
    }

    public get cacheAsBitmap() {
      return this._as3Object.cacheAsBitmap;
    }

    public set cacheAsBitmap(value) {
      this._as3Object.cacheAsBitmap = value;
    }

    public get enabled() {
      return this._as3Object.enabled;
    }

    public set enabled(value) {
      this._as3Object.enabled = value;
    }

    public get filters() {
      throw 'Not implemented: get$filters';
    }

    public set filters(value) {
      throw 'Not implemented: set$filters';
    }

    public get _focusrect() {
      throw 'Not implemented: get$_focusrect';
    }

    public set _focusrect(value) {
      throw 'Not implemented: set$_focusrect';
    }

    public getDepth() {
      return (<any>this._as3Object)._clipDepth;
    }

    public get _height() {
      return this._as3Object.height;
    }

    public set _height(value) {
      if (isNaN(value)) {
        return;
      }
      this._as3Object.height = value;
    }

    public get _highquality() {
      return 1;
    }

    public set _highquality(value) {
      // TODO
    }

    public get menu() {
      return this._as3Object.contextMenu;
    }

    public set menu(value) {
      this._as3Object.contextMenu = value;
    }

    public get _name() {
      return this._as3Object.contextMenu;
    }

    public set _name(value) {
      this._as3Object.contextMenu = value;
    }

    public get _parent() {
      return getAVM1Object(this._as3Object.parent, this.context);
    }

    public set _parent(value) {
      throw 'Not implemented: set$_parent';
    }

    public get _quality() {
      return 'HIGH';
    }

    public set _quality(value) {
    }

    public get _rotation() {
      return this._as3Object.rotation;
    }

    public set _rotation(value) {
      this._as3Object.rotation = value;
    }

    public get scale9Grid() {
      throw 'Not implemented: get$scale9Grid';
    }

    public set scale9Grid(value) {
      throw 'Not implemented: set$scale9Grid';
    }

    public get _soundbuftime() {
      throw 'Not implemented: get$_soundbuftime';
    }

    public set _soundbuftime(value) {
      throw 'Not implemented: set$_soundbuftime';
    }

    public get tabEnabled() {
      return this._as3Object.tabEnabled;
    }

    public set tabEnabled(value) {
      this._as3Object.tabEnabled = value;
    }

    public get tabIndex() {
      return this._as3Object.tabIndex;
    }

    public set tabIndex(value) {
      this._as3Object.tabIndex = value;
    }

    public get _target() {
      return AVM1Utils.getTarget(this);
    }

    public get trackAsMenu() {
      throw 'Not implemented: get$trackAsMenu';
    }

    public set trackAsMenu(value) {
      throw 'Not implemented: set$trackAsMenu';
    }

    public get _url() {
      return this._as3Object.loaderInfo.url;
    }

    public get useHandCursor() {
      return this._as3Object.useHandCursor;
    }

    public set useHandCursor(value) {
      this._as3Object.useHandCursor = value;
    }

    public get _visible() {
      return this._as3Object.visible;
    }

    public set _visible(value) {
      this._as3Object.visible = +value !== 0;
    }

    public get _width() {
      return this._as3Object.width;
    }

    public set _width(value) {
      if (isNaN(value)) {
        return;
      }
      this._as3Object.width = value;
    }

    public get _x() {
      return this._as3Object.x;
    }

    public set _x(value) {
      if (isNaN(value)) {
        return;
      }
      this._as3Object.x = value;
    }

    public get _xmouse() {
      return this._as3Object.mouseX;
    }

    public get _xscale() {
      return this._as3Object.scaleX;
    }

    public set _xscale(value) {
      if (isNaN(value)) {
        return;
      }
      this._as3Object.scaleX = value;
    }

    public get _y() {
      return this._as3Object.y;
    }

    public set _y(value) {
      if (isNaN(value)) {
        return;
      }
      this._as3Object.y = value;
    }

    public get _ymouse() {
      return this._as3Object.mouseY;
    }

    public get _yscale() {
      return this._as3Object.scaleY;
    }

    public set _yscale(value) {
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

    private static _initEventsHandlers(wrappedClass) {
      var prototype: any = wrappedClass.asGetPublicProperty('prototype');
      AVM1Utils.addEventHandlerProxy(prototype, 'onDragOut', 'dragOut');
      AVM1Utils.addEventHandlerProxy(prototype, 'onDragOver', 'dragOver');
      AVM1Utils.addEventHandlerProxy(prototype, 'onKeyDown', 'keyDown');
      AVM1Utils.addEventHandlerProxy(prototype, 'onKeyUp', 'keyUp');
      AVM1Utils.addEventHandlerProxy(prototype, 'onKillFocus', 'focusOut', function (e) {
        return [e.relatedObject];
      });
      AVM1Utils.addEventHandlerProxy(prototype, 'onLoad', 'load');
      AVM1Utils.addEventHandlerProxy(prototype, 'onMouseDown', 'mouseDown');
      AVM1Utils.addEventHandlerProxy(prototype, 'onMouseUp', 'mouseUp');
      AVM1Utils.addEventHandlerProxy(prototype, 'onPress', 'mouseDown');
      AVM1Utils.addEventHandlerProxy(prototype, 'onRelease', 'mouseUp');
      AVM1Utils.addEventHandlerProxy(prototype, 'onReleaseOutside', 'releaseOutside');
      AVM1Utils.addEventHandlerProxy(prototype, 'onRollOut', 'mouseOut');
      AVM1Utils.addEventHandlerProxy(prototype, 'onRollOver', 'mouseOver');
      AVM1Utils.addEventHandlerProxy(prototype, 'onSetFocus', 'focusIn', function (e) {
        return [e.relatedObject];
      });
    }
  }
}
