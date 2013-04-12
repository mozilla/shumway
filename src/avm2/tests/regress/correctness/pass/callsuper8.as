package {

  interface I {
    function get x ();
  }

  class A implements I {
    public function get x () {
      return 1;
    }
  }

  class B extends A implements I {
    public function set x (v) {
      trace("set");
    }
  }

  class C extends B implements I {
    public override function get x () {
      return 1 + super.x;
    }
  }

  // Overriding a getter that is defined two levels up and which has a
  // setter in between.

  trace(new C().x);

  trace("--");
}
