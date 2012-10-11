package {
  var x : int = 1;
  var y : Number = 2;

  (function () {
    this.k = 0;
  })();

  function any(x) {
    return x;
  }

  function foo() {
    var z : int = 3;
    var a = [];
    for (var i = 0; i < 5000; i++) {
      a[i] = i;
    }
    function bar() {
      var w : Number = 4;
      trace("Creating CAR");
      function car() {
        var sum = 0;
        for (var i = 0; i < 50000; i++) {
          sum += x + y + z + w + i;
          x ++;
          y ++;
          z ++;
          w ++;
          k ++;
        }
        for (var i = 0; i < 50000000; i++) {
          a[i] += i;
        }
        for (var i = 0; i < 5000; i++) {
          var j = i + "";
          a[j] += j;
        }
        for (var i = 0; i < 5000; i++) {
          sum += Math.sin(i);
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