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
import flash.utils.ByteArray;

public class NetFilterEvent extends Event {
  public function NetFilterEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false,
                                 header:ByteArray = null, data:ByteArray = null)
  {
    super(type, bubbles, cancelable);
    this.header = header;
    this.data = data;
  }
  public var header:ByteArray;
  public var data:ByteArray;
  public override function clone():Event {
    return new NetFilterEvent(type, bubbles, cancelable, header, data);
  }
  public override function toString():String {
    return formatToString('NetFilterEvent', 'type', 'bubbles', 'cancelable', 'eventPhase',
                          'header', 'data');
  }
}
}
