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

module Shumway.AVMX.AS {
  import assert = Shumway.Debug.assert;
  import assertNotImplemented = Shumway.Debug.assertNotImplemented;
  import notImplemented = Shumway.Debug.notImplemented;
  import defineNonEnumerableProperty = Shumway.ObjectUtilities.defineNonEnumerableProperty;
  import clamp = Shumway.NumberUtilities.clamp;

  export class BaseVector extends ASObject {
    axGetProperty(mn: Multiname): any {
      var nm = mn.name;
      nm = typeof nm === 'number' ? nm : axCoerceName(nm);
      if ((<any>nm | 0) === nm || isNumeric(nm)) {
        release || assert(mn.isRuntimeName());
        return this.axGetNumericProperty(typeof nm === 'number' ? nm : nm | 0);
      }
      return super.axGetProperty(mn);
    }

    axSetProperty(mn: Multiname, value: any, bc: Bytecode) {
      release || checkValue(value);
      var nm = mn.name;
      nm = typeof nm === 'number' ? nm : axCoerceName(nm);
      if ((<any>nm | 0) === nm || isNumeric(nm)) {
        release || assert(mn.isRuntimeName());
        this.axSetNumericProperty(typeof nm === 'number' ? nm : nm | 0, value);
        return;
      }
      super.axSetProperty(mn, value, bc);
    }

    axGetPublicProperty(nm: any): any {
      nm = typeof nm === 'number' ? nm : axCoerceName(nm);
      if ((<any>nm | 0) === nm || isNumeric(nm)) {
        return this.axGetNumericProperty(typeof nm === 'number' ? nm : nm | 0);
      }
      return this['$Bg' + nm];
    }

    axSetPublicProperty(nm: any, value: any) {
      release || checkValue(value);
      nm = typeof nm === 'number' ? nm : axCoerceName(nm);
      if ((<any>nm | 0) === nm || isNumeric(nm)) {
        this.axSetNumericProperty(typeof nm === 'number' ? nm : nm | 0, value);
        return;
      }
      this['$Bg' + nm] = value;
    }

    axNextName(index: number): any {
      return index - 1;
    }

    /**
     * Throws exceptions for the cases where Flash does, and returns false if the callback
     * is null or undefined. In that case, the calling function returns its default value.
     */
    checkVectorMethodArgs(callback: AXCallable, thisObject: any): boolean {
      if (isNullOrUndefined(callback)) {
        return false;
      }
      var sec = this.sec;
      if (!axIsCallable(callback)) {
        sec.throwError("TypeError", Errors.CheckTypeFailedError, callback, 'Function');
      }
      if ((<any>callback).axClass === sec.AXMethodClosure &&
          !isNullOrUndefined(thisObject)) {
        sec.throwError("TypeError", Errors.ArrayFilterNonNullObjectError);
      }
      return true;
    }
  }

  export class Vector extends ASObject {
    static axIsType(x: AXObject) {
      return this.dPrototype.isPrototypeOf(x) ||
             this.sec.Int32Vector.axClass.dPrototype.isPrototypeOf(x) ||
             this.sec.Uint32Vector.axClass.dPrototype.isPrototypeOf(x) ||
             this.sec.Float64Vector.axClass.dPrototype.isPrototypeOf(x) ||
             this.sec.ObjectVector.axClass.dPrototype.isPrototypeOf(x);
    }
  }

  export class GenericVector extends BaseVector {

    static axClass: typeof GenericVector;

    static CASEINSENSITIVE = 1;
    static DESCENDING = 2;
    static UNIQUESORT = 4;
    static RETURNINDEXEDARRAY = 8;
    static NUMERIC = 16;

    static classInitializer() {
      var proto: any = this.dPrototype;
      var tProto: any = this.tPrototype;

      // Fix up MOP handlers to not apply to the dynamic prototype, which is a plain object.
      tProto.axGetProperty = proto.axGetProperty;
      tProto.axGetNumericProperty = proto.axGetNumericProperty;
      tProto.axSetProperty = proto.axSetProperty;
      tProto.axSetNumericProperty = proto.axSetNumericProperty;
      tProto.axHasPropertyInternal = proto.axHasPropertyInternal;
      tProto.axNextName = proto.axNextName;
      tProto.axNextNameIndex = proto.axNextNameIndex;
      tProto.axNextValue = proto.axNextValue;

      proto.axGetProperty = ASObject.prototype.axGetProperty;
      proto.axGetNumericProperty = ASObject.prototype.axGetNumericProperty;
      proto.axSetProperty = ASObject.prototype.axSetProperty;
      proto.axSetNumericProperty = ASObject.prototype.axSetNumericProperty;
      proto.axHasPropertyInternal = ASObject.prototype.axHasPropertyInternal;
      proto.axNextName = ASObject.prototype.axNextName;
      proto.axNextNameIndex = ASObject.prototype.axNextNameIndex;
      proto.axNextValue = ASObject.prototype.axNextValue;

      var asProto: any = GenericVector.prototype;
      defineNonEnumerableProperty(proto, '$Bgjoin', asProto.join);
      // Same as join, see VectorImpl.as in Tamarin repository.
      defineNonEnumerableProperty(proto, '$BgtoString', asProto.join);
      defineNonEnumerableProperty(proto, '$BgtoLocaleString', asProto.toLocaleString);

      defineNonEnumerableProperty(proto, '$Bgpop', asProto.pop);
      defineNonEnumerableProperty(proto, '$Bgpush', asProto.push);

      defineNonEnumerableProperty(proto, '$Bgreverse', asProto.reverse);
      defineNonEnumerableProperty(proto, '$Bgconcat', asProto.concat);
      defineNonEnumerableProperty(proto, '$Bgsplice', asProto.splice);
      defineNonEnumerableProperty(proto, '$Bgslice', asProto.slice);

      defineNonEnumerableProperty(proto, '$Bgshift', asProto.shift);
      defineNonEnumerableProperty(proto, '$Bgunshift', asProto.unshift);

      defineNonEnumerableProperty(proto, '$BgindexOf', asProto.indexOf);
      defineNonEnumerableProperty(proto, '$BglastIndexOf', asProto.lastIndexOf);

      defineNonEnumerableProperty(proto, '$BgforEach', asProto.forEach);
      defineNonEnumerableProperty(proto, '$Bgmap', asProto.map);
      defineNonEnumerableProperty(proto, '$Bgfilter', asProto.filter);
      defineNonEnumerableProperty(proto, '$Bgsome', asProto.some);
      defineNonEnumerableProperty(proto, '$Bgevery', asProto.every);

      defineNonEnumerableProperty(proto, '$Bgsort', asProto.sort);
      defineNonEnumerableProperty(proto, 'checkVectorMethodArgs', asProto.checkVectorMethodArgs);
    }

    static axApply(self: GenericVector, args: any[]) {
      var object = args[0];
      if (self.axClass.axIsType(object)) {
        return object;
      }
      var length = object.axGetPublicProperty("length");
      if (length !== undefined) {
        var v = self.axClass.axConstruct([length, false]);
        for (var i = 0; i < length; i++) {
          v.axSetNumericProperty(i, object.axGetPublicProperty(i));
        }
        return v;
      }
      Shumway.Debug.unexpected();
    }

    static defaultCompareFunction(a, b) {
      return String(a).localeCompare(String(b));
    }

    static compare(a, b, options, compareFunction) {
      release || assertNotImplemented (!(options & GenericVector.CASEINSENSITIVE), "CASEINSENSITIVE");
      release || assertNotImplemented (!(options & GenericVector.UNIQUESORT), "UNIQUESORT");
      release || assertNotImplemented (!(options & GenericVector.RETURNINDEXEDARRAY), "RETURNINDEXEDARRAY");
      var result = 0;
      if (!compareFunction) {
        compareFunction = GenericVector.defaultCompareFunction;
      }
      if (options & GenericVector.NUMERIC) {
        a = toNumber(a);
        b = toNumber(b);
        result = a < b ? -1 : (a > b ? 1 : 0);
      } else {
        result = compareFunction(a, b);
      }
      if (options & GenericVector.DESCENDING) {
        result *= -1;
      }
      return result;
    }

    axClass: AXClass;

    static type: AXClass;
    static defaultValue: any = null;

    private _fixed: boolean;
    private _buffer: any [];

    constructor (length: number /*uint*/ = 0, fixed: boolean = false) {
      false && super();
      length = length >>> 0; fixed = !!fixed;
      this._fixed = !!fixed;
      this._buffer = new Array(length);
      this._fill(0, length, this.axClass.defaultValue);
    }

    private _fill(index: number, length: number, value: any) {
      for (var i = 0; i < length; i++) {
        this._buffer[index + i] = value;
      }
    }

    /**
     * Can't use Array.prototype.toString because it doesn't print |null|s the same way as AS3.
     */
    toString() {
      var result = [];
      for (var i = 0; i < this._buffer.length; i++) {
        var entry = this._buffer[i];
        result.push(entry === null ? 'null' : (entry + ''));
      }
      return result.join(',');
    }

    toLocaleString() {
      var result = [];
      for (var i = 0; i < this._buffer.length; i++) {
        var entry = this._buffer[i];
        if (entry && typeof entry === 'object') {
          result.push(entry.$BgtoLocaleString());
        } else {
          result.push(entry + '');
        }
      }
      return result.join(',');
    }

    sort(sortBehavior?: any) {
      if (arguments.length === 0) {
        this._buffer.sort();
        return this;
      }
      if (this.sec.AXFunction.axIsType(sortBehavior)) {
        this._buffer.sort(<(a: any, b: any) => number>sortBehavior.value);
        return this;
      }
      var options = sortBehavior|0;
      release || assertNotImplemented (!(options & Int32Vector.UNIQUESORT), "UNIQUESORT");
      release || assertNotImplemented (!(options & Int32Vector.RETURNINDEXEDARRAY), "RETURNINDEXEDARRAY");
      if (options & GenericVector.NUMERIC) {
        if (options & GenericVector.DESCENDING) {
          this._buffer.sort((a, b) => axCoerceNumber(b) - axCoerceNumber(a));
          return this;
        }
        this._buffer.sort((a, b) => axCoerceNumber(a) - axCoerceNumber(b));
        return this;
      }
      if (options & GenericVector.CASEINSENSITIVE) {
        if (options & GenericVector.DESCENDING) {
          this._buffer.sort((a, b) => <any>axCoerceString(b).toLowerCase() -
                                      <any>axCoerceString(a).toLowerCase());
          return this;
        }
        this._buffer.sort((a, b) => <any>axCoerceString(a).toLowerCase() -
                                    <any>axCoerceString(b).toLowerCase());
        return this;
      }
      if (options & GenericVector.DESCENDING) {
        this._buffer.sort((a, b) => b - a);
        return this;
      }
      this._buffer.sort();
      return this;
    }

    /**
     * Executes a |callback| function with three arguments: element, index, the vector itself as
     * well as passing the |thisObject| as |this| for each of the elements in the vector. If any of
     * the callbacks return |false| the function terminates, otherwise it returns |true|.
     */
    every(callback: AXCallable, thisObject: Object) {
      if (!this.checkVectorMethodArgs(callback, thisObject)) {
        return true;
      }
      for (var i = 0; i < this._buffer.length; i++) {
        if (!callback.axCall(thisObject, this.axGetNumericProperty(i), i, this)) {
          return false;
        }
      }
      return true;
    }

    /**
     * Filters the elements for which the |callback| method returns |true|. The |callback| function
     * is called with three arguments: element, index, the vector itself as well as passing the
     * |thisObject| as |this| for each of the elements in the vector.
     */
    filter(callback, thisObject) {
      var v = <GenericVector><any>this.axClass.axConstruct([0, false]);
      if (!this.checkVectorMethodArgs(callback, thisObject)) {
        return v;
      }
      for (var i = 0; i < this._buffer.length; i++) {
        if (callback.call(thisObject, this.axGetNumericProperty(i), i, this)) {
          v.push(this.axGetNumericProperty(i));
        }
      }
      return v;
    }

    map(callback, thisObject) {
      var v = <GenericVector><any>this.axClass.axConstruct([this.length, false]);
      if (!this.checkVectorMethodArgs(callback, thisObject)) {
        return v;
      }
      for (var i = 0; i < this._buffer.length; i++) {
        v.push(this._coerce(callback.call(thisObject, this.axGetNumericProperty(i), i, this)));
      }
      return v;
    }

    some(callback, thisObject) {
      if (!this.checkVectorMethodArgs(callback, thisObject)) {
        return false;
      }
      for (var i = 0; i < this._buffer.length; i++) {
        if (callback.call(thisObject, this.axGetNumericProperty(i), i, this)) {
          return true;
        }
      }
      return false;
    }

    forEach(callback, thisObject) {
      if (!this.checkVectorMethodArgs(callback, thisObject)) {
        return;
      }
      for (var i = 0; i < this._buffer.length; i++) {
        callback.call(thisObject, this.axGetNumericProperty(i), i, this);
      }
    }

    join(separator: string = ',') {
      var buffer = this._buffer;
      var limit = this._buffer.length;
      var result = "";
      for (var i = 0; i < limit - 1; i++) {
        result += buffer[i] + separator;
      }
      if (limit > 0) {
        result += buffer[limit - 1];
      }
      return result;
    }

    indexOf(searchElement, fromIndex = 0) {
      return this._buffer.indexOf(searchElement, fromIndex);
    }

    lastIndexOf(searchElement, fromIndex = 0x7fffffff) {
      return this._buffer.lastIndexOf(searchElement, fromIndex);
    }

    push(arg1?, arg2?, arg3?, arg4?, arg5?, arg6?, arg7?, arg8?/*...rest*/) {
      this._checkFixed();
      for (var i = 0; i < arguments.length; i++) {
        this._buffer.push(this._coerce(arguments[i]));
      }
    }

    pop() {
      this._checkFixed();
      if (this._buffer.length === 0) {
        return undefined;
      }
      return this._buffer.pop();
    }

    concat() {
      // TODO: need to type check the arguments, but isType doesn't exist.
      var buffers = [];
      for (var i = 0; i < arguments.length; i++) {
        buffers.push(this._coerce(arguments[i])._buffer);
      }
      var buffer = this._buffer.concat.apply(this._buffer, buffers);
      var result = (<any>this).axClass.axConstruct([]);
      result._buffer = buffer;
      return result;
    }

    reverse() {
      this._buffer.reverse();
      return this;
    }

    _coerce(v) {
      return (<any>this.axClass).type.axCoerce(v);
    }

    shift() {
      this._checkFixed();
      if (this._buffer.length === 0) {
        return undefined;
      }
      return this._buffer.shift();
    }

    unshift() {
      if (!arguments.length) {
        return;
      }
      this._checkFixed();
      for (var i = 0; i < arguments.length; i++) {
        this._buffer.unshift(this._coerce(arguments[i]));
      }
    }

    slice(start = 0, end = 0x7fffffff) {
      var buffer = this._buffer;
      var length = buffer.length;
      var first = Math.min(Math.max(start, 0), length);
      var last = Math.min(Math.max(end, first), length);
      var result = <GenericVector><any>this.axClass.axConstruct([last - first, this.fixed]);
      result._buffer = buffer.slice(first, last);
      return result;
    }

    splice(start: number, deleteCount_: number /*, ...items */) {
      var buffer = this._buffer;
      var length = buffer.length;
      var first = Math.min(Math.max(start, 0), length);

      var deleteCount = Math.min(Math.max(deleteCount_, 0), length - first);
      var insertCount = arguments.length - 2;
      if (deleteCount !== insertCount) {
        this._checkFixed();
      }
      var items = [first, deleteCount];
      for (var i = 2; i < insertCount + 2; i++) {
        items[i] = this._coerce(arguments[i]);
      }
      var result =<GenericVector><any>this.axClass.axConstruct([deleteCount, this.fixed]);
      result._buffer = buffer.splice.apply(buffer, items);
      return result;
    }

    get length(): number {
      return this._buffer.length;
    }

    set length(value: number) {
      value = value >>> 0;
      if (value > this._buffer.length) {
        for (var i = this._buffer.length; i < value; i++) {
          this._buffer[i] = this.axClass.defaultValue;
        }
      } else {
        this._buffer.length = value;
      }
      release || assert (this._buffer.length === value);
    }

    set fixed(f: boolean) {
      this._fixed = !!f;
    }

    get fixed(): boolean {
      return this._fixed;
    }

    _checkFixed() {
      if (this._fixed) {
        this.sec.throwError("RangeError", Errors.VectorFixedError);
      }
    }

    axGetNumericProperty(nm: number) {
      release || assert(isNumeric(nm));
      var idx = nm | 0;
      if (idx < 0 || idx >= this._buffer.length || idx != nm) {
        this.sec.throwError("RangeError", Errors.OutOfRangeError, nm,
                                       this._buffer.length);
      }
      return this._buffer[idx];
    }
    axSetNumericProperty(nm: number, v: any) {
      release || assert(isNumeric(nm));
      var length = this._buffer.length;
      var idx = nm | 0;
      if (idx < 0 || idx > length || idx != nm || (idx === length && this._fixed)) {
        this.sec.throwError("RangeError", Errors.OutOfRangeError, nm, length);
      }
      this._buffer[idx] = this._coerce(v);
    }

    axHasPropertyInternal(mn: Multiname): boolean {
      // Optimization for the common case of indexed element accesses.
      if ((<any>mn.name | 0) === mn.name) {
        release || assert(mn.isRuntimeName());
        return mn.name >= 0 && mn.name < this._buffer.length;
      }
      var name = axCoerceName(mn.name);
      if (mn.isRuntimeName() && isIndex(name)) {
        var index = <any>name >>> 0;
        return index >= 0 && index < this._buffer.length;
      }
      return this.axResolveMultiname(mn) in this;
    }

    axNextValue(index: number): any {
      return this._buffer[index - 1];
    }

    axNextNameIndex(index: number): number {
      var nextNameIndex = index + 1;
      if (nextNameIndex <= this._buffer.length) {
        return nextNameIndex;
      }
      return 0;
    }
  }
}
