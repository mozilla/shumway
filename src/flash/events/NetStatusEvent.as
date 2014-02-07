package flash.events {
public class NetStatusEvent extends Event {
    public function NetStatusEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, info:Object = null) {
      super(type, bubbles, cancelable);
      notImplemented("NetStatusEvent");
    }
    public static const NET_STATUS:String = "netStatus";
    public override function clone():Event { notImplemented("clone"); return null; }
    public override function toString():String { notImplemented("toString"); return ""; }
    public function get info():Object { notImplemented("info"); return null; }
    public function set info(value:Object):void { notImplemented("info"); }
  }
}
