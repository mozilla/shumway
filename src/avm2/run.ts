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
  /*
   *    #--> __proto__ reference
   *    ---> object reference
   *    - non-enumerable property
   *
   *    +--------------------------+
   *    |      Base Prototype      |
   *    +--------------------------+
   *    |- axHasPropertyInternal   |
   *    |- axHasProperty           |            +-------------------+
   *    |- axSetProperty           |     +-----#|  objectPrototype  |
   *    |- axGetProperty           |     |      +-------------------+
   *    |- axSetPublicProperty     |     |      | - securityDomain  |
   *    |- axGetSlot               |<----+      +-------------------+
   *    |- axSetSlot               |     |
   *    |  …                       |     |
   *    |                          |     |      +-------------------+
   *    |                          |     +-----#|  objectPrototype  |<---------------------------------+
   *    |                          |            +-------------------+             |                    |
   *    +--------------------------+            | - securityDomain  |             |                    |
   *                                            +-------------------+             |                    |
   *                                                      ^                       |                    |
   *                                                      |                       |                    |
   *                                                      #                       #                    #
   *    +-----------------+    +------------+      +------------+        +-----------------+  +-----------------+
   * +-#|  Class Object   |--->| tPrototype |#---->| dPrototype |<--+    |     Number      |  |      Uint       |
   * |  +-----------------+    +------------+      +------------+   |    +-----------------+  +-----------------+
   * |                                                    ^         |    | - value         |  | - value         |
   * |                                                    |         |    +-----------------+  +-----------------+
   * |                                                    #         |
   * |  +-----------------+    +------------+      +------------+   |    +-----------------+  +-----------------+
   * +-#|   Class Class   |--->| tPrototype |#---->| dPrototype |   |    |     Boolean     |  |      Array      |
   * |  +-----------------+    +------------+      +------------+   |    +-----------------+  +-----------------+
   * |                                ^                             |    | - value         |  | - value         |
   * |                                |                             |    +-----------------+  +-----------------+
   * +--------------------------------+                             |
   * |                                                              |    +-----------------+  +-----------------+
   * |                                                              |    |       Int       |  |    Function     |
   * |  +-----------------+    +------------+      +------------+   |    +-----------------+  +-----------------+
   * +-#|     Class A     |--->| tPrototype |#---->| dPrototype |#--+    | - value         |  | - value         |
   *    +-----------------+    +------------+      +------------+        +-----------------+  +-----------------+
   *                           | - traits   |--+
   *                           +------------+  |
   *                                  ^        |
   *                                  |        |
   *                                  #        |
   *                           +------------+  |   +------------+
   *                           |  Object A  |  +-->|   Traits   |
   *                           +------------+      +------------+
   */
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

  function axApplyIdentity(self, args) {
    return args[0];
  }

  function axBoxIdentity(args) {
    return args[0];
  }

  function axBoxPrimitive(value) {
    var boxed = Object.create(this.tPrototype);
    boxed.value = value;
    return boxed;
  }

  function axCoerceObject(x) {
    if (x == null) {
      return null;
    }
    return x;
  }

  function axApplyObject(_, args) {
    var x = args[0];
    if (x == null) {
      return Object.create(this.tPrototype);
    }
    return x;
  }

  function axConstructObject(args) {
    var x = args[0];
    if (x == null) {
      return Object.create(this.tPrototype);
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

  export function asCoerceBoolean(x): boolean {
    return !!x;
  }

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

  export function axIsTypeNumber(x): boolean {
    return typeof x === "number";
  }

  export function axIsTypeInt(x): boolean {
    return typeof x === "number" && ((x | 0) === x);
  }

  export function axIsTypeUint(x): boolean {
    return typeof x === "number" && ((x >>> 0) === x);
  }

  export function axIsTypeBoolean(x): boolean {
    return typeof x === "boolean";
  }

  export function axIsTypeString(x): boolean {
    return typeof x === "string";
  }

  export function axFalse(): boolean {
    return false;
  }

  export function axDefaultCompareFunction(a, b) {
    return String(a).localeCompare(String(b));
  }

  export function axCompare(a: any, b: any, options: SORT, sortOrder: number,
                            compareFunction: (a, b) => number) {
    release || Shumway.Debug.assertNotImplemented(!(options & SORT.UNIQUESORT), "UNIQUESORT");
    release || Shumway.Debug.assertNotImplemented(!(options & SORT.RETURNINDEXEDARRAY),
                                                  "RETURNINDEXEDARRAY");
    var result = 0;
    if (options & SORT.CASEINSENSITIVE) {
      a = String(a).toLowerCase();
      b = String(b).toLowerCase();
    }
    if (options & SORT.NUMERIC) {
      a = +a;
      b = +b;
      result = a < b ? -1 : (a > b ? 1 : 0);
    } else {
      result = compareFunction(a, b);
    }
    return result * sortOrder;
  }

  export function axCompareFields(objA: any, objB: any, names: string[], optionsList: SORT[]) {
    release || assert(names.length === optionsList.length);
    release || assert(names.length > 0);
    var result = 0;
    var i;
    for (i = 0; i < names.length && result === 0; i++) {
      var name = names[i];
      var a = objA[name];
      var b = objB[name];
      var options = optionsList[i];
      if (options & SORT.CASEINSENSITIVE) {
        a = String(a).toLowerCase();
        b = String(b).toLowerCase();
      }
      if (options & SORT.NUMERIC) {
        a = +a;
        b = +b;
        result = a < b ? -1 : (a > b ? 1 : 0);
      } else {
        result = String(a).localeCompare(String(b));
      }
    }
    if (optionsList[i - 1] & SORT.DESCENDING) {
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
   * These values are allowed to exist without being boxed.
   */
  function isPrimitiveJSValue(value: any) {
    return value === null || value === undefined || typeof value === "number" ||
           typeof value === "string" || typeof value === "boolean";

  }

  function isValidASValue(value: any) {
    return AXBasePrototype.isPrototypeOf(value) || isPrimitiveJSValue(value);
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
    return this[mn.getPublicMangledName()];
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
    this[mn.getPublicMangledName()] = value;
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

  export function axGetSlot(i: number) {
    var t = this.traits.getSlot(i);
    var value = this[t.getName().getMangledName()];
    release || checkValue(value);
    return value;
  }

  export function axSetSlot(i: number, value: any) {
    var t = this.traits.getSlot(i);
    release || checkValue(value);
    this[t.getName().getMangledName()] = value;
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
      if (!scopeOnly && !mn.isRuntime()) {
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

      // Attributes can't be stored on globals or be directly defined in scripts.
      if (mn.isAttribute()) {
        throwError("ReferenceError", Errors.UndefinedVarError, mn.name);
      }

      // If we can't find the property look in the domain.
      var globalObject = <AXGlobal><any>this.global.object;
      if ((object = globalObject.applicationDomain.findProperty(mn, strict, true))) {
        return object;
      }

      // If we still haven't found it, look for dynamic properties on the global.
      // No need to do this for non-strict lookups as we'll end up returning the
      // global anyways.
      if (strict) {
        if (!(mn.getPublicMangledName() in globalObject)) {
          throwError("ReferenceError", Errors.UndefinedVarError, mn.name);
        }
      }

      // Can't find it still, return the global object.
      return globalObject;
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
      release || assert(method, "Cannot find native: " + methodTraitInfo);
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
          defineNonEnumerableProperty(object, mangledName,
                                      object.securityDomain.AXFunction.axBox(method));
        } else {
          defineNonEnumerableGetterOrSetter(object, mangledName, method, t.kind === TRAIT.Getter)
        }
      }
    }
  }

  // The Object that's at the root of all AXObjects' prototype chain, regardless of their
  // SecurityDomain.
  export var AXBasePrototype = Object.create(null);

  var D = defineNonEnumerableProperty;
  D(AXBasePrototype, "axHasPropertyInternal", axHasPropertyInternal);
  D(AXBasePrototype, "axSetProperty", axSetProperty);
  D(AXBasePrototype, "axSetPublicProperty", axSetPublicProperty);
  D(AXBasePrototype, "axGetProperty", axGetProperty);
  D(AXBasePrototype, "axSetSlot", axSetSlot);
  D(AXBasePrototype, "axGetSlot", axGetSlot);
  D(AXBasePrototype, "axCallProperty", axCallProperty);
  D(AXBasePrototype, "axConstructProperty", axConstructProperty);
  D(AXBasePrototype, "axResolveMultiname", axResolveMultiname);
  D(AXBasePrototype, "isPrototypeOf", Object.prototype.isPrototypeOf);

  AXBasePrototype.$BgtoString = function() {
    return "[object Object]";
  };
  AXBasePrototype.toString = function () {
    return this.$BgtoString.axCall(this);
  };
  AXBasePrototype.$BgvalueOf = function() {
    return this;
  };
  AXBasePrototype.valueOf = function () {
    return this.$BgvalueOf.axCall(this);
  };

  export interface AXObject extends ITraits {
    $BgtoString: AXCallable;
    $BgvalueOf: AXCallable;
  }

  export interface AXGlobal extends AXObject {
    securityDomain: SecurityDomain;
    applicationDomain: ApplicationDomain;
    scriptInfo: ScriptInfo;
    scope: Scope;
  }

  export interface AXClass extends AXObject {
    scope: Scope;
    superClass: AXClass;
    classInfo: ClassInfo;
    tPrototype: AXObject;
    dPrototype: AXObject;
    axBox: any;
    axInitializer: any;
    axConstruct: any;
    axApply: any;
    axCoerce: any;
    axIsType: any;
    axAsType: any;
    axIsInstanceOf: any;
  }

  export interface AXFunction extends ITraits, AXObject {
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

  // Add the |axApply| and |axCall| methods on the function prototype so that we can treat
  // Functions as AXCallables.
  Function.prototype.axApply = Function.prototype.apply;
  Function.prototype.axCall = Function.prototype.call;

  export interface AXActivation extends ITraits {

  }


  /**
   * Generic axConstruct method that lives on the AXClass prototype. This just
   * creates an empty object with the right prototype and then calls the
   * instance initializer.
   */
  function axConstruct() {
    var self: AXClass = this;
    var object = Object.create(self.tPrototype);
    self.axInitializer.apply(object, arguments);
    return object;
  }

  /**
   * Default initializer.
   */
  function axDefaultInitializer() {
    // Nop.
  }

  /**
   * Default axApply.
   */
  function axDefaultApply(self, args: any []) {
    // TODO: Coerce.
    return args ? args[0] : undefined;
  }

  /**
   * Provides security isolation between application domains.
   */
  export class SecurityDomain {
    public system: ApplicationDomain;
    public application: ApplicationDomain;
    public AXObject: AXClass;
    public AXArray: AXClass;
    public AXClass: AXClass;
    public AXFunction: AXClass;
    public AXNumber: AXClass;
    public AXString: AXClass;
    public AXBoolean: AXClass;

    private AXPrimitiveBox;
    private AXGlobalProto;
    private AXActivationProto;
    private objectPrototype: AXObject;
    private rootClassPrototype: AXObject;

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
      var axClass: AXClass;

      var className = classInfo.instanceInfo.getName().name;
      var classScope: Scope;
      if (this.nativeClasses[className]) {
        axClass = this.nativeClasses[className];
        classScope = new Scope(scope, axClass);
      } else {
        axClass = Object.create(this.AXClass.dPrototype);
        axClass.dPrototype = Object.create(this.objectPrototype);
        axClass.tPrototype = Object.create(axClass.dPrototype);
        classScope = new Scope(scope, axClass);
        var initializerMethodInfo = classInfo.instanceInfo.getInitializer();
        axClass.axInitializer = this.createInitializerFunction(initializerMethodInfo, classScope);
        axClass.axCoerce = function () {
          assert(false, "TODO: Coercing constructor.");
        };
      }

      axClass.classInfo = (<any>axClass.dPrototype).classInfo = classInfo;
      axClass.superClass = superClass;
      axClass.scope = scope;

      // Prepare static traits.
      var staticTraits = this.AXClass.classInfo.instanceInfo.traits.concat(classInfo.traits);
      staticTraits.resolve();
      axClass.traits = staticTraits;
      applyTraits(axClass, staticTraits, scope);

      // Prepare instance traits.
      var instanceTraits = superClass ?
                           superClass.classInfo.instanceInfo.runtimeTraits.concat(classInfo.instanceInfo.traits) :
                           classInfo.instanceInfo.traits;
      instanceTraits.resolve();
      classInfo.instanceInfo.runtimeTraits = instanceTraits;
      axClass.dPrototype.traits = instanceTraits;
      applyTraits(axClass.tPrototype, instanceTraits, scope);

      // Run the static initializer.
      interpret(axClass, classInfo.getInitializer(), classScope, [axClass]);
      return axClass;
    }

    createFunction(methodInfo: MethodInfo, scope: Scope, hasDynamicScope: boolean): AXFunction {
      return this.AXFunction.axBox(function () {
        var self = this === jsGlobal ? scope.global.object : this;
        return interpret(self, methodInfo, scope, sliceArguments(arguments));
      });
    }

    createInitializerFunction(methodInfo: MethodInfo, scope: Scope): Function {
      return function () {
        return interpret(this, methodInfo, scope, sliceArguments(arguments));
      };
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
      if (AXBasePrototype.isPrototypeOf(v)) {
        return v;
      }
      if (v instanceof Array) {
        return this.AXArray.axBox(v);
      }
      if (typeof v === "number") {
        return this.AXNumber.axBox(v);
      }
      if (typeof v === "boolean") {
        return this.AXBoolean.axBox(v);
      }
      if (typeof v === "string") {
        return this.AXString.axBox(v);
      }
      assert(false, "Cannot box: " + v);
    }

    isPrimitive(v: any) {
      return isPrimitiveJSValue(v) || this.AXPrimitiveBox.dPrototype.isPrototypeOf(v);
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

    /**
     * Prepares the dynamic Class prototype that all Class instances (including Class) have in
     * their prototype chain.
     *
     * This prototype defines the default hooks for all classes. Classes can override some or
     * all of them.
     */
    prepareRootClassPrototype() {
      var rootClassPrototype: AXObject = Object.create(this.objectPrototype);
      rootClassPrototype.$BgtoString = function axClassToString() {
        return "[class " + this.classInfo.instanceInfo.getName().name + "]";
      };

      var D = defineNonEnumerableProperty;
      D(rootClassPrototype, "axApply", axApplyIdentity);
      D(rootClassPrototype, "axBox", axBoxIdentity);
      D(rootClassPrototype, "axCoerce", axCoerce);
      D(rootClassPrototype, "axIsType", axIsTypeObject);
      D(rootClassPrototype, "axAsType", axAsType);
      D(rootClassPrototype, "axIsInstanceOf", axIsInstanceOfObject);
      D(rootClassPrototype, "axConstruct", axConstruct);
      D(rootClassPrototype, "axInitializer", axDefaultInitializer);
      D(rootClassPrototype, "axApply", axDefaultApply);

      this.rootClassPrototype = rootClassPrototype;
    }

    prepareNativeClass(exportName: string, name: string, instancePrototype: AXObject) {
      var axClass: AXClass = Object.create(this.rootClassPrototype);
      // For Object, we've already created the instance prototype to break circular dependencies
      // between Object and Class.
      if (name === 'Object') {
        axClass.dPrototype = instancePrototype;
      } else if (name === 'Class') {
        // TODO: We're setting the axClass as its own |dPrototype| so that new non-native class
        // instances have the rootClassPrototype on the prototype chain.
        axClass.dPrototype = axClass;
      } else {
        axClass.dPrototype = Object.create(instancePrototype);
      }
      axClass.tPrototype = Object.create(axClass.dPrototype);
      this[exportName] = this.nativeClasses[name] = axClass;
      return axClass;
    }

    preparePrimitiveClass(exportName: string, name: string, convert, coerce, isType, isInstanceOf) {
      var axClass = this.prepareNativeClass(exportName, name, this.AXPrimitiveBox.dPrototype);
      var D = defineNonEnumerableProperty;
      D(axClass, 'axBox', axBoxPrimitive);
      D(axClass, "axApply", function axApply(_ , args: any []) {
        return convert(args ? args[0] : undefined);
      });
      D(axClass, "axConstruct", function axConstruct(args: any []) {
        return convert(args ? args[0] : undefined);
      });
      D(axClass, "axCoerce", coerce);
      D(axClass, "axIsType", isType);
      D(axClass, "axIsInstanceOf", isInstanceOf);
      D(axClass.tPrototype, "$BgtoString", function() { return this.value.toString(); });
    }

    /**
     * Configures all the builtin Objects.
     */
    initialize() {
      var D = defineNonEnumerableProperty;
      var P = function setPublicProperty(object, name, value) {
        object.axSetPublicProperty(name, AXFunction.axBox(value));
      };

      // Some facts:
      // - The Class constructor is itself an instance of Class.
      // - The Class constructor is an instance of Object.
      // - The Object constructor is an instance of Class.
      // - The Object constructor is an instance of Object.
      
      // The basic prototype that all objects in this security domain have in common.
      var objectPrototype = this.objectPrototype = Object.create(AXBasePrototype);
      (<any>this.objectPrototype).securityDomain = this;
      this.prepareRootClassPrototype();
      var AXClass = this.prepareNativeClass("AXClass", "Class", objectPrototype);
      var classClassInfo = this.system.findClassInfo("Class");
      classClassInfo.instanceInfo.traits.resolve();
      AXClass.classInfo = classClassInfo;
      var AXObject = this.prepareNativeClass("AXObject", "Object", objectPrototype);
      // Object(null) creates an object, and this behaves differently than:
      // (function (x: Object) { trace (x); })(null) which prints null.
      D(AXObject, "axApply", axApplyObject);
      D(AXObject, "axConstruct", axConstructObject);
      D(AXObject, "axCoerce", axCoerceObject);

      // Debugging Helper
      release || (this.objectPrototype['trace'] = function trace() {
        var self = this;
        var writer = new IndentingWriter();
        this.traits.traits.forEach(t => {
          writer.writeLn(t + ": " + self[t.getName().getMangledName()]);
        });
      });

      this.AXGlobalProto = Object.create(this.objectPrototype);
      this.AXGlobalProto.$BgtoString = function() {
        return '[object global]';
      };

      this.AXActivationProto = Object.create(this.objectPrototype);
      this.AXActivationProto.$BgtoString = function() {
        return '[Activation]';
      };

      var AXFunction = this.prepareNativeClass("AXFunction", "Function", objectPrototype);
      D(AXFunction, "axBox", axBoxPrimitive);
      D(AXFunction.dPrototype, "axCall", axFunctionCall);
      D(AXFunction.dPrototype, "axApply", axFunctionApply);
      D(AXFunction.tPrototype, '$BgtoString', AXFunction.axBox(function () {
        return "[Function Object]";
      }));

      D(AXFunction, "axConstruct", function() { return Object.create(this.tPrototype);});
      D(AXFunction.dPrototype, "axConstruct", axFunctionConstruct);

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

      var AXArray = this.prepareNativeClass("AXArray", "Array", objectPrototype);
      D(AXArray, 'axBox', axBoxPrimitive);
      AXArray.tPrototype.$BgtoString = AXFunction.axBox(function () {
        return this.value.toString();
      });
      // Array.prototype is an Array, and behaves like one.
      AXArray.dPrototype['value'] = [];
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
      P(AXArray.dPrototype, "sort", Ap.sort);
      P(AXArray.dPrototype, "sortOn", Ap.sortOn);

      D(AXArray.dPrototype, "axGetProperty", axArrayGetProperty);
      D(AXArray.dPrototype, "axSetProperty", axArraySetProperty);

      // Boolean, int, Number, String, and uint are primitives in AS3. We create a placeholder
      // base class to help us with instanceof tests.
      var AXPrimitiveBox = this.prepareNativeClass("AXPrimitiveBox", "PrimitiveBox", objectPrototype);
      D(AXPrimitiveBox.dPrototype, '$BgtoString',
        AXFunction.axBox(function () { return this.value.toString(); }));
      var AXBoolean = this.preparePrimitiveClass("AXBoolean", "Boolean", asCoerceBoolean,
                                                 asCoerceBoolean, axIsTypeBoolean, axIsTypeBoolean);
      var AXString = this.preparePrimitiveClass("AXString", "String", asConvertString,
                                                 asCoerceString, axIsTypeString, axIsTypeString);
      var AXNumber = this.preparePrimitiveClass("AXNumber", "Number", asCoerceNumber,
                                                asCoerceNumber, axIsTypeNumber, axIsTypeNumber);
      var AXInt = this.preparePrimitiveClass("AXInt", "int", asCoerceInt, asCoerceInt,
                                             axIsTypeInt, axFalse);
      var AXUint = this.preparePrimitiveClass("AXUint", "uint", asCoerceUint, asCoerceUint,
                                              axIsTypeUint, axFalse);
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
