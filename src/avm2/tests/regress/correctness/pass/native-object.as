package {
  trace("--- Object ---");
  (function () {
    trace({});
    trace(({}).toString());
    trace(({}).valueOf());
    var a = {};
    trace(a.valueOf() === a);
  })();

  (function () {
    var o = {a: 0};
    for (var k in o) { trace(k); }
    trace(o.hasOwnProperty("a"));
    trace(o.propertyIsEnumerable("a"));
    o.setPropertyIsEnumerable("a", false);
    trace(o.hasOwnProperty("a"));
    trace(o.propertyIsEnumerable("a"));
    for (var k in o) { trace(k); }
  })();

  (function () {
    var o = {a: 0};
    for (var k in Object.prototype) { trace(k); }
  })();

  trace("--- Number ---");

  (function () {
    trace(Number(0));
    for (var k in Number.prototype) { trace(k); }
  })();
}
