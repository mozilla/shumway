package {
  function foo() {
    var a : Vector.<int> = new Vector.<int>();
    a.AS3::push(10);
    a.AS3::push(20);
    a.AS3::push(30);
    trace(a);
    trace(a.AS3::indexOf(20));
    trace("---------");
  }
  foo();
}
