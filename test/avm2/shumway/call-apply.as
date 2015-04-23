package {
  function foo(...rest) {
    for each (var k in rest) {
      trace(k);
    }
  }

  (function () {
    trace("--- Test 0 ---");
    foo.apply(null, ["A", "B", "C"]);
    foo.call(null, "A", "B", "C");
  })();

  class A {
    function foo(...rest) {
      for each (var k in rest) {
        trace(k);
      }
      rest.forEach(function (x, y) {
        trace(x + " " + y);
      });
    }
  }

  (function () {
    var a : A = new A();
    trace("--- Test 1 ---");
    a.foo.apply(null, ["D", "E", "F"]);
    a.foo.call(null, "D", "E", "F");
  })();

  (function () {
    var a : A = new A();
    trace("--- Test 1 ---");
    var o = {D: 1, E: 2, F: 3};
    a.foo.apply(null, ["D", "E", "F"].map(function (x:*, y:int, z:Array) {
      return o[x];
    }));
  })();
}