package {
  public class A {
    static var a = 1;
  }

  public class B extends A {
    static var b = 2;
  }

  public class C extends B {
    static var c = 3;
    static function foo() {
      trace(a + b + c);
      new Array(Number(10));
    }
    function bar() {
      var d = 4;
      trace(a + b + c);
      foo();
      (function () {
        var c0 = 0;
        (function () {
          var c1 = 1;
          (function () {
            var c2 = 2;
            (function () {
              var c3 = 3;
              (function () {
                var c4 = 4;
                (function () {
                  var c5 = 5;
                  (function () {
                    var c6 = 6;
                    (function () {
                      var c7 = 7;
                      (function () {
                        var c8 = 8;
                        (function () {
                          var c9 = 9;
                          (function () {
                            trace(c0 + c1 + c2 + c3 + c4 + c5 + c6 + c7 + c8 + c9);
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
  }
}
