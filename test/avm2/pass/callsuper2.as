class ClassA
{
	public function test() : void
	{
		trace("A");
	}
}

class ClassB extends ClassA
{
}

class ClassC extends ClassB
{
	public override function test() : void
	{
		trace("C");
		super.test();
	}
}

var c = new ClassC();
c.test();
