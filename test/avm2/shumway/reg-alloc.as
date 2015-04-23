(function (c) {
  trace("--- Test 0 ---");
  trace("--- Test 0 ---");
  trace("--- Test 0 ---");
  trace("--- Test 0 ---");
  trace("--- Test 0 ---");
})(1);

(function (c) {
  trace("--- Test 1 ---");
  var x = 1;
  if (c) {
    trace(x);
    x = 2;
  } else {
    trace(x);
    x = 3;
  }
  trace(x);
})(1);


(function (x : int) {
  var a = x + 1;
  var b = a + 1;
  var c = b + 1;
  var d = c + 1;
  var e, f, g, h = 0;
  while (h < 10) {
    if (d) {
      e = d + 1;
      f = e + 1;
      g = f + 1;
      h = g + 1;
    } else {
      e = d + 2;
      f = e + 2;
      g = f + 2;
      h = g + 2;
    }
    d += 1;
  }
  trace(h);
})(1);

(function (x : int) {
  var s = 0;
  for (var i = 0; i < 10; i++) {
    if (i) {
      s += 2;
    }
  }
  trace(s);
})(1);

class A {
  var a : A;
  var x : int = 0;
  function A(x) {
    this.x = x;
  }
}

(function (c) {
  var t : A = new A(0);
  var a = t;
  for (var j = 0; j < 10; j++) {
    t.a = new A(j);
    t = t.a;
  }
  var s = 0;
  for (var i = 0; i < 10; i++) {
    s += a.x + a.a.x + a.a.a.x + a.a.a.a.x + a.a.a.a.a.x + a.a.a.a.a.a.x + a.a.a.a.a.a.a.x + a.a.a.a.a.a.a.a.x + a.a.a.a.a.a.a.a.a.x + a.a.a.a.a.a.a.a.a.a.x;
    s += a.x + a.a.x + a.a.a.x + a.a.a.a.x + a.a.a.a.a.x + a.a.a.a.a.a.x + a.a.a.a.a.a.a.x + a.a.a.a.a.a.a.a.x + a.a.a.a.a.a.a.a.a.x + a.a.a.a.a.a.a.a.a.a.x;
    s += a.x + a.a.x + a.a.a.x + a.a.a.a.x + a.a.a.a.a.x + a.a.a.a.a.a.x + a.a.a.a.a.a.a.x + a.a.a.a.a.a.a.a.x + a.a.a.a.a.a.a.a.a.x + a.a.a.a.a.a.a.a.a.a.x;
    s += a.x + a.a.x + a.a.a.x + a.a.a.a.x + a.a.a.a.a.x + a.a.a.a.a.a.x + a.a.a.a.a.a.a.x + a.a.a.a.a.a.a.a.x + a.a.a.a.a.a.a.a.a.x + a.a.a.a.a.a.a.a.a.a.x;
    s += a.x + a.a.x + a.a.a.x + a.a.a.a.x + a.a.a.a.a.x + a.a.a.a.a.a.x + a.a.a.a.a.a.a.x + a.a.a.a.a.a.a.a.x + a.a.a.a.a.a.a.a.a.x + a.a.a.a.a.a.a.a.a.a.x;
    s += a.x + a.a.x + a.a.a.x + a.a.a.a.x + a.a.a.a.a.x + a.a.a.a.a.a.x + a.a.a.a.a.a.a.x + a.a.a.a.a.a.a.a.x + a.a.a.a.a.a.a.a.a.x + a.a.a.a.a.a.a.a.a.a.x;
    s += a.x + a.a.x + a.a.a.x + a.a.a.a.x + a.a.a.a.a.x + a.a.a.a.a.a.x + a.a.a.a.a.a.a.x + a.a.a.a.a.a.a.a.x + a.a.a.a.a.a.a.a.a.x + a.a.a.a.a.a.a.a.a.a.x;
    s += a.x + a.a.x + a.a.a.x + a.a.a.a.x + a.a.a.a.a.x + a.a.a.a.a.a.x + a.a.a.a.a.a.a.x + a.a.a.a.a.a.a.a.x + a.a.a.a.a.a.a.a.a.x + a.a.a.a.a.a.a.a.a.a.x;
  }
  trace (s);
})(1);

class C {
  function get x() {
    trace("get x");
  }
  function foo() {
    trace("foo");
  }
}

(function () {
  (new C()).x;
})();

(function (c : int) {
  var x = c;
  x += c;
  x += c;
  x += c;
  x += c;
  if (c) {
    x += c;
    x += c;
    x += c;
  } else {
    x += c;
    x += c;
    x += c;
  }
  trace(x);
})(1);

(function (c : int) {
  var s = 0;
  for (var i = 0; i < c; i++) {
    s += i;
  }
  trace(s);
})(10);


function foo(x) {
  trace(x);
}

(function (c : int) {
//  var s = [];
//  s[c];
//
  foo(c);
})(10);