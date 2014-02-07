package flash.events {
public class StageVideoAvailabilityEvent extends Event {
    public function StageVideoAvailabilityEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, availability:String = null) {
      super(type, bubbles, cancelable);
      notImplemented("StageVideoAvailabilityEvent");
    }
    public static const STAGE_VIDEO_AVAILABILITY:String = "stageVideoAvailability";
    public function get availability():String { notImplemented("availability"); return ""; }
  }
}
