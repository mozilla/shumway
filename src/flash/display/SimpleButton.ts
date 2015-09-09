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
// Class: SimpleButton
module Shumway.AVMX.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  import axCoerceString = Shumway.AVMX.axCoerceString;
  import assert = Shumway.Debug.assert;

  export class SimpleButton extends flash.display.InteractiveObject {

    static axClass: typeof SimpleButton;

    // Called whenever the class is initialized.
    static classInitializer: any = null;

    _symbol: ButtonSymbol;
    applySymbol() {
      release || assert(this._symbol);
      this._initializeFields();
      var symbol = this._symbol;
      if (symbol.upState) {
        this._upState = this.createAnimatedDisplayObject(symbol.upState.symbol,
                                                         symbol.upState.placeObjectTag, true);
      }
      if (symbol.overState) {
        this._overState = this.createAnimatedDisplayObject(symbol.overState.symbol,
                                                           symbol.overState.placeObjectTag, true);
      }
      if (symbol.downState) {
        this._downState = this.createAnimatedDisplayObject(symbol.downState.symbol,
                                                           symbol.downState.placeObjectTag, true);
      }
      if (symbol.hitTestState) {
        this._hitTestState = this.createAnimatedDisplayObject(symbol.hitTestState.symbol,
                                                              symbol.hitTestState.placeObjectTag,
                                                              true);
      }
      this._updateButton();
    }

    protected _initializeFields() {
      super._initializeFields();
      this._useHandCursor = true;
      this._enabled = true;
      this._trackAsMenu = false;
      this._upState = null;
      this._overState = null;
      this._downState = null;
      this._hitTestState = null;

      this._currentState = null;
      this._children = [];
    }

    // List of static symbols to link.
    static classSymbols: string [] = null; // [];

    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // [];

    constructor(upState?: flash.display.DisplayObject,
                overState?: flash.display.DisplayObject,
                downState?: flash.display.DisplayObject,
                hitTestState?: flash.display.DisplayObject) {
      if (this._symbol && !this._fieldsInitialized) {
        this.applySymbol();
      }
      super();
      this.sec.flash.display.DisplayObject.axClass._advancableInstances.push(this);
      if (!this._fieldsInitialized) {
        this._initializeFields();
      }
      if (!this._symbol) {
        if (upState) {
          this.upState = upState;
        }
        if (overState) {
          this.overState = overState;
        }
        if (downState) {
          this.downState = downState;
        }
        if (hitTestState) {
          this.hitTestState = hitTestState;
        }
        this._updateButton();
      }
    }

    _initFrame(advance: boolean) {
      if (advance) {
        this._updateButton();
      }
    }

    _constructFrame() {
      // ...
    }

    // JS -> AS Bindings


    // AS -> JS Bindings

    private _useHandCursor: boolean;
    private _enabled: boolean;
    private _trackAsMenu: boolean;
    private _upState: flash.display.DisplayObject;
    private _overState: flash.display.DisplayObject;
    private _downState: flash.display.DisplayObject;
    private _hitTestState: flash.display.DisplayObject;

    private _currentState: flash.display.DisplayObject;

    get useHandCursor(): boolean {
      return this._useHandCursor;
    }

    set useHandCursor(value: boolean) {
      this._useHandCursor = !!value;
    }

    get enabled(): boolean {
      return this._enabled;
    }

    set enabled(value: boolean) {
      this._enabled = !!value;
    }

    get trackAsMenu(): boolean {
      return this._trackAsMenu;
    }

    set trackAsMenu(value: boolean) {
      value = !!value;
      release || notImplemented("public flash.display.SimpleButton::set trackAsMenu"); return;
      // this._trackAsMenu = value;
    }

    get upState(): flash.display.DisplayObject {
      return this._upState;
    }

    set upState(value: flash.display.DisplayObject) {
      var old = this._upState;
      if (value._parent) {
        value._parent.removeChild(value);
      }
      this._upState = value;
      if (this._currentState === old) {
        this._updateButton();
      }
    }

    get overState(): flash.display.DisplayObject {
      return this._overState;
    }

    set overState(value: flash.display.DisplayObject) {
      var old = this._overState;
      if (value._parent) {
        value._parent.removeChild(value);
      }
      this._overState = value;
      if (this._currentState === old) {
        this._updateButton();
      }
    }

    get downState(): flash.display.DisplayObject {
      return this._downState;
    }

    set downState(value: flash.display.DisplayObject) {
      var old = this._downState;
      if (value._parent) {
        value._parent.removeChild(value);
      }
      this._downState = value;
      if (this._currentState === old) {
        this._updateButton();
      }
    }

    get hitTestState(): flash.display.DisplayObject {
      return this._hitTestState;
    }

    set hitTestState(value: flash.display.DisplayObject) {
      this._hitTestState = value;
    }

    get soundTransform(): flash.media.SoundTransform {
      release || notImplemented("public flash.display.SimpleButton::get soundTransform"); return;
      // return this._soundTransform;
    }
    set soundTransform(sndTransform: flash.media.SoundTransform) {
      sndTransform = sndTransform;
      release || notImplemented("public flash.display.SimpleButton::set soundTransform"); return;
      // this._soundTransform = sndTransform;
    }

    /**
     * Override of DisplayObject#_containsPoint that applies the test on hitTestState if
     * that is defined.
     */
    _containsPoint(globalX: number, globalY: number, localX: number, localY: number,
                   testingType: HitTestingType, objects: DisplayObject[]): HitTestingResult {
      var target = testingType === HitTestingType.Mouse ? this._hitTestState : this._currentState;
      if (!target) {
        return HitTestingResult.None;
      }
      // Hit testing relies on being able to get combined transforms and all that, so, a parent.
      target._parent = <any>this;
      var result = target._containsGlobalPoint(globalX, globalY, testingType, objects);
      target._parent = null;
      // For mouse target finding, SimpleButtons always return themselves as the hit.
      if (result !== HitTestingResult.None && testingType === HitTestingType.Mouse &&
          objects && this._mouseEnabled) {
        objects[0] = this;
        release || assert(objects.length === 1);
      }
      return result;
    }

    /**
     * Override of DisplayObject#_getChildBounds that retrieves the current hitTestState's bounds.
     */
    _getChildBounds(bounds: Bounds, includeStrokes: boolean) {
      if (!this._currentState) {
        return;
      }
      this._currentState._parent = <any>this;
      bounds.unionInPlace(this._currentState._getTransformedBounds(this, includeStrokes));
      this._currentState._parent = null;
    }

    _propagateFlagsDown(flags: DisplayObjectFlags) {
      if (this._hasFlags(flags)) {
        return;
      }
      this._setFlags(flags);
      this._upState && this._upState._propagateFlagsDown(flags);
      this._overState && this._overState._propagateFlagsDown(flags);
      this._downState && this._downState._propagateFlagsDown(flags);
      this._hitTestState && this._hitTestState._propagateFlagsDown(flags);
    }

    _updateButton(): void {
      var state;
      if (this._mouseOver) {
        state = this._mouseDown ? this._downState : this._overState;
      } else {
        state = this._upState;
      }
      if (state === this._currentState) {
        return;
      }
      if (this._currentState) {
        // TODO dispatch removedFromStage event
      }
      this._currentState = state;
      if (this._stage) {
        // TODO dispatch addedToStage event
      }
      if (state) {
        this._children[0] = state;
      } else {
        this._children.length = 0;
      }
      this._setDirtyFlags(DisplayObjectDirtyFlags.DirtyChildren);
      this._invalidateFillAndLineBounds(true, true);
    }
  }

  export class ButtonState {
    constructor(public symbol: Timeline.DisplaySymbol,
                public placeObjectTag: SWF.Parser.PlaceObjectTag) {
    }
  }

  export class ButtonSymbol extends Timeline.DisplaySymbol {
    upState: ButtonState = null;
    overState: ButtonState = null;
    downState: ButtonState = null;
    hitTestState: ButtonState = null;
    loaderInfo: flash.display.LoaderInfo;

    constructor(data: Timeline.SymbolData, loaderInfo: flash.display.LoaderInfo) {
      super(data, loaderInfo.sec.flash.display.SimpleButton.axClass, true);
      this.loaderInfo = loaderInfo;
    }

    static FromData(data: any, loaderInfo: flash.display.LoaderInfo): ButtonSymbol {
      var symbol = new ButtonSymbol(data, loaderInfo);
      if (loaderInfo.actionScriptVersion === ActionScriptVersion.ACTIONSCRIPT2) {
        symbol.isAVM1Object = true;
      }
      var states = data.states;
      var character: Shumway.Timeline.DisplaySymbol = null;
      var placeObjectTag: Shumway.SWF.Parser.PlaceObjectTag;
      for (var stateName in states) {
        var controlTags = states[stateName];
        if (controlTags.length === 1) {
          placeObjectTag = controlTags[0];
          character = <Shumway.Timeline.DisplaySymbol>loaderInfo.getSymbolById(placeObjectTag.symbolId);
          if (!character) {
            continue;
          }
        } else {
          placeObjectTag = {
            code: Shumway.SWF.Parser.SwfTagCode.CODE_PLACE_OBJECT,
            flags: Shumway.SWF.Parser.PlaceObjectFlags.Move,
            depth: 1
          };
          character = new flash.display.SpriteSymbol({id: -1, className: null, env: null},
                                                     loaderInfo);
          (<flash.display.SpriteSymbol>character).frames.push(new Shumway.SWF.SWFFrame(controlTags));
        }
        symbol[stateName + 'State'] = new ButtonState(character, placeObjectTag);
      }
      return symbol;
    }
  }
}
