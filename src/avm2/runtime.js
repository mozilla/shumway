var runtimeOptions = systemOptions.register(new OptionSet("Runtime Options"));

var traceScope = runtimeOptions.register(new Option("ts", "traceScope", "boolean", false, "trace scope execution"));
var traceExecution = runtimeOptions.register(new Option("tx", "traceExecution", "boolean", false, "trace script execution"));
var tracePropertyAccess = runtimeOptions.register(new Option("tpa", "tracePropertyAccess", "boolean", false, "trace property access"));
var functionBreak = compilerOptions.register(new Option("fb", "functionBreak", "number", -1, "Inserts a debugBreak at function index #."));
var compileOnly = compilerOptions.register(new Option("co", "compileOnly", "number", -1, "Compiles only function number."));
var compileUntil = compilerOptions.register(new Option("cu", "compileUntil", "number", -1, "Compiles only until a function number."));
var debuggerMode = runtimeOptions.register(new Option("dm", "debuggerMode", "boolean", false, "matches avm2 debugger build semantics"));

var jsGlobal = (function() { return this || (1, eval)('this'); })();

var VM_SLOTS = "vm slots";
var VM_LENGTH = "vm length";
var VM_BINDINGS = "vm bindings";
var VM_NATIVE_PROTOTYPE_FLAG = "vm native prototype";
var VM_ENUMERATION_KEYS = "vm enumeration keys";
var VM_OPEN_METHODS = "vm open methods";
var VM_NEXT_NAME = "vm next name";
var VM_NEXT_NAME_INDEX = "vm next name index";
var VM_UNSAFE_CLASSES = ["Shumway"];

var VM_OPEN_METHOD_PREFIX = "open$";

var VM_NATIVE_BUILTINS = [Object, Number, Boolean, String, Array, Date, RegExp];

var VM_NATIVE_BUILTIN_SURROGATES = [
  { object: Object, methods: ["toString", "valueOf"] },
  { object: Function, methods: ["toString", "valueOf"] }
];

var VM_NATIVE_BUILTIN_ORIGINALS = "vm originals";

var $M = [];

function initializeGlobalObject(global) {
  var PUBLIC_MANGLED = /^public\$/;

  function getEnumerationKeys(obj) {
    var keys = [];
    for (var key in obj) {
      if (PUBLIC_MANGLED.test(key) &&
          !(obj[VM_BINDINGS] && obj[VM_BINDINGS].indexOf(key) >= 0)) {
        keys.push(key.substr(7));
      }
    }
    return keys;
  }

  /**
   * Gets the next name index of an object. Index |zero| is actually not an
   * index, but rather an indicator to start the iteration.
   */
  defineReadOnlyProperty(global.Object.prototype, VM_NEXT_NAME_INDEX, function (index) {
    if (index === 0) {
      /**
       * We're starting a new iteration. Hope that VM_ENUMERATION_KEYS haven't been
       * defined already.
       */
      this[VM_ENUMERATION_KEYS] = getEnumerationKeys(this);
    }

    var keys = this[VM_ENUMERATION_KEYS];

    while (index < keys.length) {
      //
      if (keys[index]) {
        return index + 1;
      }
      index ++;
    }

    delete this[VM_ENUMERATION_KEYS];
    return 0;
  });

  /**
   * Gets the nextName after the specified |index|, which you would expect to
   * be index + 1, but it's actually index - 1;
   */
  defineReadOnlyProperty(global.Object.prototype, VM_NEXT_NAME, function (index) {
    var keys = this[VM_ENUMERATION_KEYS];
    release || assert(keys && index > 0 && index < keys.length + 1);
    return keys[index - 1];
  });

  /**
   * Surrogates are used to make |toString| and |valueOf| work transparently. For instance, the expression
   * |a + b| should implicitly expand to |a.public$valueOf() + b.public$valueOf()|. Since, we don't want
   * to call |public$valueOf| explicitly we instead patch the |valueOf| property in the prototypes of native
   * builtins to call the |public$valueOf| instead.
   */
  var originals = global[VM_NATIVE_BUILTIN_ORIGINALS] = {};
  VM_NATIVE_BUILTIN_SURROGATES.forEach(function (surrogate) {
    var object = surrogate.object;
    originals[object.name] = {};
    surrogate.methods.forEach(function (originalFunctionName) {
      var originalFunction = object.prototype[originalFunctionName];
      // Save the original method in case |getNative| needs it.
      originals[object.name][originalFunctionName] = originalFunction;
      var overrideFunctionName = Multiname.getPublicQualifiedName(originalFunctionName);
      // Patch the native builtin with a surrogate.
      global[object.name].prototype[originalFunctionName] = function surrogate() {
        if (this[overrideFunctionName]) {
          return this[overrideFunctionName]();
        }
        return originalFunction.call(this);
      };
    });
  });

  VM_NATIVE_BUILTINS.forEach(function (o) {
    defineReadOnlyProperty(o.prototype, VM_NATIVE_PROTOTYPE_FLAG, true);
  });
}

/**
 * Checks if the specified |obj| is the prototype of a native JavaScript object.
 */
function isNativePrototype(obj) {
  return obj.hasOwnProperty(VM_NATIVE_PROTOTYPE_FLAG);
}

initializeGlobalObject(jsGlobal);

function createNewGlobalObject() {
  var global = null;
  if (inBrowser) {
    var iFrame = document.createElement("iframe");
    iFrame.style.display = "none";
    document.body.appendChild(iFrame);
    global = window.frames[window.frames.length - 1];
  } else {
    global = newGlobal('new-compartment');
  }
  initializeGlobalObject(global);
  return global;
}

function toDouble(x) {
  return Number(x);
}

function toBoolean(x) {
  return !!x;
}

function toUint(x) {
  var obj = x | 0;
  return obj < 0 ? (obj + 4294967296) : obj;
}

function toInt(x) {
  return x | 0;
}

function toString(x) {
  return String(x);
}

function coerce(value, type) {
  if (type.coerce) {
    return type.coerce(value);
  }

  if (isNullOrUndefined(value)) {
    return null;
  }

  if (type.isInstance(value)) {
    return value;
  } else {
    // FIXME throwErrorFromVM needs to be called from within the runtime
    // because it needs access to the domain or the domain has to be
    // aquired through some other mechanism.
    // throwErrorFromVM("TypeError", "Cannot coerce " + obj + " to type " + type);

    // For now just assert false to print the message.
    release || assert(false, "Cannot coerce " + value + " to type " + type);
  }
}

/**
 * Similar to |toString| but returns |null| for |null| or |undefined| instead
 * of "null" or "undefined".
 */
function coerceString(x) {
  if (x === null || x === undefined) {
    return null;
  }
  return String(x);
}

function typeOf(x) {
  return typeof x;
}

function getSlot(obj, index) {
  return obj[obj[VM_SLOTS][index].name];
}

function setSlot(obj, index, value) {
  var binding = obj[VM_SLOTS][index];
  if (binding.const) {
    return;
  }
  var name = binding.name;
  var type = binding.type;
  if (type && type.coerce) {
    obj[name] = type.coerce(value);
  } else {
    obj[name] = value;
  }
}

function nextName(obj, index) {
  return obj[VM_NEXT_NAME](index);
}

function nextValue(obj, index) {
  return obj[Multiname.getPublicQualifiedName(obj[VM_NEXT_NAME](index))];
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
  release || assert(obj);
  release || assert(index >= 0);

  /**
   * Because I don't think hasnext/hasnext2/nextname opcodes are used outside
   * of loops in "normal" ABC code, we can deviate a little for semantics here
   * and leave the prototype-chaining to the |for..in| operator in JavaScript
   * itself, in |obj[VM_NEXT_NAME_INDEX]|. That is, the object pushed onto the
   * stack, if the original object has any more properties left, will _always_
   * be the original object.
   */
  return {index: obj[VM_NEXT_NAME_INDEX](index), object: obj};
}

function getDescendants(multiname, obj) {
  notImplemented("getDescendants");
}

function checkFilter(value) {
  notImplemented("checkFilter");
}

function Activation (methodInfo) {
  this.methodInfo = methodInfo;
}

var Interface = (function () {
  function Interface(classInfo) {
    var ii = classInfo.instanceInfo;
    release || assert(ii.isInterface());
    this.name = ii.name;
    this.classInfo = classInfo;
  }

  Interface.prototype = {
    toString: function () {
      return "[interface " + this.name + "]";
    },

    isInstance: function (value) {
      if (value === null || typeof value !== "object") {
        return false;
      }

      var cls = value.class;
      if (cls) {
        var interfaces = cls.implementedInterfaces;
        for (var i = 0, j = interfaces.length; i < j; i++) {
          if (interfaces[i] === this) {
            return true;
          }
        }
      }

      return false;
    }
  };

  return Interface;
})();

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
 *
 * Scope Caching:
 *
 * Calls to |findProperty| are very expensive. They recurse all the way to the top of the scope chain and then
 * laterally across other scripts. We optimize this by caching property lookups in each scope using Multiname
 * |id|s as keys. Each Multiname object is given a unique ID when it's constructed. For QNames we only cache
 * string QNames.
 *
 * TODO: This is not sound, since you can add/delete properties to/from with scopes.
 */
var Scope = (function () {
  function scope(parent, object, isWith) {
    this.parent = parent;
    this.object = object;
    this.global = parent ? parent.global : this;
    this.isWith = isWith;
    this.cache = Object.create(null);
  }

  scope.prototype.findDepth = function findDepth(obj) {
    var current = this;
    var depth = 0;
    while (current) {
      if (current.object === obj) {
        return depth;
      }
      depth ++;
      current = current.parent;
    }
    return -1;
  };

  scope.prototype.findProperty = function findProperty(mn, domain, strict, scopeOnly) {
    release || assert(this.object);
    release || assert(Multiname.isMultiname(mn));

    var obj;
    var cache = this.cache;

    var id = typeof mn === "string" ? mn : mn.id;
    if (!scopeOnly && id && (obj = cache[id])) {
      return obj;
    }

    if (traceScope.value || tracePropertyAccess.value) {
      print("Scope.findProperty(" + mn + ")");
    }
    obj = this.object;
    if (Multiname.isQName(mn)) {
      if (this.isWith) {
        if (Multiname.getQualifiedName(mn) in obj) {
          return obj;
        }
      } else {
        if (nameInTraits(obj, Multiname.getQualifiedName(mn))) {
          id && (cache[id] = obj);
          return obj;
        }
      }
    } else {
      if (this.isWith) {
        if (resolveMultiname(obj, mn)) {
          return obj;
        }
      } else {
        if (resolveMultinameInTraits(obj, mn)) {
          id && (cache[id] = obj);
          return obj;
        }
      }
    }

    if (this.parent) {
      obj = this.parent.findProperty(mn, domain, strict, scopeOnly);
      id && (cache[mn.id] = obj);
      return obj;
    }

    if (scopeOnly) {
      return null;
    }

    // If we can't find it still, then look at the domain toplevel.
    var r;
    if ((r = domain.findProperty(mn, strict, true))) {
      return r;
    }

    if (strict) {
      unexpected("Cannot find property " + mn);
    }

    return this.global.object;
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
 * Check if a qualified name is in an object's traits.
 */
function nameInTraits(obj, qn) {
  // If the object itself holds traits, try to resolve it. This is true for
  // things like global objects and activations, but also for classes, which
  // both have their own traits and the traits of the Class class.
  if (obj.hasOwnProperty(VM_BINDINGS) && obj.hasOwnProperty(qn))
    return true;

  // Else look on the prototype.
  var proto = Object.getPrototypeOf(obj);
  return proto.hasOwnProperty(VM_BINDINGS) && proto.hasOwnProperty(qn);
}

function resolveMultinameInTraits(obj, mn) {
  release || assert(!Multiname.isQName(mn), mn, " already resolved");

  obj = Object(obj);

  for (var i = 0, j = mn.namespaces.length; i < j; i++) {
    var qn = mn.getQName(i);
    if (nameInTraits(obj, Multiname.getQualifiedName(qn))) {
      return qn;
    }
  }
  return undefined;
}

/**
 * Resolving a multiname on an object using linear search.
 */
function resolveMultiname(obj, mn) {
  release || assert(!Multiname.isQName(mn), mn, " already resolved");

  obj = Object(obj);

  var publicQn;

  // Check if the object that we are resolving the multiname on is a JavaScript native prototype
  // and if so only look for public (dynamic) properties. The reason for this is because we cannot
  // overwrite the native prototypes to fit into our trait/dynamic prototype scheme, so we need to
  // work around it here during name resolution.

  var isNative = isNativePrototype(obj);
  if (isNative) {
    for (var i = 0, j = mn.namespaces.length; i < j; i++) {
      if (mn.namespaces[i].isDynamic()) {
        var publicQn = mn.getQName(i);
        if (Multiname.getQualifiedName(publicQn) in obj) {
          return publicQn;
        }
        break;
      }
    }
    return undefined;
  }

  for (var i = 0, j = mn.namespaces.length; i < j; i++) {
    var qn = mn.getQName(i);
    if (Multiname.getQualifiedName(qn) in obj) {
      return qn;
    }
  }

  return undefined;
}

function isPrimitiveType(x) {
  return typeof x === "number" || typeof x === "string" || typeof x === "boolean";
}

function sliceArguments(arguments, offset) {
  return Array.prototype.slice.call(arguments, offset);
}

function getProperty(obj, mn) {
  release || assert(obj !== undefined, "getProperty(", mn, ") on undefined");
  if (obj.canHandleProperties) {
    return obj.get(mn.name);
  }

  release || assert(Multiname.isMultiname(mn));

  var resolved = Multiname.isQName(mn) ? mn : resolveMultiname(obj, mn);
  var value = undefined;

  if (!resolved && (isPrimitiveType(obj))) {
    throw new ReferenceError(formatErrorMessage(Errors.ReadSealedError, mn.name, typeof obj));
  }

  if (resolved !== undefined) {
    if (Multiname.isAnyName(resolved)) {
      return undefined;
    }
    if (Multiname.isNumeric(resolved) && obj.indexGet) {
      value = obj.indexGet(Multiname.getQualifiedName(resolved), value);
    } else {
      value = obj[Multiname.getQualifiedName(resolved)];
    }
  }

  if (tracePropertyAccess.value) {
    print("getProperty(" + obj.toString() + ", " + mn + " -> " + resolved + ") has value: " + !!value);
  }

  return value;
}

function getSuper(obj, mn) {
  release || assert(obj != undefined, "getSuper(" + mn + ") on undefined");
  release || assert(obj.class.baseClass);
  release || assert(Multiname.isMultiname(mn));

  var superTraits = obj.class.baseClass.instance.prototype;

  var resolved = mn.isQName() ? mn : resolveMultiname(superTraits, mn);
  var value = undefined;

  if (resolved) {
    if (Multiname.isNumeric(resolved) && superTraits.indexGet) {
      value = superTraits.indexGet(Multiname.getQualifiedName(resolved), value);
    } else {
      // Which class is it really on?
      var qn = Multiname.getQualifiedName(resolved);
      var openMethod = superTraits[VM_OPEN_METHODS][qn];
      var superName = obj.class.baseClass.classInfo.instanceInfo.name;

      // If we're getting a method closure on the super class, close the open
      // method now and save it to a mangled name. We can't go through the
      // normal memoizer here because we could be overriding our own method or
      // getting into an infinite loop (getters that access the property
      // they're set to on the same object is bad news).
      if (openMethod) {
        value = obj[superName + " " + qn];
        if (!value) {
          value = obj[superName + " " + qn] = openMethod.bind(obj);
        }
      } else {
        var descriptor = Object.getOwnPropertyDescriptor(superTraits, qn);
        release || assert(descriptor);
        value = descriptor.get ? descriptor.get.call(obj) : obj[qn];
      }
    }
  }

  if (tracePropertyAccess.value) {
    print("getSuper(" + mn + ") has value: " + !!value);
  }

  return value;
}

function setProperty(obj, mn, value) {
  release || assert(obj);
  if (obj.canHandleProperties) {
    return obj.set(mn.name, value);
  }

  release || assert(Multiname.isMultiname(mn));

  var resolved = Multiname.isQName(mn) ? mn : resolveMultiname(obj, mn);

  if (tracePropertyAccess.value) {
    print("setProperty(" + mn + ") trait: " + value);
  }

  if (resolved === undefined) {
    // If we couldn't find the property, create one dynamically.
    // TODO: check sealed status
    resolved = Multiname.getPublicQualifiedName(mn.name);
  }

  if (Multiname.isNumeric(resolved) && obj.indexSet) {
    obj.indexSet(Multiname.getQualifiedName(resolved), value);
  } else {
    obj[Multiname.getQualifiedName(resolved)] = value;
  }
}

function setSuper(obj, mn, value) {
  release || assert(obj);
  release || assert(obj.class.baseClass);
  release || assert(Multiname.isMultiname(mn));

  if (tracePropertyAccess.value) {
    print("setProperty(" + mn + ") trait: " + value);
  }

  var superTraits = obj.class.baseClass.instance.prototype;
  var resolved = Multiname.isQName(mn) ? mn : resolveMultiname(superTraits, mn);

  if (resolved !== undefined) {
    if (Multiname.isNumeric(resolved) && superTraits.indexSet) {
      superTraits.indexSet(Multiname.getQualifiedName(resolved), value);
    } else {
      var qn = Multiname.getQualifiedName(resolved);
      var descriptor = Object.getOwnPropertyDescriptor(superTraits, qn);
      release || assert(descriptor);
      if (descriptor.set) {
        descriptor.set.call(obj, value);
      } else {
        obj[qn] = value;
      }
    }
  } else {
    throw new ReferenceError("Cannot create property " + mn.name +
                             " on " + obj.class.baseClass.debugName);
  }
}

function deleteProperty(obj, mn) {
  release || assert(obj);
  if (obj.canHandleProperties) {
    return obj.delete(mn.name);
  }

  release || assert(Multiname.isMultiname(mn), mn);

  var resolved = Multiname.isQName(mn) ? mn : resolveMultiname(obj, mn);

  if (resolved === undefined) {
    return true;
  }

  // Only dynamic properties can be deleted, so only look for those.
  if (resolved instanceof Multiname && !resolved.namespaces[0].isPublic()) {
    return false;
  }

  var qn = Multiname.getQualifiedName(resolved);
  if (!(qn in Object.getPrototypeOf(obj))) {
    /**
     * If we're in the middle of an enumeration "delete" the property from the
     * enumeration keys as well. Setting it to |undefined| will cause it to be
     * skipped by the enumeration bytecodes.
     */
    if (obj[VM_ENUMERATION_KEYS]) {
      var index = obj[VM_ENUMERATION_KEYS].indexOf(resolved.getName());
      if (index >= 0) {
        obj[VM_ENUMERATION_KEYS][index] = undefined;
      }
    }
    return delete obj[Multiname.getQualifiedName(resolved)];
  }
}

function isInstanceOf(value, type) {
  /*
  if (type instanceof Class) {
    return value instanceof type.instance;
  } else if (typeof type === "function") {
    return value instanceof type;
  } else {
    return false;
  }
  */
  return type.isInstanceOf(value);
}

function asInstance(value, type) {
  return type.isInstance(value) ? value : null;
}

function isInstance(value, type) {
  return type.isInstance(value);
}

function createActivation(methodInfo) {
  return Object.create(methodInfo.activationPrototype);
}

/**
 * Scope object backing for catch blocks.
 */
function CatchScopeObject(runtime, varTrait) {
  if (varTrait) {
    runtime.applyTraits(this, new Scope(null, this), null, [varTrait], null, false);
  }
}

/**
 * Global object for a script.
 */
var Global = (function () {
  function Global(runtime, script) {
    this.scriptInfo = script;
    script.global = this;
    script.abc = runtime.abc;
    runtime.applyTraits(this, new Scope(null, this), null, script.traits, null, false);
    script.loaded = true;
  }
  Global.prototype.toString = function () {
    return "[object global]";
  };
  defineNonEnumerableProperty(Global.prototype, Multiname.getPublicQualifiedName("toString"), function () {
    return this.toString();
  });
  return Global;
})();

/**
 * Execution context for an ABC.
 */
var Runtime = (function () {
  var totalFunctionCount = 0;
  var compiledFunctionCount = 0;

  function runtime(abc) {
    this.abc = abc;
    this.domain = abc.domain;
    if (this.domain.mode !== EXECUTION_MODE.INTERPRET) {
      if (enableC4.value) {
        this.compiler = new C4Compiler(abc);
      } else {
        this.compiler = new Compiler(abc);
      }
    }
    this.interpreter = new Interpreter(abc);

    /**
     * All runtime exceptions are boxed in this object to tag them as having
     * originated from within the VM.
     */
    this.exception = { value: undefined };
  }

  // We sometimes need to know where we came from, such as in
  // |ApplicationDomain.currentDomain|.
  runtime.stack = [];

  // This is called from catch blocks.
  runtime.unwindStackTo = function unwindStackTo(rt) {
    var stack = runtime.stack;
    var unwind = stack.length;
    while (stack[unwind - 1] !== rt) {
      unwind--;
    }
    stack.length = unwind;
  };

  /**
   * Creates a method from the specified |methodInfo| that is bound to the given |scope|. If the
   * scope is dynamic (as is the case for closures) the compiler generates an additional prefix
   * parameter for the compiled function named |SAVED_SCOPE_NAME| and then wraps the compiled
   * function in a closure that is bound to the given |scope|. If the scope is not dynamic, the
   * compiler bakes it in as a constant which should be much more efficient.
   */
  runtime.prototype.createFunction = function createFunction(methodInfo, scope, hasDynamicScope) {
    var mi = methodInfo;
    release || assert(!mi.isNative(), "Method should have a builtin: ", mi.name);

    var hasDefaults = false;
    var defaults = mi.parameters.map(function (p) {
      if (p.value !== undefined) {
        hasDefaults = true;
      }
      return p.value;
    });

    function interpretedMethod(interpreter, methodInfo, scope) {
      var fn = function () {
        var global = (this === jsGlobal ? scope.global.object : this);
        var args;
        if (hasDefaults && arguments.length < defaults.length) {
          args = Array.prototype.slice.call(arguments);
          args = args.concat(defaults.slice(arguments.length - defaults.length));
        } else {
          args = arguments;
        }
        return interpreter.interpretMethod(global, methodInfo, scope, args);
      };
      fn.instance = fn;
      return fn;
    }

    var mode = this.domain.mode;

    // We use not having an analysis to mean "not initialized".
    if (!mi.analysis) {
      mi.analysis = new Analysis(mi, { massage: true });

      if (mi.traits) {
        mi.activationPrototype = this.applyTraits(new Activation(mi), null, null, mi.traits, null, false);
      }

      // If we have exceptions, make the catch scopes now.
      var exceptions = mi.exceptions;
      for (var i = 0, j = exceptions.length; i < j; i++) {
        var handler = exceptions[i];
        if (handler.varName) {
          var varTrait = Object.create(Trait.prototype);
          varTrait.kind = TRAIT_Slot;
          varTrait.name = handler.varName;
          varTrait.typeName = handler.typeName;
          varTrait.holder = mi;
          handler.scopeObject = new CatchScopeObject(this, varTrait);
        } else {
          handler.scopeObject = new CatchScopeObject();
        }
      }
    }

    totalFunctionCount ++;

    if (mode === EXECUTION_MODE.INTERPRET || !shouldCompile(mi)) {
      return interpretedMethod(this.interpreter, mi, scope);
    }

    if (compileOnly.value >= 0) {
      if (Number(compileOnly.value) !== totalFunctionCount) {
        print("Compile Only Skipping " + totalFunctionCount);
        return interpretedMethod(this.interpreter, mi, scope);
      }
    }

    if (compileUntil.value >= 0) {
      if (totalFunctionCount > compileUntil.value) {
        print("Compile Until Skipping " + totalFunctionCount);
        return interpretedMethod(this.interpreter, mi, scope);
      }
    }

    if (compileOnly.value >= 0 || compileUntil.value >= 0) {
      print("Compiling " + totalFunctionCount);
    }

    function bindScope(fn, scope) {
      var closure = function () {
        Counter.count("Binding Scope");
        Array.prototype.unshift.call(arguments, scope);
        var global = (this === jsGlobal ? scope.global.object : this);
        return fn.apply(global, arguments);
      };
      closure.instance = closure;
      return closure;
    }

    if (mi.compiledMethod) {
      release || assert(hasDynamicScope);
      return bindScope(mi.compiledMethod, scope);
    }

    if (!mi.analysis.restructureControlFlow()) {
      return interpretedMethod(this.interpreter, mi, scope);
    }

    var parameters = mi.parameters.map(function (p) {
      return ARGUMENT_PREFIX + p.name;
    });

    if (hasDynamicScope) {
      parameters.unshift(SAVED_SCOPE_NAME);
    }

    $M.push(mi);

    var body = this.compiler.compileMethod(mi, hasDefaults, scope, hasDynamicScope);

    var fnName = mi.name ? Multiname.getQualifiedName(mi.name) : "fn" + compiledFunctionCount;
    if (mi.verified) {
      fnName += "$V";
    }
    if (compiledFunctionCount == functionBreak.value) {
      body = "{ debugBreak(\"" + fnName + "\");\n" + body + "}";
    }
    var fnSource = "function " + fnName + " (" + parameters.join(", ") + ") " + body;
    if (traceLevel.value > 1) {
      mi.trace(new IndentingWriter(), this.abc);
    }
    mi.debugTrace = (function (abc) {
      return function () {
        mi.trace(new IndentingWriter(), abc);
      }
    })(this.abc);
    if (traceLevel.value > 0) {
      print (fnSource);
    }
    if (true) { // Use |false| to avoid eval(), which is only useful for stack traces.
      mi.compiledMethod = eval('[$M[' + ($M.length - 1) + '],' + fnSource + '][1]');
    } else {
      mi.compiledMethod = new Function(parameters, body);
    }
    compiledFunctionCount++;

    if (hasDynamicScope) {
      return bindScope(mi.compiledMethod, scope);
    } else {
      return mi.compiledMethod;
    }
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
    var ci = classInfo;
    var ii = ci.instanceInfo;

    if (ii.isInterface()) {
      return this.createInterface(classInfo);
    }

    var domain = this.domain;

    var className = Multiname.getName(ii.name);
    if (traceExecution.value) {
      print("Creating class " + className  + (ci.native ? " replaced with native " + ci.native.cls : ""));
    }

    // Make the class and apply traits.
    //
    // User-defined classes should always have a base class, so we can save on
    // a few conditionals.
    var cls, instance;
    var baseBindings = baseClass ? baseClass.instance.prototype : null;

    /**
     * Check if the class is in the list of approved VM unsafe classes and mark its method traits
     * as native.
     */
    if (VM_UNSAFE_CLASSES.indexOf(className) >= 0) {
      ci.native = {cls: className + "Class"};
      ii.traits.concat(ci.traits).forEach(function (t) {
        if (t.isMethod()) {
          t.methodInfo.flags |= METHOD_Native;
        }
      });
    }

    if (ci.native) {
      // Some natives classes need this, like Error.
      var makeNativeClass = getNative(ci.native.cls);
      release || assert(makeNativeClass, "No native for ", ci.native.cls);

      // Special case Object, which has no base class but needs the Class class on the scope.
      if (!baseClass) {
        scope = new Scope(scope, domain.system.Class);
      }
      scope = new Scope(scope, null);
      cls = makeNativeClass(this, scope, this.createFunction(ii.init, scope), baseClass);
      cls.classInfo = classInfo;
      cls.scope = scope;
      scope.object = cls;
      if ((instance = cls.instance)) {
        // Instance traits live on instance.prototype.
        this.applyTraits(instance.prototype, scope, baseBindings, ii.traits,
                         cls.native ? cls.native.instance : undefined, true);
      }
      this.applyTraits(cls, scope, null, ci.traits,
                       cls.native ? cls.native.static : undefined, false);
    } else {
      scope = new Scope(scope, null);
      instance = this.createFunction(ii.init, scope);
      cls = new domain.system.Class(className, instance);
      cls.classInfo = classInfo;
      cls.scope = scope;
      scope.object = cls;
      cls.extend(baseClass);
      this.applyTraits(cls.instance.prototype, scope, baseBindings, ii.traits, null, true);
      this.applyTraits(cls, scope, null, ci.traits, null, false);
    }


    if (ii.interfaces.length > 0) {
      cls.implementedInterfaces = [];
    }

    // Apply interface traits recursively.
    //
    // interface IA {
    //   function foo();
    // }
    //
    // interface IB implements IA {
    //   function bar();
    // }
    //
    // class C implements IB {
    //   function foo() { ... }
    //   function bar() { ... }
    // }
    //
    // var a:IA = new C();
    // a.foo(); // callprop IA$foo
    //
    // var b:IB = new C();
    // b.foo(); // callprop IB:foo
    // b.bar(); // callprop IB:bar
    //
    // So, class C must have bindings for:
    //
    // IA$foo -> public$foo
    // IB$foo -> public$foo
    // IB$bar -> public$bar
    //
    // Luckily, interface methods are always public.
    (function applyInterfaceTraits(interfaces) {
      for (var i = 0, j = interfaces.length; i < j; i++) {
        var interface = domain.getProperty(interfaces[i], true, true);
        var ii = interface.classInfo.instanceInfo;
        cls.implementedInterfaces.push(interface);
        applyInterfaceTraits(ii.interfaces);

        var bindings = instance.prototype;
        var interfaceTraits = ii.traits;
        for (var i = 0, j = interfaceTraits.length; i < j; i++) {
          var interfaceTrait = interfaceTraits[i];
          var interfaceTraitQn = Multiname.getQualifiedName(interfaceTrait.name);
          var interfaceTraitBindingQn = Multiname.getPublicQualifiedName(Multiname.getName(interfaceTrait.name));
          // TODO: We should just copy over the property descriptor but we can't because it may be a
          // memoizer which will fail to patch the interface trait name. We need to make the memoizer patch
          // all traits bound to it.
          // var interfaceTraitDescriptor = Object.getOwnPropertyDescriptor(bindings, interfaceTraitBindingQn);
          // Object.defineProperty(bindings, interfaceTraitQn, interfaceTraitDescriptor);
          var getter = function (target) {
            return function () {
              return this[target];
            }
          }(interfaceTraitBindingQn);
          defineNonEnumerableGetter(bindings, interfaceTraitQn, getter);
        }
      }
    })(ii.interfaces);

    // Run the static initializer.
    this.createFunction(classInfo.init, scope).call(cls);

    // Seal constant traits in the class object.
    this.sealConstantTraits(cls, ci.traits);

    // TODO: Seal constant traits in the instance object. This should be done after
    // the instance constructor has executed.

    if (traceClasses.value) {
      domain.loadedClasses.push(cls);
      domain.traceLoadedClasses();
    }

    return cls;
  };

  runtime.prototype.createInterface = function createInterface(classInfo) {
    var ii = classInfo.instanceInfo;
    release || assert(ii.isInterface());
    if (traceExecution.value) {
      var str = "Creating interface " + ii.name;
      if (ii.interfaces.length) {
        str += " implements " + ii.interfaces.map(function (name) {
          return name.getName();
        }).join(", ");
      }
      print(str);
    }
    return new Interface(classInfo);
  };

  /**
   * In ActionScript, assigning to a property defined as "const" outside of a static or instance
   * initializer throws a |ReferenceError| exception. To emulate this behaviour in JavaScript,
   * we "seal" constant traits properties by replacing them with setters that throw exceptions.
   */
  runtime.prototype.sealConstantTraits = function sealConstTraits(obj, traits) {
    var rt = this;
    for (var i = 0, j = traits.length; i < j; i++) {
      var trait = traits[i];
      if (trait.isConst()) {
        var qn = Multiname.getQualifiedName(trait.name);
        var value = obj[qn];
        (function (qn, value) {
          Object.defineProperty(obj, qn, { configurable: false, enumerable: false,
            get: function () {
              return value;
            },
            set: function () {
              rt.throwErrorFromVM("ReferenceError", "Illegal write to read-only property " + qn + ".");
            }
          });
        })(qn, value);
      }
    }
  };

  /**
   * Memoizers and Trampolines:
   * ==========================
   *
   * In ActionScript 3 the following code creates a method closure for function |m|:
   *
   * class A {
   *   function m() { }
   * }
   *
   * var a = new A();
   * var x = a.m;
   *
   * Here |x| is a method closure for |m| whose |this| pointer is bound to |a|. We want method closures to be
   * created transparently whenever the |m| property is read from |a|. To do this, we install a memoizing
   * getter in the instance prototype that sets the |m| property of the instance object to a bound method closure:
   *
   * Ma = A.instance.prototype.m = function memoizer() {
   *   this.m = m.bind(this);
   * }
   *
   * var a = new A();
   * var x = a.m; // |a.m| calls the memoizer which in turn patches |a.m| to |m.bind(this)|
   * x = a.m; // |a.m| is already a method closure
   *
   * However, this design causes problems for method calls. For instance, we don't want the call expression |a.m()|
   * to be interpreted as |(a.m)()| which creates method closures every time a method is called on a new object.
   * Luckily, method call expressions such as |a.m()| are usually compiled as |callProperty(a, m)| by ASC and
   * lets us determine at compile time whenever a method closure needs to be created. In order to prevent the
   * method closure from being created by the memoizer we install the original |m| in the instance prototype
   * as well, but under a different name |m'|. Whenever we want to avoid creating a method closure, we just
   * access the |m'| property on the object. The expression |a.m()| is compiled by Shumway to |a.m'()|.
   *
   * Memoizers are installed whenever traits are applied which happens when a class is created. At this point
   * we don't actually have the function |m| available, it hasn't been compiled yet. We only want to compile the
   * code that is executed and thus we defer compilation until |m| is actually called. To do this, we create a
   * trampoline that compiles |m| before executing it.
   *
   * Tm = function trampoiline() {
   *   return compile(m).apply(this, arguments);
   * }
   *
   * Of course we don't want to recompile |m| every time its called. We can optimize the trampoline a bit
   * so that it keeps track of repeated executions:
   *
   * Tm = function trampoilineContext() {
   *   var c;
   *   return function () {
   *     if (!c) {
   *       c = compile(m);
   *     }
   *     return c.apply(this, arguments);
   *   }
   * }();
   *
   * This is not good enough, we want to prevent repeated executions as much as possible. The way to fix this is
   * to patch the instance prototype to point to the compiled version instead, so that the trampoline doesn't get
   * called again.
   *
   * Tm = function trampoilineContext() {
   *   var c;
   *   return function () {
   *     if (!c) {
   *       A.instance.prototype.m = c = compile(m);
   *     }
   *     return c.apply(this, arguments);
   *   }
   * }();
   *
   * This doesn't guarantee that the trampoline won't be called again, an unpatched reference to the trampoline
   * could have leaked somewhere.
   *
   * In fact, the memoizer first has to memoize the trampoline. When the trampoline is executed it needs to patch
   * the memoizer so that the next time around it memoizes |Fa| instead of the trampoline. The trampoline also has
   * to patch |m'| with |Fa|, as well as |m| on the instance with a bound |Fa|.
   */

  runtime.prototype.applyTraits = function applyTraits(obj, scope, base, traits, classNatives, delayBinding) {
    var runtime = this;
    var domain = this.domain;

    function makeFunction(trait) {
      release || assert(scope);
      release || assert(trait.isMethod() || trait.isGetter() || trait.isSetter());

      var mi = trait.methodInfo;
      var fn;

      if (mi.isNative() && domain.allowNatives) {
        var md = trait.metadata;
        if (md && md.native) {
          var nativeName = md.native.items[0].value;
          var makeNativeFunction = getNative(nativeName);
          if (!makeNativeFunction) {
            makeNativeFunction = domain.natives[nativeName];
          }
          fn = makeNativeFunction && makeNativeFunction(runtime, scope);
        } else if (md && md.unsafeJSNative) {
          fn = getNative(md.unsafeJSNative.items[0].value);
        } else if (classNatives) {
          // At this point the native class already had the scope, so we don't
          // need to close over the method again.
          var k = Multiname.getName(mi.name);
          if (trait.isGetter()) {
            fn = classNatives[k] ? classNatives[k].get : undefined;
          } else if (trait.isSetter()) {
            fn = classNatives[k] ? classNatives[k].set : undefined;
          } else {
            fn = classNatives[k];
          }
        }
      } else {
        fn = runtime.createFunction(mi, scope);
      }

      if (!fn) {
        return (function (mi) {
          return function () {
            print("Calling undefined native method: " + mi.holder.name + "::" + Multiname.getQualifiedName(mi.name));
          };
        })(mi);
      }

      if (traceExecution.value) {
        print("Made Function: " + Multiname.getQualifiedName(mi.name));
      }

      return fn;
    }

    // Copy over base trait bindings.
    if (base) {
      var bindings = base[VM_BINDINGS];
      var baseOpenMethods = base[VM_OPEN_METHODS];
      var openMethods = {};
      for (var i = 0; i < bindings.length; i++) {
        var qn = bindings[i];
        Object.defineProperty(obj, qn, Object.getOwnPropertyDescriptor(base, qn));
        if (qn in baseOpenMethods) {
          openMethods[qn] = baseOpenMethods[qn];
          defineNonEnumerableProperty(obj, VM_OPEN_METHOD_PREFIX + qn, baseOpenMethods[qn]);
        }
      }
      defineNonEnumerableProperty(obj, VM_BINDINGS, base[VM_BINDINGS].slice());
      defineNonEnumerableProperty(obj, VM_SLOTS, base[VM_SLOTS].slice());
      defineNonEnumerableProperty(obj, VM_OPEN_METHODS, openMethods);
    } else {
      defineNonEnumerableProperty(obj, VM_BINDINGS, []);
      defineNonEnumerableProperty(obj, VM_SLOTS, []);
      defineNonEnumerableProperty(obj, VM_OPEN_METHODS, {});
    }


    function applyMethodTrait(trait) {
      release || assert (trait.isMethod());
      var qn = Multiname.getQualifiedName(trait.name);

      function makeTrampoline(patch) {
        release || assert (patch && typeof patch === "function");
        var trampoline = (function trampolineContext() {
          var target = null;
          return function trampoline() {
            if (traceExecution.value) {
              print("Executing Trampoline: " + qn);
            }
            if (!target) {
              target = makeFunction(trait);
              patch(target);
            }
            return target.apply(this, arguments);
          };
        })();
        // Make sure that the length property of the trampoline matches the trait's number of
        // parameters. However, since we can't redefine the |length| property of a function,
        // we define a new hidden |VM_LENGTH| property to store this value.
        defineReadOnlyProperty(trampoline, VM_LENGTH, trait.methodInfo.parameters.length);
        return trampoline;
      }

      function makeMemoizer(target) {
        function memoizer() {
          Counter.count("Runtime: Memoizing");
          if (traceExecution.value) {
            print("Memoizing: " + qn);
          }
          if (isNativePrototype(this)) {
            Counter.count("Runtime: Method Closures");
            return target.value.bind(this);
          }
          if (this.hasOwnProperty(qn)) {
            Counter.count("Runtime: Unpatched Memoizer");
            return this[qn];
          }
          var mc = target.value.bind(this);
          defineReadOnlyProperty(mc, "public$prototype", null);
          defineReadOnlyProperty(this, qn, mc);
          return mc;
        }
        Counter.count("Runtime: Memoizers");
        return memoizer;
      }

      if (delayBinding) {
        release || assert(obj[VM_OPEN_METHODS]);
        // Patch the target of the memoizer using a temporary |target| object that is visible to both the trampoline
        // and the memoizer. The trampoline closes over it and patches the target value while the memoizer uses the
        // target value for subsequent memoizations.
        var target = { value: null };
        var trampoline = makeTrampoline(function (fn) {
          Counter.count("Runtime: Patching Memoizer");
          if (traceExecution.value) {
            print("Patching Memoizer: " + qn);
          }
          target.value = fn; // Patch the memoization target.
          obj[VM_OPEN_METHODS][qn] = fn; // Patch the open methods table.
          defineReadOnlyProperty(obj, VM_OPEN_METHOD_PREFIX + qn, fn); // Patch the open method name.
        });

        target.value = trampoline;

        obj[VM_OPEN_METHODS][qn] = trampoline;
        defineNonEnumerableProperty(obj, VM_OPEN_METHOD_PREFIX + qn, trampoline);

        var memoizer = makeMemoizer(target);
        // TODO: We make the |memoizeMethodClosure| configurable since it may be
        // overridden by a derived class. Only do this non final classes.
        defineNonEnumerableGetter(obj, qn, memoizer);
      } else {
        var trampoline = makeTrampoline(function (fn) {
          defineReadOnlyProperty(obj, qn, fn);
          defineReadOnlyProperty(obj, VM_OPEN_METHOD_PREFIX + qn, fn);
        });
        var closure = trampoline.bind(obj);
        defineReadOnlyProperty(closure, VM_LENGTH, trampoline[VM_LENGTH]);
        defineReadOnlyProperty(closure, "public$prototype", null);
        defineNonEnumerableProperty(obj, qn, closure);
        defineNonEnumerableProperty(obj, VM_OPEN_METHOD_PREFIX + qn, closure);
      }
    }

    var baseSlotId = obj[VM_SLOTS].length;
    var nextSlotId = baseSlotId + 1;

    for (var i = 0; i < traits.length; i++) {
      var trait = traits[i];
      var qn = Multiname.getQualifiedName(trait.name);
      if (trait.isSlot() || trait.isConst() || trait.isClass()) {
        if (!trait.slotId) {
          trait.slotId = nextSlotId++;
        }

        if (trait.slotId < baseSlotId) {
          // XXX: Hope we don't throw while doing builtins.
          release || assert(false);
          this.throwErrorFromVM("VerifyError", "Bad slot ID.");
        }

        if (trait.isClass()) {
          // Builtins are special, so drop any attempts to define builtins
          // that aren't from 'builtin.abc'.
          var pair = domain.findDefiningScript(trait.name, false);
          if (pair) {
            var abc = pair.script.abc;
            if (!abc.domain.base && abc.name === "builtin.abc") {
              continue;
            }
          }

          if (trait.metadata && trait.metadata.native && domain.allowNatives) {
            trait.classInfo.native = trait.metadata.native;
          }
        }

        var typeName = trait.typeName;
        defineNonEnumerableProperty(obj, qn, trait.value);
        obj[VM_SLOTS][trait.slotId] = {
          name: qn,
          const: trait.isConst(),
          type: typeName ? domain.getProperty(typeName, false, false) : null
        };
      } else if (trait.isMethod()) {
        applyMethodTrait(trait);
      } else if (trait.isGetter()) {
        defineNonEnumerableGetter(obj, qn, makeFunction(trait));
      } else if (trait.isSetter()) {
        defineNonEnumerableSetter(obj, qn, makeFunction(trait));
      } else {
        release || assert(false);
      }

      obj[VM_BINDINGS].push(qn);
    }

    return obj;
  };

  runtime.prototype.applyType = function applyType(factory, types) {
    var factoryClassName = factory.classInfo.instanceInfo.name.name;
    if (factoryClassName === "Vector") {
      release || assert(types.length === 1);
      var type = types[0];
      var typeClassName;
      if (type !== null && type !== undefined) {
        typeClassName = type.classInfo.instanceInfo.name.name;
        switch (typeClassName) {
          case "int":
          case "uint":
          case "double":
            break;
          default:
            typeClassName = "object";
            break;
        }
      } else {
        typeClassName = "object";
      }
      return this.domain.getClass("packageInternal __AS3__$vec.Vector$" + typeClassName);
    } else {
      return notImplemented(factoryClassName);
    }
  };

  runtime.prototype.throwErrorFromVM = function (errorClass, message, id) {
    throw new (this.domain.getClass(errorClass)).instance(message, id);
  };

  runtime.prototype.translateError = function (error) {
    if (error instanceof Error) {
      var type = this.domain.getClass(error.name);
      if (type) {
        return new type.instance(translateErrorMessage(error));
      }
      unexpected("Can't translate error: " + error);
    }
    return error;
  };

  runtime.prototype.notifyConstruct = function notifyConstruct(instance, args) {
    return this.domain.vm.notifyConstruct(instance, args);
  };

  return runtime;
})();
