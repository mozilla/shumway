package {

  interface IA
  {
    function foo() : void;
  }

  interface IB
  {
    function bar() : void;
  }

  class A implements IA
  {
    public function foo() : void
    {
      trace('bar');
    }
  }

  class B extends A implements IB
  {
    public override function foo() : void
    {
      trace('bar');
    }

    public function bar() : void
    {
      trace('bar');
    }
  }

  var ia : IA = new B();

  ia.foo();

  trace("-- DONE --");
}
