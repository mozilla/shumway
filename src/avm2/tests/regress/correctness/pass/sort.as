package {
  function sortFunction(a, b) {
    return b - a;
  }
  (function sort0() {
    var array = [4, 1, 2, 6, 1, 5];
    array.sort();
    trace("First Sort: " + array);
    array.sort(sortFunction);
    trace("Second Sort: " + array);
  })();
}