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
  public class Vector3D
  {
    public static const X_AXIS:Vector3D = new Vector3D(1, 0, 0);
    public static const Y_AXIS:Vector3D = new Vector3D(0, 1, 0);
    public static const Z_AXIS:Vector3D = new Vector3D(0, 0, 1);

    public var x:Number;
    public var y:Number;
    public var z:Number;
    public var w:Number;

    public function Vector3D(x:Number = 0, y:Number = 0, z:Number = 0, w:Number = 0) {
      this.x = x;
      this.y = y;
      this.z = z;
      this.w = w;
    }

    public function get length():Number {
      return Math.sqrt(lengthSquared);
    }

    public function get lengthSquared():Number {
      return x * x + y * y + z * z;
    }

    public static function angleBetween(a:Vector3D, b:Vector3D):Number {
      // http://chemistry.about.com/od/workedchemistryproblems/a/scalar-product-vectors-problem.htm
      return Math.acos(a.dotProduct(b) / (a.length * b.length));
    }

    public static function distance(pt1:Vector3D, pt2:Vector3D):Number {
      // http://en.wikipedia.org/wiki/Euclidean_distance#Three_dimensions
      return pt1.subtract(pt2).length;
    }

    public function dotProduct(a:Vector3D):Number {
      return x * a.x + y * a.y + z * a.z;
    }

    public function crossProduct(a:Vector3D):Vector3D {
      return  new Vector3D(y * a.z - z * a.y, z * a.x - x * a.z, x * a.y - y * a.x, 1.0);
    }

    public function normalize():Number {
      var curLength:Number = length;
      if (curLength != 0) {
        x /= curLength;
        y /= curLength;
        z /= curLength;
      } else {
        x = y = z = 0;
      }
      return curLength;
    }

    public function scaleBy(s:Number):void {
      x *= s;
      y *= s;
      z *= s;
    }

    public function incrementBy(a:Vector3D):void {
      x += a.x;
      y += a.y;
      z += a.z;
    }

    public function decrementBy(a:Vector3D):void {
      x -= a.x;
      y -= a.y;
      z -= a.z;
    }

    public function add(a:Vector3D):Vector3D {
      return new Vector3D(x + a.x, y + a.y, z + a.z);
    }

    public function subtract(a:Vector3D):Vector3D {
      return new Vector3D(x - a.x, y - a.y, z - a.z);
    }

    public function negate():void {
      x = -x;
      y = -y;
      z = -z;
    }

    public function equals(toCompare:Vector3D, allFour:Boolean = false):Boolean {
      return (x == toCompare.x)
          && (y == toCompare.y)
          && (z == toCompare.z)
          && (!allFour || (w == toCompare.w));
    }

    public function nearEquals(toCompare:Vector3D, tolerance:Number, allFour:Boolean = false):Boolean {
      return (Math.abs(x - toCompare.x) < tolerance)
          && (Math.abs(y - toCompare.y) < tolerance)
          && (Math.abs(z - toCompare.z) < tolerance)
          && (!allFour || (Math.abs(w - toCompare.w) < tolerance));
    }

    public function project():void {
      x /= w;
      y /= w;
      z /= w;
    }

    public function copyFrom(sourceVector3D:Vector3D):void {
      x = sourceVector3D.x;
      y = sourceVector3D.y;
      z = sourceVector3D.z;
    }

    public function setTo(xa:Number, ya:Number, za:Number):void {
      x = xa;
      y = ya;
      z = za;
    }

    public function clone():Vector3D {
      return new Vector3D(x, y, z, w);
    }

    public function toString():String {
      return "Vector3D(" + x + ", " + y + ", " + z + ")";
    }
  }
}
