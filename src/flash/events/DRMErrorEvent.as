package flash.events {
  import flash.events.ErrorEvent;
  import String;
  import Boolean;
  import flash.net.drm.DRMContentData;
  import flash.events.Event;
  import int;
  public class DRMErrorEvent extends ErrorEvent {
    public function DRMErrorEvent(type:String = "drmError", bubbles:Boolean = false, cancelable:Boolean = false, inErrorDetail:String = "", inErrorCode:int = 0, insubErrorID:int = 0, inMetadata:DRMContentData = null, inSystemUpdateNeeded:Boolean = false, inDrmUpdateNeeded:Boolean = false) {}
    public static const DRM_ERROR:String = "drmError";
    public static const DRM_LOAD_DEVICEID_ERROR:String = "drmLoadDeviceIdError";
    public override function clone():Event { notImplemented("clone"); }
    public override function toString():String { notImplemented("toString"); }
    public function get subErrorID():int { notImplemented("subErrorID"); }
    public function get contentData():DRMContentData { notImplemented("contentData"); }
    public function set contentData(value:DRMContentData):void { notImplemented("contentData"); }
    public function get systemUpdateNeeded():Boolean { notImplemented("systemUpdateNeeded"); }
    public function get drmUpdateNeeded():Boolean { notImplemented("drmUpdateNeeded"); }
  }
}
