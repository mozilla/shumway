package flash.events {
public class OutputProgressEvent extends Event {
    public function OutputProgressEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, bytesPending:Number = 0, bytesTotal:Number = 0) {
      super(type, bubbles, cancelable);
      notImplemented("OutputProgressEvent");
    }
    public static const OUTPUT_PROGRESS:String = "outputProgress";
    public override function clone():Event { notImplemented("clone"); return null; }
    public override function toString():String { notImplemented("toString"); return ""; }
    public function get bytesPending():Number { notImplemented("bytesPending"); return -1; }
    public function set bytesPending(value:Number):void { notImplemented("bytesPending"); }
    public function get bytesTotal():Number { notImplemented("bytesTotal"); return -1; }
    public function set bytesTotal(value:Number):void { notImplemented("bytesTotal"); }
  }
}
