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
// Class: InteractiveObject
module Shumway.AVM2.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  export class InteractiveObject extends flash.display.DisplayObject {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // [];
    
    constructor () {
      false && super();
      notImplemented("Dummy Constructor: public flash.display.InteractiveObject");
    }
    
    // JS -> AS Bindings
    
    
    // AS -> JS Bindings
    
    // _tabEnabled: boolean;
    // _tabIndex: number /*int*/;
    // _focusRect: ASObject;
    // _mouseEnabled: boolean;
    // _doubleClickEnabled: boolean;
    // _accessibilityImplementation: flash.accessibility.AccessibilityImplementation;
    // _softKeyboardInputAreaOfInterest: flash.geom.Rectangle;
    // _needsSoftKeyboard: boolean;
    // _contextMenu: flash.ui.ContextMenu;
    get tabEnabled(): boolean {
      notImplemented("public flash.display.InteractiveObject::get tabEnabled"); return;
      // return this._tabEnabled;
    }
    set tabEnabled(enabled: boolean) {
      enabled = !!enabled;
      notImplemented("public flash.display.InteractiveObject::set tabEnabled"); return;
      // this._tabEnabled = enabled;
    }
    get tabIndex(): number /*int*/ {
      notImplemented("public flash.display.InteractiveObject::get tabIndex"); return;
      // return this._tabIndex;
    }
    set tabIndex(index: number /*int*/) {
      index = index | 0;
      notImplemented("public flash.display.InteractiveObject::set tabIndex"); return;
      // this._tabIndex = index;
    }
    get focusRect(): ASObject {
      notImplemented("public flash.display.InteractiveObject::get focusRect"); return;
      // return this._focusRect;
    }
    set focusRect(focusRect: ASObject) {
      focusRect = focusRect;
      notImplemented("public flash.display.InteractiveObject::set focusRect"); return;
      // this._focusRect = focusRect;
    }
    get mouseEnabled(): boolean {
      notImplemented("public flash.display.InteractiveObject::get mouseEnabled"); return;
      // return this._mouseEnabled;
    }
    set mouseEnabled(enabled: boolean) {
      enabled = !!enabled;
      notImplemented("public flash.display.InteractiveObject::set mouseEnabled"); return;
      // this._mouseEnabled = enabled;
    }
    get doubleClickEnabled(): boolean {
      notImplemented("public flash.display.InteractiveObject::get doubleClickEnabled"); return;
      // return this._doubleClickEnabled;
    }
    set doubleClickEnabled(enabled: boolean) {
      enabled = !!enabled;
      notImplemented("public flash.display.InteractiveObject::set doubleClickEnabled"); return;
      // this._doubleClickEnabled = enabled;
    }
    get accessibilityImplementation(): flash.accessibility.AccessibilityImplementation {
      notImplemented("public flash.display.InteractiveObject::get accessibilityImplementation"); return;
      // return this._accessibilityImplementation;
    }
    set accessibilityImplementation(value: flash.accessibility.AccessibilityImplementation) {
      value = value;
      notImplemented("public flash.display.InteractiveObject::set accessibilityImplementation"); return;
      // this._accessibilityImplementation = value;
    }
    get softKeyboardInputAreaOfInterest(): flash.geom.Rectangle {
      notImplemented("public flash.display.InteractiveObject::get softKeyboardInputAreaOfInterest"); return;
      // return this._softKeyboardInputAreaOfInterest;
    }
    set softKeyboardInputAreaOfInterest(value: flash.geom.Rectangle) {
      value = value;
      notImplemented("public flash.display.InteractiveObject::set softKeyboardInputAreaOfInterest"); return;
      // this._softKeyboardInputAreaOfInterest = value;
    }
    get needsSoftKeyboard(): boolean {
      notImplemented("public flash.display.InteractiveObject::get needsSoftKeyboard"); return;
      // return this._needsSoftKeyboard;
    }
    set needsSoftKeyboard(value: boolean) {
      value = !!value;
      notImplemented("public flash.display.InteractiveObject::set needsSoftKeyboard"); return;
      // this._needsSoftKeyboard = value;
    }
    get contextMenu(): flash.ui.ContextMenu {
      notImplemented("public flash.display.InteractiveObject::get contextMenu"); return;
      // return this._contextMenu;
    }
    set contextMenu(cm: flash.ui.ContextMenu) {
      cm = cm;
      notImplemented("public flash.display.InteractiveObject::set contextMenu"); return;
      // this._contextMenu = cm;
    }
    requestSoftKeyboard(): boolean {
      notImplemented("public flash.display.InteractiveObject::requestSoftKeyboard"); return;
    }
  }
}
