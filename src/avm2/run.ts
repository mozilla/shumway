interface IMetaObjectProtocol {
  axHasPropertyInternal(mn: Shumway.AVMX.Multiname): boolean;
  axSetProperty(mn: Shumway.AVMX.Multiname, value: any);
  axSetPublicProperty(nm: any, value: any);
}

interface Function {
  axApply(thisArg: any, argArray?: any[]): any;
  axCall(thisArg: any): any;
}

interface Object extends IMetaObjectProtocol {

}

var $: Shumway.AVMX.SecurityDomain = null;

module Shumway.AVMX {

  export enum WriterFlags {
    None = 0,
    Runtime = 1,
    Interpreter = 2
  }

  var writer = new IndentingWriter();
  export var runtimeWriter = null;
  export var interpreterWriter = null;

  export function setWriters(flags: WriterFlags) {
    runtimeWriter = (flags & WriterFlags.Runtime) ? writer : null;
    interpreterWriter = (flags & WriterFlags.Runtime) ? writer : null;
  }

  
  export enum ScriptInfoState {
    None = 0,
    Executing = 1,
    Executed = 2
  }

  import assert = Shumway.Debug.assert;
  import defineNonEnumerableProperty = Shumway.ObjectUtilities.defineNonEnumerableProperty;

  import defineNonEnumerableGetterOrSetter = Shumway.ObjectUtilities.defineNonEnumerableGetterOrSetter;
  import getOwnPropertyDescriptor = Shumway.ObjectUtilities.getOwnPropertyDescriptor;
  import ASClass = Shumway.AVMX.AS.ASClass;

  import sliceArguments = Shumway.AVM2.Runtime.sliceArguments;

  /**
   * Similar to |toString| but returns |null| for |null| or |undefined| instead
   * of "null" or "undefined".
   */
  export function asCoerceString(x): string {
    if (typeof x === "string") {
      return x;
    } else if (x == undefined) {
      return null;
    }
    return x + '';
  }

  export function asConvertString(x): string {
    if (typeof x === "string") {
      return x;
    }
    return x + '';
  }

  function axCoerceObject(x) {
    if (x == null) {
      return null;
    }
    return x;
  }

  export function asCoerceInt(x): number {
    return x | 0;
  }

  export function asCoerceUint(x): number {
    return x >>> 0;
  }

  export function asCoerceNumber(x): number {
    return +x;
  }

  export function axIsTypeNumber(x): boolean {
    return typeof x === "number";
  }

  export function axIsTypeInt(x): boolean {
    return typeof x === "number" && ((x | 0) === x);
  }

  export function axIsTypeUint(x): boolean {
    return typeof x === "number" && ((x >>> 0) === x);
  }

  export function axIsTypeString(x): boolean {
    return typeof x === "string";
  }

  export function axIsTypeBoolean(x): boolean {
    return typeof x === "boolean";
  }

  export function axFalse(): boolean {
    return false;
  }

  export function asCoerceBoolean(x): boolean {
    return !!x;
  }

  export function asDefaultCompareFunction(a, b) {
    return String(a).localeCompare(String(b));
  }

  export function asCompare(a: any, b: any, options: SORT, compareFunction?) {
    release || Shumway.Debug.assertNotImplemented(!(options & SORT.UNIQUESORT), "UNIQUESORT");
    release || Shumway.Debug.assertNotImplemented(!(options & SORT.RETURNINDEXEDARRAY), "RETURNINDEXEDARRAY");
    var result = 0;
    if (!compareFunction) {
      compareFunction = asDefaultCompareFunction;
    }
    if (options & SORT.CASEINSENSITIVE) {
      a = String(a).toLowerCase();
      b = String(b).toLowerCase();
    }
    if (options & SORT.NUMERIC) {
      a = toNumber(a);
      b = toNumber(b);
      result = a < b ? -1 : (a > b ? 1 : 0);
    } else {
      result = compareFunction(a, b);
    }
    if (options & SORT.DESCENDING) {
      result *= -1;
    }
    return result;
  }

  /**
   * ActionScript 3 has different behaviour when deciding whether to call toString or valueOf
   * when one operand is a string. Unlike JavaScript, it calls toString if one operand is a
   * string and valueOf otherwise. This sucks, but we have to emulate this behaviour because
   * YouTube depends on it.
   *
   * AS3 also overloads the `+` operator to concatenate XMLs/XMLLists instead of stringifying them.
   */
  export function asAdd(l: any, r: any): any {
    if (typeof l === "string" || typeof r === "string") {
      return String(l) + String(r);
    }
    if (isXMLCollection(l) && isXMLCollection(r)) {
      // FIXME
      // return AS.ASXMLList.addXML(l, r);
    }
    return l + r;
  }

  function isXMLCollection(x): boolean {
    // FIXME
    return false;
    //return x instanceof AS.ASXML ||
    //       x instanceof AS.ASXMLList;
  }

  function isXMLType(x): boolean {
    // FIX ME
    return false;
    //return x instanceof AS.ASXML ||
    //       x instanceof AS.ASXMLList ||
    //       x instanceof AS.ASQName ||
    //       x instanceof AS.ASNamespace;
  }

  export function asEquals(left: any, right: any): boolean {
    // See E4X spec, 11.5 Equality Operators for why this is required.
    if (isXMLType(left)) {
      return left.equals(right);
    }
    if (isXMLType(right)) {
      return right.equals(left);
    }
    return left == right;
  }

  /**
   * These values are allowed to exist without being unboxed.
   */
  function isPrimitiveJSValue(value: any) {
    if (value === null || value === undefined || typeof value === "number" || typeof value === "string" || typeof value === "boolean") {
      return true;
    }
    return false;
  }

  function isValidASValue(value: any) {
    if (isPrimitiveJSValue(value)) {
      return true;
    }
    // Values that have Object on the prototype chain are not allowed.
    if (value instanceof Object) {
      return (<any>value).axClassBranding === AVMX.AXClassBranding;
    }
    return true;
  }

  function checkValue(value: any) {
    release || assert(isValidASValue(value),
                      "Value: " + value + " is not allowed to flow into AS3.");
  }

  function axHasPropertyInternal(mn: Multiname): boolean {
    return this.traits.indexOf(mn) >= 0;
  }

  function axResolveMultiname(mn: Multiname): any {
    if (mn.isRuntimeName() && isNumeric(mn.name)) {
      return mn.name;
    }
    var t = this.traits.getTrait(mn);
    if (t) {
      return t.getName().getMangledName();
    }
    return mn.getPublicMangledName();
  }

  function axSetProperty(mn: Multiname, value: any) {
    release || assert(isValidASValue(value));
    this[this.axResolveMultiname(mn)] = value;
  }

  function axGetProperty(mn: Multiname): any {
    var value = this[this.axResolveMultiname(mn)];
    release || checkValue(value);
    return value;
  }

  function axCallProperty(mn: Multiname, args: any []): any {
    return this[this.axResolveMultiname(mn)].axApply(this, args);
  }

  function axConstructProperty(mn: Multiname, args: any []): any {
    return this[this.axResolveMultiname(mn)].axConstruct(args);
  }

  function axArrayGetProperty(mn: Multiname): any {
    if (mn.isRuntimeName() && isNumeric(mn.name)) {
      return this.value[mn.name];
    }
    var t = this.traits.getTrait(mn);
    if (t) {
      return this[t.getName().getMangledName()];
    }
    return this.value[mn.getPublicMangledName()];
  }

  function axArraySetProperty(mn: Multiname, value: any) {
    if (mn.isRuntimeName() && isNumeric(mn.name)) {
      this.value[mn.name] = value;
    }
    var t = this.traits.getTrait(mn);
    if (t) {
      this[t.getName().getMangledName()] = value;
      return;
    }
    this.value[mn.getPublicMangledName()] = value;
  }

  function axFunctionApply(self: any, args?: any): any {
    return this.value.apply(self, args);
  }

  function axFunctionConstruct(args) {
    assert(false);
  }

  function axFunctionCall(self: any, ...args: any[]): any {
    return this.value.apply(self, args);
  }

  export function axSetPublicProperty(nm: any, value: any) {
    release || checkValue(value);
    this[Multiname.getPublicMangledName(nm)] = value;
  }

  export function asGetSlot(object: ITraits, i: number) {
    var value = object[object.traits.getSlot(i).getName().getMangledName()];
    release || checkValue(value);
    return value;
  }

  export function asSetSlot(object: ITraits, i: number, value: any) {
    var t = object.traits.getSlot(i);
    release || checkValue(value);
    object[t.getName().getMangledName()] = value;
    //var slotInfo = object.asSlots.byID[index];
    //if (slotInfo.const) {
    //  return;
    //}
    //var name = slotInfo.name;
    //var type = slotInfo.type;
    //if (type && type.coerce) {
    //  object[name] = type.coerce(value);
    //} else {
    //  object[name] = value;
    //}
  }

  export function asTypeOf(x: any): string {
    return typeof x;
  }

  function axCoerce(x: any) {
    // FIXME
    return null;
  }

  function axIsTypeObject(x: any) {
    // FIXME
    return Object.isPrototypeOf.call(this.dPrototype, this.securityDomain.box(x));
  }

  function axAsType(x: any): any {
    return this.axIsType(x) ? x : null;
  }

  function axIsInstanceOfObject(x: any) {
    return Object.isPrototypeOf.call(this.dPrototype, this.securityDomain.box(x));
  }

  //defineNonEnumerableProperty(Object.prototype, "axHasPropertyInternal", axHasPropertyInternal);
  //defineNonEnumerableProperty(Object.prototype, "axSetProperty", axSetProperty);
  //defineNonEnumerableProperty(Object.prototype, "axSetPublicProperty", axSetPublicProperty);
  //defineNonEnumerableProperty(Object.prototype, "axGetProperty", axGetProperty);
  //defineNonEnumerableProperty(Object.prototype, "axCallProperty", axCallProperty);
  //
  //defineNonEnumerableProperty(Function.prototype, "axCall", Function.prototype.call);
  //defineNonEnumerableProperty(Function.prototype, "axApply", Function.prototype.apply);

  /**
   * All objects with Traits must implement this interface.
   */
  export interface ITraits {
    traits: Traits;
    securityDomain: SecurityDomain;
  }

  export class Scope {
    parent: Scope;
    global: Scope;
    object: Object;
    isWith: boolean;
    cache: any;

    constructor(parent: Scope, object: any, isWith: boolean = false) {
      this.parent = parent;
      this.object = object;
      this.global = parent ? parent.global : this;
      this.isWith = isWith;
      this.cache = [];
    }

    public findDepth(object: any): number {
      var current = this;
      var depth = 0;
      while (current) {
        if (current.object === object) {
          return depth;
        }
        depth++;
        current = current.parent;
      }
      return -1;
    }

    public getScopeObjects(): Object [] {
      var objects = [];
      var current = this;
      while (current) {
        objects.unshift(current.object);
        current = current.parent;
      }
      return objects;
    }

    public getScopeProperty(mn: Multiname, strict: boolean, scopeOnly: boolean): any {
      return this.findScopeProperty(mn, strict, scopeOnly).axGetProperty(mn);
    }

    public findScopeProperty(mn: Multiname, strict: boolean, scopeOnly: boolean): any {
      var object;
      if (!mn.isRuntime() && !scopeOnly) {
        if ((object = this.cache[mn.id])) {
          return object;
        }
      }
      // Scope lookups should not be trapped by proxies.
      if (this.object.axHasPropertyInternal(mn)) {
        return (this.isWith || mn.isRuntime()) ? this.object : (this.cache[mn.id] = this.object);
      }
      if (this.parent) {
        var object = this.parent.findScopeProperty(mn, strict, scopeOnly);
        if (mn.kind === CONSTANT.QName) {
          this.cache[mn.id] = object;
        }
        return object;
      }
      if (scopeOnly) {
        return null;
      }
      // If we can't find the property look in the domain.
      var globalObject = <AXGlobal><any>this.global.object;
      if ((object = globalObject.applicationDomain.findProperty(mn, strict, true))) {
        return object;
      }
      assert(!strict, "Cannot find property " + mn);
      // Can't find it still, return the global object.
      return <any>globalObject;
    }
  }

  function createMethodForTrait(methodTraitInfo: MethodTraitInfo, scope: Scope) {
    if (methodTraitInfo.method) {
      return methodTraitInfo.method;
    }
    var methodInfo = methodTraitInfo.getMethodInfo();
    var method;
    if (methodInfo.flags & METHOD.Native) {
      var metadata = methodInfo.getNativeMetadata();
      if (metadata) {
        method = AS.getNative(metadata.getValueAt(0));
      } else {
        method = AS.getMethodOrAccessorNative(methodTraitInfo);
      }
      assert(method, "Cannot find native: " + methodTraitInfo);
    } else {
      method = function () {
        var self = this === jsGlobal ? scope.global.object : this;
        return interpret(self, methodInfo, scope, sliceArguments(arguments));
      };
    }
    if (!release) {
      method.toString = function () {
        return "Interpret " + methodTraitInfo.toString();
      }
    }
    methodTraitInfo.method = method;
    return method;
  }

  export function applyTraits(object: ITraits, traits: Traits, scope: Scope) {
    object.traits = traits;
    var T = traits.traits;
    for (var i = 0; i < T.length; i++) {
      var t = T[i];
      if (t.kind === TRAIT.Method || t.kind === TRAIT.Getter || t.kind === TRAIT.Setter) {
        var method = createMethodForTrait(<MethodTraitInfo>t, scope);
        var mangledName = t.getName().getMangledName();
        if (t.kind === TRAIT.Method) {
          defineNonEnumerableProperty(object, mangledName, new object.securityDomain.AXFunction(method));
        } else {
          defineNonEnumerableGetterOrSetter(object, mangledName, method, t.kind === TRAIT.Getter)
        }
      }
    }
  }

  // The Object that's at the root of all AXObjects' prototype chain, regardless of their
  // SecurityDomain.
  export var AXBaseProto = Object.create(null);

  AXBaseProto.$BgtoString = function() {
    return "[object Object]";
  };
  AXBaseProto.toString = function () {
    return this.$BgtoString.axCall(this);
  };
  AXBaseProto.$BgvalueOf = function() {
    return this;
  };
  AXBaseProto.valueOf = function () {
    return this.$BgvalueOf.axCall(this);
  };

  export interface AXObject {
    $BgtoString: AXCallable;
    $BgvalueOf: AXCallable;
  }

  export interface AXGlobal extends ITraits, AXObject {
    securityDomain: SecurityDomain;
    applicationDomain: ApplicationDomain;
    scriptInfo: ScriptInfo;
    scope: Scope;
  }

  export interface AXClass extends ITraits, Function {
    scope: Scope;
    superClass: AXClass;
    classInfo: ClassInfo;
    tPrototype: AXObject;
    dPrototype: AXObject;
    prototype: AXObject;
    axConstruct: any;
    axApply: any;
    axCoerce: any;
    axIsType: any;
    axAsType: any;
    axIsInstanceOf: any;
    axClassBranding: Object;
  }

  export var AXClassBranding = Object.create(null);

  export interface AXFunction extends ITraits {
    axApply(thisArg: any, argArray?: any[]): any;
    axCall(thisArg: any): any;
  }

  /**
   * Can be used wherever both AXFunctions and raw JS functions are valid values.
   */
  export interface AXCallable {
    axApply(thisArg: any, argArray?: any[]): any;
    axCall(thisArg: any): any;
  }

  export interface AXActivation extends ITraits {

  }

  function initializeJavaScriptGlobal() {
    // Add the |axApply| and |axCall| methods on the function prototype so that we can treat
    // Functions as AXFunctions.
    Function.prototype.axApply = Function.prototype.apply;
    Function.prototype.axCall = Function.prototype.call;
  }

  initializeJavaScriptGlobal();

  /**
   * Provides security isolation between application domains.
   */
  export class SecurityDomain {
    public system: ApplicationDomain;
    public application: ApplicationDomain;
    public AXObject;
    public AXArray;
    public AXClass;
    public AXFunction;
    public AXNumber;
    public AXString;
    public AXBoolean;
    public AXPrimitiveBox;

    private AXGlobalProto;
    private AXActivationProto;

    private nativeClasses: any;

    constructor() {
      this.system = new ApplicationDomain(this, null);
      this.application = new ApplicationDomain(this, this.system);
      this.nativeClasses = Object.create(null);
    }

    findDefiningABC(mn: Multiname): ABCFile {
      return null;
    }

    createClass(classInfo: ClassInfo, superClass: AXClass, scope: Scope): AXClass {
      return new this.AXClass(classInfo, superClass, scope);
    }

    createFunction(methodInfo: MethodInfo, scope: Scope, hasDynamicScope: boolean): AXFunction {
      return new this.AXFunction(function () {
        var self = this === jsGlobal ? scope.global.object : this;
        return interpret(self, methodInfo, scope, sliceArguments(arguments));
      });
    }

    createActivation(methodInfo: MethodInfo): AXActivation {
      var body = methodInfo.getBody();
      if (!body.activationPrototype) {
        body.traits.resolve();
        body.activationPrototype = Object.create(this.AXActivationProto);
        (<any>body.activationPrototype).traits = body.traits;
      }
      return Object.create(body.activationPrototype);
    }

    box(v: any) {
      if (v == undefined) {
        return v;
      }
      if (Object.prototype.isPrototypeOf.call(this.AXObject.dPrototype, v)) {
        return v;
      }
      if (v.axClassBranding === AXClassBranding) {
        return v;
      }
      if (v instanceof Array) {
        return new this.AXArray(v);
      }
      if (typeof v === "number") {
        return new this.AXNumber(v);
      }
      if (typeof v === "boolean") {
        return new this.AXBoolean(v);
      }
      if (typeof v === "string") {
        return new this.AXString(v);
      }
      assert(false, "Cannot box: " + v);
    }

    isPrimitive(v: any) {
      return isPrimitiveJSValue(v) || v instanceof this.AXPrimitiveBox;
    }

    createAXGlobal(applicationDomain: ApplicationDomain, scriptInfo: ScriptInfo) {
      var global: AXGlobal = Object.create(this.AXGlobalProto);
      global.securityDomain = this;
      global.applicationDomain = applicationDomain;
      global.scriptInfo = scriptInfo;
      global.traits = scriptInfo.traits;
      global.traits.resolve();
      global.scope = new Scope(null, global, false);
      applyTraits(global, global.traits, global.scope);
      return global;
    }

    defineClass(exportName, name, value: AXClass, axApply, axConstruct, axCoerce, axIsType, axIsInstanceOf) {
      this[exportName] = this.nativeClasses[name] = value;
      value.dPrototype.$BgtoString = function () {
        return "[" + name + ".prototype]";
      };
      var D = defineNonEnumerableProperty;

      D(value.__proto__, "securityDomain", this);


      D(value, "axApply", axApply);
      D(value, "axConstruct", axConstruct);
      D(value, "axCoerce", axCoerce);
      D(value, "axIsType", axIsType);
      D(value, "axAsType", axAsType);
      D(value, "axIsInstanceOf", axIsInstanceOf);

      D(value, "axClassBranding", AXClassBranding);
      D(value, "axHasPropertyInternal", axHasPropertyInternal);
      D(value, "axSetProperty", axSetProperty);
      D(value, "axSetPublicProperty", axSetPublicProperty);
      D(value, "axGetProperty", axGetProperty);
      D(value, "axCallProperty", axCallProperty);
      D(value, "axConstructProperty", axConstructProperty);
      D(value, "axResolveMultiname", axResolveMultiname);
    }

    definePrimitiveClass(exportName, name, value, axConvert, axCoerce, axIsType, axIsInstanceOf) {
      this.defineClass(exportName, name, value,
                       function axApply(_ , args: any []) {
                         return axConvert(args ? args[0] : undefined);
                       },
                       function axConstruct(args: any []) {
                         return axConvert(args ? args[0] : undefined);
                       },
                       axCoerce,
                       axIsType,
                       axIsInstanceOf
      );
    }

    /**
     * Configures all the builtin Objects.
     */
    initialize() {
      var nativeClasses = this.nativeClasses;
      var classClassInfo = this.system.findClassInfo("Class");
      var staticClassClassTraits = classClassInfo.instanceInfo.traits;

      classClassInfo.instanceInfo.traits.resolve();

      // Object
      var AXObject: AXClass = <any>function axObject() {};
      AXObject.dPrototype = Object.create(AXBaseProto);
      AXObject.tPrototype = Object.create(AXObject.dPrototype);
      AXObject.prototype = AXObject.tPrototype;

      var axPrototype: any = AXObject.dPrototype;

      axPrototype.securityDomain = this;

      var axObjectPrototype: any = AXObject.prototype;

      // Debugging Helper
      axObjectPrototype.trace = function trace() {
        var self = this;
        var writer = new IndentingWriter();
        this.traits.traits.forEach(t => {
          writer.writeLn(t + ": " + self[t.getName().getMangledName()]);
        });
      };

      this.AXGlobalProto = Object.create(AXObject.dPrototype);
      this.AXGlobalProto.$BgtoString = function() {
        return '[object global]';
      };

      this.AXActivationProto = Object.create(AXObject.dPrototype);
      this.AXActivationProto.$BgtoString = function() {
        return '[Activation]';
      };

      // Class
      var AXClass: AXClass = <any>function axClass(classInfo: ClassInfo, superClass: AXClass, scope: Scope) {
        var className = classInfo.instanceInfo.getName().name;

        var self = this;
        if (nativeClasses[className]) {
          self = nativeClasses[className];
          self.instanceConstructor = self;
        } else {
          self.instanceConstructor = function () {
            assert("TODO: Coercing constructor.");
          };
        }

        self.scope = scope;
        self.classInfo = classInfo;
        self.superClass = superClass;
        var needsPrototypes = !self.dPrototype;
        if (needsPrototypes) {
          self.dPrototype = Object.create(superClass.dPrototype);
          self.tPrototype = Object.create(self.dPrototype);
        }

        // Prepare static traits.
        var staticTraits = staticClassClassTraits.concat(classInfo.traits);
        staticTraits.resolve();
        self.traits = staticTraits;
        applyTraits(self, staticTraits, scope);

        // Prepare instance traits.
        var instanceTraits = superClass ? superClass.classInfo.instanceInfo.runtimeTraits.concat(classInfo.instanceInfo.traits)
                                        : classInfo.instanceInfo.traits;
        instanceTraits.resolve();
        classInfo.instanceInfo.runtimeTraits = instanceTraits;
        self.tPrototype.traits = instanceTraits;
        applyTraits(self.tPrototype, instanceTraits, scope);
        return self;
      };

      AXClass.dPrototype = Object.create(AXObject.tPrototype);
      AXClass.tPrototype = Object.create(AXClass.dPrototype);
      AXClass.prototype = AXClass.tPrototype;
      AXClass.prototype.$BgtoString = function () {
        return "[class " + this.classInfo.instanceInfo.getName().name + "]";
      };
      var axClassPrototype: any = AXClass.prototype;

      // We modify the __proto__ of class constructor functions to point to AXClass.prototype. This means that they no longer
      // have the |call| and |apply| functions. We add them back here for convenience.
      // TODO: this comment is no longer true, but we should replace it with something about
      // classes not being functions and you having to use `axConstruct` for instantiation.
      // ... once that is, in fact, true.
      axClassPrototype.call = Function.prototype.call;
      axClassPrototype.apply = Function.prototype.apply;

      // Array
      var AXArray: AXClass = <any>function axArray(v: Array<any>) {
        this.value = v;
      };
      AXArray.dPrototype = Object.create(AXObject.tPrototype);
      // Array.prototype is an Array, and behaves like one.
      AXArray.dPrototype['value'] = [];
      AXArray.tPrototype = Object.create(AXArray.dPrototype);
      AXArray.prototype = AXArray.tPrototype;
      AXArray.prototype.$BgtoString = function () {
        return this.value.toString();
      };

      var AXFunction: AXClass = <any>function axFunction(v: Function) {
        this.value = v;
      };
      AXFunction.dPrototype = Object.create(AXObject.tPrototype);
      AXFunction.tPrototype = Object.create(AXFunction.dPrototype);
      AXFunction.prototype = AXFunction.tPrototype;
      AXFunction.prototype.$BgtoString = function () {
        return "[Function Object]";
      };

      // Boolean, int, Number, String, and uint are primitives in AS3. We create a placeholder base class
      // to help us with instanceof tests.
      var AXPrimitiveBox = <any>function axPrimitiveBox() {};
      AXPrimitiveBox.dPrototype = Object.create(AXObject.tPrototype);
      AXPrimitiveBox.tPrototype = Object.create(AXPrimitiveBox.dPrototype);
      AXPrimitiveBox.prototype = AXPrimitiveBox.tPrototype;

      var AXBoolean = <any>function axBoolean(v: boolean) { this.value = v; };
      AXBoolean.dPrototype = Object.create(AXPrimitiveBox.tPrototype);
      AXBoolean.tPrototype = Object.create(AXBoolean.dPrototype);
      AXBoolean.prototype = AXBoolean.tPrototype;
      AXBoolean.prototype.$BgtoString = function () { return this.value.toString(); };

      var AXNumber = <any>function axNumber(v: number) { this.value = v; };
      AXNumber.dPrototype = Object.create(AXPrimitiveBox.tPrototype);
      AXNumber.tPrototype = Object.create(AXNumber.dPrototype);
      AXNumber.prototype = AXNumber.tPrototype;
      AXNumber.prototype.$BgtoString = function () { return this.value.toString(); };

      var AXInt = <any>function axInt(v: number) { this.value = v; };
      AXInt.dPrototype = Object.create(AXPrimitiveBox.tPrototype);
      AXInt.tPrototype = Object.create(AXInt.dPrototype);
      AXInt.prototype = AXInt.tPrototype;
      AXInt.prototype.$BgtoString = function () { return this.value.toString(); };

      var AXUint = <any>function axUint(v: number) { this.value = v; };
      AXUint.dPrototype = Object.create(AXPrimitiveBox.tPrototype);
      AXUint.tPrototype = Object.create(AXUint.dPrototype);
      AXUint.prototype = AXUint.tPrototype;
      AXUint.prototype.$BgtoString = function () { return this.value.toString(); };

      var AXString = <any>function axString(v: string) { this.value = v; };
      AXString.dPrototype = Object.create(AXPrimitiveBox.tPrototype);
      AXString.tPrototype = Object.create(AXString.dPrototype);
      AXString.prototype = AXString.tPrototype;
      AXString.prototype.$BgtoString = function () { return this.value; };

      function axApplyIdentity(self, args) {
        return args[0];
      }

      function axConstructIdentity(args) {
        return args[0];
      }

      this.defineClass("AXClass", "Class", AXClass, axApplyIdentity, axConstructIdentity, axCoerceObject, axIsTypeObject, axIsInstanceOfObject);
      this.defineClass("AXFunction", "Function", AXFunction, axApplyIdentity, axConstructIdentity, axCoerceObject, axIsTypeObject, axIsInstanceOfObject);
      this.defineClass("AXArray", "Array", AXArray, axApplyIdentity, axConstructIdentity, axCoerceObject, axIsTypeObject, axIsInstanceOfObject);

      this.defineClass("AXPrimitiveBox", "PrimitiveBox", AXPrimitiveBox, null, null, null, null, null);

      // AXObject is not technically a primitive class but it needs a coercing apply/constructor.

      // Object(null) creates an object, and this behaves differently than: (function (x: Object) { trace (x); })(null) which prints null.
      function asSpecialCoerceObject(x) {
        if (x == null) {
          return new self.AXObject();
        }
        return x;
      }
      this.definePrimitiveClass("AXObject", "Object", AXObject, asSpecialCoerceObject, axCoerceObject, axIsTypeObject, axIsInstanceOfObject);
      this.definePrimitiveClass("AXNumber", "Number", AXNumber, asCoerceNumber, asCoerceNumber, axIsTypeNumber, axIsTypeNumber);
      this.definePrimitiveClass("AXInt", "int", AXInt, asCoerceInt, asCoerceInt, axIsTypeInt, axFalse);
      this.definePrimitiveClass("AXUint", "uint", AXUint, asCoerceUint, asCoerceUint, axIsTypeUint, axFalse);
      this.definePrimitiveClass("AXString", "String", AXString, asConvertString, asCoerceString, axIsTypeString, axIsTypeString);
      this.definePrimitiveClass("AXBoolean", "Boolean", AXBoolean, asCoerceBoolean, asCoerceBoolean, axIsTypeBoolean, axIsTypeBoolean);

      var D = defineNonEnumerableProperty;

      D(AXObject.dPrototype, "axHasPropertyInternal", axHasPropertyInternal);
      D(AXObject.dPrototype, "axSetProperty", axSetProperty);
      D(AXObject.dPrototype, "axSetPublicProperty", axSetPublicProperty);
      D(AXObject.dPrototype, "axGetProperty", axGetProperty);
      D(AXObject.dPrototype, "axCallProperty", axCallProperty);
      D(AXObject.dPrototype, "axConstructProperty", axConstructProperty);
      D(AXObject.dPrototype, "axResolveMultiname", axResolveMultiname);

      var self = this;
      var P = function setPublicProperty(object, name, value) {
        object.axSetPublicProperty(name, new self.AXFunction(value));
      };

      var Ap = AS.ASArray.prototype;

      P(AXArray.dPrototype, "push", Ap.push);
      P(AXArray.dPrototype, "pop", Ap.pop);
      P(AXArray.dPrototype, "shift", Ap.shift);
      P(AXArray.dPrototype, "unshift", Ap.unshift);
      P(AXArray.dPrototype, "reverse", Ap.reverse);
      P(AXArray.dPrototype, "concat", Ap.concat);
      P(AXArray.dPrototype, "slice", Ap.slice);
      P(AXArray.dPrototype, "join", Ap.join);
      P(AXArray.dPrototype, "toString", Ap.toString);
      P(AXArray.dPrototype, "indexOf", Ap.indexOf);
      P(AXArray.dPrototype, "lastIndexOf", Ap.lastIndexOf);
      P(AXArray.dPrototype, "every", Ap.every);
      P(AXArray.dPrototype, "some", Ap.some);
      P(AXArray.dPrototype, "forEach", Ap.forEach);
      P(AXArray.dPrototype, "map", Ap.map);
      P(AXArray.dPrototype, "filter", Ap.filter);

      D(AXArray.prototype, "axGetProperty", axArrayGetProperty);
      D(AXArray.prototype, "axSetProperty", axArraySetProperty);

      D(AXFunction.prototype, "axCall", axFunctionCall);
      D(AXFunction.prototype, "axApply", axFunctionApply);
      D(AXFunction.prototype, "axConstruct", axFunctionConstruct);

      P(AXFunction.dPrototype, "call", function (self, a, b, c) {
        if (this.securityDomain.isPrimitive(self)) {
          self = null;
        }
        switch (arguments.length) {
          case 0: return this.value.call();
          case 1: return this.value.call(self);
          case 2: return this.value.call(self, a);
          case 3: return this.value.call(self, a, b);
          case 4: return this.value.call(self, a, b, c);
        }
        return this.value.apply(self, sliceArguments(arguments, 1));
      });

      P(AXFunction.dPrototype, "apply", function (self, args) {
        if (this.securityDomain.isPrimitive(self)) {
          self = null;
        }
        return this.value.apply(self, args.value);
      });
    }
  }

  /**
   * All code lives within an application domain.
   */
  export class ApplicationDomain {
    /**
     * All application domains have a reference to the root, or system application domain.
     */
    public system: ApplicationDomain;

    /**
     * Parent application domain.
     */
    public parent: ApplicationDomain;

    public securityDomain: SecurityDomain;

    private _abcs: ABCFile [];

    constructor(securityDomain: SecurityDomain, parent: ApplicationDomain) {
      this.securityDomain = securityDomain;
      this.parent = parent;
      this.system = parent ? parent.system : this;
      this._abcs = [];
    }

    public loadABC(abc: ABCFile) {
      assert (this._abcs.indexOf(abc) < 0);
      this._abcs.push(abc);
      abc.setApplicationDomain(this);
    }

    public loadAndExecuteABC(abc: ABCFile) {
      this.loadABC(abc);
      this.executeABC(abc);
    }

    public executeABC(abc: ABCFile) {
      var lastScript = abc.scripts[abc.scripts.length - 1];
      this.executeScript(lastScript);
    }

    public findClassInfo(name: string) {
      for (var i = 0; i < this._abcs.length; i++) {
        var abc = this._abcs[i];
        for (var j = 0; j < abc.instances.length; j++) {
          var c = abc.classes[j];
          if (c.instanceInfo.getName().name === name) {
            return c;
          }
        }
      }
      return null;
    }

    public executeScript(scriptInfo: ScriptInfo) {
      assert (scriptInfo.state === ScriptInfoState.None);

      runtimeWriter && runtimeWriter.writeLn("Running Script: " + scriptInfo);
      var global = this.securityDomain.createAXGlobal(this, scriptInfo);
      scriptInfo.global = global;
      scriptInfo.state = ScriptInfoState.Executing;
      interpret(<any>global, scriptInfo.getInitializer(), global.scope, []);
      scriptInfo.state = ScriptInfoState.Executed;
    }

    public findProperty(mn: Multiname, strict: boolean, execute: boolean): AXGlobal {
      var script = this.findDefiningScript(mn, execute);
      if (script) {
        return script.global;
      }
      return null;
    }

    public findDefiningScript(mn: Multiname, execute: boolean): ScriptInfo {
      // Look in parent domain first.
      if (this.parent) {
        var script = this.parent.findDefiningScript(mn, execute);
        if (script) {
          return script;
        }
      }

      // Search through the loaded abcs.
      for (var i = 0; i < this._abcs.length; i++) {
        var abc = this._abcs[i];
        var scripts = abc.scripts;
        for (var j = 0; j < scripts.length; j++) {
          var script = scripts[j];
          var traits = script.traits;
          traits.resolve();
          var index = traits.indexOf(mn, -1);
          if (index > 0) {
            if (execute) {
              this._ensureScriptIsExecuted(script);
            }
            return script;
          }
        }
      }

      // Still no luck, so let's ask the security domain to load additional ABCs and try again.
      var abc = this.system.securityDomain.findDefiningABC(mn);
      if (abc) {
        this.loadABC(abc);
        return this.findDefiningScript(mn, execute);
      }

      return null;
    }

    private _ensureScriptIsExecuted(script: ScriptInfo) {
      if (script.state === ScriptInfoState.None) {
        this.executeScript(script);
      }
    }
  }

  export function createMethod(methodInfo: MethodInfo, scope: Scope, hasDynamicScope: boolean) {
    return function () {
      return interpret(this, methodInfo, scope, sliceArguments(arguments));
    }
  }
}
