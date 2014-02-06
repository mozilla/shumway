package flash.events {
  import flash.events.ErrorEvent;
  import String;
  import flash.net.drm.DRMDeviceGroup;
  import Boolean;
  import flash.events.Event;
  import int;
  public class DRMDeviceGroupErrorEvent extends ErrorEvent {
    public function DRMDeviceGroupErrorEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, errorDetail:String = "", errorCode:int = 0, subErrorID:int = 0, deviceGroup:DRMDeviceGroup = null, systemUpdateNeeded:Boolean = false, drmUpdateNeeded:Boolean = false) {}
    public static const ADD_TO_DEVICE_GROUP_ERROR:String = "addToDeviceGroupError";
    public static const REMOVE_FROM_DEVICE_GROUP_ERROR:String = "removeFromDeviceGroupError";
    public override function toString():String { notImplemented("toString"); }
    public function get subErrorID():int { notImplemented("subErrorID"); }
    public function set subErrorID(value:int):void { notImplemented("subErrorID"); }
    public function set deviceGroup(value:DRMDeviceGroup) { notImplemented("deviceGroup"); }
    public function get deviceGroup():DRMDeviceGroup { notImplemented("deviceGroup"); }
    public override function clone():Event { notImplemented("clone"); }
    public function get systemUpdateNeeded():Boolean { notImplemented("systemUpdateNeeded"); }
    public function get drmUpdateNeeded():Boolean { notImplemented("drmUpdateNeeded"); }
  }
}
