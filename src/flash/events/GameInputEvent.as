package flash.events {
import flash.ui.GameInputDevice;

public final class GameInputEvent extends Event {
    public function GameInputEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, device:GameInputDevice = null) {
      super(type, bubbles, cancelable);
      notImplemented("GameInputEvent");
    }
    public static const DEVICE_ADDED:String = "deviceAdded";
    public static const DEVICE_REMOVED:String = "deviceRemoved";
    public function get device():GameInputDevice { notImplemented("device"); return null; }
  }
}
