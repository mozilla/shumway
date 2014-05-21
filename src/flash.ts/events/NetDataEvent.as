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
public class NetDataEvent extends Event {
  public static const MEDIA_TYPE_DATA:String = "mediaTypeData";
  private var _timestamp:Number;
  private var _info:Object;
  public function NetDataEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false,
                               timestamp:Number = 0, info:Object = null)
  {
    super(type, bubbles, cancelable);
    _timestamp = timestamp;
    _info = info;
  }
  public function get timestamp():Number {
    return _timestamp;
  }
  public function get info():Object {
    return _info;
  }
  public override function clone():Event {
    return new NetDataEvent(type, bubbles, cancelable, timestamp, info);
  }
  public override function toString():String {
    return formatToString('AsyncErrorEvent', 'type', 'bubbles', 'cancelable', 'eventPhase',
                          'timestamp', 'info');
  }
}
}
