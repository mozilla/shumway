package {
  class A {
    function foo(a: Class, b: A) {
      trace(a);
      trace(b);
    }
  }
  (new A()).foo(A, new A());
}