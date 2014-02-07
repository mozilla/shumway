package flash.ui {
import flash.events.EventDispatcher;

public final class GameInput extends EventDispatcher {
    public function GameInput() {}
    public static native function getDeviceAt(index:int):GameInputDevice;
    public static native function get numDevices():int;
    public static native function get isSupported():Boolean;
  }
}
