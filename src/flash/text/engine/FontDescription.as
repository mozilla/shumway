package flash.text.engine {
  import Object;
  public final class FontDescription {
    public function FontDescription(fontName:String = "_serif", fontWeight:String = "normal", fontPosture:String = "normal", fontLookup:String = "device", renderingMode:String = "cff", cffHinting:String = "horizontalStem") {}
    public static native function isFontCompatible(fontName:String, fontWeight:String, fontPosture:String):Boolean;
    public static native function isDeviceFontCompatible(fontName:String, fontWeight:String, fontPosture:String):Boolean;
    public native function get renderingMode():String;
    public native function set renderingMode(value:String):void;
    public native function get fontLookup():String;
    public native function set fontLookup(value:String):void;
    public native function get fontName():String;
    public native function set fontName(value:String):void;
    public native function get fontPosture():String;
    public native function set fontPosture(value:String):void;
    public native function get fontWeight():String;
    public native function set fontWeight(value:String):void;
    public native function get cffHinting():String;
    public native function set cffHinting(value:String):void;
    public native function get locked():Boolean;
    public native function set locked(value:Boolean):void;
    public function clone():FontDescription { notImplemented("clone"); }
  }
}
