class A {
  static protected function get staticGetA() {
    return 10;
  }
  protected function get getA() {
    return 0;
  }
  protected function set setA(v) {
    trace ("setA " + v);
  }
  static protected function set staticSetA(v) {
    trace ("staticSetA " + v);
  }
}
class B extends A {
  static protected function get staticGetB() {
    return 11;
  }
  protected function get getB() {
    return 1;
  }
  protected function set setB(v) {
    trace ("setB " + v);
  }
  static protected function set staticSetB(v) {
    trace ("staticSetB " + v);
  }
}
class C extends B {
  static protected function get staticGetC() {
    return 12;
  }
  protected function get getC() {
    return 2;
  }
  protected function set setC(v) {
    trace ("setC " + v);
  }
  static protected function set staticSetC(v) {
    trace ("staticSetC " + v);
  }

  public function foo() {
    trace(getA + getB + getC);
    setA = "A";
    setB = "B";
    setC = "C";

    trace(staticGetA + staticGetB + staticGetC);
    staticSetA = "A";
    staticSetB = "B";
    staticSetC = "C";
  }
}

var c = new C();
c.foo();

trace("--");