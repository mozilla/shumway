package {
  var k, v;

  trace("for k in array");
  for (k in [1, 2, 3]) {
    trace(k);
  }

  trace("for k in object");
  for (k in {a: 0, b: 1, c: 2}) {
    trace(k);
  }

  trace("for each v in array");
  for each (v in [1, 2, 3]) {
    trace(v);
  }

  trace("for each v in object");
  for each (v in {a: 0, b: 1, c: 2}) {
    trace(v);
  }

  trace("-- DONE --");
}