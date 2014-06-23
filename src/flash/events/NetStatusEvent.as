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
public class NetStatusEvent extends Event {
  public static const NET_STATUS:String = "netStatus";
  private var _info:Object;
  public function NetStatusEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false,
                                 info:Object = null)
  {
    super(type, bubbles, cancelable);
    _info = info;
  }
  public function get info():Object {
    return _info;
  }
  public function set info(value:Object):void {
    _info = value;
  }
  public override function clone():Event {
    return new NetStatusEvent(type, bubbles, cancelable, info);
  }
  public override function toString():String {
    return formatToString('NetStatusEvent', 'type', 'bubbles', 'cancelable', 'eventPhase',
                          'info');
  }
}
}
