package {
  class A {
    final function foo() {
      return 1;
    }
  }

  class B extends A {
    // override function foo() {
    //  return 2;
    // }
  }

  (function (x : A) {
    var a : A = x;
    trace(a.foo());
  })(new B());
}
