package flash.net {
  import Object;
  import RegExp;
  import Error;
  import ArgumentError;
  public final class URLRequest {
    public function URLRequest(url:String = null) {}
    public native function get url():String;
    public native function set url(value:String):void;
    public native function get data():Object;
    public native function set data(value:Object):void;
    public native function get method():String;
    public function set method(value:String):void { notImplemented("method"); }
    public native function get contentType():String;
    public native function set contentType(value:String):void;
    public native function get requestHeaders():Array;
    public function set requestHeaders(value:Array):void { notImplemented("requestHeaders"); }
    public native function get digest():String;
    public native function set digest(value:String):void;
  }
}
