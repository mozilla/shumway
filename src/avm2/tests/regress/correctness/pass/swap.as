package {

  (function () {
    var a = [2, 3, 4, 5, 6, 7, 8];

    for (var i = 0; i < 5; i++) {
      var t = a[0];
      a[0] = a[1];
      a[1] = t;
    }

    trace(a[0]);
    trace(a[1]);
    trace(a[2]);
    trace(a[3]);
  }); // ();

  (function () {
    var perm = [3, 2, 1, 0];
    var k;
    while (!((k = perm[0]) == 0)) {
      var k2:int = (k + 1) >> 1;
      for (var i = 0; i < k2; i++) {
        var temp:int = perm[i];
        perm[i] = perm[k - i];
        perm[k - i] = temp;
      }
    }

    for (var i = 0; i < 4; i++) {
      trace(perm[i]);
    }
  })();

  trace("DONE");
}