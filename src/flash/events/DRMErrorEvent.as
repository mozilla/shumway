package flash.events {
import flash.net.drm.DRMContentData;

public class DRMErrorEvent extends ErrorEvent {
    public function DRMErrorEvent(type:String = "drmError", bubbles:Boolean = false, cancelable:Boolean = false, inErrorDetail:String = "", inErrorCode:int = 0, insubErrorID:int = 0, inMetadata:DRMContentData = null, inSystemUpdateNeeded:Boolean = false, inDrmUpdateNeeded:Boolean = false) {
      super(type, bubbles, cancelable);
      notImplemented("DRMErrorEvent");
    }
    public static const DRM_ERROR:String = "drmError";
    public static const DRM_LOAD_DEVICEID_ERROR:String = "drmLoadDeviceIdError";
    public override function clone():Event { notImplemented("clone"); return null; }
    public override function toString():String { notImplemented("toString"); return ""; }
    public function get subErrorID():int { notImplemented("subErrorID"); return -1; }
    public function get contentData():DRMContentData { notImplemented("contentData"); return null; }
    public function set contentData(value:DRMContentData):void { notImplemented("contentData"); }
    public function get systemUpdateNeeded():Boolean { notImplemented("systemUpdateNeeded"); return false; }
    public function get drmUpdateNeeded():Boolean { notImplemented("drmUpdateNeeded"); return false; }
  }
}
