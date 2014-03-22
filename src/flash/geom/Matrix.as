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

  public class Matrix {

    public var a:Number;
    public var b:Number;
    public var c:Number;
    public var d:Number;
    public var tx:Number;
    public var ty:Number;

    public function Matrix(a:Number = 1, b:Number = 0, c:Number = 0, d:Number = 1, tx:Number = 0, ty:Number = 0) {
      this.a = a;
      this.b = b;
      this.c = c;
      this.d = d;
      this.tx = tx;
      this.ty = ty;
    }

    public function concat(m:Matrix):void {
      var ta:Number = a;
      var tb:Number = b;
      var tc:Number = c;
      var td:Number = d;
      var ttx:Number = tx;
      var tty:Number = ty;
      a = m.a * ta + m.c * tb;
      b = m.b * ta + m.d * tb;
      c = m.a * tc + m.c * td;
      d = m.b * tc + m.d * td;
      tx = m.a * ttx + m.c * tty + m.tx;
      ty = m.b * ttx + m.d * tty + m.ty;
    }

    public function invert():void {
      var det:Number = a * d - b * c;
      if (det == 0) {
        identity();
        return;
      }
      a = d / det;
      b = -b / det;
      c = -c / det;
      d = a / det;
      var ttx:Number = tx;
      var tty:Number = ty;
      tx = -(a * ttx + c * tty);
      ty = -(b * ttx + d * tty);
    }

    public function identity():void {
      a = d = 1;
      b = c = tx = ty = 0;
    }

    public function createBox(scaleX:Number, scaleY:Number, rotation:Number = 0, tx:Number = 0, ty:Number = 0):void {
      if (rotation != 0) {
        var u:Number = Math.cos(rotation);
        var v:Number = Math.sin(rotation);
        a = u * scaleX;
        b = v * scaleY;
        c = -v * scaleX;
        d = u * scaleY;
      } else {
        a = scaleX;
        b = 0;
        c = 0;
        d = scaleY;
      }
      this.tx = tx;
      this.ty = ty;
    }

    public function createGradientBox(width:Number, height:Number, rotation:Number = 0, tx:Number = 0, ty:Number = 0):void {
      createBox(width / 1638.4, height / 1638.4, rotation, tx + width / 2, ty + height / 2);
    }

    public function rotate(angle:Number):void {
      if (angle != 0) {
        var u:Number = Math.cos(angle);
        var v:Number = Math.sin(angle);
        var ta:Number = a;
        var tb:Number = b;
        var tc:Number = c;
        var td:Number = d;
        var ttx:Number = tx;
        var tty:Number = ty;
        a = ta * u - tb * v;
        b = ta * v + tb * u;
        c = tc * u - td * v;
        d = tc * v + td * u;
        tx = ttx * u - tty * v;
        ty = ttx * v + tty * u;
      }
    }

    public function translate(dx:Number, dy:Number):void {
      tx += dx;
      ty += dy;
    }

    public function scale(sx:Number, sy:Number):void {
      if (sx !== 1) {
        a *= sx;
        c *= sx;
        tx *= sx;
      }
      if (sy !== 1) {
        b *= sy;
        d *= sy;
        ty *= sy;
      }
    }

    public function deltaTransformPoint(point:Point):Point {
      return new Point(a * point.x + c * point.y, b * point.x + d * point.y);
    }

    public function transformPoint(point:Point):Point {
      return new Point(a * point.x + c * point.y + tx, b * point.x + d * point.y + ty);
    }

    public function copyFrom(sourceMatrix:Matrix):void {
      a = sourceMatrix.a;
      b = sourceMatrix.b;
      c = sourceMatrix.c;
      d = sourceMatrix.d;
      tx = sourceMatrix.tx;
      ty = sourceMatrix.ty;
    }

    public function setTo(aa:Number, ba:Number, ca:Number, da:Number, txa:Number, tya:Number):void {
      a = aa;
      b = ba;
      c = ca;
      d = da;
      tx = txa;
      ty = tya;
    }

    public function copyRowTo(row:uint, vector3D:Vector3D):void {
      if (row == 0) {
        vector3D.x = a;
        vector3D.y = c;
        vector3D.z = tx;
      } else if (row == 1) {
        vector3D.x = b;
        vector3D.y = d;
        vector3D.z = ty;
      } else if (row == 2) {
        vector3D.x = 0;
        vector3D.y = 0;
        vector3D.z = 1;
      }
    }

    public function copyColumnTo(column:uint, vector3D:Vector3D):void {
      if (column == 0) {
        vector3D.x = a;
        vector3D.y = b;
        vector3D.z = 0;
      } else if (column == 1) {
        vector3D.x = c;
        vector3D.y = d;
        vector3D.z = 0;
      } else if (column == 2) {
        vector3D.x = tx;
        vector3D.y = ty;
        vector3D.z = 1;
      }
    }

    public function copyRowFrom(row:uint, vector3D:Vector3D):void {
      if (row == 0) {
        a = vector3D.x;
        c = vector3D.y;
        tx = vector3D.z;
      } else if (row == 1) {
        b = vector3D.x;
        d = vector3D.y;
        ty = vector3D.z;
      }
    }

    public function copyColumnFrom(column:uint, vector3D:Vector3D):void {
      if (column == 0) {
        a = vector3D.x;
        c = vector3D.y;
        tx = vector3D.z;
      } else if (column == 1) {
        b = vector3D.x;
        d = vector3D.y;
        ty = vector3D.z;
      }
    }

    public function clone():Matrix {
      return new Matrix(a, b, c, d, tx, ty);
    }

    public function toString():String {
      return "(a=" + a + ", b=" + b + ", c=" + c + ", d=" + d + ", tx=" + tx + ", ty=" + ty + ")";
    }
  }
}
