package flash.events {
public class StageVideoEvent extends Event {
    public function StageVideoEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, status:String = null, colorSpace:String = null) {
      super(type, bubbles, cancelable);
      notImplemented("StageVideoEvent");
    }
    public static const RENDER_STATE:String = "renderState";
    public static const RENDER_STATUS_UNAVAILABLE:String = "unavailable";
    public static const RENDER_STATUS_SOFTWARE:String = "software";
    public static const RENDER_STATUS_ACCELERATED:String = "accelerated";
    public function get status():String { notImplemented("status"); return ""; }
    public function get colorSpace():String { notImplemented("colorSpace"); return ""; }
    public const codecInfo:String;
  }
}
