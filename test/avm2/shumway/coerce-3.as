package {
  trace("Coercing to Object");

  (function () {
    trace("-- via Object() --");
    ([0, 1, true, false, -1.3, NaN, undefined, null, "A", [], {}, function () {}]).map(function (x) {
      return Object(x);
    }).forEach(function (x) {
      trace(typeof x);
    });
  })();

  (function () {
    trace("-- via new Object() --");
    ([0, 1, true, false, -1.3, NaN, undefined, null, "A", [], {}, function () {}]).map(function (x) {
      return new Object(x);
    }).forEach(function (x) {
        trace(typeof x);
      });
  })();

  (function () {
    trace("-- via Parameter --");
    ([0, 1, true, false, -1.3, NaN, undefined, null, "A", [], {}, function () {}]).map(function (x : Object, y, z) {
      return x;
    }).forEach(function (x) {
      trace(typeof x);
    });
  })();
}