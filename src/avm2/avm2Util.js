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

var error = Shumway.Debug.error;
var assertNotImplemented = Shumway.Debug.assertNotImplemented;
var warning = Shumway.Debug.warning;
var notImplemented = Shumway.Debug.notImplemented;
var somewhatImplemented = Shumway.Debug.somewhatImplemented;
var unexpected = Shumway.Debug.unexpected;

var defineReadOnlyProperty = Shumway.ObjectUtilities.defineReadOnlyProperty;
var createEmptyObject = Shumway.ObjectUtilities.createEmptyObject;

var makeForwardingGetter = Shumway.FunctionUtilities.makeForwardingGetter;
var makeForwardingSetter = Shumway.FunctionUtilities.makeForwardingSetter;
var bindSafely = Shumway.FunctionUtilities.bindSafely;
var cloneObject = Shumway.ObjectUtilities.cloneObject;
var copyProperties = Shumway.ObjectUtilities.copyProperties;

/*
 * Stringify functions that try not to call |toString| inadvertently.
 */

var toSafeString = Shumway.StringUtilities.toSafeString;
var toSafeArrayString = Shumway.StringUtilities.toSafeArrayString;

var getLatestGetterOrSetterPropertyDescriptor = Shumway.ObjectUtilities.getLatestGetterOrSetterPropertyDescriptor;
var defineNonEnumerableGetterOrSetter = Shumway.ObjectUtilities.defineNonEnumerableGetterOrSetter;
var defineNonEnumerableGetter = Shumway.ObjectUtilities.defineNonEnumerableGetter;
var defineNonEnumerableSetter = Shumway.ObjectUtilities.defineNonEnumerableSetter;
var defineNonEnumerableProperty = Shumway.ObjectUtilities.defineNonEnumerableProperty;
var defineNonEnumerableForwardingProperty = Shumway.ObjectUtilities.defineNonEnumerableForwardingProperty;
var defineNewNonEnumerableProperty = Shumway.ObjectUtilities.defineNewNonEnumerableProperty;

var isNumeric = Shumway.isNumeric;
var isNullOrUndefined = Shumway.isNullOrUndefined;
var isPowerOfTwo = Shumway.IntegerUtilities.isPowerOfTwo;


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

var fromCharCodeArray = Shumway.StringUtilities.fromCharCodeArray;


function hasOwnProperty(object, name) {
  return Object.prototype.hasOwnProperty.call(object, name);
}

/**
 * Converts an object to an array of key, value arrays.
 */
var toKeyValueArray = Shumway.ObjectUtilities.toKeyValueArray;


/**
 * Checks for key names that don't need to be prefixed.
 * TODO: Rename this and clean up the code that deals with prefixed vs. non-prefixed key names.
 */

var boxValue = Shumway.ObjectUtilities.boxValue;

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

  var uniquesMap;
  if (typeof Map !== 'undefined' && (uniquesMap = new Map()).clear) {
    extendBuiltin(Ap, "unique", function() {
      var unique = [];
      for (var i = 0; i < this.length; i++) {
        if (uniquesMap.has(this[i])) {
          continue;
        }
        unique.push(this[i]);
        uniquesMap.set(this[i], true);
      }
      uniquesMap.clear();
      return unique;
    });
  } else {
    extendBuiltin(Ap, "unique", function() {
      var unique = [];
      for (var i = 0; i < this.length; i++) {
        unique.pushUnique(this[i]);
      }
      return unique;
    });
  }

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

var utf8decode = Shumway.StringUtilities.utf8decode;
var utf8encode = Shumway.StringUtilities.utf8encode;
var escapeString = Shumway.StringUtilities.escapeString;

var bitCount = Shumway.IntegerUtilities.bitCount;
var ones = Shumway.IntegerUtilities.ones;
var leadingZeros = Shumway.IntegerUtilities.leadingZeros;
var trailingZeros = Shumway.IntegerUtilities.trailingZeros;
var getFlags = Shumway.IntegerUtilities.getFlags;

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

var hashBytesTo32BitsAdler = Shumway.HashUtilities.hashBytesTo32BitsAdler;
var hashBytesTo32BitsMD5 = Shumway.HashUtilities.hashBytesTo32BitsMD5;

var variableLengthEncodeInt32 = Shumway.StringUtilities.variableLengthEncodeInt32;
var fromEncoding = Shumway.StringUtilities.fromEncoding;
var variableLengthDecodeIdentifier = Shumway.StringUtilities.variableLengthDecodeInt32;
var toEncoding = Shumway.StringUtilities.toEncoding;