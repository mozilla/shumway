package flash.net {
import flash.events.EventDispatcher;

public class NetConnection extends EventDispatcher {
    public function NetConnection() {}
    public static native function get defaultObjectEncoding():uint;
    public static native function set defaultObjectEncoding(version:uint):void;
    public native function get connected():Boolean;
    public native function get uri():String;
    public function close():void { notImplemented("close"); }
    public function addHeader(operation:String, mustUnderstand:Boolean = false, param:Object = null):void { notImplemented("addHeader"); }
    public function call(command:String, responder:Responder):void { notImplemented("call"); }
    public native function connect(command:String):void;
    public native function get client():Object;
    public native function set client(object:Object):void;
    public native function get objectEncoding():uint;
    public native function set objectEncoding(version:uint):void;
    public native function get proxyType():String;
    public native function set proxyType(ptype:String):void;
    public native function get connectedProxyType():String;
    public native function get usingTLS():Boolean;
    public native function get protocol():String;
    public native function get maxPeerConnections():uint;
    public native function set maxPeerConnections(maxPeers:uint):void;
    public native function get nearID():String;
    public native function get farID():String;
    public native function get nearNonce():String;
    public native function get farNonce():String;
    public native function get unconnectedPeerStreams():Array;
  }
}
