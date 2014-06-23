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

var CONSTANT_Undefined          = 0x00;
var CONSTANT_Utf8               = 0x01;
var CONSTANT_Float              = 0x02; // May be deprecated ??
var CONSTANT_Int                = 0x03;
var CONSTANT_UInt               = 0x04;
var CONSTANT_PrivateNs          = 0x05;
var CONSTANT_Double             = 0x06;
var CONSTANT_QName              = 0x07; // ns::name, const ns, const name
var CONSTANT_Namespace          = 0x08;
var CONSTANT_Multiname          = 0x09; // [ns...]::name, const [ns...], const name
var CONSTANT_False              = 0x0A;
var CONSTANT_True               = 0x0B;
var CONSTANT_Null               = 0x0C;
var CONSTANT_QNameA             = 0x0D; // @ns::name, const ns, const name
var CONSTANT_MultinameA         = 0x0E; // @[ns...]::name, const [ns...], const name
var CONSTANT_RTQName            = 0x0F; // ns::name, var ns, const name
var CONSTANT_RTQNameA           = 0x10; // @ns::name, var ns, const name
var CONSTANT_RTQNameL           = 0x11; // ns::[name], var ns, var name
var CONSTANT_RTQNameLA          = 0x12; // @ns::[name], var ns, var name
var CONSTANT_NameL              = 0x13; // o[name], var name
var CONSTANT_NameLA             = 0x14; // @[name], var name
var CONSTANT_NamespaceSet       = 0x15;
var CONSTANT_PackageNamespace   = 0x16; // namespace for a package
var CONSTANT_PackageInternalNs  = 0x17;
var CONSTANT_ProtectedNamespace = 0x18;
var CONSTANT_ExplicitNamespace  = 0x19;
var CONSTANT_StaticProtectedNs  = 0x1A;
var CONSTANT_MultinameL         = 0x1B;
var CONSTANT_MultinameLA        = 0x1C;
var CONSTANT_TypeName           = 0x1D;

var CONSTANT_ClassSealed        = 0x01;
var CONSTANT_ClassFinal         = 0x02;
var CONSTANT_ClassInterface     = 0x04;
var CONSTANT_ClassProtectedNs   = 0x08;

var TRAIT_Slot                  = 0;
var TRAIT_Method                = 1;
var TRAIT_Getter                = 2;
var TRAIT_Setter                = 3;
var TRAIT_Class                 = 4;
var TRAIT_Function              = 5;
var TRAIT_Const                 = 6;

var ATTR_Final                  = 0x01;
var ATTR_Override               = 0x02;
var ATTR_Metadata               = 0x04;

var SLOT_var                    = 0;
var SLOT_method                 = 1;
var SLOT_getter                 = 2;
var SLOT_setter                 = 3;
var SLOT_class                  = 4;
var SLOT_function               = 6;

var METHOD_Arguments            = 0x1;
var METHOD_Activation           = 0x2;
var METHOD_Needrest             = 0x4;
var METHOD_HasOptional          = 0x8;
var METHOD_IgnoreRest           = 0x10;
var METHOD_Native               = 0x20;
var METHOD_Setsdxns             = 0x40;
var METHOD_HasParamNames        = 0x80;

var OP_bkpt = 0x01;
var OP_nop = 0x02;
var OP_throw = 0x03;
var OP_getsuper = 0x04;
var OP_setsuper = 0x05;
var OP_dxns = 0x06;
var OP_dxnslate = 0x07;
var OP_kill = 0x08;
var OP_label = 0x09;
var OP_lf32x4 = 0x0A;
var OP_sf32x4 = 0x0B;
var OP_ifnlt = 0x0C;
var OP_ifnle = 0x0D;
var OP_ifngt = 0x0E;
var OP_ifnge = 0x0F;
var OP_jump = 0x10;
var OP_iftrue = 0x11;
var OP_iffalse = 0x12;
var OP_ifeq = 0x13;
var OP_ifne = 0x14;
var OP_iflt = 0x15;
var OP_ifle = 0x16;
var OP_ifgt = 0x17;
var OP_ifge = 0x18;
var OP_ifstricteq = 0x19;
var OP_ifstrictne = 0x1A;
var OP_lookupswitch = 0x1B;
var OP_pushwith = 0x1C;
var OP_popscope = 0x1D;
var OP_nextname = 0x1E;
var OP_hasnext = 0x1F;
var OP_pushnull = 0x20;
var OP_pushundefined = 0x21;
var OP_pushfloat = 0x22;
var OP_nextvalue = 0x23;
var OP_pushbyte = 0x24;
var OP_pushshort = 0x25;
var OP_pushtrue = 0x26;
var OP_pushfalse = 0x27;
var OP_pushnan = 0x28;
var OP_pop = 0x29;
var OP_dup = 0x2A;
var OP_swap = 0x2B;
var OP_pushstring = 0x2C;
var OP_pushint = 0x2D;
var OP_pushuint = 0x2E;
var OP_pushdouble = 0x2F;
var OP_pushscope = 0x30;
var OP_pushnamespace = 0x31;
var OP_hasnext2 = 0x32;
var OP_li8 = 0x35;
var OP_li16 = 0x36;
var OP_li32 = 0x37;
var OP_lf32 = 0x38;
var OP_lf64 = 0x39;
var OP_si8 = 0x3A;
var OP_si16 = 0x3B;
var OP_si32 = 0x3C;
var OP_sf32 = 0x3D;
var OP_sf64 = 0x3E;
var OP_newfunction = 0x40;
var OP_call = 0x41;
var OP_construct = 0x42;
var OP_callmethod = 0x43;
var OP_callstatic = 0x44;
var OP_callsuper = 0x45;
var OP_callproperty = 0x46;
var OP_returnvoid = 0x47;
var OP_returnvalue = 0x48;
var OP_constructsuper = 0x49;
var OP_constructprop = 0x4A;
var OP_callsuperid = 0x4B;
var OP_callproplex = 0x4C;
var OP_callinterface = 0x4D;
var OP_callsupervoid = 0x4E;
var OP_callpropvoid = 0x4F;
var OP_sxi1 = 0x50;
var OP_sxi8 = 0x51;
var OP_sxi16 = 0x52;
var OP_applytype = 0x53;
var OP_pushfloat4 = 0x54;
var OP_newobject = 0x55;
var OP_newarray = 0x56;
var OP_newactivation = 0x57;
var OP_newclass = 0x58;
var OP_getdescendants = 0x59;
var OP_newcatch = 0x5A;
var OP_findpropstrict = 0x5D;
var OP_findproperty = 0x5E;
var OP_finddef = 0x5F;
var OP_getlex = 0x60;
var OP_setproperty = 0x61;
var OP_getlocal = 0x62;
var OP_setlocal = 0x63;
var OP_getglobalscope = 0x64;
var OP_getscopeobject = 0x65;
var OP_getproperty = 0x66;
var OP_getouterscope = 0x67;
var OP_initproperty = 0x68;
var OP_setpropertylate = 0x69;
var OP_deleteproperty = 0x6A;
var OP_deletepropertylate = 0x6B;
var OP_getslot = 0x6C;
var OP_setslot = 0x6D;
var OP_getglobalslot = 0x6E;
var OP_setglobalslot = 0x6F;
var OP_convert_s = 0x70;
var OP_esc_xelem = 0x71;
var OP_esc_xattr = 0x72;
var OP_convert_i = 0x73;
var OP_convert_u = 0x74;
var OP_convert_d = 0x75;
var OP_convert_b = 0x76;
var OP_convert_o = 0x77;
var OP_checkfilter = 0x78;
var OP_convert_f = 0x79;
var OP_unplus = 0x7a;
var OP_convert_f4 = 0x7b;
var OP_coerce = 0x80;
var OP_coerce_b = 0x81;
var OP_coerce_a = 0x82;
var OP_coerce_i = 0x83;
var OP_coerce_d = 0x84;
var OP_coerce_s = 0x85;
var OP_astype = 0x86;
var OP_astypelate = 0x87;
var OP_coerce_u = 0x88;
var OP_coerce_o = 0x89;
var OP_negate = 0x90;
var OP_increment = 0x91;
var OP_inclocal = 0x92;
var OP_decrement = 0x93;
var OP_declocal = 0x94;
var OP_typeof = 0x95;
var OP_not = 0x96;
var OP_bitnot = 0x97;
var OP_add = 0xA0;
var OP_subtract = 0xA1;
var OP_multiply = 0xA2;
var OP_divide = 0xA3;
var OP_modulo = 0xA4;
var OP_lshift = 0xA5;
var OP_rshift = 0xA6;
var OP_urshift = 0xA7;
var OP_bitand = 0xA8;
var OP_bitor = 0xA9;
var OP_bitxor = 0xAA;
var OP_equals = 0xAB;
var OP_strictequals = 0xAC;
var OP_lessthan = 0xAD;
var OP_lessequals = 0xAE;
var OP_greaterthan = 0xAF;
var OP_greaterequals = 0xB0;
var OP_instanceof = 0xB1;
var OP_istype = 0xB2;
var OP_istypelate = 0xB3;
var OP_in = 0xB4;
var OP_increment_i = 0xC0;
var OP_decrement_i = 0xC1;
var OP_inclocal_i = 0xC2;
var OP_declocal_i = 0xC3;
var OP_negate_i = 0xC4;
var OP_add_i = 0xC5;
var OP_subtract_i = 0xC6;
var OP_multiply_i = 0xC7;
var OP_getlocal0 = 0xD0;
var OP_getlocal1 = 0xD1;
var OP_getlocal2 = 0xD2;
var OP_getlocal3 = 0xD3;
var OP_setlocal0 = 0xD4;
var OP_setlocal1 = 0xD5;
var OP_setlocal2 = 0xD6;
var OP_setlocal3 = 0xD7;
var OP_invalid = 0xED;
var OP_debug = 0xEF;
var OP_debugline = 0xF0;
var OP_debugfile = 0xF1;
var OP_bkptline = 0xF2;
var OP_timestamp = 0xF3;

var INT_MIN_VALUE = -0x80000000;
var INT_MAX_VALUE = 0x7fffffff;
var UINT_MIN_VALUE = 0;
var UINT_MAX_VALUE = 0xffffffff;

var SORT_CASEINSENSITIVE = 1;
var SORT_DESCENDING = 2;
var SORT_UNIQUESORT = 4;
var SORT_RETURNINDEXEDARRAY = 8;
var SORT_NUMERIC = 16;

var filter = new Shumway.Options.Option("f", "filter", "string", "SpciMsmNtu", "[S]ource, constant[p]ool, [c]lasses, [i]nstances, [M]etadata, [s]cripts, [m]ethods, multi[N]ames, S[t]atistics, [u]tf");

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
  writer.writeLn("flags: " + Shumway.IntegerUtilities.getFlags(this.flags, "NEED_ARGUMENTS|NEED_ACTIVATION|NEED_REST|HAS_OPTIONAL||NATIVE|SET_DXN|HAS_PARAM_NAMES".split("|")));
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
    var opcode = Shumway.AVM2.opcodeTable[bc];
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
        var namespaceName = trait.name.namespaces[0].uri;
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
              if (className.namespaces[0].uri) {
                prefix += className.namespaces[0].uri + "::";
              }
              prefix += className.getName();
              prefix += "$/";
            } else if (trait.holder instanceof InstanceInfo) {
              className = trait.holder.name;
              if (className.namespaces[0].uri) {
                prefix += className.namespaces[0].uri + "::";
              }
              prefix += className.getName();
              prefix += "/";
            } else {
              prefix = "global/";
            }
            var getSet = trait.isGetter() ? "get " : (trait.isSetter() ? "set " : "");
            if (!mi.isNative()) {
              // print("XXX: " + prefix + getSet + trait.name.getName() + " ()");
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
          writer.enter("package " + className.namespaces[0].uri + " {\n");
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
      writer.writeLn("var c = new Class(\"" + name + "\", instanceConstructor, ApplicationDomain.passthroughCallable(instanceConstructor));");
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

      var uri = ii.name.namespaces[0].uri;

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
        var gettersAndSetters = Shumway.ObjectUtilities.createEmptyObject();

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

        var keyValues = Shumway.ObjectUtilities.toKeyValueArray(gettersAndSetters);
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
      writer.writeLn("__class__: \"" + uri + "." + className + "\",");
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
        writer.writeLn("instance: Glue.ALL");
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
        interfaceNamespace = name.namespaces[0].uri + ":" + name.name;
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

  var libraryClassCounter = new Shumway.Metrics.Counter(true);
  var librarySuperClassCounter = new Shumway.Metrics.Counter(true);
  var libraryMethodCounter = new Shumway.Metrics.Counter(true);
  var libraryProperties = new Shumway.Metrics.Counter(true);

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

  var opCounter = new Shumway.Metrics.Counter(true);

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
      var op = Shumway.AVM2.opcodeTable[bc];
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
