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
// Class: TouchEvent
module Shumway.AVM2.AS.flash.events {
  import notImplemented = Shumway.Debug.notImplemented;
  export class TouchEvent extends flash.events.Event {

    static classInitializer: any = null;
    static initializer: any = null;

    static classSymbols: string [] = null;
    static instanceSymbols: string [] = null;

    constructor(type: string, bubbles: boolean = true, cancelable: boolean = false,
                touchPointID: number /*int*/ = 0, isPrimaryTouchPoint: boolean = false,
                localX: number = NaN, localY: number = NaN, sizeX: number = NaN,
                sizeY: number = NaN, pressure: number = NaN,
                relatedObject: flash.display.InteractiveObject = null, ctrlKey: boolean = false,
                altKey: boolean = false, shiftKey: boolean = false)
    {
      super(undefined, undefined, undefined);
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

    updateAfterEvent(): void {
      notImplemented("public flash.events.TouchEvent::updateAfterEvent");
    }
  }
}
