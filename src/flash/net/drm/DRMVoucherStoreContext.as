package flash.net.drm {
internal class DRMVoucherStoreContext extends DRMManagerSession {
    public function DRMVoucherStoreContext() {}
    public function getVoucherFromStore(inMetadata:DRMContentData):void { notImplemented("getVoucherFromStore"); }
    public function get voucher():DRMVoucher { notImplemented("voucher"); return null; }
    public override function onSessionComplete():void { notImplemented("onSessionComplete"); }
    public override function onSessionError():void { notImplemented("onSessionError"); }
  }
}
