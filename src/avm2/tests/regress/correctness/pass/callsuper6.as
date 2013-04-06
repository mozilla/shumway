class A {
	public function get x(): int {
	  return 5;
	}
}
class B extends A {
	public override function get x(): int {
	  return super.x + 1;
	}
}
class C extends B {
	public override function get x(): int {
	  return super.x + 2;
	}
}

var a : A = new A();
trace(a.x);

var b : B = new B();
trace(b.x);

var c : C = new C();
trace(c.x);
