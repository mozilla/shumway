package flash.globalization {
  import Object;
  public final class StringTools {
    public function StringTools(requestedLocaleIDName:String) {}
    public static native function getAvailableLocaleIDNames():Vector;
    public native function get lastOperationStatus():String;
    public native function get requestedLocaleIDName():String;
    public native function get actualLocaleIDName():String;
    public native function toLowerCase(s:String):String;
    public native function toUpperCase(s:String):String;
  }
}
