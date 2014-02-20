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
import flash.net.NetStream;

public class NetMonitorEvent extends Event {
  public static const NET_STREAM_CREATE:String = "netStreamCreate";
  private var _netStream:NetStream;
  public function NetMonitorEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false,
                                  netStream:NetStream = null)
  {
    super(type, bubbles, cancelable);
    _netStream = netStream;
  }
  public function get netStream():NetStream {
    return _netStream;
  }
  public override function clone():Event {
    return new NetMonitorEvent(type, bubbles, cancelable, netStream);
  }
  public override function toString():String {
    return formatToString('NetMonitorEvent', 'type', 'bubbles', 'cancelable', 'eventPhase',
                          'netStream');
  }
}
}
