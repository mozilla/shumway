package {

  dynamic class A {
    public var p0;
    public var p1;
  }

  var a = new A();

  a.d0 = 1;
  a.d2 = 3;
  a[0] = "A";
  a.d1 = 2;

  trace("-- Enumerate only Dynamic Properties  --");
  var list = [];
  for (var k in a) {
    list.push(k);
  }
  list = list.sort();
  trace(list);

  trace("-- DONE --");
}