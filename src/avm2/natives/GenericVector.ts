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
///<reference path='../references.ts' />

module Shumway.AVM2.AS {
  declare var checkArguments;
  declare var clamp;

  import assertNotImplemented = Shumway.Debug.assertNotImplemented;
  import notImplemented = Shumway.Debug.notImplemented;
  import throwError = Shumway.AVM2.Runtime.throwError;
  import asCheckVectorGetNumericProperty = Shumway.AVM2.Runtime.asCheckVectorGetNumericProperty;
  import asCheckVectorSetNumericProperty = Shumway.AVM2.Runtime.asCheckVectorSetNumericProperty;

  import arraySort = Shumway.AVM2.AS.arraySort;

  export class GenericVector extends ASVector<Object> {

    static CASEINSENSITIVE = 1;
    static DESCENDING = 2;
    static UNIQUESORT = 4;
    static RETURNINDEXEDARRAY = 8;
    static NUMERIC = 16;

    static defaultCompareFunction(a, b) {
      return String(a).localeCompare(String(b));
    }

    static compare(a, b, options, compareFunction) {
      assertNotImplemented (!(options & GenericVector.CASEINSENSITIVE), "CASEINSENSITIVE");
      assertNotImplemented (!(options & GenericVector.UNIQUESORT), "UNIQUESORT");
      assertNotImplemented (!(options & GenericVector.RETURNINDEXEDARRAY), "RETURNINDEXEDARRAY");
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

    public static instanceConstructor: any = GenericVector;
    public static staticNatives: any [] = [GenericVector];
    public static instanceNatives: any [] = [GenericVector.prototype, ASVector.prototype];

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

    private _fixed: boolean;
    private _buffer: any [];
    private _type: ASClass;
    private _defaultValue: any;

    constructor (length: number /*uint*/, fixed: boolean, type: ASClass) {
      false && super();
      length = length >>> 0; fixed = !!fixed;
      this._fixed = !!fixed;
      this._buffer = new Array(length);
      this._type = type;
      this._defaultValue = type ? type.defaultValue : null;
      this._fill(0, length, this._defaultValue);
    }

    /**
     * TODO: Need to really debug this, very tricky.
     */
    public static applyType(type: ASClass): ASClass {
      function parameterizedVectorConstructor(length: number /*uint*/, fixed: boolean) {
        Function.prototype.call.call(GenericVector.instanceConstructor, this, length, fixed, type);
      };

      function parameterizedVectorCallableConstructor(object) {
        if (object instanceof Int32Vector) {
          return object;
        }
        var length = object.asGetProperty(undefined, "length");
        if (length !== undefined) {
          var v = new parameterizedVectorConstructor(length, false);
          for (var i = 0; i < length; i++) {
            v.asSetNumericProperty(i, object.asGetPublicProperty(i));
          }
          return v;
        }
        Shumway.Debug.unexpected();
      }

      var parameterizedVector = <any>parameterizedVectorConstructor;
      parameterizedVector.prototype = GenericVector.prototype;
      parameterizedVector.instanceConstructor = parameterizedVector;
      parameterizedVector.callableConstructor = parameterizedVectorCallableConstructor;
      parameterizedVector.__proto__ = GenericVector;
      return <any>parameterizedVector;
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
      var str = "";
      for (var i = 0; i < this._buffer.length; i++) {
        str += this._buffer[i];
        if (i < this._buffer.length - 1) {
          str += ",";
        }
      }
      return str;
    }

    /**
     * Executes a |callback| function with three arguments: element, index, the vector itself as well
     * as passing the |thisObject| as |this| for each of the elements in the vector. If any of the
     * callbacks return |false| the function terminates, otherwise it returns |true|.
     */
    every(callback: Function, thisObject: Object) {
      for (var i = 0; i < this._buffer.length; i++) {
        if (!callback.call(thisObject, this.asGetNumericProperty(i), i, this)) {
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
        if (callback.call(thisObject, this.asGetNumericProperty(i), i, this)) {
          v.push(this.asGetNumericProperty(i));
        }
      }
      return v;
    }

    some(callback, thisObject) {
      if (arguments.length !== 2) {
        throwError("ArgumentError", Errors.WrongArgumentCountError);
      } else if (!isFunction(callback)) {
        throwError("ArgumentError", Errors.CheckTypeFailedError);
      }
      for (var i = 0; i < this._buffer.length; i++) {
        if (callback.call(thisObject, this.asGetNumericProperty(i), i, this)) {
          return true;
        }
      }
      return false;
    }

    forEach(callback, thisObject) {
      if (!isFunction(callback)) {
        throwError("ArgumentError", Errors.CheckTypeFailedError);
      }
      for (var i = 0; i < this._buffer.length; i++) {
        callback.call(thisObject, this.asGetNumericProperty(i), i, this);
      }
    }

    map(callback, thisObject) {
      if (!isFunction(callback)) {
        throwError("ArgumentError", Errors.CheckTypeFailedError);
      }
      var v = new GenericVector(0, false, this._type);
      for (var i = 0; i < this._buffer.length; i++) {
        v.push(callback.call(thisObject, this.asGetNumericProperty(i), i, this));
      }
      return v;
    }

    push(...args) {
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

    reverse() {
      this._buffer.reverse();
    }

    sort(comparator) {
      return this._buffer.sort(comparator);
    }

    asGetNumericProperty(i) {
      checkArguments && asCheckVectorGetNumericProperty(i, this._buffer.length);
      return this._buffer[i];
    }

    _coerce(v) {
      if (this._type) {
        return this._type.coerce(v);
      } else if (v === undefined) {
        return null;
      }
      return v;
    }

    asSetNumericProperty(i, v) {
      checkArguments && asCheckVectorSetNumericProperty(i, this._buffer.length, this._fixed);
      this._buffer[i] = this._coerce(v);
    }

    shift() {
      this._checkFixed();
      if (this._buffer.length === 0) {
        return undefined;
      }
      return this._buffer.shift();
    }

    _checkFixed() {
      if (this._fixed) {
        throwError("RangeError", Errors.VectorFixedError);
      }
    }

    unshift() {
      if (!arguments.length) {
        return;
      }
      this._checkFixed();
      var items = [];
      for (var i = 0; i < arguments.length; i++) {
        items.push(this._coerce(arguments[i]));
      }
      this._buffer.unshift.apply(this._buffer, items);
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

    /**
     * Delete |deleteCount| elements starting at |index| then insert |insertCount| elements
     * from |args| object starting at |offset|.
     */
    _spliceHelper(index, insertCount, deleteCount, args, offset) {
      insertCount = clamp(insertCount, 0, args.length - offset);
      deleteCount = clamp(deleteCount, 0, this._buffer.length - index);
      var items = [];
      for (var i = 0; i < insertCount; i++) {
        items.push(this._coerce(args.asGetNumericProperty(offset + i)));
      }
      this._buffer.splice.apply(this._buffer, [index, deleteCount].concat(items));
    }

    asGetEnumerableKeys() {
      if (GenericVector.prototype === this) {
        return Object.prototype.asGetEnumerableKeys.call(this);
      }
      var keys = [];
      for (var i = 0; i < this._buffer.length; i++) {
        keys.push(i);
      }
      return keys;
    }

    asHasProperty(namespaces, name, flags) {
      if (GenericVector.prototype === this || !isNumeric(name)) {
        return Object.prototype.asHasProperty.call(this, namespaces, name, flags);
      }
      var index = toNumber(name);
      return index >= 0 && index < this._buffer.length;
    }

    _reverse: () => void;
    _filter: (callback: Function, thisObject: any) => any;
    _map: (callback: Function, thisObject: any) => any;
  }

  GenericVector.prototype._reverse = GenericVector.prototype.reverse;
  GenericVector.prototype._filter = GenericVector.prototype.filter;
  GenericVector.prototype._map = GenericVector.prototype.map;
}