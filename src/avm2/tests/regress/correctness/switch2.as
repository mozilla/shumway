package {
  function foo(x) {
    if (!undefined) {
      trace(x);
    }
    /*
    switch (x) {
      default:
        trace(x);
    }
    */
  }
  foo(1);
}