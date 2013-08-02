package {
  var i = 0;
  var x = 42;
  function foo() {
    trace("foo: " + this.x);
  }
  foo();
  for (i = 0; i < 5; i++) {
    var fooMethodClosure = foo;
    fooMethodClosure();
  }
  function get bar() {
    trace("get bar " + this.x);
  }
  function set bar(v) {
    trace("set bar " + this.x);
  }
  (function () {
    for (var i = 0; i < 5; i++) {
      this.bar = this.bar;
    }
  })();

  function outer() {
    var x = 123;
    function inner() {
      var z = 234;
      trace(x);
      function innerMost() {
        trace(z);
      }
      innerMost();
    }
    inner();
  }
  outer();

  class A {
    static function foo() {
      trace("foo");
    }
    static function get bar() {
      trace("get bar");
    }
    static function set bar(v) {
      trace("set bar");
    }
  }

  (function () {
    for (i = 0; i < 10; i++) {
      A.foo();
      var a = A.foo;
      a();
      A.bar = A.bar;
    }
  })();

  class B {
    var x = 32;
    function foo() {
      trace("foo " + this.x);
    }
    function get bar() {
      trace("get bar");
    }
    function set bar(v) {
      trace("set bar");
    }
  }

  (function () {
    var b = new B();
    for (i = 0; i < 5; i++) {
      b.foo();
      var foo = b.foo;
      foo();
      b.bar = b.bar;
    }
  })();

  class C extends B {

  }

  (function () {
    var c = new C();
    for (i = 0; i < 5; i++) {
      c.foo();
      var foo = c.foo;
      foo();
      c.bar = c.bar;
    }
  })();

  (function () {
    try {
      throw 1;
    } catch (x : int) {
      trace("LAST: "+ x);
    }
  })();
}

