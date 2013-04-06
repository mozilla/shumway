package avmplus {
  import flash.utils.describeType;


  var xml:XML = <type name="test"/>;
  // var x:XML = xml.copy();

  // xml.@name = "Hello";
  trace(xml.@name);

  class A {

  }

  // trace(describeType(A));
}