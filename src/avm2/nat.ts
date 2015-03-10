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

  var rn = new Multiname(null, 0, CONSTANT.RTQNameL, null, null);

  function makeMultiname(v) {
    rn.name = v;
    return rn;
  }

  /**
   * MetaobjectProtocol base traps. Inherit some or all of these to
   * implement custom behaviour.
   */
  export class ASObject implements IMetaobjectProtocol {
    traits: RuntimeTraits;
    securityDomain: SecurityDomain;

    // Declare all instance ASObject fields as statics here so that the TS
    // compiler can convert ASClass class objects to ASObject instances.

    static traits: RuntimeTraits;
    static dPrototype: ASObject;
    static tPrototype: ASObject;
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
    static axGetSuper: (mn: Multiname, scope: Scope) => any;
    static axSetSuper: (mn: Multiname, scope: Scope, value: any) => void;

    static axEnumerableKeys: any [];
    static axGetEnumerableKeys: () => any [];
    static axHasPublicProperty: (nm: any) => boolean;
    static axSetPublicProperty: (nm: any, value: any) => void;
    static axGetPublicProperty: (nm: any) => any;

    static axSetNumericProperty: (nm: number, value: any) => void;
    static axGetNumericProperty: (nm: number) => any;

    static axCoerce: (v: any) => any;
    static axConstruct: (argArray?: any []) => any;

    static axNextNameIndex: (index: number) => number;
    static axNextName: (index: number) => any;
    static axNextValue: (index: number) => any;

    static axGetSlot: (i: number) => any;
    static axSetSlot: (i: number, value: any) => void;

    static native_isPrototypeOf: (v: any) => boolean;
    static native_hasOwnProperty: (v: any) => boolean;
    static native_propertyIsEnumerable: (v: any) => boolean;

    static _init() {
      // Nop.
    }

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
      if (mn.isRuntimeName() && isNumeric(mn.name)) {
        return mn.name;
      }
      var t = this.traits.getTrait(mn);
      if (t) {
        return t.name.getMangledName();
      }
      return mn.getPublicMangledName();
    }

    axHasProperty(mn: Multiname): boolean {
      return this.axHasPropertyInternal(mn);
    }

    axHasPublicProperty(nm: any): boolean {
      rn.name = nm;
      return this.axHasProperty(rn);
    }

    axSetProperty(mn: Multiname, value: any) {
      release || assert(isValidASValue(value));
      this[this.axResolveMultiname(mn)] = value;
    }

    axGetProperty(mn: Multiname): any {
      var value = this[this.axResolveMultiname(mn)];
      release || checkValue(value);
      return value;
    }

    axGetSuper(mn: Multiname, scope: Scope): any {
      var trait = (<AXClass>scope.parent.object).tPrototype.traits.getTrait(mn);
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
      release || assert(isValidASValue(value));
      var trait = (<AXClass>scope.parent.object).tPrototype.traits.getTrait(mn);
      if (trait.kind === TRAIT.Setter || trait.kind === TRAIT.GetterSetter) {
        trait.set.call(this, value);
      } else {
        this[trait.name.getMangledName()] = value;
      }
    }

    axDeleteProperty(mn: Multiname): any {
      // Cannot delete traits.
      if (this.traits.getTrait(mn)) {
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
      release || Debug.abstractMethod("axHasOwnProperty");
      return false;
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

    classSymbols: string [];
    instanceSymbols: string [];
    classInfo: ClassInfo;

    axCoerce(v: any): any {

    }

    axConstruct: (argArray?: any []) => any;

    get prototype(): ASObject {
      release || assert (this.dPrototype);
      return this.dPrototype;
    }
  }

  export class ASArray extends ASObject {
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
      if (this.traits.indexOf(mn) >= 0) {
        return true;
      }
      if (isNumeric(mn.name)) {
        return mn.name in this.value;
      }
      return mn.getPublicMangledName() in this.value;
    }

    axGetProperty(mn: Multiname): any {
      if (mn.isRuntimeName() && isNumeric(mn.name)) {
        return this.value[mn.name];
      }
      var t = this.traits.getTrait(mn);
      if (t) {
        return this[t.name.getMangledName()];
      }
      return this[mn.getPublicMangledName()];
    }

    axSetProperty(mn: Multiname, value: any) {
      if (mn.isRuntimeName() && isNumeric(mn.name)) {
        this.value[mn.name] = value;
      }
      var t = this.traits.getTrait(mn);
      if (t) {
        this[t.name.getMangledName()] = value;
        return;
      }
      this[mn.getPublicMangledName()] = value;
    }

    axDeleteProperty(mn: Multiname): any {
      if (mn.isRuntimeName() && isNumeric(mn.name)) {
        return delete this.value[mn.name];
      }
      // Cannot delete array traits.
      if (this.traits.getTrait(mn)) {
        return false;
      }
      return delete this[mn.getPublicMangledName()];
    }

    axGetPublicProperty(nm: any): any {
      if (isNumeric(nm)) {
        return this.value[nm];
      }
      return this[Multiname.getPublicMangledName(nm)];
    }

    axSetPublicProperty(nm: any, value: any) {
      release || checkValue(value);
      if (isNumeric(nm)) {
        this.value[nm] = value;
        return;
      }
      this[Multiname.getPublicMangledName(nm)] = value;
    }
  }

  export class ASFunction extends ASObject {
    static tsInstanceSymbols = ["prototype"];

    private _prototype: AXObject;
    private value: Function;

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
      assert (false, "Fix me.");
      return 0;
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

  export class ASNamespace extends ASObject {
    get prefix(): string {
      return "FIXME";
    }

    get uri(): string {
      return "FIXME";
    }

    toString(): string {
      return "FIXME";
    }

    valueOf(): any {
      return "FIXME";
    }
  }

  export class ASBoolean extends ASObject {
    value: boolean;
  }

  export class ASString extends ASObject {
    static classNatives: any [] = [String];

    // TODO: It's not safe to pull methods from String.prototype.
    static instanceNatives: any [] = [String.prototype];

    value: string;

    charCodeAt() {
      return this.value.charCodeAt.apply(this.value, arguments);
    }

    // TODO: Add all other string functions.

    get length(): number {
      return this.value.length;
    }
  }

  export class ASNumber extends ASObject {
    static classNatives: any [] = [Math];
    static instanceNatives: any [] = [Number.prototype];
    value: number;

    static _numberToString(n: number, radix: number): string {
      radix = radix | 0;
      return Number(n).toString(radix);
    }

    static _minValue(): number {
      return Number.MIN_VALUE;
    }
  }

  export class ASInt extends ASObject {
    value: number;
  }

  export class ASUint extends ASObject {
    value: number;
  }

  export class ASMethodClosure extends ASFunction {
    toString() {
      return "function Function() {}";
    }
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
      defineNonEnumerableProperty(this.dynamicPrototype, '$Bgname', 'Error');
      defineNonEnumerableProperty(this.dynamicPrototype, '$Bgmessage', 'Error');
      defineNonEnumerableProperty(this.dynamicPrototype, '$BgtoString', this.prototype.toString);
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

  // TODO: Dummy XML until we port XML.
  export class ASXML extends ASObject {}

  export class ASDefinitionError extends ASError {
    static classInitializer: any = function() {
      defineNonEnumerableProperty(this, '$Bglength', 1);
      defineNonEnumerableProperty(this.dynamicPrototype, '$Bgname', this.name.substr(2));
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

  var builtinNativeClasses: Shumway.Map<ASClass> = Shumway.ObjectUtilities.createMap<ASClass>();

  export function initializeBuiltins() {
    builtinNativeClasses["Object"]              = ASObject;
    builtinNativeClasses["Class"]               = ASClass;
    builtinNativeClasses["Function"]            = ASFunction;
    builtinNativeClasses["Boolean"]             = ASBoolean;
    builtinNativeClasses["MethodClosure"]       = ASMethodClosure;
    builtinNativeClasses["Namespace"]           = ASNamespace;
    builtinNativeClasses["Number"]              = ASNumber;
    builtinNativeClasses["Int"]                 = ASInt;
    builtinNativeClasses["UInt"]                = ASUint;
    builtinNativeClasses["String"]              = ASString;
    builtinNativeClasses["Array"]               = ASArray;

    builtinNativeClasses["Vector$object"]       = GenericVector;
    builtinNativeClasses["Vector$int"]          = Int32Vector;
    builtinNativeClasses["Vector$uint"]         = Uint32Vector;
    builtinNativeClasses["Vector$double"]       = Float64Vector;

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
    builtinNativeClasses["IOError"]             = ASIOError;
    builtinNativeClasses["EOFError"]            = ASEOFError;
    builtinNativeClasses["MemoryError"]         = ASMemoryError;
    builtinNativeClasses["IllegalOperationError"] = ASIllegalOperationError;

    builtinNativeClasses["Dictionary"]          = flash.utils.Dictionary;
    builtinNativeClasses["ByteArray"]           = flash.utils.ByteArray;
  }

  export function getNativesForTrait(trait: TraitInfo): Object [] {
    var className = null;
    var natives: Object [];

    if (trait.holder instanceof InstanceInfo) {
      var instanceInfo = <InstanceInfo>trait.holder;
      className = instanceInfo.getName().name;
      var native = builtinNativeClasses[className];
      release || assert (native, "Class native is not defined: " + className);
      natives = [native.prototype];
      if (native.instanceNatives) {
        pushMany(natives, native.instanceNatives);
      }
    } else if (trait.holder instanceof ClassInfo) {
      var classInfo = <ClassInfo>trait.holder;
      className = classInfo.instanceInfo.getName().name;
      var native = builtinNativeClasses[className];
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
    var className = classInfo.instanceInfo.getName().name;
    var asClass = builtinNativeClasses[className];
    if (methodInfo.isNative()) {
      // Use TS constructor as the initializer function.
      return <any>asClass;
    }
    // TODO: Assert eagerly.
    return function () {
      release || assert (!methodInfo.isNative(), "Must supply a constructor for " + classInfo + ".");
    }
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
    var className = axClass.classInfo.instanceInfo.getName().name;
    var asClass = builtinNativeClasses[className];
    if (asClass) {
      linkClass(axClass, asClass);
    }
  }

  function linkClass(axClass: AXClass, asClass: ASClass) {
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

    if (asClass.classSymbols) {
      // link(self.classSymbols, self.classInfo.traits,  self);
    }

    if (asClass.instanceSymbols) {
      // link(self.instanceSymbols, self.classInfo.instanceInfo.traits,  self.tPrototype);
    }

    function filter(propertyName: string): boolean {
      if (propertyName.indexOf("native_") === 0) {
        return false;
      }
      return true;
    }

    // Copy class methods and properties.
    if (asClass.classNatives) {
      for (var i = 0; i < asClass.classNatives.length; i++) {
        copyOwnPropertyDescriptors(axClass, asClass.classNatives[i], filter);
      }
    }
    copyOwnPropertyDescriptors(axClass, asClass, filter);

    // Copy instance methods and properties.
    if (asClass.instanceNatives) {
      for (var i = 0; i < asClass.instanceNatives.length; i++) {
        copyOwnPropertyDescriptors(axClass.tPrototype, asClass.instanceNatives[i], filter);
      }
    }
    copyOwnPropertyDescriptors(axClass.tPrototype, asClass.prototype, filter);

    false && writer && traceASClass(axClass, asClass);
  }

  function traceASClass(axClass: AXClass, asClass: ASClass) {
    writer.enter("Class: " + axClass.classInfo);
    writer.enter("Traps:");
    for (var k in asClass.prototype) {
      if (k.indexOf("ax") !== 0) {
        continue;
      }
      var hasOwn = asClass.hasOwnProperty(k);
      writer.writeLn((hasOwn ? "Own" : "Inherited") + " trap: " + k);
    }
    writer.leave();
    writer.leave();
  }

  ///**
  //* This is all very magical, things are not what they seem, beware!!!
  //*
  //* The AS3 Class Hierarchy can be expressed as TypeScript, which is nice because
  //* we get all sorts of compile time error checking and default arguments support.
  //*
  //* TODO: TS default argument support is not semantically equivalent to AS3 which
  //* uses the arguments.length, TS uses typeof argument === "undefined", so beware.
  //*
  //* For the most part, you can cut and paste AS3 code into TypeScript and it will
  //* parse correctly.
  //*
  //* The prototype chain configured by TypeScript is not actually used, We only use
  //* Class definitions as a templates from which we construct real AS3 classes.
  //*
  //* Linking:
  //*
  //* AS -> TS
  //*
  //* Native AS3 members are linked against TS members. A verification step makes
  //* sure all native members are implemented.
  //*
  //* TS -> AS
  //*
  //* For this you need to provide TS type definitions and then specify which
  //* properties should be made available.
  //*
  //*/
  //
  //export enum InitializationFlags {
  //  NONE             = 0x0,
  //  OWN_INITIALIZE   = 0x1,
  //  SUPER_INITIALIZE = 0x2
  //}
  //
  ///**
  //* In order to avoid shadowing of JS top level Objects we prefix the AS top level
  //* classes with the "AS" prefix.
  //*/
  //
  //export class ASObject implements ITraits {
  //  public static traits: RuntimeTraits;
  //
  //  public static asSuperClass: typeof ASClass = null;
  //  public static classInfo: ClassInfo = null;
  //  public static instanceConstructor: any = Object;
  //  public static instanceConstructorNoInitialize: any = null;
  //
  //  public static initializer: any = null;
  //  public static defaultInitializerArgument: any;
  //  public static initializers: any = null;
  //  public static classInitializer: any = null;
  //
  //  public static callableConstructor: any = ASObject.instanceConstructor;
  //
  //  public static classBindings: ClassBindings;
  //  public static instanceBindings: InstanceBindings;
  //  public static interfaceBindings: InstanceBindings;
  //
  //  public static classSymbols: string [];
  //  public static instanceSymbols: string [];
  //
  //  public static tsClassSymbols: string [];
  //  public static tsInstanceSymbols: string [];
  //
  //  public static classNatives: any [];
  //  public static instanceNatives: any [];
  //  public static traitsPrototype: Object;
  //  public static dynamicPrototype: Object;
  //
  //  public static tPrototype: Object;
  //  public static dPrototype: Object;
  //  public static securityDomain: SecurityDomain;
  //
  //  public static typeScriptPrototype: Object;
  //  public static defaultValue: any = null;
  //  public static initializationFlags: InitializationFlags = InitializationFlags.NONE;
  //  public static native_prototype: Object;
  //  public static implementedInterfaces: Shumway.Map<ASClass>;
  //  public static isInterface: () => boolean;
  //  public static applyType: (type: ASClass) => ASClass;
  //  public static protocol: IProtocol;
  //
  //  static create(self: ASClass, asSuperClass: ASClass, instanceConstructor: any) {
  //    // ! The AS3 instanceConstructor is ignored.
  //    self.asSuperClass = asSuperClass;
  //    ASClass.create(self, asSuperClass, this.instanceConstructor);
  //  }
  //
  //  public static initializeFrom(value: any) {
  //    return ASClassPrototype.initializeFrom.call(this, value);
  //  }
  //
  //  public static coerce: (value: any) => any = asCoerceObject;
  //
  //  public static isInstanceOf: (value: any) => boolean;
  //  public static isType: (value: any) => boolean;
  //  public static isSubtypeOf: (value: ASClass) => boolean;
  //
  //  public static asCall(self: any, ...argArray: any[]): any {
  //    return this.callableConstructor.apply(self, argArray);
  //  }
  //
  //  public static asApply(self: any, argArray?: any): any {
  //    return this.callableConstructor.apply(self, argArray);
  //  }
  //
  //  public static verify() {
  //    ASClassPrototype.verify.call(this);
  //  }
  //
  //  public static trace(writer: IndentingWriter) {
  //    ASClassPrototype.trace.call(this, writer);
  //  }
  //
  //  public static getQualifiedClassName(): string {
  //    return ASClassPrototype.getQualifiedClassName.call(this);
  //  }
  //
  //  static _setPropertyIsEnumerable(o, V: string, enumerable: boolean = true): void {
  //    var name = Multiname.getPublicMangledName(V);
  //    var descriptor = getOwnPropertyDescriptor(o, name);
  //    descriptor.enumerable = !!enumerable;
  //    Object.defineProperty(o, name, descriptor);
  //  }
  //
  //  static _dontEnumPrototype(o: Object): void {
  //    for (var key in o) {
  //      if (Multiname.isPublicQualifiedName(key)) {
  //        var descriptor = getOwnPropertyDescriptor(o, key);
  //        descriptor.enumerable = false;
  //        Object.defineProperty(o, key, descriptor);
  //      }
  //    }
  //  }
  //
  //  static _init() {
  //    // Nop.
  //  }
  //
  //  // Hack to make the TypeScript compiler find the original Object.defineProperty.
  //  static defineProperty = Object.defineProperty;
  //
  //  static native_isPrototypeOf: (V: Object) => boolean;
  //  static native_hasOwnProperty: (V: string) => boolean;
  //  static native_propertyIsEnumerable: (V: string) => boolean;
  //  static setPropertyIsEnumerable: (V: string, enumerable: boolean) => boolean;
  //
  //  traits: RuntimeTraits = null;
  //  securityDomain: SecurityDomain;
  //
  //  native_isPrototypeOf(V: Object): boolean {
  //    notImplemented("isPrototypeOf");
  //    return false;
  //  }
  //
  //  native_hasOwnProperty(name: string): boolean {
  //    var self: Object = this;
  //    return self.asHasOwnProperty(null, name, 0);
  //  }
  //
  //  native_propertyIsEnumerable(name: string): boolean {
  //    var self: Object = this;
  //    return self.asPropertyIsEnumerable(null, name, 0);
  //  }
  //
  //  setPropertyIsEnumerable(name: string, enumerable: boolean) {
  //    ASObject._setPropertyIsEnumerable(this, name, enumerable);
  //  }
  //
  //  /**
  //   * This is the top level Object.prototype.toString() function.
  //   */
  //  toString(): string {
  //    var self: ASObject = boxValue(this);
  //    if (self instanceof ASClass) {
  //      var cls: ASClass = <any>self;
  //      // cls.classInfo.instanceInfo.getName().name
  //      return Shumway.StringUtilities.concat3("[class ", cls.classInfo.instanceInfo.getName().name, "]");
  //    }
  //    return Shumway.StringUtilities.concat3("[object ", self.class.classInfo.instanceInfo.name.name, "]");
  //  }
  //}
  //
  ///**
  // * Inherit from this if you don't want to inherit the default static properties from ASObject.
  // */
  //export class ASNative extends ASObject {
  //  public static asSuperClass: typeof ASClass = null;
  //  public static classInfo: ClassInfo = null;
  //  public static instanceConstructor: any = null;
  //  public static callableConstructor: any = null;
  //  public static classBindings: ClassBindings = null;
  //  public static instanceBindings: InstanceBindings = null;
  //  public static classNatives: any [] = null;
  //  public static instanceNatives: any [] = null;
  //  public static traitsPrototype: Object = null;
  //  public static dynamicPrototype: Object = null;
  //  public static defaultValue: any = null;
  //  public static initializationFlags: InitializationFlags = InitializationFlags.NONE;
  //}
  //
  ///**
  //* In AS3 all objects inherit from the Object class. Class objects themselves are instances
  //* of the Class class. In Shumway, Class instances can be constructed in two ways: dynamically,
  //* through the |new ASClass()| constructor function, or "statically" by inheriting the static
  //* properties from the ASObject class. Statically constructed functions get morphed into
  //* proper ASClass instances when they get constructed at runtime.
  //*
  //* We need to be really careful not to step on TS's inheritance scheme.
  //*/
  //export class ASClass extends ASObject {
  //  public static traits: RuntimeTraits;
  //  public static instanceConstructor: any = ASClass;
  //  public static classNatives: any [] = null;
  //  public static instanceNatives: any [] = null;
  //
  //  static link(asClass: ASClass, asSuperClass: ASClass, scope: Scope) {
  //    asClass.asSuperClass = asSuperClass;
  //    ASClass.configurePrototype(asClass);
  //
  //    // Attach traits.
  //    var classInfo = asClass.classInfo;
  //    var classClassInfo = classInfo.abc.applicationDomain.findClassInfo("Class");
  //    classClassInfo.instanceInfo.traits.resolve();
  //    classInfo.traits.resolve();
  //    var staticTraits = classClassInfo.instanceInfo.traits.concat(classInfo.traits);
  //
  //    applyTraits(asClass, staticTraits, scope);
  //
  //    classInfo.instanceInfo.traits.resolve();
  //    var instanceTraits = asSuperClass ? asSuperClass.classInfo.instanceInfo.runtimeTraits.concat(classInfo.instanceInfo.traits)
  //                                      : classInfo.instanceInfo.traits;
  //
  //    asClass.classInfo.instanceInfo.runtimeTraits = instanceTraits;
  //    applyTraits(<any>asClass.traitsPrototype, instanceTraits, scope);
  //  }
  //
  //  /**
  //   * Creates an object of this class but doesn't run the constructors, just the initializers.
  //   */
  //  public initializeFrom(value: any): any {
  //    var o = Object.create(this.traitsPrototype);
  //    ASClass.runInitializers(o, value);
  //    return o;
  //  }
  //
  //  /**
  //   * Calls the initializers of an object in order.
  //   */
  //  static runInitializers(self: Object, argument: any) {
  //    argument = argument || self.asClass.defaultInitializerArgument;
  //    var cls: ASClass = self.asClass;
  //    var initializers = cls.initializers;
  //    if (initializers) {
  //      for (var i = 0; i < initializers.length; i++) {
  //        initializers[i].call(self, argument);
  //      }
  //    }
  //  }
  //
  //  /**
  //   * Some AS3 classes have two parallel constructor chains:
  //   *
  //   * Consider the following inheritance hierarchy, (asSuperClass <- subClass)
  //   *
  //   * A  <- B  <- C  <- D
  //   *
  //   * X' is the Class X AS3 Constructor
  //   * X" is the Class X Native Constructor
  //   *
  //   * new D() first calls all the native constructors top down, and then
  //   * all the AS3 constructors bottom up. So, new D() calls:
  //   *
  //   * A", B", C", D", D', C', B', A'
  //   *
  //   * To implement this behaviour we maintain two constructors, |instanceConstructor|
  //   * and |instanceConstructorNoInitialize| as well as a list of native initializers
  //   * for each class, |initializers|. Classes that have at least one initializer need
  //   * their instanceConstructor to first call all the initializers and then recursively
  //   * go through all the super constructors.
  //   */
  //  static configureInitializers(self: ASClass) {
  //    if (self.asSuperClass && self.asSuperClass.initializers) {
  //      self.initializers = self.asSuperClass.initializers.slice(0);
  //    }
  //    if (self.initializer) {
  //      if (!self.initializers) {
  //        self.initializers = [];
  //      }
  //      self.initializers.push(self.initializer);
  //    }
  //
  //    if (self.initializers) {
  //      release || assert (self.instanceConstructorNoInitialize === self.instanceConstructor);
  //      var previousConstructor: any = self;
  //      self.instanceConstructor = <any>function () {
  //        ASClass.runInitializers(this, undefined);
  //        return self.instanceConstructorNoInitialize.apply(this, arguments);
  //      };
  //      self.instanceConstructor.prototype = self.traitsPrototype;
  //      defineNonEnumerableProperty(self.instanceConstructor.prototype, "class", self);
  //
  //      (<any>(self.instanceConstructor)).classInfo = previousConstructor.classInfo;
  //      self.instanceConstructor.__proto__ = previousConstructor;
  //    }
  //  }
  //
  //  /**
  //   * Runs the class initializer, if it has one.
  //   */
  //  static runClassInitializer(self: ASClass) {
  //    if (self.classInitializer) {
  //      self.classInitializer();
  //    }
  //  }
  //
  //  static linkSymbols(self: ASClass) {
  //    /**
  //     * Only returns true if the symbol is available in debug or release modes. Only symbols
  //     * followed by the  "!" suffix are available in release builds.
  //     */
  //    function containsSymbol(symbols: string [], name: string) {
  //      for (var i = 0; i < symbols.length; i++) {
  //        var symbol = symbols[i];
  //        if (symbol.indexOf(name) >= 0) {
  //          var releaseSymbol = symbol[symbol.length - 1] === "!";
  //          if (releaseSymbol) {
  //            symbol = symbol.slice(0, symbol.length - 1);
  //          }
  //          if (name !== symbol) {
  //            continue;
  //          }
  //          if (release) {
  //            return releaseSymbol;
  //          }
  //          return true;
  //        }
  //      }
  //      return false;
  //    }
  //
  //    function link(symbols, traits, object) {
  //      for (var i = 0; i < traits.length; i++) {
  //        var trait = traits[i];
  //        if (!containsSymbol(symbols, trait.name.name)) {
  //          continue;
  //        }
  //        release || assert (!trait.name.getNamespace().isPrivate(), "Why are you linking against private members?");
  //        if (trait.isConst()) {
  //          notImplemented("Don't link against const traits.");
  //          return;
  //        }
  //        var name = trait.name.name;
  //        var qn = Multiname.getMangledName(trait.name);
  //        if (trait.isSlot()) {
  //          Object.defineProperty(object, name, {
  //            get: <() => any>new Function("", "return this." + qn +
  //            "//# sourceURL=get-" + qn + ".as"),
  //            set: <(any) => void>new Function("v", "this." + qn + " = v;" +
  //            "//# sourceURL=set-" + qn + ".as")
  //          });
  //        } else if (trait.isMethod()) {
  //          release || assert (!object[name], "Symbol should not already exist.");
  //          release || assert (object.asOpenMethods[qn], "There should be an open method for this symbol.");
  //          object[name] = object.asOpenMethods[qn];
  //        } else if (trait.isGetter()) {
  //          release || assert (hasOwnGetter(object, qn), "There should be an getter method for this symbol.");
  //          Object.defineProperty(object, name, {
  //            get: <() => any>new Function("", "return this." + qn +
  //            "//# sourceURL=get-" + qn + ".as")
  //          });
  //        } else {
  //          notImplemented(trait);
  //        }
  //      }
  //    }
  //
  //    function copy(symbols, object) {
  //
  //    }
  //
  //    if (self.classSymbols) {
  //      link(self.classSymbols, self.classInfo.traits,  self);
  //    }
  //
  //    if (self.instanceSymbols) {
  //      link(self.instanceSymbols, self.classInfo.instanceInfo.traits,  self.traitsPrototype);
  //    }
  //
  //    if (self.tsClassSymbols) {
  //      copy(self.tsClassSymbols, self);
  //    }
  //
  //    if (self.tsInstanceSymbols) {
  //      copy(self.tsClassSymbols, self.traitsPrototype);
  //    }
  //  }
  //
  //  /**
  //   * Traits.
  //   */
  //  traits: RuntimeTraits;
  //
  //  /**
  //   * Class info.
  //   */
  //  classInfo: ClassInfo;
  //
  //  /**
  //   * Base class.
  //   */
  //  asSuperClass: ASClass;
  //
  //  /**
  //   * Constructs an instance of this class.
  //   */
  //  instanceConstructor: new (...args) => any;
  //
  //  /**
  //   * Constructs an instance of this class without calling the "native" initializer.
  //   */
  //  instanceConstructorNoInitialize: new (...args) => any;
  //
  //  /**
  //   * Native initializer. Classes that have these defined are constructed in a two phases. All
  //   * initializers along the inheritance chain are executed before any constructors are called.
  //   */
  //  initializer: (...args) => any;
  //
  //  /**
  //   * The default argument that gets passed to all initializers.
  //   */
  //  defaultInitializerArgument: any;
  //
  //  /**
  //   * Native class initializer.
  //   */
  //  classInitializer: (...args) => any;
  //
  //  /**
  //   * All native initializers
  //   */
  //  initializers: Array<(...args) => any>;
  //
  //  /**
  //   * Constructs an instance of this class.
  //   */
  //  callableConstructor: new (...args) => any;
  //
  //  /**
  //   * A list of objects to search for methods or accessors when linking static native traits.
  //   */
  //  classNatives: Object [];
  //
  //  /**
  //   * A list of objects to search for methods or accessors when linking instance native traits.
  //   */
  //  instanceNatives: Object [];
  //
  //  /**
  //   * Class bindings associated with this class.
  //   */
  //  classBindings: ClassBindings;
  //
  //  /**
  //   * Instance bindings associated with this class.
  //   */
  //  instanceBindings: InstanceBindings;
  //
  //  /**
  //   * List of additional class symbols to link in debug builds.
  //   */
  //  classSymbols: string [];
  //
  //  /**
  //   * List of additional instance symbols to link in debug builds.
  //   */
  //  instanceSymbols: string [];
  //
  //  /**
  //   * List of ts class symbols to link in debug builds.
  //   */
  //  tsClassSymbols: string [];
  //
  //  /**
  //   * List of ts instance symbols to link in debug builds.
  //   */
  //  tsInstanceSymbols: string [];
  //
  //  /**
  //   * Instance bindings associated with this interface.
  //   */
  //  interfaceBindings: InstanceBindings;
  //
  //  /**
  //   * Prototype object that holds all class instance traits. This is not usually accessible from
  //   * AS3 code directly. However, for some classes (native classes) the |traitsPrototype| ===
  //   * |dynamicPrototype|.
  //   */
  //  traitsPrototype: Object;
  //  tPrototype: Object;
  //
  //  /**
  //   * Prototype object accessible from AS3 script code. This is the AS3 Class prototype object
  //   * |class A { ... }, A.prototype|
  //   */
  //  dynamicPrototype: Object;
  //  dPrototype: Object;
  //
  //  /**
  //   * Original prototype object populated by TypeScript.
  //   */
  //  typeScriptPrototype: Object;
  //
  //  /**
  //   * Set of implemented interfaces.
  //   */
  //  implementedInterfaces: Shumway.Map<ASClass>;
  //
  //  defaultValue: any;
  //
  //  /**
  //   * Initialization flags that determine how native initializers get called.
  //   */
  //  initializationFlags: InitializationFlags;
  //
  //  /**
  //   * Defines the AS MetaObject Protocol, |null| if the default protocol should
  //   * be used. Override this to provide a different protocol.
  //   */
  //  protocol: IProtocol;
  //
  //  constructor(classInfo: ClassInfo) {
  //    false && super();
  //    this.classInfo = classInfo;
  //    this.classNatives = null;
  //    this.instanceNatives = null;
  //    this.initializationFlags = InitializationFlags.NONE;
  //    this.defaultValue = null;
  //  }
  //
  //  morphIntoASClass(classInfo: ClassInfo): void {
  //    release || assert (this.classInfo === classInfo);
  //    release || assert (this instanceof ASClass);
  //  }
  //
  //  get prototype(): Object {
  //    release || assert (this.dPrototype);
  //    return this.dPrototype;
  //  }
  //
  //  public asCall(self: any, cls: ASClass): any {
  //    return this.coerce(cls);
  //  }
  //
  //  public asApply(self: any, argArray?: any): any {
  //    return this.coerce(argArray[0])
  //  }
  //
  //  public applyType(type: ASClass): ASClass {
  //    debugger;
  //    return null;
  //  }
  //
  //  public isInstanceOf(value: any): boolean {
  //    // Nothing is an |instanceOf| interfaces.
  //    if (this.isInterface()) {
  //      return false;
  //    }
  //    return this.isType(value);
  //  }
  //
  //  /**
  //   * The isType check for classes looks for the |dynamicPrototype| on the prototype chain.
  //   */
  //  public isType(value: any): boolean {
  //    if (Shumway.isNullOrUndefined(value)) {
  //      return false;
  //    }
  //
  //    // We need to box primitive types before doing the |isPrototypeOf| test. In AS3, primitive
  //    // values are identical to their boxed representations: |0 === new Number(0)| is |true|.
  //    value = boxValue(value);
  //
  //    if (this.isInterface()) {
  //      if (value === null || typeof value !== "object") {
  //        return false;
  //      }
  //      release || assert(value.class.implementedInterfaces, "No 'implementedInterfaces' map found on class " + value.class);
  //      var qualifiedName = Multiname.getMangledName(this.classInfo.instanceInfo.name);
  //      return value.class.implementedInterfaces[qualifiedName] !== undefined;
  //    }
  //
  //    return this.dynamicPrototype.isPrototypeOf(value);
  //  }
  //
  //  /**
  //   * Checks if this class derives from the specified class.
  //   */
  //  public isSubtypeOf(value: ASClass) {
  //    var that = this;
  //    while (that) {
  //      if (that.traitsPrototype === value.traitsPrototype) {
  //        return true;
  //      }
  //      that = that.asSuperClass;
  //    }
  //    return false;
  //  }
  //
  //  public coerce(value: any): any {
  //    debug && console.log(Shumway.StringUtilities.concat4("Coercing ", value, " to ", this));
  //    return value;
  //  }
  //
  //  public isInterface(): boolean {
  //    return this.classInfo.instanceInfo.isInterface();
  //  }
  //
  //  public getQualifiedClassName(): string {
  //    var name = this.classInfo.instanceInfo.getName();
  //    var namespaceName = name.namespaces[0].name;
  //    if (namespaceName) {
  //      return namespaceName + "::" + name.name;
  //    }
  //    return name.name;
  //  }
  //
  //  /**
  //   * Checks the structural integrity of the class instance.
  //   */
  //  public verify() {
  //    var self: ASClass = this;
  //
  //    // Not much to check for interfaces.
  //    if (this.isInterface()) {
  //      return;
  //    }
  //
  //    // Verify that we have bindings for all native traits.
  //    writer && writer.enter("Verifying Class: " + self.classInfo + " {");
  //    var traits = [self.classInfo.traits, self.classInfo.instanceInfo.traits];
  //
  //    var classNatives: Object [] = [self, ASClass.prototype];
  //    if (self.classNatives) {
  //      pushMany(classNatives, self.classNatives);
  //    }
  //
  //    var instanceNatives: Object [] = [self.prototype];
  //    if (self.instanceNatives) {
  //      pushMany(instanceNatives, self.instanceNatives);
  //    }
  //
  //    if (self === <any>ASObject) {
  //      release || assert (!self.asSuperClass, "ASObject should have no base class.");
  //    } else {
  //      release || assert (self.asSuperClass, self.classInfo.instanceInfo.name + " has no base class.");
  //      release || assert (self.asSuperClass !== self);
  //    }
  //
  //    release || assert (self.traitsPrototype === self.instanceConstructor.prototype, "The traitsPrototype is not set correctly.");
  //
  //    if (self !== <any>ASObject) {
  //      if (ASObject.classNatives === self.classNatives) {
  //        writer && writer.warnLn("Template does not override its classNatives, possibly a bug.");
  //      }
  //      if (ASObject.instanceNatives === self.instanceNatives) {
  //        writer && writer.warnLn("Template does not override its instanceNatives, possibly a bug.");
  //      }
  //    }
  //
  //    function has(objects: Object [], predicate: (object: Object, name: string) => boolean, name) {
  //      for (var i = 0; i < objects.length; i++) {
  //        if (predicate(objects[i], name)) {
  //          return true;
  //        }
  //      }
  //      return false;
  //    }
  //
  //    for (var j = 0; j < traits.length; j++) {
  //      var isClassTrait = j === 0;
  //      for (var i = 0; i < traits[j].traits.length; i++) {
  //        var trait = traits[j].traits[i];
  //        var name = escapeNativeName(trait.getName().name);
  //        if (!(trait.isMethodOrAccessor() && (<MethodTraitInfo>trait).getMethodInfo().isNative())) {
  //          continue;
  //        }
  //        var holders = isClassTrait ? classNatives : instanceNatives;
  //        var hasDefinition = false;
  //        if (trait.isMethod()) {
  //          hasDefinition = has(holders, Shumway.ObjectUtilities.hasOwnProperty, name);
  //        } else if (trait.isGetter()) {
  //          hasDefinition = has(holders, Shumway.ObjectUtilities.hasOwnGetter, name);
  //        } else if (trait.isSetter()) {
  //          hasDefinition = has(holders, Shumway.ObjectUtilities.hasOwnSetter, name);
  //        }
  //        if (!hasDefinition) {
  //          writer && writer.warnLn("Template is missing an implementation of the native " + (isClassTrait ? "static" : "instance") + " trait: " + trait + " in class: " + self.classInfo);
  //        }
  //      }
  //    }
  //
  //    writer && writer.leave("}");
  //    // writer && this.trace(writer);
  //
  //    Debug.assert(self.instanceConstructor, "Must have a constructor function.");
  //  }
  //
  //  private static labelCounter = 0;
  //
  //  static labelObject(o) {
  //    if (!o) {
  //      return o;
  //    }
  //    if (!hasOwnProperty(o, "labelId")) {
  //      o.labelId = ASClass.labelCounter ++;
  //    }
  //    if (o instanceof Function) {
  //      return "Function [#" + (<any>o).labelId + "]";
  //    }
  //    return "Object [#" + o.labelId + "]";
  //  }
  //
  //  trace(writer: IndentingWriter) {
  //    if (this.isInterface()) {
  //      writer.enter("Interface: " + this.classInfo);
  //      this.interfaceBindings.trace(writer);
  //    } else {
  //      writer.enter("Class: " + this.classInfo);
  //      writer.writeLn("asSuperClass: " +
  //      (this.asSuperClass ? this.asSuperClass.classInfo.instanceInfo.name : null));
  //      this.classBindings.trace(writer);
  //      this.instanceBindings.trace(writer);
  //      writer.enter('Interfaces');
  //      for (var key in this.implementedInterfaces) {
  //        writer.writeLn(this.implementedInterfaces[key].classInfo.toString());
  //      }
  //      writer.leave();
  //    }
  //    writer.leave();
  //  }
  //}
  //
  //var ASClassPrototype = ASClass.prototype;
  //
  //export class ASFunction extends ASObject {
  //  constructor() {
  //    false && super();
  //    release || assertUnreachable('ASFunction references must be delegated to Function');
  //  }
  //
  //  static tsInstanceSymbols = ["prototype"];
  //
  //  private _prototype: AXObject;
  //
  //  get prototype(): AXObject {
  //    if (!this._prototype) {
  //      this._prototype = Object.create(this.securityDomain.AXObject.tPrototype);
  //    }
  //    return this._prototype;
  //  }
  //
  //  set prototype(prototype: AXObject) {
  //    assert (prototype, "What do we need to do if we pass null here?");
  //    this._prototype = prototype;
  //  }
  //
  //  get length(): number {
  //    assert (false, "Fix me.");
  //    return 0;
  //  }
  //
  //  toString() {
  //    return "function Function() {}";
  //  }
  //
  //  call(self, a, b, c) {
  //    var fn: AXFunction = <any>this;
  //    return fn.axApply(self, sliceArguments(arguments, 1));
  //  }
  //
  //  apply(self, args) {
  //    var fn: AXFunction = <any>this;
  //    return fn.axApply(self, args);
  //  }
  //}
  //
  //export class ASBoolean extends ASObject {
  //  public static instanceConstructor: any = Boolean;
  //  public static callableConstructor: any = ASBoolean.instanceConstructor;
  //  public static classBindings: ClassBindings;
  //  public static instanceBindings: InstanceBindings;
  //  public static classInfo: ClassInfo;
  //  public static classNatives: any [] = null;
  //  public static instanceNatives: any [] = null;
  //  public static coerce: (value: any) => boolean = asCoerceBoolean;
  //
  //  static classInitializer: any = function() {
  //    var proto: any = Boolean.prototype;
  //    defineNonEnumerableProperty(proto, '$BgtoString', proto.toString);
  //    defineNonEnumerableProperty(proto, '$BgvalueOf', proto.valueOf);
  //  };
  //
  //  constructor(input) {
  //    false && super();
  //    release || assertUnreachable('ASBoolean references must be delegated to Boolean');
  //  }
  //}
  //
  //ASBoolean.prototype.toString = Boolean.prototype.toString;
  //ASBoolean.prototype.valueOf = Boolean.prototype.valueOf;
  //
  //export class ASMethodClosure extends ASFunction {
  //  public static classNatives: any [] = null;
  //  public static instanceNatives: any [] = null;
  //  public static instanceConstructor: any = ASMethodClosure;
  //
  //  constructor(self, fn) {
  //    false && super();
  //    var bound = Shumway.FunctionUtilities.bindSafely(fn, self);
  //    defineNonEnumerableProperty(this, "call", bound.call.bind(bound));
  //    defineNonEnumerableProperty(this, "apply", bound.apply.bind(bound));
  //  }
  //
  //  toString() {
  //    return "function Function() {}";
  //  }
  //}
  //
  //export class ASNamespace extends ASNative {
  //  constructor() {
  //    false && super();
  //  }
  //
  //  get prefix(): string {
  //    return "FIXME";
  //  }
  //
  //  get uri(): string {
  //    return "FIXME";
  //  }
  //
  //  toString(): string {
  //    return "FIXME";
  //  }
  //
  //  valueOf(): any {
  //    return "FIXME";
  //  }
  //}
  //
  //export class ASNumber extends ASObject {
  //  public static instanceConstructor: any = Number;
  //  public static callableConstructor: any = ASNumber.instanceConstructor;
  //  public static classBindings: ClassBindings;
  //  public static instanceBindings: InstanceBindings;
  //  public static classInfo: ClassInfo;
  //  public static classNatives: any [] = [Math];
  //  public static instanceNatives: any [] = [Number.prototype];
  //  public static defaultValue: any = Number(0);
  //  public static coerce: (value: any) => number = asCoerceNumber;
  //
  //  static classInitializer: any = function() {
  //    var dynProto: any = this.dynamicPrototype;
  //    var numberProto: any = Number.prototype;
  //    defineNonEnumerableProperty(dynProto, 'toString', numberProto.toString);
  //    defineNonEnumerableProperty(dynProto, '$BgtoString', numberProto.toString);
  //    defineNonEnumerableProperty(dynProto, '$BgtoLocaleString', numberProto.toString);
  //    defineNonEnumerableProperty(dynProto, 'valueOf', numberProto.valueOf);
  //    defineNonEnumerableProperty(dynProto, '$BgvalueOf', numberProto.valueOf);
  //    defineNonEnumerableProperty(dynProto, '$BgtoExponential', numberProto.toExponential);
  //    defineNonEnumerableProperty(dynProto, '$BgtoPrecision', numberProto.toPrecision);
  //    defineNonEnumerableProperty(dynProto, '$BgtoFixed', numberProto.toFixed);
  //  };
  //
  //  static _numberToString(n: number, radix: number): string {
  //    radix = radix | 0;
  //    return Number(n).toString(radix);
  //  }
  //
  //  static _minValue(): number {
  //    return Number.MIN_VALUE;
  //  }
  //
  //  constructor(input) {
  //    false && super();
  //    release || assertUnreachable('ASString references must be delegated to Number');
  //  }
  //}
  //
  //export class ASInt extends ASObject {
  //  public static instanceConstructor: any = ASInt;
  //  public static callableConstructor: any = ASInt.instanceConstructor;
  //  public static classBindings: ClassBindings;
  //  public static instanceBindings: InstanceBindings;
  //  public static classInfo: ClassInfo;
  //  public static classNatives: any [] = [Math];
  //  public static instanceNatives: any [] = [Number.prototype];
  //  public static defaultValue: any = 0;
  //  public static coerce: (value: any) => number = asCoerceInt;
  //
  //  static classInitializer: any = ASNumber.classInitializer;
  //
  //  constructor(value: any) {
  //    false && super();
  //    return Object(Number(value | 0));
  //  }
  //
  //  public static asCall(self: any, arg0 /*, ...argArray: any[]*/): any {
  //    return arg0 | 0;
  //  }
  //
  //  public static asApply(self: any, argArray?: any): any {
  //    return argArray[0] | 0;
  //  }
  //
  //  /**
  //   * In AS3, |new int(42) instanceof int| is |false|.
  //   */
  //  public static isInstanceOf(value: any): boolean {
  //    return false;
  //  }
  //
  //  public static isType(value: any): boolean {
  //    if (isNumber(value) || value instanceof Number) {
  //      value = +value; // Make sure value is unboxed.
  //      return (value | 0) === value;
  //    }
  //    return false;
  //  }
  //}
  //
  //export class ASUint extends ASObject {
  //  public static instanceConstructor: any = ASUint;
  //  public static callableConstructor: any = ASUint.instanceConstructor;
  //  public static classBindings: ClassBindings;
  //  public static instanceBindings: InstanceBindings;
  //  public static classInfo: ClassInfo;
  //  public static classNatives: any [] = [Math];
  //  public static instanceNatives: any [] = [Number.prototype];
  //  public static defaultValue: any = 0;
  //  public static coerce: (value: any) => number = asCoerceUint;
  //
  //  static classInitializer: any = ASNumber.classInitializer;
  //
  //  constructor(value: any) {
  //    false && super();
  //    return Object(Number(value >>> 0));
  //  }
  //
  //  public static asCall(self: any, arg0 /*, ...argArray: any[]*/): any {
  //    return arg0 >>> 0;
  //  }
  //
  //  public static asApply(self: any, argArray?: any): any {
  //    return argArray[0] >>> 0;
  //  }
  //
  //  /**
  //   * In AS3, |new int(42) instanceof int| is |false|.
  //   */
  //  public static isInstanceOf(value: any): boolean {
  //    return false;
  //  }
  //
  //  public static isType(value: any): boolean {
  //    if (isNumber(value) || value instanceof Number) {
  //      value = +value; // Make sure value is unboxed.
  //      return (value >>> 0) === value;
  //    }
  //    return false;
  //  }
  //}
  //
  //export class ASString extends ASObject {
  //  value: string;
  //
  //  public static instanceConstructor: any = String;
  //  public static callableConstructor: any = ASString.instanceConstructor;
  //  public static classBindings: ClassBindings;
  //  public static instanceBindings: InstanceBindings;
  //  public static classInfo: ClassInfo;
  //  public static classNatives: any [] = [String];
  //  public static instanceNatives: any [] = [String.prototype];
  //  public static coerce: (value: any) => string = asCoerceString;
  //
  //  static classInitializer: any = function() {
  //    defineNonEnumerableProperty(String, '$BgfromCharCode', String.fromCharCode);
  //
  //    var proto: String = String.prototype;
  //    defineNonEnumerableProperty(proto, '$BgindexOf', proto.indexOf);
  //    defineNonEnumerableProperty(proto, '$BglastIndexOf', proto.lastIndexOf);
  //    defineNonEnumerableProperty(proto, '$BgcharAt', proto.charAt);
  //    defineNonEnumerableProperty(proto, '$BgcharCodeAt', proto.charCodeAt);
  //    defineNonEnumerableProperty(proto, '$Bgconcat', proto.concat);
  //    defineNonEnumerableProperty(proto, '$BglocaleCompare', proto.localeCompare);
  //    defineNonEnumerableProperty(proto, '$Bgmatch', proto.match);
  //    defineNonEnumerableProperty(proto, '$Bgreplace', proto.replace);
  //    defineNonEnumerableProperty(proto, '$Bgsearch', proto.search);
  //    defineNonEnumerableProperty(proto, '$Bgslice', proto.slice);
  //    defineNonEnumerableProperty(proto, '$Bgsplit', proto.split);
  //    defineNonEnumerableProperty(proto, '$Bgsubstring', proto.substring);
  //    defineNonEnumerableProperty(proto, '$Bgsubstr', proto.substr);
  //    defineNonEnumerableProperty(proto, '$BgtoLowerCase', proto.toLowerCase);
  //    defineNonEnumerableProperty(proto, '$BgtoLocaleLowerCase', proto.toLowerCase);
  //    defineNonEnumerableProperty(proto, '$BgtoUpperCase', proto.toUpperCase);
  //    defineNonEnumerableProperty(proto, '$BgtoLocaleUpperCase', proto.toUpperCase);
  //    defineNonEnumerableProperty(proto, '$BgtoString', proto.toString);
  //    defineNonEnumerableProperty(proto, '$BgvalueOf', proto.valueOf);
  //  }
  //
  //  get length(): number {
  //    return this.value.length;
  //  }
  //
  //  constructor(input) {
  //    false && super();
  //    release || assertUnreachable('ASString references must be delegated to String');
  //  }
  //
  //  match(re) {
  //    if (re === (void 0) || re === null) {
  //      return null;
  //    } else {
  //      if (re instanceof XRegExp && re.global) {
  //        var matches = [], m;
  //        while ((m = re.exec(this))) {
  //          matches.push(m[0]);
  //        }
  //        return matches;
  //      }
  //      if (!(re instanceof XRegExp) && !(typeof re === 'string')) {
  //        re = String(re);
  //      }
  //      return this.match(re);
  //    }
  //  }
  //
  //  search(re): number {
  //    if (re instanceof XRegExp) {
  //      return this.search(re);
  //    }
  //    return (<string><any>this).indexOf(asCoerceString(re));
  //  }
  //
  //  toUpperCase() {
  //    // avmshell bug compatibility
  //    var str = String.prototype.toUpperCase.apply(this);
  //    var str = str.replace(/\u039C/g, String.fromCharCode(181));
  //    return str;
  //  }
  //
  //  toLocaleUpperCase() {
  //    // avmshell bug compatibility
  //    var str = String.prototype.toLocaleUpperCase.apply(this);
  //    var str = str.replace(/\u039C/g, String.fromCharCode(181));
  //    return str;
  //  }
  //}
  //
  ///**
  //* Format: args: [compareFunction], [sortOptions]
  //*/
  //export function arraySort(o, args) {
  //  if (args.length === 0) {
  //    return o.sort();
  //  }
  //  var compareFunction, options = 0;
  //  if (args[0] instanceof Function) {
  //    compareFunction = args[0];
  //  } else if (isNumber(args[0])) {
  //    options = args[0];
  //  }
  //  if (isNumber(args[1])) {
  //    options = args[1];
  //  }
  //  o.sort(function (a, b) {
  //    return asCompare(a, b, options, compareFunction);
  //  });
  //  return o;
  //}
  //
  //function definePublicProperties(object: Object, names: string [], source: Object) {
  //  for (var i = 0; i < names.length; i++) {
  //    defineNonEnumerableProperty(object, Multiname.getPublicMangledName(names[i]), source[names[i]]);
  //  }
  //}
  //
  //export class ASArray extends ASObject {
  //  value: any [];
  //  public static instanceConstructor: any = Array;
  //
  //  static classInitializer: any = function() {
  //    definePublicProperties(Array.prototype, [
  //      "join", "toString", "pop", "push", "reverse", "concat", "slice", "shift",
  //      "unshift", "indexOf", "lastIndexOf", "forEach", "map", "filter", "some"
  //    ], Array.prototype);
  //
  //    definePublicProperties(Array.prototype, [
  //      "toLocaleString", "splice", "every", "sort", "sortOn"
  //    ], ASArray.prototype);
  //  };
  //
  //  constructor(input) {
  //    false && super();
  //    release || assertUnreachable('ASArray references must be delegated to Array');
  //  }
  //
  //  static CACHE_NUMERIC_COMPARATORS = true;
  //  static numericComparatorCache = Object.create(null);
  //
  //
  //  push() {
  //    return this.value.push.apply(this.value, arguments);
  //  }
  //  pop() {
  //    return this.value.pop();
  //  }
  //  shift() {
  //    return this.value.shift();
  //  }
  //  unshift() {
  //    return this.value.unshift.apply(this.value, arguments);
  //  }
  //  reverse() {
  //    this.value.reverse();
  //    return this;
  //  }
  //  concat() {
  //    var value = this.value.slice();
  //    for (var i = 0; i < arguments.length; i++) {
  //      var a = arguments[i];
  //      // Treat all objects with a `securityDomain` property and a value that's an Array as
  //      // concat-spreadable.
  //      // TODO: verify that this is correct.
  //      if (typeof a === 'object' && a && a.securityDomain && Array.isArray(a.value)) {
  //        value.push.apply(value, a.value);
  //      } else {
  //        value.push(a);
  //      }
  //    }
  //    return this.securityDomain.AXArray.axBox(value);
  //  }
  //  slice(startIndex: number, endIndex: number) {
  //    return this.securityDomain.AXArray.axBox(this.value.slice(startIndex, endIndex));
  //  }
  //  join(sep: string) {
  //    return this.value.join(sep);
  //  }
  //  toString() {
  //    return this.value.join(',');
  //  }
  //  indexOf(value: any, fromIndex: number) {
  //    return this.value.indexOf(value, fromIndex|0);
  //  }
  //  lastIndexOf(value: any, fromIndex: number) {
  //    return this.value.lastIndexOf(value, arguments.length > 1 ? fromIndex : 0x7fffffff);
  //  }
  //  every(callbackfn: {value: Function}, thisArg?) {
  //    var o = this.value;
  //    for (var i = 0; i < o.length; i++) {
  //      if (callbackfn.value.call(thisArg, o[i], i, o) !== true) {
  //        return false;
  //      }
  //    }
  //    return true;
  //  }
  //  some(callbackfn: {value}, thisArg?) {
  //    return this.value.some(callbackfn.value, thisArg);
  //  }
  //  forEach(callbackfn: {value}, thisArg?) {
  //    return this.value.forEach(callbackfn.value, thisArg);
  //  }
  //  map(callbackfn: {value}, thisArg?) {
  //    return this.securityDomain.AXArray.axBox(this.value.map(callbackfn.value, thisArg));
  //  }
  //  filter(callbackfn: {value: Function}, thisArg?) {
  //    var result = [];
  //    var o = this.value;
  //    for (var i = 0; i < o.length; i++) {
  //      if (callbackfn.value.call(thisArg, o[i], i, o) === true) {
  //        result.push(o[i]);
  //      }
  //    }
  //    return this.securityDomain.AXArray.axBox(result);
  //  }
  //
  //  toLocaleString(): string {
  //    var value = this.securityDomain.AXArray.axCoerce(this).value;
  //
  //    var out: string = "";
  //    for (var i = 0, n = value.length; i < n; i++) {
  //      var val = value[i];
  //      if (val !== null && val !== undefined) {
  //        out += val.toLocaleString();
  //      }
  //      if (i + 1 < n) {
  //        out += ",";
  //      }
  //    }
  //    return out;
  //  }
  //
  //  splice(): any[] {
  //    var o = this.value;
  //    if (arguments.length === 0) {
  //      return undefined;
  //    }
  //    return this.securityDomain.AXArray.axBox(o.splice.apply(o, arguments));
  //  }
  //
  //  sort(): any {
  //    var o = this.value;
  //    if (arguments.length === 0) {
  //      o.sort();
  //      return this;
  //    }
  //    var compareFunction;
  //    var options = 0;
  //    if (this.securityDomain.AXFunction.axIsInstanceOf(arguments[0])) {
  //      compareFunction = arguments[0].value;
  //    } else if (isNumber(arguments[0])) {
  //      options = arguments[0];
  //    }
  //    if (isNumber(arguments[1])) {
  //      options = arguments[1];
  //    }
  //    if (!options) {
  //      // Just passing compareFunction is ok because `undefined` is treated as not passed in JS.
  //      o.sort(compareFunction);
  //      return this;
  //    }
  //    if (!compareFunction) {
  //      compareFunction = axDefaultCompareFunction;
  //    }
  //    var sortOrder = options & SORT.DESCENDING ? -1 : 1;
  //    o.sort(function (a, b) {
  //      return axCompare(a, b, options, sortOrder, compareFunction);
  //    });
  //    return this;
  //  }
  //
  //  sortOn(names: any, options: any): any {
  //    if (arguments.length === 0) {
  //      throwError("ArgumentError", AVM2.Errors.WrongArgumentCountError,
  //                 "Array/http://adobe.com/AS3/2006/builtin::sortOn()", "1", "0");
  //    }
  //    // The following oddities in how the arguments are used are gleaned from Tamarin, so hush.
  //    var o = this.value;
  //    // The options we'll end up using.
  //    var optionsList: number[] = [];
  //    if (isString(names)) {
  //      names = [Multiname.getPublicMangledName(names)];
  //      // If the name is a string, coerce `options` to int.
  //      optionsList = [options | 0];
  //    } else if (names && Array.isArray(names.value)) {
  //      names = names.value;
  //      for (var i = 0; i < names.length; i++) {
  //        names[i] = Multiname.getPublicMangledName(names[i]);
  //      }
  //      if (options && Array.isArray(options.value)) {
  //        options = options.value;
  //        // Use the options Array only if it's the same length as names.
  //        if (options.length === names.length) {
  //          for (var i = 0; i < options.length; i++) {
  //            optionsList[i] = options[i] | 0;
  //          }
  //          // Otherwise, use 0 for all options.
  //        } else {
  //          for (var i = 0; i < names.length; i++) {
  //            optionsList[i] = 0;
  //          }
  //        }
  //      } else {
  //        var optionsVal = options | 0;
  //        for (var i = 0; i < names.length; i++) {
  //          optionsList[i] = optionsVal;
  //        }
  //      }
  //    } else {
  //      // Not supplying either a String or an Array means nothing is sorted on.
  //      return this;
  //    }
  //    release || assert(optionsList.length === names.length);
  //    // For use with uniqueSort and returnIndexedArray once we support them.
  //    var optionsVal: number = optionsList[0];
  //    release || Shumway.Debug.assertNotImplemented(!(optionsVal & SORT.UNIQUESORT), "UNIQUESORT");
  //    release || Shumway.Debug.assertNotImplemented(!(optionsVal & SORT.RETURNINDEXEDARRAY),
  //                                                  "RETURNINDEXEDARRAY");
  //
  //    o.sort((a, b) => axCompareFields(a, b, names, optionsList));
  //    return this;
  //  }
  //
  //  get length(): number {
  //    return this.value.length;
  //  }
  //
  //  set length(newLength: number) {
  //    this.value.length = newLength >>> 0;
  //  }
  //}
  //
  ////export class ASVector<T> extends ASNative {
  ////  public static classNatives: any [] = null;
  ////  public static instanceNatives: any [] = null;
  ////  public static instanceConstructor: any = ASVector;
  ////  public static callableConstructor: any = null;
  ////  newThisType(): ASVector<T> {
  ////    return new this.class.instanceConstructor();
  ////  }
  ////}
  ////
  ////export class ASJSON extends ASObject {
  ////  public static instanceConstructor: any = ASJSON;
  ////  public static classNatives: any [] = null;
  ////  public static instanceNatives: any [] = null;
  ////
  ////  /**
  ////   * Transforms a JS value into an AS value.
  ////   */
  ////  static transformJSValueToAS(value, deep: boolean) {
  ////    if (typeof value !== "object") {
  ////      return value;
  ////    }
  ////    if (isNullOrUndefined(value)) {
  ////      return value;
  ////    }
  ////    var keys = Object.keys(value);
  ////    var result = Array.isArray(value) ? [] : {};
  ////    for (var i = 0; i < keys.length; i++) {
  ////      var v = value[keys[i]];
  ////      if (deep) {
  ////        v = ASJSON.transformJSValueToAS(v, true);
  ////      }
  ////      result.asSetPublicProperty(keys[i], v);
  ////    }
  ////    return result;
  ////  }
  ////
  ////  /**
  ////   * Transforms an AS value into a JS value.
  ////   */
  ////  static transformASValueToJS(value, deep: boolean) {
  ////    if (typeof value !== "object") {
  ////      return value;
  ////    }
  ////    if (isNullOrUndefined(value)) {
  ////      return value;
  ////    }
  ////    var keys = Object.keys(value);
  ////    var result = Array.isArray(value) ? [] : {};
  ////    for (var i = 0; i < keys.length; i++) {
  ////      var key = keys[i];
  ////      var jsKey = key;
  ////      if (!isNumeric(key)) {
  ////        jsKey = Multiname.getNameFromPublicQualifiedName(key);
  ////      }
  ////      var v = value[key];
  ////      if (deep) {
  ////        v = ASJSON.transformASValueToJS(v, true);
  ////      }
  ////      result[jsKey] = v;
  ////    }
  ////    return result;
  ////  }
  ////
  ////  private static parseCore(text: string): Object {
  ////    text = asCoerceString(text);
  ////    return ASJSON.transformJSValueToAS(JSON.parse(text), true)
  ////  }
  ////
  ////  private static stringifySpecializedToString(value: Object, replacerArray: any [], replacerFunction: (key: string, value: any) => any, gap: string): string {
  ////    return JSON.stringify(ASJSON.transformASValueToJS(value, true), replacerFunction, gap);
  ////  }
  ////}
  ////
  ////export class ASError extends ASNative {
  ////  public static instanceConstructor: any = null;
  ////  public static classNatives: any [] = null;
  ////  public static instanceNatives: any [] = null;
  ////
  ////  public static getErrorMessage = Shumway.AVM2.getErrorMessage;
  ////  public static throwError(type: typeof ASError, id: number /*, ...rest */) {
  ////    var info = getErrorInfo(id);
  ////
  ////    var args = [info];
  ////    for (var i = 2; i < arguments.length; i++) {
  ////      args.push(arguments[i]);
  ////    }
  ////    var message = formatErrorMessage.apply(null, args);
  ////    throw new type(message, id);
  ////  }
  ////
  ////
  ////  static classInitializer: any = function() {
  ////    defineNonEnumerableProperty(this, '$Bglength', 1);
  //// defineNonEnumerableProperty(this.dynamicPrototype, '$Bgname', 'Error');
  //// defineNonEnumerableProperty(this.dynamicPrototype, '$Bgmessage', 'Error');
  ////    defineNonEnumerableProperty(this.dynamicPrototype, '$BgtoString', this.prototype.toString);
  ////  }
  ////
  ////  constructor(msg: any, id: any) {
  ////    false && super();
  ////    this.message = asCoerceString(msg);
  ////    this._errorID = id|0;
  ////    // This is gnarly but saves us from having individual ctors in all Error child classes.
  ////    this.name = (<ASClass><any>this.constructor).dynamicPrototype['$Bgname'];
  ////  }
  ////
  ////  message: string;
  ////  name: string;
  ////  _errorID: number;
  ////
  ////  toString() {
  ////    return this.message !== "" ? this.name + ": " + this.message : this.name;
  ////  }
  ////
  ////  get errorID() {
  ////    return this._errorID;
  ////  }
  ////
  ////  public getStackTrace(): string {
  ////    // Stack traces are only available in debug builds. We only do opt.
  ////    return null;
  ////  }
  ////}
  ////
  ////export class ASDefinitionError extends ASError {
  ////  static classInitializer: any = function() {
  ////    defineNonEnumerableProperty(this, '$Bglength', 1);
  ////    defineNonEnumerableProperty(this.dynamicPrototype, '$Bgname', this.name.substr(2));
  ////  }
  ////}
  ////export class ASEvalError extends ASError {
  ////  static classInitializer: any = ASDefinitionError.classInitializer;
  ////}
  ////export class ASRangeError extends ASError {
  ////  static classInitializer: any = ASDefinitionError.classInitializer;
  ////}
  ////export class ASReferenceError extends ASError {
  ////  static classInitializer: any = ASDefinitionError.classInitializer;
  ////}
  ////export class ASSecurityError extends ASError {
  ////  static classInitializer: any = ASDefinitionError.classInitializer;
  ////}
  ////export class ASSyntaxError extends ASError {
  ////  static classInitializer: any = ASDefinitionError.classInitializer;
  ////}
  ////export class ASTypeError extends ASError {
  ////  static classInitializer: any = ASDefinitionError.classInitializer;
  ////}
  ////export class ASURIError extends ASError {
  ////  static classInitializer: any = ASDefinitionError.classInitializer;
  ////}
  ////export class ASVerifyError extends ASError {
  ////  static classInitializer: any = ASDefinitionError.classInitializer;
  ////}
  ////export class ASUninitializedError extends ASError {
  ////  static classInitializer: any = ASDefinitionError.classInitializer;
  ////}
  ////export class ASArgumentError extends ASError {
  ////  static classInitializer: any = ASDefinitionError.classInitializer;
  ////}
  ////
  ////export class ASIOError extends ASError {
  ////  static classInitializer: any = ASDefinitionError.classInitializer;
  ////}
  ////export class ASEOFError extends ASError {
  ////  static classInitializer: any = ASDefinitionError.classInitializer;
  ////}
  ////export class ASMemoryError extends ASError {
  ////  static classInitializer: any = ASDefinitionError.classInitializer;
  ////}
  ////export class ASIllegalOperationError extends ASError {
  ////  static classInitializer: any = ASDefinitionError.classInitializer;
  ////}
  ////
  ////export class ASRegExp extends ASObject {
  ////  public static instanceConstructor: any = XRegExp;
  ////  public static classNatives: any [] = [XRegExp];
  ////  public static instanceNatives: any [] = [XRegExp.prototype];
  ////
  ////  static classInitializer: any = function() {
  ////    var proto = XRegExp.prototype;
  ////    defineNonEnumerableProperty(proto, '$BgtoString', ASRegExp.prototype.ecmaToString);
  ////    defineNonEnumerableProperty(proto, '$Bgexec', proto.exec);
  ////    defineNonEnumerableProperty(proto, '$Bgtest', proto.test);
  ////  }
  ////
  ////  constructor(input) {
  ////    false && super();
  ////    release || assertUnreachable('ASRegExp references must be delegated to XRegExp.');
  ////  }
  ////
  ////  ecmaToString() {
  ////    var r: any = this;
  ////    var out = "/" + r.source + "/";
  ////    if (r.global)       out += "g";
  ////    if (r.ignoreCase)   out += "i";
  ////    if (r.multiline)    out += "m";
  ////    if (r.dotall)       out += "s";
  ////    if (r.extended)     out += "x";
  ////    return out;
  ////  }
  ////
  ////  get native_source(): string {
  ////    var self: any = this;
  ////    return self.source;
  ////  }
  ////
  ////  get native_global(): boolean {
  ////    var self: any = this;
  ////    return self.global;
  ////  }
  ////
  ////  get native_ignoreCase(): boolean {
  ////    var self: any = this;
  ////    return self.ignoreCase;
  ////  }
  ////
  ////  get native_multiline(): boolean {
  ////    var self: any = this;
  ////    return self.multiline;
  ////  }
  ////
  ////  get native_lastIndex(): number /*int*/ {
  ////    var self: any = this;
  ////    return self.lastIndex;
  ////  }
  ////
  ////  set native_lastIndex(i: number /*int*/) {
  ////    var self: any = this;
  ////    i = i | 0;
  ////    self.lastIndex = i;
  ////  }
  ////
  ////  get native_dotall(): boolean {
  ////    var self: any = this;
  ////    return self.dotall;
  ////  }
  ////
  ////  get native_extended(): boolean {
  ////    var self: any = this;
  ////    return self.extended;
  ////  }
  ////
  ////  exec(s: string = ""): any {
  ////    var result = RegExp.prototype.exec.apply(this, arguments);
  ////    if (!result) {
  ////      return result;
  ////    }
  ////    // For some reason named groups in AS3 are set to the empty string instead of
  ////    // undefined as is the case for indexed groups. Here we just emulate the AS3
  ////    // behaviour.
  ////    var keys = Object.keys(result);
  ////    for (var i = 0; i < keys.length; i++) {
  ////      var k = keys[i];
  ////      if (!isNumeric(k)) {
  ////        if (result[k] === undefined) {
  ////          result[k] = "";
  ////        }
  ////      }
  ////    }
  ////    Shumway.AVM2.Runtime.publicizeProperties(result);
  ////    return result;
  ////  }
  ////
  ////  test(s: string = ""): boolean {
  ////    return this.exec(s) !== null;
  ////  }
  ////}
  ////
  ////export class ASMath extends ASNative {
  ////  public static classNatives: any [] = [Math];
  ////}
  ////
  ////export class ASDate extends ASNative {
  ////  public static classNatives: any [] = [Date];
  ////  public static instanceNatives: any [] = [Date.prototype];
  ////  public static instanceConstructor: any = Date;
  ////
  ////  static classInitializer: any = function() {
  ////    var proto: any = Date.prototype;
  ////    defineNonEnumerableProperty(proto, '$BgtoString', proto.toString);
  ////    defineNonEnumerableProperty(proto, '$BgvalueOf', proto.valueOf);
  ////
  ////    defineNonEnumerableProperty(proto, '$BgtoDateString', proto.toDateString);
  ////    defineNonEnumerableProperty(proto, '$BgtoTimeString', proto.toTimeString);
  ////    defineNonEnumerableProperty(proto, '$BgtoLocaleString', proto.toLocaleString);
  ////    defineNonEnumerableProperty(proto, '$BgtoLocaleDateString', proto.toLocaleDateString);
  ////    defineNonEnumerableProperty(proto, '$BgtoLocaleTimeString', proto.toLocaleTimeString);
  ////    defineNonEnumerableProperty(proto, '$BgtoUTCString', proto.toUTCString);
  ////
  ////    // NB: The default AS implementation of |toJSON| is not ES5-compliant, but
  ////    // the native JS one obviously is.
  ////    defineNonEnumerableProperty(proto, '$BgtoJSON', proto.toJSON);
  ////
  ////    defineNonEnumerableProperty(proto, '$BggetUTCFullYear', proto.getUTCFullYear);
  ////    defineNonEnumerableProperty(proto, '$BggetUTCMonth', proto.getUTCMonth);
  ////    defineNonEnumerableProperty(proto, '$BggetUTCDate', proto.getUTCDate);
  ////    defineNonEnumerableProperty(proto, '$BggetUTCDay', proto.getUTCDay);
  ////    defineNonEnumerableProperty(proto, '$BggetUTCHours', proto.getUTCHours);
  ////    defineNonEnumerableProperty(proto, '$BggetUTCMinutes', proto.getUTCMinutes);
  ////    defineNonEnumerableProperty(proto, '$BggetUTCSeconds', proto.getUTCSeconds);
  ////    defineNonEnumerableProperty(proto, '$BggetUTCMilliseconds', proto.getUTCMilliseconds);
  ////    defineNonEnumerableProperty(proto, '$BggetFullYear', proto.getFullYear);
  ////    defineNonEnumerableProperty(proto, '$BggetMonth', proto.getMonth);
  ////    defineNonEnumerableProperty(proto, '$BggetDate', proto.getDate);
  ////    defineNonEnumerableProperty(proto, '$BggetDay', proto.getDay);
  ////    defineNonEnumerableProperty(proto, '$BggetHours', proto.getHours);
  ////    defineNonEnumerableProperty(proto, '$BggetMinutes', proto.getMinutes);
  ////    defineNonEnumerableProperty(proto, '$BggetSeconds', proto.getSeconds);
  ////    defineNonEnumerableProperty(proto, '$BggetMilliseconds', proto.getMilliseconds);
  ////    defineNonEnumerableProperty(proto, '$BggetTimezoneOffset', proto.getTimezoneOffset);
  ////    defineNonEnumerableProperty(proto, '$BggetTime', proto.getTime);
  ////    defineNonEnumerableProperty(proto, '$BgsetFullYear', proto.setFullYear);
  ////    defineNonEnumerableProperty(proto, '$BgsetMonth', proto.setMonth);
  ////    defineNonEnumerableProperty(proto, '$BgsetDate', proto.setDate);
  ////    defineNonEnumerableProperty(proto, '$BgsetHours', proto.setHours);
  ////    defineNonEnumerableProperty(proto, '$BgsetMinutes', proto.setMinutes);
  ////    defineNonEnumerableProperty(proto, '$BgsetSeconds', proto.setSeconds);
  ////    defineNonEnumerableProperty(proto, '$BgsetMilliseconds', proto.setMilliseconds);
  ////    defineNonEnumerableProperty(proto, '$BgsetUTCFullYear', proto.setUTCFullYear);
  ////    defineNonEnumerableProperty(proto, '$BgsetUTCMonth', proto.setUTCMonth);
  ////    defineNonEnumerableProperty(proto, '$BgsetUTCDate', proto.setUTCDate);
  ////    defineNonEnumerableProperty(proto, '$BgsetUTCHours', proto.setUTCHours);
  ////    defineNonEnumerableProperty(proto, '$BgsetUTCMinutes', proto.setUTCMinutes);
  ////    defineNonEnumerableProperty(proto, '$BgsetUTCSeconds', proto.setUTCSeconds);
  ////    defineNonEnumerableProperty(proto, '$BgsetUTCMilliseconds', proto.setUTCMilliseconds);
  ////  }
  ////
  ////  constructor(input) {
  ////    false && super();
  ////    release || assertUnreachable('ASDate references must be delegated to Date');
  ////  }
  ////}
  //
  //var builtinNativeClasses: Shumway.Map<ASClass> = Shumway.ObjectUtilities.createMap<ASClass>();
  //
  //function initializeBuiltins() {
  //  builtinNativeClasses["Object"]              = ASObject;
  //  builtinNativeClasses["Class"]               = ASClass;
  //  builtinNativeClasses["Function"]            = ASFunction;
  //  builtinNativeClasses["Boolean"]             = ASBoolean;
  //  builtinNativeClasses["MethodClosure"]       = ASMethodClosure;
  //  builtinNativeClasses["Namespace"]           = ASNamespace;
  //  builtinNativeClasses["Number"]              = ASNumber;
  //  builtinNativeClasses["Int"]                 = ASInt;
  //  builtinNativeClasses["UInt"]                = ASUint;
  //  builtinNativeClasses["String"]              = ASString;
  //  builtinNativeClasses["Array"]               = ASArray;
  //  //builtinNativeClasses["VectorClass"]              = ASVector;
  //  // builtinNativeClasses["Vector$object"]       = GenericVector;
  //  //builtinNativeClasses["IntVectorClass"]           = AS.Int32Vector;
  //  //builtinNativeClasses["UIntVectorClass"]          = AS.Uint32Vector;
  //  //builtinNativeClasses["DoubleVectorClass"]        = AS.Float64Vector;
  //  //builtinNativeClasses["JSONClass"]                = ASJSON;
  //  //builtinNativeClasses["XMLClass"]                 = ASXML;
  //  //builtinNativeClasses["XMLListClass"]             = ASXMLList;
  //  //builtinNativeClasses["QNameClass"]               = ASQName;
  //  //
  //  //// Errors
  //  //builtinNativeClasses["ErrorClass"]               = ASError;
  //  //builtinNativeClasses["DefinitionErrorClass"]     = ASDefinitionError;
  //  //builtinNativeClasses["EvalErrorClass"]           = ASEvalError;
  //  //builtinNativeClasses["RangeErrorClass"]          = ASRangeError;
  //  //builtinNativeClasses["ReferenceErrorClass"]      = ASReferenceError;
  //  //builtinNativeClasses["SecurityErrorClass"]       = ASSecurityError;
  //  //builtinNativeClasses["SyntaxErrorClass"]         = ASSyntaxError;
  //  //builtinNativeClasses["TypeErrorClass"]           = ASTypeError;
  //  //builtinNativeClasses["URIErrorClass"]            = ASURIError;
  //  //builtinNativeClasses["VerifyErrorClass"]         = ASVerifyError;
  //  //builtinNativeClasses["UninitializedErrorClass"]  = ASUninitializedError;
  //  //builtinNativeClasses["ArgumentErrorClass"]       = ASArgumentError;
  //  //builtinNativeClasses["IOErrorClass"]             = ASIOError;
  //  //builtinNativeClasses["EOFErrorClass"]            = ASEOFError;
  //  //builtinNativeClasses["MemoryErrorClass"]         = ASMemoryError;
  //  //builtinNativeClasses["IllegalOperationErrorClass"] = ASIllegalOperationError;
  //  //
  //  //builtinNativeClasses["DateClass"]                = ASDate;
  //  //builtinNativeClasses["MathClass"]                = ASMath;
  //  //
  //  //builtinNativeClasses["RegExpClass"]              = ASRegExp;
  //  //
  //  ///**
  //  // * If the Linker links against flash.* classes then we end up in a cycle. A reference to
  //  // * |flash.utils.ByteArray| for instance would cause us to initialize the |ByteArray| class,
  //  // * when we're not fully initialized ourselves. To get around this we make sure we don't refer
  //  // * to possibly linked classes by prefixing their names with "Original".
  //  // */
  //  //
  //  //// flash.utils
  //  //builtinNativeClasses["ProxyClass"]               = flash.utils.OriginalProxy;
  //  //builtinNativeClasses["DictionaryClass"]          = flash.utils.OriginalDictionary;
  //  //builtinNativeClasses["ByteArrayClass"]           = flash.utils.OriginalByteArray;
  //  //// flash.system
  //  //builtinNativeClasses["SystemClass"]              = flash.system.OriginalSystem;
  //}
  //
  //initializeBuiltins();
  //
  //var nativeClasses: Shumway.Map<ASClass> = Shumway.ObjectUtilities.createMap<ASClass>();
  //var nativeFunctions: Shumway.Map<Function> = Shumway.ObjectUtilities.createMap<Function>();
  //
  //
  //export function createClass(classInfo: ClassInfo, asSuperClass: ASClass, scope: Scope): ASClass {
  //  console.log("creatClass: " + classInfo.instanceInfo.getName().name);
  //  var asClass = new ASClass(classInfo);
  //  ASClass.link(asClass, asSuperClass, scope);
  //  return asClass;
  //}
  //
  //export  function getNativesForTrait(trait: TraitInfo): Object [] {
  //  var className = null;
  //  var natives: Object [];
  //
  //  if (trait.holder instanceof InstanceInfo) {
  //    var instanceInfo = <InstanceInfo>trait.holder;
  //    className = instanceInfo.getName().name;
  //    var native = builtinNativeClasses[className];
  //    natives = [native.prototype];
  //    if (native.instanceNatives) {
  //      pushMany(natives, native.instanceNatives);
  //    }
  //  } else if (trait.holder instanceof ClassInfo) {
  //    var classInfo = <ClassInfo>trait.holder;
  //    className = classInfo.instanceInfo.getName().name;
  //    var native = builtinNativeClasses[className];
  //    natives = [native, ASClass.prototype];
  //    if (native.classNatives) {
  //      pushMany(natives, native.classNatives);
  //    }
  //  }
  //  return natives;
  //}
  //
  ///**
  // * Searches for a native property in a list of native holders.
  // */
  //export function getMethodOrAccessorNative(trait: TraitInfo): any {
  //  var natives = getNativesForTrait(trait);
  //  var name = escapeNativeName(trait.getName().name);
  //  debug && console.log("getMethodOrAccessorNative(" + name + ")");
  //  for (var i = 0; i < natives.length; i++) {
  //    var native = natives[i];
  //    var fullName = name;
  //    if (hasOwnProperty(native, fullName)) {
  //      var value;
  //      if (trait.isAccessor()) {
  //        var pd = getOwnPropertyDescriptor(native, fullName);
  //        if (trait.isGetter()) {
  //          value = pd.get;
  //        } else {
  //          value = pd.set;
  //        }
  //      } else {
  //        release || assert (trait.isMethod());
  //        value = native[fullName];
  //      }
  //      release || assert (value, "Method or Accessor property exists but it's undefined: " + trait.holder + " " + trait);
  //      return value;
  //    }
  //  }
  //  Shumway.Debug.warning("No native method for: " + trait.holder + " " + trait + ", make sure you've got the static keyword for static methods.");
  //  release || assertUnreachable("Cannot find " + trait + " in natives.");
  //  return null;
  //}
  //
  //
  ///**
  //* Other natives can live in this module
  //*/
  //export module Natives {
  //  // Expose Some Builtin Objects
  //  export var String = jsGlobal.String;
  //  export var Function = jsGlobal.Function;
  //  export var Boolean = jsGlobal.Boolean;
  //  export var Number = jsGlobal.Number;
  //  export var Date = jsGlobal.Date;
  //  export var ASObject = AS.ASObject;
  //  export var ASFunction = AS.ASFunction;
  //
  //  export function print(expression: any, arg1?: any, arg2?: any, arg3?: any, arg4?: any) {
  //    jsGlobal.print.apply(null, arguments);
  //  }
  //
  //  export function debugBreak(v: any) {
  //    debugger;
  //  }
  //
  //  export function bugzilla(n) {
  //    switch (n) {
  //      case 574600: // AS3 Vector::map Bug
  //        return true;
  //    }
  //    return false;
  //  }
  //
  //  export var decodeURI: (encodedURI: string) => string = jsGlobal.decodeURI;
  //  export var decodeURIComponent: (encodedURIComponent: string) =>  string = jsGlobal.decodeURIComponent;
  //  export var encodeURI: (uri: string) => string = jsGlobal.encodeURI;
  //  export var encodeURIComponent: (uriComponent: string) => string = jsGlobal.encodeURIComponent;
  //  export var isNaN: (number: number) => boolean = jsGlobal.isNaN;
  //  export var isFinite: (number: number) => boolean = jsGlobal.isFinite;
  //  export var parseInt: (s: string, radix?: number) => number = jsGlobal.parseInt;
  //  export var parseFloat: (string: string) => number = jsGlobal.parseFloat;
  //  export var escape: (x: any) => any = jsGlobal.escape;
  //  export var unescape: (x: any) => any = jsGlobal.unescape;
  //  export var isXMLName: (x: any) => boolean = function () {
  //    return false; // "FIX ME";
  //  };
  //  export var notImplemented: (x: any) => void = Shumway.Debug.notImplemented;
  //}
  //
  ///**
  // * Searches for natives using a string path "a.b.c...".
  // */
  //export function getNative(path: string): Function {
  //  debug && console.log("getNative(\"" + path + "\")");
  //  var chain = path.split(".");
  //  var v = Natives;
  //  for (var i = 0, j = chain.length; i < j; i++) {
  //    v = v && v[chain[i]];
  //  }
  //
  //  if (!v) {
  //    v = <any>nativeFunctions[path];
  //  }
  //
  //  release || assert(v, "getNative(" + path + ") not found.");
  //  return <any>v;
  //}
}
