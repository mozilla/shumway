package flash.events {
public class SecurityErrorEvent extends ErrorEvent {
    public function SecurityErrorEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, text:String = "", id:int = 0) {
      super(type, bubbles, cancelable);
      notImplemented("SecurityErrorEvent");
    }
    public static const SECURITY_ERROR:String = "securityError";
    public override function clone():Event { notImplemented("clone"); return null; }
    public override function toString():String { notImplemented("toString"); return ""; }
  }
}
