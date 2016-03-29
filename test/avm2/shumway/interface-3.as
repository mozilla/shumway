package {
  interface Interface1 {
    function test();
  }

  public class Class1 implements Interface1 {
    public function Class1() {}

    public function test() {
      return "Class1";
    }
  }

  class Class2 extends Class1 {
    public function Class2() { }

    public override function test() {
      return "Class2 then " + super.test();
    }
  }

  var c1 = new Class1();
  var i1: Interface1 = Interface1(c1);

  trace(i1.test());

  var c2 = new Class2();
  var i2: Interface1 = Interface1(c2);

  trace(i2.test());
  trace(c2.test());

  (function () {
    var c1 = new Class1();
    var i1: Interface1 = Interface1(c1);

    trace(i1.test());

    var c2 = new Class2();
    var i2: Interface1 = Interface1(c2);

    trace(i2.test());
    trace(c2.test());

    trace("-- DONE --");
  })();
}