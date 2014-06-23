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
  [native(cls='Vector3DClass')]
  public class Vector3D
  {
    public static const X_AXIS:Vector3D = new Vector3D(1, 0, 0);
    public static const Y_AXIS:Vector3D = new Vector3D(0, 1, 0);
    public static const Z_AXIS:Vector3D = new Vector3D(0, 0, 1);
    public native static function angleBetween(a:Vector3D, b:Vector3D):Number;
    public native static function distance(pt1:Vector3D, pt2:Vector3D):Number;

    public native function get x():Number;
    public native function set x(v: Number):void;
    public native function get y():Number;
    public native function set y(v: Number):void;
    public native function get z():Number;
    public native function set z(v: Number):void;
    public native function get w():Number;
    public native function set w(v: Number):void;
    public native function Vector3D(x:Number = 0, y:Number = 0, z:Number = 0, w:Number = 0);
    public native function get length():Number;
    public native function get lengthSquared():Number;
    public native function dotProduct(a:Vector3D):Number;
    public native function crossProduct(a:Vector3D):Vector3D;
    public native function normalize():Number;
    public native function scaleBy(s:Number):void;
    public native function incrementBy(a:Vector3D):void;
    public native function decrementBy(a:Vector3D):void;
    public native function add(a:Vector3D):Vector3D;
    public native function subtract(a:Vector3D):Vector3D;
    public native function negate():void;
    public native function equals(toCompare:Vector3D, allFour:Boolean = false):Boolean;
    public native function nearEquals(toCompare:Vector3D, tolerance:Number, allFour:Boolean = false):Boolean;
    public native function project():void;
    public native function copyFrom(sourceVector3D:Vector3D):void;
    public native function setTo(xa:Number, ya:Number, za:Number):void;
    public native function clone():Vector3D;
    public native function toString():String;
  }
}
