package flash.events {
  import flash.events.Event;
  import String;
  import Boolean;
  import Number;
  public class ProgressEvent extends Event {
    public function ProgressEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, bytesLoaded:Number = 0, bytesTotal:Number = 0) {}
    public static const PROGRESS:String = "progress";
    public static const SOCKET_DATA:String = "socketData";
    public override function clone():Event { notImplemented("clone"); }
    public override function toString():String { notImplemented("toString"); }
    public function get bytesLoaded():Number { notImplemented("bytesLoaded"); }
    public function set bytesLoaded(value:Number):void { notImplemented("bytesLoaded"); }
    public function get bytesTotal():Number { notImplemented("bytesTotal"); }
    public function set bytesTotal(value:Number):void { notImplemented("bytesTotal"); }
  }
}
