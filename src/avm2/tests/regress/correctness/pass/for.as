package {
import flash.utils.ByteArray;

  (function () {
    var k, v, i, list;

    trace("for k in array");
    for (k in [1, 2, 3]) {
      trace(k);
    }

    trace("for k in object");
    list = [];
    for (k in {a: 0, b: 1, c: 2}) {
      list.push(k);
    }
    list.sort();
    for (i = 0; i < list.length; i++) {
      trace(list[i]);
    }

    trace("for each v in array");
    for each (v in [1, 2, 3]) {
      trace(v);
    }

    trace("for each v in object");
    list = [];
    for each (v in {a: 0, b: 1, c: 2}) {
      list.push(v);
    }
    list.sort();
    for (i = 0; i < list.length; i++) {
      trace(list[i]);
    }
  })();

  dynamic class A {
    public var a = 0;
  }

  dynamic class B extends A {
    public var b = 1;
  }

  dynamic class C extends B {
    public var c = 2;
  }

  (function () {
    trace("for in classes");
    var a = new A(); a.dynamicPropertyA = 5;
    var b = new B(); b.dynamicPropertyB = 6;
    var c = new C(); c.dynamicPropertyC = 7;
    for (k in a) { trace(k); }
    for (k in b) { trace(k); }
    for (k in c) { trace(k); }
  })();

  (function () {
    trace("for in class prototypes");
    A.prototype.prototypePropertyA = 3;
    B.prototype.prototypePropertyB = 4;
    C.prototype.prototypePropertyC = 5;
    var a = new A();
    var b = new B();
    var c = new C();
    trace("A"); for (k in a) { trace(k); }
    trace("B"); for (k in b) { trace(k); }
    trace("C"); for (k in c) { trace(k); }
  })();

  (function () {
    trace("for in class prototypes");
    A.prototype.prototypePropertyA = 3;
    B.prototype.prototypePropertyB = 4;
    C.prototype.prototypePropertyC = 5;
    var a = new A();
    var b = new B();
    var c = new C();
    trace("A"); for (k in a) { trace(k); }
    trace("B"); for (k in b) { trace(k); }
    trace("C"); for (k in c) { trace(k); }
  })();

  (function () {
    trace("-- Nested Enumeration --");
    var o = [5, 6, 7];
    for (var i in o) {
      for (var j in o) {
        for (var k in o) {
          trace(i + " " + j + " " + k);
        }
      }
    }
  })();

  (function () {
    trace("-- Nested Enumeration Prototype --");
    var a = new A();
    var b = new B();
    var c = new C();
    trace("A");
    for (x in c) {
      trace(x);
      for (y in b) {
        trace(y);
        for (z in a) {
          trace(z);
        }
      }
    }
  })();

  (function () {
    trace("--- Delete Array Element While Enumerating ---");
    var o = ["A", "B", "C", "D", "E", "F"];
    for (var k in o) {
      trace(k);
      delete o[2];
      delete o["4"];
    }
  })();

  (function () {
    trace("--- Byte Array ---");
    var a = new ByteArray();
    a.writeBoolean(true);
    a.writeBoolean(false);
    a.writeByte(12);
    a.writeShort(1234);
    a.writeInt(-123456);
    a.writeUnsignedInt(-123456);
    a.writeFloat(123.456);
    a.writeDouble(123.456);
    a.position = 0;
    trace("--- for in ---");
    for (var k in a) { trace(k); }
    trace("--- for each in ---");
    for each (var k in a) { trace(k); }
  })();

  (function () {
    trace("--- Vector String ---");
    var a = new Vector.<String>(5);
    trace("for in: " + a);
    for (var k in a) { trace(k); }
    trace("for each in: " + a);
    for each (var k in a) { trace(k); }
  })();

  (function () {
    trace("--- Vector Int ---");
    var a = new Vector.<int>(5);
    trace("for in: " + a);
    for (var k in a) { trace(k); }
    trace("for each in: " + a);
    for each (var k in a) { trace(k); }
  })();

  (function () {
    trace("--- Leftover Properties ---");
    var a = [1, 2, 3];
    for (var k in a) { trace (k); }
    for (var k in a) { trace (k); }
    trace(a.map(function (x) {
      return String(x);
    }).join(", "));
    trace(a.map(function (x) {
      return String(x);
    }).join(", "));
  })();

  trace("-- DONE --");
}
