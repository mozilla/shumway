package {

import flash.utils.Dictionary;

namespace N0;
  namespace N1;
  namespace N2;

  (function () {
    trace("--- array ---");
    var o = [1, 2, 3, 4, 5];
    o["A"] = 234;
    trace(o[1]);
    trace(o["1"]);
    trace(o["A"]);
  })();

  class A {
    N0 var x = 7;
    N1 var x = 8;
    N2 var x = 9;
  }

  /*
  (function () {
    use namespace N0;
    trace("--- class ---");
    var o = new A();
    trace(o.x);
    trace(o["x"]);
    var s = "xy";
    trace(o[s.charAt(0)]);
    var n = [N0, N1, N2];
    for (var i = 0; i < n.length; i++) {
      var y = n[i];
      trace(o.y::x);
    }
    with(o) {
      trace(x);
      trace(N2::x);
    }
  })();
  */

  var x = "BOO";

  (function () {
    with(new A()) {
      trace(x);
    }
  })();

  (function (o) {
    trace(o);
  })(x);

  (function (o) {
    trace("--- XML ---");
    trace(o.@x);
  })(<a x="HELLO">test</a>);

  (function (o : XML) {
    trace("--- XML Typed ---");
    trace(o.@x);
  })(<a x="HELLO">test</a>);

  class B {
    const x = 42;
    const y;

    static const sx = 64;
    static const sy;

    function foo() {
      return 2;
    }
  }

  (function () {
    trace("--- CONST ---");
    var b : B = new B();
    trace(b.x);
    trace(b.y);
    trace(B.sx);
    trace(B.sy);
    trace(b.foo);
    trace(b.foo());
  })();

  (function (x) {
    trace("--- ARRAY ---");
    var a = ["A", "B", "C"];
    trace(a[0]);
    trace(a[x]);
    trace(a["length"]);
    trace(a["sortOn"]);
    trace(a.length);
    trace(a.sortOn);
  })(2);

  (function (x) {
    trace("--- Dictionary ---");
    var a = new Dictionary();
    trace(a[0]);
    var o = {};
    a[o] = 123;
    trace(a[o]);
    trace(a["length"]);
    trace(a["sortOn"]);
    trace(a.length);
    trace(a.sortOn);
  })(2);

  (function (x : int, y) {
    trace("--- Vector ---");
    var v = new Vector.<int>();
    v.push(1); v.push(1); v.push(2); v.push(3);
    trace(v[0] ++);
    trace(v[x] ++);
    trace(v["length"]);
    trace(v.length);
    v[0] = "12.4";
    trace(v[0]);
    v[0] = y;
    trace(v[0]);
  })(2, "3.4");

  (function () {
    trace("--- Vector Loop ---");
    var v = new Vector.<int>();
    for (var i = 0; i < 10; i++) {
      v[i] = i;
    }
    trace(v.length);
  })();

  (function (x) {
    if (x !== 0) {
      trace("A");
    } else if (x !== 1) {
      trace("B");
    } else if (x !== 2) {
      trace("C");
    } else if (x !== 3) {
      trace("D");
    }
  })();
}
