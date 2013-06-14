/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2013 Mozilla Foundation
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

var disassemblerOptions = systemOptions.register(new OptionSet("Disassembler Options"));

var filter = disassemblerOptions.register(new Option("f", "filter", "string", "SpciMsmNtu", "[S]ource, constant[p]ool, [c]lasses, [i]nstances, [M]etadata, [s]cripts, [m]ethods, multi[N]ames, S[t]atistics, [u]tf"));

function traceArray(writer, name, array, abc) {
  if (array.length === 0) {
    return;
  }
  writer.enter(name + " {");
  array.forEach(function (a, idx) {
    a.trace(writer, abc);
  });
  writer.leave("}");
}

AbcFile.prototype.trace = function trace(writer) {
  if (filter.value.indexOf("p") >= 0) {
    this.constantPool.trace(writer);
  }
  if (filter.value.indexOf("N") >= 0) {
    this.constantPool.traceMultinamesOnly(writer);
  }
  if (filter.value.indexOf("c") >= 0) {
    traceArray(writer, "classes", this.classes);
  }
  if (filter.value.indexOf("i") >= 0) {
    traceArray(writer, "instances", this.instances);
  }
  if (filter.value.indexOf("M") >= 0) {
    traceArray(writer, "metadata", this.metadata);
  }
  if (filter.value.indexOf("s") >= 0) {
    traceArray(writer, "scripts", this.scripts);
  }
  if (filter.value.indexOf("m") >= 0) {
    traceArray(writer, "methods", this.methods, this);
  }
  if (filter.value.indexOf("S") >= 0) {
    traceSource(writer, this);
  }
  if (filter.value.indexOf("t") >= 0) {
    traceStatistics(writer, this);
  }
  if (filter.value.indexOf("u") >= 0) {
    print(JSON.stringify({
      strings: this.constantPool.strings,
      positionAfterUTFStrings: this.constantPool.positionAfterUTFStrings
    }, null, 2));
  }
};

ConstantPool.prototype.trace = function (writer) {
  writer.enter("constantPool {");
  for (var key in this) {
    /* Special-case namespaces to print out full names. */
    if (key === "namespaces") {
      writer.enter("namespaces {");
      this.namespaces.forEach(function (ns, i) {
        writer.writeLn(("" + i).padRight(' ', 3) +
                 (ns ? ns.toString() : "*"));
      });
      writer.leave("}");
    } else if (this[key] instanceof Array) {
      writer.enter(key + " " + this[key].length + " {");
      writer.writeArray(this[key]);
      writer.leave("}");
    }
  }
  writer.leave("}");
};

ConstantPool.prototype.traceMultinamesOnly = function (writer) {
  writer.writeArray(this.multinames, null, true);
};

ClassInfo.prototype.trace = function (writer) {
  writer.enter("class " + this + " {");
  traceArray(writer, "traits", this.traits);
  writer.leave("}");
};

MetaDataInfo.prototype.trace = function (writer) {
  writer.enter(this + " {");
  this.value.forEach(function (item) {
    writer.writeLn((item.key ? item.key + ": " : "") + "\"" + item.value + "\"");
  });
  writer.leave("}");
};

InstanceInfo.prototype.trace = function (writer) {
  writer.enter("instance " + this + " {");
  traceArray(writer, "traits", this.traits);
  writer.leave("}");
};

ScriptInfo.prototype.trace = function (writer) {
  writer.enter("script " + this + " {");
  traceArray(writer, "traits", this.traits);
  writer.leave("}");
};

Trait.prototype.trace = function (writer) {
  if (this.metadata) {
    for (var key in this.metadata) {
      if (this.metadata.hasOwnProperty(key)) {
        this.metadata[key].trace(writer);
      }
    }
  }
  writer.writeLn(this);
};

function traceAbc(writer, abc) {
  abc.trace(writer);
}

function traceOperand(operand, abc, code) {
  var value = 0;
  switch(operand.size) {
    case "s08": value = code.readS8(); break;
    case "u08": value = code.readU8(); break;
    case "s16": value = code.readS16(); break;
    case "s24": value = code.readS24(); break;
    case "u30": value = code.readU30(); break;
    case "u32": value = code.readU32(); break;
    default: release || assert(false); break;
  }
  var description = "";
  switch(operand.type) {
    case "": break;
    case "I": description = abc.constantPool.ints[value]; break;
    case "U": description = abc.constantPool.uints[value]; break;
    case "D": description = abc.constantPool.doubles[value]; break;
    case "S": description = abc.constantPool.strings[value]; break;
    case "N": description = abc.constantPool.namespaces[value]; break;
    case "CI": description = abc.classes[value]; break;
    case "M":
      return abc.constantPool.multinames[value];
    default: description = "?"; break;
  }
  return operand.name + ":" + value + (description === "" ? "" : " (" + description + ")");
}

function traceOperands(opcode, abc, code, rewind) {
  rewind = rewind || false;
  var old = code.position;
  var str = "";
  if (opcode.operands === null) {
    str = "null";
  } else {
    opcode.operands.forEach(function (op, i) {
      str += traceOperand(op, abc, code);
      if (i < opcode.operands.length - 1) {
        str += ", ";
      }
    });
  }
  if (rewind) {
    code.seek(old);
  }
  return str;
}

MethodInfo.prototype.trace = function trace(writer) {
  var abc = this.abc;
  writer.enter("method" + (this.name ? " " + this.name : "") + " {");
  writer.writeLn("flags: " + getFlags(this.flags, "NEED_ARGUMENTS|NEED_ACTIVATION|NEED_REST|HAS_OPTIONAL||NATIVE|SET_DXN|HAS_PARAM_NAMES".split("|")));
  writer.writeLn("parameters: " + this.parameters.map(function (x) {
    return (x.type ? Multiname.getQualifiedName(x.type) + "::" : "") + x.name;
  }));

  if (!this.code) {
    writer.leave("}");
    return;
  }

  var code = new AbcStream(this.code);

  traceArray(writer, "traits", this.traits);

  writer.enter("code {");
  while (code.remaining() > 0) {
    var bc = code.readU8();
    var opcode = opcodeTable[bc];
    var str, defaultOffset, offset, count;
    str = ("" + code.position).padRight(' ', 6);
    switch (bc) {
      case OP_lookupswitch:
        str += opcode.name + ": defaultOffset: " + code.readS24();
        var caseCount = code.readU30();
        str += ", caseCount: " + caseCount;
        for (var i = 0; i < caseCount + 1; i++) {
          str += " offset: " + code.readS24();
        }
        writer.writeLn(str);
        break;
      default:
        if (opcode) {
          str += opcode.name.padRight(' ', 20);
          if (!opcode.operands) {
            release || assert(false, "Opcode: " + opcode.name + " has undefined operands.");
          } else {
            if (opcode.operands.length > 0) {
              str += traceOperands(opcode, abc, code);
            }
            writer.writeLn(str);
          }
        } else {
          release || assert(false, "Opcode: " + bc + " is not implemented.");
        }
        break;
    }
  }
  writer.leave("}");
  writer.leave("}");
}

var SourceTracer = (function () {
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

  function getSignature(mi, excludeTypesAndDefaultValues) {
    return mi.parameters.map(function (x) {
      var str = x.name;
      if (!excludeTypesAndDefaultValues) {
        if (x.type) {
          str += ":" + x.type.getName();
        }
        if (x.value !== undefined) {
          str += " = " + literal(x.value);
        }
      }
      return str;
    }).join(", ");
  }

  function SourceTracer(writer) {
    this.writer = writer;
  }

  SourceTracer.prototype = {
    traceTraits: function traceTraits(traits, isStatic, inInterfaceNamespace) {
      var writer = this.writer;
      var tracer = this;

      traits.forEach(function (trait) {
        var str;
        var accessModifier = Multiname.getAccessModifier(trait.name);
        var namespaceName = trait.name.namespaces[0].originalURI;
        if (namespaceName) {
          if (namespaceName === "http://adobe.com/AS3/2006/builtin") {
            namespaceName = "AS3";
          }
          if (accessModifier === "public") {
            str = inInterfaceNamespace === namespaceName ? "" : namespaceName;
          } else {
            str = accessModifier;
          }
        } else {
          str = accessModifier;
        }
        if (isStatic) {
          str += " static";
        }
        if (trait.isSlot() || trait.isConst()) {
          tracer.traceMetadata(trait.metadata);
          if (trait.isConst()) {
            str += " const";
          } else {
            str += " var";
          }
          str += " " + trait.name.getName();
          if (trait.typeName) {
            str += ":" + trait.typeName.getName();
          }
          if (trait.value) {
            str += " = " + literal(trait.value);
          }
          writer.writeLn(str + ";");
        } else if (trait.isMethod() || trait.isGetter() || trait.isSetter()) {
          tracer.traceMetadata(trait.metadata);
          var mi = trait.methodInfo;
          if (trait.attributes & ATTR_Override) {
            str += " override";
          }
          if (mi.isNative()) {
            str += " native";
          }
          str += " function";
          str += trait.isGetter() ? " get" : (trait.isSetter() ? " set" : "");
          str += " " + trait.name.getName();
          str += "(" + getSignature(mi) + ")";
          str += mi.returnType ? ":" + mi.returnType.getName() : "";

          if (true) {
            var className;
            var prefix = "";
            if (trait.holder instanceof ClassInfo) {
              className = trait.holder.instanceInfo.name;
              if (className.namespaces[0].originalURI) {
                prefix += className.namespaces[0].originalURI + "::";
              }
              prefix += className.getName();
              prefix += "$/";
            } else if (trait.holder instanceof InstanceInfo) {
              className = trait.holder.name;
              if (className.namespaces[0].originalURI) {
                prefix += className.namespaces[0].originalURI + "::";
              }
              prefix += className.getName();
              prefix += "/";
            } else {
              prefix = "global/";
            }
            var getSet = trait.isGetter() ? "get " : (trait.isSetter() ? "set " : "");
            if (!mi.isNative()) {
              print("XXX: " + prefix + getSet + trait.name.getName() + " ()");
            }
          }

          if (mi.isNative()) {
            writer.writeLn(str + ";");
          } else {
            if (inInterfaceNamespace) {
              writer.writeLn(str + ";");
            } else {
              writer.writeLn(str + " { notImplemented(\"" + trait.name.getName() + "\"); }");
            }
          }
        } else if (trait.isClass()) {
          var className = trait.classInfo.instanceInfo.name;
          writer.enter("package " + className.namespaces[0].originalURI + " {\n");
          tracer.traceMetadata(trait.metadata);
          tracer.traceClass(trait.classInfo);
          writer.leave("\n}");
          tracer.traceClassStub(trait);
        } else {
          notImplemented();
        }
      });
    },

    traceClassStub2: function traceClassStub(trait) {
      var writer = this.writer;

      var ci = trait.classInfo;
      var ii = ci.instanceInfo;
      var name = ii.name.getName();
      var native = trait.metadata ? trait.metadata.native : null;
      if (!native) {
        return false;
      }

      writer.writeLn("Cut and paste the following into `native.js' and edit accordingly");
      writer.writeLn("8< --------------------------------------------------------------");
      writer.enter("natives." + native.cls + " = function " + native.cls + "(runtime, scope, instanceConstructor, baseClass) {");
      writer.writeLn("var c = new Class(\"" + name + "\", instanceConstructor, Domain.passthroughCallable(instanceConstructor));");
      writer.writeLn("c.extend(baseClass);\n");

      function traceTraits(traits, isStatic) {
        var nativeMethodTraits = [];

        traits.forEach(function (trait, i) {
          if (trait.isMethod() || trait.isGetter() || trait.isSetter()) {
            if (trait.methodInfo.isNative()) {
              nativeMethodTraits.push(trait);
            }
          }
        });

        nativeMethodTraits.forEach(function (trait, i) {
          var mi = trait.methodInfo;
          var traitName = trait.name.getName();
          writer.writeLn("// " + traitName + " :: " +
                         (mi.parameters.length ? getSignature(mi) : "void") + " -> " +
                         (mi.returnType ? mi.returnType.getName() : "any"));
          var prop;
          if (trait.isGetter()) {
            prop = "\"get " + traitName + "\"";
          } else if (trait.isSetter()) {
            prop = "\"set " + traitName + "\"";
          } else {
            prop = traitName;
          }

          writer.enter(prop + ": function " + traitName + "(" + getSignature(mi, true) + ") {");
          writer.writeLn("  notImplemented(\"" + name + "." + traitName + "\");");
          writer.leave("}" + (i === nativeMethodTraits.length - 1 ? "" : ",\n"));
        });
      }

      writer.enter("c.nativeStatics = {");
      traceTraits(ci.traits, true);
      writer.leave("};\n");
      writer.enter("c.nativeMethods = {");
      traceTraits(ii.traits);
      writer.leave("};\n");

      writer.writeLn("return c;");
      writer.leave("};");
      writer.writeLn("-------------------------------------------------------------- >8");

      return true;
    },

    traceClassStub: function traceClassStub(trait) {
      var writer = this.writer;

      var ci = trait.classInfo;
      var ii = ci.instanceInfo;
      var className = ii.name.getName();
      var native = trait.metadata ? trait.metadata.native : null;

      writer.writeLn("Cut and paste the following glue and edit accordingly.");
      writer.writeLn("Class " + ii);
      writer.writeLn("8< --------------------------------------------------------------");

      var originalURI = ii.name.namespaces[0].originalURI;

      writer.enter("var " + className + "Definition = (function () {");
      function maxTraitNameLength(traits) {
        var length = 0;
        traits.forEach(function (t) {
          length = Math.max(t.name.name.length, length);
        });
        return length;
      }


      function quote(s) {
        return '\'' + s + '\'';
      }

      function filterTraits(traits, isNative) {
        function isMethod(x) {
          return x.isMethod() || x.isGetter() || x.isSetter();
        }
        return {
          properties: traits.filter(function(trait) {
            return !isNative && !isMethod(trait);
          }),
          methods: traits.filter(function(trait) {
            return isMethod(trait) && (isNative === trait.methodInfo.isNative());
          })
        };
      }

      function writeTraits(traits, isNative, isStatic) {
        traits = filterTraits(traits, isNative);
        // var methods = traits.methods;

        var methods = [];
        var gettersAndSetters = createEmptyObject();

        traits.methods.forEach(function (trait, i) {
          var traitName = trait.name.getName();
          if (trait.isGetter() || trait.isSetter()) {
            if (!gettersAndSetters[traitName]) {
              gettersAndSetters[traitName] = [];
            }
            gettersAndSetters[traitName].push(trait);
          } else {
            methods.push(trait);
          }
        });

        function writeTrait(trait, writeComma) {
          var mi = trait.methodInfo;
          var traitName = trait.name.getName();
          var signature = "// (" +
            (mi.parameters.length ? getSignature(mi) : "void") + ") -> " +
            (mi.returnType ? mi.returnType.getName() : "any");
          var propertyName = traitName;
          if (trait.isGetter()) {
            propertyName = "get";
          } else if (trait.isSetter()) {
            propertyName = "set";
          }
          writer.enter(propertyName + ": function " + traitName + "(" + getSignature(mi, true) + ") { " + signature);
          writer.writeLn("notImplemented(\"" + className + "." + traitName + "\");");
          if (!isStatic) {
            if (trait.isGetter()) {
              writer.writeLn("return this._" + traitName + ";");
            } else if (trait.isSetter()) {
              writer.writeLn("this._" + traitName + " = " + mi.parameters[0].name + ";");
            }
          }
          writer.leave("}" + (writeComma ? "," : ""));
        }

        for (var i = 0; i < methods.length; i++) {
          writeTrait(methods[i], i < methods.length - 1);
        }

        var keyValues = toKeyValueArray(gettersAndSetters);
        for (var j = 0; j < keyValues.length; j++) {
          writer.enter(keyValues[j][0] + ": {");
          var list = keyValues[j][1];
          for (var i = 0; i < list.length; i++) {
            writeTrait(list[i], i < list.length - 1);
          }
          writer.leave("}" + (j < keyValues.length - 1 ? "," : ""));
        }

        traits.properties.forEach(function(trait, i) {
          var traitName = trait.name.getName();
          var last = i === traits.properties.length - 1;
          // writer.writeLn("// " + (trait.typeName ? trait.typeName + " " : "") + traitName + ": " + quote(Multiname.getQualifiedName(trait.name)) + (last ? "" : ","));
          if (trait.name.getNamespace().isPublic()) {
            writer.writeLn(traitName + ": " + quote("public " + trait.name.name) + (last ? "" : ","));
          }
        });
      }

      writer.enter("return {");
      writer.writeLn("// (" + getSignature(ii.init, false) + ")");
      writer.writeLn("__class__: \"" + originalURI + "." + className + "\",");
      writer.enter("initialize: function () {");
      writer.leave("},");
      writer.enter("__glue__: {");
      writer.enter("native: {");
        writer.enter("static: {");
        writeTraits(ci.traits, true, true);
        writer.leave("},");
        writer.enter("instance: {");
        writeTraits(ii.traits, true);
        writer.leave("}");
      writer.leave("},");
      writer.enter("script: {");
        writer.enter("static: {");
        writer.writeLn("// ...");
        // writeTraits(ci.traits, false, true);
        writer.leave("},");
        writer.enter("instance: {");
        writeTraits(ii.traits, false);
        // writer.writeLn("// ...");
        writer.leave("}");
      writer.leave("}");
      writer.leave("}");
      writer.leave("};");

      writer.leave("}).call(this);");
      writer.writeLn("-------------------------------------------------------------- >8");

      return true;
    },

    traceClass: function traceClass(ci) {
      var writer = this.writer;

      var ii = ci.instanceInfo;
      var name = ii.name;
      var str = Multiname.getAccessModifier(name);
      if (ii.isFinal()) {
        str += " final";
      }
      if (!ii.isSealed()) {
        str += " dynamic";
      }
      str += ii.isInterface() ? " interface " : " class ";
      str += name.getName();
      if (ii.superName && ii.superName.getName() !== "Object") {
        str += " extends " + ii.superName.getName();
      }
      if (ii.interfaces.length) {
        str += " implements " + ii.interfaces.map(function (x) {
          return x.getName();
        }).join(", ");
      }
      writer.enter(str + " {");
      if (!ii.isInterface()) {
        writer.writeLn("public function " + name.getName() + "(" + getSignature(ii.init) + ") {}");
      }
      var interfaceNamespace;
      if (ii.isInterface()) {
        interfaceNamespace = name.namespaces[0].originalURI + ":" + name.name;
      }
      this.traceTraits(ci.traits, true, interfaceNamespace);
      this.traceTraits(ii.traits, false, interfaceNamespace);
      writer.leave("}");
    },

    traceMetadata: function traceMetadata(metadata) {
      var writer = this.writer;

      for (var key in metadata) {
        if (metadata.hasOwnProperty(key)) {
          if (key.indexOf("__") === 0) {
            continue;
          }
          writer.writeLn("[" + key + "(" + metadata[key].value.map(function (m) {
            var str = m.key ? m.key + "=" : "";
            return str + "\"" + m.value + "\"";
          }).join(", ") + ")]");
        }
      }
    }
  };

  return SourceTracer;
})();

function traceSource(writer, abc) {
  var tracer = new SourceTracer(writer);
  abc.scripts.forEach(function (script) {
    tracer.traceTraits(script.traits);
  });
}

function traceStatistics(writer, abc) {

  /**
   * Keep track of classes / methods / properties defined in this ABC file. This is very
   * conservative, we only look at names and ignore all namespaces. Members that do not
   * appear in this ABC file are assumed to be in the library.
   */

  var libraryClassCounter = new metrics.Counter(true);
  var librarySuperClassCounter = new metrics.Counter(true);
  var libraryMethodCounter = new metrics.Counter(true);
  var libraryProperties = new metrics.Counter(true);

  var definedClasses = {};
  var definedMethods = {};
  var definedProperties = {};

  abc.classes.forEach(function (x) {
    var className = x.instanceInfo.name.name;
    definedClasses[className] = true;
  });

  abc.scripts.forEach(function (s) {
    s.traits.forEach(function (t) {
      if (t.isClass()) {
        var superClassName = t.classInfo.instanceInfo.superName ? t.classInfo.instanceInfo.superName.name : "?";
        if (!(superClassName in definedClasses)) {
          librarySuperClassCounter.count(superClassName);
        }
        t.classInfo.traits.forEach(function (st) {
          if (st.isMethod()) {
            definedMethods[st.name.name] = true;
          } else {
            definedProperties[st.name.name] = true;
          }
        });
        t.classInfo.instanceInfo.traits.forEach(function (it) {
          if (it.isMethod() && !(it.attributes & ATTR_Override)) {
            definedMethods[it.name.name] = true;
          } else {
            definedProperties[it.name.name] = true;
          }
        });
      }
    });
  });

  var opCounter = new metrics.Counter(true);

  abc.methods.forEach(function (m) {
    if (!m.code) {
      return;
    }

    function readOperand(operand) {
      var value = 0;
      switch(operand.size) {
        case "s08": value = code.readS8(); break;
        case "u08": value = code.readU8(); break;
        case "s16": value = code.readS16(); break;
        case "s24": value = code.readS24(); break;
        case "u30": value = code.readU30(); break;
        case "u32": value = code.readU32(); break;
        default: release || assert(false); break;
      }
      var description = "";
      switch(operand.type) {
        case "": break;
        case "I": description = abc.constantPool.ints[value]; break;
        case "U": description = abc.constantPool.uints[value]; break;
        case "D": description = abc.constantPool.doubles[value]; break;
        case "S": description = abc.constantPool.strings[value]; break;
        case "N": description = abc.constantPool.namespaces[value]; break;
        case "CI": description = abc.classes[value]; break;
        case "M": description = abc.constantPool.multinames[value]; break;
        default: description = "?"; break;
      }
      return description;
    }

    var code = new AbcStream(m.code);
    while (code.remaining() > 0) {
      var bc = code.readU8();
      var op = opcodeTable[bc];
      var operands = null;
      if (op) {
        opCounter.count(op.name);
        if (op.operands) {
          operands = op.operands.map(readOperand);
        }
        switch (bc) {
          case OP_call:
          case OP_callmethod:
            continue;
          case OP_callproperty:
          case OP_callproplex:
          case OP_callpropvoid:
          case OP_callstatic:
          case OP_callsuper:
          case OP_callsupervoid:
            if (operands[0] && !(operands[0].name in definedMethods)) {
              libraryMethodCounter.count(operands[0].name);
            }
            break;
          case OP_constructprop:
            if (operands[0] && !(operands[0].name in definedClasses)) {
              libraryClassCounter.count(operands[0].name);
            }
            break;
          case OP_getproperty:
          case OP_setproperty:
            if (operands[0] && !(operands[0].name in definedProperties)) {
              libraryProperties.count(operands[0].name);
            }
            break;
        }
      }
    }
  });
  writer.writeLn(JSON.stringify({
    definedClasses: definedClasses,
    definedMethods: definedMethods,
    definedProperties: definedProperties,
    libraryClasses: libraryClassCounter.counts,
    librarySuperClasses: librarySuperClassCounter.counts,
    libraryMethods: libraryMethodCounter.counts,
    libraryProperties: libraryProperties.counts,
    operations: opCounter.counts
  }, null, 2));
}
