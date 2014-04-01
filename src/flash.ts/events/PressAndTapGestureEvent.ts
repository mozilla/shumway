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
    static initializer: any = null;
    constructor (type: string, bubbles: boolean = true, cancelable: boolean = false, phase: string = null, localX: number = 0, localY: number = 0, tapLocalX: number = 0, tapLocalY: number = 0, ctrlKey: boolean = false, altKey: boolean = false, shiftKey: boolean = false) {
      type = "" + type; bubbles = !!bubbles; cancelable = !!cancelable; phase = "" + phase; localX = +localX; localY = +localY; tapLocalX = +tapLocalX; tapLocalY = +tapLocalY; ctrlKey = !!ctrlKey; altKey = !!altKey; shiftKey = !!shiftKey;
      false && super(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
      notImplemented("Dummy Constructor: public flash.events.PressAndTapGestureEvent");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    clone: () => flash.events.Event;
    tapStageX: number;
    tapStageY: number;
    // Instance AS -> JS Bindings
    get tapLocalX(): number {
      notImplemented("public flash.events.PressAndTapGestureEvent::get tapLocalX"); return;
    }
    set tapLocalX(value: number) {
      value = +value;
      notImplemented("public flash.events.PressAndTapGestureEvent::set tapLocalX"); return;
    }
    get tapLocalY(): number {
      notImplemented("public flash.events.PressAndTapGestureEvent::get tapLocalY"); return;
    }
    set tapLocalY(value: number) {
      value = +value;
      notImplemented("public flash.events.PressAndTapGestureEvent::set tapLocalY"); return;
    }
    getTapStageX(): number {
      notImplemented("public flash.events.PressAndTapGestureEvent::getTapStageX"); return;
    }
    getTapStageY(): number {
      notImplemented("public flash.events.PressAndTapGestureEvent::getTapStageY"); return;
    }
  }
}
