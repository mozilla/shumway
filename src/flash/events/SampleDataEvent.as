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

public class SampleDataEvent extends Event {
  public static const SAMPLE_DATA:String = "sampleData";
  private var _theposition:Number;
  private var _thedata:ByteArray;
  public function SampleDataEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false,
                                  theposition:Number = 0, thedata:ByteArray = null)
  {
    super(type, bubbles, cancelable);
    _theposition = theposition;
    _thedata = thedata;
  }
  public function get theposition():Number {
    return _theposition;
  }
  public function set theposition(value:Number):void {
    _theposition = value;
  }
  public function get thedata():ByteArray {
    return _thedata;
  }
  public function set thedata(value:ByteArray):void {
    _thedata = value;
  }
  public override function clone():Event {
    return new SampleDataEvent(type, bubbles, cancelable, theposition, thedata);
  }

  public override function toString():String {
    return formatToString('SampleDataEvent', 'bubbles', 'cancelable', 'eventPhase',
                          'theposition', 'thedata');
}
}
}
