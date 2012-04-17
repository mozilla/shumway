package flash.geom {

  [native(cls="PointClass")]
  public class Point {
    public function Point(x:Number=0, y:Number=0) {}

    public static function interpolate(pt1:Point, pt2:Point, f:Number):Point { notImplemented("interpolate"); }
    public static function distance(pt1:Point, pt2:Point):Number { notImplemented("distance"); }
    public static function polar(len:Number, angle:Number):Point { notImplemented("polar"); }

    public var x:Number;
    public var y:Number;

    public function get length():Number { notImplemented("length"); }
    public function clone():Point { notImplemented("clone"); }
    public function offset(dx:Number, dy:Number):void { notImplemented("offset"); }
    public function equals(toCompare:Point):Boolean { notImplemented("equals"); }
    public function subtract(v:Point):Point { notImplemented("subtract"); }
    public function add(v:Point):Point { notImplemented("add"); }
    public function normalize(thickness:Number):void { notImplemented("normalize"); }
    public function toString():String { notImplemented("toString"); }

    // [API("674")]
    [compat]
    public function copyFrom(sourcePoint:Point):void { notImplemented("copyFrom"); }
    // [API("674")]
    [compat]
    public function setTo(xa:Number, ya:Number):void { notImplemented("setTo"); }
  }

}
