package flash.events {
  import flash.events.Event;
  import String;
  import Boolean;
  import Number;
  public class ThrottleEvent extends Event {
    public function ThrottleEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, state:String = null, targetFrameRate:Number = 0) {}
    public static const THROTTLE:String = "throttle";
    public function get targetFrameRate():Number { notImplemented("targetFrameRate"); }
    public function get state():String { notImplemented("state"); }
    public override function clone():Event { notImplemented("clone"); }
    public override function toString():String { notImplemented("toString"); }
  }
}
