package {
  class A {
    public static const x = 1;
  }

  function foo() {
    var s = 0;
    for (var i = 0; i < 10000000; i++) {
      s += A.x + A.x + A.x + A.x + A.x;
    }
    trace("Value : " + s);
  }

  foo();
}