package {
  class A {
    function bar() {
      trace("A");
    }
  }

  class B {
    function bar() {
      trace("B");
    }
  }

  function foo(type: Class) {
    return new type();
  }

  foo(A).bar();
  foo(B).bar();

}