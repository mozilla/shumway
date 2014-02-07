package flash.automation {
import flash.events.Event;

public class StageCaptureEvent extends Event {
    public function StageCaptureEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, url:String = "", checksum:uint = 0) {
      super(type, bubbles, cancelable);
      notImplemented("StageCaptureEvent");
    }
    public static const CAPTURE:String = "capture";
    public override function clone():Event { notImplemented("clone"); return null; }
    public override function toString():String { notImplemented("toString"); return ""; }
    public function get url():String { notImplemented("url"); return ""; }
    public function get checksum():uint { notImplemented("checksum"); return 0; }
  }
}
