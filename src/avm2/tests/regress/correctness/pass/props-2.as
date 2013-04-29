package {
  (function () {
    trace("--- Test 0 ---");
    var o = ["A", "B", "C", "D", "E", "F"];
    trace(o[{toString: function () { return 3; }}]);
    delete o[{toString: function () { return 3; }}];
    trace(o[3]);
  })();
  var zero = 0;
  (function () {
    trace("--- Test 1 - Delete Array Property ---");
    var o = [1, 2, 3, 4];
    trace(o[0]);
    delete o[0];
    trace(o[0]);
    trace(o[1]);
    delete o[zero + 1];
    trace(o[{toString: function () { return 3; }}]);
    delete o[{toString: function () { return 3; }}];
    trace(o[3]);
  })();
}
