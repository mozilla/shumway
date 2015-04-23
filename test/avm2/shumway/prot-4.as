package {
  class A {
    protected static var ps0;

    protected var p0;

    protected function f0() {}
    protected function f1() {}
    protected function f2() {}
    protected function f3() {}

    public function get length() {}
    public function set length(v) {}

    protected function get g0() {}
  }

  class B extends A {
    protected static var ps1;

    protected var p1;

    protected override function f0() {}
    protected override function f1() {}

    protected override function get g0() {}
    protected function set g0(v) {}
  }

  class C extends B {
    protected var p2;

    protected override function f2() {}
    protected override function f3() {}
  }

  class D extends C {
    protected var p3;

    protected override function f0() {}
    protected override function f1() {}
    protected override function f2() {}
    protected override function f3() {}

    protected override function get g0() {}
    protected override function set g0(v) {}
  }

//  class D extends C { }
//  class E extends D { }
//  class F extends E { }
//  class G extends F { }
//  class H extends G { }
//  class I extends H { }

  trace("--");
}