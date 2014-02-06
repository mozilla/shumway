package flash.events {
  import flash.events.Event;
  import String;
  import Boolean;
  import Number;
  import Object;
  public class NetDataEvent extends Event {
    public function NetDataEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, timestamp:Number = 0, info:Object = null) {}
    public static const MEDIA_TYPE_DATA:String = "mediaTypeData";
    public override function clone():Event { notImplemented("clone"); }
    public override function toString():String { notImplemented("toString"); }
    public function get timestamp():Number { notImplemented("timestamp"); }
    public function get info():Object { notImplemented("info"); }
  }
}
