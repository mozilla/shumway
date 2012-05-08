/* -*- mode: javascript; tab-width: 4; insert-tabs-mode: nil; indent-tabs-mode: nil -*- */

function AS2MovieClip() {
}
AS2MovieClip.prototype = Object.create(null, {
  _alpha: { // default: 100
    get: function get_alpha() { throw 'Not implemented'; },
    set: function set_alpha(value) { throw 'Not implemented'; }
  },
  attachAudio: {
    value: function attachAudio(id) { throw 'Not implemented'; },
    enumerable: false
  },
  attachBitmap: {
    value: function attachBitmap(bmp, depth, pixelSnapping, smoothing) { throw 'Not implemented'; },
    enumerable: false
  },
  attachMovie: {
    value: function attachMovie(id, name, depth, initObject) { throw 'Not implemented'; },
    enumerable: false
  },
  attachBitmap: {
    value: function attachBitmap(bmp, depth, pixelSnapping, smoothing) { throw 'Not implemented'; },
    enumerable: false
  },
});

// Built-in classes modifications

Object.defineProperty(Object.prototype, 'watch', {
  enumerable: false,
  get: function watch() { throw 'Not implemented'; }
});
Object.defineProperty(Object.prototype, 'unwatch', {
  enumerable: false,
  get: function unwatch() { throw 'Not implemented' }
});
Object.defineProperty(Object.prototype, 'addProperty', {
  enumerable: false,
  value: function addProperty() { throw 'Not implemented'; }
});
Object.defineProperty(Object.prototype, 'registerClass', {
  enumerable: false,
  value: function registerClass() { throw 'Not implemented'; }
});

Object.defineProperty(Array, 'CASEINSENSITIVE', {
  enumerable: true,
  writable: false,
  configurable: false,
  value: 1
});
Object.defineProperty(Array, 'DESCENDING', {
  enumerable: true,
  writable: false,
  configurable: false,
  value: 2
});
Object.defineProperty(Array, 'UNIQUESORT', {
  enumerable: true,
  writable: false,
  configurable: false,
  value: 4
});
Object.defineProperty(Array, 'RETURNINDEXEDARRAY', {
  enumerable: true,
  writable: false,
  configurable: false,
  value: 8
});
Object.defineProperty(Array, 'NUMERIC', {
  enumerable: true,
  writable: false,
  configurable: false,
  value: 16
});
Object.defineProperty(Array.prototype, 'sort', {
  enumerable: false,
  value: (function() {
    var originalSort = Array.prototype.sort;
    return (function sort(compareFunction, options) {
      if (arguments.length <= 1)
        return originalSort.apply(this, arguments);
      throw 'Not implemented';
    });
  })()
});
Object.defineProperty(Array.prototype, 'sortOn', {
  enumerable: false,
  value: function sortOn(fieldName, options) {
    var comparer = (function(x, y) {
      var valueX = String(x[fieldName]);
      var valueY = String(y[fieldName]);
      return valueX < valueY ? -1 : valueX == valueY ? 0 : 1;
    });
    return arguments.length <= 1 ? this.sort(comparer) :
      this.sort(comparer, options);
  }
});

function createBuiltinType(obj, args) {
  if (obj === Array) {
    // special case of array
    var result = args;
    if (args.length == 1 && typeof args[0] === 'number') {
      result = [];
      result.length = args[0];
    }
    return result;
  }
  if (obj === Boolean || obj === Number || obj === Date ||
      obj === String || obj === Function)
    return obj.apply(null, args);
  if (obj === Object)
    return {};
}
