package {
  (function () {
    trace("instanceof " + (Number(0) instanceof Number));
    trace("is " + (0 is Number));
    trace("as " + (0 as Number));
  })();

  (function (y, z : int) {
    var a : int = y;
    var b : int = z;
    trace(typeof a);
    trace(typeof b);
  })("123", "234");

  function coerceParameterToString(x : String) {
    return x;
  }

  function coerceParameterToNumber(x : Number) {
    return x;
  }

  (function (a) {
    trace(typeof coerceParameterToString(1));
    trace(typeof coerceParameterToString(true));
    trace(typeof coerceParameterToString("A"));

    trace(coerceParameterToString(1));
    trace(coerceParameterToString(true));
    trace(coerceParameterToString("A"));

    trace(typeof coerceParameterToNumber(1));
    trace(typeof coerceParameterToNumber(true));
    trace(typeof coerceParameterToNumber("A"));

    trace(coerceParameterToNumber(1));
    trace(coerceParameterToNumber(true));
    trace(coerceParameterToNumber("A"));
  })();

  function coerceReturnToString(x) : String {
    return x;
  }

  function coerceReturnToNumber(x) : Number {
    return x;
  }

  (function (a) {
    trace(typeof coerceReturnToString(1));
    trace(typeof coerceReturnToString(true));
    trace(typeof coerceReturnToString("A"));

    trace(coerceReturnToString(1));
    trace(coerceReturnToString(true));
    trace(coerceReturnToString("A"));

    trace(typeof coerceReturnToNumber(1));
    trace(typeof coerceReturnToNumber(true));
    trace(typeof coerceReturnToNumber("A"));

    trace(coerceReturnToNumber(1));
    trace(coerceReturnToNumber(true));
    trace(coerceReturnToNumber("A"));
  })();

  class A {

  }

  class AB extends A {

  }

  class B {

  }

  (function (a : A) {
    trace(a is A);
  })(new A());

  (function (a : A) {
    trace(a is A);
  })(new AB());

  trace("-- DONE ----------------");
}