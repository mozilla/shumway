package {
  var x : int = 1;
  var y : Number = 2;

  function foo() {
    var z : int = 3;
    function bar() {
      var w : Number = 4;
      trace("Creating CAR");
      function car() {
        var sum = 0;
        for (var i = 0; i < 50000; i++) {
          sum += x + y + z + w + i;
        }
        return sum;
      }
      return car;
    }
    return bar;
  }

  var f = foo()();
  trace(f());
}