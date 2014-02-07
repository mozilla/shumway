package flash.events {
public class DataEvent extends TextEvent {
    public function DataEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, data:String = "") {
      super(type, bubbles, cancelable);
      notImplemented("DataEvent");
    }
    public static const DATA:String = "data";
    public static const UPLOAD_COMPLETE_DATA:String = "uploadCompleteData";
    public override function clone():Event { notImplemented("clone"); return null; }
    public override function toString():String { notImplemented("toString"); return ""; }
    public function get data():String { notImplemented("data"); return ""; }
    public function set data(value:String):void { notImplemented("data"); }
  }
}
