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

interface Object {
  __proto__: Object;
}

module Shumway.AVM2.AS {
  
  import Trait = Shumway.AVM2.ABC.Trait;
  import ClassInfo = Shumway.AVM2.ABC.ClassInfo;
  import Multiname = Shumway.AVM2.ABC.Multiname;
  import Namespace = Shumway.AVM2.ABC.Namespace;
  import ApplicationDomain = Shumway.AVM2.Runtime.ApplicationDomain;
  import Scope = Shumway.AVM2.Runtime.Scope;
  import hasOwnProperty = Shumway.ObjectUtilities.hasOwnProperty;
  import hasOwnGetter = Shumway.ObjectUtilities.hasOwnGetter;
  import getOwnGetter = Shumway.ObjectUtilities.getOwnGetter;
  import defineNonEnumerableProperty = Shumway.ObjectUtilities.defineNonEnumerableProperty;
  import isNumber = Shumway.isNumber;
  import isNullOrUndefined = Shumway.isNullOrUndefined;
  import createObject = Shumway.ObjectUtilities.createObject;
  import isPrototypeWriteable = Shumway.ObjectUtilities.isPrototypeWriteable;
  import getOwnPropertyDescriptor = Shumway.ObjectUtilities.getOwnPropertyDescriptor;
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  import HasNext2Info = Shumway.AVM2.Runtime.HasNext2Info;
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;
  import assert = Shumway.Debug.assert;
  import assertUnreachable = Shumway.Debug.assertUnreachable;
  import createFunction = Shumway.AVM2.Runtime.createFunction;
  import Runtime = Shumway.AVM2.Runtime;
  import IndentingWriter = Shumway.IndentingWriter;
  import boxValue = Shumway.ObjectUtilities.boxValue;
  import createEmptyObject = Shumway.ObjectUtilities.createEmptyObject;
  import SORT = Shumway.AVM2.ABC.SORT;

  import ClassBindings = Shumway.AVM2.Runtime.ClassBindings;
  import InstanceBindings = Shumway.AVM2.Runtime.InstanceBindings;

  import Int32Vector = Shumway.AVM2.AS.Int32Vector;
  import Uint32Vector = Shumway.AVM2.AS.Uint32Vector;
  import Float64Vector = Shumway.AVM2.AS.Float64Vector;
  import asCompare = Shumway.AVM2.Runtime.asCompare;

  var debug = false;

  function log(message?: any, ...optionalParams: any[]): void {
    if (debug) {
      jsGlobal.print(message);
    }
  }

  var writer = debug ? new IndentingWriter() : null;

  /**
   * This is all very magical, things are not what they seem, beware!!!
   *
   * The AS3 Class Hierarchy can be expressed as TypeScript, which is nice because
   * we get all sorts of compile time error checking and default arguments support.
   *
   * TODO: TS default argument support is not semantically equivalent to AS3 which
   * uses the arguments.length, TS uses typeof argument === "undefined", so beware.
   *
   * For the most part, you can cut and paste AS3 code into TypeScript and it will
   * parse correctly.
   *
   * The prototype chain configured by TypeScript is not actually used, We only use
   * Class definitions as a templates from which we construct real AS3 classes.
   *
   * Linking:
   *
   * AS -> TS
   *
   * Native AS3 members are linked against TS members. A verification step makes
   * sure all native members are implemented.
   *
   * TS -> AS
   *
   * For this you need to provide TS type definitions and then specify which
   * properties should be made available.
   *
   */

  export enum InitializationFlags {
    NONE             = 0x0,
    OWN_INITIALIZE   = 0x1,
    SUPER_INITIALIZE = 0x2
  }

  /**
   * In order to avoid shadowing of JS top level Objects we prefix the AS top level
   * classes with the "AS" prefix.
   */

  export class ASObject {
    public static baseClass: typeof ASClass = null;
    public static classInfo: ClassInfo;
    public static instanceConstructor: any = Object;
    public static instanceConstructorNoInitialize: any = null;

    public static initializer: any = null;
    public static defaultInitializerArgument: any;
    public static initializers: any = null;
    public static classInitializer: any = null;

    public static callableConstructor: any = ASObject.instanceConstructor;

    public static classBindings: ClassBindings;
    public static instanceBindings: InstanceBindings;
    public static interfaceBindings: InstanceBindings;

    public static classSymbols: string [];
    public static instanceSymbols: string [];

    public static staticNatives: any [];
    public static instanceNatives: any [];
    public static traitsPrototype: Object;
    public static dynamicPrototype: Object;
    public static typeScriptPrototype: Object;
    public static defaultValue: any = null;
    public static initializationFlags: InitializationFlags = InitializationFlags.NONE;
    public static native_prototype: Object;
    public static implementedInterfaces: Shumway.Map<ASClass>;
    public static isInterface: () => boolean;
    public static applyType: (type: ASClass) => ASClass;
    public static protocol: IProtocol;

    /**
     * Because we mess around with  __proto__'s we need to make
     * sure call and apply are made available on class constructors.
     */
    public static call = Function.prototype.call;
    public static apply = Function.prototype.apply;

    /**
     * Makes native class definitions look like ASClass instances.
     */
    static morphIntoASClass(classInfo: ClassInfo): void {
      this.classInfo = classInfo;
      this.__proto__ = ASClass.prototype;
    }

    static create(self: ASClass, baseClass: ASClass, instanceConstructor: any) {
      // ! The AS3 instanceConstructor is ignored.
      ASClass.create(self, baseClass, this.instanceConstructor);
    }

    public static initializeFrom(value: any) {
      return ASClassPrototype.initializeFrom.call(this, value);
    }

    public static coerce: (value: any) => any = Runtime.asCoerceObject;

    public static isInstanceOf: (value: any) => boolean;
    public static isType: (value: any) => boolean;
    public static isSubtypeOf: (value: ASClass) => boolean;

    public static asCall(self: any, ...argArray: any[]): any {
      return this.callableConstructor.apply(self, argArray);
    }

    public static asApply(self: any, argArray?: any): any {
      return this.callableConstructor.apply(self, argArray);
    }

    public static verify() {
      ASClassPrototype.verify.call(this);
    }

    public static trace(writer: IndentingWriter) {
      ASClassPrototype.trace.call(this, writer);
    }

    public static getQualifiedClassName(): string {
      return ASClassPrototype.getQualifiedClassName.call(this);
    }

    static _setPropertyIsEnumerable(o, V: string, enumerable: boolean): void {
      var name = Multiname.getPublicQualifiedName(V);
      var descriptor = getOwnPropertyDescriptor(o, name);
      descriptor.enumerable = false;
      Object.defineProperty(o, name, descriptor);
    }

    static _dontEnumPrototype(o: Object): void {
      for (var key in o) {
        if (Multiname.isPublicQualifiedName(key)) {
          var descriptor = getOwnPropertyDescriptor(o, key);
          descriptor.enumerable = false;
          Object.defineProperty(o, key, descriptor);
        }
      }
    }

    // Hack to make the TypeScript compiler find the original Object.defineProperty.
    static defineProperty = Object.defineProperty;

    static native_isPrototypeOf: (V: Object) => boolean;
    static native_hasOwnProperty: (V: string) => boolean;
    static native_propertyIsEnumerable: (V: string) => boolean;
    static setPropertyIsEnumerable: (V: string, enumerable: boolean) => boolean;

    native_isPrototypeOf(V: Object): boolean {
      notImplemented("isPrototypeOf");
      return false;
    }

    native_hasOwnProperty(name: string): boolean {
      var self: Object = this;
      return self.asHasOwnProperty(null, name, 0);
    }

    native_propertyIsEnumerable(name: string): boolean {
      var self: Object = this;
      return self.asPropertyIsEnumerable(null, name, 0);
    }

    setPropertyIsEnumerable(name: string, enumerable: boolean) {
      ASObject._setPropertyIsEnumerable(this, name, enumerable);
    }

    /**
     * This is the top level Object.prototype.toString() function.
     */
    toString(): string {
      var self = boxValue(this);
      if (self instanceof ASClass) {
        var cls: ASClass = <any>self;
        return Shumway.StringUtilities.concat3("[class ", cls.classInfo.instanceInfo.name.name, "]");
      }
      return Shumway.StringUtilities.concat3("[object ", self.class.classInfo.instanceInfo.name.name, "]");
    }
  }

  /**
   * Inherit from this if you don't want to inherit the static junk from ASObject
   */
  export class ASNative extends ASObject {
    public static baseClass: typeof ASClass = null;
    public static classInfo: ClassInfo = null;
    public static instanceConstructor: any = null;
    public static callableConstructor: any = null;
    public static classBindings: ClassBindings = null;
    public static instanceBindings: InstanceBindings = null;
    public static staticNatives: any [] = null;
    public static instanceNatives: any [] = null;
    public static traitsPrototype: Object = null;
    public static dynamicPrototype: Object = null;
    public static defaultValue: any = null;
    public static initializationFlags: InitializationFlags = InitializationFlags.NONE;
  }

  /**
   * In AS3 all objects inherit from the Object class. Class objects themselves are instances
   * of the Class class. In Shumway, Class instances can be constructed in two ways: dynamically,
   * through the |new ASClass()| constructor function, or "statically" by inheriting the static
   * properties from the ASObject class. Statically constructed functions get morphed into
   * proper ASClass instances when they get constructed at runtime.
   *
   * We need to be really careful not to step on TS's inheritance scheme.
   */
  export class ASClass extends ASObject {
    public static instanceConstructor: any = ASClass;
    public static staticNatives: any [] = null;
    public static instanceNatives: any [] = null;


    /**
     * We can't do our traits / dynamic prototype chaining trick when dealing with builtin
     * functions: Object, Array, etc. Here, we take over the builtin function prototype.
     */
    static configureBuiltinPrototype(self: ASClass, baseClass: ASClass) {
      release || assert (self.instanceConstructor);
      self.baseClass = baseClass;
      self.dynamicPrototype = self.traitsPrototype = self.instanceConstructor.prototype;
    }

    static configurePrototype(self: ASClass, baseClass: ASClass) {
      self.baseClass = baseClass;

      // Create a |dynamicPrototype| object and link it to the base class |dynamicPrototype|.
      self.dynamicPrototype = createObject(baseClass.dynamicPrototype);

      // Create a |traitsPrototype| object and link it to the class |dynamicPrototype|.
      self.traitsPrototype = createObject(self.dynamicPrototype);

      // Collect and copy all class instance members to the |traitsPrototype|. We copy properties
      // from the most derived class to the base class, ignoring those that are already set.

      var traitsPrototype = self.traitsPrototype;
      var classes = [];
      while (self) {
        classes.push(self);
        self = self.baseClass;
      }

      for (var i = 0; i < classes.length; i++) {
        var sources = [classes[i].typeScriptPrototype];
        // Also look at |instanceNatives| if defined.
        if (classes[i].instanceNatives) {
          Shumway.ArrayUtilities.pushMany(sources, classes[i].instanceNatives);
        }
        for (var j = 0; j < sources.length; j++) {
          var source = sources[j];
          for (var property in source) {
            // No idea why i'm doing this 'toString' check.
            if (i > 0 && property === "toString") {
              continue;
            }
            if (hasOwnProperty(source, property) && !hasOwnProperty(traitsPrototype, property)) {
              var descriptor = Object.getOwnPropertyDescriptor(source, property);
              release || Debug.assert (descriptor);
              try {
                Object.defineProperty(traitsPrototype, property, descriptor);
              } catch (e) {
                // log("Can't define " + property);
              }
            }
          }
        }
      }
    }

    /**
     * Called when the class is actually constructed during bytecode execution.
     */
    static create(self: ASClass, baseClass: ASClass, instanceConstructor: any) {
      release || assert (!self.instanceConstructorNoInitialize, "This should not be set yet.");
      release || assert (!self.dynamicPrototype && !self.traitsPrototype, "These should not be set yet.");

      /**
       * Save TypeScript prototype object.
       */
      self.typeScriptPrototype = self.prototype;

      if (self.instanceConstructor && !isPrototypeWriteable(self.instanceConstructor)) {
        ASClass.configureBuiltinPrototype(self, baseClass);
      } else {
        ASClass.configurePrototype(self, baseClass);
      }

      if (!self.instanceConstructor) {
        self.instanceConstructor = instanceConstructor;
        if (self !== instanceConstructor) {
          self.instanceConstructor.__proto__ = self;
        }
      } else {
        writer && writer.warnLn("Ignoring AS3 instanceConstructor.");
      }

      /**
       * If no |callableConstructor| exists then we insert a coercing
       */
      if (!self.callableConstructor) {
        self.callableConstructor = self.coerce.bind(self);
      }

      self.instanceConstructorNoInitialize = self.instanceConstructor;
      self.instanceConstructor.prototype = self.traitsPrototype;
      defineNonEnumerableProperty(self.instanceConstructor.prototype, "class", self);

      /**
       * Set the |constructor| property.
       */
      defineNonEnumerableProperty(self.dynamicPrototype, Multiname.getPublicQualifiedName("constructor"), self);

      /**
       * If class defines a custom protocol, use that.
       */
      if (self.protocol) {
        Shumway.ObjectUtilities.copyOwnPropertyDescriptors(self.traitsPrototype, self.protocol);
      }
    }

    /**
     * Creates an object of this class but doesn't run the constructors, just the initializers.
     */
    public initializeFrom(value: any): any {
      var o = Object.create(this.traitsPrototype);
      ASClass.runInitializers(o, value);
      return o;
    }

    /**
     * Calls the initializers of an object in order.
     */
    static runInitializers(self: Object, argument: any) {
      argument = argument || self.class.defaultInitializerArgument;
      var cls: ASClass = self.class;
      var initializers = cls.initializers;
      if (initializers) {
        for (var i = 0; i < initializers.length; i++) {
          initializers[i].call(self, argument);
        }
      }
    }

    /**
     * Some AS3 classes have two parallel constructor chains:
     *
     * Consider the following inheritance hierarchy, (superClass <- subClass)
     *
     * A  <- B  <- C  <- D
     *
     * X' is the Class X AS3 Constructor
     * X" is the Class X Native Constructor
     *
     * new D() first calls all the native constructors top down, and then
     * all the AS3 constructors bottom up. So, new D() calls:
     *
     * A", B", C", D", D', C', B', A'
     *
     * To implement this behaviour we maintain two constructors, |instanceConstructor|
     * and |instanceConstructorNoInitialize| as well as a list of native initializers
     * for each class, |initializers|. Classes that have at least one initializer need
     * their instanceConstructor to first call all the initializers and then recursively
     * go through all the super constructors.
     */
    static configureInitializers(self: ASClass) {
      if (self.baseClass && self.baseClass.initializers) {
        self.initializers = self.baseClass.initializers.slice(0);
      }
      if (self.initializer) {
        if (!self.initializers) {
          self.initializers = [];
        }
        self.initializers.push(self.initializer);
      }

      if (self.initializers) {
        release || assert (self.instanceConstructorNoInitialize === self.instanceConstructor);
        var previousConstructor: any = self;
        self.instanceConstructor = <any>function (...args) {
          ASClass.runInitializers(this, undefined);
          return self.instanceConstructorNoInitialize.apply(this, arguments);
        };
        self.instanceConstructor.prototype = self.traitsPrototype;
        defineNonEnumerableProperty(self.instanceConstructor.prototype, "class", self);

        (<any>(self.instanceConstructor)).classInfo = previousConstructor.classInfo;
        self.instanceConstructor.__proto__ = previousConstructor;
      }
    }

    /**
     * Runs the class initializer, if it has one.
     */
    static runClassInitializer(self: ASClass) {
      if (self.classInitializer) {
        self.classInitializer();
      }
    }

    static linkSymbols(self: ASClass) {
      /**
       * Only returns true if the symbol is available in debug or release modes. Only symbols
       * followed by the  "!" suffix are available in release builds.
       */
      function containsSymbol(symbols: string [], name: string) {
        for (var i = 0; i < symbols.length; i++) {
          var symbol = symbols[i];
          if (symbol.indexOf(name) >= 0) {
            var releaseSymbol = symbol[symbol.length - 1] === "!";
            if (releaseSymbol) {
              symbol = symbol.slice(0, symbol.length - 1);
            }
            if (name !== symbol) {
              continue;
            }
            if (release) {
              return releaseSymbol;
            }
            return true;
          }
        }
        return false;
      }

      function link(symbols, traits, object) {
        for (var i = 0; i < traits.length; i++) {
          var trait = traits[i];
          if (!containsSymbol(symbols, trait.name.name)) {
            continue;
          }
          release || assert (!trait.name.getNamespace().isPrivate(), "Why are you linking against private members?");
          if (trait.isConst()) {
            notImplemented("Don't link against const traits.");
            return;
          }
          var name = trait.name.name;
          var qn = Multiname.getQualifiedName(trait.name);
          if (trait.isSlot()) {
            Object.defineProperty(object, name, {
              get: <() => any>new Function("", "return this." + qn),
              set: <(any) => void>new Function("v", "this." + qn + " = v")
            });
          } else if (trait.isMethod()) {
            release || assert (!object[name], "Symbol should not already exist.")
            release || assert (object.asOpenMethods[qn], "There should be an open method for this symbol.");
            object[name] = object.asOpenMethods[qn];
          } else if (trait.isGetter()) {
            release || assert (hasOwnGetter(object, qn), "There should be an getter method for this symbol.");
            Object.defineProperty(object, name, {
              get: <() => any>new Function("", "return this." + qn),
            });
          } else {
            notImplemented(trait);
          }
        }
      }

      if (self.classSymbols) {
        link(self.classSymbols, self.classInfo.traits,  self);
      }

      if (self.instanceSymbols) {
        link(self.instanceSymbols, self.classInfo.instanceInfo.traits,  self.traitsPrototype);
      }
    }

    /**
     * Class info.
     */
    classInfo: ClassInfo;

    /**
     * Base class.
     */
    baseClass: ASClass;

    /**
     * Constructs an instance of this class.
     */
    instanceConstructor: new (...args) => any;

    /**
     * Constructs an instance of this class without calling the "native" initializer.
     */
    instanceConstructorNoInitialize: new (...args) => any;

    /**
     * Native initializer. Classes that have these defined are constructed in a two phases. All initializers
     * along the inheritance chain are executed before any constructors are called.
     */
    initializer: (...args) => any;

    /**
     * The default argument that gets passed to all initializers.
     */
    defaultInitializerArgument: any;

    /**
     * Native class initializer.
     */
    classInitializer: (...args) => any;

    /**
     * All native initializers
     */
    initializers: Array<(...args) => any>;

    /**
     * Constructs an instance of this class.
     */
    callableConstructor: new (...args) => any;

    /**
     * A list of objects to search for methods or accessors when linking static native traits.
     */
    staticNatives: Object [];

    /**
     * A list of objects to search for methods or accessors when linking instance native traits.
     */
    instanceNatives: Object [];

    /**
     * Class bindings associated with this class.
     */
    classBindings: ClassBindings;

    /**
     * Instance bindings associated with this class.
     */
    instanceBindings: InstanceBindings;

    /**
     * List of additional class symbols to link in debug builds.
     */
    classSymbols: string [];

    /**
     * List of additional instance symbols to link in debug builds.
     */
    instanceSymbols: string [];

    /**
     * Instance bindings associated with this interface.
     */
    interfaceBindings: InstanceBindings;

    /**
     * Prototype object that holds all class instance traits. This is not usually accessible from AS3 code directly. However,
     * for some classes (native classes) the |traitsPrototype| === |dynamicPrototype|.
     */
    traitsPrototype: Object;

    /**
     * Prototype object accessible from AS3 script code. This is the AS3 Class prototype object |class A { ... }, A.prototype|
     */
    dynamicPrototype: Object;

    /**
     * Original prototype object populated by TypeScript.
     */
    typeScriptPrototype: Object;

    /**
     * Set of implemented interfaces.
     */
    implementedInterfaces: Shumway.Map<ASClass>;

    defaultValue: any;

    /**
     * Initialization flags that determine how native initializers get called.
     */
    initializationFlags: InitializationFlags;

    /**
     * Defines the AS MetaObject Protocol, |null| if the default protocol should
     * be used. Override this to provide a different protocol.
     */
    protocol: IProtocol;

    prototype: Object;

    constructor(classInfo: ClassInfo) {
      false && super();
      this.classInfo = classInfo;
      this.staticNatives = null;
      this.instanceNatives = null;
      this.initializationFlags = InitializationFlags.NONE;
      this.defaultValue = null;
    }

    morphIntoASClass(classInfo: ClassInfo): void {
      release || assert (this.classInfo === classInfo);
      release || assert (this instanceof ASClass);
    }

    get native_prototype(): Object {
      release || assert (this.dynamicPrototype);
      return this.dynamicPrototype;
    }

    public asCall(self: any, ...argArray: any[]): any {
      return this.coerce(argArray[0])
    }

    public asApply(self: any, argArray?: any): any {
      return this.coerce(argArray[0])
    }

    public applyType(type: ASClass): ASClass {
      debugger;
      return null;
    }

    public isInstanceOf(value: any): boolean {
      // Nothing is an |instanceOf| interfaces.
      if (this.isInterface()) {
        return false;
      }
      return this.isType(value);
    }

    /**
     * The isType check for classes looks for the |dynamicPrototype| on the prototype chain.
     */
    public isType(value: any): boolean {
      if (Shumway.isNullOrUndefined(value)) {
        return false;
      }

      // We need to box primitive types before doing the |isPrototypeOf| test. In AS3, primitive values are
      // identical to their boxed representations: |0 === new Number(0)| is |true|.
      value = boxValue(value);

      if (this.isInterface()) {
        if (value === null || typeof value !== "object") {
          return false;
        }
        release || assert(value.class.implementedInterfaces, "No 'implementedInterfaces' map found on class " + value.class);
        var qualifiedName = Multiname.getQualifiedName(this.classInfo.instanceInfo.name);
        return value.class.implementedInterfaces[qualifiedName] !== undefined;
      }

      return this.dynamicPrototype.isPrototypeOf(value);
    }

    /**
     * Checks if this class derives from the specified class.
     */
    public isSubtypeOf(value: ASClass) {
      var that = this;
      while (that) {
        if (that.traitsPrototype === value.traitsPrototype) {
          return true;
        }
        that = that.baseClass;
      }
      return false;
    }

    public coerce(value: any): any {
      debug && log(Shumway.StringUtilities.concat4("Coercing ", value, " to ", this));
      return value;
    }

    public isInterface(): boolean {
      return this.classInfo.instanceInfo.isInterface();
    }

    public getQualifiedClassName(): string {
      var name = this.classInfo.instanceInfo.name;
      var uri = name.namespaces[0].uri;
      if (uri) {
        return uri + "::" + name.name;
      }
      return name.name;
    }

    /**
     * Checks the structural integrity of the class instance.
     */
    public verify() {
      var self: ASClass = this;

      // Not much to check for interfaces.
      if (this.isInterface()) {
        return;
      }

      // Verify that we have bindings for all native traits.
      writer && writer.enter("Verifying Class: " + self.classInfo + " {");
      var traits = [self.classInfo.traits, self.classInfo.instanceInfo.traits];

      var staticNatives: Object [] = [self];
      if (self.staticNatives) {
        Shumway.ArrayUtilities.pushMany(staticNatives, self.staticNatives);
      }

      var instanceNatives: Object [] = [self.prototype];
      if (self.instanceNatives) {
        Shumway.ArrayUtilities.pushMany(instanceNatives, self.instanceNatives);
      }

      if (self === <any>ASObject) {
        release || assert (!self.baseClass, "ASObject should have no base class.");
      } else {
        release || assert (self.baseClass, self.classInfo.instanceInfo.name + " has no base class.");
        release || assert (self.baseClass !== self);
      }

      release || assert (self.traitsPrototype === self.instanceConstructor.prototype, "The traitsPrototype is not set correctly.");

      if (self !== <any>ASObject) {
        if (ASObject.staticNatives === self.staticNatives) {
          writer && writer.warnLn("Template does not override its staticNatives, possibly a bug.");
        }
        if (ASObject.instanceNatives === self.instanceNatives) {
          writer && writer.warnLn("Template does not override its instanceNatives, possibly a bug.");
        }
      }

      function has(objects: Object [], predicate: (object: Object, name: string) => boolean, name) {
        for (var i = 0; i < objects.length; i++) {
          if (predicate(objects[i], name)) {
            return true;
          }
        }
        return false;
      }

      for (var j = 0; j < traits.length; j++) {
        var isClassTrait = j === 0;
        for (var i = 0; i < traits[j].length; i++) {
          var trait = traits[j][i];
          var name = escapeNativeName(trait.name.name);
          if (!(trait.isMethodOrAccessor() && trait.methodInfo.isNative())) {
            continue;
          }
          var holders = isClassTrait ? staticNatives : instanceNatives;
          var hasDefinition = false;
          if (trait.isMethod()) {
            hasDefinition = has(holders, Shumway.ObjectUtilities.hasOwnProperty, name);
          } else if (trait.isGetter()) {
            hasDefinition = has(holders, Shumway.ObjectUtilities.hasOwnGetter, name);
          } else if (trait.isSetter()) {
            hasDefinition = has(holders, Shumway.ObjectUtilities.hasOwnSetter, name);
          }
          if (!hasDefinition) {
            writer && writer.warnLn("Template is missing an implementation of the native " + (isClassTrait ? "static" : "instance") + " trait: " + trait + " in class: " + self.classInfo);
          }
        }
      }

      writer && writer.leave("}");
      // writer && this.trace(writer);

      Debug.assert(self.instanceConstructor, "Must have a constructor function.");
    }

    private static labelCounter = 0;

    static labelObject(o) {
      if (!o) {
        return o;
      }
      if (!hasOwnProperty(o, "labelId")) {
        o.labelId = ASClass.labelCounter ++;
      }
      if (o instanceof Function) {
        return "Function [#" + o.labelId + "]";
      }
      return "Object [#" + o.labelId + "]";
    }

    trace(writer: IndentingWriter) {
      writer.enter("Class: " + this.classInfo);
      writer.writeLn("baseClass: " + (this.baseClass ? this.baseClass.classInfo.instanceInfo.name: null));
      writer.writeLn("instanceConstructor: " + this.instanceConstructor + " " + ASClass.labelObject(this.instanceConstructor));
      writer.writeLn("instanceConstructorNoInitialize: " + this.instanceConstructorNoInitialize + " " + ASClass.labelObject(this.instanceConstructorNoInitialize));

      writer.writeLn("traitsPrototype: " + ASClass.labelObject(this.traitsPrototype));
      writer.writeLn("traitsPrototype.__proto__: " + ASClass.labelObject(this.traitsPrototype.__proto__));
      writer.writeLn("dynamicPrototype: " + ASClass.labelObject(this.dynamicPrototype));
      writer.writeLn("dynamicPrototype.__proto__: " + ASClass.labelObject(this.dynamicPrototype.__proto__));
      writer.writeLn("instanceConstructor.prototype: " + ASClass.labelObject(this.instanceConstructor.prototype));

//      for (var k in this) {
//        var v = this[k];
//        if (v && ((typeof v === "function") || (typeof v === "object"))) {
//          if (v.traceId === undefined) {
//            v.traceId = ASClass.traceId ++;
//          }
//          if (typeof v === "function") {
//            writer.writeLns(k + ": " + v + " Function " + v.traceId);
//          } else {
//            writer.writeLns(k + ": " + v + " Object " + v.traceId);
//          }
//        } else {
//          writer.writeLns(k + ": " + v);
//        }
//      }
      writer.leave("}");
    }
  }

  var ASClassPrototype = ASClass.prototype;

  (<any>ASClassPrototype).call = Function.prototype.call;
  (<any>ASClassPrototype).apply = Function.prototype.apply;

  export class ASFunction extends ASObject {
    public static baseClass: typeof ASClass = null;
    public static classInfo: ClassInfo;
    public static instanceConstructor: any = Function;
    public static classBindings: ClassBindings;
    public static instanceBindings: InstanceBindings;
    public static staticNatives: any [] = [Function];
    public static instanceNatives: any [] = [Function.prototype];

    constructor() {
      false && super();
    }

    get native_prototype(): Object {
      var self: Function = <any>this;
      return self.prototype;
    }

    set native_prototype(p) {
      var self: Function = <any>this;
      self.prototype = p;
    }

    get native_length(): number {
      // Check if we're getting the length of a trampoline.
      if (this.hasOwnProperty(Runtime.VM_LENGTH)) {
        return this.asLength;
      }
      return (<any>this).length;
    }

    asCall: (self?, ...args: any []) => any;
    asApply: (self?, args?: any []) => any;
  }

  export class ASBoolean extends ASObject {
    public static instanceConstructor: any = Boolean;
    public static callableConstructor: any = ASBoolean.instanceConstructor;
    public static classBindings: ClassBindings;
    public static instanceBindings: InstanceBindings;
    public static classInfo: ClassInfo;
    public static staticNatives: any [] = null;
    public static instanceNatives: any [] = null;
    public static coerce: (value: any) => boolean = Runtime.asCoerceBoolean;

    constructor(value: any = undefined) {
      false && super();
    }
  }

  ASBoolean.prototype.toString = Boolean.prototype.toString;
  ASBoolean.prototype.valueOf = Boolean.prototype.valueOf;

  export class ASMethodClosure extends ASFunction {
    public static staticNatives: any [] = null;
    public static instanceNatives: any [] = null;
    public static instanceConstructor: any = ASMethodClosure;

    constructor(self, fn) {
      false && super();
      var bound = Shumway.FunctionUtilities.bindSafely(fn, self);
      defineNonEnumerableProperty(this, "call", bound.call.bind(bound));
      defineNonEnumerableProperty(this, "apply", bound.apply.bind(bound));
    }

    toString() {
      return "function Function() {}";
    }
  }

  export class ASNumber extends ASObject {
    public static instanceConstructor: any = Number;
    public static callableConstructor: any = ASNumber.instanceConstructor;
    public static classBindings: ClassBindings;
    public static instanceBindings: InstanceBindings;
    public static classInfo: ClassInfo;
    public static staticNatives: any [] = [Math];
    public static instanceNatives: any [] = [Number.prototype];
    public static defaultValue: any = Number(0);
    public static coerce: (value: any) => number = Runtime.asCoerceNumber;

    static _numberToString(n: number, radix: number): string {
      radix = radix | 0;
      return Number(n).toString(radix);
    }

    static _minValue(): number {
      return Number.MIN_VALUE;
    }
  }

  export class ASInt extends ASObject {
    public static instanceConstructor: any = ASInt;
    public static callableConstructor: any = ASInt.instanceConstructor;
    public static classBindings: ClassBindings;
    public static instanceBindings: InstanceBindings;
    public static classInfo: ClassInfo;
    public static staticNatives: any [] = [Math];
    public static instanceNatives: any [] = [Number.prototype];
    public static defaultValue: any = 0;
    public static coerce: (value: any) => number = Runtime.asCoerceInt;

    constructor(value: any) {
      false && super();
      return Object(Number(value | 0));
    }

    public static asCall(self: any, ...argArray: any[]): any {
      return argArray[0] | 0;
    }

    public static asApply(self: any, argArray?: any): any {
      return argArray[0] | 0;
    }

    /**
     * In AS3, |new int(42) instanceof int| is |false|.
     */
    public static isInstanceOf(value: any): boolean {
      return false;
    }

    public static isType(value: any): boolean {
      if (isNumber(value) || value instanceof Number) {
        value = +value; // Make sure value is unboxed.
        return (value | 0) === value;
      }
      return false;
    }
  }

  export class ASUint extends ASObject {
    public static instanceConstructor: any = ASUint;
    public static callableConstructor: any = ASUint.instanceConstructor;
    public static classBindings: ClassBindings;
    public static instanceBindings: InstanceBindings;
    public static classInfo: ClassInfo;
    public static staticNatives: any [] = [Math];
    public static instanceNatives: any [] = [Number.prototype];
    public static defaultValue: any = 0;
    public static coerce: (value: any) => number = Runtime.asCoerceUint;

    constructor(value: any) {
      false && super();
      return Object(Number(value >>> 0));
    }

    public static asCall(self: any, ...argArray: any[]): any {
      return argArray[0] >>> 0;
    }

    public static asApply(self: any, argArray?: any): any {
      return argArray[0] >>> 0;
    }

    /**
     * In AS3, |new int(42) instanceof int| is |false|.
     */
    public static isInstanceOf(value: any): boolean {
      return false;
    }

    public static isType(value: any): boolean {
      if (isNumber(value) || value instanceof Number) {
        value = +value; // Make sure value is unboxed.
        return (value >>> 0) === value;
      }
      return false;
    }
  }

  export class ASString extends ASObject {
    public static instanceConstructor: any = String;
    public static callableConstructor: any = ASString.instanceConstructor;
    public static classBindings: ClassBindings;
    public static instanceBindings: InstanceBindings;
    public static classInfo: ClassInfo;
    public static staticNatives: any [] = [String];
    public static instanceNatives: any [] = [String.prototype];
    public static coerce: (value: any) => string = Runtime.asCoerceString;
    get native_length(): number {
      return (<any>this).length;
    }

    match(re) {
      if (re === (void 0) || re === null) {
        return null;
      } else {
        if (re instanceof RegExp && re.global) {
          var matches = [], m;
          while ((m = re.exec(this))) {
            matches.push(m[0]);
          }
          return matches;
        }
        if (!(re instanceof RegExp) && !(typeof re === 'string')) {
          re = String(re);
        }
        return this.match(re);
      }
    }

    search(re) {
      if (re === void 0) {
        return -1;
      } else {
        return this.search(re);
      }
    }

    toUpperCase() {
      // avmshell bug compatibility
      var str = String.prototype.toUpperCase.apply(this);
      var str = str.replace(/\u039C/g, String.fromCharCode(181));
      return str;
    }

    toLocaleUpperCase() {
      // avmshell bug compatibility
      var str = String.prototype.toLocaleUpperCase.apply(this);
      var str = str.replace(/\u039C/g, String.fromCharCode(181));
      return str;
    }
  }

  /**
   * Format: args: [compareFunction], [sortOptions]
   */
  export function arraySort(o, args) {
    if (args.length === 0) {
      return o.sort();
    }
    var compareFunction, options = 0;
    if (args[0] instanceof Function) {
      compareFunction = args[0];
    } else if (isNumber(args[0])) {
      options = args[0];
    }
    if (isNumber(args[1])) {
      options = args[1];
    }
    o.sort(function (a, b) {
      return asCompare(a, b, options, compareFunction);
    });
    return o;
  }

  export class ASArray extends ASObject {
    public static instanceConstructor: any = Array;
    public static staticNatives: any [] = [Array];
    public static instanceNatives: any [] = [Array.prototype];

    static CACHE_NUMERIC_COMPARATORS = true;
    static numericComparatorCache = createEmptyObject();

    private static _splice(o: any, args: any []): any [] {
      if (args.length === 0) {
        return undefined;
      }
      return o.splice.apply(o, args);
    }
    private static _sort(o: any, args: any []): any {
      if (args.length === 0) {
        return o.sort();
      }
      var compareFunction, options = 0;
      if (args[0] instanceof Function) {
        compareFunction = args[0];
      } else if (isNumber(args[0])) {
        options = args[0];
      }
      if (isNumber(args[1])) {
        options = args[1];
      }
      o.sort(function (a, b) {
        return Runtime.asCompare(a, b, options, compareFunction);
      });
      return o;
    }
    private static _sortOn(o: any, names: any, options: any): any {
      if (isString(names)) {
        names = [names];
      }
      if (isNumber(options)) {
        options = [options];
      }
      for (var i = names.length - 1; i >= 0; i--) {
        var key = Multiname.getPublicQualifiedName(names[i]);
        if (ASArray.CACHE_NUMERIC_COMPARATORS && options[i] & SORT.NUMERIC) {
          var str = "var x = +(a." + key + "), y = +(b." + key + ");";
          if (options[i] & SORT.DESCENDING) {
            str += "return x < y ? 1 : (x > y ? -1 : 0);";
          } else {
            str += "return x < y ? -1 : (x > y ? 1 : 0);";
          }
          var numericComparator = ASArray.numericComparatorCache[str];
          if (!numericComparator) {
            numericComparator = ASArray.numericComparatorCache[str] = new Function("a", "b", str);
          }
          o.sort(numericComparator);
        } else {
          o.sort(function (a, b) {
            return Runtime.asCompare(a[key], b[key], options[i] | 0);
          });
        }
      }
      return o;
    }
    private static _every(o: any, callback: Function, thisObject: any): boolean {
      for (var i = 0; i < o.length; i++) {
        if (callback.call(thisObject, o[i], i, o) !== true) {
          return false;
        }
      }
      return false;
    }
    private static _filter(o: any, callback: Function, thisObject: any): any [] {
      var result = [];
      for (var i = 0; i < o.length; i++) {
        if (callback.call(thisObject, o[i], i, o) === true) {
          result.push(o[i]);
        }
      }
      return result;
    }
    get native_length(): number /*uint*/ {
      return (<any>this).length;
    }
    set native_length(newLength: number /*uint*/) {
      newLength = newLength >>> 0;
      (<any>this).length = newLength;
    }
  }

  export class ASVector<T> extends ASNative {
    public static staticNatives: any [] = null;
    public static instanceNatives: any [] = null;
    public static instanceConstructor: any = ASVector;
    public static callableConstructor: any = null;
    newThisType(): ASVector<T> {
      return new this.class.instanceConstructor();
    }
  }

  export class ASIntVector extends ASVector<ASInt> {
    public static instanceConstructor: any = Int32Vector;
    public static staticNatives: any [] = [Int32Vector];
    public static instanceNatives: any [] = [Int32Vector.prototype, ASVector.prototype];
    public static callableConstructor: any = Int32Vector.callable;

    private static _every(o: any, callback: Function, thisObject: any): boolean {
      return o.every(callback, thisObject);
    }
    private static _forEach(o: any, callback: Function, thisObject: any): void {
      return o.forEach(callback, thisObject);
    }
    private static _some(o: any, callback: Function, thisObject: any): boolean {
      return o.some(callback, thisObject);
    }
    private static _sort: (o: any, args: any []) => any = arraySort;
  }

  export class ASUIntVector extends ASVector<ASUint>{
    public static instanceConstructor: any = Uint32Vector;
    public static staticNatives: any [] = [Uint32Vector];
    public static instanceNatives: any [] = [Uint32Vector.prototype, ASVector.prototype];
    public static callableConstructor: any = Uint32Vector.callable;
    private static _every(o: any, callback: Function, thisObject: any): boolean {
      return o.every(callback, thisObject);
    }
    private static _forEach(o: any, callback: Function, thisObject: any): void {
      return o.forEach(callback, thisObject);
    }
    private static _some(o: any, callback: Function, thisObject: any): boolean {
      return o.some(callback, thisObject);
    }
    private static _sort: (o: any, args: any []) => any = arraySort;
  }

  export class ASDoubleVector extends ASVector<ASNumber> {
    public static instanceConstructor: any = Float64Vector;
    public static staticNatives: any [] = [Float64Vector];
    public static instanceNatives: any [] = [Float64Vector.prototype, ASVector.prototype];
    public static callableConstructor: any = Float64Vector.callable;
    private static _every(o: any, callback: Function, thisObject: any): boolean {
      return o.every(callback, thisObject);
    }
    private static _forEach(o: any, callback: Function, thisObject: any): void {
      return o.forEach(callback, thisObject);
    }
    private static _some(o: any, callback: Function, thisObject: any): boolean {
      return o.some(callback, thisObject);
    }
    private static _sort: (o: any, args: any []) => any = arraySort;
  }

  export class ASJSON extends ASObject {
    public static instanceConstructor: any = ASJSON;
    public static staticNatives: any [] = null;
    public static instanceNatives: any [] = null;

    /**
     * Transforms a JS value into an AS value.
     */
    private static transformJSValueToAS(value) {
      if (typeof value !== "object") {
        return value;
      }
      var keys = Object.keys(value);
      var result = value instanceof Array ? [] : {};
      for (var i = 0; i < keys.length; i++) {
        result.asSetPublicProperty(keys[i], ASJSON.transformJSValueToAS(value[keys[i]]));
      }
      return result;
    }

    /**
     * Transforms an AS value into a JS value.
     */
    private static transformASValueToJS(value) {
      if (typeof value !== "object") {
        return value;
      }
      if (isNullOrUndefined(value)) {
        return value;
      }
      var keys = Object.keys(value);
      var result = value instanceof Array ? [] : {};
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var jsKey = key;
        if (!isNumeric(key)) {
          jsKey = Multiname.getNameFromPublicQualifiedName(key);
        }
        result[jsKey] = ASJSON.transformASValueToJS(value[key]);
      }
      return result;
    }

    private static parseCore(text: string): Object {
      text = asCoerceString(text);
      return ASJSON.transformJSValueToAS(JSON.parse(text))
    }

    private static stringifySpecializedToString(value: Object, replacerArray: any [], replacerFunction: (key: string, value: any) => any, gap: string): string {
      return JSON.stringify(ASJSON.transformASValueToJS(value), replacerFunction, gap);
    }
  }

  export class ASError extends ASNative {
    public static instanceConstructor: any = null;
    public static staticNatives: any [] = null;
    public static instanceNatives: any [] = null;
    public static getErrorMessage = Shumway.AVM2.getErrorMessage;
    public getStackTrace(): string {
      return Shumway.AVM2.Runtime.AVM2.getStackTrace();
    }
    constructor(msg: any = "", id: any = 0) {
      false && super();
      notImplemented("ASError");
    }
  }

  export class ASDefinitionError extends ASError { }
  export class ASEvalError extends ASError { }
  export class ASRangeError extends ASError { }
  export class ASReferenceError extends ASError { }
  export class ASSecurityError extends ASError { }
  export class ASSyntaxError extends ASError { }
  export class ASTypeError extends ASError { }
  export class ASURIError extends ASError { }
  export class ASVerifyError extends ASError { }
  export class ASUninitializedError extends ASError { }
  export class ASArgumentError extends ASError { }

  export class ASRegExp extends ASObject {
    public static instanceConstructor: any = XRegExp;
    public static staticNatives: any [] = [XRegExp];
    public static instanceNatives: any [] = [XRegExp.prototype];

    get native_source(): string {
      var self: any = this;
      return self.source;
    }

    get native_global(): boolean {
      var self: any = this;
      return self.global;
    }

    get native_ignoreCase(): boolean {
      var self: any = this;
      return self.ignoreCase;
    }

    get native_multiline(): boolean {
      var self: any = this;
      return self.multiline;
    }

    get native_lastIndex(): number /*int*/ {
      var self: any = this;
      return self.lastIndex;
    }

    set native_lastIndex(i: number /*int*/) {
      var self: any = this;
      i = i | 0;
      self.lastIndex = i;
    }

    get native_dotall(): boolean {
      var self: any = this;
      return self.dotall;
    }

    get native_extended(): boolean {
      var self: any = this;
      return self.extended;
    }

    exec(s: string = ""): any {
      var result = RegExp.prototype.exec.apply(this, arguments);
      if (!result) {
        return result;
      }
      // For some reason named groups in AS3 are set to the empty string instead of
      // undefined as is the case for indexed groups. Here we just emulate the AS3
      // behaviour.
      var keys = Object.keys(result);
      for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        if (!isNumeric(k)) {
          if (result[k] === undefined) {
            result[k] = "";
          }
        }
      }
      Shumway.AVM2.Runtime.publicizeProperties(result);
      return result;
    }
  }

  export class ASMath extends ASNative {
    public static staticNatives: any [] = [Math];
  }

  export class ASDate extends ASNative {
    public static staticNatives: any [] = [Date];
    public static instanceNatives: any [] = [Date.prototype];
    public static instanceConstructor: any = Date;
  }

  var builtinNativeClasses: Shumway.Map<ASClass> = Shumway.ObjectUtilities.createMap<ASClass>();

  var isInitialized: boolean = false;

  export function initialize(domain: ApplicationDomain) {
    if (isInitialized) {
      return;
    }

    builtinNativeClasses["ObjectClass"]              = ASObject;
    builtinNativeClasses["Class"]                    = ASClass;
    builtinNativeClasses["FunctionClass"]            = ASFunction;
    builtinNativeClasses["BooleanClass"]             = ASBoolean;
    builtinNativeClasses["MethodClosureClass"]       = ASMethodClosure;
    builtinNativeClasses["NamespaceClass"]           = ASNamespace;
    builtinNativeClasses["NumberClass"]              = ASNumber;
    builtinNativeClasses["IntClass"]                 = ASInt;
    builtinNativeClasses["UIntClass"]                = ASUint;
    builtinNativeClasses["StringClass"]              = ASString;
    builtinNativeClasses["ArrayClass"]               = ASArray;
    builtinNativeClasses["VectorClass"]              = ASVector;
    builtinNativeClasses["ObjectVectorClass"]        = GenericVector;
    builtinNativeClasses["IntVectorClass"]           = ASIntVector;
    builtinNativeClasses["UIntVectorClass"]          = ASUIntVector;
    builtinNativeClasses["DoubleVectorClass"]        = ASDoubleVector;
    builtinNativeClasses["JSONClass"]                = ASJSON;
    builtinNativeClasses["XMLClass"]                 = ASXML;
    builtinNativeClasses["XMLListClass"]             = ASXMLList;
    builtinNativeClasses["QNameClass"]               = ASQName;



    // Errors
    builtinNativeClasses["ErrorClass"]               = ASError;
    builtinNativeClasses["DefinitionErrorClass"]     = ASDefinitionError;
    builtinNativeClasses["EvalErrorClass"]           = ASEvalError;
    builtinNativeClasses["RangeErrorClass"]          = ASRangeError;
    builtinNativeClasses["ReferenceErrorClass"]      = ASReferenceError;
    builtinNativeClasses["SecurityErrorClass"]       = ASSecurityError;
    builtinNativeClasses["SyntaxErrorClass"]         = ASSyntaxError;
    builtinNativeClasses["TypeErrorClass"]           = ASTypeError;
    builtinNativeClasses["URIErrorClass"]            = ASURIError;
    builtinNativeClasses["VerifyErrorClass"]         = ASVerifyError;
    builtinNativeClasses["UninitializedErrorClass"]  = ASUninitializedError;
    builtinNativeClasses["ArgumentErrorClass"]       = ASArgumentError;

    builtinNativeClasses["DateClass"]                = ASDate;
    builtinNativeClasses["MathClass"]                = ASMath;

    builtinNativeClasses["RegExpClass"]              = ASRegExp;

    /**
     * If the Linker links against flash.* classes then we end up in a cycle. A reference to
     * |flash.utils.ByteArray| for instance would cause us to initialize the |ByteArray| class,
     * when we're not fully initialized ourselves. To get around this we make sure we don't refer
     * to possibly linked classes by prefixing their names with "Original".
     */

    // flash.utils
    builtinNativeClasses["ProxyClass"]               = flash.utils.OriginalProxy;
    builtinNativeClasses["DictionaryClass"]          = flash.utils.OriginalDictionary;
    builtinNativeClasses["ByteArrayClass"]           = flash.utils.OriginalByteArray;
    // flash.system
    builtinNativeClasses["SystemClass"]              = flash.system.OriginalSystem;

    isInitialized = true;
  }


  var nativeClasses: Shumway.Map<ASClass> = Shumway.ObjectUtilities.createMap<ASClass>();
  var nativeFunctions: Shumway.Map<Function> = Shumway.ObjectUtilities.createMap<Function>();

  export function registerNativeClass(name: string, cls: ASClass) {
    release || assert (!nativeClasses[name], "Native class: " + name + " is already registered.");
    nativeClasses[name] = cls;
  }

  export function registerNativeFunction(name: string, fn: Function) {
    release || assert (!nativeFunctions[name], "Native function: " + name + " is already registered.");
    nativeFunctions[name] = fn;
  }

  export function createInterface(classInfo: ClassInfo) {
    var ii = classInfo.instanceInfo;
    release || assert(ii.isInterface());
    var cls = new ASClass(classInfo);
    cls.interfaceBindings = new InstanceBindings(null, ii, null, null);
    cls.verify();
    return cls;
  }

  /**
   * We need to patch up the prototypes of all classes that are created before the Class class is constructed.
   * Here we store the classes that need to be patched.
   */
  var morphPatchList = [];

  export function createClass(classInfo: ClassInfo, baseClass: ASClass, scope: Scope) {
    var ci = classInfo;
    var ii = ci.instanceInfo;
    var domain = ci.abc.applicationDomain;
    var isNativeClass = ci.native;
    var cls: ASClass;
    if (isNativeClass) {
      cls = builtinNativeClasses[ci.native.cls];
      if (!cls) {
        cls = nativeClasses[ci.native.cls];
      }
      if (!cls) {
        Shumway.Debug.unexpected("No native class for " + ci.native.cls);
      }
      cls.morphIntoASClass(classInfo);
      if (morphPatchList) {
        morphPatchList.push(cls);
      }
    } else {
      cls = new ASClass(classInfo);
    }

    var classScope = new Scope(scope, null);
    classScope.object = cls;
    var instanceConstructor = null;
    if (ii.init.isNative()) {
      release || assert (isNativeClass);
      instanceConstructor = cls;
    } else {
      instanceConstructor = createFunction(ii.init, classScope, false, false);
    }

    /**
     * Only collect natives for native classes.
     */

    var staticNatives: Object [] = null;
    var instanceNatives: Object [] = null;

    if (isNativeClass) {
      staticNatives = [cls];
      if (cls.staticNatives) {
        Shumway.ArrayUtilities.pushMany(staticNatives, cls.staticNatives);
      }
      instanceNatives = [cls.prototype];
      if (cls.instanceNatives) {
        Shumway.ArrayUtilities.pushMany(instanceNatives, cls.instanceNatives);
      }
    }

    ASClass.create(cls, baseClass, instanceConstructor);
    release || cls.verify();

    // Once we see the Class class patch up the prototypes of all the classes
    // that were constructed before, including this one.
    if (classInfo.instanceInfo.name.name === "Class") {
      for (var i = 0; i < morphPatchList.length; i++) {
        morphPatchList[i].__proto__ = ASClass.prototype;
      }
      morphPatchList = null;
    }

    enterTimeline("ClassBindings");
    cls.classBindings = new ClassBindings(classInfo, classScope, staticNatives);
    enterTimeline("applyTo");
    cls.classBindings.applyTo(domain, cls);
    leaveTimeline();
    leaveTimeline();

    enterTimeline("InstanceBindings");
    cls.instanceBindings = new InstanceBindings(baseClass ? baseClass.instanceBindings : null,
                                                ii, classScope, instanceNatives);
    if (cls.instanceConstructor) {
      enterTimeline("applyTo");
      cls.instanceBindings.applyTo(domain, cls.traitsPrototype);
      leaveTimeline();
    }
    leaveTimeline();

    cls.implementedInterfaces = cls.instanceBindings.implementedInterfaces;

    if (cls === <any>ASClass) {
      cls.instanceBindings.applyTo(domain, ASObject, true);
    } else if (ASClass.instanceBindings) {
      ASClass.instanceBindings.applyTo(domain, cls, true);
    }

    enterTimeline("Configure");
    ASClass.configureInitializers(cls);
    ASClass.linkSymbols(cls);
    ASClass.runClassInitializer(cls);
    leaveTimeline();

    return cls;
  }

  /**
   * These functions should never leak into the AS3 world.
   */
  var illegalAS3Functions = [
    Runtime.forwardValueOf,
    Runtime.forwardToString
  ];

  /**
   * Searches for a native property in a list of native holders.
   */
  export function getMethodOrAccessorNative(trait: Trait, natives: Object []): any {
    var name = escapeNativeName(Multiname.getName(trait.name));
    debug && log("getMethodOrAccessorNative(" + name + ")");
    for (var i = 0; i < natives.length; i++) {
      var native = natives[i];
      var fullName = name;
      // Check for cases where the method has been patched, as could be the case for
      // toString and valueOf.
      if (hasOwnProperty(native, "original_" + name)) {
        fullName = "original_" + name;
      }
      // Because of name conflicts we need to prefix some names with "native_" sometimes,
      // check for that case here.
      if (!hasOwnProperty(native, name) && hasOwnProperty(native, "native_" + name)) {
        fullName = "native_" + name;
      }
      if (hasOwnProperty(native, fullName)) {
        var value;
        if (trait.isAccessor()) {
          var pd = getOwnPropertyDescriptor(native, fullName);
          if (trait.isGetter()) {
            value = pd.get;
          } else {
            value = pd.set;
          }
        } else {
          release || assert (trait.isMethod());
          value = native[fullName];
        }
        release || assert (value, "Method or Accessor property exists but it's undefined: " + trait);
        release || assert (illegalAS3Functions.indexOf(value) < 0, "Leaking illegal function.");
        return value;
      }
    }
    Shumway.Debug.warning("No native method for: " + trait.kindName() + " " +
                          trait.methodInfo.holder + "::" + Multiname.getQualifiedName(trait.name) +
                          ", make sure you've got the static keyword for static methods.");
    //release || assertUnreachable("Cannot find " + trait + " in natives.");
    return null;
  }

  /**
   * This is to avoid conflicts with JS properties.
   */
  export function escapeNativeName(name: string) {
    switch (name) {
      case "prototype":             return "native_prototype";
      case "hasOwnProperty":        return "native_hasOwnProperty";
      case "isPrototypeOf":         return "native_isPrototypeOf";
      case "propertyIsEnumerable":  return "native_propertyIsEnumerable";
      default:                      return name;
    }
  }

  /**
   * Other natives can live in this module
   */
  export module Natives {
    // Expose Some Builtin Objects
    export var String = jsGlobal.String;
    export var Function = jsGlobal.Function;
    export var Boolean = jsGlobal.Boolean;
    export var Number = jsGlobal.Number;
    export var Date = jsGlobal.Date;
    export var ASObject = Shumway.AVM2.AS.ASObject;

    function makeOriginalPrototype(constructor: Function) {
      var o = { prototype: createEmptyObject() }
      var keys = Object.getOwnPropertyNames(constructor.prototype);
      for (var i = 0; i < keys.length; i++) {
        o.prototype[keys[i]] = constructor.prototype[keys[i]];
      }
      return o;
    }

    /**
     * Make a copy of the original prototype functions in case they are patched. This is to
     * prevent cyycles.
     */
    export var Original = {
      Date: makeOriginalPrototype(Date),
      Array: makeOriginalPrototype(Array),
      String: makeOriginalPrototype(String),
      Number: makeOriginalPrototype(Number),
      Boolean: makeOriginalPrototype(Boolean)
    }

    export function print(...args: any []) {
      jsGlobal.print.apply(null, args);
    }

    export function debugBreak(v: any) {
      debugger;
    }

    export function bugzilla(n) {
      switch (n) {
        case 574600: // AS3 Vector::map Bug
          return true;
      }
      return false;
    }

    export var decodeURI: (encodedURI: string) => string = jsGlobal.decodeURI;
    export var decodeURIComponent: (encodedURIComponent: string) =>  string = jsGlobal.decodeURIComponent;
    export var encodeURI: (uri: string) => string = jsGlobal.encodeURI;
    export var encodeURIComponent: (uriComponent: string) => string = jsGlobal.encodeURIComponent;
    export var isNaN: (number: number) => boolean = jsGlobal.isNaN;
    export var isFinite: (number: number) => boolean = jsGlobal.isFinite;
    export var parseInt: (s: string, radix?: number) => number = jsGlobal.parseInt;
    export var parseFloat: (string: string) => number = jsGlobal.parseFloat;
    export var escape: (x: any) => any = jsGlobal.escape;
    export var unescape: (x: any) => any = jsGlobal.unescape;
    export var isXMLName: (x: any) => boolean;
    export var notImplemented: (x: any) => void = Shumway.Debug.notImplemented;

    /**
     * Returns the fully qualified class name of an object.
     */
    export function getQualifiedClassName(value: any):string {
      if (value === null) {
        return "null";
      } else if (value === undefined) {
        return "void";
      }
      if (ASInt.isType(value)) {
        return "int";
      }
      value = boxValue(value)
      if (ASClass.isType(value)) {
        return (<ASClass> value).getQualifiedClassName();
      }
      return value.class.getQualifiedClassName();
    }

    /**
     * Returns the fully qualified class name of the base class of the object specified by the |value| parameter.
     */
    export function getQualifiedSuperclassName(value: any) {
      if (isNullOrUndefined(value)) {
        return "null";
      }
      value = boxValue(value);
      var cls: ASClass = ASClass.isType(value) ? value : value.class;
      if (!cls.baseClass) {
        return "null";
      }
      return cls.baseClass.getQualifiedClassName();
    }

    /**
     * Returns the class with the specified name, or |null| if no such class exists.
     */
    export function getDefinitionByName(name: string): ASClass {
      var simpleName = String(name).replace("::", ".");
      var cls = Shumway.AVM2.Runtime.AVM2.currentDomain().getClass(simpleName, false);
      return cls || null;
    }

    export function describeTypeJSON(value: any, flags: number) {
      return Shumway.AVM2.AS.describeTypeJSON(value, flags);
    }
  }

  /**
   * Searchs for natives using a string path "a.b.c...".
   */
  export function getNative(path: string): Function {
    debug && log("getNative(" + path + ")");
    var chain = path.split(".");
    var v = Natives;
    for (var i = 0, j = chain.length; i < j; i++) {
      v = v && v[chain[i]];
    }

    if (!v) {
      v = <any>nativeFunctions[path];
    }

    release || assert(v, "getNative(" + path + ") not found.");
    release || assert (illegalAS3Functions.indexOf(<any>v) < 0, "Leaking illegal function.");
    return <any>v;
  }

  registerNativeFunction("unsafeJSNative", getNative);
}

