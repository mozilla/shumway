package {
  function foo() {
    var o = {"A": (1 || 2), "B" : 3};
    trace(o.A);
  }
  foo();
}