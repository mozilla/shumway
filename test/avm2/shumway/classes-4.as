package {
  public class A {
    public static var x = 32;
    public native function get foo() : Boolean;
  }

  public class B extends A {
    public function get foo() : Boolean {
      trace ("B::foo()");
    }
  }

  (new A()).foo;
  (new B()).foo;
}
