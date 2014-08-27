package {
  class A {
    var i : int;
    var u : uint;
    var n : Number;
    var b : Boolean;
  }

  (function () {
    var a = new A();
    a.i = 2.5; trace(a.i);
    a.i = "23.45"; trace(a.i);
    a.u = -10; trace(a.u);
    a.n = "0x123"; trace(a.n);
    a.b = "YEP"; trace(a.b);
    a.b = ""; trace(a.b);
  })();

  (function (a) {
    a.i = 2.5; trace(a.i);
    a.i = "23.45"; trace(a.i);
    a.u = -10; trace(a.u);
    a.n = "0x123"; trace(a.n);
    a.b = "YEP"; trace(a.b);
    a.b = ""; trace(a.b)
  })(new A());

  trace("-- DONE --");
}