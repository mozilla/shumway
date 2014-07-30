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

package flash.geom {

[native(cls='MatrixClass')]
public class Matrix {
    public native function set a(a:Number);
    public native function get a():Number;
    public native function set b(b:Number);
    public native function get b():Number;
    public native function set c(c:Number);
    public native function get c():Number;
    public native function set d(d:Number);
    public native function get d():Number;
    public native function set tx(tx:Number);
    public native function get tx():Number;
    public native function set ty(ty:Number);
    public native function get ty():Number;
    public native function Matrix(a:Number = 1, b:Number = 0, c:Number = 0, d:Number = 1, tx:Number = 0, ty:Number = 0);
    public native function concat(m:Matrix):void;
    public native function invert():void;
    public native function identity():void;
    public native function createBox(scaleX:Number, scaleY:Number, rotation:Number = 0, tx:Number = 0, ty:Number = 0):void;
    public native function createGradientBox(width:Number, height:Number, rotation:Number = 0, tx:Number = 0, ty:Number = 0):void;
    public native function rotate(angle:Number):void;
    public native function translate(dx:Number, dy:Number):void;
    public native function scale(sx:Number, sy:Number):void;
    public native function deltaTransformPoint(point:Point):Point;
    public native function transformPoint(point:Point):Point;
    public native function copyFrom(sourceMatrix:Matrix):void;
    public native function setTo(aa:Number, ba:Number, ca:Number, da:Number, txa:Number, tya:Number):void;
    public native function copyRowTo(row:uint, vector3D:Vector3D):void;
    public native function copyColumnTo(column:uint, vector3D:Vector3D):void;
    public native function copyRowFrom(row:uint, vector3D:Vector3D):void;
    public native function copyColumnFrom(column:uint, vector3D:Vector3D):void;
    public native function clone():Matrix;
    public native function toString():String;
  }
}
