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
// Class: PressAndTapGestureEvent
module Shumway.AVM2.AS.flash.events {
  import notImplemented = Shumway.Debug.notImplemented;
  import dummyConstructor = Shumway.Debug.dummyConstructor;
  export class PressAndTapGestureEvent extends flash.events.GestureEvent {

    static classInitializer: any = null;
    static initializer: any = null;

    static classSymbols: string [] = null;
    static instanceSymbols: string [] = null;

    constructor(type: string, bubbles: boolean = true, cancelable: boolean = false,
                phase: string = null, localX: number = 0, localY: number = 0, tapLocalX: number = 0,
                tapLocalY: number = 0, ctrlKey: boolean = false, altKey: boolean = false,
                shiftKey: boolean = false) {
      super(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined,
            undefined);
      dummyConstructor("public flash.events.PressAndTapGestureEvent");
    }

    // JS -> AS Bindings
    static GESTURE_PRESS_AND_TAP: string = "gesturePressAndTap";
  }
}
