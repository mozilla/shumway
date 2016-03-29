package XYZ {

  class X { }
  class Y extends X { }

  interface IA { }
  interface IB extends IA { }
  interface IC extends IB { }

  class CA implements IA {

  }

  class CB0 implements IB {

  }

  class CB1 extends CA implements IB {

  }

  class CC0 extends CB1 {

  }

  trace((new Y().toString()) + " is " + X.toString() + ": " + ((new Y()) is X));

  trace(int.toString());
  trace(0 is int);
  trace(1.23 is int);

  trace("Object is Class: " + (Object is Class));
  trace("Class is Class: " + (Class is Class));
  trace("{} is Class: " + ({} is Class));

  (function () {
    trace("-- Class is Class --");
    var A = [Object, Class, String, Array, Boolean, int, uint, Number, X, Y];
    for (var i = 0; i < A.length; i++) {
      for (var j = 0; j < A.length; j++) {
        trace(A[i].toString() + " is " + A[j].toString() + ": " + (A[i] is A[j]));
      }
    }
  })();

  (function () {
    trace("-- Instance is Class --")
    var A = [Object, Class, String, Array, Boolean, int, uint, Number, X, Y];
    var B = ([Object, String, Array, Boolean, int, uint, Number, X, Y]).map(function (C) { return new C(); });
    trace((new Boolean()));
    trace((new Boolean()).toString());
    for (var i = 0; i < B.length; i++) {
      for (var j = 0; j < A.length; j++) {
        trace((typeof B[i]) + ": " + B[i].toString() + " is " + A[j].toString() + ": " + (B[i] is A[j]));
      }
    }
  })();

  (function () {
    trace("-- Instance is Class 2 --")
    var A = [int, uint, Number, String, Class];
    var B = [-0, 0, +Infinity, Infinity, NaN, 123.456, null, undefined, "123.456", "-123", "23"];
    for (var i = 0; i < B.length; i++) {
      for (var j = 0; j < A.length; j++) {
        trace((typeof B[i]) + ": " + B[i] + " is " + A[j].toString() + ": " + (B[i] is A[j]));
      }
    }
  })();

  (function () {
    trace("-- Boxing --")
    var A = [int, uint, Number, String];
    var B = [-0, 0, +Infinity, Infinity, NaN, 123.456, null, undefined, "123.456", "-123", "23"];
    for (var i = 0; i < B.length; i++) {
      for (var j = 0; j < A.length; j++) {
        trace(A[j].toString() + "(" + B[i] + ") === " + B[i] + ": " + (A[j](B[i]) === B[i]));
      }
    }
  })();

  (function () {
    trace("-- InstanceOf Class --")
    var A = [Object, Class, String, Array, Boolean, int, uint, Number, X, Y];
    var B = [new int(6), true, false, -0, 0, +Infinity, Infinity, NaN, 123.456, null, "123.456", "-123", "23"];
    for (var i = 0; i < B.length; i++) {
      for (var j = 0; j < A.length; j++) {
        trace((typeof B[i]) + ": " + B[i] + " instanceof " + A[j].toString() + ": " + (B[i] instanceof A[j]));
      }
    }
  })();

  (function () {
    trace("-- is / instanceOf Class & Interface --");
    var A = [CA, CB0, CB1, CC0, IA, IB];
    var B = [new CA(), new CB0(), new CB1(), new CC0()];
    for (var i = 0; i < B.length; i++) {
      for (var j = 0; j < A.length; j++) {
        trace(B[i].toString() + " is / instance of " + A[j].toString() + ": " + (B[i] is A[j]) + " / " + (B[i] instanceof A[j]));
      }
    }
  })();

  interface toString { } class CD implements toString { }
  interface valueOf extends toString { } class CE extends CD implements valueOf { }
  interface length extends valueOf { } class CF extends CE implements length { }

  (function () {
    trace("-- is / instanceOf Class & Interface --");
    var A = [CD, CE, CF, toString, valueOf, length];
    var B = [new CD(), new CE(), new CF()];
    for (var i = 0; i < B.length; i++) {
      for (var j = 0; j < A.length; j++) {
        trace(B[i].toString() + " is / instance of " + A[j].toString() + ": " + (B[i] is A[j]) + " / " + (B[i] instanceof A[j]));
      }
    }
  })();

  (function () {
    trace("IA instanceof Class: " + (IA instanceof Class));
    trace("IA is Class: " + (IA is Class));
    trace("IA is Function: " + (IA is Function));
    trace("IA: " + IA.toString());
  })();

  trace("-- Done --")
}
