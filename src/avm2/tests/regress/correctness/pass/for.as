package {
  var k, v, i, list;

  trace("for k in array");
  for (k in [1, 2, 3]) {
    trace(k);
  }

  trace("for k in object");
  list = [];
  for (k in {a: 0, b: 1, c: 2}) {
    list.push(k);
  }
  list.sort();
  for (i = 0; i < list.length; i++) {
    trace(list[i]);
  }

  trace("for each v in array");
  for each (v in [1, 2, 3]) {
    trace(v);
  }

  trace("for each v in object");
  list = [];
  for each (v in {a: 0, b: 1, c: 2}) {
    list.push(v);
  }
  list.sort();
  for (i = 0; i < list.length; i++) {
    trace(list[i]);
  }

  trace("-- DONE --");
}
