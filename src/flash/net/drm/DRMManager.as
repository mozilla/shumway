package flash.net.drm {
  import flash.events.EventDispatcher;
  import Object;
  import flash.events.TimerEvent;
  import flash.events.DRMAuthenticationErrorEvent;
  import Date;
  import flash.utils.Timer;
  import flash.events.Event;
  import flash.events.HTTPStatusEvent;
  import flash.utils.ByteArray;
  import flash.net.URLRequest;
  import flash.events.DRMErrorEvent;
  import flash.events.IOErrorEvent;
  import flash.events.DRMAuthenticationCompleteEvent;
  import flash.events.SecurityErrorEvent;
  import flash.net.URLLoader;
  import flash.net.drm.DRMContentData;
  import flash.events.DRMStatusEvent;
  import flash.events.TimerEvent;
  import SecurityError;
  import flash.events.DRMAuthenticationErrorEvent;
  import flash.net.drm.LoadVoucherSetting;
  import flash.net.URLRequestHeader;
  import Date;
  import flash.utils.Timer;
  import flash.events.Event;
  import flash.events.HTTPStatusEvent;
  import ArgumentError;
  import flash.utils.ByteArray;
  import flash.net.URLRequest;
  import flash.events.DRMErrorEvent;
  import flash.events.IOErrorEvent;
  import flash.events.DRMAuthenticationCompleteEvent;
  import flash.events.SecurityErrorEvent;
  import flash.net.URLLoader;
  import flash.net.URLRequestMethod;
  import flash.net.URLLoaderDataFormat;
  import flash.events.DRMStatusEvent;
  public class DRMManager extends EventDispatcher {
    public function DRMManager() {}
    public static function getDRMManager():DRMManager { notImplemented("getDRMManager"); }
    public static function get isSupported():Boolean { notImplemented("isSupported"); }
    public function authenticate(serverURL:String, domain:String, username:String, password:String):void { notImplemented("authenticate"); }
    public function setAuthenticationToken(serverUrl:String, domain:String, token:ByteArray):void { notImplemented("setAuthenticationToken"); }
    public function loadVoucher(contentData:DRMContentData, setting:String):void { notImplemented("loadVoucher"); }
    public function loadPreviewVoucher(contentData:DRMContentData):void { notImplemented("loadPreviewVoucher"); }
    public function storeVoucher(voucher:ByteArray):void { notImplemented("storeVoucher"); }
  }
}
