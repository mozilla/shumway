package {
  dynamic class A {
    var x = 1;
    function get y () {
      trace("get y");
      return 2;
    }
    function set y (v) {
      trace("set y");
      return x += v;
    }
    function foo(v) {
      x = v;
    }
  }

  (function () {
    trace("--- Test 1 ---");
    var a : A = new A();
    var v0 = a.x + a.x + a.x + a.x + a.x;
    trace(v0);
    var v1 = a.y + a.y + a.y + a.y + a.y;
    trace(v0);
  })();

  (function () {
    trace("--- Test 2 - Getter ---");
    return new A().y;
  })();

  (function () {
    trace("--- Test 3 - Don't Eliminate ---");
    new A().y;
  })();

  (function () {
    trace("--- Test 4 ---");
    var a = new A();
    var v0 = a.x;
    v0 = a.x;
    v0 = a.x;
    a.y = 2;
    v0 = a.x;
    a.foo(2);
    trace(v0);
    v0 = a.x;
    trace(v0);
  })();

  var o = new A();

  (function () {
    trace("--- Test 5 ---");
    o.x = 2;
    trace(o.x);
    trace(o.y);
    o.y = 4;
    trace(o.x);
  })();

  (function () {
    trace("--- Test 6 - Delete Object Property ---");
    var o = {a: 1, b: 2};
    trace(o.a);
    trace(o.b);
    delete o.a;
    trace(o.a);
    o.a = 3;
    trace(o.a);
    var a = [1, 2, 3, 4];
  })();

  var zero = 0;

  (function () {
    trace("--- Test 7 - Delete Array Property ---");
    var o = [1, 2, 3, 4];
    trace(o[0]);
    delete o[0];
    trace(o[0]);
    trace(o[1]);
    delete o[zero + 1];
    trace(o[{toString: function () { return 3; }}]);
    delete o[{toString: function () { return 3; }}];
    trace(o[3]);
  })();

  (function () {
    trace("--- Test 8 - Delete ---");
    var o = {a: 0, b: 0};
    trace(delete o.a);
    trace(delete o.a);
  })();

  (function () {
    trace("--- Test 9 - Delete Trait ---");
    var o = new A();
    // trace(delete o.x);
    // trace(delete o.x);
    trace("--- Test 9 - Delete Dynamic Property ---");
    o.b = 2;
    trace(delete o.b);
    trace(delete o.b);
  })();

  class C {}
  dynamic class D {}

  (function () {
    // trace("--- Test 10 - Delete Missing Class Property ---");
    // var o = new C();
    // trace(delete o.x);
    // trace(delete o.x);
    trace("--- Test 10 - Delete Missing Dynamic Class Property ---");
    o = new D();
    trace(delete o.x);
    trace(delete o.x);
  })();
}

function F() {
  this.c = 3;
}
F.prototype = {a: 1, b: 2};

(function () {
  trace("--- Test 11 - Delete Prototype Property ---");
  var o = new F();
  trace(o.a);
  trace(o.b);
  trace(o.c);
  trace(delete o.a);
  trace(delete o.b);
  trace(delete o.c);
  trace(o.a);
  trace(o.b);
  trace(o.c);
})();

(function () {
  trace("--- Test 12 - Delete Inherited Property ---");
  var o = new F();
  trace(o.a);
  trace(o.b += 1);
  trace(o.c += 1);
  trace(o.a);
  trace(o.b);
  trace(o.c);
  trace(delete o.a);
  trace(delete o.b);
  trace(delete o.c);
  trace(o.a);
  trace(o.b);
  trace(o.c);
})();
