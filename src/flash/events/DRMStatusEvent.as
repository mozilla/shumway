package flash.events {
import flash.net.drm.DRMContentData;
import flash.net.drm.DRMVoucher;

public class DRMStatusEvent extends Event {
    public function DRMStatusEvent(type:String = "drmStatus", bubbles:Boolean = false, cancelable:Boolean = false, inMetadata:DRMContentData = null, inVoucher:DRMVoucher = null, inLocal:Boolean = false) {
      super(type, bubbles, cancelable);
      notImplemented("DRMStatusEvent");
    }
    public static const DRM_STATUS:String = "drmStatus";
    public override function clone():Event { notImplemented("clone"); return null; }
    public override function toString():String { notImplemented("toString"); return ""; }
    public function get contentData():DRMContentData { notImplemented("contentData"); return null; }
    public function set contentData(value:DRMContentData):void { notImplemented("contentData"); }
    public function get voucher():DRMVoucher { notImplemented("voucher"); return null; }
    public function set voucher(value:DRMVoucher):void { notImplemented("voucher"); }
    public function get isLocal():Boolean { notImplemented("isLocal"); return false; }
    public function set isLocal(value:Boolean):void { notImplemented("isLocal"); }
  }
}
