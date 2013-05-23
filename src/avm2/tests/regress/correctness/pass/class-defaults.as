package {
  class A {
		public var b : Boolean;
		public var i : int;
    public var n : Number;
    public var s : String;
		public var o : Object;
		public var u : *;
    public var a : A;
    public var v;
    public var v0 = 123;

    public static var sb : Boolean;
    public static var si : int;
    public static var sn : Number;
    public static var ss : String;
    public static var so : Object;
    public static var su : *;
    public static var sa : A;
    public static var sv;
    public static var sv0 = 123;
  }

  var a = new A();
  trace("-- Instance --");
  trace("bool: " + a.b);
  trace("int: " + a.i);
  trace("Number: " + a.n);
  trace("String: " + a.s);
  trace("Object: " + a.o);
  trace("*: " + a.u);
  trace("A: " + a.a);
  trace(": " + a.v);
  trace(": " + a.v0);

  trace("-- Static --");
  trace("bool: " + A.sb);
  trace("int: " + A.si);
  trace("Number: " + A.sn);
  trace("String: " + A.ss);
  trace("Object: " + A.so);
  trace("*: " + A.su);
  trace("A: " + A.sa);
  trace(": " + A.sv);
  trace(": " + A.sv0);
  trace("-- Done --");
}
