var traceScope = options.register(new Option("traceScope", "ts", false, "trace scope execution"));
var traceToplevel = options.register(new Option("traceToplevel", "ttl", false, "trace top level execution"));
var traceClasses = options.register(new Option("traceClasses", "tc", false, "trace class creation"));
var traceExecution = options.register(new Option("traceExecution", "tx", false, "trace script execution"));
var tracePropertyAccess = options.register(new Option("tracePropertyAccess", "tpa", false, "trace property access"));

const ALWAYS_INTERPRET = 0x1;
const HEURISTIC_JIT = 0x2;

const jsGlobal = (function() { return this || (1, eval)('this'); })();

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

var builtinClasses = (function () {
  var builtins = {};
  // TODO: Figure out why adding Function here blows the stack.
  [Object, Number, String, Array, Boolean].forEach(function (cls) {
    builtins[cls.name] = cls;
  });


  builtins.int = function int(x) {
    return Number(x) | 0;
  };

  builtins.uint = function uint(x) {
    return Number(x) >>> 0;
  };

  return builtins;
})();

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
  if (factory === toplevel.Vector) {
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
    this.global = parent ? parent.global : this;
  }

  scope.prototype.findProperty = function findProperty(multiname, strict) {
    if (traceScope.value || tracePropertyAccess.value) {
      print("scopeFindProperty: " + multiname);
    }
    assert (this.object);
    for (var i = 0, j = multiname.namespaces.length; i < j; i++) {
      if (multiname.getQName(i).getQualifiedName() in this.object) {
        return this.object;
      }
    }
    if (this.parent) {
      return this.parent.findProperty(multiname, strict);
    }
    var obj;
    if ((obj = toplevel.findProperty(multiname, strict, true))) {
      return obj;
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
    // FIXME: This doesn't work since it also returns what global it's found
    // in. When is this used?
    return toplevel.resolveMultiname(multiname);
  };

  scope.prototype.trace = function () {
    var current = this;
    while (current) {
      print(current.object + (current.object ? " - " + current.object.debugName : ""));
      current = current.parent;
    }
  };

  return scope;
})();

/**
 * Resolve the [multiname] to a QName in the specified [obj], this is a linear search that uses [hasOwnProperty]
 * with the qualified name.
 */
function resolveMultiname(obj, multiname, checkPrototype) {
  assert (!multiname.isQName(), "We shouldn't resolve an already resolved name: " + multiname);
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

/**
 * Magical Properties Overview
 *
 * There are certain properties that are special both in AVM and in the JS
 * engine with matching semantics that we do not want to build wrapper getters
 * and setters for. We directly access these properties via the underlying JS
 * property without any namespace prefixes.
 *
 * NB: These properties, except numeric ones, are still _looked up_ with
 * namespace prefixes. For instance, in Array, we still set a pair of get/set
 * functions for |public$length|, even though when we get/set it, we go
 * directly to the underlying |length|.
 *
 * The list:
 *  - numeric properties on anything
 *  - public::prototype on anything
 *  - public::length on Arrays
 */

function getProperty(obj, multiname) {
  if (typeof multiname.name === "number") {
    return obj[GET_ACCESSOR](multiname.name);
  }

  var resolved;
  if (multiname.isQName()) {
    resolved = multiname;
  } else {
    resolved = resolveMultiname(obj, multiname, true);
  }

  if (resolved) {
    if (tracePropertyAccess.value) {
      print("getProperty: multiname: " + resolved + " value: " + obj[resolved.getQualifiedName()]);
    }

    var name = resolved.name;
    if (name === "prototype" && resolved.namespaces[0].isPublic()) {
      return obj.prototype;
    }
    if (name === "length" && resolved.namespaces[0].isPublic() && obj instanceof Array) {
      return obj.length;
    }

    return obj[resolved.getQualifiedName()];
  }

  return undefined;
}

function setProperty(obj, multiname, value) {
  if (typeof multiname.name === "number") {
    obj[SET_ACCESSOR](multiname.name, value);
    return;
  }

  var resolved;
  if (multiname.isQName()) {
    resolved = multiname;
  } else {
    resolved = resolveMultiname(Object.getPrototypeOf(obj), multiname, true);
  }

  if (!resolved) {
    // If we can't resolve the multiname, we're probably adding a dynamic
    // property, so just go ahead and use its name directly.
    // TODO: Remove assertion and loop when we're certain it will never fail.
    var publicNSIndex;
    for (var i = 0, j = multiname.namespaces.length; i < j; i++) {
      if (multiname.namespaces[i].isPublic()) {
        resolved = multiname.getQName(i);
        break;
      }
    }
    if (tracePropertyAccess.value) {
      print("setProperty: adding public: " + multiname + " value: " + value);
    }
    assert(resolved);
  }

  if (tracePropertyAccess.value) {
    print("setProperty: resolved multiname: " + resolved + " value: " + value);
  }

  var name = resolved.name;
  if (name === "prototype" && resolved.namespaces[0].isPublic()) {
    obj.prototype = value;
  } else if (name === "length" && resolved.namespaces[0].isPublic() && obj instanceof Array) {
    obj.length = value;
  } else {
    obj[resolved.getQualifiedName()] = value;
  }
}

/**
 * Global object for a script.
 */
var Global = (function () {
  function Global(runtime, script) {
    script.global = this;
    runtime.applyTraits(this, script.traits, undefined, new Scope(null, this));
    script.loaded = true;
  }
  return Global;
})();

/**
 * Toplevel that keeps track of all parsed ABCs and caches stuff.
 */
const toplevel = (function () {

  function Toplevel() {
    /* All ABCs that have been parsed. */
    this.abcs = [];

    /* Classes that have been loaded. */
    this.loadedClasses = [];
    // TODO: Caching
  }

  Toplevel.prototype = {
    getTypeByName: function getTypeByName(multiname, strict, execute) {
      var resolved = this.resolveMultiname(multiname, execute);
      if (resolved) {
        return resolved.object[resolved.name.getQualifiedName()];
      }
      if (strict) {
        return unexpected("Cannot find type " + multiname);
      } else {
        return null;
      }
    },

    findProperty: function findProperty(multiname, strict, execute) {
      if (traceToplevel.value) {
        print("Toplevel Find Property: " + multiname);
      }
      var resolved = this.resolveMultiname(multiname, execute);
      if (resolved) {
        return resolved.object;
      }
      if (strict) {
        return unexpected("Cannot find property " + multiname);
      } else {
        return null;
      }
      return null;
    },

    resolveMultiname: function _resolveMultiname(multiname, execute) {
      function ensureScriptIsExecuted(abc, script) {
        if (!script.executed && !script.executing) {
          executeScript(abc, script);
        }
      }
      var abcs = this.abcs;
      for (var i = 0, j = abcs.length; i < j; i++) {
        var abc = abcs[i];
        var scripts = abc.scripts;
        for (var k = 0, l = scripts.length; k < l; k++) {
          var script = scripts[k];
          var global = script.global;
          if (multiname.isQName()) {
            if (script.global.hasOwnProperty(multiname.getQualifiedName())) {
              if (traceToplevel.value) {
                print("Toplevel Resolved Multiname: " + multiname + " in " + abc + ", script: " + k);
                print("Script is executed ? " + script.executed + ", should we: " + execute + " is it in progress: " + script.executing);
                print("Value is: " + script.global[multiname.getQualifiedName()]);
              }
              if (execute) {
                ensureScriptIsExecuted(abc, script);
              }
              return { object: global, name: multiname };
            }
          } else {
            var resolved = resolveMultiname(global, multiname, false);
            if (resolved) {
              if (execute) {
                ensureScriptIsExecuted(abc, script);
              }
              return { object: global, name: resolved };
            }
          }
        }
      }
      return null;
    }
  };


  var toplevel = new Toplevel();
  /* FIXME: Only in place until we can run playerglobals. */
  // builtins.__proto__ = Global.prototype;
  // toplevel.abcs.push({ scripts: [{ global: builtins,
  //                                 executed: true }] });
  return toplevel;

})();

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
    this.exception = { value: undefined };
  }

  runtime.prototype.createActivation = function (method) {
    return Object.create(method.activationPrototype);
  };

  runtime.prototype.createFunction = function (method, scope) {
    if (method.isNative()) {
      return natives[method.name.getQualifiedName()] ||
        function() {
          print("Calling undefined native method: " + method.name.getQualifiedName());
        };
    }

    function closeOverScope(fn, scope) {
      return function () {
        Array.prototype.unshift.call(arguments, scope);
        var global = (this === jsGlobal ? scope.global.object : this);
        return fn.apply(global, arguments);
      };
    }

    function interpretedMethod(interpreter, method, scope) {
      return function () {
        var global = (this === jsGlobal ? scope.global.object : this);
        return interpreter.interpretMethod(global, method, scope, arguments);
      };
    }

    const mode = this.mode;

    /**
     * We use not having an analysis to mean "not initialized".
     */
    if (!method.analysis) {
      method.analysis = new Analysis(method, { massage: true });
      method.activationPrototype = this.applyTraits({}, method.traits);
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
    var className = classInfo.instance.name.name;
    if (traceExecution.value) {
      print("Creating class " + className  + (builtinClasses[className] ? " replaced with builtin " + builtinClasses[className].name : ""));
    }

    var cls = builtinClasses[className] || this.createFunction(classInfo.instance.init, scope);
    cls.debugName = "[class " + className + "]";
    scope.object = cls;

    var instanceTraits = classInfo.instance.traits;

    cls.scope = scope;
    cls.classInfo = classInfo;
    cls.baseClass = baseClass;
    cls.instanceTraits = instanceTraits;

    /**
     * Each AS3 class needs its own explicit public prototype. We fast-path
     * public prototypes to the actual prototype property on the underlying JS
     * object, but we need to add a placeholder here so multinames can be
     * resolved.
     */
    cls.public$prototype = null;

    cls.prototype = baseClass ? Object.create(baseClass.prototype) : {};
    cls.prototype.debugName = "[class " + className + "].prototype";

    var baseTraits = baseClass ? baseClass.instanceTraits : new Traits([], true);
    this.applyTraits(cls.prototype, instanceTraits, baseTraits, scope);
    this.applyTraits(cls, classInfo.traits, null, scope);

    if (traceClasses.value) {
      toplevel.loadedClasses.push(cls);
      var writer = new IndentingWriter();
      writer.enter(cls.debugName + " {");
      writer.enter("instance");
      writer.writeArray(Object.keys(cls.prototype));
      writer.leave("");
      writer.enter("static");
      writer.writeArray(Object.keys(cls));
      writer.leave("");
      writer.leave("}");
    }

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
   *
   * The |scope| must be passed in if the traits include method traits, which have to be bound to
   * a scope.
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

    function setProperty(name, slotId, value, type) {
      // print("Setting Property: " + name + ", slot: " + slotId + ", in: " + obj.debugName);
      if (slotId) {
        if (name in obj) {
          assert (!type || !type.coerce);
          Object.defineProperty(obj, "S" + slotId, {
            get: function () {
              return this[name];
            },
            set: function (val) {
              return this[name];
            }
          });
        } else {
          if (!type || !type.coerce) {
            obj["S" + slotId] = value;
          } else {
            obj["$S" + slotId] = value;
            var coerce = type.coerce;
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
        }
      } else if (!(name in obj)) {
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
        var type = trait.typeName ? toplevel.getTypeByName(trait.typeName, false, false) : null;
        setProperty(trait.name.getQualifiedName(), trait.slotId, trait.value, type);
      } else if (trait.isMethod() || trait.isGetter() || trait.isSetter()) {
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
      if (type === builtinClasses.int) {
        return (value & 0xffffffff) === value;
      } else if (type === builtinClasses.uint) {
        return value >= 0 && value <= UINT_MAX_VALUE;
      }
      notImplemented(type);
    }
    return false;
  };

  runtime.VerifyError = VerifyError;

  return runtime;
})();

function executeScript(abc, script) {
  if (disassemble.value) {
    abc.trace(new IndentingWriter(false));
  }
  if (traceExecution.value) {
    print("Executing : " + abc + ", script: " + script);
  }
  assert (!script.executing && !script.executed);
  script.executing = true;
  abc.runtime.createFunction(script.init, null).call(script.global);
  script.executed = true;
}

/**
 * This is the main entry point to the VM. To re-execute an abc file, call [createEntryPoint] once and
 * cache its result for repeated evaluation;
 */
function executeAbc(abc, mode) {
  prepareAbc(abc, mode);
  executeScript(abc, abc.lastScript);
  if (traceClasses.value) {
    var writer = new IndentingWriter();
    writer.enter("Loaded Classes");
    toplevel.loadedClasses.forEach(function (cls) {
      writer.enter(cls.debugName + " {");
      writer.enter("instance");
      writer.writeArray(Object.keys(cls.prototype));
      writer.leave("");
      writer.enter("static");
      writer.writeArray(Object.keys(cls));
      writer.leave("");
      writer.leave("}");
    });
    writer.leave("");
  }
}

function prepareAbc(abc, mode) {
  if (traceExecution.value) {
    print("Loading: " + abc);
  }
  toplevel.abcs.push(abc);

  var runtime = new Runtime(abc, mode);
  abc.runtime = runtime;

  /**
   * Initialize all the scripts inside the abc block and their globals in
   * reverse order, since some content depends on the last script being
   * initialized first or some shit.
   */
  var scripts = abc.scripts;
  for (var i = scripts.length - 1; i >= 0; i--) {
    var script = scripts[i];
    var global = new Global(runtime, script);
  }
}
