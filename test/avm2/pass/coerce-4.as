package {
  class A extends Object {
    public function toString(): String {
      return "test";
    }
    public function valueOf(): Object {
      return 2;
    }
  }

  function test(): String {
    var a: * = new A();
    return a; // forcing to asCoerceString() to be called
  }

  (function () {
    var result = test();
    trace('type: ' + (typeof result));
    trace('result: ' + result);
  })();
}
