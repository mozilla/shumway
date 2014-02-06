package flash.events {
  import flash.events.Event;
  import String;
  import flash.net.drm.DRMDeviceGroup;
  import Boolean;
  public class DRMDeviceGroupEvent extends Event {
    public function DRMDeviceGroupEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, deviceGroup:DRMDeviceGroup = null) {}
    public static const ADD_TO_DEVICE_GROUP_COMPLETE:String = "addToDeviceGroupComplete";
    public static const REMOVE_FROM_DEVICE_GROUP_COMPLETE:String = "removeFromDeviceGroupComplete";
    public function set deviceGroup(value:DRMDeviceGroup) { notImplemented("deviceGroup"); }
    public function get deviceGroup():DRMDeviceGroup { notImplemented("deviceGroup"); }
    public override function clone():Event { notImplemented("clone"); }
    public override function toString():String { notImplemented("toString"); }
  }
}
