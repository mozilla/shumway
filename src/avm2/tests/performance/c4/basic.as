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
  var K_SMALLER = 256;
  var K_BIGGER = 128 * K;
  var K_BIG = 2 * 1024 * K;

  /**
   * Make sure all tests run at least twice as fast as this threshold to
   * account for slower machines and slowdowns in Tamarin.
   */
  var THRESHOLD = 500 * 5;

  (function () {
    var s = 0;
    var COUNT = 1 * K_BIGGER;
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
    return s;
  })();

  clockUnder(THRESHOLD, "Adding Numbers");

  (function () {
    var s = "";
    var COUNT = 1 * K_BIGGER;
    for (var i = 0; i < COUNT; i++) {
      s = s + i;
      s = s + i;
      s = s + i;
      s = s + i;
      s = s + i;
    }
    return s;
  })();

  clockUnder(THRESHOLD, "Adding Strings + Numbers");

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
    return s;
  })();

  clockUnder(THRESHOLD, "Arrays AS3 Namespace Push");

  (function () {
    var s = 0;
    var COUNT = 1 * K_SMALLER / 10;
    for (var i = 0; i < COUNT; i++) {
      var a = [];
      for (var j = 0; j < K; j++) {
        a.push(i);
      }
      s += a.length;
    }
    return s;
  })();

  clockUnder(THRESHOLD, "Arrays AS3 Prototype Push");

  class C {
    function foo() {
      return 2;
    }
  }

  (function () {
    var s = 0;
    var COUNT = 1 * K_BIG;
    var c = new C();
    for (var i = 0; i < COUNT; i++) {
      s += c.foo();
    }
    return s;
  })();

  clockUnder(THRESHOLD, "Class Method Call");

  (function () {
    var s = 0;
    var COUNT = 1 * K_BIG;
    var v : Vector.<C> = new Vector.<C>();
    v.push(new C());
    for (var i = 0; i < COUNT; i++) {
      s += v[0].foo();
    }
    return s;
  })();

  clockUnder(THRESHOLD, "Class Method Call - Vector");

  (function () {
    var s = 0;
    var COUNT = 1 * K_BIG;
    var v : Vector.<C> = new Vector.<C>();
    var o = new C();
    for (var i = 0; i < COUNT; i++) {
      v[0] = o;
    }
  })();

  clockUnder(THRESHOLD, "Set Vector");

  class A {
    static const staticConstant = 123;
    const instanceConstant = 234;

    static var staticVar = 345;
    var instanceVar = 456;

    static function staticFunction() {
      var s = 0;
      for (var i = 0; i < K_BIG; i++) {
        s += staticConstant;
        s += staticVar;
      }
      clockUnder(THRESHOLD, "Access Static Constant / Var");
      return s;
    }

    function instanceFunction() {
      var s = 0;
      for (var i = 0; i < K_BIG; i++) {
        s += instanceConstant;
        s += instanceVar;
      }
      clockUnder(THRESHOLD, "Access Instance Constant / Var");
      return s;
    }
  }

  class B extends A {
    static function staticFunctionB() {
      var s = 0;
      for (var i = 0; i < K_BIG; i++) {
        s += staticConstant;
        s += staticVar;
      }
      clockUnder(THRESHOLD, "Access Static Constant / Var");
      return s;
    }
    function instanceFunctionB() {
      var s = 0;
      for (var i = 0; i < K_BIG; i++) {
        s += instanceConstant;
        s += instanceVar;
      }
      clockUnder(THRESHOLD, "Access Instance Constant / Var");
      return s;
    }
  }

  A.staticFunction();
  (new A()).instanceFunction();

  B.staticFunctionB();
  (new B()).instanceFunctionB();

  (function () {
    var s = 0;
    for (var i = 0; i < K_BIGGER; i++) {
      s += -Number.MAX_VALUE;
      s += Number.MAX_VALUE;
      s += Math.abs(i);
    }
    clockUnder(THRESHOLD, "Math.abs()");
    return s;
  })();

  class D {
    var foobar = 0;
    var y = 0;
    function D(x, y) {
      this.foobar = x;
      this.y = y;
    }
  }

  (function () {
    var s = 0;
    for (var i = 0; i < K_BIGGER; i++) {
      s += (new D(2, 3)).foobar;
      s += (new D(2, 3)).y;
    }
    clockUnder(THRESHOLD, "Object allocation with property access");
    return s;
  })();

  dynamic class E {
    var e = 0;
    E.prototype.foo = function() {
      var e : E = this;
      e.vir = 123;
    };
    function bar() {
      return 1;
    }
  }

  (function () {
    var s = 0;
    var e = new E();
    for (var i = 0; i < 100; i++) {
      s += e.foo();
    }
    clockUnder(THRESHOLD, "Coerced this access.");
    return s;
  })();

  (function (e) {
    var s = 0;
    for (var i = 0; i < 10000; i++) {
      e.e += e.bar();
    }
    clockUnder(THRESHOLD, "ICs.");
    return s;
  })(new E());

  (function () {
    var a = [];
    for (var i = 0; i < 100000; i++) {
      a[i] = i;
      a[i] += a[i];
    }
    clockUnder(THRESHOLD, "Array Access.");
    return a.length;
  })();

}
