package flash.events {
  import flash.events.TextEvent;
  import String;
  import Boolean;
  import flash.events.Event;
  import int;
  public class ErrorEvent extends TextEvent {
    public function ErrorEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, text:String = "", id:int = 0) {}
    public static const ERROR:String = "error";
    public function get errorID():int { notImplemented("errorID"); }
    public override function clone():Event { notImplemented("clone"); }
    public override function toString():String { notImplemented("toString"); }
  }
}
