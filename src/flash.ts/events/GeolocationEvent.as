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
public class GeolocationEvent extends Event {
  public static const UPDATE:String = "update";
  private var _latitude:Number;
  private var _longitude:Number;
  private var _altitude:Number;
  private var _hAccuracy:Number;
  private var _vAccuracy:Number;
  private var _speed:Number;
  private var _heading:Number;
  private var _timestamp:Number;
  public function GeolocationEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false,
                                   latitude:Number = 0, longitude:Number = 0, altitude:Number = 0,
                                   hAccuracy:Number = 0, vAccuracy:Number = 0, speed:Number = 0,
                                   heading:Number = 0, timestamp:Number = 0)
  {
    super(type, bubbles, cancelable);
    _latitude = latitude;
    _longitude = longitude;
    _altitude = altitude;
    _hAccuracy = hAccuracy;
    _vAccuracy = vAccuracy;
    _speed = speed;
    _heading = heading;
    _timestamp = timestamp;
  }
  public function get latitude():Number {
    return _latitude;
  }
  public function set latitude(value:Number):void {
    _latitude = value;
  }
  public function get longitude():Number {
    return _longitude;
  }
  public function set longitude(value:Number):void {
    _longitude = value;
  }
  public function get altitude():Number {
    return _altitude;
  }
  public function set altitude(value:Number):void {
    _altitude = value;
  }
  public function get hAccuracy():Number {
    return _hAccuracy;
  }
  public function set hAccuracy(value:Number):void {
    _hAccuracy = value;
  }
  public function get vAccuracy():Number {
    return _vAccuracy;
  }
  public function set vAccuracy(value:Number):void {
    _vAccuracy = value;
  }
  public function get speed():Number {
    return _speed;
  }
  public function set speed(value:Number):void {
    _speed = value;
  }
  public function get heading():Number {
    return _heading;
  }
  public function set heading(value:Number):void {
    _heading = value;
  }
  public function get timestamp():Number {
    return _timestamp;
  }
  public function set timestamp(value:Number):void {
    _timestamp = value;
  }
  public override function clone():Event {
    return new GeolocationEvent(type, bubbles, cancelable, latitude, longitude, altitude,
                                hAccuracy, vAccuracy, speed, heading, timestamp);
  }
  public override function toString():String {
    return formatToString('GeolocationEvent', 'type', 'bubbles', 'cancelable', 'eventPhase',
                          'latitude', 'longitude', 'altitude', 'hAccuracy', 'vAccuracy',
                          'speed', 'heading', 'timestamp');
  }
}
}
