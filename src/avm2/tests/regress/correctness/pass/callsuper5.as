class ClassA
{
	public var s: String = "A";
 
	public function set test(value: String) : void
	{
		this.s = value;
	}
}

class ClassC extends ClassA
{
	public override function set test(value: String) : void
	{
		super.test = value;
	}
}

var c1 = new ClassC();
var c2 = new ClassC();
c1.test = "B";
trace(c1.s);
trace(c2.s);
