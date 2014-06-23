package {
  (function () {
    var o = {"toString": function (a, b) {
      return arguments.length + " " + a + " " + b;
    }};
    trace(o.toString("Hello"));
    trace(o.toString("Hello", "World"));
    trace(o);
  })();

  (function () {
    var o = {};
    trace(o.valueOf() === o);
  })();

  class Foo {
    prototype.toString = function():String {
      return "World";
    }
  }

  trace(new Foo());
  trace(new Foo().toString());
  trace("-- DONE --");
}