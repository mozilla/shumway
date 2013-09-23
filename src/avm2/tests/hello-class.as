// Demo of the class and function compilation
// Use `avm.js -a -x -verifier hello-class.abc` to see compiled code

class HelloClass {
  public function foo() {
    trace('bar');
  }
}

var hc: HelloClass = new HelloClass();
hc.foo();

