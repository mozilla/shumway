import flash.utils.Dictionary;

(function () {
  trace("--- Test 0 - Primitive Keys ---");
  var x = new Dictionary();
  x.a = "aa"; trace(x.a);
  x[0] = 1; trace(x[0]);
  x["123"] = 123; trace(x["123"]);
})();

(function () {
  trace("--- Test 1 - Object Keys ---");
  var x = new Dictionary();
  var a = {}, b = {};
  x[a] = "foo"; trace(x[a]);
  x[b] = "bar"; trace(x[b]);
})();

trace("--- DONE ---");