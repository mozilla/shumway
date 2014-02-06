package flash.text.engine {
  import flash.text.engine.TextJustifier;
  import String;
  import Boolean;
  public final class EastAsianJustifier extends TextJustifier {
    public function EastAsianJustifier(locale:String = "ja", lineJustification:String = "allButLast", justificationStyle:String = "pushInKinsoku") {}
    public native function get justificationStyle():String;
    public native function set justificationStyle(value:String):void;
    public native function get composeTrailingIdeographicSpaces():Boolean;
    public native function set composeTrailingIdeographicSpaces(value:Boolean):void;
    public override function clone():TextJustifier { notImplemented("clone"); }
  }
}
