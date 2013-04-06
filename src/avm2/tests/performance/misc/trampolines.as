package {
  class A {
    function foo () {

    }
  }

  /*
  class B extends A {

  }
  */

  (function () {
    var a = new A();
    for (var i = 0; i < 10000; i++) {
      a.foo();
    }
  })();

  trace("HERE");

/*
  (function () {
    var b = new B();
    for (var i = 0; i < 1000; i++) {
      b.foo();
    }
  })
*/

}