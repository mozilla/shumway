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
public class ProgressEvent extends Event {
  public static const PROGRESS:String = "progress";
  public static const SOCKET_DATA:String = "socketData";

  public function ProgressEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false,
                                bytesLoaded:Number = 0, bytesTotal:Number = 0)
  {
    super(type, bubbles, cancelable);
    _bytesLoaded = bytesLoaded;
    _bytesTotal = bytesTotal;
  }

  private var _bytesLoaded;
  private var _bytesTotal;

  public function get bytesLoaded():Number {
    return _bytesLoaded;
  }

  public function set bytesLoaded(value:Number):void {
    _bytesLoaded = value;
  }

  public function get bytesTotal():Number {
    return _bytesLoaded;
  }

  public function set bytesTotal(value:Number):void {
    _bytesTotal = value;
  }

  public override function clone():Event {
    return new ProgressEvent(type, bubbles, cancelable, bytesLoaded, bytesTotal);
  }

  public override function toString():String {
    return formatToString('ProgressEvent', 'bubbles', 'cancelable', 'eventPhase',
                          'bytesLoaded', 'bytesTotal');
  }
}
}
