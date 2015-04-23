package {

  interface IClassA
  {
    function foo() : void;
  }

  interface IClassB
  {
    function foo() : void;
  }

  class ClassA implements IClassA
  {
    public function foo() : void
    {
      trace('bar');
    }
  }

  trace("-- ClassA");
  var a: ClassA = new ClassA();
  a.foo();
  trace("-- IClassA()");
  IClassA(a).foo();
  trace("-- IClassA");
  var ai: IClassA = a;
  ai.foo();
  trace("-- as IClassA");
  (a as IClassA).foo();

  trace("-- IClassB()");
  var thrown;
  try {
    IClassB(a).foo();
    trace('FAIL');
  } catch (e: Error) { trace('OK'); }
  trace("-- as IClassB");
  var isNull = (a as IClassB) === null;
  trace(isNull);
  trace("-- DONE --");
}
