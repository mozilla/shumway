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
public class ActivityEvent extends Event {
  public static const ACTIVITY:String = "activity";
  private var _activating:Boolean;
  public function ActivityEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false,
                                activating:Boolean = false)
  {
    super(type, bubbles, cancelable);
    _activating = activating;
  }
  public function get activating():Boolean {
    return _activating;
  }
  public function set activating(value:Boolean):void {
    _activating = value;
  }
  public override function clone():Event {
    return new ActivityEvent(type, bubbles, cancelable, activating);
  }
  public override function toString():String {
    return formatToString('ActivityEvent', 'type', 'bubbles', 'cancelable', 'eventPhase',
                          'activating');
  }
}
}
