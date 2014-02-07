package flash.sensors {
import flash.events.EventDispatcher;

public class Accelerometer extends EventDispatcher {
    public function Accelerometer() {}
    public static native function get isSupported():Boolean;
    public native function setRequestedUpdateInterval(interval:Number):void;
    public native function get muted():Boolean;
  }
}
