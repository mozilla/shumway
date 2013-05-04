function car(a = 1, b = 2) {
  return a + b;
}

trace(car(1));

function foo(a = 1, b = 2, c = 3) {
  return a + b + c;
}

trace(foo(1));

function bar(a = 1, b = 2, c = 3, d = 4) {
  return a + b + c + d;
}

trace(bar(1));
