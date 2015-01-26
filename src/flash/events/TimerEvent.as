/*
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package flash.events {
[native(cls='TimerEventClass')]
public class TimerEvent extends Event {
  public static const TIMER:String = "timer";
  public static const TIMER_COMPLETE:String = "timerComplete";
  public function TimerEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false) {
    super(type, bubbles, cancelable);
  }
  public override native function clone():Event;
  public override native function toString():String;
  public native function updateAfterEvent():void;
}
}
