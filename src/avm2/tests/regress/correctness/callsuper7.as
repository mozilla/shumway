package {

  class ClassA
  {
    public function ClassA()
    {
      trace('A');
    }
    protected function foo() : void
    {
      trace('a');
    }
    protected function bar() : void
    {
      trace('b');
    }
  }

  class ClassC extends ClassA
  {
    public function ClassC()
    {
      trace('> C');
      super();

      foo();
      bar();
      trace('< C');
    }

    override protected function bar() : void {
      super.bar();
      trace('override b');
    }
  }

  class ClassE extends ClassC
  {
    public function ClassE()
    {
      trace('> E');
      super();
      foo();
      bar();
      trace('< E');
    }

    override protected function bar() : void {
      super.bar();
      trace('override b again');
    }
  }

  trace("--");
}
