package {
  public class A {
    static var a = 1;
    trace("Class A");
  }

  public class B extends A {
    static var b = 1;
    trace("Class B");
    trace(a);
    trace(b);
  }

  public class C extends B {
    static var c = 1;
    trace("Class C");
    trace(a);
    trace(b);
    trace(c);
  }

  trace(A.a);

  trace(B.a);
  trace(B.b);

  trace(C.a);
  trace(C.b);
  trace(C.c);

}
