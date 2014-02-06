package flash.net {
  import flash.events.EventDispatcher;
  import flash.net.NetConnection;
  import String;
  import Array;
  import Boolean;
  import uint;
  import Number;
  import int;
  import Object;
  import Boolean;
  import flash.net.SharedObjectFlushStatus;
  import flash.events.AsyncErrorEvent;
  import uint;
  import Error;
  import flash.events.SyncEvent;
  import flash.events.NetStatusEvent;
  public class SharedObject extends EventDispatcher {
    public function SharedObject() {}
    public static native function deleteAll(url:String):int;
    public static native function getDiskUsage(url:String):int;
    public static native function getLocal(name:String, localPath:String = null, secure:Boolean = false):SharedObject;
    public static native function getRemote(name:String, remotePath:String = null, persistence:Object = false, secure:Boolean = false):SharedObject;
    public static native function get defaultObjectEncoding():uint;
    public static native function set defaultObjectEncoding(version:uint):void;
    public native function get data():Object;
    public function connect(myConnection:NetConnection, params:String = null):void { notImplemented("connect"); }
    public function close():void { notImplemented("close"); }
    public function flush(minDiskSpace:int = 0):String { notImplemented("flush"); }
    public function get size():uint { notImplemented("size"); }
    public function set fps(updatesPerSecond:Number):void { notImplemented("fps"); }
    public function send():void { notImplemented("send"); }
    public function clear():void { notImplemented("clear"); }
    public native function get objectEncoding():uint;
    public native function set objectEncoding(version:uint):void;
    public native function get client():Object;
    public native function set client(object:Object):void;
    public native function setDirty(propertyName:String):void;
    public function setProperty(propertyName:String, value:Object = null):void { notImplemented("setProperty"); }
  }
}
