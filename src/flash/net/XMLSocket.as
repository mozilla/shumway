package flash.net {
import flash.events.EventDispatcher;

public class XMLSocket extends EventDispatcher {
    public function XMLSocket(host:String = null, port:int = 0) {}
    public function connect(host:String, port:int):void { notImplemented("connect"); }
    public function send(object):void { notImplemented("send"); }
    public function get timeout():int { notImplemented("timeout"); return -1; }
    public function set timeout(value:int):void { notImplemented("timeout"); }
    public function close():void { notImplemented("close"); }
    public function get connected():Boolean { notImplemented("connected"); return false; }
  }
}
