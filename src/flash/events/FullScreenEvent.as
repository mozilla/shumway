package flash.events {
  import flash.events.ActivityEvent;
  import String;
  import Boolean;
  import flash.events.Event;
  public class FullScreenEvent extends ActivityEvent {
    public function FullScreenEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, fullScreen:Boolean = false, interactive:Boolean = false) {}
    public static const FULL_SCREEN:String = "fullScreen";
    public static const FULL_SCREEN_INTERACTIVE_ACCEPTED:String = "fullScreenInteractiveAccepted";
    public override function clone():Event { notImplemented("clone"); }
    public override function toString():String { notImplemented("toString"); }
    public function get fullScreen():Boolean { notImplemented("fullScreen"); }
    public function get interactive():Boolean { notImplemented("interactive"); }
  }
}
