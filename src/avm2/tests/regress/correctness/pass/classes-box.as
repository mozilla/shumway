package XYZ {
  (function () {
    trace("-- Boxing --")
    var A = [int, uint, Number, String];
    var B = [-0, 0, +Infinity, Infinity, NaN, 123.456, null, undefined, "123.456", "-123", "23"];
    for (var i = 0; i < B.length; i++) {
      for (var j = 0; j < A.length; j++) {
        trace(A[j].toString() + "(" + B[i] + ") === " + B[i] + ": " + (A[j](B[i]) === B[i]));
      }
    }
  })();
  trace("-- Done --")
}
