package flash.events {
  import flash.events.ErrorEvent;
  import String;
  import Boolean;
  import flash.events.Event;
  import int;
  public class DRMAuthenticationErrorEvent extends ErrorEvent {
    public function DRMAuthenticationErrorEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, inDetail:String = "", inErrorID:int = 0, inSubErrorID:int = 0, inServerURL:String = null, inDomain:String = null) {}
    public static const AUTHENTICATION_ERROR:String = "authenticationError";
    public override function clone():Event { notImplemented("clone"); }
    public function get subErrorID():int { notImplemented("subErrorID"); }
    public function set subErrorID(value:int):void { notImplemented("subErrorID"); }
    public function get serverURL():String { notImplemented("serverURL"); }
    public function set serverURL(value:String):void { notImplemented("serverURL"); }
    public function get domain():String { notImplemented("domain"); }
    public function set domain(value:String):void { notImplemented("domain"); }
  }
}
