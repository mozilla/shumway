package flash.globalization {
public final class NumberParseResult {
    public function NumberParseResult(value:Number = NaN, startIndex:int = 2147483647, endIndex:int = 2147483647) {}
    public native function get value():Number;
    public native function get startIndex():int;
    public native function get endIndex():int;
  }
}
