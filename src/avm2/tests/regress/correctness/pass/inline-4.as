package {
  class A {
    private function foo() : int {
      trace("foo");
      return 1;
    }

    function car() : int {
      sideEffect();
      return 2;
    }

    public function bar() {
      var s : int = 0;
      for (var i = 0; i < 10; i++) {
        s += foo();
        // s += foo();
        // s += foo();
        // s += foo();
        // s += foo();
        // s += car();
        // s += car();
        // s += car();
        // s += car();
        // s += car();
      }
      return s;
    }
  }

  (function () {
    trace(new A().bar());
  })();
}
