package flash.text.engine {
  import Object;
  import flash.text.engine.SpaceJustifier;
  import Error;
  import flash.text.engine.EastAsianJustifier;
  import ArgumentError;
  import flash.utils.getQualifiedClassName;
  public class TextJustifier {
    public function TextJustifier(locale:String, lineJustification:String) {}
    public static function getJustifierForLocale(locale:String):TextJustifier { notImplemented("getJustifierForLocale"); }
    public native function get locale():String;
    public native function get lineJustification():String;
    public native function set lineJustification(value:String):void;
    public function clone():TextJustifier { notImplemented("clone"); }
  }
}
