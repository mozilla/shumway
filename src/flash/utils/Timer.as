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

[native(cls='TimerClass')]
public class Timer extends EventDispatcher {
  public native function Timer(delay:Number, repeatCount:int = 0);
  public native function get running():Boolean;
  public native function get delay():Number;
  public native function set delay(value:Number):void;
  public native function get repeatCount():int;
  public native function set repeatCount(value:int):void;
  public native function get currentCount():int;
  public native function reset():void;
  public native function stop():void;
  public native function start():void;
}
}
