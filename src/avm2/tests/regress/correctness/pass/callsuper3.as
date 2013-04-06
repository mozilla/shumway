class ClassA
{
	public function get test(): String
	{
		return "A";
	}
}

class ClassB extends ClassA
{
}

class ClassC extends ClassB
{
	public override function get test() : String
	{
		return super.test + "C";
	}
}

var c = new ClassC();
trace(c.test);
