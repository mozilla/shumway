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
    static initializer: any = null;
    
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
    
    // _useHandCursor: boolean;
    // _enabled: boolean;
    // _trackAsMenu: boolean;
    // _upState: flash.display.DisplayObject;
    // _overState: flash.display.DisplayObject;
    // _downState: flash.display.DisplayObject;
    // _hitTestState: flash.display.DisplayObject;
    // _soundTransform: flash.media.SoundTransform;
    get useHandCursor(): boolean {
      notImplemented("public flash.display.SimpleButton::get useHandCursor"); return;
      // return this._useHandCursor;
    }
    set useHandCursor(value: boolean) {
      value = !!value;
      notImplemented("public flash.display.SimpleButton::set useHandCursor"); return;
      // this._useHandCursor = value;
    }
    get enabled(): boolean {
      notImplemented("public flash.display.SimpleButton::get enabled"); return;
      // return this._enabled;
    }
    set enabled(value: boolean) {
      value = !!value;
      notImplemented("public flash.display.SimpleButton::set enabled"); return;
      // this._enabled = value;
    }
    get trackAsMenu(): boolean {
      notImplemented("public flash.display.SimpleButton::get trackAsMenu"); return;
      // return this._trackAsMenu;
    }
    set trackAsMenu(value: boolean) {
      value = !!value;
      notImplemented("public flash.display.SimpleButton::set trackAsMenu"); return;
      // this._trackAsMenu = value;
    }
    get upState(): flash.display.DisplayObject {
      notImplemented("public flash.display.SimpleButton::get upState"); return;
      // return this._upState;
    }
    set upState(value: flash.display.DisplayObject) {
      value = value;
      notImplemented("public flash.display.SimpleButton::set upState"); return;
      // this._upState = value;
    }
    get overState(): flash.display.DisplayObject {
      notImplemented("public flash.display.SimpleButton::get overState"); return;
      // return this._overState;
    }
    set overState(value: flash.display.DisplayObject) {
      value = value;
      notImplemented("public flash.display.SimpleButton::set overState"); return;
      // this._overState = value;
    }
    get downState(): flash.display.DisplayObject {
      notImplemented("public flash.display.SimpleButton::get downState"); return;
      // return this._downState;
    }
    set downState(value: flash.display.DisplayObject) {
      value = value;
      notImplemented("public flash.display.SimpleButton::set downState"); return;
      // this._downState = value;
    }
    get hitTestState(): flash.display.DisplayObject {
      notImplemented("public flash.display.SimpleButton::get hitTestState"); return;
      // return this._hitTestState;
    }
    set hitTestState(value: flash.display.DisplayObject) {
      value = value;
      notImplemented("public flash.display.SimpleButton::set hitTestState"); return;
      // this._hitTestState = value;
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
      notImplemented("public flash.display.SimpleButton::_updateButton"); return;
    }
  }
}
