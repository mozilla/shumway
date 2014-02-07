package flash.globalization {
public final class NumberFormatter {
    public function NumberFormatter(requestedLocaleIDName:String) {}
    public static native function getAvailableLocaleIDNames():Vector;
    public native function get lastOperationStatus():String;
    public native function get requestedLocaleIDName():String;
    public native function get actualLocaleIDName():String;
    public native function get fractionalDigits():int;
    public native function set fractionalDigits(value:int):void;
    public native function get useGrouping():Boolean;
    public native function set useGrouping(value:Boolean):void;
    public native function get groupingPattern():String;
    public native function set groupingPattern(value:String):void;
    public native function get digitsType():uint;
    public native function set digitsType(value:uint):void;
    public native function get decimalSeparator():String;
    public native function set decimalSeparator(value:String):void;
    public native function get groupingSeparator():String;
    public native function set groupingSeparator(value:String):void;
    public native function get negativeSymbol():String;
    public native function set negativeSymbol(value:String):void;
    public native function get negativeNumberFormat():uint;
    public native function set negativeNumberFormat(value:uint):void;
    public native function get leadingZero():Boolean;
    public native function set leadingZero(value:Boolean):void;
    public native function get trailingZeros():Boolean;
    public native function set trailingZeros(value:Boolean):void;
    public native function parse(parseString:String):NumberParseResult;
    public native function parseNumber(parseString:String):Number;
    public native function formatInt(value:int):String;
    public native function formatUint(value:uint):String;
    public native function formatNumber(value:Number):String;
  }
}
