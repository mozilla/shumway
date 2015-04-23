class A {
  protected var a = 0;
}
class B extends A {
  protected var b = 1;
}
class C extends B {
  protected var c = 2;
}
class D extends C {
  protected var d = 3;
}
class E extends D {
  protected var e = 4;
}
class F extends E {
  protected var f = 5;
  public function foo() {
    trace(a + b + c + d + e + f);
  }
}

var f = new F();
f.foo();
