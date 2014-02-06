package flash.system {
  import Object;
  import flash.system.IME;
  import XML;
  public final class System {
    public function System() {}
    public static native function get ime():IME;
    public static native function setClipboard(string:String):void;
    public static function get totalMemory():uint { notImplemented("totalMemory"); }
    public static native function get totalMemoryNumber():Number;
    public static native function get freeMemory():Number;
    public static native function get privateMemory():Number;
    public static native function get processCPUUsage():Number;
    public static native function get useCodePage():Boolean;
    public static native function set useCodePage(value:Boolean):void;
    public static native function get vmVersion():String;
    public static native function pause():void;
    public static native function resume():void;
    public static native function exit(code:uint):void;
    public static native function gc():void;
    public static native function pauseForGCIfCollectionImminent(imminence:Number = 0.75):void;
    public static native function disposeXML(node:XML):void;
  }
}
