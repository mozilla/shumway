package flash.events {
  import flash.events.Event;
  import String;
  import Boolean;
  public class StageVideoAvailabilityEvent extends Event {
    public function StageVideoAvailabilityEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, availability:String = null) {}
    public static const STAGE_VIDEO_AVAILABILITY:String = "stageVideoAvailability";
    public function get availability():String { notImplemented("availability"); }
  }
}
