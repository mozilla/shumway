package {
  class A {
    public function test(... rest) {
      trace('A' + rest[0]);
    }
  }

  class B extends A {
    public override function test(... rest) {
      trace('B');
      super.test.apply(this, rest);
    }
  }

  (function () {
    var b = new B();
    b.test(1);
  })();
}
