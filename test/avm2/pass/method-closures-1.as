package {
  class A {
    static function foo() {
      return new A().toString();
    }
    function toString() {
      return "HELLO";
    }
  }
  var f = A.foo;
  trace(f());
}