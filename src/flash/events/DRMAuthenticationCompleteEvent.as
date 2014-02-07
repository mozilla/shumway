package flash.events {
import flash.utils.ByteArray;

public class DRMAuthenticationCompleteEvent extends Event {
    public function DRMAuthenticationCompleteEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, inServerURL:String = null, inDomain:String = null, inToken:ByteArray = null) {
      super(type, bubbles, cancelable);
      notImplemented("DRMAuthenticationCompleteEvent");
    }
    public static const AUTHENTICATION_COMPLETE:String = "authenticationComplete";
    public override function clone():Event { notImplemented("clone"); return null; }
    public function get serverURL():String { notImplemented("serverURL"); return ""; }
    public function set serverURL(value:String):void { notImplemented("serverURL"); }
    public function get domain():String { notImplemented("domain"); return ""; }
    public function set domain(value:String):void { notImplemented("domain"); }
    public function get token():ByteArray { notImplemented("token"); return null; }
    public function set token(value:ByteArray):void { notImplemented("token"); }
  }
}
