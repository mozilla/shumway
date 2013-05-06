package {
  var count = 100000;

  (function () {
    var p0 = 0;
    (function () {
      var p1 = 1;
      (function () {
        var p2 = 2;
        (function () {
          var p3 = 3;
          (function () {
            var p4 = 4;
            (function () {
              var p5 = 5;
              (function () {
                var p6 = 6;
                (function () {
                  var p7 = 7;
                  (function () {
                    var p8 = 8;
                    (function () {
                      var p9 = 9;
                      (function () {
                        var s = 0;
                        for (var i = 0; i < count; i++) {
                          s += p0 + p1 + p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;
                        }
                        trace(s);
                      })();
                    })();
                  })();
                })();
              })();
            })();
          })();
        })();
      })();
    })();
  })();
}
