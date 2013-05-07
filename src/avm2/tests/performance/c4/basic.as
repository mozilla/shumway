package {
  var last = new Date();

  function clockUnder(max, name) {
    var elapsed = new Date() - last;
    // Keep this disabled when committing this file.
    var elapsedSuffix = false ? " (" + elapsed + ")" : "";
    var nameSuffix = name ? ": " + name : "";
    if (elapsed > max) {
      trace("FAIL: > " + max + " ms" + elapsedSuffix + nameSuffix);
    } else {
      trace("PASS: < " + max + " ms" + elapsedSuffix + nameSuffix);
    }
    last = new Date();
  }

  var K = 1024;

  var JS_FAST = 200;
  var AS_FAST = JS_FAST * 5;
  var VERY_SLOW = 5000;

  (function () {
    var s = 0;
    var COUNT = 1 * K * K;
    for (var i = 0; i < COUNT; i++) {
      s = s + i;
      s = s + i;
      s = s + i;
      s = s + i;
      s = s + i;
      s = s + i;
      s = s + i;
      s = s + i;
      s = s + i;
      s = s + i;
      s = s + i;
      s = s + i;
      s = s + i;
    }
    trace(s);
  })();

  clockUnder(AS_FAST, "Adding Numbers");

  (function () {
    var s = "";
    var COUNT = 1 * K * K;
    for (var i = 0; i < COUNT; i++) {
      s = s + i;
    }
    trace(s.length);
  })();

  clockUnder(AS_FAST, "Adding Strings + Numbers");

  (function () {
    var s = 0;
    var COUNT = 1 * K;
    for (var i = 0; i < COUNT; i++) {
      var a = [];
      for (var j = 0; j < K; j++) {
        a.AS3::push(i);
      }
      s += a.length;
    }
    trace(s);
  })();

  clockUnder(AS_FAST, "Arrays AS3 Namespace Push");

  (function () {
    var s = 0;
    var COUNT = 1 * K;
    for (var i = 0; i < COUNT; i++) {
      var a = [];
      for (var j = 0; j < K; j++) {
        a.push(i);
      }
      s += a.length;
    }
    trace(s);
  })();

  clockUnder(AS_FAST, "Arrays AS3 Prototype Push");

  class C {
    function foo() {
      return 2;
    }
  }

  (function () {
    var s = 0;
    var COUNT = 1 * K * K;
    var c = new C();
    for (var i = 0; i < COUNT; i++) {
      s += c.foo();
    }
    trace(s);
  })();

  clockUnder(AS_FAST, "Class Method Call");

  (function () {
    var s = 0;
    var COUNT = 1 * K * K;
    var v : Vector.<C> = new Vector.<C>();
    v.push(new C());
    for (var i = 0; i < COUNT; i++) {
      s += v[0].foo();
    }
    trace(s);
  })();

  clockUnder(AS_FAST, "Class Method Call - Vector");

  (function () {
    var s = 0;
    var COUNT = 1 * K * K;
    var v : Vector.<C> = new Vector.<C>();
    var o = new C();
    for (var i = 0; i < COUNT; i++) {
      v[0] = o;
    }
  })();

  clockUnder(AS_FAST, "Set Vector");

  class A {
    static const staticConstant = 123;
    const instanceConstant = 234;

    static var staticVar = 345;
    var instanceVar = 456;

    static function staticFunction() {
      var s = 0;
      for (var i = 0; i < 10000000; i++) {
        s += staticConstant;
        s += staticVar;
      }
      clockUnder(5000, "Access Static Constant / Var");
      return s;
    }

    function instanceFunction() {
      var s = 0;
      for (var i = 0; i < 10000000; i++) {
        s += instanceConstant;
        s += instanceVar;
      }
      clockUnder(5000, "Access Instance Constant / Var");
      return s;
    }
  }

  class B extends A {
    static function staticFunctionB() {
      var s = 0;
      for (var i = 0; i < 10000000; i++) {
        s += staticConstant;
        s += staticVar;
      }
      clockUnder(5000, "Access Static Constant / Var");
      return s;
    }
    function instanceFunctionB() {
      var s = 0;
      for (var i = 0; i < 10000000; i++) {
        s += instanceConstant;
        s += instanceVar;
      }
      clockUnder(5000, "Access Instance Constant / Var");
      return s;
    }
  }

  A.staticFunction();
  (new A()).instanceFunction();

  B.staticFunctionB();
  (new B()).instanceFunctionB();

  (function () {
    var s = 0;
    for (var i = 0; i < 10000000; i++) {
      s += -Number.MAX_VALUE;
      s += Number.MAX_VALUE;
      s += Math.abs(i);
    }
    clockUnder(5000, "Math.abs()");
    return s;
  })();
}
