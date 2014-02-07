package flash.events {
public class AccelerometerEvent extends Event {
    public function AccelerometerEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, timestamp:Number = 0, accelerationX:Number = 0, accelerationY:Number = 0, accelerationZ:Number = 0) {
      super(type, bubbles, cancelable);
      notImplemented("AccelerometerEvent");
    }
    public static const UPDATE:String = "update";
    public override function clone():Event { notImplemented("clone"); return null; }
    public override function toString():String { notImplemented("toString"); return ""; }
    public function get accelerationX():Number { notImplemented("accelerationX"); return -1; }
    public function set accelerationX(value:Number):void { notImplemented("accelerationX"); }
    public function get accelerationY():Number { notImplemented("accelerationY"); return -1; }
    public function set accelerationY(value:Number):void { notImplemented("accelerationY"); }
    public function get accelerationZ():Number { notImplemented("accelerationZ"); return -1; }
    public function set accelerationZ(value:Number):void { notImplemented("accelerationZ"); }
    public function get timestamp():Number { notImplemented("timestamp"); return -1; }
    public function set timestamp(value:Number):void { notImplemented("timestamp"); }
  }
}
