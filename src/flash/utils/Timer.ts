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
// Class: Timer
module Shumway.AVM2.AS.flash.utils {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;

  export class Timer extends flash.events.EventDispatcher {
    static classInitializer: any = null;
    static initializer: any = null;
    static classSymbols: string [] = null; // [];
    static instanceSymbols: string [] = ["start!"]; // ["_delay", "_repeatCount", "_iteration", "delay", "delay", "repeatCount", "repeatCount", "currentCount", "reset", "start", "tick"];

    /**
     * This lets you toggle timer event dispatching which is useful when trying to profile other
     * parts of the system.
     */
    public static dispatchingEnabled = true;

    constructor (delay: number, repeatCount: number /*int*/ = 0) {
      false && super(undefined);
      notImplemented("Dummy Constructor: public flash.utils.Timer");
    }
    
    // JS -> AS Bindings
    
    _delay: number;
    _repeatCount: number /*int*/;
    _iteration: number /*int*/;
    _running: boolean;
    reset: () => void;
    start: () => void;
    tick: () => void;

    _interval: number;
    
    // AS -> JS Bindings

    get running(): boolean {
      return this._running;
    }
    stop(): void {
      this._running = false;
      clearInterval(this._interval);
    }
    _start(delay: number, closure: ASFunction): void {
      this._delay = +delay;
      this._running = true;
      this._interval = setInterval(closure, delay);
    }
    _tick(): void {
      if (!this._running) {
        return;
      }
      if (flash.utils.Timer.dispatchingEnabled) {
        this.dispatchEvent(new flash.events.TimerEvent("timer", true, false));
      }
    }
  }
}
