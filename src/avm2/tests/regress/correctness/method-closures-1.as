package {
  class A {
    static function foo() {
      return new A();
    }
  }
  var f = A.foo;
  trace(f());
}