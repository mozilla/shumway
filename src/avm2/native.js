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
 * The cls= syntax is to maintain parity with how it's done in Tamarin, in
 * case we need to run stock player globals but plug in our native classes.
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
 *   natives.CClass = function CClass(scope, instance, baseClass) {
 *     function CInstance() {
 *       // If we wanted to call the AS constructor we would do
 *       // |instance.apply(this, arguments)|
 *     }
 *
 *     // Pass no callable for now, in the future we might do coercion.
 *     var c = new Class("C", CInstance);
 *
 *     // Inherit. This overwrites |CInstance.prototype|!
 *     c.extend(baseClass);
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

var Interface = (function () {
  function Interface(name) {
    this.name = name;
  }
  Interface.prototype = {
    toString: function () {
      return "[interface " + this.name + "]";
    }
  };
  return Interface;
})();

var Class = (function () {

  function Class(name, instance, callable) {
    function defaultCallable() {
      notImplemented("class callable");
    }

    this.debugName = name;

    if (instance) {
      this.instance = instance;
      defineNonEnumerableProperty(instance.prototype, "public$constructor", this);
    }

    /**
     * Classes can be called like functions. For user-defined classes this is
     * coercion, for some of the builtins they behave like their counterparts
     * in JS.
     */
    if (callable) {
      defineNonEnumerableProperty(this, "call", callable.call);
      defineNonEnumerableProperty(this, "apply", callable.apply);
    } else {
      defineNonEnumerableProperty(this, "call", defaultCallable);
      defineNonEnumerableProperty(this, "apply", defaultCallable);
    }
  }

  Class.prototype = {
    extend: function (baseClass) {
      this.instance.prototype = Object.create(baseClass.instance.prototype);
      this.baseClass = baseClass;
    },

    makeSimpleNativeAccessors: function makeSimpleNativeAccessors(prefix, props) {
      const nativeMethods = this.nativeMethods;
      props.forEach(function (prop) {
        nativeMethods[prefix + " " + prop] = function () {
          return this[prop];
        };
      });
    },

    toString: function () {
      return "[class " + this.debugName + "]";
    }
  };
  defineNonEnumerableProperty(Class.prototype, "public$constructor", Class);

  Class.instance = Class;

  Class.passthroughCallable = function passthroughCallable(f) {
    return {
      call: function ($this) {
        Array.prototype.pop.call(arguments);
        return f.apply($this, arguments);
      },
      apply: function ($this, args) {
        return f.apply($this, args);
      }
    };
  };

  Class.constructingCallable = function constructingCallable(instance) {
    return {
      call: function ($this) {
        return new Function.bind.apply(instance, arguments);
      },
      apply: function ($this, args) {
      return new Function.bind.apply(instance, [$this].concat(args));
      }
    };
  };

  Class.nativeMethods = {
    "get prototype": function () { return this.instance.prototype; }
  };

  return Class;

})();

var MethodClosure = (function () {

  function MethodClosure($this, fn) {
    var bound = fn.bind($this);
    defineNonEnumerableProperty(this, "call", bound.call.bind(bound));
    defineNonEnumerableProperty(this, "apply", bound.apply.bind(bound));
  }

  MethodClosure.prototype = {
    toString: function () {
      return "function Function() {}";
    }
  };

  return MethodClosure;

})();

const natives = (function () {

  /**
   * To get |toString| and |valueOf| to work transparently, as in without
   * reimplementing stuff like trace and +.
   */
  const originalObjectToString = Object.prototype.toString;
  const originalObjectValueOf = Object.prototype.valueOf;

  Object.prototype.toString = function () {
    if ("public$toString" in this) {
      return this.public$toString();
    }
    return originalObjectToString.call(this);
  };

  Object.prototype.valueOf = function () {
    if ("public$valueOf" in this) {
      return this.public$valueOf();
    }
    return originalObjectValueOf.call(this);
  };

  const C = Class.passthroughCallable;
  const CC = Class.constructingCallable;

  /**
   * Object.as
   */
  function ObjectClass(scope, instance, baseClass) {
    var c = new Class("Object", Object, C(Object));

    c.nativeMethods = Object.prototype;
    c.nativeStatics = {
      _setPropertyIsEnumerable: function _setPropertyIsEnumerable(obj, name, isEnum) {
        Object.defineProperty(obj, name, { enumerable: isEnum });
      }
    };

    return c;
  }

  /**
   * Boolean.as
   */
  function BooleanClass(scope, instance, baseClass) {
    var c = new Class("Boolean", Boolean, C(Boolean));
    c.baseClass = baseClass;
    c.nativeMethods = Boolean.prototype;
    return c;
  }

  /**
   * Function.as
   */
  function FunctionClass(scope, instance, baseClass) {
    var c = new Class("Function", Function, C(Function));
    c.baseClass = baseClass;

    var m = Function.prototype;
    defineNonEnumerableProperty(m, "get prototype", function () { return this.prototype; });
    defineNonEnumerableProperty(m, "set prototype", function (p) { this.prototype = p; });
    defineNonEnumerableProperty(m, "get length", function () { return this.length; });
    c.nativeMethods = m;

    return c;
  }

  function MethodClosureClass(scope, instance, baseClass) {
    var c = new Class("MethodClosure", MethodClosure);
    c.extend(baseClass);
    return c;
  }

  /**
   * String.as
   */
  function StringClass(scope, instance, baseClass) {
    var c = new Class("String", String, C(String));
    c.baseClass = baseClass;

    var m = String.prototype;
    defineNonEnumerableProperty(m, "get length", function () { return this.length; });
    c.nativeMethods = m;
    c.nativeStatics = String;

    return c;
  }

  /**
   * Array.as
   */
  function ArrayClass(scope, instance, baseClass) {
    var c = new Class("Array", Array, C(Array));
    c.baseClass = baseClass;

    var m = Array.prototype;
    defineNonEnumerableProperty(m, "get length", function() { return this.length; });
    defineNonEnumerableProperty(m, "set length", function(l) { this.length = l; });
    c.nativeMethods = m;

    return c;
  }

  /**
   * Vector.as
   */
  function VectorClass(scope, instance, baseClass) {
    // TODO: Not implemented
    var c = new Class("Vector", Array, C(Array));
    c.baseClass = baseClass;

    var m = Array.prototype;
    c.nativeMethods = m;

    return c;
  }

  function ObjectVectorClass(scope, instance, baseClass) {
    // TODO: Not implemented
    var c = new Class("Vector$object", Array, C(Array));
    c.baseClass = baseClass;

    var m = Array.prototype;
    c.nativeMethods = m;
    c.nativeStatics = {};

    return c;
  }

  function IntVectorClass(scope, instance, baseClass) {
    // TODO: Not implemented
    var c = new Class("Vector$int", Array, C(Array));
    c.baseClass = baseClass;

    var m = Array.prototype;
    c.nativeMethods = m;
    c.nativeStatics = {};

    return c;
  }

  function UIntVectorClass(scope, instance, baseClass) {
    // TODO: Not implemented
    var c = new Class("Vector$uint", Array, C(Array));
    c.baseClass = baseClass;

    var m = Array.prototype;
    c.nativeMethods = m;
    c.nativeStatics = {};

    return c;
  }

  function DoubleVectorClass(scope, instance, baseClass) {
    // TODO: Not implemented
    var c = new Class("Vector$double", Array, C(Array));
    c.baseClass = baseClass;

    var m = Array.prototype;
    c.nativeMethods = m;
    c.nativeStatics = {};

    return c;
  }

  /**
   * Number.as
   */
  function NumberClass(scope, instance, baseClass) {
    var c = new Class("Number", Number, C(Number));
    c.baseClass = baseClass;
    c.nativeMethods = Number.prototype;
    return c;
  }

  function intClass(scope, instance, baseClass) {
    function int(x) {
      return Number(x) | 0;
    }

    var c = new Class("int", int, C(int));
    c.baseClass = baseClass;
    return c;
  }

  function uintClass(scope, instance, baseClass) {
    function uint(x) {
      return Number(x) >>> 0;
    }

    var c = new Class("uint", uint, C(uint));
    c.baseClass = baseClass;
    return c;
  }

  /**
   * Math.as
   */
  function MathClass(scope, instance, baseClass) {
    var c = new Class("Math");
    c.baseClass = baseClass;
    c.nativeStatics = Math;
    return c;
  }

  /**
   * Date.as
   */
  function DateClass(scope, instance, baseClass) {
    var c = new Class("Date", Date, C(Date));
    c.baseClass = baseClass;
    c.nativeMethods = Date.prototype;
    c.nativeStatics = Date;
    return c;
  }

  /**
   * Error.as
   */
  function makeErrorClass(name) {
    return function (scope, instance, baseClass) {
      var c = new Class(name, instance, CC(instance));
      c.extend(baseClass);
      c.nativeMethods = {
        getStackTrace: function () {
          return "TODO: geStackTrace";
        }
      };
      c.nativeStatics = {
        getErrorMessage: function() {
          return "TODO: getErrorMessage";
        }
      };
      return c;
    }
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
  function RegExpClass(scope, instance, baseClass) {
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

    var c = new Class("RegExp", ASRegExp, C(ASRegExp));
    c.baseClass = baseClass;

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
  function NamespaceClass(scope, instance, baseClass) {
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

    var c = new Class("Namespace", ASNamespace, C(ASNamespace));
    c.baseClass = baseClass;

    c.nativeMethods = {
      "get prefix": Np.getPrefix,
      "get uri": Np.getURI
    };

    return c;
  }

  /**
   * Capabilities.as
   */
  function CapabilitiesClass(scope, instance, baseClass) {
    function Capabilities () {}
    var c = new Class("Capabilities", Capabilities, C(Capabilities));
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

  return {
    /**
     * Shell toplevel.
     */
    print: constant(print),
    notImplemented: constant(notImplemented),

    /**
     * To prevent unbounded recursion.
     */
    originalObjectToString: originalObjectToString,
    originalObjectValueOf: originalObjectValueOf,

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
    Math: Math,
    Date: Date,
    RegExp: RegExp,

    /**
     * Classes.
     */
    ObjectClass: ObjectClass,
    Class: constant(Class),
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
  }

})();

function getNative(p) {
  var chain = p.split(".");
  var v = natives;
  for (var i = 0, j = chain.length; i < j; i++) {
    v = v && v[chain[i]];
  }
  return v;
}
