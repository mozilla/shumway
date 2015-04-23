package {

  (function () {
    trace("--- Delete stuff that we're not allowed to. ---");
    ([Object, Function, Array, String, Boolean, Number, Date, RegExp, Error, EvalError, RangeError, SyntaxError, TypeError, URIError]).forEach(function (o) {
      trace("delete " + o + ".prototype " + delete o.prototype);
    });
  })();

  trace("-- DONE --");
}