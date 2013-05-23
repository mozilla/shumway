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
var functionBreak = runtimeOptions.register(new Option("fb", "functionBreak", "number", -1, "Inserts a debugBreak at function index #."));
var compileOnly = runtimeOptions.register(new Option("co", "compileOnly", "number", -1, "Compiles only function number."));
var compileUntil = runtimeOptions.register(new Option("cu", "compileUntil", "number", -1, "Compiles only until a function number."));
var debuggerMode = runtimeOptions.register(new Option("dm", "debuggerMode", "boolean", false, "matches avm2 debugger build semantics"));
var enableVerifier = runtimeOptions.register(new Option("verify", "verify", "boolean", false, "Enable verifier."));

var enableInlineCaching = runtimeOptions.register(new Option("ic", "inlineCaching", "boolean", false, "Enable inline caching."));
var traceInlineCaching = runtimeOptions.register(new Option("tic", "traceInlineCaching", "boolean", false, "Trace inline caching execution."));

var compilerEnableExceptions = runtimeOptions.register(new Option("cex", "exceptions", "boolean", false, "Compile functions with catch blocks."));
var compilerMaximumMethodSize = runtimeOptions.register(new Option("cmms", "maximumMethodSize", "number", 4 * 1024, "Compiler maximum method size."));

var jsGlobal = (function() { return this || (1, eval)('this'); })();

var VM_SLOTS = "vm slots";
var VM_LENGTH = "vm length";
var VM_BINDINGS = "vm bindings";
var VM_NATIVE_PROTOTYPE_FLAG = "vm native prototype";
var VM_ENUMERATION_KEYS = "vm enumeration keys";
var VM_TOMBSTONE = createEmptyObject();
var VM_OPEN_METHODS = "vm open methods";
var VM_NEXT_NAME = "vm next name";
var VM_NEXT_NAME_INDEX = "vm next name index";
var VM_IS_CLASS = "vm is class";
var VM_OPEN_METHOD_PREFIX = "open_";

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

function defineObjectShape(obj) {
  // TODO: This assertion seems to fail for proxies, investigate.
  // assert (!obj.shape, "Shouldn't already have a shape ID. " + obj.shape);
  defineReadOnlyProperty(obj, "shape", vmNextShapeId ++);
}

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
 * This is used to keep track if we're in a runtime context. For instance, proxies need to
 * know if a proxied operation is triggered by AS3 code or VM code.
 */

var AS = 1, JS = 2;

var RUNTIME_ENTER_LEAVE_STACK = [AS];

function enter(mode) {
  // print("enter " + RUNTIME_ENTER_LEAVE_STACK);
  RUNTIME_ENTER_LEAVE_STACK.push(mode);
}

function leave(mode) {
  // print("leave " + RUNTIME_ENTER_LEAVE_STACK);
  var top = RUNTIME_ENTER_LEAVE_STACK.pop();
  assert (top === mode);
}

function inJS() {
  return RUNTIME_ENTER_LEAVE_STACK.top() === JS;
}

function inAS() {
  return RUNTIME_ENTER_LEAVE_STACK.top() === AS;
}

/**
 * To embed object references in compiled code we index into globally accessible constant table [$C].
 * This table maintains an unique set of object references, each of which holds its own position in
 * the constant table, thus providing for fast lookup. We can also define constants in the JS global
 * scope.
 */

var OBJECT_NAME = "Object Name";
var objectIDs = 0;
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
  function getEnumerationKeys(obj) {
    if (obj.node && obj.node.childNodes) {
      obj = obj.node.childNodes;
    }
    var keys = [];

    var boxedValue = obj.valueOf();

    // TODO: This is probably broken if the object has overwritten |valueOf|.
    if (typeof boxedValue === "string" || typeof boxedValue === "number") {
      return [];
    }

    if (obj.getEnumerationKeys) {
      return obj.getEnumerationKeys();
    }

    // TODO: Implement fast path for Array objects.
    for (var key in obj) {
      if (isNumeric(key)) {
        keys.push(Number(key));
      } else if (Multiname.isPublicQualifiedName(key)) {
        if (obj[VM_BINDINGS] && obj[VM_BINDINGS].indexOf(key) >= 0) {
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
}

/**
 * Checks if the specified |obj| is the prototype of a native JavaScript object.
 */
function isNativePrototype(obj) {
  return Object.prototype.hasOwnProperty.call(obj, VM_NATIVE_PROTOTYPE_FLAG)
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

/**
 * ActionScript 3 has different behaviour when deciding whether to call
 * toString or valueOf when one operand is a string. Unlike JavaScript,
 * it calls toString if one operand is a string and valueOf otherwise.
 *
 * This sux, but we have to emulate this behaviour because YouTube
 * depends on it.
 */
function add(l, r) {
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
  if (x === null || x === undefined) {
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
function publicizeProperties(obj) {
  var keys = Object.keys(obj);
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    if (!Multiname.isPublicQualifiedName(k)) {
      var v = obj[k];
      obj[Multiname.getPublicQualifiedName(k)] = v;
      delete obj[k];
    }
  }
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
  if (obj.getProperty) {
    return obj.getProperty(obj[VM_NEXT_NAME](index), false);
  }
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
  if (obj === null || obj === undefined) {
    return {index: 0, object: null};
  }
  obj = boxValue(obj);
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

function getDescendants(obj, mn) {
  if (!isXMLType(obj)) {
    throw "Not XML object in getDescendants";
  }
  return obj.descendants(mn);
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

      release || assert(value.class.implementedInterfaces,
                        "No 'implementedInterfaces' map found on class " +
                            value.class);

      var qualifiedName = Multiname.getQualifiedName(this.name);
      return value.class.implementedInterfaces[qualifiedName] !== undefined;
    },

    call: function (v) {
      return v;
    },

    apply: function ($this, args) {
      return args[0];
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
    this.cache = createEmptyObject();
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

    obj = this.object;
    if (Multiname.isQName(mn)) {
      if (this.isWith) {
        if (obj.hasProperty && obj.hasProperty(mn) ||
            Multiname.getQualifiedName(mn) in obj) {
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
        if (obj.hasProperty && obj.hasProperty(mn) ||
            resolveMultiname(obj, mn)) {
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
  if (obj.hasOwnProperty(VM_BINDINGS) && obj.hasOwnProperty(qn)) {
    return true;
  }

  // Else look on the prototype.
  var proto = Object.getPrototypeOf(obj);
  return proto.hasOwnProperty(VM_BINDINGS) && proto.hasOwnProperty(qn);
}

function resolveMultinameInTraits(obj, mn) {
  release || assert(!Multiname.isQName(mn), mn, " already resolved");

  obj = boxValue(obj);

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
function resolveMultinameUnguarded(obj, mn, traitsOnly) {
  release || assert(Multiname.needsResolution(mn), "Multiname " + mn + " is already resolved.");
  release || assert(!Multiname.isNumeric(mn), "Should not resolve numeric multinames.");
  obj = boxValue(obj);
  var publicQn;

  // Check if the object that we are resolving the multiname on is a JavaScript native prototype
  // and if so only look for public (dynamic) properties. The reason for this is because we cannot
  // overwrite the native prototypes to fit into our trait/dynamic prototype scheme, so we need to
  // work around it here during name resolution.

  var isNative = isNativePrototype(obj);
  for (var i = 0, j = mn.namespaces.length; i < j; i++) {
    var qn = mn.getQName(i);
    if (traitsOnly) {
      if (nameInTraits(obj, Multiname.getQualifiedName(qn))) {
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
      if (Multiname.getQualifiedName(qn) in obj) {
        return qn;
      }
    }
  }
  if (publicQn && !traitsOnly && (Multiname.getQualifiedName(publicQn) in obj)) {
    return publicQn;
  }
  return undefined;
}

function resolveMultiname(obj, mn, traitsOnly) {
  enter(JS);
  var result = resolveMultinameUnguarded(obj, mn, traitsOnly);
  leave(JS);
  return result;
}

function createPublicKeyedClone(source) {
  const visited = new WeakMap();
  function visit(item) {
    if (!item || typeof item !== 'object') {
      return item;
    }
    if (visited.has(item)) {
      return visited.get(item);
    }

    var result = createEmptyObject();
    visited.set(item, result);
    var keys = Object.keys(item);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      result[Multiname.getPublicQualifiedName(key)] = visit(item[key]);
    }
    return result;
  }
  return visit(source);
}

function isNameInObject(qn, obj) {
  if (qn.isAttribute()) {
    for (var i = 0; i < obj.attributes.length; i++) {
      var attr = obj.attributes[i];
      if (attr.name === qn.name) {
        return true;
      }
    }
    return false;
  } else {
    return Multiname.getQualifiedName(qn) in obj;
  }
}

function sliceArguments(args, offset) {
  return Array.prototype.slice.call(args, offset);
}

function callProperty(obj, mn, isLex, args) {
  // Counter.count("callProperty " + mn.name);
  if (typeof obj === "number") {
    obj = boxValue(obj);
  }
  var receiver = isLex ? null : obj;
  if (isProxyObject(obj)) {
    return obj[VM_CALL_PROXY](mn, receiver, args);
  }
  var property = getProperty(obj, mn, true);
  return property.apply(receiver, args);
}

function hasProperty(obj, name) {
  obj = boxValue(obj);
  if (obj.hasProperty) {
    return obj.hasProperty(name);
  }
  return resolveName(obj, name) in obj;
}

function getSuper(scope, obj, mn) {
  release || assert(scope instanceof Scope);
  release || assert(obj !== undefined, "getSuper(" + mn + ") on undefined");
  release || assert(Multiname.isMultiname(mn));
  var superClass = scope.object.baseClass;
  release || assert(superClass);
  var superTraits = superClass.instance.prototype;

  var resolved = mn.isQName() ? mn : resolveMultiname(superTraits, mn);
  var value = undefined;

  if (resolved) {
    if (Multiname.isNumeric(resolved) && superTraits.indexGet) {
      value = superTraits.indexGet(Multiname.getQualifiedName(resolved), value);
    } else {
      // Which class is it really on?
      var qn = Multiname.getQualifiedName(resolved);
      var openMethod = superTraits[VM_OPEN_METHODS][qn];
      var superName = superClass.classInfo.instanceInfo.name;

      // If we're getting a method closure on the super class, close the open
      // method now and save it to a mangled name. We can't go through the
      // normal memoizer here because we could be overriding our own method or
      // getting into an infinite loop (getters that access the property
      // they're set to on the same object is bad news).
      if (openMethod) {
        value = obj[superName + " " + qn];
        if (!value) {
          value = obj[superName + " " + qn] = safeBind(openMethod, obj);
        }
      } else {
        var descriptor = Object.getOwnPropertyDescriptor(superTraits, qn);
        release || assert(descriptor);
        value = descriptor.get ? descriptor.get.call(obj) : obj[qn];
      }
    }
  }
  return value;
}

function resolveName(obj, name) {
  if (name instanceof Multiname) {
    if (name.namespaces.length > 1) {
      var resolved = resolveMultiname(obj, name);
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

function resolveNameWithIC(obj, name, ic) {
  var qn;
  if (obj.shape) {
    if (ic.key === obj.shape) {
      qn = ic.value;
    } else {
      if (!ic.key) {
        Counter.count("resolveName: IC Miss");
      }
      ic.key = obj.shape;
      qn = ic.value = resolveName(obj, name);
    }
  } else {
    qn = resolveName(obj, name);
  }
  return qn;
}
function getPropertyWithIC(obj, name, ic) {
  if (obj.getProperty) {
    return obj.getProperty(name);
  }
  var qn = resolveNameWithIC(obj, name, ic);
  if (obj.indexGet && Multiname.isNumeric(qn)) {
    return obj.indexGet(qn);
  }
  return obj[qn];
}

function getProperty(obj, name, isMethod) {
  if (obj.getProperty) {
    return obj.getProperty(name, isMethod);
  }
  var qn = resolveName(obj, name);
  if (obj.indexGet && Multiname.isNumeric(qn)) {
    return obj.indexGet(qn);
  }
  return obj[qn];
}

function setPropertyWithIC(obj, name, value, ic) {
  if (obj.setProperty) {
    return obj.setProperty(name, value);
  }
  var qn = resolveNameWithIC(obj, name, ic);
  if (obj.indexGet && Multiname.isNumeric(qn)) {
    return obj.indexSet(qn, value);
  }
  obj[qn] = value;
}

function setProperty(obj, name, value) {
  if (obj.setProperty) {
    return obj.setProperty(name, value);
  }
  var qn = resolveName(obj, name);
  if (obj.indexGet && Multiname.isNumeric(qn)) {
    return obj.indexSet(qn, value);
  }
  obj[qn] = value;
}

function deleteProperty(obj, name) {
  if (obj.deleteProperty) {
    return obj.deleteProperty(name);
  }
  var qn = resolveName(obj, name);
  if (obj.indexDelete && Multiname.isNumeric(qn)) {
    return obj.indexDelete(qn);
  }
  /**
   * If we're in the middle of an enumeration, we need to remove the property name
   * from the enumeration keys as well. Setting it to |VM_TOMBSTONE| will cause it
   * to be skipped by the enumeration code.
   */
  if (obj[VM_ENUMERATION_KEYS]) {
    var index = obj[VM_ENUMERATION_KEYS].indexOf(qn);
    if (index >= 0) {
      obj[VM_ENUMERATION_KEYS][index] = VM_TOMBSTONE;
    }
  }
  return delete obj[qn];
}

function setSuper(scope, obj, mn, value) {
  release || assert(obj);
  release || assert(Multiname.isMultiname(mn));
  var superClass = scope.object.baseClass;
  release || assert(superClass);

  var superTraits = superClass.instance.prototype;
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
                             " on " + superClass.debugName);
  }
}

function forEachPublicProperty(obj, fn, self) {
  if (!obj[VM_BINDINGS]) {
    for (var key in obj) {
      fn.call(self, key, obj[key]);
    }
    return;
  }

  for (var key in obj) {
    if (isNumeric(key)) {
      fn.call(self, key, obj[key]);
    } else if (Multiname.isPublicQualifiedName(key) && obj[VM_BINDINGS].indexOf(key) < 0) {
      var name = key.substr(Multiname.PUBLIC_QUALIFIED_NAME_PREFIX.length);
      fn.call(self, name, obj[key]);
    }
  }
}

function wrapJSObject(obj) {
  var wrapper = Object.create(obj);
  for (var i in obj) {
    Object.defineProperty(wrapper, Multiname.getPublicQualifiedName(i), (function (obj, i) {
      return {
        get: function () { return obj[i] },
        set: function (value) { obj[i] = value; },
        enumerable: true
      };
    })(obj, i));
  }
  return wrapper;
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

function isClass(obj) {
  assert (obj);
  return Object.hasOwnProperty.call(obj, VM_IS_CLASS);
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
 * Execution context for an ABC.
 */
var Runtime = (function () {
  var totalFunctionCount = 0;
  var compiledFunctionCount = 0;

  function runtime(abc) {
    this.abc = abc;
    this.domain = abc.domain;
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
  runtime.currentDomain = function () {
    if (Runtime.stack.length) {
      return Runtime.stack.top().domain;
    }
    return null;
  };

  runtime.callStack = [];

  /**
   * This only works for interpreter frames.
   */
  runtime.getStackTrace = function getStackTrace () {
    return Runtime.callStack.clone().reverse().map(function (frame) {
      var str = "";
      if (frame.method) {
        if (frame.method.holder) {
          str += frame.method.holder + " ";
        }
        str += frame.method + ":";
      }
      return str + frame.bc.originalPosition;
    }).join("\n");
  };

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
   * Wraps the compiled method in a closure that passes the dynamic scope object as the
   * first argument and also makes sure that the |asGlobal| object gets passed in as
   * |this| when the method is called with |fn.call(null)|.
   */
  function bindScope(methodInfo, scope) {
    var fn = methodInfo.compiledMethod;
    assert (fn, "There should already be a compiled method.");
    var closure;
    var asGlobal = scope.global.object;
    // if (!methodInfo.needsArguments() ) {
    if (!methodInfo.hasOptional() &&
        !methodInfo.needsArguments()) {
      // Special case the common path.
      switch (methodInfo.parameters.length) {
        case 0:
          closure = function () {
            return fn.call(this === jsGlobal ? asGlobal : this, scope);
          };
          break;
        case 1:
          closure = function (x) {
            return fn.call(this === jsGlobal ? asGlobal : this, scope, x);
          };
          break;
        case 2:
          closure = function (x, y) {
            return fn.call(this === jsGlobal ? asGlobal : this, scope, x, y);
          };
          break;
        case 3:
          closure = function (x, y, z) {
            return fn.call(this === jsGlobal ? asGlobal : this, scope, x, y, z);
          };
          break;
        default:
          // TODO: We can special case more ...
          break;
      }
    }
    if (!closure) {
      Counter.count("Bind Scope - Slow Path");
      closure = function () {
        Array.prototype.unshift.call(arguments, scope);
        var global = (this === jsGlobal ? scope.global.object : this);
        return fn.apply(global, arguments);
      };
    }
    closure.instance = closure;
    return closure;
  }

  /**
   * Creates a method from the specified |methodInfo| that is bound to the given |scope|. If the
   * scope is dynamic (as is the case for closures) the compiler generates an additional prefix
   * parameter for the compiled function named |SAVED_SCOPE_NAME| and then wraps the compiled
   * function in a closure that is bound to the given |scope|. If the scope is not dynamic, the
   * compiler bakes it in as a constant which should be much more efficient.
   */
  runtime.prototype.createFunction = function createFunction(methodInfo, scope, hasDynamicScope, breakpoint) {
    var mi = methodInfo;
    release || assert(!mi.isNative(), "Method should have a builtin: ", mi.name);

    if (mi.compiledMethod) {
      release || assert(hasDynamicScope);
      return bindScope(mi, scope);
    }

    if (methodInfo.name) {
      var qn = Multiname.getQualifiedName(methodInfo.name);
      if (qn in VM_METHOD_OVERRIDES) {
        warning("Overriding Method: " + qn);
        return VM_METHOD_OVERRIDES[qn];
      }
    }

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
          args = sliceArguments(arguments);
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
    // mi.compiledMethod = (1, eval)('[$M[' + ($M.length - 1) + '],' + fnSource + '][1]');
    // mi.compiledMethod = new Function(parameters, body);
    mi.compiledMethod = new Function("return " + fnSource)();
    compiledFunctionCount++;

    if (hasDynamicScope) {
      return bindScope(mi, scope);
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

    var nativeClassBuilder;

    if (ci.native) {
      nativeClassBuilder = getNative(ci.native.cls);
      if (!nativeClassBuilder) {
        warning("No native for " + ci.native.cls);
      }
    }

    if (ci.native && nativeClassBuilder) {
      release || assert(nativeClassBuilder, "No native for ", ci.native.cls);

      // Special case Object, which has no base class but needs the Class class on the scope.
      if (!baseClass) {
        scope = new Scope(scope, domain.system.Class);
      }
      scope = new Scope(scope, null);
      cls = nativeClassBuilder(this, scope, this.createFunction(ii.init, scope), baseClass);
      cls.classInfo = classInfo;
      cls.scope = scope;
      scope.object = cls;
      var natives;
      if (cls.instance) {
        // Instance traits live on instance.prototype.
        natives = cls.native ? cls.native.instance : undefined;
        this.applyTraits(cls.traitsPrototype, scope, baseBindings, ii.traits, natives, true);
      }
      natives = cls.native ? cls.native.static : undefined;
      this.applyTraits(cls, scope, null, ci.traits, natives, true);
    } else {
      scope = new Scope(scope, null);
      cls = new domain.system.Class(className, this.createFunction(ii.init, scope));
      cls.classInfo = classInfo;
      cls.scope = scope;
      scope.object = cls;
      cls.extend(baseClass);
      this.applyTraits(cls.traitsPrototype, scope, baseBindings, ii.traits, null, true);
      this.applyTraits(cls, scope, null, ci.traits, null, true);
    }

    defineReadOnlyProperty(cls, VM_IS_CLASS, true);

    if (cls.instance) {
      this.applyProtectedBindings(cls.traitsPrototype, cls);
      this.applyInterfaceBindings(cls.traitsPrototype, cls);
    }

    // Notify domain of class creation.
    domain.onClassCreated.notify(cls);

    if (cls.instance && cls !== domain.system.Class) {
      cls.verify();
    }

    // Run the static initializer.
    this.createFunction(classInfo.init, scope).call(cls);

    // Seal constant traits in the class object.
    compatibility && this.sealConstantTraits(cls, ci.traits);

    // TODO: Seal constant traits in the instance object. This should be done after
    // the instance constructor has executed.

    if (traceClasses.value) {
      domain.loadedClasses.push(cls);
      domain.traceLoadedClasses();
    }

    if (baseClass && Multiname.getQualifiedName(baseClass.classInfo.instanceInfo.name.name) === "Proxy") {
      // TODO: This is very hackish.
      installProxyClassWrapper(cls);
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

  runtime.prototype.applyProtectedBindings = function applyProtectedBindings(obj, cls) {
    // Deal with the protected namespace bullshit. In AS3, if you have the following code:
    //
    // class A {
    //   protected foo() { ... } // this is actually protected$A$foo
    // }
    //
    // class B extends A {
    //   function bar() {
    //     foo(); // this looks for protected$B$foo, not protected$A$foo
    //   }
    // }
    //
    // You would expect the call to |foo| in the |bar| function to have the protected A
    // namespace open, but it doesn't. So we must create a binding in B's instance
    // prototype from protected$B$foo -> protected$A$foo.
    //
    // If we override foo:
    //
    // class C extends B {
    //   protected override foo() { ... } this is protected$C$foo
    // }
    //
    // Then we need a binding from protected$A$foo -> protected$C$foo, and
    // protected$B$foo -> protected$C$foo.

    var map = createEmptyObject();

    // Walks up the inheritance hierarchy and collects the last defining namespace for each
    // protected member as well as all the protected namespaces from the first definition.
    (function gather(cls) {
      if (cls.baseClass) {
        gather(cls.baseClass);
      }
      var ii = cls.classInfo.instanceInfo;
      for (var i = 0; i < ii.traits.length; i++) {
        var trait = ii.traits[i];
        if (trait.isProtected()) {
          var name = trait.name.getName();
          if (!map[name]) {
            map[name] = {definingNamespace: ii.protectedNs, namespaces: [], trait: trait};
          }
          map[name].definingNamespace = ii.protectedNs;
        }
      }
      for (var name in map) {
        map[name].namespaces.push(ii.protectedNs);
      }
    })(cls);

    var openMethods = obj[VM_OPEN_METHODS];
    var vmBindings = obj[VM_BINDINGS];
    for (var name in map) {
      var definingNamespace = map[name].definingNamespace;
      var protectedQn = Multiname.getQualifiedName(new Multiname([definingNamespace], name));
      var namespaces = map[name].namespaces;
      var trait = map[name].trait;
      for (var i = 0; i < namespaces.length; i++) {
        var qn = Multiname.getQualifiedName(new Multiname([namespaces[i]], name));
        if (qn !== protectedQn) {
          Counter.count("Protected Aliases");
          defineNonEnumerableGetter(obj, qn, makeForwardingGetter(protectedQn));
          defineNonEnumerableSetter(obj, qn, makeForwardingSetter(protectedQn));
          vmBindings.push(qn);
          if (trait.isMethod()) {
            var openMethod = openMethods[protectedQn];
            assert (openMethod);
            defineNonEnumerableProperty(obj, VM_OPEN_METHOD_PREFIX + qn, openMethod);
            openMethods[qn] = openMethod;
          }
        }
      }
    }
  };

  runtime.prototype.applyInterfaceBindings = function applyInterfaceBindings(obj, cls) {
    var domain = this.domain;

    var implementedInterfaces = cls.implementedInterfaces = createEmptyObject();

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
    function applyInterfaceTraits(interfaces) {
      for (var i = 0, j = interfaces.length; i < j; i++) {
        var interface = domain.getProperty(interfaces[i], true, true);
        var ii = interface.classInfo.instanceInfo;
        implementedInterfaces[interface.name.qualifiedName] = interface;
        applyInterfaceTraits(ii.interfaces);

        var interfaceTraits = ii.traits;
        for (var k = 0, l = interfaceTraits.length; k < l; k++) {
          var interfaceTrait = interfaceTraits[k];
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
          Counter.count("Interface Aliases");
          defineNonEnumerableGetter(obj, interfaceTraitQn, getter);
        }
      }
    }
    // Apply traits of all interfaces along the inheritance chain.
    while (cls) {
      applyInterfaceTraits(cls.classInfo.instanceInfo.interfaces);
      cls = cls.baseClass;
    }
  };

  /**
   * In ActionScript, assigning to a property defined as "const" outside of a static or instance
   * initializer throws a |ReferenceError| exception. To emulate this behaviour in JavaScript,
   * we "seal" constant traits properties by replacing them with setters that throw exceptions.
   */
  runtime.prototype.sealConstantTraits = function sealConstantTraits(obj, traits) {
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
   * Gets the function associated with a given trait.
   */
  runtime.prototype.getTraitFunction = function getTraitFunction(trait, scope, natives) {
    release || assert(scope);
    release || assert(trait.isMethod() || trait.isGetter() || trait.isSetter());

    var mi = trait.methodInfo;
    var fn;

    if (mi.isNative() && this.domain.allowNatives) {
      var md = trait.metadata;
      if (md && md.native) {
        var nativeName = md.native.value[0].value;
        var makeNativeFunction = getNative(nativeName) ||
                                 this.domain.natives[nativeName];
        fn = makeNativeFunction && makeNativeFunction(runtime, scope);
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
      fn = this.createFunction(mi, scope);
      assert (fn);
    }
    if (traceExecution.value >= 3) {
      print("Made Function: " + Multiname.getQualifiedName(mi.name));
    }
    return fn;
  };

  function makeQualifiedNameTraitMap(traits) {
    var map = createEmptyObject();
    for (var i = 0; i < traits.length; i++) {
      map[Multiname.getQualifiedName(traits[i].name)] = traits[i];
    }
    return map;
  }

  /**
   * Inherit trait bindings. This is the primary inheritance mechanism, we clone the trait bindings then
   * overwrite them for overrides.
   */
  function inheritBindings(obj, base, traits) {
    if (!base) {
      defineNonEnumerableProperty(obj, VM_BINDINGS, []);
      defineNonEnumerableProperty(obj, VM_SLOTS, []);
      defineNonEnumerableProperty(obj, VM_OPEN_METHODS, createEmptyObject());
    } else {
      var traitMap = makeQualifiedNameTraitMap(traits);
      var openMethods = createEmptyObject();
      var baseBindings = base[VM_BINDINGS];
      var baseOpenMethods = base[VM_OPEN_METHODS];
      for (var i = 0; i < baseBindings.length; i++) {
        var qn = baseBindings[i];
        // TODO: Make sure we don't add overriden methods as patch targets. This may be
        // broken for getters / setters.
        if (!traitMap[qn] || traitMap[qn].isGetter() || traitMap[qn].isSetter()) {
          var baseBindingDescriptor = Object.getOwnPropertyDescriptor(base, qn);
          Object.defineProperty(obj, qn, baseBindingDescriptor);
          if (Object.prototype.hasOwnProperty.call(baseOpenMethods, qn)) {
            var openMethod = baseOpenMethods[qn];
            openMethods[qn] = openMethod;
            defineNonEnumerableProperty(obj, VM_OPEN_METHOD_PREFIX + qn, openMethod);
            if (openMethod.patchTargets) {
              openMethod.patchTargets.push({object: openMethods, name: qn});
              openMethod.patchTargets.push({object: obj, name: VM_OPEN_METHOD_PREFIX + qn});
            }
          }
        }
      }
      defineNonEnumerableProperty(obj, VM_BINDINGS, base[VM_BINDINGS].slice());
      defineNonEnumerableProperty(obj, VM_SLOTS, base[VM_SLOTS].slice());
      defineNonEnumerableProperty(obj, VM_OPEN_METHODS, openMethods);
    }
  }

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
        Counter.count("Executing Trampoline");
        if (!target) {
          target = forward(trampoline);
          assert (target);
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
          assert (target);
        }
      };
      trampoline.isTrampoline = true;
      // Make sure that the length property of the trampoline matches the trait's number of
      // parameters. However, since we can't redefine the |length| property of a function,
      // we define a new hidden |VM_LENGTH| property to store this value.
      defineReadOnlyProperty(trampoline, VM_LENGTH, parameterLength);
      return trampoline;
    })();
  }

  runtime.prototype.applyMethodTrait = function applyMethodTrait(obj, trait, scope, needsMemoizer, natives) {
    var runtime = this;

    release || assert (trait.isMethod() || trait.isGetter() || trait.isSetter());
    var qn = Multiname.getQualifiedName(trait.name);

    function makeMemoizer(target) {
      function memoizer() {
        Counter.count("Runtime: Memoizing");
        assert (!Object.prototype.hasOwnProperty.call(this, "class"));
        if (traceExecution.value >= 3) {
          print("Memoizing: " + qn);
        }
        if (isNativePrototype(this)) {
          Counter.count("Runtime: Method Closures");
          return safeBind(target.value, this);
        }
        if (target.value.isTrampoline) {
          // If the memoizer target is a trampoline then we need to trigger it before we bind the memoizer
          // target to |this|. Triggering the trampoline will patch the memoizer target but not actually
          // call it.
          target.value.trigger();
        }
        assert (!target.value.isTrampoline, "We should avoid binding trampolines.");
        var mc = null;
        if (isClass(this)) {
          Counter.count("Runtime: Static Method Closures");
          mc = safeBind(target.value, this);
          defineReadOnlyProperty(this, qn, mc);
          return mc;
        }
        if (Object.prototype.hasOwnProperty.call(this, qn)) {
          var pd = Object.getOwnPropertyDescriptor(this, qn);
          if (pd.get) {
            Counter.count("Runtime: Method Closures");
            return safeBind(target.value, this);
          }
          Counter.count("Runtime: Unpatched Memoizer");
          return this[qn];
        }
        mc = safeBind(target.value, this);
        defineReadOnlyProperty(mc, Multiname.getPublicQualifiedName("prototype"), null);
        defineReadOnlyProperty(this, qn, mc);
        return mc;
      }
      Counter.count("Runtime: Memoizers");
      return memoizer;
    }

    if (needsMemoizer) {
      release || assert(obj[VM_OPEN_METHODS]);
      if (trait.isMethod()) {
        // Patch the target of the memoizer using a temporary |target| object that is visible to both the trampoline
        // and the memoizer. The trampoline closes over it and patches the target value while the memoizer uses the
        // target value for subsequent memoizations.
        var memoizerTarget = { value: null };
        var trampoline = makeTrampoline(function (self) {
          var fn = runtime.getTraitFunction(trait, scope, natives);
          Counter.count("Runtime: Patching Memoizer");
          var patchTargets = self.patchTargets;
          for (var i = 0; i < patchTargets.length; i++) {
            var patchTarget = patchTargets[i];
            if (traceExecution.value >= 3) {
              var oldValue = patchTarget.object[patchTarget.name];
              print("Trampoline: Patching: " + patchTarget.name + " oldValue: " + oldValue);
            }
            patchTarget.object[patchTarget.name] = fn;

          }
          return fn;
        }, trait.methodInfo.parameters.length);

        memoizerTarget.value = trampoline;
        var openMethods = obj[VM_OPEN_METHODS];
        openMethods[qn] = trampoline;
        defineNonEnumerableProperty(obj, VM_OPEN_METHOD_PREFIX + qn, trampoline);

        // TODO: We make the |memoizeMethodClosure| configurable since it may be
        // overridden by a derived class. Only do this non final classes.

        defineNonEnumerableGetter(obj, qn, makeMemoizer(memoizerTarget));

        trampoline.patchTargets = [
          { object: memoizerTarget, name: "value"},
          { object: openMethods,    name: qn },
          { object: obj,            name: VM_OPEN_METHOD_PREFIX + qn }
        ];
      } else if (trait.isGetter() || trait.isSetter()) {
        var trampoline = makeTrampoline(function (self) {
          var fn = runtime.getTraitFunction(trait, scope, natives);
          defineNonEnumerableGetterOrSetter(obj, qn, fn, trait.isGetter());
          return fn;
        });
        defineNonEnumerableGetterOrSetter(obj, qn, trampoline, trait.isGetter());
        // obj[VM_OPEN_METHODS][qn] = trampoline;
        // defineNonEnumerableProperty(obj, VM_OPEN_METHOD_PREFIX + qn, trampoline);
      }
    } else {
      if (trait.isMethod()) {
        var trampoline = makeTrampoline(function (self) {
          var fn = runtime.getTraitFunction(trait, scope, natives);
          defineReadOnlyProperty(obj, qn, fn);
          defineReadOnlyProperty(obj, VM_OPEN_METHOD_PREFIX + qn, fn);
          return fn;
        }, trait.methodInfo.parameters.length);
        var closure = safeBind(trampoline, obj);
        defineReadOnlyProperty(closure, VM_LENGTH, trampoline[VM_LENGTH]);
        defineReadOnlyProperty(closure, Multiname.getPublicQualifiedName("prototype"), null);
        defineNonEnumerableProperty(obj, qn, closure);
        defineNonEnumerableProperty(obj, VM_OPEN_METHOD_PREFIX + qn, closure);
      } else if (trait.isGetter() || trait.isSetter()) {
        var trampoline = makeTrampoline(function (self) {
          var fn = runtime.getTraitFunction(trait, scope, natives);
          defineNonEnumerableGetterOrSetter(obj, qn, fn, trait.isGetter());
          return fn;
        });
        defineNonEnumerableGetterOrSetter(obj, qn, trampoline, trait.isGetter());
      }
    }
  };

  runtime.prototype.applyTraits = function applyTraits(obj, scope, base, traits, natives, methodsNeedMemoizers) {
    var domain = this.domain;

    inheritBindings(obj, base, traits);

    // Go through each trait and apply it to the |obj|.

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
          if (trait.metadata && trait.metadata.native && domain.allowNatives) {
            trait.classInfo.native = trait.metadata.native;
          }
        }
        
        var defaultValue = undefined;
        if (trait.isSlot() || trait.isConst()) {
          if (trait.hasDefaultValue) {
            defaultValue = trait.value;
          } else if (trait.typeName) {
            defaultValue = domain.findClassInfo(trait.typeName).defaultValue;
          }
        }
        defineNonEnumerableProperty(obj, qn, defaultValue);
        obj[VM_SLOTS][trait.slotId] = {
          name: qn,
          const: trait.isConst(),
          type: trait.typeName ? domain.getProperty(trait.typeName, false, false) : null
        };
      } else if (trait.isMethod() || trait.isGetter() || trait.isSetter()) {
        this.applyMethodTrait(obj, trait, scope, methodsNeedMemoizers, natives);
      } else {
        release || assert(false);
      }

      // TODO: Remove duplicate entries.
      obj[VM_BINDINGS].push(qn);

      if (traceExecution.value >= 3) {
        print("Applied Trait: " + trait + " " + qn);
      }
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
      return this.domain.getClass("packageInternal __AS3__.vec.Vector$" + typeClassName);
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

/**
 * Inline caching is used to optimize property access. In AS3, the property access expression |o.p| may be compiled as
 * |o.{ns0,ns1,ns2}::p| where {ns0, ns1, ns2} is a set of currently open namespaces. Usually, if we can't determine
 * the type of |o| then we can't resolve the multiname to a qname and we must emit a call to a slow |getProperty(o,
 * {ns0,ns1,ns2}::p)| function which performs a linear search over all qnames in the multiname until one is found.
 *
 * However, if we can prove that the name |p| only ever appears in the |ns1| namespace in any of the "currently" defined
 * traits, then we can resolve the multiname to |ns1$p| since it can't possibly resolve to any other namespace. Instead
 * of the slow |getProperty| call, we could just emit |o.ns1$p|. Unfortunately, this is not sound because another .swf
 * file may be loaded that defines a trait |p| in the namespace |ns0| which would invalidate our previous assumption. To
 * fix this, we instead generate a getter stub |get = function (o) { return o.ns1$p; }| that returns the value of |o.ns1$p|.
 * We then keep track of this stub and if at a later time our assumption is invalidated we patch it with another stub
 * that also checks the |ns0| namespace |get = function (o) { return o.ns1$p ? o.ns1$p : (o.ns0$p ? o.ns0$p : undefined); }|.
 *
 * Because the JS engine inlines short functions, we can expect that the getters / setter functions are inlined and
 * guarded with PICs, so in a sense we're implementing AS3 PICs on top of JS PICs.
 *
 * TODO: This code is bit rotten.
 */
var InlineCacheManager = (function () {
  var writer = new IndentingWriter();

  var inlineCacheSets = new Map();

  var InlineCacheSet = (function () {
    var inlineCacheCounter = 0;
    function inlineCacheSet(name) {
      this.name = name;
      this.namespaces = [];
      this.dirty = true;
      this.inlineCaches = [];
    }
    inlineCacheSet.prototype.update = function (namespace) {
      release || assert(namespace instanceof Namespace);
      var foundNewNamespace = true;
      var namespaces = this.namespaces;
      for (var i = 0; i < namespaces.length; i++) {
        if (namespaces[i][0].isEqualTo(namespace)) {
          namespaces[i][1] ++;
          foundNewNamespace = false;
          break;
        }
      }
      if (foundNewNamespace) {
        this.namespaces.push([namespace, 1]);
        release || assert(this.dirty, "TODO: Invalidate inline caches.");
      }
    };
    /**
     * Gets the intersection of the specified multiname's qnames and the current qnames for this name.
     */
    inlineCacheSet.prototype.getIntersection = function (mn) {
      var namespaces = this.namespaces.sort(function (a, b) {
        return a[1] - b[1];
      });
      var names = [];
      for (var i = 0; i < namespaces.length; i++) {
        var ns = namespaces[i][0];
        for (var j = 0; j < mn.namespaces.length; j++) {
          if (mn.namespaces[j].isEqualTo(ns)) {
            if (!ns.isDynamic()) {
              names.push(new Multiname([ns], mn.name));
            }
            break;
          }
        }
      }
      // The public dynamic namespace needs to be last.
      names.push(Multiname.getPublicQualifiedName(mn.name));
      return names;
    };
    inlineCacheSet.prototype.create = function (mn, isSetter) {
      this.dirty = false;
      var qns = this.getIntersection(mn);
      qns.reverse();
      var src;
      for (var i = 0; i < qns.length; i++) {
        var qn = Multiname.getQualifiedName(qns[i]);
        if (isSetter) {
          src = i === 0 ? 'o.' + qn + ' = v' :
            '(o.' + qn + ' !== undefined || ("' + qn + '" in o)) ? o.' + qn + ' = v : (' + src + ')';
        } else {
          src = i === 0 ? 'o.' + qn :
            '((x = o.' + qn + ') !== undefined || ("' + qn + '" in o)) ? x : (' + src + ')';
        }
      }
      release || assert(qns.length);
      var icName = (isSetter ? INLINE_CACHE_SETTER_PREFIX : INLINE_CACHE_GETTER_PREFIX) + (inlineCacheCounter ++);
      if (isSetter) {
        src = 'function ' + icName + '(o, v) { ' + src + '; }';
      } else {
        src = 'function ' + icName + '(o) { ' + (qns.length > 1 ? 'var x; ' : '') + 'return ' + src + '; }';
      }
      if (traceInlineCaching.value) {
        writer.writeLn("IC Stub: " + src);
      }
      jsGlobal[icName] = eval('[' + src + '][0]');
      this.inlineCaches.push(icName);
      return icName;
    };
    return inlineCacheSet;
  })();

  function updateTraits(traits) {
    traits.forEach(function (trait) {
      var name = trait.name.getName();
      var namespace = trait.name.getNamespace();
      if (!inlineCacheSets.has(name)) {
        inlineCacheSets.set(name, new InlineCacheSet(name));
      }
      var inlineCacheSet = inlineCacheSets.get(name);
      release || assert(inlineCacheSet, name);
      inlineCacheSet.update(namespace);
    });
  }

  return {
    createInlineCache: function createInlineCache(mn, isSetter) {
      release || assert(mn instanceof Multiname);
      release || assert(!mn.isAnyName() && !mn.isRuntimeName() && !mn.isRuntimeNamespace());
      release || assert(mn.namespaces.length > 1);
      var cache = mn.inlineCache || (mn.inlineCache = createEmptyObject());
      var cacheName = isSetter ? "setter" : "getter";
      if (cache[cacheName]) {
        return cache[cacheName];
      }
      var name = mn.getName();
      if (inlineCacheSets.has(name)) {
        var inlineCacheSet = inlineCacheSets.get(name);
        if (inlineCacheSet) {
          Counter.count("Compiler: Inline Cache");
          return cache[cacheName] = inlineCacheSet.create(mn, isSetter);
        }
      }
      return undefined;
    },
    /**
     * Called after an .abc file is loaded. This invalidates inline caches if they have been created.
     */
    updateInlineCaches: function updateInlineCaches(abc) {
      if (!enableInlineCaching.value) {
        return;
      }
      /* Collect traits from script, classes, instances and method activations. */
      abc.scripts.forEach(function (si) {
        updateTraits(si.traits);
      });
      abc.classes.forEach(function (ci) {
        updateTraits(ci.traits);
        updateTraits(ci.instanceInfo.traits);
      });
      abc.methods.forEach(function (mi) {
        if (mi.traits) {
          updateTraits(mi.traits);
        }
      });
      /* Trace stats. */
      if (traceInlineCaching.value) {
        for (var k in inlineCacheSets) {
          if (inlineCacheSets.has(k)) {
            var set = inlineCacheSets.get(k);
            writer.writeLn("IC Set: " + k + " - " + set.namespaces.map(function (x) {
              return x[0].qualifiedName + ": " + x[1];
            }).join(", "));
          }
        }
      }
    }
  };

})();
