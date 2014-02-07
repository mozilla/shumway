package flash.events {
import flash.display.BitmapData;
import flash.utils.ByteArray;

public class ShaderEvent extends Event {
    public function ShaderEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, bitmap:BitmapData = null, array:ByteArray = null, vector:Vector = null) {
      super(type, bubbles, cancelable);
      notImplemented("ShaderEvent");
    }
    public static const COMPLETE:String = "complete";
    public override function clone():Event { notImplemented("clone"); return null; }
    public override function toString():String { notImplemented("toString"); return ""; }
    public function get bitmapData():BitmapData { notImplemented("bitmapData"); return null; }
    public function set bitmapData(bmpData:BitmapData) { notImplemented("bitmapData"); }
    public function get byteArray():ByteArray { notImplemented("byteArray"); return null; }
    public function set byteArray(bArray:ByteArray) { notImplemented("byteArray"); }
    public function get vector():Vector { notImplemented("vector"); return null; }
    public function set vector(v:Vector) { notImplemented("vector"); }
  }
}
