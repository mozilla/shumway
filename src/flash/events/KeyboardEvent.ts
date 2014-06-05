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
// Class: KeyboardEvent
module Shumway.AVM2.AS.flash.events {
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;
  import notImplemented = Shumway.Debug.notImplemented;

  export class KeyboardEvent extends flash.events.Event {

    static classInitializer: any = null;
    static initializer: any = null;

    static classSymbols: string [] = null;
    static instanceSymbols: string [] = null;

    constructor(type: string, bubbles: boolean = true, cancelable: boolean = false,
                charCodeValue: number /*uint*/ = 0, keyCodeValue: number /*uint*/ = 0,
                keyLocationValue: number /*uint*/ = 0, ctrlKeyValue: boolean = false,
                altKeyValue: boolean = false, shiftKeyValue: boolean = false)
    {
      super(undefined, undefined, undefined);
      notImplemented("Dummy Constructor: public flash.events.KeyboardEvent");
    }

    // JS -> AS Bindings
    static KEY_DOWN: string = "keyDown";
    static KEY_UP: string = "keyUp";

    // AS -> JS Bindings
    updateAfterEvent(): void {
      somewhatImplemented("public flash.events.KeyboardEvent::updateAfterEvent");
    }
  }
}
