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
// Class: UncaughtErrorEvent
module Shumway.AVM2.AS.flash.events {
  import notImplemented = Shumway.Debug.notImplemented;
  export class UncaughtErrorEvent extends flash.events.ErrorEvent {
    static initializer: any = null;
    constructor (type: string = "uncaughtError", bubbles: boolean = true, cancelable: boolean = true, error_in: any = null) {
      type = "" + type; bubbles = !!bubbles; cancelable = !!cancelable;
      false && super(undefined, undefined, undefined, undefined, undefined);
      notImplemented("Dummy Constructor: public flash.events.UncaughtErrorEvent");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    _error: any;
    clone: () => flash.events.Event;
    error: any;
    // Instance AS -> JS Bindings
  }
}
