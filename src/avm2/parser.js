var AbcStream = (function () {
  function abcStream(bytes) {
    this.bytes = bytes;
    this.view = new DataView(bytes.buffer, bytes.byteOffset);
    this.pos = 0;
  }

  var resultBuffer = new Int32Array(256);

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
    readU8s: function(count) {
      var b = new Uint8Array(count);
      b.set(this.bytes.subarray(this.pos, this.pos + count), 0);
      this.pos += count;
      return b;
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
        // TODO: Spec says this is a corrupt ABC file, but it seems that some content
        // has this, e.g. 1000-0.abc
        // error("Corrupt ABC File");
        return result;
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
      var pos = this.pos;
      var end = pos + length;
      var bytes = this.bytes;
      var i = 0;
      if (!resultBuffer || resultBuffer.length < length) {
        resultBuffer = new Int32Array(length * 2);
      }
      var result = resultBuffer;
      while(pos < end) {
        var c = bytes[pos++];
        if (c <= 0x7f) {
          result[i++] = c;
        }
        else if (c >= 0xc0) { // multibyte
          var code = 0;
          if (c < 0xe0) { // 2 bytes
            code = ((c & 0x1f) << 6) |
                   (bytes[pos++] & 0x3f);
          }
          else if (c < 0xf0) { // 3 bytes
            code = ((c & 0x0f) << 12) |
                   ((bytes[pos++] & 0x3f) << 6) |
                   (bytes[pos++] & 0x3f);
          } else { // 4 bytes
            // turned into two characters in JS as surrogate pair
            code = (((c & 0x07) << 18) |
                    ((bytes[pos++] & 0x3f) << 12) |
                    ((bytes[pos++] & 0x3f) << 6) |
                    (bytes[pos++] & 0x3f)) - 0x10000;
            // High surrogate
            result[i++] = ((code & 0xffc00) >>> 10) + 0xd800;
            // Low surrogate
            code = (code & 0x3ff) + 0xdc00;
          }
          result[i++] = code;
        } // Otherwise it's an invalid UTF8, skipped.
      }
      this.pos = pos;
      return String.fromCharCode.apply(null, result.subarray(0, i));
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
    var constantPool = abc.constantPool;
    var methods = abc.methods;
    var classes = abc.classes;
    var metadata = abc.metadata;

    this.holder = holder;
    this.name = constantPool.multinames[stream.readU30()];
    var tag = stream.readU8();

    this.kind = tag & 0x0F;
    this.attributes = (tag >> 4) & 0x0F;
    release || assert(Multiname.isQName(this.name), "Name must be a QName: " + this.name + ", kind: " + this.kind);

    switch (this.kind) {
    case TRAIT_Slot:
    case TRAIT_Const:
      this.slotId = stream.readU30();
      this.typeName = constantPool.multinames[stream.readU30()];
      var valueIndex = stream.readU30();
      this.value = undefined;
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
      // make sure that the holder was not already set
      attachHolder(this.methodInfo, this.holder);
      break;
    case TRAIT_Class:
      this.slotId = stream.readU30();
      release || assert(classes, "Classes should be passed down here, I'm guessing whenever classes are being parsed.");
      this.classInfo = classes[stream.readU30()];
      break;
    case TRAIT_Function:
      // TRAIT_Function is a leftover. it's not supported at all in
      // Tamarin/Flash and will cause a verify error.
      release || assert(false, "Function encountered in the wild, should not happen");
      break;
    }

    if (this.attributes & ATTR_Metadata) {
      var traitMetadata;
      for (var i = 0, j = stream.readU30(); i < j; i++) {
        var md = metadata[stream.readU30()];
        if (md.tagName === "__go_to_definition_help" ||
            md.tagName === "__go_to_ctor_definition_help") {
          continue;
        }
        if (!traitMetadata) {
          traitMetadata = {};
        }
        traitMetadata[md.tagName] = md;
      }
      if (traitMetadata) {
        this.metadata = traitMetadata;
      }
    }
  }

  trait.prototype.isSlot = function isSlot() {
    return this.kind === TRAIT_Slot;
  };

  trait.prototype.isConst = function isConst() {
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

  trait.prototype.kindName = function kindName() {
    switch (this.kind) {
      case TRAIT_Slot:      return "Slot";
      case TRAIT_Const:     return "Const";
      case TRAIT_Method:    return "Method";
      case TRAIT_Setter:    return "Setter";
      case TRAIT_Getter:    return "Getter";
      case TRAIT_Class:     return "Class";
      case TRAIT_Function:  return "Function";
    }
    unexpected();
  };

  trait.prototype.toString = function toString() {
    var str = getFlags(this.attributes, "final|override|metadata".split("|"));
    if (str) {
      str += " ";
    }
    str += Multiname.getQualifiedName(this.name) + ", kind: " + this.kind;
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

var ShumwayNamespace = (function () {

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
  var MIN_API_MARK              = 0xe294;
  var MAX_API_MARK              = 0xf8ff;

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
    //this.uri = this.uri.replace(/\.|:|-|\//gi,"$"); /* No dots, colons, dashes and /s */
    this.uri = escapeString(this.uri);

    if (this.isPublic() && this.uri) {
      /* Strip the api version mark for now. */
      var n = this.uri.length - 1;
      var mark = this.uri.charCodeAt(n);
      if (mark > MIN_API_MARK) {
        this.uri = this.uri.substring(0, n - 1);
      }
    }
    release || assert(kinds[this.kind]);
    this.qualifiedName = kinds[this.kind] + (this.uri ? "$" + this.uri : "");
  }

  namespace.kindFromString = function kindFromString(str) {
    for (var kind in kinds) {
      if (kinds[kind] === str) {
        return kind;
      }
    }
    return release || assert(false, "Cannot find kind " + str);
  };

  namespace.createNamespace = function createNamespace(uri) {
    return new namespace(CONSTANT_Namespace, uri);
  };

  namespace.prototype = Object.create({
    parse: function parse(constantPool, stream) {
      this.kind = stream.readU8();
      this.originalURI = this.uri = constantPool.strings[stream.readU30()];
      buildNamespace.call(this);
    },

    isPublic: function isPublic() {
      return this.kind === CONSTANT_Namespace || this.kind === CONSTANT_PackageNamespace;
    },

    isDynamic: function isDynamic() {
      return this.isPublic() && !this.uri;
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
      c.originalURI = this.originalURI;
      c.qualifiedName = this.qualifiedName;
      return c;
    },

    isEqualTo: function isEqualTo(o) {
      return this.qualifiedName === o.qualifiedName;
    },

    getAccessModifier: function getAccessModifier() {
      return kinds[this.kind];
    }
  });

  namespace.PUBLIC = namespace.createNamespace();

  var simpleNameCache = {};

  /**
   * Creates a set of namespaces from one or more comma delimited simple names, for example:
   * flash.display
   * private flash.display
   * [flash.display, private flash.display]
   */
  namespace.fromSimpleName = function fromSimpleName(simpleName) {
    if (simpleName in simpleNameCache) {
      return simpleNameCache[simpleName];
    }
    var namespaceNames;
    if (simpleName.indexOf("[") === 0) {
      release || assert(simpleName[simpleName.length - 1] === "]");
      namespaceNames = simpleName.substring(1, simpleName.length - 1).split(",");
    } else {
      namespaceNames = [simpleName];
    }
    return simpleNameCache[simpleName] = namespaceNames.map(function (name) {
      name = name.trim();
      var kindName, uri;

      if (name.indexOf(" ") > 0) {
        kindName = name.substring(0, name.indexOf(" ")).trim();
        uri = name.substring(name.indexOf(" ") + 1).trim();
      } else {
        if (name === kinds[CONSTANT_Namespace] ||
            name === kinds[CONSTANT_PackageInternalNs] ||
            name === kinds[CONSTANT_PrivateNs] ||
            name === kinds[CONSTANT_ProtectedNamespace] ||
            name === kinds[CONSTANT_ExplicitNamespace] ||
            name === kinds[CONSTANT_StaticProtectedNs]) {
          kindName = name;
          uri = "";
        } else {
          kindName = "public";
          uri = name;
        }
      }
      return new namespace(namespace.kindFromString(kindName), uri);
    });
  };

  return namespace;
})();

/**
 * Section 2.3 and 4.4.3
 *
 * Multinames are (namespace set, name) pairs that are resolved to QNames (qualified names) at runtime. The terminology
 * in general is very confusing so we follow some naming conventions to simplify things. First of all, in ActionScript 3
 * there are 10 types of multinames. Half of them end in an "A" are used to represent the names of XML attributes. Those
 * prefixed with "RT" are "runtime" multinames which means they get their namespace from the runtime execution stack.
 * Multinames suffixed with "L" are called "late" which means they get their name from the runtime execution stack.
 *
 *  QName - A QName (qualified name) is the simplest form of multiname, it has one name and one namespace.
 *  E.g. ns::n
 *
 *  RTQName - A QName whose namespace part is resolved at runtime.
 *  E.g. [x]::n
 *
 *  RTQNameL - An RTQName whose name part is resolved at runtime.
 *  E.g. [x]::[y]
 *
 *  Multiname - A multiname with a namespace set.
 *  E.g. {ns0, ns1, ns2, ...}::n
 *
 *  MultinameL - A multiname with a namespace set whose name part is resolved at runtime.
 *  E.g. {ns0, ns1, ns2, ...}::[y]
 *
 * Multinames are used very frequently so it's important that we optimize their use. In Shumway, QNames are
 * represented as either: Multiname objects, strings or numbers, depending on the information they need to carry.
 * Typically, most named QNames will be strings while numeric QNames will be treated as numbers. All other Multiname
 * types will be represented as Multiname objects.
 *
 * Please use the following conventions when dealing with multinames:
 *
 * In the AS3 bytecode specification the word "name" usually refers to multinames. We us the same property name in
 * Shumway thus leading to code such as |instanceInfo.name.name| which is quite ugly. If possible, avoid using the
 * word "name" to refer to multinames, instead use "mn" or "multiname" and use the word "name" to refer to the
 * name part of a multiname.
 *
 * Multiname: multiname, mn
 * QName: qualifiedName, qn
 * Namespace: namespace, ns
 *
 * Because a qualified name can be either a Multiname object, a string, a number, or even a Number object use the static
 * Multiname methods to query multinames. For instance, use |Multiname.isRuntimeMultiname(mn)| instead of
 * |mn.isRuntimeMultiname()| since the latter will fail if |mn| is not a Multiname object.
 */

var Multiname = (function () {
  var ATTRIBUTE         = 0x01;
  var RUNTIME_NAMESPACE = 0x02;
  var RUNTIME_NAME      = 0x04;
  var nextID = 1;
  function multiname(namespaces, name, flags) {
    this.id = nextID ++;
    this.namespaces = namespaces;
    this.name = name;
    this.flags = flags || 0;
  }

  multiname.parse = function parse(constantPool, stream, multinames) {
    var index = 0;
    var kind = stream.readU8();
    var name, namespaces = [], flags = 0, typeParameter;
    switch (kind) {
      case CONSTANT_QName: case CONSTANT_QNameA:
        index = stream.readU30();
        if (index) {
          namespaces = [constantPool.namespaces[index]];
        }
        index = stream.readU30();
        if (index) {
          name = constantPool.strings[index];
        }
        break;
      case CONSTANT_RTQName: case CONSTANT_RTQNameA:
        index = stream.readU30();
        if (index) {
          name = constantPool.strings[index];
        }
        flags |= RUNTIME_NAMESPACE;
        break;
      case CONSTANT_RTQNameL:case CONSTANT_RTQNameLA:
        flags |= RUNTIME_NAMESPACE;
        flags |= RUNTIME_NAME;
        break;
      case CONSTANT_Multiname: case CONSTANT_MultinameA:
        index = stream.readU30();
        if (index) {
          name = constantPool.strings[index];
        }
        index = stream.readU30();
        release || assert(index != 0);
        namespaces = constantPool.namespaceSets[index];
        break;
      case CONSTANT_MultinameL: case CONSTANT_MultinameLA:
        flags |= RUNTIME_NAME;
        index = stream.readU30();
        release || assert(index != 0);
        namespaces = constantPool.namespaceSets[index];
        break;
      /**
       * This is undocumented, looking at Tamarin source for this one.
       */
      case CONSTANT_TypeName:
        index = stream.readU32();
        namespaces = multinames[index].namespaces;
        name = multinames[index].name;
        index = stream.readU32();
        release || assert(index === 1);
        index = stream.readU32();
        typeParameter = multinames[index];
        break;
      default:
        unexpected();
        break;
    }
    switch (kind) {
      case CONSTANT_QNameA:
      case CONSTANT_RTQNameA:
      case CONSTANT_RTQNameLA:
      case CONSTANT_MultinameA:
      case CONSTANT_MultinameLA:
        flags |= ATTRIBUTE;
        break;
    }
    var mn = new Multiname(namespaces, escapeString(name), flags);
    if (typeParameter) {
      mn.typeParameter = typeParameter;
    }
    return mn;
  };

  /**
   * Tests if the specified value is a valid multiname.
   */
  multiname.isMultiname = function (mn) {
    return typeof mn === "number" ||
           typeof mn === "string" ||
           mn instanceof Multiname ||
           mn instanceof Number;
  };

  /**
   * Tests if the specified value is a valid qualified name.
   */
  multiname.isQName = function (mn) {
    if (typeof mn === "number" || typeof mn === "string" || mn instanceof Number) {
      return true;
    }
    if (mn instanceof multiname) {
      return mn.namespaces && mn.namespaces.length === 1;
    }
    return false;
  };

  /**
   * Tests if the specified multiname has a runtime name.
   */
  multiname.isRuntimeName = function isRuntimeName(mn) {
    return mn instanceof Multiname && mn.isRuntimeName();
  };

  /**
   * Tests if the specified multiname has a runtime namespace.
   */
  multiname.isRuntimeNamespace = function isRuntimeNamespace(mn) {
    return mn instanceof Multiname && mn.isRuntimeNamespace();
  };

  /**
   * Tests if the specified multiname has a runtime name or namespace.
   */
  multiname.isRuntime = function (mn) {
    return mn instanceof Multiname && mn.isRuntimeName() || mn.isRuntimeNamespace();
  };

  /**
   * Gets the qualified name for this multiname, this is either the identity or
   * a mangled Multiname object.
   */
  multiname.getQualifiedName = function getQualifiedName(mn) {
    release || assert(multiname.isQName(mn));
    if (typeof mn === "number" || typeof mn === "string" || mn instanceof Number) {
      return mn;
    } else {
      return mn.qualifiedName || (mn.qualifiedName = mn.namespaces[0].qualifiedName + "$" + mn.name);
    }
  };

  multiname.getPublicQualifiedName = function getPublicQualifiedName(name) {
    return "public$" + name;
  };

  multiname.getAccessModifier = function getAccessModifier(mn) {
    release || assert(Multiname.isQName(mn));
    if (typeof mn === "number" || typeof mn === "string" || mn instanceof Number) {
      return "public";
    }
    release || assert(mn instanceof multiname);
    return mn.namespaces[0].getAccessModifier();
  };

  multiname.isAnyName = function isAnyName(mn) {
    return mn instanceof Multiname && mn.name === undefined;
  };

  multiname.isNumeric = function (mn) {
    if (typeof mn === "number") {
      return true;
    } else if (typeof mn === "string") {
      return isNumeric(mn);
    }
    release || assert(mn instanceof multiname);
    return !isNaN(parseInt(multiname.getName(mn), 10));
  };

  multiname.getName = function getName(mn) {
    release || assert(mn instanceof Multiname);
    release || assert(!mn.isRuntimeName());
    return mn.getName();
  };

  /**
   * Helper function that creates multinames without allocating objects for numeric
   * names.
   */
  multiname.getMultiname = function getMultiname(namespaces, name) {
    if (isNumeric(name)) {
      return name;
    }
    return new Multiname(namespaces, name);
  };

  var simpleNameCache = {};

  /**
   * Creates a multiname from a simple name qualified with one ore more namespaces, for example:
   * flash.display.Graphics
   * private flash.display.Graphics
   * [private flash.display, private flash, public].Graphics
   */
  multiname.fromSimpleName = function fromSimpleName(simpleName) {
    release || assert(simpleName);
    if (simpleName in simpleNameCache) {
      return simpleNameCache[simpleName];
    }

    var nameIndex, namespaceIndex, name, namespace;
    nameIndex = simpleName.lastIndexOf(".");
    if (nameIndex <= 0) {
      nameIndex = simpleName.lastIndexOf(" ");
    }

    if (nameIndex > 0) {
      name = simpleName.substring(nameIndex + 1).trim();
      namespace = simpleName.substring(0, nameIndex).trim();
    } else {
      name = simpleName;
      namespace = "";
    }
    return simpleNameCache[simpleName] = new Multiname(ShumwayNamespace.fromSimpleName(namespace), name);
  };

  multiname.prototype.getQName = function getQName(index) {
    release || assert(index >= 0 && index < this.namespaces.length);
    if (!this.cache) {
      this.cache = [];
    }
    var name = this.cache[index];
    if (!name) {
      name = this.cache[index] = new Multiname([this.namespaces[index]], this.name);
    }
    return name;
  };

  multiname.prototype.isAttribute = function isAttribute() {
    return this.flags & ATTRIBUTE;
  };

  multiname.prototype.isAnyName = function isAnyName() {
    return !this.isRuntimeName() && this.name === undefined;
  };

  multiname.prototype.isAnyNamespace = function isAnyNamespace() {
    return !this.isRuntimeNamespace() && this.namespaces.length === 0;
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
    return this.namespaces.length === 1 && !this.isAnyName();
  };

  multiname.prototype.hasTypeParameter = function hasTypeParameter() {
    return !!this.typeParameter;
  };

  multiname.prototype.getName = function getName() {
    release || assert(!this.isAnyName() && !this.isRuntimeName());
    return this.name;
  };

  multiname.prototype.getNamespace = function getNamespace() {
    release || assert(!this.isRuntimeNamespace());
    release || assert(this.namespaces.length === 1);
    return this.namespaces[0];
  };

  multiname.prototype.nameToString = function nameToString() {
    if (this.isAnyName()) {
      return "*";
    } else {
      return this.isRuntimeName() ? "[]" : this.getName();
    }
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

    if (this.hasTypeParameter()) {
      str += "<" + this.typeParameter.toString() + ">";
    }

    return str;
  };

  return multiname;
})();

function escapeString(str) {
  if (str !== undefined) {
    str = str.replace(/\.|:|-|\//gi,"$"); /* No dots, colons, dashes and /s */
  }
  return str;
}

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
      var namespace = new ShumwayNamespace();
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
      multinames.push(Multiname.parse(this, stream, multinames));
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
    case CONSTANT_PackageInternalNs:
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
      release || assert(false, "Not Implemented Kind " + kind);
    }
  };

  return constantPool;
})();

var MethodInfo = (function () {

  function getParameterName(i) {
    release || assert(i < 26);
    return "p" + String.fromCharCode("A".charCodeAt(0) + i);
  }

  function methodInfo(abc, stream) {
    var constantPool = abc.constantPool;

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
      release || assert(parameterCount >= optionalCount);
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
    var multinames = abc.constantPool.multinames;

    var ex = {
      start: stream.readU30(),
      end: stream.readU30(),
      target: stream.readU30(),
      typeName: multinames[stream.readU30()],
      varName: multinames[stream.readU30()]
    };
    release || assert(!ex.typeName || !ex.typeName.isRuntime());
    release || assert(!ex.varName || ex.varName.isQName());
    return ex;
  }

  methodInfo.parseBody = function parseBody(abc, stream) {
    var constantPool = abc.constantPool;
    var methods = abc.methods;

    var info = methods[stream.readU30()];
    release || assert(!info.isNative());
    info.maxStack = stream.readU30();
    info.localCount = stream.readU30();
    info.initScopeDepth = stream.readU30();
    info.maxScopeDepth = stream.readU30();
    info.code = stream.readU8s(stream.readU30());

    var exceptions = [];
    var exceptionCount = stream.readU30();
    for (var i = 0; i < exceptionCount; ++i) {
      exceptions.push(parseException(abc, stream));
    }
    info.exceptions = exceptions;
    info.traits = parseTraits(abc, stream, info);
  };

  methodInfo.prototype.hasExceptions = function hasExceptions() {
    return this.exceptions.length > 0;
  };
  return methodInfo;
})();

var MetaDataInfo = (function () {

  function metaDataInfo(abc, stream) {
    var strings = abc.constantPool.strings;
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
        release || assert(!this.hasOwnProperty(item.key));
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

function attachHolder(mi, holder) {
  release || assert(!mi.holder);
  mi.holder = holder;
}

var InstanceInfo = (function () {
  var nextID = 1;
  function instanceInfo(abc, stream) {
    this.id = nextID ++;
    var constantPool = abc.constantPool;
    var methods = abc.methods;

    this.name = constantPool.multinames[stream.readU30()];
    release || assert(Multiname.isQName(this.name));
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
    attachHolder(this.init, this);
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
  var nextID = 1;
  function classInfo(abc, instanceInfo, stream) {
    this.id = nextID ++;
    this.init = abc.methods[stream.readU30()];
    attachHolder(this.init, this);
    this.traits = parseTraits(abc, stream, this);
    this.instanceInfo = instanceInfo;
  }

  classInfo.prototype.toString = function() {
    return this.instanceInfo.name.toString();
  };

  return classInfo;
})();

var ScriptInfo = (function scriptInfo() {
  var nextID = 1;
  function scriptInfo(abc, idx, stream) {
    this.id = nextID ++;
    this.name = abc.name + "$script" + idx;
    this.init = abc.methods[stream.readU30()];
    attachHolder(this.init, this);
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
    Timer.start("Parse");
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

    InlineCacheManager.updateInlineCaches(this);

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
      release || assert(this.scripts.length > 0);
      return this.scripts[this.scripts.length - 1];
    },
    toString: function () {
      return this.name;
    }
  };

  return abcFile;
})();
