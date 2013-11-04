package {
  import avmplus.System;
  (function () {
    trace(Object);
    trace(Object.constructor);
    // trace(Object.constructor.prototype);
    trace(Array);
    trace(Array.constructor);
    // trace(Array.constructor.prototype);
  })();

  (function () {
    trace(System.swfVersion);
    trace(System.apiVersion);
    trace(System.getRunmode());
  })();


  trace("-- DONE --");
}