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
// Class: MouseEvent
module Shumway.AVM2.AS.flash.events {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  export class MouseEvent extends flash.events.Event {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["_relatedObject", "_ctrlKey", "_altKey", "_shiftKey", "_buttonDown", "_delta", "_isRelatedObjectInaccessible", "relatedObject", "relatedObject", "ctrlKey", "ctrlKey", "altKey", "altKey", "shiftKey", "shiftKey", "buttonDown", "buttonDown", "delta", "delta", "stageX", "stageY", "isRelatedObjectInaccessible", "isRelatedObjectInaccessible", "clone", "toString"];
    
    constructor (type: string, bubbles: boolean = true, cancelable: boolean = false, localX: number = undefined, localY: number = undefined, relatedObject: flash.display.InteractiveObject = null, ctrlKey: boolean = false, altKey: boolean = false, shiftKey: boolean = false, buttonDown: boolean = false, delta: number /*int*/ = 0) {
      type = asCoerceString(type); bubbles = !!bubbles; cancelable = !!cancelable; localX = +localX; localY = +localY; relatedObject = relatedObject; ctrlKey = !!ctrlKey; altKey = !!altKey; shiftKey = !!shiftKey; buttonDown = !!buttonDown; delta = delta | 0;
      false && super(undefined, undefined, undefined);
      notImplemented("Dummy Constructor: public flash.events.MouseEvent");
    }
    
    // JS -> AS Bindings
    static CLICK: string = "click";
    static DOUBLE_CLICK: string = "doubleClick";
    static MOUSE_DOWN: string = "mouseDown";
    static MOUSE_MOVE: string = "mouseMove";
    static MOUSE_OUT: string = "mouseOut";
    static MOUSE_OVER: string = "mouseOver";
    static MOUSE_UP: string = "mouseUp";
    static RELEASE_OUTSIDE: string = "releaseOutside";
    static MOUSE_WHEEL: string = "mouseWheel";
    static ROLL_OUT: string = "rollOut";
    static ROLL_OVER: string = "rollOver";
    static MIDDLE_CLICK: string = "middleClick";
    static MIDDLE_MOUSE_DOWN: string = "middleMouseDown";
    static MIDDLE_MOUSE_UP: string = "middleMouseUp";
    static RIGHT_CLICK: string = "rightClick";
    static RIGHT_MOUSE_DOWN: string = "rightMouseDown";
    static RIGHT_MOUSE_UP: string = "rightMouseUp";
    static CONTEXT_MENU: string = "contextMenu";
    
    _relatedObject: flash.display.InteractiveObject;
    _ctrlKey: boolean;
    _altKey: boolean;
    _shiftKey: boolean;
    _buttonDown: boolean;
    _delta: number /*int*/;
    _isRelatedObjectInaccessible: boolean;
    relatedObject: flash.display.InteractiveObject;
    ctrlKey: boolean;
    altKey: boolean;
    shiftKey: boolean;
    buttonDown: boolean;
    delta: number /*int*/;
    stageX: number;
    stageY: number;
    isRelatedObjectInaccessible: boolean;
    clone: () => flash.events.Event;
    
    // AS -> JS Bindings
    
    // _localX: number;
    // _localY: number;
    // _relatedObject: flash.display.InteractiveObject;
    // _ctrlKey: boolean;
    // _altKey: boolean;
    // _shiftKey: boolean;
    // _buttonDown: boolean;
    // _delta: number /*int*/;
    // _stageX: number;
    // _stageY: number;
    // _isRelatedObjectInaccessible: boolean;
    // _movementX: number;
    // _movementY: number;
    get localX(): number {
      notImplemented("public flash.events.MouseEvent::get localX"); return;
      // return this._localX;
    }
    set localX(value: number) {
      value = +value;
      notImplemented("public flash.events.MouseEvent::set localX"); return;
      // this._localX = value;
    }
    get localY(): number {
      notImplemented("public flash.events.MouseEvent::get localY"); return;
      // return this._localY;
    }
    set localY(value: number) {
      value = +value;
      notImplemented("public flash.events.MouseEvent::set localY"); return;
      // this._localY = value;
    }
    get movementX(): number {
      notImplemented("public flash.events.MouseEvent::get movementX"); return;
      // return this._movementX;
    }
    set movementX(value: number) {
      value = +value;
      notImplemented("public flash.events.MouseEvent::set movementX"); return;
      // this._movementX = value;
    }
    get movementY(): number {
      notImplemented("public flash.events.MouseEvent::get movementY"); return;
      // return this._movementY;
    }
    set movementY(value: number) {
      value = +value;
      notImplemented("public flash.events.MouseEvent::set movementY"); return;
      // this._movementY = value;
    }
    updateAfterEvent(): void {
      notImplemented("public flash.events.MouseEvent::updateAfterEvent"); return;
    }
    getStageX(): number {
      notImplemented("public flash.events.MouseEvent::getStageX"); return;
    }
    getStageY(): number {
      notImplemented("public flash.events.MouseEvent::getStageY"); return;
    }
  }
}
