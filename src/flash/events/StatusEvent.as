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
[native]
public class StatusEvent extends Event {
  public static const STATUS:String = "status";
  public function StatusEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false,
                              code:String = "", level:String = "")
  {
    super(type, bubbles, cancelable);
    this.code = code;
    this.level = level;
  }
  public native function get code():String;
  public native function set code(value:String):void;
  public native function get level():String;
  public native function set level(value:String):void;

  public native override function clone():Event;

  public native override function toString():String;
}
}
