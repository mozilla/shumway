package {
  class A {
    static function foo() {
      trace("F");
    }
    function bar() {
      trace("F");
    }
  }
  var a = new A();
  for (var i = 0; i < 10; i++) {
    trace (A.foo === A.foo);
    trace (a.bar === a.bar);
  }
  trace("-- DONE --");
}