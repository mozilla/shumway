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

interface ISecurityDomain extends Shumway.AVMX.SecurityDomain {

}

module Shumway.AVMX.AS {
  import assert = Shumway.Debug.assert;
  import hasOwnProperty = Shumway.ObjectUtilities.hasOwnProperty;
  import hasOwnGetter = Shumway.ObjectUtilities.hasOwnGetter;
  import getOwnGetter = Shumway.ObjectUtilities.getOwnGetter;
  import defineNonEnumerableProperty = Shumway.ObjectUtilities.defineNonEnumerableProperty;
  import isNullOrUndefined = Shumway.isNullOrUndefined;
  import isPrototypeWriteable = Shumway.ObjectUtilities.isPrototypeWriteable;
  import getOwnPropertyDescriptor = Shumway.ObjectUtilities.getOwnPropertyDescriptor;
  import notImplemented = Shumway.Debug.notImplemented;
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;
  import assertUnreachable = Shumway.Debug.assertUnreachable;
  import boxValue = Shumway.ObjectUtilities.boxValue;
  import pushMany = Shumway.ArrayUtilities.pushMany;
  import Scope = Shumway.AVMX.Scope;

  import defineNonEnumerableGetterOrSetter = Shumway.ObjectUtilities.defineNonEnumerableGetterOrSetter;
  import copyOwnPropertyDescriptors = Shumway.ObjectUtilities.copyOwnPropertyDescriptors;

  import Multiname = Shumway.AVMX.Multiname;

  var writer = new IndentingWriter();


  /**
   * Other natives can live in this module
   */
  export module Natives {

    export function print(expression: any, arg1?: any, arg2?: any, arg3?: any, arg4?: any) {
      jsGlobal.print.apply(null, arguments);
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
    export var isXMLName: (x: any) => boolean = function () {
      return false; // "FIX ME";
    };
    export var notImplemented: (x: any) => void = Shumway.Debug.notImplemented;
  }

  var nativeClasses: Shumway.Map<ASClass> = Shumway.ObjectUtilities.createMap<ASClass>();
  var nativeFunctions: Shumway.Map<Function> = Shumway.ObjectUtilities.createMap<Function>();

  /**
   * Searches for natives using a string path "a.b.c...".
   */
  export function getNative(path: string): Function {
    var chain = path.split(".");
    var v = Natives;
    for (var i = 0, j = chain.length; i < j; i++) {
      v = v && v[chain[i]];
    }
    if (!v) {
      v = <any>nativeFunctions[path];
    }
    release || assert(v, "getNative(" + path + ") not found.");
    return <any>v;
  }

  var rn = new Multiname(null, 0, CONSTANT.RTQNameL, [], null);

  function makeMultiname(v: any, namespace?: Namespace) {
    rn.namespaces = namespace ? [namespace] : [];
    rn.name = v;
    return rn;
  }


  export function addPrototypeFunctionAlias(object: AXObject, name: string, fun: Function) {
    release || assert(name.indexOf('$Bg') === 0);
    defineNonEnumerableProperty(object, name, object.securityDomain.AXFunction.axBox(fun));
  }

  /**
   * MetaobjectProtocol base traps. Inherit some or all of these to
   * implement custom behaviour.
   */
  export class ASObject implements IMetaobjectProtocol {
    traits: RuntimeTraits;
    securityDomain: ISecurityDomain;

    // Declare all instance ASObject fields as statics here so that the TS
    // compiler can convert ASClass class objects to ASObject instances.

    static traits: RuntimeTraits;
    static dPrototype: ASObject;
    static tPrototype: ASObject;
    protected static _methodClosureCache: any;
    static classNatives: Object [];
    static instanceNatives: Object [];
    static securityDomain: SecurityDomain;
    static classSymbols = [];
    static instanceSymbols = [];
    static classInfo: ClassInfo;

    static axResolveMultiname: (mn: Multiname) => any;
    static axHasProperty: (mn: Multiname) => boolean;
    static axDeleteProperty: (mn: Multiname) => boolean;
    static axCallProperty: (mn: Multiname, argArray: any []) => any;
    static axCallSuper: (mn: Shumway.AVMX.Multiname, scope: Shumway.AVMX.Scope, argArray: any []) => any;
    static axConstructProperty: (mn: Multiname, args: any []) => any;
    static axHasPropertyInternal: (mn: Multiname) => boolean;
    static axHasOwnProperty: (mn: Multiname) => boolean;
    static axSetProperty: (mn: Multiname, value: any) => void;
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
    static native_isPrototypeOf: (v: any) => boolean;
    static native_hasOwnProperty: (v: any) => boolean;
    static native_propertyIsEnumerable: (v: any) => boolean;

    static classInitializer() {
      var proto: any = this.dPrototype;
      var asProto: any = ASObject.prototype;
      addPrototypeFunctionAlias(proto, "$BghasOwnProperty", asProto.native_hasOwnProperty);
      addPrototypeFunctionAlias(proto, "$BgpropertyIsEnumerable", asProto.native_propertyIsEnumerable);
      addPrototypeFunctionAlias(proto, "$BgsetPropertyIsEnumerable", asProto.setPropertyIsEnumerable);
      addPrototypeFunctionAlias(proto, "$BgisPrototypeOf", asProto.native_isPrototypeOf);
      addPrototypeFunctionAlias(proto, "$BgtoString", asProto.toString);
      addPrototypeFunctionAlias(proto, "$BgvalueOf", asProto.valueOf);
    }

    static _init() {
      // Nop.
    }

    // REDUX:
    static instanceConstructorNoInitialize = function () { notImplemented("instanceConstructorNoInitialize => axInitialize"); };
    static initializeFrom = function (x: any) { notImplemented("initializeFrom"); return null; };
    static isInstanceOf = function (x: any) { notImplemented("isInstanceOf"); return false; };
    static isType = function (x: any) { notImplemented("isType"); return false; };
    static isSubtypeOf = function (x: any) { notImplemented("isType"); return false; };
    static class: any;
    class: any;
    instanceConstructorNoInitialize = function () { notImplemented("instanceConstructorNoInitialize => axInitialize"); };
    initializeFrom = function (x: any) { notImplemented("initializeFrom"); return null; };
    isInstanceOf = function (x: any) { notImplemented("isInstanceOf"); return false; };
    isType = function (x: any) { notImplemented("isType"); return false; };
    isSubtypeOf = function (x: any) { notImplemented("isType"); return false; };


    getPrototypeOf: () => any;

    native_isPrototypeOf(v: any): boolean {
      notImplemented("Object::isPrototypeOf");
      return false;
    }

    native_hasOwnProperty(v: any): boolean {
      return this.axHasOwnProperty(makeMultiname(v));
    }

    native_propertyIsEnumerable(v: any): boolean {
      return this.axHasOwnProperty(makeMultiname(v));
    }

    axResolveMultiname(mn: Multiname): any {
      if (typeof mn.name === 'number') {
        release || assert(mn.isRuntimeName());
        return mn.name;
      }
      var name = asCoerceName(mn.name);
      var namespaces = mn.namespaces;
      if (mn.isRuntimeName() && isNumeric(name)) {
        return name;
      }
      var t = this.traits.getTrait(namespaces, name);
      if (t) {
        return t.name.getMangledName();
      }
      return '$Bg' + name;
    }

    axHasProperty(mn: Multiname): boolean {
      return this.axHasPropertyInternal(mn);
    }

    axHasPublicProperty(nm: any): boolean {
      rn.name = nm;
      return this.axHasProperty(rn);
    }

    axSetProperty(mn: Multiname, value: any) {
      release || checkValue(value);
      this[this.axResolveMultiname(mn)] = value;
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

    protected _methodClosureCache: any = null;

    axGetMethod(name: string): AXFunction {
      release || assert(typeof this[name] === 'function');
      var cache = this._methodClosureCache || (this._methodClosureCache = Object.create(null));
      var method = cache[name];
      if (!method) {
        method = cache[name] = this.securityDomain.AXMethodClosure.Create(<any>this, this[name]);
      }
      return method;
    }

    axGetSuper(mn: Multiname, scope: Scope): any {
      var name = asCoerceName(mn.name);
      var namespaces = mn.namespaces;
      var trait = (<AXClass>scope.parent.object).tPrototype.traits.getTrait(namespaces, name);
      var value;
      if (trait.kind === TRAIT.Getter || trait.kind === TRAIT.GetterSetter) {
        value = trait.get.call(this);
      } else {
        value = this[trait.name.getMangledName()];
      }
      release || checkValue(value);
      return value;
    }

    axSetSuper(mn: Multiname, scope: Scope, value: any) {
      release || checkValue(value);
      var name = asCoerceName(mn.name);
      var namespaces = mn.namespaces;
      var trait = (<AXClass>scope.parent.object).tPrototype.traits.getTrait(namespaces, name);
      if (trait.kind === TRAIT.Setter || trait.kind === TRAIT.GetterSetter) {
        trait.set.call(this, value);
      } else {
        this[trait.name.getMangledName()] = value;
      }
    }

    axDeleteProperty(mn: Multiname): any {
      // Cannot delete traits.
      var name = asCoerceName(mn.name);
      var namespaces = mn.namespaces;
      if (this.traits.getTrait(namespaces, name)) {
        return false;
      }
      return delete this[mn.getPublicMangledName()];
    }

    axCallProperty(mn: Multiname, args: any []): any {
      return this[this.axResolveMultiname(mn)].axApply(this, args);
    }

    axCallSuper(mn: Multiname, scope: Scope, args: any []): any {
      var name = this.axResolveMultiname(mn);
      var fun = (<AXClass>scope.parent.object).tPrototype[name];
      return fun.axApply(this, args);
    }
    axConstructProperty(mn: Multiname, args: any []): any {
      return this[this.axResolveMultiname(mn)].axConstruct(args);
    }

    axHasPropertyInternal(mn: Multiname): boolean {
      return this.axResolveMultiname(mn) in this;
    }

    axHasOwnProperty(mn: Multiname): boolean {
      var name = this.axResolveMultiname(mn);
      // We have to check for trait properties too if a simple hasOwnProperty fails.
      // This is different to JavaScript's hasOwnProperty behaviour where hasOwnProperty returns
      // false for properties defined on the property chain and not on the instance itself.
      return this.hasOwnProperty(name) || Object.getPrototypeOf(this).hasOwnProperty(name);
    }

    axGetEnumerableKeys(): any [] {
      var self: AXObject = <any>this;
      if (this.securityDomain.isPrimitive(this)) {
        return [];
      }
      var keys = Object.keys(this);
      var result = [];
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (isNumeric(key)) {
          result.push(key);
        } else {
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

    axGetSlot(i: number): any {
      var t = this.traits.getSlot(i);
      var value = this[t.getName().getMangledName()];
      release || checkValue(value);
      return value;
    }

    axSetSlot(i: number, value: any) {
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
    classInitializer: () => void;

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
  }

  export class ASArray extends ASObject {
    static classInitializer() {
      var proto: any = this.dPrototype;
      var asProto: any = ASArray.prototype;
      addPrototypeFunctionAlias(proto, "$Bgpush", asProto.push);
      addPrototypeFunctionAlias(proto, "$Bgpop", asProto.pop);
      addPrototypeFunctionAlias(proto, "$Bgshift", asProto.shift);
      addPrototypeFunctionAlias(proto, "$Bgunshift", asProto.unshift);
      addPrototypeFunctionAlias(proto, "$Bgreverse", asProto.reverse);
      addPrototypeFunctionAlias(proto, "$Bgconcat", asProto.concat);
      addPrototypeFunctionAlias(proto, "$Bgslice", asProto.slice);
      addPrototypeFunctionAlias(proto, "$Bgsplice", asProto.splice);
      addPrototypeFunctionAlias(proto, "$Bgjoin", asProto.join);
      addPrototypeFunctionAlias(proto, "$BgtoString", asProto.toString);
      addPrototypeFunctionAlias(proto, "$BgindexOf", asProto.indexOf);
      addPrototypeFunctionAlias(proto, "$BglastIndexOf", asProto.lastIndexOf);
      addPrototypeFunctionAlias(proto, "$Bgevery", asProto.every);
      addPrototypeFunctionAlias(proto, "$Bgsome", asProto.some);
      addPrototypeFunctionAlias(proto, "$BgforEach", asProto.forEach);
      addPrototypeFunctionAlias(proto, "$Bgmap", asProto.map);
      addPrototypeFunctionAlias(proto, "$Bgfilter", asProto.filter);
      addPrototypeFunctionAlias(proto, "$Bgsort", asProto.sort);
      addPrototypeFunctionAlias(proto, "$BgsortOn", asProto.sortOn);
    }

    value: any [];

    push() {
      return this.value.push.apply(this.value, arguments);
    }
    pop() {
      return this.value.pop();
    }
    shift() {
      return this.value.shift();
    }
    unshift() {
      return this.value.unshift.apply(this.value, arguments);
    }
    reverse() {
      this.value.reverse();
      return this;
    }
    concat() {
      var value = this.value.slice();
      for (var i = 0; i < arguments.length; i++) {
        var a = arguments[i];
        // Treat all objects with a `securityDomain` property and a value that's an Array as
        // concat-spreadable.
        // TODO: verify that this is correct.
        if (typeof a === 'object' && a && a.securityDomain && Array.isArray(a.value)) {
          value.push.apply(value, a.value);
        } else {
          value.push(a);
        }
      }
      return this.securityDomain.AXArray.axBox(value);
    }
    slice(startIndex: number, endIndex: number) {
      return this.securityDomain.AXArray.axBox(this.value.slice(startIndex, endIndex));
    }
    join(sep: string) {
      return this.value.join(sep);
    }
    toString() {
      return this.value.join(',');
    }
    indexOf(value: any, fromIndex: number) {
      return this.value.indexOf(value, fromIndex|0);
    }
    lastIndexOf(value: any, fromIndex: number) {
      return this.value.lastIndexOf(value, arguments.length > 1 ? fromIndex : 0x7fffffff);
    }
    every(callbackfn: {value: Function}, thisArg?) {
      var o = this.value;
      for (var i = 0; i < o.length; i++) {
        if (callbackfn.value.call(thisArg, o[i], i, o) !== true) {
          return false;
        }
      }
      return true;
    }
    some(callbackfn: {value}, thisArg?) {
      return this.value.some(callbackfn.value, thisArg);
    }
    forEach(callbackfn: {value}, thisArg?) {
      return this.value.forEach(callbackfn.value, thisArg);
    }
    map(callbackfn: {value}, thisArg?) {
      return this.securityDomain.AXArray.axBox(this.value.map(callbackfn.value, thisArg));
    }
    filter(callbackfn: {value: Function}, thisArg?) {
      var result = [];
      var o = this.value;
      for (var i = 0; i < o.length; i++) {
        if (callbackfn.value.call(thisArg, o[i], i, o) === true) {
          result.push(o[i]);
        }
      }
      return this.securityDomain.AXArray.axBox(result);
    }

    toLocaleString(): string {
      var value = this.securityDomain.AXArray.axCoerce(this).value;

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

    splice(): any[] {
      var o = this.value;
      if (arguments.length === 0) {
        return undefined;
      }
      return this.securityDomain.AXArray.axBox(o.splice.apply(o, arguments));
    }

    sort(): any {
      var o = this.value;
      if (arguments.length === 0) {
        o.sort();
        return this;
      }
      var compareFunction;
      var options = 0;
      if (this.securityDomain.AXFunction.axIsInstanceOf(arguments[0])) {
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

    sortOn(names: any, options: any): any {
      if (arguments.length === 0) {
        this.securityDomain.throwError(
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

    get length(): number {
      return this.value.length;
    }

    set length(newLength: number) {
      this.value.length = newLength >>> 0;
    }

    axGetEnumerableKeys(): any [] {
      return Object.keys(this.value);
    }

    axHasPropertyInternal(mn: Multiname): boolean {
      // Optimization for the common case of array element accesses.
      if (typeof mn.name === 'number') {
        release || assert(mn.isRuntimeName());
        return mn.name in this.value;
      }
      var name = asCoerceName(mn.name);
      if (isNumeric(name)) {
        return name in this.value;
      }
      var namespaces = mn.namespaces;
      if (this.traits.indexOf(namespaces, name) > -1) {
        return true;
      }
      return '$Bg' + name in this;
    }

    axHasOwnProperty(mn: Multiname): boolean {
      // Optimization for the common case of array element accesses.
      if (typeof mn.name === 'number') {
        release || assert(mn.isRuntimeName());
        return this.value.hasOwnProperty(mn.name);
      }
      var name = asCoerceName(mn.name);
      if (mn.isRuntimeName() && isNumeric(name)) {
        return this.value.hasOwnProperty(name);
      }
      var t = this.traits.getTrait(mn.namespaces, name);
      if (t) {
        return true;
      }
      return this.hasOwnProperty('$Bg' + name);
    }

    axGetProperty(mn: Multiname): any {
      // Optimization for the common case of array element accesses.
      if (typeof mn.name === 'number') {
        release || assert(mn.isRuntimeName());
        return this.value[mn.name];
      }
      var name = asCoerceName(mn.name);
      if (mn.isRuntimeName() && isNumeric(name)) {
        return this.value[name];
      }
      var t = this.traits.getTrait(mn.namespaces, name);
      if (t) {
        return this[t.name.getMangledName()];
      }
      return this['$Bg' + name];
    }

    axSetProperty(mn: Multiname, value: any) {
      release || checkValue(value);
      // Optimization for the common case of array element accesses.
      if (typeof mn.name === 'number') {
        release || assert(mn.isRuntimeName());
        this.value[mn.name] = value;
        return;
      }
      var name = asCoerceName(mn.name);
      if (mn.isRuntimeName() && isNumeric(name)) {
        this.value[name] = value;
        return;
      }
      var t = this.traits.getTrait(mn.namespaces, name);
      if (t) {
        this[t.name.getMangledName()] = value;
        return;
      }
      this['$Bg' + name] = value;
    }

    axDeleteProperty(mn: Multiname): any {
      // Optimization for the common case of array element accesses.
      if (typeof mn.name === 'number') {
        release || assert(mn.isRuntimeName());
        return delete this.value[mn.name];
        return;
      }
      var name = asCoerceName(mn.name);
      var namespaces = mn.namespaces;
      if (mn.isRuntimeName() && isNumeric(name)) {
        return delete this.value[name];
      }
      // Cannot delete array traits.
      if (this.traits.getTrait(namespaces, name)) {
        return false;
      }
      return delete this['$Bg' + name];
    }

    axGetPublicProperty(nm: any): any {
      // Optimization for the common case of array element accesses.
      if (typeof nm === 'number') {
        return this.value[nm];
      }
      var name = asCoerceName(nm);
      if (isNumeric(name)) {
        return this.value[name];
      }
      return this['$Bg' + name];
    }

    axSetPublicProperty(nm: any, value: any) {
      release || checkValue(value);
      // Optimization for the common case of array element accesses.
      if (typeof nm === 'number') {
        this.value[nm] = value;
      }
      var name = asCoerceName(nm);
      if (isNumeric(name)) {
        this.value[name] = value;
      }
      this['$Bg' + name] = value;
    }
  }

  export class ASFunction extends ASObject {
    static classInitializer() {
      var proto: any = this.dPrototype;
      var asProto: any = ASFunction.prototype;
      addPrototypeFunctionAlias(proto, "$BgtoString", asProto.toString);
    }

    private _prototype: AXObject;
    protected value: Function;

    get prototype(): AXObject {
      if (!this._prototype) {
        this._prototype = Object.create(this.securityDomain.AXObject.tPrototype);
      }
      return this._prototype;
    }

    set prototype(prototype: AXObject) {
      assert (prototype, "What do we need to do if we pass null here?");
      this._prototype = prototype;
    }

    get length(): number {
      return this.value.length;
    }

    toString() {
      return "function Function() {}";
    }

    call(thisArg: any) {
      return this.value.apply(thisArg, sliceArguments(arguments, 1));
    }

    apply(thisArg: any, argArray?: ASArray): any {
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
    static Create(receiver: AXObject, method: Function) {
      var closure: ASMethodClosure = Object.create(this.securityDomain.AXMethodClosure.tPrototype);
      closure.receiver = receiver;
      closure.value = method;
      return closure;
    }

    private receiver: AXObject;

    get prototype(): AXObject {
      return null;
    }

    set prototype(prototype: AXObject) {
      this.securityDomain.throwError("ReferenceError", Errors.ConstWriteError, "prototype",
                                     "MethodClosure");
    }

    axCall(ignoredThisArg: any): any {
      return this.value.apply(this.receiver, sliceArguments(arguments, 1));
    }

    axApply(ignoredThisArg: any, argArray?: any[]): any {
      return this.value.apply(this.receiver, argArray);
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
      addPrototypeFunctionAlias(proto, '$BgvalueOf', asProto.valueOf);
    }

    value: string;

    indexOf(char: string) {
      return this.value.indexOf(char);
    }
    lastIndexOf(char: string) {
      return this.value.lastIndexOf(char);
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
    localeCompare() {
      return this.value.localeCompare.apply(this.value, arguments);
    }
    match(pattern) {
      return this.value.match(pattern);
    }
    replace(pattern, repl) {
      return this.value.replace(pattern, repl);
    }
    search(pattern) {
      return this.value.search(pattern);
    }
    slice(start?: number, end?: number) {
      return this.value.slice(start, end);
    }
    split(separator: string, limit?: number) {
      return this.value.split(separator, limit);
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
      return this.value.toLowerCase();
    }
    toLocaleUpperCase() {
      return this.value.toUpperCase();
    }
    toUpperCase() {
      return this.value.toUpperCase();
    }

    // The String.prototype versions of these methods  are generic, so the implementation is
    // different.

    generic_indexOf(char: string) {
      return String.prototype.indexOf.call(this.value, char);
    }
    generic_lastIndexOf(char: string) {
      return String.prototype.lastIndexOf.call(this.value, char);
    }
    generic_charAt(index: number) {
      return String.prototype.charAt.call(this.value, index);
    }
    generic_charCodeAt(index: number) {
      return String.prototype.charCodeAt.call(this.value, index);
    }
    generic_concat() {
      return String.prototype.concat.apply(this.value, arguments);
    }
    generic_localeCompare() {
      return String.prototype.localeCompare.apply(this.value, arguments);
    }
    generic_match(pattern) {
      return String.prototype.match.call(this.value, pattern);
    }
    generic_replace(pattern, repl) {
      return String.prototype.replace.call(this.value, pattern, repl);
    }
    generic_search(pattern) {
      return String.prototype.search.call(this.value, pattern);
    }
    generic_slice(start?: number, end?: number) {
      return String.prototype.slice.call(this.value, start, end);
    }
    generic_split(separator: string, limit?: number) {
      return String.prototype.split.call(this.value, separator, limit);
    }
    generic_substring(start: number, end?: number) {
      return String.prototype.substring.call(this.value, start, end);
    }
    generic_substr(from: number, length?: number) {
      return String.prototype.substr.call(this.value, from, length);
    }
    generic_toLowerCase() {
      return String.prototype.toLowerCase.call(this.value);
    }
    generic_toUpperCase() {
      return String.prototype.toUpperCase.call(this.value);
    }

    toString() {
      return this.value.toString();
    }
    valueOf() {
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
      addPrototypeFunctionAlias(proto, '$BgvalueOf', asProto.valueOf);
    }

    value: number;

    toString(radix: number) {
      return this.value.toString(radix);
    }

    valueOf() {
      return this.value;
    }

    toExponential(p): string {
      return this.value.toExponential(p);
    }

    toPrecision(p): string {
      return this.value.toPrecision(p);
    }

    toFixed(p): string {
      return this.value.toFixed(p);
    }

    static _minValue(): number {
      return Number.MIN_VALUE;
    }
  }

  export class ASInt extends ASObject {
    static classInitializer() {
      var proto: any = this.dPrototype;
      var asProto: any = ASInt.prototype;
      addPrototypeFunctionAlias(proto, '$BgtoString', asProto.toString);
      addPrototypeFunctionAlias(proto, '$BgvalueOf', asProto.valueOf);
    }

    value: number;
  }

  export class ASUint extends ASObject {
    static classInitializer() {
      var proto: any = this.dPrototype;
      var asProto: any = ASUint.prototype;
      addPrototypeFunctionAlias(proto, '$BgtoString', asProto.toString);
      addPrototypeFunctionAlias(proto, '$BgvalueOf', asProto.valueOf);
    }

    value: number;
  }

  export class ASMath extends ASObject {
    public static classNatives: any [] = [Math];
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

    static classInitializer: any = function() {
      defineNonEnumerableProperty(this, '$Bglength', 1);
      defineNonEnumerableProperty(this.dPrototype, '$Bgname', 'Error');
      defineNonEnumerableProperty(this.dPrototype, '$Bgmessage', 'Error');
      defineNonEnumerableProperty(this.dPrototype, '$BgtoString', ASError.prototype.toString);
    }

    constructor(message: any, id: any) {
      false && super();
      this.message = asCoerceString(message);
      this._errorID = id | 0;

      // This is gnarly but saves us from having individual ctors in all Error child classes.
      // this.name = (<ASClass><any>this.constructor).dPrototype['$Bgname'];
    }

    message: string;
    name: string;
    _errorID: number;

    toString() {
      return this.message !== "" ? this.name + ": " + this.message : this.name;
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
    static classInitializer: any = function() {
      defineNonEnumerableProperty(this, '$Bglength', 1);
      defineNonEnumerableProperty(this.dPrototype, '$Bgname', (<any>ASDefinitionError).name.substr(2));
    }
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

  export class ASJSON extends ASObject {
    /**
     * Transforms a JS value into an AS value.
     */
    static transformJSValueToAS(value, deep: boolean) {
      // REDUX:
      //if (typeof value !== "object") {
      //  return value;
      //}
      //if (isNullOrUndefined(value)) {
      //  return value;
      //}
      //var keys = Object.keys(value);
      //var result = Array.isArray(value) ? [] : {};
      //for (var i = 0; i < keys.length; i++) {
      //  var v = value[keys[i]];
      //  if (deep) {
      //    v = ASJSON.transformJSValueToAS(v, true);
      //  }
      //  result.axSetPublicProperty(keys[i], v);
      //}
      //return result;
      return null;
    }

    /**
     * Transforms an AS value into a JS value.
     */
    static transformASValueToJS(value, deep: boolean) {
      // REDUX
      //if (typeof value !== "object") {
      //  return value;
      //}
      //if (isNullOrUndefined(value)) {
      //  return value;
      //}
      //var keys = Object.keys(value);
      //var result = Array.isArray(value) ? [] : {};
      //for (var i = 0; i < keys.length; i++) {
      //  var key = keys[i];
      //  var jsKey = key;
      //  if (!isNumeric(key)) {
      //    jsKey = Multiname.getNameFromPublicQualifiedName(key);
      //  }
      //  var v = value[key];
      //  if (deep) {
      //    v = ASJSON.transformASValueToJS(v, true);
      //  }
      //  result[jsKey] = v;
      //}
      //return result;
      return null;
    }

    private static parseCore(text: string): Object {
      // REDUX:
      //text = asCoerceString(text);
      //return ASJSON.transformJSValueToAS(JSON.parse(text), true)
      return;
    }

    private static stringifySpecializedToString(value: Object, replacerArray: any [], replacerFunction: (key: string, value: any) => any, gap: string): string {
      // REDUX:
      // return JSON.stringify(ASJSON.transformASValueToJS(value, true), replacerFunction, gap);
      return null;
    }
  }

  var builtinNativeClasses: Shumway.Map<ASClass> = Shumway.ObjectUtilities.createMap<ASClass>();
  var nativeClasses: Shumway.Map<ASClass> = Shumway.ObjectUtilities.createMap<ASClass>();
  var nativeClassLoaderNames: {
    name: string
  } [] = [];

  export function initializeBuiltins() {
    builtinNativeClasses["Object"]              = ASObject;
    builtinNativeClasses["Class"]               = ASClass;
    builtinNativeClasses["Function"]            = ASFunction;
    builtinNativeClasses["Boolean"]             = ASBoolean;
    builtinNativeClasses["builtin.as$0.MethodClosure"] = ASMethodClosure;
    builtinNativeClasses["Namespace"]           = ASNamespace;
    builtinNativeClasses["Number"]              = ASNumber;
    builtinNativeClasses["Int"]                 = ASInt;
    builtinNativeClasses["UInt"]                = ASUint;
    builtinNativeClasses["String"]              = ASString;
    builtinNativeClasses["Array"]               = ASArray;

    builtinNativeClasses["__AS3__.vec.Vector$object"] = GenericVector;
    builtinNativeClasses["__AS3__.vec.Vector$int"] = Int32Vector;
    builtinNativeClasses["__AS3__.vec.Vector$uint"] = Uint32Vector;
    builtinNativeClasses["__AS3__.vec.Vector$double"] = Float64Vector;

    builtinNativeClasses["Namespace"]           = ASNamespace;
    builtinNativeClasses["QName"]               = ASQName;
    builtinNativeClasses["XML"]                 = ASXML;
    builtinNativeClasses["XMLList"]             = ASXMLList;

    builtinNativeClasses["Math"]                = ASMath;

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
    builtinNativeClasses["JSON"]                = ASJSON;
    builtinNativeClasses["flash.utils.Dictionary"] = flash.utils.Dictionary;
    builtinNativeClasses["flash.utils.ByteArray"] = flash.utils.ByteArray;
  }

  export function registerNativeClass(name: string, asClass: ASClass) {
    release || assert (!nativeClasses[name], "Native class: " + name + " is already registered.");
    nativeClasses[name] = asClass;
    nativeClassLoaderNames.push({name: name});
  }

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
    }
    return natives;
  }

  export function getNativeInitializer(classInfo: ClassInfo): Function {
    var methodInfo = classInfo.instanceInfo.getInitializer();
    var className = classInfo.instanceInfo.getClassName();
    var asClass = builtinNativeClasses[className] || nativeClasses[className];
    if (methodInfo.isNative()) {
      // Use TS constructor as the initializer function.
      return <any>asClass;
    }
    //// TODO: Assert eagerly.
    //return function () {
    //  release || assert (!methodInfo.isNative(), "Must supply a constructor for " + classInfo + ".");
    //}
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
      var qn = Multiname.getMangledName(trait.name);
      if (trait.isSlot()) {
        Object.defineProperty(object, name, {
          get: <() => any>new Function("", "return this." + qn +
                                           "//# sourceURL=get-" + qn + ".as"),
          set: <(any) => void>new Function("v", "this." + qn + " = v;" +
                                                "//# sourceURL=set-" + qn + ".as")
        });
      } else if (trait.isMethod()) {
        release || assert (!object[name], "Symbol should not already exist.");
        release || assert (object.asOpenMethods[qn], "There should be an open method for this symbol.");
        object[name] = object.asOpenMethods[qn];
      } else if (trait.isGetter()) {
        release || assert (hasOwnGetter(object, qn), "There should be an getter method for this symbol.");
        Object.defineProperty(object, name, {
          get: <() => any>new Function("", "return this." + qn +
                                           "//# sourceURL=get-" + qn + ".as")
        });
      } else {
        notImplemented(trait);
      }
    }
  }

  function filter(propertyName: string): boolean {
    return propertyName.indexOf("native_") !== 0;
  }

  function linkClass(axClass: AXClass, asClass: ASClass) {
    if (asClass.classSymbols) {
      // link(self.classSymbols, self.classInfo.traits,  self);
    }

    if (asClass.instanceSymbols) {
      // link(self.instanceSymbols, self.classInfo.instanceInfo.traits,  self.tPrototype);
    }

    // Copy class methods and properties.
    if (asClass.classNatives) {
      for (var i = 0; i < asClass.classNatives.length; i++) {
        copyOwnPropertyDescriptors(axClass, asClass.classNatives[i], filter);
      }
    }
    copyOwnPropertyDescriptors(axClass, asClass, filter);

    if (axClass.superClass) {
      // Inherit prototype descriptors from the super class. This is a bit risky because
      // it copies over all properties and may overwrite properties that we don't expect.
      // TODO: Look into a safer way to do this, for now it doesn't overwrite already
      // defined properties.
      copyOwnPropertyDescriptors(axClass.tPrototype, axClass.superClass.tPrototype, null, false);
    }

    // Copy instance methods and properties.
    if (asClass.instanceNatives) {
      for (var i = 0; i < asClass.instanceNatives.length; i++) {
        copyOwnPropertyDescriptors(axClass.tPrototype, asClass.instanceNatives[i], filter);
      }
    }

    // Inherit or override prototype descriptors from the template class.
    copyOwnPropertyDescriptors(axClass.tPrototype, asClass.prototype, filter);

    if (asClass.classInitializer) {
      asClass.classInitializer.call(axClass);
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
  function defineClassLoader(applicationDomain: ApplicationDomain, container: Object, classNamespace: string, className: string) {
    Object.defineProperty(container, className, {
      get: function () {
        runtimeWriter && runtimeWriter.writeLn("Running Memoizer: " + className);
        var ns = new Namespace(null, NamespaceType.Public, classNamespace);
        var mn = makeMultiname(className, ns);
        var axClass = applicationDomain.getClass(mn);
        release || assert(axClass, "Class " + classNamespace + ":" + className + " is not found.");
        release || assert(axClass.axConstruct);
        var loader: any = function () {
          return axClass.axConstruct(arguments);
        };
        loader.axIsType = function (value: any) {
          return axClass.axIsType(value);
        };
        loader.axClass = axClass;
        Object.defineProperty(container, className, {
          value: loader,
          writable: false
        });
        return container[className];
      },
      configurable: true
    });
  }

  function makeClassLoader(applicationDomain: ApplicationDomain, container: Object, classPath: string) {
    runtimeWriter && runtimeWriter.writeLn("Defining Memoizer: " + classPath);
    var path = classPath.split(".");
    for (var i = 0, j = path.length - 1; i < j; i++) {
      if (!container[path[i]]) {
        container[path[i]] = Object.create(null);
      }
      container = container[path[i]];
    }
    defineClassLoader(applicationDomain, container, path.slice(0, path.length - 1).join("."), path[path.length - 1]);
  }

  /**
   * Installs class loaders for all the previously registered native classes.
   */
  export function installClassLoaders(applicationDomain: ApplicationDomain, container: Object) {
    for (var i = 0; i < nativeClassLoaderNames.length; i++) {
      var loaderName = nativeClassLoaderNames[i].name;
      makeClassLoader(applicationDomain, container, loaderName);
    }
  }
}
