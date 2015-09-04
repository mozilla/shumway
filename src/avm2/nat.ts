/*
 * Copyright 2015 Mozilla Foundation
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
module Shumway.AVM2.AS {
  // Keep this module around for now so the flash.js package doesn't fail.
  export class ASObject {

  }
  export class ASNative extends ASObject {

  }
  export class ASError extends ASObject {

  }
}

interface ISecurityDomain extends Shumway.AVMX.AXSecurityDomain {
  ObjectVector: typeof Shumway.AVMX.AS.GenericVector;
  Int32Vector: typeof Shumway.AVMX.AS.Int32Vector;
  Uint32Vector: typeof Shumway.AVMX.AS.Uint32Vector;
  Float64Vector: typeof Shumway.AVMX.AS.Float64Vector;
}

/**
 * Make Shumway bug-for-bug compatible with Tamarin.
 */
var as3Compatibility = true;


/**
 * AS3 has a bug when converting a certain character range to lower case.
 */
function as3ToLowerCase(value: string) {
  var chars: string [] = null;
  for (var i = 0; i < value.length; i++) {
    var charCode = value.charCodeAt(i);
    if (charCode >= 0x10A0 && charCode <= 0x10C5) {
      if (!chars) {
        chars = new Array(value.length);
      }
      chars[i] = String.fromCharCode(charCode + 48);
    }
  }
  if (chars) {
    // Fill in remaining chars if the bug needs to be emulated.
    for (var i = 0; i < chars.length; i++) {
      var char = chars[i];
      if (!char) {
        chars[i] = value.charAt(i).toLocaleString();
      }
    }
    return chars.join("");
  }
  return value.toLowerCase();
}

module Shumway.AVMX.AS {

  import assert = Shumway.Debug.assert;
  import hasOwnProperty = Shumway.ObjectUtilities.hasOwnProperty;
  import hasOwnGetter = Shumway.ObjectUtilities.hasOwnGetter;
  import getOwnGetter = Shumway.ObjectUtilities.getOwnGetter;
  import defineNonEnumerableProperty = Shumway.ObjectUtilities.defineNonEnumerableProperty;
  import isNullOrUndefined = Shumway.isNullOrUndefined;
  import isPrototypeWriteable = Shumway.ObjectUtilities.isPrototypeWriteable;
  import notImplemented = Shumway.Debug.notImplemented;
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;
  import assertUnreachable = Shumway.Debug.assertUnreachable;
  import boxValue = Shumway.ObjectUtilities.boxValue;
  import pushMany = Shumway.ArrayUtilities.pushMany;
  import Scope = Shumway.AVMX.Scope;

  import defineNonEnumerableGetter = Shumway.ObjectUtilities.defineNonEnumerableGetter;
  import copyOwnPropertyDescriptors = Shumway.ObjectUtilities.copyOwnPropertyDescriptors;
  import copyPropertiesByList = Shumway.ObjectUtilities.copyPropertiesByList;

  import Multiname = Shumway.AVMX.Multiname;

  var writer = new IndentingWriter();

  function wrapJSGlobalFunction(fun) {
    return function(sec, ...args) {
      return fun.apply(jsGlobal, args);
    };
  }

  /**
   * Other natives can live in this module
   */
  export module Natives {

    export function print(sec: AXSecurityDomain, expression: any, arg1?: any, arg2?: any,
                          arg3?: any, arg4?: any) {
      var args = Array.prototype.slice.call(arguments, 1);
      jsGlobal.print.apply(null, args);
    }

    export function debugBreak(v: any) {
      /* tslint:disable */
      debugger;
      /* tslint:enable */
    }

    export function bugzilla(_: AXSecurityDomain, n) {
      switch (n) {
        case 574600: // AS3 Vector::map Bug
          return true;
      }
      return false;
    }

    export function decodeURI(sec: AXSecurityDomain, encodedURI: string): string {
      try {
        return jsGlobal.decodeURI(encodedURI);
      } catch (e) {
        sec.throwError('URIError', Errors.InvalidURIError, 'decodeURI');
      }
    }

    export function decodeURIComponent(sec: AXSecurityDomain, encodedURI: string): string {
      try {
        return jsGlobal.decodeURIComponent(encodedURI);
      } catch (e) {
        sec.throwError('URIError', Errors.InvalidURIError, 'decodeURIComponent');
      }
    }

    export function encodeURI(sec: AXSecurityDomain, uri: string): string {
      try {
        return jsGlobal.encodeURI(uri);
      } catch (e) {
        sec.throwError('URIError', Errors.InvalidURIError, 'encodeURI');
      }
    }

    export function encodeURIComponent(sec: AXSecurityDomain, uri: string): string {
      try {
        return jsGlobal.encodeURIComponent(uri);
      } catch (e) {
        sec.throwError('URIError', Errors.InvalidURIError, 'encodeURIComponent');
      }
    }
    export var isNaN: (number: number) => boolean = wrapJSGlobalFunction(jsGlobal.isNaN);
    export var isFinite: (number: number) => boolean = wrapJSGlobalFunction(jsGlobal.isFinite);
    export var parseInt: (s: string, radix?: number) => number = wrapJSGlobalFunction(jsGlobal.parseInt);
    export var parseFloat: (string: string) => number = wrapJSGlobalFunction(jsGlobal.parseFloat);
    export var escape: (x: any) => any = wrapJSGlobalFunction(jsGlobal.escape);
    export var unescape: (x: any) => any = wrapJSGlobalFunction(jsGlobal.unescape);
    export var isXMLName: (x: any) => boolean = function () {
      return false; // "FIX ME";
    };
    export var notImplemented: (x: any) => void = wrapJSGlobalFunction(jsGlobal.Shumway.Debug.notImplemented);

    /**
     * Returns the fully qualified class name of an object.
     */
    export function getQualifiedClassName(_: AXSecurityDomain, value: any):string {
      release || checkValue(value);
      var valueType = typeof value;
      switch (valueType) {
        case 'undefined':
          return 'void';
        case 'object':
          if (value === null) {
            return 'null';
          }
          return value.classInfo.instanceInfo.name.toFQNString(true);
        case 'number':
          return (value | 0) === value ? 'int' : 'Number';
        case 'string':
          return 'String';
        case 'boolean':
          return 'Boolean';
      }
      release || assertUnreachable('invalid value type ' + valueType);
    }

    /**
     * Returns the fully qualified class name of the base class of the object specified by the
     * |value| parameter.
     */
    export function getQualifiedSuperclassName(sec: AXSecurityDomain, value: any) {
      if (isNullOrUndefined(value)) {
        return "null";
      }
      value = sec.box(value);
      // The value might be from another domain, so don't use passed-in the current
      // AXSecurityDomain.
      var axClass = value.sec.AXClass.axIsType(value) ?
                    (<AXClass>value).superClass :
                    value.axClass.superClass;
      return getQualifiedClassName(sec, axClass);
    }
    /**
     * Returns the class with the specified name, or |null| if no such class exists.
     */
    export function getDefinitionByName(sec: AXSecurityDomain, name: string): AXClass {
      name = axCoerceString(name).replace("::", ".");
      var mn = Multiname.FromFQNString(name, NamespaceType.Public);
      return getCurrentABC().env.app.getClass(mn);
    }

    export function describeType(sec: AXSecurityDomain, value: any, flags: number) {
      return AS.describeType(sec, value, flags);
    }

    export function describeTypeJSON(sec: AXSecurityDomain, value: any, flags: number) {
      return AS.describeTypeJSON(sec, value, flags);
    }
  }

  var nativeClasses: Shumway.MapObject<ASClass> = Shumway.ObjectUtilities.createMap<ASClass>();
  var nativeFunctions: Shumway.MapObject<Function> = Shumway.ObjectUtilities.createMap<Function>();

  /**
   * Searches for natives using a string path "a.b.c...".
   */
  export function getNative(path: string): Function {
    var chain = path.split(".");
    var v: any = Natives;
    for (var i = 0, j = chain.length; i < j; i++) {
      v = v && v[chain[i]];
    }
    if (!v) {
      v = nativeFunctions[path];
    }
    release || assert(v, "getNative(" + path + ") not found.");
    return v;
  }

  var rn = new Multiname(null, 0, CONSTANT.RTQNameL, [], null);

  export function makeMultiname(v: any, namespace?: Namespace) {
    var rn = new Multiname(null, 0, CONSTANT.RTQNameL, [], null);
    rn.namespaces = namespace ? [namespace] : [Namespace.PUBLIC];
    rn.name = v;
    return rn;
  }

  function qualifyPublicName(v: any) {
    return isIndex(v) ? v : '$Bg' + v;
  }


  export function addPrototypeFunctionAlias(object: AXObject, name: string, fun: Function) {
    release || assert(name.indexOf('$Bg') === 0);
    release || assert(typeof fun === 'function');
    // REDUX: remove the need to box the function.
    defineNonEnumerableProperty(object, name, object.sec.AXFunction.axBox(fun));
  }

  export function checkReceiverType(receiver: AXObject, type: AXClass, methodName: string) {
    if (!type.dPrototype.isPrototypeOf(receiver)) {
      receiver.sec.throwError('TypeError', Errors.InvokeOnIncompatibleObjectError,
                                         methodName);
    }
  }

  /**
   * MetaobjectProtocol base traps. Inherit some or all of these to
   * implement custom behaviour.
   */
  export class ASObject implements IMetaobjectProtocol {
    traits: RuntimeTraits;
    sec: ISecurityDomain;

    // Declare all instance ASObject fields as statics here so that the TS
    // compiler can convert ASClass class objects to ASObject instances.

    static traits: RuntimeTraits;
    static dPrototype: ASObject;
    static tPrototype: ASObject;
    protected static _methodClosureCache: any;
    static classNatives: Object [];
    static instanceNatives: Object [];
    static sec: ISecurityDomain;
    static classSymbols = null;
    static instanceSymbols = null;
    static classInfo: ClassInfo;

    static axResolveMultiname: (mn: Multiname) => any;
    static axHasProperty: (mn: Multiname) => boolean;
    static axDeleteProperty: (mn: Multiname) => boolean;
    static axCallProperty: (mn: Multiname, argArray: any [], isLex: boolean) => any;
    static axCallSuper: (mn: Shumway.AVMX.Multiname, scope: Shumway.AVMX.Scope, argArray: any []) => any;
    static axConstructProperty: (mn: Multiname, args: any []) => any;
    static axHasPropertyInternal: (mn: Multiname) => boolean;
    static axHasOwnProperty: (mn: Multiname) => boolean;
    static axSetProperty: (mn: Multiname, value: any, bc: Bytecode) => void;
    static axInitProperty: (mn: Multiname, value: any) => void;
    static axGetProperty: (mn: Multiname) => any;
    static axGetMethod: (name: string) => AXFunction;
    static axGetSuper: (mn: Multiname, scope: Scope) => any;
    static axSetSuper: (mn: Multiname, scope: Scope, value: any) => void;

    static axEnumerableKeys: any [];
    static axGetEnumerableKeys: () => any [];
    static axHasPublicProperty: (nm: any) => boolean;
    static axSetPublicProperty: (nm: any, value: any) => void;
    static axGetPublicProperty: (nm: any) => any;
    static axCallPublicProperty: (nm: any, argArray: any []) => any;
    static axDeletePublicProperty: (nm: any) => boolean;

    static axSetNumericProperty: (nm: number, value: any) => void;
    static axGetNumericProperty: (nm: number) => any;

    static axCoerce: (v: any) => any;
    static axConstruct: (argArray?: any []) => any;

    static axNextNameIndex: (index: number) => number;
    static axNextName: (index: number) => any;
    static axNextValue: (index: number) => any;

    static axGetSlot: (i: number) => any;
    static axSetSlot: (i: number, value: any) => void;

    static axIsType: (value: any) => boolean;

    static getPrototypeOf: () => boolean;
    static native_isPrototypeOf: (nm: string) => boolean;
    static native_hasOwnProperty: (nm: string) => boolean;
    static native_propertyIsEnumerable: (nm: string) => boolean;
    static native_setPropertyIsEnumerable: (nm: string, enumerable?: boolean) => boolean;

    static classInitializer() {
      var proto: any = this.dPrototype;
      var asProto: any = ASObject.prototype;
      addPrototypeFunctionAlias(proto, "$BghasOwnProperty", asProto.native_hasOwnProperty);
      addPrototypeFunctionAlias(proto, "$BgpropertyIsEnumerable",
                                asProto.native_propertyIsEnumerable);
      addPrototypeFunctionAlias(proto, "$BgsetPropertyIsEnumerable",
                                asProto.native_setPropertyIsEnumerable);
      addPrototypeFunctionAlias(proto, "$BgisPrototypeOf", asProto.native_isPrototypeOf);
      addPrototypeFunctionAlias(proto, '$BgtoLocaleString', asProto.toString);
    }

    constructor() {
      // To prevent accidental instantiation of template classes, make sure that we throw
      // right during construction.
      release || checkValue(this);
    }

    static _init() {
      // Nop.
    }

    static init() {
      // Nop.
    }

    static axClass: any;
    axClass: any;

    getPrototypeOf: () => any;

    native_isPrototypeOf(v: any): boolean {
      return this.isPrototypeOf(this.sec.box(v));
    }

    native_hasOwnProperty(nm: string): boolean {
      return this.axHasOwnProperty(makeMultiname(nm));
    }

    native_propertyIsEnumerable(nm: string): boolean {
      var descriptor = Object.getOwnPropertyDescriptor(this, qualifyPublicName(axCoerceString(nm)));
      return !!descriptor && descriptor.enumerable;
    }

    native_setPropertyIsEnumerable(nm: string, enumerable: boolean = true): void {
      var qualifiedName = qualifyPublicName(axCoerceString(nm));
      enumerable = !!enumerable;
      var instanceInfo = this.axClass.classInfo.instanceInfo;
      if (instanceInfo.isSealed() && this !== this.axClass.dPrototype) {
        this.sec.throwError('ReferenceError', Errors.WriteSealedError, nm, instanceInfo.name.name);
      }
      // Silently ignore trait properties.
      var descriptor = Object.getOwnPropertyDescriptor(this.axClass.tPrototype, qualifiedName);
      if (descriptor && this !== this.axClass.dPrototype) {
        return;
      }
      var descriptor = Object.getOwnPropertyDescriptor(this, qualifiedName);
      // ... and non-existent properties.
      if (!descriptor) {
        return;
      }
      if (descriptor.enumerable !== enumerable) {
        descriptor.enumerable = enumerable;
        Object.defineProperty(this, qualifiedName, descriptor);
      }
    }

    axResolveMultiname(mn: Multiname): any {
      var name = mn.name;
      if (typeof name === 'number' || isNumeric(name = axCoerceName(name))) {
        release || assert(mn.isRuntimeName());
        return +name;
      }
      var t = this.traits.getTrait(mn.namespaces, name);
      return t ? t.name.getMangledName() : '$Bg' + name;
    }

    axHasProperty(mn: Multiname): boolean {
      return this.axHasPropertyInternal(mn);
    }

    axHasPublicProperty(nm: any): boolean {
      rn.name = nm;
      var result = this.axHasProperty(rn);
      release || assert(rn.name === nm || isNaN(rn.name) && isNaN(nm));
      return result;
    }

    axSetProperty(mn: Multiname, value: any, bc: Bytecode) {
      release || checkValue(value);
      var name = mn.name;
      if (typeof name === 'number' || isNumeric(name = axCoerceName(name))) {
        release || assert(mn.isRuntimeName());
        this[+name] = value;
        return;
      }
      var freeze = false;
      var t = this.traits.getTrait(mn.namespaces, name);
      if (t) {
        var mangledName = t.name.getMangledName();
        switch (t.kind) {
          case TRAIT.Method:
            this.sec.throwError('ReferenceError', Errors.CannotAssignToMethodError, name,
                                this.axClass.name.name);
            // Unreachable because of throwError.
          case TRAIT.Getter:
            this.sec.throwError('ReferenceError', Errors.ConstWriteError, name,
                                this.axClass.name.name);
            // Unreachable because of throwError.
          case TRAIT.Class:
          case TRAIT.Const:
            // Technically, we need to check if the currently running function is the
            // initializer of whatever class/package the property is initialized on.
            // In practice, we freeze the property after first assignment, causing
            // an internal error to be thrown if it's being initialized a second time.
            // Invalid bytecode could leave out the assignent during first initialization,
            // but it's hard to see how that could convert into real-world problems.
            if (bc !== Bytecode.INITPROPERTY) {
              this.sec.throwError('ReferenceError', Errors.ConstWriteError, name,
                                  this.axClass.name.name);
            }
            freeze = true;
            break;
        }
        var type = t.getType();
        if (type) {
          value = type.axCoerce(value);
        }
      } else {
        mangledName = '$Bg' + name;
      }
      this[mangledName] = value;
      if (freeze) {
        Object.defineProperty(this, mangledName, {__proto__: null, writable: false});
      }
    }

    axGetProperty(mn: Multiname): any {
      var name = this.axResolveMultiname(mn);
      var value = this[name];
      if (typeof value === 'function') {
        return this.axGetMethod(name);
      }
      release || checkValue(value);
      return value;
    }

    protected _methodClosureCache: any;

    axGetMethod(name: string): AXFunction {
      release || assert(typeof this[name] === 'function');
      var cache = this._methodClosureCache;
      if (!cache) {
        Object.defineProperty(this, '_methodClosureCache', {value: Object.create(null)});
        cache = this._methodClosureCache;
      }
      var method = cache[name];
      if (!method) {
        method = cache[name] = this.sec.AXMethodClosure.Create(<any>this, this[name]);
      }
      return method;
    }

    axGetSuper(mn: Multiname, scope: Scope): any {
      var name = axCoerceName(mn.name);
      var namespaces = mn.namespaces;
      var trait = (<AXClass>scope.parent.object).tPrototype.traits.getTrait(namespaces, name);
      var value;
      if (trait.kind === TRAIT.Getter || trait.kind === TRAIT.GetterSetter) {
        value = trait.get.call(this);
      } else {
        var mangledName = trait.name.getMangledName();
        value = this[mangledName];
        if (typeof value === 'function') {
          return this.axGetMethod(mangledName);
        }
      }
      release || checkValue(value);
      return value;
    }

    axSetSuper(mn: Multiname, scope: Scope, value: any) {
      release || checkValue(value);
      var name = axCoerceName(mn.name);
      var namespaces = mn.namespaces;
      var trait = (<AXClass>scope.parent.object).tPrototype.traits.getTrait(namespaces, name);
      var type = trait.getType();
      if (type) {
        value = type.axCoerce(value);
      }
      if (trait.kind === TRAIT.Setter || trait.kind === TRAIT.GetterSetter) {
        trait.set.call(this, value);
      } else {
        this[trait.name.getMangledName()] = value;
      }
    }

    axDeleteProperty(mn: Multiname): any {
      // Cannot delete traits.
      var name = axCoerceName(mn.name);
      var namespaces = mn.namespaces;
      if (this.traits.getTrait(namespaces, name)) {
        return false;
      }
      return delete this[mn.getPublicMangledName()];
    }

    axCallProperty(mn: Multiname, args: any [], isLex: boolean): any {
      var name = this.axResolveMultiname(mn);
      var fun = this[name];
      validateCall(this.sec, fun, args.length);
      return fun.axApply(isLex ? null : this, args);
    }

    axCallSuper(mn: Multiname, scope: Scope, args: any []): any {
      var name = this.axResolveMultiname(mn);
      var fun = (<AXClass>scope.parent.object).tPrototype[name];
      validateCall(this.sec, fun, args.length);
      return fun.axApply(this, args);
    }
    axConstructProperty(mn: Multiname, args: any []): any {
      var name = this.axResolveMultiname(mn);
      var ctor = this[name];
      validateConstruct(this.sec, ctor, args.length);
      return ctor.axConstruct(args);
    }

    axHasPropertyInternal(mn: Multiname): boolean {
      return this.axResolveMultiname(mn) in this;
    }

    axHasOwnProperty(mn: Multiname): boolean {
      var name = this.axResolveMultiname(mn);
      // We have to check for trait properties too if a simple hasOwnProperty fails.
      // This is different to JavaScript's hasOwnProperty behaviour where hasOwnProperty returns
      // false for properties defined on the property chain and not on the instance itself.
      return this.hasOwnProperty(name) || this.axClass.tPrototype.hasOwnProperty(name);
    }

    axGetEnumerableKeys(): any [] {
      if (this.sec.isPrimitive(this)) {
        return [];
      }
      var tPrototype = Object.getPrototypeOf(this);
      var keys = Object.keys(this);
      var result = [];
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (isNumeric(key)) {
          result.push(key);
        } else {
          if (tPrototype.hasOwnProperty(key)) {
            continue;
          }
          var name = Multiname.stripPublicMangledName(key);
          if (name !== undefined) {
            result.push(name);
          }
        }
      }
      return result;
    }

    axGetPublicProperty(nm: any): any {
      return this[Multiname.getPublicMangledName(nm)];
    }

    axSetPublicProperty(nm: any, value: any) {
      release || checkValue(value);
      this[Multiname.getPublicMangledName(nm)] = value;
    }
    
    axCallPublicProperty(nm: any, argArray: any []): any {
      return this[Multiname.getPublicMangledName(nm)].axApply(this, argArray);
    }

    axDeletePublicProperty(nm: any): boolean {
      return delete this[Multiname.getPublicMangledName(nm)];
    }

    axGetSlot(i: number): any {
      var t = this.traits.getSlot(i);
      var value = this[t.name.getMangledName()];
      release || checkValue(value);
      return value;
    }

    axSetSlot(i: number, value: any) {
      release || checkValue(value);
      var t = this.traits.getSlot(i);
      var name = t.name.getMangledName();
      var type = t.getType();
      this[name] = type ? type.axCoerce(value) : value;
    }

    /**
     * Gets the next name index of an object. Index |zero| is actually not an
     * index, but rather an indicator to start the iteration.
     */
    axNextNameIndex(index: number): number {
      var self: AXObject = <any>this;
      if (index === 0) {
        // Gather all enumerable keys since we're starting a new iteration.
        defineNonEnumerableProperty(self, "axEnumerableKeys", self.axGetEnumerableKeys());
      }
      var axEnumerableKeys = self.axEnumerableKeys;
      while (index < axEnumerableKeys.length) {
        rn.name = axEnumerableKeys[index];
        if (self.axHasPropertyInternal(rn)) {
          release || assert(rn.name === axEnumerableKeys[index]);
          return index + 1;
        }
        index ++;
      }
      return 0;
    }

    /**
     * Gets the nextName after the specified |index|, which you would expect to
     * be index + 1, but it's actually index - 1;
     */
    axNextName(index: number): any {
      var self: AXObject = <any>this;
      var axEnumerableKeys = self.axEnumerableKeys;
      release || assert(axEnumerableKeys && index > 0 && index < axEnumerableKeys.length + 1);
      return axEnumerableKeys[index - 1];
    }

    axNextValue(index: number): any {
      return this.axGetPublicProperty(this.axNextName(index));
    }

    axSetNumericProperty(nm: number, value: any) {
      this.axSetPublicProperty(nm, value);
    }

    axGetNumericProperty(nm: number): any {
      return this.axGetPublicProperty(nm);
    }

    axEnumerableKeys: any [];
  }

  export class ASClass extends ASObject {
    dPrototype: ASObject;
    tPrototype: ASObject;

    classNatives: Object [];
    instanceNatives: Object [];

    /**
     * Called on every class when it is initialized. The |axClass| object is passed in as |this|.
     */
    classInitializer: (asClass?: ASClass) => void;

    classSymbols: string [];
    instanceSymbols: string [];
    classInfo: ClassInfo;

    axCoerce(v: any): any {
      return v;
    }

    axConstruct: (argArray?: any []) => any;
    axIsType: (value: any) => boolean;

    get prototype(): ASObject {
      release || assert (this.dPrototype);
      return this.dPrototype;
    }

    static classInitializer = null;
  }

  function createArrayValueFromArgs(sec: AXSecurityDomain, args: any[]) {
    if (args.length === 1 && typeof args[0] === 'number') {
      var len = args[0];
      try {
        return new Array(len);
      } catch (e) {
        sec.throwError('RangeError', Errors.ArrayIndexNotIntegerError, len);
      }
    }
    return Array.apply(Array, args);
  }

  function coerceArray(obj) {
    if (!obj || !obj.sec) {
      throw new TypeError('Conversion to Array failed');
    }
    return obj.sec.AXArray.axCoerce(obj);
  }
  export class ASArray extends ASObject {
    static classInitializer() {
      var proto: any = this.dPrototype;
      var asProto: any = ASArray.prototype;

      // option flags for sort and sortOn
      defineNonEnumerableProperty(this, '$BgCASEINSENSITIVE', 1);
      defineNonEnumerableProperty(this, '$BgDESCENDING', 2);
      defineNonEnumerableProperty(this, '$BgUNIQUESORT', 4);
      defineNonEnumerableProperty(this, '$BgRETURNINDEXEDARRAY', 8);
      defineNonEnumerableProperty(this, '$BgNUMERIC', 16);

      addPrototypeFunctionAlias(proto, "$Bgpush", asProto.generic_push);
      addPrototypeFunctionAlias(proto, "$Bgpop", asProto.generic_pop);
      addPrototypeFunctionAlias(proto, "$Bgshift", asProto.generic_shift);
      addPrototypeFunctionAlias(proto, "$Bgunshift", asProto.generic_unshift);
      addPrototypeFunctionAlias(proto, "$Bgreverse", asProto.generic_reverse);
      addPrototypeFunctionAlias(proto, "$Bgconcat", asProto.generic_concat);
      addPrototypeFunctionAlias(proto, "$Bgslice", asProto.generic_slice);
      addPrototypeFunctionAlias(proto, "$Bgsplice", asProto.generic_splice);
      addPrototypeFunctionAlias(proto, "$Bgjoin", asProto.generic_join);
      addPrototypeFunctionAlias(proto, "$BgtoString", asProto.generic_toString);
      addPrototypeFunctionAlias(proto, "$BgindexOf", asProto.generic_indexOf);
      addPrototypeFunctionAlias(proto, "$BglastIndexOf", asProto.generic_lastIndexOf);
      addPrototypeFunctionAlias(proto, "$Bgevery", asProto.generic_every);
      addPrototypeFunctionAlias(proto, "$Bgsome", asProto.generic_some);
      addPrototypeFunctionAlias(proto, "$BgforEach", asProto.generic_forEach);
      addPrototypeFunctionAlias(proto, "$Bgmap", asProto.generic_map);
      addPrototypeFunctionAlias(proto, "$Bgfilter", asProto.generic_filter);
      addPrototypeFunctionAlias(proto, "$Bgsort", asProto.generic_sort);
      addPrototypeFunctionAlias(proto, "$BgsortOn", asProto.generic_sortOn);

      addPrototypeFunctionAlias(proto, "$BghasOwnProperty", asProto.native_hasOwnProperty);
      addPrototypeFunctionAlias(proto, "$BgpropertyIsEnumerable",
                                asProto.native_propertyIsEnumerable);
      addPrototypeFunctionAlias(proto, '$BgtoLocaleString', asProto.generic_toString);
    }

    constructor() {
      super();
      this.value = createArrayValueFromArgs(this.sec, <any>arguments);
    }

    native_hasOwnProperty(nm: string): boolean {
      return this.axHasOwnProperty(makeMultiname(nm));
    }

    native_propertyIsEnumerable(nm: string): boolean {
      if (typeof nm === 'number' || isNumeric(nm = axCoerceName(nm))) {
        var descriptor = Object.getOwnPropertyDescriptor(this.value, nm);
        return !!descriptor && descriptor.enumerable;
      }
      super.native_propertyIsEnumerable(nm);
    }

    $Bglength: number;
    value: any [];

    public static axApply(self: ASArray, args: any[]): ASArray {
      return this.sec.createArrayUnsafe(createArrayValueFromArgs(this.sec, args));
    }

    public static axConstruct(args: any[]): ASArray {
      return this.sec.createArrayUnsafe(createArrayValueFromArgs(this.sec, args));
    }

    push() {
      // Amazingly, AS3 doesn't throw an error if `push` would make the argument too large.
      // Instead, it just replaces the last element.
      if (this.value.length + arguments.length > 0xffffffff) {
        var limit = 0xffffffff - this.value.length;
        for (var i = 0; i < limit; i++) {
          this.value.push(arguments[i]);
        }
        return 0xffffffff;
      }
      return this.value.push.apply(this.value, arguments);
    }

    generic_push() {
      if (this && this.value instanceof Array) {
        return this.push.apply(this, arguments);
      }

      var n = this.axGetPublicProperty('length') >>> 0;
      for (var i = 0; i < arguments.length; i++) {
        this.axSetNumericProperty(n++, arguments[i]);
      }
      this.axSetPublicProperty('length', n);
      return n;
    }

    pop() {
      return this.value.pop();
    }
    generic_pop() {
      if (this && this.value instanceof Array) {
        return this.value.pop();
      }

      var len = this.axGetPublicProperty('length') >>> 0;
      if (!len) {
        this.axSetPublicProperty('length', 0);
        return;
      }

      var retVal = this.axGetNumericProperty(len - 1);
      rn.name = len - 1;
      rn.namespaces = [Namespace.PUBLIC];
      this.axDeleteProperty(rn);
      this.axSetPublicProperty('length', len - 1);
      return retVal;
    }

    shift() {
      return this.value.shift();
    }
    generic_shift() {
      return coerceArray(this).shift();
    }

    unshift() {
      return this.value.unshift.apply(this.value, arguments);
    }
    generic_unshift() {
      var self = coerceArray(this);
      return self.value.unshift.apply(self.value, arguments);
    }

    reverse() {
      this.value.reverse();
      return this;
    }
    generic_reverse() {
      return coerceArray(this).reverse();
    }

    concat() {
      var value = this.value.slice();
      for (var i = 0; i < arguments.length; i++) {
        var a = arguments[i];
        // Treat all objects with a `sec` property and a value that's an Array as
        // concat-spreadable.
        // TODO: verify that this is correct.
        if (typeof a === 'object' && a && a.sec && Array.isArray(a.value)) {
          value.push.apply(value, a.value);
        } else {
          value.push(a);
        }
      }
      return this.sec.createArrayUnsafe(value);
    }
    generic_concat() {
      return coerceArray(this).concat.apply(this, arguments);
    }

    slice(startIndex: number, endIndex: number) {
      return this.sec.createArray(this.value.slice(startIndex, endIndex));
    }
    generic_slice(startIndex: number, endIndex: number) {
      return coerceArray(this).slice(startIndex, endIndex);
    }

    splice(): any[] {
      var o = this.value;
      if (arguments.length === 0) {
        return undefined;
      }
      return this.sec.createArray(o.splice.apply(o, arguments));
    }
    generic_splice(): any[] {
      return coerceArray(this).splice.apply(this, arguments);
    }

    join(sep: string) {
      return this.value.join(sep);
    }
    generic_join(sep: string) {
      return coerceArray(this).join(sep);
    }

    toString() {
      return this.value.join(',');
    }
    generic_toString() {
      return coerceArray(this).join(',');
    }

    indexOf(value: any, fromIndex: number) {
      return this.value.indexOf(value, fromIndex|0);
    }
    generic_indexOf(value: any, fromIndex: number) {
      return coerceArray(this).indexOf(value, fromIndex|0);
    }

    lastIndexOf(value: any, fromIndex: number) {
      return this.value.lastIndexOf(value, arguments.length > 1 ? fromIndex : 0x7fffffff);
    }
    generic_lastIndexOf(value: any, fromIndex: number) {
      return coerceArray(this).lastIndexOf(value, arguments.length > 1 ? fromIndex : 0x7fffffff);
    }

    every(callbackfn: {value: Function}, thisArg?) {
      if (!callbackfn || !callbackfn.value || typeof callbackfn.value !== 'function') {
        return true;
      }
      thisArg = ensureBoxedReceiver(this.sec, thisArg, callbackfn);
      var o = this.value;
      for (var i = 0; i < o.length; i++) {
        if (callbackfn.value.call(thisArg, o[i], i, this) !== true) {
          return false;
        }
      }
      return true;
    }
    generic_every(callbackfn: {value: Function}, thisArg?) {
      return coerceArray(this).every(callbackfn, thisArg);
    }

    some(callbackfn: {value}, thisArg?) {
      if (!callbackfn || !callbackfn.value || typeof callbackfn.value !== 'function') {
        return false;
      }
      thisArg = ensureBoxedReceiver(this.sec, thisArg, callbackfn);
      var self = this;
      return this.value.some(function (currentValue, index, array) {
        return callbackfn.value.call(thisArg, currentValue, index, self);
      });
    }
    generic_some(callbackfn: {value}, thisArg?) {
      return coerceArray(this).some(callbackfn, thisArg);
    }

    forEach(callbackfn: {value}, thisArg?) {
      if (!callbackfn || !callbackfn.value || typeof callbackfn.value !== 'function') {
        return;
      }
      thisArg = ensureBoxedReceiver(this.sec, thisArg, callbackfn);
      var self = this;
      this.value.forEach(function (currentValue, index) {
        callbackfn.value.call(thisArg, currentValue, index, self);
      });
    }
    generic_forEach(callbackfn: {value}, thisArg?) {
      return coerceArray(this).forEach(callbackfn, thisArg);
    }

    map(callbackfn: {value}, thisArg?) {
      if (!callbackfn || !callbackfn.value || typeof callbackfn.value !== 'function') {
        return this.sec.createArrayUnsafe([]);
      }
      thisArg = ensureBoxedReceiver(this.sec, thisArg, callbackfn);
      var self = this;
      return this.sec.createArrayUnsafe(this.value.map(function (currentValue, index) {
        return callbackfn.value.call(thisArg, currentValue, index, self);
      }));
    }
    generic_map(callbackfn: {value}, thisArg?) {
      return coerceArray(this).map(callbackfn, thisArg);
    }

    filter(callbackfn: {value: Function}, thisArg?) {
      if (!callbackfn || !callbackfn.value || typeof callbackfn.value !== 'function') {
        return this.sec.createArrayUnsafe([]);
      }
      thisArg = ensureBoxedReceiver(this.sec, thisArg, callbackfn);
      var result = [];
      var o = this.value;
      for (var i = 0; i < o.length; i++) {
        if (callbackfn.value.call(thisArg, o[i], i, this) === true) {
          result.push(o[i]);
        }
      }
      return this.sec.createArrayUnsafe(result);
    }
    generic_filter(callbackfn: {value: Function}, thisArg?) {
      return coerceArray(this).filter(callbackfn, thisArg);
    }

    toLocaleString(): string {
      var value = this.sec.AXArray.axCoerce(this).value;

      var out: string = "";
      for (var i = 0, n = value.length; i < n; i++) {
        var val = value[i];
        if (val !== null && val !== undefined) {
          out += val.toLocaleString();
        }
        if (i + 1 < n) {
          out += ",";
        }
      }
      return out;
    }

    sort(): any {
      var o = this.value;
      if (arguments.length === 0) {
        o.sort();
        return this;
      }
      var compareFunction;
      var options = 0;
      if (this.sec.AXFunction.axIsInstanceOf(arguments[0])) {
        compareFunction = arguments[0].value;
      } else if (isNumber(arguments[0])) {
        options = arguments[0];
      }
      if (isNumber(arguments[1])) {
        options = arguments[1];
      }
      if (!options) {
        // Just passing compareFunction is ok because `undefined` is treated as not passed in JS.
        o.sort(compareFunction);
        return this;
      }
      if (!compareFunction) {
        compareFunction = axDefaultCompareFunction;
      }
      var sortOrder = options & SORT.DESCENDING ? -1 : 1;
      o.sort(function (a, b) {
        return axCompare(a, b, options, sortOrder, compareFunction);
      });
      return this;
    }

    generic_sort() {
      return coerceArray(this).sort.apply(this, arguments);
    }

    sortOn(names: any, options: any): any {
      if (arguments.length === 0) {
        this.sec.throwError(
                   "ArgumentError", Errors.WrongArgumentCountError,
                   "Array/http://adobe.com/AS3/2006/builtin::sortOn()", "1", "0");
      }
      // The following oddities in how the arguments are used are gleaned from Tamarin, so hush.
      var o = this.value;
      // The options we'll end up using.
      var optionsList: number[] = [];
      if (isString(names)) {
        names = [Multiname.getPublicMangledName(names)];
        // If the name is a string, coerce `options` to int.
        optionsList = [options | 0];
      } else if (names && Array.isArray(names.value)) {
        names = names.value;
        for (var i = 0; i < names.length; i++) {
          names[i] = Multiname.getPublicMangledName(names[i]);
        }
        if (options && Array.isArray(options.value)) {
          options = options.value;
          // Use the options Array only if it's the same length as names.
          if (options.length === names.length) {
            for (var i = 0; i < options.length; i++) {
              optionsList[i] = options[i] | 0;
            }
            // Otherwise, use 0 for all options.
          } else {
            for (var i = 0; i < names.length; i++) {
              optionsList[i] = 0;
            }
          }
        } else {
          var optionsVal = options | 0;
          for (var i = 0; i < names.length; i++) {
            optionsList[i] = optionsVal;
          }
        }
      } else {
        // Not supplying either a String or an Array means nothing is sorted on.
        return this;
      }
      release || assert(optionsList.length === names.length);
      // For use with uniqueSort and returnIndexedArray once we support them.
      var optionsVal: number = optionsList[0];
      release || Shumway.Debug.assertNotImplemented(!(optionsVal & SORT.UNIQUESORT), "UNIQUESORT");
      release || Shumway.Debug.assertNotImplemented(!(optionsVal & SORT.RETURNINDEXEDARRAY),
                                                    "RETURNINDEXEDARRAY");

      o.sort((a, b) => axCompareFields(a, b, names, optionsList));
      return this;
    }

    generic_sortOn() {
      return coerceArray(this).sortOn.apply(this, arguments);
    }

    get length(): number {
      return this.value.length;
    }

    set length(newLength: number) {
      this.value.length = newLength >>> 0;
    }

    axGetEnumerableKeys(): any [] {
      // Get the numeric Array keys first ...
      var keys = Object.keys(this.value);
      // ... then the keys that live on the array object.
      return keys.concat(super.axGetEnumerableKeys());
    }

    axHasPropertyInternal(mn: Multiname): boolean {
      var name = mn.name;
      if (typeof name === 'number' || isNumeric(name = axCoerceName(name))) {
        release || assert(mn.isRuntimeName());
        return name in this.value;
      }
      if (this.traits.getTrait(mn.namespaces, name)) {
        return true;
      }
      return '$Bg' + name in this;
    }

    axHasOwnProperty(mn: Multiname): boolean {
      var name = mn.name;
      if (typeof name === 'number' || isNumeric(name = axCoerceName(name))) {
        release || assert(mn.isRuntimeName());
        return this.value.hasOwnProperty(name);
      }
      return !!this.traits.getTrait(mn.namespaces, name) || this.hasOwnProperty('$Bg' + name);
    }

    axGetProperty(mn: Multiname): any {
      var name = mn.name;
      if (typeof name === 'number' || isNumeric(name = axCoerceName(name))) {
        return this.value[name];
      }
      return super.axGetProperty(mn);
    }

    axSetProperty(mn: Multiname, value: any, bc: Bytecode) {
      release || checkValue(value);
      var name = mn.name;
      if (typeof name === 'number' || isNumeric(name = axCoerceName(name))) {
        this.value[name] = value;
        return;
      }
      super.axSetProperty(mn, value, bc);
    }

    axDeleteProperty(mn: Multiname): any {
      var name = mn.name;
      if (typeof name === 'number' || isNumeric(name = axCoerceName(name))) {
        return delete this.value[name];
      }
      // Cannot delete array traits.
      if (this.traits.getTrait(mn.namespaces, name)) {
        return false;
      }
      return delete this['$Bg' + name];
    }

    axGetPublicProperty(nm: any): any {
      if (typeof nm === 'number' || isNumeric(nm = axCoerceName(nm))) {
        return this.value[nm];
      }
      return this['$Bg' + nm];
    }

    axSetPublicProperty(nm: string, value: any) {
      release || checkValue(value);
      if (typeof nm === 'number' || isNumeric(nm = axCoerceName(nm))) {
        this.value[nm] = value;
        return;
      }
      this['$Bg' + nm] = value;
    }
  }

  export class ASFunction extends ASObject {
    static classInitializer() {
      var proto: any = this.dPrototype;
      var asProto: any = ASFunction.prototype;
      addPrototypeFunctionAlias(proto, "$BgtoString", asProto.toString);
      addPrototypeFunctionAlias(proto, "$Bgcall", asProto.call);
      addPrototypeFunctionAlias(proto, "$Bgapply", asProto.apply);
      defineNonEnumerableProperty(proto, "value", asProto.native_functionValue);
    }

    private _prototype: AXObject;
    private _prototypeInitialzed: boolean = false;
    protected value: AXCallable;
    protected receiver: {scope: Scope};
    protected methodInfo: MethodInfo;

    axConstruct(args: any[]) {
      var prototype = this.prototype;
      // AS3 allows setting null/undefined prototypes. In order to make our value checking work,
      // we need to set a null-prototype that has the right inheritance chain. Since AS3 doesn't
      // have `__proto__` or `getPrototypeOf`, this is completely hidden from content.
      if (isNullOrUndefined(prototype)) {
        prototype = this.sec.AXFunctionUndefinedPrototype;
      }
      release || assert(typeof prototype === 'object');
      release || checkValue(prototype);
      var object = Object.create(prototype);
      object.__ctorFunction = this;
      this.value.apply(object, args);
      return object;
    }

    axIsInstanceOf(obj: any) {
      return obj && obj.__ctorFunction === this;
    }

    native_functionValue() {
      // Empty base function.
    }

    get prototype(): AXObject {
      if (!this._prototypeInitialzed) {
        this._prototype = Object.create(this.sec.AXObject.tPrototype);
        this._prototypeInitialzed = true;
      }
      return this._prototype;
    }

    set prototype(prototype: AXObject) {
      if (isNullOrUndefined(prototype)) {
        prototype = undefined;
      } else if (typeof prototype !== 'object' || this.sec.isPrimitive(prototype)) {
        this.sec.throwError('TypeError', Errors.PrototypeTypeError);
      }
      this._prototypeInitialzed = true;
      this._prototype = prototype;
    }

    get length(): number {
      return this.value.length;
    }

    toString() {
      return "function Function() {}";
    }

    call(thisArg: any) {
      thisArg = ensureBoxedReceiver(this.sec, thisArg, this);
      return this.value.apply(thisArg, sliceArguments(arguments, 1));
    }

    apply(thisArg: any, argArray?: ASArray): any {
      thisArg = ensureBoxedReceiver(this.sec, thisArg, this);
      return this.value.apply(thisArg, argArray ? argArray.value : undefined);
    }

    axCall(thisArg: any): any {
      return this.value.apply(thisArg, sliceArguments(arguments, 1));
    }

    axApply(thisArg: any, argArray?: any[]): any {
      return this.value.apply(thisArg, argArray);
    }
  }

  export class ASMethodClosure extends ASFunction {
    static classInitializer() {
      var proto: any = this.dPrototype;
      var asProto: any = ASMethodClosure.prototype;
      defineNonEnumerableProperty(proto, '$Bgcall', asProto.call);
      defineNonEnumerableProperty(proto, '$Bgapply', asProto.apply);
    }
    static Create(receiver: AXObject, method: AXCallable) {
      var closure: ASMethodClosure = Object.create(this.sec.AXMethodClosure.tPrototype);
      closure.receiver = <any>receiver;
      closure.value = method;
      closure.methodInfo = method.methodInfo;
      return closure;
    }

    get prototype(): AXObject {
      return null;
    }

    set prototype(prototype: AXObject) {
      this.sec.throwError("ReferenceError", Errors.ConstWriteError, "prototype",
                                     "MethodClosure");
    }

    axCall(ignoredThisArg: any): any {
      return this.value.apply(this.receiver, sliceArguments(arguments, 1));
    }

    axApply(ignoredThisArg: any, argArray?: any[]): any {
      return this.value.apply(this.receiver, argArray);
    }

    call(ignoredThisArg: any) {
      return this.value.apply(this.receiver, sliceArguments(arguments, 1));
    }

    apply(ignoredThisArg: any, argArray?: ASArray): any {
      return this.value.apply(this.receiver, argArray ? argArray.value : undefined);
    }
  }

  export class ASBoolean extends ASObject {
    static classInitializer() {
      var proto: any = this.dPrototype;
      var asProto: any = ASBoolean.prototype;
      addPrototypeFunctionAlias(proto, '$BgtoString', asProto.toString);
      addPrototypeFunctionAlias(proto, '$BgvalueOf', asProto.valueOf);
    }

    value: boolean;

    toString() {
      return this.value.toString();
    }
    valueOf() {
      return this.value.valueOf();
    }
  }

  export class ASString extends ASObject {
    static classNatives: any [] = [String];

    static classInitializer() {
      var proto: any = this.dPrototype;
      var asProto: any = ASString.prototype;
      addPrototypeFunctionAlias(proto, '$BgindexOf', asProto.generic_indexOf);
      addPrototypeFunctionAlias(proto, '$BglastIndexOf', asProto.generic_lastIndexOf);
      addPrototypeFunctionAlias(proto, '$BgcharAt', asProto.generic_charAt);
      addPrototypeFunctionAlias(proto, '$BgcharCodeAt', asProto.generic_charCodeAt);
      addPrototypeFunctionAlias(proto, '$Bgconcat', asProto.generic_concat);
      addPrototypeFunctionAlias(proto, '$BglocaleCompare', asProto.generic_localeCompare);
      addPrototypeFunctionAlias(proto, '$Bgmatch', asProto.generic_match);
      addPrototypeFunctionAlias(proto, '$Bgreplace', asProto.generic_replace);
      addPrototypeFunctionAlias(proto, '$Bgsearch', asProto.generic_search);
      addPrototypeFunctionAlias(proto, '$Bgslice', asProto.generic_slice);
      addPrototypeFunctionAlias(proto, '$Bgsplit', asProto.generic_split);
      addPrototypeFunctionAlias(proto, '$Bgsubstring', asProto.generic_substring);
      addPrototypeFunctionAlias(proto, '$Bgsubstr', asProto.generic_substr);
      addPrototypeFunctionAlias(proto, '$BgtoLowerCase', asProto.generic_toLowerCase);
      addPrototypeFunctionAlias(proto, '$BgtoLocaleLowerCase', asProto.generic_toLowerCase);
      addPrototypeFunctionAlias(proto, '$BgtoUpperCase', asProto.generic_toUpperCase);
      addPrototypeFunctionAlias(proto, '$BgtoLocaleUpperCase', asProto.generic_toUpperCase);
      addPrototypeFunctionAlias(proto, '$BgtoString', asProto.toString);
      addPrototypeFunctionAlias(proto, '$BgtoString', asProto.public_toString);
      addPrototypeFunctionAlias(proto, '$BgvalueOf', asProto.public_valueOf);

      addPrototypeFunctionAlias(<any>this, '$BgfromCharCode', ASString.fromCharCode);
    }

    value: string;

    static fromCharCode(...charcodes: any []) {
      return String.fromCharCode.apply(null, charcodes);
    }

    indexOf(char: string, i?: number) {
      return this.value.indexOf(char, i);
    }
    lastIndexOf(char: string, i?: number) {
      return this.value.lastIndexOf(char, i);
    }
    charAt(index: number) {
      return this.value.charAt(index);
    }
    charCodeAt(index: number) {
      return this.value.charCodeAt(index);
    }
    concat() {
      return this.value.concat.apply(this.value, arguments);
    }
    localeCompare(other: string) {
      if (arguments.length > 1) {
        this.sec.throwError('ArgumentError', Errors.WrongArgumentCountError,
                            'Function/<anonymous>()', 0, 2);
      }
      var value = this.value;
      release || assert(typeof this.value === 'string');
      other = String(other);
      if (other === value) {
        return 0;
      }
      var len = Math.min(value.length, other.length);
      for (var j = 0; j < len; j++) {
        if (value[j] !== other[j]) {
          return value.charCodeAt(j) - other.charCodeAt(j);
        }
      }
      return value.length > other.length ? 1 : -1;
    }
    match(pattern /* : string | ASRegExp */) {
      if (this.sec.AXRegExp.axIsType(pattern)) {
        pattern = (<any>pattern).value;
      } else {
        pattern = axCoerceString(pattern);
      }
      var result = this.value.match(<any>pattern);
      if (!result) {
        return null;
      }
      try {
        return transformJStoASRegExpMatchArray(this.sec, result);
      } catch (e) {
        return null;
      }
    }
    replace(pattern /* : string | ASRegExp */, repl /* : string | ASFunction */) {
      if (this.sec.AXRegExp.axIsType(pattern)) {
        pattern = (<any>pattern).value;
      } else {
        pattern = axCoerceString(pattern);
      }
      if (this.sec.AXFunction.axIsType(repl)) {
        repl = (<any>repl).value;
      }
      try {
        return this.value.replace(<any>pattern, <any>repl);
      } catch (e) {
        return this.value;
      }
    }
    search(pattern /* : string | ASRegExp */) {
      if (this.sec.AXRegExp.axIsType(pattern)) {
        pattern = (<any>pattern).value;
      } else {
        pattern = axCoerceString(pattern);
      }
      try {
        return this.value.search(<any>pattern);
      } catch (e) {
        return -1;
      }
    }
    slice(start?: number, end?: number) {
      start = arguments.length < 1 ? 0 : start | 0;
      end = arguments.length < 2 ? 0xffffffff : end | 0;
      return this.value.slice(start, end);
    }
    split(separator /* : string | ASRegExp */, limit?: number) {
      if (this.sec.AXRegExp.axIsType(separator)) {
        separator = (<any>separator).value;
      } else {
        separator = axCoerceString(separator);
      }
      limit = limit === undefined ? -1 : limit | 0;
      try {
        return this.sec.createArray(this.value.split(<any>separator, limit));
      } catch (e) {
        return this.sec.createArrayUnsafe([this.value]);
      }
    }
    substring(start: number, end?: number) {
      return this.value.substring(start, end);
    }
    substr(from: number, length?: number) {
      return this.value.substr(from, length);
    }
    toLocaleLowerCase() {
      return this.value.toLowerCase();
    }
    toLowerCase() {
      if (as3Compatibility) {
        return as3ToLowerCase(this.value);
      }
      return this.value.toLowerCase();
    }
    toLocaleUpperCase() {
      return this.value.toUpperCase();
    }
    toUpperCase() {
      return this.value.toUpperCase();
    }

    // The String.prototype versions of these methods are generic, so the implementation is
    // different.

    generic_indexOf(char: string, i?: number) {
      var receiver = this == undefined ? '' : this;
      return String.prototype.indexOf.call(receiver, char, i);
    }
    generic_lastIndexOf(char: string, i?: number) {
      var receiver = this == undefined ? '' : this;
      return String.prototype.lastIndexOf.call(receiver, char, i);
    }
    generic_charAt(index: number) {
      var receiver = this == undefined ? '' : this;
      return String.prototype.charAt.call(receiver, index);
    }
    generic_charCodeAt(index: number) {
      var receiver = this == undefined ? '' : this;
      return String.prototype.charCodeAt.call(receiver, index);
    }
    generic_concat() {
      var receiver = this == undefined ? '' : this;
      return String.prototype.concat.apply(receiver, arguments);
    }
    generic_localeCompare(other: string) {
      var receiver = this.sec.AXString.axBox(String(this));
      return receiver.localeCompare.apply(receiver, arguments);
    }
    generic_match(pattern) {
      return this.sec.AXString.axBox(String(this)).match(pattern);
    }
    generic_replace(pattern, repl) {
      return this.sec.AXString.axBox(String(this)).replace(pattern, repl);
    }
    generic_search(pattern) {
      return this.sec.AXString.axBox(String(this)).search(pattern);
    }
    generic_slice(start?: number, end?: number) {
      var receiver = this == undefined ? '' : this;
      return String.prototype.slice.call(receiver, start, end);
    }
    generic_split(separator: string, limit?: number) {
      limit = arguments.length < 2 ? 0xffffffff : limit | 0;
      return this.sec.AXString.axBox(String(this)).split(separator, limit);
    }
    generic_substring(start: number, end?: number) {
      var receiver = this == undefined ? '' : this;
      return String.prototype.substring.call(receiver, start, end);
    }
    generic_substr(from: number, length?: number) {
      var receiver = this == undefined ? '' : this;
      return String.prototype.substr.call(receiver, from, length);
    }
    generic_toLowerCase() {
      var receiver = this == undefined ? '' : this;
      if (as3Compatibility) {
        return as3ToLowerCase(String(receiver));
      }
      String.prototype.toLowerCase.call(receiver);
    }
    generic_toUpperCase() {
      var receiver = this == undefined ? '' : this;
      return String.prototype.toUpperCase.call(receiver);
    }

    toString() {
      return this.value.toString();
    }

    public_toString() {
      if (<any>this === this.sec.AXString.dPrototype) {
        return '';
      }
      if (this.axClass !== this.sec.AXString) {
        this.sec.throwError('TypeError', Errors.InvokeOnIncompatibleObjectError,
                                       'String.prototype.toString');
      }
      return this.value.toString();
    }

    valueOf() {
      return this.value.valueOf();
    }
    public_valueOf() {
      if (<any>this === this.sec.AXString.dPrototype) {
        return '';
      }
      if (this.axClass !== this.sec.AXString) {
        this.sec.throwError('TypeError', Errors.InvokeOnIncompatibleObjectError,
                                       'String.prototype.valueOf');
      }
      return this.value.valueOf();
    }

    get length(): number {
      return this.value.length;
    }
  }

  export class ASNumber extends ASObject {
    static classNatives: any [] = [Math];

    static classInitializer() {
      var proto: any = this.dPrototype;
      var asProto: any = ASNumber.prototype;
      addPrototypeFunctionAlias(proto, '$BgtoString', asProto.toString);
      addPrototypeFunctionAlias(proto, '$BgtoLocaleString', asProto.toString);
      addPrototypeFunctionAlias(proto, '$BgvalueOf', asProto.valueOf);
      addPrototypeFunctionAlias(proto, '$BgtoFixed', asProto.toFixed);
      addPrototypeFunctionAlias(proto, '$BgtoExponential', asProto.toExponential);
      addPrototypeFunctionAlias(proto, '$BgtoPrecision', asProto.toPrecision);

      defineNonEnumerableProperty(this, '$BgNaN', Number.NaN);
      defineNonEnumerableProperty(this, '$BgNEGATIVE_INFINITY', -1/0);
      defineNonEnumerableProperty(this, '$BgPOSITIVE_INFINITY', 1/0);
      defineNonEnumerableProperty(this, '$BgMAX_VALUE', Number.MAX_VALUE);
      defineNonEnumerableProperty(this, '$BgMIN_VALUE', Number.MIN_VALUE);

      defineNonEnumerableProperty(this, '$BgE', Math.E);
      defineNonEnumerableProperty(this, '$BgLN10', Math.LN10);
      defineNonEnumerableProperty(this, '$BgLN2', Math.LN2);
      defineNonEnumerableProperty(this, '$BgLOG10E', Math.LOG10E);
      defineNonEnumerableProperty(this, '$BgLOG2E', Math.LOG2E);
      defineNonEnumerableProperty(this, '$BgPI', Math.PI);
      defineNonEnumerableProperty(this, '$BgSQRT1_2', Math.SQRT2);
      defineNonEnumerableProperty(this, '$BgSQRT2', Math.SQRT2);
    }

    value: number;

    toString(radix: number) {
      if (arguments.length === 0) {
        radix = 10;
      } else {
        radix = radix|0;
        if (radix < 2 || radix > 36) {
          this.sec.throwError('RangeError', Errors.InvalidRadixError, radix);
        }
      }
      if (this.axClass !== this.sec.AXNumber) {
        this.sec.throwError('TypeError', Errors.InvokeOnIncompatibleObjectError,
                                       'Number.prototype.toString');
      }

      return this.value.toString(radix);
    }

    valueOf() {
      if (this.axClass !== this.sec.AXNumber) {
        this.sec.throwError('TypeError', Errors.InvokeOnIncompatibleObjectError,
                                       'Number.prototype.valueOf');
      }
      return this.value;
    }

    toExponential(p): string {
      p = p|0;
      if (p < 0 || p > 20) {
        this.sec.throwError('RangeError', Errors.InvalidPrecisionError);
      }
      if (this.axClass !== this.sec.AXNumber) {
        return 'NaN';
      }
      return this.value.toExponential(p);
    }

    toPrecision(p): string {
      if (!p) {
        p = 1;
      } else {
        p = p|0;
      }
      if (p < 1 || p > 21) {
        this.sec.throwError('RangeError', Errors.InvalidPrecisionError);
      }
      if (this.axClass !== this.sec.AXNumber) {
        return 'NaN';
      }
      return this.value.toPrecision(p);
    }

    toFixed(p): string {
      p = p|0;
      if (p < 0 || p > 20) {
        this.sec.throwError('RangeError', Errors.InvalidPrecisionError);
      }
      if (this.axClass !== this.sec.AXNumber) {
        return 'NaN';
      }
      return this.value.toFixed(p);
    }

    static _minValue(): number {
      return Number.MIN_VALUE;
    }

    // https://bugzilla.mozilla.org/show_bug.cgi?id=564839
    static convertStringToDouble(s: string): number {
      var i = s.indexOf(String.fromCharCode(0));
      if (i >= 0) {
        return +s.substring(0, i);
      }
      return +s;
    }
  }

  export class ASInt extends ASNumber {
    public static staticNatives: any [] = [Math];
    public static instanceNatives: any [] = [ASNumber.prototype];

    static classInitializer() {
      var proto: any = this.dPrototype;
      var asProto: any = ASInt.prototype;
      addPrototypeFunctionAlias(proto, '$BgtoString', asProto.toString);
      addPrototypeFunctionAlias(proto, '$BgtoLocaleString', asProto.toString);
      addPrototypeFunctionAlias(proto, '$BgvalueOf', asProto.valueOf);

      defineNonEnumerableProperty(this, '$BgMAX_VALUE',  0x7fffffff);
      defineNonEnumerableProperty(this, '$BgMIN_VALUE', -0x80000000);
    }

    toString(radix: number) {
      if (arguments.length === 0) {
        radix = 10;
      } else {
        radix = radix|0;
        if (radix < 2 || radix > 36) {
          this.sec.throwError('RangeError', Errors.InvalidRadixError, radix);
        }
      }
      if (this.axClass !== this.sec.AXNumber) {
        this.sec.throwError('TypeError', Errors.InvokeOnIncompatibleObjectError,
                                       'Number.prototype.toString');
      }

      return this.value.toString(radix);
    }

    valueOf() {
      if (this.axClass !== this.sec.AXNumber) {
        this.sec.throwError('TypeError', Errors.InvokeOnIncompatibleObjectError,
                                       'Number.prototype.valueOf');
      }
      return this.value;
    }
  }

  export class ASUint extends ASNumber {
    public static staticNatives: any [] = [Math];
    public static instanceNatives: any [] = [ASNumber.prototype];

    static classInitializer() {
      var proto: any = this.dPrototype;
      var asProto: any = ASUint.prototype;
      addPrototypeFunctionAlias(proto, '$BgtoString', asProto.toString);
      addPrototypeFunctionAlias(proto, '$BgtoLocaleString', asProto.toString);
      addPrototypeFunctionAlias(proto, '$BgvalueOf', asProto.valueOf);

      defineNonEnumerableProperty(this, '$BgMAX_VALUE', 0xffffffff);
      defineNonEnumerableProperty(this, '$BgMIN_VALUE', 0);
    }

    toString(radix: number) {
      if (arguments.length === 0) {
        radix = 10;
      } else {
        radix = radix|0;
        if (radix < 2 || radix > 36) {
          this.sec.throwError('RangeError', Errors.InvalidRadixError, radix);
        }
      }
      if (this.axClass !== this.sec.AXNumber) {
        this.sec.throwError('TypeError', Errors.InvokeOnIncompatibleObjectError,
                                       'Number.prototype.toString');
      }

      return this.value.toString(radix);
    }

    valueOf() {
      if (this.axClass !== this.sec.AXNumber) {
        this.sec.throwError('TypeError', Errors.InvokeOnIncompatibleObjectError,
                                       'Number.prototype.valueOf');
      }
      return this.value;
    }
  }

  export class ASMath extends ASObject {
    public static classNatives: any [] = [Math];
    static classInitializer: any = function() {
      defineNonEnumerableProperty(this, '$BgE', Math.E);
      defineNonEnumerableProperty(this, '$BgLN10', Math.LN10);
      defineNonEnumerableProperty(this, '$BgLN2', Math.LN2);
      defineNonEnumerableProperty(this, '$BgLOG10E', Math.LOG10E);
      defineNonEnumerableProperty(this, '$BgLOG2E', Math.LOG2E);
      defineNonEnumerableProperty(this, '$BgPI', Math.PI);
      defineNonEnumerableProperty(this, '$BgSQRT1_2', Math.SQRT2);
      defineNonEnumerableProperty(this, '$BgSQRT2', Math.SQRT2);
    }
  }

  export class ASRegExp extends ASObject {
    private static UNMATCHABLE_PATTERN = '^(?!)$';

    static classInitializer: any = function() {
      var proto: any = this.dPrototype;
      var asProto: any = ASRegExp.prototype;
      addPrototypeFunctionAlias(proto, '$BgtoString', asProto.ecmaToString);
      addPrototypeFunctionAlias(proto, '$Bgexec', asProto.exec);
      addPrototypeFunctionAlias(proto, '$Bgtest', asProto.test);
    }

    value: RegExp;

    private _dotall: boolean;
    private _extended: boolean;
    private _source: string;
    private _captureNames: string [];

    constructor(pattern: any, flags?: string) {
      super();
      this._dotall = false;
      this._extended = false;
      this._captureNames = [];
      var source;
      if (pattern === undefined) {
        pattern = source = '';
      } else if (this.sec.AXRegExp.axIsType(pattern)) {
        if (flags) {
          this.sec.throwError("TypeError", Errors.RegExpFlagsArgumentError);
        }
        source = pattern.source;
        pattern = pattern.value;
      } else {
        pattern = String(pattern);
        // Escape all forward slashes.
        source = pattern.replace(/(^|^[\/]|(?:\\\\)+)\//g, '$1\\/');
        if (flags) {
          var f = flags;
          flags = '';
          for (var i = 0; i < f.length; i++) {
            var flag = f[i];
            switch (flag) {
              case 's':
                // With the s flag set, . will match the newline character.
                this._dotall = true;
                break;
              case 'x':
                // With the x flag set, spaces in the regular expression, will be ignored as part of
                // the pattern.
                this._extended = true;
                break;
              case 'g':
              case 'i':
              case 'm':
                // Only keep valid flags since an ECMAScript compatible RegExp implementation will
                // throw on invalid ones. We have to avoid that in ActionScript.
                flags += flag;
            }
          }
        }
        pattern = this._parse(source);
      }
      try {
        this.value = new RegExp(pattern, flags);
      } catch (e) {
        // Our pattern pre-parser should have eliminated most errors, but in some cases we can't
        // meaningfully detect them. If that happens, just catch the error and substitute an
        // unmatchable pattern here.
        this.value = new RegExp(ASRegExp.UNMATCHABLE_PATTERN, flags);
      }
      this._source = source;
    }

    // Parses and sanitizes a AS3 RegExp pattern to be used in JavaScript. Silently fails and
    // returns an unmatchable pattern of the source turns out to be invalid.
    private _parse(pattern: string): string {
      var result = '';
      var captureNames = this._captureNames;
      var parens = [];
      var atoms = 0;
      for (var i = 0; i < pattern.length; i++) {
        var char = pattern[i];
        switch (char) {
          case '(':
            result += char;
            parens.push(atoms > 1 ? atoms - 1 : atoms);
            atoms = 0;
            if (pattern[i + 1] === '?') {
              switch (pattern[i + 2]) {
                case ':':
                case '=':
                case '!':
                  result += '?' + pattern[i + 2];
                  i += 2;
                  break;
                default:
                  if (/\(\?P<([\w$]+)>/.exec(pattern.substr(i))) {
                    var name = RegExp.$1;
                    if (name !== 'length') {
                      captureNames.push(name);
                    }
                    if (captureNames.indexOf(name) > -1) {
                      // TODO: Handle the case were same name is used for multiple groups.
                    }
                    i += RegExp.lastMatch.length - 1;
                  } else {
                    return ASRegExp.UNMATCHABLE_PATTERN;
                  }
              }
            } else {
              captureNames.push(null);
            }
            // 406 seems to be the maximum number of capturing groups allowed in a pattern.
            // Examined by testing.
            if (captureNames.length > 406) {
              return ASRegExp.UNMATCHABLE_PATTERN;
            }
            break;
          case ')':
            if (!parens.length) {
              return ASRegExp.UNMATCHABLE_PATTERN;
            }
            result += char;
            atoms = parens.pop() + 1;
            break;
          case '|':
            result += char;
            break;
          case '\\':
            result += char;
            if (/\\|c[A-Z]|x[0-9,a-z,A-Z]{2}|u[0-9,a-z,A-Z]{4}|./.exec(pattern.substr(i + 1))) {
              result += RegExp.lastMatch;
              i += RegExp.lastMatch.length;
            }
            if (atoms <= 1) {
              atoms++;
            }
            break;
          case '[':
            if (/\[[^\]]*\]/.exec(pattern.substr(i))) {
              result += RegExp.lastMatch;
              i += RegExp.lastMatch.length - 1;
              if (atoms <= 1) {
                atoms++;
              }
            } else {
              return ASRegExp.UNMATCHABLE_PATTERN;
            }
            break;
          case '{':
            if (/\{[^\{]*?(?:,[^\{]*?)?\}/.exec(pattern.substr(i))) {
              result += RegExp.lastMatch;
              i += RegExp.lastMatch.length - 1;
            } else {
              return ASRegExp.UNMATCHABLE_PATTERN;
            }
            break;
          case '.':
            if (this._dotall) {
              result += '[\\s\\S]';
            } else {
              result += char;
            }
            if (atoms <= 1) {
              atoms++;
            }
            break;
          case '?':
          case '*':
          case '+':
            if (!atoms) {
              return ASRegExp.UNMATCHABLE_PATTERN;
            }
            result += char;
            if (pattern[i + 1] === '?') {
              i++;
              result += '?';
            }
            break;
          case ' ':
            if (this._extended) {
              break;
            }
          default:
            result += char;
            if (atoms <= 1) {
              atoms++;
            }
        }
        // 32767 seams to be the maximum allowed length for RegExps in SpiderMonkey.
        // Examined by testing.
        if (result.length > 0x7fff) {
          return ASRegExp.UNMATCHABLE_PATTERN;
        }
      }
      if (parens.length) {
        return ASRegExp.UNMATCHABLE_PATTERN;
      }
      return result;
    }

    ecmaToString(): string {
      var out = "/" + this._source + "/";
      if (this.value.global)     out += "g";
      if (this.value.ignoreCase) out += "i";
      if (this.value.multiline)  out += "m";
      if (this._dotall)          out += "s";
      if (this._extended)        out += "x";
      return out;
    }

    axCall(ignoredThisArg: any): any {
      return this.exec.apply(this, arguments);
    }

    axApply(ignoredThisArg: any, argArray?: any[]): any {
      return this.exec.apply(this, argArray);
    }

    get source(): string {
      return this._source;
    }

    get global(): boolean {
      return this.value.global;
    }

    get ignoreCase(): boolean {
      return this.value.ignoreCase;
    }

    get multiline(): boolean {
      return this.value.multiline;
    }

    get lastIndex(): number {
      return this.value.lastIndex;
    }

    set lastIndex(value: number) {
      this.value.lastIndex = value;
    }

    get dotall(): boolean {
      return this._dotall;
    }

    get extended(): boolean {
      return this._extended;
    }

    exec(str: string = ''): ASArray {
      var result = this.value.exec(str);
      if (!result) {
        return null;
      }
      var axResult = transformJStoASRegExpMatchArray(this.sec, result);
      var captureNames = this._captureNames;
      if (captureNames) {
        for (var i = 0; i < captureNames.length; i++) {
          var name = captureNames[i];
          if (name !== null) {
            // In AS3, non-matched named capturing groups return an empty string.
            var value = result[i + 1] || '';
            result[name] = value;
            axResult.axSetPublicProperty(name, value);
          }
        }
        return axResult;
      }
    }

    test(str: string = ''): boolean {
      return this.exec(str) !== null;
    }
  }

  export class ASError extends ASObject {

    public static getErrorMessage = Shumway.AVMX.getErrorMessage;

    public static throwError(type: ASClass, id: number /*, ...rest */) {
      var info = getErrorInfo(id);
      var args = [info];
      for (var i = 2; i < arguments.length; i++) {
        args.push(arguments[i]);
      }
      var message = formatErrorMessage.apply(null, args);
      throw type.axConstruct([message, id]);
    }

    static classInitializer(asClass?: any) {
      defineNonEnumerableProperty(this, '$Bglength', 1);
      defineNonEnumerableProperty(this.dPrototype, '$Bgname',
                                  this.classInfo.instanceInfo.getName().name);
      if (asClass === ASError) {
        defineNonEnumerableProperty(this.dPrototype, '$Bgmessage', 'Error');
        defineNonEnumerableProperty(this.dPrototype, '$BgtoString', ASError.prototype.toString);
      }
    }

    constructor(message: any, id: any) {
      super();
      if (arguments.length < 1) {
        message = '';
      }
      this.$Bgmessage = String(message);
      this._errorID = id | 0;
    }

    $Bgmessage: string;
    $Bgname: string;
    _errorID: number;

    toString() {
      return this.$Bgmessage !== "" ? this.$Bgname + ": " + this.$Bgmessage : this.$Bgname;
    }

    get errorID() {
      return this._errorID;
    }

    public getStackTrace(): string {
      // Stack traces are only available in debug builds. We only do opt.
      return null;
    }
  }

  export class ASDefinitionError extends ASError {
  }
  export class ASEvalError extends ASError {
  }
  export class ASRangeError extends ASError {
  }
  export class ASReferenceError extends ASError {
  }
  export class ASSecurityError extends ASError {
  }
  export class ASSyntaxError extends ASError {
  }
  export class ASTypeError extends ASError {
  }
  export class ASURIError extends ASError {
  }
  export class ASVerifyError extends ASError {
  }
  export class ASUninitializedError extends ASError {
  }
  export class ASArgumentError extends ASError {
  }
  export class ASIOError extends ASError {
  }
  export class ASEOFError extends ASError {
  }
  export class ASMemoryError extends ASError {
  }
  export class ASIllegalOperationError extends ASError {
  }

  /**
   * Transforms a JS value into an AS value.
   */
  export function transformJSValueToAS(sec: AXSecurityDomain, value, deep: boolean) {
    release || assert(typeof value !== 'function');
    if (typeof value !== "object") {
      return value;
    }
    if (isNullOrUndefined(value)) {
      return value;
    }
    if (Array.isArray(value)) {
      var list = [];
      for (var i = 0; i < value.length; i++) {
        var entry = value[i];
        var axValue = deep ? transformJSValueToAS(sec, entry, true) : entry;
        list.push(axValue);
      }
      return sec.createArray(list);
    }
    return sec.createObjectFromJS(value, deep);
  }

  /**
   * Transforms an AS value into a JS value.
   */
  export function transformASValueToJS(sec: AXSecurityDomain, value, deep: boolean) {
    if (typeof value !== "object") {
      return value;
    }
    if (isNullOrUndefined(value)) {
      return value;
    }
    if (sec.AXArray.axIsType(value)) {
      var resultList = [];
      var list = value.value;
      for (var i = 0; i < list.length; i++) {
        var entry = list[i];
        var jsValue = deep ? transformASValueToJS(sec, entry, true) : entry;
        resultList.push(jsValue);
      }
      return resultList;
    }
    var keys = Object.keys(value);
    var resultObject = {};
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var jsKey = key;
      if (!isNumeric(key)) {
        release || assert(key.indexOf('$Bg') === 0);
        jsKey = key.substr(3);
      }
      var v = value[key];
      if (deep) {
        v = transformASValueToJS(sec, v, true);
      }
      resultObject[jsKey] = v;
    }
    return resultObject;
  }

  function transformJStoASRegExpMatchArray(sec: AXSecurityDomain, value: RegExpMatchArray): ASArray {
    var result = sec.createArray(value);
    result.axSetPublicProperty('index', value.index);
    result.axSetPublicProperty('input', value.input);
    return result;
  }

  function walk(sec: AXSecurityDomain, holder: any, name: string, reviver: Function) {
    var val = holder[name];
    if (Array.isArray(val)) {
      var v: any[] = <any>val;
      for (var i = 0, limit = v.length; i < limit; i++) {
        var newElement = walk(sec, v, axCoerceString(i), reviver);
        if (newElement === undefined) {
          delete v[i];
        } else {
          v[i] = newElement;
        }
      }
    } else if (val !== null && typeof val !== 'boolean' && typeof val !== 'number' &&
               typeof val !== 'string')
    {

      for (var p in val) {
        if (!val.hasOwnProperty(p) || !Multiname.isPublicQualifiedName(p)) {
          break;
        }
        var newElement = walk(sec, val, p, reviver);
        if (newElement === undefined) {
          delete val[p];
        } else {
          val[p] = newElement;
        }
      }
    }
    return reviver.call(holder, name, val);
  }
  export class ASJSON extends ASObject {
    static parse(text: string, reviver: AXFunction = null): any {
      text = axCoerceString(text);
      if (reviver !== null && !axIsCallable(reviver)) {
        this.sec.throwError('TypeError', Errors.CheckTypeFailedError, reviver, 'Function');
      }
      if (text === null) {
        this.sec.throwError('SyntaxError', Errors.JSONInvalidParseInput);
      }

      try {
        var unfiltered: Object = transformJSValueToAS(this.sec, JSON.parse(text), true);
      } catch (e) {
        this.sec.throwError('SyntaxError', Errors.JSONInvalidParseInput);
      }

      if (reviver === null) {
        return unfiltered;
      }
      return walk(this.sec, {"": unfiltered}, "", reviver.value);
    }

    static stringify(value: any, replacer = null, space = null): string {
      // We deliberately deviate from ECMA-262 and throw on
      // invalid replacer parameter.
      if (replacer !== null) {
        var sec = typeof replacer === 'object' ? replacer.sec : null;
        if (!sec || !(sec.AXFunction.axIsType(replacer) || sec.AXArray.axIsType(replacer))) {
          this.sec.throwError('TypeError', Errors.JSONInvalidReplacer);
        }
      }

      var gap;
      if (typeof space === 'string') {
        gap = space.length > 10 ? space.substring(0, 10) : space;
      } else if (typeof space === 'number') {
        gap = "          ".substring(0, Math.min(10, space | 0));
      } else {
        // We follow ECMA-262 and silently ignore invalid space parameter.
        gap = "";
      }

      if (replacer === null) {
        return this.stringifySpecializedToString(value, null, null, gap);
      } else if (sec.AXArray.axIsType(replacer)) {
        return this.stringifySpecializedToString(value, this.computePropertyList(replacer.value),
                                                 null, gap);
      } else { // replacer is Function
        return this.stringifySpecializedToString(value, null, replacer.value, gap);
      }
    }

    // ECMA-262 5th ed, section 15.12.3 stringify, step 4.b
    private static computePropertyList(r: any[]): string[] {
      var propertyList = [];
      var alreadyAdded = Object.create(null);
      for (var i = 0, length = r.length; i < length; i++) {
        if (!r.hasOwnProperty(<any>i)) {
          continue;
        }
        var v = r[i];
        var item: string = null;

        if (typeof v === 'string') {
          item = v;
        } else if (typeof v === 'number') {
          item = axCoerceString(v);
        }
        if (item !== null && !alreadyAdded[item]) {
          alreadyAdded[item] = true;
          propertyList.push(item);
        }
      }
      return propertyList;
    }

    private static stringifySpecializedToString(value: Object, replacerArray: any [], replacerFunction: (key: string, value: any) => any, gap: string): string {
      try {
        // In AS3 |JSON.stringify(undefined)| returns "null", while JS returns |undefined|.
        // TODO: Is there anything to be done in case of a |replacerFunction| function?
        if (value === undefined) {
          return "null";
        }
        return JSON.stringify(transformASValueToJS(this.sec, value, true), replacerFunction, gap);
      } catch (e) {
        this.sec.throwError('TypeError', Errors.JSONCyclicStructure);
      }
    }
  }

  var builtinNativeClasses: Shumway.MapObject<ASClass> = Shumway.ObjectUtilities.createMap<ASClass>();
  var nativeClasses: Shumway.MapObject<ASClass> = Shumway.ObjectUtilities.createMap<ASClass>();
  var nativeClassLoaderNames: {
    name: string;
    alias: string;
    nsType: NamespaceType
  } [] = [];

  export function initializeBuiltins() {
    builtinNativeClasses["Object"]              = ASObject;
    builtinNativeClasses["Class"]               = ASClass;
    builtinNativeClasses["Function"]            = ASFunction;
    builtinNativeClasses["Boolean"]             = ASBoolean;
    builtinNativeClasses["builtin.as$0.MethodClosure"] = ASMethodClosure;
    builtinNativeClasses["Namespace"]           = ASNamespace;
    builtinNativeClasses["Number"]              = ASNumber;
    builtinNativeClasses["int"]                 = ASInt;
    builtinNativeClasses["uint"]                = ASUint;
    builtinNativeClasses["String"]              = ASString;
    builtinNativeClasses["Array"]               = ASArray;

    builtinNativeClasses["__AS3__.vec.Vector"]        = Vector;
    builtinNativeClasses["__AS3__.vec.Vector$object"] = GenericVector;
    builtinNativeClasses["__AS3__.vec.Vector$int"]    = Int32Vector;
    builtinNativeClasses["__AS3__.vec.Vector$uint"]   = Uint32Vector;
    builtinNativeClasses["__AS3__.vec.Vector$double"] = Float64Vector;

    builtinNativeClasses["Namespace"]           = ASNamespace;
    builtinNativeClasses["QName"]               = ASQName;
    builtinNativeClasses["XML"]                 = ASXML;
    builtinNativeClasses["XMLList"]             = ASXMLList;

    builtinNativeClasses["flash.xml.XMLNode"] = flash.xml.XMLNode;
    builtinNativeClasses["flash.xml.XMLDocument"] = flash.xml.XMLDocument;
    builtinNativeClasses["flash.xml.XMLParser"] = flash.xml.XMLParser;
    builtinNativeClasses["flash.xml.XMLTag"] = flash.xml.XMLTag;
    builtinNativeClasses["flash.xml.XMLNodeType"] = flash.xml.XMLNodeType;

    builtinNativeClasses["Math"]                = ASMath;
    builtinNativeClasses["Date"]                = ASDate;
    builtinNativeClasses["RegExp"]              = ASRegExp;
    builtinNativeClasses["JSON"]                = ASJSON;

    builtinNativeClasses["flash.utils.Proxy"]      = flash.utils.ASProxy;
    builtinNativeClasses["flash.utils.Dictionary"] = flash.utils.Dictionary;
    builtinNativeClasses["flash.utils.ByteArray"]  = flash.utils.ByteArray;

    builtinNativeClasses["avmplus.System"]  = flash.system.OriginalSystem;

    // Errors
    builtinNativeClasses["Error"]               = ASError;
    builtinNativeClasses["DefinitionError"]     = ASDefinitionError;
    builtinNativeClasses["EvalError"]           = ASEvalError;
    builtinNativeClasses["RangeError"]          = ASRangeError;
    builtinNativeClasses["ReferenceError"]      = ASReferenceError;
    builtinNativeClasses["SecurityError"]       = ASSecurityError;
    builtinNativeClasses["SyntaxError"]         = ASSyntaxError;
    builtinNativeClasses["TypeError"]           = ASTypeError;
    builtinNativeClasses["URIError"]            = ASURIError;
    builtinNativeClasses["VerifyError"]         = ASVerifyError;
    builtinNativeClasses["UninitializedError"]  = ASUninitializedError;
    builtinNativeClasses["ArgumentError"]       = ASArgumentError;
    builtinNativeClasses["flash.errors.IOError"] = ASIOError;
    builtinNativeClasses["flash.errors.EOFError"] = ASEOFError;
    builtinNativeClasses["flash.errors.MemoryError"] = ASMemoryError;
    builtinNativeClasses["flash.errors.IllegalOperationError"] = ASIllegalOperationError;
  }

  export function registerNativeClass(name: string, asClass: ASClass, alias: string = name,
                                      nsType: NamespaceType = NamespaceType.Public) {
    release || assert (!nativeClasses[name], "Native class: " + name + " is already registered.");
    nativeClasses[name] = asClass;
    nativeClassLoaderNames.push({name: name, alias: alias, nsType: nsType});
  }

  export function registerNativeFunction(path: string, fun: Function) {
    release || assert (!nativeFunctions[path], "Native function: " + path + " is already registered.");
    nativeFunctions[path] = fun;
  }

  registerNativeClass("__AS3__.vec.Vector$object", GenericVector, 'ObjectVector', NamespaceType.PackageInternal);
  registerNativeClass("__AS3__.vec.Vector$int", Int32Vector, 'Int32Vector', NamespaceType.PackageInternal);
  registerNativeClass("__AS3__.vec.Vector$uint", Uint32Vector, 'Uint32Vector', NamespaceType.PackageInternal);
  registerNativeClass("__AS3__.vec.Vector$double", Float64Vector, 'Float64Vector', NamespaceType.PackageInternal);

  function FlashUtilScript_getDefinitionByName(sec: AXSecurityDomain, name: string): ASClass {
    var simpleName = String(name).replace("::", ".");
    return <any>getCurrentABC().env.app.getClass(Multiname.FromSimpleName(simpleName));
  }

  export function FlashUtilScript_getTimer(sec: AXSecurityDomain) {
    return Date.now() - (<any>sec).flash.display.Loader.axClass.runtimeStartTime;
  }

  export function FlashNetScript_navigateToURL(sec: AXSecurityDomain, request, window_) {
    if (request === null || request === undefined) {
      sec.throwError('TypeError', Errors.NullPointerError, 'request');
    }
    var RequestClass = (<any>sec).flash.net.URLRequest.axClass;
    if (!RequestClass.axIsType(request)) {
      sec.throwError('TypeError', Errors.CheckTypeFailedError, request, 'flash.net.URLRequest');
    }
    var url = request.url;
    if (isNullOrUndefined(url)) {
      sec.throwError('TypeError', Errors.NullPointerError, 'url');
    }
    if (url.toLowerCase().indexOf('fscommand:') === 0) {
      var fscommand = (<any>sec).flash.system.fscommand.value;
      fscommand(sec, url.substring('fscommand:'.length), window_);
      return;
    }
    // TODO handle other methods than GET
    FileLoadingService.instance.navigateTo(url, window_);
  }

  function FlashNetScript_sendToURL(sec: AXSecurityDomain, request) {
    if (isNullOrUndefined(request)) {
      sec.throwError('TypeError', Errors.NullPointerError, 'request');
    }
    var RequestClass = (<any>sec).flash.net.URLRequest.axClass;
    if (!RequestClass.axIsType(request)) {
      sec.throwError('TypeError', Errors.CheckTypeFailedError, request, 'flash.net.URLRequest');
    }
    var session = FileLoadingService.instance.createSession();
    session.onprogress = function () {
      // ...
    };
    session.open(request);
  }

  function Toplevel_registerClassAlias(sec: AXSecurityDomain, aliasName: string, classObject: AXClass) {
    aliasName = axCoerceString(aliasName);
    if (!aliasName) {
      sec.throwError('TypeError', Errors.NullPointerError, 'aliasName');
    }
    if (!classObject) {
      sec.throwError('TypeError', Errors.NullPointerError, 'classObject');
    }

    sec.classAliases.registerClassAlias(aliasName, classObject);
  }

  function Toplevel_getClassByAlias(sec: AXSecurityDomain, aliasName: string) {
    aliasName = axCoerceString(aliasName);
    if (!aliasName) {
      sec.throwError('TypeError', Errors.NullPointerError, 'aliasName');
    }

    var axClass = sec.classAliases.getClassByAlias(aliasName);
    if (!axClass) {
      sec.throwError('ReferenceError', Errors.ClassNotFoundError, aliasName);
    }
    return axClass;
  }

  registerNativeFunction('FlashUtilScript::getDefinitionByName',
                         FlashUtilScript_getDefinitionByName);

  registerNativeFunction('FlashUtilScript::getTimer', FlashUtilScript_getTimer);

  registerNativeFunction('FlashUtilScript::navigateToURL', FlashNetScript_navigateToURL);
  registerNativeFunction('FlashNetScript::navigateToURL', FlashNetScript_navigateToURL);
  registerNativeFunction('FlashNetScript::sendToURL', FlashNetScript_sendToURL);

  registerNativeFunction('FlashUtilScript::escapeMultiByte', wrapJSGlobalFunction(jsGlobal.escape));
  registerNativeFunction('FlashUtilScript::unescapeMultiByte', wrapJSGlobalFunction(jsGlobal.unescape));

  registerNativeFunction('Toplevel::registerClassAlias', Toplevel_registerClassAlias);
  registerNativeFunction('Toplevel::getClassByAlias', Toplevel_getClassByAlias);

  export function getNativesForTrait(trait: TraitInfo): Object [] {
    var className = null;
    var natives: Object [];

    if (trait.holder instanceof InstanceInfo) {
      var instanceInfo = <InstanceInfo>trait.holder;
      className = instanceInfo.getClassName();
      var native = builtinNativeClasses[className] || nativeClasses[className];
      release || assert (native, "Class native is not defined: " + className);
      natives = [native.prototype];
      if (native.instanceNatives) {
        pushMany(natives, native.instanceNatives);
      }
    } else if (trait.holder instanceof ClassInfo) {
      var classInfo = <ClassInfo>trait.holder;
      className = classInfo.instanceInfo.getClassName();
      var native = builtinNativeClasses[className] || nativeClasses[className];
      release || assert (native, "Class native is not defined: " + className);
      natives = [native];
      if (native.classNatives) {
        pushMany(natives, native.classNatives);
      }
    } else {
      release || assertUnreachable('Invalid trait type');
    }
    return natives;
  }

  export function getNativeInitializer(classInfo: ClassInfo): AXCallable {
    var methodInfo = classInfo.instanceInfo.getInitializer();
    var className = classInfo.instanceInfo.getClassName();
    var asClass = builtinNativeClasses[className] || nativeClasses[className];
    if (methodInfo.isNative()) {
      // Use TS constructor as the initializer function.
      return <any>asClass;
    }
    //// TODO: Assert eagerly.
    //return function () {
    //  release || assert (!methodInfo.isNative(), "Must supply a constructor for " + classInfo +
    // "."); }
    return null;
  }

  /**
   * Searches for a native property in a list of native holders.
   */
  export function getMethodOrAccessorNative(trait: TraitInfo): any {
    var natives = getNativesForTrait(trait);
    var name = trait.getName().name;
    for (var i = 0; i < natives.length; i++) {
      var native = natives[i];
      var fullName = name;
      // We prefix methods that should not be exported with "native_", check to see
      // if a method exists with that prefix first when looking for native methods.
      if (!hasOwnProperty(native, name) && hasOwnProperty(native, "native_" + name)) {
        fullName = "native_" + name;
      }
      if (hasOwnProperty(native, fullName)) {
        var value;
        if (trait.isAccessor()) {
          var pd = Object.getOwnPropertyDescriptor(native, fullName);
          if (trait.isGetter()) {
            value = pd.get;
          } else {
            value = pd.set;
          }
        } else {
          release || assert (trait.isMethod());
          value = native[fullName];
        }
        release || assert (value, "Method or Accessor property exists but it's undefined: " + trait.holder + " " + trait);
        return value;
      }
    }
    Shumway.Debug.warning("No native method for: " + trait.holder + " " + trait + ", make sure you've got the static keyword for static methods.");
    release || assertUnreachable("Cannot find " + trait + " in natives.");
    return null;
  }

  export function tryLinkNativeClass(axClass: AXClass) {
    var className = axClass.classInfo.instanceInfo.getClassName();
    var asClass = builtinNativeClasses[className] || nativeClasses[className];
    if (asClass) {
      linkClass(axClass, asClass);
    }
  }

  /**
   * Returns |true| if the symbol is available in debug or release modes. Only symbols
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

  function linkSymbols(symbols: string [], traits: Traits, object) {
    for (var i = 0; i < traits.traits.length; i++) {
      var trait = traits.traits[i];
      if (!containsSymbol(symbols, trait.getName().name)) {
        continue;
      }
      release || assert (trait.getName().namespace.type !== NamespaceType.Private, "Why are you linking against private members?");
      if (trait.isConst()) {
        release || release || notImplemented("Don't link against const traits.");
        return;
      }
      var name = trait.getName().name;
      var qn = trait.getName().getMangledName();
      if (trait.isSlot()) {
        Object.defineProperty(object, name, {
          get: <() => any>new Function("", "return this." + qn +
                                           "//# sourceURL=get-" + qn + ".as"),
          set: <(any) => void>new Function("v", "this." + qn + " = v;" +
                                                "//# sourceURL=set-" + qn + ".as")
        });
      } else if (trait.isGetter()) {
        release || assert (hasOwnGetter(object, qn), "There should be an getter method for this symbol.");
        Object.defineProperty(object, name, {
          get: <() => any>new Function("", "return this." + qn +
                                           "//# sourceURL=get-" + qn + ".as")
        });
      } else {
        notImplemented(trait.toString());
      }
    }
  }

  function filter(propertyName: string): boolean {
    return propertyName.indexOf("native_") !== 0;
  }

  var axTrapNames = [
    "axResolveMultiname",
    "axHasProperty",
    "axDeleteProperty",
    "axCallProperty",
    "axCallSuper",
    "axConstructProperty",
    "axHasPropertyInternal",
    "axHasOwnProperty",
    "axSetProperty",
    "axGetProperty",
    "axGetSuper",
    "axSetSuper",
    "axNextNameIndex",
    "axNextName",
    "axNextValue",
    "axGetEnumerableKeys",
    "axHasPublicProperty",
    "axSetPublicProperty",
    "axGetPublicProperty",
    "axCallPublicProperty",
    "axDeletePublicProperty",
    "axSetNumericProperty",
    "axGetNumericProperty",
    "axGetSlot",
    "axSetSlot"
  ];

  function linkClass(axClass: AXClass, asClass: ASClass) {
    // Save asClass on the axClass.
    axClass.asClass = asClass;

    // TypeScript's static inheritance can lead to subtle linking bugs. Make sure we don't fall
    // victim to this by checking that we don't inherit non-null static properties.
    if (false && !release && axClass.superClass) {
      if (asClass.classSymbols) {
        release || assert(asClass.classSymbols !== axClass.superClass.asClass.classSymbols,
          "Make sure class " + axClass + " doesn't inherit super class's classSymbols.");
      }
      if (asClass.instanceSymbols) {
        release || assert(asClass.instanceSymbols !== axClass.superClass.asClass.instanceSymbols,
          "Make sure class " + axClass + " doesn't inherit super class's instanceSymbols.");
      }
      if (asClass.classInitializer) {
        release || assert(asClass.classInitializer !== axClass.superClass.asClass.classInitializer,
          "Make sure class " + axClass + " doesn't inherit super class's class initializer.");
      }
    }

    if (asClass.classSymbols) {
      linkSymbols(asClass.classSymbols, axClass.classInfo.traits, axClass);
    }

    if (asClass.instanceSymbols) {
      linkSymbols(asClass.instanceSymbols, axClass.classInfo.instanceInfo.traits,  axClass.tPrototype);
    }

    // Copy class methods and properties.
    if (asClass.classNatives) {
      for (var i = 0; i < asClass.classNatives.length; i++) {
        copyOwnPropertyDescriptors(axClass, asClass.classNatives[i], filter);
      }
    }
    copyOwnPropertyDescriptors(axClass, asClass, filter, true, true);

    if (axClass.superClass) {
      // Inherit prototype descriptors from the super class. This is a bit risky because
      // it copies over all properties and may overwrite properties that we don't expect.
      // TODO: Look into a safer way to do this, for now it doesn't overwrite already
      // defined properties.
      // copyOwnPropertyDescriptors(axClass.dPrototype, axClass.superClass.dPrototype, null, false,
      // true);
    }

    // Copy instance methods and properties.
    if (asClass.instanceNatives) {
      for (var i = 0; i < asClass.instanceNatives.length; i++) {
        copyOwnPropertyDescriptors(axClass.dPrototype, asClass.instanceNatives[i], filter);
      }
    }

    // Inherit or override prototype descriptors from the template class.
    copyOwnPropertyDescriptors(axClass.dPrototype, asClass.prototype, filter);

    // Copy inherited traps. We want to make sure we copy all the in inherited traps, not just the
    // traps defined in asClass.Prototype.
    copyPropertiesByList(axClass.dPrototype, asClass.prototype, axTrapNames);

    if (asClass.classInitializer) {
      asClass.classInitializer.call(axClass, asClass);
      if (!release) {
        Object.freeze(asClass);
      }
    }

    runtimeWriter && traceASClass(axClass, asClass);
  }

  function traceASClass(axClass: AXClass, asClass: ASClass) {
    runtimeWriter.enter("Class: " + axClass.classInfo);
    runtimeWriter.enter("Traps:");
    for (var k in asClass.prototype) {
      if (k.indexOf("ax") !== 0) {
        continue;
      }
      var hasOwn = asClass.hasOwnProperty(k);
      runtimeWriter.writeLn((hasOwn ? "Own" : "Inherited") + " trap: " + k);
    }
    runtimeWriter.leave();
    runtimeWriter.leave();
  }

  /**
   * Creates a self patching getter that lazily constructs the class and memoizes
   * to the class's instance constructor.
   */
  function defineClassLoader(applicationDomain: AXApplicationDomain, container: Object,
                             mn: Multiname, classAlias: string) {
    Object.defineProperty(container, classAlias, {
      get: function () {
        runtimeWriter && runtimeWriter.writeLn("Running Memoizer: " + mn.name);
        var axClass = applicationDomain.getClass(mn);
        release || assert(axClass, "Class " + mn + " is not found.");
        release || assert(axClass.axConstruct);
        var loader: any = function () {
          return axClass.axConstruct(<any>arguments);
        };
        loader.axIsType = function (value: any) {
          return axClass.axIsType(value);
        };
        loader.axClass = axClass;
        Object.defineProperty(container, classAlias, {
          value: loader,
          writable: false
        });
        return loader;
      },
      configurable: true
    });
  }

  var createContainersFromPath = function (pathTokens, container) {
    for (var i = 0, j = pathTokens.length; i < j; i++) {
      if (!container[pathTokens[i]]) {
        container[pathTokens[i]] = Object.create(null);
      }
      container = container[pathTokens[i]];
    }
    return container;
  };

  function makeClassLoader(applicationDomain: AXApplicationDomain, container: Object,
                           classPath: string, aliasPath: string, nsType: NamespaceType) {
    runtimeWriter && runtimeWriter.writeLn("Defining Memoizer: " + classPath);
    var aliasPathTokens = aliasPath.split(".");
    var aliasClassName = aliasPathTokens.pop();
    container = createContainersFromPath(aliasPathTokens, container);
    var mn = Multiname.FromFQNString(classPath, nsType);
    defineClassLoader(applicationDomain, container, mn, aliasClassName);
  }

  /**
   * Installs class loaders for all the previously registered native classes.
   */
  export function installClassLoaders(applicationDomain: AXApplicationDomain, container: Object) {
    for (var i = 0; i < nativeClassLoaderNames.length; i++) {
      var loaderName = nativeClassLoaderNames[i].name;
      var loaderAlias = nativeClassLoaderNames[i].alias;
      var nsType = nativeClassLoaderNames[i].nsType;
      makeClassLoader(applicationDomain, container, loaderName, loaderAlias, nsType);
    }
  }

  /**
   * Installs all the previously registered native functions on the AXSecurityDomain.
   *
   * Note that this doesn't use memoizers and doesn't run the functions' AS3 script.
   */
  export function installNativeFunctions(sec: AXSecurityDomain) {
    for (var i in nativeFunctions) {
      var pathTokens = i.split('.');
      var funName = pathTokens.pop();
      var container = createContainersFromPath(pathTokens, sec);
      container[funName] = sec.boxFunction(nativeFunctions[i]);
    }
  }
}
