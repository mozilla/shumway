package flash.events {
import flash.text.ime.IIMEClient;

public class IMEEvent extends TextEvent {
    public function IMEEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, text:String = "", imeClient:IIMEClient = null) {
      super(type, bubbles, cancelable);
      notImplemented("IMEEvent");
    }
    public static const IME_COMPOSITION:String = "imeComposition";
    public static const IME_START_COMPOSITION:String = "imeStartComposition";
    public override function clone():Event { notImplemented("clone"); return null; }
    public function get imeClient():IIMEClient { notImplemented("imeClient"); return null; }
    public function set imeClient(value:IIMEClient):void { notImplemented("imeClient"); }
    public override function toString():String { notImplemented("toString"); return ""; }
  }
}
