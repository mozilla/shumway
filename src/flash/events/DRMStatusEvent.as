package flash.events {
  import flash.events.Event;
  import Object;
  import flash.net.drm.DRMVoucher;
  import flash.net.drm.DRMContentData;
  public class DRMStatusEvent extends Event {
    public function DRMStatusEvent(type:String = "drmStatus", bubbles:Boolean = false, cancelable:Boolean = false, inMetadata:DRMContentData = null, inVoucher:DRMVoucher = null, inLocal:Boolean = false) {}
    public static const DRM_STATUS:String = "drmStatus";
    public override function clone():Event { notImplemented("clone"); }
    public override function toString():String { notImplemented("toString"); }
    public function get contentData():DRMContentData { notImplemented("contentData"); }
    public function set contentData(value:DRMContentData):void { notImplemented("contentData"); }
    public function get voucher():DRMVoucher { notImplemented("voucher"); }
    public function set voucher(value:DRMVoucher):void { notImplemented("voucher"); }
    public function get isLocal():Boolean { notImplemented("isLocal"); }
    public function set isLocal(value:Boolean):void { notImplemented("isLocal"); }
  }
}
