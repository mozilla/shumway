package {
  var k;

  trace("-- 0 --");
  for (k in null) {
    trace("-- NEVER --");
  }

  trace("-- 1 --");
  for (k in undefined) {
    trace("-- NEVER --");
  }

  trace("-- 2 --");
  for (k in false) {
    trace("-- NEVER --");
  }

  trace("-- 3 --");
  for (k in 0) {
    trace("-- NEVER --");
  }

  trace("-- 4 --");
  for (k in true) {
    trace("-- NEVER --");
  }

  trace("-- 5 --");
  for (k in "hello") {
    trace(k);
  }

  trace("-- 6 --");
  for (k in ["a", "b", "c"]) {
    trace(k);
  }

  trace("-- 7 --");
  for (k in true) {
    trace(k);
  }

  trace("-- 8 --");
  for (k in 1234) {
    trace(k);
  }

  trace("-- 9 --");
  for each (k in "hello") {
    trace(k);
  }

  trace("-- DONE --");
}