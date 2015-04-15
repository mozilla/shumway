package XYZ {
  public class A {
    function A() {
      trace("A");
    }

    function a() {
      trace("A::a");
    }
  }

  public class B extends A {
    function B() {
      trace("B");
    }

    function b() {
      trace("B::b");
    }
  }

  public class C extends B {
    function C() {
      trace("C");
    }

    function c() {
      trace("C::c");
    }
  }

  public class D extends C {
    function D() {
      trace("D");
    }
  }

  public class E extends D {
    function E() {
      trace("E");
    }
  }

  (function () {
    (new A()).a();
    (new B()).a();
    (new C()).a();
    (new D()).a();
    (new E()).a();

    (new B()).b();
    (new C()).b();
    (new D()).b();
    (new E()).b();

    (new C()).c();
    (new D()).c();
    (new E()).c();

    trace("---");

  })()

  var o = new Object();
  trace(o);
  trace(Object(o));

  var builtins = [Object, String, Array, Boolean, int, uint, Number];
  for (var i = 0; i < builtins.length; i++) {
    var x = new builtins[i]();
    trace(x);
  }
}
