var filter = options.register(new Option("filter", "f", "SpciMsm", "[S]ource, constant[p]ool, [c]lasses, [i]nstances, [M]etadata, [s]cripts, [m]ethods"));

var IndentingWriter = (function () {
  function indentingWriter(suppressOutput, out) {
    this.tab = "  ";
    this.padding = "";
    this.suppressOutput = suppressOutput;
    this.out = out || console;
  }

  indentingWriter.prototype.writeLn = function writeLn(str) {
    if (!this.suppressOutput) {
      this.out.info(this.padding + str);
    }
  };

  indentingWriter.prototype.enter = function enter(str) {
    if (!this.suppressOutput) {
      this.out.info(this.padding + str);
    }
    this.indent();
  };

  indentingWriter.prototype.leave = function leave(str) {
    this.outdent();
    if (!this.suppressOutput) {
      this.out.info(this.padding + str);
    }
  };

  indentingWriter.prototype.indent = function indent() {
    this.padding += this.tab;
  };

  indentingWriter.prototype.outdent = function outdent() {
    if (this.padding.length > 0) {
      this.padding = this.padding.substring(0, this.padding.length - this.tab.length);
    }
  };

  indentingWriter.prototype.writeArray = function writeArray(arr, detailed) {
    detailed = detailed || false;
    for (var i = 0, j = arr.length; i < j; i++) {
      var prefix = "";
      if (detailed) {
        if (arr[i] === null) {
          prefix = "null";
        } else if (arr[i] === undefined) {
          prefix = "undefined";
        } else {
          prefix = arr[i].constructor.name;
        }
        prefix += " ";
      }
      this.writeLn(("" + i).padRight(' ', 4) + prefix + arr[i]);
    }
  };

  return indentingWriter;
})();

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

function traceSource(writer, abc) {
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

  function getSignature(method, excludeTypesAndDefaultValues) {
    return method.parameters.map(function (x) {
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

  abc.scripts.forEach(function (script) {
    traceTraits(script.traits);
    function traceTraits(traits, isStatic, isInterface) {
      traits.traits.forEach(function (trait) {
        var str;
        var accessModifier = trait.name.getAccessModifier();
        var namespaceName = trait.name.namespaces[0].originalURI;
        if (namespaceName) {
          if (namespaceName === "http://adobe.com/AS3/2006/builtin") {
            namespaceName = "AS3";
          }
          if (accessModifier === "public") {
            str = namespaceName;
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
          var method = trait.method;
          if (method.isNative()) {
            str += " native";
          }
          str += " function";
          str += trait.isGetter() ? " get" : (trait.isSetter() ? " set" : "");
          str += " " + trait.name.getName();
          str += "(" + getSignature(method) + ")";
          str += method.returnType ? ":" + method.returnType.getName() : "";
          if (method.isNative()) {
            writer.writeLn(str + ";");
          } else {
            if (isInterface) {
              writer.writeLn(str + ";");
            } else {
              writer.writeLn(str + " { notImplemented(\"" + trait.name.getName() + "\"); }");
            }
          }
        } else if (trait.isClass()) {
          var className = trait.class.instance.name;
          writer.enter("package " + className.namespaces[0].originalURI + " {");
          traceMetadata(trait.metadata);
          traceClass(trait.class);
          writer.leave("}");
          traceClassStub(trait);
        } else {
          notImplemented();
        }
      });
    }

    function traceClassStub(trait) {
      var cls = trait.class;
      var name = cls.instance.name;
      var native = trait.metadata ? trait.metadata.native : null;
      if (!native) {
        return;
      }
      writer.enter("Shumway Stub {");
      writer.enter("function " + native.cls + "(scope, instance) {");
      writer.writeLn("function " + name.getName() + "() {};");
      writer.writeLn("var c = new Class(\"" + name.getName() + "\", " +
                     name.getName() + ", C(" + name.getName() + "));");

      function traceTraits(traits, isStatic) {
        traits.traits.forEach(function (trait) {
          var traitName = trait.name.getName();
          if (trait.isMethod() || trait.isGetter() || trait.isSetter()) {
            var method = trait.method;
            if (method.isNative()) {
              var str = "";
              if (isStatic) {
                str += "s";
              }
              if (trait.isGetter()) {
                str += "g";
              } else if (trait.isSetter()) {
                str += "s";
              } else if (trait.isMethod()) {
                str += "m";
              }
              if (trait.method.parameters.length) {
                var returnTypeStr = "";
                if (trait.method.returnType) {
                  returnTypeStr = " -> " + trait.method.returnType.getName();
                }
                writer.writeLn("// Signature: " + getSignature(trait.method) + returnTypeStr);
              }
              str += "." + traitName + " = function " + traitName + "(" + getSignature(trait.method, true) + ")";
              writer.writeLn(str + " { notImplemented(); }");
            }
          }
        });
      }

      writer.writeLn("var m = instance.prototype, g = c.getters = {}, s = c.setters = {};");
      writer.writeLn("var sm = c.statics = {}, sg = c.staticGetters = {}, ss = c.staticSetters = {};");

      traceTraits(cls.traits, true);
      traceTraits(cls.instance.traits);

      writer.writeLn("return c;");
      writer.leave("}");
      writer.leave("}");
    }

    function traceClass(cls) {
      var name = cls.instance.name;
      var str = name.getAccessModifier();
      if (cls.instance.isFinal()) {
        str += " final";
      }
      if (!cls.instance.isSealed()) {
        str += " dynamic";
      }
      str += cls.instance.isInterface() ? " interface " : " class ";
      str += name.getName();
      if (cls.instance.superName) {
        str += " extends " + cls.instance.superName.getName();
      }
      if (cls.instance.interfaces.length) {
        str += " implements " + cls.instance.interfaces.map(function (x) {
          return x.getName();
        }).join(", ");
      }
      writer.enter(str + " {");
      if (!cls.instance.isInterface()) {
        writer.writeLn("public function " + name.getName() + "(" + getSignature(cls.instance.init) + ") {}");
      }
      traceTraits(cls.traits, true, cls.instance.isInterface());
      traceTraits(cls.instance.traits, false, cls.instance.isInterface());
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

  });
}
