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

///<reference path='es6-promises.d.ts' />
var jsGlobal = (function() { return this || (1, eval)('this'); })();
var inBrowser = typeof console != "undefined";

// declare var print;
// declare var console;
// declare var performance;
// declare var XMLHttpRequest;
// declare var document;
// declare var getComputedStyle;

/** @const */ var release: boolean = false;
/** @const */ var debug: boolean = !release;

declare var dateNow: () => number;

if (!jsGlobal.performance) {
  jsGlobal.performance = {};
}

if (!jsGlobal.performance.now) {
  jsGlobal.performance.now = typeof dateNow !== 'undefined' ? dateNow : Date.now;
}

function log(message?: any, ...optionalParams: any[]): void {
  jsGlobal.print(message);
}

function warn(message?: any, ...optionalParams: any[]): void {
  if (inBrowser) {
    console.warn(message);
  } else {
    jsGlobal.print(Shumway.IndentingWriter.RED + message + Shumway.IndentingWriter.ENDC);
  }
}

interface String {
  padRight(c: string, n: number): string;
  padLeft(c: string, n: number): string;
  endsWith(s: string): boolean;
}

interface Function {
  boundTo: boolean;
}

interface Array<T> {
  runtimeId: number;
}

interface Math {
  imul(a: number, b: number): number;
  /**
   * Returns the number of leading zeros of a number.
   * @param x A numeric expression.
   */
  clz32(x: number): number;
}

interface Error {
  stack: string;
}

interface Uint8ClampedArray extends ArrayBufferView {
  BYTES_PER_ELEMENT: number;
  length: number;
  [index: number]: number;
  get(index: number): number;
  set(index: number, value: number): void;
  set(array: Uint8Array, offset?: number): void;
  set(array: number[], offset?: number): void;
  subarray(begin: number, end?: number): Uint8ClampedArray;
}

declare var Uint8ClampedArray: {
  prototype: Uint8ClampedArray;
  new (length: number): Uint8ClampedArray;
  new (array: Uint8Array): Uint8ClampedArray;
  new (array: number[]): Uint8ClampedArray;
  new (buffer: ArrayBuffer, byteOffset?: number, length?: number): Uint8ClampedArray;
  BYTES_PER_ELEMENT: number;
}

module Shumway {

  export enum CharacterCodes {
    _0 = 48,
    _1 = 49,
    _2 = 50,
    _3 = 51,
    _4 = 52,
    _5 = 53,
    _6 = 54,
    _7 = 55,
    _8 = 56,
    _9 = 57
  }

  /**
   * The buffer length required to contain any unsigned 32-bit integer.
   */
  /* @const */ export var UINT32_CHAR_BUFFER_LENGTH = 10; // "4294967295".length;
  /* @const */ export var UINT32_MAX = 0xFFFFFFFF;
  /* @const */ export var UINT32_MAX_DIV_10 = 0x19999999; // UINT32_MAX / 10;
  /* @const */ export var UINT32_MAX_MOD_10 = 0x5; // UINT32_MAX % 10

  export function isString(value): boolean {
    return typeof value === "string";
  }

  export function isFunction(value): boolean {
    return typeof value === "function";
  }

  export function isNumber(value): boolean {
    return typeof value === "number";
  }

  export function isInteger(value): boolean {
    return (value | 0) === value;
  }

  export function isArray(value): boolean {
    return value instanceof Array;
  }

  export function isNumberOrString(value): boolean {
    return typeof value === "number" || typeof value === "string";
  }

  export function isObject(value): boolean {
    return typeof value === "object" || typeof value === 'function';
  }

  export function toNumber(x): number {
    return +x;
  }

  export function isNumericString(value: string): boolean {
    // ECMAScript 5.1 - 9.8.1 Note 1, this expression is true for all
    // numbers x other than -0.
    return String(Number(value)) === value;
  }

  /**
   * Whether the specified |value| is a number or the string representation of a number.
   */
  export function isNumeric(value: any): boolean {
    if (typeof value === "number") {
      return true;
    } else if (typeof value === "string") {
      return isIndex(value) || isNumericString(value);
    } else {
      // Debug.notImplemented(typeof value);
      return false;
    }
  }

  /**
   * Whether the specified |value| is an unsigned 32 bit number expressed as a number
   * or string.
   */
  export function isIndex(value: any): boolean {
    // js/src/vm/String.cpp JSFlatString::isIndexSlow
    // http://dxr.mozilla.org/mozilla-central/source/js/src/vm/String.cpp#474
    var index = 0;
    if (typeof value === "number") {
      index = (value | 0);
      if (value === index && index >= 0) {
        return true;
      }
      return value >>> 0 === value;
    }
    if (typeof value !== "string") {
      return false;
    }
    var length = value.length;
    if (length === 0) {
      return false;
    }
    if (value === "0") {
      return true;
    }
    // Is there any way this will fit?
    if (length > UINT32_CHAR_BUFFER_LENGTH) {
      return false;
    }
    var i = 0;
    index = value.charCodeAt(i++) - CharacterCodes._0;
    if (index < 1 || index > 9) {
      return false;
    }
    var oldIndex = 0;
    var c = 0;
    while (i < length) {
      c = value.charCodeAt(i++) - CharacterCodes._0;
      if (c < 0 || c > 9) {
        return false;
      }
      oldIndex = index;
      index = 10 * index + c;
    }
    /*
     * Look out for "4294967296" and larger-number strings that fit in UINT32_CHAR_BUFFER_LENGTH.
     * Only unsigned 32-bit integers shall pass.
     */
    if ((oldIndex < UINT32_MAX_DIV_10) || (oldIndex === UINT32_MAX_DIV_10 && c <= UINT32_MAX_MOD_10)) {
      return true;
    }
    return false;
  }

  export function isNullOrUndefined(value) {
    return value == undefined;
  }

  export module Debug {
    export function backtrace() {
      try {
        throw new Error();
      } catch (e) {
        return e.stack ? e.stack.split('\n').slice(2).join('\n') : '';
      }
    }

    export function error(message: string) {
      if (!inBrowser) {
        warn(message + "\n\nStack Trace:\n" + Debug.backtrace());
      }
      throw new Error(message);
    }

    export function assert(condition: any, ...args) {
      if (condition === "") {     // avoid inadvertent false positive
        condition = true;
      }
      if (!condition) {
        var message = Array.prototype.slice.call(arguments);
        message.shift();
        Debug.error(message.join(""));
      }
    }

    export function assertUnreachable(msg: string): void {
      var location = new Error().stack.split('\n')[1];
      throw new Error("Reached unreachable location " + location + msg);
    }

    export function assertNotImplemented(condition: boolean, message: string) {
      if (!condition) {
        Debug.error("NotImplemented: " + message);
      }
    }

    export function warning(message: string) {
      release || warn(message);
    }

    export function notUsed(message: string) {
      release || Debug.assert(false, "Not Used " + message);
    }

    export function notImplemented(message: string) {
      log("release: " + release);
      release || Debug.assert(false, "Not Implemented " + message);
    }

    export function abstractMethod(message: string) {
      Debug.assert(false, "Abstract Method " + message);
    }

    export function somewhatImplemented(message: string) {
      Debug.warning("somewhatImplemented: " + message);
    }

    export function unexpected(message?: any) {
      Debug.assert(false, "Unexpected: " + message);
    }
  }

  export function getTicks(): number {
    return performance.now();
  }

  export interface Map<T> {
    [name: string]: T
  }

  export module ArrayUtilities {
    /**
     * Pops elements from a source array into a destination array. This avoids
     * allocations and should be faster. The elements in the destination array
     * are pushed in the same order as they appear in the source array:
     *
     * popManyInto([1, 2, 3], 2, dst) => dst = [2, 3]
     */
    export function popManyInto(src: any [], count: number, dst: any []) {
      release || assert(src.length >= count);
      for (var i = count - 1; i >= 0; i--) {
        dst[i] = src.pop();
      }
      dst.length = count;
    }

    export function popMany<T>(array: T [], count: number): T [] {
      release || assert(array.length >= count);
      var start = array.length - count;
      var result = array.slice(start, this.length);
      array.splice(start, count);
      return result;
    }

    /**
     * Just deletes several array elements from the end of the list.
     */
    export function popManyIntoVoid(array: any [], count: number) {
      release || assert(array.length >= count);
      array.length = array.length - count;
    }

    export function pushMany(dst: any [], src: any []) {
      for (var i = 0; i < src.length; i++) {
        dst.push(src[i]);
      }
    }

    export function top(array: any []) {
      return array.length && array[array.length - 1]
    }

    export function peek(array: any []) {
      release || assert(array.length > 0);
      return array[array.length - 1];
    }

    export function pushUnique<T>(array: T [], value: T) {
      for (var i = 0, j = array.length; i < j; i++) {
        if (array[i] === value) {
          return;
        }
      }
      array.push(value);
    }

    export function unique<T>(array: T []): T [] {
      var result = [];
      for (var i = 0; i < array.length; i++) {
        pushUnique(result, array[i]);
      }
      return result;
    }

    export function copyFrom(dst: any [], src: any []) {
      dst.length = 0;
      ArrayUtilities.pushMany(dst, src);
    }

    export class ArrayWriter {
      _u8: Uint8Array;
      _u16: Uint16Array;
      _i32: Int32Array;
      _f32: Float32Array;
      _u32: Uint32Array;
      _offset: number;

      constructor(initialCapacity: number = 16) {
        this._u8 = null;
        this._u16 = null;
        this._i32 = null;
        this._f32 = null;
        this._offset = 0;
        this.ensureCapacity(initialCapacity);
      }

      public reset() {
        this._offset = 0;
      }

      public get offset (): number {
        return this._offset;
      }

      getIndex(size: number) {
        release || assert (size === 1 || size === 2 || size === 4 || size === 8 || size === 16);
        var index = this._offset / size;
        release || assert ((index | 0) === index);
        return index;
      }

      ensureAdditionalCapacity(size) {
        this.ensureCapacity(this._offset + size);
      }

      ensureCapacity(minCapacity: number) {
        if (!this._u8) {
          this._u8 = new Uint8Array(minCapacity);
        } else if (this._u8.length > minCapacity) {
          return;
        }
        var oldCapacity = this._u8.length;
        // var newCapacity = (((oldCapacity * 3) >> 1) + 8) & ~0x7;
        var newCapacity = oldCapacity * 2;
        if (newCapacity < minCapacity) {
          newCapacity = minCapacity;
        }
        var u8 = new Uint8Array(newCapacity);
        u8.set(this._u8, 0);
        this._u8 = u8;
        this._u16 = new Uint16Array(u8.buffer);
        this._i32 = new Int32Array(u8.buffer);
        this._f32 = new Float32Array(u8.buffer);
      }

      writeInt(v: number) {
        release || assert ((this._offset & 0x3) === 0);
        this.ensureCapacity(this._offset + 4);
        this.writeIntUnsafe(v);
      }

      writeIntAt(v: number, offset: number) {
        release || assert (offset >= 0 && offset <= this._offset);
        release || assert ((offset & 0x3) === 0);
        this.ensureCapacity(offset + 4);
        var index = offset >> 2;
        this._i32[index] = v;
      }

      writeIntUnsafe(v: number) {
        var index = this._offset >> 2;
        this._i32[index] = v;
        this._offset += 4;
      }

      writeFloat(v: number) {
        release || assert ((this._offset & 0x3) === 0);
        this.ensureCapacity(this._offset + 4);
        this.writeFloatUnsafe(v);
      }

      writeFloatUnsafe(v: number) {
        var index = this._offset >> 2;
        this._f32[index] = v;
        this._offset += 4;
      }

      write4Floats(a: number, b: number, c: number, d: number) {
        release || assert ((this._offset & 0x3) === 0);
        this.ensureCapacity(this._offset + 16);
        this.write4FloatsUnsafe(a, b, c, d);
      }

      write4FloatsUnsafe(a: number, b: number, c: number, d: number) {
        var index = this._offset >> 2;
        this._f32[index + 0] = a;
        this._f32[index + 1] = b;
        this._f32[index + 2] = c;
        this._f32[index + 3] = d;
        this._offset += 16;
      }

      write6Floats(a: number, b: number, c: number, d: number, e: number, f: number) {
        release || assert ((this._offset & 0x3) === 0);
        this.ensureCapacity(this._offset + 24);
        this.write6FloatsUnsafe(a, b, c, d, e, f);
      }

      write6FloatsUnsafe(a: number, b: number, c: number, d: number, e: number, f: number) {
        var index = this._offset >> 2;
        this._f32[index + 0] = a;
        this._f32[index + 1] = b;
        this._f32[index + 2] = c;
        this._f32[index + 3] = d;
        this._f32[index + 4] = e;
        this._f32[index + 5] = f;
        this._offset += 24;
      }

      subF32View(): Float32Array {
        return this._f32.subarray(0, this._offset >> 2);
      }

      subI32View(): Int32Array {
        return this._i32.subarray(0, this._offset >> 2);
      }

      subU16View(): Uint16Array {
        return this._u16.subarray(0, this._offset >> 1);
      }

      subU8View(): Uint8Array {
        return this._u8.subarray(0, this._offset);
      }

      hashWords(hash: number, offset: number, length: number) {
        var i32 = this._i32;
        for (var i = 0; i < length; i++) {
          hash = (((31 * hash) | 0) + i32[i]) | 0;
        }
        return hash;
      }

      reserve(size: number) {
        size = (size + 3) & ~0x3; // Round up to multiple of 4.
        this.ensureCapacity(this._offset + size);
        this._offset += size;
      }
    }
  }

  export class ArrayReader {
    _u8: Uint8Array;
    _u16: Uint16Array;
    _i32: Int32Array;
    _f32: Float32Array;
    _u32: Uint32Array;
    _offset: number;

    constructor(buffer: ArrayBuffer) {
      this._u8 = new Uint8Array(buffer);
      this._u16 = new Uint16Array(buffer);
      this._i32 = new Int32Array(buffer);
      this._f32 = new Float32Array(buffer);
      this._offset = 0;
    }

    public get offset (): number {
      return this._offset;
    }

    public isEmpty (): boolean {
      return this._offset === this._u8.length;
    }

    readInt(): number {
      release || assert ((this._offset & 0x3) === 0);
      release || assert (this._offset <= this._u8.length - 4);
      var v = this._i32[this._offset >> 2];
      this._offset += 4;
      return v;
    }

    readFloat(): number {
      release || assert ((this._offset & 0x3) === 0);
      release || assert (this._offset <= this._u8.length - 4);
      var v = this._f32[this._offset >> 2];
      this._offset += 4;
      return v;
    }
  }

  export module ObjectUtilities {
    export function boxValue(value) {
      if (isNullOrUndefined(value) || isObject(value)) {
        return value;
      }
      return Object(value);
    }

    export function toKeyValueArray(object: Object) {
      var hasOwnProperty = Object.prototype.hasOwnProperty;
      var array = [];
      for (var k in object) {
        if (hasOwnProperty.call(object, k)) {
          array.push([k, object[k]]);
        }
      }
      return array;
    }

    export function isPrototypeWriteable(object: Object) {
      return Object.getOwnPropertyDescriptor(object, "prototype").writable;
    }

    export function hasOwnProperty(object: Object, name: string): boolean {
      return Object.prototype.hasOwnProperty.call(object, name);
    }

    export function propertyIsEnumerable(object: Object, name: string): boolean {
      return Object.prototype.propertyIsEnumerable.call(object, name);
    }

    export function getOwnPropertyDescriptor(object: Object, name: string): PropertyDescriptor {
      return Object.getOwnPropertyDescriptor(object, name);
    }

    export function hasOwnGetter(object: Object, name: string): boolean {
      var d = Object.getOwnPropertyDescriptor(object, name);
      return !!(d && d.get);
    }

    export function getOwnGetter(object: Object, name: string): () => any {
      var d = Object.getOwnPropertyDescriptor(object, name);
      return d ? d.get : null;
    }

    export function hasOwnSetter(object: Object, name: string): boolean {
      var d = Object.getOwnPropertyDescriptor(object, name);
      return !!(d && !!d.set);
    }

    export function createObject(prototype: Object) {
      return Object.create(prototype);
    }

    export function createEmptyObject() {
      return Object.create(null);
    }

    export function createMap<T>():Map<T> {
      return Object.create(null);
    }

    export function createArrayMap<T>():Map<T> {
      return <Map<T>><any>[];
    }

    export function defineReadOnlyProperty(object: Object, name: string, value: any) {
      Object.defineProperty(object, name, {
        value: value,
        writable: false,
        configurable: true,
        enumerable: false
      });
    }

    export function getOwnPropertyDescriptors(object: Object): Map<PropertyDescriptor> {
      var o = ObjectUtilities.createMap<PropertyDescriptor>();
      var properties = Object.getOwnPropertyNames(object);
      for (var i = 0; i < properties.length; i++) {
        o[properties[i]] = Object.getOwnPropertyDescriptor(object, properties[i]);
      }
      return o;
    }

    export function cloneObject(object: Object): Object {
      var clone = ObjectUtilities.createEmptyObject();
      for (var property in object) {
        clone[property] = object[property];
      }
      return clone;
    }

    export function copyProperties(object: Object, template: Object) {
      for (var property in template) {
        object[property] = template[property];
      }
    }

    export function copyOwnProperties(object: Object, template: Object) {
      for (var property in template) {
        if (hasOwnProperty(template, property)) {
          object[property] = template[property];
        }
      }
    }

    export function copyOwnPropertyDescriptors(object: Object, template: Object) {
      for (var property in template) {
        if (hasOwnProperty(template, property)) {
          var descriptor = Object.getOwnPropertyDescriptor(template, property);
          assert (descriptor);
          try {
            Object.defineProperty(object, property, descriptor);
          } catch (e) {
            // log("Can't define " + property);
          }
        }
      }
    }

    export function getLatestGetterOrSetterPropertyDescriptor(object, name) {
      var descriptor: PropertyDescriptor = {};
      while (object) {
        var tmp = Object.getOwnPropertyDescriptor(object, name);
        if (tmp) {
          descriptor.get = descriptor.get || tmp.get;
          descriptor.set = descriptor.set || tmp.set;
        }
        if (descriptor.get && descriptor.set) {
          break;
        }
        object = Object.getPrototypeOf(object);
      }
      return descriptor;
    }

    export function defineNonEnumerableGetterOrSetter(obj, name, value, isGetter) {
      var descriptor = ObjectUtilities.getLatestGetterOrSetterPropertyDescriptor(obj, name);
      descriptor.configurable = true;
      descriptor.enumerable = false;
      if (isGetter) {
        descriptor.get = value;
      } else {
        descriptor.set = value;
      }
      Object.defineProperty(obj, name, descriptor);
  }

    export function defineNonEnumerableGetter(obj, name, getter) {
      Object.defineProperty(obj, name, { get: getter,
        configurable: true,
        enumerable: false
      });
    }

    export function defineNonEnumerableSetter(obj, name, setter) {
      Object.defineProperty(obj, name, { set: setter,
        configurable: true,
        enumerable: false
      });
    }

    export function defineNonEnumerableProperty(obj, name, value) {
      Object.defineProperty(obj, name, { value: value,
        writable: true,
        configurable: true,
        enumerable: false
      });
    }

    export function defineNonEnumerableForwardingProperty(obj, name, otherName) {
      Object.defineProperty(obj, name, {
        get: FunctionUtilities.makeForwardingGetter(otherName),
        set: FunctionUtilities.makeForwardingSetter(otherName),
        writable: true,
        configurable: true,
        enumerable: false
      });
    }

    export function defineNewNonEnumerableProperty(obj, name, value) {
      release || assert (!Object.prototype.hasOwnProperty.call(obj, name), "Property: " + name + " already exits.");
      ObjectUtilities.defineNonEnumerableProperty(obj, name, value);
    }
  }

  export module FunctionUtilities {
    export function makeForwardingGetter(target: string): () => any {
      return <() => any> new Function("return this[\"" + target + "\"]");
    }

    export function makeForwardingSetter(target: string): (any) => void {
      return <(any) => void> new Function("value", "this[\"" + target + "\"] = value;");
    }

    /**
     * Attaches a property to the bound function so we can detect when if it
     * ever gets rebound.
     */
    export function bindSafely(fn: Function, object: Object) {
      release || Debug.assert (!fn.boundTo && object);
      var f = fn.bind(object);
      f.boundTo = object;
      return f;
    }
  }

  export module StringUtilities {
    export function toSafeString(value) {
      if (typeof value === "string") {
        return "\"" + value + "\"";
      }
      if (typeof value === "number" || typeof value === "boolean") {
        return String(value);
      }
      return typeof value;
    }

    export function toSafeArrayString(array) {
      var str = [];
      for (var i = 0; i < array.length; i++) {
        str.push(toSafeString(array[i]));
      }
      return str.join(", ");
    }

    export function utf8decode(str: string): Uint8Array {
      var bytes = new Uint8Array(str.length * 4);
      var b = 0;
      for (var i = 0, j = str.length; i < j; i++) {
        var code = str.charCodeAt(i);
        if (code <= 0x7f) {
          bytes[b++] = code;
          continue;
        }

        if (0xD800 <= code && code <= 0xDBFF) {
          var codeLow = str.charCodeAt(i + 1);
          if (0xDC00 <= codeLow && codeLow <= 0xDFFF) {
            // convert only when both high and low surrogates are present
            code = ((code & 0x3FF) << 10) + (codeLow & 0x3FF) + 0x10000;
            ++i;
          }
        }

        if ((code & 0xFFE00000) !== 0) {
          bytes[b++] = 0xF8 | ((code >>> 24) & 0x03);
          bytes[b++] = 0x80 | ((code >>> 18) & 0x3F);
          bytes[b++] = 0x80 | ((code >>> 12) & 0x3F);
          bytes[b++] = 0x80 | ((code >>> 6) & 0x3F);
          bytes[b++] = 0x80 | (code & 0x3F);
        } else if ((code & 0xFFFF0000) !== 0) {
          bytes[b++] = 0xF0 | ((code >>> 18) & 0x07);
          bytes[b++] = 0x80 | ((code >>> 12) & 0x3F);
          bytes[b++] = 0x80 | ((code >>> 6) & 0x3F);
          bytes[b++] = 0x80 | (code & 0x3F);
        } else if ((code & 0xFFFFF800) !== 0) {
          bytes[b++] = 0xE0 | ((code >>> 12) & 0x0F);
          bytes[b++] = 0x80 | ((code >>> 6) & 0x3F);
          bytes[b++] = 0x80 | (code & 0x3F);
        } else {
          bytes[b++] = 0xC0 | ((code >>> 6) & 0x1F);
          bytes[b++] = 0x80 | (code & 0x3F);
        }
      }
      return bytes.subarray(0, b);
    }

    export function utf8encode(bytes: Uint8Array): string {
      var j = 0, str = "";
      while (j < bytes.length) {
        var b1 = bytes[j++] & 0xFF;
        if (b1 <= 0x7F) {
          str += String.fromCharCode(b1);
        } else {
          var currentPrefix = 0xC0;
          var validBits = 5;
          do {
            var mask = (currentPrefix >> 1) | 0x80;
            if((b1 & mask) === currentPrefix) break;
            currentPrefix = (currentPrefix >> 1) | 0x80;
            --validBits;
          } while (validBits >= 0);

          if (validBits <= 0) {
            // Invalid UTF8 character -- copying as is
            str += String.fromCharCode(b1);
            continue;
          }
          var code = (b1 & ((1 << validBits) - 1));
          var invalid = false;
          for (var i = 5; i >= validBits; --i) {
            var bi = bytes[j++];
            if ((bi & 0xC0) != 0x80) {
              // Invalid UTF8 character sequence
              invalid = true;
              break;
            }
            code = (code << 6) | (bi & 0x3F);
          }
          if (invalid) {
            // Copying invalid sequence as is
            for (var k = j - (7 - i); k < j; ++k) {
              str += String.fromCharCode(bytes[k] & 255);
            }
            continue;
          }
          if (code >= 0x10000) {
            str += String.fromCharCode((((code - 0x10000) >> 10) & 0x3FF) |
              0xD800, (code & 0x3FF) | 0xDC00);
          } else {
            str += String.fromCharCode(code);
          }
        }
      }
      return str;
    }

    // https://gist.github.com/958841
    export function base64ArrayBuffer(arrayBuffer: ArrayBuffer) {
      var base64 = '';
      var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

      var bytes = new Uint8Array(arrayBuffer);
      var byteLength = bytes.byteLength;
      var byteRemainder = byteLength % 3;
      var mainLength = byteLength - byteRemainder;

      var a, b, c, d;
      var chunk;

      // Main loop deals with bytes in chunks of 3
      for (var i = 0; i < mainLength; i = i + 3) {
        // Combine the three bytes into a single integer
        chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];

        // Use bitmasks to extract 6-bit segments from the triplet
        a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
        b = (chunk & 258048) >> 12; // 258048 = (2^6 - 1) << 12
        c = (chunk & 4032) >> 6; // 4032 = (2^6 - 1) << 6
        d = chunk & 63; // 63 = 2^6 - 1

        // Convert the raw binary segments to the appropriate ASCII encoding
        base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
      }

      // Deal with the remaining bytes and padding
      if (byteRemainder == 1) {
        chunk = bytes[mainLength];

        a = (chunk & 252) >> 2; // 252 = (2^6 - 1) << 2

        // Set the 4 least significant bits to zero
        b = (chunk & 3) << 4; // 3 = 2^2 - 1

        base64 += encodings[a] + encodings[b] + '==';
      } else if (byteRemainder == 2) {
        chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];

        a = (chunk & 64512) >> 10; // 64512 = (2^6 - 1) << 10
        b = (chunk & 1008) >> 4; // 1008 = (2^6 - 1) << 4

        // Set the 2 least significant bits to zero
        c = (chunk & 15) << 2; // 15 = 2^4 - 1

        base64 += encodings[a] + encodings[b] + encodings[c] + '=';
      }
      return base64;
    }

    export function escapeString(str: string) {
      if (str !== undefined) {
        str = str.replace(/[^\w$]/gi,"$"); /* No dots, colons, dashes and /s */
        if (/^\d/.test(str)) { /* No digits at the beginning */
          str = '$' + str;
        }
      }
      return str;
    }

    /**
     * Workaround for max stack size limit.
     */
    export function fromCharCodeArray(buffer: Uint8Array): string {
      var str = "", SLICE = 1024 * 16;
      for (var i = 0; i < buffer.length; i += SLICE) {
        var chunk = Math.min(buffer.length - i, SLICE);
        str += String.fromCharCode.apply(null, buffer.subarray(i, i + chunk));
      }
      return str;
    }

    var _encoding = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$_';
    export function variableLengthEncodeInt32(n) {
      var e = _encoding;
      var bitCount = (32 - Math.clz32(n));
      assert (bitCount <= 32, bitCount);
      var l = Math.ceil(bitCount / 6);
      // Encode length followed by six bit chunks.
      var s = e[l];
      for (var i = l - 1; i >= 0; i--) {
        var offset = (i * 6);
        s += e[(n >> offset) & 0x3F];
      }
      release || assert (StringUtilities.variableLengthDecodeInt32(s) === n, n + " : " + s + " - " + l + " bits: " + bitCount);
      return s;
    }

    export function toEncoding(n) {
      return _encoding[n];
    }

    export function fromEncoding(s) {
      var c = s.charCodeAt(0);
      var e = 0;
      if (c >= 65 && c <= 90) {
        return c - 65;
      } else if (c >= 97 && c <= 122) {
        return c - 71;
      } else if (c >= 48 && c <= 57) {
        return c + 4;
      } else if (c === 36) {
        return 62;
      } else if (c === 95) {
        return 63;
      }
      assert (false, "Invalid Encoding");
    }

    export function variableLengthDecodeInt32(s) {
      var l = StringUtilities.fromEncoding(s[0]);
      var n = 0;
      for (var i = 0; i < l; i++) {
        var offset = ((l - i - 1) * 6);
        n |= StringUtilities.fromEncoding(s[1 + i]) << offset;
      }
      return n;
    }

    export function trimMiddle(s: string, maxLength: number): string {
      if (s.length <= maxLength) {
        return s;
      }
      var leftHalf = maxLength >> 1;
      var rightHalf = maxLength - leftHalf - 1;
      return s.substr(0, leftHalf) + "\u2026" + s.substr(s.length - rightHalf, rightHalf);
    }

    export function multiple(s: string, count: number): string {
      var o = "";
      for (var i = 0; i < count; i++) {
        o += s;
      }
      return o;
    }
  }

  export module HashUtilities {
    var _md5R = new Uint8Array([
      7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
      5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
      4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
      6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21]);

    var _md5K = new Int32Array([
      -680876936, -389564586, 606105819, -1044525330, -176418897, 1200080426,
      -1473231341, -45705983, 1770035416, -1958414417, -42063, -1990404162,
      1804603682, -40341101, -1502002290, 1236535329, -165796510, -1069501632,
      643717713, -373897302, -701558691, 38016083, -660478335, -405537848,
      568446438, -1019803690, -187363961, 1163531501, -1444681467, -51403784,
      1735328473, -1926607734, -378558, -2022574463, 1839030562, -35309556,
      -1530992060, 1272893353, -155497632, -1094730640, 681279174, -358537222,
      -722521979, 76029189, -640364487, -421815835, 530742520, -995338651,
      -198630844, 1126891415, -1416354905, -57434055, 1700485571, -1894986606,
      -1051523, -2054922799, 1873313359, -30611744, -1560198380, 1309151649,
      -145523070, -1120210379, 718787259, -343485551]);

    export function hashBytesTo32BitsMD5(data: Uint8Array, offset: number, length: number): number {
      var r = _md5R;
      var k = _md5K;
      var h0 = 1732584193, h1 = -271733879, h2 = -1732584194, h3 = 271733878;
      // pre-processing
      var paddedLength = (length + 72) & ~63; // data + 9 extra bytes
      var padded = new Uint8Array(paddedLength);
      var i, j, n;
      for (i = 0; i < length; ++i) {
        padded[i] = data[offset++];
      }
      padded[i++] = 0x80;
      n = paddedLength - 8;
      while (i < n) {
        padded[i++] = 0;
      }
      padded[i++] = (length << 3) & 0xFF;
      padded[i++] = (length >> 5) & 0xFF;
      padded[i++] = (length >> 13) & 0xFF;
      padded[i++] = (length >> 21) & 0xFF;
      padded[i++] = (length >>> 29) & 0xFF;
      padded[i++] = 0;
      padded[i++] = 0;
      padded[i++] = 0;
      // chunking
      // TODO ArrayBuffer ?
      var w = new Int32Array(16);
      for (i = 0; i < paddedLength;) {
        for (j = 0; j < 16; ++j, i += 4) {
          w[j] = (padded[i] | (padded[i + 1] << 8) |
            (padded[i + 2] << 16) | (padded[i + 3] << 24));
        }
        var a = h0, b = h1, c = h2, d = h3, f, g;
        for (j = 0; j < 64; ++j) {
          if (j < 16) {
            f = (b & c) | ((~b) & d);
            g = j;
          } else if (j < 32) {
            f = (d & b) | ((~d) & c);
            g = (5 * j + 1) & 15;
          } else if (j < 48) {
            f = b ^ c ^ d;
            g = (3 * j + 5) & 15;
          } else {
            f = c ^ (b | (~d));
            g = (7 * j) & 15;
          }
          var tmp = d, rotateArg = (a + f + k[j] + w[g]) | 0, rotate = r[j];
          d = c;
          c = b;
          b = (b + ((rotateArg << rotate) | (rotateArg >>> (32 - rotate)))) | 0;
          a = tmp;
        }
        h0 = (h0 + a) | 0;
        h1 = (h1 + b) | 0;
        h2 = (h2 + c) | 0;
        h3 = (h3 + d) | 0;
      }
      return h0;
    }

    export function hashBytesTo32BitsAdler(data: Uint8Array, offset: number, length: number): number {
      var a = 1;
      var b = 0;
      var end = offset + length;
      for (var i = offset; i < end; ++i) {
        a = (a + (data[i] & 0xff)) % 65521;
        b = (b + a) % 65521;
      }
      return (b << 16) | a;
    }
  }

  /**
   * Marsaglia's algorithm, adapted from V8. Use this if you want a deterministic random number.
   */
  export class Random {
    private static _state: Uint32Array = new Uint32Array([0xDEAD, 0xBEEF]);

    public static seed(seed: number) {
      Random._state[0] = seed;
      Random._state[1] = seed;
    }

    public static next(): number {
      var s = this._state;
      var r0 = (Math.imul(18273, s[0] & 0xFFFF) + (s[0] >>> 16)) | 0;
      s[0] = r0;
      var r1 = (Math.imul(36969, s[1] & 0xFFFF) + (s[1] >>> 16)) | 0;
      s[1] = r1;
      var x = ((r0 << 16) + (r1 & 0xFFFF)) | 0;
      // Division by 0x100000000 through multiplication by reciprocal.
      return (x < 0 ? (x + 0x100000000) : x) * 2.3283064365386962890625e-10;
    }
  }

  Math.random = function random(): number {
    return Random.next();
  };

  function polyfillWeakMap() {
    if (typeof jsGlobal.WeakMap === 'function') {
      return; // weak map is supported
    }
    var id = 0;
    function WeakMap() {
      this.id = '$weakmap' + (id++);
    };
    WeakMap.prototype = {
      has: function(obj) {
        return obj.hasOwnProperty(this.id);
      },
      get: function(obj, defaultValue) {
        return obj.hasOwnProperty(this.id) ? obj[this.id] : defaultValue;
      },
      set: function(obj, value) {
        Object.defineProperty(obj, this.id, {
          value: value,
          enumerable: false,
          configurable: true
        });
      }
    };
    jsGlobal.WeakMap = WeakMap;
  }

  polyfillWeakMap();

  export module NumberUtilities {
    export function pow2(exponent: number): number {
      if (exponent === (exponent | 0)) {
        if (exponent < 0) {
          return 1 / (1 << -exponent);
        }
        return 1 << exponent;
      }
      return Math.pow(2, exponent);
    }

    export function clamp(value: number, min: number, max: number) {
      return Math.max(min, Math.min(max, value));
    }

    /**
     * Rounds *.5 to the nearest even number.
     * See https://en.wikipedia.org/wiki/Rounding#Round_half_to_even for details.
     */
    export function roundHalfEven(value: number): number {
      if (Math.abs(value % 1) === 0.5) {
        var floor = Math.floor(value);
        return floor % 2 === 0 ? floor : Math.ceil(value);
      }
      return Math.round(value);
    }
  }

  export enum Numbers {
    MaxU16 = 0xFFFF,
    MaxI16 = 0x7FFF,
    MinI16 = -0x8000
  }

  export module IntegerUtilities {
    var sharedBuffer = new ArrayBuffer(8);
    var i8 = new Int8Array(sharedBuffer);
    var i32 = new Int32Array(sharedBuffer);
    var f32 = new Float32Array(sharedBuffer);
    var f64 = new Float64Array(sharedBuffer);
    var nativeLittleEndian = new Int8Array(new Int32Array([1]).buffer)[0] === 1;

    /**
     * Convert a float into 32 bits.
     */
    export function floatToInt32(v: number) {
      f32[0] = v; return i32[0];
    }

    /**
     * Convert 32 bits into a float.
     */
    export function int32ToFloat(i: number) {
      i32[0] = i; return f32[0];
    }

    /**
     * Swap the bytes of a 16 bit number.
     */
    export function swap16(i: number) {
      return ((i & 0xFF) << 8) | ((i >> 8) & 0xFF);
    }

    /**
     * Swap the bytes of a 32 bit number.
     */
    export function swap32(i: number) {
      return ((i & 0xFF) << 24) | ((i & 0xFF00) << 8) | ((i >> 8) & 0xFF00) | ((i >> 24) & 0xFF);
    }

    /**
     * Converts a number to s8.u8 fixed point representation.
     */
    export function toS8U8(v: number) {
      return ((v * 256) << 16) >> 16;
    }

    /**
     * Converts a number from s8.u8 fixed point representation.
     */
    export function fromS8U8(i: number) {
      return i / 256;
    }

    /**
     * Round trips a number through s8.u8 conversion.
     */
    export function clampS8U8(v: number) {
      return fromS8U8(toS8U8(v));
    }

    /**
     * Converts a number to signed 16 bits.
     */
    export function toS16(v: number) {
      return (v << 16) >> 16;
    }

    export function bitCount(i: number): number {
      i = i - ((i >> 1) & 0x55555555);
      i = (i & 0x33333333) + ((i >> 2) & 0x33333333);
      return (((i + (i >> 4)) & 0x0F0F0F0F) * 0x01010101) >> 24;
    }

    export function ones(i: number): number {
      i = i - ((i >> 1) & 0x55555555);
      i = (i & 0x33333333) + ((i >> 2) & 0x33333333);
      return ((i + (i >> 4) & 0xF0F0F0F) * 0x1010101) >> 24;
    }

    export function trailingZeros(i: number): number {
      return IntegerUtilities.ones((i & -i) - 1);
    }

    export function getFlags(i: number, flags: string[]): string {
      var str = "";
      for (var i = 0; i < flags.length; i++) {
        if (i & (1 << i)) {
          str += flags[i] + " ";
        }
      }
      if (str.length === 0) {
        return "";
      }
      return str.trim();
    }

    export function isPowerOfTwo(x: number) {
      return x && ((x & (x - 1)) === 0);
    }

    export function nearestPowerOfTwo(x: number) {
      x --;
      x |= x >> 1;
      x |= x >> 2;
      x |= x >> 4;
      x |= x >> 8;
      x |= x >> 16;
      x ++;
      return x;
    }

    export function roundToMultipleOfPowerOfTwo(i: number, powerOfTwo: number) {
      var x = (1 << powerOfTwo) - 1;
      return (i + x) & ~x; // Round up to multiple of power of two.
    }

    /**
     * Polyfill imul.
     */
    if (!Math.imul) {
      Math.imul = function imul(a, b) {
        var ah  = (a >>> 16) & 0xffff;
        var al = a & 0xffff;
        var bh  = (b >>> 16) & 0xffff;
        var bl = b & 0xffff;
        // the shift by 0 fixes the sign on the high part
        // the final |0 converts the unsigned value into a signed value
        return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0) | 0);
      }
    }

    /**
     * Polyfill clz32.
     */
    if (!Math.clz32) {
      Math.clz32 = function clz32(i: number) {
        i |= (i >> 1);
        i |= (i >> 2);
        i |= (i >> 4);
        i |= (i >> 8);
        i |= (i >> 16);
        return 32 - IntegerUtilities.ones(i);
      }
    }
  }

  export module GeometricUtilities {
    /**
     * Crossing numeber tests to check if a point is inside a polygon. The polygon is given as
     * an array of n + 1 float pairs where the last is equal to the first.
     *
     * http://geomalgorithms.com/a03-_inclusion.html
     */
    export function pointInPolygon(x: number, y: number, polygon: Float32Array): boolean {
      // assert (((polygon.length & 1) === 0) && polygon.length >= 8);
      // assert (polygon[0] === polygon[polygon.length - 2] &&
      //        polygon[1] === polygon[polygon.length - 1], "First and last points should be equal.");
      var crosses = 0;
      var n = polygon.length - 2;
      var p = polygon;

      for (var i = 0; i < n; i += 2) {
        var x0 = p[i + 0];
        var y0 = p[i + 1];
        var x1 = p[i + 2];
        var y1 = p[i + 3];
        if (((y0 <= y) && (y1 > y)) || ((y0 > y) && (y1 <= y))) {
          var t = (y  - y0) / (y1 - y0);
          if (x < x0 + t * (x1 - x0)) {
            crosses ++;
          }
        }
      }
      return (crosses & 1) === 1;
    }

    /**
     * Signed area of a triangle. If zero then points are collinear, if < 0 then points
     * are clockwise otherwise counter-clockwise.
     */
    export function signedArea(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number): number {
      return (x1 - x0) * (y2 - y0) - (y1 - y0) * (x2 - x0);
    }

    export function counterClockwise(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number): boolean {
      return signedArea(x0, y0, x1, y1, x2, y2) > 0;
    }

    export function clockwise(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number): boolean {
      return signedArea(x0, y0, x1, y1, x2, y2) < 0;
    }

    export function pointInPolygonInt32(x: number, y: number, polygon: Int32Array): boolean {
      // assert (((polygon.length & 1) === 0) && polygon.length >= 8);
      // assert (polygon[0] === polygon[polygon.length - 2] &&
      //        polygon[1] === polygon[polygon.length - 1], "First and last points should be equal.");
      x = x | 0;
      y = y | 0;
      var crosses = 0;
      var n = polygon.length - 2;
      var p = polygon;

      for (var i = 0; i < n; i += 2) {
        var x0 = p[i + 0];
        var y0 = p[i + 1];
        var x1 = p[i + 2];
        var y1 = p[i + 3];
        if (((y0 <= y) && (y1 > y)) || ((y0 > y) && (y1 <= y))) {
          var t = (y  - y0) / (y1 - y0);
          if (x < x0 + t * (x1 - x0)) {
            crosses ++;
          }

        }
      }
      return (crosses & 1) === 1;
    }
  }

  export class IndentingWriter {
    public static PURPLE = '\033[94m';
    public static YELLOW = '\033[93m';
    public static GREEN = '\033[92m';
    public static RED = '\033[91m';
    public static ENDC = '\033[0m';
    private static _consoleOutFn = inBrowser ? console.info.bind(console) : print;

    private _tab: string;
    private _padding: string;
    private _suppressOutput: boolean;
    private _out: (s: string) => void;

    constructor(suppressOutput: boolean = false, outFn?) {
      this._tab = "  ";
      this._padding = "";
      this._suppressOutput = suppressOutput;
      this._out = outFn || IndentingWriter._consoleOutFn;
    }

    writeLn(str: string = "") {
      if (!this._suppressOutput) {
        this._out(this._padding + str);
      }
    }

    writeComment(str: string) {
      var lines = str.split("\n");
      if (lines.length === 1) {
        this.writeLn("// " + lines[0]);
      } else {
        this.writeLn("/**");
        for (var i = 0; i < lines.length; i++) {
          this.writeLn(" * " + lines[i]);
        }
        this.writeLn(" */");
      }
    }

    writeLns(str: string) {
      var lines = str.split("\n");
      for (var i = 0; i < lines.length; i++) {
        this.writeLn(lines[i]);
      }
    }

    debugLn(str: string) {
      this.colorLn(IndentingWriter.PURPLE, str);
    }

    yellowLn(str: string) {
      this.colorLn(IndentingWriter.YELLOW, str);
    }

    greenLn(str: string) {
      this.colorLn(IndentingWriter.GREEN, str);
    }

    redLn(str: string) {
      this.colorLn(IndentingWriter.RED, str);
    }

    warnLn(str: string) {
      this.yellowLn(str);
    }

    colorLn(color: string, str: string) {
      if (!this._suppressOutput) {
        if (!inBrowser) {
          this._out(this._padding + color + str + IndentingWriter.ENDC);
        } else {
          this._out(this._padding + str);
        }
      }
    }

    enter(str: string) {
      if (!this._suppressOutput) {
        this._out(this._padding + str);
      }
      this.indent();
    }

    leaveAndEnter(str: string) {
      this.leave(str);
      this.indent();
    }

    leave(str: string) {
      this.outdent();
      if (!this._suppressOutput) {
        this._out(this._padding + str);
      }
    }

    indent() {
      this._padding += this._tab;
    }

    outdent() {
      if (this._padding.length > 0) {
        this._padding = this._padding.substring(0, this._padding.length - this._tab.length);
      }
    }

    writeArray(arr: any[], detailed: boolean = false, noNumbers: boolean = false) {
      detailed = detailed || false;
      for (var i = 0, j = arr.length; i < j; i++) {
        var prefix = "";
        if (detailed) {
          if (arr[i] === null) {
            prefix = "null";
          } else if (arr[i] === undefined) {
            prefix = "undefined";
          } else {
            prefix = arr[i].constructor.name;
          }
          prefix += " ";
        }
        var number = noNumbers ? "" : ("" + i).padRight(' ', 4);
        this.writeLn(number + prefix + arr[i]);
      }
    }
  }

  /**
   * Insertion sort SortedList backed by a linked list.
   */
  class SortedListNode<T> {
    value: T;
    next: SortedListNode<T>;
    constructor(value: T, next: SortedListNode<T>) {
      this.value = value;
      this.next = next;
    }
  }

  export class SortedList<T>  {
    public static RETURN = 1;
    public static DELETE = 2;
    private _compare: (l: T, r: T) => number;
    private _head: SortedListNode<T>;
    private _length: number;

    constructor (compare: (l: T, r: T) => number) {
      release || assert(compare);
      this._compare = compare;
      this._head = null;
      this._length = 0;
    }

    public push(value: T) {
      release || assert(value !== undefined);
      this._length ++;
      if (!this._head) {
        this._head = new SortedListNode<T>(value, null);
        return;
      }

      var curr = this._head;
      var prev = null;
      var node = new SortedListNode<T>(value, null);
      var compare = this._compare;
      while (curr) {
        if (compare(curr.value, node.value) > 0) {
          if (prev) {
            node.next = curr;
            prev.next = node;
          } else {
            node.next = this._head;
            this._head = node;
          }
          return;
        }
        prev = curr;
        curr = curr.next;
      }
      prev.next = node;
    }

    /**
     * Visitors can return RETURN if they wish to stop the iteration or DELETE if they need to delete the current node.
     * NOTE: DELETE most likley doesn't work if there are multiple active iterations going on.
     */
    public forEach(visitor: (value: T) => any) {
      var curr = this._head;
      var last = null;
      while (curr) {
        var result = visitor(curr.value);
        if (result === SortedList.RETURN) {
          return;
        } else if (result === SortedList.DELETE) {
          if (!last) {
            curr = this._head = this._head.next;
          } else {
            curr = last.next = curr.next;
          }
        } else {
          last = curr;
          curr = curr.next;
        }
      }
    }

    public isEmpty(): boolean {
      return !this._head;
    }

    public pop(): T {
      if (!this._head) {
        return undefined;
      }
      this._length --;
      var ret = this._head;
      this._head = this._head.next;
      return ret.value;
    }

    public contains(value: T): boolean {
      var curr = this._head;
      while (curr) {
        if (curr.value === value) {
          return true;
        }
        curr = curr.next;
      }
      return false;
    }

    public toString(): string {
      var str = "[";
      var curr = this._head;
      while (curr) {
        str += curr.value.toString();
        curr = curr.next;
        if (curr) {
          str += ",";
        }
      }
      str += "]";
      return str;
    }
  }

  export class CircularBuffer {
    index: number;
    start: number;
    array: ArrayBufferView;
    _size: number;
    _mask: number;
    constructor(Type, sizeInBits: number = 12) {
      this.index = 0;
      this.start = 0;
      this._size = 1 << sizeInBits;
      this._mask = this._size - 1;
      this.array = new Type(this._size);
    }
    public get (i) {
      return this.array[i];
    }

    public forEachInReverse(visitor) {
      if (this.isEmpty()) {
        return;
      }
      var i = this.index === 0 ? this._size - 1 : this.index - 1;
      while (i !== this.start) {
        if (visitor(this.array[i], i)) {
          break;
        }
        i = i === 0 ? this._size - 1 : i - 1;
      }
    }

    public write(value) {
      this.array[this.index] = value;
      this.index = (this.index + 1) & this._mask;
      if (this.index === this.start) {
        this.start = (this.start + 1) & this._mask;
      }
    }

    public isFull(): boolean {
      return ((this.index + 1) & this._mask) === this.start;
    }

    public isEmpty(): boolean  {
      return this.index === this.start;
    }

    public reset() {
      this.index = 0;
      this.start = 0;
    }
  }

  export module BitSets {
    export var ADDRESS_BITS_PER_WORD = 5;
    export var BITS_PER_WORD = 1 << ADDRESS_BITS_PER_WORD;
    export var BIT_INDEX_MASK = BITS_PER_WORD - 1;

    function getSize(length): number {
      return ((length + (BITS_PER_WORD - 1)) >> ADDRESS_BITS_PER_WORD) << ADDRESS_BITS_PER_WORD;
    }

    export interface BitSet {
      set: (i) => void;
      setAll: () => void;
      assign: (set: BitSet) => void;
      clear: (i: number) => void;
      get: (i: number) => boolean;
      clearAll: () => void;
      intersect: (other: BitSet) => void;
      subtract: (other: BitSet) => void;
      negate: () => void;
      forEach: (fn) => void;
      toArray: () => boolean [];
      equals: (other: BitSet) => boolean;
      contains: (other: BitSet) => boolean;
      isEmpty: () => boolean;
      clone: () => BitSet;
      recount: () => void;
      toString: (names: string []) => string;
      toBitString: (on: string, off: string) => string;
    }

    function toBitString(on: string, off: string) {
      var self: BitSet = this;
      on = on || "1";
      off = off || "0";
      var str = "";
      for (var i = 0; i < length; i++) {
        str += self.get(i) ? on : off;
      }
      return str;
    }

    function toString(names: string []) {
      var self: BitSet = this;
      var set = [];
      for (var i = 0; i < length; i++) {
        if (self.get(i)) {
          set.push(names ? names[i] : i);
        }
      }
      return set.join(", ");
    }

    export class Uint32ArrayBitSet implements BitSet {
      size: number;
      bits: Uint32Array;
      count: number;
      dirty: number;
      length: number;

      constructor(length: number) {
        this.size = getSize(length);
        this.count = 0;
        this.dirty = 0;
        this.length = length;
        this.bits = new Uint32Array(this.size >> ADDRESS_BITS_PER_WORD);
      }

      recount() {
        if (!this.dirty) {
          return;
        }

        var bits = this.bits;
        var c = 0;
        for (var i = 0, j = bits.length; i < j; i++) {
          var v = bits[i];
          v = v - ((v >> 1) & 0x55555555);
          v = (v & 0x33333333) + ((v >> 2) & 0x33333333);
          c += ((v + (v >> 4) & 0xF0F0F0F) * 0x1010101) >> 24;
        }

        this.count = c;
        this.dirty = 0;
      }

      set(i) {
        var n = i >> ADDRESS_BITS_PER_WORD;
        var old = this.bits[n];
        var b = old | (1 << (i & BIT_INDEX_MASK));
        this.bits[n] = b;
        this.dirty |= old ^ b;
      }

      setAll() {
        var bits = this.bits;
        for (var i = 0, j = bits.length; i < j; i++) {
          bits[i] = 0xFFFFFFFF;
        }
        this.count = this.size;
        this.dirty = 0;
      }

      assign(set) {
        this.count = set.count;
        this.dirty = set.dirty;
        this.size = set.size;
        for (var i = 0, j = this.bits.length; i < j; i++) {
          this.bits[i] = set.bits[i];
        }
      }

      clear(i) {
        var n = i >> ADDRESS_BITS_PER_WORD;
        var old = this.bits[n];
        var b = old & ~(1 << (i & BIT_INDEX_MASK));
        this.bits[n] = b;
        this.dirty |= old ^ b;
      }

      get(i): boolean {
        var word = this.bits[i >> ADDRESS_BITS_PER_WORD];
        return ((word & 1 << (i & BIT_INDEX_MASK))) !== 0;
      }

      clearAll() {
        var bits = this.bits;
        for (var i = 0, j = bits.length; i < j; i++) {
          bits[i] = 0;
        }
        this.count = 0;
        this.dirty = 0;
      }

      private _union(other: Uint32ArrayBitSet) {
        var dirty = this.dirty;
        var bits = this.bits;
        var otherBits = other.bits;
        for (var i = 0, j = bits.length; i < j; i++) {
          var old = bits[i];
          var b = old | otherBits[i];
          bits[i] = b;
          dirty |= old ^ b;
        }
        this.dirty = dirty;
      }

      intersect(other: Uint32ArrayBitSet) {
        var dirty = this.dirty;
        var bits = this.bits;
        var otherBits = other.bits;
        for (var i = 0, j = bits.length; i < j; i++) {
          var old = bits[i];
          var b = old & otherBits[i];
          bits[i] = b;
          dirty |= old ^ b;
        }
        this.dirty = dirty;
      }

      subtract(other: Uint32ArrayBitSet) {
        var dirty = this.dirty;
        var bits = this.bits;
        var otherBits = other.bits;
        for (var i = 0, j = bits.length; i < j; i++) {
          var old = bits[i];
          var b = old & ~otherBits[i];
          bits[i] = b;
          dirty |= old ^ b;
        }
        this.dirty = dirty;
      }

      negate() {
        var dirty = this.dirty;
        var bits = this.bits;
        for (var i = 0, j = bits.length; i < j; i++) {
          var old = bits[i];
          var b = ~old;
          bits[i] = b;
          dirty |= old ^ b;
        }
        this.dirty = dirty;
      }

      forEach(fn) {
        release || assert(fn);
        var bits = this.bits;
        for (var i = 0, j = bits.length; i < j; i++) {
          var word = bits[i];
          if (word) {
            for (var k = 0; k < BITS_PER_WORD; k++) {
              if (word & (1 << k)) {
                fn(i * BITS_PER_WORD + k);
              }
            }
          }
        }
      }

      toArray() {
        var set = [];
        var bits = this.bits;
        for (var i = 0, j = bits.length; i < j; i++) {
          var word = bits[i];
          if (word) {
            for (var k = 0; k < BITS_PER_WORD; k++) {
              if (word & (1 << k)) {
                set.push(i * BITS_PER_WORD + k);
              }
            }
          }
        }
        return set;
      }

      equals(other: Uint32ArrayBitSet) {
        if (this.size !== other.size) {
          return false;
        }
        var bits = this.bits;
        var otherBits = other.bits;
        for (var i = 0, j = bits.length; i < j; i++) {
          if (bits[i] !== otherBits[i]) {
            return false;
          }
        }
        return true;
      }

      contains(other: Uint32ArrayBitSet) {
        if (this.size !== other.size) {
          return false;
        }
        var bits = this.bits;
        var otherBits = other.bits;
        for (var i = 0, j = bits.length; i < j; i++) {
          if ((bits[i] | otherBits[i]) !== bits[i]) {
            return false;
          }
        }
        return true;
      }

      toBitString: (on: string, off: string) => string;
      toString: (names: string []) => string;

      isEmpty(): boolean {
        this.recount();
        return this.count === 0;
      }

      clone(): Uint32ArrayBitSet {
        var set = new Uint32ArrayBitSet(this.length);
        set._union(this);
        return set;
      }
    }

    export class Uint32BitSet implements BitSet {
      size: number;
      bits: number;
      count: number;
      dirty: number;
      singleWord: boolean;
      length: number;
      constructor(length: number) {
        this.count = 0;
        this.dirty = 0;
        this.size = getSize(length);
        this.bits = 0;
        this.singleWord = true;
        this.length = length;
      }

      recount() {
        if (!this.dirty) {
          return;
        }

        var c = 0;
        var v = this.bits;
        v = v - ((v >> 1) & 0x55555555);
        v = (v & 0x33333333) + ((v >> 2) & 0x33333333);
        c += ((v + (v >> 4) & 0xF0F0F0F) * 0x1010101) >> 24;

        this.count = c;
        this.dirty = 0;
      }

      set(i) {
        var old = this.bits;
        var b = old | (1 << (i & BIT_INDEX_MASK));
        this.bits = b;
        this.dirty |= old ^ b;
      }

      setAll() {
        this.bits = 0xFFFFFFFF;
        this.count = this.size;
        this.dirty = 0;
      }

      assign(set: Uint32BitSet) {
        this.count = set.count;
        this.dirty = set.dirty;
        this.size = set.size;
        this.bits = set.bits;
      }

      clear(i: number) {
        var old = this.bits;
        var b = old & ~(1 << (i & BIT_INDEX_MASK));
        this.bits = b;
        this.dirty |= old ^ b;
      }

      get(i: number): boolean {
        return ((this.bits & 1 << (i & BIT_INDEX_MASK))) !== 0;
      }

      clearAll() {
        this.bits = 0;
        this.count = 0;
        this.dirty = 0;
      }

      private _union(other: Uint32BitSet) {
        var old = this.bits;
        var b = old | other.bits;
        this.bits = b;
        this.dirty = old ^ b;
      }

      intersect(other: Uint32BitSet) {
        var old = this.bits;
        var b = old & other.bits;
        this.bits = b;
        this.dirty = old ^ b;
      }

      subtract(other: Uint32BitSet) {
        var old = this.bits;
        var b = old & ~other.bits;
        this.bits = b;
        this.dirty = old ^ b;
      }

      negate() {
        var old = this.bits;
        var b = ~old;
        this.bits = b;
        this.dirty = old ^ b;
      }

      forEach(fn) {
        release || assert(fn);
        var word = this.bits;
        if (word) {
          for (var k = 0; k < BITS_PER_WORD; k++) {
            if (word & (1 << k)) {
              fn(k);
            }
          }
        }
      }

      toArray(): boolean [] {
        var set = [];
        var word = this.bits;
        if (word) {
          for (var k = 0; k < BITS_PER_WORD; k++) {
            if (word & (1 << k)) {
              set.push(k);
            }
          }
        }
        return set;
      }

      equals(other: Uint32BitSet) {
        return this.bits === other.bits;
      }

      contains(other: Uint32BitSet) {
        var bits = this.bits;
        return (bits | other.bits) === bits;
      }

      toBitString: (on: string, off: string) => string;
      toString: (names: string []) => string;

      isEmpty(): boolean {
        this.recount();
        return this.count === 0;
      }

      clone(): Uint32BitSet {
        var set = new Uint32BitSet(this.length);
        set._union(this);
        return set;
      }
    }

    Uint32BitSet.prototype.toString = toString;
    Uint32BitSet.prototype.toBitString = toBitString;
    Uint32ArrayBitSet.prototype.toString = toString;
    Uint32ArrayBitSet.prototype.toBitString = toBitString;

    export function BitSetFunctor(length: number) {
      var shouldUseSingleWord = (getSize(length) >> ADDRESS_BITS_PER_WORD) === 1;
      var type = (shouldUseSingleWord ? <any>Uint32BitSet : <any>Uint32ArrayBitSet);
      return function () {
        return new type(length);
      }
    }
  }

  export class ColorStyle {
    static TabToolbar = "#252c33";
    static Toolbars = "#343c45";
    static HighlightBlue = "#1d4f73";
    static LightText = "#f5f7fa";
    static ForegroundText = "#b6babf";
    static Black = "#000000";
    static VeryDark = "#14171a";
    static Dark = "#181d20";
    static Light = "#a9bacb";
    static Grey = "#8fa1b2";
    static DarkGrey = "#5f7387";
    static Blue = "#46afe3";
    static Purple = "#6b7abb";
    static Pink = "#df80ff";
    static Red = "#eb5368";
    static Orange = "#d96629";
    static LightOrange = "#d99b28";
    static Green = "#70bf53";
    static BlueGrey = "#5e88b0";

    private static _randomStyleCache;
    private static _nextStyle = 0;

    static randomStyle() {
      if (!ColorStyle._randomStyleCache) {
        ColorStyle._randomStyleCache = [
          "#ff5e3a",
          "#ff9500",
          "#ffdb4c",
          "#87fc70",
          "#52edc7",
          "#1ad6fd",
          "#c644fc",
          "#ef4db6",
          "#4a4a4a",
          "#dbddde",
          "#ff3b30",
          "#ff9500",
          "#ffcc00",
          "#4cd964",
          "#34aadc",
          "#007aff",
          "#5856d6",
          "#ff2d55",
          "#8e8e93",
          "#c7c7cc",
          "#5ad427",
          "#c86edf",
          "#d1eefc",
          "#e0f8d8",
          "#fb2b69",
          "#f7f7f7",
          "#1d77ef",
          "#d6cec3",
          "#55efcb",
          "#ff4981",
          "#ffd3e0",
          "#f7f7f7",
          "#ff1300",
          "#1f1f21",
          "#bdbec2",
          "#ff3a2d"
        ];
      }
      return ColorStyle._randomStyleCache[(ColorStyle._nextStyle ++) % ColorStyle._randomStyleCache.length];
    }

    static contrastStyle(rgb: string): string {
      // http://www.w3.org/TR/AERT#color-contrast
      var c = parseInt(rgb.substr(1), 16);
      var yiq = (((c >> 16) * 299) + (((c >> 8) & 0xff) * 587) + ((c & 0xff) * 114)) / 1000;
      return (yiq >= 128) ? '#000000' : '#ffffff';
    }
  }

  export interface UntypedBounds {
    xMin: number;
    yMin: number;
    xMax: number;
    yMax: number;
  }

  export interface ASRectangle {
    x: number;
    y: number;
    width: number;
    height: number;
  }

  /**
   * Faster release version of bounds.
   */
  export class Bounds {
    xMin: number;
    yMin: number;
    xMax: number;
    yMax: number;
    constructor (xMin: number, yMin: number, xMax: number, yMax: number) {
      this.xMin = xMin|0;
      this.yMin = yMin|0;
      this.xMax = xMax|0;
      this.yMax = yMax|0;
    }

    static FromUntyped (source: UntypedBounds): Bounds {
      return new Bounds(source.xMin, source.yMin, source.xMax, source.yMax);
    }

    static FromRectangle (source: ASRectangle): Bounds {
      return new Bounds(source.x * 20|0, source.y * 20|0, (source.x + source.width) * 20|0,
        (source.y + source.height) * 20|0);
    }

    setElements (xMin: number, yMin: number, xMax: number, yMax: number): void {
      this.xMin = xMin;
      this.yMin = yMin;
      this.xMax = xMax;
      this.yMax = yMax;
    }

    copyFrom (source: Bounds): void {
      this.setElements(source.xMin, source.yMin, source.xMax, source.yMax);
    }

    contains (x: number, y: number): boolean {
      return x < this.xMin !== x < this.xMax &&
        y < this.yMin !== y < this.yMax;
    }

    unionWith (other: Bounds): void {
      this.xMin = Math.min(this.xMin, other.xMin);
      this.yMin = Math.min(this.yMin, other.yMin);
      this.xMax = Math.max(this.xMax, other.xMax);
      this.yMax = Math.max(this.yMax, other.yMax);
    }

    extendByPoint (x: number, y: number): void {
      this.extendByX(x);
      this.extendByY(y);
    }

    extendByX (x: number): void {
      this.xMin = Math.min(this.xMin, x);
      this.xMax = Math.max(this.xMax, x);
    }

    extendByY (y: number): void {
      this.yMin = Math.min(this.yMin, y);
      this.yMax = Math.max(this.yMax, y);
    }

    public intersects(toIntersect: Bounds): boolean {
      return this.contains(toIntersect.xMin, toIntersect.yMin) ||
        this.contains(toIntersect.xMax, toIntersect.yMax);
    }

    isEmpty (): boolean {
      return this.xMax <= this.xMin || this.yMax <= this.yMin;
    }

    get width(): number {
      return this.xMax - this.xMin;
    }

    get height(): number {
      return this.yMax - this.yMin;
    }

    public getBaseWidth(angle: number): number {
      var u = Math.abs(Math.cos(angle));
      var v = Math.abs(Math.sin(angle));
      return u * (this.xMax - this.xMin) + v * (this.yMax - this.yMin);
    }

    public getBaseHeight(angle: number): number {
      var u = Math.abs(Math.cos(angle));
      var v = Math.abs(Math.sin(angle));
      return v * (this.xMax - this.xMin) + u * (this.yMax - this.yMin);
    }

    setEmpty (): void {
      this.xMin = this.yMin = this.xMax = this.yMax = 0;
    }

    clone (): Bounds {
      return new Bounds(this.xMin, this.yMin, this.xMax, this.yMax);
    }

    toString(): string {
      return "{ " +
        "xMin: " + this.xMin + ", " +
        "xMin: " + this.yMin + ", " +
        "xMax: " + this.xMax + ", " +
        "xMax: " + this.yMax +
        " }";
    }
  }

  /**
   * Slower debug version of bounds, makes sure that all points have integer coordinates.
   */
  export class DebugBounds {
    private _xMin: number;
    private _yMin: number;
    private _xMax: number;
    private _yMax: number;

    constructor (xMin: number, yMin: number, xMax: number, yMax: number) {
      assert(isInteger(xMin));
      assert(isInteger(yMin));
      assert(isInteger(xMax));
      assert(isInteger(yMax));
      this._xMin = xMin|0;
      this._yMin = yMin|0;
      this._xMax = xMax|0;
      this._yMax = yMax|0;
      this.assertValid();
    }

    static FromUntyped (source: UntypedBounds): DebugBounds {
      return new DebugBounds(source.xMin, source.yMin, source.xMax, source.yMax);
    }

    static FromRectangle (source: ASRectangle): DebugBounds {
      return new DebugBounds(source.x * 20|0, source.y * 20|0, (source.x + source.width) * 20|0,
                        (source.y + source.height) * 20|0);
    }

    setElements (xMin: number, yMin: number, xMax: number, yMax: number): void {
      this.xMin = xMin;
      this.yMin = yMin;
      this.xMax = xMax;
      this.yMax = yMax;
    }

    copyFrom (source: DebugBounds): void {
      this.setElements(source.xMin, source.yMin, source.xMax, source.yMax);
    }

    contains (x: number, y: number): boolean {
      return x < this.xMin !== x < this.xMax &&
             y < this.yMin !== y < this.yMax;
    }

    unionWith (other: DebugBounds): void {
      this._xMin = Math.min(this._xMin, other._xMin);
      this._yMin = Math.min(this._yMin, other._yMin);
      this._xMax = Math.max(this._xMax, other._xMax);
      this._yMax = Math.max(this._yMax, other._yMax);
    }

    extendByPoint (x: number, y: number): void {
      this.extendByX(x);
      this.extendByY(y);
    }

    extendByX (x: number): void {
      this.xMin = Math.min(this.xMin, x);
      this.xMax = Math.max(this.xMax, x);
    }

    extendByY (y: number): void {
      this.yMin = Math.min(this.yMin, y);
      this.yMax = Math.max(this.yMax, y);
    }

    public intersects(toIntersect: DebugBounds): boolean {
      return this.contains(toIntersect._xMin, toIntersect._yMin) ||
             this.contains(toIntersect._xMax, toIntersect._yMax);
    }

    isEmpty (): boolean {
      return this._xMax <= this._xMin || this._yMax <= this._yMin;
    }

    set xMin(value: number) {
      assert(isInteger(value));
      this._xMin = value;
      this.assertValid();
    }

    get xMin(): number {
      return this._xMin;
    }

    set yMin(value: number) {
      assert(isInteger(value));
      this._yMin = value|0;
      this.assertValid();
    }

    get yMin(): number {
      return this._yMin;
    }

    set xMax(value: number) {
      assert(isInteger(value));
      this._xMax = value|0;
      this.assertValid();
    }

    get xMax(): number {
      return this._xMax;
    }

    get width(): number {
      return this._xMax - this._xMin;
    }

    set yMax(value: number) {
      assert(isInteger(value));
      this._yMax = value|0;
      this.assertValid();
    }

    get yMax(): number {
      return this._yMax;
    }

    get height(): number {
      return this._yMax - this._yMin;
    }

    public getBaseWidth(angle: number): number {
      var u = Math.abs(Math.cos(angle));
      var v = Math.abs(Math.sin(angle));
      return u * (this._xMax - this._xMin) + v * (this._yMax - this._yMin);
    }

    public getBaseHeight(angle: number): number {
      var u = Math.abs(Math.cos(angle));
      var v = Math.abs(Math.sin(angle));
      return v * (this._xMax - this._xMin) + u * (this._yMax - this._yMin);
    }

    setEmpty (): void {
      this._xMin = this._yMin = this._xMax = this._yMax = 0;
    }

    clone (): DebugBounds {
      return new DebugBounds(this.xMin, this.yMin, this.xMax, this.yMax);
    }

    toString(): string {
      return "{ " +
             "xMin: " + this._xMin + ", " +
             "xMin: " + this._yMin + ", " +
             "xMax: " + this._xMax + ", " +
             "xMax: " + this._yMax +
             " }";
    }

    private assertValid(): void {
//      assert(this._xMax >= this._xMin);
//      assert(this._yMax >= this._yMin);
    }
  }

  /**
   * Override Bounds with a slower by safer version, don't do this in release mode.
   */
  // Shumway.Bounds = DebugBounds;

  export class Color {
    public r: number;
    public g: number;
    public b: number;
    public a: number;
    constructor(r: number, g: number, b: number, a: number) {
      this.r = r;
      this.g = g;
      this.b = b;
      this.a = a;
    }
    set (other: Color) {
      this.r = other.r;
      this.g = other.g;
      this.b = other.b;
      this.a = other.a;
    }
    public static Red   = new Color(1, 0, 0, 1);
    public static Green = new Color(0, 1, 0, 1);
    public static Blue  = new Color(0, 0, 1, 1);
    public static None  = new Color(0, 0, 0, 0);
    public static White = new Color(1, 1, 1, 1);
    public static Black = new Color(0, 0, 0, 1);
    private static colorCache: { [color: string]: Color } = {};
    public static randomColor(alpha: number = 1): Color {
      return new Color(Math.random(), Math.random(), Math.random(), alpha);
    }
    public static parseColor(color: string) {
      if (!Color.colorCache) {
        Color.colorCache = Object.create(null);
      }
      if (Color.colorCache[color]) {
        return Color.colorCache[color];
      }
      // TODO: Obviously slow, but it will do for now.
      var span = document.createElement('span');
      document.body.appendChild(span);
      span.style.backgroundColor = color;
      var rgb = getComputedStyle(span).backgroundColor;
      document.body.removeChild(span);
      var m = /^rgb\((\d+), (\d+), (\d+)\)$/.exec(rgb);
      if (!m) m = /^rgba\((\d+), (\d+), (\d+), ([\d.]+)\)$/.exec(rgb);
      var result = new Color(0, 0, 0, 0);
      result.r = parseFloat(m[1]) / 255;
      result.g = parseFloat(m[2]) / 255;
      result.b = parseFloat(m[3]) / 255;
      result.a = m[4] ? parseFloat(m[4]) / 255 : 1;
      return Color.colorCache[color] = result;
    }
    }

  export module ColorUtilities {
    export function argbToRgba(color: number): number {
      return ((color << 8) | (color >> 24)) >>> 0;
    }

    export function rgbaToArgb(color: number): number {
      return ((color >> 8) | (color << 24)) >>> 0;
    }

    export function componentsToRgb(components: {red: number; green: number; blue: number}): number {
      return ((components.red << 16) | (components.green << 8) | components.blue) >>> 0;
    }

    export function rgbaToCSSStyle(color: number): string {
      return 'rgba(' + (color >> 24 & 0xff) + ',' + (color >> 16 & 0xff) + ',' +
                  (color >> 8 & 0xff) + ',' + ((color & 0xff) / 0xff) + ')';
    }

    export function rgbaObjToCSSStyle(color: {red: number; green: number; blue: number; alpha: number}): string {
      return 'rgba(' + color.red + ',' + color.green + ',' + color.blue + ',' +
             color.alpha / 255 + ')';
    }
  }

  export module Telemetry {
    export enum Feature {
      EXTERNAL_INTERFACE_FEATURE = 1,
      CLIPBOARD_FEATURE = 2,
      SHAREDOBJECT_FEATURE = 3,
      VIDEO_FEATURE = 4,
      SOUND_FEATURE = 5,
      NETCONNECTION_FEATURE = 6
    }

    export enum ErrorTypes {
      AVM1_ERROR = 1,
      AVM2_ERROR = 2
    }

    export var instance: ITelemetryService;
  }

  export interface ITelemetryService {
    reportTelemetry(data: any);
  }

  export interface FileLoadingRequest {
    url: string;
    data: any;
  }

  export interface FileLoadingProgress {
    bytesLoaded: number;
    bytesTotal: number;
  }

  export interface FileLoadingSession {
    onopen?: () => void;
    onclose?: () => void;
    onprogress?: (data: any, progressStatus: FileLoadingProgress) => void;
    onhttpstatus?: (location: string, httpStatus: number, httpHeaders: any) => void;
    onerror?: (e) => void;
    open(request: FileLoadingRequest);
  }

  export interface IFileLoadingService {
    createSession(): FileLoadingSession;
    setBaseUrl(url: string);
    resolveUrl(url: string): string;
  }

  export module FileLoadingService {
    export var instance: IFileLoadingService;
  }

  export interface IExternalInterfaceService {
    enabled: boolean;
    initJS(callback: (functionName: string, args: any[]) => any);
    registerCallback(functionName: string);
    unregisterCallback(functionName: string);
    eval(expression): any;
    call(request): any;
    getId(): string;
  }

  export module ExternalInterfaceService {
    export var instance: IExternalInterfaceService = {
      enabled: false,
      initJS(callback: (functionName: string, args: any[]) => any) { },
      registerCallback(functionName: string) { },
      unregisterCallback(functionName: string) { },
      eval(expression: string): any { },
      call(request: string): any { },
      getId(): string { return null; }
    };
  }

  export class Callback {
    private _queues: any;
    constructor () {
      this._queues = {};
    }

    public register(type, callback) {
      assert(type);
      assert(callback);
      var queue = this._queues[type];
      if (queue) {
        if (queue.indexOf(callback) > -1) {
          return;
        }
      } else {
        queue = this._queues[type] = [];
      }
      queue.push(callback);
    }

    public unregister(type: string, callback) {
      assert(type);
      assert(callback);
      var queue = this._queues[type];
      if (!queue) {
        return;
      }
      var i = queue.indexOf(callback);
      if (i !== -1) {
        queue.splice(i, 1);
      }
      if (queue.length === 0) {
        this._queues[type] = null;
      }
    }

    public notify(type: string, args) {
      var queue = this._queues[type];
      if (!queue) {
        return;
      }
      queue = queue.slice();
      var args = Array.prototype.slice.call(arguments, 0);
      for (var i = 0; i < queue.length; i++) {
        var callback = queue[i];
        callback.apply(null, args);
      }
    }

    public notify1(type: string, value) {
      var queue = this._queues[type];
      if (!queue) {
        return;
      }
      queue = queue.slice();
      for (var i = 0; i < queue.length; i++) {
        var callback = queue[i];
        callback(type, value);
      }
    }
  }

}

// Polyfill for Promises
(function PromiseClosure() {
  /*jshint -W061 */
  var global = Function("return this")();
  if (global.Promise) {
    // Promises existing in the DOM/Worker, checking presence of all/resolve
    if (typeof global.Promise.all !== 'function') {
      global.Promise.all = function (iterable) {
        var count = 0, results = [], resolve, reject;
        var promise = new global.Promise(function (resolve_, reject_) {
          resolve = resolve_;
          reject = reject_;
        });
        iterable.forEach(function (p, i) {
          count++;
          p.then(function (result) {
            results[i] = result;
            count--;
            if (count === 0) {
              resolve(results);
            }
          }, reject);
        });
        if (count === 0) {
          resolve(results);
        }
        return promise;
      };
    }
    if (typeof global.Promise.resolve !== 'function') {
      global.Promise.resolve = function (x) {
        return new global.Promise(function (resolve) { resolve(x); });
      };
    }
    return;
  }

  function getDeferred(C) {
    if (typeof C !== 'function') {
      throw new TypeError('Invalid deferred constructor');
    }
    var resolver = createDeferredConstructionFunctions();
    var promise = new C(resolver);
    var resolve = resolver.resolve;
    if (typeof resolve !== 'function') {
      throw new TypeError('Invalid resolve construction function');
    }
    var reject = resolver.reject;
    if (typeof reject !== 'function') {
      throw new TypeError('Invalid reject construction function');
    }
    return {promise: promise, resolve: resolve, reject: reject};
  }

  function updateDeferredFromPotentialThenable(x, deferred) {
    if (typeof x !== 'object' || x === null) {
      return false;
    }
    try {
      var then = x.then;
      if (typeof then !== 'function') {
        return false;
      }
      var thenCallResult = then.call(x, deferred.resolve, deferred.reject);
    } catch (e) {
      var reject = deferred.reject;
      reject(e);
    }
    return true;
  }

  function isPromise(x) {
    return typeof x === 'object' && x !== null &&
      typeof x.promiseStatus !== 'undefined';
  }

  function rejectPromise(promise, reason) {
    if (promise.promiseStatus !== 'unresolved') {
      return;
    }
    var reactions = promise.rejectReactions;
    promise.result = reason;
    promise.resolveReactions = undefined;
    promise.rejectReactions = undefined;
    promise.promiseStatus = 'has-rejection';
    triggerPromiseReactions(reactions, reason);
  }

  function resolvePromise(promise, resolution) {
    if (promise.promiseStatus !== 'unresolved') {
      return;
    }
    var reactions = promise.resolveReactions;
    promise.result = resolution;
    promise.resolveReactions = undefined;
    promise.rejectReactions = undefined;
    promise.promiseStatus = 'has-resolution';
    triggerPromiseReactions(reactions, resolution);
  }

  function triggerPromiseReactions(reactions, argument) {
    for (var i = 0; i < reactions.length; i++) {
      queueMicrotask({reaction: reactions[i], argument: argument});
    }
  }

  function queueMicrotask(task) {
    if (microtasksQueue.length === 0) {
      setTimeout(handleMicrotasksQueue, 0);
    }
    microtasksQueue.push(task);
  }

  function executePromiseReaction(reaction, argument) {
    var deferred = reaction.deferred;
    var handler = reaction.handler;
    var handlerResult, updateResult;
    try {
      handlerResult = handler(argument);
    } catch (e) {
      var reject = deferred.reject;
      return reject(e);
    }

    if (handlerResult === deferred.promise) {
      var reject = deferred.reject;
      return reject(new TypeError('Self resolution'));
    }

    try {
      updateResult = updateDeferredFromPotentialThenable(handlerResult,
        deferred);
      if (!updateResult) {
        var resolve = deferred.resolve;
        return resolve(handlerResult);
      }
    } catch (e) {
      var reject = deferred.reject;
      return reject(e);
    }
  }

  var microtasksQueue = [];

  function handleMicrotasksQueue() {
    while (microtasksQueue.length > 0) {
      var task = microtasksQueue[0];
      try {
        executePromiseReaction(task.reaction, task.argument);
      } catch (e) {
        // unhandler onFulfillment/onRejection exception
        if (typeof (<any>Promise).onerror === 'function') {
          (<any>Promise).onerror(e);
        }
      }
      microtasksQueue.shift();
    }
  }

  function throwerFunction(e) {
    throw e;
  }

  function identityFunction(x) {
    return x;
  }

  function createRejectPromiseFunction(promise) {
    return function (reason) {
      rejectPromise(promise, reason);
    };
  }

  function createResolvePromiseFunction(promise) {
    return function (resolution) {
      resolvePromise(promise, resolution);
    };
  }

  function createDeferredConstructionFunctions(): any {
    var fn = function (resolve, reject) {
      fn.resolve = resolve;
      fn.reject = reject;
    };
    return fn;
  }

  function createPromiseResolutionHandlerFunctions(promise,
                                                   fulfillmentHandler, rejectionHandler) {
    return function (x) {
      if (x === promise) {
        return rejectionHandler(new TypeError('Self resolution'));
      }
      var cstr = promise.promiseConstructor;
      if (isPromise(x)) {
        var xConstructor = x.promiseConstructor;
        if (xConstructor === cstr) {
          return x.then(fulfillmentHandler, rejectionHandler);
        }
      }
      var deferred = getDeferred(cstr);
      var updateResult = updateDeferredFromPotentialThenable(x, deferred);
      if (updateResult) {
        var deferredPromise = deferred.promise;
        return deferredPromise.then(fulfillmentHandler, rejectionHandler);
      }
      return fulfillmentHandler(x);
    };
  }

  function createPromiseAllCountdownFunction(index, values, deferred,
                                             countdownHolder) {
    return function (x) {
      values[index] = x;
      countdownHolder.countdown--;
      if (countdownHolder.countdown === 0) {
        deferred.resolve(values);
      }
    };
  }

  function Promise(resolver) {
    if (typeof resolver !== 'function') {
      throw new TypeError('resolver is not a function');
    }
    var promise = this;
    if (typeof promise !== 'object') {
      throw new TypeError('Promise to initialize is not an object');
    }
    promise.promiseStatus = 'unresolved';
    promise.resolveReactions = [];
    promise.rejectReactions = [];
    promise.result = undefined;

    var resolve = createResolvePromiseFunction(promise);
    var reject = createRejectPromiseFunction(promise);

    try {
      var result = resolver(resolve, reject);
    } catch (e) {
      rejectPromise(promise, e);
    }

    promise.promiseConstructor = Promise;
    return promise;
  }

  (<any>Promise).all = function (iterable) {
    var deferred = getDeferred(this);
    var values = [];
    var countdownHolder = {countdown: 0};
    var index = 0;
    iterable.forEach(function (nextValue) {
      var nextPromise = this.cast(nextValue);
      var fn = createPromiseAllCountdownFunction(index, values,
        deferred, countdownHolder);
      nextPromise.then(fn, deferred.reject);
      index++;
      countdownHolder.countdown++;
    }, this);
    if (index === 0) {
      deferred.resolve(values);
    }
    return deferred.promise;
  };
  (<any>Promise).cast = function (x) {
    if (isPromise(x)) {
      return x;
    }
    var deferred = getDeferred(this);
    deferred.resolve(x);
    return deferred.promise;
  };
  (<any>Promise).reject = function (r) {
    var deferred = getDeferred(this);
    var rejectResult = deferred.reject(r);
    return deferred.promise;
  };
  (<any>Promise).resolve = function (x) {
    var deferred = getDeferred(this);
    var rejectResult = deferred.resolve(x);
    return deferred.promise;
  };
  Promise.prototype = {
    'catch': function (onRejected) {
      this.then(undefined, onRejected);
    },
    then: function (onFulfilled, onRejected) {
      var promise = this;
      if (!isPromise(promise)) {
        throw new TypeError('this is not a Promises');
      }
      var cstr = promise.promiseConstructor;
      var deferred = getDeferred(cstr);

      var rejectionHandler = typeof onRejected === 'function' ? onRejected :
        throwerFunction;
      var fulfillmentHandler = typeof onFulfilled === 'function' ? onFulfilled :
        identityFunction;
      var resolutionHandler = createPromiseResolutionHandlerFunctions(promise,
        fulfillmentHandler, rejectionHandler);

      var resolveReaction = {deferred: deferred, handler: resolutionHandler};
      var rejectReaction = {deferred: deferred, handler: rejectionHandler};

      switch (promise.promiseStatus) {
        case 'unresolved':
          promise.resolveReactions.push(resolveReaction);
          promise.rejectReactions.push(rejectReaction);
          break;
        case 'has-resolution':
          var resolution = promise.result;
          queueMicrotask({reaction: resolveReaction, argument: resolution});
          break;
        case 'has-rejection':
          var rejection = promise.result;
          queueMicrotask({reaction: rejectReaction, argument: rejection});
          break;
      }
      return deferred.promise;
    }
  };

  global.Promise = Promise;
})();

import assert = Shumway.Debug.assert;
import IndentingWriter = Shumway.IndentingWriter;
