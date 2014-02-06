package flash.events {
  import flash.events.Event;
  import String;
  import Array;
  import Boolean;
  import int;
  public class HTTPStatusEvent extends Event {
    public function HTTPStatusEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, status:int = 0) {}
    public static const HTTP_STATUS:String = "httpStatus";
    public static const HTTP_RESPONSE_STATUS:String = "httpResponseStatus";
    public override function clone():Event { notImplemented("clone"); }
    public override function toString():String { notImplemented("toString"); }
    public function get status():int { notImplemented("status"); }
    public function get responseURL():String { notImplemented("responseURL"); }
    public function set responseURL(value:String):void { notImplemented("responseURL"); }
    public function get responseHeaders():Array { notImplemented("responseHeaders"); }
    public function set responseHeaders(value:Array):void { notImplemented("responseHeaders"); }
  }
}
