package method_closures_0 {
  public interface I {
    function foo();
  }

  public class A implements I {
    public function foo() {
      return 1;
    }
  }

  public class B implements I {
    public function foo() {
      return 2;
    }
  }

  public class M  {
    public var foo:I;

    public function M() {
      foo = new A();
      for (var i = 0; i < 30; i++) {
        trace(foo.foo());
      }
    }
  }

  new M();
}