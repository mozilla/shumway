package {
  (function () {
    trace("--- Call Property Object ---");
    var a = {"0": function () {
      trace("0");
    }};
    a[0]();
  })();

  (function () {
    trace("--- Call Property Array ---");
    var a = [function () {
      trace("0");
    }];
    a[0]();
  })();
}