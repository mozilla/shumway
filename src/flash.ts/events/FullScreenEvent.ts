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
// Class: FullScreenEvent
module Shumway.AVM2.AS.flash.events {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  export class FullScreenEvent extends flash.events.ActivityEvent {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // ["_fullScreen", "_interactive", "fullScreen", "interactive", "clone", "toString"];
    
    constructor (type: string, bubbles: boolean = false, cancelable: boolean = false, fullScreen: boolean = false, interactive: boolean = false) {
      type = asCoerceString(type); bubbles = !!bubbles; cancelable = !!cancelable; fullScreen = !!fullScreen; interactive = !!interactive;
      false && super(undefined, undefined, undefined, undefined);
      notImplemented("Dummy Constructor: public flash.events.FullScreenEvent");
    }
    
    // JS -> AS Bindings
    static FULL_SCREEN: string = "fullScreen";
    static FULL_SCREEN_INTERACTIVE_ACCEPTED: string = "fullScreenInteractiveAccepted";
    
    _fullScreen: boolean;
    _interactive: boolean;
    fullScreen: boolean;
    interactive: boolean;
    clone: () => flash.events.Event;
    
    // AS -> JS Bindings
    
    // _fullScreen: boolean;
    // _interactive: boolean;
  }
}
