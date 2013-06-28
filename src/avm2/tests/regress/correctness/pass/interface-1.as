package {

  interface IA {
    function f0();
  }

  interface IB extends IA {
    function f1();
  }

  interface IC extends IB {
    function f2();
  }

  interface ID extends IC {
    function get g0();
    function set s0(v);
  }

  class X implements IA, IB, IC {
    public function f0() {}
    public function f1() {}
    public function f2() {}
  }

  class Y implements IC, ID {
    public function f0() {}
    public function f1() {}
    public function f2() {}

    public function get g0() {}
    public function set s0(v) {}
  }

  class Z extends Y implements IA, IB, IC, ID {
    public override function get g0() {}
    public override function set s0(v) {}
  }
  trace("-- DONE --");
}
