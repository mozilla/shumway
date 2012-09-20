package {
  class A {
    public var x = 1;
  }

  class B {
    public var x = 2;
  }

  function foo(o) {
    var s = 0;
    for (var i = 0; i < 10000000; i++) {
      s += o.x + o.x + o.x + o.x + o.x;
    }
    trace("Value : " + s);
  }

  foo(new A());
  foo(new B());
}