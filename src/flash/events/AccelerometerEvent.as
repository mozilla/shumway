package flash.events {
  import flash.events.Event;
  import String;
  import Boolean;
  import Number;
  public class AccelerometerEvent extends Event {
    public function AccelerometerEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, timestamp:Number = 0, accelerationX:Number = 0, accelerationY:Number = 0, accelerationZ:Number = 0) {}
    public static const UPDATE:String = "update";
    public override function clone():Event { notImplemented("clone"); }
    public override function toString():String { notImplemented("toString"); }
    public function get accelerationX():Number { notImplemented("accelerationX"); }
    public function set accelerationX(value:Number):void { notImplemented("accelerationX"); }
    public function get accelerationY():Number { notImplemented("accelerationY"); }
    public function set accelerationY(value:Number):void { notImplemented("accelerationY"); }
    public function get accelerationZ():Number { notImplemented("accelerationZ"); }
    public function set accelerationZ(value:Number):void { notImplemented("accelerationZ"); }
    public function get timestamp():Number { notImplemented("timestamp"); }
    public function set timestamp(value:Number):void { notImplemented("timestamp"); }
  }
}
