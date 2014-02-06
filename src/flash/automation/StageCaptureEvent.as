package flash.automation {
  import flash.events.Event;
  import String;
  import Boolean;
  import uint;
  public class StageCaptureEvent extends Event {
    public function StageCaptureEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, url:String = "", checksum:uint = 0) {}
    public static const CAPTURE:String = "capture";
    public override function clone():Event { notImplemented("clone"); }
    public override function toString():String { notImplemented("toString"); }
    public function get url():String { notImplemented("url"); }
    public function get checksum():uint { notImplemented("checksum"); }
  }
}
