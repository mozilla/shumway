var runtimeOptions = systemOptions.register(new OptionSet("Runtime Options"));

var traceScope = runtimeOptions.register(new Option("ts", "traceScope", "boolean", false, "trace scope execution"));
var traceExecution = runtimeOptions.register(new Option("tx", "traceExecution", "boolean", false, "trace script execution"));
var tracePropertyAccess = runtimeOptions.register(new Option("tpa", "tracePropertyAccess", "boolean", false, "trace property access"));

const jsGlobal = (function() { return this || (1, eval)('this'); })();

var originals = [
  { object: Object, overrides: ["toString", "valueOf"] }
];

function initializeGlobalObject(global) {
  const PUBLIC_MANGLED = /^public\$/;
  function publicKeys(obj) {
    var keys = [];
    for (var key in obj) {
      if (PUBLIC_MANGLED.test(key) &&
          !(obj.bindings && obj.bindings.indexOf(key) >= 0)) {
        keys.push(key.substr(7));
      }
    }
    return keys;
  }

  /**
   * Gets the next name index of an object. Index |zero| is actually not an
   * index, but rather an indicator to start the iteration.
   */
  defineReadOnlyProperty(global.Object.prototype, "nextNameIndex", function (index) {
    if (index === 0) {
      /*
       * We're starting a new iteration. Hope that _publicKeys haven't been
       * defined already.
       */
      this._publicKeys = publicKeys(this);
    }
    if (index < this._publicKeys.length) {
      return index + 1;
    }
    delete this._publicKeys;
    return 0;
  });

  /**
   * Gets the nextName after the specified |index|, which you would expect to
   * be index + 1, but it's actually index - 1;
   */
  defineReadOnlyProperty(global.Object.prototype, "nextName", function (index) {
    var keys = this._publicKeys;
    assert (keys && index > 0 && index < keys.length + 1);
    return keys[index - 1];
  });

  /**
   * To get |toString| and |valueOf| to work transparently, as in without
   * reimplementing stuff like trace and +.
   */
  for (var i = 0, j = originals.length; i < j; i++) {
    var object = originals[i].object;
    originals[i].overrides.forEach(function (originalFunctionName) {
      var originalFunction = object.prototype[originalFunctionName];
      var overrideFunctionName = "public$" + originalFunctionName;
      global[object.name].prototype[originalFunctionName] = function () {
        if (this[overrideFunctionName]) {
          return this[overrideFunctionName]();
        }
        return originalFunction.call(this);
      };
    });
  }
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

function coerce(obj, type) {
  if (obj === null || type.isInstance(obj)) {
    return obj;
  } else {
    throwErrorFromVM("TypeError", "Cannot coerce " + obj + " to type " + type);
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
  if (x === null) {
    return typeof x;
  }
  var type = typeof x;
  if (type === "object") {
    return typeof (x.valueOf());
  }
  return type;
}

function getSlot(obj, index) {
  return obj[obj.slots[index].name];
}

function setSlot(obj, index, value) {
  var binding = obj.slots[index];
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
  return obj.nextName(index);
}

function nextValue(obj, index) {
  return obj["public$" + obj.nextName(index)];
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

  /**
   * Because I don't think hasnext/hasnext2/nextname opcodes are used outside
   * of loops in "normal" ABC code, we can deviate a little for semantics here
   * and leave the prototype-chaining to the |for..in| operator in JavaScript
   * itself, in |obj.nextNameIndex|. That is, the object pushed onto the
   * stack, if the original object has any more properties left, will _always_
   * be the original object.
   */
  return {index: obj.nextNameIndex(index), object: obj};
}

function getDescendants(multiname, obj) {
  notImplemented("getDescendants");
}

function checkFilter(value) {
  notImplemented("checkFilter");
}

var Interface = (function () {
  function Interface(classInfo) {
    var ii = classInfo.instanceInfo;
    assert (ii.isInterface());
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
 */
var Scope = (function () {
  function scope(parent, object) {
    this.parent = parent;
    this.object = object;
    this.global = parent ? parent.global : this;
  }

  scope.prototype.findProperty = function findProperty(multiname, domain, strict) {
    assert(this.object);
    assert(multiname instanceof Multiname);

    if (traceScope.value || tracePropertyAccess.value) {
      print("Scope.findProperty(" + multiname + ")");
    }

    var obj = this.object;
    // First check trait bindings.
    if (multiname.isQName()) {
      if (multiname.getQualifiedName() in obj) {
        return obj;
      }
    } else if (resolveMultiname(obj, multiname)) {
      return obj;
    }

    if (this.parent) {
      return this.parent.findProperty(multiname, domain, strict);
    }

    // If we can't find it still, then look at the domain toplevel.
    var r;
    if ((r = domain.findProperty(multiname, strict, true))) {
      return r;
    }

    if (strict) {
      unexpected("Cannot find property " + multiname);
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
 * Resolving a multiname on an object using linear search.
 */
function resolveMultiname(obj, multiname) {
  assert(!multiname.isQName(), multiname, " already resolved");

  obj = Object(obj);
  for (var i = 0, j = multiname.namespaces.length; i < j; i++) {
    var qn = multiname.getQName(i);
    if (qn.getQualifiedName() in obj) {
      return qn;
    }
  }

  return undefined;
}

function getProperty(obj, multiname) {
  assert(obj != undefined, "getProperty(", multiname, ") on undefined");
  assert(multiname instanceof Multiname);

  var numericName = parseInt(multiname.name);
  if (!isNaN(numericName)) {
    // Vector, for instance, has a special getter for [].
    if (obj.indexGet) {
      return obj.indexGet(numericName);
    }
    return obj[numericName];
  }

  var resolved = multiname.isQName() ? multiname : resolveMultiname(obj, multiname);
  var value = resolved ? obj[resolved.getQualifiedName()] : undefined;

  if (tracePropertyAccess.value) {
    print("getProperty(" + multiname + ") has value: " + !!value);
  }

  return value;
}

function getSuper(obj, multiname) {
  assert(obj != undefined, "getSuper(" + multiname + ") on undefined");
  assert(obj.class.baseClass);
  assert(multiname instanceof Multiname);

  var superTraits = obj.class.baseClass.instance.prototype;

  if (typeof multiname.name === "number") {
    // Vector, for instance, has a special getter for [].
    if (superTraits.indexGet) {
      return superTraits.indexGet.call(obj, multiname.name);
    }

    return obj[multiname.name];
  }

  var resolved = multiname.isQName() ? multiname : resolveMultiname(superTraits, multiname);
  var value = resolved ? obj[resolved.getQualifiedName()] : undefined;

  if (tracePropertyAccess.value) {
    print("getSuper(" + multiname + ") has value: " + !!value);
  }

  return value;
}

function setProperty(obj, multiname, value) {
  assert(obj);
  assert(multiname instanceof Multiname);

  var numericName = parseInt(multiname.name);
  if (!isNaN(numericName)) {
    if (obj.indexSet) {
      obj.indexSet(numericName, value);
      return;
    }
    obj[numericName] = value;
    return;
  }

  if (tracePropertyAccess.value) {
    print("setProperty(" + multiname + ") trait: " + value);
  }

  var resolved = multiname.isQName() ? multiname : resolveMultiname(obj, multiname);
  if (resolved) {
    obj[resolved.getQualifiedName()] = value;
  } else {
    obj["public$" + multiname.name] = value;
  }
}

function setSuper(obj, multiname, value) {
  assert(obj);
  assert(obj.class.baseClass);
  assert(multiname instanceof Multiname);

  if (tracePropertyAccess.value) {
    print("setProperty(" + multiname + ") trait: " + value);
  }

  var superTraits = obj.class.baseClass.instance.prototype;
  var resolved = multiname.isQName() ? multiname : resolveMultiname(superTraits, multiname);
  if (!resolved) {
    throw new ReferenceError("Cannot create property " + multiname.name +
                             " on " + obj.class.baseClass.debugName);
  }

  obj[resolved.getQualifiedName()] = value;
}

function deleteProperty(obj, multiname) {
  assert(obj);
  assert(multiname instanceof Multiname);

  if (typeof multiname.name === "number") {
    if (obj.indexDelete) {
      return obj.indexDelete(multiname.name);
    }
    return delete obj[multiname.name];
  }

  // Only dynamic properties can be deleted, so only look for those.
  var pubname = "public$" + multiname.name;
  if (!(pubname in Object.getPrototypeOf(obj))) {
    return delete obj["public$" + multiname.name];
  }
}

function instanceOf(value, type) {
  if (type instanceof Class) {
    return value instanceof type.instance;
  } else if (typeof type === "function") {
    return value instanceof type;
  } else {
    return false;
  }
}

function isType(value, type) {
  return typeof type.isInstance === "function" ? type.isInstance(value) : false;
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
    script.global = this;
    script.abc = runtime.abc;
    runtime.applyTraits(this, new Scope(null, this), null, script.traits, null, false);
    script.loaded = true;
  }
  Global.prototype.toString = function () {
    return "[Global]";
  }
  return Global;
})();

/**
 * Execution context for an ABC.
 */
var Runtime = (function () {
  var functionCount = 0;

  function runtime(abc) {
    this.abc = abc;
    this.domain = abc.domain;
    if (this.domain.mode !== ALWAYS_INTERPRET) {
      this.compiler = new Compiler(abc);
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

  runtime.prototype.createActivation = function createActivation(method) {
    return Object.create(method.activationPrototype);
  };

  runtime.prototype.createFunction = function createFunction(methodInfo, scope) {
    const mi = methodInfo;
    assert(!mi.isNative(), "Method should have a builtin: ", mi.name);

    function closeOverScope(fn, scope) {
      var closure = function () {
        Array.prototype.unshift.call(arguments, scope);
        var global = (this === jsGlobal ? scope.global.object : this);
        return fn.apply(global, arguments);
      };
      closure.instance = closure;
      return closure;
    }

    var hasDefaults = false;
    const defaults = mi.parameters.map(function (p) {
      if (p.value) {
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

    const mode = this.domain.mode;

    // We use not having an analysis to mean "not initialized".
    if (!mi.analysis) {
      mi.analysis = new Analysis(mi, { massage: true });

      if (mi.traits) {
        mi.activationPrototype = this.applyTraits({}, null, null, mi.traits, null, false);
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

    if (mode === ALWAYS_INTERPRET) {
      return interpretedMethod(this.interpreter, mi, scope);
    }

    if (mi.compiledMethod) {
      return closeOverScope(mi.compiledMethod, scope);
    }

    if (!mi.analysis.restructureControlFlow()) {
      return interpretedMethod(this.interpreter, mi, scope);
    }

    var body = this.compiler.compileMethod(mi, hasDefaults, scope);

    var parameters = mi.parameters.map(function (p) {
      return p.name;
    });
    parameters.unshift(SAVED_SCOPE_NAME);

    var fnName = mi.name ? mi.name.getQualifiedName() : "fn" + functionCount;
    var fnSource = "function " + fnName + " (" + parameters.join(", ") + ") " + body;
    if (traceLevel.value > 0) {
      print (fnSource);
    }
    if (true) { // Use |false| to avoid eval(), which is only useful for stack traces.
      mi.compiledMethod = eval('[' + fnSource + '][0]');
    } else {
      mi.compiledMethod = new Function(parameters, body);
    }
    functionCount++;
    return closeOverScope(mi.compiledMethod, scope);
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

    const domain = this.domain;

    var className = ii.name.getName();
    if (traceExecution.value) {
      print("Creating class " + className  + (ci.native ? " replaced with native " + ci.native.cls : ""));
    }

    // Make the class and apply traits.
    //
    // User-defined classes should always have a base class, so we can save on
    // a few conditionals.
    var cls, instance;
    var baseBindings = baseClass ? baseClass.instance.prototype : null;

    if (ci.native) {
      // Some natives classes need this, like Error.
      var makeNativeClass = getNative(ci.native.cls);
      assert(makeNativeClass, "No native for ", ci.native.cls);

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
        this.applyTraits(instance.prototype, scope, baseBindings, ii.traits, cls.nativeMethods, true);
      }
      this.applyTraits(cls, scope, null, ci.traits, cls.nativeStatics, false);
    } else {
      scope = new Scope(scope, null);
      instance = this.createFunction(ii.init, scope);
      cls = new domain.system.Class(className, instance);
      cls.classInfo = classInfo;
      cls.scope = scope;
      scope.object = cls;
      cls.extend(baseClass);
      this.applyTraits(instance.prototype, scope, baseBindings, ii.traits, null, true);
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
        var iface = domain.getProperty(interfaces[i], true, true);
        var ii = iface.classInfo.instanceInfo;
        cls.implementedInterfaces.push(iface);
        applyInterfaceTraits(ii.interfaces);

        var bindings = instance.prototype;
        var iftraits = ii.traits;
        for (var i = 0, j = iftraits.length; i < j; i++) {
          var iftrait = iftraits[i];
          var ifqn = iftrait.name.getQualifiedName();
          var ptrait = Object.getOwnPropertyDescriptor(bindings, "public$" + iftrait.name.getName());
          Object.defineProperty(bindings, ifqn, ptrait);
        }
      }
    })(ii.interfaces);

    // Run the static initializer.
    this.createFunction(classInfo.init, scope).call(cls);

    if (traceClasses.value) {
      domain.loadedClasses.push(cls);
      domain.traceLoadedClasses();
    }

    return cls;
  };

  runtime.prototype.createInterface = function createInterface(classInfo) {
    var ii = classInfo.instanceInfo;
    assert (ii.isInterface());
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

  runtime.prototype.applyTraits = function applyTraits(obj, scope, base, traits, classNatives, delayBinding) {
    const runtime = this;
    const domain = this.domain;

    function makeClosure(trait) {
      assert(scope);

      var mi = trait.methodInfo;
      var closure;

      if (mi.isNative() && domain.allowNatives) {
        var md = trait.metadata;
        if (md && md.native) {
          var nativeName = md.native.items[0].value;
          var makeNativeClosure = getNative(nativeName);
          if (!makeNativeClosure)
            makeNativeClosure = domain.natives[nativeName];

          closure = makeNativeClosure && makeNativeClosure(runtime, scope);
        } else if (md && md.unsafeJSNative) {
          closure = getNative(md.unsafeJSNative.items[0].value);
        } else if (classNatives) {
          // At this point the native class already had the scope, so we don't
          // need to close over the method again.
          var k = mi.name.getName();
          if (trait.isGetter()) {
            k = "get " + k;
          } else if (trait.isSetter()) {
            k = "set " + k;
          }
          closure = classNatives[k];
        }
      } else {
        closure = runtime.createFunction(mi, scope);
      }

      if (!closure) {
        return (function (mi) {
          return function () {
            print("Calling undefined native method: " + mi.name.getQualifiedName());
          };
        })(mi);
      }

      return closure;
    }

    var baseSlotId;

    // Copy over base trait bindings.
    if (base) {
      var bindings = base.bindings;
      for (var i = 0, j = bindings.length; i < j; i++) {
        var qn = bindings[i];
        Object.defineProperty(obj, qn, Object.getOwnPropertyDescriptor(base, qn));
      }
      defineNonEnumerableProperty(obj, "bindings", base.bindings.slice());
      defineNonEnumerableProperty(obj, "slots", base.slots.slice());
      obj.slots = base.slots.slice();
      baseSlotId = obj.slots.length;
    } else {
      defineNonEnumerableProperty(obj, "bindings", []);
      defineNonEnumerableProperty(obj, "slots", []);
      baseSlotId = 0;
    }

    var freshSlotId = baseSlotId;

    for (var i = 0, j = traits.length; i < j; i++) {
      var trait = traits[i];
      var qn = trait.name.getQualifiedName();

      if (trait.isSlot() || trait.isConst() || trait.isClass()) {
        if (!trait.slotId) {
          trait.slotId = ++freshSlotId;
        }

        if (trait.slotId <= baseSlotId) {
          /* XXX: Hope we don't throw while doing builtins. */
          this.throwErrorFromVM("VerifyError", "Bad slot ID.");
        }

        if (trait.isClass()) {
          // Builtins are special, so drop any attempts to define builtins
          // that aren't from 'builtin.abc'.
          var res = domain.findDefiningScript(trait.name, false);
          if (res) {
            var abc = res.script.abc;
            if (!abc.domain.base && abc.name === "builtin.abc") {
              continue;
            }
          }

          if (trait.metadata && trait.metadata.native && domain.allowNatives) {
            trait.classInfo.native = trait.metadata.native;
          }
        }

        var tyname = trait.typeName;
        defineNonEnumerableProperty(obj, qn, trait.value);
        obj.slots[trait.slotId] = {
          name: qn,
          const: trait.isConst(),
          type: tyname ? domain.getProperty(tyname, false, false) : null
        };
      } else if (trait.isMethod()) {
        // FIXME: Breaking compat with AS and using .bind here instead of the
        // MethodClosure class to work around a SpiderMonkey bug 771871.
        const MethodClosureClass = domain.system.MethodClosureClass;

        var closure;

        // FIXME: There are some regressions because of this, but leave it in
        // place for now to help the work on the verifier progress.
        // Here we're creating a trampoline that triggers compilation when the
        // method is first executed and not when the trait is applied. This
        // helps ensure that types are initialized by the time the verifier
        // gets to work.
        // TODO: It may be that the verifier can work with non-initialized types.
        // It can probably find the class traits manually, so that may be worth
        // looking into.
        if (true && obj instanceof Global && this.domain.mode !== ALWAYS_INTERPRET) {
          closure = (function (trait, obj, qn) {
            return (function () {
              var executed = false;
              var mc = undefined;
              return function () {
                if (!executed) {
                  mc = makeClosure(trait);
                  defineNonEnumerableProperty(obj, qn, mc);
                  executed = true;
                }
                return mc.apply(this, arguments);
              };
            })();
          })(trait, obj, qn);
        } else {
          closure = makeClosure(trait);
        }
        
        var mc;
        if (delayBinding) {
          var memoizeMethodClosure = (function (closure, qn) {
            return function () {
              var mc = closure.bind(this);
              defineReadOnlyProperty(mc, "public$prototype", null);
              defineReadOnlyProperty(this, qn, mc);
              return mc;
            };
          })(closure, qn);
          // TODO: We make the |memoizeMethodClosure| configurable since it may be
          // overriden by a derivied class. Only do this non final classes.
          defineNonEnumerableGetter(obj, qn, memoizeMethodClosure);
        } else {
          mc = closure.bind(obj);
          defineReadOnlyProperty(mc, "public$prototype", null);
          defineNonEnumerableProperty(obj, qn, mc);
        }
      } else if (trait.isGetter()) {
        defineNonEnumerableGetter(obj, qn, makeClosure(trait));
      } else if (trait.isSetter()) {
        defineNonEnumerableSetter(obj, qn, makeClosure(trait));
      } else {
        assert(false);
      }

      obj.bindings.push(qn);
    }

    return obj;
  };

  runtime.prototype.applyType = function applyType(factory, types) {
    var factoryClassName = factory.classInfo.instanceInfo.name.name;
    if (factoryClassName === "Vector") {
      assert (types.length === 1);
      var typeClassName = types[0].classInfo.instanceInfo.name.name;
      switch (typeClassName) {
      case "int":
      case "uint":
      case "double":
        break;
      default:
        typeClassName = "object";
        break;
      }
      return this.domain.getClass("packageInternal __AS3__$vec.Vector$" + typeClassName);
    } else {
      return notImplemented(factoryClassName);
    }
  };

  runtime.prototype.throwErrorFromVM = function (errorClass, message) {
    throw new (this.domain.getClass(errorClass)).instance(message);
  };

  runtime.prototype.translateError = function (error) {
    if (error instanceof Error) {
      var type = this.domain.getClass(error.name);
      if (type) {
        return new type.instance(error.message);
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

