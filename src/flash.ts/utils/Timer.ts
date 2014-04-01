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
// Class: Timer
module Shumway.AVM2.AS.flash.utils {
  import notImplemented = Shumway.Debug.notImplemented;
  export class Timer extends flash.events.EventDispatcher {
    static initializer: any = null;
    constructor (delay: number, repeatCount: number /*int*/ = 0) {
      delay = +delay; repeatCount = repeatCount | 0;
      false && super(undefined);
      notImplemented("Dummy Constructor: public flash.utils.Timer");
    }
    // Static   JS -> AS Bindings
    // Static   AS -> JS Bindings
    // Instance JS -> AS Bindings
    m_delay: number;
    m_repeatCount: number /*int*/;
    m_iteration: number /*int*/;
    delay: number;
    repeatCount: number /*int*/;
    currentCount: number /*int*/;
    tick: () => void;
    start: () => void;
    reset: () => void;
    // Instance AS -> JS Bindings
    get running(): boolean {
      notImplemented("public flash.utils.Timer::get running"); return;
    }
    _start(delay: number, closure: ASFunction): void {
      delay = +delay; closure = closure;
      notImplemented("public flash.utils.Timer::_start"); return;
    }
    _timerDispatch(): void {
      notImplemented("public flash.utils.Timer::_timerDispatch"); return;
    }
    stop(): void {
      notImplemented("public flash.utils.Timer::stop"); return;
    }
  }
}
