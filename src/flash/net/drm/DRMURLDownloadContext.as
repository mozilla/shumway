package flash.net.drm {
import flash.events.EventDispatcher;
import flash.utils.ByteArray;

internal class DRMURLDownloadContext extends EventDispatcher {
    public function DRMURLDownloadContext() {}
    public function httpPostAndReceiveASync(url:String, headerName:String, headerValue:String, data:ByteArray):void { notImplemented("httpPostAndReceiveASync"); }
    public function httpGetASync(url:String):void { notImplemented("httpGetASync"); }
  }
}
