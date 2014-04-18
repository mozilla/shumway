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
// Class: TransformGestureEvent
module Shumway.AVM2.AS.flash.events {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  export class TransformGestureEvent extends flash.events.GestureEvent {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["_scaleX", "_scaleY", "_rotation", "_offsetX", "_offsetY", "scaleX", "scaleX", "scaleY", "scaleY", "rotation", "rotation", "offsetX", "offsetX", "offsetY", "offsetY", "clone", "toString"];
    
    constructor (type: string, bubbles: boolean = true, cancelable: boolean = false, phase: string = null, localX: number = 0, localY: number = 0, scaleX: number = 1, scaleY: number = 1, rotation: number = 0, offsetX: number = 0, offsetY: number = 0, ctrlKey: boolean = false, altKey: boolean = false, shiftKey: boolean = false) {
      type = asCoerceString(type); bubbles = !!bubbles; cancelable = !!cancelable; phase = asCoerceString(phase); localX = +localX; localY = +localY; scaleX = +scaleX; scaleY = +scaleY; rotation = +rotation; offsetX = +offsetX; offsetY = +offsetY; ctrlKey = !!ctrlKey; altKey = !!altKey; shiftKey = !!shiftKey;
      false && super(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
      notImplemented("Dummy Constructor: public flash.events.TransformGestureEvent");
    }
    
    // JS -> AS Bindings
    static GESTURE_ZOOM: string = "gestureZoom";
    static GESTURE_PAN: string = "gesturePan";
    static GESTURE_ROTATE: string = "gestureRotate";
    static GESTURE_SWIPE: string = "gestureSwipe";
    
    _scaleX: number;
    _scaleY: number;
    _rotation: number;
    _offsetX: number;
    _offsetY: number;
    scaleX: number;
    scaleY: number;
    rotation: number;
    offsetX: number;
    offsetY: number;
    clone: () => flash.events.Event;
    
    // AS -> JS Bindings
    
    // _scaleX: number;
    // _scaleY: number;
    // _rotation: number;
    // _offsetX: number;
    // _offsetY: number;
  }
}
