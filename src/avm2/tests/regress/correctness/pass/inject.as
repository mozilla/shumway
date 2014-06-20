package {
  (function () {
    var o = {"toString": function (a, b) {
      return arguments.length + " " + a + " " + b;
    }};
    trace(o.toString("Hello"));
    trace(o.toString("Hello", "World"));
  })();

  trace("-- DONE --");
}