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

public class Timer extends EventDispatcher {
    public function Timer(delay:Number, repeatCount:int = 0) {}
    public function get delay():Number { notImplemented("delay"); return -1; }
    public function get repeatCount():int { notImplemented("repeatCount"); return -1; }
    public function set repeatCount(value:int):void { notImplemented("repeatCount"); }
    public function get currentCount():int { notImplemented("currentCount"); return -1; }
    public native function get running():Boolean;
    public function set delay(value:Number):void { notImplemented("delay"); }
    public function start():void { notImplemented("start"); }
    public function reset():void { notImplemented("reset"); }
    public native function stop():void;
  }
}
