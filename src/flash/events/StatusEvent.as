package flash.events {
public class StatusEvent extends Event {
    public function StatusEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, code:String = "", level:String = "") {
      super(type, bubbles, cancelable);
      notImplemented("StatusEvent");
    }
    public static const STATUS:String = "status";
    public override function clone():Event { notImplemented("clone"); return null; }
    public override function toString():String { notImplemented("toString"); return ""; }
    public function get code():String { notImplemented("code"); return ""; }
    public function set code(value:String):void { notImplemented("code"); }
    public function get level():String { notImplemented("level"); return ""; }
    public function set level(value:String):void { notImplemented("level"); }
  }
}
