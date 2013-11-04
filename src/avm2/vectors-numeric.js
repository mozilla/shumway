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
 * TypedArray Vector Template
 *
 * If you make any changes to this code you'll need to run it through the closure compiler:
 * http://closure-compiler.appspot.com/home and then paste the result into the |typedArrayVectorTemplate|
 * variable below. We duplicate all the code for vectors because we want to keep things monomorphic as
 * much as possible.
 *
 * NOTE: Not all of the AS3 methods need to be implemented natively, some are self-hosted in AS3 code.
 * For better performance we should probably implement them all natively (in JS that is) unless our
 * compiler is good enough.
 */

function asCheckVectorSetNumericProperty(i, length, fixed) {
  if (i < 0 || i > length || (i === length && fixed) || !isNumeric(i)) {
    throwError("RangeError", Errors.OutOfRangeError, i, length);
  }
}

function asCheckVectorGetNumericProperty(i, length) {
  if (i < 0 || i >= length || !isNumeric(i)) {
    throwError("RangeError", Errors.OutOfRangeError, i, length);
  }
}

var TypedArrayVector = (function () {
  // <<-- COPY FROM HERE
  var EXTRA_CAPACITY = 4;
  var INITIAL_CAPACITY = 10;

  var DEFAULT_VALUE = 0;
  function vector(length, fixed) {
    length = length | 0;
    this._fixed = !!fixed;
    this._buffer = new Int32Array(Math.max(INITIAL_CAPACITY, length + EXTRA_CAPACITY));
    this._offset = 0;
    this._length = length;
  }

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

  vector.prototype.internalToString = function () {
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
  };

  vector.prototype.toString = function () {
    var str = "";
    for (var i = 0; i < this._length; i++) {
      str += this._buffer[this._offset + i];
      if (i < this._length - 1) {
        str += ",";
      }
    }
    return str;
  };

  // vector.prototype.toString = vector.prototype.internalToString;

  vector.prototype._view = function () {
    return this._buffer.subarray(this._offset, this._offset + this._length);
  };

  vector.prototype._ensureCapacity = function (length) {
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
    var newCapacity = (oldCapacity * 3) >> 1 + 1;
    if (newCapacity < minCapacity) {
      newCapacity = minCapacity;
    }
    var buffer = new Int32Array(newCapacity);
    buffer.set(this._buffer, 0);
    this._buffer = buffer;
  };

  vector.prototype.concat = function () {
    notImplemented("TypedArrayVector.concat");
  };

  /**
   * Executes a |callback| function with three arguments: element, index, the vector itself as well
   * as passing the |thisObject| as |this| for each of the elements in the vector. If any of the
   * callbacks return |false| the function terminates, otherwise it returns |true|.
   */
  vector.prototype.every = function (callback, thisObject) {
    for (var i = 0; i < this._length; i++) {
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
    for (var i = 0; i < this._length; i++) {
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
    for (var i = 0; i < this._length; i++) {
      if (callback.call(thisObject, this.asGetNumericProperty(i), i, this)) {
        return true;
      }
    }
    return false;
  };

  vector.prototype.forEach = function (callback, thisObject) {
    for (var i = 0; i < this._length; i++) {
      callback.call(thisObject, this.asGetNumericProperty(i), i, this);
    }
  };

  vector.prototype.join = function (sep) {
    notImplemented("TypedArrayVector.join");
  };

  vector.prototype.indexOf = function (searchElement, fromIndex) {
    notImplemented("TypedArrayVector.indexOf");
  };

  vector.prototype.lastIndexOf = function (searchElement, fromIndex) {
    notImplemented("TypedArrayVector.lastIndexOf");
  };

  vector.prototype.map = function (callback, thisObject) {
    if (!isFunction(callback)) {
      throwError("ArgumentError", Errors.CheckTypeFailedError);
    }
    var v = new vector();
    for (var i = 0; i < this._length; i++) {
      v.push(callback.call(thisObject, this.asGetNumericProperty(i), i, this));
    }
    return v;
  };

  vector.prototype.push = function () {
    this._checkFixed();
    this._ensureCapacity(this._length + arguments.length);
    for (var i = 0; i < arguments.length; i++) {
      this._buffer[this._offset + this._length++] = arguments[i];
    }
  };

  vector.prototype.pop = function () {
    this._checkFixed();
    if (this._length === 0) {
      return DEFAULT_VALUE;
    }
    this._length--;
    return this._buffer[this._offset + this._length];
  };

  vector.prototype.reverse = function () {
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
    assertNotImplemented (!(options & vector.CASEINSENSITIVE), "CASEINSENSITIVE");
    assertNotImplemented (!(options & vector.UNIQUESORT), "UNIQUESORT");
    assertNotImplemented (!(options & vector.RETURNINDEXEDARRAY), "RETURNINDEXEDARRAY");
    var result = 0;
    if (!compareFunction) {
      compareFunction = defaultCompareFunction;
    }
    if (options & vector.NUMERIC) {
      a = toNumber(a);
      b = toNumber(b);
      result = a < b ? -1 : (a > b ? 1 : 0);
    } else {
      result = compareFunction(a, b);
    }
    if (options & vector.DESCENDING) {
      result *= -1;
    }
    return result;
  }

  function _sort(a) {
    var stack = [];
    var sp = -1;
    var l = 0;
    var r = a.length - 1;
    var i, j, swap, temp;
    while (true) {
      if (r - l <= 100) {
        for (j = l + 1; j <= r; j++) {
          swap = a[j];
          i = j - 1;
          while (i >= l && a[i] > swap) {
            a[i + 1] = a[i--];
          }
          a[i + 1] = swap;
        }
        if (sp == -1) {
          break;
        }
        r = stack[sp--];
        l = stack[sp--];
      } else {
        var median = l + r >> 1;
        i = l + 1;
        j = r;
        swap = a[median];
        a[median] = a[i];
        a[i] = swap;
        if (a[l] > a[r]) {
          swap = a[l];
          a[l] = a[r];
          a[r] = swap;
        }
        if (a[i] > a[r]) {
          swap = a[i];
          a[i] = a[r];
          a[r] = swap;
        }
        if (a[l] > a[i]) {
          swap = a[l];
          a[l] = a[i];
          a[i] = swap;
        }
        temp = a[i];
        while (true) {
          do {
            i++;
          } while (a[i] < temp);
          do {
            j--;
          } while (a[j] > temp);
          if (j < i) {
            break;
          }
          swap = a[i];
          a[i] = a[j];
          a[j] = swap;
        }
        a[l + 1] = a[j];
        a[j] = temp;
        if (r - i + 1 >= j - l) {
          stack[++sp] = i;
          stack[++sp] = r;
          r = j - 1;
        } else {
          stack[++sp] = l;
          stack[++sp] = j - 1;
          l = i;
        }
      }
    }
    return a;
  }

  vector.prototype._sortNumeric = function (descending) {
    _sort(this._view());
    if (descending) {
      this.reverse();
    }
  };

  vector.prototype.sort = function () {
    if (arguments.length === 0) {
      return Array.prototype.sort.call(this._view());
    }
    var compareFunction, options = 0;
    if (arguments[0] instanceof Function) {
      compareFunction = arguments[0];
    } else if (isNumber(arguments[0])) {
      options = arguments[0];
    }
    if (isNumber(arguments[1])) {
      options = arguments[1];
    }
    if (options & TypedArrayVector.NUMERIC) {
      return this._sortNumeric(options & vector.DESCENDING);
    }
    Array.prototype.sort.call(this._view(), function (a, b) {
      return compare(a, b, options, compareFunction);
    });
  };

  vector.prototype.asGetNumericProperty = function (i) {
    checkArguments && asCheckVectorGetNumericProperty(i, this._length);
    return this._buffer[this._offset + i];
  };

  vector.prototype.asSetNumericProperty = function (i, v) {
    checkArguments && asCheckVectorSetNumericProperty(i, this._length, this._fixed);
    if (i === this._length) {
      this._ensureCapacity(this._length + 1);
      this._length ++;
    }
    this._buffer[this._offset + i] = v;
  };

  vector.prototype.shift = function () {
    this._checkFixed();
    if (this._length === 0) {
      return 0;
    }
    this._length--;
    return this._buffer[this._offset++];
  };

  vector.prototype._checkFixed = function() {
    if (this._fixed) {
      throwError("RangeError", Errors.VectorFixedError);
    }
  };

  vector.prototype._slide = function (distance) {
    this._buffer.set(this._view(), this._offset + distance);
    this._offset += distance;
  };

  vector.prototype.unshift = function () {
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
  };

  vector.prototype.asGetEnumerableKeys = function () {
    if (vector.prototype === this) {
      return Object.prototype.asGetEnumerableKeys.call(this);
    }
    var keys = [];
    for (var i = 0; i < this._length; i++) {
      keys.push(i);
    }
    return keys;
  };

  vector.prototype.asHasProperty = function (namespaces, name, flags) {
    if (vector.prototype === this || !isNumeric(name)) {
      return Object.prototype.asHasProperty.call(this, namespaces, name, flags);
    }
    var index = toNumber(name);
    return index >= 0 && index < this._length;
  };

  Object.defineProperty(vector.prototype, "length", {
    get: function () {
      return this._length;
    },
    set: function (length) {
      length = length >>> 0;
      if (length > this._length) {
        this._ensureCapacity(length);
        for (var i = this._offset + this._length, j = this._offset + length; i < j; i++) {
          this._buffer[i] = DEFAULT_VALUE;
        }
      }
      this._length = length;
    }
  });

  /**
   * Delete |deleteCount| elements starting at |index| then insert |insertCount| elements
   * from |args| object starting at |offset|.
   */
  vector.prototype._spliceHelper = function (index, insertCount, deleteCount, args, offset) {
    insertCount = clamp(insertCount, 0, args.length - offset);
    deleteCount = clamp(deleteCount, 0, this._length - index);
    this._ensureCapacity(this._length - deleteCount + insertCount);
    var right = this._offset + index + deleteCount;
    var slice = this._buffer.subarray(right, right + this._length - index - deleteCount);
    this._buffer.set(slice, this._offset + index + insertCount);
    this._length += insertCount - deleteCount;
    for (var i = 0; i < insertCount; i++) {
      this._buffer[this._offset + index + i] = args.asGetNumericProperty(offset + i);
    }
  };

  vector.prototype.asGetEnumerableKeys = function () {
    if (vector.prototype === this) {
      return Object.prototype.asGetEnumerableKeys.call(this);
    }
    var keys = [];
    for (var i = 0; i < this._length; i++) {
      keys.push(i);
    }
    return keys;
  };

  // <<-- COPY UNTIL HERE
  return vector;
})();

var typedArrayVectorTemplate = 'var EXTRA_CAPACITY=4,INITIAL_CAPACITY=10,DEFAULT_VALUE=0;function vector(a,b){a|=0;this._fixed=!!b;this._buffer=new Int32Array(Math.max(INITIAL_CAPACITY,a+EXTRA_CAPACITY));this._offset=0;this._length=a}vector.callable=function(a){if(a instanceof vector)return a;var b=a.asGetProperty(void 0,"length");if(void 0!==b){for(var c=new vector(b,!1),d=0;d<b;d++)c.asSetNumericProperty(d,a.asGetPublicProperty(d));return c}unexpected()}; vector.prototype.internalToString=function(){for(var a="",b=this._offset,c=b+this._length,d=0;d<this._buffer.length;d++)d===b&&(a+="["),d===c&&(a+="]"),a+=this._buffer[d],d<this._buffer.length-1&&(a+=",");this._offset+this._length===this._buffer.length&&(a+="]");return a+": offset: "+this._offset+", length: "+this._length+", capacity: "+this._buffer.length};vector.prototype.toString=function(){for(var a="",b=0;b<this._length;b++)a+=this._buffer[this._offset+b],b<this._length-1&&(a+=",");return a}; vector.prototype._view=function(){return this._buffer.subarray(this._offset,this._offset+this._length)};vector.prototype._ensureCapacity=function(a){var b=this._offset+a;b<this._buffer.length||(a<=this._buffer.length?(b=this._buffer.length-a>>2,this._buffer.set(this._view(),b),this._offset=b):(a=3*this._buffer.length>>2,a<b&&(a=b),b=new Int32Array(a),b.set(this._buffer,0),this._buffer=b))}; vector.prototype.every=function(a,b){for(var c=0;c<this._length;c++)if(!a.call(b,this.asGetNumericProperty(c),c,this))return!1;return!0};vector.prototype.filter=function(a,b){for(var c=new vector,d=0;d<this._length;d++)a.call(b,this.asGetNumericProperty(d),d,this)&&c.push(this.asGetNumericProperty(d));return c}; vector.prototype.some=function(a,b){2!==arguments.length?throwError("ArgumentError",Errors.WrongArgumentCountError):isFunction(a)||throwError("ArgumentError",Errors.CheckTypeFailedError);for(var c=0;c<this._length;c++)if(a.call(b,this.asGetNumericProperty(c),c,this))return!0;return!1};vector.prototype.forEach=function(a,b){for(var c=0;c<this._length;c++)a.call(b,this.asGetNumericProperty(c),c,this)};vector.prototype.join=function(a){notImplemented("TypedArrayVector.join")}; vector.prototype.indexOf=function(a,b){notImplemented("TypedArrayVector.indexOf")};vector.prototype.lastIndexOf=function(a,b){notImplemented("TypedArrayVector.lastIndexOf")};vector.prototype.map=function(a,b){isFunction(a)||throwError("ArgumentError",Errors.CheckTypeFailedError);for(var c=new vector,d=0;d<this._length;d++)c.push(a.call(b,this.asGetNumericProperty(d),d,this));return c}; vector.prototype.push=function(){this._checkFixed();this._ensureCapacity(this._length+arguments.length);for(var a=0;a<arguments.length;a++)this._buffer[this._offset+this._length++]=arguments[a]};vector.prototype.pop=function(){this._checkFixed();if(0===this._length)return DEFAULT_VALUE;this._length--;return this._buffer[this._offset+this._length]};vector.prototype.reverse=function(){for(var a=this._offset,b=this._offset+this._length-1,c=this._buffer;a<b;){var d=c[a];c[a]=c[b];c[b]=d;a++;b--}}; vector.CASEINSENSITIVE=1;vector.DESCENDING=2;vector.UNIQUESORT=4;vector.RETURNINDEXEDARRAY=8;vector.NUMERIC=16;function defaultCompareFunction(a,b){return String(a).localeCompare(String(b))} function compare(a,b,c,d){assertNotImplemented(!(c&vector.CASEINSENSITIVE),"CASEINSENSITIVE");assertNotImplemented(!(c&vector.UNIQUESORT),"UNIQUESORT");assertNotImplemented(!(c&vector.RETURNINDEXEDARRAY),"RETURNINDEXEDARRAY");var f=0;d||(d=defaultCompareFunction);c&vector.NUMERIC?(a=toNumber(a),b=toNumber(b),f=a<b?-1:a>b?1:0):f=d(a,b);c&vector.DESCENDING&&(f*=-1);return f} function _sort(a){for(var b=[],c=-1,d=0,f=a.length-1,e,g,h,k;;)if(100>=f-d){for(g=d+1;g<=f;g++){h=a[g];for(e=g-1;e>=d&&a[e]>h;)a[e+1]=a[e--];a[e+1]=h}if(-1==c)break;f=b[c--];d=b[c--]}else{k=d+f>>1;e=d+1;g=f;h=a[k];a[k]=a[e];a[e]=h;a[d]>a[f]&&(h=a[d],a[d]=a[f],a[f]=h);a[e]>a[f]&&(h=a[e],a[e]=a[f],a[f]=h);a[d]>a[e]&&(h=a[d],a[d]=a[e],a[e]=h);for(k=a[e];;){do e++;while(a[e]<k);do g--;while(a[g]>k);if(g<e)break;h=a[e];a[e]=a[g];a[g]=h}a[d+1]=a[g];a[g]=k;f-e+1>=g-d?(b[++c]=e,b[++c]=f,f=g-1):(b[++c]=d, b[++c]=g-1,d=e)}return a}vector.prototype._sortNumeric=function(a){_sort(this._view());a&&this.reverse()};vector.prototype.sort=function(){if(0===arguments.length)return Array.prototype.sort.call(this._view());var a,b=0;arguments[0]instanceof Function?a=arguments[0]:isNumber(arguments[0])&&(b=arguments[0]);isNumber(arguments[1])&&(b=arguments[1]);if(b&TypedArrayVector.NUMERIC)return this._sortNumeric(b&vector.DESCENDING);Array.prototype.sort.call(this._view(),function(c,d){return compare(c,d,b,a)})}; vector.prototype.asGetNumericProperty=function(a){checkArguments&&asCheckVectorGetNumericProperty(a,this._length);return this._buffer[this._offset+a]};vector.prototype.asSetNumericProperty=function(a,b){checkArguments&&asCheckVectorSetNumericProperty(a,this._length,this._fixed);a===this._length&&(this._ensureCapacity(this._length+1),this._length++);this._buffer[this._offset+a]=b};vector.prototype.shift=function(){this._checkFixed();if(0===this._length)return 0;this._length--;return this._buffer[this._offset++]}; vector.prototype._checkFixed=function(){this._fixed&&throwError("RangeError",Errors.VectorFixedError)};vector.prototype._slide=function(a){this._buffer.set(this._view(),this._offset+a);this._offset+=a};vector.prototype.unshift=function(){this._checkFixed();if(arguments.length){this._ensureCapacity(this._length+arguments.length);this._slide(arguments.length);this._offset-=arguments.length;this._length+=arguments.length;for(var a=0;a<arguments.length;a++)this._buffer[this._offset+a]=arguments[a]}}; vector.prototype.asGetEnumerableKeys=function(){if(vector.prototype===this)return Object.prototype.asGetEnumerableKeys.call(this);for(var a=[],b=0;b<this._length;b++)a.push(b);return a};vector.prototype.asHasProperty=function(a,b,c){if(vector.prototype===this||!isNumeric(b))return Object.prototype.asHasProperty.call(this,a,b,c);a=toNumber(b);return 0<=a&&a<this._length}; Object.defineProperty(vector.prototype,"length",{get:function(){return this._length},set:function(a){a>>>=0;if(a>this._length){this._ensureCapacity(a);for(var b=this._offset+this._length,c=this._offset+a;b<c;b++)this._buffer[b]=DEFAULT_VALUE}this._length=a}}); vector.prototype._spliceHelper=function(a,b,c,d,f){debugger;b=clamp(b,0,d.length-f);c=clamp(c,0,this._length-a);this._ensureCapacity(this._length-c+b);var e=this._offset+a+c,e=this._buffer.subarray(e,e+this._length-a-c);this._buffer.set(e,this._offset+a+b);this._length+=b-c;for(c=0;c<b;c++)this._buffer[this._offset+a+c]=d.asGetNumericProperty(f+c)}; vector.prototype.asGetEnumerableKeys=function(){if(vector.prototype===this)return Object.prototype.asGetEnumerableKeys.call(this);for(var a=[],b=0;b<this._length;b++)a.push(b);return a};';

var Int32Vector  = new Function(typedArrayVectorTemplate.replace(/Int32Array/g, "Int32Array") + " return vector;")();
var Uint32Vector = new Function(typedArrayVectorTemplate.replace(/Int32Array/g, "Uint32Array") + " return vector;")();
var Float64Vector = new Function(typedArrayVectorTemplate.replace(/Int32Array/g, "Float64Array") + " return vector;")();

Int32Vector = TypedArrayVector;

/*
 * Why all the ugly code duplication you may wonder? Well, it's to avoid polymorphic
 * access sites. This can make quite a big difference in micro-benchmarks.
 */

Int32Vector.prototype.asGetProperty = function (namespaces, name, flags) {
  if (typeof name === "number") {
    return this.asGetNumericProperty(name);
  }
  return asGetProperty.call(this, namespaces, name, flags);
};

Int32Vector.prototype.asSetProperty = function (namespaces, name, flags, value) {
  if (typeof name === "number") {
    this.asSetNumericProperty(name, value);
    return;
  }
  return asSetProperty.call(this, namespaces, name, flags, value);
};

Uint32Vector.prototype.asGetProperty = function (namespaces, name, flags) {
  if (typeof name === "number") {
    return this.asGetNumericProperty(name);
  }
  return asGetProperty.call(this, namespaces, name, flags);
};

Uint32Vector.prototype.asSetProperty = function (namespaces, name, flags, value) {
  if (typeof name === "number") {
    this.asSetNumericProperty(name, value);
    return;
  }
  return asSetProperty.call(this, namespaces, name, flags, value);
};

Float64Vector.prototype.asGetProperty = function (namespaces, name, flags) {
  if (typeof name === "number") {
    return this.asGetNumericProperty(name);
  }
  return asGetProperty.call(this, namespaces, name, flags);
};

Float64Vector.prototype.asSetProperty = function (namespaces, name, flags, value) {
  if (typeof name === "number") {
    this.asSetNumericProperty(name, value);
    return;
  }
  return asSetProperty.call(this, namespaces, name, flags, value);
};