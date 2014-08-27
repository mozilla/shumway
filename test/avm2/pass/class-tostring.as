package {
  class A {
    public function testA(): String
    {
      return "testA";
    }

    public function testAB(): String
    {
      return "testAB";
    }
  }

  class B extends A {
    public function testB(): String
    {
      return "testB";
    }

    public override function testAB(): String
    {
      return "testAB";
    }

    public function toString() : String
    {
      return "toString";
    }
  }

  var b = new B();
  trace("testA: " + b.testA());
  trace("testB: " + b.testB());
  trace("testAB: " + b.testAB());
  trace("toString: " + b.toString());
  trace("toString2: " + b);
}
