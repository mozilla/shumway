package avmplus {

public final class Fields {
    public function Fields() {
      return;
    }
    public static var A:String;
    public static var B:String;
    public static var C:String;
    public static var D:String;
    public static var E:String;
    public static var F:String;
    public static var G:String;
    public static var H:String;
    public static var I:String;
    public static var J:String;
    public static var K:String;
    public static var L:String;
    public static var M:String;
    public static var N:String;
    public static var O:String;
    public static var P:String;
    public static var Q:String;
}

  function registerMessages(arg1:Class):void
  {
    var type:XML;
    var messagesClass:Class;
    var variable:*;

    var loc1:*;
    variable = undefined;
    messagesClass = arg1;
    type = avmplus.describeType(messagesClass, FLASH10_FLAGS);
    var loc2:*=0;
    var loc5:*=0;
    var loc6:*=type;
    var loc4:*=new XMLList("");

    for each (var loc7:* in loc6..variable)
    {
      var loc8:*;
      with (loc8 = loc7)
      {
        if (@type == "String")
        {
          loc4[loc5++] = loc7;
        }
      }
    }
    var loc3:*=loc4;
    for each (variable in loc3)
    {
      if (messagesClass[variable.@name] != null)
      {
        continue;
      }
      messagesClass[variable.@name] = variable.@name;
    }
    return;
  }

  trace(Fields);
  registerMessages(Fields);

  trace(Fields.A);
  trace(Fields.Q);
}
