package flash.events {
  import flash.events.Event;
  import String;
  import Boolean;
  import Number;
  public class OutputProgressEvent extends Event {
    public function OutputProgressEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, bytesPending:Number = 0, bytesTotal:Number = 0) {}
    public static const OUTPUT_PROGRESS:String = "outputProgress";
    public override function clone():Event { notImplemented("clone"); }
    public override function toString():String { notImplemented("toString"); }
    public function get bytesPending():Number { notImplemented("bytesPending"); }
    public function set bytesPending(value:Number):void { notImplemented("bytesPending"); }
    public function get bytesTotal():Number { notImplemented("bytesTotal"); }
    public function set bytesTotal(value:Number):void { notImplemented("bytesTotal"); }
  }
}
