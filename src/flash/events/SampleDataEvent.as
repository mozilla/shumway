package flash.events {
  import flash.events.Event;
  import String;
  import Boolean;
  import Number;
  import flash.utils.ByteArray;
  public class SampleDataEvent extends Event {
    public function SampleDataEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, theposition:Number = 0, thedata:ByteArray = null) {}
    public static const SAMPLE_DATA:String = "sampleData";
    public override function clone():Event { notImplemented("clone"); }
    public override function toString():String { notImplemented("toString"); }
    public function get position():Number { notImplemented("position"); }
    public function set position(theposition:Number) { notImplemented("position"); }
    public function get data():ByteArray { notImplemented("data"); }
    public function set data(thedata:ByteArray) { notImplemented("data"); }
  }
}
