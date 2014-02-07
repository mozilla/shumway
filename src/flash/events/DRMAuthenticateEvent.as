package flash.events {
import flash.net.NetStream;

public class DRMAuthenticateEvent extends Event {
    public function DRMAuthenticateEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, header:String = "", userPrompt:String = "", passPrompt:String = "", urlPrompt:String = "", authenticationType:String = "", netstream:NetStream = null) {
      super(type, bubbles, cancelable);
      notImplemented("DRMAuthenticateEvent");
    }
    public static const DRM_AUTHENTICATE:String = "drmAuthenticate";
    public static const AUTHENTICATION_TYPE_DRM:String = "drm";
    public static const AUTHENTICATION_TYPE_PROXY:String = "proxy";
    public override function clone():Event { notImplemented("clone"); return null; }
    public override function toString():String { notImplemented("toString"); return ""; }
    public function get header():String { notImplemented("header"); return ""; }
    public function get usernamePrompt():String { notImplemented("usernamePrompt"); return ""; }
    public function get passwordPrompt():String { notImplemented("passwordPrompt"); return ""; }
    public function get urlPrompt():String { notImplemented("urlPrompt"); return ""; }
    public function get authenticationType():String { notImplemented("authenticationType"); return ""; }
    public function get netstream():NetStream { notImplemented("netstream"); return null; }
  }
}
