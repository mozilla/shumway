/**
 * Copyright 2013 Mozilla Foundation
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
  export class SimpleButton extends flash.display.InteractiveObject {

    // Called whenever the class is initialized.
    static classInitializer: any = null;

    // Called whenever an instance of the class is initialized.
    static initializer: any = function () {
      var self: SimpleButton = this;

      self._useHandCursor = true;
      self._enabled = true;
      self._trackAsMenu = false;
      self._upState = null;
      self._overState = null;
      self._downState = null;
      self._hitTestState = null;

      self._currentState = null;
    };

    // List of static symbols to link.
    static staticBindings: string [] = null; // [];

    // List of instance symbols to link.
    static bindings: string [] = null; // [];

    constructor (upState: flash.display.DisplayObject = null, overState: flash.display.DisplayObject = null, downState: flash.display.DisplayObject = null, hitTestState: flash.display.DisplayObject = null) {
      upState = upState; overState = overState; downState = downState; hitTestState = hitTestState;
      false && super();
      notImplemented("Dummy Constructor: public flash.display.SimpleButton");
    }

    // JS -> AS Bindings


    // AS -> JS Bindings

    _useHandCursor: boolean;
    _enabled: boolean;
    _trackAsMenu: boolean;
    _upState: flash.display.DisplayObject;
    _overState: flash.display.DisplayObject;
    _downState: flash.display.DisplayObject;
    _hitTestState: flash.display.DisplayObject;

    _currentState: flash.display.DisplayObject;

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
      this._invalidate();
    }
  }
}
