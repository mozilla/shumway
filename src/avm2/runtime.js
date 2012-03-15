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

function deleteProperty(obj, multiname) {
  // TODO: This is not correct.
  return delete obj[multiname.getQualifiedName()];
}

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
  global.String = String;
  global.RegExp = RegExp;
  global.Function = Function;
  global.undefined = undefined;
  global.NaN = NaN;
  global.Infinity = Infinity;
  global.JS = (function() { return this || (1,eval)('this'); })();

  function defineReadOnlyProperty(obj, name, value) {
    Object.defineProperty(obj, name,
      { value: value, writable: false, configurable: false, enumerable: false });
  }

  global.int = {};
  defineReadOnlyProperty(global.int, "MIN_VALUE", -0x80000000);
  defineReadOnlyProperty(global.int, "MAX_VALUE", 0x7fffffff);

  global.uint = {};
  defineReadOnlyProperty(global.uint, "MIN_VALUE", 0);
  defineReadOnlyProperty(global.uint, "MAX_VALUE", 0x7fffffff);

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

  global.toString = function () {
    return "[object global]";
  };

  return global;
}();

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
    for (var i = 0; i < multiname.namespaceCount(); i++) {
      if (this.object.hasOwnProperty(multiname.getQName(i).getQualifiedName())) {
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
  for (var i = 0; i < multiname.namespaceCount(); i++) {
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
    return obj[multiname.getQualifiedName()];
  } else {
    var resolved = resolveMultiname(obj, multiname, true);
    if (resolved) {
      return obj[resolved.getQualifiedName()];
    }
  }
  return undefined;
}

/**
 * Execution context for a script.
 */
var Runtime = (function () {
  var functionCount = 0;
  function runtime(abc) {
    this.abc = abc;
    this.compiler = new Compiler(abc);
  }

  runtime.prototype.createActivation = function (method) {
    var obj = {};
    this.applyTraits(obj, method.traits);
    return obj;
  };

  runtime.prototype.createFunction = function (method, scope)  {
    /**
     * TODO: This is terrible, we overwrite the default implementation of call/apply because
     * we need to pass the globalObject whenever call/apply is passed null or undefined for the
     * [this] pointer. We could solve this by merging the AS global object with the JS global
     * object, but that may open up another bag of warms.
     */
    function overwriteCallAndApply(fn) {
      fn.apply = function ($this, args) {
        if ($this === null || $this === undefined) {
          $this = globalObject;
        }
        return Function.prototype.apply.apply(fn, [$this, args]);
      };
      /* Temporarily disable this because it prevents the Chrome debugger from stepping into callees.
      fn.call = function ($this) {
        if ($this === null || $this === undefined) {
          $this = globalObject;
        }
        return Function.prototype.apply.apply(fn, [$this, Array.prototype.slice.call(arguments).slice(1)]);
      };
      */
      return fn;
    }

    if (method.compiledMethodClosure) {
      return overwriteCallAndApply(method.compiledMethodClosure.bind(null, scope)());
    }
    method.analysis = new Analysis(method, { massage: true });
    method.analysis.restructureControlFlow();
    var result = this.compiler.compileMethod(method, scope);

    var parameters = method.parameters.map(function (p) {
      return p.name;
    });

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

    // TODO: Use function constructurs,
    // method.compiledMethod = new Function(parameters, flatten(result.statements, ""));

    /* Hook to set breakpoints in compiled code. */
    var body = flatten(result.statements, "");
    if (functionCount == 13) {
      body = "stop();" + body;
    }

    // Eval hack to give generated functions proper names so that stack traces are helpful.
    eval("function fnClosure" + functionCount + "(" + SAVED_SCOPE_NAME + ") { return function fn" + functionCount + " (" + parameters.join(", ") + ") { " + body + " }; }");
    method.compiledMethodClosure = eval("fnClosure" + functionCount);

    if (traceLevel.value > 0) {
      /* Unfortunately inner functions are not pretty-printed by the JS engine, so here we recompile the
       * inner function by itself just for pretty printing purposes.
       */
      eval ("function fnSource" + functionCount + " (" + parameters.join(", ") + ") { " + body + " }");
      print('\033[92m' + eval("fnSource" + functionCount) + '\033[0m');
    }

    functionCount ++;
    return overwriteCallAndApply(method.compiledMethodClosure.bind(null, scope)());
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

    cls.scope = scope;
    cls.classInfo = classInfo;
    cls.baseClass = baseClass;

    if (baseClass) {
      cls.instanceTraits = baseClass.instanceTraits.concat(classInfo.instance.traits);
    } else {
      cls.instanceTraits = classInfo.instance.traits;
      assert (cls.instanceTraits);
    }

    cls.prototype = {};
    this.applyTraits(cls.prototype, cls.instanceTraits);
    this.applyTraits(cls, classInfo.traits);

    /* Call the static constructor. */
    this.createFunction(classInfo.init, this.scope).call(cls);
    cls.construct = cls;
    return cls;
  };

  /* Extend builtin Objects so they behave as classes. */
  Object.construct = function () { /* NOP */ };
  Object.instanceTraits = [];

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
   */
  runtime.prototype.applyTraits = function applyTraits(obj, traits) {
    function setProperty(name, slotId, value) {
      if (slotId) {
        obj["S" + slotId] = value;
        Object.defineProperty(obj, name, {
          get: function () {
            return obj["S" + slotId];
          },
          set: function (val) {
            return obj["S" + slotId] = val;
          }
        });
      } else {
        obj[name] = value;
      }
    }
    traits.forEach(function (trait) {
      if (trait.isSlot() || trait.isConst()) {
      setProperty(trait.name.getQualifiedName(), trait.slotId, trait.value);
      } else if (trait.isMethod()) {
        var closure = this.createFunction(trait.method, new Scope(null, obj));
        setProperty(trait.name.getQualifiedName(), undefined, closure);
      } else if (trait.isClass()) {
        setProperty(trait.name.getQualifiedName(), trait.slotId, null);
      } else {
        assert(false, trait);
      }
    }.bind(this));
  };

  runtime.prototype.isType = function isType(value, multiname) {
    return true;
  };

  return runtime;
})();

/**
 * Initializes an abc file's runtime and traits, and returns the entryPoint function.
 */
function createEntryPoint(abc, global) {
  assert (!abc.hasOwnProperty("runtime"));
  abc.runtime = new Runtime(abc);
  abc.runtime.applyTraits(global, abc.lastScript.traits);
  return abc.runtime.createFunction(abc.lastScript.entryPoint, null);
}

/**
 * This is the main entry point to the VM. To re-execute an abc file, call [createEntryPoint] once and
 * cache its result for repeated evaluation;
 */
function executeAbc(abc, global) {
  var fn = createEntryPoint(abc, global);
  fn.call(global, null);
}
