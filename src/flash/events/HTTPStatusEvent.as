package flash.events {
public class HTTPStatusEvent extends Event {
    public function HTTPStatusEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, status:int = 0) {
      super(type, bubbles, cancelable);
      notImplemented("HTTPStatusEvent");
    }
    public static const HTTP_STATUS:String = "httpStatus";
    public static const HTTP_RESPONSE_STATUS:String = "httpResponseStatus";
    public override function clone():Event { notImplemented("clone"); return null; }
    public override function toString():String { notImplemented("toString"); return ""; }
    public function get status():int { notImplemented("status"); return -1; }
    public function get responseURL():String { notImplemented("responseURL"); return ""; }
    public function set responseURL(value:String):void { notImplemented("responseURL"); }
    public function get responseHeaders():Array { notImplemented("responseHeaders"); return null; }
    public function set responseHeaders(value:Array):void { notImplemented("responseHeaders"); }
  }
}
