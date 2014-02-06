package flash.net {
  import flash.events.EventDispatcher;
  import __AS3__.vec.Vector;
  import flash.net.NetStream;
  import flash.events.NetMonitorEvent;
  public class NetMonitor extends EventDispatcher {
    public function NetMonitor() {}
    public native function listStreams():Vector;
  }
}
