package Shumway {
  trace("HERE");
  class A {
    public function A() { 
      trace("Domain 1: A");
    }
  }

  new A();

  class B extends A {
    public function B() { 
      super();
      trace("Domain 1: B");
    }
  }

  new B();

  trace("DONE");
}