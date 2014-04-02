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
// Class: PressAndTapGestureEvent
module Shumway.AVM2.AS.flash.events {
  import notImplemented = Shumway.Debug.notImplemented;
  export class PressAndTapGestureEvent extends flash.events.GestureEvent {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // ["_tapLocalX", "_tapLocalY", "tapLocalX", "tapLocalX", "tapLocalY", "tapLocalY", "tapStageX", "tapStageY", "clone", "toString"];
    
    constructor (type: string, bubbles: boolean = true, cancelable: boolean = false, phase: string = null, localX: number = 0, localY: number = 0, tapLocalX: number = 0, tapLocalY: number = 0, ctrlKey: boolean = false, altKey: boolean = false, shiftKey: boolean = false) {
      type = "" + type; bubbles = !!bubbles; cancelable = !!cancelable; phase = "" + phase; localX = +localX; localY = +localY; tapLocalX = +tapLocalX; tapLocalY = +tapLocalY; ctrlKey = !!ctrlKey; altKey = !!altKey; shiftKey = !!shiftKey;
      false && super(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
      notImplemented("Dummy Constructor: public flash.events.PressAndTapGestureEvent");
    }
    
    // JS -> AS Bindings
    static GESTURE_PRESS_AND_TAP: string = "gesturePressAndTap";
    
    _tapLocalX: number;
    _tapLocalY: number;
    tapLocalX: number;
    tapLocalY: number;
    tapStageX: number;
    tapStageY: number;
    clone: () => flash.events.Event;
    
    // AS -> JS Bindings
    
    // _tapLocalX: number;
    // _tapLocalY: number;
    // _tapStageX: number;
    // _tapStageY: number;
  }
}
