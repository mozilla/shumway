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

var GenericVector = (function () {
  function vector(length, fixed, type) {
    length = length | 0;
    this._fixed = !!fixed;
    this._buffer = new Array(length);
    this._type = type;
    this._defaultValue = type ? type.defaultValue : null;
    this._fill(0, length, this._defaultValue);
  }

  /**
   * Makes a vector constructor that is bound to a specified |type|.
   */
  vector.applyType = function applyType(type) {
    function parameterizedVector(length, fixed) {
      vector.call(this, length, fixed, type);
    }
    parameterizedVector.prototype = Object.create(vector.prototype);
    parameterizedVector.callable = vector.callable;
    return parameterizedVector;
  };

  vector.callable = function (object) {
    if (object instanceof vector) {
      return object;
    }
    var length = object.asGetProperty(undefined, "length");
    if (length !== undefined) {
      var v = new vector(length, false);
      for (var i = 0; i < length; i++) {
        v.asSetNumericProperty(i, object.asGetPublicProperty(i));
      }
      return v;
    }
    unexpected();
  };

  vector.prototype._fill = function (index, length, value) {
    for (var i = 0; i < length; i++) {
      this._buffer[index + i] = value;
    }
  };

  /**
   * Can't use Array.prototype.toString because it doesn't print |null|s the same way as AS3.
   */
  vector.prototype.toString = function () {
    var str = "";
    for (var i = 0; i < this._buffer.length; i++) {
      str += this._buffer[i];
      if (i < this._buffer.length - 1) {
        str += ",";
      }
    }
    return str;
  };

  /**
   * Executes a |callback| function with three arguments: element, index, the vector itself as well
   * as passing the |thisObject| as |this| for each of the elements in the vector. If any of the
   * callbacks return |false| the function terminates, otherwise it returns |true|.
   */
  vector.prototype.every = function (callback, thisObject) {
    for (var i = 0; i < this._buffer.length; i++) {
      if (!callback.call(thisObject, this.asGetNumericProperty(i), i, this)) {
        return false;
      }
    }
    return true;
  };

  /**
   * Filters the elements for which the |callback| method returns |true|. The |callback| function
   * is called with three arguments: element, index, the vector itself as well as passing the |thisObject|
   * as |this| for each of the elements in the vector.
   */
  vector.prototype.filter = function (callback, thisObject) {
    var v = new vector();
    for (var i = 0; i < this._buffer.length; i++) {
      if (callback.call(thisObject, this.asGetNumericProperty(i), i, this)) {
        v.push(this.asGetNumericProperty(i));
      }
    }
    return v;
  };

  vector.prototype.some = function (callback, thisObject) {
    if (arguments.length !== 2) {
      throwError("ArgumentError", Errors.WrongArgumentCountError);
    } else if (!isFunction(callback)) {
      throwError("ArgumentError", Errors.CheckTypeFailedError);
    }
    for (var i = 0; i < this._buffer.length; i++) {
      if (callback.call(thisObject, this.asGetNumericProperty(i), i, this)) {
        return true;
      }
    }
    return false;
  };

  vector.prototype.forEach = function (callback, thisObject) {
    if (!isFunction(callback)) {
      throwError("ArgumentError", Errors.CheckTypeFailedError);
    }
    for (var i = 0; i < this._buffer.length; i++) {
      callback.call(thisObject, this.asGetNumericProperty(i), i, this);
    }
  };


  vector.prototype.map = function (callback, thisObject) {
    if (!isFunction(callback)) {
      throwError("ArgumentError", Errors.CheckTypeFailedError);
    }
    var v = new vector();
    for (var i = 0; i < this._buffer.length; i++) {
      v.push(callback.call(thisObject, this.asGetNumericProperty(i), i, this));
    }
    return v;
  };


  vector.prototype.push = function () {
    this._checkFixed();
    for (var i = 0; i < arguments.length; i++) {
      this._buffer.push(this._coerce(arguments[i]));
    }
  };

  vector.prototype.pop = function () {
    this._checkFixed();
    if (this._buffer.length === 0) {
      return undefined;
    }
    return this._buffer.pop();
  };

  vector.prototype.reverse = function () {
    this._buffer.reverse();
  };

  vector.CASEINSENSITIVE = 1;
  vector.DESCENDING = 2;
  vector.UNIQUESORT = 4;
  vector.RETURNINDEXEDARRAY = 8;
  vector.NUMERIC = 16;

  function defaultCompareFunction(a, b) {
    return String(a).localeCompare(String(b));
  }

  function compare(a, b, options, compareFunction) {
    assertNotImplemented (!(options & CASEINSENSITIVE), "CASEINSENSITIVE");
    assertNotImplemented (!(options & UNIQUESORT), "UNIQUESORT");
    assertNotImplemented (!(options & RETURNINDEXEDARRAY), "RETURNINDEXEDARRAY");
    var result = 0;
    if (!compareFunction) {
      compareFunction = defaultCompareFunction;
    }
    if (options & NUMERIC) {
      a = toNumber(a);
      b = toNumber(b);
      result = a < b ? -1 : (a > b ? 1 : 0);
    } else {
      result = compareFunction(a, b);
    }
    if (options & DESCENDING) {
      result *= -1;
    }
    return result;
  }

  vector.prototype.sort = function (comparator) {
    return this._buffer.sort(comparator);
  };

  vector.prototype.asGetNumericProperty = function (i) {
    checkArguments && asCheckVectorGetNumericProperty(i, this._buffer.length);
    return this._buffer[i];
  };

  vector.prototype._coerce = function (v) {
    if (this._type) {
      return this._type.coerce(v);
    } else if (v === undefined) {
      return null;
    }
    return v;
  };

  vector.prototype.asSetNumericProperty = function (i, v) {
    checkArguments && asCheckVectorSetNumericProperty(i, this._buffer.length, this._fixed);
    this._buffer[i] = this._coerce(v);
  };

  vector.prototype.shift = function () {
    this._checkFixed();
    if (this._buffer.length === 0) {
      return undefined;
    }
    return this._buffer.shift();
  };

  vector.prototype._checkFixed = function() {
    if (this._fixed) {
      throwError("RangeError", Errors.VectorFixedError);
    }
  };

  vector.prototype.unshift = function () {
    if (!arguments.length) {
      return;
    }
    this._checkFixed();
    var items = [];
    for (var i = 0; i < arguments.length; i++) {
      items.push(this._coerce(arguments[i]));
    }
    this._buffer.unshift.apply(this._buffer, items);
  };

  Object.defineProperty(vector.prototype, "length", {
    get: function () {
      return this._buffer.length;
    },
    set: function (length) {
      length = length >>> 0;
      if (length > this._buffer.length) {
        for (var i = this._buffer.length; i < length; i++) {
          this._buffer[i] = this._defaultValue;
        }
      } else {
        this._buffer.length = length;
      }
      release || assert (this._buffer.length === length);
    }
  });

  /**
   * Delete |deleteCount| elements starting at |index| then insert |insertCount| elements
   * from |args| object starting at |offset|.
   */
  vector.prototype._spliceHelper = function (index, insertCount, deleteCount, args, offset) {
    insertCount = clamp(insertCount, 0, args.length - offset);
    deleteCount = clamp(deleteCount, 0, this._buffer.length - index);
    var items = [];
    for (var i = 0; i < insertCount; i++) {
      items.push(this._coerce(args.asGetNumericProperty(offset + i)));
    }
    this._buffer.splice.apply(this._buffer, [index, deleteCount].concat(items));
  };

  vector.prototype.asGetEnumerableKeys = function () {
    if (vector.prototype === this) {
      return Object.prototype.asGetEnumerableKeys.call(this);
    }
    var keys = [];
    for (var i = 0; i < this._buffer.length; i++) {
      keys.push(i);
    }
    return keys;
  };

  vector.prototype.asHasProperty = function (namespaces, name, flags) {
    if (vector.prototype === this || !isNumeric(name)) {
      return Object.prototype.asHasProperty.call(this, namespaces, name, flags);
    }
    var index = toNumber(name);
    return index >= 0 && index < this._buffer.length;
  };

  return vector;
})();

GenericVector.prototype.asGetProperty = function (namespaces, name, flags) {
  if (typeof name === "number") {
    return this.asGetNumericProperty(name);
  }
  return asGetProperty.call(this, namespaces, name, flags);
};

GenericVector.prototype.asSetProperty = function (namespaces, name, flags, value) {
  if (typeof name === "number") {
    this.asSetNumericProperty(name, value);
    return;
  }
  return asSetProperty.call(this, namespaces, name, flags, value);
};
