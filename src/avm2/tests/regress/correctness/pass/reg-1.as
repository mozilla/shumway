(function () {
  trace("--- Test 0 ---");
  var s : String = "test";
  trace('null: ' + (s.match(null) === null));
  trace(s.match({toString: function() { return "e"; }}));
  trace(s.match("t"));
  trace(s.match(/(te?)/));
  trace(s.match(/(te?)/g));
})();

