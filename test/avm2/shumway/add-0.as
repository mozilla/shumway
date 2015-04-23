package {
  var zero = 0;
  (function () {
    trace("--- Test 0 : Number + Number ---");
    trace(zero + 1);
  })();

  (function () {
    trace("--- Test 1 : Number + String --- ");
    trace(zero + "123");
  })();

  (function () {
    trace("--- Test 2 : Object + Object (toString) ---");
    trace(
      {toString: function() { return "A"; }} +
      {toString: function() { return "B"; }}
    );
  })();

  (function () {
    trace("--- Test 3 : Object + Object (valueOf) ---");
    trace(
      {valueOf: function() { return 2; }} +
      {valueOf: function() { return 3; }}
    );
  })();

  (function () {
    trace("--- Test 4 : Object + Object (toString, valueOf) ---");
    trace(
      {
        valueOf: function() { return "V"; },
        toString: function() { return "S"; }
      } + {
        valueOf: function() { return "V"; },
        toString: function() { return "S"; }
      }
    );
  })();

  (function () {
    trace("--- Test 5 : 1 + Object (toString, valueOf) ---");
    trace(
        1 + {
          valueOf: function() { return "V"; },
          toString: function() { return "S"; }
        }
    );
  })();

  (function () {
    trace("--- Test 6 : \"X\" + Object (toString, valueOf) ---");
    trace(
      "X" + {
        valueOf: function() { return "V"; },
        toString: function() { return "S"; }
      }
    );
  })();

  (function () {
    trace("--- Test 7 : Object + 1 (toString, valueOf) ---");
    trace(
      {
        valueOf: function() { return "V"; },
        toString: function() { return "S"; }
      } + 1
    );
  })();

  (function () {
    trace("--- Test 7 : Object + 1 (toString) ---");
    trace(
      {
        toString: function() { return "S"; }
      } + 1
    );
  })();
}
