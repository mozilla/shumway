package flash.events {
  import flash.events.Event;
  import String;
  import Boolean;
  public class ActivityEvent extends Event {
    public function ActivityEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, activating:Boolean = false) {}
    public static const ACTIVITY:String = "activity";
    public override function clone():Event { notImplemented("clone"); }
    public override function toString():String { notImplemented("toString"); }
    public function get activating():Boolean { notImplemented("activating"); }
    public function set activating(value:Boolean):void { notImplemented("activating"); }
  }
}
