package flash.events {
public class FullScreenEvent extends ActivityEvent {
    public function FullScreenEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, fullScreen:Boolean = false, interactive:Boolean = false) {
      super(type, bubbles, cancelable);
      notImplemented("FullScreenEvent");
    }
    public static const FULL_SCREEN:String = "fullScreen";
    public static const FULL_SCREEN_INTERACTIVE_ACCEPTED:String = "fullScreenInteractiveAccepted";
    public override function clone():Event { notImplemented("clone"); return null; }
    public override function toString():String { notImplemented("toString"); return ""; }
    public function get fullScreen():Boolean { notImplemented("fullScreen"); return false; }
    public function get interactive():Boolean { notImplemented("interactive"); return false; }
  }
}
