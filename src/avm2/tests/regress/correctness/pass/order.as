package {
  class A {
    var x = 1;
    var y = 2;
    var z = 3;
  }
  (function () {
    trace("--- Test 1 ---");
    var o : A = new A();
    var r0 = o.x;
    o.x = 2;
    var r1 = o.x;
    o.x = 3;
    var r2 = o.x;
    o.x = 4;
    var r3 = o.x;
    o.x = 5;
    var r4 = o.x;
    o.x = 6;
    var r5 = o.x;
    o.x = 7;
    var r6 = o.x;
    o.x = 8;
    var r7 = o.x;
    o.x = 9;
    var r8 = o.x;

    trace(r0);
    trace(r1);
    trace(r2);
    trace(r3);
    trace(r4);
    trace(r5);
    trace(r6);
    trace(r7);
    trace(r8);

  })();

  (function () {
    trace("--- Test 2 ---");
    var o : A = new A();
    trace(o.x);
    o.x = 2;
    trace(o.x + o.x);
    o.x = 3;
    trace(o.x + o.x + o.x);
    o.x = 4;
    trace(o.x + o.x + o.x + o.x);
    o.x = 5;
    trace(o.x + o.x + o.x + o.x + o.x);
    o.x = 6;
    trace(o.x + o.x + o.x + o.x + o.x + o.x);
    o.x = 7;
    trace(o.x + o.x + o.x + o.x + o.x + o.x + o.x);
    o.x = 8;
    trace(o.x + o.x + o.x + o.x + o.x + o.x + o.x + o.x);
    o.x = 9;
    trace(o.x + o.x + o.x + o.x + o.x + o.x + o.x + o.x + o.x);
  })();
}