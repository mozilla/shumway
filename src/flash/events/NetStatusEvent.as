package flash.events {
  import flash.events.Event;
  import String;
  import Boolean;
  import Object;
  public class NetStatusEvent extends Event {
    public function NetStatusEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, info:Object = null) {}
    public static const NET_STATUS:String = "netStatus";
    public override function clone():Event { notImplemented("clone"); }
    public override function toString():String { notImplemented("toString"); }
    public function get info():Object { notImplemented("info"); }
    public function set info(value:Object):void { notImplemented("info"); }
  }
}
