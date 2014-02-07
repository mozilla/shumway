package flash.events {
import flash.net.NetStream;

public class NetMonitorEvent extends Event {
    public function NetMonitorEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, netStream:NetStream = null) {
      super(type, bubbles, cancelable);
      notImplemented("NetMonitorEvent");
    }
    public static const NET_STREAM_CREATE:String = "netStreamCreate";
    public override function clone():Event { notImplemented("clone"); return null; }
    public override function toString():String { notImplemented("toString"); return ""; }
    public function get netStream():NetStream { notImplemented("netStream"); return null; }
  }
}
