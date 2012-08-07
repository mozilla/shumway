/**
 * Shumway ships with its own version of the AS3 builtin library, which
 * maintains interface compatibility with the stock builtin library, viz. the
 * same members in the same order.
 *
 * Shumway also uses the [native] metadata tag but interprets them
 * differently. Metadata can _only_ be attached to slots. The asc compiler is
 * laughably bad at parsing metadata tags in light of semicolon insertion, so
 * be sure to semicolon-terminate everything.
 *
 * Using [native] on methods
 * ---------------------------
 *
 * The [native] metadata can be attached to methods. The VM ignores them unless
 * the method is also marked as native:
 *
 *   class C {
 *     ...
 *
 *     [native("fooInJS")]
 *     public native function foo();
 *
 *     ...
 *   }
 *
 * This marks the instance method |foo| as the native function |fooInJS|. Note
 * the string inside [native] is _not_ arbitrary JavaScript.
 *
 * The VM keeps an object of exported natives, |natives|. Whenever something
 * via [native] is looked up, it is only looked up in the |natives|
 * object. The above code looks up |natives.fooInJS|.
 *
 * Implementing native methods
 * ---------------------------
 *
 * Native methods may need to do scope lookups in the scope where it is
 * defined in ActionScript. Because of this, all native methods must be
 * implemented as functions that take a scope and returns the actual native
 * function, so the implementation can close over the scope. For the above
 * example,
 *
 *   natives.fooInJS = function fooInJS(scope) {
 *     return function () {
 *       // actual code here
 *     };
 *   };
 *
 * Using [native] on classes
 * ---------------------------
 *
 * Entire classes can be made native by prefixing the class definition with
 * [native]:
 *
 *   [native(cls="CClass")]
 *   class C {
 *     ...
 *
 *     public native function foo(i)
 *
 *     ...
 *   }
 *
 * The cls= syntax is to maintain parity with how it's done in Tamarin, as we
 * run stock player globals but have custom language-level builtin shims
 * (e.g. for Object, Array, etc).
 *
 * This lets the VM automatically resolve native methods that don't have their
 * own [native].
 *
 * For a native class |CClass|, resolution on a method |m| is done as follows.
 *
 *   If |m| is a...
 *
 *     instance method - |CClass.nativeMethods.m|
 *     static method   - |CClass.nativeStatics.m|
 *     getter          - |CClass.nativeMethods["get m"]|
 *     setter          - |CClass.nativeMethods["set m"]|
 *     static getter   - |CClass.nativeStatics["get m"]|
 *     static setter   - |CClass.nativeStatics["set m"]|
 *
 * Implementing native classes
 * ---------------------------
 *
 * Like native methods, native classes also may need to do scope lookups. It
 * might also need to run the ActionScript instance constructor, so native
 * classes are implemented as functions taking a scope, the instance
 * constructor, and the base class, and returns a |Class| object.
 *
 * Classes in ActionScript may be called like functions. For builtin classes,
 * this often is the same as constructing an instance of that class,
 * viz. |Array(0)| is the same as |new Array(0)|. For user-defined classes,
 * this is usually coercion. The |callable| argument in the |Class|
 * constructor, if non-null, must contain |call| and a |apply| properties,
 * which are functions to be used for calling the class as a function.
 *
 * Convenience callables are provided via |Class.passthroughCallable|, which
 * takes a function |f| and uses it as the callable, and
 * |Class.constructingCallable|, which takes a function |instance| and uses it
 * to construct a new instance when the class is called.
 *
 * IMPORTANT! Inheritance must be done _manually_ by calling |extend|. This
 *            _clobbers_ the old instance prototype!
 *
 * For the above example, we would write:
 *
 *   natives.CClass = function CClass(runtime, scope, instance, baseClass) {
 *     function CInstance() {
 *       // If we wanted to call the AS constructor we would do
 *       // |instance.apply(this, arguments)|
 *     }
 *
 *     // Pass no callable for now, in the future we might do coercion.
 *     var c = new Class("C", CInstance);
 *
 *     // Define the "foo" function.
 *     CInstance.prototype.foo = function foo() {
 *       // code for public native function foo
 *     };
 *
 *     // Export everything in CInstance.prototype.
 *     c.nativeMethods = CInstance.prototype;
 *
 *     return c;
 *   };
 */

const natives = (function () {

  function glue(inner, proxy) {
    inner.p = proxy;
    proxy.d = inner;
    return proxy;
  }

  const C = Domain.passthroughCallable;
  const CC = Domain.constructingCallable;

  /**
   * Object.as
   */
  function ObjectClass(runtime, scope, instance, baseClass) {
    var c = new runtime.domain.system.Class("Object", Object, C(Object));

    c.nativeMethods = {
      isPrototypeOf: Object.prototype.isPrototypeOf,
      hasOwnProperty: function (name) {
        name = "public$" + name;
        if (this.hasOwnProperty(name)) {
          return true;
        }
        // Object.getPrototypeOf(this) are traits, not the dynamic prototype.
        return Object.getPrototypeOf(this).hasOwnProperty(name);
      },
      propertyIsEnumerable: function (name) {
        return Object.prototype.propertyIsEnumerable.call(this, "public$" + name);
      }
    };
    c.nativeStatics = {
      _setPropertyIsEnumerable: function _setPropertyIsEnumerable(obj, name, isEnum) {
        var prop = "public$" + name;
        var descriptor = Object.getOwnPropertyDescriptor(obj, prop);
        descriptor.enumerable = false;
        Object.defineProperty(obj, prop, descriptor);
      }
    };

    c.dynamicPrototype = Object.prototype;
    c.defaultValue = null;
    return c;
  }

  /**
   * Class.as
   */
  function ClassClass(runtime, scope, instance, baseClass) {
    var c = runtime.domain.system.Class;
    c.prototype.extendBuiltin.call(c, baseClass);
    return c;
  }

  /**
   * Boolean.as
   */
  function BooleanClass(runtime, scope, instance, baseClass) {
    var c = new runtime.domain.system.Class("Boolean", Boolean, C(Boolean));
    c.extendBuiltin(baseClass);
    c.nativeMethods = Boolean.prototype;
    c.coerce = Boolean;
    return c;
  }

  /**
   * Function.as
   */
  function FunctionClass(runtime, scope, instance, baseClass) {
    var c = new runtime.domain.system.Class("Function", Function, C(Function));
    c.extendBuiltin(baseClass);

    var m = Function.prototype;
    defineNonEnumerableProperty(m, "get prototype", function () { return this.prototype; });
    defineNonEnumerableProperty(m, "set prototype", function (p) { this.prototype = p; });
    defineNonEnumerableProperty(m, "get length", function () { return this.length; });
    c.nativeMethods = m;
    c.isInstance = function (value) {
      return typeof value === "function";
    };

    return c;
  }

  function MethodClosureClass(runtime, scope, instance, baseClass) {
    var c = new runtime.domain.system.Class("MethodClosure", runtime.domain.system.MethodClosure);
    c.extendBuiltin(baseClass);
    return c;
  }

  /**
   * String.as
   */
  function StringClass(runtime, scope, instance, baseClass) {
    var c = new runtime.domain.system.Class("String", String, C(String));
    c.extendBuiltin(baseClass);

    var m = String.prototype;
    defineNonEnumerableProperty(m, "get length", function () { return this.length; });
    c.nativeMethods = m;
    c.nativeStatics = String;
    c.isInstance = function (value) {
      return typeof value.valueOf() === "string";
    };

    return c;
  }

  /**
   * Array.as
   */
  function ArrayClass(runtime, scope, instance, baseClass) {
    var c = new runtime.domain.system.Class("Array", Array, C(Array));
    c.extendBuiltin(baseClass);

    var m = Array.prototype;
    defineNonEnumerableProperty(m, "get length", function() { return this.length; });
    defineNonEnumerableProperty(m, "set length", function(l) { this.length = l; });
    c.nativeMethods = m;

    return c;
  }

  /**
   * Vector.as
   */

  /**
   * Creates a typed Vector class. It steals the Array object from a new global
   * and overrides its GET/SET ACCESSOR methods to do the appropriate coercions.
   * If the |type| argument is undefined it creates the untyped Vector class.
   */
  function createVectorClass(runtime, type, baseClass) {
    var TypedArray = createNewGlobalObject().Array;

    // Breaks semantics with bounds checking for now.
    if (type) {
      const coerce = type.instance;
      var TAp = TypedArray.prototype;
      TAp.indexGet = function (i) { return this[i]; };
      TAp.indexSet = function (i, v) { this[i] = coerce(v); };
    }

    function TypedVector (length, fixed) {
      var array = new TypedArray(length);
      for (var i = 0; i < length; i++) {
        array[i] = type ? type.defaultValue : undefined;
      }
      return array;
    }
    TypedVector.prototype = TypedArray.prototype;
    var name = type ? "Vector$" + type.classInfo.instanceInfo.name.name : "Vector";
    var c = new runtime.domain.system.Class(name, TypedVector, C(TypedVector));
    var m = TypedArray.prototype;

    defineReadOnlyProperty(TypedArray.prototype, "class", c);

    defineNonEnumerableProperty(m, "get fixed", function () { return false; });
    defineNonEnumerableProperty(m, "set fixed", function (v) { });

    defineNonEnumerableProperty(m, "get length", function () { return this.length; });
    defineNonEnumerableProperty(m, "set length", function setLength(length) {
      // TODO: Fill with zeros if we need to.
      this.length = length;
    });

    c.extendBuiltin(baseClass);
    c.nativeMethods = m;
    c.nativeStatics = {};
    c.vectorType = type;
    c.isInstance = function (value) {
      if (value === null || typeof value !== "object") {
        return false;
      }
      if (!this.instance.vectorType && value.class.vectorType) {
        return true;
      }
      return this.instance.prototype.isPrototypeOf(value);
    };

    return c;
  }

  function VectorClass(runtime, scope, instance) {
    return createVectorClass(runtime, undefined);
  }

  function ObjectVectorClass(runtime, scope, instance, baseClass) {
    return createVectorClass(runtime, runtime.domain.getClass("Object"));
  }

  function IntVectorClass(runtime, scope, instance, baseClass) {
    return createVectorClass(runtime, runtime.domain.getClass("int"));
  }

  function UIntVectorClass(runtime, scope, instance, baseClass) {
    return createVectorClass(runtime, runtime.domain.getClass("uint"));
  }

  function DoubleVectorClass(runtime, scope, instance, baseClass) {
    return createVectorClass(runtime, runtime.domain.getClass("Number"));
  }

  /**
   * Number.as
   */
  function NumberClass(runtime, scope, instance, baseClass) {
    var c = new runtime.domain.system.Class("Number", Number, C(Number));
    c.extendBuiltin(baseClass);
    c.nativeMethods = Number.prototype;
    c.defaultValue = Number(0);
    c.isInstance = function (value) {
      return typeof value.valueOf() === "number";
    };
    c.coerce = Number;
    return c;
  }

  function intClass(runtime, scope, instance, baseClass) {
    function int(x) {
      return Number(x) | 0;
    }

    var c = new runtime.domain.system.Class("int", int, C(int));
    c.extendBuiltin(baseClass);
    c.defaultValue = 0;
    c.isInstance = function (value) {
      return (value | 0) === value;
    };
    c.coerce = int;
    return c;
  }

  function uintClass(runtime, scope, instance, baseClass) {
    function uint(x) {
      return Number(x) >>> 0;
    }

    var c = new runtime.domain.system.Class("uint", uint, C(uint));
    c.extend(baseClass);
    c.defaultValue = 0;
    c.isInstance = function (value) {
      return (value >>> 0) === value;
    };
    c.coerce = uint;
    return c;
  }

  /**
   * Math.as
   */
  function MathClass(runtime, scope, instance, baseClass) {
    var c = new runtime.domain.system.Class("Math");
    c.nativeStatics = Math;
    return c;
  }

  /**
   * Date.as
   */
  function DateClass(runtime, scope, instance, baseClass) {
    var c = new runtime.domain.system.Class("Date", Date, C(Date));
    c.extendBuiltin(baseClass);
    c.nativeMethods = Date.prototype;
    c.nativeStatics = Date;
    return c;
  }

  /**
   * Error.as
   */
  function makeErrorClass(name) {
    return function (runtime, scope, instance, baseClass) {
      var c = new runtime.domain.system.Class(name, instance, CC(instance));
      c.extend(baseClass);
      c.nativeMethods = {
        getStackTrace: function () {
          return "TODO: getStackTrace";
        }
      };
      c.nativeStatics = {
        getErrorMessage: function() {
          return "TODO: getErrorMessage";
        }
      };
      return c;
    };
  }

  /**
   * RegExp.as
   *
   * AS RegExp adds two new flags:
   *  /s (dotall)   - makes . also match \n
   *  /x (extended) - allows different formatting of regexp
   *
   * TODO: Should we support extended at all? Or even dotall?
   */
  function RegExpClass(runtime, scope, instance, baseClass) {
    function ASRegExp(pattern, flags) {
      function stripFlag(flags, c) {
        flags[flags.indexOf(c)] = flags[flags.length - 1];
        return flags.substr(0, flags.length - 1);
      }

      if (flags) {
        var re;
        var extraProps = {};

        if (flags.indexOf("s") >= 0) {
          pattern = pattern.replace(/\./, "(.|\n)");
          flags = stripFlags(flags, "s");
          extraProps.push({ key: "dotall", value: true });
        }

        re = new RegExp(pattern, flags);

        for (var i = 0, j = extraProps.length; i < j; i++) {
          var prop = extraProps[i];
          re[prop.key] = prop.value;
        }

        return re;
      }

      return new RegExp(pattern, flags);
    }
    ASRegExp.prototype = RegExp.prototype;

    var c = new runtime.domain.system.Class("RegExp", ASRegExp, C(ASRegExp));
    c.extendBuiltin(baseClass);

    var m = RegExp.prototype;
    defineNonEnumerableProperty(m, "get global", function () { return this.global; });
    defineNonEnumerableProperty(m, "get source", function () { return this.source; });
    defineNonEnumerableProperty(m, "get ignoreCase", function () { return this.ignoreCase; });
    defineNonEnumerableProperty(m, "get multiline", function () { return this.multiline; });
    defineNonEnumerableProperty(m, "get lastIndex", function () { return this.lastIndex; });
    defineNonEnumerableProperty(m, "set lastIndex", function (i) { this.lastIndex = i; });
    defineNonEnumerableProperty(m, "get dotall", function () { return this.dotall; });
    defineNonEnumerableProperty(m, "get extended", function () { return this.extended; });
    c.nativeMethods = m;

    return c;
  }

  /**
   * Namespace.as
   */
  function NamespaceClass(runtime, scope, instance, baseClass) {
    function ASNamespace(prefixValue, uriValue) {
      if (uriValue === undefined) {
        uriValue = prefixValue;
        prefixValue = undefined;
      }

      // TODO: when uriValue is a QName
      if (prefixValue !== undefined) {
        if (typeof isXMLName === "function") {
          prefixValue = String(prefixValue);
        }

        uriValue = String(uriValue);
      } else if (uriValue !== undefined) {
        if (uriValue.constructor === Namespace) {
          return uriValue.clone();
        }
      }

      /**
       * XXX: Not sure if this is right for whatever E4X bullshit this is used
       * for.
       */
      var ns = Namespace.createNamespace(uriValue);
      ns.prefix = prefixValue;

      return ns;
    }

    var Np = Namespace.prototype;
    ASNamespace.prototype = Np;

    var c = new runtime.domain.system.Class("Namespace", ASNamespace, C(ASNamespace));
    c.extendBuiltin(baseClass);

    c.nativeMethods = {
      "get prefix": Np.getPrefix,
      "get uri": Np.getURI
    };

    return c;
  }

  /**
   * Capabilities.as
   */
  function CapabilitiesClass(runtime, scope, instance, baseClass) {
    function Capabilities() {}
    var c = new runtime.domain.system.Class("Capabilities", Capabilities, C(Capabilities));
    c.extend(baseClass);
    c.nativeStatics = {
      "get playerType": function () { return "AVMPlus"; }
    };
    return c;
  }

  function constant(x) {
    return function () {
      return x;
    };
  }

  /**
   * ByteArray.as
   */
  function ByteArrayClass(runtime, scope, instance, baseClass) {
    /* The initial size of the backing, in bytes. Doubled every OOM. */
    const INITIAL_SIZE = 128;

    function ByteArray() {
      var a = new ArrayBuffer(INITIAL_SIZE);
      this.a = a;
      this.length = 0;
      this.position = 0;
      this.cacheViews();
      this.nativele = new Int8Array(new Int32Array([]).buffer)[0] === 1;
      this.le = this.nativele;
    }

    function throwEOFError() {
      runtime.throwErrorFromVM("flash.errors.EOFError", "End of file was encountered.");
    }

    function get(b, m, size) {
      if (b.position + size > b.length) {
        throwEOFError();
      }
      var v = b.view[m](b.position, b.le);
      b.position += size;
      return v;
    }

    function set(b, m, size, v) {
      var len = b.position + size;
      b.ensureCapacity(len);
      b.view[m](b.position, v, b.le);
      b.position = len;
      if (len > b.length) {
        b.length = len;
      }
    }

    var c = new runtime.domain.system.Class("ByteArray", ByteArray, C(ByteArray));

    var m = ByteArray.prototype;

    m.cacheViews = function cacheViews() {
      var a = this.a;
      this.int8v  = new Int8Array(a);
      this.uint8v = new Uint8Array(a);
      this.view   = new DataView(a);
    };

    m.ensureCapacity = function ensureCapacity(size) {
      var origa = this.a;
      if (origa.byteLength < size) {
        var newSize = origa.byteLength;
        while (newSize < size) {
          newSize *= 2;
        }
        var copya = new ArrayBuffer(newSize);
        var origv = this.int8v;
        this.a = copya;
        this.cacheViews();
        this.int8v.set(origv);
      }
    };

    m.clear = function clear() {
      this.length = 0;
      this.position = 0;
    };

    /**
     * For byte-sized reads and writes we can just go through the |Uint8Array| and not
     * the slower DataView.
     */
    m.readBoolean = function readBoolean() {
      if (this.position + 1 > this.length) {
        throwEOFError();
      }
      return this.int8v[this.position++] !== 0;
    };

    m.readByte = function readByte() {
      if (this.position + 1 > this.length) {
        throwEOFError();
      }
      return this.int8v[this.position++];
    };

    m.readUnsignedByte = function readUnsignedByte() {
      if (this.position + 1 > this.length) {
        throwEOFError();
      }
      return this.uint8v[this.position++];
    };

    m.readBytes = function readBytes(bytes, offset, length) {
      var pos = this.position;
      if (pos + length > this.length) {
        throwEOFError();
      }
      bytes.int8v.set(new Int8Array(this.a, pos, length), offset);
      this.position += length;
    };

    m.writeBoolean = function writeBoolean(v) {
      var len = this.position + 1;
      this.ensureCapacity(len);
      this.int8v[this.position++] = !!v ? 1 : 0;
      if (len > this.length) {
        this.length = len;
      }
    };

    m.writeByte = function writeByte(v) {
      var len = this.position + 1;
      this.ensureCapacity(len);
      this.int8v[this.position++] = v;
      if (len > this.length) {
        this.length = len;
      }
    };

    m.writeUnsignedByte = function writeByte(v) {
      var len = this.position + 1;
      this.ensureCapacity(len);
      this.uint8v[this.position++] = v;
      if (len > this.length) {
        this.length = len;
      }
    };

    m.writeRawBytes = function writeRawBytes(bytes) {
      var len = this.position + bytes.length;
      this.ensureCapacity(len);
      this.int8v.set(bytes, this.position);
      this.position = len;
      if (len > this.length) {
        this.length = len;
      }
    };

    m.writeBytes = function writeBytes(bytes, offset, length) {
      if (offset && length) {
        this.writeRawBytes(new Int8Array(bytes.a, offset, length));
      } else {
        this.writeRawBytes(bytes.int8v);
      }
    };

    m.readDouble = function readDouble() { return get(this, 'getFloat64', 8); };
    m.readFloat = function readFloat() { return get(this, 'getFloat32', 4); };
    m.readInt = function readInt() { return get(this, 'getInt32', 4); };
    m.readShort = function readShort() { return get(this, 'getInt16', 2); };
    m.readUnsignedInt = function readUnsignedInt() { return get(this, 'getUint32', 4); };
    m.readUnsignedShort = function readUnsignedShort() { return get(this, 'getUint16', 2); };

    m.writeDouble = function writeDouble(v) { set(this, 'setFloat64', 8, v); };
    m.writeFloat = function writeFloat(v) { set(this, 'setFloat32', 4, v); };
    m.writeInt = function writeInt(v) { set(this, 'setInt32', 4, v); };
    m.writeShort = function writeShort(v) { set(this, 'setInt16', 2, v); };
    m.writeUnsignedInt = function writeUnsignedInt(v) { set(this, 'setUint32', 4, v); };
    m.writeUnsignedShort = function writeUnsignedShort(v) { set(this, 'setUint16', 2, v); };

    m.readUTF = function readUTF() {
      return this.readUTFBytes(this.readShort());
    };

    m.readUTFBytes = function readUTFBytes(length) {
      var pos = this.position;
      if (pos + length > this.length) {
        throwEOFError();
      }
      this.position += length;
      return utf8encode(new Int8Array(this.a, pos, length));
    };

    m.writeUTF = function writeUTF(str) {
      var bytes = utf8decode(str);
      this.writeShort(bytes.length);
      this.writeRawBytes(bytes);
    };

    m.writeUTFBytes = function writeUTFBytes(str) {
      var bytes = utf8decode(str);
      this.writeRawBytes(bytes);
    };

    m.toString = function toString() {
      return utf8encode(new Int8Array(this.a, 0, this.length));
    };

    defineNonEnumerableProperty(m, "get length", function () { return this.length; });
    defineNonEnumerableProperty(m, "set length", function setLength(length) {
      var cap = this.a.byteLength;
      /* XXX: Do we need to zero the difference if length <= cap? */
      if (length > cap) {
        this.ensureSize(length);
      }
      this.length = length;
    });
    defineNonEnumerableProperty(m, "get bytesAvailable", function () { return this.a.byteLength - this.position; });
    defineNonEnumerableProperty(m, "get position", function () { return this.position; });
    defineNonEnumerableProperty(m, "set position", function (p) { this.position = p; });
    defineNonEnumerableProperty(m, "get endian", function () { return this.le ? "littleEndian" : "bigEndian"; });
    defineNonEnumerableProperty(m, "set endian", function (e) { this.le = e === "littleEndian"; });

    c.nativeMethods = m;

    return c;
  }

  /**
   * ApplicationDomain.as
   */
  function ApplicationDomainClass(runtime, scope, instance, baseClass) {
    var c = new runtime.domain.system.Class("ApplicationDomain", instance, C(instance));
    c.extend(baseClass);

    c.nativeMethods = {
      ctor: function (parentDomain) {
        // If no parent domain is passed in, get the current system domain.
        var parent;
        if (!parentDomain) {
          parent = Runtime.stack.top().domain.system;
        } else {
          parent = parentDomain.d;
        }

        glue(new Domain(parent.vm, parent), this);
      },

      "get parentDomain": function () {
        var base = this.d.base;

        if (!base) {
          return undefined;
        }

        if (base.p) {
          return base.p;
        }

        return glue(base, new instance());
      },

      getDefinition: function (name) {
        return this.d.getProperty(Multiname.fromSimpleName(name), false, true);
      },

      hasDefinition: function (name) {
        return !!this.d.findProperty(Multiname.fromSimpleName(name), false, false);
      }
    };

    c.nativeStatics = {
      "get currentDomain": function () {
        var domain = Runtime.stack.top().domain;

        if (domain.p) {
          return domain.p;
        }

        return glue(domain, new instance());
      }
    };

    return c;
  }

  function debugBreak(message) {
    // TODO: Set Breakpoint Here
    return message;
  }

  return {
    /**
     * Shell toplevel.
     */
    print: constant(print),
    notImplemented: constant(notImplemented),
    debugBreak: constant(debugBreak),

    /**
     * actionscript.lang.as
     */
    decodeURI: constant(decodeURI),
    decodeURIComponent: constant(decodeURIComponent),
    encodeURI: constant(encodeURI),
    encodeURIComponent: constant(encodeURIComponent),
    isNaN: constant(isNaN),
    isFinite: constant(isFinite),
    parseInt: constant(parseInt),
    parseFloat: constant(parseFloat),
    escape: constant(escape),
    unescape: constant(unescape),
    isXMLName: constant(typeof (isXMLName) !== "undefined" ? isXMLName : function () {
      notImplemented("Chrome doesn't support isXMLName.");
    }),

    /**
     * Unsafes for directly hooking up prototype.
     */
    Function: Function,
    String: String,
    Array: Array,
    Number: Number,
    Boolean: Boolean,
    Math: Math,
    Date: Date,
    RegExp: RegExp,

    /**
     * Classes.
     */
    ObjectClass: ObjectClass,
    Class: ClassClass,
    NamespaceClass: NamespaceClass,
    FunctionClass: FunctionClass,
    MethodClosureClass: MethodClosureClass,
    BooleanClass: BooleanClass,
    StringClass: StringClass,
    NumberClass: NumberClass,
    intClass: intClass,
    uintClass: uintClass,
    ArrayClass: ArrayClass,
    VectorClass: VectorClass,
    ObjectVectorClass: ObjectVectorClass,
    IntVectorClass: IntVectorClass,
    UIntVectorClass: UIntVectorClass,
    DoubleVectorClass: DoubleVectorClass,
    ByteArrayClass: ByteArrayClass,

    ErrorClass: makeErrorClass("Error"),
    DefinitionErrorClass: makeErrorClass("DefinitionError"),
    EvalErrorClass: makeErrorClass("EvalError"),
    RangeErrorClass: makeErrorClass("RangeError"),
    ReferenceErrorClass: makeErrorClass("ReferenceError"),
    SecurityErrorClass: makeErrorClass("SecurityError"),
    SyntaxErrorClass: makeErrorClass("SyntaxError"),
    TypeErrorClass: makeErrorClass("TypeError"),
    URIErrorClass: makeErrorClass("URIError"),
    VerifyErrorClass: makeErrorClass("VerifyError"),
    UninitializedErrorClass: makeErrorClass("UninitializedError"),
    ArgumentErrorClass: makeErrorClass("ArgumentError"),

    DateClass: DateClass,
    MathClass: MathClass,
    RegExpClass: RegExpClass,

    CapabilitiesClass: CapabilitiesClass,
    ApplicationDomainClass: ApplicationDomainClass,

    /**
     * DescribeType.as
     */
    getQualifiedClassName: constant(function (value) {
      if (typeof (value) === "number") {
        if ((value | 0) === value) {
          return "int";
        } else {
          return "Number";
        }
      } else {
        return notImplemented(value);
      }
    })
  };

})();

function getNative(p) {
  var chain = p.split(".");
  var v = natives;
  for (var i = 0, j = chain.length; i < j; i++) {
    v = v && v[chain[i]];
  }
  return v;
}
