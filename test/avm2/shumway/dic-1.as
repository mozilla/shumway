import flash.utils.Dictionary;
import flash.utils.Dictionary;

(function () {
  trace("--- Test 0 - Primitive Keys ---");
  var x = new Dictionary();
  for (var i = 0; i < 3; i++) {
    x[i] = i;
  }
  for (var k in x) {
    trace(k);
  }
})();

(function () {
  trace("--- Test 1 - Object Keys ---");
  var a = {};
  var b = {};
  var c = {};
  var x = new Dictionary();
  x[a] = 1;
  x[b] = 2;
  x[c] = 3;
  trace (x[a]);
  trace (x[b]);
  trace (x[c]);
})();

(function () {
  trace("--- Test 2 - Object Keys with toString ---");
  var a = {toString: function () { return "X"; }};
  var b = {toString: function () { return "X"; }};
  var c = {toString: function () { return "X"; }};
  var x = new Dictionary();
  x[a] = 1;
  x[b] = 2;
  x[c] = 3;
  trace (x[a]);
  trace (x[b]);
  trace (x[c]);
  trace (x["X"]);
})();

(function () {
  trace("--- Test 3 - Delete Object Keys ---");
  var a = {};
  var b = {};
  var c = {};
  var x = new Dictionary();
  x[a] = 1;
  x[b] = 2;
  x[c] = 3;
  trace (x[a]);
  trace (x[b]);
  trace (x[c]);
  trace (delete x[a]);
  trace (delete x[b]);
  trace (x[a]);
  trace (x[b]);
  trace (x[c]);
})();

trace("--- DONE ---");