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
  import isNumber = Shumway.isNumber;
  import createObject = Shumway.ObjectUtilities.createObject;
  import isPrototypeWriteable = Shumway.ObjectUtilities.isPrototypeWriteable;
  import getOwnPropertyDescriptor = Shumway.ObjectUtilities.getOwnPropertyDescriptor;
  import notImplemented = Shumway.Debug.notImplemented;
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;
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

  declare var arraySort;
  declare var XRegExp;

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

  export enum CallableStyle {
    /**
     * Calls class instance constructor.
     */
    PASSTHROUGH      = 0x0,

    /**
     * Coerces value to the class type.
     */
    COERCE           = 0x1
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
    public static callableConstructor: any = ASObject.instanceConstructor;

    public static classBindings: ClassBindings;
    public static instanceBindings: InstanceBindings;
    public static interfaceBindings: InstanceBindings;
    public static staticNatives: any [];
    public static instanceNatives: any [];
    public static traitsPrototype: Object;
    public static dynamicPrototype: Object;
    public static defaultValue: any = null;
    public static initializationFlags: InitializationFlags = InitializationFlags.NONE;
    public static callableStyle: CallableStyle = CallableStyle.PASSTHROUGH;
    public static native_prototype: Object;
    public static implementedInterfaces: Shumway.Map<ASClass>;
    public static isInterface: () => boolean;
    public static applyType: (type: ASClass) => ASClass;
    public static protocol: IProtocol;

    public static call(): any {
      // We need to change TS here not to emit super calls.
      log("ASObject::call - Ignoring Super Call");
    }

    public static apply(): any {
      // We need to change TS here not to emit super calls.
      log("ASObject::apply - Ignoring Super Call");
    }

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

    public static coerce: (value: any) => any = Runtime.asCoerceObject;

    public static isInstanceOf: (value: any) => boolean;
    public static isType: (value: any) => boolean;

    public static asCall(self: any, ...argArray: any[]): any {
      assert (this.callableStyle === CallableStyle.PASSTHROUGH);
      return this.callableConstructor.apply(self, argArray);
    }

    public static asApply(self: any, argArray?: any): any {
      assert (this.callableStyle === CallableStyle.PASSTHROUGH);
      return this.callableConstructor.apply(self, argArray);
    }

    public static verify() {
      ASClassPrototype.verify.call(this);
    }

    public static trace(writer: IndentingWriter) {
      ASClassPrototype.trace.call(this, writer);
    }

    static _setPropertyIsEnumerable(o, V: string, enumerable: boolean): void {
      var name = Multiname.getPublicQualifiedName(V);
      var descriptor = getOwnPropertyDescriptor(o, name);
      descriptor.enumerable = false;
      Object.defineProperty(o, name, descriptor);
    }

    static _hasOwnProperty(o, V: string): boolean {
      notImplemented("_hasOwnProperty");
      return false;
    }

    static _propertyIsEnumerable(o, V: string): boolean {
      notImplemented("_propertyIsEnumerable");
      return false;
    }

    static _isPrototypeOf(o, V): boolean {
      notImplemented("_isPrototypeOf");
      return false;
    }

    static _toString(o: Object): string {
      o = boxValue(o);
      if (o instanceof ASClass) {
        var cls: ASClass = <any>o;
        return "[class " + cls.classInfo.instanceInfo.name.name + "]";
      }
      return "[object " + o.class.classInfo.instanceInfo.name.name + "]";
    }

    // Hack to make the TypeScript compiler find the original Object.defineProperty.
    static defineProperty = Object.defineProperty;

    static native_isPrototypeOf: (V: Object) => boolean;
    static native_hasOwnProperty: (V: string) => boolean;
    static native_propertyIsEnumerable: (V: string) => boolean;

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

  }

  /**
   * Inherit from this if you don't want to inherit the junk from ASObject
   */
  export class ASNative extends ASObject {
    public static baseClass: typeof ASClass = null;
    public static classInfo: ClassInfo = null;
    public static instanceConstructor: any = null;
    public static classBindings: ClassBindings = null;
    public static instanceBindings: InstanceBindings = null;
    public static staticNatives: any [] = null;
    public static instanceNatives: any [] = null;
    public static traitsPrototype: Object = null;
    public static dynamicPrototype: Object = null;
    public static defaultValue: any = null;
    public static initializationFlags: InitializationFlags = InitializationFlags.NONE;
    public static callableStyle: CallableStyle = CallableStyle.COERCE;
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
      assert (self.instanceConstructor);
      self.baseClass = baseClass;
      self.dynamicPrototype = self.traitsPrototype = self.instanceConstructor.prototype;
    }

    static configurePrototype(self: ASClass, baseClass: ASClass) {
      self.baseClass = baseClass;
      self.dynamicPrototype = createObject(baseClass.dynamicPrototype);
      if (self.instanceConstructor) {
        self.traitsPrototype = self.instanceConstructor.prototype;
        self.traitsPrototype.__proto__ = self.dynamicPrototype;
      } else {
        self.traitsPrototype = createObject(self.dynamicPrototype);
      }
    }

    /**
     * Called when the class is actually constructed during bytecode execution.
     */
    static create(self: ASClass, baseClass: ASClass, instanceConstructor: any) {
      assert (!self.instanceConstructorNoInitialize, "This should not be set yet.");
      assert (!self.dynamicPrototype && !self.traitsPrototype, "These should not be set yet.");
      if (self.instanceConstructor && !isPrototypeWriteable(self.instanceConstructor)) {
        ASClass.configureBuiltinPrototype(self, baseClass);
      } else {
        ASClass.configurePrototype(self, baseClass);
      }

      if (!self.instanceConstructor) {
        self.instanceConstructor = instanceConstructor;
      } else {
        writer && writer.warnLn("Ignoring AS3 instanceConstructor.");
      }

      self.instanceConstructorNoInitialize = self.instanceConstructor;
      self.instanceConstructor.prototype = self.traitsPrototype;
      self.instanceConstructor.prototype.class = self;

      if (self.protocol) {
        Shumway.ObjectUtilities.copyOwnPropertyDescriptors(self.traitsPrototype, self.protocol);
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
     * Set of implemented interfaces.
     */
    implementedInterfaces: Shumway.Map<ASClass>;

    defaultValue: any;

    /**
     * Initialization flags that determine how native initializers get called.
     */
    initializationFlags: InitializationFlags;

    /**
     * Defines the AS MetaObject Protocol, |null| if no protocol is used.
     */
    protocol: IProtocol;

    prototype: Object;

    /**
     * Non-native classes always have coercing callables.
     */
    callableStyle: CallableStyle;

    constructor(classInfo: ClassInfo) {
      false && super();
      this.classInfo = classInfo;
      this.staticNatives = null;
      this.instanceNatives = null;
      this.initializationFlags = InitializationFlags.NONE;
      this.callableStyle = CallableStyle.COERCE;
      this.defaultValue = null;
    }

    morphIntoASClass(classInfo: ClassInfo): void {
      assert (this.classInfo === classInfo);
      assert (this instanceof ASClass);
    }

    get native_prototype(): Object {
      assert (this.dynamicPrototype);
      return this.dynamicPrototype;
    }

    public asCall(self: any, ...argArray: any[]): any {
      assert (this.callableStyle === CallableStyle.COERCE);
      return Runtime.asCoerce(this, argArray[0])
    }

    public asApply(self: any, argArray?: any): any {
      assert (this.callableStyle === CallableStyle.COERCE);
      return Runtime.asCoerce(this, argArray[0])
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

    public coerce(value: any): any {
      log("Coercing " + value + " to " + this);
      return value;
    }

    public isInterface(): boolean {
      return this.classInfo.instanceInfo.isInterface();
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

      if (self === ASObject) {
        assert (!self.baseClass, "ASObject should have no base class.");
      } else {
        assert (self.baseClass, self.classInfo.instanceInfo.name + " has no base class.");
        assert (self.baseClass !== self);
      }

      assert (self.traitsPrototype === self.instanceConstructor.prototype, "The traitsPrototype is not set correctly.");

      if (self !== ASObject) {
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
      // dumpObject(this);
      writer.writeLn("baseClass: " + this);
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

    get length(): number {
      // Check if we're getting the length of a trampoline.
      if (this.hasOwnProperty(Runtime.VM_LENGTH)) {
        return this.asLength;
      }
      return this.length;
    }

    asCall: (self = undefined, ...args: any []) => any;
    asApply: (self = undefined, args: any [] = undefined) => any;
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
      Shumway.ObjectUtilities.defineNonEnumerableProperty(this, "call", bound.call.bind(bound));
      Shumway.ObjectUtilities.defineNonEnumerableProperty(this, "apply", bound.apply.bind(bound));
    }

    toString() {
      return "function Function() {}";
    }
  }

  export class ASNamespace extends ASObject {
    public static staticNatives: any [] = null;
    public static instanceNatives: any [] = null

    public static instanceConstructor: any = function(prefix: string = undefined, uri: string = undefined) {

    }

    get prefix(): any { notImplemented("get prefix"); return; }
    get uri(): String { notImplemented("get uri"); return; }
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

    static _numberToString(n: number, radix: number): string { notImplemented("_numberToString"); return; }
    static _convert(n: number, precision: number, mode: number): string { notImplemented("_convert"); return; }
    static _minValue(): number { notImplemented("_minValue"); return; }
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
      return Object(value | 0);
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
      return Object(value >>> 0);
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
    get length(): number {
      return this.length;
    }

    function match(re) {
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

    function search(re) {
      if (re === void 0) {
        return -1;
      } else {
        return this.search(re);
      }
    }

    function toUpperCase() {
      // avmshell bug compatibility
      var str = Sp.toUpperCase.apply(this);
      var str = str.replace(/\u039C/g, String.fromCharCode(181));
      return str;
    }

    function toLocaleUpperCase() {
      // avmshell bug compatibility
      var str = Sp.toLocaleUpperCase.apply(this);
      var str = str.replace(/\u039C/g, String.fromCharCode(181));
      return str;
    }
  }

  export class ASArray extends ASObject {
    public static instanceConstructor: any = Array;
    public static staticNatives: any [] = [Array];
    public static instanceNatives: any [] = [Array.prototype];

    static CACHE_NUMERIC_COMPARATORS = true;
    static numericComparatorCache = createEmptyObject();

    private static _pop(o: any): any {
      return o.reverse();
    }
    private static _reverse(o: any): any {
      return o.reverse();
    }
    private static _concat(o: any, args: any []): any [] {
      return o.concat.apply(o, args);
    }
    private static _shift(o: any): any {
      return o.shift();
    }
    private static _slice(o: any, A: number, B: number): any [] {
      A = +A; B = +B;
      return o.slice(A, B);
    }
    private static _unshift(o: any, args: any []): number /*uint*/ {
      return o.unshift.apply(o, args);
    }
    private static _splice(o: any, args: any []): any [] {
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
          var str = "var x = toNumber(a." + key + "), y = toNumber(b." + key + ");";
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
    private static _indexOf(o: any, searchElement: any, fromIndex: number /*int*/): number /*int*/ {
      fromIndex = fromIndex | 0;
      return o.indexOf(searchElement, fromIndex);
    }
    private static _lastIndexOf(o: any, searchElement: any, fromIndex: number /*int*/ = 0): number /*int*/ {
      fromIndex = fromIndex | 0;
      return o.lastIndexOf(searchElement, fromIndex);
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
    private static _forEach(o: any, callback: Function, thisObject: any): void {
      return o.forEach(callback, thisObject);
    }
    private static _map(o: any, callback: Function, thisObject: any): any [] {
      return o.map(callback, thisObject);
    }
    private static _some(o: any, callback: Function, thisObject: any): boolean {
      return o.some(callback, thisObject);
    }
    get length(): number /*uint*/ {
      return this.length;
    }
    set length(newLength: number /*uint*/) {
      newLength = newLength >>> 0;
      this.length = newLength;
    }
  }

  export class ASVector<T> extends ASObject {
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
      text = "" + text;
      return ASJSON.transformJSValueToAS(JSON.parse(text))
    }

    private static stringifySpecializedToString(value: Object, replacerArray: any [], replacerFunction: (key: string, value: any) => any, gap: string): string {
      return JSON.stringify(ASJSON.transformASValueToJS(value), replacerFunction, gap);
    }
  }

  export class ASXML extends ASObject {
    public static instanceConstructor: any = ASXML;
  }

  export class ASXMLList extends ASObject {
    public static instanceConstructor: any = ASXMLList;
  }

  export class ASQName extends ASObject {
    public static instanceConstructor: any = ASQName;
  }

  export class ASError extends ASObject {
    public static instanceConstructor: any = null;
    public static staticNatives: any [] = null;
    public static instanceNatives: any [] = null;
    public static getErrorMessage = Shumway.AVM2.getErrorMessage;
    public getStackTrace(): string {
      somewhatImplemented("Error.getStackTrace()");
      return Shumway.AVM2.Runtime.AVM2.getStackTrace();
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

    get source(): string {
      return this.source;
    }

    get global(): boolean {
      return this.global;
    }

    get ignoreCase(): boolean {
      return this.ignoreCase;
    }

    get multiline(): boolean {
      return this.multiline;
    }

    get lastIndex(): number /*int*/ {
      return this.lastIndex;
    }

    set lastIndex(i: number /*int*/) {
      i = i | 0;
      this.lastIndex = i;
    }

    get dotall(): boolean {
      return this.dotall;
    }

    get extended(): boolean {
      return this.extended;
    }

    exec(s: string = ""): any {
      var result = this.exec.apply(this, arguments);
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

  module XYZ {
    export class D extends ASNative {
      d () {
        log("instance d()");
      }

      static d () {
        log("static d()");
      }
    }

    export class E extends D {
      e () {
        log("instance e()");
      }

      static e () {
        log("static e()");
      }
    }
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
    builtinNativeClasses["intClass"]                 = ASInt;
    builtinNativeClasses["uintClass"]                = ASUint;
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

    builtinNativeClasses["RegExpClass"]              = ASRegExp;
    builtinNativeClasses["DictionaryClass"]          = flash.utils.Dictionary;

    isInitialized = true;
  }

  var nativeClasses: Shumway.Map<ASClass> = Shumway.ObjectUtilities.createMap<ASClass>();

  nativeClasses["D"] = XYZ.D;
  nativeClasses["E"] = XYZ.E;

  export function createInterface(classInfo: ClassInfo) {
    var ii = classInfo.instanceInfo;
    release || assert(ii.isInterface());
    var cls = new ASClass(classInfo);
    cls.interfaceBindings = new InstanceBindings(null, ii, null, null);
    cls.verify();
    return cls;
  }

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
    } else {
      cls = new ASClass(classInfo);
    }

    var classScope = new Scope(scope, null);
    classScope.object = cls;
    var instanceConstructor = createFunction(ii.init, classScope, false);

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
    cls.verify();

    cls.classBindings = new ClassBindings(classInfo, classScope, staticNatives);
    cls.classBindings.applyTo(domain, cls);

    cls.instanceBindings = new InstanceBindings(baseClass ? baseClass.instanceBindings : null, ii, classScope, instanceNatives);
    if (cls.instanceConstructor) {
      cls.instanceBindings.applyTo(domain, cls.traitsPrototype);
    }

    cls.implementedInterfaces = cls.instanceBindings.implementedInterfaces;

    if (cls === ASClass) {
      cls.instanceBindings.applyTo(domain, ASObject, true);
    } else if (ASClass.instanceBindings) {
      ASClass.instanceBindings.applyTo(domain, cls, true);
    }

    return cls;
  }

  /**
   * Searches for a native property in a list of native holders.
   */
  export function getMethodOrAccessorNative(trait: Trait, natives: Object []): any {
    var name = escapeNativeName(Multiname.getName(trait.name));
    for (var i = 0; i < natives.length; i++) {
      var native = natives[i];
      if (hasOwnProperty(native, name)) {
        var value;
        if (trait.isAccessor()) {
          var pd = getOwnPropertyDescriptor(native, name);
          if (trait.isGetter()) {
            value = pd.get;
          } else {
            value = pd.set;
          }
        } else {
          assert (trait.isMethod());
          value = native[name];
        }
        assert (value, "Method or Accessor property exists but it's undefined.");
        return value;
      }
    }
    log("Cannot find " + trait + " in " + natives);
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
}