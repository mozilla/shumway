package {
  var w = 13;

  function foo(x, y = 4, z = 5) {
    return 1 + 2 + x + y + z + w;
  }

  function boo() {
    var x = foo(1, 2);
    x += foo(3);
    x += foo(4);
    x += foo(5);
    x += foo(6);
    x += foo(7);
    x += foo(8);
    x += foo(9);
    trace(x);
  }

  boo();

  function a() { return 1; }
  function b() { return 1 + a(); }
  function c() { return 1 + b(); }
  function d() { return 1 + c(); }
  function e() { return 1 + d(); }
  function f() { return 1 + e(); }
  function g() { return 1 + f(); }
  function h() { return 1 + g(); }
  function i() { return 1 + h(); }
  function j() { return 1 + i(); }
  function k() { return 1 + j(); }
  function l() { return 1 + k(); }
  function m() { return 1 + l(); }

  m();

  function x(a, b, c) {
    var d, e, f;
    d = a;
    e = b;
    f = c;
    return d + e + f;
  }

  function y() {
    return x(1, 2, 3);
  }

  y();
}
