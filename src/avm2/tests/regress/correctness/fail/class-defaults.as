package {
  class A {
		public var b : Boolean;
		public var i : int;
    public var s : String;
		public var o : Object;
		public var u : *;
  }

  var a = new A();
  trace("bool: " + a.b);
  trace("int: " + a.i);
  trace("String: " + a.s);
  trace("Object: " + a.o);
  trace("*: " + a.u);
}
