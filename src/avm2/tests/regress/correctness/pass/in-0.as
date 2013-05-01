package {

  (function () {
    trace("--- Test 1 ---");
    var o = {a: 1, b: 2};
    trace("a" in o);
    trace("b" in o);
    trace("c" in o);
  })();

  (function () {
    trace("--- Test 2 ---");
    var o = [5, 6, 7];
    trace(0 in o);
    trace(1 in o);
    trace(2 in o);
    trace(3 in o);
  })();

  (function () {
    trace("--- Test 3 ---");
    trace("charCodeAt" in "ABC");
    trace("toString" in "ABC");
    trace("randomName" in "ABC");
  })();

  (function () {
    trace("--- Test 4 ---");
    trace("toString" in 0);
    trace("randomName" in 0);
  })();

  (function () {
    trace("--- Test 5 ---");
    for (var i = 0; i < 4; i++) {
      trace(i in [4, 5, 6, 7]);
    }
  })();

  (function () {
    trace("--- Test 6 ---");
    var o = [5, 6, 7];
    trace(null in o);
    trace(undefined in o);
  })();

  (function () {
    trace("--- Test 7 ---");
    var o = {"null": 1, "undefined": 3};
    trace(null in o);
    trace(undefined in o);
  })();

  trace("-- DONE --");
}