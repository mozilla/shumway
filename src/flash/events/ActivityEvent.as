package flash.events {
public class ActivityEvent extends Event {
    public function ActivityEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, activating:Boolean = false) {
      super(type, bubbles, cancelable);
      notImplemented("clone");
    }
    public static const ACTIVITY:String = "activity";
    public override function clone():Event { notImplemented("clone"); return null; }
    public override function toString():String { notImplemented("toString"); return ""; }
    public function get activating():Boolean { notImplemented("activating"); return false; }
    public function set activating(value:Boolean):void { notImplemented("activating"); }
  }
}
