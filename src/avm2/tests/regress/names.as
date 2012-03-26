package P0 {
  namespace N0;
  namespace N1;
  namespace N2;

  class C0 {
    public var v;
    function C0() {
      trace("Created C0");
    }
  }

  public class C1 {
    public var v;
    N0 var y = 2;
    N1 var y = 3;
    N2 var y = 4;

    function C1() {
      trace("Created C1, y: " + N0::y);
    }

    public function foo() {
      trace("N0::y - " + N0::y);
      trace("N1::y - " + N1::y);
      trace("N2::y - " + N2::y);

      trace("N0::['y'] - " + N0::['y']);
      trace("N1::['y'] - " + N1::['y']);
      trace("N2::['y'] - " + N2::['y']);
    }
  }

  var a = new C0();
  var b = new C1();
}

package P1.X {
  public class C2 {
    public var v;
    function C2() {
      trace("Created C2");
    }
  }

  var c = new C2();
}

var e = new P0.C1();
e.foo();
var f = new P1.X.C2();