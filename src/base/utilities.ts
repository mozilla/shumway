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

///<reference path='references.ts' />
var jsGlobal = (function() { return this || (1, eval)('this//# sourceURL=jsGlobal-getter'); })();
// Our polyfills for some DOM things make testing this slightly more onerous than it ought to be.
var inBrowser = typeof window !=='undefined' && 'document' in window && 'plugins' in window.document;
var inFirefox = typeof navigator !== 'undefined' && navigator.userAgent.indexOf('Firefox') >= 0;

declare var putstr;
// declare var print;
// declare var console;
// declare var performance;
// declare var XMLHttpRequest;
// declare var document;
// declare var getComputedStyle;

/** @define {boolean} */ var release = false;
/** @define {boolean} */ var profile = false;

declare var dump: (message: string) => void;

function dumpLine(line: string) {
  if (!release && typeof dump !== "undefined") {
    dump(line + "\n");
  }
}

if (!jsGlobal.performance) {
  jsGlobal.performance = {};
}

if (!jsGlobal.performance.now) {
  jsGlobal.performance.now = function () {
    return Date.now();
  };
}

function lazyInitializer(obj: any, propertyName: string, fn: ()=>any) {
  Object.defineProperty(obj, propertyName, {
    get: function () {
      var value = fn();
      Object.defineProperty(obj, propertyName, {
        value: value,
        configurable: true,
        enumerable: true
      });
      return value;
    },
    configurable: true,
    enumerable: true
  });
}

var START_TIME = performance.now();

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
};

declare module Shumway {
  var version: string;
  var build: string;
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
  /** @const */ export var UINT32_CHAR_BUFFER_LENGTH = 10; // "4294967295".length;
  /** @const */ export var UINT32_MAX = 0xFFFFFFFF;
  /** @const */ export var UINT32_MAX_DIV_10 = 0x19999999; // UINT32_MAX / 10;
  /** @const */ export var UINT32_MAX_MOD_10 = 0x5; // UINT32_MAX % 10

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
    }
    if (typeof value === "string") {
      // |value| is rarely numeric (it's usually an identifier), and the
      // isIndex()/isNumericString() pair is slow and expensive, so we do a
      // quick check for obvious non-numericalness first. Just checking if the
      // first char is a 7-bit identifier char catches most cases.
      var c = value.charCodeAt(0);
      if ((65 <= c && c <= 90) ||     // 'A'..'Z'
          (97 <= c && c <= 122) ||    // 'a'..'z'
          (c === 36) ||               // '$'
          (c === 95)) {               // '_'
        return false;
      }
      return isIndex(value) || isNumericString(value);
    }
    return false;
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

  export function argumentsToString(args: IArguments) {
    var resultList = [];
    for (var i = 0; i < args.length; i++) {
      var arg = args[i];
      try {
        var argStr;
        if (typeof arg !== 'object' || !arg) {
          argStr = arg + '';
        } else if ('toString' in arg) {
          argStr = arg.toString();
        } else {
          argStr = Object.prototype.toString.call(arg);
        }
        resultList.push(argStr);
      } catch (e) {
        resultList.push('<unprintable value>');
      }
    }
    return resultList.join(', ');
  }

  export module Debug {
    export function error(message: string) {
      console.error(message);
      throw new Error(message);
    }

    export function assert(condition: any, message: any = "assertion failed") {
      if (condition === "") {     // avoid inadvertent false positive
        condition = true;
      }
      if (!condition) {
        if (typeof console !== 'undefined' && 'assert' in console) {
          console.assert(false, message);
          throw new Error(message);
        } else {
          Debug.error(message.toString());
        }
      }
    }

    export function assertUnreachable(msg: string): void {
      var location = new Error().stack.split('\n')[1];
      throw new Error("Reached unreachable location " + location + msg);
    }

    export function assertNotImplemented(condition: boolean, message: string) {
      if (!condition) {
        Debug.error("notImplemented: " + message);
      }
    }

    var _warnedCounts = Object.create(null);

    export function warning(message: any, arg1?: any, arg2?: any/*...messages: any[]*/) {
      if (release) {
        return;
      }
      var key = argumentsToString(arguments);
      if (_warnedCounts[key]) {
        _warnedCounts[key]++;
        if (Shumway.omitRepeatedWarnings.value) {
          return;
        }
      }
      _warnedCounts[key] = 1;
      console.warn.apply(console, arguments);
    }

    export function warnCounts() {
      var list = [];
      for (var key in _warnedCounts) {
        list.push({key: key, count: _warnedCounts[key]});
      }
      list.sort((entry, prev) => prev.count - entry.count);
      return list.reduce((result, entry) => (result += '\n' + entry.count + '\t' + entry.key), '');
    }

    export function notUsed(message: string) {
      release || Debug.assert(false, "Not Used " + message);
    }

    export function notImplemented(message: string) {
      release || Debug.assert(false, "Not Implemented " + message);
    }

    export function dummyConstructor(message: string) {
      release || Debug.assert(false, "Dummy Constructor: " + message);
    }

    export function abstractMethod(message: string) {
      release || Debug.assert(false, "Abstract Method " + message);
    }

    var somewhatImplementedCache = {};

    export function somewhatImplemented(message: string) {
      if (somewhatImplementedCache[message]) {
        return;
      }
      somewhatImplementedCache[message] = true;
      Debug.warning("somewhatImplemented: " + message);
    }

    export function unexpected(message?: any) {
      Debug.assert(false, "Unexpected: " + message);
    }

    export function unexpectedCase(message?: any) {
      Debug.assert(false, "Unexpected Case: " + message);
    }
  }

  export function getTicks(): number {
    return performance.now();
  }

  export interface MapObject<T> {
    [name: string]: T
  }

  export module ArrayUtilities {
    import assert = Shumway.Debug.assert;

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
      array.length = start;
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
      return array.length && array[array.length - 1];
    }

    export function last(array: any []) {
      return array.length && array[array.length - 1];
    }

    export function peek(array: any []) {
      release || assert(array.length > 0);
      return array[array.length - 1];
    }

    export function indexOf<T>(array: T [], value: T): number {
      for (var i = 0, j = array.length; i < j; i++) {
        if (array[i] === value) {
          return i;
        }
      }
      return -1;
    }

    export function equals<T>(a: T [], b: T []): boolean {
      if (a.length !== b.length) {
        return false;
      }
      for (var i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
          return false;
        }
      }
      return true;
    }

    export function pushUnique<T>(array: T [], value: T): number {
      for (var i = 0, j = array.length; i < j; i++) {
        if (array[i] === value) {
          return i;
        }
      }
      array.push(value);
      return array.length - 1;
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

    export interface TypedArray {
      buffer: ArrayBuffer;
      length: number;
      set: (array: TypedArray, offset?: number) => void;
      subarray: (begin: number, end?: number) => TypedArray;
    }

    /**
     * Makes sure that a typed array has the requested capacity. If required, it creates a new
     * instance of the array's class with a power-of-two capacity at least as large as required.
     */
    export function ensureTypedArrayCapacity<T extends TypedArray>(array: T, capacity: number): T {
      if (array.length < capacity) {
        var oldArray = array;
        array = new (<any>array).constructor(Shumway.IntegerUtilities.nearestPowerOfTwo(capacity));
        array.set(oldArray, 0);
      }
      return array;
    }

    export function memCopy<T extends TypedArray>(destination: T, source: T, doffset: number = 0,
                                                  soffset: number = 0, length: number = 0) {
      if (soffset > 0 || (length > 0 && length < source.length)) {
        if (length <= 0) {
          length = source.length - soffset;
        }
        destination.set(source.subarray(soffset, soffset + length), doffset);
      } else {
        destination.set(source, doffset);
      }
    }

    export interface IDataDecoder {
      onData: (data: Uint8Array) => void;
      onError: (e) => void;
      push(data: Uint8Array);
      close();
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

    /**
     * Returns a property descriptor for the own or inherited property with the given name, or
     * null if one doesn't exist.
     */
    export function getPropertyDescriptor(object: Object, name: string): PropertyDescriptor {
      do {
        var propDesc = Object.getOwnPropertyDescriptor(object, name);
        if (propDesc) {
          return propDesc;
        }
        object = Object.getPrototypeOf(object);
      } while (object);
      return null;
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

    export function createMap<T>():MapObject<T> {
      return Object.create(null);
    }

    export function createArrayMap<T>():MapObject<T> {
      return <MapObject<T>><any>[];
    }

    export function defineReadOnlyProperty(object: Object, name: string, value: any) {
      Object.defineProperty(object, name, {
        value: value,
        writable: false,
        configurable: true,
        enumerable: false
      });
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

    export function copyOwnPropertyDescriptors(object: Object,
                                               template: Object,
                                               filter: (name: string) => boolean = null,
                                               overwrite = true,
                                               makeWritable = false) {
      for (var property in template) {
        if (hasOwnProperty(template, property) && (!filter || filter(property))) {
          var descriptor = Object.getOwnPropertyDescriptor(template, property);
          if (!overwrite && hasOwnProperty(object, property)) {
            continue;
          }
          release || Debug.assert (descriptor);
          try {
            if (makeWritable && descriptor.writable === false) {
              descriptor.writable = true;
            }
            Object.defineProperty(object, property, descriptor);
          } catch (e) {
            Debug.assert("Can't define: " + property);
          }
        }
      }
    }

    export function copyPropertiesByList(object: Object,
                                         template: Object,
                                         propertyList: string []) {
      for (var i = 0; i < propertyList.length; i++) {
        var property = propertyList[i];
        object[property] = template[property];
      }
    }

    export function defineNonEnumerableGetter(obj, name, getter) {
      Object.defineProperty(obj, name, { get: getter,
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
  }

  export module FunctionUtilities {
    export function makeForwardingGetter(target: string): () => any {
      return <() => any> new Function("return this[\"" + target + "\"]//# sourceURL=fwd-get-" +
                                      target + ".as");
    }

    export function makeForwardingSetter(target: string): (any) => void {
      return <(any) => void> new Function("value", "this[\"" + target + "\"] = value;" +
                                                   "//# sourceURL=fwd-set-" + target + ".as");
    }
  }

  export module StringUtilities {
    import assert = Shumway.Debug.assert;

    export function repeatString(c: string, n: number): string {
      var s = "";
      for (var i = 0; i < n; i++) {
        s += c;
      }
      return s;
    }

    export function memorySizeToString(value: number) {
      value |= 0;
      var K = 1024;
      var M = K * K;
      if (value < K) {
        return value + " B";
      } else if (value < M) {
        return (value / K).toFixed(2) + "KB";
      } else {
        return (value / M).toFixed(2) + "MB";
      }
    }

    /**
     * Returns a reasonably sized description of the |value|, to be used for debugging purposes.
     */
    export function toSafeString(value) {
      if (typeof value === "string") {
        return "\"" + value + "\"";
      }
      if (typeof value === "number" || typeof value === "boolean") {
        return String(value);
      }
      if (value instanceof Array) {
        return "[] " + value.length;
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
        base64 += concat4(encodings[a], encodings[b], encodings[c],
                          encodings[d]);
      }

      // Deal with the remaining bytes and padding
      if (byteRemainder == 1) {
        chunk = bytes[mainLength];

        a = (chunk & 252) >> 2; // 252 = (2^6 - 1) << 2

        // Set the 4 least significant bits to zero
        b = (chunk & 3) << 4; // 3 = 2^2 - 1

        base64 += concat3(encodings[a], encodings[b], '==');
      } else if (byteRemainder == 2) {
        chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];

        a = (chunk & 64512) >> 10; // 64512 = (2^6 - 1) << 10
        b = (chunk & 1008) >> 4; // 1008 = (2^6 - 1) << 4

        // Set the 2 least significant bits to zero
        c = (chunk & 15) << 2; // 15 = 2^4 - 1

        base64 += concat4(encodings[a], encodings[b], encodings[c], '=');
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
      release || assert (bitCount <= 32, bitCount);
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

    export function fromEncoding(c) {
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
      release || assert (false, "Invalid Encoding");
    }

    export function variableLengthDecodeInt32(s) {
      var l = StringUtilities.fromEncoding(s.charCodeAt(0));
      var n = 0;
      for (var i = 0; i < l; i++) {
        var offset = ((l - i - 1) * 6);
        n |= StringUtilities.fromEncoding(s.charCodeAt(1 + i)) << offset;
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

    export function indexOfAny(s: string, chars: string [], position: number) {
      var index = s.length;
      for (var i = 0; i < chars.length; i++) {
        var j = s.indexOf(chars[i], position);
        if (j >= 0) {
          index = Math.min(index, j);
        }
      }
      return index === s.length ? -1 : index;
    }

    var _concat3array = new Array(3);
    var _concat4array = new Array(4);
    var _concat5array = new Array(5);
    var _concat6array = new Array(6);
    var _concat7array = new Array(7);
    var _concat8array = new Array(8);
    var _concat9array = new Array(9);

    /**
     * The concatN() functions concatenate multiple strings in a way that
     * avoids creating intermediate strings, unlike String.prototype.concat().
     *
     * Note that these functions don't have identical behaviour to using '+',
     * because they will ignore any arguments that are |undefined| or |null|.
     * This usually doesn't matter.
     */

    export function concat3(s0: any, s1: any, s2: any) {
        _concat3array[0] = s0;
        _concat3array[1] = s1;
        _concat3array[2] = s2;
        return _concat3array.join('');
    }

    export function concat4(s0: any, s1: any, s2: any, s3: any) {
        _concat4array[0] = s0;
        _concat4array[1] = s1;
        _concat4array[2] = s2;
        _concat4array[3] = s3;
        return _concat4array.join('');
    }

    export function concat5(s0: any, s1: any, s2: any, s3: any, s4: any) {
        _concat5array[0] = s0;
        _concat5array[1] = s1;
        _concat5array[2] = s2;
        _concat5array[3] = s3;
        _concat5array[4] = s4;
        return _concat5array.join('');
    }

    export function concat6(s0: any, s1: any, s2: any, s3: any, s4: any,
                            s5: any) {
        _concat6array[0] = s0;
        _concat6array[1] = s1;
        _concat6array[2] = s2;
        _concat6array[3] = s3;
        _concat6array[4] = s4;
        _concat6array[5] = s5;
        return _concat6array.join('');
    }

    export function concat7(s0: any, s1: any, s2: any, s3: any, s4: any,
                            s5: any, s6: any) {
        _concat7array[0] = s0;
        _concat7array[1] = s1;
        _concat7array[2] = s2;
        _concat7array[3] = s3;
        _concat7array[4] = s4;
        _concat7array[5] = s5;
        _concat7array[6] = s6;
        return _concat7array.join('');
    }

    export function concat8(s0: any, s1: any, s2: any, s3: any, s4: any,
                            s5: any, s6: any, s7: any) {
        _concat8array[0] = s0;
        _concat8array[1] = s1;
        _concat8array[2] = s2;
        _concat8array[3] = s3;
        _concat8array[4] = s4;
        _concat8array[5] = s5;
        _concat8array[6] = s6;
        _concat8array[7] = s7;
        return _concat8array.join('');
    }

    export function concat9(s0: any, s1: any, s2: any, s3: any, s4: any,
                            s5: any, s6: any, s7: any, s8: any) {
        _concat9array[0] = s0;
        _concat9array[1] = s1;
        _concat9array[2] = s2;
        _concat9array[3] = s3;
        _concat9array[4] = s4;
        _concat9array[5] = s5;
        _concat9array[6] = s6;
        _concat9array[7] = s7;
        _concat9array[8] = s8;
        return _concat9array.join('');
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

    export function mixHash(a: number, b: number) {
      return (((31 * a) | 0) + b) | 0;
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

    public static reset() {
      Random._state[0] = 0xDEAD;
      Random._state[1] = 0xBEEF;
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

  /**
   * This should only be called if you need fake time.
   */
  export function installTimeWarper() {
    var RealDate = Date;

    // Go back in time.
    var fakeTime = 1428107694580; // 3-Apr-2015

    // Overload
    jsGlobal.Date = function (yearOrTimevalue, month, date, hour, minute, second, millisecond) {
      switch (arguments.length) {
        case  0: return new RealDate(fakeTime);
        case  1: return new RealDate(yearOrTimevalue);
        case  2: return new RealDate(yearOrTimevalue, month);
        case  3: return new RealDate(yearOrTimevalue, month, date);
        case  4: return new RealDate(yearOrTimevalue, month, date, hour);
        case  5: return new RealDate(yearOrTimevalue, month, date, hour, minute);
        case  6: return new RealDate(yearOrTimevalue, month, date, hour, minute, second);
        default: return new RealDate(yearOrTimevalue, month, date, hour, minute, second, millisecond);
      }
    };

    // Make date now deterministic.
    jsGlobal.Date.now = function () {
      return fakeTime += 10; // Advance time.
    };

    jsGlobal.Date.UTC = function () {
      return RealDate.UTC.apply(RealDate, arguments);
    };
  }

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
      },
      delete: function(obj) {
        delete obj[this.id];
      }
    };
    jsGlobal.WeakMap = WeakMap;
  }

  polyfillWeakMap();

  export interface IReferenceCountable {
    _referenceCount: number;
    _addReference();
    _removeReference();
  }

  var useReferenceCounting = true;

  export class WeakList<T extends IReferenceCountable> {
    private _map: WeakMap<T, number>;
    private _newAdditions: Array<Array<T>>;
    private _list: T [];
    private _id: number;
    constructor() {
      if (typeof ShumwayCom !== "undefined" && ShumwayCom.getWeakMapKeys) {
        this._map = new WeakMap<T, number>();
        this._id = 0;
        this._newAdditions = [];
      } else {
        this._list = [];
      }
    }
    clear() {
      if (this._map) {
        this._map.clear();
      } else {
        this._list.length = 0;
      }
    }
    push(value: T) {
      if (this._map) {
        release || Debug.assert(!this._map.has(value));
        // We store an increasing id as the value so that keys can be sorted by it.
        this._map.set(value, this._id++);
        this._newAdditions.forEach(function (additions: Array<T>) {
          additions.push(value);
        });
      } else {
        release || Debug.assert(this._list.indexOf(value) === -1);
        this._list.push(value);
      }
    }
    remove(value: T) {
      if (this._map) {
        release || Debug.assert(this._map.has(value));
        this._map.delete(value);
      } else {
        release || Debug.assert(this._list.indexOf(value) > -1);
        this._list[this._list.indexOf(value)] = null;
        release || Debug.assert(this._list.indexOf(value) === -1);
      }
    }
    forEach(callback: (value: T) => void) {
      if (this._map) {
        var newAdditionsToKeys : Array<T> = [];
        this._newAdditions.push(newAdditionsToKeys);
        var map = this._map;
        var keys: Array<T> = ShumwayCom.getWeakMapKeys(map);
        // The keys returned by ShumwayCom.getWeakMapKeys are not guaranteed to
        // be in insertion order. Therefore we have to sort them manually.
        keys.sort(function (a: T, b: T) {
          return map.get(a) - map.get(b);
        });
        keys.forEach(function (value: T) {
          if (value._referenceCount !== 0) {
            callback(value);
          }
        });
        // ShumwayCom.getWeakMapKeys take snapshot of the keys, but we are also
        // interested in new added keys while keys.forEach was run.
        newAdditionsToKeys.forEach(function (value: T) {
          if (value._referenceCount !== 0) {
            callback(value);
          }
        });
        this._newAdditions.splice(this._newAdditions.indexOf(newAdditionsToKeys), 1);
        return;
      }
      var list = this._list;
      var zeroCount = 0;
      for (var i = 0; i < list.length; i++) {
        var value = list[i];
        if (!value) {
          continue;
        }
        if (useReferenceCounting && value._referenceCount === 0) {
          list[i] = null;
          zeroCount++;
        } else {
          callback(value);
        }
      }
      if (zeroCount > 16 && zeroCount > (list.length >> 2)) {
        var newList = [];
        for (var i = 0; i < list.length; i++) {
          var value = list[i];
          if (value && value._referenceCount > 0) {
            newList.push(value);
          }
        }
        this._list = newList;
      }
    }
    get length(): number {
      if (this._map) {
        // TODO: Implement this.
        return -1;
      } else {
        return this._list.length;
      }
    }
  }

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

    /**
     * Rounds *.5 up on even occurrences, down on odd occurrences.
     * See https://en.wikipedia.org/wiki/Rounding#Alternating_tie-breaking for details.
     */
    export function altTieBreakRound(value: number, even: boolean): number {
      if (Math.abs(value % 1) === 0.5 && !even) {
        return value | 0;
      }
      return Math.round(value);
    }

    export function epsilonEquals(value: number, other: number): boolean {
      return Math.abs(value - other) < 0.0000001;
    }
  }

  export enum Numbers {
    MaxU16 = 0xFFFF,
    MaxI16 = 0x7FFF,
    MinI16 = -0x8000
  }

  export module IntegerUtilities {
    var sharedBuffer = new ArrayBuffer(8);
    export var i8 = new Int8Array(sharedBuffer);
    export var u8 = new Uint8Array(sharedBuffer);
    export var i32 = new Int32Array(sharedBuffer);
    export var f32 = new Float32Array(sharedBuffer);
    export var f64 = new Float64Array(sharedBuffer);
    export var nativeLittleEndian = new Int8Array(new Int32Array([1]).buffer)[0] === 1;

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

    export function roundToMultipleOfFour(x: number) {
      return (x + 3) & ~0x3;
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

    export function toHEX(i: number) {
      var i = (i < 0 ? 0xFFFFFFFF + i + 1 : i);
      return "0x" + ("00000000" + i.toString(16)).substr(-8);
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
      };
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
      };
    }
  }

  export enum LogLevel {
    Error = 0x1,
    Warn = 0x2,
    Debug = 0x4,
    Log = 0x8,
    Info = 0x10,
    All = 0x1f
  }

  export class IndentingWriter {
    public static PURPLE = '\033[94m';
    public static YELLOW = '\033[93m';
    public static GREEN = '\033[92m';
    public static RED = '\033[91m';
    public static BOLD_RED = '\033[1;91m';
    public static ENDC = '\033[0m';

    public static logLevel: LogLevel = LogLevel.All;

    private static _consoleOut = console.log.bind(console);
    private static _consoleOutNoNewline = console.log.bind(console);

    private _tab: string;
    private _padding: string;
    private _suppressOutput: boolean;
    private _out: (s: string, o?: any) => void;
    private _outNoNewline: (s: string) => void;

    get suppressOutput() {
      return this._suppressOutput;
    }

    set suppressOutput(val: boolean) {
      this._suppressOutput = val;
    }

    constructor(suppressOutput: boolean = false, out?) {
      this._tab = "  ";
      this._padding = "";
      this._suppressOutput = suppressOutput;
      this._out = out || IndentingWriter._consoleOut;
      this._outNoNewline = out || IndentingWriter._consoleOutNoNewline;
    }

    write(str: string = "", writePadding = false) {
      if (!this._suppressOutput) {
        this._outNoNewline((writePadding ? this._padding : "") + str);
      }
    }

    writeLn(str: string = "") {
      if (!this._suppressOutput) {
        this._out(this._padding + str);
      }
    }

    writeObject(str: string = "", object?: Object) {
      if (!this._suppressOutput) {
        this._out(this._padding + str, object);
      }
    }

    writeTimeLn(str: string = "") {
      if (!this._suppressOutput) {
        this._out(this._padding + performance.now().toFixed(2) + " " + str);
      }
    }

    writeComment(str: string) {
      var lines = (str || '').split("\n");
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
      var lines = (str || '').split("\n");
      for (var i = 0; i < lines.length; i++) {
        this.writeLn(lines[i]);
      }
    }

    errorLn(str: string) {
      if (IndentingWriter.logLevel & LogLevel.Error) {
        this.boldRedLn(str);
      }
    }

    warnLn(str: string) {
      if (IndentingWriter.logLevel & LogLevel.Warn) {
        this.yellowLn(str);
      }
    }

    debugLn(str: string) {
      if (IndentingWriter.logLevel & LogLevel.Debug) {
        this.purpleLn(str);
      }
    }

    logLn(str: string) {
      if (IndentingWriter.logLevel & LogLevel.Log) {
        this.writeLn(str);
      }
    }

    infoLn(str: string) {
      if (IndentingWriter.logLevel & LogLevel.Info) {
        this.writeLn(str);
      }
    }

    yellowLn(str: string) {
      this.colorLn(IndentingWriter.YELLOW, str);
    }

    greenLn(str: string) {
      this.colorLn(IndentingWriter.GREEN, str);
    }

    boldRedLn(str: string) {
      this.colorLn(IndentingWriter.BOLD_RED, str);
    }

    redLn(str: string) {
      this.colorLn(IndentingWriter.RED, str);
    }

    purpleLn(str: string) {
      this.colorLn(IndentingWriter.PURPLE, str);
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

    redLns(str: string) {
      this.colorLns(IndentingWriter.RED, str);
    }

    colorLns(color: string, str: string) {
      var lines = (str || '').split("\n");
      for (var i = 0; i < lines.length; i++) {
        this.colorLn(color, lines[i]);
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

    leave(str?: string) {
      this.outdent();
      if (!this._suppressOutput && str) {
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
      var end = (this.start - 1) & this._mask;
      while (i !== end) {
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

    private static _gradient = [
      "#FF0000",  // Red
      "#FF1100",
      "#FF2300",
      "#FF3400",
      "#FF4600",
      "#FF5700",
      "#FF6900",
      "#FF7B00",
      "#FF8C00",
      "#FF9E00",
      "#FFAF00",
      "#FFC100",
      "#FFD300",
      "#FFE400",
      "#FFF600",
      "#F7FF00",
      "#E5FF00",
      "#D4FF00",
      "#C2FF00",
      "#B0FF00",
      "#9FFF00",
      "#8DFF00",
      "#7CFF00",
      "#6AFF00",
      "#58FF00",
      "#47FF00",
      "#35FF00",
      "#24FF00",
      "#12FF00",
      "#00FF00"   // Green
    ];

    static gradientColor(value) {
      return ColorStyle._gradient[ColorStyle._gradient.length * NumberUtilities.clamp(value, 0, 1) | 0];
    }

    static contrastStyle(rgb: string): string {
      // http://www.w3.org/TR/AERT#color-contrast
      var c = parseInt(rgb.substr(1), 16);
      var yiq = (((c >> 16) * 299) + (((c >> 8) & 0xff) * 587) + ((c & 0xff) * 114)) / 1000;
      return (yiq >= 128) ? '#000000' : '#ffffff';
    }

    static reset() {
      ColorStyle._nextStyle = 0;
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

    unionInPlace (other: Bounds): void {
      if (other.isEmpty()) {
        return;
      }
      this.extendByPoint(other.xMin, other.yMin);
      this.extendByPoint(other.xMax, other.yMax);
    }

    extendByPoint (x: number, y: number): void {
      this.extendByX(x);
      this.extendByY(y);
    }

    extendByX (x: number): void {
      // Exclude default values.
      if (this.xMin === 0x8000000) {
        this.xMin = this.xMax = x;
        return;
      }
      this.xMin = Math.min(this.xMin, x);
      this.xMax = Math.max(this.xMax, x);
    }

    extendByY (y: number): void {
      // Exclude default values.
      if (this.yMin === 0x8000000) {
        this.yMin = this.yMax = y;
        return;
      }
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

    set width(value: number) {
      this.xMax = this.xMin + value;
    }

    get height(): number {
      return this.yMax - this.yMin;
    }

    set height(value: number) {
      this.yMax = this.yMin + value;
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

    /**
     * Set all fields to the sentinel value 0x8000000.
     *
     * This is what Flash uses to indicate uninitialized bounds. Important for bounds calculation
     * in `Graphics` instances, which start out with empty bounds but must not just extend them
     * from an 0,0 origin.
     */
    setToSentinels (): void {
      this.xMin = this.yMin = this.xMax = this.yMax = 0x8000000;
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
      Debug.assert(isInteger(xMin));
      Debug.assert(isInteger(yMin));
      Debug.assert(isInteger(xMax));
      Debug.assert(isInteger(yMax));
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

    unionInPlace (other: DebugBounds): void {
      if (other.isEmpty()) {
        return;
      }
      this.extendByPoint(other.xMin, other.yMin);
      this.extendByPoint(other.xMax, other.yMax);
    }

    extendByPoint (x: number, y: number): void {
      this.extendByX(x);
      this.extendByY(y);
    }

    extendByX (x: number): void {
      if (this.xMin === 0x8000000) {
        this.xMin = this.xMax = x;
        return;
      }
      this.xMin = Math.min(this.xMin, x);
      this.xMax = Math.max(this.xMax, x);
    }

    extendByY (y: number): void {
      if (this.yMin === 0x8000000) {
        this.yMin = this.yMax = y;
        return;
      }
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
      Debug.assert(isInteger(value));
      this._xMin = value;
      this.assertValid();
    }

    get xMin(): number {
      return this._xMin;
    }

    set yMin(value: number) {
      Debug.assert(isInteger(value));
      this._yMin = value|0;
      this.assertValid();
    }

    get yMin(): number {
      return this._yMin;
    }

    set xMax(value: number) {
      Debug.assert(isInteger(value));
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
      Debug.assert(isInteger(value));
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
             "yMin: " + this._yMin + ", " +
             "xMax: " + this._xMax + ", " +
             "yMax: " + this._yMax +
             " }";
    }

    private assertValid(): void {
//      release || assert(this._xMax >= this._xMin);
//      release || assert(this._yMax >= this._yMin);
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
    static FromARGB(argb: number) {
      return new Color (
        (argb >> 16 & 0xFF) / 255,
        (argb >>  8 & 0xFF) / 255,
        (argb >>  0 & 0xFF) / 255,
        (argb >> 24 & 0xFF) / 255
      );
    }
    static FromRGBA(rgba: number) {
      return Color.FromARGB(ColorUtilities.RGBAToARGB(rgba));
    }
    public toRGBA() {
      return (this.r * 255) << 24 | (this.g * 255) << 16 | (this.b * 255) << 8 | (this.a * 255);
    }
    public toCSSStyle() {
      return ColorUtilities.rgbaToCSSStyle(this.toRGBA());
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
    export function RGBAToARGB(rgba: number): number {
      return ((rgba >> 8) & 0x00ffffff) | ((rgba & 0xff) << 24);
    }

    export function ARGBToRGBA(argb: number): number {
      return argb << 8 | ((argb >> 24) & 0xff);
    }

    export function rgbaToCSSStyle(color: number): string {
      return Shumway.StringUtilities.concat9('rgba(', color >> 24 & 0xff, ',', color >> 16 & 0xff, ',', color >> 8 & 0xff, ',', (color & 0xff) / 0xff, ')');
    }

    export function cssStyleToRGBA(style: string) {
      if (style[0] === "#") {
        if (style.length === 7) {
          var value = parseInt(style.substring(1), 16);
          return (value << 8) | 0xff;
        }
      } else if (style[0] === "r") {
        // We don't parse all types of rgba(....) color styles. We only handle the
        // ones we generate ourselves.
        var values = style.substring(5, style.length - 1).split(",");
        var r = parseInt(values[0]);
        var g = parseInt(values[1]);
        var b = parseInt(values[2]);
        var a = parseFloat(values[3]);
        return (r & 0xff) << 24 |
               (g & 0xff) << 16 |
               (b & 0xff) << 8  |
               ((a * 255) & 0xff);
      }
      return 0xff0000ff; // Red
    }

    export function hexToRGB(color: string): number {
      return parseInt(color.slice(1), 16);
    }

    export function rgbToHex(color: number): string {
      return '#' + ('000000' + (color >>> 0).toString(16)).slice(-6);
    }

    export function isValidHexColor(value: any): boolean {
      return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value);
    }

    export function clampByte(value: number) {
      return Math.max(0, Math.min(255, value));
    }

    /**
     * Unpremultiplies the given |pARGB| color value.
     */
    export function unpremultiplyARGB(pARGB: number) {
      var b = (pARGB >>  0) & 0xff;
      var g = (pARGB >>  8) & 0xff;
      var r = (pARGB >> 16) & 0xff;
      var a = (pARGB >> 24) & 0xff;
      r = Math.imul(255, r) / a & 0xff;
      g = Math.imul(255, g) / a & 0xff;
      b = Math.imul(255, b) / a & 0xff;
      return a << 24 | r << 16 | g << 8 | b;
    }

    /**
     * Premultiplies the given |pARGB| color value.
     */
    export function premultiplyARGB(uARGB: number) {
      var b = (uARGB >>  0) & 0xff;
      var g = (uARGB >>  8) & 0xff;
      var r = (uARGB >> 16) & 0xff;
      var a = (uARGB >> 24) & 0xff;
      r = ((Math.imul(r, a) + 127) / 255) | 0;
      g = ((Math.imul(g, a) + 127) / 255) | 0;
      b = ((Math.imul(b, a) + 127) / 255) | 0;
      return a << 24 | r << 16 | g << 8 | b;
    }

    var premultiplyTable: Uint8Array;

    /**
     * All possible alpha values and colors 256 * 256 = 65536 entries. Experiments
     * indicate that doing unpremultiplication this way is roughly 5x faster.
     *
     * To lookup a color |c| in the table at a given alpha value |a| use:
     * |(a << 8) + c| to compute the index. This layout order was chosen to make
     * table lookups cache friendly, it actually makes a difference.
     *
     * TODO: Figure out if memory / speed tradeoff is worth it.
     */
    var unpremultiplyTable: Uint8Array;

    /**
     * Make sure to call this before using the |unpremultiplyARGBUsingTableLookup| or
     * |premultiplyARGBUsingTableLookup| functions. We want to execute this lazily so
     * we don't incur any startup overhead.
     */
    export function ensureUnpremultiplyTable() {
      if (!unpremultiplyTable) {
        unpremultiplyTable = new Uint8Array(256 * 256);
        for (var c = 0; c < 256; c++) {
          for (var a = 0; a < 256; a++) {
            unpremultiplyTable[(a << 8) + c] = Math.imul(255, c) / a;
          }
        }
      }
    }
    
    export function getUnpremultiplyTable(): Uint8Array {
      ensureUnpremultiplyTable();
      return unpremultiplyTable;
    }

    export function tableLookupUnpremultiplyARGB(pARGB): number {
      pARGB = pARGB | 0;
      var a = (pARGB >> 24) & 0xff;
      if (a === 0) {
        return 0;
      } else if (a === 0xff) {
        return pARGB;
      }
      var b = (pARGB >>  0) & 0xff;
      var g = (pARGB >>  8) & 0xff;
      var r = (pARGB >> 16) & 0xff;
      var o = a << 8;
      var T = unpremultiplyTable;
      r = T[o + r];
      g = T[o + g];
      b = T[o + b];
      return a << 24 | r << 16 | g << 8 | b;
    }

    /**
     * The blending equation for unpremultiplied alpha is:
     *
     *   (src.rgb * src.a) + (dst.rgb * (1 - src.a))
     *
     * For premultiplied alpha src.rgb and dst.rgb are already
     * premultiplied by alpha, so the equation becomes:
     *
     *   src.rgb + (dst.rgb * (1 - src.a))
     *
     * TODO: Not sure what to do about the dst.rgb which is
     * premultiplied by its alpah, but this appears to work.
     *
     * We use the "double blend trick" (http://stereopsis.com/doubleblend.html) to
     * compute GA and BR without unpacking them.
     */
    export function blendPremultipliedBGRA(tpBGRA: number, spBGRA: number) {
      var sA  = spBGRA & 0xff;
      var sGA = spBGRA      & 0x00ff00ff;
      var sBR = spBGRA >> 8 & 0x00ff00ff;
      var tGA = tpBGRA      & 0x00ff00ff;
      var tBR = tpBGRA >> 8 & 0x00ff00ff;
      var A  = 256 - sA;
      tGA = Math.imul(tGA, A) >> 8;
      tBR = Math.imul(tBR, A) >> 8;
      return ((sBR + tBR & 0x00ff00ff) << 8) | (sGA + tGA & 0x00ff00ff);
    }

    import swap32 = IntegerUtilities.swap32;
    export function convertImage(sourceFormat: ImageType, targetFormat: ImageType, source: Int32Array, target: Int32Array) {
      if (source !== target) {
        release || Debug.assert(source.buffer !== target.buffer, "Can't handle overlapping views.");
      }
      var length = source.length;
      if (sourceFormat === targetFormat) {
        if (source === target) {
          return;
        }
        for (var i = 0; i < length; i++) {
          target[i] = source[i];
        }
        return;
      }
      // enterTimeline("convertImage", ImageType[sourceFormat] + " to " + ImageType[targetFormat] + " (" + memorySizeToString(source.length));
      if (sourceFormat === ImageType.PremultipliedAlphaARGB &&
          targetFormat === ImageType.StraightAlphaRGBA) {
        Shumway.ColorUtilities.ensureUnpremultiplyTable();
        for (var i = 0; i < length; i++) {
          var pBGRA = source[i];
          var a = pBGRA & 0xff;
          if (a === 0) {
            target[i] = 0;
          } else if (a === 0xff) {
            target[i] = 0xff000000 | ((pBGRA >> 8) & 0x00ffffff);
          } else {
            var b = (pBGRA >> 24) & 0xff;
            var g = (pBGRA >> 16) & 0xff;
            var r = (pBGRA >>  8) & 0xff;
            var o = a << 8;
            var T = unpremultiplyTable;
            r = T[o + r];
            g = T[o + g];
            b = T[o + b];
            target[i] = a << 24 | b << 16 | g << 8 | r;
          }
        }
      } else if (sourceFormat === ImageType.StraightAlphaARGB &&
                 targetFormat === ImageType.StraightAlphaRGBA) {
        for (var i = 0; i < length; i++) {
          target[i] = swap32(source[i]);
        }
      } else if (sourceFormat === ImageType.StraightAlphaRGBA &&
                 targetFormat === ImageType.PremultipliedAlphaARGB) {
        for (var i = 0; i < length; i++) {
          var uABGR = source[i];
          var uARGB = (uABGR & 0xFF00FF00)  | // A_G_
                      (uABGR >> 16) & 0xff  | // A_GB
                      (uABGR & 0xff) << 16;   // ARGR
          target[i] = swap32(premultiplyARGB(uARGB));
        }
      } else {
        Debug.somewhatImplemented("Image Format Conversion: " + ImageType[sourceFormat] + " -> " + ImageType[targetFormat]);
        // Copy the buffer over for now, we should at least get some image output.
        for (var i = 0; i < length; i++) {
          target[i] = source[i];
        }
      }
      // leaveTimeline("convertImage");
    }
  }

  /**
   * Simple pool allocator for ArrayBuffers. This reduces memory usage in data structures
   * that resize buffers.
   */
  export class ArrayBufferPool {
    private _list: ArrayBuffer [];
    private _maxSize: number;
    private static _enabled = true;

    /**
     * Creates a pool that manages a pool of a |maxSize| number of array buffers.
     */
    constructor(maxSize: number = 32) {
      this._list = [];
      this._maxSize = maxSize;
    }

    /**
     * Creates or reuses an existing array buffer that is at least the
     * specified |length|.
     */
    public acquire(length: number): ArrayBuffer {
      if (ArrayBufferPool._enabled) {
        var list = this._list;
        for (var i = 0; i < list.length; i++) {
          var buffer = list[i];
          if (buffer.byteLength >= length) {
            list.splice(i, 1);
            return buffer;
          }
        }
      }
      return new ArrayBuffer(length);
    }

    /**
     * Releases an array buffer that is no longer needed back to the pool.
     */
    public release(buffer: ArrayBuffer) {
      if (ArrayBufferPool._enabled) {
        var list = this._list;
        release || Debug.assert(ArrayUtilities.indexOf(list, buffer) < 0);
        if (list.length === this._maxSize) {
          list.shift();
        }
        list.push(buffer);
      }
    }

    /**
     * Resizes a Uint8Array to have the given length.
     */
    public ensureUint8ArrayLength(array: Uint8Array, length: number): Uint8Array {
      if (array.length >= length) {
        return array;
      }
      var newLength = Math.max(array.length + length, ((array.length * 3) >> 1) + 1);
      var newArray = new Uint8Array(this.acquire(newLength), 0, newLength);
      newArray.set(array);
      this.release(array.buffer);
      return newArray;
    }

    /**
     * Resizes a Float64Array to have the given length.
     */
    public ensureFloat64ArrayLength(array: Float64Array, length: number): Float64Array {
      if (array.length >= length) {
        return array;
      }
      var newLength = Math.max(array.length + length, ((array.length * 3) >> 1) + 1);
      var newArray = new Float64Array(this.acquire(newLength * Float64Array.BYTES_PER_ELEMENT), 0, newLength);
      newArray.set(array);
      this.release(array.buffer);
      return newArray;
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

    export enum LoadResource {
      LoadSource = 0,
      LoadWhitelistAllowed = 1,
      LoadWhitelistDenied = 2,
      StreamAllowed = 3,
      StreamDenied = 4,
      StreamCrossdomain = 5
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
    close: () => void;
  }

  export interface IFileLoadingService {
    createSession(): FileLoadingSession;
    resolveUrl(url: string): string;
    navigateTo(url: string, target: string);
  }

  export module FileLoadingService {
    export var instance: IFileLoadingService;
  }

  export enum SystemResourceId {
    BuiltinAbc = 0,
    PlayerglobalAbcs = 1,
    PlayerglobalManifest = 2,
    ShellAbc = 3
  }

  export interface ISystemResourcesLoadingService {
    load(id: SystemResourceId): Promise<any>;
  }

  export module SystemResourcesLoadingService {
    export var instance: ISystemResourcesLoadingService;
  }

  export function registerCSSFont(id: number, data: Uint8Array, forceFontInit: boolean) {
    if (!inBrowser) {
      Debug.warning('Cannot register CSS font outside the browser');
      return;
    }
    var head = document.head;
    head.insertBefore(document.createElement('style'), head.firstChild);
    var style = <CSSStyleSheet>document.styleSheets[0];
    var rule = '@font-face{font-family:swffont' + id + ';src:url(data:font/opentype;base64,' +
               Shumway.StringUtilities.base64ArrayBuffer(data.buffer) + ')' + '}';
    style.insertRule(rule, style.cssRules.length);
    // In at least Chrome, the browser only decodes a font once it's used in the page at all.
    // Because it still does so asynchronously, we create a with some text using the font, take
    // some measurement from it (which will turn out wrong because the font isn't yet available),
    // and then remove the node again. Then, magic happens. After a bit of time for said magic to
    // take hold, the font is available for actual use on canvas.
    // TODO: remove the need for magic by implementing this in terms of the font loading API.
    if (forceFontInit) {
      var node = document.createElement('div');
      node.style.fontFamily = 'swffont' + id;
      node.innerHTML = 'hello';
      document.body.appendChild(node);
      var dummyHeight = node.clientHeight;
      document.body.removeChild(node);
    }
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
      initJS(callback: (functionName: string, args: any[]) => any) {
        // ...
      },
      registerCallback(functionName: string) {
        // ...
      },
      unregisterCallback(functionName: string) {
        // ...
      },
      eval(expression: string): any {
        // ...
      },
      call(request: string): any {
        // ...
      },
      getId(): string { return null; }
    };
  }

  export enum LocalConnectionConnectResult {
    InvalidCallback = -3,
    AlreadyTaken = -2,
    InvalidName = -1,
    Success = 0
  }

  export enum LocalConnectionCloseResult {
    NotConnected = -1,
    Success = 0
  }

  export interface ILocalConnectionReceiver {
    handleMessage(methodName: string, argsBuffer: ArrayBuffer): void;
  }

  export interface ILocalConnectionSender {
    dispatchEvent(event): void;
    hasEventListener(type: string): boolean;
    sec: any;
  }

  export interface ILocalConnectionService {
    createConnection(connectionName: string,
                          receiver: ILocalConnectionReceiver): LocalConnectionConnectResult;
    closeConnection(connectionName: string,
                         receiver: ILocalConnectionReceiver): LocalConnectionCloseResult;
    send(connectionName: string, methodName: string, args: ArrayBuffer,
         sender: ILocalConnectionSender, senderDomain: string, senderIsSecure: boolean): void;
    allowDomains(connectionName: string, receiver: ILocalConnectionReceiver, domains: string[],
                 secure: boolean);
  }

  export module LocalConnectionService {
    export var instance: ILocalConnectionService;
  }

  export interface IClipboardService {
    setClipboard(data: string): void;
  }

  export module ClipboardService {
    export var instance: IClipboardService = {
      setClipboard(data: string) { Debug.notImplemented('setClipboard'); }
    };
  }

  export class Callback {
    private _queues: any;
    constructor () {
      this._queues = {};
    }

    public register(type, callback) {
      Debug.assert(type);
      Debug.assert(callback);
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
      Debug.assert(type);
      Debug.assert(callback);
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

  export enum ImageType {
    None,

    /**
     * Premultiplied ARGB (byte-order).
     */
    PremultipliedAlphaARGB,

    /**
     * Unpremultiplied ARGB (byte-order).
     */
    StraightAlphaARGB,

    /**
     * Unpremultiplied RGBA (byte-order), this is what putImageData expects.
     */
    StraightAlphaRGBA,

    JPEG,
    PNG,
    GIF
  }

  export function getMIMETypeForImageType(type: ImageType): string {
    switch (type) {
      case ImageType.JPEG: return "image/jpeg";
      case ImageType.PNG: return "image/png";
      case ImageType.GIF: return "image/gif";
      default: return "text/plain";
    }
  }

  export module UI {

    /*
     * Converts a |MouseCursor| number to a CSS |cursor| property value.
     */
    export function toCSSCursor(mouseCursor:number) {
      switch (mouseCursor) {
        case 0: // MouseCursor.AUTO
          return 'auto';
        case 2: // MouseCursor.BUTTON
          return 'pointer';
        case 3: // MouseCursor.HAND
          return 'grab';
        case 4: // MouseCursor.IBEAM
          return 'text';
        case 1: // MouseCursor.ARROW
        default:
          return 'default';
      }
    }

  }

  export class PromiseWrapper<T> {
    public promise: Promise<T>;
    public resolve: (result:T) => void;
    public reject: (reason) => void;

    then(onFulfilled, onRejected) {
      return this.promise.then(onFulfilled, onRejected);
    }

    constructor() {
      this.promise = new Promise<T>(function (resolve, reject) {
        this.resolve = resolve;
        this.reject = reject;
      }.bind(this));
    }
  }
}


declare var exports;
if (typeof exports !== "undefined") {
  exports["Shumway"] = Shumway;
}


/**
 * Extend builtin prototypes.
 *
 * TODO: Go through the code and remove all references to these.
 */
(function () {
  function extendBuiltin(prototype, property, value) {
    if (!prototype[property]) {
      Object.defineProperty(prototype, property,
        { value: value,
          writable: true,
          configurable: true,
          enumerable: false });
    }
  }

  function removeColors(s) {
    return s.replace(/\033\[[0-9]*m/g, "");
  }

  extendBuiltin(String.prototype, "padRight", function (c, n) {
    var str = this;
    var length = removeColors(str).length;
    if (!c || length >= n) {
      return str;
    }
    var max = (n - length) / c.length;
    for (var i = 0; i < max; i++) {
      str += c;
    }
    return str;
  });

  extendBuiltin(String.prototype, "padLeft", function (c, n) {
    var str = this;
    var length = str.length;
    if (!c || length >= n) {
      return str;
    }
    var max = (n - length) / c.length;
    for (var i = 0; i < max; i++) {
      str = c + str;
    }
    return str;
  });

  extendBuiltin(String.prototype, "trim", function () {
    return this.replace(/^\s+|\s+$/g,"");
  });

  extendBuiltin(String.prototype, "endsWith", function (str) {
    return this.indexOf(str, this.length - str.length) !== -1;
  });

  extendBuiltin(Array.prototype, "replace", function(x, y) {
    if (x === y) {
      return 0;
    }
    var count = 0;
    for (var i = 0; i < this.length; i++) {
      if (this[i] === x) {
        this[i] = y;
        count ++;
      }
    }
    return count;
  });

})();
