package {
  (function () {
    trace("--- Test 1 ---");
    var o = {x: 1};
    trace(o.toString());
  })();

  (function () {
    trace("--- Test 2 ---");
    var o = {x: 123};
    o.toString = function () {
      return this.x;
    };
    trace(o.toString());
    trace(o);
    trace(o + 1);
    o.toString = function () {
      return String(this.x);
    };
    trace(o + 1);
    trace(typeof o);
    trace(typeof (o + 1));
  })();

  (function () {
    trace("--- Test 3 ---");
    ([1, "123", Object(2), Boolean(3)]).forEach(function (o) {
      trace(o.toString());
    })
  })();

  (function () {
    trace("--- Test 4 ---");
    var o = {
      toString: function () {
        return 4;
      }
    };
    trace(o + o);
    trace(o + 1);
    trace(o.toString());
  })();

  class A {
    private var v : int = 0;
    public function A(v) {
      this.v = v;
    }
    public function toString() {
      return 123;
    }
    public function valueOf() {
      return v;
    }
  }

  (function () {
    trace("--- Test 5 ---");
    var a : A = new A(1);
    trace(a);
    trace(a + 1);
  })();

  (function () {
    trace("--- Test 6 ---");
    var a : A = new A(1);
    var array = [];
    array[a] = 1234;
    trace(array[a]);
  })();

  (function () {
    trace("--- Test 7 ---");
    var a : A = new A(1);
    trace(a);
  })();
}