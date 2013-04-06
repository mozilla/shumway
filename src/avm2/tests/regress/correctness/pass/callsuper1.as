class ClassA
{
	public function test() : void
	{
		trace("A");
	}
}

class ClassB extends ClassA
{
	public override function test() : void
	{
		trace("B");
		super.test();
	}
}

var b = new ClassB();
b.test();
