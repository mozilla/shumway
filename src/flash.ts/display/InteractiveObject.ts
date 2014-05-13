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
// Class: InteractiveObject
module Shumway.AVM2.AS.flash.display {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  import DisplayObject = flash.display.DisplayObject;

  import Event = flash.events.Event;

  export class InteractiveObject extends flash.display.DisplayObject {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = function () {
      var self: InteractiveObject = this;
      self._tabEnabled = false;
      self._tabIndex = -1;
      self._focusRect = null;
      self._mouseEnabled = true;
      self._doubleClickEnabled = false;
      self._accessibilityImplementation = null;
      self._softKeyboardInputAreaOfInterest = null;
      self._needsSoftKeyboard = false;
      self._contextMenu = null;
    };
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // [];
    
    constructor () {
      false && super();
      DisplayObject.instanceConstructorNoInitialize.call(this);
    }
    
    // JS -> AS Bindings
    
    
    // AS -> JS Bindings
    
    _tabEnabled: boolean;
    _tabIndex: number /*int*/;
    _focusRect: ASObject;
    _mouseEnabled: boolean;
    _doubleClickEnabled: boolean;
    _accessibilityImplementation: flash.accessibility.AccessibilityImplementation;
    _softKeyboardInputAreaOfInterest: flash.geom.Rectangle;
    _needsSoftKeyboard: boolean;
    _contextMenu: flash.ui.ContextMenu;

    get tabEnabled(): boolean {
      return this._tabEnabled;
    }

    set tabEnabled(enabled: boolean) {
      enabled = !!enabled;
      var old = this._tabEnabled;
      this._tabEnabled = enabled;
      if (old !== enabled) {
        this.dispatchEvent(new Event(Event.TAB_ENABLED_CHANGE, true));
      }
    }

    get tabIndex(): number /*int*/ {
      return this._tabIndex;
    }

    set tabIndex(index: number /*int*/) {
      index = index | 0;
      var old = this._tabIndex;
      this._tabIndex = index;
      if (old !== index) {
        this.dispatchEvent(new Event(Event.TAB_INDEX_CHANGE, true));
      }
    }

    get focusRect(): ASObject {
      return this._focusRect;
    }

    set focusRect(focusRect: ASObject) {
      focusRect = focusRect;
      notImplemented("public flash.display.InteractiveObject::set focusRect"); return;
      // this._focusRect = focusRect;
    }

    get mouseEnabled(): boolean {
      return this._mouseEnabled;
    }

    set mouseEnabled(enabled: boolean) {
      this._mouseEnabled = !!enabled;
    }

    get doubleClickEnabled(): boolean {
      return this._doubleClickEnabled;
    }

    set doubleClickEnabled(enabled: boolean) {
      this._doubleClickEnabled = !!enabled;
    }

    get accessibilityImplementation(): flash.accessibility.AccessibilityImplementation {
      return this._accessibilityImplementation;
    }

    set accessibilityImplementation(value: flash.accessibility.AccessibilityImplementation) {
      value = value;
      notImplemented("public flash.display.InteractiveObject::set accessibilityImplementation"); return;
      // this._accessibilityImplementation = value;
    }

    get softKeyboardInputAreaOfInterest(): flash.geom.Rectangle {
      return this._softKeyboardInputAreaOfInterest;
    }

    set softKeyboardInputAreaOfInterest(value: flash.geom.Rectangle) {
      value = value;
      notImplemented("public flash.display.InteractiveObject::set softKeyboardInputAreaOfInterest"); return;
      // this._softKeyboardInputAreaOfInterest = value;
    }

    get needsSoftKeyboard(): boolean {
      return this._needsSoftKeyboard;
    }

    set needsSoftKeyboard(value: boolean) {
      value = !!value;
      notImplemented("public flash.display.InteractiveObject::set needsSoftKeyboard"); return;
      // this._needsSoftKeyboard = value;
    }

    get contextMenu(): flash.ui.ContextMenu {
      return this._contextMenu;
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
