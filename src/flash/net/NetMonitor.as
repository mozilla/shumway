package flash.net {
import flash.events.EventDispatcher;

public class NetMonitor extends EventDispatcher {
    public function NetMonitor() {}
    public native function listStreams():Vector;
  }
}
