var disassemblerOptions = systemOptions.register(new OptionSet("Disassembler Options"));

var filter = disassemblerOptions.register(new Option("f", "filter", "string", "SpciMsm", "[S]ource, constant[p]ool, [c]lasses, [i]nstances, [M]etadata, [s]cripts, [m]ethods, multi[N]ames"));

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
  this.items.forEach(function (item) {
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
    default: assert (false); break;
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

MethodInfo.prototype.trace = function trace(writer, abc) {
  writer.enter("method" + (this.name ? " " + this.name : "") + " {");
  writer.writeLn("flags: " + getFlags(this.flags, "NEED_ARGUMENTS|NEED_ACTIVATION|NEED_REST|HAS_OPTIONAL||NATIVE|SET_DXN|HAS_PARAM_NAMES".split("|")));
  writer.writeLn("parameters: " + this.parameters.map(function (x) {
    return (x.type ? x.type.getQualifiedName() + "::" : "") + x.name;
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
            assert(false, "Opcode: " + opcode.name + " has undefined operands.");
          } else {
            if (opcode.operands.length > 0) {
              str += traceOperands(opcode, abc, code);
            }
            writer.writeLn(str);
          }
        } else {
          assert(false, "Opcode: " + bc + " is not implemented.");
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
          str += "=" + literal(x.value);
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
      const writer = this.writer;
      const tracer = this;

      traits.forEach(function (trait) {
        var str;
        var accessModifier = trait.name.getAccessModifier();
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

    traceClassStub: function traceClassStub(trait) {
      const writer = this.writer;

      var ci = trait.classInfo;
      var ii = ci.instanceInfo;
      var name = ii.name.getName();
      var native = trait.metadata ? trait.metadata.native : null;
      if (!native) {
        return false;
      }

      writer.writeLn("Cut and paste the following into `native.js' and edit accordingly");
      writer.writeLn("8< --------------------------------------------------------------");
      writer.enter("natives." + native.cls + " = function " + native.cls + "(runtime, scope, instance, baseClass) {");
      writer.writeLn("var c = new runtime.domain.system.Class(\"" + name + "\", instance, Domain.passthroughCallable(instance));");
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

    traceClass: function traceClass(ci) {
      const writer = this.writer;

      var ii = ci.instanceInfo;
      var name = ii.name;
      var str = name.getAccessModifier();
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
      const writer = this.writer;

      for (var key in metadata) {
        if (metadata.hasOwnProperty(key)) {
          if (key.indexOf("__") === 0) {
            continue;
          }
          writer.writeLn("[" + key + "(" + metadata[key].items.map(function (m) {
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
