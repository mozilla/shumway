package P0 {
import flash.utils.Dictionary;

namespace N0;
  namespace N1;
  namespace N2;

  class C0 {
    public var x : int;
  }

  public class C1 {
    public var x = 1;
    N0 var x = 2;
    N1 var x = 3;
    N2 var x = 4;
  }

  (function () {
    trace("--- Test 0 ---");
    var a = new C0();
    var b = new C1();
    trace(a.x);
    trace(b.x);
    trace(b.N0::x);
    trace(b.N1::x);
    trace(b.N2::x);
  })();

  (function () {
    trace("--- Test 1 ---");
    var a = new C0();
    var b = new C1();
    trace(a.x);
    trace(b.x);
    trace(b.N0::['x']);
    // trace(b.N1::['x']);
    // trace(b.N2::['x']);
  })();

  /*
  (function () {
    trace("--- Test 2 ---");
    var b = new C1();
    trace(b.x);
    var n = ['x'];
    trace(b.N0::[n[0]]);
  })();
  var zero = 0;

  (function () {
    trace("--- Test 3 ---");
    var a = [0, 1, 2, 3, 4, 5, 6, 7];
    trace(a[3]);
    trace(a["3"]);
    trace(a[zero + 1]);
    trace(a[null]);
    // trace(a[undefined]);
  })();

  (function () {
    trace("--- Test 3 ---");
    var o = new C1();
    var y = N0;
    trace(o.y::["x"]);
    y = N1;
    trace(o.y::["x"]);
  })();

  var ox = { toString: function () { return "x"; } };

  (function () {
    trace("--- Test 4 ---");
    var o = new C1();
    var y = N0;
    trace(o.y::[ox]);
    y = N1;
    trace(o.y::[ox]);
  })();

  (function () {
    trace("--- Test 4 ---");
    var o = new Dictionary();
    o[ox] = "XYZ";
    o["x"] = "ABC";
    trace(o[ox]);
    trace(o["x"]);
    trace(o.x);
  })();
  */
}