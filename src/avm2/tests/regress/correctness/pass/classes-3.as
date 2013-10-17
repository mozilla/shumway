package {
  public class A {
    public static var x = 32;
    function foo() {
      return 42;
    }
  }

  public class B {
    function bar() {
      trace(123);
      prototype.x = 123;
    }
  }

  (new B()).bar();
}
