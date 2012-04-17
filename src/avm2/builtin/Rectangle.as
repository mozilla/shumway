package flash.geom {

  [native(cls="RectangleClass")]
  public class Rectangle {
    public function Rectangle(x:Number=0, y:Number=0, width:Number=0, height:Number=0) {}

    public var x:Number;
    public var y:Number;
    public var width:Number;
    public var height:Number;

    public function get left():Number { notImplemented("left"); }
    public function set left(value:Number):void { notImplemented("left"); }
    public function get right():Number { notImplemented("right"); }
    public function set right(value:Number):void { notImplemented("right"); }
    public function get top():Number { notImplemented("top"); }
    public function set top(value:Number):void { notImplemented("top"); }
    public function get bottom():Number { notImplemented("bottom"); }
    public function set bottom(value:Number):void { notImplemented("bottom"); }
    public function get topLeft():Point { notImplemented("topLeft"); }
    public function set topLeft(value:Point):void { notImplemented("topLeft"); }
    public function get bottomRight():Point { notImplemented("bottomRight"); }
    public function set bottomRight(value:Point):void { notImplemented("bottomRight"); }
    public function get size():Point { notImplemented("size"); }
    public function set size(value:Point):void { notImplemented("size"); }
    public function clone():Rectangle { notImplemented("clone"); }
    public function isEmpty():Boolean { notImplemented("isEmpty"); }
    public function setEmpty():void { notImplemented("setEmpty"); }
    public function inflate(dx:Number, dy:Number):void { notImplemented("inflate"); }
    public function inflatePoint(point:Point):void { notImplemented("inflatePoint"); }
    public function offset(dx:Number, dy:Number):void { notImplemented("offset"); }
    public function offsetPoint(point:Point):void { notImplemented("offsetPoint"); }
    public function contains(x:Number, y:Number):Boolean { notImplemented("contains"); }
    public function containsPoint(point:Point):Boolean { notImplemented("containsPoint"); }
    public function containsRect(rect:Rectangle):Boolean { notImplemented("containsRect"); }
    public function intersection(toIntersect:Rectangle):Rectangle { notImplemented("intersection"); }
    public function intersects(toIntersect:Rectangle):Boolean { notImplemented("intersects"); }
    public function union(toUnion:Rectangle):Rectangle { notImplemented("union"); }
    public function equals(toCompare:Rectangle):Boolean { notImplemented("equals"); }
    public function toString():String { notImplemented("toString"); }

    // [API("674")]
    [compat]
    public function copyFrom(sourceRect:Rectangle):void { notImplemented("copyFrom"); }
    // [API("674")]
    [compat]
    public function setTo(xa:Number, ya:Number, widtha:Number, heighta:Number):void { notImplemented("setTo"); }
  }

}
