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
///<reference path='references.ts' />


module Shumway.AVM2.Runtime {
  import Multiname = Shumway.AVM2.ABC.Multiname;
  import Namespace = Shumway.AVM2.ABC.Namespace;
  import ClassInfo = Shumway.AVM2.ABC.ClassInfo;
  import InstanceInfo = Shumway.AVM2.ABC.InstanceInfo;
  import InstanceBindings = Shumway.AVM2.Runtime.InstanceBindings;
  import ClassBindings = Shumway.AVM2.Runtime.ClassBindings;

  import defineNonEnumerableGetterOrSetter = Shumway.ObjectUtilities.defineNonEnumerableGetterOrSetter;
  import defineNonEnumerableProperty = Shumway.ObjectUtilities.defineNonEnumerableProperty;
  import defineReadOnlyProperty = Shumway.ObjectUtilities.defineReadOnlyProperty;
  import defineNonEnumerableGetter = Shumway.ObjectUtilities.defineNonEnumerableGetter;
  import createEmptyObject = Shumway.ObjectUtilities.createEmptyObject;
  import toKeyValueArray = Shumway.ObjectUtilities.toKeyValueArray;

  declare var Scope;
  declare var Glue;
  declare var createFunction;
  declare var debugName;
  declare var getNative;
  declare var Counter;

  export class Interface {
    name: Multiname;
    classInfo: ClassInfo;
    interfaceBindings: InstanceBindings;
    constructor(classInfo: ClassInfo) {
      var ii = classInfo.instanceInfo;
      release || assert(ii.isInterface());
      this.name = ii.name;
      this.classInfo = classInfo;
    }

    public static createInterface(classInfo: ClassInfo) {
      var ii = classInfo.instanceInfo;
      release || assert(ii.isInterface());
      if (traceExecution.value) {
        var str = "Creating Interface " + ii.name;
        if (ii.interfaces.length) {
          str += " implements " + ii.interfaces.map((name) => name.getName()).join(", ");
        }
        log(str);
      }
      var cls = new Interface(classInfo);
      cls.interfaceBindings = new InstanceBindings(null, ii, null, null);
      return cls;
    }

    public toString() {
      return "[interface " + this.name + "]";
    }

    public isType(value) {
      if (value === null || typeof value !== "object") {
        return false;
      }
      release || assert(value.class.implementedInterfaces, "No 'implementedInterfaces' map found on class " + value.class);
      var qualifiedName = Multiname.getQualifiedName(this.name);
      return value.class.implementedInterfaces[qualifiedName] !== undefined;
    }

    public trace(writer) {
      writer.enter("interface " + this.name.getName());
      writer.enter("interfaceBindings: ");
      this.interfaceBindings.trace(writer);
      writer.outdent();
      writer.outdent();
      writer.leave("}");
    }

    public call(self, x) {
      return x;
    }

    public apply(self, args) {
      return args[0];
    }
  }

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

  export function setDefaultProperties(cls) {
    defineNonEnumerableProperty(cls.dynamicPrototype, Multiname.getPublicQualifiedName("constructor"), cls);
    defineReadOnlyProperty(cls.traitsPrototype, "class", cls);
    defineReadOnlyProperty(cls.instanceConstructor, "class", cls);
  }

  export class Class {
    public static OWN_INITIALIZE   = 0x1;
    public static SUPER_INITIALIZE = 0x2;
    debugName: string;
    instanceConstructor: Function;
    static instanceConstructor: Function;
    static native: any;
    instanceConstructorNoInitialize: Function;
    hasInitialize: number;
    classInfo: ClassInfo;
    native: any;
    traitsPrototype: Object;
    dynamicPrototype: Object;
    baseClass: any;
    scope: any;
    classBindings: ClassBindings;
    instanceBindings: InstanceBindings;
    call: Function;
    apply: Function;
    constructor(name, instanceConstructor, callable?) {
      this.debugName = name;

      if (instanceConstructor) {
        release || assert(instanceConstructor.prototype);
        this.instanceConstructor = instanceConstructor;
        this.instanceConstructorNoInitialize = instanceConstructor;
        this.hasInitialize = 0;
        this.instanceConstructor.class = <any>this;
      }

      if (!callable) {
        callable = ApplicationDomain.coerceCallable(this);
      } else if (callable === ApplicationDomain.coerceCallable) {
        callable = ApplicationDomain.coerceCallable(this);
      }
      defineNonEnumerableProperty(this, "call", callable.call);
      defineNonEnumerableProperty(this, "apply", callable.apply);
    }

    public static createClass(classInfo, baseClass, scope) {
      var ci = classInfo;
      var ii = ci.instanceInfo;
      var domain = ci.abc.applicationDomain;
      var className = Multiname.getName(ii.name);
      var isNativeClass = ci.native;
      if (isNativeClass) {
        var buildClass = getNative(ci.native.cls);
        if (!buildClass) {
          Shumway.Debug.unexpected("No native for " + ci.native.cls);
        }
        // Special case Object, which has no base class but needs the Class class on the scope.
        if (!baseClass) {
          scope = new Scope(scope, Class);
        }
      }
      var classScope = new Scope(scope, null);
      var instanceConstructor = createFunction(ii.init, classScope, false);
      var cls;
      if (isNativeClass) {
        cls = buildClass(domain, classScope, instanceConstructor, baseClass);
        // cls.asClass = Shumway.AVM2.AS.createNativeClass(ci);
      } else {
        cls = new Class(className, instanceConstructor);
        // cls.asClass = new Shumway.AVM2.AS.Class(ci, instanceConstructor);
      }

      cls.className = className;
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
    }

    public setSymbol(props) {
      this.instanceConstructor.prototype.symbol = props;
    }

    public getSymbol() {
      return this.instanceConstructor.prototype.symbol;
    }

    public initializeInstance(obj) {
      // Initialize should be nullary and nonrecursive. If the script
      // needs to pass in script objects to native land, there's usually a
      // ctor function.
      var c = this;
      var initializes = [];
      while (c) {
        if (c.hasInitialize & Class.OWN_INITIALIZE) {
          initializes.push(c.instanceConstructor.prototype.initialize);
        }
        c = c.baseClass;
      }
      var s;
      while ((s = initializes.pop())) {
        s.call(obj);
      }
      Counter.count("Initialize Instance " + obj.class);
    }

    public createInstance(args) {
      var o = Object.create(this.instanceConstructor.prototype);
      this.instanceConstructor.asApply(o, args);
      return o;
    }

    public createAsSymbol(props) {
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
    }

    public extendNative(baseClass, native) {
      this.baseClass = baseClass;
      this.dynamicPrototype = Object.getPrototypeOf(native.prototype);
      this.instanceConstructor.prototype = this.traitsPrototype = native.prototype;
      setDefaultProperties(this);
    }

    public extendWrapper(baseClass, wrapper) {
      release || assert(this.instanceConstructor === wrapper);
      this.baseClass = baseClass;
      this.dynamicPrototype = Object.create(baseClass.dynamicPrototype);
      var traitsPrototype = Object.create(this.dynamicPrototype, Shumway.ObjectUtilities.getOwnPropertyDescriptors(wrapper.prototype));
      this.instanceConstructor.prototype = this.traitsPrototype = traitsPrototype;
      setDefaultProperties(this);
    }

    public extendBuiltin(baseClass) {
      release || assert (baseClass);
      // Some natives handle their own prototypes/it's impossible to do the
      // traits/public prototype BS, e.g. Object, Array, etc.
      // FIXME: This is technically non-semantics preserving.
      this.baseClass = baseClass;
      this.dynamicPrototype = this.traitsPrototype = this.instanceConstructor.prototype;
      setDefaultProperties(this);
    }

    public extend(baseClass) {
      release || assert (baseClass);
      this.baseClass = baseClass;
      this.dynamicPrototype = Object.create(baseClass.dynamicPrototype);
      if (baseClass.hasInitialize) {
        var instanceConstructorNoInitialize = this.instanceConstructor;
        var self = this;
        this.instanceConstructor = function () {
          self.initializeInstance(this);
          instanceConstructorNoInitialize.asApply(this, arguments);
        };
        defineReadOnlyProperty(this.instanceConstructor, "class", instanceConstructorNoInitialize.class);
        this.hasInitialize |= Class.SUPER_INITIALIZE;
      }
      this.instanceConstructor.prototype = this.traitsPrototype = Object.create(this.dynamicPrototype);
      setDefaultProperties(this);
    }

    public setDefaultProperties() {
      setDefaultProperties(this);
    }

    public link(definition) {
      release || assert(definition);
      release || assert(this.dynamicPrototype);

      if (definition.initialize) {
        if (!this.hasInitialize) {
          var instanceConstructorNoInitialize = this.instanceConstructor;
          var self = this;
          this.instanceConstructor = function () {
            self.initializeInstance(this);
            instanceConstructorNoInitialize.asApply(this, arguments);
          };
          defineReadOnlyProperty(this.instanceConstructor, "class", instanceConstructorNoInitialize.class);
          this.instanceConstructor.prototype = instanceConstructorNoInitialize.prototype;
        }
        this.hasInitialize |= Class.OWN_INITIALIZE;
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
          var propertyGlue = properties[propertyName];
          var propertySimpleName;
          var glueOpenMethod = false;
          if (propertyGlue.indexOf("open ") >= 0) {
            propertySimpleName = propertyGlue.substring(5);
            glueOpenMethod = true;
          } else {
            propertySimpleName = propertyGlue;
          }
          release || assert (isString(propertySimpleName), "Make sure it's not a function.");
          var qn = Multiname.getQualifiedName(Multiname.fromSimpleName(propertySimpleName));
          if (glueOpenMethod) {
            qn = VM_OPEN_METHOD_PREFIX + qn;
          }
          release || assert(isString(qn));
          var descriptor = Object.getOwnPropertyDescriptor(obj, qn);
          if (descriptor && descriptor.get) {
            Object.defineProperty(obj, propertyName, descriptor);
          } else {
            Object.defineProperty(obj, propertyName, {
              get: <() => any>new Function("", "return this." + qn),
              set: <(any) => void>new Function("v", "this." + qn + " = v")
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
          properties[trait.name.getName()] = (trait.isMethod() ? "open " : "") + "public " + trait.name.getName();
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
    }

    public linkNatives(definition) {
      var glue = definition.__glue__;
      // assert (glue && glue.native);
      // Binding to member methods marked as [native].
      this.native = glue.native;
    }

    public verify() {
      var instanceConstructor = this.instanceConstructor;
      var tP = this.traitsPrototype;
      var dP = this.dynamicPrototype;
      release || assert (instanceConstructor && tP && dP);
      release || assert (tP === instanceConstructor.prototype);
      release || assert (dP === instanceConstructor.prototype || dP === Object.getPrototypeOf(instanceConstructor.prototype));
      release || assert (isClass(this));
      if (tP !== Object.prototype) {
        // TODO: Don't remember why I had this assertion.
        // We don't want to put "class" on the Object.prototype.
        // release || assert (Object.hasOwnProperty.call(tP, "class"));
      }
      release || assert (instanceConstructor.class === <any>this);
    }

    public coerce(value) {
      return value;
    }

    public isInstanceOf(value) {
      // TODO: Fix me.
      return this.isType(value);
    }

    public isType(value) {
      if (value === null || typeof value !== "object") {
        return false;
      }
      return this.dynamicPrototype.isPrototypeOf(value);
    }

    public trace(writer) {
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
        writer.writeArray((<any>traitsPrototype.asSlots.byID).map(function (slot) {
          return slot.trait;
        }));
        writer.outdent();

        writer.enter("VM_BINDINGS: ");
        writer.writeArray(traitsPrototype.asBindings.map(function (binding) {
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
        writer.writeArray(toKeyValueArray(traitsPrototype.asOpenMethods).map(function (pair) {
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
    }

    public toString() {
      return "[class " + this.classInfo.instanceInfo.name.name + "]";
    }
  }


  var callable = ApplicationDomain.coerceCallable(Class);
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
  }
}

import Interface = Shumway.AVM2.Runtime.Interface;
import Class = Shumway.AVM2.Runtime.Class;