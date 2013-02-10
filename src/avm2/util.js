var release = false;

var inBrowser = typeof console != "undefined";

if (!inBrowser) {
  console = {
    info: print,
    warn: function (x) {
      if (traceWarnings.value) {
        print(x);
      }
    }
  };
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
    console.info(backtrace());
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

function assertFalse(condition, message) {
  if (condition) {
    error(message);
  }
}

function assertNotImplemented(condition, message) {
  if (!condition) {
    error(message);
  }
}

function warning(message) {
  console.warn(message);
}

function notImplemented(message) {
  release || assert(false, "Not Implemented " + message);
}

function somewhatImplemented(message) {
  warning(message);
}

function unexpected(message) {
  release || assert(false, message);
}

function defineReadOnlyProperty(obj, name, value) {
  Object.defineProperty(obj, name, { value: value,
                                     writable: false,
                                     configurable: true,  // XXX: make it non-configurable?
                                     enumerable: false });
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

function isNullOrUndefined(value) {
  return value === null || value === undefined;
}

function isPowerOfTwo(x) {
  return x && ((x & (x - 1)) === 0);
}

function time(fn, count) {
  var start = new Date();
  for (var i = 0; i < count; i++) {
    fn();
  }
  var time = (new Date() - start) / count;
  console.info("Took: " + time + "ms.");
  return time;
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
 * Checks for numeric values of the form: 1, "0123", "1.4", "+13", "+0x5".
 */
function isNumeric(x) {
  return typeof x === "number" || !isNaN(parseInt(x, 10));
}

function isString(string) {
  return typeof string === "string";
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
    if (this.indexOf(v) < 0) {
      this.push(v);
    }
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

/**
 * Encoding and decoding a UTF-8 string. Taken from [1].
 *
 * [1] http://stackoverflow.com/questions/1240408/reading-bytes-from-a-javascript-string
 */
function utf8decode(str) {
  var bytes = new Int8Array(str.length * 4);
  var b = 0;
  for (var i = 0, j = str.length; i < j; i++) {
    if (str.charCodeAt(i) <= 0x7f) {
      bytes[b++] = str.charCodeAt(i);
    } else {
      var h = encodeURIComponent(str.charAt(i)).substr(1).split("%");
      for (var k = 0, l = h.length; k < l; k++) {
        bytes[b++] = parseInt(h[k], 16);
      }
    }
  }
  return bytes.subarray(0, b);
}

function utf8encode(bytes) {
  var str = "";
  var fcc = String.fromCharCode;
  for (var i = 0, j = bytes.length; i < j; i++)  {
    var b = bytes[i];
    str += b <= 0x7f ? b === 0x25 ? "%25" : fcc(b) : "%" + b.toString(16).toUpperCase();
  }
  return decodeURIComponent(str);
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

    toBitString: function toBitString() {
      var str = "";
      for (var i = 0; i < length; i++) {
        str += this.get(i) ? "1" : "0";
      }
      return str;
    },

    toString: function toString() {
      var set = [];
      for (var i = 0; i < length; i++) {
        if (this.get(i)) {
          set.push(i);
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
    toString: BitSet.prototype.toString
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

  indentingWriter.prototype.debugLn = function writeLn(str) {
    if (!this.suppressOutput) {
      this.out(this.padding + PURPLE + str + ENDC);
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
  }

  sortedList.prototype.push = function push(value) {
    release || assert(value !== undefined);
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

  sortedList.prototype.forEach = function forEach(visitor) {
    var curr = this.head;
    while (curr) {
      visitor(curr.value);
      curr = curr.next;
    }
  };

  sortedList.prototype.pop = function pop() {
    if (!this.head) {
      return undefined;
    }
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
    var str = "[ ";
    var curr = this.head;
    while (curr) {
      str += curr.value.toString() + " ";
      curr = curr.next;
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
