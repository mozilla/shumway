package flash.events {
  import flash.events.Event;
  import __AS3__.vec.Vector;
  import String;
  import Boolean;
  import flash.display.BitmapData;
  import Number;
  import flash.utils.ByteArray;
  public class ShaderEvent extends Event {
    public function ShaderEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, bitmap:BitmapData = null, array:ByteArray = null, vector:Vector = null) {}
    public static const COMPLETE:String = "complete";
    public override function clone():Event { notImplemented("clone"); }
    public override function toString():String { notImplemented("toString"); }
    public function get bitmapData():BitmapData { notImplemented("bitmapData"); }
    public function set bitmapData(bmpData:BitmapData) { notImplemented("bitmapData"); }
    public function get byteArray():ByteArray { notImplemented("byteArray"); }
    public function set byteArray(bArray:ByteArray) { notImplemented("byteArray"); }
    public function get vector():Vector { notImplemented("vector"); }
    public function set vector(v:Vector) { notImplemented("vector"); }
  }
}
