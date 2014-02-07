package flash.events {
public class ThrottleEvent extends Event {
    public function ThrottleEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, state:String = null, targetFrameRate:Number = 0) {
      super(type, bubbles, cancelable);
      notImplemented("ThrottleEvent");
    }
    public static const THROTTLE:String = "throttle";
    public function get targetFrameRate():Number { notImplemented("targetFrameRate"); return -1; }
    public function get state():String { notImplemented("state"); return ""; }
    public override function clone():Event { notImplemented("clone"); return null; }
    public override function toString():String { notImplemented("toString"); return ""; }
  }
}
