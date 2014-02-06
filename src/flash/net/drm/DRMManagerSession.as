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
  internal class DRMManagerSession extends EventDispatcher {
    public function DRMManagerSession() {}
    internal static const STATUS_READY:uint;
    internal static const STATUS_NOTREADY:uint = 1;
    internal static const STATUS_FAILED:uint = 2;
    internal static const STATUS_UNKNOWN:uint = 3;
    public function onSessionError():void { notImplemented("onSessionError"); }
    public function onSessionComplete():void { notImplemented("onSessionComplete"); }
    public function setTimerUp():void { notImplemented("setTimerUp"); }
    public function get metadata():DRMContentData { notImplemented("metadata"); }
    public function set metadata(inData:DRMContentData):void { notImplemented("metadata"); }
    public function checkStatus():uint { notImplemented("checkStatus"); }
    public var m_isInSession:Boolean;
    public native function getLastError():uint;
    public native function getLastSubErrorID():uint;
    public function issueDRMStatusEvent(inMetadata:DRMContentData, voucher:DRMVoucher) { notImplemented("issueDRMStatusEvent"); }
    public native function issueDRMErrorEvent(metadata:DRMContentData, errorID:int, subErrorID:int, eventType:String = null):void;
    public native function errorCodeToThrow(errorCode:uint):void;
  }
}
