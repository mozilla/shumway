package flash.events {
public class UncaughtErrorEvent extends ErrorEvent {
    public function UncaughtErrorEvent(type:String = "uncaughtError", bubbles:Boolean = true, cancelable:Boolean = true, error_in = null) {
      super(type, bubbles, cancelable);
      notImplemented("UncaughtErrorEvent");
    }
    public static const UNCAUGHT_ERROR:String = "uncaughtError";
    public override function clone():Event { notImplemented("clone"); return null; }
    public function get error() { notImplemented("error"); }
    public override function toString():String { notImplemented("toString"); return ""; }
  }
}
