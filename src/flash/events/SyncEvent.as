package flash.events {
  import flash.events.Event;
  import String;
  import Array;
  import Boolean;
  public class SyncEvent extends Event {
    public function SyncEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, changeList:Array = null) {}
    public static const SYNC:String = "sync";
    public override function clone():Event { notImplemented("clone"); }
    public override function toString():String { notImplemented("toString"); }
    public function get changeList():Array { notImplemented("changeList"); }
    public function set changeList(value:Array):void { notImplemented("changeList"); }
  }
}
