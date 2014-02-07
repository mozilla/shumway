package flash.globalization {
public final class DateTimeFormatter {
    public function DateTimeFormatter(requestedLocaleIDName:String, dateStyle:String = "long", timeStyle:String = "long") {}
    public static native function getAvailableLocaleIDNames():Vector;
    public native function setDateTimeStyles(dateStyle:String, timeStyle:String):void;
    public native function getTimeStyle():String;
    public native function getDateStyle():String;
    public native function get lastOperationStatus():String;
    public native function get requestedLocaleIDName():String;
    public native function get actualLocaleIDName():String;
    public function format(dateTime:Date):String { notImplemented("format"); return ""; }
    public function formatUTC(dateTime:Date):String { notImplemented("formatUTC"); return ""; }
    public native function getMonthNames(nameStyle:String = "full", context:String = "standalone"):Vector;
    public native function getWeekdayNames(nameStyle:String = "full", context:String = "standalone"):Vector;
    public native function getFirstWeekday():int;
    public native function getDateTimePattern():String;
    public native function setDateTimePattern(pattern:String):void;
  }
}
