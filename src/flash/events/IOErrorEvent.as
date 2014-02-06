package flash.events {
  import flash.events.ErrorEvent;
  import String;
  import Boolean;
  import flash.events.Event;
  import int;
  public class IOErrorEvent extends ErrorEvent {
    public function IOErrorEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, text:String = "", id:int = 0) {}
    public static const IO_ERROR:String = "ioError";
    public static const NETWORK_ERROR:String = "networkError";
    public static const DISK_ERROR:String = "diskError";
    public static const VERIFY_ERROR:String = "verifyError";
    public override function clone():Event { notImplemented("clone"); }
    public override function toString():String { notImplemented("toString"); }
  }
}
