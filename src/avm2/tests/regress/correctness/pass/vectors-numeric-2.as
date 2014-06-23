package {
  function expected(got, expected, comment = "") {
    trace((got === expected ? "PASS" : "FAIL") + " expected: " + expected + ", got: " + got +  (comment ? ". " + comment : ""));
  }

  (function () {
    trace("-- Not the Same Type --");
    var a = Vector.<int>([1, 2, 3]);
    var b = Vector.<uint>(a); // Now it clones it.
    expected(a === b, false, "Should not be the same, behaves like a clone.");
  })();

  trace("DONE ------------");
}