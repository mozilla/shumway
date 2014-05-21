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
import flash.display.BitmapData;
import flash.utils.ByteArray;

public class ShaderEvent extends Event {
  public static const COMPLETE:String = "complete";
  private var _bitmap:BitmapData;
  private var _array:ByteArray;
  private var _vector:Vector;
  public function ShaderEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false,
                              bitmap:BitmapData = null, array:ByteArray = null,
                              vector:Vector = null)
  {
    super(type, bubbles, cancelable);
    _bitmap = bitmap;
    _array = array;
    _vector = vector;
  }
  public function get bitmap():BitmapData {
    return _bitmap;
  }
  public function set bitmap(value:BitmapData):void {
    _bitmap = value;
  }
  public function get array():ByteArray {
    return _array;
  }
  public function set array(value:ByteArray):void {
    _array = value;
  }
  public function get vector():Vector {
    return _vector;
  }
  public function set vector(value:Vector):void {
    _vector = value;
  }

  public override function clone():Event {
    return new ShaderEvent(type, bubbles, cancelable, bitmap, array, vector);
  }

  public override function toString():String {
    return formatToString('ShaderEvent', 'type', 'bubbles', 'cancelable', 'eventPhase',
                          'bitmap', 'array', 'vector');
  }
}
}
