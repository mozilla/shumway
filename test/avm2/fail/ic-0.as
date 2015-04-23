package {

import flash.utils.Dictionary;

var o = {

  };
  namespace X;
  class A {
    function foo() {
      trace("public foo");
    }
    X function foo() {
      trace("public X::foo");
    }
  }

  (function () {
    o.x = 2;
    trace(o.x);
  })();

  (function () {
    var a = new A();
    trace(a.foo());
  })();

  (function () {
    var a = new Dictionary();
    a["foo"] = function foo() {
      trace("HERE");
    }
    trace(a.foo());
  })();

  trace("--- DONE ---");
}