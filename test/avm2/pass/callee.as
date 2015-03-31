package {
  function test0(fn) {
    fn.call(null, false);
  }

  function test1(arg: Boolean) {
    trace('test1: ' + arg);
    if (arg) {
      test0(arguments.callee);
    }
  }

  (function () {
    test1(true);
  })();
}
