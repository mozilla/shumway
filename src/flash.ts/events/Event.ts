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
// Class: Event
module Shumway.AVM2.AS.flash.events {
  import notImplemented = Shumway.Debug.notImplemented;
  export class Event extends ASNative {
    static initializer: any = null;
    constructor (type: string, bubbles: boolean = false, cancelable: boolean = false) {
      type = "" + type; bubbles = !!bubbles; cancelable = !!cancelable;
      false && super();
      notImplemented("Dummy Constructor: public flash.events.Event");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    formatToString: (className: string) => string;
    clone: () => flash.events.Event;
    // Instance AS -> JS Bindings
    ctor(type: string, bubbles: boolean, cancelable: boolean): void {
      type = "" + type; bubbles = !!bubbles; cancelable = !!cancelable;
      notImplemented("public flash.events.Event::ctor"); return;
    }
    get type(): string {
      notImplemented("public flash.events.Event::get type"); return;
    }
    get bubbles(): boolean {
      notImplemented("public flash.events.Event::get bubbles"); return;
    }
    get cancelable(): boolean {
      notImplemented("public flash.events.Event::get cancelable"); return;
    }
    get target(): ASObject {
      notImplemented("public flash.events.Event::get target"); return;
    }
    get currentTarget(): ASObject {
      notImplemented("public flash.events.Event::get currentTarget"); return;
    }
    get eventPhase(): number /*uint*/ {
      notImplemented("public flash.events.Event::get eventPhase"); return;
    }
    stopPropagation(): void {
      notImplemented("public flash.events.Event::stopPropagation"); return;
    }
    stopImmediatePropagation(): void {
      notImplemented("public flash.events.Event::stopImmediatePropagation"); return;
    }
    preventDefault(): void {
      notImplemented("public flash.events.Event::preventDefault"); return;
    }
    isDefaultPrevented(): boolean {
      notImplemented("public flash.events.Event::isDefaultPrevented"); return;
    }
  }
}
