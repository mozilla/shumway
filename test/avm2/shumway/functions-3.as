package {

  (function () {
    trace("--- Object(x) ---");
    trace(Object(3));
    trace(Object(3) === Object(3));
    trace(Object(3) === 3);

    trace(new Object(4));
    trace(new Object(4) === new Object(4));
    trace(new Object(4) === Object(4));
    trace(new Object(4) === 4);
    trace(new Object(4) === 4);
  })();

  function foo(a, b = 5, c = 6) { return a; }
  function bar(a, b = 5, c = 6) { return b; }
  function car(a, b = 5, c = 6) { return c; }

  (function () {
    trace("--- Identity ---");
    trace(foo ==  foo);
    trace(foo === foo);
    trace(foo ==  bar);
    trace(foo === bar);
  })();

  (function () {
    trace("--- Call() ---");
    trace(foo(1));
    trace(foo(1, 2));
    trace(foo(1, 3, 4));

    trace(bar(1));
    trace(bar(1, 2));
    trace(bar(1, 2 , 3));

    trace(car(1));
    trace(car(1, 2));
    trace(car(1, 2, 3));
  })();

  (function () {
    trace("--- .call ---");
    trace(foo.call(this, 1, 2, 3));
    trace(foo.call(this, 1, 2, 3));
    trace(bar.call(this, 8, 2, 3));
    trace(car.call(this, 9, 2, 3));
  })();

  (function () {
    trace("--- .apply ---");
    trace(foo.apply(this, [1, 2, 3]));
    trace(bar.apply(this, [1, 2, 3]));
    trace(car.apply(this, [1, 2, 3]));
  })();

  function zar() {
    return this;
  }

  (function () {
    trace("--- .call(x) ---");
    trace(zar.call());
    trace(zar.call(0));
    trace(zar.call(1));
    trace(zar.call(true));
    trace(zar.call("Hello World"));
    trace(zar.call(null));
    trace(zar.call(undefined));
  })();

  (function () {
    trace("--- .call(new Object()) ---");
    trace(zar.call(new Object()));
  })();

  (function () {
    trace("--- .call(Object(x)) ---");
    trace(zar.call(Object(null)));
    trace(zar.call(Object(0)));
    trace(zar.call(Object(true)));
    trace(zar.call(Object(1)));
    trace(zar.call(Object("Hello World")));
    trace(zar.call(Object(null)));
    trace(zar.call(Object(undefined)));
  })();


  (function () {
    var classes = [Boolean, Number, String, int, uint];
    trace("--- " + classes + " ---");
    var values = [0, 1, -1, null, undefined, "Hello", 1.4];
    trace("Values: " + values);
    trace("Values Length: " + values.length);
    for (var j = 0; j < values.length; j++) {
      trace(values[j]);
    }
    for (var i = 0; i < classes.length; i++) {
      var c = classes[i];
      trace(i);
      trace(c);
      for (var j = 0; j < values.length; j++) {
        var v = values[j];
        trace(c + "(" + v + ") " + c(v));
        trace("new " + c + "(" + v + ") " + new c(v));
      }
    }
  })();

  (function () {
    var classes = [Object];
    trace("--- " + classes + " ---");
    var values = [0, 1, -1, null, undefined, "Hello", 1.4, [], {}];
    for (var j = 0; j < values.length; j++) {
      var v = values[j];
      trace(Object + "(" + v + ") " + Object(v));
      trace("new " + Object + "(" + v + ") " + new Object(v));
      trace(Object(v) == v);
      trace(Object(v) === v);
      trace(new Object(v) == v);
      trace(new Object(v) === v);
    }
  })();

  trace("-- DONE --");
}