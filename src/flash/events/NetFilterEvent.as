package flash.events {
import flash.utils.ByteArray;

public class NetFilterEvent extends Event {
    public function NetFilterEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, header:ByteArray = null, data:ByteArray = null) {
      super(type, bubbles, cancelable);
      notImplemented("NetFilterEvent");
    }
    public var header:ByteArray;
    public var data:ByteArray;
    public override function clone():Event { notImplemented("clone"); return null; }
    public override function toString():String { notImplemented("toString"); return ""; }
  }
}
