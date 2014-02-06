package flash.events {
  import flash.events.TextEvent;
  import flash.text.ime.IIMEClient;
  import String;
  import Boolean;
  import flash.events.Event;
  public class IMEEvent extends TextEvent {
    public function IMEEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, text:String = "", imeClient:IIMEClient = null) {}
    public static const IME_COMPOSITION:String = "imeComposition";
    public static const IME_START_COMPOSITION:String = "imeStartComposition";
    public override function clone():Event { notImplemented("clone"); }
    public function get imeClient():IIMEClient { notImplemented("imeClient"); }
    public function set imeClient(value:IIMEClient):void { notImplemented("imeClient"); }
    public override function toString():String { notImplemented("toString"); }
  }
}
