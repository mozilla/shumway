package {
  (function () {
    var x0: XML = new XML("<test name='test1'/>");
    trace(x0.@name);
    trace(typeof x0.@name);
  })();

  trace("-- DONE --");
}