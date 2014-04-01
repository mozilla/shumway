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
// Class: GestureEvent
module Shumway.AVM2.AS.flash.events {
  import notImplemented = Shumway.Debug.notImplemented;
  export class GestureEvent extends flash.events.Event {
    static initializer: any = null;
    constructor (type: string, bubbles: boolean = true, cancelable: boolean = false, phase: string = null, localX: number = 0, localY: number = 0, ctrlKey: boolean = false, altKey: boolean = false, shiftKey: boolean = false) {
      type = "" + type; bubbles = !!bubbles; cancelable = !!cancelable; phase = "" + phase; localX = +localX; localY = +localY; ctrlKey = !!ctrlKey; altKey = !!altKey; shiftKey = !!shiftKey;
      false && super(undefined, undefined, undefined);
      notImplemented("Dummy Constructor: public flash.events.GestureEvent");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    m_phase: string;
    m_ctrlKey: boolean;
    m_altKey: boolean;
    m_shiftKey: boolean;
    clone: () => flash.events.Event;
    phase: string;
    ctrlKey: boolean;
    altKey: boolean;
    shiftKey: boolean;
    stageX: number;
    stageY: number;
    // Instance AS -> JS Bindings
    get localX(): number {
      notImplemented("public flash.events.GestureEvent::get localX"); return;
    }
    set localX(value: number) {
      value = +value;
      notImplemented("public flash.events.GestureEvent::set localX"); return;
    }
    get localY(): number {
      notImplemented("public flash.events.GestureEvent::get localY"); return;
    }
    set localY(value: number) {
      value = +value;
      notImplemented("public flash.events.GestureEvent::set localY"); return;
    }
    updateAfterEvent(): void {
      notImplemented("public flash.events.GestureEvent::updateAfterEvent"); return;
    }
    getStageX(): number {
      notImplemented("public flash.events.GestureEvent::getStageX"); return;
    }
    getStageY(): number {
      notImplemented("public flash.events.GestureEvent::getStageY"); return;
    }
  }
}
