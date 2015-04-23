package {
  class A implements I {
    trace("CLASS A");
  }

  class B extends A {
    trace("CLASS B");
  }

  interface I {
    trace("I B");
  }

  (function () {

  })();
}