package {
  import flash.utils.ByteArray;
  import flash.net.*;

  class Point {
    public var x = 32;
    public var y = 12;
  }

  function readBack(x) {
    var ba = new ByteArray();
    ba.writeObject(x);
    ba.position = 0;
    return ba.readObject();
  }

  (function () {
    var x = {a: 1, b: 2, c: 3};
    var y = readBack(x);
    trace(x.a, x.b, x.c);
    trace(y.a, y.b, y.c);
  })();

  (function () {
    var x = [1, 2, 3];
    var y = readBack(x);
    trace(x);
    trace(y);
  })();

  (function () {
    var x = new Point();
    var y = readBack(x);
    trace(x);
    trace(x.x, x.y);
    trace(y);
    trace(y.x, y.y);
  })();

  dynamic class DynamicPoint {
    public var x = 54;
    public var y = 33;
  }
  (function () {
    var x = new DynamicPoint();
    x.z = "Hello";
    var y = readBack(x);
    trace(x);
    trace(x.x, x.y, x.z);
    trace(y);
    trace(y.x, y.y, x.z);
  })();

  dynamic class DynamicPointWithPrivates {
    public var x = 54;
    public var y = 33;
    private var w = 33;
    protected var p = 11;
  }

  (function () {
    var x = new DynamicPointWithPrivates();
    x.z = "Hello";
    var y = readBack(x);
    trace(x);
    trace(x.x, x.y, x.z);
    trace(y);
    trace(y.x, y.y, x.z);
  })();

  trace('registerClassAlias("Point", Point)');
  flash.net.registerClassAlias("Point", Point);

  (function () {
    var x = new Point();
    var y = readBack(x);
    trace(x);
    trace(x.x, x.y);
    trace(y);
    trace(y.x, y.y);
  })();

  (function () {
    var x = [,,,,,,,,,,,,,,,,123], y = readBack(x); trace(x); trace(y);
    var x = [,1,,,3,,,4,,,5,,,6,,,7], y = readBack(x); trace(x); trace(y);
    var x = [];
    x.length = 32;
    x[5] = 2;
    x.length = 32;
    var y = readBack(x); trace(x); trace(y);
  })();

  (function () {
    var x = [];
    x.foo = "Hello";
    var y = readBack(x); trace(x); trace(y);
  })();

  (function () {
    var a = {x: 1};
    var x = {a: a, b: a};
    var y = readBack(x);
    trace(JSON.stringify(x.a)); trace(JSON.stringify(x.a));
    trace(JSON.stringify(x.b)); trace(JSON.stringify(x.b));
    trace(x.c);
    trace(JSON.stringify(x.c)); trace(JSON.stringify(x.c));
    trace(y.b.x);
    trace(y.a === y.b);
  })();

  (function () {
    trace(undefined);
    trace(typeof undefined);
    trace(JSON.stringify(undefined));
    trace(typeof JSON.stringify(undefined));
    trace(JSON.stringify({a: null, b: undefined}));
  })();
}
