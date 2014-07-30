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

package flash.geom
{
  [native(cls='PointClass')]
  public class Point
  {
    public native function set x(xa:Number);
    public native function get x():Number;
    public native function set y(ya:Number);
    public native function get y():Number;

    public native function Point(x:Number = 0, y:Number = 0);
    public native function get length():Number;
    public native static function interpolate(pt1:Point, pt2:Point, f:Number):Point;
    public native static function distance(pt1:Point, pt2:Point):Number;
    public native static function polar(len:Number, angle:Number):Point;
    public native function clone():Point;
    public native function offset(dx:Number, dy:Number):void;
    public native function equals(toCompare:Point):Boolean;
    public native function subtract(v:Point):Point;
    public native function add(v:Point):Point;
    public native function normalize(thickness:Number):void;
    public native function copyFrom(sourcePoint:Point):void;
    public native function setTo(xa:Number, ya:Number):void;
    public native function toString():String;
  }
}
