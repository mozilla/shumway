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
 * If you make any changes to this code you'll need to regenerate uint32Vector.ts &
 * float64Vector.ts. We duplicate all the code for vectors because we want to keep things
 * monomorphic as much as possible.
 *
 * NOTE: Not all of the AS3 methods need to be implemented natively, some are self-hosted in AS3
 * code. For better performance we should probably implement them all natively (in JS that is)
 * unless our compiler is good enough.
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

  export class Float64Vector extends BaseVector {
    static EXTRA_CAPACITY = 4;
    static INITIAL_CAPACITY = 10;
    static DEFAULT_VALUE = 0;

    static DESCENDING = 2;
    static UNIQUESORT = 4;
    static RETURNINDEXEDARRAY = 8;

    public static instanceConstructor: any = Float64Vector;
    public static staticNatives: any [] = [Float64Vector];
    public static instanceNatives: any [] = [Float64Vector.prototype];

    static classInitializer() {
      var proto: any = this.dPrototype;
      var asProto: any = Float64Vector.prototype;
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

    newThisType(): Float64Vector {
      return new this.securityDomain.Float64Vector();
    }

    private _fixed: boolean;
    private _buffer: Float64Array;
    private _length: number;
    private _offset: number;

    constructor (length: number = 0, fixed: boolean = false) {
      false && super();
      length = length >>> 0; fixed = !!fixed;
      this._fixed = fixed;
      this._buffer = new Float64Array(Math.max(Float64Vector.INITIAL_CAPACITY, length + Float64Vector.EXTRA_CAPACITY));
      this._offset = 0;
      this._length = length;
    }

    static axApply(self: Float64Vector, args: any[]) {
      var object = args[0];
      if (self.securityDomain.Float64Vector.axIsType(object)) {
        return object;
      }
      var length = object.axGetPublicProperty("length");
      if (length !== undefined) {
        var v = new self.securityDomain.Float64Vector(length, false);
        for (var i = 0; i < length; i++) {
          v.axSetNumericProperty(i, object.axGetPublicProperty(i));
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

    toLocaleString() {
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
      var buffer = new Float64Array(newCapacity);
      buffer.set(this._buffer, 0);
      this._buffer = buffer;
    }

    concat() {
      var length = this._length;
      for (var i = 0; i < arguments.length; i++) {
        var vector: Float64Vector = arguments[i];
        if (!(vector._buffer instanceof Float64Array)) {
          assert(false); // TODO
          // this.securityDomain.throwError('TypeError', Errors.CheckTypeFailedError,
          // vector.constructor.name, '__AS3__.vec.Vector.<Number>');
        }
        length += vector._length;
      }
      var result = new this.securityDomain.Float64Vector(length);
      var buffer = result._buffer;
      buffer.set(this._buffer);
      var offset = this._length;
      for (var i = 0; i < arguments.length; i++) {
        var vector: Float64Vector = arguments[i];
        if (offset + vector._buffer.length < vector._buffer.length) {
          buffer.set(vector._buffer, offset);
        } else {
          buffer.set(vector._buffer.subarray(0, vector._length), offset);
        }
        offset += vector._length;
      }
      return result;
    }

    /**
     * Executes a |callback| function with three arguments: element, index, the vector itself as
     * well as passing the |thisObject| as |this| for each of the elements in the vector. If any of
     * the callbacks return |false| the function terminates, otherwise it returns |true|.
     */
    every(callback, thisObject) {
      for (var i = 0; i < this._length; i++) {
        if (!callback.call(thisObject, this._buffer[this._offset + i], i, this)) {
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
      var v = new this.securityDomain.Float64Vector();
      for (var i = 0; i < this._length; i++) {
        if (callback.call(thisObject, this._buffer[this._offset + i], i, this)) {
          v.push(this._buffer[this._offset + i]);
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
      for (var i = 0; i < this._length; i++) {
        if (callback.call(thisObject, this._buffer[this._offset + i], i, this)) {
          return true;
        }
      }
      return false;
    }

    forEach(callback, thisObject) {
      for (var i = 0; i < this._length; i++) {
        callback.call(thisObject, this._buffer[this._offset + i], i, this);
      }
    }

    join(separator: string = ',') {
      var limit = this.length;
      var buffer = this._buffer;
      var offset = this._offset;
      var result = "";
      for (var i = 0; i < limit - 1; i++) {
        result += buffer[offset + i] + separator;
      }
      if (limit > 0) {
        result += buffer[offset + limit - 1];
      }
      return result;
    }

    indexOf(searchElement, fromIndex = 0) {
      var length = this._length;
      var start = fromIndex|0;
      if (start < 0) {
        start = start + length;
        if (start < 0) {
          start = 0;
        }
      } else if (start >= length) {
        return -1;
      }
      var buffer = this._buffer;
      var length = this._length;
      var offset = this._offset;
      start += offset;
      var end = offset + length;
      for (var i = start; i < end; i++) {
        if (buffer[i] === searchElement) {
          return i - offset;
        }
      }
      return -1;
    }

    lastIndexOf(searchElement, fromIndex = 0x7fffffff) {
      var length = this._length;
      var start = fromIndex|0;
      if (start < 0) {
        start = start + length;
        if (start < 0) {
          return -1;
        }
      } else if (start >= length) {
        start = length;
      }
      var buffer = this._buffer;
      var offset = this._offset;
      start += offset;
      var end = offset;
      for (var i = start; i-- > end;) {
        if (buffer[i] === searchElement) {
          return i - offset;
        }
      }
      return -1;
    }

    map(callback, thisObject) {
      if (!this.securityDomain.isCallable(callback)) {
        this.securityDomain.throwError("ArgumentError", Errors.CheckTypeFailedError);
      }
      var v = new this.securityDomain.Float64Vector();
      for (var i = 0; i < this._length; i++) {
        v.push(callback.call(thisObject, this._buffer[this._offset + i], i, this));
      }
      return v;
    }

    push(arg1?, arg2?, arg3?, arg4?, arg5?, arg6?, arg7?, arg8?/*...rest*/) {
      this._checkFixed();
      this._ensureCapacity(this._length + arguments.length);
      for (var i = 0; i < arguments.length; i++) {
        this._buffer[this._offset + this._length++] = arguments[i];
      }
    }

    pop() {
      this._checkFixed();
      if (this._length === 0) {
        return Float64Vector.DEFAULT_VALUE;
      }
      this._length--;
      return this._buffer[this._offset + this._length];
      // TODO: should we potentially reallocate to a smaller buffer here?
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
      return this;
    }

    sort(sortBehavior?: any) {
      if (arguments.length === 0) {
        return Array.prototype.sort.call(this._view());
      }
      // REDUX: The instanceof check here is probably broken.
      if (sortBehavior instanceof Function) {
        return Array.prototype.sort.call(this._view(), sortBehavior);
      } else {
        var options = sortBehavior|0;
        release || assertNotImplemented (!(options & Float64Vector.UNIQUESORT), "UNIQUESORT");
        release || assertNotImplemented (!(options & Float64Vector.RETURNINDEXEDARRAY), "RETURNINDEXEDARRAY");
        if (options & Float64Vector.DESCENDING) {
          return Array.prototype.sort.call(this._view(), (a, b) => b - a);
        }
        return Array.prototype.sort.call(this._view(), (a, b) => a - b);
      }
    }

    shift() {
      this._checkFixed();
      if (this._length === 0) {
        return 0;
      }
      this._length--;
      return this._buffer[this._offset++];
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

    slice(start = 0, end = 0x7fffffff) {
      var buffer = this._buffer;
      var length = this._length;
      var first = Math.min(Math.max(start, 0), length);
      var last = Math.min(Math.max(end, first), length);
      var result = new this.securityDomain.Float64Vector(last - first, this.fixed);
      result._buffer.set(buffer.subarray(this._offset + first, this._offset + last),
                         result._offset);
      return result;
    }

    splice(start: number, deleteCount_: number /*, ...items: number[] */) {
      var buffer = this._buffer;
      var length = this._length;
      var first = Math.min(Math.max(start, 0), length);
      var startOffset = this._offset + first;

      var deleteCount = Math.min(Math.max(deleteCount_, 0), length - first);
      var insertCount = arguments.length - 2;
      var deletedItems;

      var result = new this.securityDomain.Float64Vector(deleteCount, this.fixed);
      if (deleteCount > 0) {
        deletedItems = buffer.subarray(startOffset, startOffset + deleteCount);
        result._buffer.set(deletedItems, result._offset);
      }
      this._ensureCapacity(length - deleteCount + insertCount);
      var right = startOffset + deleteCount;
      var slice = buffer.subarray(right, length);
      buffer.set(slice, startOffset + insertCount);
      this._length += insertCount - deleteCount;
      for (var i = 0; i < insertCount; i++) {
        buffer[startOffset + i] = arguments[i + 2];
      }

      return result;
    }

    _slide(distance) {
      this._buffer.set(this._view(), this._offset + distance);
      this._offset += distance;
    }

    get length() {
      return this._length;
    }

    set length(value: number) {
      value = value >>> 0;
      if (value > this._length) {
        this._ensureCapacity(value);
        for (var i = this._offset + this._length, j = this._offset + value; i < j; i++) {
          this._buffer[i] = Float64Vector.DEFAULT_VALUE;
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

    _checkFixed() {
      if (this._fixed) {
        this.securityDomain.throwError("RangeError", Errors.VectorFixedError);
      }
    }

    axGetNumericProperty(nm: number) {
      checkArguments && axCheckVectorGetNumericProperty(nm, this._length, this.securityDomain);
      return this._buffer[this._offset + nm];
    }

    axSetNumericProperty(nm: number, v: any) {
      release || assert(isNumeric(nm));
      checkArguments && axCheckVectorSetNumericProperty(nm, this._length, this._fixed,
                                                        this.securityDomain);
      if (nm === this._length) {
        this._ensureCapacity(this._length + 1);
        this._length ++;
      }
      this._buffer[this._offset + nm] = v;
    }

    axHasPropertyInternal(mn: Multiname): boolean {
      // Optimization for the common case of indexed element accesses.
      if (typeof mn.name === 'number') {
        release || assert(mn.isRuntimeName());
        return mn.name >= 0 && mn.name < this._length;
      }
      var name = asCoerceName(mn.name);
      if (mn.isRuntimeName() && isNumeric(name)) {
        var index = toNumber(name);
        return index >= 0 && index < this._length;
      }
      return this.axResolveMultiname(mn) in this;
    }

    axNextName(index: number): any {
      return index - 1;
    }

    axNextValue(index: number): any {
      return this._buffer[this._offset + index - 1];
    }

    axNextNameIndex(index: number): number {
      var nextNameIndex = index + 1;
      if (nextNameIndex <= this._length) {
        return nextNameIndex;
      }
      return 0;
    }

    axHasNext2(hasNext2Info: HasNext2Info) {
      hasNext2Info.index = this.axNextNameIndex(hasNext2Info.index);
    }
  }
}

