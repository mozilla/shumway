
print("Testing Basic XML");
(function () {
  var x = <foo a="aaa"><bar b="bbb">e=mc^2</bar></foo>;
  x.@name = "x";
  trace(x.name());
  trace(x.name().toString());
})();
