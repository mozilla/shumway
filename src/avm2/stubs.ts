/*
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module Shumway.AVM2 {
  import AbcFile = Shumway.AVM2.ABC.AbcFile;
  import ClassInfo = Shumway.AVM2.ABC.ClassInfo;
  import Parameter = Shumway.AVM2.ABC.Parameter;
  import IndentingWriter = Shumway.IndentingWriter;

  var writer = new IndentingWriter();

  var allClasses: ClassInfo [] = [];
  function findClassInfo(name: Multiname): ClassInfo {
    var qn = Multiname.getQualifiedName(name);
    for (var i = 0; i < allClasses.length; i++) {
      var classInfo = allClasses[i];
      if (Multiname.getQualifiedName(classInfo.instanceInfo.name) === qn) {
        return classInfo;
      }
    }
    return null;
  }

  var generatedFiles = [];

  export function generateStub(abc: AbcFile) {
    abc.classes.forEach(function (x) {
      allClasses.push(x);
    });
    writer.writeLn("///<reference path='references.ts' />");
    // writer.enter("module Shumway.AVM2.AS {");
    abc.classes.forEach(generateClassStubs);
    // writer.leave("}");

    // generatedFiles.sort();
    generatedFiles.forEach(function (file) {
      // writer.writeLn(file);
      writer.writeLn("///<reference path='" + file + "' />");
    });
    generatedFiles.forEach(function (file) {
      file = file.replace(/\.ts/g, ".js");
      writer.writeLn("<script src=\"../../src/flash.ts/" + file + "\"></script>");
    });
  }

  export function writeLicense() {
    writer.writeComment(
      "Copyright 2014 Mozilla Foundation\n" +
      "\n" +
      "Licensed under the Apache License, Version 2.0 (the \"License\");\n" +
      "you may not use this file except in compliance with the License.\n" +
      "You may obtain a copy of the License at\n" +
      "\n" +
      "http://www.apache.org/licenses/LICENSE-2.0\n" +
      "\n" +
      "Unless required by applicable law or agreed to in writing, software\n" +
      "distributed under the License is distributed on an \"AS IS\" BASIS,\n" +
      "WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n" +
      "See the License for the specific language governing permissions and\n" +
      "limitations under the License."
    );
  }

  var primitiveTypeMap = {
    int: "number",
    uint: "number",
    Number: "number",
    Boolean: "boolean",
    String: "string",
    Array: "any []",
    Vector: "ASVector",
    Object: "ASObject",
    Function: "ASFunction",
    Class: "ASClass",
    JSON: "ASJSON",
    Namespace: "ASNamespace",
    XML: "ASXML",
    XMLList: "ASXMLList",
    QName: "ASQName",
    Error: "ASError",
    DefinitionError: "ASDefinitionError",
    EvalError: "EvalError",
    RangeError: "RangeError",
    ReferenceError: "ReferenceError",
    SecurityError: "SecurityError",
    SyntaxError: "SyntaxError",
    TypeError: "TypeError",
    URIError: "URIError",
    VerifyError: "VerifyError",
    UninitializedError: "UninitializedError",
    ArgumentError: "ArgumentError",
    Date: "ASDate",
    Math: "ASMath"
  };

  function toType(name: Multiname): string {
    if (!name) {
      return "any";
    }
    var namespace = name.namespaces[0];
    var type = "";
    if (primitiveTypeMap[name.name]) {
      type = primitiveTypeMap[name.name];
      if (type === "ASVector") {
        if (name.typeParameter) {
          type = "ASVector<" + toType(name.typeParameter) + ">";
        } else {
          type = "ASVector<any>";
        }
      }
      if (name.name === "int" || name.name === "Int" ||
          name.name === "uint" || name.name === "Uint") {
        type += " /*" + name.name + "*/";
      }
    } else {
      if (!!namespace.uri) {
        type = namespace.uri + ".";
      }
      type += name.name;
    }
    return type;
  }

  function coerceParameter(p: Parameter) {
    if (p.type.name === "int" || p.type.name === "Int") {
      return p.name + " | 0";
    } else if (p.type.name === "uint" || p.type.name === "uint") {
      return p.name + " >>> 0";
    } else if (p.type.name === "boolean" || p.type.name === "Boolean") {
      return "!!" + p.name;
    } else if (p.type.name === "string" || p.type.name === "String") {
      return "\"\" + " + p.name;
    } else if (p.type.name === "number" || p.type.name === "Number") {
      return "+" + p.name;
    }
    return p.name;
  }

  function toLiteral(value) {
    if (value === undefined) {
      return "undefined";
    } else if (value === null) {
      return "null";
    } else if (typeof (value) === "string") {
      return "\"" + value + "\"";
    } else {
      return String(value);
    }
  }

  function toParameterList(parameters: Parameter []): string {
    return parameters.map(function (p) {
      if (p.optional) {
        return p.name + ": " + toType(p.type) + " = " + toLiteral(p.value);
      }
      return p.name + ": " + toType(p.type);
    }).join(", ");
  }

  function toSuperArgumentList(parameters: Parameter [], superParameters: Parameter []): string {
    return superParameters.map(function (p) {
//      if (p.value !== undefined) {
//        return p.name;
//      }
      return "undefined";
    }).join(", ");
  }

  function escapeTypeName(name) {
    switch (name) {
      case "Object":
        return "ASObject";
      case "Array":
    }
  }

  export function generateClassStubs(classInfo: ClassInfo) {
    var ci = classInfo;
    var ii = classInfo.instanceInfo;
    var className = ii.name;
    var namespace = className.namespaces[0];
    var needsModule = !!namespace.uri;
    if (namespace.uri.indexOf("flash.") !== 0) {
      return;
    }
    var ignore = [
      "flash.util.ByteArray",
      "flash.util.Dictionary",
      "flash.util.Proxy",
      "flash.net.ObjectEncoding",
      "flash.system.System",
      "flash.system.IME",
      "flash.system.SystemUpdater"
    ];

    for (var i = 0; i < ignore.length; i++) {
      if (namespace.uri.indexOf(ignore[i]) === 0) {
        return;
      }
    }
    var filePath = namespace.uri.substring("flash.".length).replace(/\./g, "/");
    filePath = filePath ? filePath + "/" + ii.name.name : ii.name.name;
    filePath += ".ts";
    generatedFiles.push(filePath);
    writer.writeLn("<<< ASCII " + filePath);
    writeLicense();
    writer.writeComment("Class: " + ii.name.name);
    needsModule && writer.enter("module Shumway.AVM2.AS." + namespace.uri + " {");
    writer.writeLn("import notImplemented = Shumway.Debug.notImplemented;");
    var superName = ii.superName;
    var extendsString = "";
    if (superName) {
      extendsString = " extends ";
      if (superName.name === "Object") {
        extendsString += "ASNative";
      } else {
        extendsString += toType(superName);
      }
      // extendsString += (superName.namespaces[0].uri ? superName.namespaces[0].uri + "." : "");
      // extendsString += superName.name;
    }
    if (ii.interfaces && ii.interfaces.length) {
      extendsString += ii.isInterface() ? " extends " : " implements ";
      extendsString += ii.interfaces.map(function (i) {
        if (i.name === "IDataInput" || i.name === "IDataOutput") {
          return "flash.utils." + i.name;
        }
        return i.name;
      }).join(", ");
    }
    if (ii.isInterface()) {
      writer.enter("export interface " + ii.name.name + extendsString + " {");
    } else {
      writer.enter("export class " + ii.name.name + extendsString + " {");
      if (ii.init) {
        var parameters = ii.init.parameters;
        writer.writeLn();
        writer.writeComment("Called whenever the class is initialized.");
        writer.writeLn("static classInitializer: any = null;");

        writer.writeLn();
        writer.writeComment("Called whenever an instance of the class is initialized.");
        writer.writeLn("static initializer: any = null;");

        writer.writeLn();
        writer.writeComment("List of static symbols to link.");
        writer.writeLn("static classSymbols: string [] = null; // [" + getBindingNames(ci.traits).map(x => "\"" + x.name + "\"").join(", ") + "];");

        writer.writeLn();
        writer.writeComment("List of instance symbols to link.");
        writer.writeLn("static bindings: string [] = null; // [" + getBindingNames(ii.traits).map(x => "\"" + x.name + "\"").join(", ") + "];");

        writer.writeLn();
        writer.enter("constructor (" + toParameterList(parameters) + ") {");
        if (parameters.length) {
          writer.writeLn(parameters.filter(p => !!p.type).map(
            p => p.name + " = " + coerceParameter(p) + ";"
          ).join(" "));
        }
        if (superName) {
          var superClassInfo = findClassInfo(superName);
          release || assert (superClassInfo, "Can't find: " + superName);
          var superParameters = superClassInfo.instanceInfo.init.parameters;
          writer.writeLn("false && super(" + toSuperArgumentList(parameters, superParameters) + ");");
          writer.writeLn("notImplemented(\"Dummy Constructor: " + className.namespaces[0] + "." + className.name + "\");");
        }
        writer.leave("}");
      }
    }

    function literal(value) {
      if (value === undefined) {
        return "undefined";
      } else if (value === null) {
        return "null";
      } else if (typeof (value) === "string") {
        return "\"" + value + "\"";
      } else {
        return String(value);
      }
    }

    function asBindings(traits, isClassTrait) {
      // Generate AS Bindings
      var skip = {};
      for (var i = 0; i < traits.length; i++) {
        var trait = traits[i];
        var name = trait.name.name;
        if (skip[name]) {
          continue;
        }
        var prefix = isClassTrait ? "static " : "";
        prefix += trait.name.name;
        if (trait.isMethodOrAccessor() && !trait.methodInfo.isNative()) {
          if (trait.isGetter()) {
            writer.writeLn(prefix + ": " + toType(trait.methodInfo.returnType) + ";");
            skip[name] = true;
          } else if (trait.isSetter()) {
            writer.writeLn(prefix + ": " + toType(trait.methodInfo.parameters[0].type) + ";");
            skip[name] = true;
          } else if (trait.isMethod()) {
            writer.writeLn(prefix + ": (" + toParameterList(trait.methodInfo.parameters) + ") => " + toType(trait.methodInfo.returnType) + ";");
          }
        } else if (trait.isSlot()) {
          writer.writeLn(prefix + ": " + toType(trait.typeName) + ";");
        } else if (trait.isConst()) {
          writer.writeLn(prefix + ": " + toType(trait.typeName) + " = " + literal(trait.value) + ";");
        }
      }
    }

    function jsBindings(traits, isClassTrait) {
      // Generate JS Bindings

      var skip = {};
      for (var i = 0; i < traits.length; i++) {
        var trait = traits[i];
        var name = trait.name.name;
        if (skip[name]) {
          continue;
        }
        var type = undefined;
        if (trait.isGetter()) {
          type = trait.methodInfo.returnType;
          skip[name] = true;
        } else if (trait.isSetter()) {
          type = trait.methodInfo.parameters[0].type;
          skip[name] = true;
        }
        if (type) {
          writer.writeLn("// " + (isClassTrait ? "static " : "") + "_" + name + ": " + toType(type) + ";");
        }
      }
      for (var i = 0; i < traits.length; i++) {
        var trait = traits[i];
        var name = trait.name.name;
        if (trait.isMethodOrAccessor() && trait.methodInfo.isNative()) {
          var methodParameters = trait.methodInfo.parameters;
          var prefix = isClassTrait ? "static " : "";
          if (trait.isMethod()) {
          } else if (trait.isGetter()) {
            prefix = "get ";
          } else if (trait.isSetter()) {
            prefix = "set ";
          }
          prefix += trait.name.name;
          if (!trait.isSetter()) {
            writer.enter(prefix + "(" + toParameterList(methodParameters) + "): " + toType(trait.methodInfo.returnType) + " {");
          } else {
            writer.enter(prefix + "(" + toParameterList(methodParameters) + ") {");
          }
          if (methodParameters.length) {
            writer.writeLn(methodParameters.filter(p => !!p.type).map(
              p => p.name + " = " + coerceParameter(p) + ";"
            ).join(" "));
          }
          writer.writeLn("notImplemented(\"" + className.namespaces[0] + "." + className.name + "::" + prefix + "\"); return;");
          if (trait.isSetter()) {
            writer.writeLn("// this._" + trait.name.name + " = " + methodParameters[0].name + ";");
          } else if (trait.isGetter()) {
            writer.writeLn("// return this._" + trait.name.name + ";");
          }
          writer.leave("}");
        }
      }
    }

    function getBindingNames(traits): Multiname [] {
      var names: Multiname [] = [];
      for (var i = 0; i < traits.length; i++) {
        var trait = traits[i];
        if (trait.isMethodOrAccessor() && !trait.methodInfo.isNative() || trait.isSlot()) {
          names.push(trait.name);
        }
      }
      return names;
    }

    writer.writeLn("");
    writer.writeComment("JS -> AS Bindings");
    asBindings(ci.traits, true);
    writer.writeLn("");
    asBindings(ii.traits, false);

    writer.writeLn("");
    writer.writeComment("AS -> JS Bindings");

    jsBindings(ci.traits, true);
    writer.writeLn("");
    jsBindings(ii.traits, false);

    writer.leave("}");
    needsModule && writer.leave("}");
    writer.writeLn(">>>");
  }

  export class Stub {

  }
}
