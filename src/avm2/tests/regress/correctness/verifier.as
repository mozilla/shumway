package {
  trace("--");

  class A {
    static var sa : int = 1;
    public var pa : int;

    function A () {
      pa = 2;
      trace("IN A " + pa);
    }
  }

  class B extends A {
    static var sb : int = sa + 1;
    public var pb : int;

    function B () {
      pb = pa + 2;
      trace("IN B " + pb);
    }
  }

  class C extends B {
    static var sc : int = sb + 1;
    public var pc : int;

    function C () {
      pc = pb + 2;
      trace("IN C " + pb);
    }
  }

  trace(A.sa);
  trace(B.sb);
  trace(C.sc);

  function foo() {
    var f = 1;
    function boo() {
      var b = f + 1;
      function car() {
        var c = f + b + 1;
        function baz() {
          with (A) {
            with (B) {
              with (C) {
                var z = f + b + c + 1 + sa + sb + sc;
              }
            }
          }
          trace(z);
        }
        baz();
      }
      car();
    }
    boo();
  }

  foo();

  (function () {
    trace("With Scopes");
    with (A) {
      with (B) {
        with (C) {
          trace(sa + sb + sc);
        }
      }
    }
  })();

  (function () {
    trace("With Scopes - Dynamic");
    with ({sa: "Hello "}) {
      with (B) {
        with (C) {
          trace(sa + sb + sc);
        }
      }
    }
  })();

  (function () {
    var x = function (y) {
      if (y) {
        trace("ONCE");
        x();
      } else {
        trace("TWICE");
      }
    }
    x(true);
  })();

  (function () {
    trace("Instance Fields A");
    var a = new A();
    trace(a.pa);
    with (a) {
      trace(pa);
    }

    trace("Instance Fields B");
    var b = new B();
    trace(b.pa);
    trace(b.pb);
    with (b) {
      trace(pa);
      trace(pb);
    }

    trace("Instance Fields C");
    var c = new C();
    trace(c.pa);
    trace(c.pb);
    trace(c.pc);
    with (c) {
      trace(pa);
      trace(pb);
      trace(pc);
    }
  })();

  class D {
    function foo() {
      trace("D.foo");
    }
  }

  class E0 extends D {
    override function foo() {
      trace("E0.foo");
    }
  }

  class E1 extends D {
    override function foo() {
      trace("E1.foo");
    }
  }

  (function () {
    var X = E0;
    (new X()).foo();
  })();

  (function () {
    var x = new E0();
    var y = new E1();
    var z = null;
    if (x) {
      z = x;
    } else {
      z = y;
    }
    z.foo();
  })();

  (function (a:int, b:uint, c:Array,  d:Object,  e:String, f:Number,  g:Boolean, h:Function) {})(0, 1, [], {}, "", 1, true, function () {});

  (function () {
    function print(v) {
      trace(v + " " + typeof(v));
    }
    print(new int(-10));
    print(new uint(10));
    print(new Array(3));
    print(new Object());
    print(new String("xyz"));
    print(new Number(3.2));
    print(new Boolean(true));
    print(new Function());

    print(int);
    print(uint);
    print(Array);
    print(Object);
    print(String);
    print(Number);
    print(Boolean);
    print(Function);
  })();

  (function () {
    var a = [];
    a.push(1, 2, 3);
  })();

  (function () {
    trace(typeof new Array(0));
  })();

  (function () {
    var x;
    with (7) {
      trace(valueOf());
    }
  })();
}

function beforeX(x:X) {
  trace(x);
}
beforeX(new X());
trace("Before New Class");
class X {
  trace("Static Constructor of X");
  function X() {
    trace("Constructor of X");
  }
}
function afterX(x:X) {
  trace(x);
}
afterX(new X());
