package flash.sensors {
  import flash.events.EventDispatcher;
  import Boolean;
  import Number;
  import flash.events.AccelerometerEvent;
  import flash.events.StatusEvent;
  public class Accelerometer extends EventDispatcher {
    public function Accelerometer() {}
    public static native function get isSupported():Boolean;
    public native function setRequestedUpdateInterval(interval:Number):void;
    public native function get muted():Boolean;
  }
}
