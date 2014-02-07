package flash.events {
public class NetDataEvent extends Event {
    public function NetDataEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, timestamp:Number = 0, info:Object = null) {
      super(type, bubbles, cancelable);
      notImplemented("NetDataEvent");
    }
    public static const MEDIA_TYPE_DATA:String = "mediaTypeData";
    public override function clone():Event { notImplemented("clone"); return null; }
    public override function toString():String { notImplemented("toString"); return ""; }
    public function get timestamp():Number { notImplemented("timestamp"); return -1; }
    public function get info():Object { notImplemented("info"); return null; }
  }
}
