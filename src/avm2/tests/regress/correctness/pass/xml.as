print("Testing Basic XML");
(function () {
  var x = <foo a="aaa"><bar b="bbb">e=mc^2</bar></foo>;
  x.cat = <cat c="ccc"/>;
  x.@name = "x";
  x.@type = "T";
  var tests = [
    [x.name() == "foo", x.name()],
    [x.bar.name() == "bar", x.bar.name()],
//    [x.@name == "x", x.@name],
    [x.@type == "T", x.@type],
    [x..bar == "e=mc^2", x..bar],
  ];
  for (var i = 0; i < tests.length; i++) {
    print(i + ": " + tests[i]);
  }
})();

print("Testing Any Name");
(function () {
  var x = <foo a="aaa"><bar b="bbb"/><cat c="ccc"/></foo>;
  var r1 = <><bar b="bbb"/><cat c="ccc"/></>;
  var tests = [
    [x.*.toXMLString() === r1.toXMLString(), x.*.toXMLString()],
    [x.@*.toString() === "aaa", x.@*.toString()],
    [x.*.@*.toString() === "bbbccc", x.*.@*.toString()],
  ];
  for (var i = 0; i < tests.length; i++) {
    print(i + ": " + tests[i]);
  }
})();

print("Testing attribute() and attributes() methods");
(function () {
  var x = <foo a="aaa"><bar b="bbb"/><cat c="ccc"/></foo>;
  var r1 = <><bar b="bbb"/><cat c="ccc"/></>;
  var tests = [
    [x.attribute("*"), x.attribute("*")],
    [x.attributes(), x.attributes()],
    [x.*.attribute("*"), x.*.attribute("*")],
    [x.*.attributes(), x.*.attributes()],
  ];
  for (var i = 0; i < tests.length; i++) {
    print(i + ": " + tests[i]);
  }
})();

