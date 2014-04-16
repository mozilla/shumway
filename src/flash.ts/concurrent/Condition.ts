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
 * limitations under the License.
 */
// Class: Condition
module Shumway.AVM2.AS.flash.concurrent {
  import notImplemented = Shumway.Debug.notImplemented;
  export class Condition extends ASNative {
    static initializer: any = null;
    constructor (mutex: flash.concurrent.Mutex) {
      mutex = mutex;
      false && super();
      notImplemented("Dummy Constructor: public flash.concurrent.Condition");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    wait: (timeout: number = -1) => boolean;
    notify: () => void;
    notifyAll: () => void;
    // Instance AS -> JS Bindings
    get mutex(): flash.concurrent.Mutex {
      notImplemented("public flash.concurrent.Condition::get mutex"); return;
    }
    ctor(mutex: flash.concurrent.Mutex): void {
      mutex = mutex;
      notImplemented("public flash.concurrent.Condition::ctor"); return;
    }
    notifyImpl(): boolean {
      notImplemented("public flash.concurrent.Condition::notifyImpl"); return;
    }
    notifyAllImpl(): boolean {
      notImplemented("public flash.concurrent.Condition::notifyAllImpl"); return;
    }
    waitImpl(timeout: number): number /*int*/ {
      timeout = +timeout;
      notImplemented("public flash.concurrent.Condition::waitImpl"); return;
    }
  }
}
