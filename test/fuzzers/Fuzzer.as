package  {
  import flash.utils.getDefinitionByName;
  import flash.utils.describeType;

  class Fuzzer {
    public static function createInstance(type: Class, a: Array) {
      switch (a.length) {
        case 0:  return new type();
        case 1:  return new type(a[0]);
        case 2:  return new type(a[0], a[1]);
        case 3:  return new type(a[0], a[1], a[2]);
        case 4:  return new type(a[0], a[1], a[2], a[3]);
        case 5:  return new type(a[0], a[1], a[2], a[3], a[4]);
        case 6:  return new type(a[0], a[1], a[2], a[3], a[4], a[5]);
        case 7:  return new type(a[0], a[1], a[2], a[3], a[4], a[5], a[6]);
        case 8:  return new type(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7]);
        case 9:  return new type(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8]);
        case 10: return new type(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9]);
        case 11: return new type(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9], a[10]);
        case 12: return new type(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9], a[10], a[11]);
        case 13: return new type(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9], a[10], a[11], a[12]);
        case 14: return new type(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9], a[10], a[11], a[12], a[13]);
        case 15: return new type(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[9], a[10], a[11], a[12], a[13], a[14]);
      }
    }

    public static function getRandomValue(type: Class) {
      switch (type) {
        case Number:
          return (Math.random() - 0.5) * 1024;
        case int:
          return ((Math.random() - 0.5) * 16) | 0;
        case uint:
          return (Math.random() * 16) | 0;
        case String:
          return "Hello";
        default:
          return null;
          // return new type();
      }
    }

    public static function getParameterTypes(xmlParameters, noOptionals = false) {
      var k = [];
      for each (var p in xmlParameters) {
        if (noOptionals && p.@optional) {
          return k;
        }
        var n = String(p.@type);
        k.push(n === "*" ? Object : getDefinitionByName(n));
      }
      return k;
    }

    public static function getLiteral(v) {
      if (v is int || v is uint || v is Number) {
        return v;
      } else if (v is String) {
        return "\"" + v + "\"";
      } else if (v instanceof Array) {
        return "[" + v + "]";
      }
      return String(v);
    }

    public static function getRandomParameterValues(parameterTypes) {
      return parameterTypes.map(function (item: *, index:int, array:Array) {
        return getRandomValue(item);
      });
    }

    public static function getConstructorParameterTypes(type: Class, noOptionals = false) {
      // trace(describeType(type));
      return getParameterTypes(describeType(type).factory.constructor.parameter, noOptionals);
    }

    public static function getClassName(type: Class) {
      var name = String(describeType(type).@name);
      return name.replace("::", ".");
    }
  }

//
//function generateRandomValue(type) {
//  type = String(type);
//  switch (type) {
//    case "Number":
//      return (Math.random() - 0.5) * 16;
//    case "int":
//      return ((Math.random() - 0.5) * 16) | 0;
//    case "uint":
//      return ((Math.random()) * 16) | 0;
//    case "string": case "String":
//    return "hello";
//    case "Boolean":
//      return !!(Math.random() < 0.5);
//    case "Array":
//      return [];
//    default:
//      return null;
//  }
//}
//
//function generateRandomParameterList(parameters, noOptionals = false) {
//  var k = [];
//  for each (var p in parameters) {
//    if (noOptionals && p.@optional) {
//      return k;
//    }
//    k.push(generateRandomValue(String(p.@type)));
//  }
//
//  return k;
//}
//
//function literal(v) {
//  if (v instanceof String) {
//    return "\"" + v + "\"";
//  } else if (v instanceof Array) {
//    return "[" + v + "]";
//  }
//  return String(v);
//}
//
//function joinArguments(arguments) {
//  return arguments.map(function (a) {
//    return literal(a);
//  }).join(", ");
//}
//
//function testClass(C) {
//  var X:XML = describeType(C);
//  // trace(X);
//  var name = String(X.@name);
//  name = name.replace("::", ".");
//  trace("unitTests.push(function testClass() {");
//
//  var arguments = generateRandomParameterList(X.factory.constructor.parameter);
//  trace("var o = new " + name + "(" + joinArguments(arguments) + ")");
//  var o = make(C, arguments);
//  testAccessors(X, o);
//
//  arguments = generateRandomParameterList(X.factory.constructor.parameter, true);
//  trace("var o = new " + name + "(" + joinArguments(arguments) + ")");
//  o = make(C, arguments);
//  testAccessors(X, o);
//  trace("});");
//}
//
//function getEQMethod(type) {
//  type = String(type);
//  switch(type) {
//    case "Number":
//      return "eqFloat";
//    case "Array":
//      return "eqArray";
//    default:
//      return "eq";
//  }
//}
//
//function testAccessors(X, o) {
//  for each (var n:XML in X.factory.accessor) {
//    if (n.@access != "readwrite") {
//      continue;
//    }
//    trace(getEQMethod(n.@type) + '(o.' + n.@name + ', ' + literal(o[n.@name]) + ")");
//  }
//}
//
//function generateTest(o) {
//  var typeXml:XML = describeType(o);
//
//  trace(typeXml);
//
//
//  /*
//   // Walk all the variables...
//   for each (var variable:XML in typeXml.factory.variable)
//   typeDict[variable.@name.toString()] = variable.@type.toString();
//
//   // And all the accessors...
//   for each (var accessor:XML in typeXml.factory.accessor)
//   {
//   // Ignore ones we can't write to.
//   if(accessor.@access == "readonly")
//   continue;
//
//   typeDict[accessor.@name.toString()] = accessor.@type.toString();
//   }
//   */
//}
//
//testClass(TextFormat);
///*
// testClass(BevelFilter);
// testClass(BlurFilter);
// testClass(ColorMatrixFilter);
// testClass(ConvolutionFilter);
// // testClass(DisplacementMapFilter);
// // testClass(DisplacementMapFilterMode);
// testClass(DropShadowFilter);
// testClass(GlowFilter);
// testClass(GradientBevelFilter);
// testClass(GradientGlowFilter);
// testClass(ShaderFilter);
// */
//
//// generateTest(BlurFilter);
}