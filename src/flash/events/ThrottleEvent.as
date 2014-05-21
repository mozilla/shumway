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
public class ThrottleEvent extends Event {
  public static const THROTTLE:String = "throttle";
  private var _state:String;
  private var _targetFrameRate:Number;
  public function ThrottleEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false,
                                state:String = null, targetFrameRate:Number = 0)
  {
    super(type, bubbles, cancelable);
    _state = state;
    _targetFrameRate = targetFrameRate;
  }
  public function get state():String {
    return _state;
  }
  public function get targetFrameRate():Number {
    return _targetFrameRate;
  }
  public override function clone():Event {
    return new ThrottleEvent(type, bubbles, cancelable, state, targetFrameRate);
  }
  public override function toString():String {
    return formatToString('ThrottleEvent', 'type', 'bubbles', 'cancelable', 'eventPhase',
                          'state', 'targetFrameRate');
  }
}
}
