(function () {
  trace("--- Test match ---");
  var re = new RegExp("\\W*([A-Za-z0-9]+?)\\W", "g");
  var matches = "[test again]".match(re);
  trace(!!matches);
  trace(matches.length === 2);
  trace(matches[0] + '<');
  trace(matches[1] + '<');

  trace("--- Test search ---");
  trace("1 test ".search(re));
  trace(" ".search(re));
})();

