package flash.events {
public class TimerEvent extends Event {
    public function TimerEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false) {
      super(type, bubbles, cancelable);
      notImplemented("TimerEvent");
    }
    public static const TIMER:String = "timer";
    public static const TIMER_COMPLETE:String = "timerComplete";
    public override function clone():Event { notImplemented("clone"); return null; }
    public override function toString():String { notImplemented("toString"); return ""; }
    public native function updateAfterEvent():void;
  }
}
