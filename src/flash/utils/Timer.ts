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
module Shumway.AVMX.AS.flash.utils {

  export class Timer extends flash.events.EventDispatcher {
    static classInitializer: any = null;
    static classSymbols: string [] = null; // [];
    static instanceSymbols: string [] = null;

    /**
     * This lets you toggle timer event dispatching which is useful when trying to profile other
     * parts of the system.
     */
    public static dispatchingEnabled = true;

    constructor (delay: number, repeatCount: number /*int = 0 */) {
      super();
      this._delay = +delay;
      this._repeatCount = repeatCount | 0;
      this._iteration = 0;
    }
    
    _delay: number;
    _repeatCount: number /*int*/;
    _iteration: number /*int*/;
    _running: boolean;
    _interval: number;

    get running(): boolean {
      return this._running;
    }
    get delay() {
      return this._delay;
    }
    set delay(value: number) {
      value = +value;
      if (value < 0 || !isFinite(value)) {
        this.sec.throwError('RangeError', Errors.DelayRangeError);
      }
      this._delay = value;

      if (this._running) {
        this.stop();
        this.start();
      }
    }
    set repeatCount(value: number) {
      this._repeatCount = value | 0;
      if (this._repeatCount && this._running && this._iteration >= this._repeatCount) {
        this.stop();
      }
    }
    get repeatCount() {
      return this._repeatCount;
    }
    get currentCount(): number {
      return this._iteration;
    }
    reset() {
      if (this._running) {
        this.stop();
      }
      this._iteration = 0;
    }
    stop(): void {
      this._running = false;
      clearInterval(this._interval);
    }
    start(): void {
      if (this._running) {
        return;
      }
      this._running = true;
      this._interval = setInterval(this._tick.bind(this), this._delay);
    }
    private _tick(): void {
      this._iteration++;
      if (!this._running) {
        return;
      }
      if (flash.utils.Timer.dispatchingEnabled) {
        enterTimeline("Timer.Timer");
        try {
          this.dispatchEvent(new this.sec.flash.events.TimerEvent("timer", true, false));
        } catch (e) {
          Debug.warning('caught error under Timer TIMER event: ', e);
        }
        leaveTimeline();
      }
      if (this._repeatCount !== 0 && this._iteration >= this._repeatCount) {
        this.stop();
        enterTimeline("Timer.TimerComplete");
        try {
          this.dispatchEvent(new this.sec.flash.events.TimerEvent(events.TimerEvent.TIMER_COMPLETE,
                                                                             false, false));
        } catch (e) {
          Debug.warning('caught error under Timer COMPLETE event: ', e);
        }
        leaveTimeline();
      }
    }
  }
}
