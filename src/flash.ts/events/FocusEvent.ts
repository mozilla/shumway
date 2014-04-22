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
// Class: FocusEvent
module Shumway.AVM2.AS.flash.events {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  export class FocusEvent extends flash.events.Event {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["_relatedObject", "_shiftKey", "_keyCode", "_isRelatedObjectInaccessible", "relatedObject", "relatedObject", "shiftKey", "shiftKey", "keyCode", "keyCode", "isRelatedObjectInaccessible", "isRelatedObjectInaccessible", "clone", "toString"];
    
    constructor (type: string, bubbles: boolean = true, cancelable: boolean = false, relatedObject: flash.display.InteractiveObject = null, shiftKey: boolean = false, keyCode: number /*uint*/ = 0) {
      type = asCoerceString(type); bubbles = !!bubbles; cancelable = !!cancelable; relatedObject = relatedObject; shiftKey = !!shiftKey; keyCode = keyCode >>> 0;
      false && super(undefined, undefined, undefined);
      notImplemented("Dummy Constructor: public flash.events.FocusEvent");
    }
    
    // JS -> AS Bindings
    static FOCUS_IN: string = "focusIn";
    static FOCUS_OUT: string = "focusOut";
    static KEY_FOCUS_CHANGE: string = "keyFocusChange";
    static MOUSE_FOCUS_CHANGE: string = "mouseFocusChange";
    
    _relatedObject: flash.display.InteractiveObject;
    _shiftKey: boolean;
    _keyCode: number /*uint*/;
    _isRelatedObjectInaccessible: boolean;
    relatedObject: flash.display.InteractiveObject;
    shiftKey: boolean;
    keyCode: number /*uint*/;
    isRelatedObjectInaccessible: boolean;
    clone: () => flash.events.Event;
    
    // AS -> JS Bindings
    
    // _relatedObject: flash.display.InteractiveObject;
    // _shiftKey: boolean;
    // _keyCode: number /*uint*/;
    // _isRelatedObjectInaccessible: boolean;
  }
}
