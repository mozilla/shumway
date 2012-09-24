package {
  class A {
    public var x = 1;
  }

  class B {
    var x = 2;
  }

  function foo(o) {
    var s = 0;
    for (var i = 0; i < 10000000; i++) {
      s += o.x + o.x + o.x + o.x + o.x;
      o.x += 1;
    }
    trace("Value : " + s);
  }

  foo(new A());
  foo(new B());
}