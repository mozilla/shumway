function makeStub(container, className, shortName) {
  function ctor() {
    // Assumes that once AVM2 is initialized, it lives in the global variable avm2.
    if (!avm2) {
      throw new Error("AVM2 not initialized");
    }

    var c = avm2.systemDomain.getClass(className);
    assert(c.instance);
    container[shortName] = c.instance;
    // XXX: Patch our own prototype just in case someone saved a reference to
    // the function before it was patched. We still don't get identity though.
    ctor.prototype = c.instance.prototype;
    return c.createInstance(arguments);
  };

  container[shortName] = ctor;
}

// Make special stubs for errors, which shouldn't conflict with JavaScript
// error constructors.
var as3error = {};
["Error",
 "DefinitionError",
 "EvalError",
 "RangeError",
 "ReferenceError",
 "SecurityError",
 "SyntaxError",
 "TypeError",
 "URIError",
 "URIError",
 "VerifyError",
 "UninitializedError",
 "ArgumentError"].forEach(function (className) {
   makeStub(as3error, className, className);
 });

[].forEach(function (className) {
  var path = className.split(".");
  var container = this;
  for (var i = 0, j = path.length - 1; i < j; i++) {
    if (!container[path[i]]) {
      container[path[i]] = {};
    }
    container = container[path[i]];
  }

  makeStub(container, className, path[path.length - 1]);
});
