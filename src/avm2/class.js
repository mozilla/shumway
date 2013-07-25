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

var traitsWriter = null;  // new IndentingWriter();

var Binding = (function () {
  function binding(trait) {
    release || assert (trait instanceof Trait);
    this.trait = trait;
  }

  /**
   * Returns a name that uniquely identifies a trait. We can't use the trait's QName directly
   * because getters and setters share the same name, so we prefix the QName with "set " or
   * "get ".
   */
  var SET_PREFIX = "set ";
  var GET_PREFIX = "get ";

  binding.KEY_PREFIX_LENGTH = SET_PREFIX.length;
  binding.getKey = function getKey(qn, trait) {
    var key = qn;
    if (trait.isGetter()) {
      key = GET_PREFIX + qn;
    } else if (trait.isSetter()) {
      key = SET_PREFIX + qn;
    }
    return key;
  };

  binding.prototype.toString = function toString() {
    return String(this.trait);
  };
  return binding;
})();

/**
 * Abstraction over a collection of traits.
 */
var Bindings = (function () {

  function bindings() {
    this.map = createEmptyObject();
    this.slots = [];
    this.nextSlotId = 1;
  }

  /**
   * Assigns the next available slot to the specified trait. Traits that have a non-zero slotId
   * are allocated by ASC and we can't relocate them elsewhere.
   */
  bindings.prototype.assignNextSlot = function assignNextSlot(trait) {
    release || assert (trait instanceof Trait);
    release || assert (trait.isSlot() || trait.isConst() || trait.isClass());
    if (!trait.slotId) {
      trait.slotId = this.nextSlotId ++;
    } else {
      this.nextSlotId = trait.slotId + 1;
    }
    release || assert (!this.slots[trait.slotId], "Trait slot already taken.");
    this.slots[trait.slotId] = trait;
  };

  bindings.prototype.trace = function trace(writer) {
    writer.enter("Bindings");
    for (var key in this.map) {
      var binding = this.map[key];
      writer.writeLn(binding.trait.kindName() + ": " + key + " -> " + binding);
    }
    writer.leaveAndEnter("Slots");
    writer.writeArray(this.slots);
    writer.outdent();
  };

  function SlotInfo(name, isConst, type, trait) {
    this.name = name;
    this.isConst = isConst;
    this.type = type;
    this.trait = trait;
  }

  function patch(patchTargets, value) {
    release || assert (isFunction(value));
    for (var i = 0; i < patchTargets.length; i++) {
      var patchTarget = patchTargets[i];
      if (traceExecution.value >= 3) {
        var str = "Patching: ";
        if (patchTarget.name) {
          str += patchTarget.name;
        } else if (patchTarget.get) {
          str += "get " + patchTarget.get;
        } else if (patchTarget.set) {
          str += "set " + patchTarget.set;
        }
        traitsWriter && traitsWriter.redLn(str);
      }
      if (patchTarget.get) {
        defineNonEnumerableGetterOrSetter(patchTarget.object, patchTarget.get, value, true);
      } else if (patchTarget.set) {
        defineNonEnumerableGetterOrSetter(patchTarget.object, patchTarget.set, value, false);
      } else {
        defineNonEnumerableProperty(patchTarget.object, patchTarget.name, value);
      }
    }
  }

  /**
   * Applies a method trait that doesn't need a memoizer.
   */
  function applyNonMemoizedMethodTrait(qn, trait, object, scope, natives) {
    release || assert (scope);
    if (trait.isMethod()) {
      var trampoline = makeTrampoline(function (self) {
        var fn = getTraitFunction(trait, scope, natives);
        patch(self.patchTargets, fn);
        return fn;
      }, trait.methodInfo.parameters.length);
      trampoline.patchTargets = [
        { object: object, name: qn },
        { object: object, name: VM_OPEN_METHOD_PREFIX + qn }
      ];
      var closure = bindSafely(trampoline, object);
      defineReadOnlyProperty(closure, VM_LENGTH, trampoline[VM_LENGTH]);
      defineReadOnlyProperty(closure, Multiname.getPublicQualifiedName("prototype"), null);
      defineNonEnumerableProperty(object, qn, closure);
      defineNonEnumerableProperty(object, VM_OPEN_METHOD_PREFIX + qn, closure);
    } else if (trait.isGetter() || trait.isSetter()) {
      var trampoline = makeTrampoline(function (self) {
        var fn = getTraitFunction(trait, scope, natives);
        patch(self.patchTargets, fn);
        return fn;
      });
      if (trait.isGetter()) {
        trampoline.patchTargets = [{ object: object, get: qn }];
      } else {
        trampoline.patchTargets = [{ object: object, set: qn }];
      }
      defineNonEnumerableGetterOrSetter(object, qn, trampoline, trait.isGetter());
    } else {
      unexpected(trait);
    }
  }

  function applyMemoizedMethodTrait(qn, trait, object, scope, natives) {
    release || assert (scope, trait);
    if (trait.isMethod()) {
      // Patch the target of the memoizer using a temporary |target| object that is visible to both the trampoline
      // and the memoizer. The trampoline closes over it and patches the target value while the memoizer uses the
      // target value for subsequent memoizations.
      var memoizerTarget = { value: null };
      var trampoline = makeTrampoline(function (self) {
        var fn = getTraitFunction(trait, scope, natives);
        patch(self.patchTargets, fn);
        return fn;
      }, trait.methodInfo.parameters.length);

      memoizerTarget.value = trampoline;
      var openMethods = object[VM_OPEN_METHODS];
      openMethods[qn] = trampoline;
      defineNonEnumerableProperty(object, VM_OPEN_METHOD_PREFIX + qn, trampoline);

      // TODO: We make the |memoizeMethodClosure| configurable since it may be
      // overridden by a derived class. Only do this non final classes.

      defineNonEnumerableGetter(object, qn, makeMemoizer(qn, memoizerTarget));

      trampoline.patchTargets = [
        { object: memoizerTarget, name: "value"},
        { object: openMethods,    name: qn },
        { object: object,         name: VM_OPEN_METHOD_PREFIX + qn }
      ];
    } else if (trait.isGetter() || trait.isSetter()) {
      var trampoline = makeTrampoline(function (self) {
        var fn = getTraitFunction(trait, scope, natives);
        patch(self.patchTargets, fn);
        return fn;
      });
      if (trait.isGetter()) {
        trampoline.patchTargets = [{ object: object, get: qn }];
      } else {
        trampoline.patchTargets = [{ object: object, set: qn }];
      }
      defineNonEnumerableGetterOrSetter(object, qn, trampoline, trait.isGetter());
    }
  }

  /**
   * Applies traits to a traitsPrototype object. Every traitsPrototype object must have the following layout:
   *
   * VM_BINDINGS = [ Array of Binding QNames ]
   * VM_SLOTS = [ Array of Slot Names ]
   *
   */
  bindings.prototype.applyTo = function applyTo(domain, object) {
    release || assert (!hasOwnProperty(object, VM_SLOTS));
    release || assert (!hasOwnProperty(object, VM_BINDINGS));
    release || assert (!hasOwnProperty(object, VM_OPEN_METHODS));

    defineNonEnumerableProperty(object, VM_SLOTS, []);
    defineNonEnumerableProperty(object, VM_BINDINGS, []);
    defineNonEnumerableProperty(object, VM_OPEN_METHODS, createEmptyObject());

    defineNonEnumerableProperty(object, "bindings", this);
    defineNonEnumerableProperty(object, "resolutionMap", []);

    traitsWriter && traitsWriter.greenLn("Applying Traits");

    for (var key in this.map) {
      var binding = this.map[key];
      var trait = binding.trait;
      var qn = Multiname.getQualifiedName(trait.name);
      if (trait.isSlot() || trait.isConst() || trait.isClass()) {
        var defaultValue = undefined;
        if (trait.isSlot() || trait.isConst()) {
          if (trait.hasDefaultValue) {
            defaultValue = trait.value;
          } else if (trait.typeName) {
            defaultValue = domain.findClassInfo(trait.typeName).defaultValue;
          }
        }
        if (key !== qn) {
          traitsWriter && traitsWriter.yellowLn("Binding Trait: " + key + " -> " + qn);
          defineNonEnumerableGetter(object, key, makeForwardingGetter(qn));
          object[VM_BINDINGS].pushUnique(key);
        } else {
          traitsWriter && traitsWriter.greenLn("Applying Trait " + trait.kindName() + ": " + trait);
          defineNonEnumerableProperty(object, qn, defaultValue);
          object[VM_BINDINGS].pushUnique(qn);
          object[VM_SLOTS][trait.slotId] = new SlotInfo(
            qn,
            trait.isConst(),
            trait.typeName ? domain.getProperty(trait.typeName, false, false) : null,
            trait
          );
        }
      } else if (trait.isMethod() || trait.isGetter() || trait.isSetter()) {
        if (trait.isGetter() || trait.isSetter()) {
          key = key.substring(Binding.KEY_PREFIX_LENGTH);
        }
        if (key !== qn) {
          traitsWriter && traitsWriter.yellowLn("Binding Trait: " + key + " -> " + qn);
        } else {
          traitsWriter && traitsWriter.greenLn("Applying Trait " + trait.kindName() + ": " + trait);
        }
        object[VM_BINDINGS].pushUnique(key);
        if (this instanceof ScriptBindings) {
          applyNonMemoizedMethodTrait(key, trait, object, binding.scope, binding.natives);
        } else {
          applyMemoizedMethodTrait(key, trait, object, binding.scope, binding.natives);
        }
      }
    }
  };

  return bindings;
})();


var ActivationBindings = (function () {
  function activationBindings(methodInfo) {
    Bindings.call(this);
    release || assert (methodInfo.needsActivation());
    this.methodInfo = methodInfo;
    // ASC creates activation even if the method has no traits, weird.
    // assert (methodInfo.traits.length);

    /**
     * Add activation traits.
     */
    var traits = methodInfo.traits;
    for (var i = 0; i < traits.length; i++) {
      var trait = traits[i];
      release || assert (trait.isSlot(), "Only slot traits are allowed in activation objects.");
      var key = Multiname.getQualifiedName(trait.name);
      this.map[key] = new Binding(trait);
      this.assignNextSlot(trait);
    }
  }
  activationBindings.prototype = Object.create(Bindings.prototype);
  return activationBindings;
})();

var CatchBindings = (function () {
  function catchBindings(scope, trait) {
    Bindings.call(this);

    /**
     * Add catch traits.
     */
    var key = Multiname.getQualifiedName(trait.name);
    this.map[key] = new Binding(trait);
    release || assert (trait.isSlot(), "Only slot traits are allowed in catch objects.");
    this.assignNextSlot(trait);
  }
  catchBindings.prototype = Object.create(Bindings.prototype);
  return catchBindings;
})();

var ScriptBindings = (function () {
  function scriptBindings(scriptInfo, scope) {
    Bindings.call(this);
    this.scope = scope;
    this.scriptInfo = scriptInfo;

    /**
     * Add script traits.
     */
    var traits = scriptInfo.traits;
    for (var i = 0; i < traits.length; i++) {
      var trait = traits[i];
      var name = Multiname.getQualifiedName(trait.name);
      var key = Binding.getKey(name, trait);
      var binding = this.map[key] = new Binding(trait);
      if (trait.isSlot() || trait.isConst() || trait.isClass()) {
        this.assignNextSlot(trait);
      }
      if (trait.isClass()) {
        if (trait.metadata && trait.metadata.native) {
          trait.classInfo.native = trait.metadata.native;
        }
      }
      if (trait.isMethod() || trait.isGetter() || trait.isSetter()) {
        binding.scope = this.scope;
      }
    }
  }
  scriptBindings.prototype = Object.create(Bindings.prototype);
  return scriptBindings;
})();

var ClassBindings = (function () {
  function classBindings(classInfo, scope, natives) {
    Bindings.call(this);
    this.scope = scope;
    this.natives = natives;
    this.classInfo = classInfo;

    /**
     * Add class traits.
     */
    var traits = classInfo.traits;
    for (var i = 0; i < traits.length; i++) {
      var trait = traits[i];
      var name = Multiname.getQualifiedName(trait.name);
      var key = Binding.getKey(name, trait);
      var binding = this.map[key] = new Binding(trait);
      if (trait.isSlot() || trait.isConst()) {
        this.assignNextSlot(trait);
      }
      if (trait.isMethod() || trait.isGetter() || trait.isSetter()) {
        binding.scope = this.scope;
        binding.natives = this.natives;
      }
    }
  }
  classBindings.prototype = Object.create(Bindings.prototype);
  return classBindings;
})();

var InstanceBindings = (function () {
  function instanceBindings(parent, instanceInfo, scope, natives) {
    Bindings.call(this);
    this.scope = scope;
    this.natives = natives;
    this.parent = parent;
    this.instanceInfo = instanceInfo;
    this.implementedInterfaces = parent ? cloneObject(parent.implementedInterfaces) : createEmptyObject();
    if (parent) {
      this.slots = parent.slots.slice();
      this.nextSlotId = parent.nextSlotId;
    }
    extend.call(this, parent);
  }

  /*
   * Extend base Instance Bindings
   *
   * Protected Members:
   *
   *   In AS3, if you have the following code:
   *
   *   class A {
   *     protected foo() { ... } // this is actually protected$A$foo
   *   }
   *
   *   class B extends A {
   *     function bar() {
   *       foo(); // this looks for protected$B$foo, not protected$A$foo
   *     }
   *   }
   *
   *   You would expect the call to |foo| in the |bar| function to have the protected A
   *   namespace open, but it doesn't. So we must create a binding in B's instance
   *   prototype from protected$B$foo -> protected$A$foo.
   *
   *   If we override foo:
   *
   *   class C extends B {
   *     protected override foo() { ... } this is protected$C$foo
   *   }
   *
   *   Then we need a binding from protected$A$foo -> protected$C$foo, and
   *   protected$B$foo -> protected$C$foo.
   *
   * Interfaces:
   *
   *   interface IA {
   *     function foo();
   *   }
   *
   *   interface IB implements IA {
   *     function bar();
   *   }
   *
   *   class C implements IB {
   *     function foo() { ... }
   *     function bar() { ... }
   *   }
   *
   *   var a:IA = new C();
   *   a.foo(); // Call Property: IA::foo
   *
   *   var b:IB = new C();
   *   b.foo(); // Call Property: IB::foo
   *   b.bar(); // Call Property: IB::bar
   *
   *   So, class C must have bindings for:
   *
   *   IA$$foo -> public$$foo
   *   IB$$foo -> public$$foo
   *   IB$$bar -> public$$bar
   */
  function extend(parent) {
    var ii = this.instanceInfo, ib;
    var map = this.map;
    var name, key, trait, binding, protectedName, protectedKey;

    /**
     * Inherit parent traits.
     */
    if (parent) {
      for (key in parent.map) {
        binding = parent.map[key];
        trait = binding.trait;
        map[key] = binding;
        if (trait.isProtected()) {
          // Inherit protected trait also in the local protected namespace.
          protectedName = Multiname.getQualifiedName(new Multiname([ii.protectedNs], trait.name.getName()));
          protectedKey = Binding.getKey(protectedName, trait);
          map[protectedKey] = binding;
        }
      }
    }

    function writeOrOverwriteBinding(object, key, binding) {
      var trait = binding.trait;
      var oldBinding = object[key];
      if (oldBinding) {
        var oldTrait = oldBinding.trait;
        release || assert (!oldTrait.isFinal(), "Cannot redefine a final trait: ", trait);
        // TODO: Object.as has a trait named length, we need to remove this since
        // it doesn't appear in Tamarin.
        release || assert (trait.isOverride() || trait.name.getName() === "length",
          "Overriding a trait that is not marked for override: ", trait);
      } else {
        release || assert (!trait.isOverride(), "Trait marked override must override another trait: ", trait);
      }
      object[key] = binding;
    }

    function overwriteProtectedBinding(object, key, binding) {
      if (key in object) {
        object[key] = binding;
      }
    }

    /**
     * Add instance traits.
     */
    var traits = ii.traits;
    for (var i = 0; i < traits.length; i++) {
      trait = traits[i];
      name = Multiname.getQualifiedName(trait.name);
      key = Binding.getKey(name, trait);
      binding = new Binding(trait);
      writeOrOverwriteBinding(map, key, binding);
      if (trait.isProtected()) {
        // Overwrite protected traits.
        ib = this.parent;
        while (ib) {
          protectedName = Multiname.getQualifiedName(new Multiname([ib.instanceInfo.protectedNs], trait.name.getName()));
          protectedKey = Binding.getKey(protectedName, trait);
          overwriteProtectedBinding(map, protectedKey, binding);
          ib = ib.parent;
        }
      }
      if (trait.isSlot() || trait.isConst()) {
        this.assignNextSlot(trait);
      }
      if (trait.isMethod() || trait.isGetter() || trait.isSetter()) {
        binding.scope = this.scope;
        binding.natives = this.natives;
      }
    }

    /**
     * Add interface traits.
     */
    var domain = ii.abc.domain;
    var interfaces = ii.interfaces;

    // Collect all implemented interfaces.
    for (var i = 0; i < interfaces.length; i++) {
      var interface = domain.getProperty(interfaces[i], true, true);
      copyProperties(this.implementedInterfaces, interface.interfaceBindings.implementedInterfaces);
      this.implementedInterfaces[Multiname.getQualifiedName(interface.name)] = interface;
    }

    // Apply all interface bindings.
    for (var interfaceName in this.implementedInterfaces) {
      var interface = this.implementedInterfaces[interfaceName];
      ib = interface.interfaceBindings;
      for (var interfaceKey in ib.map) {
        var interfaceBinding = ib.map[interfaceKey];
        if (ii.isInterface()) {
          map[interfaceKey] = interfaceBinding;
        } else {
          name = Multiname.getPublicQualifiedName(interfaceBinding.trait.name.getName());
          key = Binding.getKey(name, interfaceBinding.trait);
          map[interfaceKey] = map[key];
        }
      }
    }
  }
  instanceBindings.prototype = Object.create(Bindings.prototype);
  instanceBindings.prototype.toString = function toString() {
    return this.instanceInfo.toString();
  };
  return instanceBindings;
})();

var Interface = (function () {
  function Interface(classInfo) {
    var ii = classInfo.instanceInfo;
    release || assert(ii.isInterface());
    this.name = ii.name;
    this.classInfo = classInfo;
  }

  Interface.createInterface = function createInterface(classInfo) {
    var ii = classInfo.instanceInfo;
    release || assert(ii.isInterface());
    if (traceExecution.value) {
      var str = "Creating Interface " + ii.name;
      if (ii.interfaces.length) {
        str += " implements " + ii.interfaces.map(function (name) {
          return name.getName();
        }).join(", ");
      }
      print(str);
    }
    var cls = new Interface(classInfo);
    cls.interfaceBindings = new InstanceBindings(null, ii);
    return cls;
  };

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

    trace: function trace(writer) {
      writer.enter("interface " + this.name.getName());
      writer.enter("interfaceBindings: ");
      this.interfaceBindings.trace(writer);
      writer.outdent();
      writer.outdent();
      writer.leave("}");
    },

    call: function ($this, x) {
      return x;
    },

    apply: function ($this, args) {
      return args[0];
    }
  };

  return Interface;
})();

/*
 * AVM2 Class
 *
 * +---------------------------------+
 * | Class Object                    |<------------------------------+
 * +---------------------------------+                               |
 * | scope                           |     D'                        |
 * | classInfo                       |     ^                         |
 * | baseClass                       |     |                         |
 * |                                 |   +---+                       |
 * | dynamicPrototype ---------------+-->| D |                       |
 * |                                 |   +---+                       |
 * |                                 |     ^                         |
 * |                                 |     | .__proto__              |
 * |                                 |   +---+                       |
 * | traitsPrototype ----------------+-->| T |                       |
 * |                                 |   +---+                       |
 * |                                 |     ^                         |
 * |                                 |     | .prototype   +-------+  |
 * | instanceConstructor             |-----+------------->| class |--+
 * |                                 |     |              +-------+
 * | instanceConstructorNoInitialize |-----+
 * | call                            |
 * | apply                           |
 * +---------------------------------+
 *
 * D  - Dynamic prototype object.
 * D' - Base class dynamic prototype object.
 * T  - Traits prototype, class traits + base class traits.
 */

var Class = (function () {
  var OWN_INITIALIZE   = 0x1;
  var SUPER_INITIALIZE = 0x2;

  function Class(name, instanceConstructor, callable) {
    this.debugName = name;

    if (instanceConstructor) {
      release || assert(instanceConstructor.prototype);
      this.instanceConstructor = instanceConstructor;
      this.instanceConstructorNoInitialize = instanceConstructor;
      this.hasInitialize = 0;
      this.instanceConstructor.class = this;
    }

    if (!callable) {
      callable = Domain.coerceCallable(this);
    } else if (callable === Domain.coerceCallable) {
      callable = Domain.coerceCallable(this);
    }
    defineNonEnumerableProperty(this, "call", callable.call);
    defineNonEnumerableProperty(this, "apply", callable.apply);
  }

  Class.createClass = function createClass(classInfo, baseClass, scope) {
    var ci = classInfo;
    var ii = ci.instanceInfo;
    var domain = ci.abc.domain;
    var className = Multiname.getName(ii.name);
    var isNativeClass = ci.native;
    if (isNativeClass) {
      var classBuilder = getNative(ci.native.cls);
      if (!classBuilder) {
        unexpected("No native for " + ci.native.cls);
      }
      // Special case Object, which has no base class but needs the Class class on the scope.
      if (!baseClass) {
        scope = new Scope(scope, Class);
      }
    }
    var classScope = new Scope(scope, null);
    var instanceConstructor = createFunction(ii.init, classScope);
    var cls;
    if (isNativeClass) {
      cls = classBuilder(domain, classScope, instanceConstructor, baseClass);
    } else {
      cls = new Class(className, instanceConstructor);
    }
    cls.classInfo = classInfo;
    cls.scope = classScope;
    classScope.object = cls;
    var classNatives;
    var instanceNatives;
    if (isNativeClass) {
      if (cls.native) {
        classNatives = cls.native.static;
        instanceNatives = cls.native.instance;
      }
    } else {
      cls.extend(baseClass);
    }

    cls.classBindings = new ClassBindings(classInfo, classScope, classNatives);
    cls.classBindings.applyTo(domain, cls);
    defineReadOnlyProperty(cls, VM_IS_CLASS, true);

    cls.instanceBindings = new InstanceBindings(baseClass ? baseClass.instanceBindings : null, ii, classScope, instanceNatives);
    if (cls.instanceConstructor) {
      cls.instanceBindings.applyTo(domain, cls.traitsPrototype);
    }

    cls.implementedInterfaces = cls.instanceBindings.implementedInterfaces;
    return cls;
  };

  function setDefaultProperties(cls) {
    defineNonEnumerableProperty(cls.dynamicPrototype, Multiname.getPublicQualifiedName("constructor"), cls);
    defineReadOnlyProperty(cls.traitsPrototype, "class", cls);
    defineReadOnlyProperty(cls.instanceConstructor, "class", cls);
    defineObjectShape(cls.traitsPrototype);
  }

  Class.prototype = {
    setSymbol: function setSymbol(props) {
      this.instanceConstructor.prototype.symbol = props;
    },

    getSymbol: function getSymbol() {
      return this.instanceConstructor.prototype.symbol;
    },

    initializeInstance: function initializeInstance(obj) {
      // Initialize should be nullary and nonrecursive. If the script
      // needs to pass in script objects to native land, there's usually a
      // ctor function.
      var c = this;
      var initializes = [];
      while (c) {
        if (c.hasInitialize & OWN_INITIALIZE) {
          initializes.push(c.instanceConstructor.prototype.initialize);
        }
        c = c.baseClass;
      }
      var s;
      while ((s = initializes.pop())) {
        s.call(obj);
      }
      Counter.count("Initialize Instance");
    },

    createInstance: function createInstance(args) {
      var o = Object.create(this.instanceConstructor.prototype);
      this.instanceConstructor.apply(o, args);
      return o;
    },

    createAsSymbol: function createAsSymbol(props) {
      var o = Object.create(this.instanceConstructor.prototype);
      // Custom classes will have already have .symbol linked.
      if (o.symbol) {
        var symbol = Object.create(o.symbol);
        for (var prop in props) {
          symbol[prop] = props[prop];
        }
        o.symbol = symbol;
      } else {
        o.symbol = props;
      }
      return o;
    },

    extendNative: function (baseClass, native) {
      this.baseClass = baseClass;
      this.dynamicPrototype = Object.getPrototypeOf(native.prototype);
      this.instanceConstructor.prototype = this.traitsPrototype = native.prototype;
      setDefaultProperties(this);
    },

    extendBuiltin: function(baseClass) {
      release || assert (baseClass);
      // Some natives handle their own prototypes/it's impossible to do the
      // traits/public prototype BS, e.g. Object, Array, etc.
      // FIXME: This is technically non-semantics preserving.
      this.baseClass = baseClass;
      this.dynamicPrototype = this.traitsPrototype = this.instanceConstructor.prototype;
      setDefaultProperties(this);
    },

    extend: function (baseClass) {
      release || assert (baseClass);
      this.baseClass = baseClass;
      this.dynamicPrototype = Object.create(baseClass.dynamicPrototype);
      if (baseClass.hasInitialize) {
        var instanceConstructorNoInitialize = this.instanceConstructor;
        var self = this;
        this.instanceConstructor = function () {
          self.initializeInstance(this);
          instanceConstructorNoInitialize.apply(this, arguments);
        };
        defineReadOnlyProperty(this.instanceConstructor, "class", instanceConstructorNoInitialize.class);
        this.hasInitialize |= SUPER_INITIALIZE;
      }
      this.instanceConstructor.prototype = this.traitsPrototype = Object.create(this.dynamicPrototype);
      setDefaultProperties(this);
    },

    setDefaultProperties: function () {
      setDefaultProperties(this);
    },

    link: function (definition) {
      release || assert(definition);
      release || assert(this.dynamicPrototype);

      if (definition.initialize) {
        if (!this.hasInitialize) {
          var instanceConstructorNoInitialize = this.instanceConstructor;
          var self = this;
          this.instanceConstructor = function () {
            self.initializeInstance(this);
            instanceConstructorNoInitialize.apply(this, arguments);
          };
          defineReadOnlyProperty(this.instanceConstructor, "class", instanceConstructorNoInitialize.class);
          this.instanceConstructor.prototype = instanceConstructorNoInitialize.prototype;
        }
        this.hasInitialize |= OWN_INITIALIZE;
      }

      var dynamicPrototype = this.dynamicPrototype;
      var keys = Object.keys(definition);
      for (var i = 0; i < keys.length; i++) {
        var propertyName = keys[i];
        Object.defineProperty(dynamicPrototype, propertyName, Object.getOwnPropertyDescriptor(definition, propertyName));
      }

      function glueProperties(obj, properties) {
        var keys = Object.keys(properties);
        for (var i = 0; i < keys.length; i++) {
          var propertyName = keys[i];
          var propertySimpleName = properties[propertyName];
          release || assert (isString(propertySimpleName), "Make sure it's not a function.");
          var qn = Multiname.getQualifiedName(Multiname.fromSimpleName(propertySimpleName));
          release || assert(isString(qn));
          var descriptor = Object.getOwnPropertyDescriptor(obj, qn);
          if (descriptor && descriptor.get) {
            Object.defineProperty(obj, propertyName, descriptor);
          } else {
            Object.defineProperty(obj, propertyName, {
              get: new Function("", "return this." + qn),
              set: new Function("v", "this." + qn + " = v")
            });
          }
        }
      }

      function generatePropertiesFromTraits(traits) {
        var properties = createEmptyObject();
        traits.forEach(function (trait) {
          var ns = trait.name.getNamespace();
          if (!ns.isPublic()) {
            return;
          }
          properties[trait.name.getName()] = "public " + trait.name.getName();
        });
        return properties;
      }

      var glue = definition.__glue__;
      if (!glue) {
        return;
      }

      // Accessors for script properties from within AVM2.
      if (glue.script) {
        if (glue.script.instance) {
          if (isNumber(glue.script.instance)) {
            release || assert (glue.script.instance === Glue.ALL);
            glueProperties(dynamicPrototype, generatePropertiesFromTraits(this.classInfo.instanceInfo.traits));
          } else {
            glueProperties(dynamicPrototype, glue.script.instance);
          }
        }
        if (glue.script.static) {
          if (isNumber(glue.script.static)) {
            release || assert (glue.script.static === Glue.ALL);
            glueProperties(this, generatePropertiesFromTraits(this.classInfo.traits));
          } else {
            glueProperties(this, glue.script.static);
          }
        }
      }
    },

    linkNatives: function (definition) {
      var glue = definition.__glue__;
      // assert (glue && glue.native);
      // Binding to member methods marked as [native].
      this.native = glue.native;
    },

    verify: function () {
      var instanceConstructor = this.instanceConstructor;
      var tP = this.traitsPrototype;
      var dP = this.dynamicPrototype;
      release || assert (instanceConstructor && tP && dP);
      release || assert (tP === instanceConstructor.prototype);
      release || assert (dP === instanceConstructor.prototype || dP === Object.getPrototypeOf(instanceConstructor.prototype));
      release || assert (isClass(this));
      if (tP !== Object.prototype) {
        // We don't want to put "class" and "shape" on the Object.prototype.
        release || assert (Object.hasOwnProperty.call(tP, "class"));
        release || assert (Object.hasOwnProperty.call(tP, "shape"), "Classes should have a shape ID.");
      }
      release || assert (instanceConstructor.class === this);
    },

    coerce: function (value) {
      return value;
    },

    isInstanceOf: function (value) {
      // TODO: Fix me.
      return this.isInstance(value);
    },

    isInstance: function (value) {
      if (value === null || typeof value !== "object") {
        return false;
      }
      return this.dynamicPrototype.isPrototypeOf(value);
    },

    trace: function trace(writer) {
      var description = this.debugName + (this.baseClass ? " extends " + this.baseClass.debugName : "");
      writer.enter("class " + description + " {");
      writer.writeLn("scope: " + this.scope);
      writer.writeLn("baseClass: " + this.baseClass);
      writer.writeLn("classInfo: " + this.classInfo);
      writer.writeLn("dynamicPrototype: " + this.dynamicPrototype);
      writer.writeLn("traitsPrototype: " + this.traitsPrototype);
      writer.writeLn("dynamicPrototype === traitsPrototype: " + (this.dynamicPrototype === this.traitsPrototype));

      writer.writeLn("instanceConstructor: " + this.instanceConstructor);
      writer.writeLn("instanceConstructorNoInitialize: " + this.instanceConstructorNoInitialize);
      writer.writeLn("instanceConstructor === instanceConstructorNoInitialize: " + (this.instanceConstructor === this.instanceConstructorNoInitialize));

      var traitsPrototype = this.traitsPrototype;
      writer.enter("traitsPrototype: ");
      if (traitsPrototype) {
        writer.enter("VM_SLOTS: ");
        writer.writeArray(traitsPrototype[VM_SLOTS].map(function (slot) {
          return slot.trait;
        }));
        writer.outdent();

        writer.enter("VM_BINDINGS: ");
        writer.writeArray(traitsPrototype[VM_BINDINGS].map(function (binding) {
          var pd = Object.getOwnPropertyDescriptor(traitsPrototype, binding);
          var str = binding;
          if (pd.get || pd.set) {
            if (pd.get) {
              str += " getter: " + debugName(pd.get);
            }
            if (pd.set) {
              str += " setter: " + debugName(pd.set);
            }
          } else {
            str += " value: " + debugName(pd.value);
          }
          return str;
        }));
        writer.outdent();

        writer.enter("VM_OPEN_METHODS: ");
        writer.writeArray(toKeyValueArray(traitsPrototype[VM_OPEN_METHODS]).map(function (pair) {
          return pair[0] + ": " + debugName(pair[1]);
        }));
        writer.outdent();
      }

      writer.enter("classBindings: ");
      this.classBindings.trace(writer);
      writer.outdent();

      writer.enter("instanceBindings: ");
      this.instanceBindings.trace(writer);
      writer.outdent();

      writer.outdent();
      writer.writeLn("call: " + this.call);
      writer.writeLn("apply: " + this.apply);

      writer.leave("}");
    },

    toString: function () {
      return "[class " + this.classInfo.instanceInfo.name.name + "]";
    }
  };

  var callable = Domain.coerceCallable(Class);
  defineNonEnumerableProperty(Class, "call", callable.call);
  defineNonEnumerableProperty(Class, "apply", callable.apply);

  Class.instanceConstructor = Class;
  Class.toString = Class.prototype.toString;

  // Traits are below the dynamic instant prototypes,
  // i.e. this.dynamicPrototype === Object.getPrototypeOf(this.instanceConstructor.prototype)
  // and we cache the dynamic instant prototype as this.dynamicPrototype.
  //
  // Traits are not visible to the AVM script.
  Class.native = {
    instance: {
      prototype: {
        get: function () { return this.dynamicPrototype; }
      }
    }
  };
  return Class;
})();

function MethodClosure($this, fn) {
  var bound = bindSafely(fn, $this);
  defineNonEnumerableProperty(this, "call", bound.call.bind(bound));
  defineNonEnumerableProperty(this, "apply", bound.apply.bind(bound));
}

MethodClosure.prototype = {
  toString: function () {
    return "function Function() {}";
  }
};