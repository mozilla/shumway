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
// Class: InteractiveObject
module Shumway.AVM2.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  export class InteractiveObject extends flash.display.DisplayObject {
    static initializer: any = null;
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.display.InteractiveObject");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    // Instance AS -> JS Bindings
    get tabEnabled(): boolean {
      notImplemented("public flash.display.InteractiveObject::get tabEnabled"); return;
    }
    set tabEnabled(enabled: boolean) {
      enabled = !!enabled;
      notImplemented("public flash.display.InteractiveObject::set tabEnabled"); return;
    }
    get tabIndex(): number /*int*/ {
      notImplemented("public flash.display.InteractiveObject::get tabIndex"); return;
    }
    set tabIndex(index: number /*int*/) {
      index = index | 0;
      notImplemented("public flash.display.InteractiveObject::set tabIndex"); return;
    }
    get focusRect(): ASObject {
      notImplemented("public flash.display.InteractiveObject::get focusRect"); return;
    }
    set focusRect(focusRect: ASObject) {
      focusRect = focusRect;
      notImplemented("public flash.display.InteractiveObject::set focusRect"); return;
    }
    get mouseEnabled(): boolean {
      notImplemented("public flash.display.InteractiveObject::get mouseEnabled"); return;
    }
    set mouseEnabled(enabled: boolean) {
      enabled = !!enabled;
      notImplemented("public flash.display.InteractiveObject::set mouseEnabled"); return;
    }
    get doubleClickEnabled(): boolean {
      notImplemented("public flash.display.InteractiveObject::get doubleClickEnabled"); return;
    }
    set doubleClickEnabled(enabled: boolean) {
      enabled = !!enabled;
      notImplemented("public flash.display.InteractiveObject::set doubleClickEnabled"); return;
    }
    get accessibilityImplementation(): flash.accessibility.AccessibilityImplementation {
      notImplemented("public flash.display.InteractiveObject::get accessibilityImplementation"); return;
    }
    set accessibilityImplementation(value: flash.accessibility.AccessibilityImplementation) {
      value = value;
      notImplemented("public flash.display.InteractiveObject::set accessibilityImplementation"); return;
    }
    get softKeyboardInputAreaOfInterest(): flash.geom.Rectangle {
      notImplemented("public flash.display.InteractiveObject::get softKeyboardInputAreaOfInterest"); return;
    }
    set softKeyboardInputAreaOfInterest(value: flash.geom.Rectangle) {
      value = value;
      notImplemented("public flash.display.InteractiveObject::set softKeyboardInputAreaOfInterest"); return;
    }
    get needsSoftKeyboard(): boolean {
      notImplemented("public flash.display.InteractiveObject::get needsSoftKeyboard"); return;
    }
    set needsSoftKeyboard(value: boolean) {
      value = !!value;
      notImplemented("public flash.display.InteractiveObject::set needsSoftKeyboard"); return;
    }
    requestSoftKeyboard(): boolean {
      notImplemented("public flash.display.InteractiveObject::requestSoftKeyboard"); return;
    }
    get contextMenu(): flash.ui.ContextMenu {
      notImplemented("public flash.display.InteractiveObject::get contextMenu"); return;
    }
    set contextMenu(cm: flash.ui.ContextMenu) {
      cm = cm;
      notImplemented("public flash.display.InteractiveObject::set contextMenu"); return;
    }
  }
}
