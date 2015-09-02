/**
 * MetaobjectProtocol interface.
 */
interface IMetaobjectProtocol {
  axResolveMultiname(mn: Shumway.AVMX.Multiname): any;
  axHasProperty(mn: Shumway.AVMX.Multiname): boolean;
  axDeleteProperty(mn: Shumway.AVMX.Multiname): boolean;

  axCallProperty(mn: Shumway.AVMX.Multiname, argArray: any [], isLex: boolean): any;
  axCallSuper(mn: Shumway.AVMX.Multiname, scope: Shumway.AVMX.Scope, argArray: any []): any;
  axConstructProperty(mn: Shumway.AVMX.Multiname, args: any []): any;
  axHasPropertyInternal(mn: Shumway.AVMX.Multiname): boolean;
  axHasOwnProperty(mn: Shumway.AVMX.Multiname): boolean;

  axSetProperty(mn: Shumway.AVMX.Multiname, value: any, bc: Shumway.AVMX.Bytecode);
  axGetProperty(mn: Shumway.AVMX.Multiname): any;
  axGetSuper(mn: Shumway.AVMX.Multiname, scope: Shumway.AVMX.Scope): any;
  axSetSuper(mn: Shumway.AVMX.Multiname, scope: Shumway.AVMX.Scope, value: any);

  axNextNameIndex(index: number): any;
  axNextName(index: number): any;
  axNextValue(index: number): any;

  axEnumerableKeys: any [];
  axGetEnumerableKeys(): any [];

  axHasPublicProperty(nm: any): boolean;
  axSetPublicProperty(nm: any, value: any);
  axGetPublicProperty(nm: any): any;
  axCallPublicProperty(nm: any, argArray: any []): any;
  axDeletePublicProperty(nm: any): boolean;

  axSetNumericProperty(nm: number, value: any);
  axGetNumericProperty(nm: number): any;

  axGetSlot(i: number): any;
  axSetSlot(i: number, value: any);

  getPrototypeOf(): any;
}

interface Function {
  axApply(thisArg: any, argArray?: any[]): any;
  axCall(thisArg: any): any;
}

var $: Shumway.AVMX.AXSecurityDomain = null;

module Shumway.AVMX {
  /*
   *     +--------------------------+
   *     |      Base Prototype      |
   *     +--------------------------+
   *     |- axHasPropertyInternal   |
   *     |- axHasProperty           |            +-------------------+
   *     |- axSetProperty           |     +-----#|  objectPrototype  |
   *     |- axGetProperty           |     |      +-------------------+
   *     |- axSetPublicProperty     |     |      | - sec             |
   *     |- axGetSlot               |<----+      +-------------------+
   *     |- axSetSlot               |     |
   *     |  …                       |     |
   *     |                          |     |      +-------------------+
   *     |                          |     +-----#|  objectPrototype  |
   *     |                          |            +-------------------+
   *     +--------------------------+            | - sec             |
   *                                             +-------------------+
   *                                                       ^
   *                                                       |
   *                                                       |
   *                                                       #
   *     +-----------------+                        +------------+
   *  +-#|  Class Object   |----------------------->| tPrototype |<-----------------<--------------------+
   *  |  +-----------------+                        +------------+                  |                    |
   *  |                                                    ^                        |                    |
   *  |                                                    |                        |                    |
   *  |                                                    |--------+               |                    |
   *  |                                                    |        |               #                    #
   *  |                         +------------+             |        |      +-----------------+  +-----------------+
   *  |                         | - traits   |             #        |      |     Number      |  |      Uint       |
   *  |  +-----------------+    +------------+      +------------+  |      +-----------------+  +-----------------+
   *  +-#|   Class Class   |--->| tPrototype |#---->| dPrototype |  |      | - value         |  | - value         |
   *  |  +-----------------+    +------------+      +------------+  |      +-----------------+  +-----------------+
   *  |                                ^                            |
   *  |                                |                            |      +-----------------+  +-----------------+
   *  +--------------------------------+----------------------------+-----#|     Boolean     |  |      Array      |
   *  |                                                             |      +-----------------+  +-----------------+
   *  |                                                             |      | - value         |  | - value         |
   *  |  +-----------------+    +------------+      +------------+  |      +-----------------+  +-----------------+
   *  +-#|     Class A     |--->| tPrototype |#---->| dPrototype |#-+
   *  |  +-----------------+    +------------+      +------------+         +-----------------+  +-----------------+
   *  |                         | - traits   |--+          ^               |       Int       |  |    Function     |
   *  |                         +------------+  |          |               +-----------------+  +-----------------+
   *  |                                ^        |          |               | - value         |  | - value         |
   *  |                                |        |          +--------+      +-----------------+  +-----------------+
   *  |                                #        |                   |
   *  |                         +------------+  |   +------------+  |      +-----------------+
   *  |                         |  Object A  |  +-->|   Traits   |  |      |     String      |
   *  |                         +------------+      +------------+  |      +-----------------+
   *  |                                                             |      | - value         |
   *  |                                                             |      +-----------------+
   *  |                                                             |
   *  |                                                             |
   *  |                                                             |
   *  |                                                             |
   *  |                                                             |
   *  | +-----------------+     +------------+      +------------+  |
   *  +#|Class B extends A|---->| tPrototype |#---->| dPrototype |#-+
   *    +-----------------+     +------------+      +------------+
   *                            | - traits   |
   *                            +------------+
   *
   */

  export function validateCall(sec: AXSecurityDomain, fun: AXCallable, argc: number) {
    if (!fun || !fun.axApply) {
      sec.throwError('TypeError', Errors.CallOfNonFunctionError,
                     fun && fun.methodInfo ? fun.methodInfo.getName() : 'value');
    }
    if (fun.methodInfo && argc < fun.methodInfo.minArgs) {
      sec.throwError('ArgumentError', Errors.WrongArgumentCountError, fun.methodInfo.getName(),
                     fun.methodInfo.minArgs, argc);
    }
  }
  export function validateConstruct(sec: AXSecurityDomain, axClass: AXClass, argc: number) {
    if (!axClass || !axClass.axConstruct) {
      var name = axClass && axClass.classInfo ?
                 axClass.classInfo.instanceInfo.getName().name :
                 'value';
      sec.throwError('TypeError', Errors.ConstructOfNonFunctionError, name);
    }
    var methodInfo = axClass.classInfo.getInitializer();
    if (argc < methodInfo.minArgs) {
      sec.throwError('ArgumentError', Errors.WrongArgumentCountError,
                     axClass.classInfo.instanceInfo.getName().name,
                     methodInfo.minArgs, argc);
    }
  }
  export function checkNullParameter(argument: any, name: string, sec: AXSecurityDomain) {
    if (argument == undefined) {
      sec.throwError('TypeError', Errors.NullPointerError, name);
    }
  }
  // REDUX: check if we need this now that we do arg checking at callsites.
  export function checkParameterType(argument: any, name: string, type: AS.ASClass) {
    if (argument == null) {
      type.sec.throwError('TypeError', Errors.NullPointerError, name);
    }
    if (!type.axIsType(argument)) {
      type.sec.throwError('TypeError', Errors.CheckTypeFailedError, argument,
                          type.classInfo.instanceInfo.getClassName());
    }
  }

  export function forEachPublicProperty(object: AS.ASObject, callbackfn: (property: any, value: any) => void, thisArg?: any) {
    // REDUX: Do we need to walk the proto chain here?
    var properties = object.axGetEnumerableKeys();
    for (var i = 0; i < properties.length; i++) {
      var property = properties[i];
      var value = object.axGetPublicProperty(property);
      callbackfn.call(thisArg, property, value);
    }
  }

  export enum WriterFlags {
    None = 0,
    Runtime = 1,
    Execution = 2,
    Interpreter = 4
  }

  var writer = new IndentingWriter(false, function (x) { dumpLine(x); } );
  export var runtimeWriter = null;
  export var executionWriter = null;
  export var interpreterWriter = null;

  export function sliceArguments(args, offset: number) {
    return Array.prototype.slice.call(args, offset);
  }

  export function setWriters(flags: WriterFlags) {
    runtimeWriter = (flags & WriterFlags.Runtime) ? writer : null;
    executionWriter = (flags & (WriterFlags.Execution | WriterFlags.Interpreter)) ? writer : null;
    interpreterWriter = (flags & WriterFlags.Interpreter) ? writer : null;
  }

  export const enum ScriptInfoState {
    None = 0,
    Executing = 1,
    Executed = 2
  }

  import assert = Shumway.Debug.assert;
  import notImplemented = Shumway.Debug.notImplemented;

  import defineNonEnumerableProperty = Shumway.ObjectUtilities.defineNonEnumerableProperty;
  import defineReadOnlyProperty = Shumway.ObjectUtilities.defineReadOnlyProperty;

  import defineNonEnumerableGetterOrSetter = Shumway.ObjectUtilities.defineNonEnumerableGetterOrSetter;
  import ASClass = Shumway.AVMX.AS.ASClass;

  function axBoxIdentity(args) {
    return args[0];
  }

  function axBoxPrimitive(value) {
    var boxed = Object.create(this.tPrototype);
    boxed.value = value;
    return boxed;
  }

  export function ensureBoxedReceiver(sec: AXSecurityDomain, receiver: any, callable: any) {
    if (receiver && typeof receiver === 'object') {
      release || checkValue(receiver);
      return receiver;
    }
    var boxedReceiver = sec.box(receiver);
    // Boxing still leaves `null` and `undefined` unboxed, so return the current global instead.
    if (!boxedReceiver) {
      if (scopeStacks.length) {
        boxedReceiver = scopeStacks[scopeStacks.length - 1].topScope().global.object;
      } else if (callable.receiver) {
        // If no scripts are on the stack (e.g., for ExternalInterface calls), use the function's
        // own global.
        boxedReceiver = callable.receiver.scope.global.object;
      }
    }
    return boxedReceiver;
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

  export function axCoerceInt(x): number {
    return x | 0;
  }

  export function axCoerceUint(x): number {
    return x >>> 0;
  }

  export function axCoerceNumber(x): number {
    if (as3Compatibility) {
      if (typeof x === "string") {
        return AS.ASNumber.convertStringToDouble(x);
      }
      if (x && typeof x === "object") {
        x = x.valueOf(); // Make sure to only call valueOf() once.
        if (typeof x === "string") {
          return AS.ASNumber.convertStringToDouble(x);
        }
      }
    }
    return +x;
  }

  export function axCoerceBoolean(x): boolean {
    return !!x;
  }

  /**
   * Similar to |toString| but returns |null| for |null| or |undefined| instead
   * of "null" or "undefined".
   */
  export function axCoerceString(x): string {
    if (typeof x === "string") {
      return x;
    } else if (x == undefined) {
      return null;
    }
    return x + '';
  }

  /**
   * Same as |axCoerceString| except for returning "null" instead of |null| for
   * |null| or |undefined|, and calls |toString| instead of (implicitly) |valueOf|.
   */
  export function axCoerceName(x): string {
    if (typeof x === "string") {
      return x;
    } else if (x == undefined) {
      return 'null';
    }
    return x.toString();
  }

  export function axConvertString(x): string {
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

  function axIsXMLCollection(x, sec: AXSecurityDomain): boolean {
    return sec.AXXML.dPrototype.isPrototypeOf(x) ||
           sec.AXXMLList.dPrototype.isPrototypeOf(x);
  }

  export function axGetDescendants(object, mn: Multiname, sec: AXSecurityDomain) {
    if (!axIsXMLCollection(object, sec)) {
      sec.throwError('TypeError', Errors.DescendentsError, object);
    }
    return object.descendants(mn);
  }

  export function axCheckFilter(sec: AXSecurityDomain, value) {
    if (!value || !AS.isXMLCollection(value, sec)) {
      var className = value && value.axClass ? value.axClass.name.toFQNString(false) : '[unknown]';
      sec.throwError('TypeError', Errors.FilterError, className);
    }
    return value;
  }

  export function axFalse(): boolean {
    return false;
  }

  /**
   * Returns the current interpreter frame's callee.
   */
  function axGetArgumentsCallee(): AXFunction {
    var callee = this.callee;
    if (callee) {
      return callee;
    }
    release || assert(this.receiver);
    release || assert(this.methodInfo);
    if (this.methodInfo.trait === null) {
      console.error('arguments.callee used on trait-less methodInfo function. Probably a constructor');
      return null;
    }
    release || assert(this.methodInfo.trait);
    var mn = this.methodInfo.trait.name;
    var methodClosure = this.receiver.axGetProperty(mn);
    release || assert(this.sec.AXMethodClosure.tPrototype === Object.getPrototypeOf(methodClosure));
    return methodClosure;
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
  export function axAdd(l: any, r: any, sec: AXSecurityDomain): any {
    release || assert(!(typeof l === "number" && typeof r === "number"), 'Inline number addition.');
    if (typeof l === "string" || typeof r === "string") {
      return String(l) + String(r);
    }
    if (AS.isXMLCollection(l, sec) && AS.isXMLCollection(r, sec)) {
      return AS.ASXMLList.addXML(l, r);
    }
    return l + r;
  }

  export function axEquals(left: any, right: any, sec: AXSecurityDomain): boolean {
    // See E4X spec, 11.5 Equality Operators for why this is required.
    if (AS.isXMLType(left, sec)) {
      return left.equals(right);
    }
    if (AS.isXMLType(right, sec)) {
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

  export function isValidASValue(value: any) {
    return AXBasePrototype.isPrototypeOf(value) || isPrimitiveJSValue(value);
  }

  export function checkValue(value: any) {
    if (!release) {
      if (!isValidASValue(value)) {
        // Stringifying the value is potentially costly, so only do it if necessary,
        // even in debug mode.
        assert(false, "Value: " + value + " is not allowed to flow into AS3.");
      }
    }
  }

  export function axTypeOf(x: any, sec: AXSecurityDomain): string {
    // ABC doesn't box primitives, so typeof returns the primitive type even when
    // the value is new'd
    if (x) {
      if (x.value) {
        return typeof x.value;
      }
      if (axIsXMLCollection(x, sec)) {
        return "xml";
      }
    }
    return typeof x;
  }

  export function axIsCallable(value): boolean {
    return (value && typeof value.axApply === 'function');
  }

  function axCoerce(x: any) {
    if (isNullOrUndefined(x)) {
      return null;
    }
    if (!this.axIsType(x)) {
      this.sec.throwError('TypeError', Errors.CheckTypeFailedError, x,
                                     this.classInfo.instanceInfo.getClassName());
    }
    return x;
  }

  function axImplementsInterface(type: AXClass) {
    var interfaces = (<AXClass>this).classInfo.instanceInfo.getInterfaces(this.axClass);
    return interfaces.has(type);
  }

  function axIsTypeObject(x: any) {
    return this.dPrototype.isPrototypeOf(this.sec.box(x)) || x === this.dPrototype;
  }

  function axIsTypeInterface(x: any) {
    if (!x || typeof x !== 'object') {
      return false;
    }
    release || checkValue(x);
    return (<AXClass>x).axImplementsInterface(this);
  }

  function axAsType(x: any): any {
    return this.axIsType(x) ? x : null;
  }

  function axIsInstanceOfObject(x: any) {
    return this.dPrototype.isPrototypeOf(this.sec.box(x));
  }

  function axIsInstanceOfInterface(x: any) {
    return false;
  }

  /**
   * All objects with Traits must implement this interface.
   */
  export interface ITraits {
    traits: RuntimeTraits;
    sec: AXSecurityDomain;
  }

  export class Scope {
    parent: Scope;
    global: Scope;
    object: AXObject;
    isWith: boolean;
    cache: any;
    defaultNamespace: Namespace;

    constructor(parent: Scope, object: any, isWith: boolean = false) {
      this.parent = parent;
      this.object = object;
      this.global = parent ? parent.global : this;
      this.isWith = isWith;
      this.cache = [];
      this.defaultNamespace = null;
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
      // Multinames with a `null` name are the any name, '*'. Need to catch those here, because
      // otherwise we'll get a failing assert in `RuntimeTraits#getTrait` below.
      if (mn.name === null) {
        this.global.object.sec.throwError('ReferenceError', Errors.UndefinedVarError, '*');
      }
      var object;
      if (!scopeOnly && !mn.isRuntime()) {
        if ((object = this.cache[mn.id])) {
          return object;
        }
      }
      // Scope lookups should not be trapped by proxies. Except for with scopes, check only trait
      // properties.
      if (this.object && (this.isWith ?
                          this.object.axHasPropertyInternal(mn) :
                          this.object.traits.getTrait(mn.namespaces, mn.name))) {
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
        this.object.sec.throwError("ReferenceError", Errors.UndefinedVarError, mn.name);
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
          this.global.object.sec.throwError("ReferenceError", Errors.UndefinedVarError, mn.name);
        }
      }

      // Can't find it still, return the global object.
      return globalObject;
    }
  }

  export function applyTraits(object: ITraits, traits: RuntimeTraits) {
    release || assert(!object.hasOwnProperty("traits"));
    defineReadOnlyProperty(object, "traits", traits);
    var T = traits.getTraitsList();
    for (var i = 0; i < T.length; i++) {
      var t = T[i];
      var p: PropertyDescriptor = t;
      if (p.value instanceof Namespace) {
        // We can't call |object.sec.AXNamespace.FromNamespace(...)| because the
        // AXNamespace class may not have been loaded yet. However, at this point we do have a
        // valid reference to |object.sec.AXNamespace| because |prepareNativeClass| has
        // been called.
        p = { value: AS.ASNamespace.FromNamespace.call(object.sec.AXNamespace, p.value) };
      }
      if (!release && (t.kind === TRAIT.Slot || t.kind === TRAIT.Const)) {
        checkValue(p.value);
      }
      Object.defineProperty(object, t.name.getMangledName(), p);
    }
  }

  var D = defineNonEnumerableProperty;

  // The Object that's at the root of all AXObjects' prototype chain, regardless of their
  // SecurityDomain.
  export var AXBasePrototype = null;

  function AXBasePrototype_$BgtoString() {
    // Dynamic prototypes just return [object Object], so we have to special-case them.
    // Since the dynamic object is the one holding the direct reference to `classInfo`,
    // we can check for that.
    var name = this.hasOwnProperty('classInfo') ?
               'Object' :
               this.classInfo.instanceInfo.name.name;
    return Shumway.StringUtilities.concat3("[object ", name, "]");
  };
  function AXBasePrototype_toString() {
    return this.$BgtoString.axCall(this);
  };
  function AXBasePrototype_$BgvalueOf() {
    return this;
  };
  function AXBasePrototype_valueOf() {
    return this.$BgvalueOf.axCall(this);
  };

  /**
   * Execute this lazily because we want to make sure the AS package is available.
   */
  function initializeAXBasePrototype() {
    if (AXBasePrototype) {
      return;
    }
    var Op = AS.ASObject.prototype;
    AXBasePrototype = Object.create(null);
    D(AXBasePrototype, "axHasPropertyInternal", Op.axHasPropertyInternal);
    D(AXBasePrototype, "axHasProperty", Op.axHasProperty);
    D(AXBasePrototype, "axSetProperty", Op.axSetProperty);
    D(AXBasePrototype, "axHasProperty", Op.axHasProperty);
    D(AXBasePrototype, "axHasPublicProperty", Op.axHasPublicProperty);
    D(AXBasePrototype, "axSetPublicProperty", Op.axSetPublicProperty);
    D(AXBasePrototype, "axGetPublicProperty", Op.axGetPublicProperty);
    D(AXBasePrototype, "axCallPublicProperty", Op.axCallPublicProperty);
    D(AXBasePrototype, "axDeletePublicProperty", Op.axDeletePublicProperty);
    D(AXBasePrototype, "axGetProperty", Op.axGetProperty);
    D(AXBasePrototype, "axDeleteProperty", Op.axDeleteProperty);
    D(AXBasePrototype, "axGetSuper", Op.axGetSuper);
    D(AXBasePrototype, "axSetSuper", Op.axSetSuper);
    D(AXBasePrototype, "axSetSlot", Op.axSetSlot);
    D(AXBasePrototype, "axGetSlot", Op.axGetSlot);
    D(AXBasePrototype, "axCallProperty", Op.axCallProperty);
    D(AXBasePrototype, "axCallSuper", Op.axCallSuper);
    D(AXBasePrototype, "axConstructProperty", Op.axConstructProperty);
    D(AXBasePrototype, "axResolveMultiname", Op.axResolveMultiname);
    D(AXBasePrototype, "axNextNameIndex", Op.axNextNameIndex);
    D(AXBasePrototype, "axNextName", Op.axNextName);
    D(AXBasePrototype, "axNextValue", Op.axNextValue);
    D(AXBasePrototype, "axGetEnumerableKeys", Op.axGetEnumerableKeys);
    D(AXBasePrototype, "axImplementsInterface", axImplementsInterface);

    // Dummy traits object so Object.prototype lookups succeed.
    D(AXBasePrototype, "traits", new RuntimeTraits(null, null, Object.create(null)));

    // Helper methods borrowed from Object.prototype.
    D(AXBasePrototype, "isPrototypeOf", Object.prototype.isPrototypeOf);
    D(AXBasePrototype, "hasOwnProperty", Object.prototype.hasOwnProperty);

    AXBasePrototype.$BgtoString = AXBasePrototype_$BgtoString;
    AXBasePrototype.toString = AXBasePrototype_toString;
    AXBasePrototype.$BgvalueOf = AXBasePrototype_$BgvalueOf;
    AXBasePrototype.valueOf = AXBasePrototype_valueOf;
  }

  export interface AXObject extends ITraits, IMetaobjectProtocol {
    $BgtoString: AXCallable;
    $BgvalueOf: AXCallable;
    axInitializer: any;
    axClass: AXClass;
  }

  export interface AXGlobal extends AXObject {
    sec: AXSecurityDomain;
    applicationDomain: AXApplicationDomain;
    scriptInfo: ScriptInfo;
    scope: Scope;
  }

  export interface AXClass extends AXObject {
    scope: Scope;
    asClass: ASClass;
    superClass: AXClass;
    classInfo: ClassInfo;
    name: Multiname;
    // Used to initialize Vectors.
    defaultValue: any;
    tPrototype: AXObject;
    dPrototype: AXObject;
    axBox: (x: any) => any;
    axConstruct: (args: any[]) => AXObject;
    axApply: (self: AXObject, args: any[]) => any;
    axCoerce: (x: any) => any;
    axIsType: (x: any) => boolean;
    axAsType: (x: any) => boolean;
    axIsInstanceOf: (x: any) => boolean;
    axImplementsInterface: (x: AXClass) => boolean;
  }

  export interface AXFunction extends AXObject {
    axApply(thisArg: any, argArray?: any[]): any;
    axCall(thisArg: any): any;
    value;
  }

  export interface AXMethodClosureClass extends AXClass {
    Create(receiver: AXObject, method: Function): AXFunction;
  }

  export interface AXXMLClass extends AXClass {
    Create(value?: any): AS.ASXML;
    resetSettings: () => void;
    _flags: number;
    _prettyIndent: number;
    prettyPrinting: boolean;
    ignoreComments: boolean;
    ignoreWhitespace: boolean;
    ignoreProcessingInstructions: boolean;
  }

  export interface AXXMLListClass extends AXClass {
    Create(value?: any): AS.ASXMLList;
    CreateList(targetObject: AS.ASXML, targetProperty: Multiname): AS.ASXMLList;
  }

  export interface AXNamespaceClass extends AXClass {
    Create(uriOrPrefix?: any, uri?: any): AS.ASNamespace;
    FromNamespace(ns: Namespace): AS.ASNamespace;
    defaultNamespace: Namespace;
  }

  export interface AXQNameClass extends AXClass {
    Create(nameOrNS?: any, name?: any): AS.ASQName;
    FromMultiname(mn: Multiname): AS.ASQName;
  }

  /**
   * Can be used wherever both AXFunctions and raw JS functions are valid values.
   */
  export interface AXCallable {
    axApply(thisArg: any, argArray?: any[]): any;
    axCall(thisArg: any, arg0?: any, arg1?: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any,
           arg6?: any, arg7?: any, arg8?: any, arg9?: any): any;
    apply(thisArg: any, argArray?: any[]): any;
    call(thisArg: any, arg0?: any, arg1?: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any,
         arg6?: any, arg7?: any, arg8?: any, arg9?: any): any;
    methodInfo?: MethodInfo;
    length: number;
  }

  // Add the |axApply| and |axCall| methods on the function prototype so that we can treat
  // Functions as AXCallables.
  Function.prototype.axApply = Function.prototype.apply;
  Function.prototype.axCall = Function.prototype.call;

  export interface AXActivation extends ITraits {

  }

  export interface AXCatch extends ITraits {

  }

  /**
   * Make sure we bottom out at the securityDomain's objectPrototype.
   */
  export function safeGetPrototypeOf(object: AXObject): AXObject {
    var axClass = object.axClass;
    if (!axClass || axClass === axClass.sec.AXObject) {
      return null;
    }

    var prototype = axClass.dPrototype;
    if (prototype === object) {
      prototype = axClass.superClass.dPrototype;
    }
    release || assert(prototype.sec);
    return prototype;
  }

  export class HasNext2Info {
    constructor(public object: AXObject, public index: number) {
      // ...
    }

    /**
     * Determine if the given object has any more properties after the specified |index| and if so,
     * return the next index or |zero| otherwise. If the |obj| has no more properties then continue
     * the search in
     * |obj.__proto__|. This function returns an updated index and object to be used during
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
     * #2 The spec says we need to get the nextName at index + 1, but it's actually index - 1, this
     * caused me two hours of my life that I will probably never get back.
     *
     * TODO: We can't match the iteration order semantics of Action Script, hopefully programmers
     * don't rely on it.
     */
    next(object: AXObject, index: number) {
      if (isNullOrUndefined(object)) {
        this.index = 0;
        this.object = null;
        return;
      } else {
        this.object = object;
        this.index = index;
      }
      var nextIndex = object.axNextNameIndex(this.index);
      if (nextIndex > 0) {
        this.index = nextIndex;
        return;
      }
      // If there are no more properties in the object then follow the prototype chain.
      while (true) {
        var object = safeGetPrototypeOf(object);
        if (!object) {
          this.index = 0;
          this.object = null;
          return;
        }
        nextIndex = object.axNextNameIndex(0);
        if (nextIndex > 0) {
          this.index = nextIndex;
          this.object = object;
          return;
        }
      }
    }
  }

  /**
   * Generic axConstruct method that lives on the AXClass prototype. This just
   * creates an empty object with the right prototype and then calls the
   * instance initializer.
   *
   * TODO: Flatten out the argArray, or create an alternate ax helper to
   * make object construction faster.
   */
  function axConstruct(argArray?: any[]) {
    var object = Object.create(this.tPrototype);
    object.axInitializer.apply(object, argArray);
    return object;
  }

  /**
   * Default initializer.
   */
  function axDefaultInitializer() {
    // Nop.
  }

  /**
   * Throwing initializer for interfaces.
   */
  function axInterfaceInitializer() {
    this.sec.throwError("VerifierError", Errors.NotImplementedError, this.name.name);
  }

  /**
   * Default axApply.
   */
  function axDefaultApply(self, args: any []) {
    return this.axCoerce(args ? args[0] : undefined);
  }

  export var scopeStacks: ScopeStack[] = [];

  export function getCurrentScope(): Scope {
    if (scopeStacks.length === 0) {
      return null;
    }
    return scopeStacks[scopeStacks.length - 1].topScope();
  }

  export function getCurrentABC() {
    if (scopeStacks.length === 0) {
      return null;
    }
    var globalObject = <any>scopeStacks[scopeStacks.length - 1].topScope().global.object;
    return (<ScriptInfo>globalObject.scriptInfo).abc;
  }

  /**
   * Provides security isolation between application domains.
   */
  export class AXSecurityDomain {
    public system: AXApplicationDomain;
    public application: AXApplicationDomain;
    public classAliases: ClassAliases;
    public AXObject: AXClass;
    public AXArray: AXClass;
    public AXClass: AXClass;
    public AXFunction: AXClass;
    public AXMethodClosure: AXMethodClosureClass;
    public AXError: AXClass;
    public AXNumber: AXClass;
    public AXString: AXClass;
    public AXBoolean: AXClass;
    public AXRegExp: AXClass;
    public AXMath: AXClass;
    public AXDate: AXClass;

    public AXXML: AXXMLClass;
    public AXXMLList: AXXMLListClass;
    public AXNamespace: AXNamespaceClass;
    public AXQName: AXQNameClass;

    public ObjectVector: typeof AS.GenericVector;
    public Int32Vector: typeof AS.Int32Vector;
    public Uint32Vector: typeof AS.Uint32Vector;
    public Float64Vector: typeof AS.Float64Vector;

    public get xmlParser(): AS.XMLParser {
      return this._xmlParser || (this._xmlParser = new AS.XMLParser(this));
    }

    private _xmlParser: AS.XMLParser;

    private AXPrimitiveBox;
    private AXGlobalPrototype;
    private AXActivationPrototype;
    private AXCatchPrototype;
    private _AXFunctionUndefinedPrototype;

    public get AXFunctionUndefinedPrototype() {
      return this._AXFunctionUndefinedPrototype ||
             (this._AXFunctionUndefinedPrototype = this.createObject());
    }

    public objectPrototype: AXObject;
    public argumentsPrototype: AXObject;
    private rootClassPrototype: AXObject;

    private nativeClasses: any;
    private vectorClasses: Map<AXClass, AXClass>;

    private _catalogs: ABCCatalog [];

    constructor() {
      initializeAXBasePrototype();
      this.system = new AXApplicationDomain(this, null);
      this.application = new AXApplicationDomain(this, this.system);
      this.classAliases = new ClassAliases();
      this.nativeClasses = Object.create(null);
      this.vectorClasses = new Map<AXClass, AXClass>();
      this._catalogs = [];
    }

    addCatalog(abcCatalog: ABCCatalog) {
      this._catalogs.push(abcCatalog);
    }

    findDefiningABC(mn: Multiname): ABCFile {
      runtimeWriter && runtimeWriter.writeLn("findDefiningABC: " + mn);
      var abcFile = null;
      for (var i = 0; i < this._catalogs.length; i++) {
        var abcCatalog = this._catalogs[i];
        abcFile = abcCatalog.getABCByMultiname(mn);
        if (abcFile) {
          return abcFile;
        }
      }
      return null;
    }

    throwError(className: string, error: any, replacement1?: any,
               replacement2?: any, replacement3?: any, replacement4?: any) {
      throw this.createError.apply(this, arguments);
    }

    createError(className: string, error: any, replacement1?: any,
               replacement2?: any, replacement3?: any, replacement4?: any) {
      var message = formatErrorMessage.apply(null, sliceArguments(arguments, 1));
      var mn = Multiname.FromFQNString(className, NamespaceType.Public);
      var axClass: AXClass = <any>this.system.getProperty(mn, true, true);
      return axClass.axConstruct([message, error.code]);
    }

    applyType(axClass: AXClass, types: AXClass []): AXClass {
      var vectorProto = (<AXClass><any>this.ObjectVector.axClass).superClass.dPrototype;
      if (!vectorProto.isPrototypeOf(axClass.dPrototype)) {
        this.throwError('TypeError', Errors.TypeAppOfNonParamType);
      }
      if (types.length !== 1) {
        this.throwError('TypeError', Errors.WrongTypeArgCountError, '__AS3__.vec::Vector', 1,
                        types.length);
      }
      var type = types[0] || this.AXObject;
      return this.getVectorClass(type);
    }

    getVectorClass(type: AXClass): AXClass {
      var vectorClass = this.vectorClasses.get(type);
      if (vectorClass) {
        return vectorClass;
      }
      var typeClassName = type ?
                          type.classInfo.instanceInfo.getName().getMangledName() :
                          '$BgObject';
      switch (typeClassName) {
        case "$BgNumber":
        case "$Bgdouble":
          vectorClass = <any>this.Float64Vector.axClass;
          break;
        case "$Bgint":
          vectorClass = <any>this.Int32Vector.axClass;
          break;
        case "$Bguint":
          vectorClass = <any>this.Uint32Vector.axClass;
          break;
        default:
          vectorClass = this.createVectorClass(type);
      }
      this.vectorClasses.set(type, vectorClass);
      return vectorClass;
    }

    createVectorClass(type: AXClass): AXClass {
      var genericVectorClass = this.ObjectVector.axClass;
      var axClass: AXClass = Object.create(genericVectorClass);
      // Put the superClass tPrototype on the prototype chain so we have access
      // to all factory protocol handlers by default.
      axClass.tPrototype = Object.create(genericVectorClass.tPrototype);
      axClass.tPrototype.axClass = axClass;
      // We don't need a new dPrototype object.
      axClass.dPrototype = <any>genericVectorClass.dPrototype;
      axClass.superClass = <any>genericVectorClass;
      (<any>axClass).type = type;
      return axClass;
    }

    /**
     * Constructs a plain vanilla object in this security domain.
     */
    createObject() {
      return Object.create(this.AXObject.tPrototype);
    }

    /**
     * Takes a JS Object and transforms it into an AXObject.
     */
    createObjectFromJS(value: Object, deep: boolean = false) {
      var keys = Object.keys(value);
      var result = this.createObject();
      for (var i = 0; i < keys.length; i++) {
        var v = value[keys[i]];
        if (deep) {
          v = AS.transformJSValueToAS(this, v, true);
        }
        result.axSetPublicProperty(keys[i], v);
      }
      return result;
    }

    /**
     * Constructs an AXArray in this security domain and sets its value to the given array.
     * Warning: This doesn't handle non-indexed keys.
     */
    createArrayUnsafe(value: any[]) {
      var array = Object.create(this.AXArray.tPrototype);
      array.value = value;
      if (!release) { // Array values must only hold index keys.
        for (var k in value) {
          assert(isIndex(k));
          checkValue(value[k]);
        }
      }
      return array;
    }

    /**
     * Constructs an AXArray in this security domain and copies all enumerable properties of
     * the given array, setting them as public properties on the AXArray.
     * Warning: this does not use the given Array as the `value`.
     */
    createArray(value: any[]) {
      var array = this.createArrayUnsafe([]);
      for (var k in value) {
        array.axSetPublicProperty(k, value[k]);
        release || checkValue(value[k]);
      }
      array.length = value.length;
      return array;
    }

    /**
     * Constructs an AXFunction in this security domain and sets its value to the given function.
     */
    boxFunction(value: Function) {
      var fn = Object.create(this.AXFunction.tPrototype);
      fn.value = value;
      return fn;
    }

    createClass(classInfo: ClassInfo, superClass: AXClass, scope: Scope): AXClass {
      var instanceInfo = classInfo.instanceInfo;
      var className = instanceInfo.getName().toFQNString(false);
      var axClass: AXClass = this.nativeClasses[className] ||
                             Object.create(this.AXClass.tPrototype);
      var classScope = new Scope(scope, axClass);
      if (!this.nativeClasses[className]) {
        if (instanceInfo.isInterface()) {
          axClass.dPrototype = Object.create(this.objectPrototype);
          axClass.tPrototype = Object.create(axClass.dPrototype);
          axClass.tPrototype.axInitializer = axInterfaceInitializer;
          axClass.axIsInstanceOf = axIsInstanceOfInterface;
          axClass.axIsType = axIsTypeInterface;
        } else {
          // For direct descendants of Object, we want the dynamic prototype to inherit from
          // Object's tPrototype because Foo.prototype is always a proper instance of Object.
          // For all other cases, the dynamic prototype should extend the parent class's
          // dynamic prototype not the tPrototype.
          if (superClass === this.AXObject) {
            axClass.dPrototype = Object.create(this.objectPrototype);
          } else {
            axClass.dPrototype = Object.create(superClass.dPrototype);
          }
          axClass.tPrototype = Object.create(axClass.dPrototype);
          axClass.tPrototype.axInitializer = this.createInitializerFunction(classInfo, classScope);
        }
      } else {
        axClass.tPrototype.axInitializer = this.createInitializerFunction(classInfo, classScope);
        // Native classes have their inheritance structure set up during initial SecurityDomain
        // creation.
        release || assert(axClass.dPrototype);
        release || assert(axClass.tPrototype);
      }

      axClass.classInfo = (<any>axClass.dPrototype).classInfo = classInfo;
      (<any>axClass.dPrototype).axClass = axClass;
      axClass.superClass = superClass;
      axClass.scope = scope;

      // Object and Class have their traits initialized earlier to avoid circular dependencies.
      if (className !== 'Object' && className !== 'Class') {
        this.initializeRuntimeTraits(axClass, superClass, classScope);
      }

      // Add the |constructor| property on the class dynamic prototype so that all instances can
      // get to their class constructor, and FooClass.prototype.constructor returns FooClass.
      defineNonEnumerableProperty(axClass.dPrototype, "$Bgconstructor", axClass);

      // Copy over all TS symbols.
      AS.tryLinkNativeClass(axClass);

      // Run the static initializer.
      var initializer = classInfo.getInitializer();
      var initializerCode = initializer.getBody().code;
      // ... except if it's the standard class initializer that doesn't really do anything.
      if (initializerCode[0] !== 208 || initializerCode[1] !== 48 || initializerCode[2] !== 71) {
        interpret(axClass, initializer, classScope, [axClass], null);
      }
      return axClass;
    }

    private initializeRuntimeTraits(axClass: AXClass, superClass: AXClass, scope: Scope) {
      var classInfo = axClass.classInfo;
      var instanceInfo = classInfo.instanceInfo;

      // Prepare class traits.
      var classTraits: RuntimeTraits;
      if (axClass === this.AXClass) {
        classTraits = instanceInfo.traits.resolveRuntimeTraits(null, null, scope);
      } else {
        var rootClassTraits = this.AXClass.classInfo.instanceInfo.runtimeTraits;
        release || assert(rootClassTraits);
        // Class traits don't capture the class' scope. This is relevant because it allows
        // referring to global names that would be shadowed if the class scope were active.
        // Haxe's stdlib uses just such constructs, e.g. Std.parseFloat calls the global
        // parseFloat.
        classTraits = classInfo.traits.resolveRuntimeTraits(rootClassTraits, null, scope.parent);
      }
      classInfo.runtimeTraits = classTraits;
      applyTraits(axClass, classTraits);

      // Prepare instance traits.
      var superInstanceTraits = superClass ? superClass.classInfo.instanceInfo.runtimeTraits : null;
      var protectedNs = classInfo.abc.getNamespace(instanceInfo.protectedNs);
      var instanceTraits = instanceInfo.traits.resolveRuntimeTraits(superInstanceTraits,
                                                                    protectedNs, scope);
      instanceInfo.runtimeTraits = instanceTraits;
      applyTraits(axClass.tPrototype, instanceTraits);
    }

    createFunction(methodInfo: MethodInfo, scope: Scope, hasDynamicScope: boolean): AXFunction {
      var traceMsg = !release && flashlog && methodInfo.trait ? methodInfo.toFlashlogString() : null;
      var fun = this.boxFunction(function () {
        release || (traceMsg && flashlog.writeAS3Trace(methodInfo.toFlashlogString()));
        var self = this === jsGlobal ? scope.global.object : this;
        return interpret(self, methodInfo, scope, <any>arguments, fun);
      });
      //fun.methodInfo = methodInfo;
      fun.receiver = {scope: scope};
      if (!release) {
        try {
          Object.defineProperty(fun.value, 'name', {value: methodInfo.getName()});
        } catch (e) {
          // Ignore errors in browsers that don't allow overriding Function#length;
        }
      }
      return fun;
    }

    createInitializerFunction(classInfo: ClassInfo, scope: Scope): AXCallable {
      var methodInfo = classInfo.instanceInfo.getInitializer();
      var traceMsg = !release && flashlog && methodInfo.trait ? methodInfo.toFlashlogString() : null;
      var fun = AS.getNativeInitializer(classInfo);
      if (!fun) {
        release || assert(!methodInfo.isNative(), "Must provide a native initializer for " +
                                                  classInfo.instanceInfo.getClassName());
        fun = function () {
          release || (traceMsg && flashlog.writeAS3Trace(methodInfo.toFlashlogString()));
          return interpret(this, methodInfo, scope, <any>arguments, null);
        };
        if (!release) {
          try {
            var className = classInfo.instanceInfo.getName().toFQNString(false);
            Object.defineProperty(fun, 'name', {value: className});
          } catch (e) {
            // Ignore errors in browsers that don't allow overriding Function#length;
          }
        }
        // REDUX: enable arg count checking on native ctors. Currently impossible because natives
        // are frozen.
        fun.methodInfo = methodInfo;
      }
      return fun;
    }

    createActivation(methodInfo: MethodInfo, scope: Scope): AXActivation {
      var body = methodInfo.getBody();
      if (!body.activationPrototype) {
        body.traits.resolve();
        body.activationPrototype = Object.create(this.AXActivationPrototype);
        defineReadOnlyProperty(body.activationPrototype, "traits", body.traits.resolveRuntimeTraits(null, null, scope));
      }
      return Object.create(body.activationPrototype);
    }

    createCatch(exceptionInfo: ExceptionInfo, scope: Scope): AXCatch {
      if (!exceptionInfo.catchPrototype) {
        var traits = exceptionInfo.getTraits();
        exceptionInfo.catchPrototype = Object.create(this.AXCatchPrototype);
        defineReadOnlyProperty(exceptionInfo.catchPrototype, "traits",
                               traits.resolveRuntimeTraits(null, null, scope));
      }
      return Object.create(exceptionInfo.catchPrototype);
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

    createAXGlobal(applicationDomain: AXApplicationDomain, scriptInfo: ScriptInfo) {
      var global: AXGlobal = Object.create(this.AXGlobalPrototype);
      global.applicationDomain = applicationDomain;
      global.scriptInfo = scriptInfo;

      var scope = global.scope = new Scope(null, global, false);
      var objectTraits = this.AXObject.classInfo.instanceInfo.runtimeTraits;
      var traits = scriptInfo.traits.resolveRuntimeTraits(objectTraits, null, scope);
      applyTraits(global, traits);
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
      var dynamicClassPrototype: AXObject = Object.create(this.objectPrototype);
      var rootClassPrototype: AXObject = Object.create(dynamicClassPrototype);
      rootClassPrototype.$BgtoString = function axClassToString() {
        return "[class " + this.classInfo.instanceInfo.getName().name + "]";
      };

      var D = defineNonEnumerableProperty;
      D(rootClassPrototype, "axBox", axBoxIdentity);
      D(rootClassPrototype, "axCoerce", axCoerce);
      D(rootClassPrototype, "axIsType", axIsTypeObject);
      D(rootClassPrototype, "axAsType", axAsType);
      D(rootClassPrototype, "axIsInstanceOf", axIsInstanceOfObject);
      D(rootClassPrototype, "axConstruct", axConstruct);
      D(rootClassPrototype, "axApply", axDefaultApply);
      Object.defineProperty(rootClassPrototype, 'name', {
        get: function () {
          return this.classInfo.instanceInfo.name;
        }
      });

      this.rootClassPrototype = rootClassPrototype;
    }

    private initializeCoreNatives() {
      // Some facts:
      // - The Class constructor is itself an instance of Class.
      // - The Class constructor is an instance of Object.
      // - The Object constructor is an instance of Class.
      // - The Object constructor is an instance of Object.

      this.prepareRootClassPrototype();
      var AXClass = this.prepareNativeClass("AXClass", "Class", false);
      AXClass.classInfo = this.system.findClassInfo("Class");
      AXClass.defaultValue = null;

      var AXObject = this.prepareNativeClass("AXObject", "Object", false);
      AXObject.classInfo = this.system.findClassInfo("Object");

      var AXObject = this.AXObject;

      // AXFunction needs to exist for runtime trait resolution.
      var AXFunction = this.prepareNativeClass("AXFunction", "Function", false);
      defineNonEnumerableProperty(AXFunction, "axBox", axBoxPrimitive);

      // Initialization of the core classes' traits is a messy multi-step process:

      // First, create a scope for looking up all the things.
      var scope = new Scope(null, AXClass, false);

      // Then, create the runtime traits all Object instances share.
      var objectCI = this.AXObject.classInfo;
      var objectII = objectCI.instanceInfo;
      var objectRTT = objectII.runtimeTraits = objectII.traits.resolveRuntimeTraits(null, null,
                                                                                    scope);
      applyTraits(this.AXObject.tPrototype, objectRTT);

      // Building on that, create the runtime traits all Class instances share.
      var classCI = this.AXClass.classInfo;
      var classII = classCI.instanceInfo;
      classII.runtimeTraits = classII.traits.resolveRuntimeTraits(objectRTT, null, scope);
      applyTraits(this.AXClass.tPrototype, classII.runtimeTraits);

      // As sort of a loose end, also create the one class trait Class itself has.
      classCI.runtimeTraits = classCI.traits.resolveRuntimeTraits(objectRTT, null, scope);
      applyTraits(this.AXClass, classCI.runtimeTraits);

      // Now we can create Object's runtime class traits.
      objectCI.runtimeTraits = objectCI.traits.resolveRuntimeTraits(classII.runtimeTraits, null,
                                                                    scope);
      applyTraits(this.AXObject, objectCI.runtimeTraits);
      return AXObject;
    }

    prepareNativeClass(exportName: string, name: string, isPrimitiveClass: boolean) {
      var axClass: AXClass = Object.create(this.rootClassPrototype);

      // For Object and Class, we've already created the instance prototype to break
      // circular dependencies.
      if (name === 'Object') {
        axClass.dPrototype = <any>Object.getPrototypeOf(this.objectPrototype);
        axClass.tPrototype = this.objectPrototype;
      } else if (name === 'Class') {
        axClass.dPrototype = <any>Object.getPrototypeOf(this.rootClassPrototype);
        axClass.tPrototype = this.rootClassPrototype;
      } else {
        var instancePrototype = isPrimitiveClass ?
                                this.AXPrimitiveBox.dPrototype :
                                exportName === 'AXMethodClosure' ?
                                  this.AXFunction.dPrototype :
                                  this.objectPrototype;
        axClass.dPrototype = Object.create(instancePrototype);
        axClass.tPrototype = Object.create(axClass.dPrototype);
      }
      this[exportName] = this.nativeClasses[name] = axClass;
      return axClass;
    }

    preparePrimitiveClass(exportName: string, name: string, convert, defaultValue, coerce,
                          isType, isInstanceOf) {
      var axClass = this.prepareNativeClass(exportName, name, true);
      var D = defineNonEnumerableProperty;
      D(axClass, 'axBox', axBoxPrimitive);
      D(axClass, "axApply", function axApply(_ , args: any []) {
        return convert(args && args.length ? args[0] : defaultValue);
      });
      D(axClass, "axConstruct", function axConstruct(args: any []) {
        return convert(args && args.length ? args[0] : defaultValue);
      });
      D(axClass, "axCoerce", coerce);
      D(axClass, "axIsType", isType);
      D(axClass, "axIsInstanceOf", isInstanceOf);
      D(axClass.dPrototype, "value", defaultValue);
      return axClass;
    }

    /**
     * Configures all the builtin Objects.
     */
    initialize() {
      var D = defineNonEnumerableProperty;
      
      // The basic dynamic prototype that all objects in this security domain have in common.
      var dynamicObjectPrototype = Object.create(AXBasePrototype);
      dynamicObjectPrototype.sec = this;
      // The basic traits prototype that all objects in this security domain have in common.
      Object.defineProperty(this, 'objectPrototype',
                            {value: Object.create(dynamicObjectPrototype)});
      this.initializeCoreNatives();

      // Debugging Helper
      release || (this.objectPrototype['trace'] = function trace() {
        var self = this;
        var writer = new IndentingWriter();
        this.traits.traits.forEach(t => {
          writer.writeLn(t + ": " + self[t.getName().getMangledName()]);
        });
      });

      this.AXGlobalPrototype = Object.create(this.objectPrototype);
      this.AXGlobalPrototype.$BgtoString = function() {
        return '[object global]';
      };

      this.AXActivationPrototype = Object.create(this.objectPrototype);
      this.AXActivationPrototype.$BgtoString = function() {
        return '[Activation]';
      };

      this.AXCatchPrototype = Object.create(this.objectPrototype);
      this.AXCatchPrototype.$BgtoString = function() {
        return '[Catch]';
      };

      // The core classes' MOP hooks and dynamic prototype methods are defined
      // here to keep all the hooks initialization in one place.
      var AXObject = this.AXObject;
      var AXFunction = this.AXFunction;

      // Object(null) creates an object, and this behaves differently than:
      // (function (x: Object) { trace (x); })(null) which prints null.
      D(AXObject, "axApply", axApplyObject);
      D(AXObject, "axConstruct", axConstructObject);
      D(AXObject.tPrototype, "axInitializer", axDefaultInitializer);
      D(AXObject, "axCoerce", axCoerceObject);

      this.prepareNativeClass("AXMethodClosure", "builtin.as$0.MethodClosure", false);
      this.prepareNativeClass("AXError", "Error", false);

      this.prepareNativeClass("AXMath", "Math", false);
      this.prepareNativeClass("AXDate", "Date", false);

      this.prepareNativeClass("AXXML", "XML", false);
      this.prepareNativeClass("AXXMLList", "XMLList", false);
      this.prepareNativeClass("AXQName", "QName", false);
      this.prepareNativeClass("AXNamespace", "Namespace", false);

      var AXArray = this.prepareNativeClass("AXArray", "Array", false);
      D(AXArray, 'axBox', axBoxPrimitive);
      AXArray.tPrototype.$BgtoString = AXFunction.axBox(function () {
        return this.value.toString();
      });
      // Array.prototype is an Array, and behaves like one.
      AXArray.dPrototype['value'] = [];

      this.argumentsPrototype = Object.create(this.AXArray.tPrototype);
      Object.defineProperty(this.argumentsPrototype, '$Bgcallee', {get: axGetArgumentsCallee});

      var AXRegExp = this.prepareNativeClass("AXRegExp", "RegExp", false);
      // RegExp.prototype is an (empty string matching) RegExp, and behaves like one.
      AXRegExp.dPrototype['value'] = /(?:)/;

      // Boolean, int, Number, String, and uint are primitives in AS3. We create a placeholder
      // base class to help us with instanceof tests.
      var AXPrimitiveBox = this.prepareNativeClass("AXPrimitiveBox", "PrimitiveBox", false);
      D(AXPrimitiveBox.dPrototype, '$BgtoString',
        AXFunction.axBox(function () { return this.value.toString(); }));
      var AXBoolean = this.preparePrimitiveClass("AXBoolean", "Boolean", axCoerceBoolean, false,
                                                 axCoerceBoolean, axIsTypeBoolean, axIsTypeBoolean);

      var AXString = this.preparePrimitiveClass("AXString", "String", axConvertString, '',
                                                 axCoerceString, axIsTypeString, axIsTypeString);

      var AXNumber = this.preparePrimitiveClass("AXNumber", "Number", axCoerceNumber, 0,
                                                axCoerceNumber, axIsTypeNumber, axIsTypeNumber);

      var AXInt = this.preparePrimitiveClass("AXInt", "int", axCoerceInt, 0, axCoerceInt,
                                             axIsTypeInt, axFalse);

      var AXUint = this.preparePrimitiveClass("AXUint", "uint", axCoerceUint, 0, axCoerceUint,
                                              axIsTypeUint, axFalse);

      // Install class loaders on the security domain.
      AS.installClassLoaders(this.application, this);
      AS.installNativeFunctions(this);
    }
  }

  /**
   * All code lives within an application domain.
   */
  export class AXApplicationDomain {
    /**
     * All application domains have a reference to the root, or system application domain.
     */
    public system: AXApplicationDomain;

    /**
     * Parent application domain.
     */
    public parent: AXApplicationDomain;

    public sec: ISecurityDomain;

    private _abcs: ABCFile [];

    constructor(sec: AXSecurityDomain, parent: AXApplicationDomain) {
      this.sec = sec;
      this.parent = parent;
      this.system = parent ? parent.system : this;
      this._abcs = [];
    }

    public loadABC(abc: ABCFile) {
      assert (this._abcs.indexOf(abc) < 0);
      this._abcs.push(abc);
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
      var global = this.sec.createAXGlobal(this, scriptInfo);
      scriptInfo.global = global;
      scriptInfo.state = ScriptInfoState.Executing;
      interpret(<any>global, scriptInfo.getInitializer(), global.scope, [], null);
      scriptInfo.state = ScriptInfoState.Executed;
    }

    public findProperty(mn: Multiname, strict: boolean, execute: boolean): AXGlobal {
      release || assert(mn instanceof Multiname);
      var script = this.findDefiningScript(mn, execute);
      if (script) {
        return script.global;
      }
      return null;
    }

    public getClass(mn: Multiname): AXClass {
      release || assert(mn instanceof Multiname);
      return <any>this.getProperty(mn, true, true);
    }

    public getProperty(mn: Multiname, strict: boolean, execute: boolean): AXObject {
      release || assert(mn instanceof Multiname);
      var global: any = this.findProperty(mn, strict, execute);
      if (global) {
        return global.axGetProperty(mn);
      }
      return null;
    }

    public findDefiningScript(mn: Multiname, execute: boolean): ScriptInfo {
      release || assert(mn instanceof Multiname);
      // Look in parent domain first.
      var script: ScriptInfo;
      if (this.parent) {
        script = this.parent.findDefiningScript(mn, execute);
        if (script) {
          return script;
        }
      }

      // Search through the loaded abcs.
      for (var i = 0; i < this._abcs.length; i++) {
        var abc = this._abcs[i];
        script = this._findDefiningScriptInABC(abc, mn, execute);
        if (script) {
          return script;
        }
      }

      // Still no luck, so let's ask the security domain to load additional ABCs and try again.
      var abc = this.system.sec.findDefiningABC(mn);
      if (abc) {
        this.loadABC(abc);
        script = this._findDefiningScriptInABC(abc, mn, execute);
        release || assert(script, 'Shall find class in loaded ABC');
        return script;
      }

      return null;
    }

    private _findDefiningScriptInABC(abc: ABCFile, mn: Multiname, execute: boolean): ScriptInfo {
      var scripts = abc.scripts;
      for (var j = 0; j < scripts.length; j++) {
        var script = scripts[j];
        var traits = script.traits;
        traits.resolve();
        if (traits.getTrait(mn)) {
          // Ensure script is executed.
          if (execute && script.state === ScriptInfoState.None) {
            this.executeScript(script);
          }
          return script;
        }
      }
      return null;
    }
  }
}
