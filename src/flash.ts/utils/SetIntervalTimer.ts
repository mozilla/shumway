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
// Class: SetIntervalTimer
module Shumway.AVM2.AS.flash.utils {
  import notImplemented = Shumway.Debug.notImplemented;
  export class SetIntervalTimer extends flash.utils.Timer {
    static initializer: any = null;
    constructor (closure: ASFunction, delay: number, repeats: boolean, rest: any []) {
      closure = closure; delay = +delay; repeats = !!repeats; rest = rest;
      false && super(undefined, undefined);
      notImplemented("Dummy Constructor: packageInternal flash.utils.SetIntervalTimer");
    }
    // Static   JS -> AS Bindings
    static clearInterval: (id_to_clear: number /*uint*/) => void;
    static intervals: any [];
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    onTimer: (event: flash.events.Event) => void;
    id: number /*uint*/;
    closure: ASFunction;
    rest: any [];
    // Instance AS -> JS Bindings
  }
}
