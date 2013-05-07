package {
  class A {
    function foo(a, b, c, d, e) {
      return a + b + c + d + e;
    }

    function bar() {
      var s = 0;
      for (var i = 0; i < 100000; i++) {
        s += foo(i, i + 1, i + 2, i + 3, i + 4);
      }
      return s;
    }
  }
  trace(new A().bar());
}