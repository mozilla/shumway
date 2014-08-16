/* THIS FILE WAS AUTOMATICALLY GENERATED FROM int32Vector.ts */

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

/**
 * TypedArray Vector Template
 *
 * If you make any changes to this code you'll need to regenerate uint32Vector.ts & float64Vector.ts. We duplicate all
 * the code for vectors because we want to keep things monomorphic as much as possible.
 *
 * NOTE: Not all of the AS3 methods need to be implemented natively, some are self-hosted in AS3 code.
 * For better performance we should probably implement them all natively (in JS that is) unless our
 * compiler is good enough.
 */

module Shumway.AVM2.AS {
  /**
   * Check arguments and throw the appropriate errors.
   */
  var checkArguments = true;

  import assertNotImplemented = Shumway.Debug.assertNotImplemented;
  import notImplemented = Shumway.Debug.notImplemented;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;
  import throwError = Shumway.AVM2.Runtime.throwError;
  import HasNext2Info = Shumway.AVM2.Runtime.HasNext2Info;
  import clamp = Shumway.NumberUtilities.clamp;
  import asCheckVectorGetNumericProperty = Shumway.AVM2.Runtime.asCheckVectorGetNumericProperty;
  import asCheckVectorSetNumericProperty = Shumway.AVM2.Runtime.asCheckVectorSetNumericProperty;

  export class Uint32Vector {
    static EXTRA_CAPACITY = 4;
    static INITIAL_CAPACITY = 10;
    static DEFAULT_VALUE = 0;

    static CASEINSENSITIVE = 1;
    static DESCENDING = 2;
    static UNIQUESORT = 4;
    static RETURNINDEXEDARRAY = 8;
    static NUMERIC = 16;

    static defaultCompareFunction(a, b) {
      return String(a).localeCompare(String(b));
    }

    static compare(a, b, options, compareFunction) {
      release || assertNotImplemented (!(options & Uint32Vector.CASEINSENSITIVE), "CASEINSENSITIVE");
      release || assertNotImplemented (!(options & Uint32Vector.UNIQUESORT), "UNIQUESORT");
      release || assertNotImplemented (!(options & Uint32Vector.RETURNINDEXEDARRAY), "RETURNINDEXEDARRAY");
      var result = 0;
      if (!compareFunction) {
        compareFunction = Uint32Vector.defaultCompareFunction;
      }
      if (options & Uint32Vector.NUMERIC) {
        a = toNumber(a);
        b = toNumber(b);
        result = a < b ? -1 : (a > b ? 1 : 0);
      } else {
        result = compareFunction(a, b);
      }
      if (options & Uint32Vector.DESCENDING) {
        result *= -1;
      }
      return result;
    }

    private _fixed: boolean;
    private _buffer: Uint32Array;
    private _length: number;
    private _offset: number;

    constructor (length: number = 0, fixed: boolean = false) {
      length = length >>> 0; fixed = !!fixed;
      this._fixed = fixed;
      this._buffer = new Uint32Array(Math.max(Uint32Vector.INITIAL_CAPACITY, length + Uint32Vector.EXTRA_CAPACITY));
      this._offset = 0;
      this._length = length;
    }

    static callable(object) {
      if (object instanceof Uint32Vector) {
        return object;
      }
      var length = object.asGetProperty(undefined, "length");
      if (length !== undefined) {
        var v = new Uint32Vector(length, false);
        for (var i = 0; i < length; i++) {
          v.asSetNumericProperty(i, object.asGetPublicProperty(i));
        }
        return v;
      }
      Shumway.Debug.unexpected();
    }

    internalToString() {
      var str = "";
      var start = this._offset;
      var end = start + this._length;
      for (var i = 0; i < this._buffer.length; i++) {
        if (i === start) {
          str += "[";
        }
        if (i === end) {
          str += "]";
        }
        str += this._buffer[i];
        if (i < this._buffer.length - 1) {
          str += ",";
        }
      }
      if (this._offset + this._length === this._buffer.length) {
        str += "]";
      }
      return str + ": offset: " + this._offset + ", length: " + this._length + ", capacity: " + this._buffer.length;
    }

    toString() {
      var str = "";
      for (var i = 0; i < this._length; i++) {
        str += this._buffer[this._offset + i];
        if (i < this._length - 1) {
          str += ",";
        }
      }
      return str;
    }

    // vector.prototype.toString = vector.prototype.internalToString;

    _view() {
      return this._buffer.subarray(this._offset, this._offset + this._length);
    }

    _ensureCapacity(length) {
      var minCapacity = this._offset + length;
      if (minCapacity < this._buffer.length) {
        return;
      }
      if (length <= this._buffer.length) {
        // New length exceeds bounds at current offset but fits in the buffer, so we center it.
        var offset = (this._buffer.length - length) >> 2;
        this._buffer.set(this._view(), offset);
        this._offset = offset;
        return;
      }
      // New length doesn't fit at all, resize buffer.
      var oldCapacity = this._buffer.length;
      var newCapacity = ((oldCapacity * 3) >> 1) + 1;
      if (newCapacity < minCapacity) {
        newCapacity = minCapacity;
      }
      var buffer = new Uint32Array(newCapacity);
      buffer.set(this._buffer, 0);
      this._buffer = buffer;
    }

    concat() {
      notImplemented("Uint32Vector.concat");
    }

    /**
     * Executes a |callback| function with three arguments: element, index, the vector itself as well
     * as passing the |thisObject| as |this| for each of the elements in the vector. If any of the
     * callbacks return |false| the function terminates, otherwise it returns |true|.
     */
    every(callback, thisObject) {
      for (var i = 0; i < this._length; i++) {
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
      var v = new Uint32Vector();
      for (var i = 0; i < this._length; i++) {
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
      for (var i = 0; i < this._length; i++) {
        if (callback.call(thisObject, this.asGetNumericProperty(i), i, this)) {
          return true;
        }
      }
      return false;
    }

    forEach(callback, thisObject) {
      for (var i = 0; i < this._length; i++) {
        callback.call(thisObject, this.asGetNumericProperty(i), i, this);
      }
    }

    join(sep) {
      notImplemented("Uint32Vector.join");
    }

    indexOf(searchElement, fromIndex) {
      notImplemented("Uint32Vector.indexOf");
    }

    lastIndexOf(searchElement, fromIndex) {
      notImplemented("Uint32Vector.lastIndexOf");
    }

    map(callback, thisObject) {
      if (!isFunction(callback)) {
        throwError("ArgumentError", Errors.CheckTypeFailedError);
      }
      var v = new Uint32Vector();
      for (var i = 0; i < this._length; i++) {
        v.push(callback.call(thisObject, this.asGetNumericProperty(i), i, this));
      }
      return v;
    }

    push(...rest) {
      this._checkFixed();
      this._ensureCapacity(this._length + arguments.length);
      for (var i = 0; i < arguments.length; i++) {
        this._buffer[this._offset + this._length++] = arguments[i];
      }
    }

    pop() {
      this._checkFixed();
      if (this._length === 0) {
        return Uint32Vector.DEFAULT_VALUE;
      }
      this._length--;
      return this._buffer[this._offset + this._length];
    }

    reverse() {
      var l = this._offset;
      var r = this._offset + this._length - 1;
      var b = this._buffer;
      while (l < r) {
        var t = b[l];
        b[l] = b[r];
        b[r] = t;
        l ++;
        r --;
      }
    }

    static _sort(a) {
      var stack = [];
      var sp = -1;
      var l = 0;
      var r = a.length - 1;
      var i, j, swap, temp;
      while (true) {
        if (r - l <= 100) {
          for (j = l + 1; j <= r; j++) {
            swap = a[j];
            i = j - 1;
            while (i >= l && a[i] > swap) {
              a[i + 1] = a[i--];
            }
            a[i + 1] = swap;
          }
          if (sp == -1) {
            break;
          }
          r = stack[sp--];
          l = stack[sp--];
        } else {
          var median = l + r >> 1;
          i = l + 1;
          j = r;
          swap = a[median];
          a[median] = a[i];
          a[i] = swap;
          if (a[l] > a[r]) {
            swap = a[l];
            a[l] = a[r];
            a[r] = swap;
          }
          if (a[i] > a[r]) {
            swap = a[i];
            a[i] = a[r];
            a[r] = swap;
          }
          if (a[l] > a[i]) {
            swap = a[l];
            a[l] = a[i];
            a[i] = swap;
          }
          temp = a[i];
          while (true) {
            do {
              i++;
            } while (a[i] < temp);
            do {
              j--;
            } while (a[j] > temp);
            if (j < i) {
              break;
            }
            swap = a[i];
            a[i] = a[j];
            a[j] = swap;
          }
          a[l + 1] = a[j];
          a[j] = temp;
          if (r - i + 1 >= j - l) {
            stack[++sp] = i;
            stack[++sp] = r;
            r = j - 1;
          } else {
            stack[++sp] = l;
            stack[++sp] = j - 1;
            l = i;
          }
        }
      }
      return a;
    }

    _sortNumeric(descending) {
      Uint32Vector._sort(this._view());
      if (descending) {
        this.reverse();
      }
    }

    sort() {
      if (arguments.length === 0) {
        return Array.prototype.sort.call(this._view());
      }
      var compareFunction, options = 0;
      if (arguments[0] instanceof Function) {
        compareFunction = arguments[0];
      } else if (isNumber(arguments[0])) {
        options = arguments[0];
      }
      if (isNumber(arguments[1])) {
        options = arguments[1];
      }
      if (options & Uint32Vector.NUMERIC) {
        return this._sortNumeric(options & Uint32Vector.DESCENDING);
      }
      Array.prototype.sort.call(this._view(), function (a, b) {
        return Uint32Vector.compare(a, b, options, compareFunction);
      });
    }

    asGetNumericProperty(i) {
      checkArguments && asCheckVectorGetNumericProperty(i, this._length);
      return this._buffer[this._offset + i];
    }

    asSetNumericProperty(i, v) {
      checkArguments && asCheckVectorSetNumericProperty(i, this._length, this._fixed);
      if (i === this._length) {
        this._ensureCapacity(this._length + 1);
        this._length ++;
      }
      this._buffer[this._offset + i] = v;
    }

    shift() {
      this._checkFixed();
      if (this._length === 0) {
        return 0;
      }
      this._length--;
      return this._buffer[this._offset++];
    }

    _checkFixed() {
      if (this._fixed) {
        throwError("RangeError", Errors.VectorFixedError);
      }
    }

    _slide(distance) {
      this._buffer.set(this._view(), this._offset + distance);
      this._offset += distance;
    }

    unshift() {
      this._checkFixed();
      if (!arguments.length) {
        return;
      }
      this._ensureCapacity(this._length + arguments.length);
      this._slide(arguments.length);
      this._offset -= arguments.length;
      this._length += arguments.length;
      for (var i = 0; i < arguments.length; i++) {
        this._buffer[this._offset + i] = arguments[i];
      }
    }

    asHasProperty(namespaces, name, flags) {
      if (Uint32Vector.prototype === this || !isNumeric(name)) {
        return Object.prototype.asHasProperty.call(this, namespaces, name, flags);
      }
      var index = toNumber(name);
      return index >= 0 && index < this._length;
    }

    get length() {
      return this._length;
    }

    set length(value: number) {
      value = value >>> 0;
      if (value > this._length) {
        this._ensureCapacity(value);
        for (var i = this._offset + this._length, j = this._offset + value; i < j; i++) {
          this._buffer[i] = Uint32Vector.DEFAULT_VALUE;
        }
      }
      this._length = value;
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
      deleteCount = clamp(deleteCount, 0, this._length - index);
      this._ensureCapacity(this._length - deleteCount + insertCount);
      var right = this._offset + index + deleteCount;
      var slice = this._buffer.subarray(right, right + this._length - index - deleteCount);
      this._buffer.set(slice, this._offset + index + insertCount);
      this._length += insertCount - deleteCount;
      for (var i = 0; i < insertCount; i++) {
        this._buffer[this._offset + index + i] = args.asGetNumericProperty(offset + i);
      }
    }

    asNextName(index: number): any {
      return index - 1;
    }

    asNextValue(index: number): any {
      return this._buffer[this._offset + index - 1];
    }

    asNextNameIndex(index: number): number {
      var nextNameIndex = index + 1;
      if (nextNameIndex <= this._length) {
        return nextNameIndex;
      }
      return 0;
    }

    asHasNext2(hasNext2Info: HasNext2Info) {
      hasNext2Info.index = this.asNextNameIndex(hasNext2Info.index);
    }

    _reverse: () => void;
    _filter: (callback: Function, thisObject: any) => any;
    _map: (callback: Function, thisObject: any) => any;
  }

  Uint32Vector.prototype._reverse = Uint32Vector.prototype.reverse;
  Uint32Vector.prototype._filter = Uint32Vector.prototype.filter;
  Uint32Vector.prototype._map = Uint32Vector.prototype.map;
}

