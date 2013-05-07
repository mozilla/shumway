(function () {
  trace("--- Test 0 - Don't Hoist Array Literals ---");
  var s = 0;
  for (var i = 0; i < 10; i++) {
    var a = [];
    a.push(1);
    a.push(2);
    a.push(3);
    s += a.length;
  }
  trace(s);
})();

(function () {
  trace("--- Test 0 - Don't Hoist Object Literals ---");
  for (var i = 0; i < 10; i++) {
    var a = {};
    trace(a.x);
    a.x = 2;
  }
})();