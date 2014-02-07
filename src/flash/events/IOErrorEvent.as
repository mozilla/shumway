package flash.events {
public class IOErrorEvent extends ErrorEvent {
    public function IOErrorEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, text:String = "", id:int = 0) {
      super(type, bubbles, cancelable);
      notImplemented("IOErrorEvent");
    }
    public static const IO_ERROR:String = "ioError";
    public static const NETWORK_ERROR:String = "networkError";
    public static const DISK_ERROR:String = "diskError";
    public static const VERIFY_ERROR:String = "verifyError";
    public override function clone():Event { notImplemented("clone"); return null; }
    public override function toString():String { notImplemented("toString"); return ""; }
  }
}
