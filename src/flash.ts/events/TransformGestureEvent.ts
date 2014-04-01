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
// Class: TransformGestureEvent
module Shumway.AVM2.AS.flash.events {
  import notImplemented = Shumway.Debug.notImplemented;
  export class TransformGestureEvent extends flash.events.GestureEvent {
    static initializer: any = null;
    constructor (type: string, bubbles: boolean = true, cancelable: boolean = false, phase: string = null, localX: number = 0, localY: number = 0, scaleX: number = 1, scaleY: number = 1, rotation: number = 0, offsetX: number = 0, offsetY: number = 0, ctrlKey: boolean = false, altKey: boolean = false, shiftKey: boolean = false) {
      type = "" + type; bubbles = !!bubbles; cancelable = !!cancelable; phase = "" + phase; localX = +localX; localY = +localY; scaleX = +scaleX; scaleY = +scaleY; rotation = +rotation; offsetX = +offsetX; offsetY = +offsetY; ctrlKey = !!ctrlKey; altKey = !!altKey; shiftKey = !!shiftKey;
      false && super(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
      notImplemented("Dummy Constructor: public flash.events.TransformGestureEvent");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    m_scaleX: number;
    m_scaleY: number;
    m_rotation: number;
    m_offsetX: number;
    m_offsetY: number;
    clone: () => flash.events.Event;
    scaleX: number;
    scaleY: number;
    rotation: number;
    offsetX: number;
    offsetY: number;
    // Instance AS -> JS Bindings
  }
}
