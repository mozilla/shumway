package flash.events {
  import flash.events.Event;
  import String;
  import Boolean;
  public class StatusEvent extends Event {
    public function StatusEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, code:String = "", level:String = "") {}
    public static const STATUS:String = "status";
    public override function clone():Event { notImplemented("clone"); }
    public override function toString():String { notImplemented("toString"); }
    public function get code():String { notImplemented("code"); }
    public function set code(value:String):void { notImplemented("code"); }
    public function get level():String { notImplemented("level"); }
    public function set level(value:String):void { notImplemented("level"); }
  }
}
