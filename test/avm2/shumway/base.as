package {
  import avmplus.System;

  (function () {
    ([Object, Array, Number, int, uint, String, Class]).forEach(function(c) {
      trace(c.constructor);
      trace(c.constructor.prototype);
    });
  })();

  (function () {
    ([Object, Array, Number, int, uint, String]).forEach(function(c) {
      var o = new c();
      trace(o.constructor);
      trace(o.constructor.prototype);
    });
  })();

  (function () {
    trace(System.swfVersion);
    trace(System.apiVersion);
    trace(System.getRunmode());
  })();


  trace("-- DONE --");
}