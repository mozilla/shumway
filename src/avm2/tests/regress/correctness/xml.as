print("Simple XML");
(function () {
  var x = <foo a="aaa"><bar b="bbb">e=mc^2</bar></foo>;
  x.@name = "x";
  x.@type = "T";
  var tests = [
    [x.name() == "foo", x.name()],
    [x.bar.name() == "bar", x.bar.name()],
    [x.@name == "x", x.@name],
    [x.@type == "T", x.@type],
    [x..bar == "e=mc^2", x..bar],
  ];
  for (var i = 0; i < tests.length; i++) {
    print(i + ": " + tests[i]);
  }
})();

