package {
import flash.utils.Dictionary;

(function () {
    trace("--- Test Array In ---");
    var o = [5, 6, 7];
    trace("0" in o);
    trace(1 in o);
    trace(2 in o);
  })();

  (function () {
    trace("--- Test Vector ---");
    var o = new Vector.<int>(5);
    trace("0" in o);
    trace(1 in o);
    trace(8 in o);
  })();

  (function () {
    trace("--- Test Vector ---");
    var o = new Vector.<Object>(5);
    trace("0" in o);
    trace(1 in o);
    trace(8 in o);
  })();

  (function () {
    trace("--- Test Dict ---");
    var o = new Dictionary();
    o["hello"] = "world";
    o[123] = "world";
    trace("hello" in o);
    trace("123" in o);
    trace(123 in o);
  })();

  trace("-- DONE --");
}