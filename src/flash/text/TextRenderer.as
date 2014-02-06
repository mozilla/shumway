package flash.text {
  import Object;
  public final class TextRenderer {
    public function TextRenderer() {}
    public static native function get antiAliasType():String;
    public static native function set antiAliasType(value:String):void;
    public static native function setAdvancedAntiAliasingTable(fontName:String, fontStyle:String, colorType:String, advancedAntiAliasingTable:Array):void;
    public static native function get maxLevel():int;
    public static native function set maxLevel(value:int):void;
    public static native function get displayMode():String;
    public static native function set displayMode(value:String):void;
  }
}
