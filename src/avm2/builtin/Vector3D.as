package flash.geom {

  [native(cls="Vector3DClass")]
  // [Version("10")]
  [compat]
  public class Vector3D {
    public function Vector3D(x:Number=0, y:Number=0, z:Number=0, w:Number=0) {}
    public static const X_AXIS:Vector3D;
    public static const Y_AXIS:Vector3D;
    public static const Z_AXIS:Vector3D;
    public static function angleBetween(a:Vector3D, b:Vector3D):Number { notImplemented("angleBetween"); }
    public static function distance(pt1:Vector3D, pt2:Vector3D):Number { notImplemented("distance"); }
    public var x:Number;
    public var y:Number;
    public var z:Number;
    public var w:Number;
    public function clone():Vector3D { notImplemented("clone"); }
    public function dotProduct(a:Vector3D):Number { notImplemented("dotProduct"); }
    public function crossProduct(a:Vector3D):Vector3D { notImplemented("crossProduct"); }
    public function get length():Number { notImplemented("length"); }
    public function get lengthSquared():Number { notImplemented("lengthSquared"); }
    public function normalize():Number { notImplemented("normalize"); }
    public function scaleBy(s:Number):void { notImplemented("scaleBy"); }
    public function incrementBy(a:Vector3D):void { notImplemented("incrementBy"); }
    public function decrementBy(a:Vector3D):void { notImplemented("decrementBy"); }
    public function add(a:Vector3D):Vector3D { notImplemented("add"); }
    public function subtract(a:Vector3D):Vector3D { notImplemented("subtract"); }
    public function negate():void { notImplemented("negate"); }
    public function equals(toCompare:Vector3D, allFour:Boolean=false):Boolean { notImplemented("equals"); }
    public function nearEquals(toCompare:Vector3D, tolerance:Number, allFour:Boolean=false):Boolean { notImplemented("nearEquals"); }
    public function project():void { notImplemented("project"); }
    public function toString():String { notImplemented("toString"); }
    // [API("674")]
    public function copyFrom(sourceVector3D:Vector3D):void { notImplemented("copyFrom"); }
    // [API("674")]
    public function setTo(xa:Number, ya:Number, za:Number):void { notImplemented("setTo"); }
  }

}
