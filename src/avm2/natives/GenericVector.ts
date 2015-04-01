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
  /**
   * Check arguments and throw the appropriate errors.
   */
  var checkArguments = true;

  import assert = Shumway.Debug.assert;
  import assertNotImplemented = Shumway.Debug.assertNotImplemented;
  import notImplemented = Shumway.Debug.notImplemented;
  import defineNonEnumerableProperty = Shumway.ObjectUtilities.defineNonEnumerableProperty;
  import clamp = Shumway.NumberUtilities.clamp;

  export class BaseVector extends ASObject {
    axGetProperty(mn: Multiname): any {
      // Optimization for the common case of indexed element accesses.
      if (typeof mn.name === 'number') {
        release || assert(mn.isRuntimeName());
        return this.axGetNumericProperty(mn.name);
      }
      var name = asCoerceName(mn.name);
      if (mn.isRuntimeName() && isNumeric(name)) {
        return this.axGetNumericProperty(+name);
      }
      var t = this.traits.getTrait(mn.namespaces, name);
      if (t) {
        return this[t.name.getMangledName()];
      }
      return this['$Bg' + name];
    }

    axSetProperty(mn: Multiname, value: any) {
      release || checkValue(value);
      // Optimization for the common case of indexed element accesses.
      if (typeof mn.name === 'number') {
        release || assert(mn.isRuntimeName());
        this.axSetNumericProperty(mn.name, value);
        return;
      }
      var name = asCoerceName(mn.name);
      if (mn.isRuntimeName() && isNumeric(name)) {
        this.axSetNumericProperty(+name, value);
        return;
      }
      var t = this.traits.getTrait(mn.namespaces, name);
      if (t) {
        this[t.name.getMangledName()] = value;
        return;
      }
      this['$Bg' + name] = value;
    }

    axGetPublicProperty(nm: any): any {
      // Optimization for the common case of indexed element accesses.
      if (typeof nm === 'number') {
        return this.axGetNumericProperty(nm);
      }
      var name = asCoerceName(nm);
      if (isNumeric(name)) {
        return this.axGetNumericProperty(+name);
      }
      return this['$Bg' + name];
    }

    axSetPublicProperty(nm: any, value: any) {
      release || checkValue(value);
      // Optimization for the common case of indexed element accesses.
      if (typeof nm === 'number') {
        this.axSetNumericProperty(nm, value);
        return;
      }
      var name = asCoerceName(nm);
      if (isNumeric(name)) {
        this.axSetNumericProperty(+name, value);
        return;
      }
      this['$Bg' + name] = value;
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

    private _fixed: boolean;
    private _buffer: any [];
    private _type: AXClass;
    private _defaultValue: any;

    constructor (length: number /*uint*/ = 0, fixed: boolean = false, type?: AXClass) {
      false && super();
      length = length >>> 0; fixed = !!fixed;
      this._fixed = !!fixed;
      this._buffer = new Array(length);
      this._type = type || this.securityDomain.AXObject;
      // TODO: FIX ME
      // this._defaultValue = type ? type.defaultValue : null;
      this._fill(0, length, this._defaultValue);
    }

    /**
     * Creates a new class that is bound to this type.
     */
    public static applyType(type: AXClass): AXClass {
      var axClass: AXClass = Object.create(this);
      // Put the superClass tPrototype on the prototype chain so we have access
      // to all factory protocol handlers by default.
      axClass.tPrototype = Object.create(this.tPrototype);
      axClass.tPrototype.axClass = axClass;
      // We don't need a new dPrototype object.
      axClass.dPrototype = <any>this.dPrototype;
      axClass.superClass = <any>this;
      return axClass;
    }

    ///**
    // * TODO: Need to really debug this, very tricky.
    // */
    //public static applyType(type: ASClass): ASClass {
    //  function parameterizedVectorConstructor(length: number /*uint*/, fixed: boolean) {
    //    // TODO: FIX ME
    //    // Function.prototype.call.call(GenericVector.instanceConstructor, this, length, fixed, type);
    //  };
    //
    //  function parameterizedVectorCallableConstructor(object) {
    //    if (object instanceof Int32Vector) {
    //      return object;
    //    }
    //    var length = object.asGetProperty(undefined, "length");
    //    if (length !== undefined) {
    //      var v = new parameterizedVectorConstructor(length, false);
    //      for (var i = 0; i < length; i++) {
    //        v.asSetNumericProperty(i, object.asGetPublicProperty(i));
    //      }
    //      return v;
    //    }
    //    Shumway.Debug.unexpected();
    //  }
    //
    //  var parameterizedVector = <any>parameterizedVectorConstructor;
    //  parameterizedVector.prototype = GenericVector.prototype;
    //  parameterizedVector.instanceConstructor = parameterizedVector;
    //  parameterizedVector.callableConstructor = parameterizedVectorCallableConstructor;
    //  parameterizedVector.__proto__ = GenericVector;
    //  return <any>parameterizedVector;
    //}

    private _fill(index: number, length: number, value: any) {
      for (var i = 0; i < length; i++) {
        this._buffer[index + i] = value;
      }
    }

    /**
     * Can't use Array.prototype.toString because it doesn't print |null|s the same way as AS3.
     */
    toString() {
      var str = "";
      for (var i = 0; i < this._buffer.length; i++) {
        str += this._buffer[i];
        if (i < this._buffer.length - 1) {
          str += ",";
        }
      }
      return str;
    }

    toLocaleString() {
      var str = "";
      for (var i = 0; i < this._buffer.length; i++) {
        str += this._buffer[i].asCallPublicProperty('toLocaleString');
        if (i < this._buffer.length - 1) {
          str += ",";
        }
      }
      return str;
    }

    sort(sortBehavior?: any) {
      if (arguments.length === 0) {
        return this._buffer.sort();
      }
      if (sortBehavior instanceof Function) {
        return this._buffer.sort(<(a: any, b: any) => number>sortBehavior);
      } else {
        var options = sortBehavior|0;
        release || assertNotImplemented (!(options & Int32Vector.UNIQUESORT), "UNIQUESORT");
        release || assertNotImplemented (!(options & Int32Vector.RETURNINDEXEDARRAY), "RETURNINDEXEDARRAY");
        if (options && GenericVector.NUMERIC) {
          if (options & GenericVector.DESCENDING) {
            return this._buffer.sort((a, b) => asCoerceNumber(b) - asCoerceNumber(a));
          }
          return this._buffer.sort((a, b) => asCoerceNumber(a) - asCoerceNumber(b));
        }
        if (options && GenericVector.CASEINSENSITIVE) {
          if (options & GenericVector.DESCENDING) {
            return this._buffer.sort((a, b) => <any>asCoerceString(b).toLowerCase() -
                                               <any>asCoerceString(a).toLowerCase());
          }
          return this._buffer.sort((a, b) => <any>asCoerceString(a).toLowerCase() -
                                             <any>asCoerceString(b).toLowerCase());
        }
        if (options & GenericVector.DESCENDING) {
          return this._buffer.sort((a, b) => b - a);
        }
        return this._buffer.sort();
      }
    }

    /**
     * Executes a |callback| function with three arguments: element, index, the vector itself as well
     * as passing the |thisObject| as |this| for each of the elements in the vector. If any of the
     * callbacks return |false| the function terminates, otherwise it returns |true|.
     */
    every(callback: Function, thisObject: Object) {
      for (var i = 0; i < this._buffer.length; i++) {
        if (!callback.call(thisObject, this.axGetNumericProperty(i), i, this)) {
          return false;
        }
      }
      return true;
    }

    /**
     * Filters the elements for which the |callback| method returns |true|. The |callback| function
     * is called with three arguments: element, index, the vector itself as well as passing the |thisObject|
     * as |this| for each of the elements in the vector.
     */
    filter(callback, thisObject) {
      var v = new GenericVector(0, false, this._type);
      for (var i = 0; i < this._buffer.length; i++) {
        if (callback.call(thisObject, this.axGetNumericProperty(i), i, this)) {
          v.push(this.axGetNumericProperty(i));
        }
      }
      return v;
    }

    some(callback, thisObject) {
      if (arguments.length !== 2) {
        this.securityDomain.throwError("ArgumentError", Errors.WrongArgumentCountError);
      } else if (!this.securityDomain.isCallable(callback)) {
        this.securityDomain.throwError("ArgumentError", Errors.CheckTypeFailedError);
      }
      for (var i = 0; i < this._buffer.length; i++) {
        if (callback.call(thisObject, this.axGetNumericProperty(i), i, this)) {
          return true;
        }
      }
      return false;
    }

    forEach(callback, thisObject) {
      if (!this.securityDomain.isCallable(callback)) {
        this.securityDomain.throwError("ArgumentError", Errors.CheckTypeFailedError);
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

    map(callback, thisObject) {
      if (!this.securityDomain.isCallable(callback)) {
        this.securityDomain.throwError("ArgumentError", Errors.CheckTypeFailedError);
      }
      var v = new GenericVector(0, false, this._type);
      for (var i = 0; i < this._buffer.length; i++) {
        v.push(callback.call(thisObject, this.axGetNumericProperty(i), i, this));
      }
      return v;
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
      return this._buffer.concat.apply(this._buffer, buffers);
    }

    reverse() {
      this._buffer.reverse();
      return this;
    }

    _coerce(v) {
      if (this._type) {
        return this._type.axCoerce(v);
      } else if (v === undefined) {
        return null;
      }
      return v;
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
      var result = new GenericVector(last - first, this.fixed, this._type);
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
      var result = new GenericVector(deleteCount, this.fixed, this._type);
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
          this._buffer[i] = this._defaultValue;
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
        this.securityDomain.throwError("RangeError", Errors.VectorFixedError);
      }
    }

    //asNextName(index: number): any {
    //  return index - 1;
    //}
    //
    //asNextValue(index: number): any {
    //  return this._buffer[index - 1];
    //}
    //
    //asNextNameIndex(index: number): number {
    //  var nextNameIndex = index + 1;
    //  if (nextNameIndex <= this._buffer.length) {
    //    return nextNameIndex;
    //  }
    //  return 0;
    //}
    //
    //asHasProperty(namespaces, name, flags) {
    //  if (GenericVector.prototype === this || !isNumeric(name)) {
    //    return Object.prototype.asHasProperty.call(this, namespaces, name, flags);
    //  }
    //  var index = toNumber(name);
    //  return index >= 0 && index < this._buffer.length;
    //}
    //
    axGetNumericProperty(i: number) {
      checkArguments && axCheckVectorGetNumericProperty(i, this._buffer.length,
                                                        this.securityDomain);
      return this._buffer[i];
    }

    axSetNumericProperty(i: number, v) {
      checkArguments && axCheckVectorSetNumericProperty(i, this._buffer.length, this._fixed,
                                                        this.securityDomain);
      this._buffer[i] = this._coerce(v);
    }
    //
    //asHasNext2(hasNext2Info: HasNext2Info) {
    //  hasNext2Info.index = this.asNextNameIndex(hasNext2Info.index)
    //}
  }
}
