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
// Class: Multitouch
module Shumway.AVM2.AS.flash.ui {
  import notImplemented = Shumway.Debug.notImplemented;
  export class Multitouch extends ASNative {
    static initializer: any = null;
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.ui.Multitouch");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    get inputMode(): string {
      notImplemented("public flash.ui.Multitouch::get inputMode"); return;
    }
    set inputMode(value: string) {
      value = "" + value;
      notImplemented("public flash.ui.Multitouch::set inputMode"); return;
    }
    get supportsTouchEvents(): boolean {
      notImplemented("public flash.ui.Multitouch::get supportsTouchEvents"); return;
    }
    get supportsGestureEvents(): boolean {
      notImplemented("public flash.ui.Multitouch::get supportsGestureEvents"); return;
    }
    get supportedGestures(): ASVector<string> {
      notImplemented("public flash.ui.Multitouch::get supportedGestures"); return;
    }
    get maxTouchPoints(): number /*int*/ {
      notImplemented("public flash.ui.Multitouch::get maxTouchPoints"); return;
    }
    get mapTouchToMouse(): boolean {
      notImplemented("public flash.ui.Multitouch::get mapTouchToMouse"); return;
    }
    set mapTouchToMouse(value: boolean) {
      value = !!value;
      notImplemented("public flash.ui.Multitouch::set mapTouchToMouse"); return;
    }
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
  }
}
