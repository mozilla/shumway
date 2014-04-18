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
// Class: Timer
module Shumway.AVM2.AS.flash.utils {
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;

  export class Timer extends flash.events.EventDispatcher {
    
    // Called whenever the class is initialized.
    static classInitializer: any = null;
    
    // Called whenever an instance of the class is initialized.
    static initializer: any = null;
    
    // List of static symbols to link.
    static classSymbols: string [] = null; // [];
    
    // List of instance symbols to link.
    static instanceSymbols: string [] = null; // ["_delay", "_repeatCount", "_iteration", "delay", "delay", "repeatCount", "repeatCount", "currentCount", "reset", "start", "tick"];
    
    constructor (delay: number, repeatCount: number /*int*/ = 0) {
      this._delay = +delay; this._repeatCount = repeatCount | 0;  this._running = false;
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
    
    // AS -> JS Bindings

    // _delay: number;
    // _repeatCount: number /*int*/;
    // _currentCount: number /*int*/;
    get running(): boolean {
      return this._running;
    }
    stop(): void {
      this._running = false;
      clearInterval(this.interval);
    }
    _start(delay: number, closure: ASFunction): void {
      _delay = +delay;
      this._running = true;
      this.interval = setInterval(closure, delay);
    }
    _tick(): void {
      if (!this._running) {
        return;
      }
      this.dispatchEvent(new flash.events.TimerEvent("timer", true, false));
    }
  }
}
