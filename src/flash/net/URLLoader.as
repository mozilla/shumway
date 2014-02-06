package flash.net {
  import flash.events.EventDispatcher;
  import String;
  import Boolean;
  import flash.events.ProgressEvent;
  import flash.net.URLStream;
  import uint;
  import int;
  import flash.events.Event;
  import flash.utils.ByteArray;
  import Function;
  import flash.net.URLRequest;
  import flash.events.SecurityErrorEvent;
  import flash.events.ProgressEvent;
  import flash.net.URLStream;
  import flash.events.HTTPStatusEvent;
  import flash.events.Event;
  import flash.utils.ByteArray;
  import flash.net.URLVariables;
  import flash.events.IOErrorEvent;
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
