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
// Class: FocusEvent
module Shumway.AVM2.AS.flash.events {
  import notImplemented = Shumway.Debug.notImplemented;
  export class FocusEvent extends flash.events.Event {

    static classInitializer: any = null;
    static initializer: any = null;

    static classSymbols: string [] = null;
    static instanceSymbols: string [] = null;

    constructor(type: string, bubbles: boolean = true, cancelable: boolean = false,
                relatedObject: flash.display.InteractiveObject = null, shiftKey: boolean = false,
                keyCode: number /*uint*/ = 0)
    {
      super(undefined, undefined, undefined);
      notImplemented("Dummy Constructor: public flash.events.FocusEvent");
    }

    // JS -> AS Bindings
    static FOCUS_IN: string = "focusIn";
    static FOCUS_OUT: string = "focusOut";
    static KEY_FOCUS_CHANGE: string = "keyFocusChange";
    static MOUSE_FOCUS_CHANGE: string = "mouseFocusChange";
  }
}
