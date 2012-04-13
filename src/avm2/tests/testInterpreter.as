package {
  public interface IA {
    function foo();
  }

  public interface IB extends IA {
    function bar();
  }

  public interface IC extends IB {
    function car();
  }

  public interface ID extends IC {
    function fuz();
  }

  public class C implements ID {
    public function foo() {
      trace("C::foo");
    }
    public function bar() {
      trace("C::bar");
    }
    public function car() {
      trace("C::car");
    }
    public function fuz() {
      trace("C::fuz");
    }
  }

  var a:IA = new C();
  a.foo();

  var b:IB = new C();
  b.foo();
  b.bar();
}
