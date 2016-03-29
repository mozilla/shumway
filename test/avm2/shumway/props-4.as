package {
  (function () {
    trace("--- hasOwnProperty ---");
    var o = [1, 2, 3, 4, 5];
    trace(o.hasOwnProperty(0));
    trace({"": 1}.hasOwnProperty(""));
    trace({undefined: 1}.hasOwnProperty("undefined"));
    trace({"null": 1}.hasOwnProperty(null));
    trace({"null": 1}.hasOwnProperty(undefined));
    trace({undefined: 1}.hasOwnProperty(undefined));
  })();

  dynamic class A {
    var x = 1;
  }

  (function () {
    trace("--- propertyIsEnumerable ---");
    var o = [1, 2, 3, 4, 5];
    trace(o.propertyIsEnumerable(0));
    trace(o.propertyIsEnumerable(5));
    var a = new A();
    trace(a.propertyIsEnumerable("x"));
    a.y = 2;
    trace(a.propertyIsEnumerable("y"));
    trace(a.propertyIsEnumerable("z"));
    a[""] = "";
    trace(a.propertyIsEnumerable(""));
    trace(a.propertyIsEnumerable());
  })();
}
