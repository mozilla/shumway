import flash.utils.Dictionary;

(function () {
    trace('-- String key');
    var d:* = new Dictionary();
  d["test"] =  "4";

  for (var m in d) {
    trace(m);
    trace(d[m]);
  }
})();

(function () {
    trace('-- Numeric key');
    var d:* = new Dictionary();
  d[1] =  "3";

  for (var m in d) {
    trace(m);
    trace(d[m]);
  }
})();

(function () {
    trace('-- Object key');
    var d:* = new Dictionary();
  var obj = {};
  d[obj] = 3.14;

  for (var m in d) {
    trace(obj === m);
    trace(d[m]);
  }
})();
