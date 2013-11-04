/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
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

var inBrowser = typeof console != "undefined";

if (!this.performance) {
  this.performance = {};
}
if (!this.performance.now) {
  this.performance.now = dateNow;
}

function backtrace() {
  try {
    throw new Error();
  } catch (e) {
    return e.stack ? e.stack.split('\n').slice(2).join('\n') : '';
  }
}

function error(message) {
  if (!inBrowser) {
    console.warn(backtrace());
  }
  throw new Error(message);
}

function assert(condition) {
  if (condition === "") {     // avoid inadvertent false positive
    condition = true;
  }
  if (!condition) {
    var message = Array.prototype.slice.call(arguments);
    message.shift();
    error(message.join(""));
  }
}

function assertNotImplemented(condition, message) {
  if (!condition) {
    error("NotImplemented: " + message);
  }
}

function warning(message) {
  release || console.warn(message);
}

function notUsed(message) {
  release || assert(false, "Not Used " + message);
}

function notImplemented(message) {
  release || assert(false, "Not Implemented " + message);
}

function somewhatImplemented(message) {
  warning("somewhatImplemented: " + message);
}

function unexpected(message) {
  assert(false, "Unexpected: " + message);
}

function makeForwardingGetter(target) {
  return new Function("return this[\"" + target + "\"]");
}

function makeForwardingSetter(target) {
  return new Function("value", "this[\"" + target + "\"] = value;");
}

function defineReadOnlyProperty(obj, name, value) {
  Object.defineProperty(obj, name, { value: value,
                                     writable: false,
                                     configurable: true,  // XXX: make it non-configurable?
                                     enumerable: false });
}

/**
 * Makes sure you never re-bind a method.
 */
function bindSafely(fn, obj) {
  release || assert (!fn.boundTo && obj);
  var f = fn.bind(obj);
  f.boundTo = obj;
  return f;
}

function createEmptyObject() {
  return Object.create(null);
}

function getOwnPropertyDescriptors(object) {
  var o = createEmptyObject();
  var properties = Object.getOwnPropertyNames(object);
  for (var i = 0; i < properties.length; i++) {
    o[properties[i]] = Object.getOwnPropertyDescriptor(object, properties[i]);
  }
  return o;
}

function cloneObject(object) {
  var clone = Object.create(null);
  for (var property in object) {
    clone[property] = object[property];
  }
  return clone;
}

function extendObject(object, properties) {
  var extended = Object.create(object);
  if (properties) {
    for (var key in properties) {
      extended[key] = properties[key];
    }
  }
  return extended;
}

function copyProperties(object, template) {
  for (var property in template) {
    object[property] = template[property];
  }
}

/*
 * Stringify functions that try not to call |toString| inadvertently.
 */

function toSafeString(value) {
  if (typeof value === "string") {
    return "\"" + value + "\"";
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return typeof value;
}

function toSafeArrayString(array) {
  var str = [];
  for (var i = 0; i < array.length; i++) {
    str.push(toSafeString(array[i]));
  }
  return str.join(", ");
}

function getLatestGetterOrSetterPropertyDescriptor(obj, name) {
  var descriptor = {};
  while (obj) {
    var tmp = Object.getOwnPropertyDescriptor(obj, name);
    if (tmp) {
      descriptor.get = descriptor.get || tmp.get;
      descriptor.set = descriptor.set || tmp.set;
    }
    if (descriptor.get && descriptor.set) {
      break;
    }
    obj = Object.getPrototypeOf(obj);
  }
  return descriptor;
}

function defineNonEnumerableGetterOrSetter(obj, name, value, isGetter) {
  var descriptor = getLatestGetterOrSetterPropertyDescriptor(obj, name);
  descriptor.configurable = true;
  descriptor.enumerable = false;
  if (isGetter) {
    descriptor.get = value;
  } else {
    descriptor.set = value;
  }
  Object.defineProperty(obj, name, descriptor);
}

function defineNonEnumerableGetter(obj, name, getter) {
  Object.defineProperty(obj, name, { get: getter,
                                     configurable: true,
                                     enumerable: false });
}

function defineNonEnumerableSetter(obj, name, setter) {
  Object.defineProperty(obj, name, { set: setter,
                                     configurable: true,
                                     enumerable: false });
}

function defineNonEnumerableProperty(obj, name, value) {
  Object.defineProperty(obj, name, { value: value,
                                     writable: true,
                                     configurable: true,
                                     enumerable: false });
}

function defineNonEnumerableForwardingProperty(obj, name, otherName) {
  Object.defineProperty(obj, name, {
    get: makeForwardingGetter(otherName),
    set: makeForwardingSetter(otherName),
    writable: true,
    configurable: true,
    enumerable: false
  });
}

function defineNewNonEnumerableProperty(obj, name, value) {
  release || assert (!Object.prototype.hasOwnProperty.call(obj, name), "Property: " + name + " already exits.");
  defineNonEnumerableProperty(obj, name, value);
}

function isNullOrUndefined(value) {
  return value == undefined;
}

function isPowerOfTwo(x) {
  return x && ((x & (x - 1)) === 0);
}

function time(fn, count) {
  var start = performance.now();
  for (var i = 0; i < count; i++) {
    fn();
  }
  var time = (performance.now() - start) / count;
  console.info("Took: " + time.toFixed(2) + "ms.");
  return time;
}

function clamp(x, min, max) {
  if (x < min) {
    return min;
  } else if (x > max) {
    return max;
  }
  return x;
}

/**
 * Workaround for max stack size limit.
 */
function fromCharCodeArray(buffer) {
  var str = "", SLICE = 1024 * 16;
  for (var i = 0; i < buffer.length; i += SLICE) {
    var chunk = Math.min(buffer.length - i, SLICE);
    str += String.fromCharCode.apply(null, buffer.subarray(i, i + chunk));
  }
  return str;
}

function hasOwnProperty(object, name) {
  return Object.prototype.hasOwnProperty.call(object, name);
}

/**
 * Converts an object to an array of key, value arrays.
 */
function toKeyValueArray(o) {
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  var a = [];
  for (var k in o) {
    if (hasOwnProperty.call(o, k)) {
      a.push([k, o[k]]);
    }
  }
  return a;
}

/**
 * Checks for key names that don't need to be prefixed.
 * TODO: Rename this and clean up the code that deals with prefixed vs. non-prefixed key names.
 */
function isNumeric(x) {
  if (typeof x === "number") {
    return x === (x | 0);
  }
  if (typeof x !== "string" || x.length === 0) {
    return false;
  }
  if (x === "0") {
    return true;
  }
  var c = x.charCodeAt(0);
  if ((c >= 49) && (c <= 57)) {
    for (var i = 1, j = x.length; i < j; i++) {
      c = x.charCodeAt(i);
      if (!((c >= 48) && (c <= 57))) {
        return false;
      }
    }
    return true;
  }
  return false;
}

function boxValue(value) {
  if (isNullOrUndefined(value) || isObject(value)) {
    return value;
  }
  return Object(value);
}

function isObject(value) {
  return typeof value === "object" || typeof value === 'function';
}

function isString(value) {
  return typeof value === "string";
}

function isFunction(value) {
  return typeof value === "function";
}

function isNumber(value) {
  return typeof value === "number";
}

function toNumber(x) {
  return +x;
}

function setBitFlags(flags, flag, value) {
  return value ? flags | flag : flags & ~flag;
}

function getBitFlags(flags, flag) {
  return !!(flags & flag);
}

/**
 * Pops elements from a source array into a destination array. This avoids
 * allocations and should be faster. The elements in the destination array
 * are pushed in the same order as they appear in the source array:
 *
 * popManyInto([1, 2, 3], 2, dst) => dst = [2, 3]
 */
function popManyInto(src, count, dst) {
  release || assert(src.length >= count);
  for (var i = count - 1; i >= 0; i--) {
    dst[i] = src.pop();
  }
  dst.length = count;
}

(function () {
  function extendBuiltin(proto, prop, f) {
    if (!proto[prop]) {
      Object.defineProperty(proto, prop,
                            { value: f,
                              writable: true,
                              configurable: true,
                              enumerable: false });
    }
  }

  var Sp = String.prototype;

  function removeColors(s) {
    return s.replace(/\033\[[0-9]*m/g, "");
  }

  extendBuiltin(Sp, "padRight", function (c, n) {
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

  extendBuiltin(Sp, "padLeft", function (c, n) {
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

  extendBuiltin(Sp, "trim", function () {
    return this.replace(/^\s+|\s+$/g,"");
  });

  extendBuiltin(Sp, "endsWith", function (str) {
    return this.indexOf(str, this.length - str.length) !== -1;
  });

  var Ap = Array.prototype;

  extendBuiltin(Ap, "popMany", function (count) {
    release || assert(this.length >= count);
    var start = this.length - count;
    var res = this.slice(start, this.length);
    this.splice(start, count);
    return res;
  });

  extendBuiltin(Ap, "pushMany", function (array) {
    for (var i = 0; i < array.length; i++) {
      this.push(array[i]);
    }
  });

  extendBuiltin(Ap, "clone", function () {
    return this.slice(0);
  });

  extendBuiltin(Ap, "first", function () {
    release || assert(this.length > 0);
    return this[0];
  });

  extendBuiltin(Ap, "last", function () {
    release || assert(this.length > 0);
    return this[this.length - 1];
  });

  extendBuiltin(Ap, "peek", function() {
    release || assert(this.length > 0);
    return this[this.length - 1];
  });

  extendBuiltin(Ap, "empty", function() {
    return this.length === 0;
  });

  extendBuiltin(Ap, "pushUnique", function(v) {
    for (var i = 0, j = this.length; i < j; i++) {
      if (this[i] === v) {
        return;
      }
    }
    this.push(v);
  });

  extendBuiltin(Ap, "unique", function() {
    var unique = [];
    for (var i = 0; i < this.length; i++) {
      unique.pushUnique(this[i]);
    }
    return unique;
  });

  extendBuiltin(Ap, "replace", function(x, y) {
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

  extendBuiltin(Ap, "count", function(x) {
    var count = 0;
    for (var i = 0; i < this.length; i++) {
      if (this[i] === x) {
        count ++;
      }
    }
    return count;
  });

  extendBuiltin(Ap, "notEmpty", function() {
    return this.length > 0;
  });

  extendBuiltin(Ap, "contains", function(val) {
    return this.indexOf(val) >= 0;
  });

  extendBuiltin(Ap, "top", function() {
    return this.length && this[this.length - 1];
  });

  extendBuiltin(Ap, "mapWithIndex", function(fn) {
    var arr = [];
    for (var i = 0; i < this.length; i++) {
      arr.push(fn(this[i], i));
    }
    return arr;
  });
})();

function utf8decode(str) {
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

function utf8encode(bytes) {
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

function getFlags(value, flags) {
  var str = "";
  for (var i = 0; i < flags.length; i++) {
    if (value & (1 << i)) {
      str += flags[i] + " ";
    }
  }
  if (str.length === 0) {
    return "";
  }
  return str.trim();
}

function bitCount(i) {
  i = i - ((i >> 1) & 0x55555555);
  i = (i & 0x33333333) + ((i >> 2) & 0x33333333);
  return (((i + (i >> 4)) & 0x0F0F0F0F) * 0x01010101) >> 24;
}

function escapeString(str) {
  if (str !== undefined) {
    str = str.replace(/[^\w$]/gi,"$"); /* No dots, colons, dashes and /s */
    if (/^\d/.test(str)) { /* No digits at the beginning */
      str = '$' + str;
    }
  }
  return str;
}

/**
 * BitSet backed by a typed array. We intentionally leave out assertions for performance reasons. We
 * assume that all indices are within bounds, and that set operations are applied to equal sized sets.
 * Inspired by Maxine's BitMap.
 *
 * If the set fits in a single word, a single int is used.
 */
function BitSetFunctor(length) {
  var ADDRESS_BITS_PER_WORD = 5;
  var BITS_PER_WORD = 1 << ADDRESS_BITS_PER_WORD;
  var BIT_INDEX_MASK = BITS_PER_WORD - 1;
  var SIZE = ((length + (BITS_PER_WORD - 1)) >> ADDRESS_BITS_PER_WORD) << ADDRESS_BITS_PER_WORD;

  function BitSet() {
    /* How many bits are set. */
    this.count = 0;
    /* Do we need to recompute the count? */
    this.dirty = 0;
    /* Size of the bit array. */
    this.size = SIZE;
    /* The word array. */
    this.bits = new Uint32Array(SIZE >> ADDRESS_BITS_PER_WORD);
  }

  function BitSetS() {
    this.count = 0;
    this.dirty = 0;
    this.size = SIZE;
    this.bits = 0;
  }

  var singleword = (SIZE >> ADDRESS_BITS_PER_WORD) === 1;
  var Ctor = singleword ? BitSetS : BitSet;

  Ctor.ADDRESS_BITS_PER_WORD = ADDRESS_BITS_PER_WORD;
  Ctor.BITS_PER_WORD = BITS_PER_WORD;
  Ctor.BIT_INDEX_MASK = BIT_INDEX_MASK;
  Ctor.singleword = singleword;

  function ones(v) {
    v = v - ((v >> 1) & 0x55555555);
    v = (v & 0x33333333) + ((v >> 2) & 0x33333333);
    return ((v + (v >> 4) & 0xF0F0F0F) * 0x1010101) >> 24;
  }

  function leadingZeros(v) {
    v |= (v >> 1);
    v |= (v >> 2);
    v |= (v >> 4);
    v |= (v >> 8);
    v |= (v >> 16);
    return 32 - ones(v);
  }

  function trailingZeros(v) {
    return ones((v & -v) - 1);
  }

  BitSet.prototype = {
    recount: function recount() {
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
    },

    set: function set(i) {
      var n = i >> ADDRESS_BITS_PER_WORD;
      var old = this.bits[n];
      var b = old | (1 << (i & BIT_INDEX_MASK));
      this.bits[n] = b;
      this.dirty |= old ^ b;
    },

    setAll: function setAll() {
      var bits = this.bits;
      for (var i = 0, j = bits.length; i < j; i++) {
        bits[i] = 0xFFFFFFFF;
      }
      this.count = this.size;
      this.dirty = 0;
    },

    assign: function assign(set) {
      this.count = set.count;
      this.dirty = set.dirty;
      this.size = set.size;
      for (var i = 0, j = this.bits.length; i < j; i++) {
        this.bits[i] = set.bits[i];
      }
    },

    clear: function clear(i) {
      var n = i >> ADDRESS_BITS_PER_WORD;
      var old = this.bits[n];
      var b = old & ~(1 << (i & BIT_INDEX_MASK));
      this.bits[n] = b;
      this.dirty |= old ^ b;
    },

    get: function get(i) {
      var word = this.bits[i >> ADDRESS_BITS_PER_WORD];
      return ((word & 1 << (i & BIT_INDEX_MASK))) !== 0;
    },

    clearAll: function clearAll() {
      var bits = this.bits;
      for (var i = 0, j = bits.length; i < j; i++) {
        bits[i] = 0;
      }
      this.count = 0;
      this.dirty = 0;
    },

    _union: function _union(other) {
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
    },

    intersect: function intersect(other) {
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
    },

    subtract: function subtract(other) {
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
    },

    negate: function negate() {
      var dirty = this.dirty;
      var bits = this.bits;
      for (var i = 0, j = bits.length; i < j; i++) {
        var old = bits[i];
        var b = ~old;
        bits[i] = b;
        dirty |= old ^ b;
      }
      this.dirty = dirty;
    },

    forEach: function forEach(fn) {
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
    },

    toArray: function toArray() {
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
    },

    equals: function equals(other) {
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
    },

    contains: function contains(other) {
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
    },

    toBitString: function toBitString(on, off) {
      on = on || "1";
      off = off || "0";
      var str = "";
      for (var i = 0; i < length; i++) {
        str += this.get(i) ? on : off;
      }
      return str;
    },

    length: length,

    toString: function toString(names) {
      var set = [];
      for (var i = 0; i < length; i++) {
        if (this.get(i)) {
          set.push(names ? names[i] : i);
        }
      }
      return set.join(", ");
    },

    isEmpty: function isEmpty() {
      this.recount();
      return this.count === 0;
    },

    clone: function clone() {
      var set = new BitSet();
      set._union(this);
      return set;
    }
  };

  BitSetS.prototype = {
    recount: function recount() {
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
    },

    set: function set(i) {
      var old = this.bits;
      var b = old | (1 << (i & BIT_INDEX_MASK));
      this.bits = b;
      this.dirty |= old ^ b;
    },

    setAll: function setAll() {
      this.bits = 0xFFFFFFFF;
      this.count = this.size;
      this.dirty = 0;
    },

    assign: function assign(set) {
      this.count = set.count;
      this.dirty = set.dirty;
      this.size = set.size;
      this.bits = set.bits;
    },

    clear: function clear(i) {
      var old = this.bits;
      var b = old & ~(1 << (i & BIT_INDEX_MASK));
      this.bits = b;
      this.dirty |= old ^ b;
    },

    get: function get(i) {
      return ((this.bits & 1 << (i & BIT_INDEX_MASK))) !== 0;
    },

    clearAll: function clearAll() {
      this.bits = 0;
      this.count = 0;
      this.dirty = 0;
    },

    _union: function _union(other) {
      var old = this.bits;
      var b = old | other.bits;
      this.bits = b;
      this.dirty = old ^ b;
    },

    intersect: function intersect(other) {
      var old = this.bits;
      var b = old & other.bits;
      this.bits = b;
      this.dirty = old ^ b;
    },

    subtract: function subtract(other) {
      var old = this.bits;
      var b = old & ~other.bits;
      this.bits = b;
      this.dirty = old ^ b;
    },

    negate: function negate() {
      var old = this.bits;
      var b = ~old;
      this.bits = b;
      this.dirty = old ^ b;
    },

    forEach: function forEach(fn) {
      release || assert(fn);
      var word = this.bits;
      if (word) {
        for (var k = 0; k < BITS_PER_WORD; k++) {
          if (word & (1 << k)) {
            fn(k);
          }
        }
      }
    },

    toArray: function toArray() {
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
    },

    equals: function equals(other) {
      return this.bits === other.bits;
    },

    contains: function contains(other) {
      var bits = this.bits;
      return (bits | other.bits) === bits;
    },

    isEmpty: function isEmpty() {
      this.recount();
      return this.count === 0;
    },

    clone: function clone() {
      var set = new BitSetS();
      set._union(this);
      return set;
    },

    toBitString: BitSet.prototype.toBitString,
    toString: BitSet.prototype.toString,

    length: length,
  };

  return Ctor;
}

// https://gist.github.com/958841
function base64ArrayBuffer(arrayBuffer) {
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

var PURPLE = '\033[94m';
var YELLOW = '\033[93m';
var GREEN = '\033[92m';
var RED = '\033[91m';
var ENDC = '\033[0m';

var IndentingWriter = (function () {
  var consoleOutFn = console.info.bind(console);
  function indentingWriter(suppressOutput, outFn) {
    this.tab = "  ";
    this.padding = "";
    this.suppressOutput = suppressOutput;
    this.out = outFn || consoleOutFn;
  }

  indentingWriter.prototype.writeLn = function writeLn(str) {
    if (!this.suppressOutput) {
      this.out(this.padding + str);
    }
  };

  indentingWriter.prototype.writeLns = function writeLns(str) {
    var lines = str.split("\n");
    for (var i = 0; i < lines.length; i++) {
      this.writeLn(lines[i]);
    }
  };

  indentingWriter.prototype.debugLn = function debugLn(str) {
    this.colorLn(PURPLE, str);
  };

  indentingWriter.prototype.yellowLn = function yellowLn(str) {
    this.colorLn(YELLOW, str);
  };

  indentingWriter.prototype.greenLn = function greenLn(str) {
    this.colorLn(GREEN, str);
  };

  indentingWriter.prototype.redLn = function redLn(str) {
    this.colorLn(RED, str);
  };

  indentingWriter.prototype.colorLn = function writeLn(color, str) {
    if (!this.suppressOutput) {
      if (!inBrowser) {
        this.out(this.padding + color + str + ENDC);
      } else {
        this.out(this.padding + str);
      }
    }
  };

  indentingWriter.prototype.enter = function enter(str) {
    if (!this.suppressOutput) {
      this.out(this.padding + str);
    }
    this.indent();
  };

  indentingWriter.prototype.leaveAndEnter = function leaveAndEnter(str) {
    this.leave(str);
    this.indent();
  };

  indentingWriter.prototype.leave = function leave(str) {
    this.outdent();
    if (!this.suppressOutput) {
      this.out(this.padding + str);
    }
  };

  indentingWriter.prototype.indent = function indent() {
    this.padding += this.tab;
  };

  indentingWriter.prototype.outdent = function outdent() {
    if (this.padding.length > 0) {
      this.padding = this.padding.substring(0, this.padding.length - this.tab.length);
    }
  };

  indentingWriter.prototype.writeArray = function writeArray(arr, detailed, noNumbers) {
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
  };

  return indentingWriter;
})();

var Map = (function() {
  function map () {
    this.elements = {};
  }
  map.prototype.set = function set(k, v) {
    this.elements[k] = v;
  };
  map.prototype.get = function get(k) {
    if (this.has(k)) {
      return this.elements[k];
    }
    return undefined;
  };
  map.prototype.has = function has(k) {
    return Object.prototype.hasOwnProperty.call(this.elements, k);
  };
  map.prototype.remove = function remove(k) {
    if (this.has(k)) {
      delete this.elements[k];
    }
  };
  return map;
})();

/**
 * SortedList backed up by a linked list.
 *  sortedList(compare) - the constructor takes a |compare| function
 *                        that defines the sort order.
 *  push(value) - inserts a new item in the list doing a linear search O(n)
 *                to find the right place.
 *  pop() - returns and removes the head of the list O(1)
 *  peek() - returns the head of the list without removing it O(1)
 *  contains(value) - returns true if the |value| is in the list, false otherwise O(n)
 *
 *  The compare function takes two arguments. If these arguments are a and b then:
 *    compare(a,b) < 0 means that a is less than b
 *    compare(a,b) === 0 means that a is equal to b
 *    compare(a,b) > 0 means that a is greater than b
 */
var SortedList = (function() {

  function sortedList(compare) {
    release || assert(compare);
    this.compare = compare;
    this.head = null;
    this.length = 0;
  }

  sortedList.RETURN = 1;
  sortedList.DELETE = 2;

  sortedList.prototype.push = function push(value) {
    release || assert(value !== undefined);
    this.length ++;
    if (!this.head) {
      this.head = {value: value, next: null};
      return;
    }

    var curr = this.head;
    var prev = null;
    var node = {value: value, next: null};
    var compare = this.compare;
    while (curr) {
      if (compare(curr.value, node.value) > 0) {
        if (prev) {
          node.next = curr;
          prev.next = node;
        } else {
          node.next = this.head;
          this.head = node;
        }
        return;
      }
      prev = curr;
      curr = curr.next;
    }
    prev.next = node;
  };

  /**
   * Visitors can return RETURN if they wish to stop the iteration or DELETE if they need to delete the current node.
   * NOTE: DELETE most likley doesn't work if there are multiple active iterations going on.
   */
  sortedList.prototype.forEach = function forEach(visitor) {
    var curr = this.head;
    var last = null;
    while (curr) {
      var result = visitor(curr.value);
      if (result === sortedList.RETURN) {
        return;
      } else if (result === sortedList.DELETE) {
        if (!last) {
          curr = this.head = this.head.next;
        } else {
          curr = last.next = curr.next;
        }
      } else {
        last = curr;
        curr = curr.next;
      }
    }
  };

  sortedList.prototype.pop = function pop() {
    if (!this.head) {
      return undefined;
    }
    this.length --;
    var ret = this.head;
    this.head = this.head.next;
    return ret.value;
  };

  sortedList.prototype.peek = function peek() {
    return this.head;
  };

  sortedList.prototype.contains = function contains(value) {
    var curr = this.head;
    while (curr) {
      if (curr.value === value) {
        return true;
      }
      curr = curr.next;
    }
    return false;
  };

  sortedList.prototype.toString = function () {
    var str = "[";
    var curr = this.head;
    while (curr) {
      str += curr.value.toString();
      curr = curr.next;
      if (curr) {
        str += ",";
      }
    }
    str += "]";
    return str;
  };

  return sortedList;
})();

(function checkWeakMap() {
  if (typeof this.WeakMap === 'function')
    return; // weak map is supported

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
  this.WeakMap = WeakMap;
})();

var Callback = (function () {
  function callback() {
    this.queues = {};
  }
  callback.prototype.register = function register(type, callback) {
    assert(type);
    assert(callback);
    var queue = this.queues[type];
    if (queue) {
      if (queue.indexOf(callback) > -1) {
        return;
      }
    } else {
      queue = this.queues[type] = [];
    }
    queue.push(callback);
  };
  callback.prototype.unregister = function unregister(type, callback) {
    assert(type);
    assert(callback);
    var queue = this.queues[type];
    if (!queue) {
      return;
    }
    var i = queue.indexOf(callback);
    if (i !== -1) {
      queue.splice(i, 1);
    }
    if (queue.length === 0) {
      this.queues[type] = null;
    }
  };
  callback.prototype.notify = function notify(type, /*...*/args) {
    var queue = this.queues[type];
    if (!queue) {
      return;
    }
    queue = queue.slice();
    var args = sliceArguments(arguments, 0);
    for (var i = 0; i < queue.length; i++) {
      if ($DEBUG) {
        Counter.count("callback(" + type + ").notify");
      }
      var callback = queue[i];
      callback.apply(null, args);
    }
  };
  callback.prototype.notify1 = function notify1(type, value) {
    var queue = this.queues[type];
    if (!queue) {
      return;
    }
    queue = queue.slice();
    for (var i = 0; i < queue.length; i++) {
      if ($DEBUG) {
        Counter.count("callback(" + type + ").notify1");
      }
      var callback = queue[i];
      callback(type, value);
    }
  };
  return callback;
})();

var CircularBuffer = (function () {
  var mask = 0xFFF, size = 4096;
  function circularBuffer(Type) {
    this.index = 0;
    this.start = 0;
    this.array = new Type(size);
  }
  circularBuffer.prototype.get = function (i) {
    return this.array[i];
  };
  circularBuffer.prototype.forEachInReverse = function (visitor) {
    if (this.isEmpty()) {
      return;
    }
    var i = this.index === 0 ? size - 1 : this.index - 1;
    while (i !== this.start) {
      if (visitor(this.array[i], i)) {
        break;
      }
      i = i === 0 ? size - 1 : i - 1;
    }
  };
  circularBuffer.prototype.write = function (value) {
    this.array[this.index] = value;
    this.index = (this.index + 1) & mask;
    if (this.index === this.start) {
      this.start = (this.start + 1) & mask;
    }
  };
  circularBuffer.prototype.isFull = function () {
    return (this.index + 1) & mask === this.start;
  };
  circularBuffer.prototype.isEmpty = function () {
    return this.index === this.start;
  };
  return circularBuffer;
})();

function lazyClass(holder, name, initialize) {
  Object.defineProperty(holder, name, {
    get: function () {
      var start = performance.now();
      var value = initialize();
      print("Initialized Class: " + name + " " + (performance.now() - start).toFixed(4));
      assert (value);
      Object.defineProperty(holder, name, { value: value, writable: true });
      return value;
    }, configurable: true
  });
}

function createNewCompartment() {
  return newGlobal('new-compartment');
}