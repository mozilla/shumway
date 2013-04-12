package {
  class A {
    static function foo() {
      trace("F");
    }
  }
  trace (A.foo === A.foo);
  for (var i = 0; i < 10; i++) {
    A.foo();
  }
  trace("-- DONE --");
}