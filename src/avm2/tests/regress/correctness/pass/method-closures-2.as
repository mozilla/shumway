package {
  class A {
    function foo() {

    }
  }
  var a = new A();
  trace(a.foo === a.foo);
  trace(a.foo === a.foo);
  trace(a.foo === a.foo);
  trace("-- DONE --");
}