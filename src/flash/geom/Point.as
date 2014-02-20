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
  public class Point
  {
    public var x:Number;
    public var y:Number;

    public function Point(x:Number = 0, y:Number = 0) {
      this.x = x;
      this.y = y;
    }

    public function get length():Number {
      return Math.sqrt(x * x + y * y);
    }

    public static function interpolate(pt1:Point, pt2:Point, f:Number):Point {
      var f1:Number = 1 - f;
      return new Point(pt1.x * f + pt2.x * f1, pt1.y * f + pt2.y * f1);
    }

    public static function distance(pt1:Point, pt2:Point):Number {
      var dx = pt2.x - pt1.x;
      var dy = pt2.y - pt1.y;
      return (dx == 0) ?
                Math.abs(dy) :
                (dy == 0) ?
                  Math.abs(dx) :
                  Math.sqrt(dx * dx + dy * dy);
    }

    public static function polar(len:Number, angle:Number):Point {
      return new Point(len * Math.cos(angle), len * Math.sin(angle));
    }

    public function clone():Point {
      return new Point(x, y);
    }

    public function offset(dx:Number, dy:Number):void {
      x += dx;
      y += dy;
    }

    public function equals(toCompare:Point):Boolean {
      return x == toCompare.x && y == toCompare.y;
    }

    public function subtract(v:Point):Point {
      return new Point(x - v.x, y - v.y);
    }

    public function add(v:Point):Point {
      return new Point(x + v.x, y + v.y);
    }

    public function normalize(thickness:Number):void {
      if (x != 0 || y != 0) {
        var relativeThickness:Number = thickness / length;
        x *= relativeThickness;
        y *= relativeThickness;
      }
    }

    public function copyFrom(sourcePoint:Point):void {
      x = sourcePoint.x;
      y = sourcePoint.y;
    }

    public function setTo(xa:Number, ya:Number):void {
      x = xa;
      y = ya;
    }

    public function toString():String {
      return "(x=" + x + ", y=" + y + ")";
    }
  }
}
