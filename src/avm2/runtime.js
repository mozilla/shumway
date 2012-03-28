const ALWAYS_INTERPRET = 0x1;
const HEURISTIC_JIT = 0x2;

function defineReadOnlyProperty(obj, name, value) {
  Object.defineProperty(obj, name, { value: value, writable: false, configurable: false, enumerable: false });
}

function defineGetterAndSetter(obj, name, getter, setter) {
  Object.defineProperty(obj, name, { get: getter, set: setter });
}

/**
 * Override the [] operator by wrapping it in accessor (get/set) functions. This is necessary because in AS3,
 * the [] operator has different semantics depending on whether the receiver is an Array or Vector. For the
 * latter we need to coerce values whenever they are stored.
 */

const GET_ACCESSOR = "$get";
const SET_ACCESSOR = "$set";

defineReadOnlyProperty(Object.prototype, GET_ACCESSOR, function (i) {
  return this[i];
});

defineReadOnlyProperty(Object.prototype, SET_ACCESSOR, function (i, v) {
  this[i] = v;
});

/**
 * Gets the next name index of an object. Index |zero| is actually not an index,
 * but rather an indicator that no such index exists.
 */
defineReadOnlyProperty(Object.prototype, "nextNameIndex", function (index) {
  if (index < Object.keys(this).length) {
    return index + 1;
  }
  return 0;
});

/**
 * Gets the nextName after the specified |index|, which you would expect to be index + 1, but
 * it's actually index - 1;
 */
defineReadOnlyProperty(Object.prototype, "nextName", function (index) {
  var keys = Object.keys(this);
  assert (index > 0 && index < keys.length + 1);
  return keys[index - 1];
});

function toDouble(x) {
  return Number(x);
}

function toBoolean(x) {
  return Boolean(x);
}

function toUint(x) {
  var obj = x | 0;
  return obj < 0 ? (obj + 4294967296) : obj;
}

function toInt(x) {
  return parseInt(x);
}

function toString(x) {
  return new String(x);
}

/**
 * Similar to |toString| but returns |null| for |null| or |undefined| instead
 * of "null" or "undefined".
 */
function coerceString(x) {
  if (!x) {
    return null;
  }
  return new String(x);
}

function typeOf(x) {
  if (x === null) {
    return typeof x;
  }
  var type = typeof x;
  if (type === "object") {
    return typeof (x.valueOf());
  }
  return type;
}

function deleteProperty(obj, multiname) {
  var resolved = resolveMultiname(obj, multiname, false);
  if (resolved) {
    return delete obj[resolved.getQualifiedName()];
  }
  return false;
}

function applyType(factory, types) {
  if (factory === globalObject.Vector) {
    assert (types.length === 1);
    return Vector(types[0]);
  }
  notImplemented();
  return undefined;
}

function Vector(type) {
  function vector() {
    this.push.apply(this, arguments);
  }
  vector.prototype = Object.create(Array.prototype);
  return vector;
}

Vector.coerce = function(x) {
  return x;
};

Array.coerce = function(x) {
  return x;
};

var globalObject = function () {
  var global = {};
  global.print = global.trace = function (val) {
    console.info(val);
  };
  global.Number = Number;
  global.Boolean = Boolean;
  global.Date = Date;
  global.Array = Array;
  global.Math = Math;
  global.Object = Object;
  global.String = global.string = String;
  global.RegExp = RegExp;
  global.Function = Function;
  global.undefined = undefined;
  global.NaN = NaN;
  global.Infinity = Infinity;
  global.JS = (function() { return this || (1, eval)('this'); })();
  global.XML = function(xml) {
    this.xml = xml;
  };
  global.XML.prototype.toString = function() {
    return this.xml;
  };

  global.int = function int(x) {
    return Number(x) | 0;
  };

  global.int.coerce = function (x) {
    return Number(x) | 0;
  };

  defineReadOnlyProperty(global.int, "MIN_VALUE", INT_MIN_VALUE);
  defineReadOnlyProperty(global.int, "MAX_VALUE", INT_MAX_VALUE);

  global.uint = function uint(x) {
    return Number(x) >>> 0;
  };

  global.uint.coerce = function (x) {
      return Number(x) >>> 0;
  };

  defineReadOnlyProperty(global.uint, "MIN_VALUE", UINT_MIN_VALUE);
  defineReadOnlyProperty(global.uint, "MAX_VALUE", UINT_MAX_VALUE);

  global.String.coerce = function(x) {
    return Object(x).toString();
  };

  global.Object.coerce = function(x) {
    return x;
  };

  global.Number.coerce = function(x) {
    return Number(x);
  };

  global.Boolean.coerce = function(x) {
    return Boolean(x);
  };

  defineReadOnlyProperty(global.Number, "E", 2.718281828459045);
  defineReadOnlyProperty(global.Number, "PI", 3.141592653589793);
  defineReadOnlyProperty(global.Number, "LN2", 0.6931471805599453);
  defineReadOnlyProperty(global.Number, "LN10", 2.302585092994046);
  defineReadOnlyProperty(global.Number, "LOG2E", 1.442695040888963387);
  defineReadOnlyProperty(global.Number, "LOG10E", 0.4342944819032518);
  defineReadOnlyProperty(global.Number, "SQRT2", 1.4142135623730951);
  defineReadOnlyProperty(global.Number, "SQRT1_2", 0.7071067811865476);

  defineReadOnlyProperty(global.Number, "abs", Math.abs);
  defineReadOnlyProperty(global.Number, "acos", Math.acos);
  defineReadOnlyProperty(global.Number, "asin", Math.asin);
  defineReadOnlyProperty(global.Number, "atan", Math.atan);
  defineReadOnlyProperty(global.Number, "ceil", Math.ceil);
  defineReadOnlyProperty(global.Number, "cos", Math.cos);
  defineReadOnlyProperty(global.Number, "exp", Math.exp);
  defineReadOnlyProperty(global.Number, "floor", Math.floor);
  defineReadOnlyProperty(global.Number, "log", Math.log);
  defineReadOnlyProperty(global.Number, "round", Math.round);
  defineReadOnlyProperty(global.Number, "sin", Math.sin);
  defineReadOnlyProperty(global.Number, "sqrt", Math.sqrt);
  defineReadOnlyProperty(global.Number, "tan", Math.tan);
  defineReadOnlyProperty(global.Number, "atan2", Math.atan2);
  defineReadOnlyProperty(global.Number, "pow", Math.pow);

  defineReadOnlyProperty(global.Number, "min", Math.min);
  defineReadOnlyProperty(global.Number, "max", Math.max);


  global.Function.coerce = function(x) {
    return x;
  };

  global.parseInt = parseInt;

  global.Capabilities = {
    'playerType': 'AVMPlus'
  };

  global.Namespace = (function() {
    function namespace() {
      this.prefix = arguments.length > 1 ? arguments[0] : undefined;
      this.uri = arguments.length == 1 ? arguments[0] : arguments[1];
    }
    return namespace;
  })();

  global.toString = function() {
    return "[object global]";
  };

  global.getQualifiedClassName = function(x) {
    return Object(x).constructor.name;
  };

  global.ArgumentError = function () {};

  global.Vector = Vector;

  return global;
}();

function getTypeByName(multiname) {
  assert (globalObject.hasOwnProperty(multiname.getQualifiedName()), "Cannot find type " + multiname);
  return globalObject[multiname.getQualifiedName()];
}

function nextName(obj, index) {
  return obj.nextName(index);
}

/**
 * Determine if the given object has any more properties after the specified |index| in the given |obj|
 * and if so, return the next index or |zero| otherwise. If the |obj| has no more properties then continue
 * the search in |obj.__proto__|. This function returns an updated index and object to be used during
 * iteration.
 *
 * the |for (x in obj) { ... }| statement is compiled into the following pseudo bytecode:
 *
 * index = 0;
 * while (true) {
 *   (obj, index) = hasNext2(obj, index);
 *   if (index) { #1
 *     x = nextName(obj, index); #2
 *   } else {
 *     break;
 *   }
 * }
 *
 * #1 If we return zero, the iteration stops.
 * #2 The spec says we need to get the nextName at index + 1, but it's actually index - 1, this caused
 * me two hours of my life that I will probably never get back.
 *
 * TODO: We can't match the iteration order semantics of Action Script, hopefully programmers don't rely on it.
 */
function hasNext2(obj, index) {
  assert (obj);
  assert (index >= 0);

  var nextNameIndex = obj.nextNameIndex(index);
  if (!nextNameIndex) {
    obj = obj.__proto__;
    index = obj ? obj.nextNameIndex(0) : 0;
  } else {
    index = nextNameIndex;
  }
  return {index: index, object: obj};
}

/**
 * Scopes are used to emulate the scope stack as a linked list of scopes, rather than a stack. Each
 * scope holds a reference to a scope [object] (which may exist on multiple scope chains, thus preventing
 * us from chaining the scope objects together directly).
 *
 * Scope Operations:
 *
 *  push scope: scope = new Scope(scope, object)
 *  pop scope: scope = scope.parent
 *  get global scope: scope.global
 *  get scope object: scope.object
 *
 * Method closures have a [savedScope] property which is bound when the closure is created. Since we use a
 * linked list of scopes rather than a scope stack, we don't need to clone the scope stack, we can bind
 * the closure to the current scope.
 *
 * The "scope stack" for a method always starts off as empty and methods push and pop scopes on their scope
 * stack explicitly. If a property is not found on the current scope stack, it is then looked up
 * in the [savedScope]. To emulate this we actually wrap every generated function in a closure, such as
 *
 *  function fnClosure(scope) {
 *    return function fn() {
 *      ... scope;
 *    };
 *  }
 *
 * When functions are created, we bind the function to the current scope, using fnClosure.bind(null, this)();
 */
var Scope = (function () {
  function scope(parent, object) {
    this.parent = parent;
    this.object = object;
  }

  Object.defineProperty(scope.prototype, "global", {
    get: function () {
      if (this.parent === null) {
        return this;
      } else {
        return this.parent.global;
      }
    }
  });

  scope.prototype.findProperty = function findProperty(multiname, strict) {
    // print("Looking for : " + multiname);
    for (var i = 0; i < multiname.namespaces.length; i++) {
      // if (this.object.hasOwnProperty(multiname.getQName(i).getQualifiedName())) {
      if (multiname.getQName(i).getQualifiedName() in this.object) {
        return this.object;
      }
    }
    if (this.parent) {
      return this.parent.findProperty(multiname, strict);
    }
    if (strict) {
      unexpected("Cannot find property " + multiname);
    }
    return this.global.object;
  };

  /**
   * Returns the first multiname that binds to a property in the scope chain.
   */
  scope.prototype.resolveMultiname = function(multiname) {
    assert (!multiname.isQName());
    var resolved = resolveMultiname(this.object, multiname);
    if (resolved) {
      return resolved;
    }
    if (this.parent) {
      return this.parent.resolveMultiname(multiname);
    }
    return null;
  };

  return scope;
})();

/**
 * Resolve the [multiname] to a QName in the specified [obj], this is a linear search that uses [hasOwnProperty]
 * with the qualified name.
 */
function resolveMultiname(obj, multiname, checkPrototype) {
  assert (!multiname.isQName(), "We shouldn't resolve already resolved names.");
  obj = Object(obj);
  for (var i = 0, count = multiname.namespaces.length; i < count; i++) {
    var name = multiname.getQName(i);
    if (checkPrototype) {
      if (name.getQualifiedName() in obj) {
        return name;
      }
    } else {
      if (obj.hasOwnProperty(name.getQualifiedName())) {
        return name;
      }
    }
  }
  return null;
}

function getProperty(obj, multiname) {
  if (multiname.isQName()) {
    if (typeof multiname.name === "number") {
      return obj[GET_ACCESSOR](multiname.name);
    } else {
      return obj[multiname.getQualifiedName()];
    }
  } else {
    var resolved = resolveMultiname(obj, multiname, true);
    if (resolved) {
      return obj[resolved.getQualifiedName()];
    }
  }
  return undefined;
}

function setProperty(obj, multiname, value) {
  if (multiname.isQName()) {
    if (typeof multiname.name === "number") {
      obj[SET_ACCESSOR](multiname.name, value);
    } else {
      obj[multiname.getQualifiedName()] = value;
    }
  } else {
    var resolved = resolveMultiname(Object.getPrototypeOf(obj), multiname, true);
    if (resolved) {
      obj[resolved.getQualifiedName()] = value;
    } else {
      // If we can't resolve the multiname, we're probably adding a dynamic
      // property, so just go ahead and use its name directly.
      // TODO: Remove assertion and loop when we're certain it will never fail.
      var publicNSIndex;
      for (var i = 0, j = multiname.namespaces.length; i < j; i++) {
        if (multiname.namespaces[i].isPublic()) {
          publicNSIndex = i;
          break;
        }
      }
      assert(multiname.getQName(publicNSIndex).getQualifiedName() === multiname.name);
      obj[multiname.name] = value;
    }
  }
}

/**
 * Execution context for a script.
 */
var Runtime = (function () {
  var functionCount = 0;

  function VerifyError(m) {
    this.m = m;
  }

  VerifyError.prototype = {
    toString: function () {
      return this.m;
    }
  };

  function runtime(abc, mode) {
    this.abc = abc;
    this.mode = mode;
    this.compiler = new Compiler(abc);
    this.interpreter = new Interpreter(abc);

    /**
     * All runtime exceptions are boxed in this object to tag them as having
     * originated from within the VM.
     */
    this.exception = { value: null };
  }

  runtime.prototype.createActivation = function (method) {
    return Object.create(method.activationPrototype);
  };

  runtime.prototype.createFunction = function (method, scope) {
    function closeOverScope(fn, scope) {
      return function () {
        Array.prototype.unshift.call(arguments, scope);
        return fn.apply(this === globalObject.JS ? globalObject : this, arguments);
      };
    }

    function interpretedMethod(interpreter, method, scope) {
      return function () {
        return interpreter.interpretMethod(this === globalObject.JS ? globalObject : this,
                                           method, scope, arguments);
      };
    }

    const mode = this.mode;

    if (!method.activationPrototype) {
      method.activationPrototype = this.applyTraits({}, method.traits);
    }

    if (!method.analysis) {
      method.analysis = new Analysis(method, { massage: true });
    }

    if (mode === ALWAYS_INTERPRET) {
      return interpretedMethod(this.interpreter, method, scope);
    }

    if (method.compiledMethod) {
      return closeOverScope(method.compiledMethod, scope);
    }

    if (!method.analysis.restructureControlFlow()) {
      return interpretedMethod(this.interpreter, method, scope);
    }

    var result = this.compiler.compileMethod(method, scope);

    var parameters = method.parameters.map(function (p) {
      return p.name;
    });
    parameters.unshift(SAVED_SCOPE_NAME);

    function flatten(array, indent) {
      var str = "";
      array.forEach(function (x) {
        if (x instanceof Indent) {
          str += flatten(x.statements, indent + "  ");
        } else if (x instanceof Array) {
          str += flatten(x, indent);
        } else {
          str += indent + x + "\n";
        }
      });
      return str;
    }

    var body = flatten(result.statements, "");
    if (traceLevel.value > 4) {
      print('\033[93m' + body + '\033[0m');
    }
    method.compiledMethod = new Function(parameters, body);

    /* Hook to set breakpoints in compiled code. */
    if (functionCount == 13) {
      body = "stop();" + body;
    }

    if (traceLevel.value > 0) {
      /* Unfortunately inner functions are not pretty-printed by the JS engine, so here we recompile the
       * inner function by itself just for pretty printing purposes.
       */
      eval ("function fnSource" + functionCount + " (" + parameters.join(", ") + ") { " + body + " }");
      print('\033[92m' + eval("fnSource" + functionCount) + '\033[0m');
    }

    functionCount++;
    return closeOverScope(method.compiledMethod, scope);
  };

  /**
   * ActionScript Classes are modeled as constructor functions (class objects) which hold additional properties:
   *
   * [scope]: a scope object holding the current class object
   *
   * [baseClass]: a reference to the base class object
   *
   * [instanceTraits]: an accumulated set of traits that are to be applied to instances of this class
   *
   * [prototype]: the prototype object of this constructor function  is populated with the set of instance traits,
   *   when instances are of this class are created, their __proto__ is set to this object thus inheriting this
   *   default set of properties.
   *
   * [construct]: a reference to the class object itself, this is used when invoking the constructor with an already
   *   constructed object (i.e. constructsuper)
   *
   * additionally, the class object also has a set of class traits applied to it which are visible via scope lookups.
   */
  runtime.prototype.createClass = function createClass(classInfo, baseClass, scope) {
    scope = new Scope(scope, null);

    var cls = this.createFunction(classInfo.instance.init, scope);
    scope.object = cls;

    var instanceTraits = classInfo.instance.traits;

    cls.scope = scope;
    cls.classInfo = classInfo;
    cls.baseClass = baseClass;
    cls.instanceTraits = instanceTraits;

    cls.prototype = baseClass ? Object.create(baseClass.prototype) : {};

    this.applyTraits(cls.prototype, instanceTraits, baseClass.instanceTraits, scope);
    this.applyTraits(cls, classInfo.traits, null, scope);

    /* Call the static constructor. */
    this.createFunction(classInfo.init, scope).call(cls);

    return cls;
  };

  /* Extend builtin Objects so they behave as classes. */
  Object.instanceTraits = new Traits([]);
  Object.instanceTraits.verified = true;
  Object.instanceTraits.lastSlotId = 0;

  /**
   * Apply a set of traits to an object. Slotted traits may alias named properties, thus for
   * every slotted trait we create two properties: one to hold the actual value, one to hold
   * a getter/setter that reads the actual value. For instance, for the slot trait "7:Age" we
   * generated three properties: "S7" to hold the actual value, and an "Age" getter/setter pair
   * that mutate the "S7" property. The invariant we want to maintain is [obj.S7 === obj.Age].
   *
   * This means that there are two ways to get to any slotted trait, a fast way and a slow way.
   * I guess we should profile and find out which type of access is more common (by slotId or
   * by name).
   *
   * Moreover, traits may be typed which means that type coercion must happen whenever values
   * are stored in traints. To do this, we introduce yet another level of indirection. In the
   * above example, if "Age" is of type "int" then we store the real value in the property "$S7",
   * and use a setter in the property "S7" to do the type coercion.
   */
  runtime.prototype.applyTraits = function applyTraits(obj, traits, baseTraits, scope) {
    function computeAndVerifySlotIds(traits, base) {
      assert(!base || base.verified);

      var baseSlotId = base ? base.lastSlotId : 0;
      var freshSlotId = baseSlotId;

      var ts = traits.traits;
      for (var i = 0, j = ts.length; i < j; i++) {
        var trait = ts[i];
        if (trait.isSlot() || trait.isConst() || trait.isClass()) {
          if (!trait.slotId) {
            trait.slotId = ++freshSlotId;
          }

          if (trait.slotId <= baseSlotId) {
            throw new VerifyError("bad slot id");
          }
        }
      }

      traits.verified = true;
      traits.lastSlotId = freshSlotId;
    }

    function setProperty(name, slotId, value, typeName) {
      if (slotId) {
        if (!typeName || getTypeByName(typeName) === null) {
          obj["S" + slotId] = value;
        } else {
          obj["$S" + slotId] = value;
          var coerce = getTypeByName(typeName).coerce;
          assert (coerce, "No coercion function for type " + typeName);
          Object.defineProperty(obj, "S" + slotId, {
            get: function () {
              return this["$S" + slotId];
            },
            set: function (val) {
              return this["$S" + slotId] = coerce(val);
            }
          });
        }
        Object.defineProperty(obj, name, {
          get: function () {
            return this["S" + slotId];
          },
          set: function (val) {
            return this["S" + slotId] = val;
          }
        });
      } else {
        obj[name] = value;
      }
    }

    if (!traits.verified) {
      computeAndVerifySlotIds(traits, baseTraits);
    }

    var ts = traits.traits;
    for (var i = 0, j = ts.length; i < j; i++) {
      var trait = ts[i];
      if (trait.isSlot() || trait.isConst()) {
        setProperty(trait.name.getQualifiedName(), trait.slotId, trait.value, trait.typeName);
      } else if (trait.isMethod()) {
        assert (scope !== undefined);
        var closure = this.createFunction(trait.method, new Scope(scope, obj));
        setProperty(trait.name.getQualifiedName(), undefined, closure);
      } else if (trait.isClass()) {
        setProperty(trait.name.getQualifiedName(), trait.slotId, null);
      } else {
        assert(false, trait);
      }
    }

    return obj;
  };

  runtime.prototype.isType = function isType(value, type) {
    if (typeof value === 'number') {
      if ((value | 0) !== value) {
        return false;
      }
      if (type === globalObject.int) {
        return (value & 0xffffffff) === value;
      } else if (type === globalObject.uint) {
        return value >= 0 && value <= UINT_MAX_VALUE;
      }
      notImplemented();
    }
    return false;
  };

  runtime.VerifyError = VerifyError;

  return runtime;
})();

/**
 * Initializes an abc file's runtime and traits, and returns the entryPoint function.
 */
function createEntryPoint(abc, global, mode) {
  assert (!abc.hasOwnProperty("runtime"));
  abc.runtime = new Runtime(abc, mode);
  abc.runtime.applyTraits(global, abc.lastScript.traits, null, null);
  return abc.runtime.createFunction(abc.lastScript.entryPoint, null);
}

/**
 * This is the main entry point to the VM. To re-execute an abc file, call [createEntryPoint] once and
 * cache its result for repeated evaluation;
 */
function executeAbc(abc, global, mode) {
  var fn = createEntryPoint(abc, global, mode);
  fn.call(global, null);
}
