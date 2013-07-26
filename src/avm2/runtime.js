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

var traceInlineCaching = runtimeOptions.register(new Option("tic", "traceInlineCaching", "boolean", false, "Trace inline caching execution."));

var compilerEnableExceptions = runtimeOptions.register(new Option("cex", "exceptions", "boolean", false, "Compile functions with catch blocks."));
var compilerMaximumMethodSize = runtimeOptions.register(new Option("cmms", "maximumMethodSize", "number", 4 * 1024, "Compiler maximum method size."));

var jsGlobal = (function() { return this || (1, eval)('this'); })();

var VM_SLOTS = "vm slots";
var VM_LENGTH = "vm length";
var VM_TRAITS = "vm traits";
var VM_BINDINGS = "vm bindings";
var VM_NATIVE_PROTOTYPE_FLAG = "vm native prototype";
var VM_ENUMERATION_KEYS = "vm enumeration keys";
var VM_TOMBSTONE = createEmptyObject();
var VM_OPEN_METHODS = "vm open methods";
var VM_NEXT_NAME = "vm next name";
var VM_NEXT_NAME_INDEX = "vm next name index";
var VM_IS_CLASS = "vm is class";
var VM_OPEN_METHOD_PREFIX = "open_";
var VM_METHOD_INFO = "method info";

var VM_NATIVE_BUILTINS = [Object, Number, Boolean, String, Array, Date, RegExp];

var VM_NATIVE_BUILTIN_SURROGATES = [
  { object: Object, methods: ["toString", "valueOf"] },
  { object: Function, methods: ["toString", "valueOf"] }
];

var VM_NATIVE_BUILTIN_ORIGINALS = "vm originals";

var SAVED_SCOPE_NAME = "$SS";
var PARAMETER_PREFIX = "p";

var $M = [];

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
 * We use inline caching to optimize name resolution on objects when we have no type information
 * available. We attach |InlineCache| (IC) objects on bytecode objects. The IC object is a (key,
 * value) tuple where the key usually holds the "shape" of the dynamic object and the value holds
 * the cached resolved qualified name. This is all predicated on assigning sensible "shape" IDs
 * to objects.
 */
var vmNextShapeId = 1;

function defineObjectShape(object) {
  // TODO: This assertion seems to fail for proxies, investigate.
  // assert (!obj.shape, "Shouldn't already have a shape ID. " + obj.shape);
  defineReadOnlyProperty(object, "shape", vmNextShapeId ++);
}

/**
 * We use this to give functions unique IDs to help with debugging.
 */
var vmNextInterpreterFunctionId = 1;
var vmNextCompiledFunctionId = 1;
var vmNextTrampolineId = 1;
var vmNextMemoizerId = 1;

var InlineCache = (function () {
  function inlineCache () {
    this.key = undefined;
    this.value = undefined;
  }
  inlineCache.prototype.update = function (key, value) {
    this.key = key;
    this.value = value;
    return value;
  };
  return inlineCache;
})();

/**
 * Attaches InlineCache to an object.
 */
function ic(object) {
  return object.ic || (object.ic = new InlineCache());
}

/* This is used to keep track if we're in a runtime context. For instance, proxies need to
 * know if a proxied operation is triggered by AS3 code or VM code.
*/

var AS = 1, JS = 2;

var RUNTIME_ENTER_LEAVE_STACK = [AS];

function enter(mode) {
  RUNTIME_ENTER_LEAVE_STACK.push(mode);
}

function leave(mode) {
  var top = RUNTIME_ENTER_LEAVE_STACK.pop();
  release || assert (top === mode);
}

function inJS() {
  return RUNTIME_ENTER_LEAVE_STACK.top() === JS;
}

function inAS() {
  return RUNTIME_ENTER_LEAVE_STACK.top() === AS;
}

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

function initializeGlobalObject(global) {
  function getEnumerationKeys(object) {
    if (object.node && object.node.childNodes) {
      object = object.node.childNodes;
    }
    var keys = [];

    var boxedValue = object.valueOf();

    // TODO: This is probably broken if the object has overwritten |valueOf|.
    if (typeof boxedValue === "string" || typeof boxedValue === "number") {
      return [];
    }

    if (object.getEnumerationKeys) {
      return object.getEnumerationKeys();
    }

    // TODO: Implement fast path for Array objects.
    for (var key in object) {
      if (isNumeric(key)) {
        keys.push(Number(key));
      } else if (Multiname.isPublicQualifiedName(key)) {
        if (object[VM_BINDINGS] && object[VM_BINDINGS].indexOf(key) >= 0) {
          continue;
        }
        keys.push(key.substr(Multiname.PUBLIC_QUALIFIED_NAME_PREFIX.length));
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
      if (keys[index] !== VM_TOMBSTONE) {
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
  var originals = global[VM_NATIVE_BUILTIN_ORIGINALS] = createEmptyObject();
  VM_NATIVE_BUILTIN_SURROGATES.forEach(function (surrogate) {
    var object = surrogate.object;
    originals[object.name] = createEmptyObject();
    surrogate.methods.forEach(function (originalFunctionName) {
      var originalFunction = object.prototype[originalFunctionName];
      // Save the original method in case |getNative| needs it.
      originals[object.name][originalFunctionName] = originalFunction;
      var overrideFunctionName = Multiname.getPublicQualifiedName(originalFunctionName);
      if (compatibility) {
        // Patch the native builtin with a surrogate.
        global[object.name].prototype[originalFunctionName] = function surrogate() {
          if (this[overrideFunctionName]) {
            return this[overrideFunctionName]();
          }
          return originalFunction.call(this);
        };
      }
    });
  });

  VM_NATIVE_BUILTINS.forEach(function (o) {
    defineReadOnlyProperty(o.prototype, VM_NATIVE_PROTOTYPE_FLAG, true);
  });

  /**
   * Property Access Methods:
   *
   * Define the following get/set/has/call/delete "virtual" methods on every global Object.prototype:
   * - getMultinameProperty(namespaces, name, flags, isMethod)
   * - setMultinameProperty(namespaces, name, flags, value)
   * - hasMultinameProperty(namespaces, name, flags)
   * - callMultinameProperty(namespaces, name, flags, isLex, args)
   * - deleteMultinameProperty(namespaces, name, flags)
   *
   * Define multiname resolution methods:
   * - getNamespaceResolutionMap(namespaces)
   * - resolveMultinameProperty(namespaces, name, flags)
   *
   * Special objects like Vector, Dictionary, XML, etc. can override these to provide different behaviour.
   *
   * To avoid boxing we represent multinames as a group of 3 parts: |namespaces| undefined or an array of
   * namespace objects, |name| any value, and |flags| an integer value. To resolve a multiname to a qualified
   * name we call |resolveMultinameProperty|. The expensive case is when we resolve multinames with multiple
   * namespaces. This is done with the help of |getNamespaceResolutionMap|.
   *
   * Every object that contains traits has a hidden array property called "resolutionMap". This maps between
   * namespace sets to an object that maps all trait names to their resolved qualified names in each namespace.
   *
   * For example, suppose we had the class A { n0 var x; n1 var x; n0 var y; n1 var y; } and two namespace sets:
   * {n0, n2} and {n2, n1}. The namespace sets are given the unique IDs 0 and 1 respectively. The resolution map
   * for class A would be:
   *
   * resolutionMap[0] = {x: n0$$x, y: n0$$y}
   * resolutionMap[1] = {x: n1$$x, y: n1$$y}
   *
   * Resolving {n2, n1}::x on a = new A() then becomes:
   *
   * a[a.resolutionMap[1]["x"]] -> a[{x: n1$$x, y: n1$$y}["x"]] -> a[n1$$x]
   */

  defineNonEnumerableProperty(global.Object.prototype, "getNamespaceResolutionMap", function getNamespaceResolutionMap(namespaces) {
    var map = this.resolutionMap[namespaces.id];
    if (map) return map;
    map = this.resolutionMap[namespaces.id] = createEmptyObject();
    var bindings = this.bindings;

    for (var key in bindings.map) {
      var multiname = key;
      var trait = bindings.map[key].trait;
      if (trait.isGetter() || trait.isSetter()) {
        multiname = multiname.substring(Binding.KEY_PREFIX_LENGTH);
      }
      var k = multiname;
      multiname = Multiname.fromQualifiedName(multiname);
      if (multiname.getNamespace().inNamespaceSet(namespaces)) {
        map[multiname.getName()] = Multiname.getQualifiedName(trait.name);
//        print("> Creating Resolver " + multiname.getName() + " -> " + Multiname.getQualifiedName(trait.name));
      }
    }
    return map;
  });

  defineNonEnumerableProperty(global.Object.prototype, "resolveMultinameProperty", function resolveMultinameProperty(namespaces, name, flags) {
    if (typeof name === "object") {
      name = String(name);
    }
    if (isNumeric(name)) {
      return Number(name);
    }
    if (!namespaces) {
      return Multiname.getPublicQualifiedName(name);
    }
    if (namespaces.length > 1) {
      var resolved = this.getNamespaceResolutionMap(namespaces)[name];
      if (resolved) return resolved;
      return Multiname.getPublicQualifiedName(name);
    } else {
      return namespaces[0].qualifiedName + "$" + name;
    }
  });

  defineNonEnumerableProperty(global.Object.prototype, "getMultinameProperty", function getMultinameProperty(namespaces, name, flags, isMethod) {
    if (this.getProperty) {
      return this.getProperty(namespaces, name, flags, isMethod);
    }
    var resolved = this.resolveMultinameProperty(namespaces, name, flags);
    if (this.indexGet && Multiname.isNumeric(resolved)) {
      return this.indexGet(resolved);
    }
    return this[resolved];
  });

  defineNonEnumerableProperty(global.Object.prototype, "setMultinameProperty", function setMultinameProperty(namespaces, name, flags, value) {
    if (this.setProperty) {
      return this.setProperty(namespaces, name, flags, value);
    }
    if (typeof name === "object") {
      name = String(name);
    }
    var resolved = this.resolveMultinameProperty(namespaces, name, flags);
    if (this.indexSet && Multiname.isNumeric(resolved)) {
      return this.indexSet(resolved, value);
    }
    this[resolved] = value;
  });

  var callCounter = new metrics.Counter(true);
  defineNonEnumerableProperty(global.Object.prototype, "callMultinameProperty", function callMultinameProperty(namespaces, name, flags, isLex, args) {
    traceCallExecution.value > 0 && callWriter.enter("call " + name + "(" + toSafeArrayString(args) + ") #" + callCounter.count(name));
    var receiver = isLex ? null : this;
    var result;
    if (isProxyObject(this)) {
      result = this[VM_CALL_PROXY](new Multiname(namespaces, name, flags), receiver, args);
    } else {
      var property = this.getMultinameProperty(namespaces, name, flags, true);
      result = property.apply(receiver, args);
    }
    traceCallExecution.value > 0 && callWriter.leave("return " + toSafeString(result));
    return result;
  });

  defineNonEnumerableProperty(global.Object.prototype, "hasMultinameProperty", function hasMultinameProperty(namespaces, name, flags, nonProxy) {
    if (this.hasProperty) {
      return this.hasProperty(namespaces, name, flags);
    }
    if (nonProxy) {
      return nonProxyingHasProperty(this, this.resolveMultinameProperty(namespaces, name, flags));
    } else {
      return this.resolveMultinameProperty(namespaces, name, flags) in this;
    }
  });

  defineNonEnumerableProperty(global.Object.prototype, "deleteMultinameProperty", function deleteMultinameProperty(namespaces, name, flags) {
    if (this.deleteProperty) {
      return this.deleteProperty(namespaces, name, flags);
    }
    if (this.indexDelete && Multiname.isNumeric(name)) {
      return this.indexDelete(name);
    }
    var resolved = this.resolveMultinameProperty(namespaces, name, flags);
    /**
     * If we're in the middle of an enumeration, we need to remove the property name
     * from the enumeration keys as well. Setting it to |VM_TOMBSTONE| will cause it
     * to be skipped by the enumeration code.
     */
    if (this[VM_ENUMERATION_KEYS]) {
      var index = this[VM_ENUMERATION_KEYS].indexOf(resolved);
      if (index >= 0) {
        this[VM_ENUMERATION_KEYS][index] = VM_TOMBSTONE;
      }
    }
    return delete this[resolved];
  });
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

/**
 * Checks if the specified |object| is the prototype of a native JavaScript object.
 */
function isNativePrototype(object) {
  return Object.prototype.hasOwnProperty.call(object, VM_NATIVE_PROTOTYPE_FLAG)
}

/**
 * ActionScript 3 has different behaviour when deciding whether to call toString or valueOf
 * when one operand is a string. Unlike JavaScript, it calls toString if one operand is a
 * string and valueOf otherwise. This sucks, but we have to emulate this behaviour because
 * YouTube depends on it.
 */
function avm2Add(l, r) {
  if (typeof l === "string" || typeof r === "string") {
    return String(l) + String(r);
  }
  return l + r;
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
  if (typeof x === "string") {
    return x;
  } else if (x === null || x === undefined) {
    return null;
  }
  return String(x);
}

function typeOf(x) {
  // ABC doesn't box primitives, so typeof returns the primitive type even when
  // the value is new'd
  if (x) {
    if (x.constructor === String) {
      return "string"
    } else if (x.constructor === Number) {
      return "number"
    } else if (x.constructor === Boolean) {
      return "boolean"
    } else if (x instanceof XML || x instanceof XMLList) {
      return "xml"
    }
  }
  return typeof x;
}

/**
 * Make an object's properties accessible from AS3. This prefixes all non-numeric
 * properties with the public prefix.
 */
function publicizeProperties(object) {
  var keys = Object.keys(object);
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    if (!Multiname.isPublicQualifiedName(k)) {
      var v = object[k];
      object[Multiname.getPublicQualifiedName(k)] = v;
      delete object[k];
    }
  }
}

function getSlot(object, index) {
  return object[object[VM_SLOTS][index].name];
}

function setSlot(object, index, value) {
  var binding = object[VM_SLOTS][index];
  if (binding.const) {
    return;
  }
  var name = binding.name;
  var type = binding.type;
  if (type && type.coerce) {
    object[name] = type.coerce(value);
  } else {
    object[name] = value;
  }
}

function nextName(object, index) {
  return object[VM_NEXT_NAME](index);
}

function nextValue(object, index) {
  if (object.getProperty) {
    return object.getProperty(object[VM_NEXT_NAME](index), false);
  }
  return object[Multiname.getPublicQualifiedName(object[VM_NEXT_NAME](index))];
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
function hasNext2(object, index) {
  if (object === null || object === undefined) {
    return {index: 0, object: null};
  }
  object = boxValue(object);
  release || assert(object);
  release || assert(index >= 0);

  /**
   * Because I don't think hasnext/hasnext2/nextname opcodes are used outside
   * of loops in "normal" ABC code, we can deviate a little for semantics here
   * and leave the prototype-chaining to the |for..in| operator in JavaScript
   * itself, in |obj[VM_NEXT_NAME_INDEX]|. That is, the object pushed onto the
   * stack, if the original object has any more properties left, will _always_
   * be the original object.
   */
  return {index: object[VM_NEXT_NAME_INDEX](index), object: object};
}

function getDescendants(object, mn) {
  if (!isXMLType(object)) {
    throw "Not XML object in getDescendants";
  }
  return object.descendants(mn);
}

function checkFilter(value) {
  if (!value.class || !isXMLType(value)) {
    throw "TypeError operand of childFilter not of XML type";
  }
  return value;
}

function Activation(methodInfo) {
  this.methodInfo = methodInfo;
  defineObjectShape(this);
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
 *
 * Scope Caching:
 *
 * Calls to |findScopeProperty| are very expensive. They recurse all the way to the top of the scope chain and then
 * laterally across other scripts. We optimize this by caching property lookups in each scope using Multiname
 * |id|s as keys. Each Multiname object is given a unique ID when it's constructed. For QNames we only cache
 * string QNames.
 *
 * TODO: This is not sound, since you can add/delete properties to/from with scopes.
 */

/**
 * Helps the interpreter allocate fewer Scope objects.
 */
var ScopeStack = (function () {
  function scopeStack(parent) {
    this.parent = parent;
    this.stack = [];
    this.isWith = [];
  }
  scopeStack.prototype.push = function push(object, isWith) {

    this.stack.push(object);
    this.isWith.push(!!isWith);
  };
  scopeStack.prototype.get = function get(index) {
    return this.stack[index];
  };
  scopeStack.prototype.clear = function clear() {
    this.stack.length = 0;
    this.isWith.length = 0;
  };
  scopeStack.prototype.pop = function pop() {
    this.isWith.pop();
    this.stack.pop();
  };
  scopeStack.prototype.topScope = function topScope() {
    if (!this.scopes) {
      this.scopes = [];
    }
    var parent = this.parent;
    for (var i = 0; i < this.stack.length; i++) {
      var object = this.stack[i], isWith = this.isWith[i], scope = this.scopes[i];
      if (!scope || scope.parent !== parent || scope.object !== object || scope.isWith !== isWith) {
        scope = this.scopes[i] = new Scope(parent, object, isWith);
      }
      parent = scope;
    }
    return parent;
  };
  return scopeStack;
})();

var Scope = (function () {
  function scope(parent, object, isWith) {
    release || assert (isObject(object));
    this.parent = parent;
    this.object = object;
    this.global = parent ? parent.global : this;
    this.isWith = isWith;
    this.cache = createEmptyObject();
  }

  scope.prototype.findDepth = function findDepth(object) {
    var current = this;
    var depth = 0;
    while (current) {
      if (current.object === object) {
        return depth;
      }
      depth ++;
      current = current.parent;
    }
    return -1;
  };

  function makeCacheKey(namespaces, name, flags) {
    return name;
//    if (!namespaces) return name;
//    if (namespaces.length > 1) {
//      return namespaces.id + "$" + name;
//    } else {
//      return namespaces[0].qualifiedName + "$" + name;
//    }
  }

  /**
   * Searches the scope stack for the object containing the specified property. If |strict| is specified then throw
   * an exception if the property is not found. If |scopeOnly| is specified then only search the scope chain and not
   * any of the top level domains (this is used by the verifier to bake in direct object references).
   *
   * Property lookups are cached in scopes but are not used when only looking at |scopesOnly|.
   */
  scope.prototype.findScopeProperty = function findScopeProperty(namespaces, name, flags, domain, strict, scopeOnly) {
    var object;
    var key = makeCacheKey(namespaces, name, flags);
    if (!scopeOnly && (object = this.cache[key])) return object;
    if (this.object.hasMultinameProperty(namespaces, name, flags, true)) {
      return this.isWith ? this.object : (this.cache[key] = this.object);
    }
    if (this.parent) {
      return (this.cache[key] = this.parent.findScopeProperty(namespaces, name, flags, domain, strict, scopeOnly));
    }
    if (scopeOnly) return null;
    // If we can't find the property look in the domain.
    if ((object = domain.findDomainProperty(new Multiname(namespaces, name, flags), strict, true))) {
      return object;
    }
    if (strict) {
      unexpected("Cannot find property " + name);
    }
    // Can't find it still, return the global object.
    return this.global.object;
  };

  scope.prototype.findScopeProperty3 = function findScopeProperty(mn, domain, strict, scopeOnly) {
    release || assert(this.object);
    release || assert(Multiname.isMultiname(mn));
    var object;
    var cache = this.cache;

    var id = typeof mn === "string" ? mn : mn.id;
    if (!scopeOnly && id && (object = cache[id])) {
      return object;
    }

    object = this.object;
    if (Multiname.isQName(mn)) {
      if (this.isWith) {
        if (object.hasProperty && object.hasProperty(mn) ||
            Multiname.getQualifiedName(mn) in object) {
          return object;
        }
      } else {
        if (nameInTraits(object, Multiname.getQualifiedName(mn))) {
          id && (cache[id] = object);
          return object;
        }
      }
    } else {
      if (this.isWith) {
        if (object.hasProperty && object.hasProperty(mn) ||
            resolveMultiname(object, mn)) {
          return object;
        }
      } else {
        if (resolveMultinameInTraits(object, mn)) {
          id && (cache[id] = object);
          return object;
        }
      }
    }

    if (this.parent) {
      object = this.parent.findScopeProperty(mn, domain, strict, scopeOnly);
      id && (cache[mn.id] = object);
      return object;
    }

    if (scopeOnly) {
      return null;
    }

    // If we can't find it still, then look at the domain toplevel.
    var r;
    if ((r = domain.findDomainProperty(mn, strict, true))) {
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
 * Wraps the free method in a closure that passes the dynamic scope object as the
 * first argument and also makes sure that the |asGlobal| object gets passed in as
 * |this| when the method is called with |fn.call(null)|.
 */
function bindFreeMethodScope(methodInfo, scope) {
  var fn = methodInfo.freeMethod;
  if (methodInfo.lastBoundMethod && methodInfo.lastBoundMethod.scope === scope) {
    return methodInfo.lastBoundMethod.boundMethod;
  }
  release || assert (fn, "There should already be a cached method.");
  var boundMethod;
  var asGlobal = scope.global.object;
  if (!methodInfo.hasOptional() && !methodInfo.needsArguments() && !methodInfo.needsRest()) {
    // Special case the common path.
    switch (methodInfo.parameters.length) {
      case 0:
        boundMethod = function () {
          return fn.call(this === jsGlobal ? asGlobal : this, scope);
        };
        break;
      case 1:
        boundMethod = function (x) {
          return fn.call(this === jsGlobal ? asGlobal : this, scope, x);
        };
        break;
      case 2:
        boundMethod = function (x, y) {
          return fn.call(this === jsGlobal ? asGlobal : this, scope, x, y);
        };
        break;
      case 3:
        boundMethod = function (x, y, z) {
          return fn.call(this === jsGlobal ? asGlobal : this, scope, x, y, z);
        };
        break;
      default:
        // TODO: We can special case more ...
        break;
    }
  }
  if (!boundMethod) {
    Counter.count("Bind Scope - Slow Path");
    boundMethod = function () {
      Array.prototype.unshift.call(arguments, scope);
      var global = (this === jsGlobal ? scope.global.object : this);
      return fn.apply(global, arguments);
    };
  }
  boundMethod.instanceConstructor = boundMethod;
  methodInfo.lastBoundMethod = {
    scope: scope,
    boundMethod: boundMethod
  };
  return boundMethod;
}

var TraitsInfo = (function () {
  function traitsInfo(parent, array) {
    this.parent = parent;
    var traits = this.traits = createEmptyObject();
    if (parent) {
      for (var k in parent.traits) {
        traits[k] = parent.traits[k];
        if (traits[k] instanceof Array) {
          traits[k] = traits[k].slice();
        }
      }
    }
    for (var i = 0; i < array.length; i++) {
      var trait = array[i];
      var traitQn = Multiname.getQualifiedName(trait.name);
      if (trait.isGetter() || trait.isSetter()) {
        if (!traits[traitQn]) {
          traits[traitQn] = {get: undefined, set: undefined};
        }
        if (trait.isGetter()) {
          traits[traitQn].get = trait;
        } else if (trait.isSetter()) {
          traits[traitQn].set = trait;
        }
      } else {
        traits[traitQn] = trait;
      }
    }
  }
  traitsInfo.prototype.trace = function trace(writer) {
    function nameOf(value) {
      return value;
    }
    for (var k in this.traits) {
      var value = this.traits[k];
      if (value instanceof Trait) {
        writer.writeLn(value.kindName() + ": " + nameOf(value));
      } else {
        writer.writeLn("Getter / Setter: {" + nameOf(value.get) + ", " + nameOf(value.set) + "}");
      }
    }
  };
  traitsInfo.prototype.getTrait = function getTrait(qn, isSetter) {

  };
  return traitsInfo;
})();

/**
 * Check if a qualified name is in an object's traits.
 */
function nameInTraits(object, qn) {
  // If the object itself holds traits, try to resolve it. This is true for
  // things like global objects and activations, but also for classes, which
  // both have their own traits and the traits of the Class class.
  if (object.hasOwnProperty(VM_BINDINGS) && object.hasOwnProperty(qn)) {
    return true;
  }

  // Else look on the prototype.
  var proto = Object.getPrototypeOf(object);
  return proto.hasOwnProperty(VM_BINDINGS) && proto.hasOwnProperty(qn);
}

function resolveMultinameInTraits(object, mn) {
  release || assert(!Multiname.isQName(mn), mn, " already resolved");

  object = boxValue(object);

  for (var i = 0, j = mn.namespaces.length; i < j; i++) {
    var qn = mn.getQName(i);
    if (nameInTraits(object, Multiname.getQualifiedName(qn))) {
      return qn;
    }
  }
  return undefined;
}


/**
 * Resolving a multiname on an object using linear search.
 */
function resolveMultinameUnguarded(object, mn, traitsOnly) {
  release || assert(Multiname.needsResolution(mn), "Multiname ", mn, " is already resolved.");
  release || assert(!Multiname.isNumeric(mn), "Should not resolve numeric multinames.");
  object = boxValue(object);
  var publicQn;

  // Check if the object that we are resolving the multiname on is a JavaScript native prototype
  // and if so only look for public (dynamic) properties. The reason for this is because we cannot
  // overwrite the native prototypes to fit into our trait/dynamic prototype scheme, so we need to
  // work around it here during name resolution.

  var isNative = isNativePrototype(object);
  for (var i = 0, j = mn.namespaces.length; i < j; i++) {
    var qn = mn.getQName(i);
    if (traitsOnly) {
      if (nameInTraits(object, Multiname.getQualifiedName(qn))) {
        return qn;
      }
      continue;
    }

    if (mn.namespaces[i].isDynamic()) {
      publicQn = qn;
      if (isNative) {
        break;
      }
    } else if (!isNative) {
      if (Multiname.getQualifiedName(qn) in object) {
        return qn;
      }
    }
  }
  if (publicQn && !traitsOnly && (Multiname.getQualifiedName(publicQn) in object)) {
    return publicQn;
  }
  return undefined;
}

function resolveMultiname(object, mn, traitsOnly) {
  enter(JS);
  var result = resolveMultinameUnguarded(object, mn, traitsOnly);
  leave(JS);
  return result;
}

function sliceArguments(args, offset) {
  return Array.prototype.slice.call(args, offset);
}

function hasProperty(object, name) {
  object = boxValue(object);
  if (object.hasProperty) {
    return object.hasProperty(name);
  }
  return resolveName(object, name) in object;
}

/**
 * Proxy traps ignore operations passing through nonProxying functions.
 */
function nonProxyingHasProperty(object, name) {
  return name in object;
}

function getSuper(scope, object, mn) {
  release || assert(scope instanceof Scope);
  release || assert(object !== undefined, "getSuper(", mn, ") on undefined");
  release || assert(Multiname.isMultiname(mn));
  var superClass = scope.object.baseClass;
  release || assert(superClass);
  var superTraitsPrototype = superClass.instanceConstructor.prototype;

  var resolved = mn.isQName() ? mn : resolveMultiname(superTraitsPrototype, mn);
  var value = undefined;
  if (resolved) {
    if (Multiname.isNumeric(resolved) && superTraitsPrototype.indexGet) {
      value = superTraitsPrototype.indexGet(Multiname.getQualifiedName(resolved), value);
    } else {
      // Which class is it really on?
      var qn = Multiname.getQualifiedName(resolved);
      var openMethod = superTraitsPrototype[VM_OPEN_METHODS][qn];
      var superName = superClass.classInfo.instanceInfo.name;

      // If we're getting a method closure on the super class, close the open
      // method now and save it to a mangled name. We can't go through the
      // normal memoizer here because we could be overriding our own method or
      // getting into an infinite loop (getters that access the property
      // they're set to on the same object is bad news).
      if (openMethod) {
        value = object[superName + " " + qn];
        if (!value) {
          value = object[superName + " " + qn] = bindSafely(openMethod, object);
        }
      } else {
        var descriptor = Object.getOwnPropertyDescriptor(superTraitsPrototype, qn);
        release || assert(descriptor);
        value = descriptor.get ? descriptor.get.call(object) : object[qn];
      }
    }
  }
  return value;
}

function resolveName(object, name) {
  if (name instanceof Multiname) {
    if (name.namespaces.length > 1) {
      var resolved = resolveMultiname(object, name);
      if (resolved !== undefined) {
        return Multiname.getQualifiedName(resolved);
      } else {
        return Multiname.getPublicQualifiedName(name.name);
      }
    } else {
      return Multiname.getQualifiedName(name);
    }
  } else if (typeof name === "object") {
    // Call toString() on |mn| object.
    return Multiname.getPublicQualifiedName(String(name));
  } else {
    return name;
  }
}

function resolveNameWithIC(object, name, ic) {
  var qn;
  if (object.shape) {
    if (ic.key === object.shape) {
      qn = ic.value;
    } else {
      if (!ic.key) {
        Counter.count("resolveName: IC Miss");
      }
      ic.key = object.shape;
      qn = ic.value = resolveName(object, name);
    }
  } else {
    qn = resolveName(object, name);
  }
  return qn;
}

/*
function getPropertyWithIC(object, name, isMethod, ic) {
  if (object.getProperty) {
    return object.getProperty(name, isMethod);
  }
  var qn = resolveNameWithIC(object, name, ic);
  if (object.indexGet && Multiname.isNumeric(qn)) {
    return object.indexGet(qn);
  }
  return object[qn];
}

function getProperty(object, name, isMethod) {
  if (object.getProperty) {
    return object.getProperty(name, isMethod);
  }
  var qn = resolveName(object, name);
  if (object.indexGet && Multiname.isNumeric(qn)) {
    return object.indexGet(qn);
  }
  return object[qn];
}

function setPropertyWithIC(object, name, value, ic) {
  if (object.setProperty) {
    return object.setProperty(name, value);
  }
  var qn = resolveNameWithIC(object, name, ic);
  if (object.indexGet && Multiname.isNumeric(qn)) {
    return object.indexSet(qn, value);
  }
  object[qn] = value;
}

function setProperty(object, name, value) {
  if (object.setProperty) {
    return object.setProperty(name, value);
  }
  var qn = resolveName(object, name);
  if (object.indexGet && Multiname.isNumeric(qn)) {
    return object.indexSet(qn, value);
  }
  object[qn] = value;
}
*/

//function deleteProperty(object, name) {
//  if (object.deleteProperty) {
//    return object.deleteProperty(name);
//  }
//  var qn = resolveName(object, name);
//  if (object.indexDelete && Multiname.isNumeric(qn)) {
//    return object.indexDelete(qn);
//  }
//  /**
//   * If we're in the middle of an enumeration, we need to remove the property name
//   * from the enumeration keys as well. Setting it to |VM_TOMBSTONE| will cause it
//   * to be skipped by the enumeration code.
//   */
//  if (object[VM_ENUMERATION_KEYS]) {
//    var index = object[VM_ENUMERATION_KEYS].indexOf(qn);
//    if (index >= 0) {
//      object[VM_ENUMERATION_KEYS][index] = VM_TOMBSTONE;
//    }
//  }
//  return delete object[qn];
//}

function setSuper(scope, object, mn, value) {
  release || assert(object);
  release || assert(Multiname.isMultiname(mn));
  var superClass = scope.object.baseClass;
  release || assert(superClass);

  var superTraitsPrototype = superClass.instanceConstructor.prototype;
  var resolved = Multiname.isQName(mn) ? mn : resolveMultiname(superTraitsPrototype, mn);

  if (resolved !== undefined) {
    if (Multiname.isNumeric(resolved) && superTraitsPrototype.indexSet) {
      superTraitsPrototype.indexSet(Multiname.getQualifiedName(resolved), value);
    } else {
      var qn = Multiname.getQualifiedName(resolved);
      var descriptor = Object.getOwnPropertyDescriptor(superTraitsPrototype, qn);
      release || assert(descriptor);
      if (descriptor.set) {
        descriptor.set.call(object, value);
      } else {
        object[qn] = value;
      }
    }
  } else {
    throw new ReferenceError("Cannot create property " + mn.name +
                             " on " + superClass.debugName);
  }
}

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
      var name = key.substr(Multiname.PUBLIC_QUALIFIED_NAME_PREFIX.length);
      fn.call(self, name, object[key]);
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

function isInstanceOf(value, type) {
  /*
  if (type instanceof Class) {
    return value instanceof type.instanceConstructor;
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

function isClass(object) {
  release || assert (object);
  return Object.hasOwnProperty.call(object, VM_IS_CLASS);
}

function isTrampoline(fn) {
  release || assert (fn && typeof fn === "function");
  return fn.isTrampoline;
}

function isMemoizer(fn) {
  release || assert (fn && typeof fn === "function");
  return fn.isMemoizer;
}

/**
 * Scope object backing for catch blocks.
 */
function CatchScopeObject(domain, trait) {
  if (trait) {
    new CatchBindings(new Scope(null, this), trait).applyTo(domain, this);
  }
}

/**
 * Global object for a script.
 */
var Global = (function () {
  function Global(script) {
    this.scriptInfo = script;
    script.global = this;
    script.scriptBindings = new ScriptBindings(script, new Scope(null, this));
    script.scriptBindings.applyTo(script.abc.domain, this);
    // applyScriptTraits(script.abc.domain, this, new Scope(null, this), script.traits);
    script.loaded = true;
    defineObjectShape(this);
  }
  Global.prototype.toString = function () {
    return "[object global]";
  };
  Global.prototype.isExecuted = function () {
    return this.scriptInfo.executed;
  };
  Global.prototype.isExecuting = function () {
    return this.scriptInfo.executing;
  };
  Global.prototype.ensureExecuted = function () {
    ensureScriptIsExecuted(this.scriptInfo);
  };
  defineNonEnumerableProperty(Global.prototype, Multiname.getPublicQualifiedName("toString"), function () {
    return this.toString();
  });
  return Global;
})();

/**
 * Checks if the specified method should be compiled. For now we just ignore very large methods.
 */
function shouldCompile(mi) {
  if (!mi.hasBody) {
    return false;
  }
  if (mi.hasExceptions() && !compilerEnableExceptions.value) {
    return false;
  } else if (mi.code.length > compilerMaximumMethodSize.value) {
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
    var packageName = holder.name.namespaces[0].originalURI;
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

function debugName(value) {
  if (isFunction(value)) {
    return value.debugName;
  }
  return value;
}

function createCompiledFunction(methodInfo, scope, hasDynamicScope, breakpoint) {
  var mi = methodInfo;
  var parameters = mi.parameters.map(function (p) {
    return PARAMETER_PREFIX + p.name;
  });

  if (hasDynamicScope) {
    parameters.unshift(SAVED_SCOPE_NAME);
  }

  $M.push(mi);

  var body = Compiler.compileMethod(mi, scope, hasDynamicScope);

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
//    if ($DEBUG) {
//      body = '{ try {\n' + body + '\n} catch (e) {window.console.log("error in function ' +
//              fnName + ':" + e + ", stack:\\n" + e.stack); throw e} }';
//    }
  var fnSource = "function " + fnName + " (" + parameters.join(", ") + ") " + body;
  if (traceLevel.value > 1) {
    mi.trace(new IndentingWriter(), mi.abc);
  }
  mi.debugTrace = (function (abc) {
    return function () {
      mi.trace(new IndentingWriter(), abc);
    }
  })(this.abc);
  if (traceLevel.value > 0) {
    print (fnSource);
  }
  // mi.freeMethod = (1, eval)('[$M[' + ($M.length - 1) + '],' + fnSource + '][1]');
  // mi.freeMethod = new Function(parameters, body);
  var fn = new Function("return " + fnSource)();
  fn.debugName = "Compiled Function #" + vmNextCompiledFunctionId++;
  return fn;
}

function checkMethodOverrides(methodInfo) {
  if (methodInfo.name) {
    var key;
    if (methodInfo.holder instanceof ClassInfo) {
      key = "static " + methodInfo.holder.instanceInfo.name.getOriginalName() + "::" + methodInfo.name.getOriginalName()
    } else if (methodInfo.holder instanceof InstanceInfo) {
      key = methodInfo.holder.name.getOriginalName() + "::" + methodInfo.name.getOriginalName();
    } else {
      key = methodInfo.name.getOriginalName();
    }
    if (key in VM_METHOD_OVERRIDES) {
      warning("Overriding Method: " + key);
      return VM_METHOD_OVERRIDES[key];
    }
  }
}

/*
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
 * Tm = function trampoline() {
 *   return compile(m).apply(this, arguments);
 * }
 *
 * Of course we don't want to recompile |m| every time it is called. We can optimize the trampoline a bit
 * so that it keeps track of repeated executions:
 *
 * Tm = function trampolineContext() {
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
 * Tm = function trampolineContext() {
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
 * the memoizer so that the next time around it memoizes |Fm| instead of the trampoline. The trampoline also has
 * to patch |m'| with |Fm|, as well as |m| on the instance with a bound |Fm|.
 *
 * Class inheritance further complicates this picture. Suppose we extend class |A| and call the |m| method on an
 * instance of |B|.
 *
 * class B extends A { }
 *
 * var b = new B();
 * b.m();
 *
 * At first class |A| has a memoizer for |m| and a trampoline for |m'|. If we never call |m| on an instance of |A|
 * then the trampoline is not resolved to a function. When we create class |B| we copy over all the traits in the
 * |A.instance.prototype| to |B.instance.prototype| including the memoizers and trampolines. If we call |m| on an
 * instance of |B| then we're going through a memoizer which will be patched to |Fm| by the trampoline and will
 * be reflected in the entire inheritance hierarchy. The problem is when calling |b.m'()| which currently holds
 * the copied trampoline |Ta| which will patch |A.instance.prototype.m'| and not |m'| in |B|s instance prototype.
 *
 * To solve this we keep track of where trampolines are copied and then patching these locations. We store copy
 * locations in the trampoline function object themselves.
 *
 */

/**
 * Creates a trampoline function stub which calls the result of a |forward| callback. The forward
 * callback is only executed the first time the trampoline is executed and its result is cached in
 * the trampoline closure.
 */
function makeTrampoline(forward, parameterLength) {
  release || assert (forward && typeof forward === "function");
  return (function trampolineContext() {
    var target = null;
    /**
     * Triggers the trampoline and executes it.
     */
    var trampoline = function execute() {
      if (traceExecution.value >= 3) {
        print("Trampolining");
      }
      Counter.count("Executing Trampoline");
      traceCallExecution.value > 1 && callWriter.writeLn("Trampoline");
      if (!target) {
        target = forward(trampoline);
        release || assert (target);
      }
      return target.apply(this, arguments);
    };
    /**
     * Just triggers the trampoline without executing it.
     */
    trampoline.trigger = function trigger() {
      Counter.count("Triggering Trampoline");
      if (!target) {
        target = forward(trampoline);
        release || assert (target);
      }
    };
    trampoline.isTrampoline = true;
    trampoline.debugName = "Trampoline #" + vmNextTrampolineId++;
    // Make sure that the length property of the trampoline matches the trait's number of
    // parameters. However, since we can't redefine the |length| property of a function,
    // we define a new hidden |VM_LENGTH| property to store this value.
    defineReadOnlyProperty(trampoline, VM_LENGTH, parameterLength);
    return trampoline;
  })();
}

function makeMemoizer(qn, target) {
  function memoizer() {
    Counter.count("Runtime: Memoizing");
    // release || assert (!Object.prototype.hasOwnProperty.call(this, "class"), this);
    if (traceExecution.value >= 3) {
      print("Memoizing: " + qn);
    }
    traceCallExecution.value > 1 && callWriter.writeLn("Memoizing: " + qn);
    if (isNativePrototype(this)) {
      Counter.count("Runtime: Method Closures");
      return bindSafely(target.value, this);
    }
    if (isTrampoline(target.value)) {
      // If the memoizer target is a trampoline then we need to trigger it before we bind the memoizer
      // target to |this|. Triggering the trampoline will patch the memoizer target but not actually
      // call it.
      target.value.trigger();
    }
    release || assert (!isTrampoline(target.value), "We should avoid binding trampolines.");
    var mc = null;
    if (isClass(this)) {
      Counter.count("Runtime: Static Method Closures");
      mc = bindSafely(target.value, this);
      defineReadOnlyProperty(this, qn, mc);
      return mc;
    }
    if (Object.prototype.hasOwnProperty.call(this, qn)) {
      var pd = Object.getOwnPropertyDescriptor(this, qn);
      if (pd.get) {
        Counter.count("Runtime: Method Closures");
        return bindSafely(target.value, this);
      }
      Counter.count("Runtime: Unpatched Memoizer");
      return this[qn];
    }
    mc = bindSafely(target.value, this);
    defineReadOnlyProperty(mc, Multiname.getPublicQualifiedName("prototype"), null);
    defineReadOnlyProperty(this, qn, mc);
    return mc;
  }
  Counter.count("Runtime: Memoizers");
  memoizer.isMemoizer = true;
  memoizer.debugName = "Memoizer #" + vmNextMemoizerId++;
  return memoizer;
}

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
  if ((mi.abc.domain.mode === EXECUTION_MODE.INTERPRET || !shouldCompile(mi)) && !forceCompile(mi)) {
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
      print(backtrace());
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
    if (compileOnly.value >= 0 || compileUntil.value >= 0) {
      print("Compiling " + totalFunctionCount);
    }
    mi.freeMethod = createCompiledFunction(mi, scope, hasDynamicScope, breakpoint);
  }

  mi.freeMethod[VM_METHOD_INFO] = mi;

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
      mi.activationPrototype = new Activation(mi);
      new ActivationBindings(mi).applyTo(mi.abc.domain, mi.activationPrototype);
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
        handler.scopeObject = new CatchScopeObject(mi.abc.domain, varTrait);
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
    fn = createFunction(mi, scope);
    release || assert (fn);
  }
  if (traceExecution.value >= 3) {
    print("Made Function: " + Multiname.getQualifiedName(mi.name));
  }
  return fn;
}

function makeQualifiedNameTraitMap(traits) {
  var map = createEmptyObject();
  for (var i = 0; i < traits.length; i++) {
    map[Multiname.getQualifiedName(traits[i].name)] = traits[i];
  }
  return map;
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
  var domain = ci.abc.domain;

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

  if (baseClass && Multiname.getQualifiedName(baseClass.classInfo.instanceInfo.name.name) === "Proxy") {
    // TODO: This is very hackish.
    installProxyClassWrapper(cls);
  }

  // Run the static initializer.
  createFunction(classInfo.init, scope).call(cls);

  // Seal constant traits in the class object.
  this.sealConstantTraits(cls, ci.traits);

  return cls;
}

/**
 * In ActionScript, assigning to a property defined as "const" outside of a static or instance
 * initializer throws a |ReferenceError| exception. To emulate this behaviour in JavaScript,
 * we "seal" constant traits properties by replacing them with setters that throw exceptions.
 */
function sealConstantTraits(object, traits) {
  var rt = this;
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
            rt.throwErrorFromVM("ReferenceError", "Illegal write to read-only property " + qn + ".");
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
    return domain.getClass("packageInternal __AS3__.vec.Vector$" + typeClassName);
  } else {
    return notImplemented(factoryClassName);
  }
}

function throwErrorFromVM(domain, errorClass, message, id) {
  throw new (domain.getClass(errorClass)).instanceConstructor(message, id);
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