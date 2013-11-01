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

/**
 * Format: args: [compareFunction], [sortOptions]
 */
function arraySort(o, args) {
  if (args.length === 0) {
    return o.sort();
  }
  var compareFunction, options = 0;
  if (args[0] instanceof Function) {
    compareFunction = args[0];
  } else if (isNumber(args[0])) {
    options = args[0];
  }
  if (isNumber(args[1])) {
    options = args[1];
  }
  o.sort(function (a, b) {
    return asCompare(a, b, options, compareFunction);
  });
  return o;
}

function ArrayClass(domain, scope, instanceConstructor, baseClass) {
  var c = new Class("Array", Array, ApplicationDomain.passthroughCallable(Array));
  c.extendBuiltin(baseClass);

  var CACHE_NUMERIC_COMPARATORS = true;
  var numericComparatorCache = createEmptyObject();

  c.native = {
    static: {
      _pop: function _pop(o) { // (o) -> any
        return o.pop();
      },
      _reverse: function _reverse(o) { // (o) -> any
        return o.reverse();
      },
      _concat: function _concat(o, args) { // (o, args:Array) -> Array
        return o.concat.apply(o, args);
      },
      _shift: function _shift(o) { // (o) -> any
        return o.shift();
      },
      _slice: function _slice(o, A, B) { // (o, A:Number, B:Number) -> Array
        return o.slice(A, B);
      },
      _unshift: function _unshift(o, args) { // (o, args:Array) -> uint
        return o.unshift.apply(o, args);
      },
      _splice: function _splice(o, args) { // (o, args:Array) -> Array
        return o.splice.apply(o, args);
      },
      _sort: function _sort(o, args) { // (o, args:Array) -> any
        if (args.length === 0) {
          return o.sort();
        }
        var compareFunction, options = 0;
        if (args[0] instanceof Function) {
          compareFunction = args[0];
        } else if (isNumber(args[0])) {
          options = args[0];
        }
        if (isNumber(args[1])) {
          options = args[1];
        }
        o.sort(function (a, b) {
          return asCompare(a, b, options, compareFunction);
        });
        return o;
      },
      _sortOn: function _sortOn(o, names, options) { // (o, names, options) -> any
        if (isString(names)) {
          names = [names];
        }
        if (isNumber(options)) {
          options = [options];
        }
        for (var i = names.length - 1; i >= 0; i--) {
          var key = Multiname.getPublicQualifiedName(names[i]);
          if (CACHE_NUMERIC_COMPARATORS && options[i] & SORT_NUMERIC) {
            var str = "var x = toNumber(a." + key + "), y = toNumber(b." + key + ");";
            if (options[i] & SORT_DESCENDING) {
              str += "return x < y ? 1 : (x > y ? -1 : 0);";
            } else {
              str += "return x < y ? -1 : (x > y ? 1 : 0);";
            }
            var numericComparator = numericComparatorCache[str];
            if (!numericComparator) {
              numericComparator = numericComparatorCache[str] = new Function("a", "b", str);
            }
            o.sort(numericComparator);
          } else {
            o.sort(function (a, b) {
              return asCompare(a[key], b[key], options[i] | 0);
            });
          }
        }
        return o;
      },
      _indexOf: function _indexOf(o, searchElement, fromIndex) { // (o, searchElement, fromIndex:int) -> int
        return o.indexOf(searchElement, fromIndex);
      },
      _lastIndexOf: function _lastIndexOf(o, searchElement, fromIndex) { // (o, searchElement, fromIndex:int = 0) -> int
        return o.lastIndexOf(searchElement, fromIndex);
      },
      _every: function _every(o, callback, thisObject) { // (o, callback:Function, thisObject) -> Boolean
        for (var i = 0; i < o.length; i++) {
          if (callback.call(thisObject, o[i], i, o) !== true) {
            return false;
          }
        }
        return false;
      },
      _filter: function _filter(o, callback, thisObject) { // (o, callback:Function, thisObject) -> Array
        var result = [];
        for (var i = 0; i < o.length; i++) {
          if (callback.call(thisObject, o[i], i, o) === true) {
            result.push(o[i]);
          }
        }
        return result;
      },
      _forEach: function _forEach(o, callback, thisObject) { // (o, callback:Function, thisObject) -> void
        return o.forEach(callback, thisObject);
      },
      _map: function _map(o, callback, thisObject) { // (o, callback:Function, thisObject) -> Array
        return o.map(callback, thisObject);
      },
      _some: function _some(o, callback, thisObject) { // (o, callback:Function, thisObject) -> Boolean
        return o.some(callback, thisObject);
      }
    },
    instance: {
      pop: Array.prototype.pop,
      push: Array.prototype.push,
      unshift: Array.prototype.unshift,
      length: {
        get: function length() { // (void) -> uint
          return this.length;
        },
        set: function length(newLength) { // (newLength:uint) -> any
          this.length = newLength;
        }
      }
    }
  };

  c.coerce = function (value) {
    return value; // TODO: Fix me.
  };

  c.isInstanceOf = function (value) {
    return true; // TODO: Fix me.
  };
  return c;
}