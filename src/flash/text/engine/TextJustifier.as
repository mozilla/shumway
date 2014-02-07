package flash.text.engine {
public class TextJustifier {
    public function TextJustifier(locale:String, lineJustification:String) { }
    public static function getJustifierForLocale(locale:String):TextJustifier { notImplemented("getJustifierForLocale"); return null; }
    public native function get locale():String;
    public native function get lineJustification():String;
    public native function set lineJustification(value:String):void;
    public function clone():TextJustifier { notImplemented("clone"); return null; }
  }
}
