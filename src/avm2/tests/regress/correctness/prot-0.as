class A {
  public function run() {
    foo();
    bar();
  }
  protected function foo() {
    trace("A::foo()");
  }
  public function bar() {
    trace("A::bar()");
  }
}

class B extends A {
  protected override function foo() {
    super.foo();
    trace("override B::foo()");
  }
  public override function bar() {
    super.bar();
    trace("override B::bar()");
  }
}

class C extends B {
  protected override function foo() {
    super.foo();
    trace("override C::foo()");
  }
  public override function bar() {
    super.bar();
    trace("override C::bar()");
  }
  protected function car() {
    super.foo();
    trace("override C::car()");
  }
}

class D extends C {}
class E extends D {
  protected override function foo() {
    super.foo();
    trace("override E::foo()");
  }
  public override function bar() {
    super.bar();
    trace("override E::bar()");
  }
}
class F extends E {}

var f = new F();
f.run();
trace("--");