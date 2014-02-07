package flash.events {
public class VideoEvent extends Event {
    public function VideoEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, status:String = null) {
      super(type, bubbles, cancelable);
      notImplemented("VideoEvent");
    }
    public static const RENDER_STATE:String = "renderState";
    public static const RENDER_STATUS_UNAVAILABLE:String = "unavailable";
    public static const RENDER_STATUS_SOFTWARE:String = "software";
    public static const RENDER_STATUS_ACCELERATED:String = "accelerated";
    public function get status():String { notImplemented("status"); return ""; }
    public const codecInfo:String;
  }
}
