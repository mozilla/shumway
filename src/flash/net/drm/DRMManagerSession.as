package flash.net.drm {
import flash.events.EventDispatcher;

internal class DRMManagerSession extends EventDispatcher {
    public function DRMManagerSession() {}
    internal static const STATUS_READY:uint;
    internal static const STATUS_NOTREADY:uint = 1;
    internal static const STATUS_FAILED:uint = 2;
    internal static const STATUS_UNKNOWN:uint = 3;
    public function onSessionError():void { notImplemented("onSessionError"); }
    public function onSessionComplete():void { notImplemented("onSessionComplete"); }
    public function setTimerUp():void { notImplemented("setTimerUp"); }
    public function get metadata():DRMContentData { notImplemented("metadata"); return null; }
    public function set metadata(inData:DRMContentData):void { notImplemented("metadata"); }
    public function checkStatus():uint { notImplemented("checkStatus"); return 0; }
    public var m_isInSession:Boolean;
    public native function getLastError():uint;
    public native function getLastSubErrorID():uint;
    public function issueDRMStatusEvent(inMetadata:DRMContentData, voucher:DRMVoucher) { notImplemented("issueDRMStatusEvent"); }
    public native function issueDRMErrorEvent(metadata:DRMContentData, errorID:int, subErrorID:int, eventType:String = null):void;
    public native function errorCodeToThrow(errorCode:uint):void;
  }
}
