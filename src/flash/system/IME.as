package flash.system {
  import flash.events.EventDispatcher;
  import String;
  import Boolean;
  import int;
  import flash.events.IMEEvent;
  public final class IME extends EventDispatcher {
    public function IME() {}
    public static native function get enabled():Boolean;
    public static native function set enabled(enabled:Boolean):void;
    public static native function get conversionMode():String;
    public static native function set conversionMode(mode:String):void;
    public static native function setCompositionString(composition:String):void;
    public static native function doConversion():void;
    public static native function compositionSelectionChanged(start:int, end:int):void;
    public static native function compositionAbandoned():void;
    public static function get isSupported():Boolean { notImplemented("isSupported"); }
  }
}
