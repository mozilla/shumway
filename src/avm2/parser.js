var AbcStream = (function () {
  function abcStream(bytes) {
    this.bytes = bytes;
    this.view = new DataView(bytes.buffer);
    this.pos = 0;
  }

  abcStream.prototype = {
    get position() {
      return this.pos;
    },
    remaining: function () {
      return this.bytes.length - this.pos;
    },
    seek: function(pos) {
      this.pos = pos;
    },
    readU8: function() {
      return this.bytes[this.pos++];
    },
    readS8: function() {
      return this.bytes[this.pos++] << 24 >> 24;
    },
    readU32: function() {
      return this.readS32() >>> 0;
    },
    readU30: function() {
      var result = this.readU32();
      if (result & 0xc0000000) {
        error("Corrupt ABC File");
      }
      return result;
    },
    readU30Unsafe: function() {
      return this.readU32();
    },
    readS16: function() {
      return (this.readU30Unsafe() << 16) >> 16;
    },
    /**
     * Read a variable-length encoded 32-bit signed integer. The value may use one to five bytes (little endian),
     * each contributing 7 bits. The most significant bit of each byte indicates that the next byte is part of
     * the value. The spec indicates that the most significant bit of the last byte to be read is sign extended
     * but this turns out not to be the case in the real implementation, for instance 0x7f should technically be
     * -1, but instead it's 127. Moreover, what happens to the remaining 4 high bits of the fifth byte that is
     * read? Who knows, here we'll just stay true to the Tamarin implementation.
     */
    readS32: function() {
      var result = this.readU8();
      if (result & 0x80) {
        result = result & 0x7f | this.readU8() << 7;
        if (result & 0x4000) {
          result = result & 0x3fff | this.readU8() << 14;
          if (result & 0x200000) {
            result = result & 0x1fffff | this.readU8() << 21;
            if (result & 0x10000000) {
              result = result & 0x0fffffff | this.readU8() << 28;
              result = result & 0xffffffff;
            }
          }
        }
      }
      return result;
    },
    readWord: function() {
      var result = this.view.getUint32(this.pos, true);
      this.pos += 4;
      return result;
    },
    readS24: function() {
      var u = this.readU8() |
        (this.readU8() << 8) |
        (this.readU8() << 16);
      return (u << 8) >> 8;
    },
    readDouble: function() {
      var result = this.view.getFloat64(this.pos, true);
      this.pos += 8;
      return result;
    },
    readUTFString: function(length) {
      var result = "", end = this.pos + length;

      while(this.pos < end) {
        var c = this.bytes[this.pos++];
        if (c <= 0x7f) {
          result += String.fromCharCode(c);
        }
        else if (c >= 0xc0) { // multibyte
          var code;
          if (c < 0xe0) { // 2 bytes
            code = ((c & 0x1f) << 6) |
              (this.bytes[this.pos++] & 0x3f);
          }
          else if (c < 0xf0) { // 3 bytes
            code = ((c & 0x0f) << 12) |
              ((this.bytes[this.pos++] & 0x3f) << 6) |
              (this.bytes[this.pos++] & 0x3f);
          } else { // 4 bytes
            // turned into two characters in JS as surrogate pair
            code = (((c & 0x07) << 18) |
                    ((this.bytes[this.pos++] & 0x3f) << 12) |
                    ((this.bytes[this.pos++] & 0x3f) << 6) |
                    (this.bytes[this.pos++] & 0x3f)) - 0x10000;
            // High surrogate
            result += String.fromCharCode(((code & 0xffc00) >>> 10) + 0xd800);
            // Low surrogate
            code = (code & 0x3ff) + 0xdc00;
          }
          result += String.fromCharCode(code);
        } // Otherwise it's an invalid UTF8, skipped.
      }
      return result;
    }
  };

  return abcStream;
})();

function parseTraits(abc, stream, holder) {
  var count = stream.readU30();
  var traits = [];
  for (var i = 0; i < count; i++) {
    traits.push(new Trait(abc, stream, holder));
  }
  return traits;
}

var Trait = (function () {
  function trait(abc, stream, holder) {
    const constantPool = abc.constantPool;
    const methods = abc.methods;
    const classes = abc.classes;
    const metadata = abc.metadata;

    this.holder = holder;
    this.name = constantPool.multinames[stream.readU30()];
    var tag = stream.readU8();

    this.kind = tag & 0x0F;
    this.attributes = (tag >> 4) & 0x0F;
    assert(this.name.isQName(), "Name must be a QName: " + this.name + ", kind: " + this.kind);

    switch (this.kind) {
    case TRAIT_Slot:
    case TRAIT_Const:
      this.slotId = stream.readU30();
      this.typeName = constantPool.multinames[stream.readU30()];
      var valueIndex = stream.readU30();
      this.value = null;
      if (valueIndex !== 0) {
        this.value = constantPool.getValue(stream.readU8(), valueIndex);
      }
      break;
    case TRAIT_Method:
    case TRAIT_Setter:
    case TRAIT_Getter:
      this.dispId = stream.readU30();
      this.methodInfo = methods[stream.readU30()];
      this.methodInfo.name = this.name;
      break;
    case TRAIT_Class:
      this.slotId = stream.readU30();
      assert(classes, "Classes should be passed down here, I'm guessing whenever classes are being parsed.");
      this.classInfo = classes[stream.readU30()];
      break;
    case TRAIT_Function: // TODO
      this.slotId = stream.readU30();
      this.methodInfo = methods[stream.readU30()];
      break;
    }

    if (this.attributes & ATTR_Metadata) {
      var traitMetadata = {};
      for (var i = 0, j = stream.readU30(); i < j; i++) {
        var md = metadata[stream.readU30()];
        traitMetadata[md.tagName] = md;
      }
      this.metadata = traitMetadata;
    }
  }

  trait.prototype.isSlot = function isSlot() {
    return this.kind === TRAIT_Slot;
  };

  trait.prototype.isConst = function isConst() {
    return this.kind === TRAIT_Const;
  };

  trait.prototype.isConstant = function isConstant() {
    return this.kind === TRAIT_Const;
  };

  trait.prototype.isMethod = function isMethod() {
    return this.kind === TRAIT_Method;
  };

  trait.prototype.isClass = function isClass() {
    return this.kind === TRAIT_Class;
  };

  trait.prototype.isGetter = function isGetter() {
    return this.kind === TRAIT_Getter;
  };

  trait.prototype.isSetter = function isSetter() {
    return this.kind === TRAIT_Setter;
  };

  trait.prototype.toString = function toString() {
    var str = getFlags(this.attributes, "final|override|metadata".split("|")) + " " + this.name.getQualifiedName() + ", kind: " + this.kind;
    switch (this.kind) {
      case TRAIT_Slot:
      case TRAIT_Const:
        return str + ", slotId: " + this.slotId + ", typeName: " + this.typeName + ", value: " + this.value;
      case TRAIT_Method:
      case TRAIT_Setter:
      case TRAIT_Getter:
        return str + ", method: " + this.methodInfo + ", dispId: " + this.dispId;
      case TRAIT_Class:
        return str + ", slotId: " + this.slotId + ", class: " + this.classInfo;
      case TRAIT_Function: // TODO
        break;
    }
  };

  return trait;
})();

var Namespace = (function () {

  var kinds = {};
  kinds[CONSTANT_Namespace] = "public";
  kinds[CONSTANT_PackageNamespace] ="public";
  kinds[CONSTANT_PackageInternalNs] = "packageInternal";
  kinds[CONSTANT_PrivateNs] = "private";
  kinds[CONSTANT_ProtectedNamespace] =  "protected";
  kinds[CONSTANT_ExplicitNamespace] =  "explicit";
  kinds[CONSTANT_StaticProtectedNs] =  "staticProtected";

  /**
   * According to Tamarin, this is 0xe000 + 660, with 660 being an "odd legacy
   * wart".
   */
  const MIN_API_MARK              = 0xe294;
  const MAX_API_MARK              = 0xf8ff;

  function namespace(kind, uri) {
    if (kind !== undefined) {
      if (uri === undefined) {
        uri = "";
      }
      this.kind = kind;
      this.originalURI = this.uri = uri;
      buildNamespace.call(this);
    }
  }

  function buildNamespace() {
    this.uri = this.uri.replace(/\.|:|\//gi,"$"); /* No dots, colons, and /s */

    if (this.isPublic() && this.uri) {
      /* Strip the api version mark for now. */
      var n = this.uri.length - 1;
      var mark = this.uri.charCodeAt(n);
      if (mark > MIN_API_MARK) {
        this.uri = this.uri.substring(0, n - 1);
      }
    }
    assert (kinds[this.kind]);
    this.qualifiedName = kinds[this.kind] + (this.uri ? "$" + this.uri : "");
  }

  namespace.kindFromString = function kindFromString(str) {
    for (var kind in kinds) {
      if (kinds[kind] === str) {
        return kind;
      }
    }
    return assert (false, "Cannot find kind " + str);
  };

  namespace.createNamespace = function createNamespace(uri) {
    return new namespace(CONSTANT_Namespace, uri);
  };

  namespace.prototype = {
    parse: function parse(constantPool, stream) {
      this.kind = stream.readU8();
      this.originalURI = this.uri = constantPool.strings[stream.readU30()];
      buildNamespace.call(this);
    },

    isPublic: function isPublic() {
      return this.kind === CONSTANT_Namespace || this.kind === CONSTANT_PackageNamespace;
    },

    getPrefix: function getPrefix() {
      return this.prefix;
    },

    getURI: function getURI() {
      return this.uri;
    },

    toString: function toString() {
      return this.qualifiedName;
    },

    clone: function clone() {
      var c = new Namespace();
      c.kind = this.kind;
      c.uri = this.uri;
      c.qualifiedName = this.qualifiedName;
      c.prefix = this.prefix;
    },

    getAccessModifier: function getAccessModifier() {
      return kinds[this.kind];
    }
  };

  namespace.PUBLIC = namespace.createNamespace();

  var simpleNameCache = {};

  /**
   * Creates a set of namespaces from one or more comma delimited simple names. For example:
   *
   * flash.display
   * private flash.display
   * [flash.display, private flash.display]
   *
   */
  namespace.fromSimpleName = function fromSimpleName(simpleName) {
    if (simpleName in simpleNameCache) {
      return simpleNameCache[simpleName];
    }
    var namespaceNames;
    if (simpleName.indexOf("[") === 0) {
      assert (simpleName[simpleName.length - 1] === "]");
      namespaceNames = simpleName.substring(1, simpleName.length - 1).split(",");
    } else {
      namespaceNames = [simpleName];
    }
    return simpleNameCache[simpleName] = namespaceNames.map(function (name) {
      name = name.trim();
      var kindName = "public";
      var uri = name;
      if (name.indexOf(" ") > 0) {
        kindName = name.substring(0, name.indexOf(" "));
        uri = name.substring(name.indexOf(" ") + 1);
      }
      return new namespace(namespace.kindFromString(kindName), uri);
    });
  };

  return namespace;
})();

/**
 * Section 2.3 and 4.4.3
 *
 * There are 10 multiname types, those ending in "A" represent the names of attributes. Some multinames
 * have the name and/or namespace part resolved at runtime, and are referred to as runtime multinames.
 *
 *  QName[A] - A qualified name is the simplest form of multiname, it has a name with exactly one
 *  namespace. They are usually used to represent the names of variables and for type annotations.
 *
 *  RTQName[A] - A runtime qualified name is a QName whose runtime part is resolved at runtime. Whenever
 *  a RTQName is used as an operand for an instruction, the namespace part is expected to be on the stack.
 *  RTQNames are used when the namespace is not known at compile time.
 *  ex: getNamespace()::f
 *
 *  RTQNameL[A] - A runtime qualified name late is a QName whose name and runtime part are resolved at runtime.
 *  ex: getNamespace()::[getName()]
 *
 *  Multiname[A] - A multiple namespace name is a name with a namespace set. The namespace set represents
 *  a collection of namespaces. Multinames are used for unqualified names where multiple namespace may be open.
 *  ex: f
 *
 *  MultinameL[A] - A multiname where the name is resolved at runtime.
 *  ex: [f]
 *
 *  Multiname Resolution: Section 2.3.6
 *
 *  Multinames are resolved in the object's declared traits, its dynamic properties, and finally the
 *  prototype chain, in this order, unless otherwise noted. The last two only happen if the multiname
 *  contains the public namespace (dynamic properties are always in the public namespace).
 *
 *  If the multiname is any type of QName, the QName will resolve to the property with the same name and
 *  namespace as the QName. If no property has the same name and namespace then the QName is unresolved.
 *
 *  If the multiname has a namespace set, then the object is searched for any properties with the same
 *  name and a namespace matches any of the namespaces in the namespace set.
 */

var Multiname = (function () {
  const ATTRIBUTE         = 0x01;
  const QNAME             = 0x02;
  const RUNTIME_NAMESPACE = 0x04;
  const RUNTIME_NAME      = 0x08;
  const NAMESPACE_SET     = 0x10;
  const TYPE_PARAMETER    = 0x20;

  function multiname(namespaces, name, flags) {
    this.namespaces = namespaces;
    this.name = name;
    if (flags !== undefined) {
      this.flags = flags;
    } else if (namespaces && name) {
      if (namespaces.length === 1) {
        this.flags = QNAME;
      } else {
        assert (namespaces.length > 1);
        this.flags = NAMESPACE_SET;
      }
    }
  }

  multiname.prototype.clone = function clone() {
    return new multiname(this.namespaces, this.name, this.flags);
  };

  function setAnyNamespace() {
    this.flags &= ~(NAMESPACE_SET | RUNTIME_NAMESPACE);
    this.namespaces = null;
  }

  function setAnyName() {
    this.flags &= ~(RUNTIME_NAME);
    this.name = null;
  }

  function setQName() {
    this.flags |= QNAME;
  }

  function setAttribute(set) {
    if (set) {
      this.flags |= ATTRIBUTE;
    } else {
      this.flags &= ~(ATTRIBUTE);
    }
  }

  function setRuntimeName() {
    this.flags |= RUNTIME_NAME;
    this.name = null;
  }

  function setRuntimeNamespace() {
    this.flags |= RUNTIME_NAMESPACE;
    this.flags &= ~(NAMESPACE_SET);
    this.namespaces = null;
  }

  function setNamespaceSet(namespaceSet) {
    assert(namespaceSet != null);
    this.flags &= ~(RUNTIME_NAMESPACE);
    this.flags |= NAMESPACE_SET;
    this.namespaces = namespaceSet;
  }

  function setTypeParameter(typeParameter) {
    this.flags |= TYPE_PARAMETER;
    this.typeParameter = typeParameter;
  }

  multiname.prototype.parse = function parse(constantPool, stream, multinames) {
    var index = 0;
    this.flags = 0;
    this.kind = stream.readU8();

    switch (this.kind) {
      case CONSTANT_QName: case CONSTANT_QNameA:
        index = stream.readU30();
        if (index === 0) {
          setAnyNamespace.call(this);
        } else {
          this.namespaces = [constantPool.namespaces[index]];
        }
        index = stream.readU30();
        if (index === 0) {
          setAnyName.call(this);
        } else {
          this.name = constantPool.strings[index];
        }
        setQName.call(this);
        setAttribute.call(this, this.kind === CONSTANT_QNameA);
        break;
      case CONSTANT_RTQName: case CONSTANT_RTQNameA:
        index = stream.readU30();
        if (index === 0) {
          setAnyName.call(this);
        } else {
          this.name = constantPool.strings[index];
        }
        setQName.call(this);
        setRuntimeNamespace.call(this);
        setAttribute.call(this, this.kind === CONSTANT_RTQNameA);
        break;
      case CONSTANT_RTQNameL: case CONSTANT_RTQNameLA:
        setQName.call(this);
        setRuntimeNamespace.call(this);
        setRuntimeName.call(this);
        setAttribute.call(this, this.kind === CONSTANT_RTQNameLA);
        break;
      case CONSTANT_Multiname: case CONSTANT_MultinameA:
        index = stream.readU30();
        if (index === 0) {
          setAnyName.call(this);
        } else {
          this.name = constantPool.strings[index];
        }
        index = stream.readU30();
        assert(index != 0);
        var nsset = constantPool.namespaceSets[index];
        if (nsset.length === 1) {
          setQName.call(this);
          this.namespaces = nsset;
        } else {
          setNamespaceSet.call(this, nsset);
        }
        setAttribute.call(this, this.kind === CONSTANT_MultinameA);
        break;
      case CONSTANT_MultinameL: case CONSTANT_MultinameLA:
        setRuntimeName.call(this);
        index = stream.readU30();
        assert(index != 0);
        setNamespaceSet.call(this, constantPool.namespaceSets[index]);
        setAttribute.call(this, this.kind === CONSTANT_MultinameLA);
        break;
      /**
       * This is undocumented, looking at Tamarin source for this one.
       */
      case CONSTANT_TypeName:
        index = stream.readU32();
        for (var key in multinames[index]) {
          this[key] = multinames[index][key];
        }
        index = stream.readU32();
        assert(index === 1);
        setTypeParameter.call(this, stream.readU32());
        break;
      default:
        unexpected();
        break;
    }
  };

  multiname.prototype.isAttribute = function isAttribute() {
    return this.flags & ATTRIBUTE;
  };

  multiname.prototype.isAnyName = function isAnyName() {
    return !this.isRuntimeName() && this.name === null;
  };

  multiname.prototype.isAnyNamespace = function isAnyNamespace() {
    return !this.isRuntimeNamespace() && !(this.flags & NAMESPACE_SET) && this.namespaces === null;
  };

  multiname.prototype.isRuntimeName = function isRuntimeName() {
    return this.flags & RUNTIME_NAME;
  };

  multiname.prototype.isRuntimeNamespace = function isRuntimeNamespace() {
    return this.flags & RUNTIME_NAMESPACE;
  };

  multiname.prototype.isRuntime = function isRuntime() {
    return this.flags & (RUNTIME_NAME | RUNTIME_NAMESPACE);
  };

  multiname.prototype.isQName = function isQName() {
    return this.flags & QNAME;
  };

  multiname.prototype.isPublicNamespaced = function setName(name) {
    if (this.isRuntimeNamespace())
      return false;

    return this.namespaces.every(function(ns) {
      return ns.isPublic() && ns.name === "";
    });
  };

  multiname.prototype.getName = function getName() {
    assert(!this.isAnyName() && !this.isRuntimeName());
    return this.name;
  };

  multiname.prototype.setName = function setName(name) {
    this.flags &= ~(RUNTIME_NAME);
    this.name = name;
  };

  multiname.prototype.nameToString = function nameToString() {
    if (this.isAnyName()) {
      return "*";
    } else {
      return this.isRuntimeName() ? "[]" : this.getName();
    }
  };

  multiname.prototype.getQualifiedName = function getQualifiedName() {
    var qualifiedName = this.qualifiedName;
    if (qualifiedName) {
      return qualifiedName;
    } else {
      assert(this.isQName());
      var ns = this.namespaces[0];
      if (ns.isPublic() && ns.name === "") {
        qualifiedName = "public$" + this.getName();
      } else {
        qualifiedName = ns.qualifiedName + "$" + this.getName();
      }
      return this.qualifiedName = qualifiedName;
    }
  };

  /**
   * Creates a QName from this multiname.
   */
  multiname.prototype.getQName = function getQName(index) {
    assert (index >= 0 && index < this.namespaces.length);
    if (!this.cache) {
      this.cache = [];
    }
    var name = this.cache[index];
    if (!name) {
      name = this.cache[index] = new Multiname([this.namespaces[index]], this.name, QNAME);
    }
    return name;
  };

  multiname.prototype.getAccessModifier = function getAccessModifier() {
    assert (this.isQName());
    return this.namespaces[0].getAccessModifier();
  };

  multiname.prototype.toString = function toString() {
    var str = this.isAttribute() ? "@" : "";
    if (this.isAnyNamespace()) {
      str += "*::" + this.nameToString();
    } else if (this.isRuntimeNamespace()) {
      str += "[]::" + this.nameToString();
    } else if (this.namespaces.length === 1 && this.isQName()) {
      str += this.namespaces[0].qualifiedName + "::";
      str += this.nameToString();
    } else {
      str += "{";
      for (var i = 0, count = this.namespaces.length; i < count; i++) {
        str += this.namespaces[i].qualifiedName;
        if (i + 1 < count) {
          str += ",";
        }
      }
      str += "}::" + this.nameToString();
    }
    return str;
  };

  var simpleNameCache = {};

  /**
   * Creates a multiname from a simple name qualified with one ore more namespaces, for example:
   * flash.display.Graphics
   * private flash.display.Graphics
   * [private flash.display, private flash, public].Graphics
   */
  multiname.fromSimpleName = function fromSimpleName(simpleName) {
    assert (simpleName);
    if (simpleName in simpleNameCache) {
      return simpleNameCache[simpleName];
    }

    var nameIndex = simpleName.lastIndexOf("."), name, namespace;

    if (nameIndex >= 0) {
      name = simpleName.substring(nameIndex + 1).trim();
      namespace = simpleName.substring(0, nameIndex);
    } else {
      name = simpleName;
      namespace = "";
    }
    return simpleNameCache[simpleName] = new multiname(Namespace.fromSimpleName(namespace), name);
  };

  return multiname;
})();

var ConstantPool = (function constantPool() {
  function constantPool(stream) {
    var i, n;

    // ints
    var ints = [0];
    n = stream.readU30();
    for (i = 1; i < n; ++i) {
      ints.push(stream.readS32());
    }

    // uints
    var uints = [0];
    n = stream.readU30();
    for (i = 1; i < n; ++i) {
      uints.push(stream.readU32());
    }

    // doubles
    var doubles = [NaN];
    n = stream.readU30();
    for (i = 1; i < n; ++i) {
      doubles.push(stream.readDouble());
    }

    // strings
    var strings = [""];
    n = stream.readU30();
    for (i = 1; i < n; ++i) {
      strings.push(stream.readUTFString(stream.readU30()));
    }

    this.ints = ints;
    this.uints = uints;
    this.doubles = doubles;
    this.strings = strings;

    // namespaces
    var namespaces = [undefined];
    n = stream.readU30();
    for (i = 1; i < n; ++i) {
      var namespace = new Namespace();
      namespace.parse(this, stream);
      namespaces.push(namespace);
    }

    // namespace sets
    var namespaceSets = [undefined];
    n = stream.readU30();
    for (i = 1; i < n; ++i) {
      var count = stream.readU30();
      var set = [];
      for (var j = 0; j < count; ++j) {
        set.push(namespaces[stream.readU30()]);
      }
      namespaceSets.push(set);
    }


    this.namespaces = namespaces;
    this.namespaceSets = namespaceSets;

    // multinames
    var multinames = [undefined];
    n = stream.readU30();
    for (i = 1; i < n; ++i) {
      var multiname = new Multiname(i);
      multiname.parse(this, stream, multinames);
      multinames.push(multiname);
    }

    this.multinames = multinames;
  }

  constantPool.prototype.getValue = function getValue(kind, index) {
    switch (kind) {
    case CONSTANT_Int:
      return this.ints[index];
    case CONSTANT_UInt:
      return this.uints[index];
    case CONSTANT_Double:
      return this.doubles[index];
    case CONSTANT_Utf8:
      return this.strings[index];
    case CONSTANT_True:
      return true;
    case CONSTANT_False:
      return false;
    case CONSTANT_Null:
      return null;
    case CONSTANT_Undefined:
      return undefined;
    case CONSTANT_Namespace:
    case CONSTANT_PackageInternalNS:
      return this.namespaces[index];
    case CONSTANT_QName:
    case CONSTANT_MultinameA:
    case CONSTANT_RTQName:
    case CONSTANT_RTQNameA:
    case CONSTANT_RTQNameL:
    case CONSTANT_RTQNameLA:
    case CONSTANT_NameL:
    case CONSTANT_NameLA:
      return this.multinames[index];
    case CONSTANT_Float:
      warning("TODO: CONSTANT_Float may be deprecated?");
      break;
    default:
      assert(false, "Not Implemented Kind " + kind);
    }
  };

  return constantPool;
})();

var MethodInfo = (function () {
  function methodInfo(abc, stream) {
    const constantPool = abc.constantPool;

    var parameterCount = stream.readU30();
    var returnType = constantPool.multinames[stream.readU30()];
    var parameters = [];
    for (var i = 0; i < parameterCount; i++) {
      parameters.push({type: constantPool.multinames[stream.readU30()]});
    }

    var debugName = constantPool.strings[stream.readU30()];
    var flags = stream.readU8();

    var optionalCount = 0;
    var optionals = null;
    if (flags & METHOD_HasOptional) {
      optionalCount = stream.readU30();
      assert (parameterCount >= optionalCount);
      for (var i = parameterCount - optionalCount; i < parameterCount; i++) {
        var valueIndex = stream.readU30();
        parameters[i].value = constantPool.getValue(stream.readU8(), valueIndex);
      }
    }

    var paramnames = null;
    if (flags & METHOD_HasParamNames) {
      for (var i = 0; i < parameterCount; i++) {
        parameters[i].name = constantPool.strings[stream.readU30()];
      }
    } else {
      function getParameterName(i) {
        assert (i < 26);
        return "p" + String.fromCharCode("A".charCodeAt(0) + i);
      }
      for (var i = 0; i < parameterCount; i++) {
        parameters[i].name = getParameterName(i);
      }
    }

    this.flags = flags;
    this.optionals = optionals;
    this.debugName = debugName;
    this.parameters = parameters;
    this.returnType = returnType;
  }

  methodInfo.prototype = {
    toString: function toString() {
      var flags = getFlags(this.flags, "NEED_ARGUMENTS|NEED_ACTIVATION|NEED_REST|HAS_OPTIONAL|||SET_DXN|HAS_PARAM_NAMES".split("|"));
      return (flags ? flags + " " : "") + this.name;
    },
    needsActivation: function needsActivation() {
      return !!(this.flags & METHOD_Activation);
    },
    needsRest: function needsRest() {
      return !!(this.flags & METHOD_Needrest);
    },
    needsArguments: function needsArguments() {
      return !!(this.flags & METHOD_Arguments);
    },
    isNative: function isNative() {
      return !!(this.flags & METHOD_Native);
    }
  };

  function parseException(abc, stream) {
    const multinames = abc.constantPool.multinames;

    var ex = {
      start: stream.readU30(),
      end: stream.readU30(),
      target: stream.readU30(),
      typeName: multinames[stream.readU30()],
      varName: multinames[stream.readU30()]
    };
    assert(!ex.typeName || !ex.typeName.isRuntime());
    assert(!ex.varName || ex.varName.isQName());
    return ex;
  }

  methodInfo.parseBody = function parseBody(abc, stream) {
    const constantPool = abc.constantPool;
    const methods = abc.methods;

    var info = methods[stream.readU30()];
    assert (!info.isNative());
    info.maxStack = stream.readU30();
    info.localCount = stream.readU30();
    info.initScopeDepth = stream.readU30();
    info.maxScopeDepth = stream.readU30();

    var code = new Uint8Array(stream.readU30());
    for (var i = 0; i < code.length; ++i) {
      code[i] = stream.readU8();
    }
    info.code = code;

    var exceptions = [];
    var exceptionCount = stream.readU30();
    for (var i = 0; i < exceptionCount; ++i) {
      exceptions.push(parseException(abc, stream));
    }
    info.exceptions = exceptions;
    info.traits = parseTraits(abc, stream, info);
  };

  return methodInfo;
})();

var MetaDataInfo = (function () {

  function metaDataInfo(abc, stream) {
    const strings = abc.constantPool.strings;
    this.tagName = strings[stream.readU30()];

    var itemCount = stream.readU30();
    var items = [];
    var keys = [];
    var values = [];

    for (var i = 0; i < itemCount; i++) {
      keys[i] = strings[stream.readU30()];
    }

    for (var i = 0; i < itemCount; i++) {
      values[i] = strings[stream.readU30()];
    }

    for (var i = 0; i < itemCount; i++) {
      var item = items[i] = { key: keys[i], value: values[i] };
      if (item.key) {
        assert (!this.hasOwnProperty(item.key));
        this[item.key] = item.value;
      }
    }
    this.items = items;
  }

  metaDataInfo.prototype = {
    toString: function toString() {
      return "[" + this.tagName + "]";
    }
  };

  return metaDataInfo;

})();

var InstanceInfo = (function () {
  function instanceInfo(abc, stream) {
    const constantPool = abc.constantPool;
    const methods = abc.methods;

    this.name = constantPool.multinames[stream.readU30()];
    assert(this.name.isQName());
    this.superName = constantPool.multinames[stream.readU30()];
    this.flags = stream.readU8();
    this.protectedNs = 0;
    if (this.flags & 8) {
      this.protectedNs = constantPool.namespaces[stream.readU30()];
    }
    var interfaceCount = stream.readU30();
    this.interfaces = [];
    for (var i = 0; i < interfaceCount; i++) {
      this.interfaces[i] = constantPool.multinames[stream.readU30()];
    }
    this.init = methods[stream.readU30()];
    this.traits = parseTraits(abc, stream, this);
  }

  instanceInfo.prototype = {
    toString: function toString() {
      var flags = getFlags(this.flags & 8, "sealed|final|interface|protected".split("|"));
      var str = (flags ? flags + " " : "") + this.name;
      if (this.superName) {
        str += " extends " + this.superName;
      }
      return str;
    },
    isFinal: function isFinal() { return this.flags & CONSTANT_ClassFinal; },
    isSealed: function isSealed() { return this.flags & CONSTANT_ClassSealed; },
    isInterface: function isInterface() { return this.flags & CONSTANT_ClassInterface; }
  };

  return instanceInfo;
})();

var ClassInfo = (function () {
  function classInfo(abc, instanceInfo, stream) {
    this.init = abc.methods[stream.readU30()];
    this.traits = parseTraits(abc, stream, this);
    this.instanceInfo = instanceInfo;
  }
  return classInfo;
})();

var ScriptInfo = (function scriptInfo() {
  function scriptInfo(abc, idx, stream) {
    this.name = abc.name + "$script" + idx;
    this.init = abc.methods[stream.readU30()];
    this.traits = parseTraits(abc, stream, this);
    this.traits.verified = true;
  }
  scriptInfo.prototype = {
    get entryPoint() {
      return this.init;
    },
    toString: function() {
      return this.name;
    }
  };
  return scriptInfo;
})();

var AbcFile = (function () {
  function abcFile(bytes, name) {
    Timer.start("parse");
    this.name = name;

    var n, i;
    var stream = new AbcStream(bytes);
    checkMagic(stream);
    this.constantPool = new ConstantPool(stream);

    // Method Infos
    this.methods = [];
    n = stream.readU30();
    for (i = 0; i < n; ++i) {
      this.methods.push(new MethodInfo(this, stream));
    }

    // MetaData Infos
    this.metadata = [];
    n = stream.readU30();
    for (i = 0; i < n; ++i) {
      this.metadata.push(new MetaDataInfo(this, stream));
    }

    // Instance Infos
    this.instances = [];
    n = stream.readU30();
    for (i = 0; i < n; ++i) {
      this.instances.push(new InstanceInfo(this, stream));
    }

    // Class Infos
    this.classes = [];
    for (i = 0; i < n; ++i) {
      this.classes.push(new ClassInfo(this, this.instances[i], stream));
    }

    // Script Infos
    this.scripts = [];
    n = stream.readU30();
    for (i = 0; i < n; ++i) {
      this.scripts.push(new ScriptInfo(this, i, stream));
    }

    // Method body info just live inside methods
    n = stream.readU30();
    for (i = 0; i < n; ++i) {
      MethodInfo.parseBody(this, stream);
    }
    Timer.stop();
  }

  function checkMagic(stream) {
    var magic = stream.readWord();
    var flashPlayerBrannan = 46 << 16 | 15;
    if (magic < flashPlayerBrannan) {
      throw new Error("Invalid ABC File (magic = " + Number(magic).toString(16) + ")");
    }
  }

  abcFile.prototype = {
    get lastScript() {
      assert (this.scripts.length > 0);
      return this.scripts[this.scripts.length - 1];
    },
    toString: function () {
      return this.name;
    }
  };

  return abcFile;
})();
