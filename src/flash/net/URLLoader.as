package flash.net {
import flash.events.EventDispatcher;

public class URLLoader extends EventDispatcher {
    public function URLLoader(request:URLRequest = null) {}
    public var data;
    public var dataFormat:String = "text";
    public var bytesLoaded:uint;
    public var bytesTotal:uint;
    public override function addEventListener(type:String, listener:Function, useCapture:Boolean = false, priority:int = 0, useWeakReference:Boolean = false):void { notImplemented("addEventListener"); }
    public function load(request:URLRequest):void { notImplemented("load"); }
    public function close():void { notImplemented("close"); }
  }
}
