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
[native(cls='RectangleClass')]
public class Rectangle
  {
    public native function set x(x:Number);
    public native function get x():Number;

    public native function set y(y:Number);
    public native function get y():Number;

    public native function set width(y:Number);
    public native function get width():Number;

    public native function set height(y:Number);
    public native function get height():Number;

    public native function Rectangle(x:Number = 0, y:Number = 0, width:Number = 0, height:Number = 0);

    public native function get left():Number;

    public native function set left(value:Number):void;

    public native function get right():Number;

    public native function set right(value:Number):void;

    public native function get top():Number;

    public native function set top(value:Number):void;

    public native function get bottom():Number;

    public native function set bottom(value:Number):void;

    public native function get topLeft():Point;

    public native function set topLeft(value:Point):void;

    public native function get bottomRight():Point;

    public native function set bottomRight(value:Point):void;

    public native function get size():Point;

    public native function set size(value:Point):void;

    public native function clone():Rectangle;

    public native function isEmpty():Boolean;

    public native function setEmpty():void;

    public native function inflate(dx:Number, dy:Number):void;

    public native function inflatePoint(point:Point):void;

    public native function offset(dx:Number, dy:Number):void;

    public native function offsetPoint(point:Point):void;

    public native function contains(x:Number, y:Number):Boolean;

    public native function containsPoint(point:Point):Boolean;

    public native function containsRect(rect:Rectangle):Boolean;

    public native function intersection(toIntersect:Rectangle):Rectangle;

    public native function intersects(toIntersect:Rectangle):Boolean;

    public native function union(toUnion:Rectangle):Rectangle;

    public native function equals(toCompare:Rectangle):Boolean;

    public native function copyFrom(sourceRect:Rectangle):void;

    public native function setTo(xa:Number, ya:Number, widtha:Number, heighta:Number):void;

    public native function toString():String;
  }
}
