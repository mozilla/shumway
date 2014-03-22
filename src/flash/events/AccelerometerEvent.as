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
public class AccelerometerEvent extends Event {
  public static const UPDATE:String = "update";
  private var _timestamp:Number;
  private var _accelerationX:Number;
  private var _accelerationY:Number;
  private var _accelerationZ:Number;
  public function AccelerometerEvent(type:String, bubbles:Boolean = false,
                                     cancelable:Boolean = false, timestamp:Number = 0,
                                     accelerationX:Number = 0, accelerationY:Number = 0,
                                     accelerationZ:Number = 0)
  {
    super(type, bubbles, cancelable);
    _timestamp = timestamp;
    _accelerationX = accelerationX;
    _accelerationY = accelerationY;
    _accelerationZ = accelerationZ;
  }
  public function get timestamp():Number {
    return _timestamp;
  }
  public function set timestamp(value:Number):void {
    _timestamp = value;
  }
  public function get accelerationX():Number {
    return _accelerationX;
  }
  public function set accelerationX(value:Number):void {
    _accelerationX = value;
  }
  public function get accelerationY():Number {
    return _accelerationY;
  }
  public function set accelerationY(value:Number):void {
    _accelerationY = value;
  }
  public function get accelerationZ():Number {
    return _accelerationZ;
  }
  public function set accelerationZ(value:Number):void {
    _accelerationZ = value;
  }
  public override function clone():Event {
    return new AccelerometerEvent(type, bubbles, cancelable, timestamp,
                                  accelerationX, accelerationY, accelerationZ);
  }
  public override function toString():String {
    return formatToString('AccelerometerEvent', 'type', 'bubbles', 'cancelable', 'eventPhase',
                          'timestamp', 'accelerationX', 'accelerationY', 'accelerationZ');
  }
}
}
