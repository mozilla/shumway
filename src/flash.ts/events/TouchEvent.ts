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
// Class: TouchEvent
module Shumway.AVM2.AS.flash.events {
  import notImplemented = Shumway.Debug.notImplemented;
  export class TouchEvent extends flash.events.Event {
    static initializer: any = null;
    constructor (type: string, bubbles: boolean = true, cancelable: boolean = false, touchPointID: number /*int*/ = 0, isPrimaryTouchPoint: boolean = false, localX: number = NaN, localY: number = NaN, sizeX: number = NaN, sizeY: number = NaN, pressure: number = NaN, relatedObject: flash.display.InteractiveObject = null, ctrlKey: boolean = false, altKey: boolean = false, shiftKey: boolean = false) {
      type = "" + type; bubbles = !!bubbles; cancelable = !!cancelable; touchPointID = touchPointID | 0; isPrimaryTouchPoint = !!isPrimaryTouchPoint; localX = +localX; localY = +localY; sizeX = +sizeX; sizeY = +sizeY; pressure = +pressure; relatedObject = relatedObject; ctrlKey = !!ctrlKey; altKey = !!altKey; shiftKey = !!shiftKey;
      false && super(undefined, undefined, undefined);
      notImplemented("Dummy Constructor: public flash.events.TouchEvent");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    m_touchPointID: number /*int*/;
    m_isPrimaryTouchPoint: boolean;
    m_sizeY: number;
    m_sizeX: number;
    m_pressure: number;
    m_relatedObject: flash.display.InteractiveObject;
    m_isRelatedObjectInaccessible: boolean;
    m_ctrlKey: boolean;
    m_altKey: boolean;
    m_shiftKey: boolean;
    clone: () => flash.events.Event;
    touchPointID: number /*int*/;
    isPrimaryTouchPoint: boolean;
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
    // Instance AS -> JS Bindings
    get localX(): number {
      notImplemented("public flash.events.TouchEvent::get localX"); return;
    }
    set localX(value: number) {
      value = +value;
      notImplemented("public flash.events.TouchEvent::set localX"); return;
    }
    get localY(): number {
      notImplemented("public flash.events.TouchEvent::get localY"); return;
    }
    set localY(value: number) {
      value = +value;
      notImplemented("public flash.events.TouchEvent::set localY"); return;
    }
    updateAfterEvent(): void {
      notImplemented("public flash.events.TouchEvent::updateAfterEvent"); return;
    }
    getStageX(): number {
      notImplemented("public flash.events.TouchEvent::getStageX"); return;
    }
    getStageY(): number {
      notImplemented("public flash.events.TouchEvent::getStageY"); return;
    }
  }
}
