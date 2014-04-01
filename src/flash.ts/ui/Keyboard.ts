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
// Class: Keyboard
module Shumway.AVM2.AS.flash.ui {
  import notImplemented = Shumway.Debug.notImplemented;
  export class Keyboard extends ASNative {
    static initializer: any = null;
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.ui.Keyboard");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    get capsLock(): boolean {
      notImplemented("public flash.ui.Keyboard::get capsLock"); return;
    }
    get numLock(): boolean {
      notImplemented("public flash.ui.Keyboard::get numLock"); return;
    }
    static isAccessible(): boolean {
      notImplemented("public flash.ui.Keyboard::static isAccessible"); return;
    }
    get hasVirtualKeyboard(): boolean {
      notImplemented("public flash.ui.Keyboard::get hasVirtualKeyboard"); return;
    }
    get physicalKeyboardType(): string {
      notImplemented("public flash.ui.Keyboard::get physicalKeyboardType"); return;
    }
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
  }
}
