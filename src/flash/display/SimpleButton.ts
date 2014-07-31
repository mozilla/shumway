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
module Shumway.AVM2.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  import ButtonSymbol = Shumway.Timeline.ButtonSymbol;

  export class SimpleButton extends flash.display.InteractiveObject {

    // Called whenever the class is initialized.
    static classInitializer: any = null;

    // Called whenever an instance of the class is initialized.
    static initializer: any = function (symbol: ButtonSymbol) {
      var self: SimpleButton = this;

      DisplayObject._advancableInstances.push(self);

      self._useHandCursor = true;
      self._enabled = true;
      self._trackAsMenu = false;
      self._upState = null;
      self._overState = null;
      self._downState = null;
      self._hitTestState = null;

      self._currentState = null;
      self._children = [];

      self._symbol = symbol;

      if (symbol) {
        if (symbol.upState) {
          self._upState = DisplayObject.createAnimatedDisplayObject(symbol.upState, true);
        }
        if (symbol.overState) {
          self._overState = DisplayObject.createAnimatedDisplayObject(symbol.overState, true);
        }
        if (symbol.downState) {
          self._downState = DisplayObject.createAnimatedDisplayObject(symbol.downState, true);
        }
        if (symbol.hitTestState) {
          self._hitTestState = DisplayObject.createAnimatedDisplayObject(symbol.hitTestState, true);
        }
      }
    };

    // List of static symbols to link.
    static classSymbols: string [] = null; // [];

    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // [];

    constructor (upState: flash.display.DisplayObject = null, overState: flash.display.DisplayObject = null, downState: flash.display.DisplayObject = null, hitTestState: flash.display.DisplayObject = null) {
      upState = upState; overState = overState; downState = downState; hitTestState = hitTestState;
      false && super();
      notImplemented("Dummy Constructor: public flash.display.SimpleButton");
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

    _symbol: ButtonSymbol;

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
      notImplemented("public flash.display.SimpleButton::set trackAsMenu"); return;
      // this._trackAsMenu = value;
    }

    get upState(): flash.display.DisplayObject {
      return this._upState;
    }

    set upState(value: flash.display.DisplayObject) {
      //value = value;
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
      //value = value;
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
      //value = value;
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
      //value = value;
      this._hitTestState = value;
    }

    get soundTransform(): flash.media.SoundTransform {
      notImplemented("public flash.display.SimpleButton::get soundTransform"); return;
      // return this._soundTransform;
    }
    set soundTransform(sndTransform: flash.media.SoundTransform) {
      sndTransform = sndTransform;
      notImplemented("public flash.display.SimpleButton::set soundTransform"); return;
      // this._soundTransform = sndTransform;
    }

    /**
     * Override of DisplayObject#_isUnderMouse that applies the test on hitTestState if
     * that is defined.
     */
    _isUnderMouse(x: number, y: number): boolean {
      var target = this.hitTestState;
      if (!target) {
        return false;
      }
      var matrix = this._getInvertedConcatenatedMatrix();
      var localX = matrix.transformX(x, y);
      var localY = matrix.transformY(x, y);
      // As we observed by testing, the hitTestState's own matrix seems to be ignored if created from a symbol.
      if (!this._symbol) {
        matrix = target._getInvertedMatrix();
        var tmpX = matrix.transformX(localX, localY);
        localY = matrix.transformY(localX, localY);
        localX = tmpX;
      }
      return target._containsPoint(localX, localY, true, false, false);
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
      this._setDirtyFlags(DisplayObjectFlags.DirtyChildren);
      this._invalidateFillAndLineBounds(true, true);
    }
  }
}
