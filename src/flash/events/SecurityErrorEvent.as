package flash.events {
  import flash.events.ErrorEvent;
  import String;
  import Boolean;
  import flash.events.Event;
  import int;
  public class SecurityErrorEvent extends ErrorEvent {
    public function SecurityErrorEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, text:String = "", id:int = 0) {}
    public static const SECURITY_ERROR:String = "securityError";
    public override function clone():Event { notImplemented("clone"); }
    public override function toString():String { notImplemented("toString"); }
  }
}
