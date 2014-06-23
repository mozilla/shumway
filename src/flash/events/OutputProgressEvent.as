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
public class OutputProgressEvent extends Event {
  public static const OUTPUT_PROGRESS:String = "outputProgress";
  private var _bytesPending:Number;
  private var _bytesTotal:Number;
  public function OutputProgressEvent(type:String, bubbles:Boolean = false,
                                      cancelable:Boolean = false, bytesPending:Number = 0,
                                      bytesTotal:Number = 0)
  {
    super(type, bubbles, cancelable);
    _bytesPending = bytesPending;
    _bytesTotal = bytesTotal;
  }
  public function get bytesPending():Number {
    return _bytesPending;
  }
  public function set bytesPending(value:Number):void {
    _bytesPending = value;
  }
  public function get bytesTotal():Number {
    return _bytesTotal;
  }
  public function set bytesTotal(value:Number):void {
    _bytesTotal = value;
  }
  public override function clone():Event {
    return new OutputProgressEvent(type, bubbles, cancelable, bytesPending, bytesTotal);
  }
  public override function toString():String {
    return formatToString('OutputProgressEvent', 'type', 'bubbles', 'cancelable', 'eventPhase',
                          'bytesPending', 'bytesTotal');
  }
}
}
