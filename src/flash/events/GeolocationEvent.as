package flash.events {
public class GeolocationEvent extends Event {
    public function GeolocationEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, latitude:Number = 0, longitude:Number = 0, altitude:Number = 0, hAccuracy:Number = 0, vAccuracy:Number = 0, speed:Number = 0, heading:Number = 0, timestamp:Number = 0) {
      super(type, bubbles, cancelable);
      notImplemented("GeolocationEvent");
    }
    public static const UPDATE:String = "update";
    public override function clone():Event { notImplemented("clone"); return null; }
    public override function toString():String { notImplemented("toString"); return ""; }
    public function get latitude():Number { notImplemented("latitude"); return -1; }
    public function set latitude(value:Number):void { notImplemented("latitude"); }
    public function get longitude():Number { notImplemented("longitude"); return -1; }
    public function set longitude(value:Number):void { notImplemented("longitude"); }
    public function get altitude():Number { notImplemented("altitude"); return -1; }
    public function set altitude(value:Number):void { notImplemented("altitude"); }
    public function get horizontalAccuracy():Number { notImplemented("horizontalAccuracy"); return -1; }
    public function set horizontalAccuracy(value:Number):void { notImplemented("horizontalAccuracy"); }
    public function get verticalAccuracy():Number { notImplemented("verticalAccuracy"); return -1; }
    public function set verticalAccuracy(value:Number):void { notImplemented("verticalAccuracy"); }
    public function get speed():Number { notImplemented("speed"); return -1; }
    public function set speed(value:Number):void { notImplemented("speed"); }
    public function get heading():Number { notImplemented("heading"); return -1; }
    public function set heading(value:Number):void { notImplemented("heading"); }
    public function get timestamp():Number { notImplemented("timestamp"); return -1; }
    public function set timestamp(value:Number):void { notImplemented("timestamp"); }
  }
}
