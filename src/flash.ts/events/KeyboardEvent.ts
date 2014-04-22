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
// Class: KeyboardEvent
module Shumway.AVM2.AS.flash.events {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  export class KeyboardEvent extends flash.events.Event {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["_charCode", "_keyCode", "_keyLocation", "_ctrlKey", "_altKey", "_shiftKey", "charCode", "charCode", "keyCode", "keyCode", "keyLocation", "keyLocation", "ctrlKey", "ctrlKey", "altKey", "altKey", "shiftKey", "shiftKey", "clone", "toString"];
    
    constructor (type: string, bubbles: boolean = true, cancelable: boolean = false, charCodeValue: number /*uint*/ = 0, keyCodeValue: number /*uint*/ = 0, keyLocationValue: number /*uint*/ = 0, ctrlKeyValue: boolean = false, altKeyValue: boolean = false, shiftKeyValue: boolean = false) {
      type = asCoerceString(type); bubbles = !!bubbles; cancelable = !!cancelable; charCodeValue = charCodeValue >>> 0; keyCodeValue = keyCodeValue >>> 0; keyLocationValue = keyLocationValue >>> 0; ctrlKeyValue = !!ctrlKeyValue; altKeyValue = !!altKeyValue; shiftKeyValue = !!shiftKeyValue;
      false && super(undefined, undefined, undefined);
      notImplemented("Dummy Constructor: public flash.events.KeyboardEvent");
    }
    
    // JS -> AS Bindings
    static KEY_DOWN: string = "keyDown";
    static KEY_UP: string = "keyUp";
    
    _charCode: number /*uint*/;
    _keyCode: number /*uint*/;
    _keyLocation: number /*uint*/;
    _ctrlKey: boolean;
    _altKey: boolean;
    _shiftKey: boolean;
    charCode: number /*uint*/;
    keyCode: number /*uint*/;
    keyLocation: number /*uint*/;
    ctrlKey: boolean;
    altKey: boolean;
    shiftKey: boolean;

    clone: () => flash.events.KeyboardEvent;
    
    // AS -> JS Bindings
    
    // _charCode: number /*uint*/;
    // _keyCode: number /*uint*/;
    // _keyLocation: number /*uint*/;
    // _ctrlKey: boolean;
    // _altKey: boolean;
    // _shiftKey: boolean;
    updateAfterEvent(): void {
      notImplemented("public flash.events.KeyboardEvent::updateAfterEvent"); return;
    }
  }
}
