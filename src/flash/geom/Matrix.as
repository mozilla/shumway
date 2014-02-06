package flash.geom {
  import Object;
  import flash.geom.Vector3D;
  import flash.geom.Point;
  import flash.geom.Point;
  import Math;
  public class Matrix {
    public function Matrix(a:Number = 1, b:Number = 0, c:Number = 0, d:Number = 1, tx:Number = 0, ty:Number = 0) {}
    public var a:Number;
    public var b:Number;
    public var c:Number;
    public var d:Number;
    public var tx:Number;
    public var ty:Number;
    public function clone():Matrix { notImplemented("clone"); }
    public function concat(m:Matrix):void { notImplemented("concat"); }
    public function invert():void { notImplemented("invert"); }
    public function identity():void { notImplemented("identity"); }
    public function createBox(scaleX:Number, scaleY:Number, rotation:Number = 0, tx:Number = 0, ty:Number = 0):void { notImplemented("createBox"); }
    public function createGradientBox(width:Number, height:Number, rotation:Number = 0, tx:Number = 0, ty:Number = 0):void { notImplemented("createGradientBox"); }
    public function rotate(angle:Number):void { notImplemented("rotate"); }
    public function translate(dx:Number, dy:Number):void { notImplemented("translate"); }
    public function scale(sx:Number, sy:Number):void { notImplemented("scale"); }
    public function deltaTransformPoint(point:Point):Point { notImplemented("deltaTransformPoint"); }
    public function transformPoint(point:Point):Point { notImplemented("transformPoint"); }
    public function toString():String { notImplemented("toString"); }
    public function copyFrom(sourceMatrix:Matrix):void { notImplemented("copyFrom"); }
    public function setTo(aa:Number, ba:Number, ca:Number, da:Number, txa:Number, tya:Number):void { notImplemented("setTo"); }
    public function copyRowTo(row:uint, vector3D:Vector3D):void { notImplemented("copyRowTo"); }
    public function copyColumnTo(column:uint, vector3D:Vector3D):void { notImplemented("copyColumnTo"); }
    public function copyRowFrom(row:uint, vector3D:Vector3D):void { notImplemented("copyRowFrom"); }
    public function copyColumnFrom(column:uint, vector3D:Vector3D):void { notImplemented("copyColumnFrom"); }
  }
}
