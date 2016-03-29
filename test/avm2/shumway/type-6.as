package {
  class B {

  }
  class A {
    function foo(x: Object) {
      trace("In foo: " + x);
    }
    function bar(x: int) {
      trace("In bar: " + x);
    }
    function car(x: A) {
      trace("In bar: " + x);
    }
  }
  (function () {
    var a = new A();
    trace("--- isType ---");
    var x = [1, 0, null];
    for (var i = 0; i < x.length; i++) {
      try {
        trace("V: " + x[i]);
        a.foo(x[i]);
        a.bar(x[i]);
        trace("Is Object: " + (x[i] is Object));
      } catch (e) {
        trace("catch");
      }
    }
  })();

  (function () {
    var a = new A();
    var b = new B();
    trace("--- isType 2 ---");
    try {
      a.car(b);
    } catch (e) {
      trace("catch");
    }
  })();
}