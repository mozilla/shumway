package {
  class A {
    function foo(b: B) {
      trace (b);
      trace (B);
    }

    static var a = new A();
    a.foo(null);
    trace("B BEFORE STATIC CTOR: " + B);
  }

  trace("BEFORE");

  class B {
    trace("STATIC B");
  }

  trace(B);
}