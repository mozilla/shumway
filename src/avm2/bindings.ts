/*
 * Copyright 2014 Mozilla Foundation
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

module Shumway.AVM2.Runtime {
  import Map = Shumway.Map;
  import Multiname = Shumway.AVM2.ABC.Multiname;
  import Namespace = Shumway.AVM2.ABC.Namespace;
  import MethodInfo = Shumway.AVM2.ABC.MethodInfo;
  import ClassInfo = Shumway.AVM2.ABC.ClassInfo;
  import InstanceInfo = Shumway.AVM2.ABC.InstanceInfo;
  import ScriptInfo = Shumway.AVM2.ABC.ScriptInfo;
  import ApplicationDomain = Shumway.AVM2.Runtime.ApplicationDomain;

  import Trait = Shumway.AVM2.ABC.Trait;
  import IndentingWriter = Shumway.IndentingWriter;
  import hasOwnProperty = Shumway.ObjectUtilities.hasOwnProperty;
  import createMap = Shumway.ObjectUtilities.createMap;
  import cloneObject = Shumway.ObjectUtilities.cloneObject;
  import copyProperties = Shumway.ObjectUtilities.copyProperties;
  import createEmptyObject = Shumway.ObjectUtilities.createEmptyObject;
  import bindSafely = Shumway.FunctionUtilities.bindSafely;
  import assert = Shumway.Debug.assert;

  import defineNonEnumerableGetterOrSetter = Shumway.ObjectUtilities.defineNonEnumerableGetterOrSetter;
  import defineNonEnumerableProperty = Shumway.ObjectUtilities.defineNonEnumerableProperty;
  import defineReadOnlyProperty = Shumway.ObjectUtilities.defineReadOnlyProperty;
  import defineNonEnumerableGetter = Shumway.ObjectUtilities.defineNonEnumerableGetter;
  import makeForwardingGetter = Shumway.FunctionUtilities.makeForwardingGetter;
  import makeForwardingSetter = Shumway.FunctionUtilities.makeForwardingSetter;
  import pushUnique = Shumway.ArrayUtilities.pushUnique;

  export class Binding {
    public trait: Trait;
    public static SET_PREFIX = "set ";
    public static GET_PREFIX = "get ";
    public static KEY_PREFIX_LENGTH: number = 4;
    public natives: any;
    public scope: any;
    constructor(trait: Trait) {
      this.trait = trait;
    }
    public static getKey(qn, trait: Trait) {
      var key = qn;
      if (trait.isGetter()) {
        key = Binding.GET_PREFIX + qn;
      } else if (trait.isSetter()) {
        key = Binding.SET_PREFIX + qn;
      }
      return key;
    }
    public toString(): string {
      return String(this.trait);
    }
  }

  export class SlotInfo {
    public name: string;
    public isConst: boolean;
    public type: any;
    public trait: Trait;
    constructor(name: string, isConst: boolean, type: any, trait: Trait) {
      this.name = name;
      this.isConst = isConst;
      this.type = type;
      this.trait = trait;
    }
  }

  export class SlotInfoMap {
    public byID: Shumway.Map<SlotInfo>;
    public byQN: Shumway.Map<SlotInfo>;
    constructor () {
      this.byID = createMap<SlotInfo>();
      this.byQN = createMap<SlotInfo>();
    }
  }

  /**
   * Abstraction over a collection of traits.
   */
  export class Bindings {
    public map: Shumway.Map<Binding>;
    public slots: Trait [];
    public nextSlotId: number;
    public natives: any;
    constructor() {
      this.map = createMap<Binding>();
      this.slots = [];
      this.nextSlotId = 1;
    }

    /**
     * Assigns the next available slot to the specified trait. Traits that have a non-zero slotId
     * are allocated by ASC and we can't relocate them elsewhere.
     */
    public assignNextSlot(trait: Trait) {
      release || assert (trait instanceof Trait);
      release || assert (trait.isSlot() || trait.isConst() || trait.isClass());
      if (!trait.slotId) {
        trait.slotId = this.nextSlotId ++;
      } else {
        this.nextSlotId = trait.slotId + 1;
      }
      release || assert (!this.slots[trait.slotId], "Trait slot already taken.");
      this.slots[trait.slotId] = trait;
    }

    public trace(writer: Shumway.IndentingWriter) {
      writer.enter("Bindings");
      for (var key in this.map) {
        var binding = this.map[key];
        writer.writeLn(binding.trait.kindName() + ": " + key + " -> " + binding);
      }
      writer.leaveAndEnter("Slots");
      writer.writeArray(this.slots);
      writer.outdent();
    }

    /**
     * Applies traits to a traitsPrototype object. Every traitsPrototype object must have the following layout:
     *
     * VM_BINDINGS = [ Array of Binding QNames ]
     * VM_SLOTS = {
     *   byID: [],
     *   byQN: {},
     * }
     *
     */
    public applyTo(domain: ApplicationDomain, object, append: boolean = false) {
      if (!append) {
        release || assert(!hasOwnProperty(object, VM_SLOTS), "Already has VM_SLOTS.");
        release || assert(!hasOwnProperty(object, VM_BINDINGS), "Already has VM_BINDINGS.");
        release || assert(!hasOwnProperty(object, VM_OPEN_METHODS), "Already has VM_OPEN_METHODS.");

        defineNonEnumerableProperty(object, VM_SLOTS, new SlotInfoMap());
        defineNonEnumerableProperty(object, VM_BINDINGS, []);
        defineNonEnumerableProperty(object, VM_OPEN_METHODS, createMap<Function>());

        defineNonEnumerableProperty(object, "bindings", this);
        defineNonEnumerableProperty(object, "resolutionMap", []);
      }

      traitsWriter && traitsWriter.greenLn("Applying Traits" + (append ? " (Append)" : ""));

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
            pushUnique(object.asBindings, key);
          } else {
            traitsWriter && traitsWriter.greenLn("Applying Trait " + trait.kindName() + ": " + trait);
            defineNonEnumerableProperty(object, qn, defaultValue);
            pushUnique(object.asBindings, qn);
            var slotInfo = new SlotInfo(
              qn,
              trait.isConst(),
              trait.typeName ? domain.getProperty(trait.typeName, false, false) : null,
              trait
            );
            object.asSlots.byID[trait.slotId] = slotInfo;
            object.asSlots.byQN[qn] = slotInfo;
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
          pushUnique(object.asBindings, key);
          enterTimeline("applyMethodTrait");
          if (this instanceof ScriptBindings) {
            applyNonMemoizedMethodTrait(key, trait, object, binding.scope, binding.natives);
          } else {
            applyMemoizedMethodTrait(key, trait, object, binding.scope, binding.natives);
          }
          leaveTimeline();
        }
      }
    }
  }

  export class ActivationBindings extends Bindings {
    methodInfo: MethodInfo;
    constructor(methodInfo) {
      super();
      release || assert (methodInfo.needsActivation());
      this.methodInfo = methodInfo;
      // ASC creates activation even if the method has no traits, weird.
      // release || assert (methodInfo.traits.length);

      /**
       * Add activation traits.
       */
      var traits = methodInfo.traits;
      for (var i = 0; i < traits.length; i++) {
        var trait = traits[i];
        release || assert (trait.isSlot() || trait.isConst(), "Only slot or constant traits are allowed in activation objects.");
        var key = Multiname.getQualifiedName(trait.name);
        this.map[key] = new Binding(trait);
        this.assignNextSlot(trait);
      }
    }
  }

  export class CatchBindings extends Bindings {
    constructor(scope, trait) {
      super();
      /**
       * Add catch traits.
       */
      var key = Multiname.getQualifiedName(trait.name);
      this.map[key] = new Binding(trait);
      release || assert (trait.isSlot(), "Only slot traits are allowed in catch objects.");
      this.assignNextSlot(trait);
    }
  }

  export class ScriptBindings extends Bindings {
    scriptInfo: ScriptInfo;
    scope: any;
    constructor(scriptInfo: ScriptInfo, scope: Scope) {
      super();
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
  }

  export class ClassBindings extends Bindings {
    classInfo: ClassInfo;
    scope: any;
    natives: any;
    constructor(classInfo, scope, natives) {
      super();
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
  }

  export class InstanceBindings extends Bindings {
    instanceInfo: InstanceInfo;
    parent: InstanceBindings;
    scope: any;
    natives: any;
    implementedInterfaces: Shumway.Map<Shumway.AVM2.AS.ASClass>;
    constructor(parent, instanceInfo, scope, natives) {
      super();
      this.scope = scope;
      this.natives = natives;
      this.parent = parent;
      this.instanceInfo = instanceInfo;
      this.implementedInterfaces = parent ? cloneObject(parent.implementedInterfaces) : createEmptyObject();
      if (parent) {
        this.slots = parent.slots.slice();
        this.nextSlotId = parent.nextSlotId;
      }
      this.extend(parent);
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
    private extend(parent) {
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
      var domain = ii.abc.applicationDomain;
      var interfaces = ii.interfaces;

      var interface: Shumway.AVM2.AS.ASClass;
      // Collect all implemented interfaces.
      for (var i = 0; i < interfaces.length; i++) {
        interface = domain.getProperty(interfaces[i], true, true);
        // This can be undefined if the interface is defined after a class that implements it is defined.
        release || assert(interface);
        copyProperties(this.implementedInterfaces, interface.interfaceBindings.implementedInterfaces);
        this.implementedInterfaces[Multiname.getQualifiedName(interface.classInfo.instanceInfo.name)] = interface;
      }

      // Apply all interface bindings.
      for (var interfaceName in this.implementedInterfaces) {
        interface = this.implementedInterfaces[interfaceName];
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

    public toString() {
      return this.instanceInfo.toString();
    }
  }

  var traitsWriter: IndentingWriter = null; // new IndentingWriter();

}

import Binding = Shumway.AVM2.Runtime.Binding;
import Bindings = Shumway.AVM2.Runtime.Bindings;
import ActivationBindings = Shumway.AVM2.Runtime.ActivationBindings;
import CatchBindings = Shumway.AVM2.Runtime.CatchBindings;
import ScriptBindings = Shumway.AVM2.Runtime.ScriptBindings;
import ClassBindings = Shumway.AVM2.Runtime.ClassBindings;
import InstanceBindings = Shumway.AVM2.Runtime.InstanceBindings;
