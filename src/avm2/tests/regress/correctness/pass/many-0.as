package {

  class A {
    var x : int;
  }

  A.prototype.y = 42;

  class B extends A {

  }

  B.prototype.z = 22;

  trace(new B().z);
}