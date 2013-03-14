package {

  interface IClassA
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
  trace("--");
}
