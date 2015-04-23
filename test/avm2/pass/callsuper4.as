class ClassA
{
	public var s: String = "A";
 
	public function get test(): String
	{
		return this.s;
	}
}

class ClassC extends ClassA
{
	public override function get test() : String
	{
		return super.test + "C";
	}
}

var c = new ClassC();
c.s = "B";
trace(c.test);
