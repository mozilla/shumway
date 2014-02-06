package flash.globalization {
  import Object;
  public final class CurrencyParseResult {
    public function CurrencyParseResult(value:Number = NaN, symbol:String = "") {}
    public native function get value():Number;
    public native function get currencyString():String;
  }
}
