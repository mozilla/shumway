package flash.events {
  import flash.events.Event;
  import String;
  import Boolean;
  import Number;
  public class GeolocationEvent extends Event {
    public function GeolocationEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, latitude:Number = 0, longitude:Number = 0, altitude:Number = 0, hAccuracy:Number = 0, vAccuracy:Number = 0, speed:Number = 0, heading:Number = 0, timestamp:Number = 0) {}
    public static const UPDATE:String = "update";
    public override function clone():Event { notImplemented("clone"); }
    public override function toString():String { notImplemented("toString"); }
    public function get latitude():Number { notImplemented("latitude"); }
    public function set latitude(value:Number):void { notImplemented("latitude"); }
    public function get longitude():Number { notImplemented("longitude"); }
    public function set longitude(value:Number):void { notImplemented("longitude"); }
    public function get altitude():Number { notImplemented("altitude"); }
    public function set altitude(value:Number):void { notImplemented("altitude"); }
    public function get horizontalAccuracy():Number { notImplemented("horizontalAccuracy"); }
    public function set horizontalAccuracy(value:Number):void { notImplemented("horizontalAccuracy"); }
    public function get verticalAccuracy():Number { notImplemented("verticalAccuracy"); }
    public function set verticalAccuracy(value:Number):void { notImplemented("verticalAccuracy"); }
    public function get speed():Number { notImplemented("speed"); }
    public function set speed(value:Number):void { notImplemented("speed"); }
    public function get heading():Number { notImplemented("heading"); }
    public function set heading(value:Number):void { notImplemented("heading"); }
    public function get timestamp():Number { notImplemented("timestamp"); }
    public function set timestamp(value:Number):void { notImplemented("timestamp"); }
  }
}
