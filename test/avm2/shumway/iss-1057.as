package {

  class A {
    public var t: Number;
    public var k: Number = 0;
  }

  class B extends A {
    public function test(v) {
      super.t = v;
    }
    public function test2(v) {
      super.t = super.t + v;
      super.k = super.k + "123";
    }
  }

  var b: B = new B();
  b.test(1);
  b.test2(2);
  b.test2(3);
  b.test2(4);
  b.test2(4);
  b.test2(4);

  trace(b.t);
  trace(b.k);
  trace(typeof b.k);
}