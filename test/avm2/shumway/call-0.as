package {
  var o = {
    foo: function () {
      trace("o.foo");
    }
  };

  (function () {
    o.foo();
    o["foo"]();
    o["f" + "o" + "o"]();
  })();

  function bar() {
    function car() {
      trace("car");
    }
    car();
    trace("bar");
  }

  (function () {
    bar();
  })();
}