package flash.net {
  import flash.events.EventDispatcher;
  import String;
  import Boolean;
  import flash.events.ProgressEvent;
  import uint;
  import int;
  import XML;
  import flash.events.Event;
  import flash.utils.ByteArray;
  import flash.net.Socket;
  import flash.events.SecurityErrorEvent;
  import flash.events.ProgressEvent;
  import flash.events.DataEvent;
  import XML;
  import flash.events.Event;
  import flash.utils.ByteArray;
  import flash.net.Socket;
  import flash.events.IOErrorEvent;
  public class XMLSocket extends EventDispatcher {
    public function XMLSocket(host:String = null, port:int = 0) {}
    public function connect(host:String, port:int):void { notImplemented("connect"); }
    public function send(object):void { notImplemented("send"); }
    public function get timeout():int { notImplemented("timeout"); }
    public function set timeout(value:int):void { notImplemented("timeout"); }
    public function close():void { notImplemented("close"); }
    public function get connected():Boolean { notImplemented("connected"); }
  }
}
