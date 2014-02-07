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
public class Rectangle
  {
    public var x:Number;
    public var y:Number;
    public var width:Number;
    public var height:Number;

    public function Rectangle(x:Number = 0, y:Number = 0, width:Number = 0, height:Number = 0) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
    }

    public function get left():Number {
      return x;
    }
    public function set left(value:Number):void {
      width += x - value
      x = value;
    }

    public function get right():Number {
      return x + width;
    }
    public function set right(value:Number):void {
      width = value - x;
    }

    public function get top():Number {
      return y;
    }
    public function set top(value:Number):void {
      height += y - value;
      y = value;
    }

    public function get bottom():Number {
      return y + height;
    }
    public function set bottom(value:Number):void {
      height = value - y;
    }

    public function get topLeft():Point {
      return new Point(left, top);
    }
    public function set topLeft(value:Point):void {
      top = value.y;
      left = value.x;
    }

    public function get bottomRight():Point {
      return new Point(right, bottom);
    }
    public function set bottomRight(value:Point):void {
      bottom = value.y;
      right = value.x;
    }

    public function get size():Point {
      return new Point(width, height);
    }
    public function set size(value:Point):void {
      width = value.x;
      height = value.y;
    }

    public function clone():Rectangle {
      return new Rectangle(x, y, width, height);
    }

    public function isEmpty():Boolean {
      return width <= 0 || height <= 0;
    }

    public function setEmpty():void {
      x = 0;
      y = 0;
      width = 0;
      height = 0;
    }

    public function inflate(dx:Number, dy:Number):void {
      x -= dx;
      y -= dy;
      width += (dx * 2);
      height += (dy * 2);
    }

    public function inflatePoint(point:Point):void {
      inflate(point.x, point.y);
    }

    public function offset(dx:Number, dy:Number):void {
      x += dx;
      y += dy;
    }

    public function offsetPoint(point:Point):void {
      offset(point.x, point.y);
    }

    public function contains(x:Number, y:Number):Boolean {
      return this.x <= x && x <= this.right && this.y <= y && y <= this.bottom;
    }

    public function containsPoint(point:Point):Boolean {
      return contains(point.x, point.y);
    }

    public function containsRect(rect:Rectangle):Boolean {
      return containsPoint(rect.topLeft) && containsPoint(rect.bottomRight);
    }

    public function intersection(toIntersect:Rectangle):Rectangle {
      var l:Number = Math.max(x, toIntersect.x);
      var r:Number = Math.min(right, toIntersect.right);
      if (l <= r) {
        var t:Number = Math.max(y, toIntersect.y);
        var b:Number = Math.min(bottom, toIntersect.bottom);
        if (t <= b) {
          return new Rectangle(l, t, r - l, b - t);
        }
      }
      return new Rectangle();
    }

    public function intersects(toIntersect:Rectangle):Boolean {
      return Math.max(x, toIntersect.x) <= Math.min(right, toIntersect.right)
          && Math.max(y, toIntersect.y) <= Math.min(bottom, toIntersect.bottom);
    }

    public function union(toUnion:Rectangle):Rectangle {
      if (toUnion.width == 0 || toUnion.height == 0) {
        return clone();
      }
      if (width == 0 || height == 0) {
        return toUnion.clone();
      }
      var l:Number = Math.min(x, toUnion.x);
      var t:Number = Math.min(y, toUnion.y);
      return new Rectangle(l,
                           t,
                           Math.max(right, toUnion.right) - l,
                           Math.max(bottom, toUnion.bottom) - t);
    }

    public function equals(toCompare:Rectangle):Boolean {
      return x == toCompare.x
          && y == toCompare.y
          && width == toCompare.width
          && height == toCompare.height;
    }

    public function copyFrom(sourceRect:Rectangle):void {
      x = sourceRect.x;
      y = sourceRect.y;
      width = sourceRect.width;
      height = sourceRect.height;
    }

    public function setTo(xa:Number, ya:Number, widtha:Number, heighta:Number):void {
      x = xa;
      y = ya;
      width = widtha;
      height = heighta;
    }

    public function toString():String {
      return "(x=" + x + ", y=" + y + ", w=" + width + ", h=" + height + ")";
    }
  }
}
