import flash.utils.Dictionary;

(function () {
  trace('-- String key');
  var d:* = new Dictionary();
  d["test"] =  "4";

  for (var m in d) {
    trace(m + " " + d[m]);
  }
})();

(function () {
  trace('-- Numeric key');
  var d:* = new Dictionary();
  d[1] =  "3";

  for (var m in d) {
    trace(m + " " + d[m]);
  }
})();

(function () {
  trace('-- Object key');
  var d:* = new Dictionary();
  var obj = {};
  d[obj] = 3.14;
  trace(obj in d);
  trace(d[obj]);
})();

(function () {
  trace('-- Function key');
  var d:* = new Dictionary();
  var fn0 = function () {};
  var fn1 = function () {};
  d[fn0] = 1.23;
  d[fn1] = 2.34;

  trace(fn0 in d);
  trace(fn1 in d);
  delete d[fn1];
  trace("After Delete: " + (fn1 in d));
  trace(0 in d);

})();

//(function () {
//  trace('-- Lots of Keys');
//  var d:* = new Dictionary();
//  for (var i = 0; i < 100; i++) {
//    d[i] = i;
//  }
//  var s = 0;
//  for (var m in d) {
//    s += m;
//  }
//  trace(s);
//})();
