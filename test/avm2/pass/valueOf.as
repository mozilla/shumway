package {
  (function () {
    trace("--- Test 1 ---");
    var o = {x: 1};
    trace(o.valueOf() === o);
  })();

  (function () {
    trace("--- Test 2 ---");
    var o = {x: 1};
    o.valueOf = function () {
      return this.x;
    };
    trace(o.valueOf());
    trace(o.valueOf() === o);
  })();

  (function () {
    trace("--- Test 3 ---");
    ([1, "123", Object(2), Boolean(3)]).forEach(function (o) {
      trace(typeof o);
      trace(typeof o.valueOf());
    })
  })();

  (function () {
    trace("--- Test 4 ---");
    var o = {
      valueOf: function () {
        return 2;
      }
    };
    trace(o + o);
    trace(o + 1);
    trace(o.valueOf());
  })();
}