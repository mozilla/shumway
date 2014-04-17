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
// Class: TouchEvent
module Shumway.AVM2.AS.flash.events {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  export class TouchEvent extends flash.events.Event {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static staticBindings: string [] = null; // [];
    
    // List of instance symbols to link.
    static bindings: string [] = null; // ["_touchPointID", "_isPrimaryTouchPoint", "_localX", "_localY", "_sizeX", "_sizeY", "_pressure", "_relatedObject", "_ctrlKey", "_altKey", "_shiftKey", "_isRelatedObjectInaccessible", "touchPointID", "touchPointID", "isPrimaryTouchPoint", "isPrimaryTouchPoint", "localX", "localX", "localY", "localY", "sizeX", "sizeX", "sizeY", "sizeY", "pressure", "pressure", "relatedObject", "relatedObject", "ctrlKey", "ctrlKey", "altKey", "altKey", "shiftKey", "shiftKey", "stageX", "stageY", "isRelatedObjectInaccessible", "isRelatedObjectInaccessible", "clone", "toString"];
    
    constructor (type: string, bubbles: boolean = true, cancelable: boolean = false, touchPointID: number /*int*/ = 0, isPrimaryTouchPoint: boolean = false, localX: number = NaN, localY: number = NaN, sizeX: number = NaN, sizeY: number = NaN, pressure: number = NaN, relatedObject: flash.display.InteractiveObject = null, ctrlKey: boolean = false, altKey: boolean = false, shiftKey: boolean = false) {
      type = asCoerceString(type); bubbles = !!bubbles; cancelable = !!cancelable; touchPointID = touchPointID | 0; isPrimaryTouchPoint = !!isPrimaryTouchPoint; localX = +localX; localY = +localY; sizeX = +sizeX; sizeY = +sizeY; pressure = +pressure; relatedObject = relatedObject; ctrlKey = !!ctrlKey; altKey = !!altKey; shiftKey = !!shiftKey;
      false && super(undefined, undefined, undefined);
      notImplemented("Dummy Constructor: public flash.events.TouchEvent");
    }
    
    // JS -> AS Bindings
    static TOUCH_BEGIN: string = "touchBegin";
    static TOUCH_END: string = "touchEnd";
    static TOUCH_MOVE: string = "touchMove";
    static TOUCH_OVER: string = "touchOver";
    static TOUCH_OUT: string = "touchOut";
    static TOUCH_ROLL_OVER: string = "touchRollOver";
    static TOUCH_ROLL_OUT: string = "touchRollOut";
    static TOUCH_TAP: string = "touchTap";
    static PROXIMITY_BEGIN: string = "proximityBegin";
    static PROXIMITY_END: string = "proximityEnd";
    static PROXIMITY_MOVE: string = "proximityMove";
    static PROXIMITY_OUT: string = "proximityOut";
    static PROXIMITY_OVER: string = "proximityOver";
    static PROXIMITY_ROLL_OUT: string = "proximityRollOut";
    static PROXIMITY_ROLL_OVER: string = "proximityRollOver";
    
    _touchPointID: number /*int*/;
    _isPrimaryTouchPoint: boolean;
    _localX: number;
    _localY: number;
    _sizeX: number;
    _sizeY: number;
    _pressure: number;
    _relatedObject: flash.display.InteractiveObject;
    _ctrlKey: boolean;
    _altKey: boolean;
    _shiftKey: boolean;
    _isRelatedObjectInaccessible: boolean;
    touchPointID: number /*int*/;
    isPrimaryTouchPoint: boolean;
    localX: number;
    localY: number;
    sizeX: number;
    sizeY: number;
    pressure: number;
    relatedObject: flash.display.InteractiveObject;
    ctrlKey: boolean;
    altKey: boolean;
    shiftKey: boolean;
    stageX: number;
    stageY: number;
    isRelatedObjectInaccessible: boolean;
    clone: () => flash.events.Event;
    
    // AS -> JS Bindings
    
    // _touchPointID: number /*int*/;
    // _isPrimaryTouchPoint: boolean;
    // _localX: number;
    // _localY: number;
    // _sizeX: number;
    // _sizeY: number;
    // _pressure: number;
    // _relatedObject: flash.display.InteractiveObject;
    // _ctrlKey: boolean;
    // _altKey: boolean;
    // _shiftKey: boolean;
    // _stageX: number;
    // _stageY: number;
    // _isRelatedObjectInaccessible: boolean;
    updateAfterEvent(): void {
      notImplemented("public flash.events.TouchEvent::updateAfterEvent"); return;
    }
  }
}
