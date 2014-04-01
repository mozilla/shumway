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
 * limitations undxr the License.
 */
// Class: SimpleButton
module Shumway.AVM2.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  export class SimpleButton extends flash.display.InteractiveObject {
    static initializer: any = null;
    constructor (upState: flash.display.DisplayObject = null, overState: flash.display.DisplayObject = null, downState: flash.display.DisplayObject = null, hitTestState: flash.display.DisplayObject = null) {
      upState = upState; overState = overState; downState = downState; hitTestState = hitTestState;
      false && super();
      notImplemented("Dummy Constructor: public flash.display.SimpleButton");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
    _updateButton(): void {
      notImplemented("public flash.display.SimpleButton::_updateButton"); return;
    }
    get useHandCursor(): boolean {
      notImplemented("public flash.display.SimpleButton::get useHandCursor"); return;
    }
    set useHandCursor(value: boolean) {
      value = !!value;
      notImplemented("public flash.display.SimpleButton::set useHandCursor"); return;
    }
    get enabled(): boolean {
      notImplemented("public flash.display.SimpleButton::get enabled"); return;
    }
    set enabled(value: boolean) {
      value = !!value;
      notImplemented("public flash.display.SimpleButton::set enabled"); return;
    }
    get trackAsMenu(): boolean {
      notImplemented("public flash.display.SimpleButton::get trackAsMenu"); return;
    }
    set trackAsMenu(value: boolean) {
      value = !!value;
      notImplemented("public flash.display.SimpleButton::set trackAsMenu"); return;
    }
    get upState(): flash.display.DisplayObject {
      notImplemented("public flash.display.SimpleButton::get upState"); return;
    }
    set upState(value: flash.display.DisplayObject) {
      value = value;
      notImplemented("public flash.display.SimpleButton::set upState"); return;
    }
    get overState(): flash.display.DisplayObject {
      notImplemented("public flash.display.SimpleButton::get overState"); return;
    }
    set overState(value: flash.display.DisplayObject) {
      value = value;
      notImplemented("public flash.display.SimpleButton::set overState"); return;
    }
    get downState(): flash.display.DisplayObject {
      notImplemented("public flash.display.SimpleButton::get downState"); return;
    }
    set downState(value: flash.display.DisplayObject) {
      value = value;
      notImplemented("public flash.display.SimpleButton::set downState"); return;
    }
    get hitTestState(): flash.display.DisplayObject {
      notImplemented("public flash.display.SimpleButton::get hitTestState"); return;
    }
    set hitTestState(value: flash.display.DisplayObject) {
      value = value;
      notImplemented("public flash.display.SimpleButton::set hitTestState"); return;
    }
    get soundTransform(): flash.media.SoundTransform {
      notImplemented("public flash.display.SimpleButton::get soundTransform"); return;
    }
    set soundTransform(sndTransform: flash.media.SoundTransform) {
      sndTransform = sndTransform;
      notImplemented("public flash.display.SimpleButton::set soundTransform"); return;
    }
  }
}
