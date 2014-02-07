package flash.events {
public class DRMAuthenticationErrorEvent extends ErrorEvent {
    public function DRMAuthenticationErrorEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, inDetail:String = "", inErrorID:int = 0, inSubErrorID:int = 0, inServerURL:String = null, inDomain:String = null) {
      super(type, bubbles, cancelable);
      notImplemented("DRMAuthenticationErrorEvent");
    }
    public static const AUTHENTICATION_ERROR:String = "authenticationError";
    public override function clone():Event { notImplemented("clone"); return null; }
    public function get subErrorID():int { notImplemented("subErrorID"); return -1; }
    public function set subErrorID(value:int):void { notImplemented("subErrorID"); }
    public function get serverURL():String { notImplemented("serverURL"); return ""; }
    public function set serverURL(value:String):void { notImplemented("serverURL"); }
    public function get domain():String { notImplemented("domain"); return ""; }
    public function set domain(value:String):void { notImplemented("domain"); }
  }
}
