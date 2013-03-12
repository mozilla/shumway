class ClassA
{
  public function ClassA()
  {
    trace('A');
  }
  protected function a() : void
  {
    trace('a');
  }
}

class ClassC extends ClassA
{
  public function ClassC()
  {
    super();
    trace('C');
    a();
  }
}

var c = new ClassC();

