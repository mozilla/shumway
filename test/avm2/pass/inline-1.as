package {
  function min2(a, b) {
    if (a > b) {
      return b;
    } else {
      return a
    }
  }

  function min3(a, b, c) {
    return min2(min2(a, b), c);
  }

  function min4(a, b, c, d) {
    return min2(min3(a, b, c), d);
  }

  function foo() {
    var x = min2(1, 4);
    x += min3(5, 3, 6);
    x += min4(2, 3, 2, 4);
    return x;
  }

  foo();
}
