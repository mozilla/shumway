package flash.net {

  [native(cls="URLRequestClass")]
  public final class URLRequest {
    public function URLRequest(url:String=null) {}

    private static const kInvalidParamError:uint = 2004;

    public native function get url():String;
    public native function set url(value:String):void;
    public native function get data():Object;
    public native function set data(value:Object):void;
    public native function get method():String;
    public function set method(value:String):void { notImplemented("method"); }
    private native function setMethod(value:String):void;
    public native function get contentType():String;
    public native function set contentType(value:String):void;
    public native function get requestHeaders():Array;
    public function set requestHeaders(value:Array):void { notImplemented("requestHeaders"); }
    private native function setRequestHeaders(value:Array):void;
    private function filterRequestHeaders(item, index:int, array:Array):Boolean { notImplemented("filterRequestHeaders"); }
    public native function get digest():String;
    public native function set digest(value:String):void;
    private function shouldFilterHTTPHeader(header:String):Boolean { notImplemented("shouldFilterHTTPHeader"); }
  }

}
