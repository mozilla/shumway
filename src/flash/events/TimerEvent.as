package flash.events {
  import flash.events.Event;
  import String;
  import Boolean;
  public class TimerEvent extends Event {
    public function TimerEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false) {}
    public static const TIMER:String = "timer";
    public static const TIMER_COMPLETE:String = "timerComplete";
    public override function clone():Event { notImplemented("clone"); }
    public override function toString():String { notImplemented("toString"); }
    public native function updateAfterEvent():void;
  }
}
