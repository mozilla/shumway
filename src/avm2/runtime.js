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

var runtimeOptions = systemOptions.register(new OptionSet("Runtime Options"));

var traceScope = runtimeOptions.register(new Option("ts", "traceScope", "boolean", false, "trace scope execution"));
var traceExecution = runtimeOptions.register(new Option("tx", "traceExecution", "number", 0, "trace script execution"));
var traceCallExecution = runtimeOptions.register(new Option("txc", "traceCallExecution", "number", 0, "trace call execution"));

var functionBreak = runtimeOptions.register(new Option("fb", "functionBreak", "number", -1, "Inserts a debugBreak at function index #."));
var compileOnly = runtimeOptions.register(new Option("co", "compileOnly", "number", -1, "Compiles only function number."));
var compileUntil = runtimeOptions.register(new Option("cu", "compileUntil", "number", -1, "Compiles only until a function number."));
var debuggerMode = runtimeOptions.register(new Option("dm", "debuggerMode", "boolean", false, "matches avm2 debugger build semantics"));
var enableVerifier = runtimeOptions.register(new Option("verify", "verify", "boolean", false, "Enable verifier."));

var globalMultinameAnalysis = runtimeOptions.register(new Option("ga", "globalMultinameAnalysis", "boolean", false, "Global multiname analysis."));
var traceInlineCaching = runtimeOptions.register(new Option("tic", "traceInlineCaching", "boolean", false, "Trace inline caching execution."));
var codeCaching = runtimeOptions.register(new Option("cc", "codeCaching", "boolean", false, "Enable code caching."));

var compilerEnableExceptions = runtimeOptions.register(new Option("cex", "exceptions", "boolean", false, "Compile functions with catch blocks."));
var compilerMaximumMethodSize = runtimeOptions.register(new Option("cmms", "maximumMethodSize", "number", 4 * 1024, "Compiler maximum method size."));

var jsGlobal = (function() { return this || (1, eval)('this'); })();

var VM_SLOTS = "vm slots";
var VM_LENGTH = "vm length";
var VM_BINDINGS = "vm bindings";
var VM_NATIVE_PROTOTYPE_FLAG = "vm native prototype";
var VM_OPEN_METHODS = "vm open methods";
var VM_IS_CLASS = "vm is class";

var VM_OPEN_METHOD_PREFIX = "m";
var VM_MEMOIZER_PREFIX = "z";
var VM_OPEN_SET_METHOD_PREFIX = "s";
var VM_OPEN_GET_METHOD_PREFIX = "g";

var VM_NATIVE_BUILTIN_ORIGINALS = "vm originals";

var SAVED_SCOPE_NAME = "$SS";
var CC = createEmptyObject();

/**
 * ActionScript uses a slightly different syntax for regular expressions. Many of these features
 * are handled by the XRegExp library. Here we override the native RegExp.prototype methods with
 * those implemented by XRegExp. This also updates some methods on the String.prototype such as:
 * match, replace and split.
 */
XRegExp.install({ natives: true });

/**
 * Overriden AS3 methods (see hacks.js). This allows you to provide your own JS implementation
 * for AS3 methods.
 */
var VM_METHOD_OVERRIDES = createEmptyObject();

/**
 * We use this to give functions unique IDs to help with debugging.
 */
var vmNextInterpreterFunctionId = 1;
var vmNextCompiledFunctionId = 1;

/* This is used to keep track if we're in a runtime context. For instance, proxies need to
 * know if a proxied operation is triggered by AS3 code or VM code.
*/

var callWriter = new IndentingWriter(false, function (str){
  print(str);
});

/*
 * We pollute the JS global object with object constants used in compiled code.
 */

var objectIDs = 0;
var OBJECT_NAME = "Object Name";

function objectConstantName(object) {
  release || assert(object);
  if (object.hasOwnProperty(OBJECT_NAME)) {
    return object[OBJECT_NAME];
  }
  if (object instanceof LazyInitializer) {
    return object.getName();
  }
  var name, id = objectIDs++;
  if (object instanceof Global) {
    name = "$G" + id;
  } else if (object instanceof Multiname) {
    name = "$M" + id;
  } else if (isClass(object)) {
    name = "$C" + id;
  } else {
    name = "$O" + id;
  }
  Object.defineProperty(object, OBJECT_NAME, {value: name, writable: false, enumerable: false});
  jsGlobal[name] = object;
  return name;
}

var isClass = Shumway.AVM2.Runtime.isClass;
var isTrampoline = Shumway.AVM2.Runtime.isTrampoline;
var isMemoizer = Shumway.AVM2.Runtime.isMemoizer;

var XXX = [];

/**
 * Self patching global property stub that lazily initializes objects like scripts and
 * classes.
 */
var LazyInitializer = (function () {
  var holder = jsGlobal;
  lazyInitializer.create = function (target) {
    if (target.lazyInitializer) {
      return target.lazyInitializer;
    }
    return target.lazyInitializer = new LazyInitializer(target);
  };
  function lazyInitializer(target) {
    assert (!target.lazyInitializer);
    this.target = target;
  }
  lazyInitializer.prototype.getName = function getName() {
    if (this.name) {
      return this.name;
    }
    var target = this.target, initialize;
    if (this.target instanceof ScriptInfo) {
      this.name = "$" + variableLengthEncodeInt32(this.target.hash);
      initialize = function () {
        ensureScriptIsExecuted(target, "Lazy Initializer");
        return target.global;
      };
    } else if (this.target instanceof ClassInfo) {
      this.name = "$" + variableLengthEncodeInt32(this.target.hash);
      initialize = function () {
        if (target.classObject) {
          return target.classObject;
        }
        return target.abc.applicationDomain.getProperty(target.instanceInfo.name);
      };
    } else {
      notImplemented(target);
    }
    var name = this.name;
    assert (!holder[name], "Holder already has " + name);
    Object.defineProperty(holder, name, {
      get: function () {
        var value = initialize();
        assert (value);
        Object.defineProperty(holder, name, { value: value, writable: true });
        return value;
      }, configurable: true
    });
    return name;
  };
  return lazyInitializer;
})();



var getNamespaceResolutionMap = Shumway.AVM2.Runtime.getNamespaceResolutionMap;
var resolveMultinameProperty = Shumway.AVM2.Runtime.resolveMultinameProperty;
var asGetPublicProperty = Shumway.AVM2.Runtime.asGetPublicProperty;
var asGetProperty = Shumway.AVM2.Runtime.asGetProperty;
var asGetPropertyLikelyNumeric = Shumway.AVM2.Runtime.asGetPropertyLikelyNumeric;

/**
 * Resolved string accessors.
 */

var asGetResolvedStringProperty = Shumway.AVM2.Runtime.asGetResolvedStringProperty;
var asCallResolvedStringProperty = Shumway.AVM2.Runtime.asCallResolvedStringProperty;
var asGetResolvedStringPropertyFallback = Shumway.AVM2.Runtime.asGetResolvedStringPropertyFallback;
var asSetPublicProperty = Shumway.AVM2.Runtime.asSetPublicProperty;
var asSetProperty = Shumway.AVM2.Runtime.asSetProperty;
var asSetPropertyLikelyNumeric = Shumway.AVM2.Runtime.asSetPropertyLikelyNumeric;
var asDefinePublicProperty = Shumway.AVM2.Runtime.asDefinePublicProperty;
var asDefineProperty = Shumway.AVM2.Runtime.asDefineProperty;
var asCallPublicProperty = Shumway.AVM2.Runtime.asCallPublicProperty;

var callCounter = new Shumway.Metrics.Counter(true);

var asCallProperty = Shumway.AVM2.Runtime.asCallProperty;
var asCallSuper = Shumway.AVM2.Runtime.asCallSuper;
var asSetSuper = Shumway.AVM2.Runtime.asSetSuper;
var asGetSuper = Shumway.AVM2.Runtime.asGetSuper;
var construct = Shumway.AVM2.Runtime.construct;
var asConstructProperty = Shumway.AVM2.Runtime.asConstructProperty;
var asHasProperty = Shumway.AVM2.Runtime.asHasProperty;
var asDeleteProperty = Shumway.AVM2.Runtime.asDeleteProperty;
var asGetNumericProperty = Shumway.AVM2.Runtime.asGetNumericProperty;
var asSetNumericProperty = Shumway.AVM2.Runtime.asSetNumericProperty;
var asGetDescendants = Shumway.AVM2.Runtime.asGetDescendants;
var asNextNameIndex = Shumway.AVM2.Runtime.asNextNameIndex;
var asNextName = Shumway.AVM2.Runtime.asNextName;
var asNextValue = Shumway.AVM2.Runtime.asNextValue;
var asGetEnumerableKeys = Shumway.AVM2.Runtime.asGetEnumerableKeys;

var initializeGlobalObject = Shumway.AVM2.Runtime.initializeGlobalObject;

initializeGlobalObject(jsGlobal);

var asTypeOf = Shumway.AVM2.Runtime.asTypeOf;
var publicizeProperties = Shumway.AVM2.Runtime.publicizeProperties;
var asGetSlot = Shumway.AVM2.Runtime.asGetSlot;
var asSetSlot = Shumway.AVM2.Runtime.asSetSlot;
var asHasNext2 = Shumway.AVM2.Runtime.asHasNext2;
var getDescendants = Shumway.AVM2.Runtime.getDescendants;
var checkFilter = Shumway.AVM2.Runtime.checkFilter;

function ActivationInfo(methodInfo) {
  this.methodInfo = methodInfo;
}

var ScopeStack = Shumway.AVM2.Runtime.ScopeStack;
var Scope = Shumway.AVM2.Runtime.Scope;
var bindFreeMethodScope = Shumway.AVM2.Runtime.bindFreeMethodScope;
var nameInTraits = Shumway.AVM2.Runtime.nameInTraits;


// TODO: Remove this and its uses.
function resolveMultiname(object, mn, traitsOnly) {
  return object.resolveMultinameProperty(mn.namespaces, mn.name, mn.flags);
}

function sliceArguments(args, offset) {
  return Array.prototype.slice.call(args, offset);
}

var nonProxyingHasProperty = Shumway.AVM2.Runtime.nonProxyingHasProperty;

function forEachPublicProperty(object, fn, self) {
  if (!object[VM_BINDINGS]) {
    for (var key in object) {
      fn.call(self, key, object[key]);
    }
    return;
  }

  for (var key in object) {
    if (isNumeric(key)) {
      fn.call(self, key, object[key]);
    } else if (Multiname.isPublicQualifiedName(key) && object[VM_BINDINGS].indexOf(key) < 0) {
      notImplemented("??");
      // var name = key.substr(Multiname.PUBLIC_QUALIFIED_NAME_PREFIX.length);
      // fn.call(self, name, object[key]);
    }
  }
}

function wrapJSObject(object) {
  var wrapper = Object.create(object);
  for (var i in object) {
    Object.defineProperty(wrapper, Multiname.getPublicQualifiedName(i), (function (object, i) {
      return {
        get: function () { return object[i] },
        set: function (value) { object[i] = value; },
        enumerable: true
      };
    })(object, i));
  }
  return wrapper;
}

function createActivation(methodInfo) {
  return Object.create(methodInfo.activationPrototype);
}

/**
 * Scope object backing for catch blocks.
 */
function CatchScopeObject(domain, trait) {
  if (trait) {
    new CatchBindings(new Scope(null, this), trait).applyTo(domain, this);
  }
}

var Global = Shumway.AVM2.Runtime.Global;

function canCompile(mi) {
  if (!mi.hasBody) {
    return false;
  }
  if (mi.hasExceptions() && !compilerEnableExceptions.value) {
    return false;
  } else if (mi.code.length > compilerMaximumMethodSize.value) {
    return false;
  }
  return true;
}

/**
 * Checks if the specified method should be compiled. For now we just ignore very large methods.
 */
function shouldCompile(mi) {
  if (!canCompile(mi)) {
    return false;
  }
  // Don't compile class and script initializers since they only run once.
  if (mi.isClassInitializer || mi.isScriptInitializer) {
    return false;
  }
  return true;
}

/**
 * Checks if the specified method must be compiled, even if the compiled is not enabled.
 */
function forceCompile(mi) {
  if (mi.hasExceptions()) {
    return false;
  }
  var holder = mi.holder;
  if (holder instanceof ClassInfo) {
    holder = holder.instanceInfo;
  }
  if (holder instanceof InstanceInfo) {
    var packageName = holder.name.namespaces[0].uri;
    switch (packageName) {
      case "flash.geom":
      case "flash.events":
        return true;
      default:
        break;
    }
    var className = holder.name.getOriginalName();
    switch (className) {
      case "com.google.youtube.model.VideoData":
        return true;
    }
  }
  return false;
}

function createInterpretedFunction(methodInfo, scope, hasDynamicScope) {
  var mi = methodInfo;
  var hasDefaults = false;
  var defaults = mi.parameters.map(function (p) {
    if (p.value !== undefined) {
      hasDefaults = true;
    }
    return p.value;
  });
  var fn;
  if (hasDynamicScope) {
    fn = function (scope) {
      var global = (this === jsGlobal ? scope.global.object : this);
      var args = sliceArguments(arguments, 1);
      if (hasDefaults && args.length < defaults.length) {
        args = args.concat(defaults.slice(args.length - defaults.length));
      }
      return Interpreter.interpretMethod(global, methodInfo, scope, args);
    };
  } else {
    fn = function () {
      var global = (this === jsGlobal ? scope.global.object : this);
      var args = sliceArguments(arguments);
      if (hasDefaults && args.length < defaults.length) {
        args = args.concat(defaults.slice(arguments.length - defaults.length));
      }
      return Interpreter.interpretMethod(global, methodInfo, scope, args);
    };
  }
  fn.instanceConstructor = fn;
  fn.debugName = "Interpreter Function #" + vmNextInterpreterFunctionId++;
  return fn;
}

var totalFunctionCount = 0;
var compiledFunctionCount = 0;
var compilationCount = 0;

function debugName(value) {
  if (isFunction(value)) {
    return value.debugName;
  }
  return value;
}

function searchCodeCache(methodInfo) {
  if (!codeCaching.value) {
    return;
  }
  var cacheInfo = CC[methodInfo.abc.hash];
  if (!cacheInfo) {
    console.warn("Cannot Find Code Cache For ABC, name: " + methodInfo.abc.name + ", hash: " + methodInfo.abc.hash);
    Counter.count("Code Cache ABC Miss");
    return;
  }
  if (!cacheInfo.isInitialized) {
    methodInfo.abc.scripts.forEach(function (scriptInfo) {
      LazyInitializer.create(scriptInfo).getName();
    });
    methodInfo.abc.classes.forEach(function (classInfo) {
      LazyInitializer.create(classInfo).getName();
    });
    cacheInfo.isInitialized = true;
  }
  var method = cacheInfo.methods[methodInfo.index];
  if (!method) {
    if (methodInfo.isInstanceInitializer || methodInfo.isClassInitializer) {
      Counter.count("Code Cache Query On Initializer");
    } else {
      Counter.count("Code Cache MISS ON OTHER");
      console.warn("Shouldn't MISS: " + methodInfo + " " + methodInfo.debugName);
    }
    // console.warn("Cannot Find Code Cache For Method, name: " + methodInfo);
    Counter.count("Code Cache Miss");
    return;
  }
  print("Linking CC: " + methodInfo);
  Counter.count("Code Cache Hit");
  return method;
}

function createCompiledFunction(methodInfo, scope, hasDynamicScope, breakpoint, deferCompilation) {
  var mi = methodInfo;
  var cached = searchCodeCache(mi);
  if (!cached) {
    console.warn("Compiling: " + compilationCount++ + ": " + methodInfo + " " + methodInfo.isInstanceInitializer + " " + methodInfo.isClassInitializer);
    var result = Compiler.compileMethod(mi, scope, hasDynamicScope);
    var parameters = result.parameters;
    var body = result.body;
  }

  var fnName = mi.name ? Multiname.getQualifiedName(mi.name) : "fn" + compiledFunctionCount;
  if (mi.holder) {
    var fnNamePrefix = "";
    if (mi.holder instanceof ClassInfo) {
      fnNamePrefix = "static$" + mi.holder.instanceInfo.name.getName();
    } else if (mi.holder instanceof InstanceInfo) {
      fnNamePrefix = mi.holder.name.getName();
    } else if (mi.holder instanceof ScriptInfo) {
      fnNamePrefix = "script";
    }
    fnName = fnNamePrefix + "$" + fnName;
  }
  fnName = escapeString(fnName);
  if (mi.verified) {
    fnName += "$V";
  }
  if (compiledFunctionCount == functionBreak.value || breakpoint) {
    body = "{ debugger; \n" + body + "}";
  }

  if (!cached) {
    var fnSource = "function " + fnName + " (" + parameters.join(", ") + ") " + body;
  }

  if (traceLevel.value > 1) {
    mi.trace(new IndentingWriter(), mi.abc);
  }
  mi.debugTrace = function () {
    mi.trace(new IndentingWriter(), mi.abc);
  };
  if (traceLevel.value > 0) {
    print (fnSource);
  }
  // mi.freeMethod = (1, eval)('[$M[' + ($M.length - 1) + '],' + fnSource + '][1]');
  // mi.freeMethod = new Function(parameters, body);

  var fn = cached || new Function("return " + fnSource)();
  fn.debugName = "Compiled Function #" + vmNextCompiledFunctionId++;
  return fn;
}

function getMethodOverrideKey(methodInfo) {
  var key;
  if (methodInfo.holder instanceof ClassInfo) {
    key = "static " + methodInfo.holder.instanceInfo.name.getOriginalName() + "::" + methodInfo.name.getOriginalName()
  } else if (methodInfo.holder instanceof InstanceInfo) {
    key = methodInfo.holder.name.getOriginalName() + "::" + methodInfo.name.getOriginalName();
  } else {
    key = methodInfo.name.getOriginalName();
  }
  return key;
}

function checkMethodOverrides(methodInfo) {
  if (methodInfo.name) {
    var key = getMethodOverrideKey(methodInfo);
    if (key in VM_METHOD_OVERRIDES) {
      warning("Overriding Method: " + key);
      return VM_METHOD_OVERRIDES[key];
    }
  }
}

var makeTrampoline = Shumway.AVM2.Runtime.makeTrampoline;
var makeMemoizer = Shumway.AVM2.Runtime.makeMemoizer;

/**
 * Creates a function from the specified |methodInfo| that is bound to the given |scope|. If the
 * scope is dynamic (as is the case for closures) the compiler generates an additional prefix
 * parameter for the compiled function named |SAVED_SCOPE_NAME| and then wraps the compiled
 * function in a closure that is bound to the given |scope|. If the scope is not dynamic, the
 * compiler bakes it in as a constant which should be much more efficient. If the interpreter
 * is used, the scope object is passed in every time.
 */
function createFunction(mi, scope, hasDynamicScope, breakpoint) {
  release || assert(!mi.isNative(), "Method should have a builtin: ", mi.name);

  if (mi.freeMethod) {
    if (hasDynamicScope) {
      return bindFreeMethodScope(mi, scope);
    }
    return mi.freeMethod;
  }

  var fn;

  if ((fn = checkMethodOverrides(mi))) {
    release || assert (!hasDynamicScope);
    return fn;
  }

  ensureFunctionIsInitialized(mi);

  totalFunctionCount ++;

  var useInterpreter = false;
  if ((mi.abc.applicationDomain.mode === EXECUTION_MODE.INTERPRET || !shouldCompile(mi)) && !forceCompile(mi)) {
    useInterpreter = true;
  }

  if (compileOnly.value >= 0) {
    if (Number(compileOnly.value) !== totalFunctionCount) {
      print("Compile Only Skipping " + totalFunctionCount);
      useInterpreter = true;
    }
  }

  if (compileUntil.value >= 0) {
    if (totalFunctionCount > 1000) {
      print(Shumway.Debug.backtrace());
      print(AVM2.getStackTrace());
    }
    if (totalFunctionCount > compileUntil.value) {
      print("Compile Until Skipping " + totalFunctionCount);
      useInterpreter = true;
    }
  }

  if (useInterpreter) {
    mi.freeMethod = createInterpretedFunction(mi, scope, hasDynamicScope);
  } else {
    compiledFunctionCount++;
    // console.info("Compiling: " + mi + " count: " + compiledFunctionCount);
    if (compileOnly.value >= 0 || compileUntil.value >= 0) {
      print("Compiling " + totalFunctionCount);
    }
    mi.freeMethod = createCompiledFunction(mi, scope, hasDynamicScope, breakpoint, mi.isInstanceInitializer);
  }

  mi.freeMethod.methodInfo = mi;

  if (hasDynamicScope) {
    return bindFreeMethodScope(mi, scope);
  }
  return mi.freeMethod;
}

function ensureFunctionIsInitialized(methodInfo) {
  var mi = methodInfo;

  // We use not having an analysis to mean "not initialized".
  if (!mi.analysis) {
    mi.analysis = new Analysis(mi);

    if (mi.needsActivation()) {
      mi.activationPrototype = new ActivationInfo(mi);
      new ActivationBindings(mi).applyTo(mi.abc.applicationDomain, mi.activationPrototype);
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
        handler.scopeObject = new CatchScopeObject(mi.abc.applicationDomain, varTrait);
      } else {
        handler.scopeObject = new CatchScopeObject();
      }
    }
  }
}

/**
 * Gets the function associated with a given trait.
 */
function getTraitFunction(trait, scope, natives) {
  release || assert(scope);
  release || assert(trait.isMethod() || trait.isGetter() || trait.isSetter());

  var mi = trait.methodInfo;
  var fn;

  if (mi.isNative()) {
    var md = trait.metadata;
    if (md && md.native) {
      var nativeName = md.native.value[0].value;
      var makeNativeFunction = getNative(nativeName);
      fn = makeNativeFunction && makeNativeFunction(null, scope);
    } else if (md && md.unsafeJSNative) {
      fn = getNative(md.unsafeJSNative.value[0].value);
    } else if (natives) {
      // At this point the native class already had the scope, so we don't
      // need to close over the method again.
      var k = Multiname.getName(mi.name);
      if (trait.isGetter()) {
        fn = natives[k] ? natives[k].get : undefined;
      } else if (trait.isSetter()) {
        fn = natives[k] ? natives[k].set : undefined;
      } else {
        fn = natives[k];
      }
    }
    if (!fn) {
      warning("No native method for: " + trait.kindName() + " " +
        mi.holder.name + "::" + Multiname.getQualifiedName(mi.name));
      return (function (mi) {
        return function () {
          warning("Calling undefined native method: " + trait.kindName() +
            " " + mi.holder.name + "::" +
            Multiname.getQualifiedName(mi.name));
        };
      })(mi);
    }
  } else {
    if (traceExecution.value >= 2) {
      print("Creating Function For Trait: " + trait.holder + " " + trait);
    }
    fn = createFunction(mi, scope, false);
    release || assert (fn);
  }
  if (traceExecution.value >= 3) {
    print("Made Function: " + Multiname.getQualifiedName(mi.name));
  }
  return fn;
}

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
function createClass(classInfo, baseClass, scope) {
  release || assert (!baseClass || baseClass instanceof Class);

  var ci = classInfo;
  var ii = ci.instanceInfo;
  var domain = ci.abc.applicationDomain;

  var className = Multiname.getName(ii.name);
  if (traceExecution.value) {
    print("Creating " + (ii.isInterface() ? "Interface" : "Class") + ": " + className  + (ci.native ? " replaced with native " + ci.native.cls : ""));
  }

  var cls;

  if (ii.isInterface()) {
    cls = Interface.createInterface(classInfo);
  } else {
    cls = Class.createClass(classInfo, baseClass, scope);
  }

  if (traceClasses.value) {
    domain.loadedClasses.push(cls);
    domain.traceLoadedClasses(true);
  }

  if (ii.isInterface()) {
    return cls;
  }

  // Notify domain of class creation.
  domain.onMessage.notify1('classCreated', cls);

  if (cls.instanceConstructor && cls !== Class) {
    cls.verify();
  }

  // TODO: Seal constant traits in the instance object. This should be done after
  // the instance constructor has executed.

  if (baseClass && (Multiname.getQualifiedName(baseClass.classInfo.instanceInfo.name.name) === "Proxy" ||
                    baseClass.isProxy)) {
    // TODO: This is very hackish.
    installProxyClassWrapper(cls);
    cls.isProxy = true;
  }

  classInfo.classObject = cls;

  // Run the static initializer.
  createFunction(classInfo.init, scope, false).call(cls);

  // Seal constant traits in the class object.
  if (sealConstTraits) {
    this.sealConstantTraits(cls, ci.traits);
  }

  return cls;
}

/**
 * In ActionScript, assigning to a property defined as "const" outside of a static or instance
 * initializer throws a |ReferenceError| exception. To emulate this behaviour in JavaScript,
 * we "seal" constant traits properties by replacing them with setters that throw exceptions.
 */
function sealConstantTraits(object, traits) {
  for (var i = 0, j = traits.length; i < j; i++) {
    var trait = traits[i];
    if (trait.isConst()) {
      var qn = Multiname.getQualifiedName(trait.name);
      var value = object[qn];
      (function (qn, value) {
        Object.defineProperty(object, qn, { configurable: false, enumerable: false,
          get: function () {
            return value;
          },
          set: function () {
            throwErrorFromVM(AVM2.currentDomain(), "ReferenceError", "Illegal write to read-only property " + qn + ".");
          }
        });
      })(qn, value);
    }
  }
}

function applyType(domain, factory, types) {
  var factoryClassName = factory.classInfo.instanceInfo.name.name;
  if (factoryClassName === "Vector") {
    release || assert(types.length === 1);
    var type = types[0];
    var typeClassName;
    if (!isNullOrUndefined(type)) {
      typeClassName = type.classInfo.instanceInfo.name.name.toLowerCase();
      switch (typeClassName) {
        case "int":
        case "uint":
        case "double":
        case "object":
          return domain.getClass("packageInternal __AS3__.vec.Vector$" + typeClassName);
      }
    }
    return domain.getClass("packageInternal __AS3__.vec.Vector$object").applyType(type);
  } else {
    return notImplemented(factoryClassName);
  }
}

function checkArgumentCount(name, expected, got) {
  if (got !== expected) {
    throwError("ArgumentError", Errors.WrongArgumentCountError, name, expected, got);
  }
}

function throwError(name, error) {
  if (true) {
    var message = formatErrorMessage.apply(null, Array.prototype.slice.call(arguments, 1));
    throwErrorFromVM(AVM2.currentDomain(), name, message, error.code);
  } else {
    throwErrorFromVM(AVM2.currentDomain(), name, getErrorMessage(error.code), error.code);
  }
}

function throwErrorFromVM(domain, errorClass, message, id) {
  var error = new (domain.getClass(errorClass)).instanceConstructor(message, id);
  throw error;
}

function translateError(domain, error) {
  if (error instanceof Error) {
    var type = domain.getClass(error.name);
    if (type) {
      return new type.instanceConstructor(translateErrorMessage(error));
    }
    unexpected("Can't translate error: " + error);
  }
  return error;
}

var asIsInstanceOf = Shumway.AVM2.Runtime.asIsInstanceOf;
var asIsType = Shumway.AVM2.Runtime.asIsType;
var asAsType = Shumway.AVM2.Runtime.asAsType;
var asCoerceByMultiname = Shumway.AVM2.Runtime.asCoerceByMultiname;
var asCoerce = Shumway.AVM2.Runtime.asCoerce;
var asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
var asCoerceInt = Shumway.AVM2.Runtime.asCoerceInt;
var asCoerceUint = Shumway.AVM2.Runtime.asCoerceUint;
var asCoerceNumber = Shumway.AVM2.Runtime.asCoerceNumber;
var asCoerceBoolean = Shumway.AVM2.Runtime.asCoerceBoolean;
var asCoerceObject = Shumway.AVM2.Runtime.asCoerceObject;
var asDefaultCompareFunction = Shumway.AVM2.Runtime.asDefaultCompareFunction;
var asCompare = Shumway.AVM2.Runtime.asCompare;
var asAdd = Shumway.AVM2.Runtime.asAdd;

/**
 * It's not possible to resolve the multiname {a, b, c}::x to {b}::x if no trait exists in any of the currently
 * loaded abc files that defines the {b}::x name. Of course, this can change if we load an abc file that defines it.
 */
var GlobalMultinameResolver = (function () {
  var hasNonDynamicNamespaces = createEmptyObject();
  var wasResolved = createEmptyObject();
  function updateTraits(traits) {
    for (var i = 0; i < traits.length; i++) {
      var trait = traits[i];
      var name = trait.name.name;
      var namespace = trait.name.getNamespace();
      if (!namespace.isDynamic()) {
        hasNonDynamicNamespaces[name] = true;
        if (wasResolved[name]) {
          notImplemented("We have to the undo the optimization, " + name + " can now bind to " + namespace);
        }
      }
    }
  }
  return {
    /**
     * Called after an .abc file is loaded. This invalidates inline caches if they have been created.
     */
    loadAbc: function loadAbc(abc) {
      if (!globalMultinameAnalysis.value) {
        return;
      }
      var scripts = abc.scripts;
      var classes = abc.classes;
      var methods = abc.methods;
      for (var i = 0; i < scripts.length; i++) {
        updateTraits(scripts[i].traits);
      }
      for (var i = 0; i < classes.length; i++) {
        updateTraits(classes[i].traits);
        updateTraits(classes[i].instanceInfo.traits);
      }
      for (var i = 0; i < methods.length; i++) {
        if (methods[i].traits) {
          updateTraits(methods[i].traits);
        }
      }
    },
    resolveMultiname: function resolveMultiname(multiname) {
      var name = multiname.name;
      if (hasNonDynamicNamespaces[name]) {
        return;
      }
      wasResolved[name] = true;
      return new Multiname([ASNamespace.PUBLIC], multiname.name);
    }
  }
})();
