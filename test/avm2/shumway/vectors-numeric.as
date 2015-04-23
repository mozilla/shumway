package {
  function expected(got, expected, comment = "") {
    trace((got === expected ? "PASS" : "FAIL") + " expected: " + expected + ", got: " + got +  (comment ? ". " + comment : ""));
  }

  trace("Vector.<int>");

  (function () {
    var v = new Vector.<int>(); trace(v.length);
  })();

  (function () {
    var v = new Vector.<int>(1024); trace(v.length);
  })();

  (function () {
    var v = new Vector.<int>();
    v[0] = 0;
    v[1] = 1;
    v[2] = 2;
    expected(v.length, 3, "Setting indices should change length.");
  })();

  (function () {
    var v = new Vector.<int>();
    v.length = 12;
    expected(v[4], 0, "Changing length should fill vector with default values.");
    v[4] = 9;
    v.length = 0;
    v.length = 12;
    expected(v[4], 0, "Changing length should fill vector with default values.");
    v[11] = 11;
    expected(v[11], 11);
    v.length = 11;
    v.length = 12;
    expected(v[11], 0);
    expected(v.length, 12, "Setting length should change length.");
  })();

  (function () {
    var v = new Vector.<int>();
    for (var i = 0; i < 100; i++) {
      v.length ++;
    }
    expected(v.length, 100);
  })();

  (function () {
    var v = Vector.<int>([1, 2, 3]);
    expected(v.length, 3);
    trace(v);
    trace(Vector.<int>(["1", "-4", 2]));
  })();

  (function () {
    var o = [1, 2, 3];
    delete o[1];
    trace(o);
    trace(Vector.<int>(o));
    expected(Vector.<int>(o)[1], 0, "Holes become zero.");
  })();

  (function () {
    expected(Vector.<int>([]).length, 0);
    var a = [];
    a["19"] = 1;
    expected(Vector.<int>(a).length, 20);
    expected(Vector.<int>({length: 0}).length, 0);
    expected(Vector.<int>({length: 10}).length, 10);
  })();

  (function () {
    var a = Vector.<int>([1, 2, 3]);
    var b = Vector.<int>(a);
    expected(a.length, 3);
    expected(b.length, 3);
    expected(a[2], 3);
    a[2] = 99;
    expected(a === b, true, "Should be the same, behaves like a coercion.");
    expected(b[2], 99);
  })();

  (function () {
    trace("-");
    var a = Vector.<int>([1, 2, 3]);
    expected(a.fixed, false, "Should not be fixed.");
    var b = Vector.<uint>(a);
    expected(a.length, 3);
    expected(b.length, 3);
    expected(a[2], 3);
    a[2] = 99;
    expected(a === b, false, "Should not be the same, not the same type anymore so a copy is made.");
  })();

  (function () {
    var a = new Vector.<int>();
    a.push(0);
    a.push(1, 2, 3, 4);
    trace(a);
  })();

  (function () {
    var a = new Vector.<int>(10, true);
    try {
      a.push(5);
    } catch (e) {
      expected(e.errorID, 1126, "Can't push, it's fixed.");
    }
  })();

  (function () {
    var a = new Vector.<int>(2, true);
    try {
      a.pop(5);
    } catch (e) {
      expected(e.errorID, 1126, "Can't pop, it's fixed.");
    }
  })();

  (function () {
    var a = new Vector.<int>();
    a.push(0, 1);
    expected(a.pop(), 1);
    expected(a.pop(), 0);
    expected(a.pop(), 0);
  })();

  (function () {
    var a = new Vector.<int>();
    a.unshift(0, 1, 2, 3);
    trace(a);
    expected(a.pop(), 3);
    expected(a.pop(), 2);
    expected(a.pop(), 1);
    expected(a.pop(), 0);
  })();

  (function () {
    var a = new Vector.<int>(5, true);
    try {
      a.unshift(0, 1, 2, 3);
    } catch (e) {
      expected(e.errorID, 1126, "Can't unshift, it's fixed.");
    }
  })();


  (function () {
    var a = Vector.<int>([0, 1, 2, 3, 4]);
    trace("A: " + a);
    expected(a[3], 3);
    trace("A: " + a.reverse());
    expected(a[3], 1);
  })();

  (function () {
    trace("-- Concat --");
    var a = Vector.<int>([0, 1, 2, 3, 4]);
    trace("A: " + a);
    var b = a.concat(Vector.<int>([5, 6, 7, 8, 9]));
    trace("B: " + b);
    a.length = 0;
    for (var i = 0; i < 10; i++) {
      a = a.concat(Vector.<int>([i]));
    }
    trace("A: " + a);
  })();

  (function () {
    trace("-- Join --");
    var a = Vector.<int>([0, 1, 2, 3, 4]);
    trace("A: " + a.join());
    trace("A: " + a.join("|"));
  })();

  (function () {
    trace("-- Every --");
    var a = Vector.<int>([0, 1, 2, 3, 4]);
    a.every(function (x) { trace(x); return true; });
    a.every(function (x, i) { trace(x); return i < 2; });
    a.every(function (x, i, v) { trace(v.length); return i < 2; });
    a.every(function (x, i, v) { trace(this.a); return i < 2;}, {a: "Hello"});
  })();

  (function () {
    trace("-- Filter --");
    var a = Vector.<int>([0, 1, 2, 3, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7]);
    trace(a.filter(function (x) { return true; }));
    trace(a.filter(function (x) { return x % 2 === 0; }));
    trace(a.filter(function (x, i) { return i % 2 === 0; }));
    trace(a.filter(function (x, i, v) { return i % (v.length / 2) === 0; }));
    trace(a.filter(function (x, i, v) { return  i % this.a === 0; }, {a: 3}));
  })();

  (function () {
    trace("-- For Each --");
    var a = Vector.<int>([0, 1, 2, 3, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7]);
    a.forEach(function (x, i, v) { trace(x + " " + i + " " + v + " " + this.a); }, {a: 3});
  })();

  (function () {
    trace("-- indexOf --");
    var a = Vector.<int>([0, 1, 2, 3, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7]);
    trace(a.indexOf(2));
    trace(a.indexOf(5));
    trace(a.indexOf(7));
  })();

  (function () {
    trace("-- lastIndexOf --");
    var a = Vector.<int>([0, 1, 2, 3, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7]);
    trace(a.lastIndexOf(2));
    trace(a.lastIndexOf(5));
    trace(a.lastIndexOf(7));
  })();

  (function () {
    trace("-- slice --");
    var a = Vector.<int>([0, 1, 2, 3, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7]);
    trace(a.slice(2, 5));
    trace(a.slice(1, 19));
    trace(a.slice(0, 1));
  })();

  (function () {
    trace("-- splice --");
    trace(Vector.<int>([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]));
    var a = Vector.<int>([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]); trace(a.splice(0, 1) + " " + a);
    a = Vector.<int>([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]); trace(a.splice(1, 1) + " " + a);
    a = Vector.<int>([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]); trace(a.splice(4, 100) + " " + a);
    a = Vector.<int>([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]); trace(a.splice(4, 100, 50, 51, 52) + " " + a);
    a = Vector.<int>([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]); trace(a.splice(4, -10, 50, 51, 52) + " " + a);
    a = Vector.<int>([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]); trace(a.splice(100, 10, -1, -1, -1) + " " + a);
  })();

  trace("Vector.<uint>");

  (function () {
    var v = new Vector.<uint>(); trace(v.length);
  })();

  (function () {
    var v = new Vector.<uint>(1024); trace(v.length);
  })();

  (function () {
    var v = new Vector.<uint>();
    v[0] = 0;
    v[1] = 1;
    v[2] = 2;
    expected(v.length, 3, "Setting indices should change length.");
  })();

  (function () {
    var v = new Vector.<uint>();
    v.length = 12;
    expected(v[4], 0, "Changing length should fill vector with default values.");
    v[4] = 9;
    v.length = 0;
    v.length = 12;
    expected(v[4], 0, "Changing length should fill vector with default values.");
    v[11] = 11;
    expected(v[11], 11);
    v.length = 11;
    v.length = 12;
    expected(v[11], 0);
    expected(v.length, 12, "Setting length should change length.");
  })();

  (function () {
    var v = new Vector.<uint>();
    for (var i = 0; i < 100; i++) {
      v.length ++;
    }
    expected(v.length, 100);
  })();

  (function () {
    var v = Vector.<uint>([1, 2, 3]);
    expected(v.length, 3);
    trace(v);
    trace(Vector.<uint>(["1", "-4", 2]));
  })();

  (function () {
    var o = [1, 2, 3];
    delete o[1];
    trace(o);
    trace(Vector.<uint>(o));
    expected(Vector.<uint>(o)[1], 0, "Holes become zero.");
  })();

  (function () {
    expected(Vector.<uint>([]).length, 0);
    var a = [];
    a["19"] = 1;
    expected(Vector.<uint>(a).length, 20);
    expected(Vector.<uint>({length: 0}).length, 0);
    expected(Vector.<uint>({length: 10}).length, 10);
  })();

  (function () {
    var a = Vector.<uint>([1, 2, 3]);
    var b = Vector.<uint>(a);
    expected(a.length, 3);
    expected(b.length, 3);
    expected(a[2], 3);
    a[2] = 99;
    expected(a === b, true, "Should be the same, behaves like a coercion.");
    expected(b[2], 99);
  })();

  (function () {
    trace("-");
    var a = Vector.<uint>([1, 2, 3]);
    expected(a.fixed, false, "Should not be fixed.");
    var b = Vector.<uint>(a);
    expected(a.length, 3);
    expected(b.length, 3);
    expected(a[2], 3);
    a[2] = 99;
    expected(a === b, false, "Should not be the same, not the same type anymore so a copy is made.");
  })();

  (function () {
    var a = new Vector.<uint>();
    a.push(0);
    a.push(1, 2, 3, 4);
    trace(a);
  })();

  (function () {
    var a = new Vector.<uint>(10, true);
    try {
      a.push(5);
    } catch (e) {
      expected(e.errorID, 1126, "Can't push, it's fixed.");
    }
  })();

  (function () {
    var a = new Vector.<uint>(2, true);
    try {
      a.pop(5);
    } catch (e) {
      expected(e.errorID, 1126, "Can't pop, it's fixed.");
    }
  })();

  (function () {
    var a = new Vector.<uint>();
    a.push(0, 1);
    expected(a.pop(), 1);
    expected(a.pop(), 0);
    expected(a.pop(), 0);
  })();

  (function () {
    var a = new Vector.<uint>();
    a.unshift(0, 1, 2, 3);
    trace(a);
    expected(a.pop(), 3);
    expected(a.pop(), 2);
    expected(a.pop(), 1);
    expected(a.pop(), 0);
  })();

  (function () {
    var a = new Vector.<uint>(5, true);
    try {
      a.unshift(0, 1, 2, 3);
    } catch (e) {
      expected(e.errorID, 1126, "Can't unshift, it's fixed.");
    }
  })();


  (function () {
    var a = Vector.<uint>([0, 1, 2, 3, 4]);
    trace("A: " + a);
    expected(a[3], 3);
    trace("A: " + a.reverse());
    expected(a[3], 1);
  })();

  (function () {
    trace("-- Concat --");
    var a = Vector.<uint>([0, 1, 2, 3, 4]);
    trace("A: " + a);
    var b = a.concat(Vector.<uint>([5, 6, 7, 8, 9]));
    trace("B: " + b);
    a.length = 0;
    for (var i = 0; i < 10; i++) {
      a = a.concat(Vector.<uint>([i]));
    }
    trace("A: " + a);
  })();

  (function () {
    trace("-- Join --");
    var a = Vector.<uint>([0, 1, 2, 3, 4]);
    trace("A: " + a.join());
    trace("A: " + a.join("|"));
  })();

  (function () {
    trace("-- Every --");
    var a = Vector.<uint>([0, 1, 2, 3, 4]);
    a.every(function (x) { trace(x); return true; });
    a.every(function (x, i) { trace(x); return i < 2; });
    a.every(function (x, i, v) { trace(v.length); return i < 2; });
    a.every(function (x, i, v) { trace(this.a); return i < 2;}, {a: "Hello"});
  })();

  (function () {
    trace("-- Filter --");
    var a = Vector.<uint>([0, 1, 2, 3, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7]);
    trace(a.filter(function (x) { return true; }));
    trace(a.filter(function (x) { return x % 2 === 0; }));
    trace(a.filter(function (x, i) { return i % 2 === 0; }));
    trace(a.filter(function (x, i, v) { return i % (v.length / 2) === 0; }));
    trace(a.filter(function (x, i, v) { return  i % this.a === 0; }, {a: 3}));
  })();

  (function () {
    trace("-- For Each --");
    var a = Vector.<uint>([0, 1, 2, 3, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7]);
    a.forEach(function (x, i, v) { trace(x + " " + i + " " + v + " " + this.a); }, {a: 3});
  })();

  (function () {
    trace("-- indexOf --");
    var a = Vector.<uint>([0, 1, 2, 3, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7]);
    trace(a.indexOf(2));
    trace(a.indexOf(5));
    trace(a.indexOf(7));
  })();

  (function () {
    trace("-- lastIndexOf --");
    var a = Vector.<uint>([0, 1, 2, 3, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7]);
    trace(a.lastIndexOf(2));
    trace(a.lastIndexOf(5));
    trace(a.lastIndexOf(7));
  })();

  (function () {
    trace("-- slice --");
    var a = Vector.<uint>([0, 1, 2, 3, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7]);
    trace(a.slice(2, 5));
    trace(a.slice(1, 19));
    trace(a.slice(0, 1));
  })();

  (function () {
    trace("-- splice --");
    trace(Vector.<uint>([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]));
    var a = Vector.<uint>([0, 1, 2, 3, -4, -5, -6, -7, 8, 9]); trace(a.splice(0, 1) + " " + a);
    a = Vector.<uint>([0, 1, 2, 3, -4, -5, -6, -7, 8, 9]); trace(a.splice(1, 1) + " " + a);
    a = Vector.<uint>([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]); trace(a.splice(4, 100) + " " + a);
    a = Vector.<uint>([0, 1, -2, -3, -4, 5, 6, 7, 8, 9]); trace(a.splice(4, 100, 50, 51, 52) + " " + a);
    a = Vector.<uint>([0, 1, 2, 3, -4, 5, 6, 7, 8, 9]); trace(a.splice(4, -10, 50, 51, 52) + " " + a);
    a = Vector.<uint>([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]); trace(a.splice(100, 10, -1, -1, -1) + " " + a);
  })();

  trace("-- weird constructor form --");

  (function () {
    trace("-- Same Type --");
    var a = Vector.<int>([1, 2, 3]);
    var b = Vector.<int>(a);
    expected(a.length, 3);
    expected(b.length, 3);
    expected(a[2], 3);
    a[2] = 99;
    expected(a === b, true, "Should be the same, behaves like a coercion.");
    expected(b[2], 99);
  })();

  (function () {
    trace("-- Not the Same Type --");
    var a = Vector.<int>([1, 2, 3]);
    var b = Vector.<uint>(a); // Now it clones it.
    expected(a.length, 3);
    expected(b.length, 3);
    expected(a[2], 3);
    a[2] = 99;
    expected(a === b, true, "Should not be the same, behaves like a clone.");
    expected(b[2], 3);
  })();

  trace("Vector.<Number>");

  (function () {
    var a = Vector.<Number>([1, 2.45, 3.67]);
    trace(a);
  })();

  trace("DONE ------------");
}