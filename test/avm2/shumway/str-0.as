package {
  var origBooleanCharCodeAt = Boolean.prototype.charCodeAt;
  Boolean.prototype.charCodeAt=String.prototype.charCodeAt;

  (function () {
    trace("--- Test ---");
    // trace((x = new Array(1,2,3), x.charCodeAt = String.prototype.charCodeAt, x.charCodeAt(0)));
    trace((x = new Boolean(true), x.charCodeAt(0)));
  })();
}

