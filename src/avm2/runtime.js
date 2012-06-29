var runtimeOptions = systemOptions.register(new OptionSet("Runtime Options"));

var traceScope = runtimeOptions.register(new Option("ts", "traceScope", "boolean", false, "trace scope execution"));
var traceExecution = runtimeOptions.register(new Option("tx", "traceExecution", "boolean", false, "trace script execution"));
var tracePropertyAccess = runtimeOptions.register(new Option("tpa", "tracePropertyAccess", "boolean", false, "trace property access"));

const jsGlobal = (function() { return this || (1, eval)('this'); })();

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

function initializeGlobalObject(global) {
  const PUBLIC_MANGLED = /^public\$/;
  function publicKeys(obj) {
    var keys = [];
    for (var key in obj) {
      if (PUBLIC_MANGLED.test(key)) {
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

  for (var objectName in original) {
    var object = original[objectName];
    for (var originalFunctionName in object) {
      (function () {
        var originalFunction = object[originalFunctionName];
        var overrideFunctionName = "public$" + originalFunctionName;
        global[objectName].prototype[originalFunctionName] = function () {
          if (overrideFunctionName in this) {
            return this[overrideFunctionName]();
          }
          return originalFunction.call(this);
        };
      })();
    }
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

function deleteProperty(obj, multiname) {
  var resolved = resolveMultiname(obj, multiname, false);
  if (resolved) {
    return delete obj[resolved.getQualifiedName()];
  }
  return false;
}

function getSlot(obj, index) {
  return obj[obj.slots[index]];
}

function setSlot(obj, index, value) {
  var name = obj.slots[index];
  var type = obj.types[name];
  if (type && type.coerce) {
    value = type.coerce(value);
  }
  obj[name] = value;
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
    assert (multiname instanceof Multiname);
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
      return this.parent.findProperty(multiname, domain, strict);
    }
    var obj;
    if ((obj = domain.findProperty(multiname, strict, true))) {
      return obj;
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
 * Resolve the [multiname] to a QName in the specified [obj], this is a linear search that uses [hasOwnProperty]
 * with the qualified name.
 */
function resolveMultiname(obj, multiname, checkPrototype) {
  assert (!multiname.isQName(), "We shouldn't resolve an already resolved name: ", multiname);
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

function getProperty(obj, multiname, bind) {
  if (typeof multiname.name === "number") {
    return obj[GET_ACCESSOR](multiname.name);
  }

  if (tracePropertyAccess.value) {
    print("getProperty: multiname: " + multiname);
  }

  var resolved;
  if (multiname.isQName()) {
    resolved = multiname;
  } else {
    resolved = resolveMultiname(obj, multiname, true);
  }

  if (resolved) {
    var value = obj[resolved.getQualifiedName()];

    if (tracePropertyAccess.value) {
      print("getProperty: multiname: " + resolved + " some value: " + !!value);
    }

    if (bind && value && value.isMethod) {
      // OPTIMIZEME: could optimize to a separate function
      return new MethodClosure(obj, value);
    }

    return value;
  }

  return undefined;
}

function setProperty(obj, multiname, value) {
  assert (obj);
  assert (multiname instanceof Multiname);

  if (typeof multiname.name === "number") {
    obj[SET_ACCESSOR](multiname.name, value);
    return;
  }

  var resolved;
  if (multiname.isQName()) {
    resolved = multiname;
  } else {
    resolved = resolveMultiname(obj, multiname, true);
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
    // print("setProperty: resolved multiname: " + resolved + " value: " + value);
    print("setProperty: resolved multiname: " + resolved);
  }

  var name = resolved.getQualifiedName();
  setPropertyQuick(obj, name, value);
}

function setPropertyQuick(obj, qualifiedName, value) {
  var type = obj.types[qualifiedName];
  if (type && type.coerce) {
    value = type.coerce(value);
  }
  obj[qualifiedName] = value;
}

function instanceOf (value, type) {
  if (type instanceof Class) {
    return value instanceof type.instance;
  } else if (typeof type === "function") {
    return value instanceof type;
  } else {
    return false;
  }
}

function isType (value, type) {
  return typeof type.isInstance === "function" ? type.isInstance(value) : false;
}

/**
 * Global object for a script.
 */
var Global = (function () {
  function Global(runtime, script) {
    script.global = this;
    script.abc = runtime.abc;
    runtime.applyTraits(this, script.traits, null, new Scope(null, this));
    script.loaded = true;
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
    this.compiler = new Compiler(abc);
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

  runtime.prototype.pushCurrent = function () {
    runtime.currentSaves.push(runtime.current);
    runtime.current = this;
  };

  runtime.prototype.popCurrent = function () {
    runtime.current = runtime.currentSaves.pop();
  };

  runtime.prototype.createActivation = function (method) {
    return Object.create(method.activationPrototype);
  };

  runtime.prototype.createFunction = function (methodInfo, scope) {
    const mi = methodInfo;
    assert(!mi.isNative(), "Method should have a builtin: ", mi.name);

    function closeOverScope(fn, scope) {
      var closure = function () {
        Array.prototype.unshift.call(arguments, scope);
        var global = (this === jsGlobal ? scope.global.object : this);
        return fn.apply(global, arguments);
      };
      closure.instance = closure;
      defineNonEnumerableProperty(closure.prototype, "public$constructor", closure);
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
      defineNonEnumerableProperty(fn.prototype, "public$constructor", fn);
      return fn;
    }

    const mode = this.domain.mode;

    /**
     * We use not having an analysis to mean "not initialized".
     */
    if (!mi.analysis) {
      mi.analysis = new Analysis(mi, { massage: true });
      if (mi.traits) {
        mi.activationPrototype = this.applyTraits({}, mi.traits);
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
    scope = new Scope(scope, null);

    var className = ii.name.getName();
    if (traceExecution.value) {
      print("Creating class " + className  + (ci.native ? " replaced with native " + ci.native.cls : ""));
    }

    /**
     * Make the class and apply traits.
     *
     * User-defined classes should always have a base class, so we can save on
     * a few conditionals.
     */
    var cls, instance;
    var bii = baseClass ? baseClass.classInfo.instanceInfo : null;
    if (ci.native) {
      /* Some natives classes need this, like Error. */
      var makeNativeClass = getNative(ci.native.cls);
      assert (makeNativeClass, "No native for ", ci.native.cls);
      cls = makeNativeClass(this, scope, this.createFunction(ii.init, scope), baseClass);
      if ((instance = cls.instance)) {
        /* Math doesn't have an instance, for example. */
        this.applyTraits(cls.instance.prototype, ii.traits, bii ? bii.traits : null, scope, cls.nativeMethods);
      }
      this.applyTraits(cls, ci.traits, null, scope, cls.nativeStatics);
    } else {
      instance = this.createFunction(ii.init, scope);
      cls = new Class(className, instance);
      cls.extend(baseClass);
      this.applyTraits(instance.prototype, ii.traits, bii.traits, scope);
      this.applyTraits(cls, ci.traits, null, scope);
    }
    scope.object = cls;

    /**
     * Apply interface traits recursively, creating getters for interface names. For instance:
     *
     * interface IA {
     *   function foo();
     * }
     *
     * interface IB implements IA {
     *   function bar();
     * }
     *
     * class C implements IB {
     *   function foo() { ... }
     *   function bar() { ... }
     * }
     *
     * var a:IA = new C();
     * a.foo(); // callprop IA$foo
     *
     * var b:IB = new C();
     * b.foo(); // callprop IB:foo
     * b.bar(); // callprop IB:bar
     *
     * So, class C must have getters for:
     *
     * IA$foo -> public$foo
     * IB$foo -> public$foo
     * IB$bar -> public$bar
     *
     * Luckily, interface methods are always public.
     */
    if (ii.interfaces.length > 0) {
      cls.implementedInterfaces = [];
    }
    (function applyInterfaceTraits(interfaces) {
      for (var i = 0, j = interfaces.length; i < j; i++) {
        var iname = interfaces[i];
        var iface = domain.getProperty(iname, true, true);
        var ci = iface.classInfo;
        var ii = ci.instanceInfo;
        cls.implementedInterfaces.push(iface);
        applyInterfaceTraits(ii.interfaces);
        ii.traits.traits.forEach(function (trait) {
          var name = "public$" + trait.name.getName();
          if (trait.isGetter() || trait.isSetter()) {
            var proto = instance.prototype;
            var qn = trait.name.getQualifiedName();
            var descriptor = Object.getOwnPropertyDescriptor(proto, name);
            if (trait.isGetter()) {
              defineGetter(proto, qn, descriptor.get);
            } else {
              defineSetter(proto, qn, descriptor.set);
            }
          } else {
            Object.defineProperty(instance.prototype, trait.name.getQualifiedName(), {
              get: function () { return this[name]; },
              enumerable: false
            });
          }
        });
      }
    })(ii.interfaces);

    /* Call the static constructor. */
    this.createFunction(classInfo.init, scope).call(cls);

    /**
     * Hang on to stuff we need.
     */
    cls.scope = scope;
    cls.classInfo = classInfo;

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
  runtime.prototype.applyTraits = function applyTraits(obj, traits, baseTraits, scope, classNatives) {
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
            /* XXX: Hope we don't throw while doing builtins. */
            this.throwErrorFromVM("VerifyError", "Bad slot ID.");
          }
        }
      }

      traits.verified = true;
      traits.lastSlotId = freshSlotId;
    }

    function defineProperty(name, slotId, value, type, readOnly) {
      if (slotId) {
        if (readOnly) {
          defineReadOnlyProperty(obj, name, value);
        } else {
          defineNonEnumerableProperty(obj, name, value);
        }
        obj.slots[slotId] = name;
        obj.types[name] = type;
      } else if (!obj.hasOwnProperty(name)) {
        defineNonEnumerableProperty(obj, name, value);
      }
    }

    if (!traits.verified) {
      computeAndVerifySlotIds(traits, baseTraits);
    }

    const domain = this.domain;
    var ts = traits.traits;

    // Make a slot # -> property id and property id -> type mappings. We use 2
    // maps instead of 1 map of an object to avoid an extra property lookup on
    // getslot, since we only coerce on assignment.
    defineNonEnumerableProperty(obj, "slots", new Array(ts.length));
    defineNonEnumerableProperty(obj, "types", {});

    for (var i = 0, j = ts.length; i < j; i++) {
      var trait = ts[i];
      var qn = trait.name.getQualifiedName();

      assert (trait.holder);
      if (trait.isSlot() || trait.isConst()) {
        var type = trait.typeName ? domain.getProperty(trait.typeName, false, false) : null;
        defineProperty(qn, trait.slotId, trait.value, type, trait.isConst());
      } else if (trait.isMethod() || trait.isGetter() || trait.isSetter()) {
        assert (scope !== undefined);
        var mi = trait.methodInfo;
        var closure = null;
        if (mi.isNative() && domain.allowNatives) {
          /**
           * We can get the native metadata from two places: either a [native]
           * metadata directly attached to the method trait, or from a
           * [native] metadata attached to the encompassing class.
           *
           * XXX: I'm choosing for the per-method [native] to override
           * [native] on the class if both are present.
           */
          var md = trait.metadata;
          if (md && md.native) {
            var makeClosure = getNative(md.native.items[0].value);
            closure = makeClosure && makeClosure(this, scope);
          } else if (md && md.unsafeJSNative) {
            closure = getNative(md.unsafeJSNative.items[0].value);
          } else if (classNatives) {
            /**
             * At this point the native class already had the scope, so we
             * don't need to close over the method again.
             */
            var k = mi.name.getName();
            if (trait.isGetter()) {
              k = "get " + k;
            } else if (trait.isSetter()) {
              k = "set " + k;
            }
            closure = classNatives[k];
          }
        } else {
          closure = this.createFunction(mi, scope);
        }

        if (!closure) {
          closure = (function (mi) {
            return function() {
              print("Calling undefined native method: " + mi.name.getQualifiedName());
            };
          })(mi);
        }

        /* Identify this as a method for auto-binding via MethodClosure. */
        defineNonEnumerableProperty(closure, "isMethod", true);

        if (trait.isGetter()) {
          defineGetter(obj, qn, closure);
        } else if (trait.isSetter()) {
          defineSetter(obj, qn, closure);
        } else {
          defineReadOnlyProperty(obj, qn, closure);
        }
      } else if (trait.isClass()) {
        // Builtins are special, so drop any attempts to define builtins
        // that aren't from 'builtin.abc'.
        var res = domain.findDefiningScript(trait.name, false);
        if (res) {
          var abc = res.script.abc;
          if (!abc.domain.base && abc.name === "builtin.abc") {
            return obj;
          }
        }

        if (trait.metadata && trait.metadata.native && domain.allowNatives) {
          trait.classInfo.native = trait.metadata.native;
        }
        defineProperty(qn, trait.slotId, null, undefined, false);
      } else {
        assert(false, trait);
      }
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

  throwErrorFromVM: function throwErrorFromVM(errorClass, message) {
    throw new (this.domain.getClass(errorClass)).instance(message);
  };

  translateError: function translateError(error) {
    if (error instanceof Error) {
      var type = this.domain.getClass(error.name);
      if (type) {
        return new type.instance(error.message);
      }
      unexpected("Can't translate error: " + error);
    }
    return error;
  };

  return runtime;
})();

