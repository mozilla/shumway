package {
  (function () {
    trace("--- Test 0 - Delete Array Element While Enumerating ---");
    var o = ["A", "B", "C", "D", "E", "F"];
    for (var k in o) {
      trace(k);
      delete o[4];
    }
  })();

  (function () {
    trace("--- Test 1 - IN ---");
    var o = ["A", "B", "C", "D", "E", "F"];
    trace(0 in o);
    trace(1 in o);
    trace(2 in o);
    trace(3 in o);
    trace(4 in o);
    trace(5 in o);
    trace(6 in o);
    trace(7 in o);

    trace("0" in o);
    trace("7" in o);
  })();
}
