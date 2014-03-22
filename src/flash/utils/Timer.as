/*
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *totalMemory
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package flash.utils {
import flash.events.EventDispatcher;
import flash.events.TimerEvent;

[native(cls='TimerClass')]
public class Timer extends EventDispatcher {
  public function Timer(delay:Number, repeatCount:int = 0) {
    if (delay < 0 || !isFinite(delay)) {
      Error.throwError(RangeError, 2066);
    }
    _delay = delay;
    _repeatCount = repeatCount;
  }
  private var _delay:Number;
  private var _repeatCount:int;
  private var _iteration:int;
  public native function get running():Boolean;
  public function get delay():Number {
    return _delay;
  }
  public function set delay(value:Number):void {
    if (value < 0 || !isFinite(value)) {
      Error.throwError(RangeError, 2066);
    }
    _delay = value;

    if (running) {
      stop();
      start();
    }
  }
  public function get repeatCount():int {
    return _repeatCount;
  }
  public function set repeatCount(value:int):void {
    _repeatCount = value;
    if (_repeatCount && running) {
      if (_iteration >= _repeatCount) {
        stop();
      }
    }
  }
  public function get currentCount():int {
    return _iteration;
  }
  public function reset():void {
    if (running) {
      stop();
    }
    _iteration = 0;
  }
  public native function stop():void;
  public function start():void {
    if (!running) {
      _start(_delay, tick);
    }
  }
  private native function _start(delay:Number, closure:Function):void;
  private function tick():void {
    _iteration++;
    _tick();
    if (_repeatCount != 0) {
      if (_iteration >= _repeatCount) {
        stop();
        dispatchEvent(new TimerEvent(TimerEvent.TIMER_COMPLETE, false, false));
      }
    }
  }
  private native function _tick():void;
}
}
