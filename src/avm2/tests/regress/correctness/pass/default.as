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

(function (a, b = 2) {
  trace (b);
})(0);

(function (a, b = 3) {
  trace (b);
})(0, 5);

(function (a, b = 3, c, d, e = 9, ...rest) {
  trace (a);
  trace (b);
  trace (c);
  trace (d);
  trace (e);
})(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

(function (a, b = 3, ...rest) {
  trace (b);
})(0);