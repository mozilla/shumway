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
public class StatusEvent extends Event {
  public static const STATUS:String = "status";
  private var _code:String;
  private var _level:String;
  public function StatusEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false,
                              code:String = "", level:String = "")
  {
    super(type, bubbles, cancelable);
    _code = code;
    _level = level;
  }
  public function get code():String {
    return _code;
  }
  public function set code(value:String):void {
    _code = value;
  }
  public function get level():String {
    return _level;
  }
  public function set level(value:String):void {
    _level = value;
  }

  public override function clone():Event {
    return new StatusEvent(type, bubbles, cancelable, code, level);
  }

  public override function toString():String {
    return formatToString('SyncEvent', 'type', 'bubbles', 'cancelable', 'eventPhase',
                          'code', 'level');
  }
}
}
