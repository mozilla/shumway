import flash.utils.Dictionary;

(function () {
    trace('-- String key');
    var d:* = new Dictionary();
  d["test"] =  "4";
  trace("test" in d);
  trace("tests" in d);
})();

(function () {
    trace('-- Numeric key');
    var d:* = new Dictionary();
  d[1] =  "3";
  trace(1 in d);
  trace(0 in d);
})();

(function () {
    trace('-- Object key');
    var d:* = new Dictionary();
  var obj = {};
  d[obj] = 3.14;
  trace(obj in d);
  trace({} in d);
})();
