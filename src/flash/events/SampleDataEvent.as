package flash.events {
import flash.utils.ByteArray;

public class SampleDataEvent extends Event {
    public function SampleDataEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, theposition:Number = 0, thedata:ByteArray = null) {
      super(type, bubbles, cancelable);
      notImplemented("SampleDataEvent");
    }
    public static const SAMPLE_DATA:String = "sampleData";
    public override function clone():Event { notImplemented("clone"); return null; }
    public override function toString():String { notImplemented("toString"); return ""; }
    public function get position():Number { notImplemented("position"); return -1; }
    public function set position(theposition:Number) { notImplemented("position"); }
    public function get data():ByteArray { notImplemented("data"); return null; }
    public function set data(thedata:ByteArray) { notImplemented("data"); }
  }
}
