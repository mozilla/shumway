package flash.events {
  import flash.events.Event;
  import String;
  import Boolean;
  import flash.net.NetStream;
  public class NetMonitorEvent extends Event {
    public function NetMonitorEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, netStream:NetStream = null) {}
    public static const NET_STREAM_CREATE:String = "netStreamCreate";
    public override function clone():Event { notImplemented("clone"); }
    public override function toString():String { notImplemented("toString"); }
    public function get netStream():NetStream { notImplemented("netStream"); }
  }
}
