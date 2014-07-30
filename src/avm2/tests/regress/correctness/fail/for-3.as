package {

  var a = [1, 2, 3];
  for (var k in a) {
    trace(k);
    a.length = 0;
  }

  trace("-- DONE --");
}