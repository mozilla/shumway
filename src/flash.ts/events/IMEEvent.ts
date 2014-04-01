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
// Class: IMEEvent
module Shumway.AVM2.AS.flash.events {
  import notImplemented = Shumway.Debug.notImplemented;
  export class IMEEvent extends flash.events.TextEvent {
    static initializer: any = null;
    constructor (type: string, bubbles: boolean = false, cancelable: boolean = false, text: string = "", imeClient: flash.text.ime.IIMEClient = null) {
      type = "" + type; bubbles = !!bubbles; cancelable = !!cancelable; text = "" + text; imeClient = imeClient;
      false && super(undefined, undefined, undefined, undefined);
      notImplemented("Dummy Constructor: public flash.events.IMEEvent");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    m_imeClient: flash.text.ime.IIMEClient;
    clone: () => flash.events.Event;
    imeClient: flash.text.ime.IIMEClient;
    // Instance AS -> JS Bindings
  }
}
