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
// Class: KeyboardEvent
module Shumway.AVM2.AS.flash.events {
  import notImplemented = Shumway.Debug.notImplemented;
  export class KeyboardEvent extends flash.events.Event {
    static initializer: any = null;
    constructor (type: string, bubbles: boolean = true, cancelable: boolean = false, charCodeValue: number /*uint*/ = 0, keyCodeValue: number /*uint*/ = 0, keyLocationValue: number /*uint*/ = 0, ctrlKeyValue: boolean = false, altKeyValue: boolean = false, shiftKeyValue: boolean = false) {
      type = "" + type; bubbles = !!bubbles; cancelable = !!cancelable; charCodeValue = charCodeValue >>> 0; keyCodeValue = keyCodeValue >>> 0; keyLocationValue = keyLocationValue >>> 0; ctrlKeyValue = !!ctrlKeyValue; altKeyValue = !!altKeyValue; shiftKeyValue = !!shiftKeyValue;
      false && super(undefined, undefined, undefined);
      notImplemented("Dummy Constructor: public flash.events.KeyboardEvent");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    m_keyLocation: number /*uint*/;
    m_keyCode: number /*uint*/;
    clone: () => flash.events.Event;
    keyCode: number /*uint*/;
    keyLocation: number /*uint*/;
    // Instance AS -> JS Bindings
    get charCode(): number /*uint*/ {
      notImplemented("public flash.events.KeyboardEvent::get charCode"); return;
    }
    set charCode(value: number /*uint*/) {
      value = value >>> 0;
      notImplemented("public flash.events.KeyboardEvent::set charCode"); return;
    }
    get ctrlKey(): boolean {
      notImplemented("public flash.events.KeyboardEvent::get ctrlKey"); return;
    }
    set ctrlKey(value: boolean) {
      value = !!value;
      notImplemented("public flash.events.KeyboardEvent::set ctrlKey"); return;
    }
    get altKey(): boolean {
      notImplemented("public flash.events.KeyboardEvent::get altKey"); return;
    }
    set altKey(value: boolean) {
      value = !!value;
      notImplemented("public flash.events.KeyboardEvent::set altKey"); return;
    }
    get shiftKey(): boolean {
      notImplemented("public flash.events.KeyboardEvent::get shiftKey"); return;
    }
    set shiftKey(value: boolean) {
      value = !!value;
      notImplemented("public flash.events.KeyboardEvent::set shiftKey"); return;
    }
    updateAfterEvent(): void {
      notImplemented("public flash.events.KeyboardEvent::updateAfterEvent"); return;
    }
  }
}
