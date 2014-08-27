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
    public var x:I;

    public function M() {
      x = new A();
      for (var i = 0; i < 10; i++) {
        trace((x.foo)());
        trace(x.foo());
      }
    }
  }

  new M();
}