package {
  var last = new Date();
  function clockUnder(max, name) {
    var elapsed = new Date() - last;
    // Keep this disabled when committing this file.
    var elapsedSuffix = true ? " (" + elapsed + ")" : "";
    var nameSuffix = name ? ": " + name : "";
    if (elapsed > max) {
      trace("FAIL: > " + max + " ms" + elapsedSuffix + nameSuffix);
    } else {
      trace("PASS: < " + max + " ms" + elapsedSuffix + nameSuffix);
    }
    last = new Date();
  }

  (function () {
    var COUNT = 10000;
    var v : Array = [];
    for (var i = 0; i < 1024; i++) {
      v.push(0);
    }
    for (var k = 0; k < COUNT; k++) {
      for (var i = 0, j = v.length; i < j; i++) {
        v[i] += 1;
      }
    }
  })();

  clockUnder(2000, "Array");

  (function () {
    var COUNT = 10000;
    var v : Vector.<int> = new Vector.<int>(1024);
    for (var k = 0; k < COUNT; k++) {
      for (var i = 0, j = v.length; i < j; i++) {
        v[i] += 1;
      }
    }
  })();

  clockUnder(2000, "Vector");

  trace("--- DONE ---");
}