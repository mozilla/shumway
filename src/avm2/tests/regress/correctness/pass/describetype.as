package avmplus {
  public class A {
    public static var a:String , b: String, c: String;
    public static var abc:String , def: String, ghi: String;
    public var x=1, y=2, z=3;
  }
  var flags = FLASH10_FLAGS;
  print("describeType");
  (function () {
    var v0 = describeType(A, flags);
    var v1 = describeType(new A, flags);
    var tests = [
      [v0.name()],
      [v1.name()],
    ];
    for (var i = 0; i < tests.length; i++) {
      print(i + ": " + tests[i]);
    }
  })();
  print("describeType used by YouTube");
  (function () {
    var type:XML;
    var messagesClass:Class;
    var variable:*;

    var loc1:*;
    variable = undefined;
    messagesClass = A;
    type = describeType(messagesClass, flags);
    var loc2:*=0;
    var loc5:*=0;
    var loc6:*=type..variable;
    var loc4:*=new XMLList("");
    for each (var loc7:* in loc6) 
    {
      var loc8:*;
      with (loc7)
      {
        if (@type == "String") {
          loc4[loc4.length()] = loc7.@name;
        }
      }
    }
    var loc3:*=loc4;
    for each (variable in loc3) {
      if (messagesClass[variable]) {
          continue;
      }
      messagesClass[variable] = variable;
    }

    var tests = [
      [A.a],
      [A.b],
      [A.c],
      [A.abc],
      [A.def],
      [A.ghi],
    ];
    for (var i = 0; i < tests.length; i++) {
      print(i + ": " + tests[i]);
    }
  })();
}
