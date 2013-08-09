package {
function expected(got, expected, comment = "") {
  trace((got === expected ? "PASS" : "FAIL") + " expected: " + expected + " " + typeof expected + ", got: " + got + " " + typeof got + (comment ? ". " + comment : ""));
}

trace("Vector.<*>");
/*
(function () {
  var v = new Vector.<*>(); trace(v.length);
})();

(function () {
  var v = new Vector.<*>(1024); trace(v.length);
  expected(v[0], null, "Should be undefined, but it's really null in AVM.");
  v[0] = undefined;
  expected(v[0], null, "Should really be undefined, but oh well, AVM says it's null.");
})();

(function () {
  var v = new Vector.<*>();
  v[0] = 0;
  v[1] = 1;
  v[2] = 2;
  expected(v.length, 3, "Setting indices should change length.");
})();

(function () {
  var v = new Vector.<*>();
  v.length = 12;
  expected(v[4], null, "Changing length should fill vector with default values.");
  v[4] = 9;
  v.length = 0;
  v.length = 12;
  expected(v[4], null, "Changing length should fill vector with default values.");
  v[11] = 11;
  expected(v[11], 11);
  v.length = 11;
  v.length = 12;
  expected(v[11], null);
  expected(v.length, 12, "Setting length should change length.");
})();


(function () {
  var v = new Vector.<*>();
  for (var i = 0; i < 100; i++) {
    v.length ++;
  }
  expected(v.length, 100);
})();


(function () {
  var v = Vector.<*>([1, 2, 3]);
  expected(v.length, 3);
  trace(v);
  trace(Vector.<*>(["1", "-4", 2]));
})();


(function () {
  var o = [1, 2, 3];
  delete o[1];
  trace(o);
  trace(Vector.<*>(o));
  expected(Vector.<*>(o)[1], null, "Holes become null.");
})();


(function () {
  expected(Vector.<*>([]).length, 0);
  var a = [];
  a["19"] = 1;
  expected(Vector.<*>(a).length, 20);
  expected(Vector.<*>({length: 0}).length, 0);
  expected(Vector.<*>({length: 10}).length, 10);
})();


(function () {
  var a = Vector.<*>([1, 2, 3]);
  var b = Vector.<*>(a);
  expected(a.length, 3);
  expected(b.length, 3);
  expected(a[2], 3);
  a[2] = 99;
  expected(a === b, true, "Should be the same, behaves like a coercion.");
  expected(b[2], 99);
})();

(function () {
  trace("-");
  var a = Vector.<*>([1, 2, 3]);
  expected(a.fixed, false, "Should not be fixed.");
  var b = Vector.<uint>(a);
  expected(a.length, 3);
  expected(b.length, 3);
  expected(a[2], 3);
  a[2] = 99;
  expected(a === b, false, "Should not be the same, not the same type anymore so a copy is made.");
})();

(function () {
  var a = new Vector.<*>();
  a.push(0);
  a.push(1, 2, 3, 4);
  trace(a);
})();

(function () {
  var a = new Vector.<*>(10, true);
  try {
    a.push(5);
  } catch (e) {
    expected(e.errorID, 1126, "Can't push, it's fixed.");
  }
})();

(function () {
  trace("-- pop exception --");
  var a = new Vector.<*>(2, true);
  try {
    a.pop(5);
  } catch (e) {
    expected(e.errorID, 1126, "Can't pop, it's fixed.");
  }
})();

(function () {
  trace("-- push, pop --");
  var a = new Vector.<*>();
  a.push(0, 1);
  expected(a.pop(), 1);
  expected(a.pop(), 0);
  expected(a.pop(), 0);
})();

(function () {
  trace("-- unshift --");
  var a = new Vector.<*>();
  a.unshift(0, 1, 2, 3);
  trace(a);
  expected(a.pop(), 3);
  expected(a.pop(), 2);
  expected(a.pop(), 1);
  expected(a.pop(), 0);
})();

(function () {
  var a = new Vector.<*>(5, true);
  try {
    a.unshift(0, 1, 2, 3);
  } catch (e) {
    expected(e.errorID, 1126, "Can't unshift, it's fixed.");
  }
})();


(function () {
  var a = Vector.<*>([0, 1, 2, 3, 4]);
  trace("A: " + a);
  expected(a[3], 3);
  trace("A: " + a.reverse());
  expected(a[3], 1);
})();
*/
(function () {
  trace("-- Concat --");
  var a = Vector.<*>([0, 1, 2, 3, 4]);
  trace("A: " + a + " " + a.length);
  var b = a.concat(Vector.<*>([5, 6, 7, 8, 9]));
  trace("B: " + b + " " + b.length);
  a.length = 0;
  for (var i = 0; i < 10; i++) {
    a = a.concat(Vector.<*>([i]));
  }
  trace("A: " + a);
  trace("A: length: " + a.length);
})();

(function () {
  trace("-- Join --");
  var a = Vector.<*>([0, 1, 2, 3, 4]);
  trace("A: " + a.join());
  trace("A: " + a.join("|"));
})();

(function () {
  trace("-- Every --");
  var a = Vector.<*>([0, 1, 2, 3, 4]);
  a.every(function (x) { trace(x); return true; });
  a.every(function (x, i) { trace(x); return i < 2; });
  a.every(function (x, i, v) { trace(v.length); return i < 2; });
  a.every(function (x, i, v) { trace(this.a); return i < 2;}, {a: "Hello"});
})();

(function () {
  trace("-- Filter --");
  var a = Vector.<*>([0, 1, 2, 3, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7]);
  trace(a.filter(function (x) { return true; }));
  trace(a.filter(function (x) { return x % 2 === 0; }));
  trace(a.filter(function (x, i) { return i % 2 === 0; }));
  trace(a.filter(function (x, i, v) { return i % (v.length / 2) === 0; }));
  trace(a.filter(function (x, i, v) { return  i % this.a === 0; }, {a: 3}));
})();

(function () {
  trace("-- For Each --");
  var a = Vector.<*>([0, 1, 2, 3, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7]);
  a.forEach(function (x, i, v) { trace(x + " " + i + " " + v + " " + this.a); }, {a: 3});
})();

(function () {
  // trace("-- indexOf --");
  var a = Vector.<*>([0, 1, 2, 3, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7]);
  trace(a.indexOf(2, 0));
  trace(a.indexOf(5));
  trace(a.indexOf(7));
})();

(function () {
  trace("-- lastIndexOf --");
  var a = Vector.<*>([0, 1, 2, 3, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7]);
  trace(a);
  trace(a.lastIndexOf(2));
  trace(a.lastIndexOf(5));
  trace(a.lastIndexOf(7));
})();

(function () {
  trace("-- slice --");
  var a = Vector.<*>([0, 1, 2, 3, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7]);
  trace(a.slice(2, 5));
  trace(a.slice(1, 19));
  trace(a.slice(0, 1));
})();

(function () {
  trace("-- splice --");
  trace(Vector.<*>([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]));
  a = Vector.<*>([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]); trace(a.splice(0, 1) + " " + a);
  a = Vector.<*>([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]); trace(a.splice(1, 1) + " " + a);
  a = Vector.<*>([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]); trace(a.splice(4, 100) + " " + a);
  a = Vector.<*>([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]); trace(a.splice(4, 100, 50, 51, 52) + " " + a);
  a = Vector.<*>([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]); trace(a.splice(4, -10, 50, 51, 52) + " " + a);
  a = Vector.<*>([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]); trace(a.splice(100, 10, -1, -1, -1) + " " + a);
})();

class C {
  function toString() : String {
    return "X";
  }
}

trace("DONE ------------");
}