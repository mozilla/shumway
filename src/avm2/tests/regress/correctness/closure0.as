package {
  function run() {
    var sum = 0;
    for (var i = 0; i < 10; i++) {
      (function () {
        sum += i;
      })();
    }
    trace(sum === 45 ? "PASS" : "FAIL");
  }
  run();

  // Make sure the closure closes over a new scope every time.
  var y = 0;
  function foo() {
    var x = y++;
    function boo() {
      trace(x);
      trace(x === y - 1 ? "PASS" : "FAIL");
    }
    boo();
  }

  foo();
  foo();
}