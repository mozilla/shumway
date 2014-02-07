package flash.events {
public class SyncEvent extends Event {
    public function SyncEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, changeList:Array = null) {
      super(type, bubbles, cancelable);
      notImplemented("SyncEvent");
    }
    public static const SYNC:String = "sync";
    public override function clone():Event { notImplemented("clone"); return null; }
    public override function toString():String { notImplemented("toString"); return ""; }
    public function get changeList():Array { notImplemented("changeList"); return null; }
    public function set changeList(value:Array):void { notImplemented("changeList"); }
  }
}
