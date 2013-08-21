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
 *     setter          - |CClass.native.instance.m.set|
 *     static getter   - |CClass.native.static.m.get|
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
  debugger;
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

var ASNamespace;

var natives = (function () {

  var C = Domain.passthroughCallable;
  var CC = Domain.constructingCallable;

  /**
   * Object.as
   */
  function ObjectClass(runtime, scope, instanceConstructor, baseClass) {
    var c = new Class("Object", Object, C(Object));

    c.native = {
      instance: {
        length: {
          get: function() { return this.length; },
          set: function(l) { this.length = l; }
        },
        isPrototypeOf: Object.prototype.isPrototypeOf,
        hasOwnProperty: function (name) {
          if (name === undefined) {
            return false;
          }
          name = Multiname.getPublicQualifiedName(name);
          if (Object.prototype.hasOwnProperty.call(this, name)) {
            return true;
          }
          // Object.getPrototypeOf(this) are traits, not the dynamic prototype.
          return Object.getPrototypeOf(this).hasOwnProperty(name);
        },
        propertyIsEnumerable: function (name) {
          if (name === undefined) {
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

    c.dynamicPrototype = c.traitsPrototype = Object.prototype;
    // c.setDefaultProperties();
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
  function ClassClass(runtime, scope, instanceConstructor, baseClass) {
    var c = Class;
    c.debugName = "Class";
    c.prototype.extendBuiltin.call(c, baseClass);
    c.coerce = function (value) {
      return value;
    };
    c.isInstanceOf = function (value) {
      return true; // TODO: Fix me.
    };
    c.isInstance = function (value) {
      return value instanceof c.instanceConstructor;
    };
    return c;
  }

  /**
   * Boolean.as
   */
  function BooleanClass(runtime, scope, instanceConstructor, baseClass) {
    var c = new Class("Boolean", Boolean, C(Boolean));
    c.extendBuiltin(baseClass);
    c.native = {
      instance: {
        toString: Boolean.prototype.toString,
        valueOf: Boolean.prototype.valueOf,
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
  function FunctionClass(runtime, scope, instanceConstructor, baseClass) {
    var c = new Class("Function", Function, C(Function));
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

  function MethodClosureClass(runtime, scope, instanceConstructor, baseClass) {
    var c = new Class("MethodClosure", MethodClosure);
    c.extendBuiltin(baseClass);
    return c;
  }

  /**
   * String.as
   */

  function StringClass(runtime, scope, instanceConstructor, baseClass) {
    var c = new Class("String", String, C(String));
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
        match: function (re) {
          if (re === void 0) {
            return null;
          } else {
            return this.match(re);
          }
        },
        replace: Sp.replace,
        search: function (re) {
          if (re === void 0) {
            return -1;
          } else {
            return this.search(re);
          }
        },
        slice: Sp.slice,
        split: Sp.split,
        substr: Sp.substr,
        substring: Sp.substring,
        toLowerCase: Sp.toLowerCase,
        toLocaleLowerCase: Sp.toLocaleLowerCase,
        toUpperCase: function () {
          // avmshell bug compatibility
          var str = Sp.toUpperCase.apply(this);
          var str = str.replace(/\u039C/g, String.fromCharCode(181));
          return str;
        },
        toLocaleUpperCase: function () {
          // avmshell bug compatibility
          var str = Sp.toLocaleUpperCase.apply(this);
          var str = str.replace(/\u039C/g, String.fromCharCode(181));
          return str;
        },
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
  function ArrayClass(runtime, scope, instanceConstructor, baseClass) {
    var c = new Class("Array", Array, C(Array));
    c.extendBuiltin(baseClass);

    var CASEINSENSITIVE = 1;
    var DESCENDING = 2;
    var UNIQUESORT = 4;
    var RETURNINDEXEDARRAY = 8;
    var NUMERIC = 16;

    function defaultCompareFunction(a, b) {
      return String(a).localeCompare(String(b));
    }

    function compare(a, b, options, compareFunction) {
      assertNotImplemented (!(options & CASEINSENSITIVE), "CASEINSENSITIVE");
      assertNotImplemented (!(options & UNIQUESORT), "UNIQUESORT");
      assertNotImplemented (!(options & RETURNINDEXEDARRAY), "RETURNINDEXEDARRAY");
      var result = 0;
      if (!compareFunction) {
        compareFunction = defaultCompareFunction;
      }
      if (options & NUMERIC) {
        a = Number(a);
        b = Number(b);
        result = a < b ? -1 : (a > b ? 1 : 0);
      } else {
        result = compareFunction(a, b);
      }
      if (options & DESCENDING) {
        result *= -1;
      }
      return result;
    }

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
        indexOf: Ap.indexOf,
        lastIndexOf: Ap.lastIndexOf,
        every: Ap.every,
        filter: Ap.filter,
        forEach: Ap.forEach,
        map: Ap.map,
        some: Ap.some
      },
      static: {
        /**
         * Sorts an array of objects on one (or more) properties.
         */
        _sortOn: function (o, names, options) {
          if (isString(names)) {
            names = [names];
          }
          if (isNumber(options)) {
            options = [options];
          }
          for (var i = names.length - 1; i >= 0; i--) {
            var key = Multiname.getPublicQualifiedName(names[i]);
            o.sort(function (a, b) {
              return compare(a[key], b[key], options[i] | 0);
            });
          }
          return o;
        },
        /**
         * Format: args: [compareFunction], [sortOptions]
         */
        _sort: function (o, args) {
          if (args.length === 0) {
            return o.sort();
          }
          var compareFunction, options = 0;
          if (args[0] instanceof Function) {
            compareFunction = args[0];
          } else if (isNumber(args[0])) {
            options = args[0];
          }
          if (isNumber(args[1])) {
            options = args[1];
          }
          o.sort(function (a, b) {
            return compare(a, b, options, compareFunction);
          });
          return o;
        }
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

    function TypedVector (obj, fixed) {
      if (isObject(obj) && obj !== null && 'length' in obj) {
        var length = Int(obj.length);
        var array = new TypedArray(length);
        for (var i = 0; i < length; i++) {
          array[i] = obj[i];
        }
        array[VM_VECTOR_IS_FIXED] = true;
        return array;
      }

      var length = Int(obj);
      var array = new TypedArray(length);
      for (var i = 0; i < length; i++) {
        array[i] = type ? type.defaultValue : undefined;
      }
      array[VM_VECTOR_IS_FIXED] = !!fixed;
      return array;
    }

    TypedVector.prototype = TAp;
    var name = type ? "Vector$" + type.classInfo.instanceInfo.name.name : "Vector";
    var c = new Class(name, TypedVector, C(TypedVector));

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
        _sort: TAp.sort,
        newThisType: function newThisType() {
          return c.instanceConstructor();
        },
        _spliceHelper: function _spliceHelper(insertPoint, insertCount, deleteCount, args, offset) {
          somewhatImplemented("_spliceHelper");
        }
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
      if (!this.instanceConstructor.vectorType && value.class.vectorType) {
        return true;
      }
      return this.instanceConstructor.prototype.isPrototypeOf(value);
    };

    return c;
  }

  function VectorClass(domain, scope, instanceConstructor, baseClass) {
    return createVectorClass(domain, undefined, baseClass);
  }

  function ObjectVectorClass(domain, scope, instanceConstructor, baseClass) {
    return createVectorClass(domain, domain.getClass("Object"), baseClass);
  }

  function IntVectorClass(domain, scope, instanceConstructor, baseClass) {
    return createVectorClass(domain, domain.getClass("int"), baseClass);
  }

  function UIntVectorClass(domain, scope, instanceConstructor, baseClass) {
    return createVectorClass(domain, domain.getClass("uint"), baseClass);
  }

  function DoubleVectorClass(domain, scope, instanceConstructor, baseClass) {
    return createVectorClass(domain, domain.getClass("Number"), baseClass);
  }

  /**
   * Number.as
   */
  function NumberClass(runtime, scope, instanceConstructor, baseClass) {
    var c = new Class("Number", Number, C(Number));
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

  function Int(x) {
    return Number(x) | 0;
  }

  function boxedInt(x) {
    return Object(Int(x));
  }

  function intClass(runtime, scope, instanceConstructor, baseClass) {
    var c = new Class("int", boxedInt, C(Int));
    c.extendBuiltin(baseClass);
    c.defaultValue = 0;
    c.coerce = Int;
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

  function Uint(x) {
    return Number(x) >>> 0;
  }

  function boxedUint(x) {
    return Object(Uint(x));
  }

  function uintClass(runtime, scope, instanceConstructor, baseClass) {
    var c = new Class("uint", boxedUint, C(Uint));
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
    c.coerce = Uint;
    return c;
  }

  /**
   * Math.as
   */
  function MathClass(runtime, scope, instanceConstructor, baseClass) {
    var c = new Class("Math");
    c.native = {
      static: Math
    };
    return c;
  }

  /**
   * Date.as
   */
  function DateClass(runtime, scope, instanceConstructor, baseClass) {
    var c = new Class("Date", Date, C(Date));
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
              somewhatImplemented("Error.getStackTrace()");
              return AVM2.getStackTrace();
            }
          },

          static: {
            getErrorMessage: getErrorMessage
          }
        }
      }
    };

    return function (runtime, scope, instanceConstructor, baseClass) {
      var c = new Class(name, instanceConstructor);
      c.extend(baseClass);
      if (name === "Error") {
        c.link(ErrorDefinition);
        c.linkNatives(ErrorDefinition);
      }
      return c;
    };
  }

  /**
   * RegExp.as
   *
   * RegExp is implemented using XRegExp copyright 2007-present by Steven Levithan.
   */

  function RegExpClass(runtime, scope, instanceConstructor, baseClass) {
    var c = new Class("RegExp", XRegExp, C(XRegExp));
    c.extendBuiltin(baseClass);

    // Make exec and test visible via RegExpClass since we need to link them in, in
    // RegExp.as using unsafeJSNative().

    RegExpClass.exec = function exec() {
      var result = this.exec.apply(this, arguments);
      if (!result) {
        return result;
      }
      // For some reason named groups in AS3 are set to the empty string instead of
      // undefined as is the case for indexed groups. Here we just emulate the AS3
      // behaviour.
      var keys = Object.keys(result);
      for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        if (!isNumeric(k)) {
          if (result[k] === undefined) {
            result[k] = "";
          }
        }
      }
      publicizeProperties(result);
      return result;
    };

    RegExpClass.test = function test() {
      return this.exec.apply(this, arguments) !== null;
    };

    c.native = {
      instance: {
        global: {
          get: function () {
            return this.global;
          }
        },
        source: {
          get:  function () {
            return this.source;
          }
        },
        ignoreCase: {
          get: function () {
            return this.ignoreCase;
          }
        },
        multiline: {
          get: function () {
            return this.multiline;
          }
        },
        lastIndex: {
          get: function () {
            return this.lastIndex;
          },
          set: function (i) {
            this.lastIndex = i;
          }
        },
        dotall: {
          get: function () {
            return this.dotall;
          }
        },
        extended: {
          get: function () {
            return this.extended;
          }
        },
        exec: RegExpClass.exec,
        test: RegExpClass.test
      }
    };

    return c;
  }

  /**
   * Dictionary.as
   *
   * TODO: We need a more robust Dictionary implementation that doesn't only give you back
   * string keys when enumerating.
   */
  function DictionaryClass(runtime, scope, instanceConstructor, baseClass) {
    function ASDictionary(weakKeys) {
      this.weakKeys = weakKeys;
      this.map = new WeakMap();
      if (!weakKeys) {
        this.keys = [];
      }
      this.primitiveMap = createEmptyObject();
    }

    var c = new Class("Dictionary", ASDictionary, C(ASDictionary));
    c.extendNative(baseClass, ASDictionary);

    function makePrimitiveKey(key) {
      if (typeof key === "string" || typeof key === "number") {
        return key;
      }
      assert (typeof key === "object" || typeof key === "function", typeof key);
      return undefined;
    }

    var Dp = ASDictionary.prototype;
    defineNonEnumerableProperty(Dp, "setProperty", function (namespaces, name, flags, value) {
      var key = makePrimitiveKey(name);
      if (key !== undefined) {
        this.primitiveMap[key] = value;
        return;
      }
      this.map.set(Object(name), value);
      if (!this.weakKeys && this.keys.indexOf(name) < 0) {
        this.keys.push(name);
      }
    });
    defineNonEnumerableProperty(Dp, "getProperty", function (namespaces, name, flags) {
      var key = makePrimitiveKey(name);
      if (key !== undefined) {
        return this.primitiveMap[key];
      }
      return this.map.get(Object(name));
    });
    defineNonEnumerableProperty(Dp, "hasProperty", function (namespaces, name, flags) {
      var key = makePrimitiveKey(name);
      if (key !== undefined) {
        return key in this.primitiveMap;
      }
      return this.map.has(Object(name));
    });
    defineNonEnumerableProperty(Dp, "deleteProperty", function (namespaces, name, flags) {
      var key = makePrimitiveKey(name);
      if (key !== undefined) {
        delete this.primitiveMap[key];
      }
      this.map.delete(Object(name));
      var i;
      if (!this.weakKeys && (i = this.keys.indexOf(name)) >= 0) {
        this.keys.splice(i, 1);
      }
      return true;
    });
    defineNonEnumerableProperty(Dp, "getEnumerationKeys", function () {
      var primitiveMapKeys = [];
      for (var k in this.primitiveMap) {
        primitiveMapKeys.push(k);
      }
      return primitiveMapKeys.concat(this.keys);
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
  function NamespaceClass(runtime, scope, instanceConstructor, baseClass) {
    ASNamespace = function ASNamespace(prefixValue, uriValue) {
      if (uriValue === undefined) {
        uriValue = prefixValue;
        prefixValue = undefined;
      }
      var prefix, uri;
      if (prefixValue === undefined) {
        if (uriValue === undefined) {
          prefix = "";
          uri = "";
        } else if (typeof uriValue === "object") {
          prefix = uriValue.prefix;
          if (uriValue instanceof ShumwayNamespace) {
            uri = uriValue.originalURI;
          } else if (uriValue instanceof QName) {
            uri = uriValue.uri;
          }
        } else {
          uri = toString(uriValue);
          if (uri === "") {
            prefix = "";
          } else {
            prefix = undefined;
          }
        }
      } else {
        if (typeof uriValue === "object" &&
            (uriValue instanceof QName) &&
            uriValue.uri !== null) {
          uri = uriValue.uri;
        } else {
          uri = toString(uriValue);
        }
        if (uri === "") {
          if (prefixValue === undefined || toString(prefixValue) === "") {
            prefix = "";
          } else {
            throw "type error";
          }
        } else if (prefixValue === undefined || prefixValue === "") {
          prefix = undefined;
        } else if (false && !isXMLName(prefixValue)) { // FIXME need impl
          prefix = undefined;
        } else {
          prefix = toString(prefixValue);
        }
      }
      var ns = ShumwayNamespace.createNamespace(uri, prefix);
      return ns;
    }

    var c = new Class("Namespace", ASNamespace, C(ASNamespace));
    c.extendNative(baseClass, ShumwayNamespace);

    var Np = ShumwayNamespace.prototype;
    c.native = {
      instance: {
        prefix: {
          get: Np.getPrefix
        },
        uri: {
          get: Np.getURI
        }
      }
    };
    return c;
  }

  /**
   * JSON.as
   */
  function JSONClass(runtime, scope, instanceConstructor, baseClass) {
    function ASJSON() {}
    var c = new Class("JSON", ASJSON, C(ASJSON));
    c.extend(baseClass);
    c.native = {
      static: {
        parseCore: function parseCore(text) { // (text:String) -> Object
          return JSON.parse(text);
        },
        stringifySpecializedToString: function stringifySpecializedToString(value, replacerArray, replacerFunction, gap) { // (value:Object, replacerArray:Array, replacerFunction:Function, gap:String) -> String
          return JSON.stringify(value, replacerFunction, gap);
        }
      }
    };
    return c;
  }

  /**
   * Capabilities.as
   */
  function CapabilitiesClass(runtime, scope, instanceConstructor, baseClass) {
    function Capabilities() {}
    var c = new Class("Capabilities", Capabilities, C(Capabilities));
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
   * File.as
   */
  function FileClass(runtime, scope, instanceConstructor, baseClass) {
    function File() {}
    var c = new Class("File", File, C(File));
    c.extend(baseClass);
    c.native = {
      static: {
        exists: function (filename) {
          notImplemented("File.exists");
          return false;
        },
        read: function (filename) {
          return snarf(filename);
        },
        write: function (filename, data) {
          notImplemented("File.write");
          return true;
        },
        readByteArray: function (filename) {
          var ByteArrayClass = AVM2.currentDomain().getClass("flash.utils.ByteArray");
          var data = ByteArrayClass.createInstance();
          data.writeRawBytes(snarf(filename, "binary"));
          return data;
        },
        writeByteArray: function (filename, bytes) {
          // NOTE: |write| is only defined in a special build of the Spidermonkey shell,
          // ask mbx for a patch.
          // HACK: Hack for now to deal with weird issue in relative file path.
          write("bin/" + filename, bytes.getBytes());
          return true;
        }
      }
    };
    return c;
  }

  /**
   * Shumway.as
   */
  function ShumwayClass(runtime, scope, instanceConstructor, baseClass) {
    function Shumway() {}
    var c = new Class("Shumway", Shumway, C(Shumway));
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
  function ByteArrayClass(runtime, scope, instanceConstructor, baseClass) {
    /* The initial size of the backing, in bytes. Doubled every OOM. */
    var INITIAL_SIZE = 128;

    var defaultObjectEncoding = 3;

    function ByteArray() {
      this.a = new ArrayBuffer(INITIAL_SIZE);
      this.length = 0;
      this.position = 0;
      this.cacheViews();
      this.nativele = new Int8Array(new Int32Array([]).buffer)[0] === 1;
      this.le = this.nativele;
      this.objectEncoding = defaultObjectEncoding;
    }

    function throwEOFError() {
      runtime.throwErrorFromVM("flash.errors.EOFError", "End of file was encountered.");
    }

    function throwRangeError() {
      var error = Errors.ParamRangeError;
      runtime.throwErrorFromVM("RangeError", getErrorMessage(error.code), error.code);
    }

    function checkRange(x, min, max) {
      if (x !== clamp(x, min, max)) {
        throwRangeError();
      }
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

    var c = new Class("ByteArray", ByteArray, C(ByteArray));
    c.extendBuiltin(baseClass);

    var BAp = ByteArray.prototype;
    BAp.indexGet = function (i) {
      if (i >= this.length) {
        return undefined;
      }
      return this.uint8v[i];
    };
    BAp.indexSet = function (i, v) {
      var len = i + 1;
      this.ensureCapacity(len);
      this.uint8v[i] = v;
      if (len > this.length) {
        this.length = len;
      }
    };

    BAp.cacheViews = function cacheViews() {
      var a = this.a;
      this.int8v  = new Int8Array(a);
      this.uint8v = new Uint8Array(a);
      this.view   = new DataView(a);
    };

    BAp.getBytes = function getBytes() {
      return new Uint8Array(this.a, 0, this.length);
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

    BAp.writeUnsignedByte = function writeUnsignedByte(v) {
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

    BAp.readRawBytes = function readRawBytes() {
      return new Int8Array(this.a, 0, this.length);
    };

    BAp.writeBytes = function writeBytes(bytes, offset, length) {
      if (arguments.length < 2) {
        offset = 0;
      }
      if (arguments.length < 3) {
        length = 0;
      }
      checkRange(offset, 0, bytes.length);
      checkRange(offset + length, 0, bytes.length);
      if (length === 0) {
        length = bytes.length - offset;
      }
      this.writeRawBytes(new Int8Array(bytes.a, offset, length));
    };

    BAp.readDouble = function readDouble() { return get(this, 'getFloat64', 8); };
    BAp.readFloat = function readFloat() { return get(this, 'getFloat32', 4); };
    BAp.readInt = function readInt() { return get(this, 'getInt32', 4); };
    BAp.readShort = function readShort() { return get(this, 'getInt16', 2); };
    BAp.readUnsignedInt = function readUnsignedInt() { return get(this, 'getUint32', 4); };
    BAp.readUnsignedShort = function readUnsignedShort() { return get(this, 'getUint16', 2); };
    BAp.readObject = function readObject() { return AMFUtils.encodings[this.objectEncoding].read(this); };

    BAp.writeDouble = function writeDouble(v) { set(this, 'setFloat64', 8, v); };
    BAp.writeFloat = function writeFloat(v) { set(this, 'setFloat32', 4, v); };
    BAp.writeInt = function writeInt(v) { set(this, 'setInt32', 4, v); };
    BAp.writeShort = function writeShort(v) { set(this, 'setInt16', 2, v); };
    BAp.writeUnsignedInt = function writeUnsignedInt(v) { set(this, 'setUint32', 4, v); };
    BAp.writeUnsignedShort = function writeUnsignedShort(v) { set(this, 'setUint16', 2, v); };
    BAp.writeObject = function readObject(v) { return AMFUtils.encodings[this.objectEncoding].write(this, v); };

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
              this.ensureCapacity(length);
            }
            this.length = length;
            this.position = clamp(this.position, 0, this.length);
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

        objectEncoding: {
          get: function () { return this.objectEncoding; },
          set: function (v) { this.objectEncoding = v; }
        },

        readBytes: BAp.readBytes,
        writeBytes: BAp.writeBytes,
        writeBoolean: BAp.writeBoolean,
        writeByte: BAp.writeByte,
        writeShort: BAp.writeShort,
        writeInt: BAp.writeInt,
        writeUnsignedInt: BAp.writeUnsignedInt,
        writeFloat: BAp.writeFloat,
        writeDouble: BAp.writeDouble,
        writeMultiByte: BAp.writeMultiByte,
        writeUTF: BAp.writeUTF,
        writeUTFBytes: BAp.writeUTFBytes,
        writeObject: BAp.writeObject,
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
        readObject: BAp.readObject,
        toString: BAp.toString,
        clear: BAp.clear
      },
      static: {
        defaultObjectEncoding: {
          get: function () { return defaultObjectEncoding; },
          set: function (e) { defaultObjectEncoding = e; }
        }
      }
    };

    return c;
  }

  /**
   * Domain.as
   */
  function DomainClass(runtime, scope, instanceConstructor, baseClass) {
    var c = new Class("File", instanceConstructor, C(instanceConstructor));
    c.extend(baseClass);
    c.native = {
      instance: {
        init: function (base) {
          this.base = base;
          this.nativeObject = new Domain(avm2, base ? base.nativeObject : null);
        },
        loadBytes: function (byteArray, swfVersion) { // (byteArray:ByteArray, swfVersion:uint = 0);
          this.nativeObject.executeAbc(new AbcFile(byteArray.readRawBytes()));
        },
        getClass: function (className) { // (className:String);
          return this.nativeObject.getClass(className);
        }
      },
      static: {
        currentDomain: {
          get: function () {
            var domain = Object.create(instanceConstructor.prototype);
            domain.nativeObject = AVM2.currentDomain();
            return domain;
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
    ProxyClass: ProxyClass,

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
    JSONClass: JSONClass,

    ShumwayClass: ShumwayClass,
    CapabilitiesClass: CapabilitiesClass,
    FileClass: FileClass,
    DomainClass: DomainClass,

    /**
     * DescribeType.as
     */
    getQualifiedClassName: constant(function (value) {
      switch (typeof value) {
        case "number":
          if ((value | 0) === value) {
            return "int";
          }
          return "Number";
        case "string":
          return "String";
        case "boolean":
          return "Boolean";
        case "object":
          if (value instanceof Date) {
            return "Date";
          }
          var cls;
          if (value.class) {
            cls = value.class
          } else if (value.classInfo) {
            cls = value;
          }
          if (cls) {
            var name = cls.classInfo.instanceInfo.name;
            var originalURI = name.namespaces[0].originalURI;
            if (originalURI) {
              return originalURI + "::" + name.name;
            }
            return name.name;
          }
          break;
      }
      return notImplemented(value + " (" + typeof value + ")");
    }),

    getQualifiedSuperclassName: constant(function (value) {
      switch (typeof value) {
        case "number":
        case "string":
        case "boolean":
          return "Object";
        case "function":
          return "Function";
        case "object":
          if (value instanceof Date) {
            return "Object";
          }
          var cls;
          if (value.class) {
            cls = value.class
          } else if (value.classInfo) {
            cls = value;
          }
          if (cls && cls.baseClass) {
            var name = cls.baseClass.classInfo.instanceInfo.name;
            var originalURI = name.namespaces[0].originalURI;
            if (originalURI) {
              return originalURI + "::" + name.name;
            }
            return name.name;
          }
          return "Object";
      }
      return notImplemented(value + " (superOf " + typeof value + ")");
    }),

    getDefinitionByName: constant(function (name) {
      var simpleName = name.replace("::", ".");
      return AVM2.currentDomain().getClass(simpleName);
    }),

    describeTypeJSON: constant(describeTypeJSON),
    original: jsGlobal[VM_NATIVE_BUILTIN_ORIGINALS]
  };

  // NOTE: Defining helper functions. Control flow does not reach here.

  function describeTypeJSON(o, flags) {
    var Flags = {
      HIDE_NSURI_METHODS  : 0x0001,
      INCLUDE_BASES       : 0x0002,
      INCLUDE_INTERFACES  : 0x0004,
      INCLUDE_VARIABLES   : 0x0008,
      INCLUDE_ACCESSORS   : 0x0010,
      INCLUDE_METHODS     : 0x0020,
      INCLUDE_METADATA    : 0x0040,
      INCLUDE_CONSTRUCTOR : 0x0080,
      INCLUDE_TRAITS      : 0x0100,
      USE_ITRAITS         : 0x0200,
      HIDE_OBJECT         : 0x0400,
    };

    // public keys used multiple times while creating the description
    var declaredByKey = publicName("declaredBy");
    var metadataKey = publicName("metadata");
    var accessKey = publicName("access");
    var uriKey = publicName("uri");
    var nameKey = publicName("name");
    var typeKey = publicName("type");
    var returnTypeKey = publicName("returnType");
    var valueKey = publicName("value");
    var keyKey = publicName("key");
    var parametersKey = publicName("parameters");
    var optionalKey = publicName("optional");

    var cls = o.classInfo ? o : Object.getPrototypeOf(o).class;
    release || assert(cls, "No class found for object " + o);
    var info = cls.classInfo;

    var description = {};
    description[nameKey] = unmangledQualifiedName(info.instanceInfo.name);
    description[publicName("isDynamic")] = cls === o ? true : !(info.instanceInfo.flags & CONSTANT_ClassSealed);
    //TODO: verify that `isStatic` is false for all instances, true for classes
    description[publicName("isStatic")] = cls === o;
    description[publicName("isFinal")] = cls === o ? true : !(info.instanceInfo.flags & CONSTANT_ClassFinal);
    if (flags & Flags.INCLUDE_TRAITS) {
      description[publicName("traits")] = addTraits(cls, flags);
    }
    var metadata = null;
    if (info.metadata) {
      metadata = Object.keys(info.metadata).map(function(key) {
        return describeMetadata(info.metadata[key]);
      });
    }
    description[metadataKey] = metadata;
    return description;

    // privates

    function publicName(str) {
      return Multiname.getPublicQualifiedName(str)
    }

    function unmangledQualifiedName(mn) {
      var name = mn.name;
      var namespace = mn.namespaces[0];
      if (namespace && namespace.originalURI) {
        return namespace.originalURI + '::' + name;
      }
      return name;
    }

    function describeMetadata(metadata) {
      var result = {};
      result[nameKey] = metadata.name;
      result[valueKey] = metadata.value.map(function(value) {
        var val = {};
        val[keyKey] = value.key;
        val[valueKey] = value.value;
        return value;
      });
      return result;
    }
    
    function addTraits(cls, flags) {
      var includedMembers = [flags & Flags.INCLUDE_VARIABLES,
                               flags & Flags.INCLUDE_METHODS,
                               flags & Flags.INCLUDE_ACCESSORS,
                               flags & Flags.INCLUDE_ACCESSORS];
      var includeBases = flags & Flags.INCLUDE_BASES;
      var includeMetadata = flags & Flags.INCLUDE_METADATA;

      var obj = {};

      var basesVal = obj[publicName("bases")] = includeBases ? [] : null;
      if (flags & Flags.INCLUDE_INTERFACES) {
        var interfacesVal = obj[publicName("interfaces")] = [];
        if (flags & Flags.USE_ITRAITS) {
          for (var key in cls.implementedInterfaces) {
            var ifaceName = cls.implementedInterfaces[key].name;
            interfacesVal.push(unmangledQualifiedName(ifaceName));
          }
        }
      } else {
        obj[publicName("interfaces")] = null;
      }

      var variablesVal = obj[publicName("variables")] =
          flags & Flags.INCLUDE_VARIABLES ? [] : null;
      var accessorsVal = obj[publicName("accessors")] =
          flags & Flags.INCLUDE_ACCESSORS ? [] : null;
      var methodsVal = obj[publicName("methods")] =
          flags & Flags.INCLUDE_METHODS ? [] : null;

      // Needed for accessor-merging
      var encounteredAccessors = {};

      var addBase = false;
      while (cls) {
        var className = unmangledQualifiedName(cls.classInfo.instanceInfo.name);
        if (includeBases && addBase) {
          basesVal.push(className);
        } else {
          addBase = true;
        }
        if (flags & Flags.USE_ITRAITS) {
          describeTraits(cls.classInfo.instanceInfo.traits);
        } else {
          describeTraits(cls.classInfo.traits);
        }
        cls = cls.baseClass;
      }

      function describeTraits(traits) {
        release || assert(traits, "No traits array found on class" +
                                  cls.classInfo.instanceInfo.name);

        for (var i = 0; traits && i < traits.length; i++) {
          var t = traits[i];
          if (!includedMembers[t.kind] ||
              !t.name.getNamespace().isPublic() && !t.name.uri)
          {
            continue;
          }
          var name = unmangledQualifiedName(t.name);
          if (encounteredAccessors[name]) {
            var val = encounteredAccessors[name];
            val[accessKey] = 'readwrite';
            if (t.kind === TRAIT_Getter) {
              val[typeKey] = unmangledQualifiedName(t.methodInfo.returnType);
            }
            continue;
          }
          var val = {};
          if (includeMetadata && t.metadata) {
            var metadataVal = val[metadataKey] = [];
            for (var key in t.metadata) {
              metadataVal.push(describeMetadata(t.metadata[key]));
            }
          } else {
            val[metadataKey] = null;
          }
          val[declaredByKey] = className;
          val[uriKey] = t.name.uri === undefined ? null : t.name.uri;
          val[nameKey] = name;
          //TODO: check why we have public$$_init in `Object`
          if (!t.typeName && !(t.methodInfo && t.methodInfo.returnType)) {
            continue;
          }
          val[t.kind === TRAIT_Method ? returnTypeKey : typeKey] =
              unmangledQualifiedName(t.kind === TRAIT_Slot
                                       ? t.typeName
                                       : t.methodInfo.returnType);
          switch (t.kind) {
            case TRAIT_Slot:
              val[accessKey] = "readwrite";
              variablesVal.push(val);
              break;
            case TRAIT_Method:
              var parametersVal = val[parametersKey] = [];
              var parameters = t.methodInfo.parameters;
              for (var j = 0; j < parameters.length; j++) {
                var param = parameters[j];
                var paramVal = {};
                paramVal[typeKey] = param.type
                                      ? unmangledQualifiedName(param.type)
                                      : '*';
                paramVal[optionalKey] = 'value' in param;
                parametersVal.push(paramVal);
              }
              methodsVal.push(val);
              break;
            case TRAIT_Getter:
            case TRAIT_Setter:
              val[accessKey] = t.kind === TRAIT_Getter ? "read" : "write";
              accessorsVal.push(val);
              encounteredAccessors[name] = val;
              break;
            default:
              assert(false, "Unknown trait type: " + t.kind);
              break;
          }
        }
      }
      return obj;
    }
  }

})();

function getNative(path) {
  var chain = path.split(".");
  var v = natives;
  for (var i = 0, j = chain.length; i < j; i++) {
    v = v && v[chain[i]];
  }

  release || assert(v, "getNative(" + path + ") not found.");
  return v;
}
