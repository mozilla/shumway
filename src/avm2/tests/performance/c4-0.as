package {
  /*
  function test0() {
    var s = 0;
    for (var i : int = 0; i < 1000000; i++) {
      s += missingOne;
      s += missingOne;
      s += missingOne;
      s += missingOne;
      s += missingOne;
    }
    trace("test0: " + s);
  }

  function test1() {
    var s = 0;
    function closure() {
      s++;
    }
    for (var i = 0; i < 1000000; i++) {
      closure();
    }
  }
  */

  function test2() {
    var array:Vector.<int> = new Vector.<int>();
    var s = 0;
    for (var i = 0; i < 100; i++) {
      array[i] = "123";
      s += array[i];
    }
    trace("ALL: " + s);
  }

  class A {

  }

  function test3() {
    var array:Vector.<A> = new Vector.<A>();
    var a = new A();
    for (var i = 0; i < 1000000; i++) {
      array[i] = a;
      a = array[i];
    }
  }

  // test0();
  // test1();
  test2();
  // test3();
}