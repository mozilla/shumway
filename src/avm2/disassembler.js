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

Traits.prototype.trace = function (writer) {
  traceArray(writer, "traits", this.traits);
};

ClassInfo.prototype.trace = function (writer) {
  writer.enter("class " + this + " {");
  this.traits.trace(writer);
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
  this.traits.trace(writer);
  writer.leave("}");
};

ScriptInfo.prototype.trace = function (writer) {
  writer.enter("script " + this + " {");
  this.traits.trace(writer);
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

  if (!this.code) {
    writer.leave("}");
    return;
  }

  var code = new AbcStream(this.code);

  this.traits.trace(writer);

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

var SourceTracer = (function (writer) {
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


  function traceTraits(traits, isStatic, inInterfaceNamespace) {
    traits.traits.forEach(function (trait) {
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
        traceMetadata(trait.metadata);
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
        traceMetadata(trait.metadata);
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
        traceMetadata(trait.metadata);
        traceClass(trait.classInfo);
        writer.leave("\n}");
        traceClassStub(trait);
      } else {
        notImplemented();
      }
    });
  }

  function traceClassStub(trait) {
    var ci = trait.classInfo;
    var ii = ci.instanceInfo;
    var name = ii.name.getName();
    var native = trait.metadata ? trait.metadata.native : null;
    if (!native) {
      return;
    }
    writer.enter("Shumway Stub {");
    writer.enter("natives." + native.cls + " = function " + native.cls + "(scope, instance, baseClass) {");
    writer.writeLn("// Signature: " + getSignature(ii.init));
    var initSignature = getSignature(ii.init, true);
    writer.writeLn("function " + name + "(" + initSignature + ") {");
    writer.writeLn("  instance.call(this" + (initSignature ? ", " + initSignature : "") + ")");
    writer.writeLn("};");
    writer.writeLn("var c = new Class(\"" + name + "\", " + name +
                   ", Class.passthroughCallable(" + name + "));");
    writer.writeLn("//");
    writer.writeLn("// WARNING! This sets:")
    writer.writeLn("//   " + name + ".prototype = " +
                   "Object.create(baseClass.instance.prototype)");
    writer.writeLn("//");
    writer.writeLn("// If you want to manage prototypes manually, do this instead:");
    writer.writeLn("//   c.baseClass = baseClass");
    writer.writeLn("//");
    writer.writeLn("c.extend(baseClass);");

    function traceTraits(traits, isStatic) {
      traits.traits.forEach(function (trait) {
        var traitName = trait.name.getName();
        if (trait.isMethod() || trait.isGetter() || trait.isSetter()) {
          var mi = trait.methodInfo;
          if (mi.isNative()) {
            var str = isStatic ? "s" : "m";
            if (mi.parameters.length) {
              var returnTypeStr = "";
              if (mi.returnType) {
                returnTypeStr = " -> " + mi.returnType.getName();
              }
              writer.writeLn("// Signature: " + getSignature(mi) + returnTypeStr);
            }
            var prop;
            if (trait.isGetter()) {
              prop = "[\"get " + traitName + "\"]";
            } else if (trait.isSetter()) {
              prop = "[\"set " + traitName + "\"]";
            } else {
              prop = "." + traitName;
            }
            str += prop + " = function " + traitName + "(" + getSignature(mi, true) + ")";
            writer.writeLn(str + " {");
            writer.writeLn("  notImplemented(\"" + name + "." + traitName + "\"); };");
            writer.writeLn("}");
          }
        }
      });
    }

    writer.writeLn("var m = " + name + ".prototype;");
    writer.writeLn("var s = {};");

    traceTraits(ci.traits, true);
    traceTraits(ii.traits);

    writer.writeLn("c.nativeMethods = m;");
    writer.writeLn("c.nativeStatics = s;");

    writer.writeLn("return c;");
    writer.leave("};");
    writer.leave("}");
  }

  function traceClass(ci) {
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
    traceTraits(ci.traits, true, interfaceNamespace);
    traceTraits(ii.traits, false, interfaceNamespace);
    writer.leave("}");
  }

  function traceMetadata(metadata) {
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

  return {
    traceMetadata: traceMetadata,
    traceTraits: traceTraits,
    traceClass: traceClass,
    traceClassStub: traceClassStub
  };
});

function traceSource(writer, abc) {
  var tracer = SourceTracer(writer);
  abc.scripts.forEach(function (script) {
    tracer.traceTraits(script.traits);
  });
}
