package flash.events {
  import flash.events.Event;
  import String;
  import Boolean;
  import flash.net.NetStream;
  public class DRMAuthenticateEvent extends Event {
    public function DRMAuthenticateEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, header:String = "", userPrompt:String = "", passPrompt:String = "", urlPrompt:String = "", authenticationType:String = "", netstream:NetStream = null) {}
    public static const DRM_AUTHENTICATE:String = "drmAuthenticate";
    public static const AUTHENTICATION_TYPE_DRM:String = "drm";
    public static const AUTHENTICATION_TYPE_PROXY:String = "proxy";
    public override function clone():Event { notImplemented("clone"); }
    public override function toString():String { notImplemented("toString"); }
    public function get header():String { notImplemented("header"); }
    public function get usernamePrompt():String { notImplemented("usernamePrompt"); }
    public function get passwordPrompt():String { notImplemented("passwordPrompt"); }
    public function get urlPrompt():String { notImplemented("urlPrompt"); }
    public function get authenticationType():String { notImplemented("authenticationType"); }
    public function get netstream():NetStream { notImplemented("netstream"); }
  }
}
