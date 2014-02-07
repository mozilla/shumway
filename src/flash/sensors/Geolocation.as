package flash.sensors {
import flash.events.EventDispatcher;

public class Geolocation extends EventDispatcher {
    public function Geolocation() {}
    public static native function get isSupported():Boolean;
    public native function setRequestedUpdateInterval(interval:Number):void;
    public native function get muted():Boolean;
  }
}
