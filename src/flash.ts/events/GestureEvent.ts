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
// Class: GestureEvent
module Shumway.AVM2.AS.flash.events {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  export class GestureEvent extends flash.events.Event {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["_phase", "_localX", "_localY", "_ctrlKey", "_altKey", "_shiftKey", "phase", "phase", "ctrlKey", "ctrlKey", "altKey", "altKey", "shiftKey", "shiftKey", "stageX", "stageY", "clone", "toString"];
    
    constructor (type: string, bubbles: boolean = true, cancelable: boolean = false, phase: string = null, localX: number = 0, localY: number = 0, ctrlKey: boolean = false, altKey: boolean = false, shiftKey: boolean = false) {
      type = asCoerceString(type); bubbles = !!bubbles; cancelable = !!cancelable; phase = asCoerceString(phase); localX = +localX; localY = +localY; ctrlKey = !!ctrlKey; altKey = !!altKey; shiftKey = !!shiftKey;
      false && super(undefined, undefined, undefined);
      notImplemented("Dummy Constructor: public flash.events.GestureEvent");
    }
    
    // JS -> AS Bindings
    static GESTURE_TWO_FINGER_TAP: string = "gestureTwoFingerTap";
    
    _phase: string;
    _localX: number;
    _localY: number;
    _ctrlKey: boolean;
    _altKey: boolean;
    _shiftKey: boolean;
    phase: string;
    ctrlKey: boolean;
    altKey: boolean;
    shiftKey: boolean;
    stageX: number;
    stageY: number;
    clone: () => flash.events.Event;
    
    // AS -> JS Bindings
    
    // _localX: number;
    // _localY: number;
    // _phase: string;
    // _ctrlKey: boolean;
    // _altKey: boolean;
    // _shiftKey: boolean;
    // _stageX: number;
    // _stageY: number;
    get localX(): number {
      notImplemented("public flash.events.GestureEvent::get localX"); return;
      // return this._localX;
    }
    set localX(value: number) {
      value = +value;
      notImplemented("public flash.events.GestureEvent::set localX"); return;
      // this._localX = value;
    }
    get localY(): number {
      notImplemented("public flash.events.GestureEvent::get localY"); return;
      // return this._localY;
    }
    set localY(value: number) {
      value = +value;
      notImplemented("public flash.events.GestureEvent::set localY"); return;
      // this._localY = value;
    }
    updateAfterEvent(): void {
      notImplemented("public flash.events.GestureEvent::updateAfterEvent"); return;
    }
  }
}
