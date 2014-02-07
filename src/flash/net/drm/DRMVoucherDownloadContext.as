package flash.net.drm {
internal class DRMVoucherDownloadContext extends DRMManagerSession {
    public function DRMVoucherDownloadContext() {}
    public function download(inMetadata:DRMContentData, previewVoucher:Boolean = false):void { notImplemented("download"); }
    public override function onSessionComplete():void { notImplemented("onSessionComplete"); }
    public override function onSessionError():void { notImplemented("onSessionError"); }
    public function get voucher():DRMVoucher { notImplemented("voucher"); return null; }
  }
}
