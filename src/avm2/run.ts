interface IMetaObjectProtocol {
  axHasPropertyInternal(mn: Shumway.AVMX.Multiname): boolean;
  axSetProperty(mn: Shumway.AVMX.Multiname, value: any);
  axSetPublicProperty(nm: any, value: any);
}

interface Function {
  axApply(thisArg: any, argArray?: any): any;
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

  export function asCoerceObject(x): Object {
    if (x instanceof Boolean) {
      return x.valueOf();
    } else if (x == undefined) {
      return null;
    }
    if (typeof x === 'string' || typeof x === 'number') {
      return x;
    }
    return Object(x);
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
      return false;
    }
    return true;
  }

  function checkValue(value: any) {
    assert(isValidASValue(value), "Value: " + value + " is not allowed to flow into AS3.");
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
    // ABC doesn't box primitives, so typeof returns the primitive type even when
    // the value is new'd
    if (x) {
      if (x.constructor === String) {
        return "string"
      } else if (x.constructor === Number) {
        return "number"
      } else if (x.constructor === Boolean) {
        return "boolean"
      } else if (x instanceof Shumway.AVM2.AS.ASXML ||
        x instanceof Shumway.AVM2.AS.ASXMLList) {
        return "xml";
      } else if (Shumway.AVM2.AS.ASClass.isType(x)) {
        return "object";
      }
    }
    return typeof x;
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

    public findScopeProperty(mn: Multiname, strict: boolean, scopeOnly: boolean): Object {
      var object: Object;
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

  export interface AXGlobal extends ITraits {
    applicationDomain: ApplicationDomain;
    scriptInfo: ScriptInfo;
    scope: Scope;
  }

  export interface AXClass extends ITraits, Function {
    scope: Scope;
    superClass: AXClass;
    classInfo: ClassInfo;
    tPrototype: Object;
    dPrototype: Object;
    prototype: Object
    axConstruct: any;
    axApply: any;
  }

  export interface AXFunction extends ITraits {

  }

  export interface AXActivation extends ITraits {

  }

  function initializeJavaScriptGlobal() {
    // Add the |axApply| method on the function prototype so that we can treat
    // Functions as AXFunctions.
    Function.prototype.axApply = Function.prototype.apply;
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
    public AXGlobal;
    public AXClass;
    public AXFunction;
    public AXActivation;
    public AXNumber;
    public AXString;
    public AXBoolean;
    public AXPrimitiveBox;

    constructor() {
      this.system = new ApplicationDomain(this, null);
      this.application = new ApplicationDomain(this, this.system);
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
        body.activationPrototype = new this.AXActivation(body);
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
      if (v instanceof Array) {
        return new this.AXArray(v);
      }
      if (typeof v === "number") {
        return new this.AXNumber(v);
      }
      if (typeof v === "string") {
        return new this.AXString(v);
      }
      assert(false, "Cannot box: " + v);
    }

    isPrimitive(v: any) {
      return isPrimitiveJSValue(v) || v instanceof this.AXPrimitiveBox;
    }

    /**
     * Configures all the builtin Objects.
     */
    initialize() {
      var nativeClasses = Object.create(null);
      var classClassInfo = this.system.findClassInfo("Class");
      var staticClassClassTraits = classClassInfo.instanceInfo.traits;

      classClassInfo.instanceInfo.traits.resolve();

      var securityDomain = this;

      // Object
      var AXObject: AXClass = <any>function axObject() {};
      AXObject.dPrototype = Object.create(null);
      AXObject.tPrototype = Object.create(AXObject.dPrototype);
      AXObject.prototype = AXObject.tPrototype;

      var axPrototype: any = AXObject.dPrototype;

      axPrototype.securityDomain = securityDomain;

      var axObjectPrototype: any = AXObject.prototype;

      // Debugging Helper
      axObjectPrototype.trace = function trace() {
        var self = this;
        var writer = new IndentingWriter();
        this.traits.traits.forEach(t => {
          writer.writeLn(t + ": " + self[t.getName().getMangledName()]);
        });
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
      AXClass.prototype.toString = function () {
        return "[class " + this.classInfo.instanceInfo.getName().name + "]";
      };
      var axClassPrototype: any = AXClass.prototype;

      // We modify the __proto__ of class constructor functions to point to AXClass.prototype. This means that they no longer
      // have the |call| and |apply| functions. We add them back here for convenience.
      axClassPrototype.call = Function.prototype.call;
      axClassPrototype.apply = Function.prototype.apply;

      // Array
      var AXArray: AXClass = <any>function axArray(v: Array<any>) {
        this.value = v;
      };
      AXArray.dPrototype = Object.create(AXObject.tPrototype);
      AXArray.tPrototype = Object.create(AXArray.dPrototype);
      AXArray.prototype = AXArray.tPrototype;
      AXArray.prototype.toString = function () {
        return this.value.toString();
      };

      var AXGlobal = <any>function axGlobal(applicationDomain: ApplicationDomain, scriptInfo: ScriptInfo) {
        this.applicationDomain = applicationDomain;
        this.scriptInfo = scriptInfo;
        this.traits = scriptInfo.traits;
        this.traits.resolve();
        this.scope = new Scope(null, this, false);
        applyTraits(this, this.traits, this.scope);
      };
      AXGlobal.prototype = Object.create(AXObject.dPrototype);
      AXGlobal.prototype.toString = function () {
        return "[object global]";
      };

      var AXActivation = <any>function AXActivation(methodBodyInfo: MethodBodyInfo) {
        methodBodyInfo.traits.resolve();
        this.traits = methodBodyInfo.traits;
      };
      AXActivation.prototype = Object.create(AXObject.dPrototype);
      AXActivation.prototype.toString = function () {
        return "[Activation]";
      };

      var AXFunction: AXClass = <any>function axFunction(v: Function) {
        this.value = v;
      };
      AXFunction.dPrototype = Object.create(AXObject.tPrototype);
      AXFunction.tPrototype = Object.create(AXFunction.dPrototype);
      AXFunction.prototype = AXFunction.tPrototype;
      AXFunction.prototype.toString = function () {
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
      AXBoolean.prototype.toString = function () { return this.value.toString(); };

      var AXNumber = <any>function axNumber(v: number) { this.value = v; };
      AXNumber.dPrototype = Object.create(AXPrimitiveBox.tPrototype);
      AXNumber.tPrototype = Object.create(AXNumber.dPrototype);
      AXNumber.prototype = AXNumber.tPrototype;
      AXNumber.prototype.toString = function () { return this.value.toString(); };

      var AXInt = <any>function axInt(v: number) { this.value = v; };
      AXInt.dPrototype = Object.create(AXPrimitiveBox.tPrototype);
      AXInt.tPrototype = Object.create(AXInt.dPrototype);
      AXInt.prototype = AXInt.tPrototype;
      AXInt.prototype.toString = function () { return this.value.toString(); };

      var AXUint = <any>function axUint(v: number) { this.value = v; };
      AXUint.dPrototype = Object.create(AXPrimitiveBox.tPrototype);
      AXUint.tPrototype = Object.create(AXUint.dPrototype);
      AXUint.prototype = AXUint.tPrototype;
      AXUint.prototype.toString = function () { return this.value.toString(); };

      var AXString = <any>function axString(v: string) { this.value = v; };
      AXString.dPrototype = Object.create(AXPrimitiveBox.tPrototype);
      AXString.tPrototype = Object.create(AXString.dPrototype);
      AXString.prototype = AXString.tPrototype;
      AXString.prototype.toString = function () { return this.value; };

      function defineClasses(exportName, name, value: AXClass, axApply, axConstruct) {
        securityDomain[exportName] = nativeClasses[name] = value;
        value.dPrototype.toString = function () {
          return "[" + name + ".prototype]";
        };
        value.axApply = axApply;
        value.axConstruct = axConstruct;
        (<any>Object).setPrototypeOf(value, AXClass.prototype);
      }

      function axApplyIdentity(self, args) {
        return args[0];
      }

      function axConstructIdentity(args) {
        return args[0];
      }

      defineClasses("AXObject", "Object", AXObject, axApplyIdentity, axConstructIdentity);
      defineClasses("AXClass", "Class", AXClass, axApplyIdentity, axConstructIdentity);
      defineClasses("AXFunction", "Function", AXFunction, axApplyIdentity, axConstructIdentity);
      defineClasses("AXArray", "Array", AXArray, axApplyIdentity, axConstructIdentity);

      defineClasses("AXPrimitiveBox", "PrimitiveBox", AXPrimitiveBox, null, null);
      defineClasses("AXNumber", "Number", AXNumber, axApplyIdentity, axConstructIdentity);
      defineClasses("AXInt", "int", AXInt, axApplyIdentity, axConstructIdentity);
      defineClasses("AXUint", "uint", AXUint, axApplyIdentity, axConstructIdentity);
      defineClasses("AXString", "String", AXString, axApplyIdentity, axConstructIdentity);
      defineClasses("AXBoolean", "Boolean", AXBoolean, axApplyIdentity, axConstructIdentity);

      securityDomain.AXGlobal = AXGlobal;
      securityDomain.AXActivation = AXActivation;

      (<any>Object).setPrototypeOf(AXGlobal, AXObject.prototype);
      (<any>Object).setPrototypeOf(AXActivation, AXObject.prototype);

      var D = defineNonEnumerableProperty;

      D(AXObject.dPrototype, "axHasPropertyInternal", axHasPropertyInternal);
      D(AXObject.dPrototype, "axSetProperty", axSetProperty);
      D(AXObject.dPrototype, "axSetPublicProperty", axSetPublicProperty);
      D(AXObject.dPrototype, "axGetProperty", axGetProperty);
      D(AXObject.dPrototype, "axCallProperty", axCallProperty);
      D(AXObject.dPrototype, "axConstructProperty", axConstructProperty);
      D(AXObject.dPrototype, "axResolveMultiname", axResolveMultiname);

      var P = function setPublicProperty(object, name, value) {
        object.axSetPublicProperty(name, new securityDomain.AXFunction(value));
      };

      var Ap = Array.prototype;

      P(AXArray.dPrototype, "push", function () { return Ap.push.apply(this.value, arguments); });
      P(AXArray.dPrototype, "pop", function () { return this.value.pop(); });
      P(AXArray.dPrototype, "shift", function () { return this.value.shift(); });
      P(AXArray.dPrototype, "unshift", function () { return Ap.unshift.apply(this.value, arguments); });
      P(AXArray.dPrototype, "reverse", function () { this.value.reverse(); return this; });
      P(AXArray.dPrototype, "concat", function () {
        var value: Array<any> = this.value.slice();
        for (var i = 0; i < arguments.length; i++) {
          var a = arguments[i];
          if (a instanceof <any>AXArray) {
            Ap.push.apply(value, a);
          } else {
            value.push(a);
          }
        }
        return new securityDomain.AXArray(value);
      });
      P(AXArray.dPrototype, "slice", function (startIndex: number, endIndex: number) {
        return new securityDomain.AXArray(this.value.slice(startIndex, endIndex));
      });
      P(AXArray.dPrototype, "join", function (sep: string) {
        return this.value.join(sep);
      });
      P(AXArray.dPrototype, "toString", function () {
        return this.value.join(',');
      });
      P(AXArray.dPrototype, "indexOf", function (value: any, fromIndex: number) {
        return this.value.indexOf(value, fromIndex|0);
      });
      P(AXArray.dPrototype, "lastIndexOf", function (value: any, fromIndex: number) {
        return this.value.lastIndexOf(value, arguments.length > 1 ? fromIndex : 0x7fffffff);
      });
      P(AXArray.dPrototype, "every", function (callbackfn: {value: Function}, thisArg?) {
        return this.value.every(callbackfn.value, thisArg);
      });
      P(AXArray.dPrototype, "some", function (callbackfn: {value: Function}, thisArg?) {
        return this.value.some(callbackfn.value, thisArg);
      });
      P(AXArray.dPrototype, "forEach", function (callbackfn: {value: Function}, thisArg?) {
        return this.value.forEach(callbackfn.value, thisArg);
      });
      P(AXArray.dPrototype, "map", function (callbackfn: {value: Function}, thisArg?) {
        return new securityDomain.AXArray(this.value.map(callbackfn.value, thisArg));
      });
      P(AXArray.dPrototype, "filter", function (callbackfn: {value: Function}, thisArg?) {
        return new securityDomain.AXArray(this.value.filter(callbackfn.value, thisArg));
      });

      D(AXArray.prototype, "axGetProperty", axArrayGetProperty);
      D(AXArray.prototype, "axSetProperty", axArraySetProperty);

      D(AXFunction.prototype, "axCall", axFunctionCall);
      D(AXFunction.prototype, "axApply", axFunctionApply);
      D(AXFunction.prototype, "axConstruct", axFunctionConstruct);

      P(AXFunction.dPrototype, "call", function (self, a, b, c) {
        if (securityDomain.isPrimitive(self)) {
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
        if (securityDomain.isPrimitive(self)) {
          self = null;
        }
        return this.value.apply(self, args.value);
      });


      //self.Number = function Number(v) {
      //  this.value = v;
      //};
      //self.Number.prototype = Object.create(this.Object.prototype);
      //
      //self.String = function String(v) {
      //  this.value = v;
      //};
      //self.String.prototype = Object.create(this.Object.prototype);
      //
      //self.Global = function Global(applicationDomain: ApplicationDomain, scriptInfo: ScriptInfo) {
      //  this.applicationDomain = applicationDomain;
      //  this.scriptInfo = scriptInfo;
      //  this.traits = scriptInfo.traits;
      //  this.traits.resolve();
      //  this.scope = new Scope(null, this, false);
      //  applyTraits(this, this.traits, this.scope);
      //};
      //
      //self.Global.prototype = Object.create(this.Object.prototype);
      //self.Global.prototype.toString = function () {
      //  return new String("[Global Object]");
      //};
      //



      //
      //$ = self;
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
      var global = new this.securityDomain.AXGlobal(this, scriptInfo);
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
