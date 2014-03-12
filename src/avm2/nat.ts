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

interface JSObject extends Object {}
interface JSFunction extends Function {}

module Shumway.AVM2.AS {
  
  import Trait = Shumway.AVM2.ABC.Trait;
  import ClassInfo = Shumway.AVM2.ABC.ClassInfo;
  import Multiname = Shumway.AVM2.ABC.Multiname;
  import Namespace = Shumway.AVM2.ABC.Namespace;
  import ApplicationDomain = Shumway.AVM2.Runtime.ApplicationDomain;
  import Scope = Shumway.AVM2.Runtime.Scope;
  import hasOwnProperty = Shumway.ObjectUtilities.hasOwnProperty;
  import createObject = Shumway.ObjectUtilities.createObject;
  import getOwnPropertyDescriptor = Shumway.ObjectUtilities.getOwnPropertyDescriptor;
  import notImplemented = Shumway.Debug.notImplemented;
  import createFunction = Shumway.AVM2.Runtime.createFunction;
  import Runtime = Shumway.AVM2.Runtime;
  var writer = null; // new Shumway.IndentingWriter();

  import ClassBindings = Shumway.AVM2.Runtime.ClassBindings;
  import InstanceBindings = Shumway.AVM2.Runtime.InstanceBindings;

  declare var Int32Vector;
  declare var Uint32Vector;
  declare var Float64Vector;
  declare var arraySort;

  /**
   * This is all very magical, things are not what they seem, beware!!!
   *
   * The AS3 Class Hierarchy can be expressed as TypeScript, which is nice because
   * we get all sorts of compile time error checking and default arguments support.
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
  export interface IASClass {
    classInfo: ClassInfo;
    instanceConstructor: new (...args) => any;
    staticNatives?: any []
    prototype?: JSObject;
    instanceNatives?: any [];
    // prototype: any;
    construct: (baseClass: ASClass, instanceConstructor: any) => void;
    verify?: () => void;
    classBindings: ClassBindings;
    instanceBindings: InstanceBindings;

    isInstance: (any) => boolean;
    isInstanceOf: (any) => boolean;
    coerce: (any) => any;
    name: Multiname;

    traitsPrototype?: Object;
    dynamicPrototype?: Object;
    defaultValue: any;
  }

  /**
   * In order to avoid shadowing of JS top level Objects we prefix the AS top level
   * classes with the "AS" prefix.
   */
  
  export class ASObject {
    public static instanceConstructor: any = Object;
    public static classBindings: ClassBindings;
    public static instanceBindings: InstanceBindings;
    public static classInfo: ClassInfo;
    public static staticNatives: any [];
    public static instanceNatives: any [];
    public static traitsPrototype = Object.prototype;
    public static dynamicPrototype = Object.prototype;
    public static name: Multiname;
    public static defaultValue: any = null;
    static construct(baseClass: ASClass) {
      log("Constructing: Object Class");
      if (this !== ASObject) {
        log("Are you sure you don't want to override this?");
        ASClass.extend(this, baseClass);
      }
    }

    public static coerce(value: any): any {
      return Runtime.asCoerceObject(value);
    }

    public static isInstanceOf(value: any): boolean {
      if (value === null) {
        return false;
      }
      // In AS3, |true instanceof Object| is true. It seems that is the case for all primitive values
      // except for |undefined| which should throw an exception (TODO).
      return true;
    }

    public static isInstance(value: any): boolean {
      if (Shumway.isNullOrUndefined(value)) {
        return false;
      }
      return true;
    }

    public static verify() {
      // Verify that we have bindings for all native traits.
      writer && writer.enter("Verify Template: " + this.classInfo + " {");
      var traits = [this.classInfo.traits, this.classInfo.instanceInfo.traits];

      var staticNatives: JSObject [] = [this];
      if (this.staticNatives) {
        Shumway.ArrayUtilities.pushMany(staticNatives, this.staticNatives);
      }
      var instanceNatives: JSObject [] = [this.prototype];
      if (this.instanceNatives) {
        Shumway.ArrayUtilities.pushMany(instanceNatives, this.instanceNatives);
      }

      function has(objects: JSObject [], predicate: (object: JSObject, name: string) => boolean, name) {
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
          var name = trait.name.name;
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
            warn("Template is missing an implementation of the native " + (isClassTrait ? "static" : "instance") + " trait: " + trait + " in class: " + this.classInfo);
          }
          // Debug.assert(hasDefinition, "Template is missing an implementation of the native " + (isClassTrait ? "static" : "instance") + " trait: " + trait + " in class: " + this.classInfo);
        }
      }

      writer && writer.leave("}");
      Debug.assert(this.instanceConstructor, "Must have a constructor function.");
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

    static _toString(o): string {
      notImplemented("_toString");
      return "";
    }

    // Hack to make the TypeScript compiler find the original Object.defineProperty.
    static defineProperty = Object.defineProperty;

    isPrototypeOf(V = undefined): boolean {
      notImplemented("isPrototypeOf");
      return false;
    }

    hasOwnProperty(V = undefined): boolean {
      notImplemented("hasOwnProperty");
      return false;
    }

    propertyIsEnumerable(V = undefined): boolean {
      notImplemented("propertyIsEnumerable");
      return false;
    }
  }

  export class ASClass extends ASObject implements IASClass {
    public static instanceConstructor: any = ASClass;
    public static classBindings: ClassBindings;
    public static instanceBindings: InstanceBindings;
    public static classInfo: ClassInfo;
    public static staticNatives: any [];
    public static instanceNatives: any [];
    public static dynamicPrototype: Object;
    public static traitsPrototype: Object;

    static extend(self: IASClass, baseClass: IASClass) {
      self.dynamicPrototype = createObject(baseClass.dynamicPrototype);
      self.traitsPrototype = createObject(self.dynamicPrototype);
    }

    classInfo: ClassInfo;
    instanceConstructor: new (...args) => any;
    template: IASClass;
    staticNatives: JSObject [];
    instanceNatives: JSObject [];

    classBindings: ClassBindings;
    instanceBindings: InstanceBindings;

    baseClass: ASClass;
    traitsPrototype: Object;
    dynamicPrototype: Object;

    isInstance: (any) => boolean;
    isInstanceOf: (any) => boolean;
    coerce: (any) => any;
    name: Multiname;
    defaultValue: any = null;

    constructor(classInfo: ClassInfo) {
      super();
      this.classInfo = classInfo;
//      this.instanceConstructor = template.instanceConstructor;
//      this.template = template;
//      this.name = classInfo.instanceInfo.name;
    }

    static wrap(classInfo: ClassInfo, template: IASClass): IASClass {
      template.classInfo = classInfo;
      template.name = classInfo.instanceInfo.name;
      return template;
    }

    get prototype() {
      assert (this.dynamicPrototype);
      return this.dynamicPrototype;
    }

    /**
     * Called when the class is actually constructed during bytecode execution.
     */
    construct(baseClass: ASClass, instanceConstructor: any) {
      ASClass.extend(this, baseClass);
    }
  }

  export class ASFunction extends ASObject {
    public static instanceConstructor: any = Function;
    public static classBindings: ClassBindings;
    public static instanceBindings: InstanceBindings;
    public static classInfo: ClassInfo;
    public static staticNatives: any [] = [Function];
    public static instanceNatives: any [] = [Function.prototype];
    public static traitsPrototype = Function.prototype;
    public static dynamicPrototype = Function.prototype;

    constructor() {
      super();
    }

    get prototype() {
      return this.prototype;
    }

    set prototype(p) {
      this.prototype = p;
    }

    get length(): number {
      // Check if we're getting the length of a trampoline.
      if (this.hasOwnProperty(Runtime.VM_LENGTH)) {
        return this.asLength;
      }
      return this.length;
    }

    call: (self = undefined, ...args: any []) => any;
    apply: (self = undefined, args: any [] = undefined) => any;
  }

  export class ASBoolean extends ASObject {
    public static instanceConstructor: any = Boolean;
    public static classBindings: ClassBindings;
    public static instanceBindings: InstanceBindings;
    public static classInfo: ClassInfo;
    public static staticNatives: any [];
    public static instanceNatives: any [];
    public static traitsPrototype = Boolean.prototype;
    public static dynamicPrototype = Boolean.prototype;

    constructor(value: any = undefined) {
      super();
    }
  }

  ASBoolean.prototype.toString = Boolean.prototype.toString;
  ASBoolean.prototype.valueOf = Boolean.prototype.valueOf;

  export class ASMethodClosure extends ASFunction {
    public static instanceConstructor: any = function methodClosure(self, fn) {
      var bound = Shumway.FunctionUtilities.bindSafely(fn, self);
      Shumway.ObjectUtilities.defineNonEnumerableProperty(this, "call", bound.call.bind(bound));
      Shumway.ObjectUtilities.defineNonEnumerableProperty(this, "apply", bound.apply.bind(bound));
    };

    constructor(value: any = undefined) {
      super();
    }
  }

  export class ASNamespace extends ASObject {
    public static instanceConstructor: any = function(prefix: string = undefined, uri: string = undefined) {

    }

    get prefix(): any { notImplemented("get prefix"); return; }
    get uri(): String { notImplemented("get uri"); return; }
  }

  export class ASNumber extends ASObject {
    public static instanceConstructor: any = Number;
    public static classBindings: ClassBindings;
    public static instanceBindings: InstanceBindings;
    public static classInfo: ClassInfo;
    public static staticNatives: any [] = [Math];
    public static instanceNatives: any [] = [Number.prototype];
    public static traitsPrototype = Number.prototype;
    public static dynamicPrototype = Number.prototype;
    public static defaultValue: any = Number(0);

    static _numberToString(n: number, radix: number): string { notImplemented("_numberToString"); return; }
    static _convert(n: number, precision: number, mode: number): string { notImplemented("_convert"); return; }
    static _minValue(): number { notImplemented("_minValue"); return; }
  }

  export class ASInt extends ASObject {
    public static instanceConstructor: any = Number;
    public static classBindings: ClassBindings;
    public static instanceBindings: InstanceBindings;
    public static classInfo: ClassInfo;
    public static staticNatives: any [] = [Math];
    public static instanceNatives: any [] = [Number.prototype];
    public static traitsPrototype = Number.prototype;
    public static dynamicPrototype = Number.prototype;
    public static defaultValue: any = 0;
  }

  export class ASUint extends ASObject {
    public static instanceConstructor: any = Number;
    public static classBindings: ClassBindings;
    public static instanceBindings: InstanceBindings;
    public static classInfo: ClassInfo;
    public static staticNatives: any [] = [Math];
    public static instanceNatives: any [] = [Number.prototype];
    public static traitsPrototype = Number.prototype;
    public static dynamicPrototype = Number.prototype;
    public static defaultValue: any = 0;
  }

  export class ASString extends ASObject {
    public static instanceConstructor: any = String;
    public static classBindings: ClassBindings;
    public static instanceBindings: InstanceBindings;
    public static classInfo: ClassInfo;
    public static staticNatives: any [] = [String];
    public static instanceNatives: any [] = [String.prototype];
    public static traitsPrototype = String.prototype;
    public static dynamicPrototype = String.prototype;

    get length(): number {
      notImplemented("get length");
      return 0;
    }
  }

  export class ASArray extends ASObject {
    public static instanceConstructor: any = Array;

    private static _pop(o: any): any {
      notImplemented("public.Array::private static _pop"); return;
    }
    private static _reverse(o: any): any {
      notImplemented("public.Array::private static _reverse"); return;
    }
    private static _concat(o: any, args: any []): any [] {
      args = args;
      notImplemented("public.Array::private static _concat"); return;
    }
    private static _shift(o: any): any {
      notImplemented("public.Array::private static _shift"); return;
    }
    private static _slice(o: any, A: number, B: number): any [] {
      A = +A; B = +B;
      notImplemented("public.Array::private static _slice"); return;
    }
    private static _unshift(o: any, args: any []): number /*uint*/ {
      args = args;
      notImplemented("public.Array::private static _unshift"); return;
    }
    private static _splice(o: any, args: any []): any [] {
      args = args;
      notImplemented("public.Array::private static _splice"); return;
    }
    private static _sort(o: any, args: any []): any {
      args = args;
      notImplemented("public.Array::private static _sort"); return;
    }
    private static _sortOn(o: any, names: any, options: any): any {
      notImplemented("public.Array::private static _sortOn"); return;
    }
    private static _indexOf(o: any, searchElement: any, fromIndex: number /*int*/): number /*int*/ {
      fromIndex = fromIndex | 0;
      notImplemented("public.Array::private static _indexOf"); return;
    }
    private static _lastIndexOf(o: any, searchElement: any, fromIndex: number /*int*/ = 0): number /*int*/ {
      fromIndex = fromIndex | 0;
      notImplemented("public.Array::private static _lastIndexOf"); return;
    }
    private static _every(o: any, callback: Function, thisObject: any): boolean {
      callback = callback;
      notImplemented("public.Array::private static _every"); return;
    }
    private static _filter(o: any, callback: Function, thisObject: any): any [] {
      callback = callback;
      notImplemented("public.Array::private static _filter"); return;
    }
    private static _forEach(o: any, callback: Function, thisObject: any): void {
      callback = callback;
      notImplemented("public.Array::private static _forEach"); return;
    }
    private static _map(o: any, callback: Function, thisObject: any): any [] {
      callback = callback;
      notImplemented("public.Array::private static _map"); return;
    }
    private static _some(o: any, callback: Function, thisObject: any): boolean {
      callback = callback;
      notImplemented("public.Array::private static _some"); return;
    }
    get length(): number /*uint*/ {
      notImplemented("public.Array::get length"); return;
    }
    set length(newLength: number /*uint*/) {
      newLength = newLength >>> 0;
      notImplemented("public.Array::set length"); return;
    }
    pop(): any {
      notImplemented("public.Array::pop"); return;
    }
    push(): number /*uint*/ {
      notImplemented("public.Array::push"); return;
    }
    unshift(): number /*uint*/ {
      notImplemented("public.Array::unshift"); return;
    }
  }

  export class ASVector<T> extends ASObject {
    public static instanceConstructor: any = Array;
  }

  export class ASIntVector extends ASObject {
    public static instanceConstructor: any = Int32Vector;
    public static staticNatives: any [] = [Int32Vector];
    public static instanceNatives: any [] = [Int32Vector.prototype];
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

  export class ASUIntVector extends ASObject {
    public static instanceConstructor: any = Uint32Vector;
    public static staticNatives: any [] = [Uint32Vector];
    public static instanceNatives: any [] = [Uint32Vector.prototype];
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

  export class ASDoubleVector extends ASObject {
    public static instanceConstructor: any = Float64Vector;
    public static staticNatives: any [] = [Float64Vector];
    public static instanceNatives: any [] = [Float64Vector.prototype];
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
    public static instanceConstructor: any = Array;
  }

  export class ASXML extends ASObject {
    public static instanceConstructor: any = Array;
  }

  export class ASXMLList extends ASObject {
    public static instanceConstructor: any = Array;
  }

  export class ASQName extends ASObject {
    public static instanceConstructor: any = Array;
  }

  export class ASError extends ASObject {
    public static instanceConstructor: any = Array;
    constructor(message = "", id = 0) {
      super();
    }
  }

  var nativeClasses: Shumway.Map<IASClass> = Shumway.ObjectUtilities.createMap<IASClass>();

  var isInitialized: boolean = false;

  var ObjectClass: IASClass = null;
  var ClassClass: IASClass = null;
  var FunctionClass: IASClass = null;

  export function initialize(domain: ApplicationDomain) {
    if (isInitialized) {
      return;
    }
    function findClassInfo(name: string) {
      return domain.findClassInfo(Multiname.fromSimpleName(name));
    }
    function findVectorClassInfo(name: string) {
      return domain.findClassInfo(new Multiname([Shumway.AVM2.ABC.Namespace.VECTOR_PACKAGE], name));
    }
    ObjectClass = nativeClasses["ObjectClass"] = ASClass.wrap(findClassInfo("Object"), ASObject);
    ClassClass = nativeClasses["Class"] = ASClass.wrap(findClassInfo("Class"), ASClass);
    FunctionClass = nativeClasses["FunctionClass"] = ASClass.wrap(findClassInfo("Function"), ASFunction);
    nativeClasses["BooleanClass"] = ASClass.wrap(findClassInfo("Boolean"), ASBoolean);
    nativeClasses["MethodClosureClass"] = ASClass.wrap(domain.findClassInfo(new Multiname([Shumway.AVM2.ABC.Namespace.BUILTIN], "MethodClosure")), ASMethodClosure);
    nativeClasses["NamespaceClass"] = ASClass.wrap(findClassInfo("Namespace"), ASNamespace);
    nativeClasses["NumberClass"] = ASClass.wrap(findClassInfo("Number"), ASNumber);
    nativeClasses["intClass"] = ASClass.wrap(findClassInfo("int"), ASInt);
    nativeClasses["uintClass"] = ASClass.wrap(findClassInfo("uint"), ASUint);
    nativeClasses["StringClass"] = ASClass.wrap(findClassInfo("String"), ASString);
    nativeClasses["ArrayClass"] = ASClass.wrap(findClassInfo("Array"), ASArray);
    nativeClasses["VectorClass"] = ASClass.wrap(domain.findClassInfo(new Multiname([Shumway.AVM2.ABC.Namespace.VECTOR], "Vector")), ASVector);
    nativeClasses["ObjectVectorClass"] = ASClass.wrap(findVectorClassInfo("Vector$object"), GenericVector);
    nativeClasses["IntVectorClass"] = ASClass.wrap(findVectorClassInfo("Vector$int"), ASIntVector);
    nativeClasses["UIntVectorClass"] = ASClass.wrap(findVectorClassInfo("Vector$uint"), ASUIntVector);
    nativeClasses["DoubleVectorClass"] = ASClass.wrap(findVectorClassInfo("Vector$double"), ASDoubleVector);
    nativeClasses["JSONClass"] = ASClass.wrap(findClassInfo("JSON"), ASJSON);
    nativeClasses["XMLClass"] = ASClass.wrap(findClassInfo("XML"), ASXML);
    nativeClasses["XMLListClass"] = ASClass.wrap(findClassInfo("XMLList"), ASXMLList);
    nativeClasses["QNameClass"] = ASClass.wrap(findClassInfo("QName"), ASQName);
    isInitialized = true;

    for (var k in nativeClasses) {
      nativeClasses[k].verify();
    }
  }

  export function createNativeClass(classInfo: ClassInfo) {
    assert (classInfo.native);
    var nativeName = classInfo.native.cls
    var cls = nativeClasses[nativeName];
    Debug.assert(cls, "Class " + nativeName + " not found.");
    cls.verify();
    return cls;
  }

  export function createClass(classInfo: ClassInfo, baseClass: ASClass, scope: Scope) {
    var ci = classInfo;
    var ii = ci.instanceInfo;
    var domain = ci.abc.applicationDomain;
    var className = Multiname.getName(ii.name);
    var isNativeClass = ci.native;
    var cls: IASClass;
    if (isNativeClass) {
      cls = nativeClasses[ci.native.cls];
      if (!cls) {
        Shumway.Debug.unexpected("No native class for " + ci.native.cls);
      }
    } else {
      cls = new ASClass(classInfo);
    }

    var classScope = new Scope(scope, null);
    classScope.object = cls;
    var instanceConstructor = createFunction(ii.init, classScope, false);
    cls.construct(baseClass, instanceConstructor);

    var staticNatives: JSObject [] = [cls];
    if (cls.staticNatives) {
      Shumway.ArrayUtilities.pushMany(staticNatives, cls.staticNatives);
    }

    cls.classBindings = new ClassBindings(classInfo, classScope, staticNatives);
    cls.classBindings.applyTo(domain, cls);

    var instanceNatives: JSObject [] = [cls.prototype];
    if (cls.instanceNatives) {
      Shumway.ArrayUtilities.pushMany(instanceNatives, cls.instanceNatives);
    }

    cls.instanceBindings = new InstanceBindings(baseClass ? baseClass.instanceBindings : null, ii, classScope, instanceNatives);
    if (cls.instanceConstructor) {
      cls.instanceBindings.applyTo(domain, cls.traitsPrototype);
    }

    if (cls === ClassClass) {
      cls.instanceBindings.applyTo(domain, ObjectClass, true);
    }

    return cls;
    Shumway.Debug.notImplemented("X");
  }

  /**
   * Searches for a native property in a list of native holders.
   */
  export function getMethodOrAccessorNative(trait: Trait, natives: JSObject []): any {
    var name = Multiname.getName(trait.name);
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
}