/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

var create = Object.create;
var defineProperty = Object.defineProperty;
var keys = Object.keys;
var isArray = Array.isArray;
var fromCharCode = String.fromCharCode;
var log = Math.log;
var max = Math.max;
var min = Math.min;
var pow = Math.pow;
var push = [].push;
var slice = [].slice;
var splice = [].splice;

function fail(msg, context) {
  throw new Error((context ? context + ': ' : '') + msg);
}
function assert(cond, msg, context) {
  if (!cond)
    fail(msg, context);
}

function toStringRgba(color) {
  return 'rgba(' + [color.red, color.green, color.blue, color.alpha / 255].join(',') + ')';
}
function toString16(val) {
  return fromCharCode((val >> 8) & 0xff, val & 0xff);
}
function toString16Le(val) {
  return fromCharCode(val & 0xff, (val >> 8) & 0xff);
}
function toString32(val) {
  return toString16(val >> 16) + toString16(val);
}

var crcTable = [];
for (var i = 0; i < 256; i++) {
  var c = i;
  for (var h = 0; h < 8; h++) {
    if (c & 1)
      c = 0xedB88320 ^ ((c >> 1) & 0x7fffffff);
    else
      c = (c >> 1) & 0x7fffffff;
  }
  crcTable[i] = c;
}

function crc32(data){
  var crc = -1;
  for (var i = 0, n = data.length; i < n; ++i) {
    var a = (crc ^ data.charCodeAt(i)) & 0xff;
    var b = crcTable[a];
    crc = (crc >>> 8) ^ b;
  }
  return crc ^ -1;
}

function createPngChunk(type, data) {
  var body = type + data;
  return toString32(data.length) + body + toString32(crc32(body));
}

function adler32(data) {
  var a = 1;
  var b = 0;
  for (var i = 0, n = data.length; i < n; ++i) {
    a = (a + (data.charCodeAt(i) & 0xff)) % 65521;
    b = (b + a) % 65521;
  }
  return (b << 16) | a;
}

function Promise() {
  this.isResolved = false;
}
Promise.prototype = {
  resolve: function() {
    if (this.isResolved) throw 'resolved';
    this.isResolved = true;
    this.data = slice.call(arguments, 0);
    var callbacks = this.cachedCallbacks;
    if (callbacks) {
      for (var i = 0; i < callbacks.length; i++)
        callbacks[i].apply(null, this.data);
      delete this.cachedCallbacks;
    }
  },
  then: function(callback) {
    if (this.isResolved) {
      callback.apply(null, this.data);
      return;
    }
    if (!('cachedCallbacks' in this))
      this.cachedCallbacks = [];
    this.cachedCallbacks.push(callback);
  }
};
Promise.resolved = {
  isResolved: true,
  then: function(callback) {
    callback();
  }
};
Promise.all = function(promises, collectResults) {
  if (promises.length == 0)
    return Promise.resolved;
  var promisesToResolve = promises.length;
  var results = collectResults ? [] : null;
  var promise = new Promise();
  for (var i = 0; i < promises.length; i++) {
    promises[i].then((function(i) {
      return (function() {
        if (collectResults && arguments.length > 1)
          results[i] = slice.call(arguments, 0);
        promisesToResolve--;
        if (promisesToResolve == 0)
          promise.resolve(results);
      });
    })(i));
  }
  return promise;
};

function ObjDictionary() {
  this.promises = this;
}
ObjDictionary.prototype = {
  getPromise: function(objId) {
    if (!(objId in this.promises)) {
      var promise = new Promise();
      this.promises[objId] = promise;
    }
    return this.promises[objId];
  },
  isPromiseExists: function(objId) {
    return objId in this.promises;
  }
};

(function checkWeakMap() {
  if (typeof this.WeakMap === 'function')
    return; // weak map is supported

  var id = 0;
  function WeakMap() {
    this.id = '$weakmap' + (id++);
  };
  WeakMap.prototype = {
    has: function(obj) {
      return this.id in obj;
    },
    get: function(obj, defaultValue) {
      return this.id in obj ? obj[this.id] : defaultValue;
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
