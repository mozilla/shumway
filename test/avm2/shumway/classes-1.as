package {
  public class A {
    function A() {
      trace("Construct A");
    }
  }

  var a = new A();
  trace("-- SHOULD NOT CONSTRUCT AGAIN --");
  A(a);
  A(a);
  A(a);
  A(a);
  A(a);
  trace("-- DONE --");
}
