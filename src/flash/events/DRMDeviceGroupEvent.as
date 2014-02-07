package flash.events {
import flash.net.drm.DRMDeviceGroup;

public class DRMDeviceGroupEvent extends Event {
    public function DRMDeviceGroupEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, deviceGroup:DRMDeviceGroup = null) {
      super(type, bubbles, cancelable);
      notImplemented("DRMDeviceGroupEvent");
    }
    public static const ADD_TO_DEVICE_GROUP_COMPLETE:String = "addToDeviceGroupComplete";
    public static const REMOVE_FROM_DEVICE_GROUP_COMPLETE:String = "removeFromDeviceGroupComplete";
    public function set deviceGroup(value:DRMDeviceGroup) { notImplemented("deviceGroup"); }
    public function get deviceGroup():DRMDeviceGroup { notImplemented("deviceGroup"); return null; }
    public override function clone():Event { notImplemented("clone"); return null; }
    public override function toString():String { notImplemented("toString"); return ""; }
  }
}
