package flash.globalization {
  import Object;
  import flash.globalization.CurrencyParseResult;
  public final class CurrencyFormatter {
    public function CurrencyFormatter(requestedLocaleIDName:String) {}
    public static native function getAvailableLocaleIDNames():Vector;
    public native function get currencyISOCode():String;
    public native function get currencySymbol():String;
    public native function setCurrency(currencyISOCode:String, currencySymbol:String):void;
    public function format(value:Number, withCurrencySymbol:Boolean = false):String { notImplemented("format"); }
    public native function formattingWithCurrencySymbolIsSafe(requestedISOCode:String):Boolean;
    public native function parse(inputString:String):CurrencyParseResult;
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
    public native function get negativeCurrencyFormat():uint;
    public native function set negativeCurrencyFormat(value:uint):void;
    public native function get positiveCurrencyFormat():uint;
    public native function set positiveCurrencyFormat(value:uint):void;
    public native function get leadingZero():Boolean;
    public native function set leadingZero(value:Boolean):void;
    public native function get trailingZeros():Boolean;
    public native function set trailingZeros(value:Boolean):void;
  }
}
