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
 *     instance method - |CClass.native.instance.m|
 *     static method   - |CClass.native.static.m|
 *     getter          - |CClass.native.instance.m.get|
 *     setter          - |CClass.native.static.m.set|
 *     static getter   - |CClass.native.instance.m.set|
 *     static setter   - |CClass.native.static.m.set|
 *
 * Implementing native classes the hard way
 * ----------------------------------------
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
 *     c.native = {
 *       instance: CInstance.prototype
 *     };
 *
 *     return c;
 *   };
 *
 * Linking Definitions
 * -------------------
 *
 * Outside of special builtins that need special behaviors, such as Function,
 * Array, etc, most of the globals we implement are playerGlobal globals which
 * behave more uniformly.
 *
 * For integration with the Flash runtime, we should like a singular
 * representation for both AVM2 and renderer objects to reduce the need for
 * translation from AVM2 objects to flash objects on every function call that
 * crosses the native to ActionScript boundary (which are many).
 *
 * To achieve this, definitions of native objects (the methods, etc) and its
 * glue are declared as a plain JS object and mixed in to the native instance
 * prototype when AVM2 creates the actual native class.
 *
 * Glue helpers are provided for both native (calling JS from AS) and script
 * (calling AS from JS) properties. The latter is needed for classes like
 * Point, which have a native counterpart, but whose logic is all implemented
 * in ActionScript.
 *
 * For a class C,
 *
 *   var CDefinition = {
 *     initialize: function () { print("init"); },
 *     m: function m() { print("m"); },
 *     get x() { return 1; }
 *   };
 *
 *   CDefinition.__glue__ = {
 *     native: {
 *       // m and x are AS-visible
 *       instance: {
 *         m: CDefinition.m,
 *         // Reuse the same getter
 *         x: Object.getOwnPropertyDescriptor(CDefinition, "x")
 *       }
 *     },
 *     script: {
 *       // I want to access an AS property 'public::y' from JS as .y
 *       instance: {
 *         y: "public y"
 *       }
 *     }
 *   };
 *
 * Note that initialize is a special function that gets called upon
 * instantiation. It is called in the usual order for its super classes,
 * i.e. super first.
 *
 * Suppose c is an instance of C, it has access to the definitions:
 *
 *   c.m(); // calls m
 *   print(c.x); // calls the getter
 *   print(c.y); // calls a generated glue getter which returns c.public$y
 *
 * The definition itself is linked by calling .link on the created Class
 * instance.
 *
 * For further examples of use of definitions, see ../src/flash/stubs.js
 */

function debugBreak(message) {
  // TODO: Set Breakpoint Here
  print("\033[91mdebugBreak: " + message + "\033[0m");
}

/*
defineReadOnlyProperty(Object.prototype, "isInstanceOf", function () {
  release || assert(false, "isInstanceOf() is not implemented on type " + this);
});

defineReadOnlyProperty(Object.prototype, "coerce", function () {
  release || assert(false, "coerce() is not implemented on type " + this);
});

defineReadOnlyProperty(Object.prototype, "isInstance", function () {
  release || assert(false, "isInstance() is not implemented on type " + this);
});
*/

var natives = (function () {

  var C = Domain.passthroughCallable;
  var CC = Domain.constructingCallable;

  /**
   * Object.as
   */
  function ObjectClass(runtime, scope, instance, baseClass) {
    var c = new runtime.domain.system.Class("Object", Object, C(Object));

    c.native = {
      instance: {
        length: {
          get: function() { return this.length; },
          set: function(l) { this.length = l }
        },
        isPrototypeOf: Object.prototype.isPrototypeOf,
        hasOwnProperty: function (name) {
          if (!name) {
            return false;
          }
          name = Multiname.getPublicQualifiedName(name);
          if (this.hasOwnProperty(name)) {
            return true;
          }
          // Object.getPrototypeOf(this) are traits, not the dynamic prototype.
          return Object.getPrototypeOf(this).hasOwnProperty(name);
        },
        propertyIsEnumerable: function (name) {
          if (!name) {
            return false;
          }
          name = Multiname.getPublicQualifiedName(name);
          return Object.prototype.propertyIsEnumerable.call(this, name);
        }
      },

      static: {
        _setPropertyIsEnumerable: function _setPropertyIsEnumerable(obj, name, isEnum) {
          name = Multiname.getPublicQualifiedName(name);
          var descriptor = Object.getOwnPropertyDescriptor(obj, name);
          descriptor.enumerable = false;
          Object.defineProperty(obj, name, descriptor);
        }
      }
    };

    c.dynamicPrototype = Object.prototype;
    c.defaultValue = null;

    c.coerce = function (value) {
      if (value === null || value === undefined) {
        return null;
      }
      if (typeof value === 'string') {
        return value;
      }
      return Object(value);
    };

    c.isInstanceOf = function (value) {
      if (value === null) {
        return false;
      }
      // In AS3, |true instanceof Object| is true. It seems that is the case for all primitive values
      // except for |undefined| which should throw an exception (TODO).
      return true;
    };

    c.isInstance = function (value) {
      if (value === null || value === undefined) {
        return false;
      }
      return true;
    };

    return c;
  }

  /**
   * Class.as
   */
  function ClassClass(runtime, scope, instance, baseClass) {
    var c = runtime.domain.system.Class;
    c.debugName = "Class";
    c.prototype.extendBuiltin.call(c, baseClass);
    c.coerce = function (value) {
      return value;
    };
    c.isInstanceOf = function (value) {
      return true; // TODO: Fix me.
    };
    c.isInstance = function (value) {
      return true; // TODO: Fix me.
    };
    return c;
  }

  /**
   * Boolean.as
   */
  function BooleanClass(runtime, scope, instance, baseClass) {
    var c = new runtime.domain.system.Class("Boolean", Boolean, C(Boolean));
    c.extendBuiltin(baseClass);
    c.native = {
      instance: {
        toString: Boolean.prototype.toString,
        valueOf: Boolean.prototype.valueOf
      }
    };
    c.coerce = Boolean;
    c.isInstanceOf = function (value) {
      return typeof value === "boolean" || value instanceof Boolean;
    };
    c.isInstance = function (value) {
      if (typeof value === "boolean" || value instanceof Boolean) {
        return true;
      }
      return false;
    };
    return c;
  }

  /**
   * Function.as
   */
  function FunctionClass(runtime, scope, instance, baseClass) {
    var c = new runtime.domain.system.Class("Function", Function, C(Function));
    c.extendBuiltin(baseClass);
    c.native = {
      instance: {
        prototype: {
          get: function () { return this.prototype; },
          set: function (p) { this.prototype = p; }
        },
        length: {
          get: function () {
            // Check if we're getting the length of a trampoline.
            if (this.hasOwnProperty(VM_LENGTH)) {
              return this[VM_LENGTH];
            }
            return this.length;
          }
        },
        call: Function.prototype.call,
        apply: Function.prototype.apply
      }
    };
    c.coerce = function (value) {
      return value; // TODO: Fix me.
    };
    c.isInstanceOf = function (value) {
      return typeof value === "function";
    };
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

    var Sp = String.prototype;
    c.native = {
      instance: {
        length: {
          get: function () { return this.length; }
        },
        indexOf: Sp.indexOf,
        lastIndexOf: Sp.lastIndexOf,
        charAt: Sp.charAt,
        charCodeAt: Sp.charCodeAt,
        concat: Sp.concat,
        localeCompare: Sp.localeCompare,
        match: Sp.match,
        replace: Sp.replace,
        search: Sp.search,
        slice: Sp.slice,
        split: Sp.split,
        substr: Sp.substr,
        substring: Sp.substring,
        toLowerCase: Sp.toLowerCase,
        toLocaleLowerCase: Sp.toLocaleLowerCase,
        toUpperCase: Sp.toUpperCase,
        toLocaleUpperCase: Sp.toLocaleUpperCase,
        toString: Sp.toString,
        valueOf: Sp.valueOf
      },
      static: String
    };
    c.isInstance = function (value) {
      return value !== null && value !== undefined && typeof value.valueOf() === "string";
    };
    c.coerce = function (value) {
      if (value === null || value === undefined) {
        return null;
      }
      return String(value);
    };
    c.isInstanceOf = function (value) {
      return Object(value) instanceof String;
    };
    c.isInstance = function (value) {
      return Object(value) instanceof String;
    };
    return c;
  }

  /**
   * Array.as
   */
  function ArrayClass(runtime, scope, instance, baseClass) {
    var c = new runtime.domain.system.Class("Array", Array, C(Array));
    c.extendBuiltin(baseClass);

    var Ap = Array.prototype;
    c.native = {
      instance: {
        length: {
          get: function() { return this.length; },
          set: function(l) { this.length = l; }
        },
        join: Ap.join,
        pop: Ap.pop,
        push: Ap.push,
        reverse: Ap.reverse,
        concat: Ap.concat,
        shift: Ap.shift,
        slice: Ap.slice,
        unshift: Ap.unshift,
        splice: Ap.splice,
        sort: Ap.sort,
        indexOf: Ap.indexOf,
        lastIndexOf: Ap.lastIndexOf,
        every: Ap.every,
        filter: Ap.filter,
        forEach: Ap.forEach,
        map: Ap.map,
        some: Ap.some
      }
    };
    c.coerce = function (value) {
      return value; // TODO: Fix me.
    };
    c.isInstanceOf = function (value) {
      return true; // TODO: Fix me.
    };
    return c;
  }

  /**
   * Vector.as
   */

  var VM_VECTOR_IS_FIXED = "vm vector is fixed";

  /**
   * Creates a typed Vector class. It steals the Array object from a new global
   * and overrides its GET/SET ACCESSOR methods to do the appropriate coercions.
   * If the |type| argument is undefined it creates the untyped Vector class.
   */
  function createVectorClass(runtime, type, baseClass) {
    var TypedArray = createNewGlobalObject().Array;
    var TAp = TypedArray.prototype;

    // Breaks semantics with bounds checking for now.
    if (type) {
      var coerce = type.coerce;
      TAp.indexGet = function (i) { return this[i]; };
      TAp.indexSet = function (i, v) { this[i] = coerce(v); };
    }

    function TypedVector (length, fixed) {
      length = _int(length);
      var array = new TypedArray(length);
      for (var i = 0; i < length; i++) {
        array[i] = type ? type.defaultValue : undefined;
      }
      array[VM_VECTOR_IS_FIXED] = !!fixed;
      return array;
    }

    TypedVector.prototype = TAp;
    var name = type ? "Vector$" + type.classInfo.instanceInfo.name.name : "Vector";
    var c = new runtime.domain.system.Class(name, TypedVector, C(TypedVector));

    defineReadOnlyProperty(TypedArray.prototype, "class", c);

    c.extendBuiltin(baseClass);

    c.native = {
      instance: {
        fixed: {
          get: function () { return this[VM_VECTOR_IS_FIXED]; },
          set: function (v) { this[VM_VECTOR_IS_FIXED] = v; }
        },
        length: {
          get: function () { return this.length; },
          set: function setLength(length) {
            // TODO: Fill with zeros if we need to.
            this.length = length;
          }
        },
        pop: function () {
          if (this[VM_VECTOR_IS_FIXED]) {
            var error = Errors.VectorFixedError;
            runtime.throwErrorFromVM("RangeError", getErrorMessage(error.code), error.code);
          } else if (this.length === 0) {
            return type.defaultValue;
          }
          return TAp.pop.call(this, arguments);
        },
        push: TAp.push,
        shift: TAp.shift,
        unshift: TAp.unshift,
        _reverse: TAp.reverse,
        _every: TAp.every,
        _filter: TAp.filter,
        _forEach: TAp.forEach,
        _map: TAp.map,
        _some: TAp.some,
        _sort: TAp.sort
      }
    };
    c.vectorType = type;
    c.coerce = function (value) {
      return value; // TODO: Fix me.
    };
    c.isInstanceOf = function (value) {
      return true; // TODO: Fix me.
    };
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

  function VectorClass(runtime, scope, instance, baseClass) {
    return createVectorClass(runtime, undefined, baseClass);
  }

  function ObjectVectorClass(runtime, scope, instance, baseClass) {
    return createVectorClass(runtime, runtime.domain.getClass("Object"), baseClass);
  }

  function IntVectorClass(runtime, scope, instance, baseClass) {
    return createVectorClass(runtime, runtime.domain.getClass("int"), baseClass);
  }

  function UIntVectorClass(runtime, scope, instance, baseClass) {
    return createVectorClass(runtime, runtime.domain.getClass("uint"), baseClass);
  }

  function DoubleVectorClass(runtime, scope, instance, baseClass) {
    return createVectorClass(runtime, runtime.domain.getClass("Number"), baseClass);
  }

  /**
   * Number.as
   */
  function NumberClass(runtime, scope, instance, baseClass) {
    var c = new runtime.domain.system.Class("Number", Number, C(Number));
    c.extendBuiltin(baseClass);
    c.native = {
      instance: Number.prototype
    };
    c.defaultValue = Number(0);
    c.isInstance = function (value) {
      return value !== null && value !== undefined &&  typeof value.valueOf() === "number";
    };
    c.coerce = Number;
    c.isInstanceOf = function (value) {
      return Object(value) instanceof Number;
    };
    c.isInstance = function (value) {
      return Object(value) instanceof Number;
    };
    return c;
  }

  function _int(x) {
    return Number(x) | 0;
  }

  function intClass(runtime, scope, instance, baseClass) {
    var c = new runtime.domain.system.Class("int", _int, C(_int));
    c.extendBuiltin(baseClass);
    c.defaultValue = 0;
    c.coerce = _int;
    c.isInstanceOf = function (value) {
      return false;
    };
    c.isInstance = function (value) {
      if (value instanceof Number) {
        value = value.valueOf();
      }
      return (value | 0) === value;
    };
    return c;
  }

  function _uint(x) {
    return Number(x) >>> 0;
  }

  function uintClass(runtime, scope, instance, baseClass) {
    var c = new runtime.domain.system.Class("uint", _uint, C(_uint));
    c.extend(baseClass);
    c.defaultValue = 0;
    c.isInstanceOf = function (value) {
      return false;
    };
    c.isInstance = function (value) {
      if (value instanceof Number) {
        value = value.valueOf();
      }
      return (value >>> 0) === value;
    };
    c.coerce = _uint;
    return c;
  }

  /**
   * Math.as
   */
  function MathClass(runtime, scope, instance, baseClass) {
    var c = new runtime.domain.system.Class("Math");
    c.native = {
      static: Math
    };
    return c;
  }

  /**
   * Date.as
   */
  function DateClass(runtime, scope, instance, baseClass) {
    var c = new runtime.domain.system.Class("Date", Date, C(Date));
    c.extendBuiltin(baseClass);
    c.native = {
      instance: Date.prototype,
      static: Date
    };
    return c;
  }

  /**
   * Error.as
   */
  function makeErrorClass(name) {
    var ErrorDefinition = {
      __glue__: {
        script: {
          instance: {
            message: "public message",
            name: "public name"
          }
        },

        native: {
          instance: {
            getStackTrace: function () {
              return "TODO: getStackTrace";
            }
          },

          static: {
            getErrorMessage: getErrorMessage
          }
        }
      }
    };

    return function (runtime, scope, instance, baseClass) {
      var c = new runtime.domain.system.Class(name, instance);
      c.extend(baseClass);
      if (name === "Error") {
        c.link(ErrorDefinition);
      }
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

    var REp = RegExp.prototype;
    c.native = {
      instance: {
        global: {
          get: function () { return this.global; }
        },
        source: {
          get:  function () { return this.source; }
        },
        ignoreCase: {
          get: function () { return this.ignoreCase; }
        },
        multiline: {
          get: function () { return this.multiline; }
        },
        lastIndex: {
          get: function () { return this.lastIndex; },
          set: function (i) { this.lastIndex = i; }
        },
        dotall: {
          get: function () { return this.dotall; }
        },
        extended: {
          get: function () { return this.extended; }
        },
        exec: REp.exec,
        test: REp.test
      }
    };

    return c;
  }

  /**
   * Dictionary.as
   */
  function DictionaryClass(runtime, scope, instance, baseClass) {
    function ASDictionary(weakKeys) {
      this.weakKeys = weakKeys;
      this.map = new WeakMap();
      if (!weakKeys) {
        this.keys = [];
      }
    }

    var c = new runtime.domain.system.Class("Dictionary", ASDictionary, C(ASDictionary));
    c.extendNative(baseClass, ASDictionary);

    var Dp = ASDictionary.prototype;
    defineReadOnlyProperty(Dp, "canHandleProperties", true);
    defineNonEnumerableProperty(Dp, "set", function (key, value) {
      this.map.set(Object(key), value);
      if (!this.weakKeys && this.keys.indexOf(key) < 0) {
        this.keys.push(key);
      }
    });
    defineNonEnumerableProperty(Dp, "get", function (key) {
      return this.map.get(Object(key));
    });
    defineNonEnumerableProperty(Dp, "delete", function (key) {
      this.map.delete(Object(key), value);
      var i;
      if (!this.weakKeys && (i = this.keys.indexOf(key)) >= 0) {
        this.keys.splice(i, 1);
      }
    });
    defineNonEnumerableProperty(Dp, "enumProperties", function () {
      return this.keys;
    });
    c.native = {
      instance: {
        init: function () {}
      }
    };

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
      var ns = ShumwayNamespace.createNamespace(uriValue);
      ns.prefix = prefixValue;

      return ns;
    }

    var c = new runtime.domain.system.Class("Namespace", ASNamespace, C(ASNamespace));
    c.extendNative(baseClass, ShumwayNamespace);

    var Np = ShumwayNamespace.prototype;
    c.native = {
      instance: {
        prefix: {
          get: Np.getPrefix
        },
        uri: {
          get: Np.getURI,
        }
      }
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
    c.native = {
      static: {
        playerType: {
          get: function () { return "AVMPlus"; }
        }
      }
    };
    return c;
  }

  /**
   * Shumway.as
   */
  function ShumwayClass(runtime, scope, instance, baseClass) {
    function Shumway() {}
    var c = new runtime.domain.system.Class("Shumway", Shumway, C(Shumway));
    c.extend(baseClass);
    c.native = {
      static: {
        info: function (x) { console.info(x); },
        json: function (x) { return JSON.stringify(x); },
        eval: function (x) { return eval(x); },
        debugger: function (x) { debugger; }
      }
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
    var INITIAL_SIZE = 128;

    function ByteArray() {
      this.a = new ArrayBuffer(INITIAL_SIZE);
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
    c.extendBuiltin(baseClass);

    var BAp = ByteArray.prototype;
    BAp.indexGet = function (i) { return this.uint8v[i]; };
    BAp.indexSet = function (i, v) { this.uint8v[i] = v; };

    BAp.cacheViews = function cacheViews() {
      var a = this.a;
      this.int8v  = new Int8Array(a);
      this.uint8v = new Uint8Array(a);
      this.view   = new DataView(a);
    };

    BAp.ensureCapacity = function ensureCapacity(size) {
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

    BAp.clear = function clear() {
      this.length = 0;
      this.position = 0;
    };

    /**
     * For byte-sized reads and writes we can just go through the |Uint8Array| and not
     * the slower DataView.
     */
    BAp.readBoolean = function readBoolean() {
      if (this.position + 1 > this.length) {
        throwEOFError();
      }
      return this.int8v[this.position++] !== 0;
    };

    BAp.readByte = function readByte() {
      if (this.position + 1 > this.length) {
        throwEOFError();
      }
      return this.int8v[this.position++];
    };

    BAp.readUnsignedByte = function readUnsignedByte() {
      if (this.position + 1 > this.length) {
        throwEOFError();
      }
      return this.uint8v[this.position++];
    };

    BAp.readBytes = function readBytes(bytes, offset, length) {
      var pos = this.position;
      if (pos + length > this.length) {
        throwEOFError();
      }
      bytes.int8v.set(new Int8Array(this.a, pos, length), offset);
      this.position += length;
    };

    BAp.writeBoolean = function writeBoolean(v) {
      var len = this.position + 1;
      this.ensureCapacity(len);
      this.int8v[this.position++] = v ? 1 : 0;
      if (len > this.length) {
        this.length = len;
      }
    };

    BAp.writeByte = function writeByte(v) {
      var len = this.position + 1;
      this.ensureCapacity(len);
      this.int8v[this.position++] = v;
      if (len > this.length) {
        this.length = len;
      }
    };

    BAp.writeUnsignedByte = function writeByte(v) {
      var len = this.position + 1;
      this.ensureCapacity(len);
      this.uint8v[this.position++] = v;
      if (len > this.length) {
        this.length = len;
      }
    };

    BAp.writeRawBytes = function writeRawBytes(bytes) {
      var len = this.position + bytes.length;
      this.ensureCapacity(len);
      this.int8v.set(bytes, this.position);
      this.position = len;
      if (len > this.length) {
        this.length = len;
      }
    };

    BAp.writeBytes = function writeBytes(bytes, offset, length) {
      if (offset || length) {
        this.writeRawBytes(new Int8Array(bytes.a, offset, length));
      } else {
        this.writeRawBytes(bytes.int8v);
      }
    };

    BAp.readDouble = function readDouble() { return get(this, 'getFloat64', 8); };
    BAp.readFloat = function readFloat() { return get(this, 'getFloat32', 4); };
    BAp.readInt = function readInt() { return get(this, 'getInt32', 4); };
    BAp.readShort = function readShort() { return get(this, 'getInt16', 2); };
    BAp.readUnsignedInt = function readUnsignedInt() { return get(this, 'getUint32', 4); };
    BAp.readUnsignedShort = function readUnsignedShort() { return get(this, 'getUint16', 2); };

    BAp.writeDouble = function writeDouble(v) { set(this, 'setFloat64', 8, v); };
    BAp.writeFloat = function writeFloat(v) { set(this, 'setFloat32', 4, v); };
    BAp.writeInt = function writeInt(v) { set(this, 'setInt32', 4, v); };
    BAp.writeShort = function writeShort(v) { set(this, 'setInt16', 2, v); };
    BAp.writeUnsignedInt = function writeUnsignedInt(v) { set(this, 'setUint32', 4, v); };
    BAp.writeUnsignedShort = function writeUnsignedShort(v) { set(this, 'setUint16', 2, v); };

    BAp.readUTF = function readUTF() {
      return this.readUTFBytes(this.readShort());
    };

    BAp.readUTFBytes = function readUTFBytes(length) {
      var pos = this.position;
      if (pos + length > this.length) {
        throwEOFError();
      }
      this.position += length;
      return utf8encode(new Int8Array(this.a, pos, length));
    };

    BAp.writeUTF = function writeUTF(str) {
      var bytes = utf8decode(str);
      this.writeShort(bytes.length);
      this.writeRawBytes(bytes);
    };

    BAp.writeUTFBytes = function writeUTFBytes(str) {
      var bytes = utf8decode(str);
      this.writeRawBytes(bytes);
    };

    BAp.toString = function toString() {
      return utf8encode(new Int8Array(this.a, 0, this.length));
    };

    c.native = {
      instance: {
        length: {
          get: function () { return this.length; },
          set: function setLength(length) {
            var cap = this.a.byteLength;
            /* XXX: Do we need to zero the difference if length <= cap? */
            if (length > cap) {
              this.ensureSize(length);
            }
            this.length = length;
          }
        },

        bytesAvailable: {
          get: function () { return this.a.byteLength - this.position; }
        },

        position: {
          get: function () { return this.position; },
          set: function (p) { this.position = p; }
        },

        endian: {
          get: function () { return this.le ? "littleEndian" : "bigEndian"; },
          set: function (e) { this.le = e === "littleEndian"; }
        },

        readBytes: BAp.readBytes,
        writeBytes: BAp.writeBytes,
        writeBoolean: BAp.writeBoolean,
        writeByte: BAp.writeByte,
        writeShort: BAp.writeShort,
        writeInt: BAp.writeInt,
        writeUnsignedInt: BAp.writeUnsignedInt,
        writeDouble: BAp.writeDouble,
        writeMultiByte: BAp.writeMultiByte,
        writeUTF: BAp.writeUTF,
        writeUTFBytes: BAp.writeUTFBytes,
        readBoolean: BAp.readBoolean,
        readByte: BAp.readByte,
        readUnsignedByte: BAp.readUnsignedByte,
        readShort: BAp.readShort,
        readUnsignedShort: BAp.readUnsignedShort,
        readInt: BAp.readInt,
        readUnsignedInt: BAp.readUnsignedInt,
        readFloat: BAp.readFloat,
        readDouble: BAp.readDouble,
        readMultiByte: BAp.readMultiByte,
        readUTF: BAp.readUTF,
        readUTFBytes: BAp.readUTFBytes,
        toString: BAp.toString
      }
    };

    return c;
  }

  /**
   * ApplicationDomain.as
   */
  function ApplicationDomainClass(runtime, scope, instance, baseClass) {
    var c = new runtime.domain.system.Class("ApplicationDomain", instance, C(instance));
    c.extend(baseClass);

    c.native = {
      instance: {
        ctor: function (parentDomain) {
          // If no parent domain is passed in, get the current system domain.
          var parent;
          if (!parentDomain) {
            parent = Runtime.stack.top().domain.system;
          } else {
            parent = parentDomain.dom;
          }

          this.dom = new Domain(parent.vm, parent);
          this.dom.scriptObject = this;
        },

        parentDomain: {
          get: function () {
            var base = this.dom.base;

            if (!base) {
              return undefined;
            }

            if (!base.scriptObject) {
              base.scriptObject = new instance();
            }

            return base.scriptObject;
          }
        },

        getDefinition: function (name) {
          return this.dom.getProperty(Multiname.fromSimpleName(name), false, true);
        },

        hasDefinition: function (name) {
          if (!name) {
            return false;
          }
          return !!this.dom.findProperty(Multiname.fromSimpleName(name), false, false);
        }
      },

      static: {
        currentDomain: {
          get: function () {
            var domain = Runtime.stack.top().domain;

            if (!domain.scriptObject) {
              domain.scriptObject = new instance();
            }

            return domain.scriptObject;
          }
        }
      }
    };

    return c;
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
    Object: Object,

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
    DictionaryClass: DictionaryClass,

    XMLClass: XMLClass,
    XMLListClass: XMLListClass,
    QNameClass: QNameClass,

    ShumwayClass: ShumwayClass,
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
        if (typeof value === "object" && "nativeObject" in value) {
          var name = value.class.classInfo.instanceInfo.name;
          return name.namespaces[0].originalURI + "::" + name.name;
        }
        return notImplemented(value);
      }
    }),

    original: jsGlobal[VM_NATIVE_BUILTIN_ORIGINALS]
  };

})();

function getNative(p) {
  var chain = p.split(".");
  var v = natives;
  for (var i = 0, j = chain.length; i < j; i++) {
    v = v && v[chain[i]];
  }
  // TODO: This assertion should always pass, find out why it doesn't.
  // release || assert(v, "getNative(" + p + ") not found.");
  return v;
}
