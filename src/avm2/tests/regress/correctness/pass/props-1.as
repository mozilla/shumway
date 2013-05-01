package {
  class A {
    internal var v : String;
    internal static var LIST : Object = {
      X: 4,
      Y: 5,
      Z: 6
    };
    function A(v : String) {
      this.v = v;
    }
    public static const X : A = new A("X");
    public static const Y : A = new A("Y");
    public static const Z : A = new A("Z");

    public function toString() : String {
      return this.v;
    }
    public function valueOf() : Object {
      return LIST[this.v];
    }
  }
  /*
  (function () {
    trace("--- Test 0 ---");
    trace(A.X);
    trace(A.X.valueOf());
  })();

  (function () {
    trace("--- Test 1 ---");
    ([A.X, A.Y, A.Z]).map(function (v) {
      trace(v);
      trace("toString(): " + v);
    });
  })();
  */

  (function () {
    trace("--- Test 2 ---");
    var o = {X: "First", Y: "Second", Z: "Third"};
    trace(o);
    var a = [A.X, A.Y, A.Z];
    var b = a.map(function (v) {
      return o[v];
    });
    trace(b);
  })();
}
