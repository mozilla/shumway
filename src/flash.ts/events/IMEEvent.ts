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
// Class: IMEEvent
module Shumway.AVM2.AS.flash.events {
  import notImplemented = Shumway.Debug.notImplemented;
  export class IMEEvent extends flash.events.TextEvent {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // ["_imeClient", "imeClient", "imeClient", "clone", "toString"];
    
    constructor (type: string, bubbles: boolean = false, cancelable: boolean = false, text: string = "", imeClient: flash.text.ime.IIMEClient = null) {
      type = "" + type; bubbles = !!bubbles; cancelable = !!cancelable; text = "" + text; imeClient = imeClient;
      false && super(undefined, undefined, undefined, undefined);
      notImplemented("Dummy Constructor: public flash.events.IMEEvent");
    }
    
    // JS -> AS Bindings
    static IME_COMPOSITION: string = "imeComposition";
    static IME_START_COMPOSITION: string = "imeStartComposition";
    
    _imeClient: flash.text.ime.IIMEClient;
    imeClient: flash.text.ime.IIMEClient;
    clone: () => flash.events.Event;
    
    // AS -> JS Bindings
    
    // _imeClient: flash.text.ime.IIMEClient;
  }
}
