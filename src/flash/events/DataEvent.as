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
public class DataEvent extends TextEvent {
  public static const DATA:String = "data";
  public static const UPLOAD_COMPLETE_DATA:String = "uploadCompleteData";
  private var _data:String;
  public function DataEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false,
                            data:String = "")
  {
    super(type, bubbles, cancelable);
    _data = data;
  }
  public function get data():String {
    return _data;
  }
  public function set data(value:String):void {
    _data = value;
  }
  public override function clone():Event {
    return new DataEvent(type, bubbles, cancelable, data);
  }

  public override function toString():String {
    return formatToString('DataEvent', 'type', 'bubbles', 'cancelable', 'eventPhase', 'data');
  }
}
}
