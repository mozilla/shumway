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
// Class: SoftKeyboardEvent
module Shumway.AVM2.AS.flash.events {
  import notImplemented = Shumway.Debug.notImplemented;
  export class SoftKeyboardEvent extends flash.events.Event {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // ["_relatedObjectVal", "_triggerTypeVal", "triggerType", "relatedObjectVal", "relatedObjectVal", "clone", "toString"];
    
    constructor (type: string, bubbles: boolean, cancelable: boolean, relatedObjectVal: flash.display.InteractiveObject, triggerTypeVal: string) {
      type = "" + type; bubbles = !!bubbles; cancelable = !!cancelable; relatedObjectVal = relatedObjectVal; triggerTypeVal = "" + triggerTypeVal;
      false && super(undefined, undefined, undefined);
      notImplemented("Dummy Constructor: public flash.events.SoftKeyboardEvent");
    }
    
    // JS -> AS Bindings
    static SOFT_KEYBOARD_ACTIVATE: string = "softKeyboardActivate";
    static SOFT_KEYBOARD_DEACTIVATE: string = "softKeyboardDeactivate";
    static SOFT_KEYBOARD_ACTIVATING: string = "softKeyboardActivating";
    
    _relatedObjectVal: flash.display.InteractiveObject;
    _triggerTypeVal: string;
    triggerType: string;
    relatedObjectVal: flash.display.InteractiveObject;
    clone: () => flash.events.Event;
    
    // AS -> JS Bindings
    
    // _triggerType: string;
    // _relatedObjectVal: flash.display.InteractiveObject;
  }
}
