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
}