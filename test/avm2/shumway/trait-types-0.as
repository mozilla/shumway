package {
  class A {
    var i : int;
    var u : uint;
    var n : Number;
    var b : Boolean;
    var c : A;
    var o : Object;
    var a : *;
  }

  class B {
  }

  (function () {
    var a = new A();
    a.i = 2.5; trace(a.i);
    a.i = "23.45"; trace(a.i);
    a.u = -10; trace(a.u);
    a.n = "0x123"; trace(a.n);
    a.b = "YEP"; trace(a.b);
    a.b = ""; trace(a.b);
    try {
      a.c = new B();
      trace(a.b);
    }
    catch(e) {
      trace('great success: ' + e.message.substr(0, 50));
    }
    a.o = true; trace(a.o);
    a.a = {}; trace(a.a);
  })();

  (function (a) {
    a.i = 2.5; trace(a.i);
    a.i = "23.45"; trace(a.i);
    a.u = -10; trace(a.u);
    a.n = "0x123"; trace(a.n);
    a.b = "YEP"; trace(a.b);
    a.b = ""; trace(a.b);
    try {
      a.c = new B();
      trace(a.b);
    }
    catch(e) {
      trace('great success: ' + e.message.substr(0, 50));
    }
    a.o = true; trace(a.o);
    a.a = {}; trace(a.a);
  })(new A());

  trace("-- DONE --");
}
