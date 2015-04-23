package {
  class A { }
  class B extends A { }
  class C { }

  (function () {
    trace("\"ABC\" is String - " + ("ABC" is String));
    trace("A is Class - " + (A is Class));
    trace("123 is Class - " + (123 is Class));
    trace("new A() is Class - " + (new A() is Class));
    trace("A === Class(A) - " + (A === Class(A)));
    trace("B === Class(A) - " + (B === Class(A)));
    trace("new A() is A - " + (new A() is A));
    trace("new B() is A - " + (new B() is A));
    trace("new C() is A - " + (new C() is A));
    trace("-- DONE --");
  })();
}