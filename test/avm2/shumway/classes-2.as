package {
  interface IX {
    function xoo();
    function xDefault(x : int = 32);
  }

  interface IY extends IX {
    function yoo();
  }

  interface IA {
    function collide();
  }


  class A implements IX {
    private var _ax = 0;
    private var _ay = 0;

    public function set ax(value) {
      this._ax = value;
    }
    public function get ax() {
      return this._ax;
    }

    public function set ay(value) {
      this._ay = value;
    }
    public function get ay() {
      return this._ay;
    }
    protected function aBar () {
      trace ("A::bar");
    }
    public function call_aBar () {
      aBar();
    }

    public function aCar () {
      trace ("A::car");
    }
    public function call_aCar () {
      aCar();
    }

    public function xoo() {
      trace ("A::xoo");
    }

    public function xDefault(x : int = 42) {
      trace ("A::xDefault " + x);
    }

    public function aFinal() {

    }
  }

  class B extends A implements IX, IY {
    public override function get ay() {
      return 7;
    }
    public function bFoo () {
      trace ("B::foo");
    }
    protected override function aBar () {
      trace ("B::bar");
    }
    public override function aCar () {
      trace ("B::car");
    }
    public function yoo() {
      trace ("B::yoo");
    }
    public override final function aFinal() {

    }
  }

  class C extends B implements IA {
    trace("Creating Class C");
    public var cy = 3;
    public var cx = 4;
    public override function bFoo () {
      trace ("C::foo");
    }
    protected override function aBar () {
      trace ("C::bar");
    }
    public override function aCar () {
      trace ("C::car");
    }

    public function collide() {
      trace ("IA::collide");
    }
  }

  class D extends C {
    private static var x : IA;
    private static const y : IA;
    private var a;
    private var b;
    private var c;
  }

  class E extends D {
    private var d;
    private var e;
    private var f;
  }

  (function () {
    ([A, B, C, D]).forEach(function (c) {
      trace(c);
      trace(c.prototype);
    });
  })();

  /*
  class D extends C {
    trace("Creating Class D");
    public static var d0 : D = new D();
    public static var d1 : D = new D();
    trace(d0.cy);
    trace(d1.cx);
  }


  */

//  (function () {
//    (new B()).bFoo();
//    (new C()).bFoo();
//    var a0 : C = new C();
//    for (var i = 0; i < 1000; i++) {
//      a0.ay = 1;
//      a0.ax += a0.ay;
//    }
//    trace("Done: " + a0.ax);
//  })();

  (function () {
    (new A()).call_aBar();
    (new B()).call_aBar();
  })();

  (function () {
    (new A()).call_aCar();
    (new B()).call_aCar();
  })();

  (function () {
    var a : IX = new A();
    var b : IY = new B();
    a.xoo();
    b.xoo();
    b.yoo();
  })();

  (function () {
    var a : IX = new A();
    a.xDefault();
    a.xDefault(123);
  })();

  trace("--- DONE ---");
}