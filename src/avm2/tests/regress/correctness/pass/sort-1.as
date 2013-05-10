package {

  function printArray(array) {
    array.forEach(function (x) {
      trace(x.a + " : " + x.b + " : " + x.c + " : " + x.d);
    });
  }

  (function () {
    var array = [
      {a: 3, b: 2, c: "AC",   d: "11"},
      {a: 2, b: 4, c: "B",    d: "2.1"},
      {a: 5, b: 1, c: "BED",  d: "1"},
      {a: 1, b: 9, c: "AB",   d: "21"},
      {a: 9, b: 8, c: "ABD",  d: "1.2"},
      {a: 4, b: 7, c: "ABDE", d: "0x2"}
    ];

    trace("--- Test sortOn('a') ---");
    array.sortOn("a");
    printArray(array);

    trace("--- Test sortOn('b') ---");
    array.sortOn("b");
    printArray(array);

    trace("--- Test sortOn('c') ---");
    array.sortOn("c");
    printArray(array);

    trace("--- Test sortOn(['a', 'b']) ---");
    array.sortOn(["a", "b"]);
    printArray(array);

    trace("--- Test sortOn(['b', 'c']) ---");
    array.sortOn(["b", "c"]);
    printArray(array);

    trace("--- Test sortOn(['d']) ---");
    array.sortOn(["d"]);
    printArray(array);

    trace("--- Test sortOn(['d'], Array.NUMERIC) ---");
    array.sortOn(["d"], Array.NUMERIC);
    printArray(array);

    trace("--- Test sortOn(['d'], Array.NUMERIC | Array.DESCENDING) ---");
    array.sortOn(["d"], Array.NUMERIC | Array.DESCENDING);
    printArray(array);

    trace("--- Test sortOn(['a', 'b', 'c', 'd'], [...]) ---");
    array.sortOn(["a", "b", "c", "d"], [
      Array.DESCENDING, Array.NUMERIC | Array.DESCENDING, Array.NUMERIC, Array.DESCENDING
    ]);
    printArray(array);
    trace("--- Test sortOn() return ---");
    printArray(array.sortOn(["a", "b", "c", "d"], [
      Array.DESCENDING, Array.NUMERIC | Array.DESCENDING, Array.NUMERIC, Array.DESCENDING
    ]));
  })();

  (function () {
    var array = [
      5, 1, "3", "31", "4", "2.1", 2
    ];
    trace("--- Test sort()");
    array.sort();
    array.forEach(function (x) { trace(x); });

    trace("--- Test sort(Array.DESCENDING)");
    array.sort(Array.DESCENDING);
    array.forEach(function (x) { trace(x); });

    trace("--- Test sort(Array.NUMERIC)");
    array.sort(Array.NUMERIC);
    array.forEach(function (x) { trace(x); });

    trace("--- Test sort(Array.NUMERIC)");
    array.sort(function (a, b) {
      return b - a;
    }, Array.DESCENDING);
    array.forEach(function (x) { trace(x); });

    trace("--- Test sort(Array.NUMERIC)");
    array.sort(Array.DESCENDING);
    array.forEach(function (x) { trace(x); });
    array.sort().forEach(function (x) { trace(x); });
  })();
}