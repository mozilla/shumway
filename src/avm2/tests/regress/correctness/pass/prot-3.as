package {
  class A {
    function A() {
      foo();
    }
    protected function foo() {
      trace("A::foo");
    }
  }

  class B extends A {
    function B() {
      super();
    }
    protected override function foo() {
      trace("B::foo");
    }
  }

  var b = new B();

  trace("--");
}