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
// Class: MouseEvent
module Shumway.AVM2.AS.flash.events {
  import notImplemented = Shumway.Debug.notImplemented;
  export class MouseEvent extends flash.events.Event {
    static initializer: any = null;
    constructor (type: string, bubbles: boolean = true, cancelable: boolean = false, localX: number = undefined, localY: number = undefined, relatedObject: flash.display.InteractiveObject = null, ctrlKey: boolean = false, altKey: boolean = false, shiftKey: boolean = false, buttonDown: boolean = false, delta: number /*int*/ = 0) {
      type = "" + type; bubbles = !!bubbles; cancelable = !!cancelable; localX = +localX; localY = +localY; relatedObject = relatedObject; ctrlKey = !!ctrlKey; altKey = !!altKey; shiftKey = !!shiftKey; buttonDown = !!buttonDown; delta = delta | 0;
      false && super(undefined, undefined, undefined);
      notImplemented("Dummy Constructor: public flash.events.MouseEvent");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    m_relatedObject: flash.display.InteractiveObject;
    m_ctrlKey: boolean;
    m_altKey: boolean;
    m_shiftKey: boolean;
    m_buttonDown: boolean;
    m_delta: number /*int*/;
    m_isRelatedObjectInaccessible: boolean;
    clone: () => flash.events.Event;
    relatedObject: flash.display.InteractiveObject;
    ctrlKey: boolean;
    altKey: boolean;
    shiftKey: boolean;
    buttonDown: boolean;
    delta: number /*int*/;
    stageX: number;
    stageY: number;
    isRelatedObjectInaccessible: boolean;
    // Instance AS -> JS Bindings
    get localX(): number {
      notImplemented("public flash.events.MouseEvent::get localX"); return;
    }
    set localX(value: number) {
      value = +value;
      notImplemented("public flash.events.MouseEvent::set localX"); return;
    }
    get localY(): number {
      notImplemented("public flash.events.MouseEvent::get localY"); return;
    }
    set localY(value: number) {
      value = +value;
      notImplemented("public flash.events.MouseEvent::set localY"); return;
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
    get movementX(): number {
      notImplemented("public flash.events.MouseEvent::get movementX"); return;
    }
    set movementX(value: number) {
      value = +value;
      notImplemented("public flash.events.MouseEvent::set movementX"); return;
    }
    get movementY(): number {
      notImplemented("public flash.events.MouseEvent::get movementY"); return;
    }
    set movementY(value: number) {
      value = +value;
      notImplemented("public flash.events.MouseEvent::set movementY"); return;
    }
  }
}
