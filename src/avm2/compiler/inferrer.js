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

"use strict";

var verifierOptions = systemOptions.register(new OptionSet("Verifier Options"));
var verifierTraceLevel = verifierOptions.register(new Option("tv", "tv", "number", 0, "Verifier Trace Level"));

var Type = (function () {
  function type () {
    unexpected("Type is Abstract");
  }

  type.prototype.equals = function (other) {
    return this === other;
  };

  type.prototype.merge = function (other) {
    // return other;
    unexpected("Merging " + this + " with " + other);
  };

  type.cache = {
    name: {},
    classInfo: [],
    instanceInfo: [],
    scriptInfo: [],
    methodInfo: []
  };

  type.from = function from(x, domain) {
    var traitsTypeCache = null;
    if (x instanceof ClassInfo) {
      traitsTypeCache = type.cache.classInfo;
    } else if (x instanceof InstanceInfo) {
      traitsTypeCache = type.cache.instanceInfo;
    } else if (x instanceof ScriptInfo) {
      traitsTypeCache = type.cache.scriptInfo;
    }
    if (traitsTypeCache) {
      return traitsTypeCache[x.id] || (traitsTypeCache[x.id] = new TraitsType(x, domain));
    }
    if (x instanceof Activation) {
      return new TraitsType(x.methodInfo);
    } else if (x instanceof Global) {
      return new TraitsType(x.scriptInfo);
    } else if (x instanceof Interface) {
      return new TraitsType(x.classInfo, domain);
    } else if (x instanceof MethodInfo) {
      return new MethodType(x);
    } else if (domain && (x instanceof (Class))) {
      return type.from(x.classInfo, domain);
    }
    return Type.Any;
  };

  type.fromSimpleName = function (name, domain) {
    return Type.fromName(Multiname.fromSimpleName(name), domain);
  };

  type.fromName = function fromName(mn, domain) {
    if (mn === undefined) {
      return Type.Undefined;
    } else {
      var qn = Multiname.isQName(mn) ? Multiname.getFullQualifiedName(mn) : undefined;
      if (qn) {
        var ty = type.cache.name[qn];
        if (ty) {
          return ty;
        }
      }
      if (qn === Multiname.getPublicQualifiedName("void")) {
        return Type.Void;
      }
      release || assert(domain, "ApplicationDomain is needed.");
      ty = domain.findClassInfo(mn);
      ty = ty ? type.from(ty, domain) : Type.Any;
      if (mn.hasTypeParameter()) {
        ty = new ParameterizedType(ty, type.fromName(mn.typeParameter, domain));
      }
      return type.cache.name[qn] = ty;
    }
  };

  type.prototype.applyType = function (parameter) {
    return new ParameterizedType(this, parameter);
  };

  type.prototype.toString = function () {
    return "[type]";
  };

  type.prototype.isNumeric = function () {
    return this === Type.Int || this === Type.Uint || this === Type.Number;
  };

  type.prototype.isString = function () {
    return this === Type.String;
  };

  type.prototype.isDirectlyReadable = function () {
    return this === Type.Array;
  };

  type.prototype.isIndexedReadable = function () {
    return this.isParameterizedType();
  };

  type.prototype.isDirectlyWriteable = function () {
    return this === Type.Array;
  };

  type.prototype.isIndexedWriteable = function () {
    return this.isParameterizedType();
  };

  type.prototype.isVector = function () {
    return this.isParameterizedType();
  };

  type.prototype.isNotDirectlyIndexable = function () {
    return this === Type.Any || this === Type.XML || this === Type.XMLList || this === Type.Dictionary;
  };

  type.prototype.isParameterizedType = function () {
    return this instanceof ParameterizedType;
  };

  type.prototype.instanceType = function () {
    return this;
  };

  type.prototype.getTrait = function () {
    return null;
  };

  type.prototype.super = function () {
    unexpected("Can't call super on " + this);
  };

  type.prototype.isSubtypeOf = function (other) {
    if (this === other || this.equals(other)) {
      return true;
    }
    return this.merge(other) === this;
  };

  var typesInitialized = false;
  type.initializeTypes = function (domain) {
    if (typesInitialized) {
      return;
    }
    type.Any = new AtomType("Any");
    type.Null = new AtomType("Null");
    type.Undefined = new AtomType("Undefined");
    type.Void = new AtomType("Void");
    type.Int = Type.fromSimpleName("int", domain).instanceType();
    type.Uint = Type.fromSimpleName("uint", domain).instanceType();
    type.Class = Type.fromSimpleName("Class", domain).instanceType();
    type.Array = Type.fromSimpleName("Array", domain).instanceType();
    type.Object = Type.fromSimpleName("Object", domain).instanceType();
    type.String = Type.fromSimpleName("String", domain).instanceType();
    type.Number = Type.fromSimpleName("Number", domain).instanceType();
    type.Boolean = Type.fromSimpleName("Boolean", domain).instanceType();
    type.Function = Type.fromSimpleName("Function", domain).instanceType();
    type.XML = Type.fromSimpleName("XML", domain).instanceType();
    type.XMLList = Type.fromSimpleName("XMLList", domain).instanceType();
    type.Dictionary = Type.fromSimpleName("flash.utils.Dictionary", domain).instanceType();
    typesInitialized = true;
  };
  return type;
})();

var AtomType = (function () {
  function atomType(name) {
    this.name = name
  }
  atomType.prototype = Object.create(Type.prototype);
  atomType.prototype.toString = function () {
    if (this === Type.Any) {
      return "?";
    } else if (this === Type.Undefined) {
      return "_";
    } else if (this === Type.Null) {
      return "X";
    } else if (this === Type.Void) {
      return "V";
    }
    unexpected();
  };

  atomType.prototype.merge = function merge(other) {
    if (other instanceof TraitsType) {
      return Type.Any;
    }

    if (this === other) {
      return this;
    }

    if (this === Type.Any || other === Type.Any) {
      return Type.Any;
    }

    return Type.Any;
  };
  return atomType;
})();

var MethodType = (function () {
  function methodType(methodInfo) {
    this.methodInfo = methodInfo;
  }
  methodType.prototype = Object.create(Type.prototype);
  methodType.prototype.toString = function () {
    return "MT " + this.methodInfo;
  };
  return methodType;
})();

var TraitsType = (function () {
  function traitsType(object, domain) {
    release || assert(object && object.traits);
    this.object = object;
    this.traits = object.traits;
    this.domain = domain;
    if (this.object instanceof InstanceInfo) {
      release || assert(this.domain);
    }
  }

  traitsType.prototype = Object.create(Type.prototype);

  function nameOf(x) {
    if (x instanceof ScriptInfo) {
      return "SI";
    } else if (x instanceof ClassInfo) {
      return "CI:" + x.instanceInfo.name.name;
    } else if (x instanceof InstanceInfo) {
      return "II:" + x.name.name;
    } else if (x instanceof MethodInfo) {
      return "MI";
    } else if (x instanceof Activation) {
      return "AC";
    }
    release || assert(false);
  }

  function findTraitBySlotId(traits, slotId) {
    for (var i = traits.length - 1; i >= 0; i--) {
      if (traits[i].slotId === slotId) {
        return traits[i];
      }
    }
    unexpected("Cannot find trait with slotId: " + slotId + " in " + traits);
  }

  function findTraitByName(traits, mn, isSetter) {
    var isGetter = !isSetter;
    var trait;
    if (!Multiname.isQName(mn)) {
      if (mn instanceof MultinameType) {
        return;
      }
      release || assert(mn instanceof Multiname);
      var dy;
      for (var i = 0, j = mn.namespaces.length; i < j; i++) {
        var qn = mn.getQName(i);
        if (mn.namespaces[i].isDynamic()) {
          dy = qn;
        } else {
          if ((trait = findTraitByName(traits, qn, isSetter))) {
            return trait;
          }
        }
      }
      if (dy) {
        return findTraitByName(traits, dy, isSetter);
      }
    } else {
      var qn = Multiname.getQualifiedName(mn);
      for (var i = 0, j = traits.length; i < j; i++) {
        trait = traits[i];
        if (Multiname.getQualifiedName(trait.name) === qn) {
          if (isSetter && trait.isGetter() || isGetter && trait.isSetter()) {
            continue;
          }
          return trait;
        }
      }
    }
  }

  traitsType.prototype.getTrait = function (mn, isSetter, followSuperType) {
    assert (arguments.length === 3);
    if (mn instanceof MultinameType) {
      return null;
    }
    if (mn.isAttribute()) {
      return null;
    }
    if (followSuperType && (this.isInstanceInfo() || this.isClassInfo())) {
      var that = this;
      do {
        var trait = that.getTrait(mn, isSetter, false);
        if (!trait) {
          that = that.super();
        }
      } while (!trait && that);
      return trait;
    } else {
      return findTraitByName(this.traits, mn, isSetter);
    }
  };

  traitsType.prototype.getTraitAt = function (i) {
    if (this.object instanceof ScriptInfo ||
      this.object instanceof MethodInfo) {
      return findTraitBySlotId(this.traits, i);
    }
  };

  traitsType.prototype.toString = function () {
    switch (this) {
      case Type.Int: return "I";
      case Type.Uint: return "U";
      case Type.Array: return "A";
      case Type.Object: return "O";
      case Type.String: return "S";
      case Type.Number: return "N";
      case Type.Boolean: return "B";
      case Type.Function: return "F";
    }
    return nameOf(this.object);
  };

  traitsType.prototype.instanceType = function () {
    release || assert(this.object instanceof ClassInfo);
    return this.instanceCache || (this.instanceCache = Type.from(this.object.instanceInfo, this.domain));
  };

  traitsType.prototype.classType = function () {
    release || assert(this.object instanceof InstanceInfo);
    return this.instanceCache || (this.instanceCache = Type.from(this.object.classInfo, this.domain));
  };

  traitsType.prototype.super = function () {
    if (this.object instanceof ClassInfo) {
      return Type.Class;
    }
    release || assert(this.object instanceof InstanceInfo);
    if (this.object.superName) {
      var result = Type.fromName(this.object.superName, this.domain).instanceType();
      release || assert(result instanceof TraitsType && result.object instanceof InstanceInfo);
      return result;
    }
    return null;
  };

  traitsType.prototype.isClassInfo = function () {
    return this.object instanceof ClassInfo;
  };

  traitsType.prototype.isInstanceInfo = function () {
    return this.object instanceof InstanceInfo;
  };

  traitsType.prototype.isInstanceOrClassInfo = function () {
    return this.isInstanceInfo() || this.isClassInfo();
  };

  traitsType.prototype.equals = function (other) {
    return this.traits === other.traits;
  };

  traitsType.prototype.merge = function (other) {
    if (other instanceof TraitsType) {
      if (this.equals(other)) {
        return this;
      }
      if (this.isNumeric() && other.isNumeric()) {
        return Type.Number;
      }
      if (this.isInstanceInfo() && other.isInstanceInfo()) {
        var path = [];
        for (var curr = this; curr; curr = curr.super()) {
          path.push(curr);
        }
        // print(">>>> " + path.map(function (x) { return x.object.name; }));
        for (var curr = other; curr; curr = curr.super()) {
          for (var i = 0; i < path.length; i++) {
            if (path[i].equals(curr)) {
              return curr;
            }
          }
        }
        return Type.Object;
      }
    }
    return Type.Any;
  };

  return traitsType;
})();

var MultinameType = (function () {
  function multinameType(namespaces, name, flags) {
    this.namespaces = namespaces;
    this.name = name;
    this.flags = flags;
  }
  multinameType.prototype = Object.create(Type.prototype);
  multinameType.prototype.toString = function () {
    return "MN";
  };
  return multinameType;
})();

var ParameterizedType = (function () {
  function parameterizedType(type, parameter) {
    this.type = type;
    this.parameter = parameter;
  }
  parameterizedType.prototype = Object.create(Type.prototype);
  parameterizedType.prototype.toString = function () {
    return this.type + "<" + this.parameter + ">";
  };
  parameterizedType.prototype.instanceType = function () {
    release || assert(this.type instanceof TraitsType);
    return new ParameterizedType(this.type.instanceType(), this.parameter.instanceType());
  };
  parameterizedType.prototype.equals = function (other) {
    if (other instanceof ParameterizedType) {
      return this.type.equals(other.type) && this.parameter.equals(other.parameter);
    }
    return false;
  };
  parameterizedType.prototype.merge = function (other) {
    if (other instanceof TraitsType) {
      if (this.equals(other)) {
        return this;
      }
    }
    return Type.Any;
  };
  return parameterizedType;
})();

/**
 * Type information attached to Bytecode instructions.
 *
 * isDirectlyReadable/Writeable: Assigned to get/setProperty whenever the name part of a multiname can be used as an index. This is
 * only possible for Arrays and Vectors whenever the index is provably numeric.
 */
var TypeInformation = (function () {
  function typeInformation () {

  }
  typeInformation.prototype.toString = function () {
    return toKeyValueArray(this).map(function (x) {
      return x[0] + ": " + x[1];
    }).join(" | ")
  };
  return typeInformation;
})();

var Verifier = (function() {
  function VerifierError(message) {
    this.name = "VerifierError";
    this.message = message || "";
  }

  /**
   * Abstract Program State
   */
  var State = (function() {
    var id = 0;
    function state() {
      this.id = id += 1;
      this.stack = [];
      this.scope = [];
      this.local = [];
    }
    state.prototype.clone = function clone() {
      var s = new State();
      s.originalId = this.id;
      s.stack = this.stack.slice(0);
      s.scope = this.scope.slice(0);
      s.local = this.local.slice(0);
      return s;
    };
    state.prototype.trace = function trace(writer) {
      writer.writeLn(this.toString());
    };
    state.prototype.toString = function () {
      return "<" + this.id + (this.originalId ? ":" + this.originalId : "") +
        ", L[" + this.local.join(", ") + "]" +
        ", S[" + this.stack.join(", ") + "]" +
        ", $[" + this.scope.join(", ") + "]>";
    };
    state.prototype.equals = function(other) {
      return arrayEquals(this.stack, other.stack) &&
             arrayEquals(this.scope, other.scope) &&
             arrayEquals(this.local, other.local);
    };
    function arrayEquals(a, b) {
      if(a.length != b.length) {
        return false;
      }
      for (var i = a.length - 1; i >= 0; i--) {
        if (!a[i].equals(b[i])) {
          return false;
        }
      }
      return true;
    }
    state.prototype.isSubset = function(other) {
      return arraySubset(this.stack, other.stack) &&
             arraySubset(this.scope, other.scope) &&
             arraySubset(this.local, other.local);
    };
    function arraySubset(a, b) {
      if(a.length != b.length) {
        return false;
      }
      for (var i = a.length - 1; i >= 0; i--) {
        if (a[i] === b[i] || a[i].equals(b[i])) {
          continue;
        }
        if (a[i].merge(b[i]) !== a[i]) {
          return false;
        }
      }
      return true;
    }
    state.prototype.merge = function(other) {
      mergeArrays(this.local, other.local);
      mergeArrays(this.stack, other.stack);
      mergeArrays(this.scope, other.scope);
    };
    function mergeArrays(a, b) {
      release || assert(a.length === b.length, "a: " + a + " b: " + b);
      for (var i = a.length - 1; i >= 0; i--) {
        release || assert((a[i] !== undefined) && (b[i] !== undefined));
        if (a[i] === b[i]) {
          continue;
        }
        a[i] = a[i].merge(b[i]);
      }
    }
    return state;
  })();

  var Verification = (function() {
    function verification(methodInfo, scope) {
      this.scope = scope;
      this.methodInfo = methodInfo;
      this.domain = methodInfo.abc.applicationDomain;
      this.writer = new IndentingWriter();
      this.returnType = Type.Undefined;
    }

    verification.prototype.verify = function verify() {
      var mi = this.methodInfo;
      var writer = verifierTraceLevel.value ? this.writer : null;
      var blocks = mi.analysis.blocks;

      blocks.forEach(function (x) {
        x.entryState = x.exitState = null;
      });

      if (writer) {
        this.methodInfo.trace(writer);
      }

      var entryState = new State();

      release || assert(mi.localCount >= mi.parameters.length + 1);

      this.thisType = mi.holder ? Type.from(mi.holder, this.domain) : Type.Any;

      entryState.local.push(this.thisType);

      // Initialize entry state with parameter types.
      for (var i = 0; i < mi.parameters.length; i++) {
        entryState.local.push(Type.fromName(mi.parameters[i].type, this.domain).instanceType());
      }

      var remainingLocals = mi.localCount - mi.parameters.length - 1;

      // Push the |rest| or |arguments| array type in the locals.
      if (mi.needsRest() || mi.needsArguments()) {
        entryState.local.push(Type.Array);
        remainingLocals -= 1;
      }

      // Initialize locals with Type.Atom.Undefined
      for (var i = 0; i < remainingLocals; i++) {
        entryState.local.push(Type.Undefined);
      }

      release || assert(entryState.local.length === mi.localCount);

      if (writer) {
        entryState.trace(writer);
      }

      /**
       * To avoid revisiting the same block more than necessary while iterating
       * to a fixed point, the blocks need to be processed in dominator order.
       * The same problem for tamarin is discussed here: https://bugzilla.mozilla.org/show_bug.cgi?id=661133
       *
       * The blocks in the mi.analysis.blocks are in the dominator order.
       * Iterate over the blocks array and assign an id (bdo = blockDominatorOrder)
       * that gives the dominator order for the que insert.
       */
      for (var bi = 0, len = blocks.length; bi < len; bi++) {
        blocks[bi].bdo = bi;
      }

      /**
       * Keep the blocks sorted in dominator order.
       * The SortedList structure is based on a linked list and uses a liniar search
       * to find the right insertion position and keep the list sorted.
       * The push operation takes O(n), the pull operations takes O(1).
       */
      var worklist = new SortedList(function compare(blockA, blockB) {
        return blockA.bdo - blockB.bdo;
      });

      blocks[0].entryState = entryState;
      worklist.push(blocks[0]);

      while (worklist.peek()) {

        var block = worklist.pop();
        var exitState = block.exitState = block.entryState.clone();

        this.verifyBlock(block, exitState);

        block.succs.forEach(function (successor) {
          if (worklist.contains(successor)) {
            if (writer) {
              writer.writeLn("Forward Merged Block: " + successor.bid + " " +
                exitState.toString() + " with " + successor.entryState.toString());
            }
            // merge existing item entry state with current block exit state
            successor.entryState.merge(exitState);
            if (writer) {
              writer.writeLn("Merged State: " + successor.entryState);
            }
            return;
          }

          if (successor.entryState) {
            if (!successor.entryState.isSubset(exitState)) {
              if (writer) {
                writer.writeLn("Backward Merged Block: " + block.bid + " with " + successor.bid + " " +
                               exitState.toString() + " with " + successor.entryState.toString());
              }
              successor.entryState.merge(exitState);
              worklist.push(successor);
              if (writer) {
                writer.writeLn("Merged State: " + successor.entryState);
              }
            }
            return;
          }

          successor.entryState = exitState.clone();
          worklist.push(successor);
          if (writer) {
            writer.writeLn("Added Block: " + successor.bid +
              " to worklist: " + successor.entryState.toString());
          }
        });
      }

      if (writer) {
        writer.writeLn("Inferred return type: " + this.returnType);
      }
      this.methodInfo.inferredReturnType = this.returnType;
    };

    verification.prototype.verifyBlock = function verifyBlock(block, state) {
      var savedScope = this.scope;

      var local = state.local;
      var stack = state.stack;
      var scope = state.scope;

      var writer = verifierTraceLevel.value ? this.writer : null;
      var bytecodes = this.methodInfo.analysis.bytecodes;

      var domain = this.methodInfo.abc.applicationDomain;
      var multinames = this.methodInfo.abc.constantPool.multinames;
      var mi = this.methodInfo;

      var bc, obj, fn, mn, l, r, val, type, returnType;

      if (writer) {
        writer.enter("verifyBlock: " + block.bid +
          ", range: [" + block.position + ", " + block.end.position +
          "], entryState: " + state.toString() + " {");
      }

      function construct(obj) {
        if (obj instanceof TraitsType || obj instanceof ParameterizedType) {
          if (obj === Type.Function || obj === Type.Class || obj === Type.Object) {
            return Type.Object;
          }
          return obj.instanceType();
        } else {
          return Type.Any;
        }
      }

      /**
       * Close over the current |bc| and |state|.
       */

      function ti() {
        return bc.ti || (bc.ti = new TypeInformation());
      }

      function push(x) {
        release || assert(x);
        ti().type = x;
        stack.push(x);
      }

      function pop() {
        return stack.pop();
      }

      function findProperty(mn, strict) {
        if (mn instanceof MultinameType) {
          return Type.Any;
        }
        
        /**
         * Try to find the property in the scope stack. For instance methods the scope
         * stack should already have the instance object.
         */
        for (var i = scope.length - 1; i >= 0; i--) {
          if (scope[i] instanceof TraitsType) {
            // TODO: Should we be looking for getter / setter traits?
            var trait = scope[i].getTrait(mn, false, true);
            if (trait) {
              ti().scopeDepth = scope.length - i - 1;
              return scope[i];
            }
          } else {
            return Type.Any;
          }
        }

        /**
         * If this is a static or instance method then look for the property in the
         * class object.
         */
        if (isClassOrInstanceInfo(mi.holder)) {
          var classType;
          if (mi.holder instanceof ClassInfo) {
            classType = Type.from(mi.holder, domain);
          } else if (mi.holder instanceof InstanceInfo) {
            classType = Type.from(mi.holder, domain).classType();
          }
          var trait = classType.getTrait(mn, false, true);
          if (trait) {
            if (!mi.isInstanceInitializer) {
              ti().object = LazyInitializer.create(classType.object);
            }
            return classType;
          }
        }

        /**
         * Try the saved scope.
         */
        if (savedScope && savedScope.object && mn instanceof Multiname) {
          var obj = savedScope.findScopeProperty(mn.namespaces, mn.name, mn.flags, domain, strict, true);
          if (obj) {
            var savedScopeDepth = savedScope.findDepth(obj);
            release || assert(savedScopeDepth >= 0);
            ti().scopeDepth = savedScopeDepth + scope.length;
            return Type.from(obj, domain);
          }
        }

        var resolved = domain.findDefiningScript(mn, false);
        if (resolved) {
          ti().object = LazyInitializer.create(resolved.script);
          return Type.from(resolved.script, domain);
        }
        return Type.Any;
      }

      function popMultiname() {
        var mn = multinames[bc.index];
        if (mn.isRuntime()) {
          var namespaces = mn.namespaces;
          var name = mn.name;
          if (mn.isRuntimeName()) {
            name = pop();
          }
          if (mn.isRuntimeNamespace()) {
            namespaces = [pop()];
          }
          return new MultinameType(namespaces, name, mn.flags);
        }
        return mn;
      }

      function accessSlot(obj) {
        if (obj instanceof TraitsType) {
          var trait = obj.getTraitAt(bc.index);
          writer && writer.debugLn("accessSlot() -> " + trait);
          if (trait) {
            ti().trait = trait;
            if (trait.isSlot()) {
              return Type.fromName(trait.typeName, domain).instanceType();
            } else if (trait.isClass()) {
              return Type.from(trait.classInfo, domain);
            }
          }
        }
        return Type.Any;
      }

      function isNumericMultiname(mn) {
        return mn instanceof Multiname && isNumeric(mn.name) ||
               mn instanceof MultinameType && (mn.name instanceof TraitsType &&
                 mn.name.isNumeric() || isNumeric(mn.name));
      }

      function getProperty(obj, mn) {
        if (obj instanceof TraitsType || obj instanceof ParameterizedType) {
          var trait = obj.getTrait(mn, false, true);
          writer && writer.debugLn("getProperty(" + mn + ") -> " + trait);
          if (trait) {
            ti().trait = trait;
            if (trait.isSlot() || trait.isConst()) {
              return Type.fromName(trait.typeName, domain).instanceType();
            } else if (trait.isGetter()) {
              return Type.fromName(trait.methodInfo.returnType, domain).instanceType();
            } else if (trait.isClass()) {
              return Type.from(trait.classInfo, domain);
            } else if (trait.isMethod()) {
              return Type.from(trait.methodInfo, domain);
            }
          } else if (obj.isDirectlyReadable() && mn instanceof Multiname) {
            ti().propertyQName = Multiname.getPublicQualifiedName(mn.name);
          } else if (obj === Type.Object && mn instanceof Multiname) {
            ti().propertyQName = Multiname.getPublicQualifiedName(mn.name);
          }
          if (isNumericMultiname(mn)) {
            if (obj.isIndexedReadable()) {
              ti().isIndexedReadable = true;
              if (obj.isVector()) {
                return obj.parameter;
              }
            } else if (obj.isDirectlyReadable()) {
              ti().isDirectlyReadable = true;
            }
          }
        }
        return Type.Any;
      }

      function setProperty(obj, mn, value) {
        if (obj instanceof TraitsType || obj instanceof ParameterizedType) {
          var trait = obj.getTrait(mn, true, true);
          writer && writer.debugLn("setProperty(" + mn + ") -> " + trait);
          if (trait) {
            ti().trait = trait;
          } else if (obj.isDirectlyWriteable() && mn instanceof Multiname) {
            ti().propertyQName = Multiname.getPublicQualifiedName(mn.name);
          }
          if (isNumericMultiname(mn)) {
            if (obj.isDirectlyWriteable()) {
              ti().isDirectlyWriteable = true;
            } else if (obj.isVector()) {
              ti().isIndexedWriteable = true;
            }
          }
        }
      }

      for (var bci = block.position, end = block.end.position; bci <= end; bci++) {
        bc = bytecodes[bci];
        var op = bc.op;

        if (writer && verifierTraceLevel.value > 1) {
          writer.writeLn(("stateBefore: " + state.toString()).padRight(' ', 100) + " : " + bci + ", " + bc.toString(mi.abc));
        }

        switch (op) {
          case 0x01: // OP_bkpt
            // Nop.
            break;
          case 0x03: // OP_throw
            pop();
            break;
          case 0x04: // OP_getsuper
            mn = popMultiname();
            obj = pop();
            release || assert(obj.super());
            ti().baseClass = LazyInitializer.create(this.thisType.super().classType().object);
            push(getProperty(obj.super(), mn));
            break;
          case 0x05: // OP_setsuper
            val = pop();
            mn = popMultiname();
            obj = pop();
            release || assert(obj.super());
            ti().baseClass = LazyInitializer.create(this.thisType.super().classType().object);
            setProperty(obj.super(), mn, val);
            break;
          case 0x06: // OP_dxns
            notImplemented(bc);
            break;
          case 0x07: // OP_dxnslate
            notImplemented(bc);
            break;
          case 0x08: // OP_kill
            state.local[bc.index] = Type.Undefined;
            break;
          case 0x0A: // OP_lf32x4
            notImplemented(bc);
            break;
          case 0x0B: // OP_sf32x4
            notImplemented(bc);
            break;
          case 0x0C: // OP_ifnlt
          case 0x18: // OP_ifge
          case 0x0D: // OP_ifnle
          case 0x17: // OP_ifgt
          case 0x0E: // OP_ifngt
          case 0x16: // OP_ifle
          case 0x0F: // OP_ifnge
          case 0x15: // OP_iflt
          case 0x13: // OP_ifeq
          case 0x14: // OP_ifne
          case 0x19: // OP_ifstricteq
          case 0x1A: // OP_ifstrictne
            pop();
            pop();
            break;
          case 0x10: // OP_jump
            // Nop.
            break;
          case 0x11: // OP_iftrue
          case 0x12: // OP_iffalse
            pop();
            break;
          case 0x1B: // OP_lookupswitch
            pop(Type.Int);
            break;
          case 0x1D: // OP_popscope
            scope.pop();
            break;
          case 0x1E: // OP_nextname
          case 0x23: // OP_nextvalue
            pop(Type.Int);
            pop();
            push(Type.Any);
            break;
          case 0x1F: // OP_hasnext
            push(Type.Boolean);
            break;
          case 0x32: // OP_hasnext2
            push(Type.Boolean);
            break;
          case 0x20: // OP_pushnull
            push(Type.Null);
            break;
          case 0x21: // OP_pushundefined
            push(Type.Undefined);
            break;
          case 0x22: // OP_pushfloat
            notImplemented(bc);
            break;
          case 0x24: // OP_pushbyte
            push(Type.Int);
            break;
          case 0x25: // OP_pushshort
            push(Type.Int);
            break;
          case 0x2C: // OP_pushstring
            push(Type.String);
            break;
          case 0x2D: // OP_pushint
            push(Type.Int);
            break;
          case 0x2E: // OP_pushuint
            push(Type.Uint);
            break;
          case 0x2F: // OP_pushdouble
            push(Type.Number);
            break;
          case 0x26: // OP_pushtrue
            push(Type.Boolean);
            break;
          case 0x27: // OP_pushfalse
            push(Type.Boolean);
            break;
          case 0x28: // OP_pushnan
            push(Type.Number);
            break;
          case 0x29: // OP_pop
            pop();
            break;
          case 0x2A: // OP_dup
            val = pop();
            push(val);
            push(val);
            break;
          case 0x2B: // OP_swap
            l = pop();
            r = pop();
            push(l);
            push(r);
            break;
          case 0x1C: // OP_pushwith
            // TODO: We need to keep track that this is a with scope and thus it can have dynamic properties
            // attached to it. For now, push |Type.Any|.
            pop();
            scope.push(Type.Any);
            break;
          case 0x30: // OP_pushscope
            scope.push(pop());
            break;
          case 0x31: // OP_pushnamespace
            notImplemented(bc);
            break;
          case 0x35: // OP_li8
          case 0x36: // OP_li16
          case 0x37: // OP_li32
            push(Type.Int);
            break;
          case 0x38: // OP_lf32
          case 0x39: // OP_lf64
            push(Type.Number);
            break;
          case 0x3A: // OP_si8
          case 0x3B: // OP_si16
          case 0x3C: // OP_si32
            pop(Type.Int);
            break;
          case 0x3D: // OP_sf32
          case 0x3E: // OP_sf64
            pop(Type.Number);
            break;
          case 0x40: // OP_newfunction
            push(Type.Function);
            break;
          case 0x41: // OP_call
            stack.popMany(bc.argCount);
            obj = pop();
            fn = pop();
            push(Type.Any);
            break;
          case 0x43: // OP_callmethod
            // callmethod is always invalid
            // http://hg.mozilla.org/tamarin-redux/file/eb8f916bb232/core/Verifier.cpp#l1846
            throw new VerifierError("callmethod");
          case 0x44: // OP_callstatic
            notImplemented(bc);
            break;
          case 0x45: // OP_callsuper
          case 0x4E: // OP_callsupervoid
          case 0x4F: // OP_callpropvoid
          case 0x46: // OP_callproperty
          case 0x4C: // OP_callproplex
            stack.popMany(bc.argCount);
            mn = popMultiname();
            obj = pop();
            if (op === OP_callsuper || op === OP_callsupervoid) {
              obj = this.thisType.super();
              ti().baseClass = LazyInitializer.create(this.thisType.super().classType().object);
            }
            type = getProperty(obj, mn);
            if (op === OP_callpropvoid || op === OP_callsupervoid) {
              break;
            }
            if (type instanceof MethodType) {
              returnType = Type.fromName(type.methodInfo.returnType, domain).instanceType();
            } else if (type instanceof TraitsType && type.isClassInfo()) {
              returnType = type.instanceType();
            } else {
              returnType = Type.Any;
            }
            push(returnType);
            break;
          case 0x47: // OP_returnvoid
            this.returnType.merge(Type.Undefined);
            break;
          case 0x48: // OP_returnvalue
            type = pop();
            if (mi.returnType) {
              var coerceType = Type.fromName(mi.returnType, this.domain).instanceType();
              if (coerceType.isSubtypeOf(type)) {
                ti().noCoercionNeeded = true;
              }
            }
            break;
          case 0x49: // OP_constructsuper
            stack.popMany(bc.argCount);
            stack.pop();
            if (this.thisType.isInstanceInfo() && this.thisType.super() === Type.Object) {
              ti().noCallSuperNeeded = true;
            }
            break;
          case 0x42: // OP_construct
            stack.popMany(bc.argCount);
            push(construct(pop()));
            break;
          case 0x4A: // OP_constructprop
            stack.popMany(bc.argCount);
            mn = popMultiname();
            push(construct(getProperty(stack.pop(), mn)));
            break;
          case 0x4B: // OP_callsuperid
            notImplemented(bc);
            break;
          case 0x4D: // OP_callinterface
            notImplemented(bc);
            break;
          case 0x50: // OP_sxi1
          case 0x51: // OP_sxi8
          case 0x52: // OP_sxi16
            // Sign extend, nop.
            break;
          case 0x53: // OP_applytype
            release || assert(bc.argCount === 1);
            val = pop();
            obj = pop();
            push(obj.applyType(val));
            break;
          case 0x54: // OP_pushfloat4
            notImplemented(bc);
            break;
          case 0x55: // OP_newobject
            stack.popMany(bc.argCount * 2);
            push(Type.Object);
            break;
          case 0x56: // OP_newarray
            // Pops values, pushes result.
            stack.popMany(bc.argCount);
            push(Type.Array);
            break;
          case 0x57: // OP_newactivation
            // push(Type.fromReference(new Activation(this.methodInfo)));
            push(Type.from(new Activation(this.methodInfo)));
            break;
          case 0x58: // OP_newclass
            // The newclass bytecode is not supported because it needs
            // the base class which might not always be available.
            // The functions initializing classes should not be performance
            // critical anyway.
            // throw new VerifierError("Not Supported");
            push(Type.Any);
            break;
          case 0x59: // OP_getdescendants
            push(Type.XMLList);
            break;
          case 0x5A: // OP_newcatch
            push(Type.Any);
            break;
          case 0x5D: // OP_findpropstrict
            push(findProperty(popMultiname(), true));
            break;
          case 0x5E: // OP_findproperty
            push(findProperty(popMultiname(), false));
            break;
          case 0x5F: // OP_finddef
            notImplemented(bc);
            break;
          case 0x60: // OP_getlex
            mn = popMultiname();
            push(getProperty(findProperty(mn, true), mn));
            break;
          case 0x68: // OP_initproperty
          case 0x61: // OP_setproperty
            val = pop();
            mn = popMultiname();
            obj = pop();
            setProperty(obj, mn, val, bc);
            break;
          case 0x62: // OP_getlocal
            push(local[bc.index]);
            break;
          case 0x63: // OP_setlocal
            local[bc.index] = pop();
            break;
          case 0x64: // OP_getglobalscope
            push(Type.from(savedScope.global.object));
            break;
          case 0x65: // OP_getscopeobject
            push(scope[bc.index]);
            break;
          case 0x66: // OP_getproperty
            mn = popMultiname();
            obj = pop();
            push(getProperty(obj, mn));
            break;
          case 0x67: // OP_getouterscope
            notImplemented(bc);
            break;
          case 0x69: // OP_setpropertylate
            notImplemented(bc);
            break;
          case 0x6A: // OP_deleteproperty
            popMultiname();
            pop();
            push(Type.Boolean);
            break;
          case 0x6B: // OP_deletepropertylate
            notImplemented(bc);
            break;
          case 0x6C: // OP_getslot
            push(accessSlot(pop()));
            break;
          case 0x6D: // OP_setslot
            val = pop();
            obj = pop();
            accessSlot(obj);
            break;
          case 0x6E: // OP_getglobalslot
            notImplemented(bc);
            break;
          case 0x6F: // OP_setglobalslot
            notImplemented(bc);
            break;
          case 0x70: // OP_convert_s
            pop();
            push(Type.String);
            break;
          case 0x71: // OP_esc_xelem
            pop();
            push(Type.String);
            break;
          case 0x72: // OP_esc_xattr
            pop();
            push(Type.String);
            break;
          case 0x83: // OP_coerce_i
          case 0x73: // OP_convert_i
            pop();
            push(Type.Int);
            break;
          case 0x88: // OP_coerce_u
          case 0x74: // OP_convert_u
            pop();
            push(Type.Uint);
            break;
          case 0x84: // OP_coerce_d
          case 0x75: // OP_convert_d
            pop();
            push(Type.Number);
            break;
          case 0x81: // OP_coerce_b
          case 0x76: // OP_convert_b
            pop();
            push(Type.Boolean);
            break;
          case 0x77: // OP_convert_o
            notImplemented(bc);
            break;
          case 0x78: // OP_checkfilter
            // nop.
            break;
          case 0x79: // OP_convert_f
            pop();
            push(Type.Number);
            break;
          case 0x7a: // OP_unplus
            notImplemented(bc);
            break;
          case 0x7b: // OP_convert_f4
            notImplemented(bc);
            break;
          case 0x80: // OP_coerce
            // print("<<< " + multinames[bc.index] + " >>>");
            type = pop();
            var coerceType = Type.fromName(multinames[bc.index], this.domain).instanceType();
            if (coerceType.isSubtypeOf(type)) {
              ti().noCoercionNeeded = true;
            }
            push(coerceType);
            break;
          case 0x82: // OP_coerce_a
            // pop(); push(Type.Any);
            break;
          case 0x85: // OP_coerce_s
            pop();
            push(Type.String);
            break;
          case 0x86: // OP_astype
            notImplemented(bc);
            break;
          case 0x87: // OP_astypelate
            type = pop();
            pop();
            if (type instanceof TraitsType) {
              push(type.instanceType());
            } else {
              push(Type.Any);
            }
            break;
          case 0x89: // OP_coerce_o
            notImplemented(bc);
            break;
          case 0x90: // OP_negate
          case 0x91: // OP_increment
          case 0x93: // OP_decrement
            pop();
            push(Type.Number);
            break;
          case 0x92: // OP_inclocal
          case 0x94: // OP_declocal
            local[bc.index] = Type.Number;
            break;
          case 0x95: // OP_typeof
            pop();
            push(Type.String);
            break;
          case 0x96: // OP_not
            pop();
            push(Type.Boolean);
            break;
          case 0xA0: // OP_add
            r = pop();
            l = pop();
            if (l.isNumeric() && r.isNumeric()) {
              push(Type.Number);
            } else if (l === Type.String || r === Type.String) {
              push(Type.String);
            } else {
              push(Type.Any);
            }
            break;
          case 0xA1: // OP_subtract
          case 0xA2: // OP_multiply
          case 0xA3: // OP_divide
          case 0xA4: // OP_modulo
            pop();
            pop();
            push(Type.Number);
            break;
          case 0xA8: // OP_bitand
          case 0xA9: // OP_bitor
          case 0xAA: // OP_bitxor
          case 0xA5: // OP_lshift
          case 0xA6: // OP_rshift
          case 0xA7: // OP_urshift
            pop();
            pop();
            push(Type.Int);
            break;
          case 0x97: // OP_bitnot
            pop();
            push(Type.Int);
            break;
          case 0xAB: // OP_equals
          case 0xAC: // OP_strictequals
          case 0xAD: // OP_lessthan
          case 0xAE: // OP_lessequals
          case 0xAF: // OP_greaterthan
          case 0xB0: // OP_greaterequals
          case 0xB1: // OP_instanceof
          case 0xB4: // OP_in
            pop();
            pop();
            push(Type.Boolean);
            break;
          case 0xB2: // OP_istype
            pop();
            push(Type.Boolean);
            break;
          case 0xB3: // OP_istypelate
            pop();
            pop();
            push(Type.Boolean);
            break;
          case 0xC2: // OP_inclocal_i
          case 0xC3: // OP_declocal_i
            local[bc.index] = Type.Int;
            break;
          case 0xC1: // OP_decrement_i
          case 0xC0: // OP_increment_i
          case 0xC4: // OP_negate_i
            pop();
            push(Type.Int);
            break;
          case 0xC5: // OP_add_i
          case 0xC6: // OP_subtract_i
          case 0xC7: // OP_multiply_i
            pop();
            pop();
            push(Type.Int); // or Number?
            break;
          case 0xD0: // OP_getlocal0
          case 0xD1: // OP_getlocal1
          case 0xD2: // OP_getlocal2
          case 0xD3: // OP_getlocal3
            push(local[op - OP_getlocal0]);
            break;
          case 0xD4: // OP_setlocal0
          case 0xD5: // OP_setlocal1
          case 0xD6: // OP_setlocal2
          case 0xD7: // OP_setlocal3
            local[op - OP_setlocal0] = pop();
            break;
          case 0xEF: // OP_debug
            // Nop.
            break;
          case 0xF0: // OP_debugline
            // Nop.
            break;
          case 0xF1: // OP_debugfile
            // Nop.
            break;
          case 0xF2: // OP_bkptline
            // Nop.
            break;
          case 0xF3: // OP_timestamp
            // Nop.
            break;
          default:
            console.info("Not Implemented: " + bc);
        }

        if (writer) {
          if (bc.ti) {
            writer.debugLn("> TI: " + bc.ti);
          }
        }
      }
      if (writer) {
        writer.leave("}");
        writer.writeLn("verifiedBlock: " + block.bid +
          ", range: [" + block.position + ", " + block.end.position +
          "], exitState: " + state.toString());
      }
    };

    return verification;
  })();

  function verifier() {
    this.writer = new IndentingWriter();
  }

  verifier.prototype.verifyMethod = function(methodInfo, scope) {
    // release || assert(scope.object, "Verifier needs a scope object.");
    try {
      new Verification(methodInfo, scope).verify();
      methodInfo.verified = true;
      Counter.count("Verifier: Methods");
    } catch (e) {
      if (e instanceof VerifierError) {
        return;
      }
      throw e;
    }
  };

  return verifier;
})();
