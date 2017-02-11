/**
 * @license
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// Manifest gfx
console.time('Load Shared Dependencies');
var Shumway;
(function (Shumway) {
    Shumway.version = '0.11.622';
    Shumway.build = '16451d8';
}(Shumway || (Shumway = {})));
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
var jsGlobal = function () {
    return this || (1, eval)('this//# sourceURL=jsGlobal-getter');
}();
// Our polyfills for some DOM things make testing this slightly more onerous than it ought to be.
var inBrowser = typeof window !== 'undefined' && 'document' in window && 'plugins' in window.document;
var inFirefox = typeof navigator !== 'undefined' && navigator.userAgent.indexOf('Firefox') >= 0;
// declare var print;
// declare var console;
// declare var performance;
// declare var XMLHttpRequest;
// declare var document;
// declare var getComputedStyle;
/** @define {boolean} */
var release = false;
/** @define {boolean} */
var profile = false;
function dumpLine(line) {
    if (!release && typeof dump !== 'undefined') {
        dump(line + '\n');
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
var START_TIME = performance.now();
var Shumway;
(function (Shumway) {
    /**
     * The buffer length required to contain any unsigned 32-bit integer.
     */
    /** @const */
    Shumway.UINT32_CHAR_BUFFER_LENGTH = 10;
    // "4294967295".length;
    /** @const */
    Shumway.UINT32_MAX = 4294967295;
    /** @const */
    Shumway.UINT32_MAX_DIV_10 = 429496729;
    // UINT32_MAX / 10;
    /** @const */
    Shumway.UINT32_MAX_MOD_10 = 5;
    // UINT32_MAX % 10
    function isString(value) {
        return typeof value === 'string';
    }
    Shumway.isString = isString;
    function isFunction(value) {
        return typeof value === 'function';
    }
    Shumway.isFunction = isFunction;
    function isNumber(value) {
        return typeof value === 'number';
    }
    Shumway.isNumber = isNumber;
    function isInteger(value) {
        return (value | 0) === value;
    }
    Shumway.isInteger = isInteger;
    function isArray(value) {
        return value instanceof Array;
    }
    Shumway.isArray = isArray;
    function isNumberOrString(value) {
        return typeof value === 'number' || typeof value === 'string';
    }
    Shumway.isNumberOrString = isNumberOrString;
    function isObject(value) {
        return typeof value === 'object' || typeof value === 'function';
    }
    Shumway.isObject = isObject;
    function toNumber(x) {
        return +x;
    }
    Shumway.toNumber = toNumber;
    function isNumericString(value) {
        // ECMAScript 5.1 - 9.8.1 Note 1, this expression is true for all
        // numbers x other than -0.
        return String(Number(value)) === value;
    }
    Shumway.isNumericString = isNumericString;
    /**
     * Whether the specified |value| is a number or the string representation of a number.
     */
    function isNumeric(value) {
        if (typeof value === 'number') {
            return true;
        }
        if (typeof value === 'string') {
            // |value| is rarely numeric (it's usually an identifier), and the
            // isIndex()/isNumericString() pair is slow and expensive, so we do a
            // quick check for obvious non-numericalness first. Just checking if the
            // first char is a 7-bit identifier char catches most cases.
            var c = value.charCodeAt(0);
            if (65 <= c && c <= 90 || 97 <= c && c <= 122 || c === 36 || c === 95) {
                return false;
            }
            return isIndex(value) || isNumericString(value);
        }
        return false;
    }
    Shumway.isNumeric = isNumeric;
    /**
     * Whether the specified |value| is an unsigned 32 bit number expressed as a number
     * or string.
     */
    function isIndex(value) {
        // js/src/vm/String.cpp JSFlatString::isIndexSlow
        // http://dxr.mozilla.org/mozilla-central/source/js/src/vm/String.cpp#474
        var index = 0;
        if (typeof value === 'number') {
            index = value | 0;
            if (value === index && index >= 0) {
                return true;
            }
            return value >>> 0 === value;
        }
        if (typeof value !== 'string') {
            return false;
        }
        var length = value.length;
        if (length === 0) {
            return false;
        }
        if (value === '0') {
            return true;
        }
        // Is there any way this will fit?
        if (length > Shumway.UINT32_CHAR_BUFFER_LENGTH) {
            return false;
        }
        var i = 0;
        index = value.charCodeAt(i++) - 48    /* _0 */;
        if (index < 1 || index > 9) {
            return false;
        }
        var oldIndex = 0;
        var c = 0;
        while (i < length) {
            c = value.charCodeAt(i++) - 48    /* _0 */;
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
        if (oldIndex < Shumway.UINT32_MAX_DIV_10 || oldIndex === Shumway.UINT32_MAX_DIV_10 && c <= Shumway.UINT32_MAX_MOD_10) {
            return true;
        }
        return false;
    }
    Shumway.isIndex = isIndex;
    function isNullOrUndefined(value) {
        return value == undefined;
    }
    Shumway.isNullOrUndefined = isNullOrUndefined;
    function argumentsToString(args) {
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
    Shumway.argumentsToString = argumentsToString;
    var Debug;
    (function (Debug) {
        function error(message) {
            console.error(message);
            throw new Error(message);
        }
        Debug.error = error;
        function assert(condition, message) {
            if (message === void 0) {
                message = 'assertion failed';
            }
            if (condition === '') {
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
        Debug.assert = assert;
        function assertUnreachable(msg) {
            var location = new Error().stack.split('\n')[1];
            throw new Error('Reached unreachable location ' + location + msg);
        }
        Debug.assertUnreachable = assertUnreachable;
        function assertNotImplemented(condition, message) {
            if (!condition) {
                Debug.error('notImplemented: ' + message);
            }
        }
        Debug.assertNotImplemented = assertNotImplemented;
        var _warnedCounts = Object.create(null);
        function warning(message, arg1, arg2) {
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
        Debug.warning = warning;
        function warnCounts() {
            var list = [];
            for (var key in _warnedCounts) {
                list.push({
                    key: key,
                    count: _warnedCounts[key]
                });
            }
            list.sort(function (entry, prev) {
                return prev.count - entry.count;
            });
            return list.reduce(function (result, entry) {
                return result += '\n' + entry.count + '\t' + entry.key;
            }, '');
        }
        Debug.warnCounts = warnCounts;
        function notImplemented(message) {
            release || Debug.assert(false, 'Not Implemented ' + message);
        }
        Debug.notImplemented = notImplemented;
        function dummyConstructor(message) {
            release || Debug.assert(false, 'Dummy Constructor: ' + message);
        }
        Debug.dummyConstructor = dummyConstructor;
        function abstractMethod(message) {
            release || Debug.assert(false, 'Abstract Method ' + message);
        }
        Debug.abstractMethod = abstractMethod;
        var somewhatImplementedCache = {};
        function somewhatImplemented(message) {
            if (somewhatImplementedCache[message]) {
                return;
            }
            somewhatImplementedCache[message] = true;
            Debug.warning('somewhatImplemented: ' + message);
        }
        Debug.somewhatImplemented = somewhatImplemented;
        function unexpected(message) {
            Debug.assert(false, 'Unexpected: ' + message);
        }
        Debug.unexpected = unexpected;
        function unexpectedCase(message) {
            Debug.assert(false, 'Unexpected Case: ' + message);
        }
        Debug.unexpectedCase = unexpectedCase;
    }(Debug = Shumway.Debug || (Shumway.Debug = {})));
    function getTicks() {
        return performance.now();
    }
    Shumway.getTicks = getTicks;
    var ArrayUtilities;
    (function (ArrayUtilities) {
        var assert = Shumway.Debug.assert;
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
        ArrayUtilities.popManyInto = popManyInto;
        function popMany(array, count) {
            release || assert(array.length >= count);
            var start = array.length - count;
            var result = array.slice(start, this.length);
            array.length = start;
            return result;
        }
        ArrayUtilities.popMany = popMany;
        /**
         * Just deletes several array elements from the end of the list.
         */
        function popManyIntoVoid(array, count) {
            release || assert(array.length >= count);
            array.length = array.length - count;
        }
        ArrayUtilities.popManyIntoVoid = popManyIntoVoid;
        function pushMany(dst, src) {
            for (var i = 0; i < src.length; i++) {
                dst.push(src[i]);
            }
        }
        ArrayUtilities.pushMany = pushMany;
        function top(array) {
            return array.length && array[array.length - 1];
        }
        ArrayUtilities.top = top;
        function last(array) {
            return array.length && array[array.length - 1];
        }
        ArrayUtilities.last = last;
        function peek(array) {
            release || assert(array.length > 0);
            return array[array.length - 1];
        }
        ArrayUtilities.peek = peek;
        function indexOf(array, value) {
            for (var i = 0, j = array.length; i < j; i++) {
                if (array[i] === value) {
                    return i;
                }
            }
            return -1;
        }
        ArrayUtilities.indexOf = indexOf;
        function equals(a, b) {
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
        ArrayUtilities.equals = equals;
        function pushUnique(array, value) {
            for (var i = 0, j = array.length; i < j; i++) {
                if (array[i] === value) {
                    return i;
                }
            }
            array.push(value);
            return array.length - 1;
        }
        ArrayUtilities.pushUnique = pushUnique;
        function unique(array) {
            var result = [];
            for (var i = 0; i < array.length; i++) {
                pushUnique(result, array[i]);
            }
            return result;
        }
        ArrayUtilities.unique = unique;
        function copyFrom(dst, src) {
            dst.length = 0;
            ArrayUtilities.pushMany(dst, src);
        }
        ArrayUtilities.copyFrom = copyFrom;
        /**
         * Makes sure that a typed array has the requested capacity. If required, it creates a new
         * instance of the array's class with a power-of-two capacity at least as large as required.
         */
        function ensureTypedArrayCapacity(array, capacity) {
            if (array.length < capacity) {
                var oldArray = array;
                array = new array.constructor(Shumway.IntegerUtilities.nearestPowerOfTwo(capacity));
                array.set(oldArray, 0);
            }
            return array;
        }
        ArrayUtilities.ensureTypedArrayCapacity = ensureTypedArrayCapacity;
        function memCopy(destination, source, doffset, soffset, length) {
            if (doffset === void 0) {
                doffset = 0;
            }
            if (soffset === void 0) {
                soffset = 0;
            }
            if (length === void 0) {
                length = 0;
            }
            if (soffset > 0 || length > 0 && length < source.length) {
                if (length <= 0) {
                    length = source.length - soffset;
                }
                destination.set(source.subarray(soffset, soffset + length), doffset);
            } else {
                destination.set(source, doffset);
            }
        }
        ArrayUtilities.memCopy = memCopy;
    }(ArrayUtilities = Shumway.ArrayUtilities || (Shumway.ArrayUtilities = {})));
    var ObjectUtilities;
    (function (ObjectUtilities) {
        function boxValue(value) {
            if (isNullOrUndefined(value) || isObject(value)) {
                return value;
            }
            return Object(value);
        }
        ObjectUtilities.boxValue = boxValue;
        function toKeyValueArray(object) {
            var hasOwnProperty = Object.prototype.hasOwnProperty;
            var array = [];
            for (var k in object) {
                if (hasOwnProperty.call(object, k)) {
                    array.push([
                        k,
                        object[k]
                    ]);
                }
            }
            return array;
        }
        ObjectUtilities.toKeyValueArray = toKeyValueArray;
        function isPrototypeWriteable(object) {
            return Object.getOwnPropertyDescriptor(object, 'prototype').writable;
        }
        ObjectUtilities.isPrototypeWriteable = isPrototypeWriteable;
        function hasOwnProperty(object, name) {
            return Object.prototype.hasOwnProperty.call(object, name);
        }
        ObjectUtilities.hasOwnProperty = hasOwnProperty;
        function propertyIsEnumerable(object, name) {
            return Object.prototype.propertyIsEnumerable.call(object, name);
        }
        ObjectUtilities.propertyIsEnumerable = propertyIsEnumerable;
        /**
         * Returns a property descriptor for the own or inherited property with the given name, or
         * null if one doesn't exist.
         */
        function getPropertyDescriptor(object, name) {
            do {
                var propDesc = Object.getOwnPropertyDescriptor(object, name);
                if (propDesc) {
                    return propDesc;
                }
                object = Object.getPrototypeOf(object);
            } while (object);
            return null;
        }
        ObjectUtilities.getPropertyDescriptor = getPropertyDescriptor;
        function hasOwnGetter(object, name) {
            var d = Object.getOwnPropertyDescriptor(object, name);
            return !!(d && d.get);
        }
        ObjectUtilities.hasOwnGetter = hasOwnGetter;
        function getOwnGetter(object, name) {
            var d = Object.getOwnPropertyDescriptor(object, name);
            return d ? d.get : null;
        }
        ObjectUtilities.getOwnGetter = getOwnGetter;
        function hasOwnSetter(object, name) {
            var d = Object.getOwnPropertyDescriptor(object, name);
            return !!(d && !!d.set);
        }
        ObjectUtilities.hasOwnSetter = hasOwnSetter;
        function createMap() {
            return Object.create(null);
        }
        ObjectUtilities.createMap = createMap;
        function createArrayMap() {
            return [];
        }
        ObjectUtilities.createArrayMap = createArrayMap;
        function defineReadOnlyProperty(object, name, value) {
            Object.defineProperty(object, name, {
                value: value,
                writable: false,
                configurable: true,
                enumerable: false
            });
        }
        ObjectUtilities.defineReadOnlyProperty = defineReadOnlyProperty;
        function copyProperties(object, template) {
            for (var property in template) {
                object[property] = template[property];
            }
        }
        ObjectUtilities.copyProperties = copyProperties;
        function copyOwnProperties(object, template) {
            for (var property in template) {
                if (hasOwnProperty(template, property)) {
                    object[property] = template[property];
                }
            }
        }
        ObjectUtilities.copyOwnProperties = copyOwnProperties;
        function copyOwnPropertyDescriptors(object, template, filter, overwrite, makeWritable) {
            if (filter === void 0) {
                filter = null;
            }
            if (overwrite === void 0) {
                overwrite = true;
            }
            if (makeWritable === void 0) {
                makeWritable = false;
            }
            for (var property in template) {
                if (hasOwnProperty(template, property) && (!filter || filter(property))) {
                    var descriptor = Object.getOwnPropertyDescriptor(template, property);
                    if (!overwrite && hasOwnProperty(object, property)) {
                        continue;
                    }
                    release || Debug.assert(descriptor);
                    try {
                        if (makeWritable && descriptor.writable === false) {
                            descriptor.writable = true;
                        }
                        Object.defineProperty(object, property, descriptor);
                    } catch (e) {
                        Debug.assert('Can\'t define: ' + property);
                    }
                }
            }
        }
        ObjectUtilities.copyOwnPropertyDescriptors = copyOwnPropertyDescriptors;
        function copyPropertiesByList(object, template, propertyList) {
            for (var i = 0; i < propertyList.length; i++) {
                var property = propertyList[i];
                object[property] = template[property];
            }
        }
        ObjectUtilities.copyPropertiesByList = copyPropertiesByList;
        function defineNonEnumerableGetter(obj, name, getter) {
            Object.defineProperty(obj, name, {
                get: getter,
                configurable: true,
                enumerable: false
            });
        }
        ObjectUtilities.defineNonEnumerableGetter = defineNonEnumerableGetter;
        function defineNonEnumerableProperty(obj, name, value) {
            Object.defineProperty(obj, name, {
                value: value,
                writable: true,
                configurable: true,
                enumerable: false
            });
        }
        ObjectUtilities.defineNonEnumerableProperty = defineNonEnumerableProperty;
    }(ObjectUtilities = Shumway.ObjectUtilities || (Shumway.ObjectUtilities = {})));
    var FunctionUtilities;
    (function (FunctionUtilities) {
        function makeForwardingGetter(target) {
            return new Function('return this["' + target + '"]//# sourceURL=fwd-get-' + target + '.as');
        }
        FunctionUtilities.makeForwardingGetter = makeForwardingGetter;
        function makeForwardingSetter(target) {
            return new Function('value', 'this["' + target + '"] = value;' + '//# sourceURL=fwd-set-' + target + '.as');
        }
        FunctionUtilities.makeForwardingSetter = makeForwardingSetter;
    }(FunctionUtilities = Shumway.FunctionUtilities || (Shumway.FunctionUtilities = {})));
    var StringUtilities;
    (function (StringUtilities) {
        var assert = Shumway.Debug.assert;
        function repeatString(c, n) {
            var s = '';
            for (var i = 0; i < n; i++) {
                s += c;
            }
            return s;
        }
        StringUtilities.repeatString = repeatString;
        function memorySizeToString(value) {
            value |= 0;
            var K = 1024;
            var M = K * K;
            if (value < K) {
                return value + ' B';
            } else if (value < M) {
                return (value / K).toFixed(2) + 'KB';
            } else {
                return (value / M).toFixed(2) + 'MB';
            }
        }
        StringUtilities.memorySizeToString = memorySizeToString;
        /**
         * Returns a reasonably sized description of the |value|, to be used for debugging purposes.
         */
        function toSafeString(value) {
            if (typeof value === 'string') {
                return '"' + value + '"';
            }
            if (typeof value === 'number' || typeof value === 'boolean') {
                return String(value);
            }
            if (value instanceof Array) {
                return '[] ' + value.length;
            }
            return typeof value;
        }
        StringUtilities.toSafeString = toSafeString;
        function toSafeArrayString(array) {
            var str = [];
            for (var i = 0; i < array.length; i++) {
                str.push(toSafeString(array[i]));
            }
            return str.join(', ');
        }
        StringUtilities.toSafeArrayString = toSafeArrayString;
        function utf8decode(str) {
            var bytes = new Uint8Array(str.length * 4);
            var b = 0;
            for (var i = 0, j = str.length; i < j; i++) {
                var code = str.charCodeAt(i);
                if (code <= 127) {
                    bytes[b++] = code;
                    continue;
                }
                if (55296 <= code && code <= 56319) {
                    var codeLow = str.charCodeAt(i + 1);
                    if (56320 <= codeLow && codeLow <= 57343) {
                        // convert only when both high and low surrogates are present
                        code = ((code & 1023) << 10) + (codeLow & 1023) + 65536;
                        ++i;
                    }
                }
                if ((code & 4292870144) !== 0) {
                    bytes[b++] = 248 | code >>> 24 & 3;
                    bytes[b++] = 128 | code >>> 18 & 63;
                    bytes[b++] = 128 | code >>> 12 & 63;
                    bytes[b++] = 128 | code >>> 6 & 63;
                    bytes[b++] = 128 | code & 63;
                } else if ((code & 4294901760) !== 0) {
                    bytes[b++] = 240 | code >>> 18 & 7;
                    bytes[b++] = 128 | code >>> 12 & 63;
                    bytes[b++] = 128 | code >>> 6 & 63;
                    bytes[b++] = 128 | code & 63;
                } else if ((code & 4294965248) !== 0) {
                    bytes[b++] = 224 | code >>> 12 & 15;
                    bytes[b++] = 128 | code >>> 6 & 63;
                    bytes[b++] = 128 | code & 63;
                } else {
                    bytes[b++] = 192 | code >>> 6 & 31;
                    bytes[b++] = 128 | code & 63;
                }
            }
            return bytes.subarray(0, b);
        }
        StringUtilities.utf8decode = utf8decode;
        function utf8encode(bytes) {
            var j = 0, str = '';
            while (j < bytes.length) {
                var b1 = bytes[j++] & 255;
                if (b1 <= 127) {
                    str += String.fromCharCode(b1);
                } else {
                    var currentPrefix = 192;
                    var validBits = 5;
                    do {
                        var mask = currentPrefix >> 1 | 128;
                        if ((b1 & mask) === currentPrefix)
                            break;
                        currentPrefix = currentPrefix >> 1 | 128;
                        --validBits;
                    } while (validBits >= 0);
                    if (validBits <= 0) {
                        // Invalid UTF8 character -- copying as is
                        str += String.fromCharCode(b1);
                        continue;
                    }
                    var code = b1 & (1 << validBits) - 1;
                    var invalid = false;
                    for (var i = 5; i >= validBits; --i) {
                        var bi = bytes[j++];
                        if ((bi & 192) != 128) {
                            // Invalid UTF8 character sequence
                            invalid = true;
                            break;
                        }
                        code = code << 6 | bi & 63;
                    }
                    if (invalid) {
                        // Copying invalid sequence as is
                        for (var k = j - (7 - i); k < j; ++k) {
                            str += String.fromCharCode(bytes[k] & 255);
                        }
                        continue;
                    }
                    if (code >= 65536) {
                        str += String.fromCharCode(code - 65536 >> 10 & 1023 | 55296, code & 1023 | 56320);
                    } else {
                        str += String.fromCharCode(code);
                    }
                }
            }
            return str;
        }
        StringUtilities.utf8encode = utf8encode;
        // https://gist.github.com/958841
        function base64EncodeBytes(bytes) {
            var base64 = '';
            var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
            var byteLength = bytes.byteLength;
            var byteRemainder = byteLength % 3;
            var mainLength = byteLength - byteRemainder;
            var a, b, c, d;
            var chunk;
            // Main loop deals with bytes in chunks of 3
            for (var i = 0; i < mainLength; i = i + 3) {
                // Combine the three bytes into a single integer
                chunk = bytes[i] << 16 | bytes[i + 1] << 8 | bytes[i + 2];
                // Use bitmasks to extract 6-bit segments from the triplet
                a = (chunk & 16515072) >> 18;
                // 16515072 = (2^6 - 1) << 18
                b = (chunk & 258048) >> 12;
                // 258048 = (2^6 - 1) << 12
                c = (chunk & 4032) >> 6;
                // 4032 = (2^6 - 1) << 6
                d = chunk & 63;
                // 63 = 2^6 - 1
                // Convert the raw binary segments to the appropriate ASCII encoding
                base64 += concat4(encodings[a], encodings[b], encodings[c], encodings[d]);
            }
            // Deal with the remaining bytes and padding
            if (byteRemainder == 1) {
                chunk = bytes[mainLength];
                a = (chunk & 252) >> 2;
                // 252 = (2^6 - 1) << 2
                // Set the 4 least significant bits to zero
                b = (chunk & 3) << 4;
                // 3 = 2^2 - 1
                base64 += concat3(encodings[a], encodings[b], '==');
            } else if (byteRemainder == 2) {
                chunk = bytes[mainLength] << 8 | bytes[mainLength + 1];
                a = (chunk & 64512) >> 10;
                // 64512 = (2^6 - 1) << 10
                b = (chunk & 1008) >> 4;
                // 1008 = (2^6 - 1) << 4
                // Set the 2 least significant bits to zero
                c = (chunk & 15) << 2;
                // 15 = 2^4 - 1
                base64 += concat4(encodings[a], encodings[b], encodings[c], '=');
            }
            return base64;
        }
        StringUtilities.base64EncodeBytes = base64EncodeBytes;
        var base64DecodeMap = [
            62,
            0,
            0,
            0,
            63,
            52,
            53,
            54,
            55,
            56,
            57,
            58,
            59,
            60,
            61,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9,
            10,
            11,
            12,
            13,
            14,
            15,
            16,
            17,
            18,
            19,
            20,
            21,
            22,
            23,
            24,
            25,
            0,
            0,
            0,
            0,
            0,
            0,
            26,
            27,
            28,
            29,
            30,
            31,
            32,
            33,
            34,
            35,
            36,
            37,
            38,
            39,
            40,
            41,
            42,
            43,
            44,
            45,
            46,
            47,
            48,
            49,
            50,
            51
        ];
        var base64DecodeMapOffset = 43;
        var base64EOF = 61;
        /**
         * Decodes the result of encoding with base64EncodeBytes, but not necessarily any other
         * base64-encoded data. Note that this also doesn't do any error checking.
         */
        function decodeRestrictedBase64ToBytes(encoded) {
            var ch;
            var code;
            var code2;
            var len = encoded.length;
            var padding = encoded.charAt(len - 2) === '=' ? 2 : encoded.charAt(len - 1) === '=' ? 1 : 0;
            release || assert(encoded.length % 4 === 0);
            var decoded = new Uint8Array((encoded.length >> 2) * 3 - padding);
            for (var i = 0, j = 0; i < encoded.length;) {
                ch = encoded.charCodeAt(i++);
                code = base64DecodeMap[ch - base64DecodeMapOffset];
                ch = encoded.charCodeAt(i++);
                code2 = base64DecodeMap[ch - base64DecodeMapOffset];
                decoded[j++] = code << 2 | (code2 & 48) >> 4;
                ch = encoded.charCodeAt(i++);
                if (ch == base64EOF) {
                    return decoded;
                }
                code = base64DecodeMap[ch - base64DecodeMapOffset];
                decoded[j++] = (code2 & 15) << 4 | (code & 60) >> 2;
                ch = encoded.charCodeAt(i++);
                if (ch == base64EOF) {
                    return decoded;
                }
                code2 = base64DecodeMap[ch - base64DecodeMapOffset];
                decoded[j++] = (code & 3) << 6 | code2;
            }
            return decoded;
        }
        StringUtilities.decodeRestrictedBase64ToBytes = decodeRestrictedBase64ToBytes;
        function escapeString(str) {
            if (str !== undefined) {
                str = str.replace(/[^\w$]/gi, '$');
                /* No dots, colons, dashes and /s */
                if (/^\d/.test(str)) {
                    str = '$' + str;
                }
            }
            return str;
        }
        StringUtilities.escapeString = escapeString;
        /**
         * Workaround for max stack size limit.
         */
        function fromCharCodeArray(buffer) {
            var str = '', SLICE = 1024 * 16;
            for (var i = 0; i < buffer.length; i += SLICE) {
                var chunk = Math.min(buffer.length - i, SLICE);
                str += String.fromCharCode.apply(null, buffer.subarray(i, i + chunk));
            }
            return str;
        }
        StringUtilities.fromCharCodeArray = fromCharCodeArray;
        var _encoding = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$_';
        function variableLengthEncodeInt32(n) {
            var e = _encoding;
            var bitCount = 32 - Math.clz32(n);
            release || assert(bitCount <= 32, bitCount);
            var l = Math.ceil(bitCount / 6);
            // Encode length followed by six bit chunks.
            var s = e[l];
            for (var i = l - 1; i >= 0; i--) {
                var offset = i * 6;
                s += e[n >> offset & 63];
            }
            release || assert(StringUtilities.variableLengthDecodeInt32(s) === n, n + ' : ' + s + ' - ' + l + ' bits: ' + bitCount);
            return s;
        }
        StringUtilities.variableLengthEncodeInt32 = variableLengthEncodeInt32;
        function toEncoding(n) {
            return _encoding[n];
        }
        StringUtilities.toEncoding = toEncoding;
        function fromEncoding(c) {
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
            release || assert(false, 'Invalid Encoding');
        }
        StringUtilities.fromEncoding = fromEncoding;
        function variableLengthDecodeInt32(s) {
            var l = StringUtilities.fromEncoding(s.charCodeAt(0));
            var n = 0;
            for (var i = 0; i < l; i++) {
                var offset = (l - i - 1) * 6;
                n |= StringUtilities.fromEncoding(s.charCodeAt(1 + i)) << offset;
            }
            return n;
        }
        StringUtilities.variableLengthDecodeInt32 = variableLengthDecodeInt32;
        function trimMiddle(s, maxLength) {
            if (s.length <= maxLength) {
                return s;
            }
            var leftHalf = maxLength >> 1;
            var rightHalf = maxLength - leftHalf - 1;
            return s.substr(0, leftHalf) + '\u2026' + s.substr(s.length - rightHalf, rightHalf);
        }
        StringUtilities.trimMiddle = trimMiddle;
        function multiple(s, count) {
            var o = '';
            for (var i = 0; i < count; i++) {
                o += s;
            }
            return o;
        }
        StringUtilities.multiple = multiple;
        function indexOfAny(s, chars, position) {
            var index = s.length;
            for (var i = 0; i < chars.length; i++) {
                var j = s.indexOf(chars[i], position);
                if (j >= 0) {
                    index = Math.min(index, j);
                }
            }
            return index === s.length ? -1 : index;
        }
        StringUtilities.indexOfAny = indexOfAny;
        var _concat3array = new Array(3);
        var _concat4array = new Array(4);
        var _concat9array = new Array(9);
        /**
         * The concatN() functions concatenate multiple strings in a way that
         * avoids creating intermediate strings, unlike String.prototype.concat().
         *
         * Note that these functions don't have identical behaviour to using '+',
         * because they will ignore any arguments that are |undefined| or |null|.
         * This usually doesn't matter.
         */
        function concat3(s0, s1, s2) {
            _concat3array[0] = s0;
            _concat3array[1] = s1;
            _concat3array[2] = s2;
            return _concat3array.join('');
        }
        StringUtilities.concat3 = concat3;
        function concat4(s0, s1, s2, s3) {
            _concat4array[0] = s0;
            _concat4array[1] = s1;
            _concat4array[2] = s2;
            _concat4array[3] = s3;
            return _concat4array.join('');
        }
        StringUtilities.concat4 = concat4;
        function concat9(s0, s1, s2, s3, s4, s5, s6, s7, s8) {
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
        StringUtilities.concat9 = concat9;
    }(StringUtilities = Shumway.StringUtilities || (Shumway.StringUtilities = {})));
    var HashUtilities;
    (function (HashUtilities) {
        var _md5R = new Uint8Array([
            7,
            12,
            17,
            22,
            7,
            12,
            17,
            22,
            7,
            12,
            17,
            22,
            7,
            12,
            17,
            22,
            5,
            9,
            14,
            20,
            5,
            9,
            14,
            20,
            5,
            9,
            14,
            20,
            5,
            9,
            14,
            20,
            4,
            11,
            16,
            23,
            4,
            11,
            16,
            23,
            4,
            11,
            16,
            23,
            4,
            11,
            16,
            23,
            6,
            10,
            15,
            21,
            6,
            10,
            15,
            21,
            6,
            10,
            15,
            21,
            6,
            10,
            15,
            21
        ]);
        var _md5K = new Int32Array([
            -680876936,
            -389564586,
            606105819,
            -1044525330,
            -176418897,
            1200080426,
            -1473231341,
            -45705983,
            1770035416,
            -1958414417,
            -42063,
            -1990404162,
            1804603682,
            -40341101,
            -1502002290,
            1236535329,
            -165796510,
            -1069501632,
            643717713,
            -373897302,
            -701558691,
            38016083,
            -660478335,
            -405537848,
            568446438,
            -1019803690,
            -187363961,
            1163531501,
            -1444681467,
            -51403784,
            1735328473,
            -1926607734,
            -378558,
            -2022574463,
            1839030562,
            -35309556,
            -1530992060,
            1272893353,
            -155497632,
            -1094730640,
            681279174,
            -358537222,
            -722521979,
            76029189,
            -640364487,
            -421815835,
            530742520,
            -995338651,
            -198630844,
            1126891415,
            -1416354905,
            -57434055,
            1700485571,
            -1894986606,
            -1051523,
            -2054922799,
            1873313359,
            -30611744,
            -1560198380,
            1309151649,
            -145523070,
            -1120210379,
            718787259,
            -343485551
        ]);
        function hashBytesTo32BitsMD5(data, offset, length) {
            var r = _md5R;
            var k = _md5K;
            var h0 = 1732584193, h1 = -271733879, h2 = -1732584194, h3 = 271733878;
            // pre-processing
            var paddedLength = length + 72 & ~63;
            // data + 9 extra bytes
            var padded = new Uint8Array(paddedLength);
            var i, j, n;
            for (i = 0; i < length; ++i) {
                padded[i] = data[offset++];
            }
            padded[i++] = 128;
            n = paddedLength - 8;
            while (i < n) {
                padded[i++] = 0;
            }
            padded[i++] = length << 3 & 255;
            padded[i++] = length >> 5 & 255;
            padded[i++] = length >> 13 & 255;
            padded[i++] = length >> 21 & 255;
            padded[i++] = length >>> 29 & 255;
            padded[i++] = 0;
            padded[i++] = 0;
            padded[i++] = 0;
            // chunking
            // TODO ArrayBuffer ?
            var w = new Int32Array(16);
            for (i = 0; i < paddedLength;) {
                for (j = 0; j < 16; ++j, i += 4) {
                    w[j] = padded[i] | padded[i + 1] << 8 | padded[i + 2] << 16 | padded[i + 3] << 24;
                }
                var a = h0, b = h1, c = h2, d = h3, f, g;
                for (j = 0; j < 64; ++j) {
                    if (j < 16) {
                        f = b & c | ~b & d;
                        g = j;
                    } else if (j < 32) {
                        f = d & b | ~d & c;
                        g = 5 * j + 1 & 15;
                    } else if (j < 48) {
                        f = b ^ c ^ d;
                        g = 3 * j + 5 & 15;
                    } else {
                        f = c ^ (b | ~d);
                        g = 7 * j & 15;
                    }
                    var tmp = d, rotateArg = a + f + k[j] + w[g] | 0, rotate = r[j];
                    d = c;
                    c = b;
                    b = b + (rotateArg << rotate | rotateArg >>> 32 - rotate) | 0;
                    a = tmp;
                }
                h0 = h0 + a | 0;
                h1 = h1 + b | 0;
                h2 = h2 + c | 0;
                h3 = h3 + d | 0;
            }
            return h0;
        }
        HashUtilities.hashBytesTo32BitsMD5 = hashBytesTo32BitsMD5;
        function mixHash(a, b) {
            return (31 * a | 0) + b | 0;
        }
        HashUtilities.mixHash = mixHash;
    }(HashUtilities = Shumway.HashUtilities || (Shumway.HashUtilities = {})));
    /**
     * An extremely naive cache with a maximum size.
     * TODO: LRU
     */
    var Cache = function () {
        function Cache(maxSize) {
            this._data = Object.create(null);
            this._size = 0;
            this._maxSize = maxSize;
        }
        Cache.prototype.get = function (key) {
            return this._data[key];
        };
        Cache.prototype.set = function (key, value) {
            release || Debug.assert(!(key in this._data));
            // Cannot mutate cache entries.
            if (this._size >= this._maxSize) {
                return false;
            }
            this._data[key] = value;
            this._size++;
            return true;
        };
        return Cache;
    }();
    Shumway.Cache = Cache;
    /**
     * Marsaglia's algorithm, adapted from V8. Use this if you want a deterministic random number.
     */
    var Random = function () {
        function Random() {
        }
        Random.seed = function (seed) {
            Random._state[0] = seed;
            Random._state[1] = seed;
        };
        Random.reset = function () {
            Random._state[0] = 57005;
            Random._state[1] = 48879;
        };
        Random.next = function () {
            var s = this._state;
            var r0 = Math.imul(18273, s[0] & 65535) + (s[0] >>> 16) | 0;
            s[0] = r0;
            var r1 = Math.imul(36969, s[1] & 65535) + (s[1] >>> 16) | 0;
            s[1] = r1;
            var x = (r0 << 16) + (r1 & 65535) | 0;
            // Division by 0x100000000 through multiplication by reciprocal.
            return (x < 0 ? x + 4294967296 : x) * 2.3283064365386963e-10;
        };
        Random._state = new Uint32Array([
            57005,
            48879
        ]);
        return Random;
    }();
    Shumway.Random = Random;
    Math.random = function random() {
        return Random.next();
    };
    /**
     * This should only be called if you need fake time.
     */
    function installTimeWarper() {
        var RealDate = Date;
        // Go back in time.
        var fakeTime = 1428107694580;
        // 3-Apr-2015
        // Overload
        jsGlobal.Date = function (yearOrTimevalue, month, date, hour, minute, second, millisecond) {
            switch (arguments.length) {
            case 0:
                return new RealDate(fakeTime);
            case 1:
                return new RealDate(yearOrTimevalue);
            case 2:
                return new RealDate(yearOrTimevalue, month);
            case 3:
                return new RealDate(yearOrTimevalue, month, date);
            case 4:
                return new RealDate(yearOrTimevalue, month, date, hour);
            case 5:
                return new RealDate(yearOrTimevalue, month, date, hour, minute);
            case 6:
                return new RealDate(yearOrTimevalue, month, date, hour, minute, second);
            default:
                return new RealDate(yearOrTimevalue, month, date, hour, minute, second, millisecond);
            }
        };
        // Make date now deterministic.
        jsGlobal.Date.now = function () {
            return fakeTime += 10;    // Advance time.
        };
        jsGlobal.Date.UTC = function () {
            return RealDate.UTC.apply(RealDate, arguments);
        };
    }
    Shumway.installTimeWarper = installTimeWarper;
    function polyfillWeakMap() {
        if (typeof jsGlobal.WeakMap === 'function') {
            return;    // weak map is supported
        }
        var id = 0;
        function WeakMap() {
            this.id = '$weakmap' + id++;
        }
        ;
        WeakMap.prototype = {
            has: function (obj) {
                return obj.hasOwnProperty(this.id);
            },
            get: function (obj, defaultValue) {
                return obj.hasOwnProperty(this.id) ? obj[this.id] : defaultValue;
            },
            set: function (obj, value) {
                Object.defineProperty(obj, this.id, {
                    value: value,
                    enumerable: false,
                    configurable: true
                });
            },
            delete: function (obj) {
                delete obj[this.id];
            }
        };
        jsGlobal.WeakMap = WeakMap;
    }
    polyfillWeakMap();
    var useReferenceCounting = true;
    var WeakList = function () {
        function WeakList() {
            if (typeof ShumwayCom !== 'undefined' && ShumwayCom.getWeakMapKeys) {
                this._map = new WeakMap();
                this._id = 0;
                this._newAdditions = [];
            } else {
                this._list = [];
            }
        }
        WeakList.prototype.clear = function () {
            if (this._map) {
                this._map.clear();
            } else {
                this._list.length = 0;
            }
        };
        WeakList.prototype.push = function (value) {
            if (this._map) {
                release || Debug.assert(!this._map.has(value));
                // We store an increasing id as the value so that keys can be sorted by it.
                this._map.set(value, this._id++);
                this._newAdditions.forEach(function (additions) {
                    additions.push(value);
                });
            } else {
                release || Debug.assert(this._list.indexOf(value) === -1);
                this._list.push(value);
            }
        };
        WeakList.prototype.remove = function (value) {
            if (this._map) {
                release || Debug.assert(this._map.has(value));
                this._map.delete(value);
            } else {
                release || Debug.assert(this._list.indexOf(value) > -1);
                this._list[this._list.indexOf(value)] = null;
                release || Debug.assert(this._list.indexOf(value) === -1);
            }
        };
        WeakList.prototype.forEach = function (callback) {
            if (this._map) {
                var newAdditionsToKeys = [];
                this._newAdditions.push(newAdditionsToKeys);
                var map = this._map;
                var keys = ShumwayCom.getWeakMapKeys(map);
                // The keys returned by ShumwayCom.getWeakMapKeys are not guaranteed to
                // be in insertion order. Therefore we have to sort them manually.
                keys.sort(function (a, b) {
                    return map.get(a) - map.get(b);
                });
                keys.forEach(function (value) {
                    if (value._referenceCount !== 0) {
                        callback(value);
                    }
                });
                // ShumwayCom.getWeakMapKeys take snapshot of the keys, but we are also
                // interested in new added keys while keys.forEach was run.
                newAdditionsToKeys.forEach(function (value) {
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
            if (zeroCount > 16 && zeroCount > list.length >> 2) {
                var newList = [];
                for (var i = 0; i < list.length; i++) {
                    var value = list[i];
                    if (value && value._referenceCount > 0) {
                        newList.push(value);
                    }
                }
                this._list = newList;
            }
        };
        Object.defineProperty(WeakList.prototype, 'length', {
            get: function () {
                if (this._map) {
                    // TODO: Implement this.
                    return -1;
                } else {
                    return this._list.length;
                }
            },
            enumerable: true,
            configurable: true
        });
        return WeakList;
    }();
    Shumway.WeakList = WeakList;
    var NumberUtilities;
    (function (NumberUtilities) {
        function pow2(exponent) {
            if (exponent === (exponent | 0)) {
                if (exponent < 0) {
                    return 1 / (1 << -exponent);
                }
                return 1 << exponent;
            }
            return Math.pow(2, exponent);
        }
        NumberUtilities.pow2 = pow2;
        function clamp(value, min, max) {
            return Math.max(min, Math.min(max, value));
        }
        NumberUtilities.clamp = clamp;
        /**
         * Rounds *.5 to the nearest even number.
         * See https://en.wikipedia.org/wiki/Rounding#Round_half_to_even for details.
         */
        function roundHalfEven(value) {
            if (Math.abs(value % 1) === 0.5) {
                var floor = Math.floor(value);
                return floor % 2 === 0 ? floor : Math.ceil(value);
            }
            return Math.round(value);
        }
        NumberUtilities.roundHalfEven = roundHalfEven;
        /**
         * Rounds *.5 up on even occurrences, down on odd occurrences.
         * See https://en.wikipedia.org/wiki/Rounding#Alternating_tie-breaking for details.
         */
        function altTieBreakRound(value, even) {
            if (Math.abs(value % 1) === 0.5 && !even) {
                return value | 0;
            }
            return Math.round(value);
        }
        NumberUtilities.altTieBreakRound = altTieBreakRound;
        function epsilonEquals(value, other) {
            return Math.abs(value - other) < 1e-7;
        }
        NumberUtilities.epsilonEquals = epsilonEquals;
    }(NumberUtilities = Shumway.NumberUtilities || (Shumway.NumberUtilities = {})));
    var IntegerUtilities;
    (function (IntegerUtilities) {
        var sharedBuffer = new ArrayBuffer(8);
        IntegerUtilities.i8 = new Int8Array(sharedBuffer);
        IntegerUtilities.u8 = new Uint8Array(sharedBuffer);
        IntegerUtilities.i32 = new Int32Array(sharedBuffer);
        IntegerUtilities.f32 = new Float32Array(sharedBuffer);
        IntegerUtilities.f64 = new Float64Array(sharedBuffer);
        IntegerUtilities.nativeLittleEndian = new Int8Array(new Int32Array([1]).buffer)[0] === 1;
        /**
         * Convert a float into 32 bits.
         */
        function floatToInt32(v) {
            IntegerUtilities.f32[0] = v;
            return IntegerUtilities.i32[0];
        }
        IntegerUtilities.floatToInt32 = floatToInt32;
        /**
         * Convert 32 bits into a float.
         */
        function int32ToFloat(i) {
            IntegerUtilities.i32[0] = i;
            return IntegerUtilities.f32[0];
        }
        IntegerUtilities.int32ToFloat = int32ToFloat;
        /**
         * Swap the bytes of a 16 bit number.
         */
        function swap16(i) {
            return (i & 255) << 8 | i >> 8 & 255;
        }
        IntegerUtilities.swap16 = swap16;
        /**
         * Swap the bytes of a 32 bit number.
         */
        function swap32(i) {
            return (i & 255) << 24 | (i & 65280) << 8 | i >> 8 & 65280 | i >> 24 & 255;
        }
        IntegerUtilities.swap32 = swap32;
        /**
         * Converts a number to s8.u8 fixed point representation.
         */
        function toS8U8(v) {
            return v * 256 << 16 >> 16;
        }
        IntegerUtilities.toS8U8 = toS8U8;
        /**
         * Converts a number from s8.u8 fixed point representation.
         */
        function fromS8U8(i) {
            return i / 256;
        }
        IntegerUtilities.fromS8U8 = fromS8U8;
        /**
         * Round trips a number through s8.u8 conversion.
         */
        function clampS8U8(v) {
            return fromS8U8(toS8U8(v));
        }
        IntegerUtilities.clampS8U8 = clampS8U8;
        /**
         * Converts a number to signed 16 bits.
         */
        function toS16(v) {
            return v << 16 >> 16;
        }
        IntegerUtilities.toS16 = toS16;
        function bitCount(i) {
            i = i - (i >> 1 & 1431655765);
            i = (i & 858993459) + (i >> 2 & 858993459);
            return (i + (i >> 4) & 252645135) * 16843009 >> 24;
        }
        IntegerUtilities.bitCount = bitCount;
        function ones(i) {
            i = i - (i >> 1 & 1431655765);
            i = (i & 858993459) + (i >> 2 & 858993459);
            return (i + (i >> 4) & 252645135) * 16843009 >> 24;
        }
        IntegerUtilities.ones = ones;
        function trailingZeros(i) {
            return IntegerUtilities.ones((i & -i) - 1);
        }
        IntegerUtilities.trailingZeros = trailingZeros;
        function getFlags(i, flags) {
            var str = '';
            for (var i = 0; i < flags.length; i++) {
                if (i & 1 << i) {
                    str += flags[i] + ' ';
                }
            }
            if (str.length === 0) {
                return '';
            }
            return str.trim();
        }
        IntegerUtilities.getFlags = getFlags;
        function isPowerOfTwo(x) {
            return x && (x & x - 1) === 0;
        }
        IntegerUtilities.isPowerOfTwo = isPowerOfTwo;
        function roundToMultipleOfFour(x) {
            return x + 3 & ~3;
        }
        IntegerUtilities.roundToMultipleOfFour = roundToMultipleOfFour;
        function nearestPowerOfTwo(x) {
            x--;
            x |= x >> 1;
            x |= x >> 2;
            x |= x >> 4;
            x |= x >> 8;
            x |= x >> 16;
            x++;
            return x;
        }
        IntegerUtilities.nearestPowerOfTwo = nearestPowerOfTwo;
        function roundToMultipleOfPowerOfTwo(i, powerOfTwo) {
            var x = (1 << powerOfTwo) - 1;
            return i + x & ~x;    // Round up to multiple of power of two.
        }
        IntegerUtilities.roundToMultipleOfPowerOfTwo = roundToMultipleOfPowerOfTwo;
        function toHEX(i) {
            var i = i < 0 ? 4294967295 + i + 1 : i;
            return '0x' + ('00000000' + i.toString(16)).substr(-8);
        }
        IntegerUtilities.toHEX = toHEX;
        /**
         * Polyfill imul.
         */
        if (!Math.imul) {
            Math.imul = function imul(a, b) {
                var ah = a >>> 16 & 65535;
                var al = a & 65535;
                var bh = b >>> 16 & 65535;
                var bl = b & 65535;
                // the shift by 0 fixes the sign on the high part
                // the final |0 converts the unsigned value into a signed value
                return al * bl + (ah * bl + al * bh << 16 >>> 0) | 0;
            };
        }
        /**
         * Polyfill clz32.
         */
        if (!Math.clz32) {
            Math.clz32 = function clz32(i) {
                i |= i >> 1;
                i |= i >> 2;
                i |= i >> 4;
                i |= i >> 8;
                i |= i >> 16;
                return 32 - IntegerUtilities.ones(i);
            };
        }
    }(IntegerUtilities = Shumway.IntegerUtilities || (Shumway.IntegerUtilities = {})));
    var IndentingWriter = function () {
        function IndentingWriter(suppressOutput, out) {
            if (suppressOutput === void 0) {
                suppressOutput = false;
            }
            this._tab = '  ';
            this._padding = '';
            this._suppressOutput = suppressOutput;
            this._out = out || IndentingWriter._consoleOut;
            this._outNoNewline = out || IndentingWriter._consoleOutNoNewline;
        }
        Object.defineProperty(IndentingWriter.prototype, 'suppressOutput', {
            get: function () {
                return this._suppressOutput;
            },
            set: function (val) {
                this._suppressOutput = val;
            },
            enumerable: true,
            configurable: true
        });
        IndentingWriter.prototype.write = function (str, writePadding) {
            if (str === void 0) {
                str = '';
            }
            if (writePadding === void 0) {
                writePadding = false;
            }
            if (!this._suppressOutput) {
                this._outNoNewline((writePadding ? this._padding : '') + str);
            }
        };
        IndentingWriter.prototype.writeLn = function (str) {
            if (str === void 0) {
                str = '';
            }
            if (!this._suppressOutput) {
                this._out(this._padding + str);
            }
        };
        IndentingWriter.prototype.writeObject = function (str, object) {
            if (str === void 0) {
                str = '';
            }
            if (!this._suppressOutput) {
                this._out(this._padding + str, object);
            }
        };
        IndentingWriter.prototype.writeTimeLn = function (str) {
            if (str === void 0) {
                str = '';
            }
            if (!this._suppressOutput) {
                this._out(this._padding + performance.now().toFixed(2) + ' ' + str);
            }
        };
        IndentingWriter.prototype.writeComment = function (str) {
            var lines = (str || '').split('\n');
            if (lines.length === 1) {
                this.writeLn('// ' + lines[0]);
            } else {
                this.writeLn('/**');
                for (var i = 0; i < lines.length; i++) {
                    this.writeLn(' * ' + lines[i]);
                }
                this.writeLn(' */');
            }
        };
        IndentingWriter.prototype.writeLns = function (str) {
            var lines = (str || '').split('\n');
            for (var i = 0; i < lines.length; i++) {
                this.writeLn(lines[i]);
            }
        };
        IndentingWriter.prototype.errorLn = function (str) {
            if (IndentingWriter.logLevel & 1    /* Error */) {
                this.boldRedLn(str);
            }
        };
        IndentingWriter.prototype.warnLn = function (str) {
            if (IndentingWriter.logLevel & 2    /* Warn */) {
                this.yellowLn(str);
            }
        };
        IndentingWriter.prototype.debugLn = function (str) {
            if (IndentingWriter.logLevel & 4    /* Debug */) {
                this.purpleLn(str);
            }
        };
        IndentingWriter.prototype.logLn = function (str) {
            if (IndentingWriter.logLevel & 8    /* Log */) {
                this.writeLn(str);
            }
        };
        IndentingWriter.prototype.infoLn = function (str) {
            if (IndentingWriter.logLevel & 16    /* Info */) {
                this.writeLn(str);
            }
        };
        IndentingWriter.prototype.yellowLn = function (str) {
            this.colorLn(IndentingWriter.YELLOW, str);
        };
        IndentingWriter.prototype.greenLn = function (str) {
            this.colorLn(IndentingWriter.GREEN, str);
        };
        IndentingWriter.prototype.boldRedLn = function (str) {
            this.colorLn(IndentingWriter.BOLD_RED, str);
        };
        IndentingWriter.prototype.redLn = function (str) {
            this.colorLn(IndentingWriter.RED, str);
        };
        IndentingWriter.prototype.purpleLn = function (str) {
            this.colorLn(IndentingWriter.PURPLE, str);
        };
        IndentingWriter.prototype.colorLn = function (color, str) {
            if (!this._suppressOutput) {
                if (!inBrowser) {
                    this._out(this._padding + color + str + IndentingWriter.ENDC);
                } else {
                    this._out(this._padding + str);
                }
            }
        };
        IndentingWriter.prototype.redLns = function (str) {
            this.colorLns(IndentingWriter.RED, str);
        };
        IndentingWriter.prototype.colorLns = function (color, str) {
            var lines = (str || '').split('\n');
            for (var i = 0; i < lines.length; i++) {
                this.colorLn(color, lines[i]);
            }
        };
        IndentingWriter.prototype.enter = function (str) {
            if (!this._suppressOutput) {
                this._out(this._padding + str);
            }
            this.indent();
        };
        IndentingWriter.prototype.leaveAndEnter = function (str) {
            this.leave(str);
            this.indent();
        };
        IndentingWriter.prototype.leave = function (str) {
            this.outdent();
            if (!this._suppressOutput && str) {
                this._out(this._padding + str);
            }
        };
        IndentingWriter.prototype.indent = function () {
            this._padding += this._tab;
        };
        IndentingWriter.prototype.outdent = function () {
            if (this._padding.length > 0) {
                this._padding = this._padding.substring(0, this._padding.length - this._tab.length);
            }
        };
        IndentingWriter.prototype.writeArray = function (arr, detailed, noNumbers) {
            if (detailed === void 0) {
                detailed = false;
            }
            if (noNumbers === void 0) {
                noNumbers = false;
            }
            detailed = detailed || false;
            for (var i = 0, j = arr.length; i < j; i++) {
                var prefix = '';
                if (detailed) {
                    if (arr[i] === null) {
                        prefix = 'null';
                    } else if (arr[i] === undefined) {
                        prefix = 'undefined';
                    } else {
                        prefix = arr[i].constructor.name;
                    }
                    prefix += ' ';
                }
                var number = noNumbers ? '' : ('' + i).padRight(' ', 4);
                this.writeLn(number + prefix + arr[i]);
            }
        };
        IndentingWriter.PURPLE = '\x1B[94m';
        IndentingWriter.YELLOW = '\x1B[93m';
        IndentingWriter.GREEN = '\x1B[92m';
        IndentingWriter.RED = '\x1B[91m';
        IndentingWriter.BOLD_RED = '\x1B[1;91m';
        IndentingWriter.ENDC = '\x1B[0m';
        IndentingWriter.logLevel = 31    /* All */;
        IndentingWriter._consoleOut = console.log.bind(console);
        IndentingWriter._consoleOutNoNewline = console.log.bind(console);
        return IndentingWriter;
    }();
    Shumway.IndentingWriter = IndentingWriter;
    var CircularBuffer = function () {
        function CircularBuffer(Type, sizeInBits) {
            if (sizeInBits === void 0) {
                sizeInBits = 12;
            }
            this.index = 0;
            this.start = 0;
            this._size = 1 << sizeInBits;
            this._mask = this._size - 1;
            this.array = new Type(this._size);
        }
        CircularBuffer.prototype.get = function (i) {
            return this.array[i];
        };
        CircularBuffer.prototype.forEachInReverse = function (visitor) {
            if (this.isEmpty()) {
                return;
            }
            var i = this.index === 0 ? this._size - 1 : this.index - 1;
            var end = this.start - 1 & this._mask;
            while (i !== end) {
                if (visitor(this.array[i], i)) {
                    break;
                }
                i = i === 0 ? this._size - 1 : i - 1;
            }
        };
        CircularBuffer.prototype.write = function (value) {
            this.array[this.index] = value;
            this.index = this.index + 1 & this._mask;
            if (this.index === this.start) {
                this.start = this.start + 1 & this._mask;
            }
        };
        CircularBuffer.prototype.isFull = function () {
            return (this.index + 1 & this._mask) === this.start;
        };
        CircularBuffer.prototype.isEmpty = function () {
            return this.index === this.start;
        };
        CircularBuffer.prototype.reset = function () {
            this.index = 0;
            this.start = 0;
        };
        return CircularBuffer;
    }();
    Shumway.CircularBuffer = CircularBuffer;
    var ColorStyle = function () {
        function ColorStyle() {
        }
        ColorStyle.randomStyle = function () {
            if (!ColorStyle._randomStyleCache) {
                ColorStyle._randomStyleCache = [
                    '#ff5e3a',
                    '#ff9500',
                    '#ffdb4c',
                    '#87fc70',
                    '#52edc7',
                    '#1ad6fd',
                    '#c644fc',
                    '#ef4db6',
                    '#4a4a4a',
                    '#dbddde',
                    '#ff3b30',
                    '#ff9500',
                    '#ffcc00',
                    '#4cd964',
                    '#34aadc',
                    '#007aff',
                    '#5856d6',
                    '#ff2d55',
                    '#8e8e93',
                    '#c7c7cc',
                    '#5ad427',
                    '#c86edf',
                    '#d1eefc',
                    '#e0f8d8',
                    '#fb2b69',
                    '#f7f7f7',
                    '#1d77ef',
                    '#d6cec3',
                    '#55efcb',
                    '#ff4981',
                    '#ffd3e0',
                    '#f7f7f7',
                    '#ff1300',
                    '#1f1f21',
                    '#bdbec2',
                    '#ff3a2d'
                ];
            }
            return ColorStyle._randomStyleCache[ColorStyle._nextStyle++ % ColorStyle._randomStyleCache.length];
        };
        ColorStyle.gradientColor = function (value) {
            return ColorStyle._gradient[ColorStyle._gradient.length * NumberUtilities.clamp(value, 0, 1) | 0];
        };
        ColorStyle.contrastStyle = function (rgb) {
            // http://www.w3.org/TR/AERT#color-contrast
            var c = parseInt(rgb.substr(1), 16);
            var yiq = ((c >> 16) * 299 + (c >> 8 & 255) * 587 + (c & 255) * 114) / 1000;
            return yiq >= 128 ? '#000000' : '#ffffff';
        };
        ColorStyle.reset = function () {
            ColorStyle._nextStyle = 0;
        };
        ColorStyle.TabToolbar = '#252c33';
        ColorStyle.Toolbars = '#343c45';
        ColorStyle.HighlightBlue = '#1d4f73';
        ColorStyle.LightText = '#f5f7fa';
        ColorStyle.ForegroundText = '#b6babf';
        ColorStyle.Black = '#000000';
        ColorStyle.VeryDark = '#14171a';
        ColorStyle.Dark = '#181d20';
        ColorStyle.Light = '#a9bacb';
        ColorStyle.Grey = '#8fa1b2';
        ColorStyle.DarkGrey = '#5f7387';
        ColorStyle.Blue = '#46afe3';
        ColorStyle.Purple = '#6b7abb';
        ColorStyle.Pink = '#df80ff';
        ColorStyle.Red = '#eb5368';
        ColorStyle.Orange = '#d96629';
        ColorStyle.LightOrange = '#d99b28';
        ColorStyle.Green = '#70bf53';
        ColorStyle.BlueGrey = '#5e88b0';
        ColorStyle._nextStyle = 0;
        ColorStyle._gradient = [
            '#FF0000',
            '#FF1100',
            '#FF2300',
            '#FF3400',
            '#FF4600',
            '#FF5700',
            '#FF6900',
            '#FF7B00',
            '#FF8C00',
            '#FF9E00',
            '#FFAF00',
            '#FFC100',
            '#FFD300',
            '#FFE400',
            '#FFF600',
            '#F7FF00',
            '#E5FF00',
            '#D4FF00',
            '#C2FF00',
            '#B0FF00',
            '#9FFF00',
            '#8DFF00',
            '#7CFF00',
            '#6AFF00',
            '#58FF00',
            '#47FF00',
            '#35FF00',
            '#24FF00',
            '#12FF00',
            '#00FF00'    // Green
        ];
        return ColorStyle;
    }();
    Shumway.ColorStyle = ColorStyle;
    /**
     * Faster release version of bounds.
     */
    var Bounds = function () {
        function Bounds(xMin, yMin, xMax, yMax) {
            this.xMin = xMin | 0;
            this.yMin = yMin | 0;
            this.xMax = xMax | 0;
            this.yMax = yMax | 0;
        }
        Bounds.FromUntyped = function (source) {
            return new Bounds(source.xMin, source.yMin, source.xMax, source.yMax);
        };
        Bounds.FromRectangle = function (source) {
            return new Bounds(source.x * 20 | 0, source.y * 20 | 0, (source.x + source.width) * 20 | 0, (source.y + source.height) * 20 | 0);
        };
        Bounds.prototype.setElements = function (xMin, yMin, xMax, yMax) {
            this.xMin = xMin;
            this.yMin = yMin;
            this.xMax = xMax;
            this.yMax = yMax;
        };
        Bounds.prototype.copyFrom = function (source) {
            this.setElements(source.xMin, source.yMin, source.xMax, source.yMax);
        };
        Bounds.prototype.contains = function (x, y) {
            return x < this.xMin !== x < this.xMax && y < this.yMin !== y < this.yMax;
        };
        Bounds.prototype.unionInPlace = function (other) {
            if (other.isEmpty()) {
                return;
            }
            this.extendByPoint(other.xMin, other.yMin);
            this.extendByPoint(other.xMax, other.yMax);
        };
        Bounds.prototype.extendByPoint = function (x, y) {
            this.extendByX(x);
            this.extendByY(y);
        };
        Bounds.prototype.extendByX = function (x) {
            // Exclude default values.
            if (this.xMin === 134217728) {
                this.xMin = this.xMax = x;
                return;
            }
            this.xMin = Math.min(this.xMin, x);
            this.xMax = Math.max(this.xMax, x);
        };
        Bounds.prototype.extendByY = function (y) {
            // Exclude default values.
            if (this.yMin === 134217728) {
                this.yMin = this.yMax = y;
                return;
            }
            this.yMin = Math.min(this.yMin, y);
            this.yMax = Math.max(this.yMax, y);
        };
        Bounds.prototype.intersects = function (toIntersect) {
            return this.contains(toIntersect.xMin, toIntersect.yMin) || this.contains(toIntersect.xMax, toIntersect.yMax);
        };
        Bounds.prototype.isEmpty = function () {
            return this.xMax <= this.xMin || this.yMax <= this.yMin;
        };
        Object.defineProperty(Bounds.prototype, 'width', {
            get: function () {
                return this.xMax - this.xMin;
            },
            set: function (value) {
                this.xMax = this.xMin + value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Bounds.prototype, 'height', {
            get: function () {
                return this.yMax - this.yMin;
            },
            set: function (value) {
                this.yMax = this.yMin + value;
            },
            enumerable: true,
            configurable: true
        });
        Bounds.prototype.getBaseWidth = function (angle) {
            var u = Math.abs(Math.cos(angle));
            var v = Math.abs(Math.sin(angle));
            return u * (this.xMax - this.xMin) + v * (this.yMax - this.yMin);
        };
        Bounds.prototype.getBaseHeight = function (angle) {
            var u = Math.abs(Math.cos(angle));
            var v = Math.abs(Math.sin(angle));
            return v * (this.xMax - this.xMin) + u * (this.yMax - this.yMin);
        };
        Bounds.prototype.setEmpty = function () {
            this.xMin = this.yMin = this.xMax = this.yMax = 0;
        };
        /**
         * Set all fields to the sentinel value 0x8000000.
         *
         * This is what Flash uses to indicate uninitialized bounds. Important for bounds calculation
         * in `Graphics` instances, which start out with empty bounds but must not just extend them
         * from an 0,0 origin.
         */
        Bounds.prototype.setToSentinels = function () {
            this.xMin = this.yMin = this.xMax = this.yMax = 134217728;
        };
        Bounds.prototype.clone = function () {
            return new Bounds(this.xMin, this.yMin, this.xMax, this.yMax);
        };
        Bounds.prototype.toString = function () {
            return '{ ' + 'xMin: ' + this.xMin + ', ' + 'xMin: ' + this.yMin + ', ' + 'xMax: ' + this.xMax + ', ' + 'xMax: ' + this.yMax + ' }';
        };
        return Bounds;
    }();
    Shumway.Bounds = Bounds;
    /**
     * Slower debug version of bounds, makes sure that all points have integer coordinates.
     */
    var DebugBounds = function () {
        function DebugBounds(xMin, yMin, xMax, yMax) {
            Debug.assert(isInteger(xMin));
            Debug.assert(isInteger(yMin));
            Debug.assert(isInteger(xMax));
            Debug.assert(isInteger(yMax));
            this._xMin = xMin | 0;
            this._yMin = yMin | 0;
            this._xMax = xMax | 0;
            this._yMax = yMax | 0;
            this.assertValid();
        }
        DebugBounds.FromUntyped = function (source) {
            return new DebugBounds(source.xMin, source.yMin, source.xMax, source.yMax);
        };
        DebugBounds.FromRectangle = function (source) {
            return new DebugBounds(source.x * 20 | 0, source.y * 20 | 0, (source.x + source.width) * 20 | 0, (source.y + source.height) * 20 | 0);
        };
        DebugBounds.prototype.setElements = function (xMin, yMin, xMax, yMax) {
            this.xMin = xMin;
            this.yMin = yMin;
            this.xMax = xMax;
            this.yMax = yMax;
        };
        DebugBounds.prototype.copyFrom = function (source) {
            this.setElements(source.xMin, source.yMin, source.xMax, source.yMax);
        };
        DebugBounds.prototype.contains = function (x, y) {
            return x < this.xMin !== x < this.xMax && y < this.yMin !== y < this.yMax;
        };
        DebugBounds.prototype.unionInPlace = function (other) {
            if (other.isEmpty()) {
                return;
            }
            this.extendByPoint(other.xMin, other.yMin);
            this.extendByPoint(other.xMax, other.yMax);
        };
        DebugBounds.prototype.extendByPoint = function (x, y) {
            this.extendByX(x);
            this.extendByY(y);
        };
        DebugBounds.prototype.extendByX = function (x) {
            if (this.xMin === 134217728) {
                this.xMin = this.xMax = x;
                return;
            }
            this.xMin = Math.min(this.xMin, x);
            this.xMax = Math.max(this.xMax, x);
        };
        DebugBounds.prototype.extendByY = function (y) {
            if (this.yMin === 134217728) {
                this.yMin = this.yMax = y;
                return;
            }
            this.yMin = Math.min(this.yMin, y);
            this.yMax = Math.max(this.yMax, y);
        };
        DebugBounds.prototype.intersects = function (toIntersect) {
            return this.contains(toIntersect._xMin, toIntersect._yMin) || this.contains(toIntersect._xMax, toIntersect._yMax);
        };
        DebugBounds.prototype.isEmpty = function () {
            return this._xMax <= this._xMin || this._yMax <= this._yMin;
        };
        Object.defineProperty(DebugBounds.prototype, 'xMin', {
            get: function () {
                return this._xMin;
            },
            set: function (value) {
                Debug.assert(isInteger(value));
                this._xMin = value;
                this.assertValid();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DebugBounds.prototype, 'yMin', {
            get: function () {
                return this._yMin;
            },
            set: function (value) {
                Debug.assert(isInteger(value));
                this._yMin = value | 0;
                this.assertValid();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DebugBounds.prototype, 'xMax', {
            get: function () {
                return this._xMax;
            },
            set: function (value) {
                Debug.assert(isInteger(value));
                this._xMax = value | 0;
                this.assertValid();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DebugBounds.prototype, 'width', {
            get: function () {
                return this._xMax - this._xMin;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DebugBounds.prototype, 'yMax', {
            get: function () {
                return this._yMax;
            },
            set: function (value) {
                Debug.assert(isInteger(value));
                this._yMax = value | 0;
                this.assertValid();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DebugBounds.prototype, 'height', {
            get: function () {
                return this._yMax - this._yMin;
            },
            enumerable: true,
            configurable: true
        });
        DebugBounds.prototype.getBaseWidth = function (angle) {
            var u = Math.abs(Math.cos(angle));
            var v = Math.abs(Math.sin(angle));
            return u * (this._xMax - this._xMin) + v * (this._yMax - this._yMin);
        };
        DebugBounds.prototype.getBaseHeight = function (angle) {
            var u = Math.abs(Math.cos(angle));
            var v = Math.abs(Math.sin(angle));
            return v * (this._xMax - this._xMin) + u * (this._yMax - this._yMin);
        };
        DebugBounds.prototype.setEmpty = function () {
            this._xMin = this._yMin = this._xMax = this._yMax = 0;
        };
        DebugBounds.prototype.clone = function () {
            return new DebugBounds(this.xMin, this.yMin, this.xMax, this.yMax);
        };
        DebugBounds.prototype.toString = function () {
            return '{ ' + 'xMin: ' + this._xMin + ', ' + 'yMin: ' + this._yMin + ', ' + 'xMax: ' + this._xMax + ', ' + 'yMax: ' + this._yMax + ' }';
        };
        DebugBounds.prototype.assertValid = function () {
        };
        return DebugBounds;
    }();
    Shumway.DebugBounds = DebugBounds;
    /**
     * Override Bounds with a slower by safer version, don't do this in release mode.
     */
    // Shumway.Bounds = DebugBounds;
    var Color = function () {
        function Color(r, g, b, a) {
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = a;
        }
        Color.FromARGB = function (argb) {
            return new Color((argb >> 16 & 255) / 255, (argb >> 8 & 255) / 255, (argb >> 0 & 255) / 255, (argb >> 24 & 255) / 255);
        };
        Color.FromRGBA = function (rgba) {
            return Color.FromARGB(ColorUtilities.RGBAToARGB(rgba));
        };
        Color.prototype.toRGBA = function () {
            return this.r * 255 << 24 | this.g * 255 << 16 | this.b * 255 << 8 | this.a * 255;
        };
        Color.prototype.toCSSStyle = function () {
            return ColorUtilities.rgbaToCSSStyle(this.toRGBA());
        };
        Color.prototype.set = function (other) {
            this.r = other.r;
            this.g = other.g;
            this.b = other.b;
            this.a = other.a;
        };
        Color.randomColor = function (alpha) {
            if (alpha === void 0) {
                alpha = 1;
            }
            return new Color(Math.random(), Math.random(), Math.random(), alpha);
        };
        Color.parseColor = function (color) {
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
            if (!m)
                m = /^rgba\((\d+), (\d+), (\d+), ([\d.]+)\)$/.exec(rgb);
            var result = new Color(0, 0, 0, 0);
            result.r = parseFloat(m[1]) / 255;
            result.g = parseFloat(m[2]) / 255;
            result.b = parseFloat(m[3]) / 255;
            result.a = m[4] ? parseFloat(m[4]) / 255 : 1;
            return Color.colorCache[color] = result;
        };
        Color.Red = new Color(1, 0, 0, 1);
        Color.Green = new Color(0, 1, 0, 1);
        Color.Blue = new Color(0, 0, 1, 1);
        Color.None = new Color(0, 0, 0, 0);
        Color.White = new Color(1, 1, 1, 1);
        Color.Black = new Color(0, 0, 0, 1);
        Color.colorCache = {};
        return Color;
    }();
    Shumway.Color = Color;
    var ColorUtilities;
    (function (ColorUtilities) {
        function RGBAToARGB(rgba) {
            return rgba >> 8 & 16777215 | (rgba & 255) << 24;
        }
        ColorUtilities.RGBAToARGB = RGBAToARGB;
        function ARGBToRGBA(argb) {
            return argb << 8 | argb >> 24 & 255;
        }
        ColorUtilities.ARGBToRGBA = ARGBToRGBA;
        /**
         * Cache frequently used rgba -> css style conversions.
         */
        var rgbaToCSSStyleCache = new Cache(1024);
        function rgbaToCSSStyle(rgba) {
            var result = rgbaToCSSStyleCache.get(rgba);
            if (typeof result === 'string') {
                return result;
            }
            result = Shumway.StringUtilities.concat9('rgba(', rgba >> 24 & 255, ',', rgba >> 16 & 255, ',', rgba >> 8 & 255, ',', (rgba & 255) / 255, ')');
            rgbaToCSSStyleCache.set(rgba, result);
            return result;
        }
        ColorUtilities.rgbaToCSSStyle = rgbaToCSSStyle;
        /**
         * Cache frequently used css -> rgba styles conversions.
         */
        var cssStyleToRGBACache = new Cache(1024);
        function cssStyleToRGBA(style) {
            var result = cssStyleToRGBACache.get(style);
            if (typeof result === 'number') {
                return result;
            }
            result = 4278190335;
            // Red
            if (style[0] === '#') {
                if (style.length === 7) {
                    result = parseInt(style.substring(1), 16) << 8 | 255;
                }
            } else if (style[0] === 'r') {
                // We don't parse all types of rgba(....) color styles. We only handle the
                // ones we generate ourselves.
                var values = style.substring(5, style.length - 1).split(',');
                var r = parseInt(values[0]);
                var g = parseInt(values[1]);
                var b = parseInt(values[2]);
                var a = parseFloat(values[3]);
                result = (r & 255) << 24 | (g & 255) << 16 | (b & 255) << 8 | a * 255 & 255;
            }
            cssStyleToRGBACache.set(style, result);
            return result;
        }
        ColorUtilities.cssStyleToRGBA = cssStyleToRGBA;
        function hexToRGB(color) {
            return parseInt(color.slice(1), 16);
        }
        ColorUtilities.hexToRGB = hexToRGB;
        function rgbToHex(color) {
            return '#' + ('000000' + (color >>> 0).toString(16)).slice(-6);
        }
        ColorUtilities.rgbToHex = rgbToHex;
        function isValidHexColor(value) {
            return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value);
        }
        ColorUtilities.isValidHexColor = isValidHexColor;
        function clampByte(value) {
            return Math.max(0, Math.min(255, value));
        }
        ColorUtilities.clampByte = clampByte;
        /**
         * Unpremultiplies the given |pARGB| color value.
         */
        function unpremultiplyARGB(pARGB) {
            var b = pARGB >> 0 & 255;
            var g = pARGB >> 8 & 255;
            var r = pARGB >> 16 & 255;
            var a = pARGB >> 24 & 255;
            r = Math.imul(255, r) / a & 255;
            g = Math.imul(255, g) / a & 255;
            b = Math.imul(255, b) / a & 255;
            return a << 24 | r << 16 | g << 8 | b;
        }
        ColorUtilities.unpremultiplyARGB = unpremultiplyARGB;
        /**
         * Premultiplies the given |pARGB| color value.
         */
        function premultiplyARGB(uARGB) {
            var b = uARGB >> 0 & 255;
            var g = uARGB >> 8 & 255;
            var r = uARGB >> 16 & 255;
            var a = uARGB >> 24 & 255;
            r = (Math.imul(r, a) + 127) / 255 | 0;
            g = (Math.imul(g, a) + 127) / 255 | 0;
            b = (Math.imul(b, a) + 127) / 255 | 0;
            return a << 24 | r << 16 | g << 8 | b;
        }
        ColorUtilities.premultiplyARGB = premultiplyARGB;
        var premultiplyTable;
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
        var unpremultiplyTable;
        /**
         * Make sure to call this before using the |unpremultiplyARGBUsingTableLookup| or
         * |premultiplyARGBUsingTableLookup| functions. We want to execute this lazily so
         * we don't incur any startup overhead.
         */
        function ensureUnpremultiplyTable() {
            if (!unpremultiplyTable) {
                unpremultiplyTable = new Uint8Array(256 * 256);
                for (var c = 0; c < 256; c++) {
                    for (var a = 0; a < 256; a++) {
                        unpremultiplyTable[(a << 8) + c] = Math.imul(255, c) / a;
                    }
                }
            }
        }
        ColorUtilities.ensureUnpremultiplyTable = ensureUnpremultiplyTable;
        function getUnpremultiplyTable() {
            ensureUnpremultiplyTable();
            return unpremultiplyTable;
        }
        ColorUtilities.getUnpremultiplyTable = getUnpremultiplyTable;
        function tableLookupUnpremultiplyARGB(pARGB) {
            pARGB = pARGB | 0;
            var a = pARGB >> 24 & 255;
            if (a === 0) {
                return 0;
            } else if (a === 255) {
                return pARGB;
            }
            var b = pARGB >> 0 & 255;
            var g = pARGB >> 8 & 255;
            var r = pARGB >> 16 & 255;
            var o = a << 8;
            var T = unpremultiplyTable;
            r = T[o + r];
            g = T[o + g];
            b = T[o + b];
            return a << 24 | r << 16 | g << 8 | b;
        }
        ColorUtilities.tableLookupUnpremultiplyARGB = tableLookupUnpremultiplyARGB;
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
        function blendPremultipliedBGRA(tpBGRA, spBGRA) {
            var sA = spBGRA & 255;
            var sGA = spBGRA & 16711935;
            var sBR = spBGRA >> 8 & 16711935;
            var tGA = tpBGRA & 16711935;
            var tBR = tpBGRA >> 8 & 16711935;
            var A = 256 - sA;
            tGA = Math.imul(tGA, A) >> 8;
            tBR = Math.imul(tBR, A) >> 8;
            return (sBR + tBR & 16711935) << 8 | sGA + tGA & 16711935;
        }
        ColorUtilities.blendPremultipliedBGRA = blendPremultipliedBGRA;
        var swap32 = IntegerUtilities.swap32;
        function convertImage(sourceFormat, targetFormat, source, target) {
            if (source !== target) {
                release || Debug.assert(source.buffer !== target.buffer, 'Can\'t handle overlapping views.');
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
            if (sourceFormat === ImageType.PremultipliedAlphaARGB && targetFormat === ImageType.StraightAlphaRGBA) {
                Shumway.ColorUtilities.ensureUnpremultiplyTable();
                for (var i = 0; i < length; i++) {
                    var pBGRA = source[i];
                    var a = pBGRA & 255;
                    if (a === 0) {
                        target[i] = 0;
                    } else if (a === 255) {
                        target[i] = 4278190080 | pBGRA >> 8 & 16777215;
                    } else {
                        var b = pBGRA >> 24 & 255;
                        var g = pBGRA >> 16 & 255;
                        var r = pBGRA >> 8 & 255;
                        var o = a << 8;
                        var T = unpremultiplyTable;
                        r = T[o + r];
                        g = T[o + g];
                        b = T[o + b];
                        target[i] = a << 24 | b << 16 | g << 8 | r;
                    }
                }
            } else if (sourceFormat === ImageType.StraightAlphaARGB && targetFormat === ImageType.StraightAlphaRGBA) {
                for (var i = 0; i < length; i++) {
                    target[i] = swap32(source[i]);
                }
            } else if (sourceFormat === ImageType.StraightAlphaRGBA && targetFormat === ImageType.PremultipliedAlphaARGB) {
                for (var i = 0; i < length; i++) {
                    var uABGR = source[i];
                    var uARGB = uABGR & 4278255360 | uABGR >> 16 & 255 | (uABGR & 255) << 16;
                    // ARGR
                    target[i] = swap32(premultiplyARGB(uARGB));
                }
            } else {
                release || Debug.somewhatImplemented('Image Format Conversion: ' + ImageType[sourceFormat] + ' -> ' + ImageType[targetFormat]);
                // Copy the buffer over for now, we should at least get some image output.
                for (var i = 0; i < length; i++) {
                    target[i] = source[i];
                }
            }    // leaveTimeline("convertImage");
        }
        ColorUtilities.convertImage = convertImage;
    }(ColorUtilities = Shumway.ColorUtilities || (Shumway.ColorUtilities = {})));
    /**
     * Simple pool allocator for ArrayBuffers. This reduces memory usage in data structures
     * that resize buffers.
     */
    var ArrayBufferPool = function () {
        /**
         * Creates a pool that manages a pool of a |maxSize| number of array buffers.
         */
        function ArrayBufferPool(maxSize) {
            if (maxSize === void 0) {
                maxSize = 32;
            }
            this._list = [];
            this._maxSize = maxSize;
        }
        /**
         * Creates or reuses an existing array buffer that is at least the
         * specified |length|.
         */
        ArrayBufferPool.prototype.acquire = function (length) {
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
        };
        /**
         * Releases an array buffer that is no longer needed back to the pool.
         */
        ArrayBufferPool.prototype.release = function (buffer) {
            if (ArrayBufferPool._enabled) {
                var list = this._list;
                release || Debug.assert(ArrayUtilities.indexOf(list, buffer) < 0);
                if (list.length === this._maxSize) {
                    list.shift();
                }
                list.push(buffer);
            }
        };
        /**
         * Resizes a Uint8Array to have the given length.
         */
        ArrayBufferPool.prototype.ensureUint8ArrayLength = function (array, length) {
            if (array.length >= length) {
                return array;
            }
            var newLength = Math.max(array.length + length, (array.length * 3 >> 1) + 1);
            var newArray = new Uint8Array(this.acquire(newLength), 0, newLength);
            newArray.set(array);
            this.release(array.buffer);
            return newArray;
        };
        /**
         * Resizes a Float64Array to have the given length.
         */
        ArrayBufferPool.prototype.ensureFloat64ArrayLength = function (array, length) {
            if (array.length >= length) {
                return array;
            }
            var newLength = Math.max(array.length + length, (array.length * 3 >> 1) + 1);
            var newArray = new Float64Array(this.acquire(newLength * Float64Array.BYTES_PER_ELEMENT), 0, newLength);
            newArray.set(array);
            this.release(array.buffer);
            return newArray;
        };
        ArrayBufferPool._enabled = true;
        return ArrayBufferPool;
    }();
    Shumway.ArrayBufferPool = ArrayBufferPool;
    var Telemetry;
    (function (Telemetry) {
        Telemetry.instance;
    }(Telemetry = Shumway.Telemetry || (Shumway.Telemetry = {})));
    var FileLoadingService;
    (function (FileLoadingService) {
        FileLoadingService.instance;
    }(FileLoadingService = Shumway.FileLoadingService || (Shumway.FileLoadingService = {})));
    var SystemResourcesLoadingService;
    (function (SystemResourcesLoadingService) {
        SystemResourcesLoadingService.instance;
    }(SystemResourcesLoadingService = Shumway.SystemResourcesLoadingService || (Shumway.SystemResourcesLoadingService = {})));
    function registerCSSFont(id, data, forceFontInit) {
        if (!inBrowser) {
            Debug.warning('Cannot register CSS font outside the browser');
            return;
        }
        var head = document.head;
        head.insertBefore(document.createElement('style'), head.firstChild);
        var style = document.styleSheets[0];
        var rule = '@font-face{font-family:swffont' + id + ';src:url(data:font/opentype;base64,' + Shumway.StringUtilities.base64EncodeBytes(data) + ')' + '}';
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
    Shumway.registerCSSFont = registerCSSFont;
    var ExternalInterfaceService;
    (function (ExternalInterfaceService) {
        ExternalInterfaceService.instance = {
            enabled: false,
            initJS: function (callback) {
            },
            registerCallback: function (functionName) {
            },
            unregisterCallback: function (functionName) {
            },
            eval: function (expression) {
            },
            call: function (request) {
            },
            getId: function () {
                return null;
            }
        };
    }(ExternalInterfaceService = Shumway.ExternalInterfaceService || (Shumway.ExternalInterfaceService = {})));
    var LocalConnectionService;
    (function (LocalConnectionService) {
        LocalConnectionService.instance;
    }(LocalConnectionService = Shumway.LocalConnectionService || (Shumway.LocalConnectionService = {})));
    var ClipboardService;
    (function (ClipboardService) {
        ClipboardService.instance = {
            setClipboard: function (data) {
                Debug.notImplemented('setClipboard');
            }
        };
    }(ClipboardService = Shumway.ClipboardService || (Shumway.ClipboardService = {})));
    var Callback = function () {
        function Callback() {
            this._queues = {};
        }
        Callback.prototype.register = function (type, callback) {
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
        };
        Callback.prototype.unregister = function (type, callback) {
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
        };
        Callback.prototype.notify = function (type, args) {
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
        };
        Callback.prototype.notify1 = function (type, value) {
            var queue = this._queues[type];
            if (!queue) {
                return;
            }
            queue = queue.slice();
            for (var i = 0; i < queue.length; i++) {
                var callback = queue[i];
                callback(type, value);
            }
        };
        return Callback;
    }();
    Shumway.Callback = Callback;
    (function (ImageType) {
        ImageType[ImageType['None'] = 0] = 'None';
        /**
         * Premultiplied ARGB (byte-order).
         */
        ImageType[ImageType['PremultipliedAlphaARGB'] = 1] = 'PremultipliedAlphaARGB';
        /**
         * Unpremultiplied ARGB (byte-order).
         */
        ImageType[ImageType['StraightAlphaARGB'] = 2] = 'StraightAlphaARGB';
        /**
         * Unpremultiplied RGBA (byte-order), this is what putImageData expects.
         */
        ImageType[ImageType['StraightAlphaRGBA'] = 3] = 'StraightAlphaRGBA';
        ImageType[ImageType['JPEG'] = 4] = 'JPEG';
        ImageType[ImageType['PNG'] = 5] = 'PNG';
        ImageType[ImageType['GIF'] = 6] = 'GIF';
    }(Shumway.ImageType || (Shumway.ImageType = {})));
    var ImageType = Shumway.ImageType;
    function getMIMETypeForImageType(type) {
        switch (type) {
        case ImageType.JPEG:
            return 'image/jpeg';
        case ImageType.PNG:
            return 'image/png';
        case ImageType.GIF:
            return 'image/gif';
        default:
            return 'text/plain';
        }
    }
    Shumway.getMIMETypeForImageType = getMIMETypeForImageType;
    var UI;
    (function (UI) {
        /*
         * Converts a |MouseCursor| number to a CSS |cursor| property value.
         */
        function toCSSCursor(mouseCursor) {
            switch (mouseCursor) {
            case 0:
                return 'auto';
            case 2:
                return 'pointer';
            case 3:
                return 'grab';
            case 4:
                return 'text';
            case 1:
            // MouseCursor.ARROW
            default:
                return 'default';
            }
        }
        UI.toCSSCursor = toCSSCursor;
    }(UI = Shumway.UI || (Shumway.UI = {})));
    var PromiseWrapper = function () {
        function PromiseWrapper() {
            this.promise = new Promise(function (resolve, reject) {
                this.resolve = resolve;
                this.reject = reject;
            }.bind(this));
        }
        PromiseWrapper.prototype.then = function (onFulfilled, onRejected) {
            return this.promise.then(onFulfilled, onRejected);
        };
        return PromiseWrapper;
    }();
    Shumway.PromiseWrapper = PromiseWrapper;
}(Shumway || (Shumway = {})));
if (typeof exports !== 'undefined') {
    exports['Shumway'] = Shumway;
}
/**
 * Extend builtin prototypes.
 *
 * TODO: Go through the code and remove all references to these.
 */
(function () {
    function extendBuiltin(prototype, property, value) {
        if (!prototype[property]) {
            Object.defineProperty(prototype, property, {
                value: value,
                writable: true,
                configurable: true,
                enumerable: false
            });
        }
    }
    function removeColors(s) {
        return s.replace(/\033\[[0-9]*m/g, '');
    }
    extendBuiltin(String.prototype, 'padRight', function (c, n) {
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
    extendBuiltin(String.prototype, 'padLeft', function (c, n) {
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
    extendBuiltin(String.prototype, 'trim', function () {
        return this.replace(/^\s+|\s+$/g, '');
    });
    extendBuiltin(String.prototype, 'endsWith', function (str) {
        return this.indexOf(str, this.length - str.length) !== -1;
    });
    extendBuiltin(Array.prototype, 'replace', function (x, y) {
        if (x === y) {
            return 0;
        }
        var count = 0;
        for (var i = 0; i < this.length; i++) {
            if (this[i] === x) {
                this[i] = y;
                count++;
            }
        }
        return count;
    });
}());
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
/**
 * Option and Argument Management
 *
 * Options are configuration settings sprinkled throughout the code. They can be grouped into sets of
 * options called |OptionSets| which can form a hierarchy of options. For instance:
 *
 * var set = new OptionSet();
 * var opt = set.register(new Option("v", "verbose", "boolean", false, "Enables verbose logging."));
 *
 * creates an option set with one option in it. The option can be changed directly using |opt.value = true| or
 * automatically using the |ArgumentParser|:
 *
 * var parser = new ArgumentParser();
 * parser.addBoundOptionSet(set);
 * parser.parse(["-v"]);
 *
 * The |ArgumentParser| can also be used directly:
 *
 * var parser = new ArgumentParser();
 * argumentParser.addArgument("h", "help", "boolean", {parse: function (x) {
 *   printUsage();
 * }});
 */
///<reference path='references.ts' />
var Shumway;
(function (Shumway) {
    var Options;
    (function (Options) {
        var isObject = Shumway.isObject;
        var assert = Shumway.Debug.assert;
        var Argument = function () {
            function Argument(shortName, longName, type, options) {
                this.shortName = shortName;
                this.longName = longName;
                this.type = type;
                options = options || {};
                this.positional = options.positional;
                this.parseFn = options.parse;
                this.value = options.defaultValue;
            }
            Argument.prototype.parse = function (value) {
                if (this.type === 'boolean') {
                    release || assert(typeof value === 'boolean');
                    this.value = value;
                } else if (this.type === 'number') {
                    release || assert(!isNaN(value), value + ' is not a number');
                    this.value = parseInt(value, 10);
                } else {
                    this.value = value;
                }
                if (this.parseFn) {
                    this.parseFn(this.value);
                }
            };
            return Argument;
        }();
        Options.Argument = Argument;
        var ArgumentParser = function () {
            function ArgumentParser() {
                this.args = [];
            }
            ArgumentParser.prototype.addArgument = function (shortName, longName, type, options) {
                var argument = new Argument(shortName, longName, type, options);
                this.args.push(argument);
                return argument;
            };
            ArgumentParser.prototype.addBoundOption = function (option) {
                var options = {
                    parse: function (x) {
                        option.value = x;
                    }
                };
                this.args.push(new Argument(option.shortName, option.longName, option.type, options));
            };
            ArgumentParser.prototype.addBoundOptionSet = function (optionSet) {
                var self = this;
                optionSet.options.forEach(function (x) {
                    if (OptionSet.isOptionSet(x)) {
                        self.addBoundOptionSet(x);
                    } else {
                        release || assert(x);
                        self.addBoundOption(x);
                    }
                });
            };
            ArgumentParser.prototype.getUsage = function () {
                var str = '';
                this.args.forEach(function (x) {
                    if (!x.positional) {
                        str += '[-' + x.shortName + '|--' + x.longName + (x.type === 'boolean' ? '' : ' ' + x.type[0].toUpperCase()) + ']';
                    } else {
                        str += x.longName;
                    }
                    str += ' ';
                });
                return str;
            };
            ArgumentParser.prototype.parse = function (args) {
                var nonPositionalArgumentMap = {};
                var positionalArgumentList = [];
                this.args.forEach(function (x) {
                    if (x.positional) {
                        positionalArgumentList.push(x);
                    } else {
                        nonPositionalArgumentMap['-' + x.shortName] = x;
                        nonPositionalArgumentMap['--' + x.longName] = x;
                    }
                });
                var leftoverArguments = [];
                while (args.length) {
                    var argString = args.shift();
                    var argument = null, value = argString;
                    if (argString == '--') {
                        leftoverArguments = leftoverArguments.concat(args);
                        break;
                    } else if (argString.slice(0, 1) == '-' || argString.slice(0, 2) == '--') {
                        argument = nonPositionalArgumentMap[argString];
                        // release || assert(argument, "Argument " + argString + " is unknown.");
                        if (!argument) {
                            continue;
                        }
                        if (argument.type !== 'boolean') {
                            value = args.shift();
                            release || assert(value !== '-' && value !== '--', 'Argument ' + argString + ' must have a value.');
                        } else {
                            if (args.length && [
                                    'yes',
                                    'no',
                                    'true',
                                    'false',
                                    't',
                                    'f'
                                ].indexOf(args[0]) >= 0) {
                                value = [
                                    'yes',
                                    'true',
                                    't'
                                ].indexOf(args.shift()) >= 0;
                            } else {
                                value = true;
                            }
                        }
                    } else if (positionalArgumentList.length) {
                        argument = positionalArgumentList.shift();
                    } else {
                        leftoverArguments.push(value);
                    }
                    if (argument) {
                        argument.parse(value);
                    }
                }
                release || assert(positionalArgumentList.length === 0, 'Missing positional arguments.');
                return leftoverArguments;
            };
            return ArgumentParser;
        }();
        Options.ArgumentParser = ArgumentParser;
        var OptionSet = function () {
            function OptionSet(name, settings) {
                if (settings === void 0) {
                    settings = null;
                }
                this.open = false;
                this.name = name;
                this.settings = settings || {};
                this.options = [];
            }
            OptionSet.isOptionSet = function (obj) {
                // We will be getting options from different iframe, so this function will
                // check if the obj somewhat like OptionSet.
                if (obj instanceof OptionSet) {
                    return true;
                }
                if (typeof obj !== 'object' || obj === null || obj instanceof Option) {
                    return false;
                }
                return 'options' in obj && 'name' in obj && 'settings' in obj;
            };
            OptionSet.prototype.register = function (option) {
                if (OptionSet.isOptionSet(option)) {
                    // check for duplicate option sets (bail if found)
                    for (var i = 0; i < this.options.length; i++) {
                        var optionSet = this.options[i];
                        if (OptionSet.isOptionSet(optionSet) && optionSet.name === option.name) {
                            return optionSet;
                        }
                    }
                }
                this.options.push(option);
                if (this.settings) {
                    if (OptionSet.isOptionSet(option)) {
                        var optionSettings = this.settings[option.name];
                        if (isObject(optionSettings)) {
                            option.settings = optionSettings.settings;
                            option.open = optionSettings.open;
                        }
                    } else {
                        // build_bundle chokes on this:
                        // if (!isNullOrUndefined(this.settings[option.longName])) {
                        if (typeof this.settings[option.longName] !== 'undefined') {
                            switch (option.type) {
                            case 'boolean':
                                option.value = !!this.settings[option.longName];
                                break;
                            case 'number':
                                option.value = +this.settings[option.longName];
                                break;
                            default:
                                option.value = this.settings[option.longName];
                                break;
                            }
                        }
                    }
                }
                return option;
            };
            OptionSet.prototype.trace = function (writer) {
                writer.enter(this.name + ' {');
                this.options.forEach(function (option) {
                    option.trace(writer);
                });
                writer.leave('}');
            };
            OptionSet.prototype.getSettings = function () {
                var settings = {};
                this.options.forEach(function (option) {
                    if (OptionSet.isOptionSet(option)) {
                        settings[option.name] = {
                            settings: option.getSettings(),
                            open: option.open
                        };
                    } else {
                        settings[option.longName] = option.value;
                    }
                });
                return settings;
            };
            OptionSet.prototype.setSettings = function (settings) {
                if (!settings) {
                    return;
                }
                this.options.forEach(function (option) {
                    if (OptionSet.isOptionSet(option)) {
                        if (option.name in settings) {
                            option.setSettings(settings[option.name].settings);
                        }
                    } else {
                        if (option.longName in settings) {
                            option.value = settings[option.longName];
                        }
                    }
                });
            };
            return OptionSet;
        }();
        Options.OptionSet = OptionSet;
        var Option = function () {
            // config:
            //  { range: { min: 1, max: 5, step: 1 } }
            //  { list: [ "item 1", "item 2", "item 3" ] }
            //  { choices: { "choice 1": 1, "choice 2": 2, "choice 3": 3 } }
            function Option(shortName, longName, type, defaultValue, description, config) {
                if (config === void 0) {
                    config = null;
                }
                this.longName = longName;
                this.shortName = shortName;
                this.type = type;
                this.defaultValue = defaultValue;
                this.value = defaultValue;
                this.description = description;
                this.config = config;
            }
            Option.prototype.parse = function (value) {
                this.value = value;
            };
            Option.prototype.trace = function (writer) {
                writer.writeLn(('-' + this.shortName + '|--' + this.longName).padRight(' ', 30) + ' = ' + this.type + ' ' + this.value + ' [' + this.defaultValue + ']' + ' (' + this.description + ')');
            };
            return Option;
        }();
        Options.Option = Option;
    }(Options = Shumway.Options || (Shumway.Options = {})));
    var Settings;
    (function (Settings) {
        Settings.ROOT = 'Shumway Options';
        Settings.shumwayOptions = new Shumway.Options.OptionSet(Settings.ROOT);
        function setSettings(settings) {
            Settings.shumwayOptions.setSettings(settings);
        }
        Settings.setSettings = setSettings;
        function getSettings() {
            return Settings.shumwayOptions.getSettings();
        }
        Settings.getSettings = getSettings;
    }(Settings = Shumway.Settings || (Shumway.Settings = {})));
    var Option = Shumway.Options.Option;
    var OptionSet = Shumway.Options.OptionSet;
    var shumwayOptions = Shumway.Settings.shumwayOptions;
    Shumway.loggingOptions = shumwayOptions.register(new OptionSet('Logging Options'));
    Shumway.omitRepeatedWarnings = Shumway.loggingOptions.register(new Option('wo', 'warnOnce', 'boolean', true, 'Omit Repeated Warnings'));
    var Metrics;
    (function (Metrics) {
        var Timer = function () {
            function Timer(parent, name) {
                this._parent = parent;
                this._timers = Shumway.ObjectUtilities.createMap();
                this._name = name;
                this._begin = 0;
                this._last = 0;
                this._total = 0;
                this._count = 0;
            }
            Timer.time = function (name, fn) {
                Timer.start(name);
                fn();
                Timer.stop();
            };
            Timer.start = function (name) {
                Timer._top = Timer._top._timers[name] || (Timer._top._timers[name] = new Timer(Timer._top, name));
                Timer._top.start();
                var tmp = Timer._flat._timers[name] || (Timer._flat._timers[name] = new Timer(Timer._flat, name));
                tmp.start();
                Timer._flatStack.push(tmp);
            };
            Timer.stop = function () {
                Timer._top.stop();
                Timer._top = Timer._top._parent;
                Timer._flatStack.pop().stop();
            };
            Timer.stopStart = function (name) {
                Timer.stop();
                Timer.start(name);
            };
            Timer.prototype.start = function () {
                this._begin = Shumway.getTicks();
            };
            Timer.prototype.stop = function () {
                this._last = Shumway.getTicks() - this._begin;
                this._total += this._last;
                this._count += 1;
            };
            Timer.prototype.toJSON = function () {
                return {
                    name: this._name,
                    total: this._total,
                    timers: this._timers
                };
            };
            Timer.prototype.trace = function (writer) {
                writer.enter(this._name + ': ' + this._total.toFixed(2) + ' ms' + ', count: ' + this._count + ', average: ' + (this._total / this._count).toFixed(2) + ' ms');
                for (var name in this._timers) {
                    this._timers[name].trace(writer);
                }
                writer.outdent();
            };
            Timer.trace = function (writer) {
                Timer._base.trace(writer);
                Timer._flat.trace(writer);
            };
            Timer._base = new Timer(null, 'Total');
            Timer._top = Timer._base;
            Timer._flat = new Timer(null, 'Flat');
            Timer._flatStack = [];
            return Timer;
        }();
        Metrics.Timer = Timer;
        /**
         * Quick way to count named events.
         */
        var Counter = function () {
            function Counter(enabled) {
                this._enabled = enabled;
                this.clear();
            }
            Object.defineProperty(Counter.prototype, 'counts', {
                get: function () {
                    return this._counts;
                },
                enumerable: true,
                configurable: true
            });
            Counter.prototype.setEnabled = function (enabled) {
                this._enabled = enabled;
            };
            Counter.prototype.clear = function () {
                this._counts = Shumway.ObjectUtilities.createMap();
                this._times = Shumway.ObjectUtilities.createMap();
            };
            Counter.prototype.toJSON = function () {
                return {
                    counts: this._counts,
                    times: this._times
                };
            };
            Counter.prototype.count = function (name, increment, time) {
                if (increment === void 0) {
                    increment = 1;
                }
                if (time === void 0) {
                    time = 0;
                }
                if (!this._enabled) {
                    return;
                }
                if (this._counts[name] === undefined) {
                    this._counts[name] = 0;
                    this._times[name] = 0;
                }
                this._counts[name] += increment;
                this._times[name] += time;
                return this._counts[name];
            };
            Counter.prototype.trace = function (writer) {
                for (var name in this._counts) {
                    writer.writeLn(name + ': ' + this._counts[name]);
                }
            };
            Counter.prototype._pairToString = function (times, pair) {
                var name = pair[0];
                var count = pair[1];
                var time = times[name];
                var line = name + ': ' + count;
                if (time) {
                    line += ', ' + time.toFixed(4);
                    if (count > 1) {
                        line += ' (' + (time / count).toFixed(4) + ')';
                    }
                }
                return line;
            };
            Counter.prototype.toStringSorted = function () {
                var self = this;
                var times = this._times;
                var pairs = [];
                for (var name in this._counts) {
                    pairs.push([
                        name,
                        this._counts[name]
                    ]);
                }
                pairs.sort(function (a, b) {
                    return b[1] - a[1];
                });
                return pairs.map(function (pair) {
                    return self._pairToString(times, pair);
                }).join(', ');
            };
            Counter.prototype.traceSorted = function (writer, inline) {
                if (inline === void 0) {
                    inline = false;
                }
                var self = this;
                var times = this._times;
                var pairs = [];
                for (var name in this._counts) {
                    pairs.push([
                        name,
                        this._counts[name]
                    ]);
                }
                pairs.sort(function (a, b) {
                    return b[1] - a[1];
                });
                if (inline) {
                    writer.writeLn(pairs.map(function (pair) {
                        return self._pairToString(times, pair);
                    }).join(', '));
                } else {
                    pairs.forEach(function (pair) {
                        writer.writeLn(self._pairToString(times, pair));
                    });
                }
            };
            Counter.instance = new Counter(true);
            return Counter;
        }();
        Metrics.Counter = Counter;
        var Average = function () {
            function Average(max) {
                this._samples = new Float64Array(max);
                this._count = 0;
                this._index = 0;
            }
            Average.prototype.push = function (sample) {
                if (this._count < this._samples.length) {
                    this._count++;
                }
                this._index++;
                this._samples[this._index % this._samples.length] = sample;
            };
            Average.prototype.average = function () {
                var sum = 0;
                for (var i = 0; i < this._count; i++) {
                    sum += this._samples[i];
                }
                return sum / this._count;
            };
            return Average;
        }();
        Metrics.Average = Average;
    }(Metrics = Shumway.Metrics || (Shumway.Metrics = {})));
}(Shumway || (Shumway = {})));
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
var __extends = this && this.__extends || function (d, b) {
    for (var p in b)
        if (b.hasOwnProperty(p))
            d[p] = b[p];
    function __() {
        this.constructor = d;
    }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Shumway;
(function (Shumway) {
    var ArrayUtilities;
    (function (ArrayUtilities) {
        var InflateState;
        (function (InflateState) {
            InflateState[InflateState['INIT'] = 0] = 'INIT';
            InflateState[InflateState['BLOCK_0'] = 1] = 'BLOCK_0';
            InflateState[InflateState['BLOCK_1'] = 2] = 'BLOCK_1';
            InflateState[InflateState['BLOCK_2_PRE'] = 3] = 'BLOCK_2_PRE';
            InflateState[InflateState['BLOCK_2'] = 4] = 'BLOCK_2';
            InflateState[InflateState['DONE'] = 5] = 'DONE';
            InflateState[InflateState['ERROR'] = 6] = 'ERROR';
            InflateState[InflateState['VERIFY_HEADER'] = 7] = 'VERIFY_HEADER';
        }(InflateState || (InflateState = {})));
        var WINDOW_SIZE = 32768;
        var WINDOW_SHIFT_POSITION = 65536;
        var MAX_WINDOW_SIZE = WINDOW_SHIFT_POSITION + 258;
        /* plus max copy len */
        var Inflate = function () {
            function Inflate(verifyHeader) {
            }
            Inflate.prototype.push = function (data) {
                Shumway.Debug.abstractMethod('Inflate.push');
            };
            Inflate.prototype.close = function () {
            };
            Inflate.create = function (verifyHeader) {
                if (typeof ShumwayCom !== 'undefined' && ShumwayCom.createSpecialInflate) {
                    return new SpecialInflateAdapter(verifyHeader, ShumwayCom.createSpecialInflate);
                }
                return new BasicInflate(verifyHeader);
            };
            Inflate.prototype._processZLibHeader = function (buffer, start, end) {
                /* returns -1 - bad header, 0 - not enough data, 1+ - number of bytes processed */
                var ZLIB_HEADER_SIZE = 2;
                if (start + ZLIB_HEADER_SIZE > end) {
                    return 0;
                }
                var header = buffer[start] << 8 | buffer[start + 1];
                var error = null;
                if ((header & 3840) !== 2048) {
                    error = 'inflate: unknown compression method';
                } else if (header % 31 !== 0) {
                    error = 'inflate: bad FCHECK';
                } else if ((header & 32) !== 0) {
                    error = 'inflate: FDICT bit set';
                }
                if (error) {
                    if (this.onError) {
                        this.onError(error);
                    }
                    return -1;
                } else {
                    return ZLIB_HEADER_SIZE;
                }
            };
            Inflate.inflate = function (data, expectedLength, zlibHeader) {
                var output = new Uint8Array(expectedLength);
                var position = 0;
                var inflate = Inflate.create(zlibHeader);
                inflate.onData = function (data) {
                    // Make sure we don't cause an exception here when trying to set out-of-bound data by clamping the number of
                    // bytes to write to the remaining space in our output buffer. The Flash Player ignores data that goes over the
                    // expected length, so should we.
                    var length = Math.min(data.length, output.length - position);
                    if (length) {
                        ArrayUtilities.memCopy(output, data, position, 0, length);
                    }
                    position += length;
                };
                inflate.onError = function (error) {
                    throw new Error(error);
                };
                inflate.push(data);
                inflate.close();
                return output;
            };
            return Inflate;
        }();
        ArrayUtilities.Inflate = Inflate;
        var BasicInflate = function (_super) {
            __extends(BasicInflate, _super);
            function BasicInflate(verifyHeader) {
                _super.call(this, verifyHeader);
                this._buffer = null;
                this._bufferSize = 0;
                this._bufferPosition = 0;
                this._bitBuffer = 0;
                this._bitLength = 0;
                this._window = new Uint8Array(MAX_WINDOW_SIZE);
                this._windowPosition = 0;
                this._state = verifyHeader ? InflateState.VERIFY_HEADER : InflateState.INIT;
                this._isFinalBlock = false;
                this._literalTable = null;
                this._distanceTable = null;
                this._block0Read = 0;
                this._block2State = null;
                this._copyState = {
                    state: 0,
                    len: 0,
                    lenBits: 0,
                    dist: 0,
                    distBits: 0
                };
                if (!areTablesInitialized) {
                    initializeTables();
                    areTablesInitialized = true;
                }
            }
            BasicInflate.prototype.push = function (data) {
                if (!this._buffer || this._buffer.length < this._bufferSize + data.length) {
                    var newBuffer = new Uint8Array(this._bufferSize + data.length);
                    if (this._buffer) {
                        newBuffer.set(this._buffer);
                    }
                    this._buffer = newBuffer;
                }
                this._buffer.set(data, this._bufferSize);
                this._bufferSize += data.length;
                this._bufferPosition = 0;
                var incomplete = false;
                do {
                    var lastPosition = this._windowPosition;
                    if (this._state === InflateState.INIT) {
                        incomplete = this._decodeInitState();
                        if (incomplete) {
                            break;
                        }
                    }
                    switch (this._state) {
                    case InflateState.BLOCK_0:
                        incomplete = this._decodeBlock0();
                        break;
                    case InflateState.BLOCK_2_PRE:
                        incomplete = this._decodeBlock2Pre();
                        if (incomplete) {
                            break;
                        }
                    /* fall through */
                    case InflateState.BLOCK_1:
                    case InflateState.BLOCK_2:
                        incomplete = this._decodeBlock();
                        break;
                    case InflateState.ERROR:
                    case InflateState.DONE:
                        // skipping all data
                        this._bufferPosition = this._bufferSize;
                        break;
                    case InflateState.VERIFY_HEADER:
                        var processed = this._processZLibHeader(this._buffer, this._bufferPosition, this._bufferSize);
                        if (processed > 0) {
                            this._bufferPosition += processed;
                            this._state = InflateState.INIT;
                        } else if (processed === 0) {
                            incomplete = true;
                        } else {
                            this._state = InflateState.ERROR;
                        }
                        break;
                    }
                    var decoded = this._windowPosition - lastPosition;
                    if (decoded > 0) {
                        this.onData(this._window.subarray(lastPosition, this._windowPosition));
                    }
                    if (this._windowPosition >= WINDOW_SHIFT_POSITION) {
                        // shift window
                        if ('copyWithin' in this._buffer) {
                            this._window['copyWithin'](0, this._windowPosition - WINDOW_SIZE, this._windowPosition);
                        } else {
                            this._window.set(this._window.subarray(this._windowPosition - WINDOW_SIZE, this._windowPosition));
                        }
                        this._windowPosition = WINDOW_SIZE;
                    }
                } while (!incomplete && this._bufferPosition < this._bufferSize);
                if (this._bufferPosition < this._bufferSize) {
                    // shift buffer
                    if ('copyWithin' in this._buffer) {
                        this._buffer['copyWithin'](0, this._bufferPosition, this._bufferSize);
                    } else {
                        this._buffer.set(this._buffer.subarray(this._bufferPosition, this._bufferSize));
                    }
                    this._bufferSize -= this._bufferPosition;
                } else {
                    this._bufferSize = 0;
                }
            };
            BasicInflate.prototype._decodeInitState = function () {
                if (this._isFinalBlock) {
                    this._state = InflateState.DONE;
                    return false;
                }
                var buffer = this._buffer, bufferSize = this._bufferSize;
                var bitBuffer = this._bitBuffer, bitLength = this._bitLength;
                var state;
                var position = this._bufferPosition;
                if ((bufferSize - position << 3) + bitLength < 3) {
                    return true;
                }
                if (bitLength < 3) {
                    bitBuffer |= buffer[position++] << bitLength;
                    bitLength += 8;
                }
                var type = bitBuffer & 7;
                bitBuffer >>= 3;
                bitLength -= 3;
                switch (type >> 1) {
                case 0:
                    bitBuffer = 0;
                    bitLength = 0;
                    if (bufferSize - position < 4) {
                        return true;
                    }
                    var length = buffer[position] | buffer[position + 1] << 8;
                    var length2 = buffer[position + 2] | buffer[position + 3] << 8;
                    position += 4;
                    if ((length ^ length2) !== 65535) {
                        this._error('inflate: invalid block 0 length');
                        state = InflateState.ERROR;
                        break;
                    }
                    if (length === 0) {
                        state = InflateState.INIT;
                    } else {
                        this._block0Read = length;
                        state = InflateState.BLOCK_0;
                    }
                    break;
                case 1:
                    state = InflateState.BLOCK_1;
                    this._literalTable = fixedLiteralTable;
                    this._distanceTable = fixedDistanceTable;
                    break;
                case 2:
                    if ((bufferSize - position << 3) + bitLength < 14 + 3 * 4) {
                        return true;
                    }
                    while (bitLength < 14) {
                        bitBuffer |= buffer[position++] << bitLength;
                        bitLength += 8;
                    }
                    var numLengthCodes = (bitBuffer >> 10 & 15) + 4;
                    if ((bufferSize - position << 3) + bitLength < 14 + 3 * numLengthCodes) {
                        return true;
                    }
                    var block2State = {
                        numLiteralCodes: (bitBuffer & 31) + 257,
                        numDistanceCodes: (bitBuffer >> 5 & 31) + 1,
                        codeLengthTable: undefined,
                        bitLengths: undefined,
                        codesRead: 0,
                        dupBits: 0
                    };
                    bitBuffer >>= 14;
                    bitLength -= 14;
                    var codeLengths = new Uint8Array(19);
                    for (var i = 0; i < numLengthCodes; ++i) {
                        if (bitLength < 3) {
                            bitBuffer |= buffer[position++] << bitLength;
                            bitLength += 8;
                        }
                        codeLengths[codeLengthOrder[i]] = bitBuffer & 7;
                        bitBuffer >>= 3;
                        bitLength -= 3;
                    }
                    for (; i < 19; i++) {
                        codeLengths[codeLengthOrder[i]] = 0;
                    }
                    block2State.bitLengths = new Uint8Array(block2State.numLiteralCodes + block2State.numDistanceCodes);
                    block2State.codeLengthTable = makeHuffmanTable(codeLengths);
                    this._block2State = block2State;
                    state = InflateState.BLOCK_2_PRE;
                    break;
                default:
                    this._error('inflate: unsupported block type');
                    state = InflateState.ERROR;
                    return false;
                }
                this._isFinalBlock = !!(type & 1);
                this._state = state;
                this._bufferPosition = position;
                this._bitBuffer = bitBuffer;
                this._bitLength = bitLength;
                return false;
            };
            BasicInflate.prototype._error = function (e) {
                if (this.onError) {
                    this.onError(e);
                }
            };
            BasicInflate.prototype._decodeBlock0 = function () {
                var position = this._bufferPosition;
                var windowPosition = this._windowPosition;
                var toRead = this._block0Read;
                var leftInWindow = MAX_WINDOW_SIZE - windowPosition;
                var leftInBuffer = this._bufferSize - position;
                var incomplete = leftInBuffer < toRead;
                var canFit = Math.min(leftInWindow, leftInBuffer, toRead);
                this._window.set(this._buffer.subarray(position, position + canFit), windowPosition);
                this._windowPosition = windowPosition + canFit;
                this._bufferPosition = position + canFit;
                this._block0Read = toRead - canFit;
                if (toRead === canFit) {
                    this._state = InflateState.INIT;
                    return false;
                }
                return incomplete && leftInWindow < leftInBuffer;
            };
            BasicInflate.prototype._readBits = function (size) {
                var bitBuffer = this._bitBuffer;
                var bitLength = this._bitLength;
                if (size > bitLength) {
                    var pos = this._bufferPosition;
                    var end = this._bufferSize;
                    do {
                        if (pos >= end) {
                            this._bufferPosition = pos;
                            this._bitBuffer = bitBuffer;
                            this._bitLength = bitLength;
                            return -1;
                        }
                        bitBuffer |= this._buffer[pos++] << bitLength;
                        bitLength += 8;
                    } while (size > bitLength);
                    this._bufferPosition = pos;
                }
                this._bitBuffer = bitBuffer >> size;
                this._bitLength = bitLength - size;
                return bitBuffer & (1 << size) - 1;
            };
            BasicInflate.prototype._readCode = function (codeTable) {
                var bitBuffer = this._bitBuffer;
                var bitLength = this._bitLength;
                var maxBits = codeTable.maxBits;
                if (maxBits > bitLength) {
                    var pos = this._bufferPosition;
                    var end = this._bufferSize;
                    do {
                        if (pos >= end) {
                            this._bufferPosition = pos;
                            this._bitBuffer = bitBuffer;
                            this._bitLength = bitLength;
                            return -1;
                        }
                        bitBuffer |= this._buffer[pos++] << bitLength;
                        bitLength += 8;
                    } while (maxBits > bitLength);
                    this._bufferPosition = pos;
                }
                var code = codeTable.codes[bitBuffer & (1 << maxBits) - 1];
                var len = code >> 16;
                if (code & 32768) {
                    this._error('inflate: invalid encoding');
                    this._state = InflateState.ERROR;
                    return -1;
                }
                this._bitBuffer = bitBuffer >> len;
                this._bitLength = bitLength - len;
                return code & 65535;
            };
            BasicInflate.prototype._decodeBlock2Pre = function () {
                var block2State = this._block2State;
                var numCodes = block2State.numLiteralCodes + block2State.numDistanceCodes;
                var bitLengths = block2State.bitLengths;
                var i = block2State.codesRead;
                var prev = i > 0 ? bitLengths[i - 1] : 0;
                var codeLengthTable = block2State.codeLengthTable;
                var j;
                if (block2State.dupBits > 0) {
                    j = this._readBits(block2State.dupBits);
                    if (j < 0) {
                        return true;
                    }
                    while (j--) {
                        bitLengths[i++] = prev;
                    }
                    block2State.dupBits = 0;
                }
                while (i < numCodes) {
                    var sym = this._readCode(codeLengthTable);
                    if (sym < 0) {
                        block2State.codesRead = i;
                        return true;
                    } else if (sym < 16) {
                        bitLengths[i++] = prev = sym;
                        continue;
                    }
                    var j, dupBits;
                    switch (sym) {
                    case 16:
                        dupBits = 2;
                        j = 3;
                        sym = prev;
                        break;
                    case 17:
                        dupBits = 3;
                        j = 3;
                        sym = 0;
                        break;
                    case 18:
                        dupBits = 7;
                        j = 11;
                        sym = 0;
                        break;
                    }
                    while (j--) {
                        bitLengths[i++] = sym;
                    }
                    j = this._readBits(dupBits);
                    if (j < 0) {
                        block2State.codesRead = i;
                        block2State.dupBits = dupBits;
                        return true;
                    }
                    while (j--) {
                        bitLengths[i++] = sym;
                    }
                    prev = sym;
                }
                this._literalTable = makeHuffmanTable(bitLengths.subarray(0, block2State.numLiteralCodes));
                this._distanceTable = makeHuffmanTable(bitLengths.subarray(block2State.numLiteralCodes));
                this._state = InflateState.BLOCK_2;
                this._block2State = null;
                return false;
            };
            BasicInflate.prototype._decodeBlock = function () {
                var literalTable = this._literalTable, distanceTable = this._distanceTable;
                var output = this._window, pos = this._windowPosition;
                var copyState = this._copyState;
                var i, j, sym;
                var len, lenBits, dist, distBits;
                if (copyState.state !== 0) {
                    // continuing len/distance operation
                    switch (copyState.state) {
                    case 1:
                        j = 0;
                        if ((j = this._readBits(copyState.lenBits)) < 0) {
                            return true;
                        }
                        copyState.len += j;
                        copyState.state = 2;
                    /* fall through */
                    case 2:
                        if ((sym = this._readCode(distanceTable)) < 0) {
                            return true;
                        }
                        copyState.distBits = distanceExtraBits[sym];
                        copyState.dist = distanceCodes[sym];
                        copyState.state = 3;
                    /* fall through */
                    case 3:
                        j = 0;
                        if (copyState.distBits > 0 && (j = this._readBits(copyState.distBits)) < 0) {
                            return true;
                        }
                        dist = copyState.dist + j;
                        len = copyState.len;
                        i = pos - dist;
                        while (len--) {
                            output[pos++] = output[i++];
                        }
                        copyState.state = 0;
                        if (pos >= WINDOW_SHIFT_POSITION) {
                            this._windowPosition = pos;
                            return false;
                        }
                        break;
                    }
                }
                do {
                    sym = this._readCode(literalTable);
                    if (sym < 0) {
                        this._windowPosition = pos;
                        return true;
                    } else if (sym < 256) {
                        output[pos++] = sym;
                    } else if (sym > 256) {
                        this._windowPosition = pos;
                        sym -= 257;
                        lenBits = lengthExtraBits[sym];
                        len = lengthCodes[sym];
                        j = lenBits === 0 ? 0 : this._readBits(lenBits);
                        if (j < 0) {
                            copyState.state = 1;
                            copyState.len = len;
                            copyState.lenBits = lenBits;
                            return true;
                        }
                        len += j;
                        sym = this._readCode(distanceTable);
                        if (sym < 0) {
                            copyState.state = 2;
                            copyState.len = len;
                            return true;
                        }
                        distBits = distanceExtraBits[sym];
                        dist = distanceCodes[sym];
                        j = distBits === 0 ? 0 : this._readBits(distBits);
                        if (j < 0) {
                            copyState.state = 3;
                            copyState.len = len;
                            copyState.dist = dist;
                            copyState.distBits = distBits;
                            return true;
                        }
                        dist += j;
                        i = pos - dist;
                        while (len--) {
                            output[pos++] = output[i++];
                        }
                    } else {
                        this._state = InflateState.INIT;
                        break;    // end of block
                    }
                } while (pos < WINDOW_SHIFT_POSITION);
                this._windowPosition = pos;
                return false;
            };
            return BasicInflate;
        }(Inflate);
        var codeLengthOrder;
        var distanceCodes;
        var distanceExtraBits;
        var fixedDistanceTable;
        var lengthCodes;
        var lengthExtraBits;
        var fixedLiteralTable;
        var areTablesInitialized = false;
        function initializeTables() {
            codeLengthOrder = new Uint8Array([
                16,
                17,
                18,
                0,
                8,
                7,
                9,
                6,
                10,
                5,
                11,
                4,
                12,
                3,
                13,
                2,
                14,
                1,
                15
            ]);
            distanceCodes = new Uint16Array(30);
            distanceExtraBits = new Uint8Array(30);
            for (var i = 0, j = 0, code = 1; i < 30; ++i) {
                distanceCodes[i] = code;
                code += 1 << (distanceExtraBits[i] = ~~((j += i > 2 ? 1 : 0) / 2));
            }
            var bitLengths = new Uint8Array(288);
            for (var i = 0; i < 32; ++i) {
                bitLengths[i] = 5;
            }
            fixedDistanceTable = makeHuffmanTable(bitLengths.subarray(0, 32));
            lengthCodes = new Uint16Array(29);
            lengthExtraBits = new Uint8Array(29);
            for (var i = 0, j = 0, code = 3; i < 29; ++i) {
                lengthCodes[i] = code - (i == 28 ? 1 : 0);
                code += 1 << (lengthExtraBits[i] = ~~((j += i > 4 ? 1 : 0) / 4 % 6));
            }
            for (var i = 0; i < 288; ++i) {
                bitLengths[i] = i < 144 || i > 279 ? 8 : i < 256 ? 9 : 7;
            }
            fixedLiteralTable = makeHuffmanTable(bitLengths);
        }
        function makeHuffmanTable(bitLengths) {
            var maxBits = Math.max.apply(null, bitLengths);
            var numLengths = bitLengths.length;
            var size = 1 << maxBits;
            var codes = new Uint32Array(size);
            // avoiding len == 0: using max number of bits
            var dummyCode = maxBits << 16 | 65535;
            for (var j = 0; j < size; j++) {
                codes[j] = dummyCode;
            }
            for (var code = 0, len = 1, skip = 2; len <= maxBits; code <<= 1, ++len, skip <<= 1) {
                for (var val = 0; val < numLengths; ++val) {
                    if (bitLengths[val] === len) {
                        var lsb = 0;
                        for (var i = 0; i < len; ++i)
                            lsb = lsb * 2 + (code >> i & 1);
                        for (var i = lsb; i < size; i += skip)
                            codes[i] = len << 16 | val;
                        ++code;
                    }
                }
            }
            return {
                codes: codes,
                maxBits: maxBits
            };
        }
        var SpecialInflateAdapter = function (_super) {
            __extends(SpecialInflateAdapter, _super);
            function SpecialInflateAdapter(verifyHeader, createSpecialInflate) {
                _super.call(this, verifyHeader);
                this._verifyHeader = verifyHeader;
                this._specialInflate = createSpecialInflate();
                this._specialInflate.setDataCallback(function (data) {
                    this.onData(data);
                }.bind(this));
            }
            SpecialInflateAdapter.prototype.push = function (data) {
                if (this._verifyHeader) {
                    var buffer;
                    if (this._buffer) {
                        buffer = new Uint8Array(this._buffer.length + data.length);
                        buffer.set(this._buffer);
                        buffer.set(data, this._buffer.length);
                        this._buffer = null;
                    } else {
                        buffer = new Uint8Array(data);
                    }
                    var processed = this._processZLibHeader(buffer, 0, buffer.length);
                    if (processed === 0) {
                        this._buffer = buffer;
                        return;
                    }
                    this._verifyHeader = true;
                    if (processed > 0) {
                        data = buffer.subarray(processed);
                    }
                }
                this._specialInflate.push(data);
            };
            SpecialInflateAdapter.prototype.close = function () {
                if (this._specialInflate) {
                    this._specialInflate.close();
                    this._specialInflate = null;
                }
            };
            return SpecialInflateAdapter;
        }(Inflate);
        var DeflateState;
        (function (DeflateState) {
            DeflateState[DeflateState['WRITE'] = 0] = 'WRITE';
            DeflateState[DeflateState['DONE'] = 1] = 'DONE';
            DeflateState[DeflateState['ZLIB_HEADER'] = 2] = 'ZLIB_HEADER';
        }(DeflateState || (DeflateState = {})));
        var Adler32 = function () {
            function Adler32() {
                this.a = 1;
                this.b = 0;
            }
            Adler32.prototype.update = function (data, start, end) {
                var a = this.a;
                var b = this.b;
                for (var i = start; i < end; ++i) {
                    a = (a + (data[i] & 255)) % 65521;
                    b = (b + a) % 65521;
                }
                this.a = a;
                this.b = b;
            };
            Adler32.prototype.getChecksum = function () {
                return this.b << 16 | this.a;
            };
            return Adler32;
        }();
        ArrayUtilities.Adler32 = Adler32;
        var Deflate = function () {
            function Deflate(writeZlibHeader) {
                this._writeZlibHeader = writeZlibHeader;
                this._state = writeZlibHeader ? DeflateState.ZLIB_HEADER : DeflateState.WRITE;
                this._adler32 = writeZlibHeader ? new Adler32() : null;
            }
            Deflate.prototype.push = function (data) {
                if (this._state === DeflateState.ZLIB_HEADER) {
                    this.onData(new Uint8Array([
                        120,
                        156
                    ]));
                    this._state = DeflateState.WRITE;
                }
                // simple non-compressing algorithm for now
                var len = data.length;
                var outputSize = len + Math.ceil(len / 65535) * 5;
                var output = new Uint8Array(outputSize);
                var outputPos = 0;
                var pos = 0;
                while (len > 65535) {
                    output.set(new Uint8Array([
                        0,
                        255,
                        255,
                        0,
                        0
                    ]), outputPos);
                    outputPos += 5;
                    output.set(data.subarray(pos, pos + 65535), outputPos);
                    pos += 65535;
                    outputPos += 65535;
                    len -= 65535;
                }
                output.set(new Uint8Array([
                    0,
                    len & 255,
                    len >> 8 & 255,
                    ~len & 255,
                    ~len >> 8 & 255
                ]), outputPos);
                outputPos += 5;
                output.set(data.subarray(pos, len), outputPos);
                this.onData(output);
                if (this._adler32) {
                    this._adler32.update(data, 0, len);
                }
            };
            Deflate.prototype.close = function () {
                this._state = DeflateState.DONE;
                this.onData(new Uint8Array([
                    1,
                    0,
                    0,
                    255,
                    255
                ]));
                if (this._adler32) {
                    var checksum = this._adler32.getChecksum();
                    this.onData(new Uint8Array([
                        checksum & 255,
                        checksum >> 8 & 255,
                        checksum >> 16 & 255,
                        checksum >>> 24 & 255
                    ]));
                }
            };
            return Deflate;
        }();
        ArrayUtilities.Deflate = Deflate;
        var InputStream = function () {
            function InputStream() {
                this.available = 0;
                this.pos = 0;
                this.buffer = new Uint8Array(2000);
            }
            InputStream.prototype.append = function (data) {
                var length = this.pos + this.available;
                var needLength = length + data.length;
                if (needLength > this.buffer.length) {
                    var newLength = this.buffer.length * 2;
                    while (newLength < needLength) {
                        newLength *= 2;
                    }
                    var newBuffer = new Uint8Array(newLength);
                    newBuffer.set(this.buffer);
                    this.buffer = newBuffer;
                }
                this.buffer.set(data, length);
                this.available += data.length;
            };
            InputStream.prototype.compact = function () {
                if (this.available === 0) {
                    return;
                }
                this.buffer.set(this.buffer.subarray(this.pos, this.pos + this.available), 0);
                this.pos = 0;
            };
            InputStream.prototype.readByte = function () {
                if (this.available <= 0) {
                    throw new Error('Unexpected end of file');
                }
                this.available--;
                return this.buffer[this.pos++];
            };
            return InputStream;
        }();
        var OutputStream = function () {
            function OutputStream(onData) {
                this.onData = onData;
                this.processed = 0;
            }
            OutputStream.prototype.writeBytes = function (data) {
                this.onData.call(null, data);
                this.processed += data.length;
            };
            return OutputStream;
        }();
        var OutWindow = function () {
            function OutWindow(outStream) {
                this.outStream = outStream;
                this.buf = null;
                this.pos = 0;
                this.size = 0;
                this.isFull = false;
                this.writePos = 0;
                this.totalPos = 0;
            }
            OutWindow.prototype.create = function (dictSize) {
                this.buf = new Uint8Array(dictSize);
                this.pos = 0;
                this.size = dictSize;
                this.isFull = false;
                this.writePos = 0;
                this.totalPos = 0;
            };
            OutWindow.prototype.putByte = function (b) {
                this.totalPos++;
                this.buf[this.pos++] = b;
                if (this.pos === this.size) {
                    this.flush();
                    this.pos = 0;
                    this.isFull = true;
                }
            };
            OutWindow.prototype.getByte = function (dist) {
                return this.buf[dist <= this.pos ? this.pos - dist : this.size - dist + this.pos];
            };
            OutWindow.prototype.flush = function () {
                if (this.writePos < this.pos) {
                    this.outStream.writeBytes(this.buf.subarray(this.writePos, this.pos));
                    this.writePos = this.pos === this.size ? 0 : this.pos;
                }
            };
            OutWindow.prototype.copyMatch = function (dist, len) {
                var pos = this.pos;
                var size = this.size;
                var buffer = this.buf;
                var getPos = dist <= pos ? pos - dist : size - dist + pos;
                var left = len;
                while (left > 0) {
                    var chunk = Math.min(Math.min(left, size - pos), size - getPos);
                    for (var i = 0; i < chunk; i++) {
                        var b = buffer[getPos++];
                        buffer[pos++] = b;
                    }
                    if (pos === size) {
                        this.pos = pos;
                        this.flush();
                        pos = 0;
                        this.isFull = true;
                    }
                    if (getPos === size) {
                        getPos = 0;
                    }
                    left -= chunk;
                }
                this.pos = pos;
                this.totalPos += len;
            };
            OutWindow.prototype.checkDistance = function (dist) {
                return dist <= this.pos || this.isFull;
            };
            OutWindow.prototype.isEmpty = function () {
                return this.pos === 0 && !this.isFull;
            };
            return OutWindow;
        }();
        var kNumBitModelTotalBits = 11;
        var kNumMoveBits = 5;
        var PROB_INIT_VAL = 1 << kNumBitModelTotalBits >> 1;
        function createProbsArray(length) {
            var p = new Uint16Array(length);
            for (var i = 0; i < length; i++) {
                p[i] = PROB_INIT_VAL;
            }
            return p;
        }
        var kTopValue = 1 << 24;
        var RangeDecoder = function () {
            function RangeDecoder(inStream) {
                this.inStream = inStream;
                this.range = 0;
                this.code = 0;
                this.corrupted = false;
            }
            RangeDecoder.prototype.init = function () {
                if (this.inStream.readByte() !== 0) {
                    this.corrupted = true;
                }
                this.range = 4294967295 | 0;
                var code = 0;
                for (var i = 0; i < 4; i++) {
                    code = code << 8 | this.inStream.readByte();
                }
                if (code === this.range) {
                    this.corrupted = true;
                }
                this.code = code;
            };
            RangeDecoder.prototype.isFinishedOK = function () {
                return this.code === 0;
            };
            RangeDecoder.prototype.decodeDirectBits = function (numBits) {
                var res = 0;
                var range = this.range;
                var code = this.code;
                do {
                    range = range >>> 1 | 0;
                    code = code - range | 0;
                    var t = code >> 31;
                    // if high bit set -1, otherwise 0
                    code = code + (range & t) | 0;
                    if (code === range) {
                        this.corrupted = true;
                    }
                    if (range >= 0 && range < kTopValue) {
                        range = range << 8;
                        code = code << 8 | this.inStream.readByte();
                    }
                    res = (res << 1) + t + 1 | 0;
                } while (--numBits);
                this.range = range;
                this.code = code;
                return res;
            };
            RangeDecoder.prototype.decodeBit = function (prob, index) {
                var range = this.range;
                var code = this.code;
                var v = prob[index];
                var bound = (range >>> kNumBitModelTotalBits) * v;
                // keep unsigned
                var symbol;
                if (code >>> 0 < bound) {
                    v = v + ((1 << kNumBitModelTotalBits) - v >> kNumMoveBits) | 0;
                    range = bound | 0;
                    symbol = 0;
                } else {
                    v = v - (v >> kNumMoveBits) | 0;
                    code = code - bound | 0;
                    range = range - bound | 0;
                    symbol = 1;
                }
                prob[index] = v & 65535;
                if (range >= 0 && range < kTopValue) {
                    range = range << 8;
                    code = code << 8 | this.inStream.readByte();
                }
                this.range = range;
                this.code = code;
                return symbol;
            };
            return RangeDecoder;
        }();
        function bitTreeReverseDecode(probs, offset, numBits, rc) {
            var m = 1;
            var symbol = 0;
            for (var i = 0; i < numBits; i++) {
                var bit = rc.decodeBit(probs, m + offset);
                m = (m << 1) + bit;
                symbol |= bit << i;
            }
            return symbol;
        }
        var BitTreeDecoder = function () {
            function BitTreeDecoder(numBits) {
                this.numBits = numBits;
                this.probs = createProbsArray(1 << numBits);
            }
            BitTreeDecoder.prototype.decode = function (rc) {
                var m = 1;
                for (var i = 0; i < this.numBits; i++) {
                    m = (m << 1) + rc.decodeBit(this.probs, m);
                }
                return m - (1 << this.numBits);
            };
            BitTreeDecoder.prototype.reverseDecode = function (rc) {
                return bitTreeReverseDecode(this.probs, 0, this.numBits, rc);
            };
            return BitTreeDecoder;
        }();
        function createBitTreeDecoderArray(numBits, length) {
            var p = [];
            p.length = length;
            for (var i = 0; i < length; i++) {
                p[i] = new BitTreeDecoder(numBits);
            }
            return p;
        }
        var kNumPosBitsMax = 4;
        var kNumStates = 12;
        var kNumLenToPosStates = 4;
        var kNumAlignBits = 4;
        var kStartPosModelIndex = 4;
        var kEndPosModelIndex = 14;
        var kNumFullDistances = 1 << (kEndPosModelIndex >> 1);
        var kMatchMinLen = 2;
        var LenDecoder = function () {
            function LenDecoder() {
                this.choice = createProbsArray(2);
                this.lowCoder = createBitTreeDecoderArray(3, 1 << kNumPosBitsMax);
                this.midCoder = createBitTreeDecoderArray(3, 1 << kNumPosBitsMax);
                this.highCoder = new BitTreeDecoder(8);
            }
            LenDecoder.prototype.decode = function (rc, posState) {
                if (rc.decodeBit(this.choice, 0) === 0) {
                    return this.lowCoder[posState].decode(rc);
                }
                if (rc.decodeBit(this.choice, 1) === 0) {
                    return 8 + this.midCoder[posState].decode(rc);
                }
                return 16 + this.highCoder.decode(rc);
            };
            return LenDecoder;
        }();
        function updateState_Literal(state) {
            if (state < 4) {
                return 0;
            } else if (state < 10) {
                return state - 3;
            } else {
                return state - 6;
            }
        }
        function updateState_Match(state) {
            return state < 7 ? 7 : 10;
        }
        function updateState_Rep(state) {
            return state < 7 ? 8 : 11;
        }
        function updateState_ShortRep(state) {
            return state < 7 ? 9 : 11;
        }
        var LZMA_DIC_MIN = 1 << 12;
        var MAX_DECODE_BITS_CALLS = 48;
        var LzmaDecoderInternal = function () {
            function LzmaDecoderInternal(inStream, outStream) {
                this.rangeDec = new RangeDecoder(inStream);
                this.outWindow = new OutWindow(outStream);
                this.markerIsMandatory = false;
                this.lc = 0;
                this.pb = 0;
                this.lp = 0;
                this.dictSize = 0;
                this.dictSizeInProperties = 0;
                this.unpackSize = undefined;
                this.leftToUnpack = undefined;
                this.reps = new Int32Array(4);
                this.state = 0;
            }
            LzmaDecoderInternal.prototype.decodeProperties = function (properties) {
                var d = properties[0];
                if (d >= 9 * 5 * 5) {
                    throw new Error('Incorrect LZMA properties');
                }
                this.lc = d % 9;
                d = d / 9 | 0;
                this.pb = d / 5 | 0;
                this.lp = d % 5;
                this.dictSizeInProperties = 0;
                for (var i = 0; i < 4; i++) {
                    this.dictSizeInProperties |= properties[i + 1] << 8 * i;
                }
                this.dictSize = this.dictSizeInProperties;
                if (this.dictSize < LZMA_DIC_MIN) {
                    this.dictSize = LZMA_DIC_MIN;
                }
            };
            LzmaDecoderInternal.prototype.create = function () {
                this.outWindow.create(this.dictSize);
                this.init();
                this.rangeDec.init();
                this.reps[0] = 0;
                this.reps[1] = 0;
                this.reps[2] = 0;
                this.reps[3] = 0;
                this.state = 0;
                this.leftToUnpack = this.unpackSize;
            };
            LzmaDecoderInternal.prototype.decodeLiteral = function (state, rep0) {
                var outWindow = this.outWindow;
                var rangeDec = this.rangeDec;
                var prevByte = 0;
                if (!outWindow.isEmpty()) {
                    prevByte = outWindow.getByte(1);
                }
                var symbol = 1;
                var litState = ((outWindow.totalPos & (1 << this.lp) - 1) << this.lc) + (prevByte >> 8 - this.lc);
                var probsIndex = 768 * litState;
                if (state >= 7) {
                    var matchByte = outWindow.getByte(rep0 + 1);
                    do {
                        var matchBit = matchByte >> 7 & 1;
                        matchByte <<= 1;
                        var bit = rangeDec.decodeBit(this.litProbs, probsIndex + ((1 + matchBit << 8) + symbol));
                        symbol = symbol << 1 | bit;
                        if (matchBit !== bit) {
                            break;
                        }
                    } while (symbol < 256);
                }
                while (symbol < 256) {
                    symbol = symbol << 1 | rangeDec.decodeBit(this.litProbs, probsIndex + symbol);
                }
                return symbol - 256 & 255;
            };
            LzmaDecoderInternal.prototype.decodeDistance = function (len) {
                var lenState = len;
                if (lenState > kNumLenToPosStates - 1) {
                    lenState = kNumLenToPosStates - 1;
                }
                var rangeDec = this.rangeDec;
                var posSlot = this.posSlotDecoder[lenState].decode(rangeDec);
                if (posSlot < 4) {
                    return posSlot;
                }
                var numDirectBits = (posSlot >> 1) - 1;
                var dist = (2 | posSlot & 1) << numDirectBits;
                if (posSlot < kEndPosModelIndex) {
                    dist = dist + bitTreeReverseDecode(this.posDecoders, dist - posSlot, numDirectBits, rangeDec) | 0;
                } else {
                    dist = dist + (rangeDec.decodeDirectBits(numDirectBits - kNumAlignBits) << kNumAlignBits) | 0;
                    dist = dist + this.alignDecoder.reverseDecode(rangeDec) | 0;
                }
                return dist;
            };
            LzmaDecoderInternal.prototype.init = function () {
                this.litProbs = createProbsArray(768 << this.lc + this.lp);
                this.posSlotDecoder = createBitTreeDecoderArray(6, kNumLenToPosStates);
                this.alignDecoder = new BitTreeDecoder(kNumAlignBits);
                this.posDecoders = createProbsArray(1 + kNumFullDistances - kEndPosModelIndex);
                this.isMatch = createProbsArray(kNumStates << kNumPosBitsMax);
                this.isRep = createProbsArray(kNumStates);
                this.isRepG0 = createProbsArray(kNumStates);
                this.isRepG1 = createProbsArray(kNumStates);
                this.isRepG2 = createProbsArray(kNumStates);
                this.isRep0Long = createProbsArray(kNumStates << kNumPosBitsMax);
                this.lenDecoder = new LenDecoder();
                this.repLenDecoder = new LenDecoder();
            };
            LzmaDecoderInternal.prototype.decode = function (notFinal) {
                var rangeDec = this.rangeDec;
                var outWindow = this.outWindow;
                var pb = this.pb;
                var dictSize = this.dictSize;
                var markerIsMandatory = this.markerIsMandatory;
                var leftToUnpack = this.leftToUnpack;
                var isMatch = this.isMatch;
                var isRep = this.isRep;
                var isRepG0 = this.isRepG0;
                var isRepG1 = this.isRepG1;
                var isRepG2 = this.isRepG2;
                var isRep0Long = this.isRep0Long;
                var lenDecoder = this.lenDecoder;
                var repLenDecoder = this.repLenDecoder;
                var rep0 = this.reps[0];
                var rep1 = this.reps[1];
                var rep2 = this.reps[2];
                var rep3 = this.reps[3];
                var state = this.state;
                while (true) {
                    // Based on worse case scenario one byte consumed per decodeBit calls,
                    // reserving keeping some amount of bytes in the input stream for
                    // non-final data blocks.
                    if (notFinal && rangeDec.inStream.available < MAX_DECODE_BITS_CALLS) {
                        this.outWindow.flush();
                        break;
                    }
                    if (leftToUnpack === 0 && !markerIsMandatory) {
                        this.outWindow.flush();
                        if (rangeDec.isFinishedOK()) {
                            return LZMA_RES_FINISHED_WITHOUT_MARKER;
                        }
                    }
                    var posState = outWindow.totalPos & (1 << pb) - 1;
                    if (rangeDec.decodeBit(isMatch, (state << kNumPosBitsMax) + posState) === 0) {
                        if (leftToUnpack === 0) {
                            return LZMA_RES_ERROR;
                        }
                        outWindow.putByte(this.decodeLiteral(state, rep0));
                        state = updateState_Literal(state);
                        leftToUnpack--;
                        continue;
                    }
                    var len;
                    if (rangeDec.decodeBit(isRep, state) !== 0) {
                        if (leftToUnpack === 0) {
                            return LZMA_RES_ERROR;
                        }
                        if (outWindow.isEmpty()) {
                            return LZMA_RES_ERROR;
                        }
                        if (rangeDec.decodeBit(isRepG0, state) === 0) {
                            if (rangeDec.decodeBit(isRep0Long, (state << kNumPosBitsMax) + posState) === 0) {
                                state = updateState_ShortRep(state);
                                outWindow.putByte(outWindow.getByte(rep0 + 1));
                                leftToUnpack--;
                                continue;
                            }
                        } else {
                            var dist;
                            if (rangeDec.decodeBit(isRepG1, state) === 0) {
                                dist = rep1;
                            } else {
                                if (rangeDec.decodeBit(isRepG2, state) === 0) {
                                    dist = rep2;
                                } else {
                                    dist = rep3;
                                    rep3 = rep2;
                                }
                                rep2 = rep1;
                            }
                            rep1 = rep0;
                            rep0 = dist;
                        }
                        len = repLenDecoder.decode(rangeDec, posState);
                        state = updateState_Rep(state);
                    } else {
                        rep3 = rep2;
                        rep2 = rep1;
                        rep1 = rep0;
                        len = lenDecoder.decode(rangeDec, posState);
                        state = updateState_Match(state);
                        rep0 = this.decodeDistance(len);
                        if (rep0 === -1) {
                            this.outWindow.flush();
                            return rangeDec.isFinishedOK() ? LZMA_RES_FINISHED_WITH_MARKER : LZMA_RES_ERROR;
                        }
                        if (leftToUnpack === 0) {
                            return LZMA_RES_ERROR;
                        }
                        if (rep0 >= dictSize || !outWindow.checkDistance(rep0)) {
                            return LZMA_RES_ERROR;
                        }
                    }
                    len += kMatchMinLen;
                    var isError = false;
                    if (leftToUnpack !== undefined && leftToUnpack < len) {
                        len = leftToUnpack;
                        isError = true;
                    }
                    outWindow.copyMatch(rep0 + 1, len);
                    leftToUnpack -= len;
                    if (isError) {
                        return LZMA_RES_ERROR;
                    }
                }
                this.state = state;
                this.reps[0] = rep0;
                this.reps[1] = rep1;
                this.reps[2] = rep2;
                this.reps[3] = rep3;
                this.leftToUnpack = leftToUnpack;
                return LZMA_RES_NOT_COMPLETE;
            };
            LzmaDecoderInternal.prototype.flushOutput = function () {
                this.outWindow.flush();
            };
            return LzmaDecoderInternal;
        }();
        var LZMA_RES_ERROR = 0;
        var LZMA_RES_FINISHED_WITH_MARKER = 1;
        var LZMA_RES_FINISHED_WITHOUT_MARKER = 2;
        var LZMA_RES_NOT_COMPLETE = 3;
        var SWF_LZMA_HEADER_LENGTH = 17;
        var STANDARD_LZMA_HEADER_LENGTH = 13;
        var EXTRA_LZMA_BYTES_NEEDED = 5;
        var LzmaDecoderState;
        (function (LzmaDecoderState) {
            LzmaDecoderState[LzmaDecoderState['WAIT_FOR_LZMA_HEADER'] = 0] = 'WAIT_FOR_LZMA_HEADER';
            LzmaDecoderState[LzmaDecoderState['WAIT_FOR_SWF_HEADER'] = 1] = 'WAIT_FOR_SWF_HEADER';
            LzmaDecoderState[LzmaDecoderState['PROCESS_DATA'] = 2] = 'PROCESS_DATA';
            LzmaDecoderState[LzmaDecoderState['CLOSED'] = 3] = 'CLOSED';
            LzmaDecoderState[LzmaDecoderState['ERROR'] = 4] = 'ERROR';
        }(LzmaDecoderState || (LzmaDecoderState = {})));
        var LzmaDecoder = function () {
            function LzmaDecoder(swfHeader) {
                if (swfHeader === void 0) {
                    swfHeader = false;
                }
                this._state = swfHeader ? LzmaDecoderState.WAIT_FOR_SWF_HEADER : LzmaDecoderState.WAIT_FOR_LZMA_HEADER;
                this.buffer = null;
            }
            LzmaDecoder.prototype.push = function (data) {
                if (this._state < LzmaDecoderState.PROCESS_DATA) {
                    var buffered = this.buffer ? this.buffer.length : 0;
                    var headerBytesExpected = (this._state === LzmaDecoderState.WAIT_FOR_SWF_HEADER ? SWF_LZMA_HEADER_LENGTH : STANDARD_LZMA_HEADER_LENGTH) + EXTRA_LZMA_BYTES_NEEDED;
                    if (buffered + data.length < headerBytesExpected) {
                        var newBuffer = new Uint8Array(buffered + data.length);
                        if (buffered > 0) {
                            newBuffer.set(this.buffer);
                        }
                        newBuffer.set(data, buffered);
                        this.buffer = newBuffer;
                        return;
                    }
                    var header = new Uint8Array(headerBytesExpected);
                    if (buffered > 0) {
                        header.set(this.buffer);
                    }
                    header.set(data.subarray(0, headerBytesExpected - buffered), buffered);
                    this._inStream = new InputStream();
                    this._inStream.append(header.subarray(headerBytesExpected - EXTRA_LZMA_BYTES_NEEDED));
                    this._outStream = new OutputStream(function (data) {
                        this.onData.call(null, data);
                    }.bind(this));
                    this._decoder = new LzmaDecoderInternal(this._inStream, this._outStream);
                    // See http://helpx.adobe.com/flash-player/kb/exception-thrown-you-decompress-lzma-compressed.html
                    if (this._state === LzmaDecoderState.WAIT_FOR_SWF_HEADER) {
                        this._decoder.decodeProperties(header.subarray(12, 17));
                        this._decoder.markerIsMandatory = false;
                        this._decoder.unpackSize = ((header[4] | header[5] << 8 | header[6] << 16 | header[7] << 24) >>> 0) - 8;
                    } else {
                        this._decoder.decodeProperties(header.subarray(0, 5));
                        var unpackSize = 0;
                        var unpackSizeDefined = false;
                        for (var i = 0; i < 8; i++) {
                            var b = header[5 + i];
                            if (b !== 255) {
                                unpackSizeDefined = true;
                            }
                            unpackSize |= b << 8 * i;
                        }
                        this._decoder.markerIsMandatory = !unpackSizeDefined;
                        this._decoder.unpackSize = unpackSizeDefined ? unpackSize : undefined;
                    }
                    this._decoder.create();
                    data = data.subarray(headerBytesExpected);
                    this._state = LzmaDecoderState.PROCESS_DATA;
                } else if (this._state !== LzmaDecoderState.PROCESS_DATA) {
                    return;
                }
                try {
                    this._inStream.append(data);
                    var res = this._decoder.decode(true);
                    this._inStream.compact();
                    if (res !== LZMA_RES_NOT_COMPLETE) {
                        this._checkError(res);
                    }
                } catch (e) {
                    this._decoder.flushOutput();
                    this._decoder = null;
                    this._error(e);
                }
            };
            LzmaDecoder.prototype.close = function () {
                if (this._state !== LzmaDecoderState.PROCESS_DATA) {
                    return;
                }
                this._state = LzmaDecoderState.CLOSED;
                try {
                    var res = this._decoder.decode(false);
                    this._checkError(res);
                } catch (e) {
                    this._decoder.flushOutput();
                    this._error(e);
                }
                this._decoder = null;
            };
            LzmaDecoder.prototype._error = function (error) {
                // Stopping processing any data if an error occurs.
                this._state = LzmaDecoderState.ERROR;
                if (this.onError) {
                    this.onError(error);
                }
            };
            LzmaDecoder.prototype._checkError = function (res) {
                var error;
                if (res === LZMA_RES_ERROR) {
                    error = 'LZMA decoding error';
                } else if (res === LZMA_RES_NOT_COMPLETE) {
                    error = 'Decoding is not complete';
                } else if (res === LZMA_RES_FINISHED_WITH_MARKER) {
                    if (this._decoder.unpackSize !== undefined && this._decoder.unpackSize !== this._outStream.processed) {
                        error = 'Finished with end marker before than specified size';
                    }
                } else {
                    error = 'Internal LZMA Error';
                }
                if (error) {
                    this._error(error);
                }
            };
            return LzmaDecoder;
        }();
        ArrayUtilities.LzmaDecoder = LzmaDecoder;
        var notImplemented = Shumway.Debug.notImplemented;
        var assert = Shumway.Debug.assert;
        var utf8decode = Shumway.StringUtilities.utf8decode;
        var utf8encode = Shumway.StringUtilities.utf8encode;
        var clamp = Shumway.NumberUtilities.clamp;
        function axCoerceString(x) {
            if (typeof x === 'string') {
                return x;
            } else if (x == undefined) {
                return null;
            }
            return x + '';
        }
        var PlainObjectDataBuffer = function () {
            function PlainObjectDataBuffer(buffer, length, littleEndian) {
                this.buffer = buffer;
                this.length = length;
                this.littleEndian = littleEndian;
            }
            return PlainObjectDataBuffer;
        }();
        ArrayUtilities.PlainObjectDataBuffer = PlainObjectDataBuffer;
        var bitMasks = new Uint32Array(33);
        for (var i = 1, mask = 0; i <= 32; i++) {
            bitMasks[i] = mask = mask << 1 | 1;
        }
        var TypedArrayViewFlags;
        (function (TypedArrayViewFlags) {
            TypedArrayViewFlags[TypedArrayViewFlags['U8'] = 1] = 'U8';
            TypedArrayViewFlags[TypedArrayViewFlags['I32'] = 2] = 'I32';
            TypedArrayViewFlags[TypedArrayViewFlags['F32'] = 4] = 'F32';
        }(TypedArrayViewFlags || (TypedArrayViewFlags = {})));
        var DataBuffer = function () {
            function DataBuffer(initialSize) {
                if (initialSize === void 0) {
                    initialSize = DataBuffer.INITIAL_SIZE;
                }
                // If we're constructing a child class of DataBuffer (or ByteArray), buffer initialization
                // has already happened at this point.
                if (this._buffer) {
                    return;
                }
                this._buffer = new ArrayBuffer(initialSize);
                this._length = 0;
                this._position = 0;
                this._resetViews();
                this._littleEndian = DataBuffer._nativeLittleEndian;
                this._bitBuffer = 0;
                this._bitLength = 0;
            }
            DataBuffer.FromArrayBuffer = function (buffer, length) {
                if (length === void 0) {
                    length = -1;
                }
                var dataBuffer = Object.create(DataBuffer.prototype);
                dataBuffer._buffer = buffer;
                dataBuffer._length = length === -1 ? buffer.byteLength : length;
                dataBuffer._position = 0;
                dataBuffer._resetViews();
                dataBuffer._littleEndian = DataBuffer._nativeLittleEndian;
                dataBuffer._bitBuffer = 0;
                dataBuffer._bitLength = 0;
                return dataBuffer;
            };
            DataBuffer.FromPlainObject = function (source) {
                var dataBuffer = DataBuffer.FromArrayBuffer(source.buffer, source.length);
                dataBuffer._littleEndian = source.littleEndian;
                return dataBuffer;
            };
            DataBuffer.prototype.toPlainObject = function () {
                return new PlainObjectDataBuffer(this._buffer, this._length, this._littleEndian);
            };
            /**
             * Clone the DataBuffer in a way that guarantees the underlying ArrayBuffer to be copied
             * into an instance of the current global's ArrayBuffer.
             *
             * Important if the underlying buffer comes from a different global, in which case accessing
             * its elements is excruiciatingly slow.
             */
            DataBuffer.prototype.clone = function () {
                var clone = DataBuffer.FromArrayBuffer(new Uint8Array(this._u8).buffer, this._length);
                clone._position = this._position;
                clone._littleEndian = this._littleEndian;
                clone._bitBuffer = this._bitBuffer;
                clone._bitLength = this._bitLength;
                return clone;
            };
            /**
             * By default, we only have a byte view. All other views are |null|.
             */
            DataBuffer.prototype._resetViews = function () {
                this._u8 = new Uint8Array(this._buffer);
                this._i32 = null;
                this._f32 = null;
            };
            /**
             * We don't want to eagerly allocate views if we won't ever need them. You must call this method
             * before using a view of a certain type to make sure it's available. Once a view is allocated,
             * it is not re-allocated unless the view becomes |null| as a result of a call to |resetViews|.
             */
            DataBuffer.prototype._requestViews = function (flags) {
                if ((this._buffer.byteLength & 3) === 0) {
                    if (this._i32 === null && flags & TypedArrayViewFlags.I32) {
                        this._i32 = new Int32Array(this._buffer);
                    }
                    if (this._f32 === null && flags & TypedArrayViewFlags.F32) {
                        this._f32 = new Float32Array(this._buffer);
                    }
                }
            };
            DataBuffer.prototype.getBytes = function () {
                return new Uint8Array(this._buffer, 0, this._length);
            };
            DataBuffer.prototype._ensureCapacity = function (length) {
                var currentBuffer = this._buffer;
                if (currentBuffer.byteLength >= length) {
                    return;
                }
                var newLength = Math.max(currentBuffer.byteLength, 1);
                while (newLength < length) {
                    newLength *= 2;
                }
                if (newLength > 4294967295) {
                    release || assert(this.sec);
                    this.sec.throwError('RangeError', Errors.ParamRangeError);
                }
                var newBuffer = DataBuffer._arrayBufferPool.acquire(newLength);
                var curentView = this._u8;
                this._buffer = newBuffer;
                this._resetViews();
                this._u8.set(curentView);
                var u8 = this._u8;
                // Zero out the rest of the buffer, since the arrayBufferPool doesn't
                // always give us a empty buffer.
                for (var i = curentView.length; i < u8.length; i++) {
                    u8[i] = 0;
                }
                DataBuffer._arrayBufferPool.release(currentBuffer);
            };
            DataBuffer.prototype.clear = function () {
                this._length = 0;
                this._position = 0;
            };
            DataBuffer.prototype.readBoolean = function () {
                return this.readUnsignedByte() !== 0;
            };
            DataBuffer.prototype.readByte = function () {
                return this.readUnsignedByte() << 24 >> 24;
            };
            DataBuffer.prototype.readUnsignedByte = function () {
                if (this._position + 1 > this._length) {
                    release || assert(this.sec);
                    this.sec.throwError('flash.errors.EOFError', Errors.EOFError);
                }
                return this._u8[this._position++];
            };
            DataBuffer.prototype.readBytes = function (bytes, offset, length) {
                var position = this._position;
                offset = offset >>> 0;
                length = length >>> 0;
                if (length === 0) {
                    length = this._length - position;
                }
                if (position + length > this._length) {
                    release || assert(this.sec);
                    this.sec.throwError('flash.errors.EOFError', Errors.EOFError);
                }
                if (bytes.length < offset + length) {
                    bytes._ensureCapacity(offset + length);
                    bytes.length = offset + length;
                }
                bytes._u8.set(new Uint8Array(this._buffer, position, length), offset);
                this._position += length;
            };
            DataBuffer.prototype.readShort = function () {
                return this.readUnsignedShort() << 16 >> 16;
            };
            DataBuffer.prototype.readUnsignedShort = function () {
                var u8 = this._u8;
                var position = this._position;
                if (position + 2 > this._length) {
                    release || assert(this.sec);
                    this.sec.throwError('flash.errors.EOFError', Errors.EOFError);
                }
                var a = u8[position + 0];
                var b = u8[position + 1];
                this._position = position + 2;
                return this._littleEndian ? b << 8 | a : a << 8 | b;
            };
            DataBuffer.prototype.readInt = function () {
                var u8 = this._u8;
                var position = this._position;
                if (position + 4 > this._length) {
                    release || assert(this.sec);
                    this.sec.throwError('flash.errors.EOFError', Errors.EOFError);
                }
                var a = u8[position + 0];
                var b = u8[position + 1];
                var c = u8[position + 2];
                var d = u8[position + 3];
                this._position = position + 4;
                return this._littleEndian ? d << 24 | c << 16 | b << 8 | a : a << 24 | b << 16 | c << 8 | d;
            };
            DataBuffer.prototype.readUnsignedInt = function () {
                return this.readInt() >>> 0;
            };
            DataBuffer.prototype.readFloat = function () {
                var position = this._position;
                if (position + 4 > this._length) {
                    release || assert(this.sec);
                    this.sec.throwError('flash.errors.EOFError', Errors.EOFError);
                }
                this._position = position + 4;
                this._requestViews(TypedArrayViewFlags.F32);
                if (this._littleEndian && (position & 3) === 0 && this._f32) {
                    return this._f32[position >> 2];
                } else {
                    var u8 = this._u8;
                    var t8 = Shumway.IntegerUtilities.u8;
                    if (this._littleEndian) {
                        t8[0] = u8[position + 0];
                        t8[1] = u8[position + 1];
                        t8[2] = u8[position + 2];
                        t8[3] = u8[position + 3];
                    } else {
                        t8[3] = u8[position + 0];
                        t8[2] = u8[position + 1];
                        t8[1] = u8[position + 2];
                        t8[0] = u8[position + 3];
                    }
                    return Shumway.IntegerUtilities.f32[0];
                }
            };
            DataBuffer.prototype.readDouble = function () {
                var u8 = this._u8;
                var position = this._position;
                if (position + 8 > this._length) {
                    release || assert(this.sec);
                    this.sec.throwError('flash.errors.EOFError', Errors.EOFError);
                }
                var t8 = Shumway.IntegerUtilities.u8;
                if (this._littleEndian) {
                    t8[0] = u8[position + 0];
                    t8[1] = u8[position + 1];
                    t8[2] = u8[position + 2];
                    t8[3] = u8[position + 3];
                    t8[4] = u8[position + 4];
                    t8[5] = u8[position + 5];
                    t8[6] = u8[position + 6];
                    t8[7] = u8[position + 7];
                } else {
                    t8[0] = u8[position + 7];
                    t8[1] = u8[position + 6];
                    t8[2] = u8[position + 5];
                    t8[3] = u8[position + 4];
                    t8[4] = u8[position + 3];
                    t8[5] = u8[position + 2];
                    t8[6] = u8[position + 1];
                    t8[7] = u8[position + 0];
                }
                this._position = position + 8;
                return Shumway.IntegerUtilities.f64[0];
            };
            DataBuffer.prototype.writeBoolean = function (value) {
                this.writeByte(!!value ? 1 : 0);
            };
            DataBuffer.prototype.writeByte = function (value) {
                var length = this._position + 1;
                this._ensureCapacity(length);
                this._u8[this._position++] = value;
                if (length > this._length) {
                    this._length = length;
                }
            };
            DataBuffer.prototype.writeUnsignedByte = function (value) {
                var length = this._position + 1;
                this._ensureCapacity(length);
                this._u8[this._position++] = value;
                if (length > this._length) {
                    this._length = length;
                }
            };
            DataBuffer.prototype.writeRawBytes = function (bytes) {
                var length = this._position + bytes.length;
                this._ensureCapacity(length);
                this._u8.set(bytes, this._position);
                this._position = length;
                if (length > this._length) {
                    this._length = length;
                }
            };
            DataBuffer.prototype.writeBytes = function (bytes, offset, length) {
                if (Shumway.isNullOrUndefined(bytes)) {
                    release || assert(this.sec);
                    this.sec.throwError('TypeError', Errors.NullPointerError, 'bytes');
                }
                offset = offset >>> 0;
                length = length >>> 0;
                if (arguments.length < 2) {
                    offset = 0;
                }
                if (arguments.length < 3) {
                    length = 0;
                }
                if (offset !== clamp(offset, 0, bytes.length) || offset + length !== clamp(offset + length, 0, bytes.length)) {
                    release || assert(this.sec);
                    this.sec.throwError('RangeError', Errors.ParamRangeError);
                }
                if (length === 0) {
                    length = bytes.length - offset;
                }
                this.writeRawBytes(new Int8Array(bytes._buffer, offset, length));
            };
            DataBuffer.prototype.writeShort = function (value) {
                this.writeUnsignedShort(value);
            };
            DataBuffer.prototype.writeUnsignedShort = function (value) {
                var position = this._position;
                this._ensureCapacity(position + 2);
                var u8 = this._u8;
                if (this._littleEndian) {
                    u8[position + 0] = value;
                    u8[position + 1] = value >> 8;
                } else {
                    u8[position + 0] = value >> 8;
                    u8[position + 1] = value;
                }
                position += 2;
                this._position = position;
                if (position > this._length) {
                    this._length = position;
                }
            };
            DataBuffer.prototype.writeInt = function (value) {
                this.writeUnsignedInt(value);
            };
            DataBuffer.prototype.write2Ints = function (a, b) {
                this.write2UnsignedInts(a, b);
            };
            DataBuffer.prototype.write4Ints = function (a, b, c, d) {
                this.write4UnsignedInts(a, b, c, d);
            };
            DataBuffer.prototype.writeUnsignedInt = function (value) {
                var position = this._position;
                this._ensureCapacity(position + 4);
                this._requestViews(TypedArrayViewFlags.I32);
                if (this._littleEndian === DataBuffer._nativeLittleEndian && (position & 3) === 0 && this._i32) {
                    this._i32[position >> 2] = value;
                } else {
                    var u8 = this._u8;
                    if (this._littleEndian) {
                        u8[position + 0] = value;
                        u8[position + 1] = value >> 8;
                        u8[position + 2] = value >> 16;
                        u8[position + 3] = value >> 24;
                    } else {
                        u8[position + 0] = value >> 24;
                        u8[position + 1] = value >> 16;
                        u8[position + 2] = value >> 8;
                        u8[position + 3] = value;
                    }
                }
                position += 4;
                this._position = position;
                if (position > this._length) {
                    this._length = position;
                }
            };
            DataBuffer.prototype.write2UnsignedInts = function (a, b) {
                var position = this._position;
                this._ensureCapacity(position + 8);
                this._requestViews(TypedArrayViewFlags.I32);
                if (this._littleEndian === DataBuffer._nativeLittleEndian && (position & 3) === 0 && this._i32) {
                    this._i32[(position >> 2) + 0] = a;
                    this._i32[(position >> 2) + 1] = b;
                    position += 8;
                    this._position = position;
                    if (position > this._length) {
                        this._length = position;
                    }
                } else {
                    this.writeUnsignedInt(a);
                    this.writeUnsignedInt(b);
                }
            };
            DataBuffer.prototype.write4UnsignedInts = function (a, b, c, d) {
                var position = this._position;
                this._ensureCapacity(position + 16);
                this._requestViews(TypedArrayViewFlags.I32);
                if (this._littleEndian === DataBuffer._nativeLittleEndian && (position & 3) === 0 && this._i32) {
                    this._i32[(position >> 2) + 0] = a;
                    this._i32[(position >> 2) + 1] = b;
                    this._i32[(position >> 2) + 2] = c;
                    this._i32[(position >> 2) + 3] = d;
                    position += 16;
                    this._position = position;
                    if (position > this._length) {
                        this._length = position;
                    }
                } else {
                    this.writeUnsignedInt(a);
                    this.writeUnsignedInt(b);
                    this.writeUnsignedInt(c);
                    this.writeUnsignedInt(d);
                }
            };
            DataBuffer.prototype.writeFloat = function (value) {
                var position = this._position;
                this._ensureCapacity(position + 4);
                this._requestViews(TypedArrayViewFlags.F32);
                if (this._littleEndian === DataBuffer._nativeLittleEndian && (position & 3) === 0 && this._f32) {
                    this._f32[position >> 2] = value;
                } else {
                    var u8 = this._u8;
                    Shumway.IntegerUtilities.f32[0] = value;
                    var t8 = Shumway.IntegerUtilities.u8;
                    if (this._littleEndian) {
                        u8[position + 0] = t8[0];
                        u8[position + 1] = t8[1];
                        u8[position + 2] = t8[2];
                        u8[position + 3] = t8[3];
                    } else {
                        u8[position + 0] = t8[3];
                        u8[position + 1] = t8[2];
                        u8[position + 2] = t8[1];
                        u8[position + 3] = t8[0];
                    }
                }
                position += 4;
                this._position = position;
                if (position > this._length) {
                    this._length = position;
                }
            };
            DataBuffer.prototype.write2Floats = function (a, b) {
                var position = this._position;
                this._ensureCapacity(position + 8);
                this._requestViews(TypedArrayViewFlags.F32);
                if (this._littleEndian === DataBuffer._nativeLittleEndian && (position & 3) === 0 && this._f32) {
                    this._f32[(position >> 2) + 0] = a;
                    this._f32[(position >> 2) + 1] = b;
                    position += 8;
                    this._position = position;
                    if (position > this._length) {
                        this._length = position;
                    }
                } else {
                    this.writeFloat(a);
                    this.writeFloat(b);
                }
            };
            DataBuffer.prototype.write6Floats = function (a, b, c, d, e, f) {
                var position = this._position;
                this._ensureCapacity(position + 24);
                this._requestViews(TypedArrayViewFlags.F32);
                if (this._littleEndian === DataBuffer._nativeLittleEndian && (position & 3) === 0 && this._f32) {
                    this._f32[(position >> 2) + 0] = a;
                    this._f32[(position >> 2) + 1] = b;
                    this._f32[(position >> 2) + 2] = c;
                    this._f32[(position >> 2) + 3] = d;
                    this._f32[(position >> 2) + 4] = e;
                    this._f32[(position >> 2) + 5] = f;
                    position += 24;
                    this._position = position;
                    if (position > this._length) {
                        this._length = position;
                    }
                } else {
                    this.writeFloat(a);
                    this.writeFloat(b);
                    this.writeFloat(c);
                    this.writeFloat(d);
                    this.writeFloat(e);
                    this.writeFloat(f);
                }
            };
            DataBuffer.prototype.writeDouble = function (value) {
                var position = this._position;
                this._ensureCapacity(position + 8);
                var u8 = this._u8;
                Shumway.IntegerUtilities.f64[0] = value;
                var t8 = Shumway.IntegerUtilities.u8;
                if (this._littleEndian) {
                    u8[position + 0] = t8[0];
                    u8[position + 1] = t8[1];
                    u8[position + 2] = t8[2];
                    u8[position + 3] = t8[3];
                    u8[position + 4] = t8[4];
                    u8[position + 5] = t8[5];
                    u8[position + 6] = t8[6];
                    u8[position + 7] = t8[7];
                } else {
                    u8[position + 0] = t8[7];
                    u8[position + 1] = t8[6];
                    u8[position + 2] = t8[5];
                    u8[position + 3] = t8[4];
                    u8[position + 4] = t8[3];
                    u8[position + 5] = t8[2];
                    u8[position + 6] = t8[1];
                    u8[position + 7] = t8[0];
                }
                position += 8;
                this._position = position;
                if (position > this._length) {
                    this._length = position;
                }
            };
            DataBuffer.prototype.readRawBytes = function () {
                return new Int8Array(this._buffer, 0, this._length);
            };
            DataBuffer.prototype.writeUTF = function (value) {
                value = axCoerceString(value);
                var bytes = utf8decode(value);
                this.writeShort(bytes.length);
                this.writeRawBytes(bytes);
            };
            DataBuffer.prototype.writeUTFBytes = function (value) {
                value = axCoerceString(value);
                var bytes = utf8decode(value);
                this.writeRawBytes(bytes);
            };
            DataBuffer.prototype.readUTF = function () {
                return this.readUTFBytes(this.readShort());
            };
            DataBuffer.prototype.readUTFBytes = function (length) {
                length = length >>> 0;
                var pos = this._position;
                if (pos + length > this._length) {
                    release || assert(this.sec);
                    this.sec.throwError('flash.errors.EOFError', Errors.EOFError);
                }
                this._position += length;
                return utf8encode(new Int8Array(this._buffer, pos, length));
            };
            Object.defineProperty(DataBuffer.prototype, 'length', {
                get: function () {
                    return this._length;
                },
                set: function (value) {
                    value = value >>> 0;
                    var capacity = this._buffer.byteLength;
                    /* XXX: Do we need to zero the difference if length <= cap? */
                    if (value > capacity) {
                        this._ensureCapacity(value);
                    }
                    this._length = value;
                    this._position = clamp(this._position, 0, this._length);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DataBuffer.prototype, 'bytesAvailable', {
                get: function () {
                    return this._length - this._position;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DataBuffer.prototype, 'position', {
                get: function () {
                    return this._position;
                },
                set: function (position) {
                    this._position = position >>> 0;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DataBuffer.prototype, 'buffer', {
                get: function () {
                    return this._buffer;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DataBuffer.prototype, 'bytes', {
                get: function () {
                    return this._u8;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DataBuffer.prototype, 'ints', {
                get: function () {
                    this._requestViews(TypedArrayViewFlags.I32);
                    return this._i32;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DataBuffer.prototype, 'objectEncoding', {
                get: function () {
                    return this._objectEncoding;
                },
                set: function (version) {
                    version = version >>> 0;
                    this._objectEncoding = version;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DataBuffer.prototype, 'endian', {
                get: function () {
                    return this._littleEndian ? 'littleEndian' : 'bigEndian';
                },
                set: function (type) {
                    type = axCoerceString(type);
                    if (type === 'auto') {
                        this._littleEndian = DataBuffer._nativeLittleEndian;
                    } else {
                        this._littleEndian = type === 'littleEndian';
                    }
                },
                enumerable: true,
                configurable: true
            });
            DataBuffer.prototype.toString = function () {
                return utf8encode(new Int8Array(this._buffer, 0, this._length));
            };
            DataBuffer.prototype.toBlob = function (type) {
                return new Blob([new Int8Array(this._buffer, this._position, this._length)], { type: type });
            };
            DataBuffer.prototype.writeMultiByte = function (value, charSet) {
                value = axCoerceString(value);
                charSet = axCoerceString(charSet);
                release || release || notImplemented('packageInternal flash.utils.ObjectOutput::writeMultiByte');
                return;
            };
            DataBuffer.prototype.readMultiByte = function (length, charSet) {
                length = length >>> 0;
                charSet = axCoerceString(charSet);
                release || release || notImplemented('packageInternal flash.utils.ObjectInput::readMultiByte');
                return;
            };
            DataBuffer.prototype.getValue = function (name) {
                name = name | 0;
                if (name >= this._length) {
                    return undefined;
                }
                return this._u8[name];
            };
            DataBuffer.prototype.setValue = function (name, value) {
                name = name | 0;
                var length = name + 1;
                this._ensureCapacity(length);
                this._u8[name] = value;
                if (length > this._length) {
                    this._length = length;
                }
            };
            DataBuffer.prototype.readFixed = function () {
                return this.readInt() / 65536;
            };
            DataBuffer.prototype.readFixed8 = function () {
                return this.readShort() / 256;
            };
            DataBuffer.prototype.readFloat16 = function () {
                var uint16 = this.readUnsignedShort();
                var sign = uint16 >> 15 ? -1 : 1;
                var exponent = (uint16 & 31744) >> 10;
                var fraction = uint16 & 1023;
                if (!exponent) {
                    return sign * Math.pow(2, -14) * (fraction / 1024);
                }
                if (exponent === 31) {
                    return fraction ? NaN : sign * Infinity;
                }
                return sign * Math.pow(2, exponent - 15) * (1 + fraction / 1024);
            };
            DataBuffer.prototype.readEncodedU32 = function () {
                var value = this.readUnsignedByte();
                if (!(value & 128)) {
                    return value;
                }
                value = value & 127 | this.readUnsignedByte() << 7;
                if (!(value & 16384)) {
                    return value;
                }
                value = value & 16383 | this.readUnsignedByte() << 14;
                if (!(value & 2097152)) {
                    return value;
                }
                value = value & 2097151 | this.readUnsignedByte() << 21;
                if (!(value & 268435456)) {
                    return value;
                }
                return value & 268435455 | this.readUnsignedByte() << 28;
            };
            DataBuffer.prototype.readBits = function (size) {
                return this.readUnsignedBits(size) << 32 - size >> 32 - size;
            };
            DataBuffer.prototype.readUnsignedBits = function (size) {
                var buffer = this._bitBuffer;
                var length = this._bitLength;
                while (size > length) {
                    buffer = buffer << 8 | this.readUnsignedByte();
                    length += 8;
                }
                length -= size;
                var value = buffer >>> length & bitMasks[size];
                this._bitBuffer = buffer;
                this._bitLength = length;
                return value;
            };
            DataBuffer.prototype.readFixedBits = function (size) {
                return this.readBits(size) / 65536;
            };
            DataBuffer.prototype.readString = function (length) {
                var position = this._position;
                if (length) {
                    if (position + length > this._length) {
                        release || assert(this.sec);
                        this.sec.throwError('flash.errors.EOFError', Errors.EOFError);
                    }
                    this._position += length;
                } else {
                    length = 0;
                    for (var i = position; i < this._length && this._u8[i]; i++) {
                        length++;
                    }
                    this._position += length + 1;
                }
                return utf8encode(new Int8Array(this._buffer, position, length));
            };
            DataBuffer.prototype.align = function () {
                this._bitBuffer = 0;
                this._bitLength = 0;
            };
            DataBuffer.prototype.deflate = function () {
                this.compress('deflate');
            };
            DataBuffer.prototype.inflate = function () {
                this.uncompress('deflate');
            };
            DataBuffer.prototype.compress = function (algorithm) {
                if (arguments.length === 0) {
                    algorithm = 'zlib';
                } else {
                    algorithm = axCoerceString(algorithm);
                }
                var deflate;
                switch (algorithm) {
                case 'zlib':
                    deflate = new ArrayUtilities.Deflate(true);
                    break;
                case 'deflate':
                    deflate = new ArrayUtilities.Deflate(false);
                    break;
                default:
                    return;
                }
                var output = new DataBuffer();
                deflate.onData = output.writeRawBytes.bind(output);
                deflate.push(this._u8.subarray(0, this._length));
                deflate.close();
                this._ensureCapacity(output._u8.length);
                this._u8.set(output._u8);
                this.length = output.length;
                this._position = 0;
            };
            DataBuffer.prototype.uncompress = function (algorithm) {
                if (arguments.length === 0) {
                    algorithm = 'zlib';
                } else {
                    algorithm = axCoerceString(algorithm);
                }
                var inflate;
                switch (algorithm) {
                case 'zlib':
                    inflate = ArrayUtilities.Inflate.create(true);
                    break;
                case 'deflate':
                    inflate = ArrayUtilities.Inflate.create(false);
                    break;
                case 'lzma':
                    inflate = new ArrayUtilities.LzmaDecoder(false);
                    break;
                default:
                    return;
                }
                var output = new DataBuffer();
                var error;
                inflate.onData = output.writeRawBytes.bind(output);
                inflate.onError = function (e) {
                    return error = e;
                };
                inflate.push(this._u8.subarray(0, this._length));
                if (error) {
                    release || assert(this.sec);
                    this.sec.throwError('IOError', Errors.CompressedDataError);
                }
                inflate.close();
                this._ensureCapacity(output._u8.length);
                this._u8.set(output._u8);
                this.length = output.length;
                this._position = 0;
            };
            DataBuffer._nativeLittleEndian = new Int8Array(new Int32Array([1]).buffer)[0] === 1;
            /* The initial size of the backing, in bytes. Doubled every OOM. */
            DataBuffer.INITIAL_SIZE = 128;
            DataBuffer._arrayBufferPool = new Shumway.ArrayBufferPool();
            return DataBuffer;
        }();
        ArrayUtilities.DataBuffer = DataBuffer;
    }(ArrayUtilities = Shumway.ArrayUtilities || (Shumway.ArrayUtilities = {})));
    var DataBuffer = Shumway.ArrayUtilities.DataBuffer;
    var ensureTypedArrayCapacity = Shumway.ArrayUtilities.ensureTypedArrayCapacity;
    var assert = Shumway.Debug.assert;
    var PlainObjectShapeData = function () {
        function PlainObjectShapeData(commands, commandsPosition, coordinates, morphCoordinates, coordinatesPosition, styles, stylesLength, morphStyles, morphStylesLength, hasFills, hasLines) {
            this.commands = commands;
            this.commandsPosition = commandsPosition;
            this.coordinates = coordinates;
            this.morphCoordinates = morphCoordinates;
            this.coordinatesPosition = coordinatesPosition;
            this.styles = styles;
            this.stylesLength = stylesLength;
            this.morphStyles = morphStyles;
            this.morphStylesLength = morphStylesLength;
            this.hasFills = hasFills;
            this.hasLines = hasLines;
        }
        return PlainObjectShapeData;
    }();
    Shumway.PlainObjectShapeData = PlainObjectShapeData;
    var DefaultSize;
    (function (DefaultSize) {
        DefaultSize[DefaultSize['Commands'] = 32] = 'Commands';
        DefaultSize[DefaultSize['Coordinates'] = 128] = 'Coordinates';
        DefaultSize[DefaultSize['Styles'] = 16] = 'Styles';
    }(DefaultSize || (DefaultSize = {})));
    var ShapeData = function () {
        function ShapeData(initialize) {
            if (initialize === void 0) {
                initialize = true;
            }
            if (initialize) {
                this.clear();
            }
        }
        ShapeData.FromPlainObject = function (source) {
            var data = new ShapeData(false);
            data.commands = source.commands;
            data.coordinates = source.coordinates;
            data.morphCoordinates = source.morphCoordinates;
            data.commandsPosition = source.commandsPosition;
            data.coordinatesPosition = source.coordinatesPosition;
            data.styles = DataBuffer.FromArrayBuffer(source.styles, source.stylesLength);
            data.styles.endian = 'auto';
            if (source.morphStyles) {
                data.morphStyles = DataBuffer.FromArrayBuffer(source.morphStyles, source.morphStylesLength);
                data.morphStyles.endian = 'auto';
            }
            data.hasFills = source.hasFills;
            data.hasLines = source.hasLines;
            return data;
        };
        ShapeData.prototype.moveTo = function (x, y) {
            this.ensurePathCapacities(1, 2);
            this.commands[this.commandsPosition++] = 9    /* MoveTo */;
            this.coordinates[this.coordinatesPosition++] = x;
            this.coordinates[this.coordinatesPosition++] = y;
        };
        ShapeData.prototype.lineTo = function (x, y) {
            this.ensurePathCapacities(1, 2);
            this.commands[this.commandsPosition++] = 10    /* LineTo */;
            this.coordinates[this.coordinatesPosition++] = x;
            this.coordinates[this.coordinatesPosition++] = y;
        };
        ShapeData.prototype.curveTo = function (controlX, controlY, anchorX, anchorY) {
            this.ensurePathCapacities(1, 4);
            this.commands[this.commandsPosition++] = 11    /* CurveTo */;
            this.coordinates[this.coordinatesPosition++] = controlX;
            this.coordinates[this.coordinatesPosition++] = controlY;
            this.coordinates[this.coordinatesPosition++] = anchorX;
            this.coordinates[this.coordinatesPosition++] = anchorY;
        };
        ShapeData.prototype.cubicCurveTo = function (controlX1, controlY1, controlX2, controlY2, anchorX, anchorY) {
            this.ensurePathCapacities(1, 6);
            this.commands[this.commandsPosition++] = 12    /* CubicCurveTo */;
            this.coordinates[this.coordinatesPosition++] = controlX1;
            this.coordinates[this.coordinatesPosition++] = controlY1;
            this.coordinates[this.coordinatesPosition++] = controlX2;
            this.coordinates[this.coordinatesPosition++] = controlY2;
            this.coordinates[this.coordinatesPosition++] = anchorX;
            this.coordinates[this.coordinatesPosition++] = anchorY;
        };
        ShapeData.prototype.beginFill = function (color) {
            this.ensurePathCapacities(1, 0);
            this.commands[this.commandsPosition++] = 1    /* BeginSolidFill */;
            this.styles.writeUnsignedInt(color);
            this.hasFills = true;
        };
        ShapeData.prototype.writeMorphFill = function (color) {
            this.morphStyles.writeUnsignedInt(color);
        };
        ShapeData.prototype.endFill = function () {
            this.ensurePathCapacities(1, 0);
            this.commands[this.commandsPosition++] = 4    /* EndFill */;
        };
        ShapeData.prototype.endLine = function () {
            this.ensurePathCapacities(1, 0);
            this.commands[this.commandsPosition++] = 8    /* LineEnd */;
        };
        ShapeData.prototype.lineStyle = function (thickness, color, pixelHinting, scaleMode, caps, joints, miterLimit) {
            release || assert(thickness === (thickness | 0), thickness >= 0 && thickness <= 255 * 20);
            this.ensurePathCapacities(2, 0);
            this.commands[this.commandsPosition++] = 5    /* LineStyleSolid */;
            this.coordinates[this.coordinatesPosition++] = thickness;
            var styles = this.styles;
            styles.writeUnsignedInt(color);
            styles.writeBoolean(pixelHinting);
            styles.writeUnsignedByte(scaleMode);
            styles.writeUnsignedByte(caps);
            styles.writeUnsignedByte(joints);
            styles.writeUnsignedByte(miterLimit);
            this.hasLines = true;
        };
        ShapeData.prototype.writeMorphLineStyle = function (thickness, color) {
            this.morphCoordinates[this.coordinatesPosition - 1] = thickness;
            this.morphStyles.writeUnsignedInt(color);
        };
        /**
         * Bitmaps are specified the same for fills and strokes, so we only need to serialize them
         * once. The Parameter `pathCommand` is treated as the actual command to serialize, and must
         * be one of BeginBitmapFill and LineStyleBitmap.
         */
        ShapeData.prototype.beginBitmap = function (pathCommand, bitmapId, matrix, repeat, smooth) {
            release || assert(pathCommand === 3    /* BeginBitmapFill */ || pathCommand === 7    /* LineStyleBitmap */);
            this.ensurePathCapacities(1, 0);
            this.commands[this.commandsPosition++] = pathCommand;
            var styles = this.styles;
            styles.writeUnsignedInt(bitmapId);
            this._writeStyleMatrix(matrix, false);
            styles.writeBoolean(repeat);
            styles.writeBoolean(smooth);
            this.hasFills = true;
        };
        ShapeData.prototype.writeMorphBitmap = function (matrix) {
            this._writeStyleMatrix(matrix, true);
        };
        /**
         * Gradients are specified the same for fills and strokes, so we only need to serialize them
         * once. The Parameter `pathCommand` is treated as the actual command to serialize, and must
         * be one of BeginGradientFill and LineStyleGradient.
         */
        ShapeData.prototype.beginGradient = function (pathCommand, colors, ratios, gradientType, matrix, spread, interpolation, focalPointRatio) {
            release || assert(pathCommand === 2    /* BeginGradientFill */ || pathCommand === 6    /* LineStyleGradient */);
            this.ensurePathCapacities(1, 0);
            this.commands[this.commandsPosition++] = pathCommand;
            var styles = this.styles;
            styles.writeUnsignedByte(gradientType);
            release || assert(focalPointRatio === (focalPointRatio | 0));
            styles.writeShort(focalPointRatio);
            this._writeStyleMatrix(matrix, false);
            var colorStops = colors.length;
            styles.writeByte(colorStops);
            for (var i = 0; i < colorStops; i++) {
                // Ratio must be valid, otherwise we'd have bailed above.
                styles.writeUnsignedByte(ratios[i]);
                // Colors are coerced to uint32, with the highest byte stripped.
                styles.writeUnsignedInt(colors[i]);
            }
            styles.writeUnsignedByte(spread);
            styles.writeUnsignedByte(interpolation);
            this.hasFills = true;
        };
        ShapeData.prototype.writeMorphGradient = function (colors, ratios, matrix) {
            this._writeStyleMatrix(matrix, true);
            var styles = this.morphStyles;
            for (var i = 0; i < colors.length; i++) {
                // Ratio must be valid, otherwise we'd have bailed above.
                styles.writeUnsignedByte(ratios[i]);
                // Colors are coerced to uint32, with the highest byte stripped.
                styles.writeUnsignedInt(colors[i]);
            }
        };
        ShapeData.prototype.writeCommandAndCoordinates = function (command, x, y) {
            this.ensurePathCapacities(1, 2);
            this.commands[this.commandsPosition++] = command;
            this.coordinates[this.coordinatesPosition++] = x;
            this.coordinates[this.coordinatesPosition++] = y;
        };
        ShapeData.prototype.writeCoordinates = function (x, y) {
            this.ensurePathCapacities(0, 2);
            this.coordinates[this.coordinatesPosition++] = x;
            this.coordinates[this.coordinatesPosition++] = y;
        };
        ShapeData.prototype.writeMorphCoordinates = function (x, y) {
            this.morphCoordinates = ensureTypedArrayCapacity(this.morphCoordinates, this.coordinatesPosition);
            this.morphCoordinates[this.coordinatesPosition - 2] = x;
            this.morphCoordinates[this.coordinatesPosition - 1] = y;
        };
        ShapeData.prototype.clear = function () {
            this.commandsPosition = this.coordinatesPosition = 0;
            this.commands = new Uint8Array(DefaultSize.Commands);
            this.coordinates = new Int32Array(DefaultSize.Coordinates);
            this.styles = new DataBuffer(DefaultSize.Styles);
            this.styles.endian = 'auto';
            this.hasFills = this.hasLines = false;
        };
        ShapeData.prototype.isEmpty = function () {
            return this.commandsPosition === 0;
        };
        ShapeData.prototype.clone = function () {
            var copy = new ShapeData(false);
            copy.commands = new Uint8Array(this.commands);
            copy.commandsPosition = this.commandsPosition;
            copy.coordinates = new Int32Array(this.coordinates);
            copy.coordinatesPosition = this.coordinatesPosition;
            copy.styles = new DataBuffer(this.styles.length);
            copy.styles.writeRawBytes(this.styles.bytes.subarray(0, this.styles.length));
            if (this.morphStyles) {
                copy.morphStyles = new DataBuffer(this.morphStyles.length);
                copy.morphStyles.writeRawBytes(this.morphStyles.bytes.subarray(0, this.morphStyles.length));
            }
            copy.hasFills = this.hasFills;
            copy.hasLines = this.hasLines;
            return copy;
        };
        ShapeData.prototype.toPlainObject = function () {
            return new PlainObjectShapeData(this.commands, this.commandsPosition, this.coordinates, this.morphCoordinates, this.coordinatesPosition, this.styles.buffer, this.styles.length, this.morphStyles && this.morphStyles.buffer, this.morphStyles ? this.morphStyles.length : 0, this.hasFills, this.hasLines);
        };
        Object.defineProperty(ShapeData.prototype, 'buffers', {
            get: function () {
                var buffers = [
                    this.commands.buffer,
                    this.coordinates.buffer,
                    this.styles.buffer
                ];
                if (this.morphCoordinates) {
                    buffers.push(this.morphCoordinates.buffer);
                }
                if (this.morphStyles) {
                    buffers.push(this.morphStyles.buffer);
                }
                return buffers;
            },
            enumerable: true,
            configurable: true
        });
        ShapeData.prototype._writeStyleMatrix = function (matrix, isMorph) {
            var styles = isMorph ? this.morphStyles : this.styles;
            styles.write6Floats(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
        };
        ShapeData.prototype.ensurePathCapacities = function (numCommands, numCoordinates) {
            // ensureTypedArrayCapacity will hopefully be inlined, in which case the field writes
            // will be optimized out.
            this.commands = ensureTypedArrayCapacity(this.commands, this.commandsPosition + numCommands);
            this.coordinates = ensureTypedArrayCapacity(this.coordinates, this.coordinatesPosition + numCoordinates);
        };
        return ShapeData;
    }();
    Shumway.ShapeData = ShapeData;
    var SWF;
    (function (SWF) {
        var Parser;
        (function (Parser) {
            var SwfTagCodeNames = [
                'CODE_END',
                'CODE_SHOW_FRAME',
                'CODE_DEFINE_SHAPE',
                'CODE_FREE_CHARACTER',
                'CODE_PLACE_OBJECT',
                'CODE_REMOVE_OBJECT',
                'CODE_DEFINE_BITS',
                'CODE_DEFINE_BUTTON',
                'CODE_JPEG_TABLES',
                'CODE_SET_BACKGROUND_COLOR',
                'CODE_DEFINE_FONT',
                'CODE_DEFINE_TEXT',
                'CODE_DO_ACTION',
                'CODE_DEFINE_FONT_INFO',
                'CODE_DEFINE_SOUND',
                'CODE_START_SOUND',
                'CODE_STOP_SOUND',
                'CODE_DEFINE_BUTTON_SOUND',
                'CODE_SOUND_STREAM_HEAD',
                'CODE_SOUND_STREAM_BLOCK',
                'CODE_DEFINE_BITS_LOSSLESS',
                'CODE_DEFINE_BITS_JPEG2',
                'CODE_DEFINE_SHAPE2',
                'CODE_DEFINE_BUTTON_CXFORM',
                'CODE_PROTECT',
                'CODE_PATHS_ARE_POSTSCRIPT',
                'CODE_PLACE_OBJECT2',
                'INVALID',
                'CODE_REMOVE_OBJECT2',
                'CODE_SYNC_FRAME',
                'INVALID',
                'CODE_FREE_ALL',
                'CODE_DEFINE_SHAPE3',
                'CODE_DEFINE_TEXT2',
                'CODE_DEFINE_BUTTON2',
                'CODE_DEFINE_BITS_JPEG3',
                'CODE_DEFINE_BITS_LOSSLESS2',
                'CODE_DEFINE_EDIT_TEXT',
                'CODE_DEFINE_VIDEO',
                'CODE_DEFINE_SPRITE',
                'CODE_NAME_CHARACTER',
                'CODE_PRODUCT_INFO',
                'CODE_DEFINE_TEXT_FORMAT',
                'CODE_FRAME_LABEL',
                'CODE_DEFINE_BEHAVIOUR',
                'CODE_SOUND_STREAM_HEAD2',
                'CODE_DEFINE_MORPH_SHAPE',
                'CODE_GENERATE_FRAME',
                'CODE_DEFINE_FONT2',
                'CODE_GEN_COMMAND',
                'CODE_DEFINE_COMMAND_OBJECT',
                'CODE_CHARACTER_SET',
                'CODE_EXTERNAL_FONT',
                'CODE_DEFINE_FUNCTION',
                'CODE_PLACE_FUNCTION',
                'CODE_GEN_TAG_OBJECTS',
                'CODE_EXPORT_ASSETS',
                'CODE_IMPORT_ASSETS',
                'CODE_ENABLE_DEBUGGER',
                'CODE_DO_INIT_ACTION',
                'CODE_DEFINE_VIDEO_STREAM',
                'CODE_VIDEO_FRAME',
                'CODE_DEFINE_FONT_INFO2',
                'CODE_DEBUG_ID',
                'CODE_ENABLE_DEBUGGER2',
                'CODE_SCRIPT_LIMITS',
                'CODE_SET_TAB_INDEX',
                'CODE_DEFINE_SHAPE4',
                'INVALID',
                'CODE_FILE_ATTRIBUTES',
                'CODE_PLACE_OBJECT3',
                'CODE_IMPORT_ASSETS2',
                'CODE_DO_ABC_DEFINE',
                'CODE_DEFINE_FONT_ALIGN_ZONES',
                'CODE_CSM_TEXT_SETTINGS',
                'CODE_DEFINE_FONT3',
                'CODE_SYMBOL_CLASS',
                'CODE_METADATA',
                'CODE_DEFINE_SCALING_GRID',
                'INVALID',
                'INVALID',
                'INVALID',
                'CODE_DO_ABC',
                'CODE_DEFINE_SHAPE4',
                'CODE_DEFINE_MORPH_SHAPE2',
                'INVALID',
                'CODE_DEFINE_SCENE_AND_FRAME_LABEL_DATA',
                'CODE_DEFINE_BINARY_DATA',
                'CODE_DEFINE_FONT_NAME',
                'CODE_START_SOUND2',
                'CODE_DEFINE_BITS_JPEG4',
                'CODE_DEFINE_FONT4',
                'CODE_TELEMETRY'
            ];
            function getSwfTagCodeName(tagCode) {
                return release ? 'SwfTagCode: ' + tagCode : SwfTagCodeNames[tagCode];
            }
            Parser.getSwfTagCodeName = getSwfTagCodeName;
            (function (DefinitionTags) {
                DefinitionTags[DefinitionTags['CODE_DEFINE_SHAPE'] = 2] = 'CODE_DEFINE_SHAPE';
                DefinitionTags[DefinitionTags['CODE_DEFINE_BITS'] = 6] = 'CODE_DEFINE_BITS';
                DefinitionTags[DefinitionTags['CODE_DEFINE_BUTTON'] = 7] = 'CODE_DEFINE_BUTTON';
                DefinitionTags[DefinitionTags['CODE_DEFINE_FONT'] = 10] = 'CODE_DEFINE_FONT';
                DefinitionTags[DefinitionTags['CODE_DEFINE_TEXT'] = 11] = 'CODE_DEFINE_TEXT';
                DefinitionTags[DefinitionTags['CODE_DEFINE_SOUND'] = 14] = 'CODE_DEFINE_SOUND';
                DefinitionTags[DefinitionTags['CODE_DEFINE_BITS_LOSSLESS'] = 20] = 'CODE_DEFINE_BITS_LOSSLESS';
                DefinitionTags[DefinitionTags['CODE_DEFINE_BITS_JPEG2'] = 21] = 'CODE_DEFINE_BITS_JPEG2';
                DefinitionTags[DefinitionTags['CODE_DEFINE_SHAPE2'] = 22] = 'CODE_DEFINE_SHAPE2';
                DefinitionTags[DefinitionTags['CODE_DEFINE_SHAPE3'] = 32] = 'CODE_DEFINE_SHAPE3';
                DefinitionTags[DefinitionTags['CODE_DEFINE_TEXT2'] = 33] = 'CODE_DEFINE_TEXT2';
                DefinitionTags[DefinitionTags['CODE_DEFINE_BUTTON2'] = 34] = 'CODE_DEFINE_BUTTON2';
                DefinitionTags[DefinitionTags['CODE_DEFINE_BITS_JPEG3'] = 35] = 'CODE_DEFINE_BITS_JPEG3';
                DefinitionTags[DefinitionTags['CODE_DEFINE_BITS_LOSSLESS2'] = 36] = 'CODE_DEFINE_BITS_LOSSLESS2';
                DefinitionTags[DefinitionTags['CODE_DEFINE_EDIT_TEXT'] = 37] = 'CODE_DEFINE_EDIT_TEXT';
                DefinitionTags[DefinitionTags['CODE_DEFINE_SPRITE'] = 39] = 'CODE_DEFINE_SPRITE';
                DefinitionTags[DefinitionTags['CODE_DEFINE_MORPH_SHAPE'] = 46] = 'CODE_DEFINE_MORPH_SHAPE';
                DefinitionTags[DefinitionTags['CODE_DEFINE_FONT2'] = 48] = 'CODE_DEFINE_FONT2';
                DefinitionTags[DefinitionTags['CODE_DEFINE_VIDEO_STREAM'] = 60] = 'CODE_DEFINE_VIDEO_STREAM';
                DefinitionTags[DefinitionTags['CODE_DEFINE_FONT3'] = 75] = 'CODE_DEFINE_FONT3';
                DefinitionTags[DefinitionTags['CODE_DEFINE_SHAPE4'] = 83] = 'CODE_DEFINE_SHAPE4';
                DefinitionTags[DefinitionTags['CODE_DEFINE_MORPH_SHAPE2'] = 84] = 'CODE_DEFINE_MORPH_SHAPE2';
                DefinitionTags[DefinitionTags['CODE_DEFINE_BINARY_DATA'] = 87] = 'CODE_DEFINE_BINARY_DATA';
                DefinitionTags[DefinitionTags['CODE_DEFINE_BITS_JPEG4'] = 90] = 'CODE_DEFINE_BITS_JPEG4';
                DefinitionTags[DefinitionTags['CODE_DEFINE_FONT4'] = 91] = 'CODE_DEFINE_FONT4';
            }(Parser.DefinitionTags || (Parser.DefinitionTags = {})));
            var DefinitionTags = Parser.DefinitionTags;
            (function (ImageDefinitionTags) {
                ImageDefinitionTags[ImageDefinitionTags['CODE_DEFINE_BITS'] = 6] = 'CODE_DEFINE_BITS';
                ImageDefinitionTags[ImageDefinitionTags['CODE_DEFINE_BITS_JPEG2'] = 21] = 'CODE_DEFINE_BITS_JPEG2';
                ImageDefinitionTags[ImageDefinitionTags['CODE_DEFINE_BITS_JPEG3'] = 35] = 'CODE_DEFINE_BITS_JPEG3';
                ImageDefinitionTags[ImageDefinitionTags['CODE_DEFINE_BITS_JPEG4'] = 90] = 'CODE_DEFINE_BITS_JPEG4';
            }(Parser.ImageDefinitionTags || (Parser.ImageDefinitionTags = {})));
            var ImageDefinitionTags = Parser.ImageDefinitionTags;
            (function (FontDefinitionTags) {
                FontDefinitionTags[FontDefinitionTags['CODE_DEFINE_FONT'] = 10] = 'CODE_DEFINE_FONT';
                FontDefinitionTags[FontDefinitionTags['CODE_DEFINE_FONT2'] = 48] = 'CODE_DEFINE_FONT2';
                FontDefinitionTags[FontDefinitionTags['CODE_DEFINE_FONT3'] = 75] = 'CODE_DEFINE_FONT3';
                FontDefinitionTags[FontDefinitionTags['CODE_DEFINE_FONT4'] = 91] = 'CODE_DEFINE_FONT4';
            }(Parser.FontDefinitionTags || (Parser.FontDefinitionTags = {})));
            var FontDefinitionTags = Parser.FontDefinitionTags;
            (function (ControlTags) {
                ControlTags[ControlTags['CODE_PLACE_OBJECT'] = 4] = 'CODE_PLACE_OBJECT';
                ControlTags[ControlTags['CODE_PLACE_OBJECT2'] = 26] = 'CODE_PLACE_OBJECT2';
                ControlTags[ControlTags['CODE_PLACE_OBJECT3'] = 70] = 'CODE_PLACE_OBJECT3';
                ControlTags[ControlTags['CODE_REMOVE_OBJECT'] = 5] = 'CODE_REMOVE_OBJECT';
                ControlTags[ControlTags['CODE_REMOVE_OBJECT2'] = 28] = 'CODE_REMOVE_OBJECT2';
                ControlTags[ControlTags['CODE_START_SOUND'] = 15] = 'CODE_START_SOUND';
                ControlTags[ControlTags['CODE_START_SOUND2'] = 89] = 'CODE_START_SOUND2';
                ControlTags[ControlTags['CODE_VIDEO_FRAME'] = 61] = 'CODE_VIDEO_FRAME';
            }(Parser.ControlTags || (Parser.ControlTags = {})));
            var ControlTags = Parser.ControlTags;
        }(Parser = SWF.Parser || (SWF.Parser = {})));
    }(SWF = Shumway.SWF || (Shumway.SWF = {})));
    var unexpected = Shumway.Debug.unexpected;
    var BinaryFileReader = function () {
        function BinaryFileReader(url, method, mimeType, data) {
            this.url = url;
            this.method = method;
            this.mimeType = mimeType;
            this.data = data;
        }
        BinaryFileReader.prototype.readAll = function (progress, complete) {
            var url = this.url;
            var xhr = this.xhr = new XMLHttpRequest({ mozSystem: true });
            var async = true;
            xhr.open(this.method || 'GET', this.url, async);
            xhr.responseType = 'arraybuffer';
            if (progress) {
                xhr.onprogress = function (event) {
                    progress(xhr.response, event.loaded, event.total);
                };
            }
            xhr.onreadystatechange = function (event) {
                if (xhr.readyState === 4) {
                    if (xhr.status !== 200 && xhr.status !== 0 || xhr.response === null) {
                        unexpected('Path: ' + url + ' not found.');
                        complete(null, xhr.statusText);
                        return;
                    }
                    complete(xhr.response);
                }
            };
            if (this.mimeType) {
                xhr.setRequestHeader('Content-Type', this.mimeType);
            }
            xhr.send(this.data || null);
        };
        BinaryFileReader.prototype.readChunked = function (chunkSize, ondata, onerror, onopen, oncomplete, onhttpstatus) {
            if (chunkSize <= 0) {
                this.readAsync(ondata, onerror, onopen, oncomplete, onhttpstatus);
                return;
            }
            var position = 0;
            var buffer = new Uint8Array(chunkSize);
            var read = 0, total;
            this.readAsync(function (data, progress) {
                total = progress.total;
                var left = data.length, offset = 0;
                while (position + left >= chunkSize) {
                    var tailSize = chunkSize - position;
                    buffer.set(data.subarray(offset, offset + tailSize), position);
                    offset += tailSize;
                    left -= tailSize;
                    read += chunkSize;
                    ondata(buffer, {
                        loaded: read,
                        total: total
                    });
                    position = 0;
                }
                buffer.set(data.subarray(offset), position);
                position += left;
            }, onerror, onopen, function () {
                if (position > 0) {
                    read += position;
                    ondata(buffer.subarray(0, position), {
                        loaded: read,
                        total: total
                    });
                    position = 0;
                }
                oncomplete && oncomplete();
            }, onhttpstatus);
        };
        BinaryFileReader.prototype.readAsync = function (ondata, onerror, onopen, oncomplete, onhttpstatus) {
            var xhr = this.xhr = new XMLHttpRequest({ mozSystem: true });
            var url = this.url;
            var loaded = 0;
            var total = 0;
            xhr.open(this.method || 'GET', url, true);
            xhr.responseType = 'moz-chunked-arraybuffer';
            var isNotProgressive = xhr.responseType !== 'moz-chunked-arraybuffer';
            if (isNotProgressive) {
                xhr.responseType = 'arraybuffer';
            }
            xhr.onprogress = function (e) {
                if (isNotProgressive) {
                    return;
                }
                loaded = e.loaded;
                total = e.total;
                var bytes = new Uint8Array(xhr.response);
                // The event's `loaded` and `total` properties are sometimes lower than the actual
                // number of loaded bytes. In that case, increase them to that value.
                loaded = Math.max(loaded, bytes.byteLength);
                total = Math.max(total, bytes.byteLength);
                ondata(bytes, {
                    loaded: loaded,
                    total: total
                });
            };
            xhr.onreadystatechange = function (event) {
                if (xhr.readyState === 2 && onhttpstatus) {
                    onhttpstatus(url, xhr.status, xhr.getAllResponseHeaders());
                }
                if (xhr.readyState === 4) {
                    // Failed loads can be detected through either the status code or the fact that nothing
                    // has been loaded.
                    // Note: Just checking that `xhr.response` is set doesn't work, as Firefox enables
                    // chunked loading, and in that mode `response` is only set in the `onprogress` handler.
                    if (xhr.status !== 200 && xhr.status !== 0 || xhr.response === null && (total === 0 || loaded !== total)) {
                        onerror(xhr.statusText);
                        return;
                    }
                    if (isNotProgressive) {
                        var buffer = xhr.response;
                        ondata(new Uint8Array(buffer), {
                            loaded: buffer.byteLength,
                            total: buffer.byteLength
                        });
                    }
                }
            };
            xhr.onload = function () {
                if (oncomplete) {
                    oncomplete();
                }
            };
            if (this.mimeType) {
                xhr.setRequestHeader('Content-Type', this.mimeType);
            }
            xhr.send(this.data || null);
            if (onopen) {
                onopen();
            }
        };
        BinaryFileReader.prototype.abort = function () {
            if (this.xhr) {
                this.xhr.abort();
                this.xhr = null;
            }
        };
        return BinaryFileReader;
    }();
    Shumway.BinaryFileReader = BinaryFileReader;
    // Produces similar output as flashlog.txt It can be produced by the
    // debug builds of Flash Player.
    // See https://github.com/mozilla/shumway/wiki/Trace-Output-with-Flash-Player-Debugger
    var FlashLog = function () {
        function FlashLog() {
            this.isAS3TraceOn = true;
            this._startTime = Date.now();
        }
        Object.defineProperty(FlashLog.prototype, 'currentTimestamp', {
            get: function () {
                return Date.now() - this._startTime;
            },
            enumerable: true,
            configurable: true
        });
        FlashLog.prototype._writeLine = function (line) {
            Shumway.Debug.abstractMethod('FlashLog._writeLine');
        };
        FlashLog.prototype.writeAS3Trace = function (msg) {
            if (this.isAS3TraceOn) {
                this._writeLine(this.currentTimestamp + ' AVMINF: ' + msg);
            }
        };
        return FlashLog;
    }();
    Shumway.FlashLog = FlashLog;
    Shumway.flashlog = null;
    var Remoting;
    (function (Remoting) {
        (function (FilterType) {
            FilterType[FilterType['Blur'] = 0] = 'Blur';
            FilterType[FilterType['DropShadow'] = 1] = 'DropShadow';
            FilterType[FilterType['ColorMatrix'] = 2] = 'ColorMatrix';
        }(Remoting.FilterType || (Remoting.FilterType = {})));
        var FilterType = Remoting.FilterType;
        Remoting.MouseEventNames = [
            'click',
            'dblclick',
            'mousedown',
            'mousemove',
            'mouseup',
            'mouseover',
            'mouseout'
        ];
        Remoting.KeyboardEventNames = [
            'keydown',
            'keypress',
            'keyup'
        ];
        /**
         * Implementation of ITransportPeer that uses standard DOM postMessage and
         * events to exchange data between messaging peers.
         */
        var WindowTransportPeer = function () {
            function WindowTransportPeer(window, target) {
                this.window = window;
                this.target = target;    //
            }
            Object.defineProperty(WindowTransportPeer.prototype, 'onAsyncMessage', {
                set: function (callback) {
                    this.window.addEventListener('message', function (e) {
                        Promise.resolve(e.data).then(function (msg) {
                            callback(msg);
                        });
                    });
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(WindowTransportPeer.prototype, 'onSyncMessage', {
                set: function (callback) {
                    this.window.addEventListener('syncmessage', function (e) {
                        var wrappedMessage = e.detail;
                        wrappedMessage.result = callback(wrappedMessage.msg);
                    });
                },
                enumerable: true,
                configurable: true
            });
            WindowTransportPeer.prototype.postAsyncMessage = function (msg, transfers) {
                this.target.postMessage(msg, '*', transfers);
            };
            WindowTransportPeer.prototype.sendSyncMessage = function (msg, transfers) {
                var event = this.target.document.createEvent('CustomEvent');
                var wrappedMessage = {
                    msg: msg,
                    result: undefined
                };
                event.initCustomEvent('syncmessage', false, false, wrappedMessage);
                this.target.dispatchEvent(event);
                return wrappedMessage.result;
            };
            return WindowTransportPeer;
        }();
        Remoting.WindowTransportPeer = WindowTransportPeer;
        /**
         * Implementation of ITransportPeer that uses ShumwayCom API to exchange data
         * between messaging peers.
         */
        var ShumwayComTransportPeer = function () {
            function ShumwayComTransportPeer() {
            }
            Object.defineProperty(ShumwayComTransportPeer.prototype, 'onAsyncMessage', {
                set: function (callback) {
                    ShumwayCom.setAsyncMessageCallback(callback);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ShumwayComTransportPeer.prototype, 'onSyncMessage', {
                set: function (callback) {
                    ShumwayCom.setSyncMessageCallback(callback);
                },
                enumerable: true,
                configurable: true
            });
            ShumwayComTransportPeer.prototype.postAsyncMessage = function (msg, transfers) {
                ShumwayCom.postAsyncMessage(msg);
            };
            ShumwayComTransportPeer.prototype.sendSyncMessage = function (msg, transfers) {
                return ShumwayCom.sendSyncMessage(msg);
            };
            return ShumwayComTransportPeer;
        }();
        Remoting.ShumwayComTransportPeer = ShumwayComTransportPeer;
    }(Remoting = Shumway.Remoting || (Shumway.Remoting = {})));
}(Shumway || (Shumway = {})));
/*
 * Copyright 2015 Mozilla Foundation
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
var ShumwayEnvironment = {
    DEBUG: 'test',
    DEVELOPMENT: 'dev',
    RELEASE: 'release',
    TEST: 'test'
};
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
///<reference path='utilities.ts' />
///<reference path='options.ts' />
///<reference path='settings.ts'/>
///<reference path='metrics.ts' />
///<reference path='deflate.ts' />
///<reference path='lzma.ts' />
///<reference path='dataBuffer.ts' />
///<reference path='ShapeData.ts' />
///<reference path='SWFTags.ts' />
///<reference path='binaryFileReader.ts' />
///<reference path='flashlog.ts' />
///<reference path='remoting.ts' />
///<reference path='external.ts' />
var throwError;
var Errors;
//# sourceMappingURL=base.js.map
console.timeEnd('Load Shared Dependencies');
console.time('Load GFX Dependencies');
/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var Shumway;
(function (Shumway) {
    var GFX;
    (function (GFX) {
        var assert = Shumway.Debug.assert;
        var clamp = Shumway.NumberUtilities.clamp;
        var counter = Shumway.Metrics.Counter.instance;
        GFX.frameCounter = new Shumway.Metrics.Counter(true);
        GFX.traceLevel = 2    /* Verbose */;
        GFX.writer = null;
        function frameCount(name) {
            counter.count(name);
            GFX.frameCounter.count(name);
        }
        GFX.frameCount = frameCount;
        GFX.timelineBuffer = Shumway.Tools ? new Shumway.Tools.Profiler.TimelineBuffer('GFX') : null;
        function enterTimeline(name, data) {
            profile && GFX.timelineBuffer && GFX.timelineBuffer.enter(name, data);
        }
        GFX.enterTimeline = enterTimeline;
        function leaveTimeline(name, data) {
            profile && GFX.timelineBuffer && GFX.timelineBuffer.leave(name, data);
        }
        GFX.leaveTimeline = leaveTimeline;
        var nativeAddColorStop = null;
        var nativeCreateLinearGradient = null;
        var nativeCreateRadialGradient = null;
        /**
         * Transforms a fill or stroke style by the given color matrix.
         */
        function transformStyle(context, style, colorMatrix) {
            if (!polyfillColorTransform || !colorMatrix) {
                return style;
            }
            if (typeof style === 'string') {
                // Parse CSS color styles and transform them.
                var rgba = Shumway.ColorUtilities.cssStyleToRGBA(style);
                return Shumway.ColorUtilities.rgbaToCSSStyle(colorMatrix.transformRGBA(rgba));
            } else if (style instanceof CanvasGradient) {
                if (style._template) {
                    // If gradient style has a template, construct a new gradient style from it whith
                    // its color stops transformed.
                    return style._template.createCanvasGradient(context, colorMatrix);
                }
            }
            return style;    // "#ff69b4"
        }
        /**
         * Whether to polyfill color transforms. This adds a |globalColorMatrix| property on |CanvasRenderingContext2D|
         * that is used to transform all stroke and fill styles before a drawing operation happens.
         */
        var polyfillColorTransform = true;
        /**
         * Gradients are opaque objects and their properties cannot be inspected. Here we hijack gradient style constructors
         * and attach "template" objects on gradients so that we can keep track of their position attributes and color stops.
         * Using these "template" objects, we can clone and transform gradients.
         */
        if (polyfillColorTransform && typeof CanvasRenderingContext2D !== 'undefined') {
            nativeAddColorStop = CanvasGradient.prototype.addColorStop;
            nativeCreateLinearGradient = CanvasRenderingContext2D.prototype.createLinearGradient;
            nativeCreateRadialGradient = CanvasRenderingContext2D.prototype.createRadialGradient;
            CanvasRenderingContext2D.prototype.createLinearGradient = function (x0, y0, x1, y1) {
                var gradient = new CanvasLinearGradient(x0, y0, x1, y1);
                return gradient.createCanvasGradient(this, null);
            };
            CanvasRenderingContext2D.prototype.createRadialGradient = function (x0, y0, r0, x1, y1, r1) {
                var gradient = new CanvasRadialGradient(x0, y0, r0, x1, y1, r1);
                return gradient.createCanvasGradient(this, null);
            };
            CanvasGradient.prototype.addColorStop = function (offset, color) {
                nativeAddColorStop.call(this, offset, color);
                this._template.addColorStop(offset, color);
            };
        }
        var ColorStop = function () {
            function ColorStop(offset, color) {
                this.offset = offset;
                this.color = color;    // ...
            }
            return ColorStop;
        }();
        /**
         * Template for linear gradients.
         */
        var CanvasLinearGradient = function () {
            function CanvasLinearGradient(x0, y0, x1, y1) {
                this.x0 = x0;
                this.y0 = y0;
                this.x1 = x1;
                this.y1 = y1;
                this.colorStops = [];    // ...
            }
            CanvasLinearGradient.prototype.addColorStop = function (offset, color) {
                this.colorStops.push(new ColorStop(offset, color));
            };
            CanvasLinearGradient.prototype.createCanvasGradient = function (context, colorMatrix) {
                var gradient = nativeCreateLinearGradient.call(context, this.x0, this.y0, this.x1, this.y1);
                var colorStops = this.colorStops;
                for (var i = 0; i < colorStops.length; i++) {
                    var colorStop = colorStops[i];
                    var offset = colorStop.offset;
                    var color = colorStop.color;
                    color = colorMatrix ? transformStyle(context, color, colorMatrix) : color;
                    nativeAddColorStop.call(gradient, offset, color);
                }
                gradient._template = this;
                gradient._transform = this._transform;
                return gradient;
            };
            return CanvasLinearGradient;
        }();
        /**
         * Template for radial gradients.
         */
        var CanvasRadialGradient = function () {
            function CanvasRadialGradient(x0, y0, r0, x1, y1, r1) {
                this.x0 = x0;
                this.y0 = y0;
                this.r0 = r0;
                this.x1 = x1;
                this.y1 = y1;
                this.r1 = r1;
                this.colorStops = [];    // ...
            }
            CanvasRadialGradient.prototype.addColorStop = function (offset, color) {
                this.colorStops.push(new ColorStop(offset, color));
            };
            CanvasRadialGradient.prototype.createCanvasGradient = function (context, colorMatrix) {
                var gradient = nativeCreateRadialGradient.call(context, this.x0, this.y0, this.r0, this.x1, this.y1, this.r1);
                var colorStops = this.colorStops;
                for (var i = 0; i < colorStops.length; i++) {
                    var colorStop = colorStops[i];
                    var offset = colorStop.offset;
                    var color = colorStop.color;
                    color = colorMatrix ? transformStyle(context, color, colorMatrix) : color;
                    nativeAddColorStop.call(gradient, offset, color);
                }
                gradient._template = this;
                gradient._transform = this._transform;
                return gradient;
            };
            return CanvasRadialGradient;
        }();
        var PathCommand;
        (function (PathCommand) {
            PathCommand[PathCommand['ClosePath'] = 1] = 'ClosePath';
            PathCommand[PathCommand['MoveTo'] = 2] = 'MoveTo';
            PathCommand[PathCommand['LineTo'] = 3] = 'LineTo';
            PathCommand[PathCommand['QuadraticCurveTo'] = 4] = 'QuadraticCurveTo';
            PathCommand[PathCommand['BezierCurveTo'] = 5] = 'BezierCurveTo';
            PathCommand[PathCommand['ArcTo'] = 6] = 'ArcTo';
            PathCommand[PathCommand['Rect'] = 7] = 'Rect';
            PathCommand[PathCommand['Arc'] = 8] = 'Arc';
            PathCommand[PathCommand['Save'] = 9] = 'Save';
            PathCommand[PathCommand['Restore'] = 10] = 'Restore';
            PathCommand[PathCommand['Transform'] = 11] = 'Transform';
        }(PathCommand || (PathCommand = {})));
        /**
         * Polyfill for missing |Path2D|. An instance of this class keeps a record of all drawing commands
         * ever called on it.
         */
        var Path = function () {
            function Path(arg) {
                this._commands = new Uint8Array(Path._arrayBufferPool.acquire(8), 0, 8);
                this._commandPosition = 0;
                this._data = new Float64Array(Path._arrayBufferPool.acquire(8 * Float64Array.BYTES_PER_ELEMENT), 0, 8);
                this._dataPosition = 0;
                if (arg instanceof Path) {
                    this.addPath(arg);
                }
            }
            /**
             * Takes a |Path2D| instance and a 2d context to replay the recorded drawing commands.
             */
            Path._apply = function (path, context) {
                var commands = path._commands;
                var d = path._data;
                var i = 0;
                var j = 0;
                context.beginPath();
                var commandPosition = path._commandPosition;
                while (i < commandPosition) {
                    switch (commands[i++]) {
                    case PathCommand.ClosePath:
                        context.closePath();
                        break;
                    case PathCommand.MoveTo:
                        context.moveTo(d[j++], d[j++]);
                        break;
                    case PathCommand.LineTo:
                        context.lineTo(d[j++], d[j++]);
                        break;
                    case PathCommand.QuadraticCurveTo:
                        context.quadraticCurveTo(d[j++], d[j++], d[j++], d[j++]);
                        break;
                    case PathCommand.BezierCurveTo:
                        context.bezierCurveTo(d[j++], d[j++], d[j++], d[j++], d[j++], d[j++]);
                        break;
                    case PathCommand.ArcTo:
                        context.arcTo(d[j++], d[j++], d[j++], d[j++], d[j++]);
                        break;
                    case PathCommand.Rect:
                        context.rect(d[j++], d[j++], d[j++], d[j++]);
                        break;
                    case PathCommand.Arc:
                        context.arc(d[j++], d[j++], d[j++], d[j++], d[j++], !!d[j++]);
                        break;
                    case PathCommand.Save:
                        context.save();
                        break;
                    case PathCommand.Restore:
                        context.restore();
                        break;
                    case PathCommand.Transform:
                        context.transform(d[j++], d[j++], d[j++], d[j++], d[j++], d[j++]);
                        break;
                    }
                }
            };
            Path.prototype._ensureCommandCapacity = function (length) {
                this._commands = Path._arrayBufferPool.ensureUint8ArrayLength(this._commands, length);
            };
            Path.prototype._ensureDataCapacity = function (length) {
                this._data = Path._arrayBufferPool.ensureFloat64ArrayLength(this._data, length);
            };
            Path.prototype._writeCommand = function (command) {
                if (this._commandPosition >= this._commands.length) {
                    this._ensureCommandCapacity(this._commandPosition + 1);
                }
                this._commands[this._commandPosition++] = command;
            };
            Path.prototype._writeData = function (a, b, c, d, e, f) {
                var argc = arguments.length;
                release || assert(argc <= 6 && (argc % 2 === 0 || argc === 5));
                if (this._dataPosition + argc >= this._data.length) {
                    this._ensureDataCapacity(this._dataPosition + argc);
                }
                var data = this._data;
                var p = this._dataPosition;
                data[p] = a;
                data[p + 1] = b;
                if (argc > 2) {
                    data[p + 2] = c;
                    data[p + 3] = d;
                    if (argc > 4) {
                        data[p + 4] = e;
                        if (argc === 6) {
                            data[p + 5] = f;
                        }
                    }
                }
                this._dataPosition += argc;
            };
            Path.prototype.closePath = function () {
                this._writeCommand(PathCommand.ClosePath);
            };
            Path.prototype.moveTo = function (x, y) {
                this._writeCommand(PathCommand.MoveTo);
                this._writeData(x, y);
            };
            Path.prototype.lineTo = function (x, y) {
                this._writeCommand(PathCommand.LineTo);
                this._writeData(x, y);
            };
            Path.prototype.quadraticCurveTo = function (cpx, cpy, x, y) {
                this._writeCommand(PathCommand.QuadraticCurveTo);
                this._writeData(cpx, cpy, x, y);
            };
            Path.prototype.bezierCurveTo = function (cp1x, cp1y, cp2x, cp2y, x, y) {
                this._writeCommand(PathCommand.BezierCurveTo);
                this._writeData(cp1x, cp1y, cp2x, cp2y, x, y);
            };
            Path.prototype.arcTo = function (x1, y1, x2, y2, radius) {
                this._writeCommand(PathCommand.ArcTo);
                this._writeData(x1, y1, x2, y2, radius);
            };
            Path.prototype.rect = function (x, y, width, height) {
                this._writeCommand(PathCommand.Rect);
                this._writeData(x, y, width, height);
            };
            Path.prototype.arc = function (x, y, radius, startAngle, endAngle, anticlockwise) {
                this._writeCommand(PathCommand.Arc);
                this._writeData(x, y, radius, startAngle, endAngle, +anticlockwise);
            };
            /**
             * Copies and transforms all drawing commands stored in |path|.
             */
            Path.prototype.addPath = function (path, transformation) {
                if (transformation) {
                    this._writeCommand(PathCommand.Save);
                    this._writeCommand(PathCommand.Transform);
                    this._writeData(transformation.a, transformation.b, transformation.c, transformation.d, transformation.e, transformation.f);
                }
                // Copy commands.
                var newCommandPosition = this._commandPosition + path._commandPosition;
                if (newCommandPosition >= this._commands.length) {
                    this._ensureCommandCapacity(newCommandPosition);
                }
                var commands = this._commands;
                var pathCommands = path._commands;
                for (var i = this._commandPosition, j = 0; i < newCommandPosition; i++) {
                    commands[i] = pathCommands[j++];
                }
                this._commandPosition = newCommandPosition;
                // Copy data.
                var newDataPosition = this._dataPosition + path._dataPosition;
                if (newDataPosition >= this._data.length) {
                    this._ensureDataCapacity(newDataPosition);
                }
                var data = this._data;
                var pathData = path._data;
                for (var i = this._dataPosition, j = 0; i < newDataPosition; i++) {
                    data[i] = pathData[j++];
                }
                this._dataPosition = newDataPosition;
                if (transformation) {
                    this._writeCommand(PathCommand.Restore);
                }
            };
            Path._arrayBufferPool = new Shumway.ArrayBufferPool();
            return Path;
        }();
        GFX.Path = Path;
        // Polyfill |Path2D| if it is not defined or if its |addPath| method doesn't exist. This means that we
        // always need to polyfill this in FF until addPath lands which sucks.
        if (typeof CanvasRenderingContext2D !== 'undefined' && (typeof Path2D === 'undefined' || !Path2D.prototype.addPath)) {
            /**
             * We override all methods of |CanvasRenderingContext2D| that accept a |Path2D| object as one
             * of its arguments, so that we can apply all recorded drawing commands before calling the
             * original function.
             */
            var nativeFill = CanvasRenderingContext2D.prototype.fill;
            CanvasRenderingContext2D.prototype.fill = function (path, fillRule) {
                if (arguments.length) {
                    if (path instanceof Path) {
                        Path._apply(path, this);
                    } else {
                        fillRule = path;
                    }
                }
                if (fillRule) {
                    nativeFill.call(this, fillRule);
                } else {
                    nativeFill.call(this);
                }
            };
            var nativeStroke = CanvasRenderingContext2D.prototype.stroke;
            CanvasRenderingContext2D.prototype.stroke = function (path, fillRule) {
                if (arguments.length) {
                    if (path instanceof Path) {
                        Path._apply(path, this);
                    } else {
                        fillRule = path;
                    }
                }
                if (fillRule) {
                    nativeStroke.call(this, fillRule);
                } else {
                    nativeStroke.call(this);
                }
            };
            var nativeClip = CanvasRenderingContext2D.prototype.clip;
            CanvasRenderingContext2D.prototype.clip = function (path, fillRule) {
                if (arguments.length) {
                    if (path instanceof Path) {
                        Path._apply(path, this);
                    } else {
                        fillRule = path;
                    }
                }
                if (fillRule) {
                    nativeClip.call(this, fillRule);
                } else {
                    nativeClip.call(this);
                }
            };
            // Expose our pollyfill to the global object.
            window['Path2D'] = Path;
        }
        if (typeof CanvasPattern !== 'undefined') {
            /**
             * Polyfill |setTransform| on |CanvasPattern| and |CanvasGradient|. Firefox implements this for |CanvasPattern|
             * in Nightly but doesn't for |CanvasGradient| yet.
             *
             * This polyfill uses |Path2D|, which is polyfilled above. You can get a native implementaiton of |Path2D| in
             * Chrome if you enable experimental canvas features in |chrome://flags/|. In Firefox you'll have to wait for
             * https://bugzilla.mozilla.org/show_bug.cgi?id=985801 to land.
             */
            if (Path2D.prototype.addPath) {
                function setTransform(matrix) {
                    this._transform = matrix;
                    if (this._template) {
                        this._template._transform = matrix;
                    }
                }
                if (!CanvasPattern.prototype.setTransform) {
                    CanvasPattern.prototype.setTransform = setTransform;
                }
                if (!CanvasGradient.prototype.setTransform) {
                    CanvasGradient.prototype.setTransform = setTransform;
                }
                var originalFill = CanvasRenderingContext2D.prototype.fill;
                var originalStroke = CanvasRenderingContext2D.prototype.stroke;
                /**
                 * If the current fillStyle is a |CanvasPattern| or |CanvasGradient| that has a SVGMatrix transformed applied to it, we
                 * first apply the pattern's transform to the current context and then draw the path with the
                 * inverse fillStyle transform applied to it so that it is drawn in the expected original location.
                 */
                CanvasRenderingContext2D.prototype.fill = function fill(path, fillRule) {
                    var supportsStyle = this.fillStyle instanceof CanvasPattern || this.fillStyle instanceof CanvasGradient;
                    var hasStyleTransformation = !!this.fillStyle._transform;
                    if (supportsStyle && hasStyleTransformation && path instanceof Path2D) {
                        var m = this.fillStyle._transform;
                        var i;
                        try {
                            i = m.inverse();
                        } catch (e) {
                            i = m = GFX.Geometry.Matrix.createIdentitySVGMatrix();
                        }
                        // Transform the context by the style transform ...
                        this.transform(m.a, m.b, m.c, m.d, m.e, m.f);
                        // transform the path by the inverse of the style transform ...
                        var transformedPath = new Path2D();
                        transformedPath.addPath(path, i);
                        // draw the transformed path, which should render it in its original position but with a transformed style.
                        originalFill.call(this, transformedPath, fillRule);
                        this.transform(i.a, i.b, i.c, i.d, i.e, i.f);
                        return;
                    }
                    if (arguments.length === 0) {
                        originalFill.call(this);
                    } else if (arguments.length === 1) {
                        originalFill.call(this, path);
                    } else if (arguments.length === 2) {
                        originalFill.call(this, path, fillRule);
                    }
                };
                /**
                 * Same as for |fill| above.
                 */
                CanvasRenderingContext2D.prototype.stroke = function stroke(path) {
                    var supportsStyle = this.strokeStyle instanceof CanvasPattern || this.strokeStyle instanceof CanvasGradient;
                    var hasStyleTransformation = !!this.strokeStyle._transform;
                    if (supportsStyle && hasStyleTransformation && path instanceof Path2D) {
                        var m = this.strokeStyle._transform;
                        var i;
                        try {
                            i = m.inverse();
                        } catch (e) {
                            i = m = GFX.Geometry.Matrix.createIdentitySVGMatrix();
                        }
                        // Transform the context by the style transform ...
                        this.transform(m.a, m.b, m.c, m.d, m.e, m.f);
                        // transform the path by the inverse of the style transform ...
                        var transformedPath = new Path2D();
                        transformedPath.addPath(path, i);
                        // Scale the lineWidth down since it will be scaled up by the current transform.
                        var oldLineWidth = this.lineWidth;
                        this.lineWidth *= Math.sqrt((i.a + i.c) * (i.a + i.c) + (i.d + i.b) * (i.d + i.b)) * Math.SQRT1_2;
                        // draw the transformed path, which should render it in its original position but with a transformed style.
                        originalStroke.call(this, transformedPath);
                        this.transform(i.a, i.b, i.c, i.d, i.e, i.f);
                        this.lineWidth = oldLineWidth;
                        return;
                    }
                    if (arguments.length === 0) {
                        originalStroke.call(this);
                    } else if (arguments.length === 1) {
                        originalStroke.call(this, path);
                    }
                };
            }
        }
        if (typeof CanvasRenderingContext2D !== 'undefined') {
            (function () {
                /**
                 * Flash does not go below this number.
                 */
                var MIN_LINE_WIDTH = 1;
                /**
                 * Arbitrarily chosen large number.
                 */
                var MAX_LINE_WIDTH = 1024;
                var hasCurrentTransform = 'currentTransform' in CanvasRenderingContext2D.prototype;
                /**
                 * There's an impedance mismatch between Flash's vector drawing model and that of Canvas2D[1]: Flash applies scaling
                 * of stroke widths once by (depending on settings for the shape) using the concatenated horizontal scaling, vertical
                 * scaling, or a geometric average of the two. The calculated width is then uniformly applied at every point on the
                 * stroke. Canvas2D, OTOH, calculates scaling for each point individually. I.e., horizontal line segments aren't
                 * affected by vertical scaling and vice versa, with non-axis-alined line segments being partly affected.
                 * Additionally, Flash draws all strokes with at least 1px on-stage width, whereas Canvas draws finer-in-appearance
                 * lines by interpolating colors accordingly. To fix both of these, we have to apply any transforms to the geometry
                 * only, not the stroke style. That's only possible by building the untransformed geometry in a Path2D and, each time
                 * we rasterize, adding that with the current concatenated transform applied to a temporary Path2D, which we then draw
                 * in global coordinate space.
                 *
                 * Implements Flash stroking behavior.
                 */
                CanvasRenderingContext2D.prototype.flashStroke = function (path, lineScaleMode) {
                    if (!hasCurrentTransform) {
                        // Chrome doesn't have |currentTransform| yet, so fall back on normal stroking.
                        // |currentTransform| is available only if you enable experimental features.
                        this.stroke(path);
                        return;
                    }
                    var m = this.currentTransform;
                    var transformedPath = new Path2D();
                    // Transform the path by the current transform ...
                    transformedPath.addPath(path, m);
                    var oldLineWidth = this.lineWidth;
                    this.setTransform(1, 0, 0, 1, 0, 0);
                    // We need to scale the |lineWidth| based on the current transform.
                    // If we scale square 1x1 using this transform, it will fit into a
                    // rectangular area, that has sides parallel to the x- and y-axis,
                    // (a + c) x (d + b).
                    switch (lineScaleMode) {
                    case 0    /* None */:
                        break;
                    case 1    /* Normal */:
                        var scale = Math.sqrt((m.a + m.c) * (m.a + m.c) + (m.d + m.b) * (m.d + m.b)) * Math.SQRT1_2;
                        this.lineWidth = clamp(oldLineWidth * scale, MIN_LINE_WIDTH, MAX_LINE_WIDTH);
                        break;
                    case 2    /* Vertical */:
                        var scaleHeight = m.d + m.b;
                        this.lineWidth = clamp(oldLineWidth * scaleHeight, MIN_LINE_WIDTH, MAX_LINE_WIDTH);
                        break;
                    case 3    /* Horizontal */:
                        var scaleWidth = m.a + m.c;
                        this.lineWidth = clamp(oldLineWidth * scaleWidth, MIN_LINE_WIDTH, MAX_LINE_WIDTH);
                        break;
                    }
                    // Stroke and restore the previous matrix.
                    this.stroke(transformedPath);
                    this.setTransform(m.a, m.b, m.c, m.d, m.e, m.f);
                    this.lineWidth = oldLineWidth;
                };
                // A complete polyfill of currentTransform isn't feasible: we want to only use it if it gives
                // us a meaningful value. That we can only get if the platform gives us any means at all to
                // get that value. Gecko does so in the form of mozCurrentTransform, most engines don't.
                // For Chrome, at least return whatever transform was set using setTransform to ensure
                // clipping works in our 2D backend.
                if (!hasCurrentTransform) {
                    if ('mozCurrentTransform' in CanvasRenderingContext2D.prototype) {
                        Object.defineProperty(CanvasRenderingContext2D.prototype, 'currentTransform', { get: mozPolyfillCurrentTransform });
                        hasCurrentTransform = true;
                    } else {
                        var nativeSetTransform = CanvasRenderingContext2D.prototype.setTransform;
                        CanvasRenderingContext2D.prototype.setTransform = function setTransform(a, b, c, d, e, f) {
                            var transform = this.currentTransform;
                            transform.a = a;
                            transform.b = b;
                            transform.c = c;
                            transform.d = d;
                            transform.e = e;
                            transform.f = f;
                            nativeSetTransform.call(this, a, b, c, d, e, f);
                        };
                        Object.defineProperty(CanvasRenderingContext2D.prototype, 'currentTransform', {
                            get: function () {
                                return this._currentTransform || (this._currentTransform = GFX.Geometry.Matrix.createIdentitySVGMatrix());
                            }
                        });
                    }
                }
                function mozPolyfillCurrentTransform() {
                    release || assert(this.mozCurrentTransform);
                    return GFX.Geometry.Matrix.createSVGMatrixFromArray(this.mozCurrentTransform);
                }
            }());
        }
        /**
         * Polyfill |globalColorMatrix| on |CanvasRenderingContext2D|.
         */
        if (typeof CanvasRenderingContext2D !== 'undefined' && CanvasRenderingContext2D.prototype.globalColorMatrix === undefined) {
            var previousFill = CanvasRenderingContext2D.prototype.fill;
            var previousStroke = CanvasRenderingContext2D.prototype.stroke;
            var previousFillText = CanvasRenderingContext2D.prototype.fillText;
            var previousStrokeText = CanvasRenderingContext2D.prototype.strokeText;
            Object.defineProperty(CanvasRenderingContext2D.prototype, 'globalColorMatrix', {
                get: function () {
                    if (this._globalColorMatrix) {
                        return this._globalColorMatrix.clone();
                    }
                    return null;
                },
                set: function (matrix) {
                    if (!matrix) {
                        this._globalColorMatrix = null;
                        return;
                    }
                    if (this._globalColorMatrix) {
                        this._globalColorMatrix.set(matrix);
                    } else {
                        this._globalColorMatrix = matrix.clone();
                    }
                },
                enumerable: true,
                configurable: true
            });
            /**
             * Intercept calls to |fill| and transform fill style if a |globalColorMatrix| is set.
             */
            CanvasRenderingContext2D.prototype.fill = function (a, b) {
                var oldFillStyle = null;
                if (this._globalColorMatrix) {
                    oldFillStyle = this.fillStyle;
                    this.fillStyle = transformStyle(this, this.fillStyle, this._globalColorMatrix);
                }
                if (arguments.length === 0) {
                    previousFill.call(this);
                } else if (arguments.length === 1) {
                    previousFill.call(this, a);
                } else if (arguments.length === 2) {
                    previousFill.call(this, a, b);
                }
                if (oldFillStyle) {
                    this.fillStyle = oldFillStyle;
                }
            };
            /**
             * Same as |fill| above.
             */
            CanvasRenderingContext2D.prototype.stroke = function (a, b) {
                var oldStrokeStyle = null;
                if (this._globalColorMatrix) {
                    oldStrokeStyle = this.strokeStyle;
                    this.strokeStyle = transformStyle(this, this.strokeStyle, this._globalColorMatrix);
                }
                if (arguments.length === 0) {
                    previousStroke.call(this);
                } else if (arguments.length === 1) {
                    previousStroke.call(this, a);
                }
                if (oldStrokeStyle) {
                    this.strokeStyle = oldStrokeStyle;
                }
            };
            /**
             * Same as |fill| above.
             */
            CanvasRenderingContext2D.prototype.fillText = function (text, x, y, maxWidth) {
                var oldFillStyle = null;
                if (this._globalColorMatrix) {
                    oldFillStyle = this.fillStyle;
                    this.fillStyle = transformStyle(this, this.fillStyle, this._globalColorMatrix);
                }
                if (arguments.length === 3) {
                    previousFillText.call(this, text, x, y);
                } else if (arguments.length === 4) {
                    previousFillText.call(this, text, x, y, maxWidth);
                } else {
                    Shumway.Debug.unexpected();
                }
                if (oldFillStyle) {
                    this.fillStyle = oldFillStyle;
                }
            };
            /**
             * Same as |fill| above.
             */
            CanvasRenderingContext2D.prototype.strokeText = function (text, x, y, maxWidth) {
                var oldStrokeStyle = null;
                if (this._globalColorMatrix) {
                    oldStrokeStyle = this.strokeStyle;
                    this.strokeStyle = transformStyle(this, this.strokeStyle, this._globalColorMatrix);
                }
                if (arguments.length === 3) {
                    previousStrokeText.call(this, text, x, y);
                } else if (arguments.length === 4) {
                    previousStrokeText.call(this, text, x, y, maxWidth);
                } else {
                    Shumway.Debug.unexpected();
                }
                if (oldStrokeStyle) {
                    this.strokeStyle = oldStrokeStyle;
                }
            };
        }
        var ScreenShot = function () {
            function ScreenShot(dataURL, w, h, pixelRatio) {
                this.dataURL = dataURL;
                this.w = w;
                this.h = h;
                this.pixelRatio = pixelRatio;    // ...
            }
            return ScreenShot;
        }();
        GFX.ScreenShot = ScreenShot;
    }(GFX = Shumway.GFX || (Shumway.GFX = {})));
    var assert = Shumway.Debug.assert;
    /**
     * Maintains a LRU doubly-linked list.
     */
    var LRUList = function () {
        function LRUList() {
            this._count = 0;
            this._head = this._tail = null;
        }
        Object.defineProperty(LRUList.prototype, 'count', {
            get: function () {
                return this._count;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LRUList.prototype, 'head', {
            /**
             * Gets the node at the front of the list. Returns |null| if the list is empty.
             */
            get: function () {
                return this._head;
            },
            enumerable: true,
            configurable: true
        });
        LRUList.prototype._unshift = function (node) {
            release || assert(!node.next && !node.previous);
            if (this._count === 0) {
                this._head = this._tail = node;
            } else {
                node.next = this._head;
                node.next.previous = node;
                this._head = node;
            }
            this._count++;
        };
        LRUList.prototype._remove = function (node) {
            release || assert(this._count > 0);
            if (node === this._head && node === this._tail) {
                this._head = this._tail = null;
            } else if (node === this._head) {
                this._head = node.next;
                this._head.previous = null;
            } else if (node == this._tail) {
                this._tail = node.previous;
                this._tail.next = null;
            } else {
                node.previous.next = node.next;
                node.next.previous = node.previous;
            }
            node.previous = node.next = null;
            this._count--;
        };
        /**
         * Adds or moves a node to the front of the list.
         */
        LRUList.prototype.use = function (node) {
            if (this._head === node) {
                return;
            }
            if (node.next || node.previous || this._tail === node) {
                this._remove(node);
            }
            this._unshift(node);
        };
        /**
         * Removes a node from the front of the list.
         */
        LRUList.prototype.pop = function () {
            if (!this._tail) {
                return null;
            }
            var node = this._tail;
            this._remove(node);
            return node;
        };
        /**
         * Visits each node in the list in the forward or reverse direction as long as
         * the callback returns |true|;
         */
        LRUList.prototype.visit = function (callback, forward) {
            if (forward === void 0) {
                forward = true;
            }
            var node = forward ? this._head : this._tail;
            while (node) {
                if (!callback(node)) {
                    break;
                }
                node = forward ? node.next : node.previous;
            }
        };
        return LRUList;
    }();
    Shumway.LRUList = LRUList;
    // Registers a default font to render non-spacing and non-marking glyphs for undefined characters in embedded fonts.
    // Embeds the Adobe Blank web font (https://github.com/adobe-fonts/adobe-blank).
    function registerFallbackFont() {
        var style = document.styleSheets[0];
        var rule = '@font-face{font-family:AdobeBlank;src:url("data:font/opentype;base64,T1RUTwAKAIAAAwAgQ0ZGIDTeCDQAACFkAAAZPERTSUcAAAABAABKqAAAAAhPUy8yAF+xmwAAARAAAABgY21hcCRDbtEAAAdcAAAZ6GhlYWQFl9tDAAAArAAAADZoaGVhB1oD7wAAAOQAAAAkaG10eAPoAHwAADqgAAAQBm1heHAIAVAAAAABCAAAAAZuYW1lIE0HkgAAAXAAAAXrcG9zdP+4ADIAACFEAAAAIAABAAAAAQuFfcPHtV8PPPUAAwPoAAAAANFMRfMAAAAA0UxF8wB8/4gDbANwAAAAAwACAAAAAAAAAAEAAANw/4gAAAPoAHwAfANsAAEAAAAAAAAAAAAAAAAAAAACAABQAAgBAAAAAwPoAZAABQAAAooCWAAAAEsCigJYAAABXgAyANwAAAAAAAAAAAAAAAD3/67/+9///w/gAD8AAAAAQURCTwBAAAD//wNw/4gAAANwAHhgLwH/AAAAAAAAAAAAAAAgAAAAAAARANIAAQAAAAAAAQALAAAAAQAAAAAAAgAHAAsAAQAAAAAAAwAbABIAAQAAAAAABAALAAAAAQAAAAAABQA6AC0AAQAAAAAABgAKAGcAAwABBAkAAACUAHEAAwABBAkAAQAWAQUAAwABBAkAAgAOARsAAwABBAkAAwA2ASkAAwABBAkABAAWAQUAAwABBAkABQB0AV8AAwABBAkABgAUAdMAAwABBAkACAA0AecAAwABBAkACwA0AhsAAwABBAkADQKWAk8AAwABBAkADgA0BOVBZG9iZSBCbGFua1JlZ3VsYXIxLjA0NTtBREJPO0Fkb2JlQmxhbms7QURPQkVWZXJzaW9uIDEuMDQ1O1BTIDEuMDQ1O2hvdGNvbnYgMS4wLjgyO21ha2VvdGYubGliMi41LjYzNDA2QWRvYmVCbGFuawBDAG8AcAB5AHIAaQBnAGgAdAAgAKkAIAAyADAAMQAzACwAIAAyADAAMQA1ACAAQQBkAG8AYgBlACAAUwB5AHMAdABlAG0AcwAgAEkAbgBjAG8AcgBwAG8AcgBhAHQAZQBkACAAKABoAHQAdABwADoALwAvAHcAdwB3AC4AYQBkAG8AYgBlAC4AYwBvAG0ALwApAC4AQQBkAG8AYgBlACAAQgBsAGEAbgBrAFIAZQBnAHUAbABhAHIAMQAuADAANAA1ADsAQQBEAEIATwA7AEEAZABvAGIAZQBCAGwAYQBuAGsAOwBBAEQATwBCAEUAVgBlAHIAcwBpAG8AbgAgADEALgAwADQANQA7AFAAUwAgADEALgAwADQANQA7AGgAbwB0AGMAbwBuAHYAIAAxAC4AMAAuADgAMgA7AG0AYQBrAGUAbwB0AGYALgBsAGkAYgAyAC4ANQAuADYAMwA0ADAANgBBAGQAbwBiAGUAQgBsAGEAbgBrAEEAZABvAGIAZQAgAFMAeQBzAHQAZQBtAHMAIABJAG4AYwBvAHIAcABvAHIAYQB0AGUAZABoAHQAdABwADoALwAvAHcAdwB3AC4AYQBkAG8AYgBlAC4AYwBvAG0ALwB0AHkAcABlAC8AVABoAGkAcwAgAEYAbwBuAHQAIABTAG8AZgB0AHcAYQByAGUAIABpAHMAIABsAGkAYwBlAG4AcwBlAGQAIAB1AG4AZABlAHIAIAB0AGgAZQAgAFMASQBMACAATwBwAGUAbgAgAEYAbwBuAHQAIABMAGkAYwBlAG4AcwBlACwAIABWAGUAcgBzAGkAbwBuACAAMQAuADEALgAgAFQAaABpAHMAIABGAG8AbgB0ACAAUwBvAGYAdAB3AGEAcgBlACAAaQBzACAAZABpAHMAdAByAGkAYgB1AHQAZQBkACAAbwBuACAAYQBuACAAIgBBAFMAIABJAFMAIgAgAEIAQQBTAEkAUwAsACAAVwBJAFQASABPAFUAVAAgAFcAQQBSAFIAQQBOAFQASQBFAFMAIABPAFIAIABDAE8ATgBEAEkAVABJAE8ATgBTACAATwBGACAAQQBOAFkAIABLAEkATgBEACwAIABlAGkAdABoAGUAcgAgAGUAeABwAHIAZQBzAHMAIABvAHIAIABpAG0AcABsAGkAZQBkAC4AIABTAGUAZQAgAHQAaABlACAAUwBJAEwAIABPAHAAZQBuACAARgBvAG4AdAAgAEwAaQBjAGUAbgBzAGUAIABmAG8AcgAgAHQAaABlACAAcwBwAGUAYwBpAGYAaQBjACAAbABhAG4AZwB1AGEAZwBlACwAIABwAGUAcgBtAGkAcwBzAGkAbwBuAHMAIABhAG4AZAAgAGwAaQBtAGkAdABhAHQAaQBvAG4AcwAgAGcAbwB2AGUAcgBuAGkAbgBnACAAeQBvAHUAcgAgAHUAcwBlACAAbwBmACAAdABoAGkAcwAgAEYAbwBuAHQAIABTAG8AZgB0AHcAYQByAGUALgBoAHQAdABwADoALwAvAHMAYwByAGkAcAB0AHMALgBzAGkAbAAuAG8AcgBnAC8ATwBGAEwAAAAABQAAAAMAAAA4AAAABAAAAFgAAQAAAAAALAADAAEAAAA4AAMACgAAAFgABgAMAAAAAAABAAAABAAgAAAABAAEAAEAAAf///8AAAAA//8AAQABAAAAAAAMAAAAABmQAAAAAAAAAiAAAAAAAAAH/wAAAAEAAAgAAAAP/wAAAAEAABAAAAAX/wAAAAEAABgAAAAf/wAAAAEAACAAAAAn/wAAAAEAACgAAAAv/wAAAAEAADAAAAA3/wAAAAEAADgAAAA//wAAAAEAAEAAAABH/wAAAAEAAEgAAABP/wAAAAEAAFAAAABX/wAAAAEAAFgAAABf/wAAAAEAAGAAAABn/wAAAAEAAGgAAABv/wAAAAEAAHAAAAB3/wAAAAEAAHgAAAB//wAAAAEAAIAAAACH/wAAAAEAAIgAAACP/wAAAAEAAJAAAACX/wAAAAEAAJgAAACf/wAAAAEAAKAAAACn/wAAAAEAAKgAAACv/wAAAAEAALAAAAC3/wAAAAEAALgAAAC//wAAAAEAAMAAAADH/wAAAAEAAMgAAADP/wAAAAEAANAAAADX/wAAAAEAAOAAAADn/wAAAAEAAOgAAADv/wAAAAEAAPAAAAD3/wAAAAEAAPgAAAD9zwAAAAEAAP3wAAD//QAABfEAAQAAAAEH/wAAAAEAAQgAAAEP/wAAAAEAARAAAAEX/wAAAAEAARgAAAEf/wAAAAEAASAAAAEn/wAAAAEAASgAAAEv/wAAAAEAATAAAAE3/wAAAAEAATgAAAE//wAAAAEAAUAAAAFH/wAAAAEAAUgAAAFP/wAAAAEAAVAAAAFX/wAAAAEAAVgAAAFf/wAAAAEAAWAAAAFn/wAAAAEAAWgAAAFv/wAAAAEAAXAAAAF3/wAAAAEAAXgAAAF//wAAAAEAAYAAAAGH/wAAAAEAAYgAAAGP/wAAAAEAAZAAAAGX/wAAAAEAAZgAAAGf/wAAAAEAAaAAAAGn/wAAAAEAAagAAAGv/wAAAAEAAbAAAAG3/wAAAAEAAbgAAAG//wAAAAEAAcAAAAHH/wAAAAEAAcgAAAHP/wAAAAEAAdAAAAHX/wAAAAEAAdgAAAHf/wAAAAEAAeAAAAHn/wAAAAEAAegAAAHv/wAAAAEAAfAAAAH3/wAAAAEAAfgAAAH//QAAAAEAAgAAAAIH/wAAAAEAAggAAAIP/wAAAAEAAhAAAAIX/wAAAAEAAhgAAAIf/wAAAAEAAiAAAAIn/wAAAAEAAigAAAIv/wAAAAEAAjAAAAI3/wAAAAEAAjgAAAI//wAAAAEAAkAAAAJH/wAAAAEAAkgAAAJP/wAAAAEAAlAAAAJX/wAAAAEAAlgAAAJf/wAAAAEAAmAAAAJn/wAAAAEAAmgAAAJv/wAAAAEAAnAAAAJ3/wAAAAEAAngAAAJ//wAAAAEAAoAAAAKH/wAAAAEAAogAAAKP/wAAAAEAApAAAAKX/wAAAAEAApgAAAKf/wAAAAEAAqAAAAKn/wAAAAEAAqgAAAKv/wAAAAEAArAAAAK3/wAAAAEAArgAAAK//wAAAAEAAsAAAALH/wAAAAEAAsgAAALP/wAAAAEAAtAAAALX/wAAAAEAAtgAAALf/wAAAAEAAuAAAALn/wAAAAEAAugAAALv/wAAAAEAAvAAAAL3/wAAAAEAAvgAAAL//QAAAAEAAwAAAAMH/wAAAAEAAwgAAAMP/wAAAAEAAxAAAAMX/wAAAAEAAxgAAAMf/wAAAAEAAyAAAAMn/wAAAAEAAygAAAMv/wAAAAEAAzAAAAM3/wAAAAEAAzgAAAM//wAAAAEAA0AAAANH/wAAAAEAA0gAAANP/wAAAAEAA1AAAANX/wAAAAEAA1gAAANf/wAAAAEAA2AAAANn/wAAAAEAA2gAAANv/wAAAAEAA3AAAAN3/wAAAAEAA3gAAAN//wAAAAEAA4AAAAOH/wAAAAEAA4gAAAOP/wAAAAEAA5AAAAOX/wAAAAEAA5gAAAOf/wAAAAEAA6AAAAOn/wAAAAEAA6gAAAOv/wAAAAEAA7AAAAO3/wAAAAEAA7gAAAO//wAAAAEAA8AAAAPH/wAAAAEAA8gAAAPP/wAAAAEAA9AAAAPX/wAAAAEAA9gAAAPf/wAAAAEAA+AAAAPn/wAAAAEAA+gAAAPv/wAAAAEAA/AAAAP3/wAAAAEAA/gAAAP//QAAAAEABAAAAAQH/wAAAAEABAgAAAQP/wAAAAEABBAAAAQX/wAAAAEABBgAAAQf/wAAAAEABCAAAAQn/wAAAAEABCgAAAQv/wAAAAEABDAAAAQ3/wAAAAEABDgAAAQ//wAAAAEABEAAAARH/wAAAAEABEgAAARP/wAAAAEABFAAAARX/wAAAAEABFgAAARf/wAAAAEABGAAAARn/wAAAAEABGgAAARv/wAAAAEABHAAAAR3/wAAAAEABHgAAAR//wAAAAEABIAAAASH/wAAAAEABIgAAASP/wAAAAEABJAAAASX/wAAAAEABJgAAASf/wAAAAEABKAAAASn/wAAAAEABKgAAASv/wAAAAEABLAAAAS3/wAAAAEABLgAAAS//wAAAAEABMAAAATH/wAAAAEABMgAAATP/wAAAAEABNAAAATX/wAAAAEABNgAAATf/wAAAAEABOAAAATn/wAAAAEABOgAAATv/wAAAAEABPAAAAT3/wAAAAEABPgAAAT//QAAAAEABQAAAAUH/wAAAAEABQgAAAUP/wAAAAEABRAAAAUX/wAAAAEABRgAAAUf/wAAAAEABSAAAAUn/wAAAAEABSgAAAUv/wAAAAEABTAAAAU3/wAAAAEABTgAAAU//wAAAAEABUAAAAVH/wAAAAEABUgAAAVP/wAAAAEABVAAAAVX/wAAAAEABVgAAAVf/wAAAAEABWAAAAVn/wAAAAEABWgAAAVv/wAAAAEABXAAAAV3/wAAAAEABXgAAAV//wAAAAEABYAAAAWH/wAAAAEABYgAAAWP/wAAAAEABZAAAAWX/wAAAAEABZgAAAWf/wAAAAEABaAAAAWn/wAAAAEABagAAAWv/wAAAAEABbAAAAW3/wAAAAEABbgAAAW//wAAAAEABcAAAAXH/wAAAAEABcgAAAXP/wAAAAEABdAAAAXX/wAAAAEABdgAAAXf/wAAAAEABeAAAAXn/wAAAAEABegAAAXv/wAAAAEABfAAAAX3/wAAAAEABfgAAAX//QAAAAEABgAAAAYH/wAAAAEABggAAAYP/wAAAAEABhAAAAYX/wAAAAEABhgAAAYf/wAAAAEABiAAAAYn/wAAAAEABigAAAYv/wAAAAEABjAAAAY3/wAAAAEABjgAAAY//wAAAAEABkAAAAZH/wAAAAEABkgAAAZP/wAAAAEABlAAAAZX/wAAAAEABlgAAAZf/wAAAAEABmAAAAZn/wAAAAEABmgAAAZv/wAAAAEABnAAAAZ3/wAAAAEABngAAAZ//wAAAAEABoAAAAaH/wAAAAEABogAAAaP/wAAAAEABpAAAAaX/wAAAAEABpgAAAaf/wAAAAEABqAAAAan/wAAAAEABqgAAAav/wAAAAEABrAAAAa3/wAAAAEABrgAAAa//wAAAAEABsAAAAbH/wAAAAEABsgAAAbP/wAAAAEABtAAAAbX/wAAAAEABtgAAAbf/wAAAAEABuAAAAbn/wAAAAEABugAAAbv/wAAAAEABvAAAAb3/wAAAAEABvgAAAb//QAAAAEABwAAAAcH/wAAAAEABwgAAAcP/wAAAAEABxAAAAcX/wAAAAEABxgAAAcf/wAAAAEAByAAAAcn/wAAAAEABygAAAcv/wAAAAEABzAAAAc3/wAAAAEABzgAAAc//wAAAAEAB0AAAAdH/wAAAAEAB0gAAAdP/wAAAAEAB1AAAAdX/wAAAAEAB1gAAAdf/wAAAAEAB2AAAAdn/wAAAAEAB2gAAAdv/wAAAAEAB3AAAAd3/wAAAAEAB3gAAAd//wAAAAEAB4AAAAeH/wAAAAEAB4gAAAeP/wAAAAEAB5AAAAeX/wAAAAEAB5gAAAef/wAAAAEAB6AAAAen/wAAAAEAB6gAAAev/wAAAAEAB7AAAAe3/wAAAAEAB7gAAAe//wAAAAEAB8AAAAfH/wAAAAEAB8gAAAfP/wAAAAEAB9AAAAfX/wAAAAEAB9gAAAff/wAAAAEAB+AAAAfn/wAAAAEAB+gAAAfv/wAAAAEAB/AAAAf3/wAAAAEAB/gAAAf//QAAAAEACAAAAAgH/wAAAAEACAgAAAgP/wAAAAEACBAAAAgX/wAAAAEACBgAAAgf/wAAAAEACCAAAAgn/wAAAAEACCgAAAgv/wAAAAEACDAAAAg3/wAAAAEACDgAAAg//wAAAAEACEAAAAhH/wAAAAEACEgAAAhP/wAAAAEACFAAAAhX/wAAAAEACFgAAAhf/wAAAAEACGAAAAhn/wAAAAEACGgAAAhv/wAAAAEACHAAAAh3/wAAAAEACHgAAAh//wAAAAEACIAAAAiH/wAAAAEACIgAAAiP/wAAAAEACJAAAAiX/wAAAAEACJgAAAif/wAAAAEACKAAAAin/wAAAAEACKgAAAiv/wAAAAEACLAAAAi3/wAAAAEACLgAAAi//wAAAAEACMAAAAjH/wAAAAEACMgAAAjP/wAAAAEACNAAAAjX/wAAAAEACNgAAAjf/wAAAAEACOAAAAjn/wAAAAEACOgAAAjv/wAAAAEACPAAAAj3/wAAAAEACPgAAAj//QAAAAEACQAAAAkH/wAAAAEACQgAAAkP/wAAAAEACRAAAAkX/wAAAAEACRgAAAkf/wAAAAEACSAAAAkn/wAAAAEACSgAAAkv/wAAAAEACTAAAAk3/wAAAAEACTgAAAk//wAAAAEACUAAAAlH/wAAAAEACUgAAAlP/wAAAAEACVAAAAlX/wAAAAEACVgAAAlf/wAAAAEACWAAAAln/wAAAAEACWgAAAlv/wAAAAEACXAAAAl3/wAAAAEACXgAAAl//wAAAAEACYAAAAmH/wAAAAEACYgAAAmP/wAAAAEACZAAAAmX/wAAAAEACZgAAAmf/wAAAAEACaAAAAmn/wAAAAEACagAAAmv/wAAAAEACbAAAAm3/wAAAAEACbgAAAm//wAAAAEACcAAAAnH/wAAAAEACcgAAAnP/wAAAAEACdAAAAnX/wAAAAEACdgAAAnf/wAAAAEACeAAAAnn/wAAAAEACegAAAnv/wAAAAEACfAAAAn3/wAAAAEACfgAAAn//QAAAAEACgAAAAoH/wAAAAEACggAAAoP/wAAAAEAChAAAAoX/wAAAAEAChgAAAof/wAAAAEACiAAAAon/wAAAAEACigAAAov/wAAAAEACjAAAAo3/wAAAAEACjgAAAo//wAAAAEACkAAAApH/wAAAAEACkgAAApP/wAAAAEAClAAAApX/wAAAAEAClgAAApf/wAAAAEACmAAAApn/wAAAAEACmgAAApv/wAAAAEACnAAAAp3/wAAAAEACngAAAp//wAAAAEACoAAAAqH/wAAAAEACogAAAqP/wAAAAEACpAAAAqX/wAAAAEACpgAAAqf/wAAAAEACqAAAAqn/wAAAAEACqgAAAqv/wAAAAEACrAAAAq3/wAAAAEACrgAAAq//wAAAAEACsAAAArH/wAAAAEACsgAAArP/wAAAAEACtAAAArX/wAAAAEACtgAAArf/wAAAAEACuAAAArn/wAAAAEACugAAArv/wAAAAEACvAAAAr3/wAAAAEACvgAAAr//QAAAAEACwAAAAsH/wAAAAEACwgAAAsP/wAAAAEACxAAAAsX/wAAAAEACxgAAAsf/wAAAAEACyAAAAsn/wAAAAEACygAAAsv/wAAAAEACzAAAAs3/wAAAAEACzgAAAs//wAAAAEAC0AAAAtH/wAAAAEAC0gAAAtP/wAAAAEAC1AAAAtX/wAAAAEAC1gAAAtf/wAAAAEAC2AAAAtn/wAAAAEAC2gAAAtv/wAAAAEAC3AAAAt3/wAAAAEAC3gAAAt//wAAAAEAC4AAAAuH/wAAAAEAC4gAAAuP/wAAAAEAC5AAAAuX/wAAAAEAC5gAAAuf/wAAAAEAC6AAAAun/wAAAAEAC6gAAAuv/wAAAAEAC7AAAAu3/wAAAAEAC7gAAAu//wAAAAEAC8AAAAvH/wAAAAEAC8gAAAvP/wAAAAEAC9AAAAvX/wAAAAEAC9gAAAvf/wAAAAEAC+AAAAvn/wAAAAEAC+gAAAvv/wAAAAEAC/AAAAv3/wAAAAEAC/gAAAv//QAAAAEADAAAAAwH/wAAAAEADAgAAAwP/wAAAAEADBAAAAwX/wAAAAEADBgAAAwf/wAAAAEADCAAAAwn/wAAAAEADCgAAAwv/wAAAAEADDAAAAw3/wAAAAEADDgAAAw//wAAAAEADEAAAAxH/wAAAAEADEgAAAxP/wAAAAEADFAAAAxX/wAAAAEADFgAAAxf/wAAAAEADGAAAAxn/wAAAAEADGgAAAxv/wAAAAEADHAAAAx3/wAAAAEADHgAAAx//wAAAAEADIAAAAyH/wAAAAEADIgAAAyP/wAAAAEADJAAAAyX/wAAAAEADJgAAAyf/wAAAAEADKAAAAyn/wAAAAEADKgAAAyv/wAAAAEADLAAAAy3/wAAAAEADLgAAAy//wAAAAEADMAAAAzH/wAAAAEADMgAAAzP/wAAAAEADNAAAAzX/wAAAAEADNgAAAzf/wAAAAEADOAAAAzn/wAAAAEADOgAAAzv/wAAAAEADPAAAAz3/wAAAAEADPgAAAz//QAAAAEADQAAAA0H/wAAAAEADQgAAA0P/wAAAAEADRAAAA0X/wAAAAEADRgAAA0f/wAAAAEADSAAAA0n/wAAAAEADSgAAA0v/wAAAAEADTAAAA03/wAAAAEADTgAAA0//wAAAAEADUAAAA1H/wAAAAEADUgAAA1P/wAAAAEADVAAAA1X/wAAAAEADVgAAA1f/wAAAAEADWAAAA1n/wAAAAEADWgAAA1v/wAAAAEADXAAAA13/wAAAAEADXgAAA1//wAAAAEADYAAAA2H/wAAAAEADYgAAA2P/wAAAAEADZAAAA2X/wAAAAEADZgAAA2f/wAAAAEADaAAAA2n/wAAAAEADagAAA2v/wAAAAEADbAAAA23/wAAAAEADbgAAA2//wAAAAEADcAAAA3H/wAAAAEADcgAAA3P/wAAAAEADdAAAA3X/wAAAAEADdgAAA3f/wAAAAEADeAAAA3n/wAAAAEADegAAA3v/wAAAAEADfAAAA33/wAAAAEADfgAAA3//QAAAAEADgAAAA4H/wAAAAEADggAAA4P/wAAAAEADhAAAA4X/wAAAAEADhgAAA4f/wAAAAEADiAAAA4n/wAAAAEADigAAA4v/wAAAAEADjAAAA43/wAAAAEADjgAAA4//wAAAAEADkAAAA5H/wAAAAEADkgAAA5P/wAAAAEADlAAAA5X/wAAAAEADlgAAA5f/wAAAAEADmAAAA5n/wAAAAEADmgAAA5v/wAAAAEADnAAAA53/wAAAAEADngAAA5//wAAAAEADoAAAA6H/wAAAAEADogAAA6P/wAAAAEADpAAAA6X/wAAAAEADpgAAA6f/wAAAAEADqAAAA6n/wAAAAEADqgAAA6v/wAAAAEADrAAAA63/wAAAAEADrgAAA6//wAAAAEADsAAAA7H/wAAAAEADsgAAA7P/wAAAAEADtAAAA7X/wAAAAEADtgAAA7f/wAAAAEADuAAAA7n/wAAAAEADugAAA7v/wAAAAEADvAAAA73/wAAAAEADvgAAA7//QAAAAEADwAAAA8H/wAAAAEADwgAAA8P/wAAAAEADxAAAA8X/wAAAAEADxgAAA8f/wAAAAEADyAAAA8n/wAAAAEADygAAA8v/wAAAAEADzAAAA83/wAAAAEADzgAAA8//wAAAAEAD0AAAA9H/wAAAAEAD0gAAA9P/wAAAAEAD1AAAA9X/wAAAAEAD1gAAA9f/wAAAAEAD2AAAA9n/wAAAAEAD2gAAA9v/wAAAAEAD3AAAA93/wAAAAEAD3gAAA9//wAAAAEAD4AAAA+H/wAAAAEAD4gAAA+P/wAAAAEAD5AAAA+X/wAAAAEAD5gAAA+f/wAAAAEAD6AAAA+n/wAAAAEAD6gAAA+v/wAAAAEAD7AAAA+3/wAAAAEAD7gAAA+//wAAAAEAD8AAAA/H/wAAAAEAD8gAAA/P/wAAAAEAD9AAAA/X/wAAAAEAD9gAAA/f/wAAAAEAD+AAAA/n/wAAAAEAD+gAAA/v/wAAAAEAD/AAAA/3/wAAAAEAD/gAAA///QAAAAEAEAAAABAH/wAAAAEAEAgAABAP/wAAAAEAEBAAABAX/wAAAAEAEBgAABAf/wAAAAEAECAAABAn/wAAAAEAECgAABAv/wAAAAEAEDAAABA3/wAAAAEAEDgAABA//wAAAAEAEEAAABBH/wAAAAEAEEgAABBP/wAAAAEAEFAAABBX/wAAAAEAEFgAABBf/wAAAAEAEGAAABBn/wAAAAEAEGgAABBv/wAAAAEAEHAAABB3/wAAAAEAEHgAABB//wAAAAEAEIAAABCH/wAAAAEAEIgAABCP/wAAAAEAEJAAABCX/wAAAAEAEJgAABCf/wAAAAEAEKAAABCn/wAAAAEAEKgAABCv/wAAAAEAELAAABC3/wAAAAEAELgAABC//wAAAAEAEMAAABDH/wAAAAEAEMgAABDP/wAAAAEAENAAABDX/wAAAAEAENgAABDf/wAAAAEAEOAAABDn/wAAAAEAEOgAABDv/wAAAAEAEPAAABD3/wAAAAEAEPgAABD//QAAAAEAAwAAAAAAAP+1ADIAAAAAAAAAAAAAAAAAAAAAAAAAAAEABAIAAQEBC0Fkb2JlQmxhbmsAAQEBMPgb+ByLDB74HQH4HgKL+wz6APoEBR4aBF8MHxwIAQwi91UP92IR91oMJRwZHwwkAAUBAQYOVmFwQWRvYmVJZGVudGl0eUNvcHlyaWdodCAyMDEzLCAyMDE1IEFkb2JlIFN5c3RlbXMgSW5jb3Jwb3JhdGVkIChodHRwOi8vd3d3LmFkb2JlLmNvbS8pLkFkb2JlIEJsYW5rQWRvYmVCbGFuay0yMDQ5AAACAAEH/wMAAQAAAAgBCAECAAEASwBMAE0ATgBPAFAAUQBSAFMAVABVAFYAVwBYAFkAWgBbAFwAXQBeAF8AYABhAGIAYwBkAGUAZgBnAGgAaQBqAGsAbABtAG4AbwBwAHEAcgBzAHQAdQB2AHcAeAB5AHoAewB8AH0AfgB/AIAAgQCCAIMAhACFAIYAhwCIAIkAigCLAIwAjQCOAI8AkACRAJIAkwCUAJUAlgCXAJgAmQCaAJsAnACdAJ4AnwCgAKEAogCjAKQApQCmAKcAqACpAKoAqwCsAK0ArgCvALAAsQCyALMAtAC1ALYAtwC4ALkAugC7ALwAvQC+AL8AwADBAMIAwwDEAMUAxgDHAMgAyQDKAMsAzADNAM4AzwDQANEA0gDTANQA1QDWANcA2ADZANoA2wDcAN0A3gDfAOAA4QDiAOMA5ADlAOYA5wDoAOkA6gDrAOwA7QDuAO8A8ADxAPIA8wD0APUA9gD3APgA+QD6APsA/AD9AP4A/wEAAQEBAgEDAQQBBQEGAQcBCAEJAQoBCwEMAQ0BDgEPARABEQESARMBFAEVARYBFwEYARkBGgEbARwBHQEeAR8BIAEhASIBIwEkASUBJgEnASgBKQEqASsBLAEtAS4BLwEwATEBMgEzATQBNQE2ATcBOAE5AToBOwE8AT0BPgE/AUABQQFCAUMBRAFFAUYBRwFIAUkBSgFLAUwBTQFOAU8BUAFRAVIBUwFUAVUBVgFXAVgBWQFaAVsBXAFdAV4BXwFgAWEBYgFjAWQBZQFmAWcBaAFpAWoBawFsAW0BbgFvAXABcQFyAXMBdAF1AXYBdwF4AXkBegF7AXwBfQF+AX8BgAGBAYIBgwGEAYUBhgGHAYgBiQGKAYsBjAGNAY4BjwGQAZEBkgGTAZQBlQGWAZcBmAGZAZoBmwGcAZ0BngGfAaABoQGiAaMBpAGlAaYBpwGoAakBqgGrAawBrQGuAa8BsAGxAbIBswG0AbUBtgG3AbgBuQG6AbsBvAG9Ab4BvwHAAcEBwgHDAcQBxQHGAccByAHJAcoBywHMAc0BzgHPAdAB0QHSAdMB1AHVAdYB1wHYAdkB2gHbAdwB3QHeAd8B4AHhAeIB4wHkAeUB5gHnAegB6QHqAesB7AHtAe4B7wHwAfEB8gHzAfQB9QH2AfcB+AH5AfoB+wH8Af0B/gH/AgACAQICAgMCBAIFAgYCBwIIAgkCCgILAgwCDQIOAg8CEAIRAhICEwIUAhUCFgIXAhgCGQIaAhsCHAIdAh4CHwIgAiECIgIjAiQCJQImAicCKAIpAioCKwIsAi0CLgIvAjACMQIyAjMCNAI1AjYCNwI4AjkCOgI7AjwCPQI+Aj8CQAJBAkICQwJEAkUCRgJHAkgCSQJKAksCTAJNAk4CTwJQAlECUgJTAlQCVQJWAlcCWAJZAloCWwJcAl0CXgJfAmACYQJiAmMCZAJlAmYCZwJoAmkCagJrAmwCbQJuAm8CcAJxAnICcwJ0AnUCdgJ3AngCeQJ6AnsCfAJ9An4CfwKAAoECggKDAoQChQKGAocCiAKJAooCiwKMAo0CjgKPApACkQKSApMClAKVApYClwKYApkCmgKbApwCnQKeAp8CoAKhAqICowKkAqUCpgKnAqgCqQKqAqsCrAKtAq4CrwKwArECsgKzArQCtQK2ArcCuAK5AroCuwK8Ar0CvgK/AsACwQLCAsMCxALFAsYCxwLIAskCygLLAswCzQLOAs8C0ALRAtIC0wLUAtUC1gLXAtgC2QLaAtsC3ALdAt4C3wLgAuEC4gLjAuQC5QLmAucC6ALpAuoC6wLsAu0C7gLvAvAC8QLyAvMC9AL1AvYC9wL4AvkC+gL7AvwC/QL+Av8DAAMBAwIDAwMEAwUDBgMHAwgDCQMKAwsDDAMNAw4DDwMQAxEDEgMTAxQDFQMWAxcDGAMZAxoDGwMcAx0DHgMfAyADIQMiAyMDJAMlAyYDJwMoAykDKgMrAywDLQMuAy8DMAMxAzIDMwM0AzUDNgM3AzgDOQM6AzsDPAM9Az4DPwNAA0EDQgNDA0QDRQNGA0cDSANJA0oDSwNMA00DTgNPA1ADUQNSA1MDVANVA1YDVwNYA1kDWgNbA1wDXQNeA18DYANhA2IDYwNkA2UDZgNnA2gDaQNqA2sDbANtA24DbwNwA3EDcgNzA3QDdQN2A3cDeAN5A3oDewN8A30DfgN/A4ADgQOCA4MDhAOFA4YDhwOIA4kDigOLA4wDjQOOA48DkAORA5IDkwOUA5UDlgOXA5gDmQOaA5sDnAOdA54DnwOgA6EDogOjA6QDpQOmA6cDqAOpA6oDqwOsA60DrgOvA7ADsQOyA7MDtAO1A7YDtwO4A7kDugO7A7wDvQO+A78DwAPBA8IDwwPEA8UDxgPHA8gDyQPKA8sDzAPNA84DzwPQA9ED0gPTA9QD1QPWA9cD2APZA9oD2wPcA90D3gPfA+AD4QPiA+MD5APlA+YD5wPoA+kD6gPrA+wD7QPuA+8D8APxA/ID8wP0A/UD9gP3A/gD+QP6A/sD/AP9A/4D/wQABAEEAgQDBAQEBQQGBAcECAQJBAoECwQMBA0EDgQPBBAEEQQSBBMEFAQVBBYEFwQYBBkEGgQbBBwEHQQeBB8EIAQhBCIEIwQkBCUEJgQnBCgEKQQqBCsELAQtBC4ELwQwBDEEMgQzBDQENQQ2BDcEOAQ5BDoEOwQ8BD0EPgQ/BEAEQQRCBEMERARFBEYERwRIBEkESgRLBEwETQROBE8EUARRBFIEUwRUBFUEVgRXBFgEWQRaBFsEXARdBF4EXwRgBGEEYgRjBGQEZQRmBGcEaARpBGoEawRsBG0EbgRvBHAEcQRyBHMEdAR1BHYEdwR4BHkEegR7BHwEfQR+BH8EgASBBIIEgwSEBIUEhgSHBIgEiQSKBIsEjASNBI4EjwSQBJEEkgSTBJQElQSWBJcEmASZBJoEmwScBJ0EngSfBKAEoQSiBKMEpASlBKYEpwSoBKkEqgSrBKwErQSuBK8EsASxBLIEswS0BLUEtgS3BLgEuQS6BLsEvAS9BL4EvwTABMEEwgTDBMQExQTGBMcEyATJBMoEywTMBM0EzgTPBNAE0QTSBNME1ATVBNYE1wTYBNkE2gTbBNwE3QTeBN8E4AThBOIE4wTkBOUE5gTnBOgE6QTqBOsE7ATtBO4E7wTwBPEE8gTzBPQE9QT2BPcE+AT5BPoE+wT8BP0E/gT/BQAFAQUCBQMFBAUFBQYFBwUIBQkFCgULBQwFDQUOBQ8FEAURBRIFEwUUBRUFFgUXBRgFGQUaBRsFHAUdBR4FHwUgBSEFIgUjBSQFJQUmBScFKAUpBSoFKwUsBS0FLgUvBTAFMQUyBTMFNAU1BTYFNwU4BTkFOgU7BTwFPQU+BT8FQAVBBUIFQwVEBUUFRgVHBUgFSQVKBUsFTAVNBU4FTwVQBVEFUgVTBVQFVQVWBVcFWAVZBVoFWwVcBV0FXgVfBWAFYQViBWMFZAVlBWYFZwVoBWkFagVrBWwFbQVuBW8FcAVxBXIFcwV0BXUFdgV3BXgFeQV6BXsFfAV9BX4FfwWABYEFggWDBYQFhQWGBYcFiAWJBYoFiwWMBY0FjgWPBZAFkQWSBZMFlAWVBZYFlwWYBZkFmgWbBZwFnQWeBZ8FoAWhBaIFowWkBaUFpgWnBagFqQWqBasFrAWtBa4FrwWwBbEFsgWzBbQFtQW2BbcFuAW5BboFuwW8Bb0FvgW/BcAFwQXCBcMFxAXFBcYFxwXIBckFygXLBcwFzQXOBc8F0AXRBdIF0wXUBdUF1gXXBdgF2QXaBdsF3AXdBd4F3wXgBeEF4gXjBeQF5QXmBecF6AXpBeoF6wXsBe0F7gXvBfAF8QXyBfMF9AX1BfYF9wX4BfkF+gX7BfwF/QX+Bf8GAAYBBgIGAwYEBgUGBgYHBggGCQYKBgsGDAYNBg4GDwYQBhEGEgYTBhQGFQYWBhcGGAYZBhoGGwYcBh0GHgYfBiAGIQYiBiMGJAYlBiYGJwYoBikGKgYrBiwGLQYuBi8GMAYxBjIGMwY0BjUGNgY3BjgGOQY6BjsGPAY9Bj4GPwZABkEGQgZDBkQGRQZGBkcGSAZJBkoGSwZMBk0GTgZPBlAGUQZSBlMGVAZVBlYGVwZYBlkGWgZbBlwGXQZeBl8GYAZhBmIGYwZkBmUGZgZnBmgGaQZqBmsGbAZtBm4GbwZwBnEGcgZzBnQGdQZ2BncGeAZ5BnoGewZ8Bn0GfgZ/BoAGgQaCBoMGhAaFBoYGhwaIBokGigaLBowGjQaOBo8GkAaRBpIGkwaUBpUGlgaXBpgGmQaaBpsGnAadBp4GnwagBqEGogajBqQGpQamBqcGqAapBqoGqwasBq0GrgavBrAGsQayBrMGtAa1BrYGtwa4BrkGuga7BrwGvQa+Br8GwAbBBsIGwwbEBsUGxgbHBsgGyQbKBssGzAbNBs4GzwbQBtEG0gbTBtQG1QbWBtcG2AbZBtoG2wbcBt0G3gbfBuAG4QbiBuMG5AblBuYG5wboBukG6gbrBuwG7QbuBu8G8AbxBvIG8wb0BvUG9gb3BvgG+Qb6BvsG/Ab9Bv4G/wcABwEHAgcDBwQHBQcGBwcHCAcJBwoHCwcMBw0HDgcPBxAHEQcSBxMHFAcVBxYHFwcYBxkHGgcbBxwHHQceBx8HIAchByIHIwckByUHJgcnBygHKQcqBysHLActBy4HLwcwBzEHMgczBzQHNQc2BzcHOAc5BzoHOwc8Bz0HPgc/B0AHQQdCB0MHRAdFB0YHRwdIB0kHSgdLB0wHTQdOB08HUAdRB1IHUwdUB1UHVgdXB1gHWQdaB1sHXAddB14HXwdgB2EHYgdjB2QHZQdmB2cHaAdpB2oHawdsB20HbgdvB3AHcQdyB3MHdAd1B3YHdwd4B3kHegd7B3wHfQd+B38HgAeBB4IHgweEB4UHhgeHB4gHiQeKB4sHjAeNB44HjweQB5EHkgeTB5QHlQeWB5cHmAeZB5oHmwecB50HngefB6AHoQeiB6MHpAelB6YHpweoB6kHqgerB6wHrQeuB68HsAexB7IHswe0B7UHtge3B7gHuQe6B7sHvAe9B74HvwfAB8EHwgfDB8QHxQfGB8cHyAfJB8oHywfMB80HzgfPB9AH0QfSB9MH1AfVB9YH1wfYB9kH2gfbB9wH3QfeB98H4AfhB+IH4wfkB+UH5gfnB+gH6QfqB+sH7AftB+4H7wfwB/EH8gfzB/QH9Qf2B/cH+Af5B/oH+wf8B/0H/gf/CAAIAQgCCAMIBAgFCAYIBwgICAkICggLCAwIDQgOCA8IEAgRCBIIEwgUCBUIFggXCBgIGQgaCBsIHAgdCB4IHwggCCEIIggjCCQIJQgmCCcIKAgpCCoIKwgsCC0ILggvCDAIMQgyCDMINAg1CDYINwg4CDkIOgg7CDwIPQg+CD8IQAhBCEIIQwhECEUIRghHCEgISQhKCEsg+wy3+iS3AfcQt/kstwP3EPoEFf58+YT6fAf9WP4nFfnSB/fF/DMFprAV+8X4NwX49gamYhX90gf7xfgzBXBmFffF/DcF/PYGDg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4OAAEBAQr4HwwmmhwZLRL7joscBUaLBr0KvQv65xUD6AB8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAA==");}';
        style.insertRule(rule, style.cssRules.length);
    }
    Shumway.registerFallbackFont = registerFallbackFont;
    var GFX;
    (function (GFX) {
        var Option = Shumway.Options.Option;
        var OptionSet = Shumway.Options.OptionSet;
        var shumwayOptions = Shumway.Settings.shumwayOptions;
        var rendererOptions = shumwayOptions.register(new OptionSet('Renderer Options'));
        GFX.imageUpdateOption = rendererOptions.register(new Option('', 'imageUpdate', 'boolean', true, 'Enable image updating.'));
        GFX.imageConvertOption = rendererOptions.register(new Option('', 'imageConvert', 'boolean', true, 'Enable image conversion.'));
        GFX.stageOptions = shumwayOptions.register(new OptionSet('Stage Renderer Options'));
        GFX.forcePaint = GFX.stageOptions.register(new Option('', 'forcePaint', 'boolean', false, 'Force repainting.'));
        GFX.ignoreViewport = GFX.stageOptions.register(new Option('', 'ignoreViewport', 'boolean', false, 'Cull elements outside of the viewport.'));
        GFX.viewportLoupeDiameter = GFX.stageOptions.register(new Option('', 'viewportLoupeDiameter', 'number', 256, 'Size of the viewport loupe.', {
            range: {
                min: 1,
                max: 1024,
                step: 1
            }
        }));
        GFX.disableClipping = GFX.stageOptions.register(new Option('', 'disableClipping', 'boolean', false, 'Disable clipping.'));
        GFX.debugClipping = GFX.stageOptions.register(new Option('', 'debugClipping', 'boolean', false, 'Disable clipping.'));
        GFX.hud = GFX.stageOptions.register(new Option('', 'hud', 'boolean', false, 'Enable HUD.'));
        var canvas2DOptions = GFX.stageOptions.register(new OptionSet('Canvas2D Options'));
        GFX.clipDirtyRegions = canvas2DOptions.register(new Option('', 'clipDirtyRegions', 'boolean', false, 'Clip dirty regions.'));
        GFX.clipCanvas = canvas2DOptions.register(new Option('', 'clipCanvas', 'boolean', false, 'Clip Regions.'));
        GFX.cull = canvas2DOptions.register(new Option('', 'cull', 'boolean', false, 'Enable culling.'));
        GFX.snapToDevicePixels = canvas2DOptions.register(new Option('', 'snapToDevicePixels', 'boolean', false, ''));
        GFX.imageSmoothing = canvas2DOptions.register(new Option('', 'imageSmoothing', 'boolean', false, ''));
        GFX.masking = canvas2DOptions.register(new Option('', 'masking', 'boolean', true, 'Composite Mask.'));
        GFX.blending = canvas2DOptions.register(new Option('', 'blending', 'boolean', true, ''));
        GFX.debugLayers = canvas2DOptions.register(new Option('', 'debugLayers', 'boolean', false, ''));
        GFX.filters = canvas2DOptions.register(new Option('', 'filters', 'boolean', true, ''));
        GFX.cacheShapes = canvas2DOptions.register(new Option('', 'cacheShapes', 'boolean', true, ''));
        GFX.cacheShapesMaxSize = canvas2DOptions.register(new Option('', 'cacheShapesMaxSize', 'number', 256, '', {
            range: {
                min: 1,
                max: 1024,
                step: 1
            }
        }));
        GFX.cacheShapesThreshold = canvas2DOptions.register(new Option('', 'cacheShapesThreshold', 'number', 256, '', {
            range: {
                min: 1,
                max: 1024,
                step: 1
            }
        }));
        var Geometry;
        (function (Geometry) {
            var clamp = Shumway.NumberUtilities.clamp;
            var pow2 = Shumway.NumberUtilities.pow2;
            var epsilonEquals = Shumway.NumberUtilities.epsilonEquals;
            var assert = Shumway.Debug.assert;
            function radianToDegrees(r) {
                return r * 180 / Math.PI;
            }
            Geometry.radianToDegrees = radianToDegrees;
            function degreesToRadian(d) {
                return d * Math.PI / 180;
            }
            Geometry.degreesToRadian = degreesToRadian;
            var E = 0.0001;
            function eqFloat(a, b) {
                return Math.abs(a - b) < E;
            }
            var Point = function () {
                function Point(x, y) {
                    this.x = x;
                    this.y = y;
                }
                Point.prototype.setElements = function (x, y) {
                    this.x = x;
                    this.y = y;
                    return this;
                };
                Point.prototype.set = function (other) {
                    this.x = other.x;
                    this.y = other.y;
                    return this;
                };
                Point.prototype.dot = function (other) {
                    return this.x * other.x + this.y * other.y;
                };
                Point.prototype.squaredLength = function () {
                    return this.dot(this);
                };
                Point.prototype.distanceTo = function (other) {
                    return Math.sqrt(this.dot(other));
                };
                Point.prototype.sub = function (other) {
                    this.x -= other.x;
                    this.y -= other.y;
                    return this;
                };
                Point.prototype.mul = function (value) {
                    this.x *= value;
                    this.y *= value;
                    return this;
                };
                Point.prototype.clone = function () {
                    return new Point(this.x, this.y);
                };
                Point.prototype.toString = function (digits) {
                    if (digits === void 0) {
                        digits = 2;
                    }
                    return '{x: ' + this.x.toFixed(digits) + ', y: ' + this.y.toFixed(digits) + '}';
                };
                Point.prototype.inTriangle = function (a, b, c) {
                    var s = a.y * c.x - a.x * c.y + (c.y - a.y) * this.x + (a.x - c.x) * this.y;
                    var t = a.x * b.y - a.y * b.x + (a.y - b.y) * this.x + (b.x - a.x) * this.y;
                    if (s < 0 != t < 0) {
                        return false;
                    }
                    var T = -b.y * c.x + a.y * (c.x - b.x) + a.x * (b.y - c.y) + b.x * c.y;
                    if (T < 0) {
                        s = -s;
                        t = -t;
                        T = -T;
                    }
                    return s > 0 && t > 0 && s + t < T;
                };
                Point.createEmpty = function () {
                    return new Point(0, 0);
                };
                Point.createEmptyPoints = function (count) {
                    var result = [];
                    for (var i = 0; i < count; i++) {
                        result.push(new Point(0, 0));
                    }
                    return result;
                };
                return Point;
            }();
            Geometry.Point = Point;
            var Rectangle = function () {
                function Rectangle(x, y, w, h) {
                    this.setElements(x, y, w, h);
                    Rectangle.allocationCount++;
                }
                Rectangle.prototype.setElements = function (x, y, w, h) {
                    this.x = x;
                    this.y = y;
                    this.w = w;
                    this.h = h;
                };
                Rectangle.prototype.set = function (other) {
                    this.x = other.x;
                    this.y = other.y;
                    this.w = other.w;
                    this.h = other.h;
                };
                Rectangle.prototype.contains = function (other) {
                    var r1 = other.x + other.w;
                    var b1 = other.y + other.h;
                    var r2 = this.x + this.w;
                    var b2 = this.y + this.h;
                    return other.x >= this.x && other.x < r2 && other.y >= this.y && other.y < b2 && r1 > this.x && r1 <= r2 && b1 > this.y && b1 <= b2;
                };
                Rectangle.prototype.containsPoint = function (point) {
                    return point.x >= this.x && point.x < this.x + this.w && point.y >= this.y && point.y < this.y + this.h;
                };
                Rectangle.prototype.isContained = function (others) {
                    for (var i = 0; i < others.length; i++) {
                        if (others[i].contains(this)) {
                            return true;
                        }
                    }
                    return false;
                };
                Rectangle.prototype.isSmallerThan = function (other) {
                    return this.w < other.w && this.h < other.h;
                };
                Rectangle.prototype.isLargerThan = function (other) {
                    return this.w > other.w && this.h > other.h;
                };
                Rectangle.prototype.union = function (other) {
                    if (this.isEmpty()) {
                        this.set(other);
                        return;
                    } else if (other.isEmpty()) {
                        return;
                    }
                    var x = this.x, y = this.y;
                    if (this.x > other.x) {
                        x = other.x;
                    }
                    if (this.y > other.y) {
                        y = other.y;
                    }
                    var x0 = this.x + this.w;
                    if (x0 < other.x + other.w) {
                        x0 = other.x + other.w;
                    }
                    var y0 = this.y + this.h;
                    if (y0 < other.y + other.h) {
                        y0 = other.y + other.h;
                    }
                    this.x = x;
                    this.y = y;
                    this.w = x0 - x;
                    this.h = y0 - y;
                };
                Rectangle.prototype.isEmpty = function () {
                    return this.w <= 0 || this.h <= 0;
                };
                Rectangle.prototype.setEmpty = function () {
                    this.x = 0;
                    this.y = 0;
                    this.w = 0;
                    this.h = 0;
                };
                Rectangle.prototype.intersect = function (other) {
                    var result = Rectangle.createEmpty();
                    if (this.isEmpty() || other.isEmpty()) {
                        result.setEmpty();
                        return result;
                    }
                    result.x = Math.max(this.x, other.x);
                    result.y = Math.max(this.y, other.y);
                    result.w = Math.min(this.x + this.w, other.x + other.w) - result.x;
                    result.h = Math.min(this.y + this.h, other.y + other.h) - result.y;
                    if (result.isEmpty()) {
                        result.setEmpty();
                    }
                    this.set(result);
                };
                Rectangle.prototype.intersects = function (other) {
                    if (this.isEmpty() || other.isEmpty()) {
                        return false;
                    }
                    var x = Math.max(this.x, other.x);
                    var y = Math.max(this.y, other.y);
                    var w = Math.min(this.x + this.w, other.x + other.w) - x;
                    var h = Math.min(this.y + this.h, other.y + other.h) - y;
                    return !(w <= 0 || h <= 0);
                };
                /**
                 * Tests if this rectangle intersects the AABB of the given rectangle.
                 */
                Rectangle.prototype.intersectsTransformedAABB = function (other, matrix) {
                    var rectangle = Rectangle._temporary;
                    rectangle.set(other);
                    matrix.transformRectangleAABB(rectangle);
                    return this.intersects(rectangle);
                };
                Rectangle.prototype.intersectsTranslated = function (other, tx, ty) {
                    if (this.isEmpty() || other.isEmpty()) {
                        return false;
                    }
                    var x = Math.max(this.x, other.x + tx);
                    var y = Math.max(this.y, other.y + ty);
                    var w = Math.min(this.x + this.w, other.x + tx + other.w) - x;
                    var h = Math.min(this.y + this.h, other.y + ty + other.h) - y;
                    return !(w <= 0 || h <= 0);
                };
                Rectangle.prototype.area = function () {
                    return this.w * this.h;
                };
                Rectangle.prototype.clone = function () {
                    var rectangle = Rectangle.allocate();
                    rectangle.set(this);
                    return rectangle;
                };
                Rectangle.allocate = function () {
                    var dirtyStack = Rectangle._dirtyStack;
                    if (dirtyStack.length) {
                        return dirtyStack.pop();
                    } else {
                        return new Rectangle(12345, 67890, 12345, 67890);
                    }
                };
                Rectangle.prototype.free = function () {
                    Rectangle._dirtyStack.push(this);
                };
                /**
                 * Snaps the rectangle to pixel boundaries. The computed rectangle covers
                 * the original rectangle.
                 */
                Rectangle.prototype.snap = function () {
                    var x1 = Math.ceil(this.x + this.w);
                    var y1 = Math.ceil(this.y + this.h);
                    this.x = Math.floor(this.x);
                    this.y = Math.floor(this.y);
                    this.w = x1 - this.x;
                    this.h = y1 - this.y;
                    return this;
                };
                Rectangle.prototype.scale = function (x, y) {
                    this.x *= x;
                    this.y *= y;
                    this.w *= x;
                    this.h *= y;
                    return this;
                };
                Rectangle.prototype.offset = function (x, y) {
                    this.x += x;
                    this.y += y;
                    return this;
                };
                Rectangle.prototype.resize = function (w, h) {
                    this.w += w;
                    this.h += h;
                    return this;
                };
                Rectangle.prototype.expand = function (w, h) {
                    this.offset(-w, -h).resize(2 * w, 2 * h);
                    return this;
                };
                Rectangle.prototype.getCenter = function () {
                    return new Point(this.x + this.w / 2, this.y + this.h / 2);
                };
                Rectangle.prototype.getAbsoluteBounds = function () {
                    return new Rectangle(0, 0, this.w, this.h);
                };
                Rectangle.prototype.toString = function (digits) {
                    if (digits === void 0) {
                        digits = 2;
                    }
                    return '{' + this.x.toFixed(digits) + ', ' + this.y.toFixed(digits) + ', ' + this.w.toFixed(digits) + ', ' + this.h.toFixed(digits) + '}';
                };
                Rectangle.createEmpty = function () {
                    var rectangle = Rectangle.allocate();
                    rectangle.setEmpty();
                    return rectangle;
                };
                Rectangle.createSquare = function (size) {
                    return new Rectangle(-size / 2, -size / 2, size, size);
                };
                /**
                 * Creates the maximum rectangle representable by signed 16 bit integers.
                 */
                Rectangle.createMaxI16 = function () {
                    return new Rectangle(-32768    /* MinI16 */, -32768    /* MinI16 */, 65535    /* MaxU16 */, 65535    /* MaxU16 */);
                };
                Rectangle.prototype.setMaxI16 = function () {
                    this.setElements(-32768    /* MinI16 */, -32768    /* MinI16 */, 65535    /* MaxU16 */, 65535    /* MaxU16 */);
                };
                Rectangle.prototype.getCorners = function (points) {
                    points[0].x = this.x;
                    points[0].y = this.y;
                    points[1].x = this.x + this.w;
                    points[1].y = this.y;
                    points[2].x = this.x + this.w;
                    points[2].y = this.y + this.h;
                    points[3].x = this.x;
                    points[3].y = this.y + this.h;
                };
                Rectangle.allocationCount = 0;
                Rectangle._temporary = new Rectangle(0, 0, 0, 0);
                Rectangle._dirtyStack = [];
                return Rectangle;
            }();
            Geometry.Rectangle = Rectangle;
            var OBB = function () {
                function OBB(corners) {
                    this.corners = corners.map(function (corner) {
                        return corner.clone();
                    });
                    this.axes = [
                        corners[1].clone().sub(corners[0]),
                        corners[3].clone().sub(corners[0])
                    ];
                    this.origins = [];
                    for (var i = 0; i < 2; i++) {
                        this.axes[i].mul(1 / this.axes[i].squaredLength());
                        this.origins.push(corners[0].dot(this.axes[i]));
                    }
                }
                OBB.prototype.getBounds = function () {
                    return OBB.getBounds(this.corners);
                };
                OBB.getBounds = function (points) {
                    var min = new Point(Number.MAX_VALUE, Number.MAX_VALUE);
                    var max = new Point(Number.MIN_VALUE, Number.MIN_VALUE);
                    for (var i = 0; i < 4; i++) {
                        var x = points[i].x, y = points[i].y;
                        min.x = Math.min(min.x, x);
                        min.y = Math.min(min.y, y);
                        max.x = Math.max(max.x, x);
                        max.y = Math.max(max.y, y);
                    }
                    return new Rectangle(min.x, min.y, max.x - min.x, max.y - min.y);
                };
                /**
                 * http://www.flipcode.com/archives/2D_OBB_Intersection.shtml
                 */
                OBB.prototype.intersects = function (other) {
                    return this.intersectsOneWay(other) && other.intersectsOneWay(this);
                };
                OBB.prototype.intersectsOneWay = function (other) {
                    for (var i = 0; i < 2; i++) {
                        for (var j = 0; j < 4; j++) {
                            var t = other.corners[j].dot(this.axes[i]);
                            var tMin, tMax;
                            if (j === 0) {
                                tMax = tMin = t;
                            } else {
                                if (t < tMin) {
                                    tMin = t;
                                } else if (t > tMax) {
                                    tMax = t;
                                }
                            }
                        }
                        if (tMin > 1 + this.origins[i] || tMax < this.origins[i]) {
                            return false;
                        }
                    }
                    return true;
                };
                return OBB;
            }();
            Geometry.OBB = OBB;
            var Matrix = function () {
                function Matrix(a, b, c, d, tx, ty) {
                    this._data = new Float64Array(6);
                    this._type = 0    /* Unknown */;
                    this.setElements(a, b, c, d, tx, ty);
                    Matrix.allocationCount++;
                }
                Object.defineProperty(Matrix.prototype, 'a', {
                    get: function () {
                        return this._data[0];
                    },
                    set: function (a) {
                        this._data[0] = a;
                        this._type = 0    /* Unknown */;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Matrix.prototype, 'b', {
                    get: function () {
                        return this._data[1];
                    },
                    set: function (b) {
                        this._data[1] = b;
                        this._type = 0    /* Unknown */;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Matrix.prototype, 'c', {
                    get: function () {
                        return this._data[2];
                    },
                    set: function (c) {
                        this._data[2] = c;
                        this._type = 0    /* Unknown */;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Matrix.prototype, 'd', {
                    get: function () {
                        return this._data[3];
                    },
                    set: function (d) {
                        this._data[3] = d;
                        this._type = 0    /* Unknown */;
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Matrix.prototype, 'tx', {
                    get: function () {
                        return this._data[4];
                    },
                    set: function (tx) {
                        this._data[4] = tx;
                        if (this._type === 1    /* Identity */) {
                            this._type = 2    /* Translation */;
                        }
                    },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(Matrix.prototype, 'ty', {
                    get: function () {
                        return this._data[5];
                    },
                    set: function (ty) {
                        this._data[5] = ty;
                        if (this._type === 1    /* Identity */) {
                            this._type = 2    /* Translation */;
                        }
                    },
                    enumerable: true,
                    configurable: true
                });
                Matrix._createSVGMatrix = function () {
                    if (!Matrix._svg) {
                        Matrix._svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                    }
                    return Matrix._svg.createSVGMatrix();
                };
                Matrix.prototype.setElements = function (a, b, c, d, tx, ty) {
                    var m = this._data;
                    m[0] = a;
                    m[1] = b;
                    m[2] = c;
                    m[3] = d;
                    m[4] = tx;
                    m[5] = ty;
                    this._type = 0    /* Unknown */;
                };
                Matrix.prototype.set = function (other) {
                    var m = this._data, n = other._data;
                    m[0] = n[0];
                    m[1] = n[1];
                    m[2] = n[2];
                    m[3] = n[3];
                    m[4] = n[4];
                    m[5] = n[5];
                    this._type = other._type;
                };
                /**
                 * Whether the transformed query rectangle is empty after this transform is applied to it.
                 */
                Matrix.prototype.emptyArea = function (query) {
                    var m = this._data;
                    // TODO: Work out the details here.
                    if (m[0] === 0 || m[3] === 0) {
                        return true;
                    }
                    return false;
                };
                /**
                 * Whether the area of transformed query rectangle is infinite after this transform is applied to it.
                 */
                Matrix.prototype.infiniteArea = function (query) {
                    var m = this._data;
                    // TODO: Work out the details here.
                    if (Math.abs(m[0]) === Infinity || Math.abs(m[3]) === Infinity) {
                        return true;
                    }
                    return false;
                };
                Matrix.prototype.isEqual = function (other) {
                    if (this._type === 1    /* Identity */ && other._type === 1    /* Identity */) {
                        return true;
                    }
                    var m = this._data, n = other._data;
                    return m[0] === n[0] && m[1] === n[1] && m[2] === n[2] && m[3] === n[3] && m[4] === n[4] && m[5] === n[5];
                };
                Matrix.prototype.clone = function () {
                    var matrix = Matrix.allocate();
                    matrix.set(this);
                    return matrix;
                };
                Matrix.allocate = function () {
                    var dirtyStack = Matrix._dirtyStack;
                    var matrix = null;
                    if (dirtyStack.length) {
                        return dirtyStack.pop();
                    } else {
                        return new Matrix(12345, 12345, 12345, 12345, 12345, 12345);
                    }
                };
                Matrix.prototype.free = function () {
                    Matrix._dirtyStack.push(this);
                };
                Matrix.prototype.transform = function (a, b, c, d, tx, ty) {
                    var m = this._data;
                    var _a = m[0], _b = m[1], _c = m[2], _d = m[3], _tx = m[4], _ty = m[5];
                    m[0] = _a * a + _c * b;
                    m[1] = _b * a + _d * b;
                    m[2] = _a * c + _c * d;
                    m[3] = _b * c + _d * d;
                    m[4] = _a * tx + _c * ty + _tx;
                    m[5] = _b * tx + _d * ty + _ty;
                    this._type = 0    /* Unknown */;
                    return this;
                };
                Matrix.prototype.transformRectangle = function (rectangle, points) {
                    release || assert(points.length === 4);
                    var m = this._data, a = m[0], b = m[1], c = m[2], d = m[3], tx = m[4], ty = m[5];
                    var x = rectangle.x;
                    var y = rectangle.y;
                    var w = rectangle.w;
                    var h = rectangle.h;
                    /*
              
                     0---1
                     | / |
                     3---2
              
                     */
                    points[0].x = a * x + c * y + tx;
                    points[0].y = b * x + d * y + ty;
                    points[1].x = a * (x + w) + c * y + tx;
                    points[1].y = b * (x + w) + d * y + ty;
                    points[2].x = a * (x + w) + c * (y + h) + tx;
                    points[2].y = b * (x + w) + d * (y + h) + ty;
                    points[3].x = a * x + c * (y + h) + tx;
                    points[3].y = b * x + d * (y + h) + ty;
                };
                Matrix.prototype.isTranslationOnly = function () {
                    if (this._type === 2    /* Translation */) {
                        return true;
                    }
                    var m = this._data;
                    if (m[0] === 1 && m[1] === 0 && m[2] === 0 && m[3] === 1) {
                        this._type = 2    /* Translation */;
                        return true;
                    } else if (epsilonEquals(m[0], 1) && epsilonEquals(m[1], 0) && epsilonEquals(m[2], 0) && epsilonEquals(m[3], 1)) {
                        this._type = 2    /* Translation */;
                        return true;
                    }
                    return false;
                };
                Matrix.prototype.transformRectangleAABB = function (rectangle) {
                    var m = this._data;
                    if (this._type === 1    /* Identity */) {
                        return;
                    } else if (this._type === 2    /* Translation */) {
                        rectangle.x += m[4];
                        rectangle.y += m[5];
                        return;
                    }
                    var a = m[0], b = m[1], c = m[2], d = m[3], tx = m[4], ty = m[5];
                    var x = rectangle.x;
                    var y = rectangle.y;
                    var w = rectangle.w;
                    var h = rectangle.h;
                    /*
              
                     0---1
                     | / |
                     3---2
              
                     */
                    var x0 = a * x + c * y + tx;
                    var y0 = b * x + d * y + ty;
                    var x1 = a * (x + w) + c * y + tx;
                    var y1 = b * (x + w) + d * y + ty;
                    var x2 = a * (x + w) + c * (y + h) + tx;
                    var y2 = b * (x + w) + d * (y + h) + ty;
                    var x3 = a * x + c * (y + h) + tx;
                    var y3 = b * x + d * (y + h) + ty;
                    var tmp = 0;
                    // Manual Min/Max is a lot faster than calling Math.min/max
                    // X Min-Max
                    if (x0 > x1) {
                        tmp = x0;
                        x0 = x1;
                        x1 = tmp;
                    }
                    if (x2 > x3) {
                        tmp = x2;
                        x2 = x3;
                        x3 = tmp;
                    }
                    rectangle.x = x0 < x2 ? x0 : x2;
                    rectangle.w = (x1 > x3 ? x1 : x3) - rectangle.x;
                    // Y Min-Max
                    if (y0 > y1) {
                        tmp = y0;
                        y0 = y1;
                        y1 = tmp;
                    }
                    if (y2 > y3) {
                        tmp = y2;
                        y2 = y3;
                        y3 = tmp;
                    }
                    rectangle.y = y0 < y2 ? y0 : y2;
                    rectangle.h = (y1 > y3 ? y1 : y3) - rectangle.y;
                };
                Matrix.prototype.scale = function (x, y) {
                    var m = this._data;
                    m[0] *= x;
                    m[1] *= y;
                    m[2] *= x;
                    m[3] *= y;
                    m[4] *= x;
                    m[5] *= y;
                    this._type = 0    /* Unknown */;
                    return this;
                };
                Matrix.prototype.scaleClone = function (x, y) {
                    if (x === 1 && y === 1) {
                        return this;
                    }
                    return this.clone().scale(x, y);
                };
                Matrix.prototype.rotate = function (angle) {
                    var m = this._data, a = m[0], b = m[1], c = m[2], d = m[3], tx = m[4], ty = m[5];
                    var cos = Math.cos(angle);
                    var sin = Math.sin(angle);
                    m[0] = cos * a - sin * b;
                    m[1] = sin * a + cos * b;
                    m[2] = cos * c - sin * d;
                    m[3] = sin * c + cos * d;
                    m[4] = cos * tx - sin * ty;
                    m[5] = sin * tx + cos * ty;
                    this._type = 0    /* Unknown */;
                    return this;
                };
                Matrix.prototype.concat = function (other) {
                    if (other._type === 1    /* Identity */) {
                        return this;
                    }
                    var m = this._data, n = other._data;
                    var a = m[0] * n[0];
                    var b = 0;
                    var c = 0;
                    var d = m[3] * n[3];
                    var tx = m[4] * n[0] + n[4];
                    var ty = m[5] * n[3] + n[5];
                    if (m[1] !== 0 || m[2] !== 0 || n[1] !== 0 || n[2] !== 0) {
                        a += m[1] * n[2];
                        d += m[2] * n[1];
                        b += m[0] * n[1] + m[1] * n[3];
                        c += m[2] * n[0] + m[3] * n[2];
                        tx += m[5] * n[2];
                        ty += m[4] * n[1];
                    }
                    m[0] = a;
                    m[1] = b;
                    m[2] = c;
                    m[3] = d;
                    m[4] = tx;
                    m[5] = ty;
                    this._type = 0    /* Unknown */;
                    return this;
                };
                Matrix.prototype.concatClone = function (other) {
                    return this.clone().concat(other);
                };
                /**
                 * this = other * this
                 */
                Matrix.prototype.preMultiply = function (other) {
                    var m = this._data, n = other._data;
                    if (other._type === 2    /* Translation */ && this._type & (1    /* Identity */ | 2    /* Translation */)) {
                        m[4] += n[4];
                        m[5] += n[5];
                        this._type = 2    /* Translation */;
                        return;
                    } else if (other._type === 1    /* Identity */) {
                        return;
                    }
                    var a = n[0] * m[0];
                    var b = 0;
                    var c = 0;
                    var d = n[3] * m[3];
                    var tx = n[4] * m[0] + m[4];
                    var ty = n[5] * m[3] + m[5];
                    if (n[1] !== 0 || n[2] !== 0 || m[1] !== 0 || m[2] !== 0) {
                        a += n[1] * m[2];
                        d += n[2] * m[1];
                        b += n[0] * m[1] + n[1] * m[3];
                        c += n[2] * m[0] + n[3] * m[2];
                        tx += n[5] * m[2];
                        ty += n[4] * m[1];
                    }
                    m[0] = a;
                    m[1] = b;
                    m[2] = c;
                    m[3] = d;
                    m[4] = tx;
                    m[5] = ty;
                    this._type = 0    /* Unknown */;
                };
                Matrix.prototype.translate = function (x, y) {
                    var m = this._data;
                    m[4] += x;
                    m[5] += y;
                    if (this._type === 1    /* Identity */) {
                        this._type = 2    /* Translation */;
                    }
                    return this;
                };
                Matrix.prototype.setIdentity = function () {
                    var m = this._data;
                    m[0] = 1;
                    m[1] = 0;
                    m[2] = 0;
                    m[3] = 1;
                    m[4] = 0;
                    m[5] = 0;
                    this._type = 1    /* Identity */;
                };
                Matrix.prototype.isIdentity = function () {
                    if (this._type === 1    /* Identity */) {
                        return true;
                    }
                    var m = this._data;
                    return m[0] === 1 && m[1] === 0 && m[2] === 0 && m[3] === 1 && m[4] === 0 && m[5] === 0;
                };
                Matrix.prototype.transformPoint = function (point) {
                    if (this._type === 1    /* Identity */) {
                        return;
                    }
                    var m = this._data;
                    var x = point.x;
                    var y = point.y;
                    point.x = m[0] * x + m[2] * y + m[4];
                    point.y = m[1] * x + m[3] * y + m[5];
                };
                Matrix.prototype.transformPoints = function (points) {
                    if (this._type === 1    /* Identity */) {
                        return;
                    }
                    for (var i = 0; i < points.length; i++) {
                        this.transformPoint(points[i]);
                    }
                };
                Matrix.prototype.deltaTransformPoint = function (point) {
                    if (this._type === 1    /* Identity */) {
                        return;
                    }
                    var m = this._data;
                    var x = point.x;
                    var y = point.y;
                    point.x = m[0] * x + m[2] * y;
                    point.y = m[1] * x + m[3] * y;
                };
                Matrix.prototype.inverse = function (result) {
                    var m = this._data, r = result._data;
                    if (this._type === 1    /* Identity */) {
                        result.setIdentity();
                        return;
                    } else if (this._type === 2    /* Translation */) {
                        r[0] = 1;
                        r[1] = 0;
                        r[2] = 0;
                        r[3] = 1;
                        r[4] = -m[4];
                        r[5] = -m[5];
                        result._type = 2    /* Translation */;
                        return;
                    }
                    var b = m[1];
                    var c = m[2];
                    var tx = m[4];
                    var ty = m[5];
                    if (b === 0 && c === 0) {
                        var a = r[0] = 1 / m[0];
                        var d = r[3] = 1 / m[3];
                        r[1] = 0;
                        r[2] = 0;
                        r[4] = -a * tx;
                        r[5] = -d * ty;
                    } else {
                        var a = m[0];
                        var d = m[3];
                        var determinant = a * d - b * c;
                        if (determinant === 0) {
                            result.setIdentity();
                            return;
                        }
                        determinant = 1 / determinant;
                        r[0] = d * determinant;
                        b = r[1] = -b * determinant;
                        c = r[2] = -c * determinant;
                        d = r[3] = a * determinant;
                        r[4] = -(r[0] * tx + c * ty);
                        r[5] = -(b * tx + d * ty);
                    }
                    result._type = 0    /* Unknown */;
                    return;
                };
                Matrix.prototype.getTranslateX = function () {
                    return this._data[4];
                };
                Matrix.prototype.getTranslateY = function () {
                    return this._data[4];
                };
                Matrix.prototype.getScaleX = function () {
                    var m = this._data;
                    if (m[0] === 1 && m[1] === 0) {
                        return 1;
                    }
                    var result = Math.sqrt(m[0] * m[0] + m[1] * m[1]);
                    return m[0] > 0 ? result : -result;
                };
                Matrix.prototype.getScaleY = function () {
                    var m = this._data;
                    if (m[2] === 0 && m[3] === 1) {
                        return 1;
                    }
                    var result = Math.sqrt(m[2] * m[2] + m[3] * m[3]);
                    return m[3] > 0 ? result : -result;
                };
                Matrix.prototype.getScale = function () {
                    return (this.getScaleX() + this.getScaleY()) / 2;
                };
                Matrix.prototype.getAbsoluteScaleX = function () {
                    return Math.abs(this.getScaleX());
                };
                Matrix.prototype.getAbsoluteScaleY = function () {
                    return Math.abs(this.getScaleY());
                };
                Matrix.prototype.getRotation = function () {
                    var m = this._data;
                    return Math.atan(m[1] / m[0]) * 180 / Math.PI;
                };
                Matrix.prototype.isScaleOrRotation = function () {
                    var m = this._data;
                    return Math.abs(m[0] * m[2] + m[1] * m[3]) < 0.01;
                };
                Matrix.prototype.toString = function (digits) {
                    if (digits === void 0) {
                        digits = 2;
                    }
                    var m = this._data;
                    return '{' + m[0].toFixed(digits) + ', ' + m[1].toFixed(digits) + ', ' + m[2].toFixed(digits) + ', ' + m[3].toFixed(digits) + ', ' + m[4].toFixed(digits) + ', ' + m[5].toFixed(digits) + '}';
                };
                Matrix.prototype.toWebGLMatrix = function () {
                    var m = this._data;
                    return new Float32Array([
                        m[0],
                        m[1],
                        0,
                        m[2],
                        m[3],
                        0,
                        m[4],
                        m[5],
                        1
                    ]);
                };
                Matrix.prototype.toCSSTransform = function () {
                    var m = this._data;
                    return 'matrix(' + m[0] + ', ' + m[1] + ', ' + m[2] + ', ' + m[3] + ', ' + m[4] + ', ' + m[5] + ')';
                };
                Matrix.createIdentity = function () {
                    var matrix = Matrix.allocate();
                    matrix.setIdentity();
                    return matrix;
                };
                Matrix.prototype.toSVGMatrix = function () {
                    var m = this._data;
                    var matrix = Matrix._createSVGMatrix();
                    try {
                        matrix.a = m[0];
                        matrix.b = m[1];
                        matrix.c = m[2];
                        matrix.d = m[3];
                        matrix.e = m[4];
                        matrix.f = m[5];
                    } catch (e) {
                        // The setters on SVGMatrix throw if the assigned value is `NaN`, which we sometimes
                        // produce. In that case, just fall back to an identity matrix for now.
                        return Matrix._createSVGMatrix();
                    }
                    return matrix;
                };
                Matrix.prototype.snap = function () {
                    var m = this._data;
                    if (this.isTranslationOnly()) {
                        m[0] = 1;
                        m[1] = 0;
                        m[2] = 0;
                        m[3] = 1;
                        m[4] = Math.round(m[4]);
                        m[5] = Math.round(m[5]);
                        this._type = 2    /* Translation */;
                        return true;
                    }
                    return false;
                };
                Matrix.createIdentitySVGMatrix = function () {
                    return Matrix._createSVGMatrix();
                };
                Matrix.createSVGMatrixFromArray = function (array) {
                    var matrix = Matrix._createSVGMatrix();
                    matrix.a = array[0];
                    matrix.b = array[1];
                    matrix.c = array[2];
                    matrix.d = array[3];
                    matrix.e = array[4];
                    matrix.f = array[5];
                    return matrix;
                };
                Matrix.allocationCount = 0;
                Matrix._dirtyStack = [];
                Matrix.multiply = function (dst, src) {
                    var n = src._data;
                    dst.transform(n[0], n[1], n[2], n[3], n[4], n[5]);
                };
                return Matrix;
            }();
            Geometry.Matrix = Matrix;
            var DirtyRegion = function () {
                function DirtyRegion(w, h, sizeInBits) {
                    if (sizeInBits === void 0) {
                        sizeInBits = 7;
                    }
                    var size = this.size = 1 << sizeInBits;
                    this.sizeInBits = sizeInBits;
                    this.w = w;
                    this.h = h;
                    this.c = Math.ceil(w / size);
                    this.r = Math.ceil(h / size);
                    this.grid = [];
                    for (var y = 0; y < this.r; y++) {
                        this.grid.push([]);
                        for (var x = 0; x < this.c; x++) {
                            this.grid[y][x] = new DirtyRegion.Cell(new Rectangle(x * size, y * size, size, size));
                        }
                    }
                }
                DirtyRegion.prototype.clear = function () {
                    for (var y = 0; y < this.r; y++) {
                        for (var x = 0; x < this.c; x++) {
                            this.grid[y][x].clear();
                        }
                    }
                };
                DirtyRegion.prototype.getBounds = function () {
                    return new Rectangle(0, 0, this.w, this.h);
                };
                DirtyRegion.prototype.addDirtyRectangle = function (rectangle) {
                    var x = rectangle.x >> this.sizeInBits;
                    var y = rectangle.y >> this.sizeInBits;
                    if (x >= this.c || y >= this.r) {
                        return;
                    }
                    if (x < 0) {
                        x = 0;
                    }
                    if (y < 0) {
                        y = 0;
                    }
                    var cell = this.grid[y][x];
                    rectangle = rectangle.clone();
                    rectangle.snap();
                    if (cell.region.contains(rectangle)) {
                        if (cell.bounds.isEmpty()) {
                            cell.bounds.set(rectangle);
                        } else if (!cell.bounds.contains(rectangle)) {
                            cell.bounds.union(rectangle);
                        }
                    } else {
                        var w = Math.min(this.c, Math.ceil((rectangle.x + rectangle.w) / this.size)) - x;
                        var h = Math.min(this.r, Math.ceil((rectangle.y + rectangle.h) / this.size)) - y;
                        for (var i = 0; i < w; i++) {
                            for (var j = 0; j < h; j++) {
                                var cell = this.grid[y + j][x + i];
                                var intersection = cell.region.clone();
                                intersection.intersect(rectangle);
                                if (!intersection.isEmpty()) {
                                    this.addDirtyRectangle(intersection);
                                }
                            }
                        }
                    }
                };
                DirtyRegion.prototype.gatherRegions = function (regions) {
                    for (var y = 0; y < this.r; y++) {
                        for (var x = 0; x < this.c; x++) {
                            var bounds = this.grid[y][x].bounds;
                            if (!bounds.isEmpty()) {
                                regions.push(this.grid[y][x].bounds);
                            }
                        }
                    }
                };
                DirtyRegion.prototype.gatherOptimizedRegions = function (regions) {
                    this.gatherRegions(regions);
                };
                DirtyRegion.prototype.getDirtyRatio = function () {
                    var totalArea = this.w * this.h;
                    if (totalArea === 0) {
                        return 0;
                    }
                    var dirtyArea = 0;
                    for (var y = 0; y < this.r; y++) {
                        for (var x = 0; x < this.c; x++) {
                            dirtyArea += this.grid[y][x].region.area();
                        }
                    }
                    return dirtyArea / totalArea;
                };
                DirtyRegion.prototype.render = function (context, options) {
                    function drawRectangle(rectangle) {
                        context.rect(rectangle.x, rectangle.y, rectangle.w, rectangle.h);
                    }
                    if (options && options.drawGrid) {
                        context.strokeStyle = 'white';
                        for (var y = 0; y < this.r; y++) {
                            for (var x = 0; x < this.c; x++) {
                                var cell = this.grid[y][x];
                                context.beginPath();
                                drawRectangle(cell.region);
                                context.closePath();
                                context.stroke();
                            }
                        }
                    }
                    context.strokeStyle = '#E0F8D8';
                    for (var y = 0; y < this.r; y++) {
                        for (var x = 0; x < this.c; x++) {
                            var cell = this.grid[y][x];
                            context.beginPath();
                            drawRectangle(cell.bounds);
                            context.closePath();
                            context.stroke();
                        }
                    }    //      context.strokeStyle = "#5856d6";
                         //      var regions = [];
                         //      this.gatherOptimizedRegions(regions);
                         //      for (var i = 0; i < regions.length; i++) {
                         //        context.beginPath();
                         //        drawRectangle(regions[i]);
                         //        context.closePath();
                         //        context.stroke();
                         //      }
                };
                DirtyRegion.tmpRectangle = Rectangle.createEmpty();
                return DirtyRegion;
            }();
            Geometry.DirtyRegion = DirtyRegion;
            var DirtyRegion;
            (function (DirtyRegion) {
                var Cell = function () {
                    function Cell(region) {
                        this.region = region;
                        this.bounds = Rectangle.createEmpty();
                    }
                    Cell.prototype.clear = function () {
                        this.bounds.setEmpty();
                    };
                    return Cell;
                }();
                DirtyRegion.Cell = Cell;
            }(DirtyRegion = Geometry.DirtyRegion || (Geometry.DirtyRegion = {})));
            var Tile = function () {
                function Tile(index, x, y, w, h, scale) {
                    this.index = index;
                    this.x = x;
                    this.y = y;
                    this.scale = scale;
                    this.bounds = new Rectangle(x * w, y * h, w, h);
                }
                Tile.prototype.getOBB = function () {
                    if (this._obb) {
                        return this._obb;
                    }
                    this.bounds.getCorners(Tile.corners);
                    return this._obb = new OBB(Tile.corners);
                };
                Tile.corners = Point.createEmptyPoints(4);
                return Tile;
            }();
            Geometry.Tile = Tile;
            /**
             * A grid data structure that lets you query tiles that intersect a transformed rectangle.
             */
            var TileCache = function () {
                function TileCache(w, h, tileW, tileH, scale) {
                    this.tileW = tileW;
                    this.tileH = tileH;
                    this.scale = scale;
                    this.w = w;
                    this.h = h;
                    this.rows = Math.ceil(h / tileH);
                    this.columns = Math.ceil(w / tileW);
                    release || assert(this.rows < 2048 && this.columns < 2048);
                    this.tiles = [];
                    var index = 0;
                    for (var y = 0; y < this.rows; y++) {
                        for (var x = 0; x < this.columns; x++) {
                            this.tiles.push(new Tile(index++, x, y, tileW, tileH, scale));
                        }
                    }
                }
                /**
                 * Query tiles using a transformed rectangle.
                 * TODO: Fine-tune these heuristics.
                 */
                TileCache.prototype.getTiles = function (query, transform) {
                    if (transform.emptyArea(query)) {
                        return [];
                    } else if (transform.infiniteArea(query)) {
                        return this.tiles;
                    }
                    var tileCount = this.columns * this.rows;
                    // The |getFewTiles| algorithm works better for a few tiles but it can't handle skew transforms.
                    if (tileCount < 40 && transform.isScaleOrRotation()) {
                        var precise = tileCount > 10;
                        return this.getFewTiles(query, transform, precise);
                    } else {
                        return this.getManyTiles(query, transform);
                    }
                };
                /**
                 * Precise indicates that we want to do an exact OBB intersection.
                 */
                TileCache.prototype.getFewTiles = function (query, transform, precise) {
                    if (precise === void 0) {
                        precise = true;
                    }
                    if (transform.isTranslationOnly() && this.tiles.length === 1) {
                        if (this.tiles[0].bounds.intersectsTranslated(query, transform.tx, transform.ty)) {
                            return [this.tiles[0]];
                        }
                        return [];
                    }
                    transform.transformRectangle(query, TileCache._points);
                    var queryOBB;
                    var queryBounds = new Rectangle(0, 0, this.w, this.h);
                    if (precise) {
                        queryOBB = new OBB(TileCache._points);
                    }
                    queryBounds.intersect(OBB.getBounds(TileCache._points));
                    if (queryBounds.isEmpty()) {
                        return [];
                    }
                    var minX = queryBounds.x / this.tileW | 0;
                    var minY = queryBounds.y / this.tileH | 0;
                    var maxX = Math.ceil((queryBounds.x + queryBounds.w) / this.tileW) | 0;
                    var maxY = Math.ceil((queryBounds.y + queryBounds.h) / this.tileH) | 0;
                    minX = clamp(minX, 0, this.columns);
                    maxX = clamp(maxX, 0, this.columns);
                    minY = clamp(minY, 0, this.rows);
                    maxY = clamp(maxY, 0, this.rows);
                    var tiles = [];
                    for (var x = minX; x < maxX; x++) {
                        for (var y = minY; y < maxY; y++) {
                            var tile = this.tiles[y * this.columns + x];
                            if (tile.bounds.intersects(queryBounds) && (precise ? tile.getOBB().intersects(queryOBB) : true)) {
                                tiles.push(tile);
                            }
                        }
                    }
                    return tiles;
                };
                TileCache.prototype.getManyTiles = function (query, transform) {
                    function intersectX(x, p1, p2) {
                        // (x - x1) * (y2 - y1) = (y - y1) * (x2 - x1)
                        return (x - p1.x) * (p2.y - p1.y) / (p2.x - p1.x) + p1.y;
                    }
                    function appendTiles(tiles, cache, column, startRow, endRow) {
                        if (column < 0 || column >= cache.columns) {
                            return;
                        }
                        var j1 = clamp(startRow, 0, cache.rows);
                        var j2 = clamp(endRow + 1, 0, cache.rows);
                        for (var j = j1; j < j2; j++) {
                            tiles.push(cache.tiles[j * cache.columns + column]);
                        }
                    }
                    var rectPoints = TileCache._points;
                    transform.transformRectangle(query, rectPoints);
                    // finding minimal-x point, placing at first (and last)
                    var i1 = rectPoints[0].x < rectPoints[1].x ? 0 : 1;
                    var i2 = rectPoints[2].x < rectPoints[3].x ? 2 : 3;
                    var i0 = rectPoints[i1].x < rectPoints[i2].x ? i1 : i2;
                    var lines = [];
                    for (var j = 0; j < 5; j++, i0++) {
                        lines.push(rectPoints[i0 % 4]);
                    }
                    // and keeping points ordered counterclockwise
                    if ((lines[1].x - lines[0].x) * (lines[3].y - lines[0].y) < (lines[1].y - lines[0].y) * (lines[3].x - lines[0].x)) {
                        var tmp = lines[1];
                        lines[1] = lines[3];
                        lines[3] = tmp;
                    }
                    var tiles = [];
                    var lastY1, lastY2;
                    var i = Math.floor(lines[0].x / this.tileW);
                    var nextX = (i + 1) * this.tileW;
                    if (lines[2].x < nextX) {
                        // edge case: all fits into one column
                        lastY1 = Math.min(lines[0].y, lines[1].y, lines[2].y, lines[3].y);
                        lastY2 = Math.max(lines[0].y, lines[1].y, lines[2].y, lines[3].y);
                        var j1 = Math.floor(lastY1 / this.tileH);
                        var j2 = Math.floor(lastY2 / this.tileH);
                        appendTiles(tiles, this, i, j1, j2);
                        return tiles;
                    }
                    var line1 = 0, line2 = 4;
                    var lastSegment1 = false, lastSegment2 = false;
                    if (lines[0].x === lines[1].x || lines[0].x === lines[3].x) {
                        // edge case: first rectangle side parallel to columns
                        if (lines[0].x === lines[1].x) {
                            lastSegment1 = true;
                            line1++;
                        } else {
                            lastSegment2 = true;
                            line2--;
                        }
                        lastY1 = intersectX(nextX, lines[line1], lines[line1 + 1]);
                        lastY2 = intersectX(nextX, lines[line2], lines[line2 - 1]);
                        var j1 = Math.floor(lines[line1].y / this.tileH);
                        var j2 = Math.floor(lines[line2].y / this.tileH);
                        appendTiles(tiles, this, i, j1, j2);
                        i++;
                    }
                    do {
                        var nextY1, nextY2;
                        var nextSegment1, nextSegment2;
                        if (lines[line1 + 1].x < nextX) {
                            nextY1 = lines[line1 + 1].y;
                            nextSegment1 = true;
                        } else {
                            nextY1 = intersectX(nextX, lines[line1], lines[line1 + 1]);
                            nextSegment1 = false;
                        }
                        if (lines[line2 - 1].x < nextX) {
                            nextY2 = lines[line2 - 1].y;
                            nextSegment2 = true;
                        } else {
                            nextY2 = intersectX(nextX, lines[line2], lines[line2 - 1]);
                            nextSegment2 = false;
                        }
                        var j1 = Math.floor((lines[line1].y < lines[line1 + 1].y ? lastY1 : nextY1) / this.tileH);
                        var j2 = Math.floor((lines[line2].y > lines[line2 - 1].y ? lastY2 : nextY2) / this.tileH);
                        appendTiles(tiles, this, i, j1, j2);
                        if (nextSegment1 && lastSegment1) {
                            break;
                        }
                        if (nextSegment1) {
                            lastSegment1 = true;
                            line1++;
                            lastY1 = intersectX(nextX, lines[line1], lines[line1 + 1]);
                        } else {
                            lastY1 = nextY1;
                        }
                        if (nextSegment2) {
                            lastSegment2 = true;
                            line2--;
                            lastY2 = intersectX(nextX, lines[line2], lines[line2 - 1]);
                        } else {
                            lastY2 = nextY2;
                        }
                        i++;
                        nextX = (i + 1) * this.tileW;
                    } while (line1 < line2);
                    return tiles;
                };
                TileCache._points = Point.createEmptyPoints(4);
                return TileCache;
            }();
            Geometry.TileCache = TileCache;
            var MIN_CACHE_LEVELS = 5;
            var MAX_CACHE_LEVELS = 3;
            /**
             * Manages tile caches at different scales.
             */
            var RenderableTileCache = function () {
                function RenderableTileCache(source, tileSize, minUntiledSize) {
                    this._cacheLevels = [];
                    this._source = source;
                    this._tileSize = tileSize;
                    this._minUntiledSize = minUntiledSize;
                }
                /**
                 * Gets the tiles covered by the specified |query| rectangle and transformed by the given |transform| matrix.
                 */
                RenderableTileCache.prototype._getTilesAtScale = function (query, transform, scratchBounds) {
                    var transformScale = Math.max(transform.getAbsoluteScaleX(), transform.getAbsoluteScaleY());
                    // Use log2(1 / transformScale) to figure out the tile level.
                    var level = 0;
                    if (transformScale !== 1) {
                        level = clamp(Math.round(Math.log(1 / transformScale) / Math.LN2), -MIN_CACHE_LEVELS, MAX_CACHE_LEVELS);
                    }
                    var scale = pow2(level);
                    // Since we use a single tile for dynamic sources, we've got to make sure that it fits in our surface caches ...
                    if (this._source.hasFlags(256    /* Dynamic */)) {
                        // .. so try a lower scale level until it fits.
                        while (true) {
                            scale = pow2(level);
                            if (scratchBounds.contains(this._source.getBounds().getAbsoluteBounds().clone().scale(scale, scale))) {
                                break;
                            }
                            level--;
                            release || assert(level >= -MIN_CACHE_LEVELS);
                        }
                    }
                    // If the source is not scalable don't cache any tiles at a higher scale factor. However, it may still make
                    // sense to cache at a lower scale factor in case we need to evict larger cached images.
                    if (!this._source.hasFlags(512    /* Scalable */)) {
                        level = clamp(level, -MIN_CACHE_LEVELS, 0);
                    }
                    var scale = pow2(level);
                    var levelIndex = MIN_CACHE_LEVELS + level;
                    var cache = this._cacheLevels[levelIndex];
                    if (!cache) {
                        var bounds = this._source.getBounds().getAbsoluteBounds();
                        var scaledBounds = bounds.clone().scale(scale, scale);
                        var tileW, tileH;
                        if (this._source.hasFlags(256    /* Dynamic */) || !this._source.hasFlags(1024    /* Tileable */) || Math.max(scaledBounds.w, scaledBounds.h) <= this._minUntiledSize) {
                            tileW = scaledBounds.w;
                            tileH = scaledBounds.h;
                        } else {
                            tileW = tileH = this._tileSize;
                        }
                        cache = this._cacheLevels[levelIndex] = new TileCache(scaledBounds.w, scaledBounds.h, tileW, tileH, scale);
                    }
                    return cache.getTiles(query, transform.scaleClone(scale, scale));
                };
                RenderableTileCache.prototype.fetchTiles = function (query, transform, scratchContext, cacheImageCallback) {
                    var scratchBounds = new Rectangle(0, 0, scratchContext.canvas.width, scratchContext.canvas.height);
                    var tiles = this._getTilesAtScale(query, transform, scratchBounds);
                    var uncachedTiles;
                    var source = this._source;
                    for (var i = 0; i < tiles.length; i++) {
                        var tile = tiles[i];
                        if (!tile.cachedSurfaceRegion || !tile.cachedSurfaceRegion.surface || source.hasFlags(256    /* Dynamic */ | 4096    /* Dirty */)) {
                            if (!uncachedTiles) {
                                uncachedTiles = [];
                            }
                            uncachedTiles.push(tile);
                        }
                    }
                    if (uncachedTiles) {
                        this._cacheTiles(scratchContext, uncachedTiles, cacheImageCallback, scratchBounds);
                    }
                    source.removeFlags(4096    /* Dirty */);
                    return tiles;
                };
                RenderableTileCache.prototype._getTileBounds = function (tiles) {
                    var bounds = Rectangle.createEmpty();
                    for (var i = 0; i < tiles.length; i++) {
                        bounds.union(tiles[i].bounds);
                    }
                    return bounds;
                };
                /**
                 * This caches raster versions of the specified |uncachedTiles|. The tiles are generated using a scratch
                 * canvas2D context (|scratchContext|) and then cached via |cacheImageCallback|. Ideally, we want to render
                 * all tiles in one go, but they may not fit in the |scratchContext| in which case we need to render the
                 * source shape several times.
                 *
                 * TODO: Find a good algorithm to do this since it's quite important that we don't repaint too many times.
                 * Spending some time trying to figure out the *optimal* solution may pay-off since painting is soo expensive.
                 */
                RenderableTileCache.prototype._cacheTiles = function (scratchContext, uncachedTiles, cacheImageCallback, scratchBounds, maxRecursionDepth) {
                    if (maxRecursionDepth === void 0) {
                        maxRecursionDepth = 4;
                    }
                    release || assert(maxRecursionDepth > 0, 'Infinite recursion is likely.');
                    var uncachedTileBounds = this._getTileBounds(uncachedTiles);
                    scratchContext.save();
                    scratchContext.setTransform(1, 0, 0, 1, 0, 0);
                    scratchContext.clearRect(0, 0, scratchBounds.w, scratchBounds.h);
                    scratchContext.translate(-uncachedTileBounds.x, -uncachedTileBounds.y);
                    scratchContext.scale(uncachedTiles[0].scale, uncachedTiles[0].scale);
                    // Translate so that the source is drawn at the origin.
                    var sourceBounds = this._source.getBounds();
                    scratchContext.translate(-sourceBounds.x, -sourceBounds.y);
                    profile && GFX.timelineBuffer && GFX.timelineBuffer.enter('renderTiles');
                    GFX.traceLevel >= 2    /* Verbose */ && GFX.writer && GFX.writer.writeLn('Rendering Tiles: ' + uncachedTileBounds);
                    this._source.render(scratchContext, 0);
                    scratchContext.restore();
                    profile && GFX.timelineBuffer && GFX.timelineBuffer.leave('renderTiles');
                    var remainingUncachedTiles = null;
                    for (var i = 0; i < uncachedTiles.length; i++) {
                        var tile = uncachedTiles[i];
                        var region = tile.bounds.clone();
                        region.x -= uncachedTileBounds.x;
                        region.y -= uncachedTileBounds.y;
                        if (!scratchBounds.contains(region)) {
                            if (!remainingUncachedTiles) {
                                remainingUncachedTiles = [];
                            }
                            remainingUncachedTiles.push(tile);
                        }
                        tile.cachedSurfaceRegion = cacheImageCallback(tile.cachedSurfaceRegion, scratchContext, region);
                    }
                    if (remainingUncachedTiles) {
                        // This is really dumb at the moment; if we have some tiles left over, partition the tile set in half and recurse.
                        if (remainingUncachedTiles.length >= 2) {
                            var a = remainingUncachedTiles.slice(0, remainingUncachedTiles.length / 2 | 0);
                            var b = remainingUncachedTiles.slice(a.length);
                            this._cacheTiles(scratchContext, a, cacheImageCallback, scratchBounds, maxRecursionDepth - 1);
                            this._cacheTiles(scratchContext, b, cacheImageCallback, scratchBounds, maxRecursionDepth - 1);
                        } else {
                            this._cacheTiles(scratchContext, remainingUncachedTiles, cacheImageCallback, scratchBounds, maxRecursionDepth - 1);
                        }
                    }
                };
                return RenderableTileCache;
            }();
            Geometry.RenderableTileCache = RenderableTileCache;
        }(Geometry = GFX.Geometry || (GFX.Geometry = {})));
    }(GFX = Shumway.GFX || (Shumway.GFX = {})));
}(Shumway || (Shumway = {})));
/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __extends = this && this.__extends || function (d, b) {
    for (var p in b)
        if (b.hasOwnProperty(p))
            d[p] = b[p];
    function __() {
        this.constructor = d;
    }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Shumway;
(function (Shumway) {
    var GFX;
    (function (GFX) {
        var roundToMultipleOfPowerOfTwo = Shumway.IntegerUtilities.roundToMultipleOfPowerOfTwo;
        var assert = Shumway.Debug.assert;
        var Rectangle = GFX.Geometry.Rectangle;
        /**
         * Various 2D rectangular region allocators. These are used to manage
         * areas of surfaces, 2D Canvases or WebGL surfaces. Each allocator
         * implements the |IRegionAllocator| interface and must provied two
         * methods to allocate and free regions.
         *
         * CompactAllocator: Good for tightly packed surface atlases but becomes
         * fragmented easily. Allocation / freeing cost is high and should only
         * be used for long lived regions.
         *
         * GridAllocator: Very fast at allocation and freeing but is not very
         * tightly packed. Space is initially partitioned in equally sized grid
         * cells which may be much larger than the allocated regions. This should
         * be used for fixed size allocation regions.
         *
         * BucketAllocator: Manages a list of GridAllocators with different grid
         * sizes.
         */
        var RegionAllocator;
        (function (RegionAllocator) {
            var Region = function (_super) {
                __extends(Region, _super);
                function Region() {
                    _super.apply(this, arguments);
                }
                return Region;
            }(GFX.Geometry.Rectangle);
            RegionAllocator.Region = Region;
            /**
             * Simple 2D bin-packing algorithm that recursively partitions space along the x and y axis. The binary tree
             * can get quite deep so watch out of deep recursive calls. This algorithm works best when inserting items
             * that are sorted by width and height, from largest to smallest.
             */
            var CompactAllocator = function () {
                function CompactAllocator(w, h) {
                    this._root = new CompactCell(0, 0, w | 0, h | 0, false);
                }
                CompactAllocator.prototype.allocate = function (w, h) {
                    w = Math.ceil(w);
                    h = Math.ceil(h);
                    release || assert(w > 0 && h > 0);
                    var result = this._root.insert(w, h);
                    if (result) {
                        result.allocator = this;
                        result.allocated = true;
                    }
                    return result;
                };
                CompactAllocator.prototype.free = function (region) {
                    var cell = region;
                    release || assert(cell.allocator === this);
                    cell.clear();
                    region.allocated = false;
                };
                /**
                 * Try out randomizing the orientation of each subdivision, sometimes this can lead to better results.
                 */
                CompactAllocator.RANDOM_ORIENTATION = true;
                CompactAllocator.MAX_DEPTH = 256;
                return CompactAllocator;
            }();
            RegionAllocator.CompactAllocator = CompactAllocator;
            var CompactCell = function (_super) {
                __extends(CompactCell, _super);
                function CompactCell(x, y, w, h, horizontal) {
                    _super.call(this, x, y, w, h);
                    this._children = null;
                    this._horizontal = horizontal;
                    this.allocated = false;
                }
                CompactCell.prototype.clear = function () {
                    this._children = null;
                    this.allocated = false;
                };
                CompactCell.prototype.insert = function (w, h) {
                    return this._insert(w, h, 0);
                };
                CompactCell.prototype._insert = function (w, h, depth) {
                    if (depth > CompactAllocator.MAX_DEPTH) {
                        return;
                    }
                    if (this.allocated) {
                        return;
                    }
                    if (this.w < w || this.h < h) {
                        return;
                    }
                    if (!this._children) {
                        var orientation = !this._horizontal;
                        if (CompactAllocator.RANDOM_ORIENTATION) {
                            orientation = Math.random() >= 0.5;
                        }
                        if (this._horizontal) {
                            this._children = [
                                new CompactCell(this.x, this.y, this.w, h, false),
                                new CompactCell(this.x, this.y + h, this.w, this.h - h, orientation)
                            ];
                        } else {
                            this._children = [
                                new CompactCell(this.x, this.y, w, this.h, true),
                                new CompactCell(this.x + w, this.y, this.w - w, this.h, orientation)
                            ];
                        }
                        var first = this._children[0];
                        if (first.w === w && first.h === h) {
                            first.allocated = true;
                            return first;
                        }
                        return this._insert(w, h, depth + 1);
                    } else {
                        var result;
                        result = this._children[0]._insert(w, h, depth + 1);
                        if (result) {
                            return result;
                        }
                        result = this._children[1]._insert(w, h, depth + 1);
                        if (result) {
                            return result;
                        }
                    }
                };
                return CompactCell;
            }(RegionAllocator.Region);
            /**
             * Simple grid allocator. Starts off with an empty free list and allocates empty cells. Once a cell
             * is freed it's pushed into the free list. It gets poped off the next time a region is allocated.
             */
            var GridAllocator = function () {
                function GridAllocator(w, h, sizeW, sizeH) {
                    this._columns = w / sizeW | 0;
                    this._rows = h / sizeH | 0;
                    this._sizeW = sizeW;
                    this._sizeH = sizeH;
                    this._freeList = [];
                    this._index = 0;
                    this._total = this._columns * this._rows;
                }
                GridAllocator.prototype.allocate = function (w, h) {
                    w = Math.ceil(w);
                    h = Math.ceil(h);
                    release || assert(w > 0 && h > 0);
                    var sizeW = this._sizeW;
                    var sizeH = this._sizeH;
                    if (w > sizeW || h > sizeH) {
                        return null;
                    }
                    var freeList = this._freeList;
                    var index = this._index;
                    if (freeList.length > 0) {
                        var cell = freeList.pop();
                        release || assert(cell.allocated === false);
                        cell.w = w;
                        cell.h = h;
                        cell.allocated = true;
                        return cell;
                    } else if (index < this._total) {
                        var y = index / this._columns | 0;
                        var x = index - y * this._columns;
                        var cell = new GridCell(x * sizeW, y * sizeH, w, h);
                        cell.index = index;
                        cell.allocator = this;
                        cell.allocated = true;
                        this._index++;
                        return cell;
                    }
                    return null;
                };
                GridAllocator.prototype.free = function (region) {
                    var cell = region;
                    release || assert(cell.allocator === this);
                    cell.allocated = false;
                    this._freeList.push(cell);
                };
                return GridAllocator;
            }();
            RegionAllocator.GridAllocator = GridAllocator;
            var GridCell = function (_super) {
                __extends(GridCell, _super);
                function GridCell(x, y, w, h) {
                    _super.call(this, x, y, w, h);
                    this.index = -1;
                }
                return GridCell;
            }(RegionAllocator.Region);
            RegionAllocator.GridCell = GridCell;
            var Bucket = function () {
                function Bucket(size, region, allocator) {
                    this.size = size;
                    this.region = region;
                    this.allocator = allocator;
                }
                return Bucket;
            }();
            var BucketCell = function (_super) {
                __extends(BucketCell, _super);
                function BucketCell(x, y, w, h, region) {
                    _super.call(this, x, y, w, h);
                    this.region = region;
                }
                return BucketCell;
            }(RegionAllocator.Region);
            RegionAllocator.BucketCell = BucketCell;
            var BucketAllocator = function () {
                function BucketAllocator(w, h) {
                    release || assert(w > 0 && h > 0);
                    this._buckets = [];
                    this._w = w | 0;
                    this._h = h | 0;
                    this._filled = 0;
                }
                /**
                 * Finds the first bucket that is large enough to hold the requested region. If no
                 * such bucket exists, then allocates a new bucket if there is room otherwise
                 * returns null;
                 */
                BucketAllocator.prototype.allocate = function (w, h) {
                    w = Math.ceil(w);
                    h = Math.ceil(h);
                    release || assert(w > 0 && h > 0);
                    var size = Math.max(w, h);
                    if (w > this._w || h > this._h) {
                        // Too big, cannot allocate this.
                        return null;
                    }
                    var region = null;
                    var bucket;
                    var buckets = this._buckets;
                    do {
                        for (var i = 0; i < buckets.length; i++) {
                            if (buckets[i].size >= size) {
                                bucket = buckets[i];
                                region = bucket.allocator.allocate(w, h);
                                if (region) {
                                    break;
                                }
                            }
                        }
                        if (!region) {
                            var remainingSpace = this._h - this._filled;
                            if (remainingSpace < h) {
                                // Couldn't allocate region and there is no more vertical space to allocate
                                // a new bucket that can fit the requested size. So give up.
                                return null;
                            }
                            var gridSize = roundToMultipleOfPowerOfTwo(size, 8);
                            var bucketHeight = gridSize * 2;
                            if (bucketHeight > remainingSpace) {
                                bucketHeight = remainingSpace;
                            }
                            if (bucketHeight < gridSize) {
                                return null;
                            }
                            var bucketRegion = new Rectangle(0, this._filled, this._w, bucketHeight);
                            this._buckets.push(new Bucket(gridSize, bucketRegion, new GridAllocator(bucketRegion.w, bucketRegion.h, gridSize, gridSize)));
                            this._filled += bucketHeight;
                        }
                    } while (!region);
                    return new BucketCell(bucket.region.x + region.x, bucket.region.y + region.y, region.w, region.h, region);
                };
                BucketAllocator.prototype.free = function (region) {
                    region.region.allocator.free(region.region);
                };
                return BucketAllocator;
            }();
            RegionAllocator.BucketAllocator = BucketAllocator;
        }(RegionAllocator = GFX.RegionAllocator || (GFX.RegionAllocator = {})));
        var SurfaceRegionAllocator;
        (function (SurfaceRegionAllocator) {
            var SimpleAllocator = function () {
                function SimpleAllocator(createSurface) {
                    this._createSurface = createSurface;
                    this._surfaces = [];
                }
                Object.defineProperty(SimpleAllocator.prototype, 'surfaces', {
                    get: function () {
                        return this._surfaces;
                    },
                    enumerable: true,
                    configurable: true
                });
                SimpleAllocator.prototype._createNewSurface = function (w, h) {
                    var surface = this._createSurface(w, h);
                    this._surfaces.push(surface);
                    return surface;
                };
                SimpleAllocator.prototype.addSurface = function (surface) {
                    this._surfaces.push(surface);
                };
                SimpleAllocator.prototype.allocate = function (w, h, excludeSurface) {
                    for (var i = 0; i < this._surfaces.length; i++) {
                        var surface = this._surfaces[i];
                        if (surface === excludeSurface) {
                            continue;
                        }
                        var region = surface.allocate(w, h);
                        if (region) {
                            return region;
                        }
                    }
                    return this._createNewSurface(w, h).allocate(w, h);
                };
                SimpleAllocator.prototype.free = function (region) {
                };
                return SimpleAllocator;
            }();
            SurfaceRegionAllocator.SimpleAllocator = SimpleAllocator;
        }(SurfaceRegionAllocator = GFX.SurfaceRegionAllocator || (GFX.SurfaceRegionAllocator = {})));
        var Rectangle = GFX.Geometry.Rectangle;
        var Matrix = GFX.Geometry.Matrix;
        var DirtyRegion = GFX.Geometry.DirtyRegion;
        var assert = Shumway.Debug.assert;
        (function (BlendMode) {
            BlendMode[BlendMode['Normal'] = 1] = 'Normal';
            BlendMode[BlendMode['Layer'] = 2] = 'Layer';
            BlendMode[BlendMode['Multiply'] = 3] = 'Multiply';
            BlendMode[BlendMode['Screen'] = 4] = 'Screen';
            BlendMode[BlendMode['Lighten'] = 5] = 'Lighten';
            BlendMode[BlendMode['Darken'] = 6] = 'Darken';
            BlendMode[BlendMode['Difference'] = 7] = 'Difference';
            BlendMode[BlendMode['Add'] = 8] = 'Add';
            BlendMode[BlendMode['Subtract'] = 9] = 'Subtract';
            BlendMode[BlendMode['Invert'] = 10] = 'Invert';
            BlendMode[BlendMode['Alpha'] = 11] = 'Alpha';
            BlendMode[BlendMode['Erase'] = 12] = 'Erase';
            BlendMode[BlendMode['Overlay'] = 13] = 'Overlay';
            BlendMode[BlendMode['HardLight'] = 14] = 'HardLight';
        }(GFX.BlendMode || (GFX.BlendMode = {})));
        var BlendMode = GFX.BlendMode;
        function getNodeTypeName(nodeType) {
            if (nodeType === 1    /* Node */)
                return 'Node';
            else if (nodeType === 3    /* Shape */)
                return 'Shape';
            else if (nodeType === 5    /* Group */)
                return 'Group';
            else if (nodeType === 13    /* Stage */)
                return 'Stage';
            else if (nodeType === 33    /* Renderable */)
                return 'Renderable';
        }
        /**
         * Basic node visitor. Inherit from this if you want a more sophisticated visitor, for instance all
         * renderers extends this class.
         */
        var NodeVisitor = function () {
            function NodeVisitor() {
            }
            NodeVisitor.prototype.visitNode = function (node, state) {
            };
            NodeVisitor.prototype.visitShape = function (node, state) {
                this.visitNode(node, state);
            };
            NodeVisitor.prototype.visitGroup = function (node, state) {
                this.visitNode(node, state);
                var children = node.getChildren();
                for (var i = 0; i < children.length; i++) {
                    children[i].visit(this, state);
                }
            };
            NodeVisitor.prototype.visitStage = function (node, state) {
                this.visitGroup(node, state);
            };
            NodeVisitor.prototype.visitRenderable = function (node, state) {
                this.visitNode(node, state);
            };
            return NodeVisitor;
        }();
        GFX.NodeVisitor = NodeVisitor;
        /**
         * Nodes that cache transformation state. These are used to thread state when traversing
         * the scene graph. Since they keep track of rendering state, they might as well become
         * scene graph nodes.
         */
        var State = function () {
            function State() {
            }
            return State;
        }();
        GFX.State = State;
        var PreRenderState = function (_super) {
            __extends(PreRenderState, _super);
            function PreRenderState() {
                _super.call(this);
                this.depth = 0;
            }
            return PreRenderState;
        }(State);
        GFX.PreRenderState = PreRenderState;
        /**
         * Helper visitor that checks and resets the dirty bit and calculates stack levels. If the root
         * node is dirty, then we have to repaint the entire node tree.
         */
        var PreRenderVisitor = function (_super) {
            __extends(PreRenderVisitor, _super);
            function PreRenderVisitor() {
                _super.apply(this, arguments);
                this.isDirty = true;
                this._dirtyRegion = null;
                this._depth = 0;
            }
            PreRenderVisitor.prototype.start = function (node, dirtyRegion) {
                this._dirtyRegion = dirtyRegion;
                this._depth = 0;
                node.visit(this, null);
            };
            PreRenderVisitor.prototype.visitGroup = function (node, state) {
                var children = node.getChildren();
                this.visitNode(node, state);
                for (var i = 0; i < children.length; i++) {
                    children[i].visit(this, state);
                }
            };
            PreRenderVisitor.prototype.visitNode = function (node, state) {
                if (node.hasFlags(4096    /* Dirty */)) {
                    this.isDirty = true;
                }
                node.toggleFlags(4096    /* Dirty */, false);
                node.depth = this._depth++;
            };
            return PreRenderVisitor;
        }(NodeVisitor);
        GFX.PreRenderVisitor = PreRenderVisitor;
        /**
         * Debugging visitor.
         */
        var TracingNodeVisitor = function (_super) {
            __extends(TracingNodeVisitor, _super);
            function TracingNodeVisitor(writer) {
                _super.call(this);
                this.writer = writer;
            }
            TracingNodeVisitor.prototype.visitNode = function (node, state) {
            };
            TracingNodeVisitor.prototype.visitShape = function (node, state) {
                this.writer.writeLn(node.toString());
                this.visitNode(node, state);
            };
            TracingNodeVisitor.prototype.visitGroup = function (node, state) {
                this.visitNode(node, state);
                var children = node.getChildren();
                this.writer.enter(node.toString() + ' ' + children.length);
                for (var i = 0; i < children.length; i++) {
                    children[i].visit(this, state);
                }
                this.writer.outdent();
            };
            TracingNodeVisitor.prototype.visitStage = function (node, state) {
                this.visitGroup(node, state);
            };
            return TracingNodeVisitor;
        }(NodeVisitor);
        GFX.TracingNodeVisitor = TracingNodeVisitor;
        /**
         * Base class of all nodes in the scene graph.
         */
        var Node = function () {
            function Node() {
                /**
                 * Number of sibillings to clip.
                 */
                this._clip = -1;
                this._eventListeners = null;
                this._id = Node._nextId++;
                this._type = 1    /* Node */;
                this._index = -1;
                this._parent = null;
                this.reset();
            }
            Object.defineProperty(Node.prototype, 'id', {
                get: function () {
                    return this._id;
                },
                enumerable: true,
                configurable: true
            });
            Node.prototype._dispatchEvent = function (type) {
                if (!this._eventListeners) {
                    return;
                }
                var listeners = this._eventListeners;
                for (var i = 0; i < listeners.length; i++) {
                    var listener = listeners[i];
                    if (listener.type === type) {
                        listener.listener(this, type);
                    }
                }
            };
            /**
             * Adds an event listener.
             */
            Node.prototype.addEventListener = function (type, listener) {
                if (!this._eventListeners) {
                    this._eventListeners = [];
                }
                this._eventListeners.push({
                    type: type,
                    listener: listener
                });
            };
            /**
             * Removes an event listener.
             */
            Node.prototype.removeEventListener = function (type, listener) {
                var listeners = this._eventListeners;
                for (var i = 0; i < listeners.length; i++) {
                    var listenerObject = listeners[i];
                    if (listenerObject.type === type && listenerObject.listener === listener) {
                        listeners.splice(i, 1);
                        return;
                    }
                }
            };
            Object.defineProperty(Node.prototype, 'properties', {
                get: function () {
                    return this._properties || (this._properties = {});
                },
                enumerable: true,
                configurable: true
            });
            /**
             * Resets the Node to its initial state but preserves its identity.
             * It safe to call this on a child without disrupting ownership.
             */
            Node.prototype.reset = function () {
                this._flags = 59393    /* Default */;
                this._bounds = null;
                this._layer = null;
                this._transform = null;
                this._properties = null;
                this.depth = -1;
            };
            Object.defineProperty(Node.prototype, 'clip', {
                get: function () {
                    return this._clip;
                },
                set: function (value) {
                    this._clip = value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Node.prototype, 'parent', {
                get: function () {
                    return this._parent;
                },
                enumerable: true,
                configurable: true
            });
            Node.prototype.getTransformedBounds = function (target) {
                var bounds = this.getBounds(true);
                if (target === this || bounds.isEmpty()) {
                } else {
                    var m = this.getTransform().getConcatenatedMatrix();
                    if (target) {
                        var t = target.getTransform().getInvertedConcatenatedMatrix(true);
                        t.preMultiply(m);
                        t.transformRectangleAABB(bounds);
                        t.free();
                    } else {
                        m.transformRectangleAABB(bounds);
                    }
                }
                return bounds;
            };
            Node.prototype._markCurrentBoundsAsDirtyRegion = function () {
                // return;
                var stage = this.getStage();
                if (!stage) {
                    return;
                }
                var bounds = this.getTransformedBounds(stage);
                stage.dirtyRegion.addDirtyRectangle(bounds);
            };
            Node.prototype.getStage = function (withDirtyRegion) {
                if (withDirtyRegion === void 0) {
                    withDirtyRegion = true;
                }
                var node = this._parent;
                while (node) {
                    if (node.isType(13    /* Stage */)) {
                        var stage = node;
                        if (withDirtyRegion) {
                            if (stage.dirtyRegion) {
                                return stage;
                            }
                        } else {
                            return stage;
                        }
                    }
                    node = node._parent;
                }
                return null;
            };
            /**
             * This shouldn't be used on any hot path becuse it allocates.
             */
            Node.prototype.getChildren = function (clone) {
                if (clone === void 0) {
                    clone = false;
                }
                throw Shumway.Debug.abstractMethod('Node::getChildren');
            };
            Node.prototype.getBounds = function (clone) {
                if (clone === void 0) {
                    clone = false;
                }
                throw Shumway.Debug.abstractMethod('Node::getBounds');
            };
            /**
             * Can only be set on nodes without the |NodeFlags.BoundsAutoCompute| flag set.
             */
            Node.prototype.setBounds = function (value) {
                release || assert(!(this._flags & 2048    /* BoundsAutoCompute */));
                var bounds = this._bounds || (this._bounds = Rectangle.createEmpty());
                bounds.set(value);
                this.removeFlags(8192    /* InvalidBounds */);
            };
            Node.prototype.clone = function () {
                throw Shumway.Debug.abstractMethod('Node::clone');
            };
            Node.prototype.setFlags = function (flags) {
                this._flags |= flags;
            };
            Node.prototype.hasFlags = function (flags) {
                return (this._flags & flags) === flags;
            };
            Node.prototype.hasAnyFlags = function (flags) {
                return !!(this._flags & flags);
            };
            Node.prototype.removeFlags = function (flags) {
                this._flags &= ~flags;
            };
            Node.prototype.toggleFlags = function (flags, on) {
                if (on) {
                    this._flags |= flags;
                } else {
                    this._flags &= ~flags;
                }
            };
            /**
             * Propagates flags up the tree. Propagation stops if all flags are already set.
             */
            Node.prototype._propagateFlagsUp = function (flags) {
                if (flags === 0    /* None */ || this.hasFlags(flags)) {
                    return;
                }
                if (!this.hasFlags(2048    /* BoundsAutoCompute */)) {
                    flags &= ~8192    /* InvalidBounds */;
                }
                this.setFlags(flags);
                var parent = this._parent;
                if (parent) {
                    parent._propagateFlagsUp(flags);
                }
            };
            /**
             * Propagates flags down the tree. Non-containers just set the flags on themselves.
             */
            Node.prototype._propagateFlagsDown = function (flags) {
                throw Shumway.Debug.abstractMethod('Node::_propagateFlagsDown');
            };
            Node.prototype.isAncestor = function (node) {
                while (node) {
                    if (node === this) {
                        return true;
                    }
                    release || assert(node !== node._parent);
                    node = node._parent;
                }
                return false;
            };
            /**
             * Return's a list of ancestors excluding the |last|, the return list is reused.
             */
            Node._getAncestors = function (node, last) {
                var path = Node._path;
                path.length = 0;
                while (node && node !== last) {
                    release || assert(node !== node._parent);
                    path.push(node);
                    node = node._parent;
                }
                release || assert(node === last, 'Last ancestor is not an ancestor.');
                return path;
            };
            /**
             * Finds the closest ancestor with a given set of flags that are either turned on or off.
             */
            Node.prototype._findClosestAncestor = function (flags, on) {
                var node = this;
                while (node) {
                    if (node.hasFlags(flags) === on) {
                        return node;
                    }
                    release || assert(node !== node._parent);
                    node = node._parent;
                }
                return null;
            };
            /**
             * Type check.
             */
            Node.prototype.isType = function (type) {
                return this._type === type;
            };
            /**
             * Subtype check.
             */
            Node.prototype.isTypeOf = function (type) {
                return (this._type & type) === type;
            };
            Node.prototype.isLeaf = function () {
                return this.isType(33    /* Renderable */) || this.isType(3    /* Shape */);
            };
            Node.prototype.isLinear = function () {
                if (this.isLeaf()) {
                    return true;
                }
                if (this.isType(5    /* Group */)) {
                    var children = this._children;
                    if (children.length === 1 && children[0].isLinear()) {
                        return true;
                    }
                }
                return false;
            };
            Node.prototype.getTransformMatrix = function (clone) {
                if (clone === void 0) {
                    clone = false;
                }
                return this.getTransform().getMatrix(clone);
            };
            Node.prototype.getTransform = function () {
                if (this._transform === null) {
                    this._transform = new Transform(this);
                }
                return this._transform;
            };
            Node.prototype.getLayer = function () {
                if (this._layer === null) {
                    this._layer = new Layer(this);
                }
                return this._layer;
            };
            Node.prototype.getLayerBounds = function (includeFilters) {
                var bounds = this.getBounds();
                if (includeFilters && this._layer) {
                    this._layer.expandBounds(bounds);
                }
                return bounds;
            };
            //    public getConcatenatedMatrix(clone: boolean = false): Matrix {
            //      var transform: Transform = this.getTransform(false);
            //      if (transform) {
            //        return transform.getConcatenatedMatrix(clone);
            //      }
            //      return Matrix.createIdentity();
            //    }
            /**
             * Dispatch on node types.
             */
            Node.prototype.visit = function (visitor, state) {
                switch (this._type) {
                case 1    /* Node */:
                    visitor.visitNode(this, state);
                    break;
                case 5    /* Group */:
                    visitor.visitGroup(this, state);
                    break;
                case 13    /* Stage */:
                    visitor.visitStage(this, state);
                    break;
                case 3    /* Shape */:
                    visitor.visitShape(this, state);
                    break;
                case 33    /* Renderable */:
                    visitor.visitRenderable(this, state);
                    break;
                default:
                    Shumway.Debug.unexpectedCase();
                }
            };
            Node.prototype.invalidate = function () {
                this._markCurrentBoundsAsDirtyRegion();
                this._propagateFlagsUp(12288    /* UpOnInvalidate */);
            };
            Node.prototype.toString = function (bounds) {
                if (bounds === void 0) {
                    bounds = false;
                }
                var s = getNodeTypeName(this._type) + ' ' + this._id;
                if (bounds) {
                    s += ' ' + this._bounds.toString();
                }
                return s;
            };
            /**
             * Temporary array of nodes to avoid allocations.
             */
            Node._path = [];
            /**
             * Used to give nodes unique ids.
             */
            Node._nextId = 0;
            return Node;
        }();
        GFX.Node = Node;
        /**
         * Nodes that contain other nodes.
         */
        var Group = function (_super) {
            __extends(Group, _super);
            function Group() {
                _super.call(this);
                this._type = 5    /* Group */;
                this._children = [];
            }
            Group.prototype.getChildren = function (clone) {
                if (clone === void 0) {
                    clone = false;
                }
                if (clone) {
                    return this._children.slice(0);
                }
                return this._children;
            };
            Group.prototype.childAt = function (index) {
                release || assert(index >= 0 && index < this._children.length);
                return this._children[index];
            };
            Object.defineProperty(Group.prototype, 'child', {
                get: function () {
                    release || assert(this._children.length === 1);
                    return this._children[0];
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Group.prototype, 'groupChild', {
                get: function () {
                    release || assert(this._children.length === 1);
                    release || assert(this._children[0] instanceof Group);
                    return this._children[0];
                },
                enumerable: true,
                configurable: true
            });
            /**
             * Adds a node and remove's it from its previous location if it has a parent and propagates
             * flags accordingly.
             */
            Group.prototype.addChild = function (node) {
                release || assert(node);
                release || assert(!node.isAncestor(this));
                if (node._parent) {
                    node._parent.removeChildAt(node._index);
                }
                node._parent = this;
                node._index = this._children.length;
                this._children.push(node);
                this._propagateFlagsUp(12288    /* UpOnAddedOrRemoved */);
                node._propagateFlagsDown(114688    /* DownOnAddedOrRemoved */);
                node._markCurrentBoundsAsDirtyRegion();
            };
            /**
             * Removes a child at the given index and propagates flags accordingly.
             */
            Group.prototype.removeChildAt = function (index) {
                release || assert(index >= 0 && index < this._children.length);
                var node = this._children[index];
                release || assert(index === node._index);
                node._markCurrentBoundsAsDirtyRegion();
                this._children.splice(index, 1);
                node._index = -1;
                node._parent = null;
                this._propagateFlagsUp(12288    /* UpOnAddedOrRemoved */);
                node._propagateFlagsDown(114688    /* DownOnAddedOrRemoved */);
            };
            Group.prototype.clearChildren = function () {
                for (var i = 0; i < this._children.length; i++) {
                    var child = this._children[i];
                    child._markCurrentBoundsAsDirtyRegion();
                    if (child) {
                        child._index = -1;
                        child._parent = null;
                        child._propagateFlagsDown(114688    /* DownOnAddedOrRemoved */);
                    }
                }
                this._children.length = 0;
                this._propagateFlagsUp(12288    /* UpOnAddedOrRemoved */);
            };
            /**
             * Override and propagate flags to all children.
             */
            Group.prototype._propagateFlagsDown = function (flags) {
                if (this.hasFlags(flags)) {
                    return;
                }
                this.setFlags(flags);
                var children = this._children;
                for (var i = 0; i < children.length; i++) {
                    children[i]._propagateFlagsDown(flags);
                }
            };
            /**
             * Takes the union of all child bounds and caches the bounds locally.
             */
            Group.prototype.getBounds = function (clone) {
                if (clone === void 0) {
                    clone = false;
                }
                var bounds = this._bounds || (this._bounds = Rectangle.createEmpty());
                if (this.hasFlags(8192    /* InvalidBounds */)) {
                    bounds.setEmpty();
                    var children = this._children;
                    var childBounds = Rectangle.allocate();
                    for (var i = 0; i < children.length; i++) {
                        var child = children[i];
                        childBounds.set(child.getBounds());
                        child.getTransformMatrix().transformRectangleAABB(childBounds);
                        bounds.union(childBounds);
                    }
                    childBounds.free();
                    this.removeFlags(8192    /* InvalidBounds */);
                }
                if (clone) {
                    return bounds.clone();
                }
                return bounds;
            };
            /**
             * Takes the union of all child bounds, optionaly including filter expansions.
             */
            Group.prototype.getLayerBounds = function (includeFilters) {
                if (!includeFilters) {
                    return this.getBounds();
                }
                var bounds = Rectangle.createEmpty();
                var children = this._children;
                var childBounds = Rectangle.allocate();
                for (var i = 0; i < children.length; i++) {
                    var child = children[i];
                    childBounds.set(child.getLayerBounds(includeFilters));
                    child.getTransformMatrix().transformRectangleAABB(childBounds);
                    bounds.union(childBounds);
                }
                childBounds.free();
                if (includeFilters && this._layer) {
                    this._layer.expandBounds(bounds);
                }
                return bounds;
            };
            return Group;
        }(Node);
        GFX.Group = Group;
        /**
         * Transform associated with a node. This helps to reduce the size of nodes.
         */
        var Transform = function () {
            function Transform(node) {
                this._node = node;
                this._matrix = Matrix.createIdentity();
                // MEMORY: Lazify construction.
                this._colorMatrix = GFX.ColorMatrix.createIdentity();
                // MEMORY: Lazify construction.
                this._concatenatedMatrix = Matrix.createIdentity();
                // MEMORY: Lazify construction.
                this._invertedConcatenatedMatrix = Matrix.createIdentity();
                // MEMORY: Lazify construction.
                this._concatenatedColorMatrix = GFX.ColorMatrix.createIdentity();    // MEMORY: Lazify construction.
            }
            //    public get x(): number {
            //      return this._matrix.tx;
            //    }
            //
            //    public set x(value: number) {
            //      this._matrix.tx = value;
            //      this._node._propagateFlagsUp(NodeFlags.UpOnMoved);
            //      this._node._propagateFlagsDown(NodeFlags.DownOnMoved);
            //    }
            //
            //    public get y(): number {
            //      return this._matrix.ty;
            //    }
            //
            //    public set y(value: number) {
            //      this._matrix.ty = value;
            //      this._node._propagateFlagsUp(NodeFlags.UpOnMoved);
            //      this._node._propagateFlagsDown(NodeFlags.DownOnMoved);
            //    }
            /**
             * Set a node's transform matrix. You should never mutate the matrix object directly.
             */
            Transform.prototype.setMatrix = function (value) {
                if (this._matrix.isEqual(value)) {
                    return;
                }
                this._node._markCurrentBoundsAsDirtyRegion();
                this._matrix.set(value);
                this._node._propagateFlagsUp(12288    /* UpOnMoved */);
                this._node._propagateFlagsDown(49152    /* DownOnMoved */);
                this._node._markCurrentBoundsAsDirtyRegion();
            };
            Transform.prototype.setColorMatrix = function (value) {
                this._colorMatrix.set(value);
                this._node._propagateFlagsUp(4096    /* UpOnColorMatrixChanged */);
                this._node._propagateFlagsDown(65536    /* DownOnColorMatrixChanged */);
                this._node._markCurrentBoundsAsDirtyRegion();
            };
            Transform.prototype.getMatrix = function (clone) {
                if (clone === void 0) {
                    clone = false;
                }
                if (clone) {
                    return this._matrix.clone();
                }
                return this._matrix;
            };
            Transform.prototype.hasColorMatrix = function () {
                return this._colorMatrix !== null;
            };
            Transform.prototype.getColorMatrix = function (clone) {
                if (clone === void 0) {
                    clone = false;
                }
                if (this._colorMatrix === null) {
                    this._colorMatrix = GFX.ColorMatrix.createIdentity();
                }
                if (clone) {
                    return this._colorMatrix.clone();
                }
                return this._colorMatrix;
            };
            /**
             * Compute the concatenated transforms for this node and all of its ancestors since we're already doing
             * all the work.
             */
            Transform.prototype.getConcatenatedMatrix = function (clone) {
                if (clone === void 0) {
                    clone = false;
                }
                if (this._node.hasFlags(16384    /* InvalidConcatenatedMatrix */)) {
                    var ancestor = this._node._findClosestAncestor(16384    /* InvalidConcatenatedMatrix */, false);
                    var path = Node._getAncestors(this._node, ancestor);
                    var m = ancestor ? ancestor.getTransform()._concatenatedMatrix.clone() : Matrix.createIdentity();
                    for (var i = path.length - 1; i >= 0; i--) {
                        var ancestor = path[i];
                        var ancestorTransform = ancestor.getTransform();
                        release || assert(ancestor.hasFlags(16384    /* InvalidConcatenatedMatrix */));
                        m.preMultiply(ancestorTransform._matrix);
                        ancestorTransform._concatenatedMatrix.set(m);
                        ancestor.removeFlags(16384    /* InvalidConcatenatedMatrix */);
                    }
                }
                if (clone) {
                    return this._concatenatedMatrix.clone();
                }
                return this._concatenatedMatrix;
            };
            Transform.prototype.getInvertedConcatenatedMatrix = function (clone) {
                if (clone === void 0) {
                    clone = false;
                }
                if (this._node.hasFlags(32768    /* InvalidInvertedConcatenatedMatrix */)) {
                    this.getConcatenatedMatrix().inverse(this._invertedConcatenatedMatrix);
                    this._node.removeFlags(32768    /* InvalidInvertedConcatenatedMatrix */);
                }
                if (clone) {
                    return this._invertedConcatenatedMatrix.clone();
                }
                return this._invertedConcatenatedMatrix;
            };
            //    public getConcatenatedColorMatrix(clone: boolean = false): ColorMatrix {
            //      // Compute the concatenated color transforms for this node and all of its ancestors.
            //      if (this.hasFlags(NodeFlags.InvalidConcatenatedColorMatrix)) {
            //        var ancestor = <Transform>this._findClosestAncestor(NodeFlags.InvalidConcatenatedColorMatrix, false);
            //        var path = <Transform []>Node._getAncestors(this, ancestor, NodeType.Transform);
            //        var m = ancestor ? ancestor._concatenatedColorMatrix.clone() : ColorMatrix.createIdentity();
            //        for (var i = path.length - 1; i >= 0; i--) {
            //          var ancestor = path[i];
            //          release || assert (ancestor.hasFlags(NodeFlags.InvalidConcatenatedColorMatrix));
            //          // TODO: Premultiply here.
            //          m.multiply(ancestor._colorMatrix);
            //          ancestor._concatenatedColorMatrix.set(m);
            //          ancestor.removeFlags(NodeFlags.InvalidConcatenatedColorMatrix);
            //        }
            //      }
            //      if (clone) {
            //        return this._concatenatedColorMatrix.clone();
            //      }
            //      return this._concatenatedColorMatrix;
            //    }
            Transform.prototype.toString = function () {
                return this._matrix.toString();
            };
            return Transform;
        }();
        GFX.Transform = Transform;
        /**
         * Layer information associated with a node. This helps to reduce the size of nodes.
         */
        var Layer = function () {
            function Layer(node) {
                this._node = node;
                this._mask = null;
                this._blendMode = BlendMode.Normal;
            }
            Object.defineProperty(Layer.prototype, 'filters', {
                get: function () {
                    return this._filters;
                },
                set: function (value) {
                    this._filters = value;
                    if (value.length) {
                        // TODO: We could avoid invalidating the node if the new filter list contains equal filter objects.
                        this._node.invalidate();
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Layer.prototype, 'blendMode', {
                get: function () {
                    return this._blendMode;
                },
                set: function (value) {
                    this._blendMode = value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Layer.prototype, 'mask', {
                get: function () {
                    return this._mask;
                },
                set: function (value) {
                    if (this._mask !== value) {
                        this._node.invalidate();
                        if (this._mask) {
                            this._mask.removeFlags(4    /* IsMask */);
                        }
                    }
                    this._mask = value;
                    if (this._mask) {
                        this._mask.setFlags(4    /* IsMask */);
                    }    // TODO: Keep track of masked object so we can propagate flags up.
                },
                enumerable: true,
                configurable: true
            });
            Layer.prototype.toString = function () {
                return BlendMode[this._blendMode];
            };
            Layer.prototype.expandBounds = function (bounds) {
                var filters = this._filters;
                if (filters) {
                    for (var i = 0; i < filters.length; i++) {
                        filters[i].expandBounds(bounds);
                    }
                }
            };
            return Layer;
        }();
        GFX.Layer = Layer;
        /**
         * Shapes are instantiations of Renderables.
         */
        var Shape = function (_super) {
            __extends(Shape, _super);
            function Shape(source) {
                _super.call(this);
                release || assert(source);
                this._source = source;
                this._type = 3    /* Shape */;
                this._ratio = 0;
            }
            Shape.prototype.getBounds = function (clone) {
                if (clone === void 0) {
                    clone = false;
                }
                var bounds = this._bounds || (this._bounds = Rectangle.createEmpty());
                if (this.hasFlags(8192    /* InvalidBounds */)) {
                    bounds.set(this._source.getBounds());
                    this.removeFlags(8192    /* InvalidBounds */);
                }
                if (clone) {
                    return bounds.clone();
                }
                return bounds;
            };
            Object.defineProperty(Shape.prototype, 'source', {
                get: function () {
                    return this._source;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Shape.prototype, 'ratio', {
                get: function () {
                    return this._ratio;
                },
                set: function (value) {
                    if (value === this._ratio) {
                        return;
                    }
                    this.invalidate();
                    this._ratio = value;
                },
                enumerable: true,
                configurable: true
            });
            Shape.prototype._propagateFlagsDown = function (flags) {
                this.setFlags(flags);
            };
            Shape.prototype.getChildren = function (clone) {
                if (clone === void 0) {
                    clone = false;
                }
                return [this._source];
            };
            return Shape;
        }(Node);
        GFX.Shape = Shape;
        function getRandomIntInclusive(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        var RendererOptions = function () {
            function RendererOptions() {
                this.debug = false;
                this.paintRenderable = true;
                this.paintBounds = false;
                this.paintDirtyRegion = false;
                this.paintFlashing = false;
                this.paintViewport = false;
                this.clear = true;
            }
            return RendererOptions;
        }();
        GFX.RendererOptions = RendererOptions;
        /**
         * Base class for all renderers.
         */
        var Renderer = function (_super) {
            __extends(Renderer, _super);
            function Renderer(container, stage, options) {
                _super.call(this);
                this._container = container;
                this._stage = stage;
                this._options = options;
                this._viewport = Rectangle.createSquare(1024);
                this._devicePixelRatio = 1;
            }
            Object.defineProperty(Renderer.prototype, 'viewport', {
                set: function (viewport) {
                    this._viewport.set(viewport);
                },
                enumerable: true,
                configurable: true
            });
            Renderer.prototype.render = function () {
                throw Shumway.Debug.abstractMethod('Renderer::render');
            };
            /**
             * Notify renderer that the viewport has changed.
             */
            Renderer.prototype.resize = function () {
                throw Shumway.Debug.abstractMethod('Renderer::resize');
            };
            /**
             * Captures a rectangular region of the easel as a dataURL as specified by |bounds|. |stageContent| indicates if the bounds
             * should be computed by looking at the bounds of the content of the easel rather than the easel itself.
             */
            Renderer.prototype.screenShot = function (bounds, stageContent, disableHidpi) {
                throw Shumway.Debug.abstractMethod('Renderer::screenShot');
            };
            return Renderer;
        }(NodeVisitor);
        GFX.Renderer = Renderer;
        /**
         * Node container that handles Flash style alignment and scale modes.
         */
        var Stage = function (_super) {
            __extends(Stage, _super);
            function Stage(w, h, trackDirtyRegion) {
                if (trackDirtyRegion === void 0) {
                    trackDirtyRegion = false;
                }
                _super.call(this);
                this._preVisitor = new PreRenderVisitor();
                this._flags &= ~2048    /* BoundsAutoCompute */;
                this._type = 13    /* Stage */;
                this._scaleMode = Stage.DEFAULT_SCALE;
                this._align = Stage.DEFAULT_ALIGN;
                this._content = new Group();
                this._content._flags &= ~2048    /* BoundsAutoCompute */;
                this.addChild(this._content);
                this.setFlags(4096    /* Dirty */);
                this.setBounds(new Rectangle(0, 0, w, h));
                if (trackDirtyRegion) {
                    this._dirtyRegion = new DirtyRegion(w, h);
                    this._dirtyRegion.addDirtyRectangle(new Rectangle(0, 0, w, h));
                } else {
                    this._dirtyRegion = null;
                }
                this._updateContentMatrix();
            }
            Object.defineProperty(Stage.prototype, 'dirtyRegion', {
                get: function () {
                    return this._dirtyRegion;
                },
                enumerable: true,
                configurable: true
            });
            Stage.prototype.setBounds = function (value) {
                _super.prototype.setBounds.call(this, value);
                this._updateContentMatrix();
                this._dispatchEvent(1    /* OnStageBoundsChanged */);
                if (this._dirtyRegion) {
                    this._dirtyRegion = new DirtyRegion(value.w, value.h);
                    this._dirtyRegion.addDirtyRectangle(value);
                }
            };
            Object.defineProperty(Stage.prototype, 'content', {
                get: function () {
                    return this._content;
                },
                enumerable: true,
                configurable: true
            });
            /**
             * Checks to see if we should render and if so, clears any relevant dirty flags. Returns
             * true if rendering should commence. Flag clearing is made optional here in case there
             * is any code that needs to check if rendering is about to happen.
             */
            Stage.prototype.readyToRender = function () {
                this._preVisitor.isDirty = false;
                this._preVisitor.start(this, this._dirtyRegion);
                if (this._preVisitor.isDirty) {
                    return true;
                }
                return false;
            };
            Object.defineProperty(Stage.prototype, 'align', {
                get: function () {
                    return this._align;
                },
                set: function (value) {
                    this._align = value;
                    this._updateContentMatrix();
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Stage.prototype, 'scaleMode', {
                get: function () {
                    return this._scaleMode;
                },
                set: function (value) {
                    this._scaleMode = value;
                    this._updateContentMatrix();
                },
                enumerable: true,
                configurable: true
            });
            /**
             * Figure out what the content transform shuold be given the current align and scale modes.
             */
            Stage.prototype._updateContentMatrix = function () {
                if (this._scaleMode === Stage.DEFAULT_SCALE && this._align === Stage.DEFAULT_ALIGN) {
                    // Shortcut and also guard to avoid using targetWidth/targetHeight.
                    // ThetargetWidth/targetHeight normally set in setScaleAndAlign call.
                    this._content.getTransform().setMatrix(new Matrix(1, 0, 0, 1, 0, 0));
                    return;
                }
                var bounds = this.getBounds();
                var contentBounds = this._content.getBounds();
                // Debug.assert(this.targetWidth > 0 && this.targetHeight > 0);
                var wScale = bounds.w / contentBounds.w;
                var hScale = bounds.h / contentBounds.h;
                var scaleX, scaleY;
                switch (this._scaleMode) {
                case 2    /* NoBorder */:
                    scaleX = scaleY = Math.max(wScale, hScale);
                    break;
                case 4    /* NoScale */:
                    scaleX = scaleY = 1;
                    break;
                case 1    /* ExactFit */:
                    scaleX = wScale;
                    scaleY = hScale;
                    break;
                // case StageScaleMode.ShowAll:
                default:
                    scaleX = scaleY = Math.min(wScale, hScale);
                    break;
                }
                var offsetX;
                if (this._align & 4    /* Left */) {
                    offsetX = 0;
                } else if (this._align & 8    /* Right */) {
                    offsetX = bounds.w - contentBounds.w * scaleX;
                } else {
                    offsetX = (bounds.w - contentBounds.w * scaleX) / 2;
                }
                var offsetY;
                if (this._align & 1    /* Top */) {
                    offsetY = 0;
                } else if (this._align & 2    /* Bottom */) {
                    offsetY = bounds.h - contentBounds.h * scaleY;
                } else {
                    offsetY = (bounds.h - contentBounds.h * scaleY) / 2;
                }
                this._content.getTransform().setMatrix(new Matrix(scaleX, 0, 0, scaleY, offsetX, offsetY));
            };
            // Using these constants initially -- they don't require knowing bounds.
            // Notice that this default values are different from ActionScript object values.
            Stage.DEFAULT_SCALE = 4    /* NoScale */;
            Stage.DEFAULT_ALIGN = 4    /* Left */ | 1    /* Top */;
            return Stage;
        }(Group);
        GFX.Stage = Stage;
        var Point = GFX.Geometry.Point;
        var Rectangle = GFX.Geometry.Rectangle;
        var Matrix = GFX.Geometry.Matrix;
        var assertUnreachable = Shumway.Debug.assertUnreachable;
        var assert = Shumway.Debug.assert;
        var indexOf = Shumway.ArrayUtilities.indexOf;
        /**
         * Represents some source renderable content.
         */
        var Renderable = function (_super) {
            __extends(Renderable, _super);
            function Renderable() {
                _super.call(this);
                /**
                 * Back reference to nodes that use this renderable.
                 */
                this._parents = [];
                /**
                 * Back reference to renderables that use this renderable.
                 */
                this._renderableParents = [];
                this._invalidateEventListeners = null;
                this._flags &= ~2048    /* BoundsAutoCompute */;
                this._type = 33    /* Renderable */;
            }
            Object.defineProperty(Renderable.prototype, 'parents', {
                get: function () {
                    return this._parents;
                },
                enumerable: true,
                configurable: true
            });
            Renderable.prototype.addParent = function (frame) {
                release || assert(frame);
                var index = indexOf(this._parents, frame);
                release || assert(index < 0);
                this._parents.push(frame);
            };
            /**
             * Checks if this node will be reached by the renderer.
             */
            Renderable.prototype.willRender = function () {
                var parents = this._parents;
                for (var i = 0; i < parents.length; i++) {
                    var node = parents[i];
                    while (node) {
                        if (node.isType(13    /* Stage */)) {
                            return true;
                        }
                        if (!node.hasFlags(1    /* Visible */)) {
                            break;
                        }
                        node = node._parent;
                    }
                }
                return false;
            };
            Renderable.prototype.addRenderableParent = function (renderable) {
                release || assert(renderable);
                release || assert(this._renderableParents.indexOf(renderable) === -1);
                this._renderableParents.push(renderable);
            };
            /**
             * Returns the first unrooted parent or creates a new parent if none was found.
             */
            Renderable.prototype.wrap = function () {
                var node;
                var parents = this._parents;
                for (var i = 0; i < parents.length; i++) {
                    node = parents[i];
                    if (!node._parent) {
                        return node;
                    }
                }
                node = new GFX.Shape(this);
                this.addParent(node);
                return node;
            };
            Renderable.prototype.invalidate = function () {
                this.setFlags(4096    /* Dirty */);
                var nodes = this._parents;
                for (var i = 0; i < nodes.length; i++) {
                    nodes[i].invalidate();
                }
                var renderables = this._renderableParents;
                for (var i = 0; i < renderables.length; i++) {
                    renderables[i].invalidate();
                }
                var listeners = this._invalidateEventListeners;
                if (listeners) {
                    for (var i = 0; i < listeners.length; i++) {
                        listeners[i](this);
                    }
                }
            };
            Renderable.prototype.addInvalidateEventListener = function (listener) {
                if (!this._invalidateEventListeners) {
                    this._invalidateEventListeners = [];
                }
                var index = indexOf(this._invalidateEventListeners, listener);
                release || assert(index < 0);
                this._invalidateEventListeners.push(listener);
            };
            Renderable.prototype.getBounds = function (clone) {
                if (clone === void 0) {
                    clone = false;
                }
                if (clone) {
                    return this._bounds.clone();
                }
                return this._bounds;
            };
            Renderable.prototype.getChildren = function (clone) {
                if (clone === void 0) {
                    clone = false;
                }
                return null;
            };
            Renderable.prototype._propagateFlagsUp = function (flags) {
                if (flags === 0    /* None */ || this.hasFlags(flags)) {
                    return;
                }
                for (var i = 0; i < this._parents.length; i++) {
                    this._parents[i]._propagateFlagsUp(flags);
                }
            };
            /**
             * Render source content in the specified |context| or add one or more paths to |clipPath| if specified.
             * If specified, the rectangular |cullBounds| can be used to cull parts of the shape for better performance.
             * If |paintStencil| is |true| then we must not create any alpha values, and also not paint any strokes.
             */
            Renderable.prototype.render = function (context, ratio, cullBounds, clipPath, paintStencil) {
            };
            return Renderable;
        }(GFX.Node);
        GFX.Renderable = Renderable;
        var CustomRenderable = function (_super) {
            __extends(CustomRenderable, _super);
            function CustomRenderable(bounds, render) {
                _super.call(this);
                this.setBounds(bounds);
                this.render = render;
            }
            return CustomRenderable;
        }(Renderable);
        GFX.CustomRenderable = CustomRenderable;
        var RenderableVideo = function (_super) {
            __extends(RenderableVideo, _super);
            function RenderableVideo(assetId, eventSerializer) {
                _super.call(this);
                this._flags = 256    /* Dynamic */ | 4096    /* Dirty */;
                this._lastTimeInvalidated = 0;
                this._lastPausedTime = 0;
                this._seekHappening = false;
                this._pauseHappening = false;
                this._isDOMElement = true;
                this.setBounds(new Rectangle(0, 0, 1, 1));
                this._assetId = assetId;
                this._eventSerializer = eventSerializer;
                var element = document.createElement('video');
                var elementEventHandler = this._handleVideoEvent.bind(this);
                element.preload = 'metadata';
                // for mobile devices
                element.addEventListener('play', elementEventHandler);
                element.addEventListener('pause', elementEventHandler);
                element.addEventListener('ended', elementEventHandler);
                element.addEventListener('loadeddata', elementEventHandler);
                element.addEventListener('progress', elementEventHandler);
                element.addEventListener('suspend', elementEventHandler);
                element.addEventListener('loadedmetadata', elementEventHandler);
                element.addEventListener('error', elementEventHandler);
                element.addEventListener('seeking', elementEventHandler);
                element.addEventListener('seeked', elementEventHandler);
                element.addEventListener('canplay', elementEventHandler);
                element.style.position = 'absolute';
                this._video = element;
                this._videoEventHandler = elementEventHandler;
                RenderableVideo._renderableVideos.push(this);
                if (typeof registerInspectorAsset !== 'undefined') {
                    registerInspectorAsset(-1, -1, this);
                }
                this._state = 1    /* Idle */;
            }
            Object.defineProperty(RenderableVideo.prototype, 'video', {
                get: function () {
                    return this._video;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(RenderableVideo.prototype, 'state', {
                get: function () {
                    return this._state;
                },
                enumerable: true,
                configurable: true
            });
            RenderableVideo.prototype.play = function () {
                this._state = 2    /* Playing */;
                this._video.play();
            };
            RenderableVideo.prototype.pause = function () {
                this._state = 3    /* Paused */;
                this._video.pause();
            };
            RenderableVideo.prototype._handleVideoEvent = function (evt) {
                var type;
                var data = null;
                var element = this._video;
                switch (evt.type) {
                case 'play':
                    if (!this._pauseHappening) {
                        return;
                    }
                    type = 7    /* Unpause */;
                    break;
                case 'pause':
                    if (this._state === 2    /* Playing */) {
                        element.play();
                        return;
                    }
                    type = 6    /* Pause */;
                    this._pauseHappening = true;
                    break;
                case 'ended':
                    this._state = 4    /* Ended */;
                    this._notifyNetStream(3    /* PlayStop */, data);
                    type = 4    /* BufferEmpty */;
                    break;
                case 'loadeddata':
                    this._pauseHappening = false;
                    this._notifyNetStream(2    /* PlayStart */, data);
                    this.play();
                    return;
                case 'canplay':
                    if (this._pauseHappening) {
                        return;
                    }
                    type = 5    /* BufferFull */;
                    break;
                case 'progress':
                    type = 10    /* Progress */;
                    break;
                case 'suspend':
                    //          type = VideoPlaybackEvent.BufferEmpty;
                    //          break;
                    return;
                case 'loadedmetadata':
                    type = 1    /* Metadata */;
                    data = {
                        videoWidth: element.videoWidth,
                        videoHeight: element.videoHeight,
                        duration: element.duration
                    };
                    break;
                case 'error':
                    type = 11    /* Error */;
                    data = { code: element.error.code };
                    break;
                case 'seeking':
                    if (!this._seekHappening) {
                        return;
                    }
                    type = 8    /* Seeking */;
                    break;
                case 'seeked':
                    if (!this._seekHappening) {
                        return;
                    }
                    type = 9    /* Seeked */;
                    this._seekHappening = false;
                    break;
                default:
                    return;    // unhandled event
                }
                this._notifyNetStream(type, data);
            };
            RenderableVideo.prototype._notifyNetStream = function (eventType, data) {
                this._eventSerializer.sendVideoPlaybackEvent(this._assetId, eventType, data);
            };
            RenderableVideo.prototype.processControlRequest = function (type, data) {
                var videoElement = this._video;
                var ESTIMATED_VIDEO_SECOND_SIZE = 500;
                switch (type) {
                case 1    /* Init */:
                    videoElement.src = data.url;
                    this.play();
                    this._notifyNetStream(0    /* Initialized */, null);
                    break;
                case 9    /* EnsurePlaying */:
                    if (videoElement.paused) {
                        videoElement.play();
                    }
                    break;
                case 2    /* Pause */:
                    if (videoElement) {
                        if (data.paused && !videoElement.paused) {
                            if (!isNaN(data.time)) {
                                if (videoElement.seekable.length !== 0) {
                                    videoElement.currentTime = data.time;
                                }
                                this._lastPausedTime = data.time;
                            } else {
                                this._lastPausedTime = videoElement.currentTime;
                            }
                            this.pause();
                        } else if (!data.paused && videoElement.paused) {
                            this.play();
                            if (!isNaN(data.time) && this._lastPausedTime !== data.time && videoElement.seekable.length !== 0) {
                                videoElement.currentTime = data.time;
                            }
                        }
                    }
                    return;
                case 3    /* Seek */:
                    if (videoElement && videoElement.seekable.length !== 0) {
                        this._seekHappening = true;
                        videoElement.currentTime = data.time;
                    }
                    return;
                case 4    /* GetTime */:
                    return videoElement ? videoElement.currentTime : 0;
                case 5    /* GetBufferLength */:
                    return videoElement ? videoElement.duration : 0;
                case 6    /* SetSoundLevels */:
                    if (videoElement) {
                        videoElement.volume = data.volume;
                    }
                    return;
                case 7    /* GetBytesLoaded */:
                    if (!videoElement) {
                        return 0;
                    }
                    var bufferedTill = -1;
                    if (videoElement.buffered) {
                        for (var i = 0; i < videoElement.buffered.length; i++) {
                            bufferedTill = Math.max(bufferedTill, videoElement.buffered.end(i));
                        }
                    } else {
                        bufferedTill = videoElement.duration;
                    }
                    return Math.round(bufferedTill * ESTIMATED_VIDEO_SECOND_SIZE);
                case 8    /* GetBytesTotal */:
                    return videoElement ? Math.round(videoElement.duration * ESTIMATED_VIDEO_SECOND_SIZE) : 0;
                }
            };
            RenderableVideo.prototype.checkForUpdate = function () {
                if (this._lastTimeInvalidated !== this._video.currentTime) {
                    // Videos composited using DOM elements don't need to invalidate parents.
                    if (!this._isDOMElement) {
                        this.invalidate();
                    }
                }
                this._lastTimeInvalidated = this._video.currentTime;
            };
            RenderableVideo.checkForVideoUpdates = function () {
                var renderables = RenderableVideo._renderableVideos;
                for (var i = 0; i < renderables.length; i++) {
                    var renderable = renderables[i];
                    // Check if the node will be reached by the renderer.
                    if (renderable.willRender()) {
                        // If the nodes video element isn't already on the video layer, mark the node as invalid to
                        // make sure the video element will be added the next time the renderer reaches it.
                        if (!renderable._video.parentElement) {
                            renderable.invalidate();
                        }
                        renderable._video.style.zIndex = renderable.parents[0].depth + '';
                    } else if (renderable._video.parentElement) {
                        // The nodes video element should be removed if no longer visible.
                        renderable._dispatchEvent(2    /* RemovedFromStage */);
                    }
                    renderables[i].checkForUpdate();
                }
            };
            RenderableVideo.prototype.render = function (context, ratio, cullBounds) {
                GFX.enterTimeline('RenderableVideo.render');
                var videoElement = this._video;
                if (videoElement && videoElement.videoWidth > 0) {
                    context.drawImage(videoElement, 0, 0, videoElement.videoWidth, videoElement.videoHeight, 0, 0, this._bounds.w, this._bounds.h);
                }
                GFX.leaveTimeline('RenderableVideo.render');
            };
            RenderableVideo._renderableVideos = [];
            return RenderableVideo;
        }(Renderable);
        GFX.RenderableVideo = RenderableVideo;
        var RenderableBitmap = function (_super) {
            __extends(RenderableBitmap, _super);
            function RenderableBitmap(source, bounds) {
                _super.call(this);
                this._flags = 256    /* Dynamic */ | 4096    /* Dirty */;
                this.properties = {};
                this.setBounds(bounds);
                if (source instanceof HTMLCanvasElement) {
                    this._initializeSourceCanvas(source);
                } else {
                    this._sourceImage = source;
                }
            }
            RenderableBitmap.FromDataBuffer = function (type, dataBuffer, bounds) {
                GFX.enterTimeline('RenderableBitmap.FromDataBuffer');
                var canvas = document.createElement('canvas');
                canvas.width = bounds.w;
                canvas.height = bounds.h;
                var renderableBitmap = new RenderableBitmap(canvas, bounds);
                renderableBitmap.updateFromDataBuffer(type, dataBuffer);
                GFX.leaveTimeline('RenderableBitmap.FromDataBuffer');
                return renderableBitmap;
            };
            RenderableBitmap.FromNode = function (source, matrix, colorMatrix, blendMode, clipRect) {
                GFX.enterTimeline('RenderableBitmap.FromFrame');
                var canvas = document.createElement('canvas');
                var bounds = source.getBounds();
                canvas.width = bounds.w;
                canvas.height = bounds.h;
                var renderableBitmap = new RenderableBitmap(canvas, bounds);
                renderableBitmap.drawNode(source, matrix, colorMatrix, blendMode, clipRect);
                GFX.leaveTimeline('RenderableBitmap.FromFrame');
                return renderableBitmap;
            };
            /**
             * Returns a RenderableBitmap from an Image element, which it uses as its source.
             *
             * Takes `width` and `height` as arguments so it can deal with non-decoded images,
             * which will only get their data after asynchronous decoding has completed.
             */
            RenderableBitmap.FromImage = function (image, width, height) {
                return new RenderableBitmap(image, new Rectangle(0, 0, width, height));
            };
            RenderableBitmap.prototype.updateFromDataBuffer = function (type, dataBuffer) {
                if (!GFX.imageUpdateOption.value) {
                    return;
                }
                var buffer = dataBuffer.buffer;
                GFX.enterTimeline('RenderableBitmap.updateFromDataBuffer', { length: dataBuffer.length });
                if (type === Shumway.ImageType.JPEG || type === Shumway.ImageType.PNG || type === Shumway.ImageType.GIF) {
                    release || Shumway.Debug.assertUnreachable('Mustn\'t encounter un-decoded images here');
                } else {
                    var bounds = this._bounds;
                    var imageData = this._imageData;
                    if (!imageData || imageData.width !== bounds.w || imageData.height !== bounds.h) {
                        imageData = this._imageData = this._context.createImageData(bounds.w, bounds.h);
                    }
                    if (GFX.imageConvertOption.value) {
                        GFX.enterTimeline('ColorUtilities.convertImage');
                        var pixels = new Int32Array(buffer);
                        var out = new Int32Array(imageData.data.buffer);
                        Shumway.ColorUtilities.convertImage(type, Shumway.ImageType.StraightAlphaRGBA, pixels, out);
                        GFX.leaveTimeline('ColorUtilities.convertImage');
                    }
                    GFX.enterTimeline('putImageData');
                    this._ensureSourceCanvas();
                    this._context.putImageData(imageData, 0, 0);
                    GFX.leaveTimeline('putImageData');
                }
                this.invalidate();
                GFX.leaveTimeline('RenderableBitmap.updateFromDataBuffer');
            };
            /**
             * Writes the image data into the given |output| data buffer.
             */
            RenderableBitmap.prototype.readImageData = function (output) {
                output.writeRawBytes(this.imageData.data);
            };
            RenderableBitmap.prototype.render = function (context, ratio, cullBounds) {
                GFX.enterTimeline('RenderableBitmap.render');
                if (this.renderSource) {
                    context.drawImage(this.renderSource, 0, 0);
                } else {
                    this._renderFallback(context);
                }
                GFX.leaveTimeline('RenderableBitmap.render');
            };
            RenderableBitmap.prototype.drawNode = function (source, matrix, colorMatrix, blendMode, clip) {
                // TODO: Support colorMatrix and blendMode.
                GFX.enterTimeline('RenderableBitmap.drawFrame');
                // TODO: Hack to be able to compile this as part of gfx-base.
                var Canvas2D = GFX.Canvas2D;
                var bounds = this.getBounds();
                // TODO: don't create a new renderer every time.
                var renderer = new Canvas2D.Canvas2DRenderer(this._canvas, null);
                renderer.renderNode(source, clip || bounds, matrix);
                GFX.leaveTimeline('RenderableBitmap.drawFrame');
            };
            RenderableBitmap.prototype.mask = function (alphaValues) {
                var imageData = this.imageData;
                var pixels = new Int32Array(imageData.data.buffer);
                var T = Shumway.ColorUtilities.getUnpremultiplyTable();
                for (var i = 0; i < alphaValues.length; i++) {
                    var a = alphaValues[i];
                    if (a === 0) {
                        pixels[i] = 0;
                        continue;
                    }
                    if (a === 255) {
                        continue;
                    }
                    var pixel = pixels[i];
                    var r = pixel >> 0 & 255;
                    var g = pixel >> 8 & 255;
                    var b = pixel >> 16 & 255;
                    var o = a << 8;
                    r = T[o + Math.min(r, a)];
                    g = T[o + Math.min(g, a)];
                    b = T[o + Math.min(b, a)];
                    pixels[i] = a << 24 | b << 16 | g << 8 | r;
                }
                this._context.putImageData(imageData, 0, 0);
            };
            RenderableBitmap.prototype._initializeSourceCanvas = function (source) {
                this._canvas = source;
                this._context = this._canvas.getContext('2d');
            };
            RenderableBitmap.prototype._ensureSourceCanvas = function () {
                if (this._canvas) {
                    return;
                }
                var canvas = document.createElement('canvas');
                var bounds = this._bounds;
                canvas.width = bounds.w;
                canvas.height = bounds.h;
                this._initializeSourceCanvas(canvas);
            };
            Object.defineProperty(RenderableBitmap.prototype, 'imageData', {
                get: function () {
                    if (!this._canvas) {
                        release || assert(this._sourceImage);
                        this._ensureSourceCanvas();
                        this._context.drawImage(this._sourceImage, 0, 0);
                        this._sourceImage = null;
                    }
                    return this._context.getImageData(0, 0, this._bounds.w, this._bounds.h);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(RenderableBitmap.prototype, 'renderSource', {
                get: function () {
                    return this._canvas || this._sourceImage;
                },
                enumerable: true,
                configurable: true
            });
            RenderableBitmap.prototype._renderFallback = function (context) {
                // Only render fallback in debug mode.
                if (release) {
                    return;
                }
                if (!this.fillStyle) {
                    this.fillStyle = Shumway.ColorStyle.randomStyle();
                }
                var bounds = this._bounds;
                context.save();
                context.beginPath();
                context.lineWidth = 2;
                context.fillStyle = this.fillStyle;
                context.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
                context.restore();
            };
            return RenderableBitmap;
        }(Renderable);
        GFX.RenderableBitmap = RenderableBitmap;
        var StyledPath = function () {
            function StyledPath(type, style, smoothImage, strokeProperties) {
                this.type = type;
                this.style = style;
                this.smoothImage = smoothImage;
                this.strokeProperties = strokeProperties;
                this.path = new Path2D();
                release || assert((type === 1    /* Stroke */ || type === 2    /* StrokeFill */) === !!strokeProperties);
            }
            return StyledPath;
        }();
        GFX.StyledPath = StyledPath;
        var StrokeProperties = function () {
            function StrokeProperties(thickness, scaleMode, capsStyle, jointsStyle, miterLimit) {
                this.thickness = thickness;
                this.scaleMode = scaleMode;
                this.capsStyle = capsStyle;
                this.jointsStyle = jointsStyle;
                this.miterLimit = miterLimit;
            }
            return StrokeProperties;
        }();
        GFX.StrokeProperties = StrokeProperties;
        function morph(start, end, ratio) {
            return start + (end - start) * ratio;
        }
        function morphColor(start, end, ratio) {
            return morph(start >> 24 & 255, end >> 24 & 255, ratio) << 24 | morph(start >> 16 & 255, end >> 16 & 255, ratio) << 16 | morph(start >> 8 & 255, end >> 8 & 255, ratio) << 8 | morph(start & 255, end & 255, ratio);
        }
        var RenderableShape = function (_super) {
            __extends(RenderableShape, _super);
            function RenderableShape(id, pathData, textures, bounds) {
                _super.call(this);
                this._flags = 4096    /* Dirty */ | 512    /* Scalable */ | 1024    /* Tileable */;
                this.properties = {};
                this.setBounds(bounds);
                this._id = id;
                this._pathData = pathData;
                this._textures = textures;
                if (textures.length) {
                    this.setFlags(256    /* Dynamic */);
                }
            }
            RenderableShape.prototype.update = function (pathData, textures, bounds) {
                this.setBounds(bounds);
                this._pathData = pathData;
                this._paths = null;
                this._textures = textures;
                this.setFlags(256    /* Dynamic */);
                this.invalidate();
            };
            /**
             * If |clipPath| is not |null| then we must add all paths to |clipPath| instead of drawing to |context|.
             * We also cannot call |save| or |restore| because those functions reset the current clipping region.
             * It looks like Flash ignores strokes when clipping so we can also ignore stroke paths when computing
             * the clip region.
             *
             * If |paintStencil| is |true| then we must not create any alpha values, and also not paint
             * any strokes.
             */
            RenderableShape.prototype.render = function (context, ratio, cullBounds, clipPath, paintStencil) {
                if (clipPath === void 0) {
                    clipPath = null;
                }
                if (paintStencil === void 0) {
                    paintStencil = false;
                }
                var paintStencilStyle = release ? '#000000' : '#FF4981';
                context.fillStyle = context.strokeStyle = 'transparent';
                var paths = this._deserializePaths(this._pathData, context, ratio);
                release || assert(paths);
                GFX.enterTimeline('RenderableShape.render', this);
                for (var i = 0; i < paths.length; i++) {
                    var path = paths[i];
                    context['mozImageSmoothingEnabled'] = context.msImageSmoothingEnabled = context['imageSmoothingEnabled'] = path.smoothImage;
                    if (path.type === 0    /* Fill */) {
                        if (clipPath) {
                            clipPath.addPath(path.path, context.currentTransform);
                        } else {
                            context.fillStyle = paintStencil ? paintStencilStyle : path.style;
                            context.fill(path.path, 'evenodd');
                            context.fillStyle = 'transparent';
                        }
                    } else if (!clipPath && !paintStencil) {
                        context.strokeStyle = path.style;
                        var lineScaleMode = 1    /* Normal */;
                        if (path.strokeProperties) {
                            lineScaleMode = path.strokeProperties.scaleMode;
                            context.lineWidth = path.strokeProperties.thickness;
                            context.lineCap = path.strokeProperties.capsStyle;
                            context.lineJoin = path.strokeProperties.jointsStyle;
                            context.miterLimit = path.strokeProperties.miterLimit;
                        }
                        // Special-cases 1px and 3px lines by moving the drawing position down/right by 0.5px.
                        // Flash apparently does this to create sharp, non-aliased lines in the normal case of thin
                        // lines drawn on round pixel values.
                        // Our handling doesn't always create the same results: for drawing coordinates with
                        // fractional values, Flash draws blurry lines. We do, too, but we still move the line
                        // down/right. Flash does something slightly different, with the result that a line drawn
                        // on coordinates slightly below round pixels (0.8, say) will be moved up/left.
                        // Properly fixing this would probably have to happen in the rasterizer. Or when replaying
                        // all the drawing commands, which seems expensive.
                        var lineWidth = context.lineWidth;
                        var isSpecialCaseWidth = lineWidth === 1 || lineWidth === 3;
                        if (isSpecialCaseWidth) {
                            context.translate(0.5, 0.5);
                        }
                        context.flashStroke(path.path, lineScaleMode);
                        if (isSpecialCaseWidth) {
                            context.translate(-0.5, -0.5);
                        }
                        context.strokeStyle = 'transparent';
                    }
                }
                GFX.leaveTimeline('RenderableShape.render');
            };
            RenderableShape.prototype._deserializePaths = function (data, context, ratio) {
                release || assert(data ? !this._paths : this._paths);
                GFX.enterTimeline('RenderableShape.deserializePaths');
                // TODO: Optimize path handling to use only one path if possible.
                // If both line and fill style are set at the same time, we don't need to duplicate the
                // geometry.
                if (this._paths) {
                    return this._paths;
                }
                var paths = this._paths = [];
                var fillPath = null;
                var strokePath = null;
                // We have to alway store the last position because Flash keeps the drawing cursor where it
                // was when changing fill or line style, whereas Canvas forgets it on beginning a new path.
                var x = 0;
                var y = 0;
                var cpX;
                var cpY;
                var formOpen = false;
                var formOpenX = 0;
                var formOpenY = 0;
                var commands = data.commands;
                var coordinates = data.coordinates;
                var styles = data.styles;
                styles.position = 0;
                var coordinatesIndex = 0;
                var commandsCount = data.commandsPosition;
                // Description of serialization format can be found in flash.display.Graphics.
                for (var commandIndex = 0; commandIndex < commandsCount; commandIndex++) {
                    var command = commands[commandIndex];
                    switch (command) {
                    case 9    /* MoveTo */:
                        release || assert(coordinatesIndex <= data.coordinatesPosition - 2);
                        if (formOpen && fillPath) {
                            fillPath.lineTo(formOpenX, formOpenY);
                            strokePath && strokePath.lineTo(formOpenX, formOpenY);
                        }
                        formOpen = true;
                        x = formOpenX = coordinates[coordinatesIndex++] / 20;
                        y = formOpenY = coordinates[coordinatesIndex++] / 20;
                        fillPath && fillPath.moveTo(x, y);
                        strokePath && strokePath.moveTo(x, y);
                        break;
                    case 10    /* LineTo */:
                        release || assert(coordinatesIndex <= data.coordinatesPosition - 2);
                        x = coordinates[coordinatesIndex++] / 20;
                        y = coordinates[coordinatesIndex++] / 20;
                        fillPath && fillPath.lineTo(x, y);
                        strokePath && strokePath.lineTo(x, y);
                        break;
                    case 11    /* CurveTo */:
                        release || assert(coordinatesIndex <= data.coordinatesPosition - 4);
                        cpX = coordinates[coordinatesIndex++] / 20;
                        cpY = coordinates[coordinatesIndex++] / 20;
                        x = coordinates[coordinatesIndex++] / 20;
                        y = coordinates[coordinatesIndex++] / 20;
                        fillPath && fillPath.quadraticCurveTo(cpX, cpY, x, y);
                        strokePath && strokePath.quadraticCurveTo(cpX, cpY, x, y);
                        break;
                    case 12    /* CubicCurveTo */:
                        release || assert(coordinatesIndex <= data.coordinatesPosition - 6);
                        cpX = coordinates[coordinatesIndex++] / 20;
                        cpY = coordinates[coordinatesIndex++] / 20;
                        var cpX2 = coordinates[coordinatesIndex++] / 20;
                        var cpY2 = coordinates[coordinatesIndex++] / 20;
                        x = coordinates[coordinatesIndex++] / 20;
                        y = coordinates[coordinatesIndex++] / 20;
                        fillPath && fillPath.bezierCurveTo(cpX, cpY, cpX2, cpY2, x, y);
                        strokePath && strokePath.bezierCurveTo(cpX, cpY, cpX2, cpY2, x, y);
                        break;
                    case 1    /* BeginSolidFill */:
                        release || assert(styles.bytesAvailable >= 4);
                        fillPath = this._createPath(0    /* Fill */, Shumway.ColorUtilities.rgbaToCSSStyle(styles.readUnsignedInt()), false, null, x, y);
                        break;
                    case 3    /* BeginBitmapFill */:
                        var bitmapStyle = this._readBitmap(styles, context);
                        fillPath = this._createPath(0    /* Fill */, bitmapStyle.style, bitmapStyle.smoothImage, null, x, y);
                        break;
                    case 2    /* BeginGradientFill */:
                        fillPath = this._createPath(0    /* Fill */, this._readGradient(styles, context), false, null, x, y);
                        break;
                    case 4    /* EndFill */:
                        fillPath = null;
                        break;
                    case 5    /* LineStyleSolid */:
                        var color = Shumway.ColorUtilities.rgbaToCSSStyle(styles.readUnsignedInt());
                        // Skip pixel hinting.
                        styles.position += 1;
                        var scaleMode = styles.readByte();
                        var capsStyle = RenderableShape.LINE_CAPS_STYLES[styles.readByte()];
                        var jointsStyle = RenderableShape.LINE_JOINTS_STYLES[styles.readByte()];
                        var strokeProperties = new StrokeProperties(coordinates[coordinatesIndex++] / 20, scaleMode, capsStyle, jointsStyle, styles.readByte());
                        // Look ahead at the following command to determine if this is a complex stroke style.
                        if (commands[commandIndex + 1] === 6    /* LineStyleGradient */) {
                            commandIndex++;
                            strokePath = this._createPath(2    /* StrokeFill */, this._readGradient(styles, context), false, strokeProperties, x, y);
                        } else if (commands[commandIndex + 1] === 6    /* LineStyleGradient */) {
                            commandIndex++;
                            var bitmapStyle = this._readBitmap(styles, context);
                            strokePath = this._createPath(2    /* StrokeFill */, bitmapStyle.style, bitmapStyle.smoothImage, strokeProperties, x, y);
                        } else {
                            strokePath = this._createPath(1    /* Stroke */, color, false, strokeProperties, x, y);
                        }
                        break;
                    case 8    /* LineEnd */:
                        strokePath = null;
                        break;
                    default:
                        release || assertUnreachable('Invalid command ' + command + ' encountered at index' + commandIndex + ' of ' + commandsCount);
                    }
                }
                release || assert(styles.bytesAvailable === 0);
                release || assert(commandIndex === commandsCount);
                release || assert(coordinatesIndex === data.coordinatesPosition);
                if (formOpen && fillPath) {
                    fillPath.lineTo(formOpenX, formOpenY);
                    strokePath && strokePath.lineTo(formOpenX, formOpenY);
                }
                this._pathData = null;
                GFX.leaveTimeline('RenderableShape.deserializePaths');
                return paths;
            };
            RenderableShape.prototype._createPath = function (type, style, smoothImage, strokeProperties, x, y) {
                var path = new StyledPath(type, style, smoothImage, strokeProperties);
                this._paths.push(path);
                path.path.moveTo(x, y);
                return path.path;
            };
            RenderableShape.prototype._readMatrix = function (data) {
                return new Matrix(data.readFloat(), data.readFloat(), data.readFloat(), data.readFloat(), data.readFloat(), data.readFloat());
            };
            RenderableShape.prototype._readGradient = function (styles, context) {
                // Assert at least one color stop.
                release || assert(styles.bytesAvailable >= 1 + 1 + 6 * 4    /* matrix fields as floats */ + 1 + 1 + 4 + 1 + 1);
                var gradientType = styles.readUnsignedByte();
                var focalPoint = styles.readShort() * 2 / 255;
                release || assert(focalPoint >= -1 && focalPoint <= 1);
                var transform = this._readMatrix(styles);
                var gradient = gradientType === 16    /* Linear */ ? context.createLinearGradient(-1, 0, 1, 0) : context.createRadialGradient(focalPoint, 0, 0, 0, 0, 1);
                gradient.setTransform && gradient.setTransform(transform.toSVGMatrix());
                var colorStopsCount = styles.readUnsignedByte();
                for (var i = 0; i < colorStopsCount; i++) {
                    var ratio = styles.readUnsignedByte() / 255;
                    var cssColor = Shumway.ColorUtilities.rgbaToCSSStyle(styles.readUnsignedInt());
                    gradient.addColorStop(ratio, cssColor);
                }
                // Skip spread and interpolation modes for now.
                styles.position += 2;
                return gradient;
            };
            RenderableShape.prototype._readBitmap = function (styles, context) {
                release || assert(styles.bytesAvailable >= 4 + 6 * 4    /* matrix fields as floats */ + 1 + 1);
                var textureIndex = styles.readUnsignedInt();
                var fillTransform = this._readMatrix(styles);
                var repeat = styles.readBoolean() ? 'repeat' : 'no-repeat';
                var smooth = styles.readBoolean();
                var texture = this._textures[textureIndex];
                var fillStyle;
                if (texture) {
                    fillStyle = context.createPattern(texture.renderSource, repeat);
                    fillStyle.setTransform(fillTransform.toSVGMatrix());
                } else {
                    // TODO: Wire up initially-missing textures that become available later.
                    // An invalid SWF can have shape fills refer to images that occur later in the SWF. In that
                    // case, the image only becomes available once that frame is actually reached. Before that
                    // the fill isn't drawn; it is drawn once the image becomes available, though.
                    fillStyle = null;
                }
                return {
                    style: fillStyle,
                    smoothImage: smooth
                };
            };
            RenderableShape.prototype._renderFallback = function (context) {
                if (!this.fillStyle) {
                    this.fillStyle = Shumway.ColorStyle.randomStyle();
                }
                var bounds = this._bounds;
                context.save();
                context.beginPath();
                context.lineWidth = 2;
                context.fillStyle = this.fillStyle;
                context.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
                //      context.textBaseline = "top";
                //      context.fillStyle = "white";
                //      context.fillText(String(id), bounds.x, bounds.y);
                context.restore();
            };
            RenderableShape.LINE_CAPS_STYLES = [
                'round',
                'butt',
                'square'
            ];
            RenderableShape.LINE_JOINTS_STYLES = [
                'round',
                'bevel',
                'miter'
            ];
            return RenderableShape;
        }(Renderable);
        GFX.RenderableShape = RenderableShape;
        var RenderableMorphShape = function (_super) {
            __extends(RenderableMorphShape, _super);
            function RenderableMorphShape() {
                _super.apply(this, arguments);
                this._flags = 256    /* Dynamic */ | 4096    /* Dirty */ | 512    /* Scalable */ | 1024    /* Tileable */;
                this._morphPaths = Object.create(null);
            }
            RenderableMorphShape.prototype._deserializePaths = function (data, context, ratio) {
                GFX.enterTimeline('RenderableMorphShape.deserializePaths');
                // TODO: Optimize path handling to use only one path if possible.
                // If both line and fill style are set at the same time, we don't need to duplicate the
                // geometry.
                if (this._morphPaths[ratio]) {
                    return this._morphPaths[ratio];
                }
                var paths = this._morphPaths[ratio] = [];
                var fillPath = null;
                var strokePath = null;
                // We have to alway store the last position because Flash keeps the drawing cursor where it
                // was when changing fill or line style, whereas Canvas forgets it on beginning a new path.
                var x = 0;
                var y = 0;
                var cpX;
                var cpY;
                var formOpen = false;
                var formOpenX = 0;
                var formOpenY = 0;
                var commands = data.commands;
                var coordinates = data.coordinates;
                var morphCoordinates = data.morphCoordinates;
                var styles = data.styles;
                var morphStyles = data.morphStyles;
                styles.position = 0;
                morphStyles.position = 0;
                var coordinatesIndex = 0;
                var commandsCount = data.commandsPosition;
                // Description of serialization format can be found in flash.display.Graphics.
                for (var commandIndex = 0; commandIndex < commandsCount; commandIndex++) {
                    var command = commands[commandIndex];
                    switch (command) {
                    case 9    /* MoveTo */:
                        release || assert(coordinatesIndex <= data.coordinatesPosition - 2);
                        if (formOpen && fillPath) {
                            fillPath.lineTo(formOpenX, formOpenY);
                            strokePath && strokePath.lineTo(formOpenX, formOpenY);
                        }
                        formOpen = true;
                        x = formOpenX = morph(coordinates[coordinatesIndex], morphCoordinates[coordinatesIndex++], ratio) / 20;
                        y = formOpenY = morph(coordinates[coordinatesIndex], morphCoordinates[coordinatesIndex++], ratio) / 20;
                        fillPath && fillPath.moveTo(x, y);
                        strokePath && strokePath.moveTo(x, y);
                        break;
                    case 10    /* LineTo */:
                        release || assert(coordinatesIndex <= data.coordinatesPosition - 2);
                        x = morph(coordinates[coordinatesIndex], morphCoordinates[coordinatesIndex++], ratio) / 20;
                        y = morph(coordinates[coordinatesIndex], morphCoordinates[coordinatesIndex++], ratio) / 20;
                        fillPath && fillPath.lineTo(x, y);
                        strokePath && strokePath.lineTo(x, y);
                        break;
                    case 11    /* CurveTo */:
                        release || assert(coordinatesIndex <= data.coordinatesPosition - 4);
                        cpX = morph(coordinates[coordinatesIndex], morphCoordinates[coordinatesIndex++], ratio) / 20;
                        cpY = morph(coordinates[coordinatesIndex], morphCoordinates[coordinatesIndex++], ratio) / 20;
                        x = morph(coordinates[coordinatesIndex], morphCoordinates[coordinatesIndex++], ratio) / 20;
                        y = morph(coordinates[coordinatesIndex], morphCoordinates[coordinatesIndex++], ratio) / 20;
                        fillPath && fillPath.quadraticCurveTo(cpX, cpY, x, y);
                        strokePath && strokePath.quadraticCurveTo(cpX, cpY, x, y);
                        break;
                    case 12    /* CubicCurveTo */:
                        release || assert(coordinatesIndex <= data.coordinatesPosition - 6);
                        cpX = morph(coordinates[coordinatesIndex], morphCoordinates[coordinatesIndex++], ratio) / 20;
                        cpY = morph(coordinates[coordinatesIndex], morphCoordinates[coordinatesIndex++], ratio) / 20;
                        var cpX2 = morph(coordinates[coordinatesIndex], morphCoordinates[coordinatesIndex++], ratio) / 20;
                        var cpY2 = morph(coordinates[coordinatesIndex], morphCoordinates[coordinatesIndex++], ratio) / 20;
                        x = morph(coordinates[coordinatesIndex], morphCoordinates[coordinatesIndex++], ratio) / 20;
                        y = morph(coordinates[coordinatesIndex], morphCoordinates[coordinatesIndex++], ratio) / 20;
                        fillPath && fillPath.bezierCurveTo(cpX, cpY, cpX2, cpY2, x, y);
                        strokePath && strokePath.bezierCurveTo(cpX, cpY, cpX2, cpY2, x, y);
                        break;
                    case 1    /* BeginSolidFill */:
                        release || assert(styles.bytesAvailable >= 4);
                        fillPath = this._createMorphPath(0    /* Fill */, ratio, Shumway.ColorUtilities.rgbaToCSSStyle(morphColor(styles.readUnsignedInt(), morphStyles.readUnsignedInt(), ratio)), false, null, x, y);
                        break;
                    case 3    /* BeginBitmapFill */:
                        var bitmapStyle = this._readMorphBitmap(styles, morphStyles, ratio, context);
                        fillPath = this._createMorphPath(0    /* Fill */, ratio, bitmapStyle.style, bitmapStyle.smoothImage, null, x, y);
                        break;
                    case 2    /* BeginGradientFill */:
                        var gradientStyle = this._readMorphGradient(styles, morphStyles, ratio, context);
                        fillPath = this._createMorphPath(0    /* Fill */, ratio, gradientStyle, false, null, x, y);
                        break;
                    case 4    /* EndFill */:
                        fillPath = null;
                        break;
                    case 5    /* LineStyleSolid */:
                        var width = morph(coordinates[coordinatesIndex], morphCoordinates[coordinatesIndex++], ratio) / 20;
                        var color = Shumway.ColorUtilities.rgbaToCSSStyle(morphColor(styles.readUnsignedInt(), morphStyles.readUnsignedInt(), ratio));
                        // Skip pixel hinting.
                        styles.position += 1;
                        var scaleMode = styles.readByte();
                        var capsStyle = RenderableShape.LINE_CAPS_STYLES[styles.readByte()];
                        var jointsStyle = RenderableShape.LINE_JOINTS_STYLES[styles.readByte()];
                        var strokeProperties = new StrokeProperties(width, scaleMode, capsStyle, jointsStyle, styles.readByte());
                        if (strokeProperties.thickness > 0) {
                            strokePath = this._createMorphPath(1    /* Stroke */, ratio, color, false, strokeProperties, x, y);
                        }
                        break;
                    case 6    /* LineStyleGradient */:
                        var gradientStyle = this._readMorphGradient(styles, morphStyles, ratio, context);
                        strokePath = this._createMorphPath(2    /* StrokeFill */, ratio, gradientStyle, false, null, x, y);
                        break;
                    case 7    /* LineStyleBitmap */:
                        var bitmapStyle = this._readMorphBitmap(styles, morphStyles, ratio, context);
                        strokePath = this._createMorphPath(2    /* StrokeFill */, ratio, bitmapStyle.style, bitmapStyle.smoothImage, null, x, y);
                        break;
                    case 8    /* LineEnd */:
                        strokePath = null;
                        break;
                    default:
                        release || assertUnreachable('Invalid command ' + command + ' encountered at index' + commandIndex + ' of ' + commandsCount);
                    }
                }
                release || assert(styles.bytesAvailable === 0);
                release || assert(commandIndex === commandsCount);
                release || assert(coordinatesIndex === data.coordinatesPosition);
                if (formOpen && fillPath) {
                    fillPath.lineTo(formOpenX, formOpenY);
                    strokePath && strokePath.lineTo(formOpenX, formOpenY);
                }
                GFX.leaveTimeline('RenderableMorphShape.deserializPaths');
                return paths;
            };
            RenderableMorphShape.prototype._createMorphPath = function (type, ratio, style, smoothImage, strokeProperties, x, y) {
                var path = new StyledPath(type, style, smoothImage, strokeProperties);
                this._morphPaths[ratio].push(path);
                path.path.moveTo(x, y);
                return path.path;
            };
            RenderableMorphShape.prototype._readMorphMatrix = function (data, morphData, ratio) {
                return new Matrix(morph(data.readFloat(), morphData.readFloat(), ratio), morph(data.readFloat(), morphData.readFloat(), ratio), morph(data.readFloat(), morphData.readFloat(), ratio), morph(data.readFloat(), morphData.readFloat(), ratio), morph(data.readFloat(), morphData.readFloat(), ratio), morph(data.readFloat(), morphData.readFloat(), ratio));
            };
            RenderableMorphShape.prototype._readMorphGradient = function (styles, morphStyles, ratio, context) {
                // Assert at least one color stop.
                release || assert(styles.bytesAvailable >= 1 + 1 + 6 * 4    /* matrix fields as floats */ + 1 + 1 + 4 + 1 + 1);
                var gradientType = styles.readUnsignedByte();
                var focalPoint = styles.readShort() * 2 / 255;
                release || assert(focalPoint >= -1 && focalPoint <= 1);
                var transform = this._readMorphMatrix(styles, morphStyles, ratio);
                var gradient = gradientType === 16    /* Linear */ ? context.createLinearGradient(-1, 0, 1, 0) : context.createRadialGradient(focalPoint, 0, 0, 0, 0, 1);
                gradient.setTransform && gradient.setTransform(transform.toSVGMatrix());
                var colorStopsCount = styles.readUnsignedByte();
                for (var i = 0; i < colorStopsCount; i++) {
                    var stop = morph(styles.readUnsignedByte() / 255, morphStyles.readUnsignedByte() / 255, ratio);
                    var color = morphColor(styles.readUnsignedInt(), morphStyles.readUnsignedInt(), ratio);
                    var cssColor = Shumway.ColorUtilities.rgbaToCSSStyle(color);
                    gradient.addColorStop(stop, cssColor);
                }
                // Skip spread and interpolation modes for now.
                styles.position += 2;
                return gradient;
            };
            RenderableMorphShape.prototype._readMorphBitmap = function (styles, morphStyles, ratio, context) {
                release || assert(styles.bytesAvailable >= 4 + 6 * 4    /* matrix fields as floats */ + 1 + 1);
                var textureIndex = styles.readUnsignedInt();
                var fillTransform = this._readMorphMatrix(styles, morphStyles, ratio);
                var repeat = styles.readBoolean() ? 'repeat' : 'no-repeat';
                var smooth = styles.readBoolean();
                var texture = this._textures[textureIndex];
                release || assert(texture._canvas);
                var fillStyle = context.createPattern(texture._canvas, repeat);
                fillStyle.setTransform(fillTransform.toSVGMatrix());
                return {
                    style: fillStyle,
                    smoothImage: smooth
                };
            };
            return RenderableMorphShape;
        }(RenderableShape);
        GFX.RenderableMorphShape = RenderableMorphShape;
        var TextLine = function () {
            function TextLine() {
                this.x = 0;
                this.y = 0;
                this.width = 0;
                this.ascent = 0;
                this.descent = 0;
                this.leading = 0;
                this.align = 0;
                this.runs = [];
            }
            TextLine._getMeasureContext = function () {
                if (!TextLine._measureContext) {
                    TextLine._measureContext = document.createElement('canvas').getContext('2d');
                }
                return TextLine._measureContext;
            };
            TextLine.prototype.addRun = function (font, fillStyle, text, letterSpacing, underline) {
                if (text) {
                    var measureContext = TextLine._getMeasureContext();
                    measureContext.font = font;
                    var width = measureText(measureContext, text, letterSpacing);
                    this.runs.push(new TextRun(font, fillStyle, text, width, letterSpacing, underline));
                    this.width += width;
                }
            };
            TextLine.prototype.wrap = function (maxWidth) {
                var lines = [this];
                var runs = this.runs;
                var currentLine = this;
                currentLine.width = 0;
                currentLine.runs = [];
                var measureContext = TextLine._getMeasureContext();
                for (var i = 0; i < runs.length; i++) {
                    var run = runs[i];
                    var text = run.text;
                    run.text = '';
                    run.width = 0;
                    measureContext.font = run.font;
                    var spaceLeft = maxWidth;
                    var words = text.split(/[\s.-]/);
                    var offset = 0;
                    for (var j = 0; j < words.length; j++) {
                        var word = words[j];
                        var chunk = text.substr(offset, word.length + 1);
                        var letterSpacing = run.letterSpacing;
                        var wordWidth = measureText(measureContext, chunk, letterSpacing);
                        if (wordWidth > spaceLeft) {
                            do {
                                if (run.text) {
                                    currentLine.runs.push(run);
                                    currentLine.width += run.width;
                                    run = new TextRun(run.font, run.fillStyle, '', 0, run.letterSpacing, run.underline);
                                    var newLine = new TextLine();
                                    newLine.y = currentLine.y + currentLine.descent + currentLine.leading + currentLine.ascent | 0;
                                    newLine.ascent = currentLine.ascent;
                                    newLine.descent = currentLine.descent;
                                    newLine.leading = currentLine.leading;
                                    newLine.align = currentLine.align;
                                    lines.push(newLine);
                                    currentLine = newLine;
                                }
                                spaceLeft = maxWidth - wordWidth;
                                if (spaceLeft < 0) {
                                    var k = chunk.length;
                                    var t = chunk;
                                    var w = wordWidth;
                                    while (k > 1) {
                                        k--;
                                        t = chunk.substr(0, k);
                                        w = measureText(measureContext, t, letterSpacing);
                                        if (w <= maxWidth) {
                                            break;
                                        }
                                    }
                                    run.text = t;
                                    run.width = w;
                                    chunk = chunk.substr(k);
                                    wordWidth = measureText(measureContext, chunk, letterSpacing);
                                }
                            } while (chunk && spaceLeft < 0);
                        } else {
                            spaceLeft = spaceLeft - wordWidth;
                        }
                        run.text += chunk;
                        run.width += wordWidth;
                        offset += word.length + 1;
                    }
                    currentLine.runs.push(run);
                    currentLine.width += run.width;
                }
                return lines;
            };
            TextLine.prototype.toString = function () {
                return 'TextLine {x: ' + this.x + ', y: ' + this.y + ', width: ' + this.width + ', height: ' + (this.ascent + this.descent + this.leading) + '}';
            };
            return TextLine;
        }();
        GFX.TextLine = TextLine;
        var TextRun = function () {
            function TextRun(font, fillStyle, text, width, letterSpacing, underline) {
                if (font === void 0) {
                    font = '';
                }
                if (fillStyle === void 0) {
                    fillStyle = '';
                }
                if (text === void 0) {
                    text = '';
                }
                if (width === void 0) {
                    width = 0;
                }
                if (letterSpacing === void 0) {
                    letterSpacing = 0;
                }
                if (underline === void 0) {
                    underline = false;
                }
                this.font = font;
                this.fillStyle = fillStyle;
                this.text = text;
                this.width = width;
                this.letterSpacing = letterSpacing;
                this.underline = underline;
            }
            return TextRun;
        }();
        GFX.TextRun = TextRun;
        function measureText(context, text, letterSpacing) {
            var width = context.measureText(text).width | 0;
            if (letterSpacing > 0) {
                width += text.length * letterSpacing;
            }
            return width;
        }
        var RenderableText = function (_super) {
            __extends(RenderableText, _super);
            function RenderableText(bounds) {
                _super.call(this);
                this._flags = 256    /* Dynamic */ | 4096    /* Dirty */;
                this.properties = {};
                this._textBounds = bounds.clone();
                this._textRunData = null;
                this._plainText = '';
                this._backgroundColor = 0;
                this._borderColor = 0;
                this._matrix = Matrix.createIdentity();
                this._coords = null;
                this._scrollV = 1;
                this._scrollH = 0;
                this.textRect = bounds.clone();
                this.lines = [];
                this.setBounds(bounds);
            }
            RenderableText.prototype.setBounds = function (bounds) {
                _super.prototype.setBounds.call(this, bounds);
                this._textBounds.set(bounds);
                this.textRect.setElements(bounds.x + 2, bounds.y + 2, bounds.w - 2, bounds.h - 2);
            };
            RenderableText.prototype.setContent = function (plainText, textRunData, matrix, coords) {
                this._textRunData = textRunData;
                this._plainText = plainText;
                this._matrix.set(matrix);
                this._coords = coords;
                this.lines = [];
            };
            RenderableText.prototype.setStyle = function (backgroundColor, borderColor, scrollV, scrollH) {
                this._backgroundColor = backgroundColor;
                this._borderColor = borderColor;
                this._scrollV = scrollV;
                this._scrollH = scrollH;
            };
            RenderableText.prototype.reflow = function (autoSize, wordWrap) {
                var textRunData = this._textRunData;
                if (!textRunData) {
                    return;
                }
                var bounds = this._bounds;
                var availableWidth = bounds.w - 4;
                var plainText = this._plainText;
                var lines = this.lines;
                var currentLine = new TextLine();
                var baseLinePos = 0;
                var maxWidth = 0;
                var maxAscent = 0;
                var maxDescent = 0;
                var maxLeading = -4294967295;
                var firstAlign = -1;
                var finishLine = function () {
                    if (!currentLine.runs.length) {
                        baseLinePos += maxAscent + maxDescent + maxLeading;
                        return;
                    }
                    if (lines.length) {
                        baseLinePos += maxLeading;
                    }
                    baseLinePos += maxAscent;
                    currentLine.y = baseLinePos | 0;
                    baseLinePos += maxDescent;
                    currentLine.ascent = maxAscent;
                    currentLine.descent = maxDescent;
                    currentLine.leading = maxLeading;
                    currentLine.align = firstAlign;
                    if (wordWrap && currentLine.width > availableWidth) {
                        var wrappedLines = currentLine.wrap(availableWidth);
                        for (var i = 0; i < wrappedLines.length; i++) {
                            var line = wrappedLines[i];
                            baseLinePos = line.y + line.descent + line.leading;
                            lines.push(line);
                            if (line.width > maxWidth) {
                                maxWidth = line.width;
                            }
                        }
                    } else {
                        lines.push(currentLine);
                        if (currentLine.width > maxWidth) {
                            maxWidth = currentLine.width;
                        }
                    }
                    currentLine = new TextLine();
                };
                GFX.enterTimeline('RenderableText.reflow');
                while (textRunData.position < textRunData.length) {
                    var beginIndex = textRunData.readInt();
                    var endIndex = textRunData.readInt();
                    var size = textRunData.readInt();
                    var fontName = textRunData.readUTF();
                    var ascent = textRunData.readInt();
                    var descent = textRunData.readInt();
                    var leading = textRunData.readInt();
                    if (ascent > maxAscent) {
                        maxAscent = ascent;
                    }
                    if (descent > maxDescent) {
                        maxDescent = descent;
                    }
                    if (leading > maxLeading) {
                        maxLeading = leading;
                    }
                    var bold = textRunData.readBoolean();
                    var italic = textRunData.readBoolean();
                    var boldItalic = '';
                    if (italic) {
                        boldItalic += 'italic ';
                    }
                    if (bold) {
                        boldItalic += 'bold ';
                    }
                    var font = boldItalic + size + 'px ' + fontName + ', AdobeBlank';
                    var color = textRunData.readInt();
                    var fillStyle = Shumway.ColorUtilities.rgbToHex(color);
                    var align = textRunData.readInt();
                    if (firstAlign === -1) {
                        firstAlign = align;
                    }
                    var bullet = textRunData.readBoolean();
                    //var display = textRunData.readInt();
                    var indent = textRunData.readInt();
                    //var blockIndent = textRunData.readInt();
                    var kerning = textRunData.readInt();
                    var leftMargin = textRunData.readInt();
                    var letterSpacing = textRunData.readInt();
                    var rightMargin = textRunData.readInt();
                    //var tabStops = textRunData.readInt();
                    var underline = textRunData.readBoolean();
                    var text = '';
                    var eof = false;
                    for (var i = beginIndex; !eof; i++) {
                        var eof = i >= endIndex - 1;
                        var char = plainText[i];
                        if (char !== '\r' && char !== '\n') {
                            text += char;
                            if (i < plainText.length - 1) {
                                continue;
                            }
                        }
                        currentLine.addRun(font, fillStyle, text, letterSpacing, underline);
                        finishLine();
                        text = '';
                        if (eof) {
                            maxAscent = 0;
                            maxDescent = 0;
                            maxLeading = -4294967295;
                            firstAlign = -1;
                            break;
                        }
                        if (char === '\r' && plainText[i + 1] === '\n') {
                            i++;
                        }
                    }
                    currentLine.addRun(font, fillStyle, text, letterSpacing, underline);
                }
                // Append an additional empty line if we find a line break character at the end of the text.
                var endCharacter = plainText[plainText.length - 1];
                if (endCharacter === '\r' || endCharacter === '\n') {
                    lines.push(currentLine);
                }
                var rect = this.textRect;
                rect.w = maxWidth;
                rect.h = baseLinePos;
                if (autoSize) {
                    if (!wordWrap) {
                        availableWidth = maxWidth;
                        var width = bounds.w;
                        switch (autoSize) {
                        case 1:
                            rect.x = width - (availableWidth + 4) >> 1;
                            break;
                        case 2:
                            break;
                        case 3:
                            rect.x = width - (availableWidth + 4);
                            break;
                        }
                        this._textBounds.setElements(rect.x - 2, rect.y - 2, rect.w + 4, rect.h + 4);
                        bounds.w = availableWidth + 4;
                    }
                    bounds.x = rect.x - 2;
                    bounds.h = baseLinePos + 4;
                } else {
                    this._textBounds = bounds;
                }
                var numLines = lines.length;
                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i];
                    if (line.width < availableWidth) {
                        switch (line.align) {
                        case 0:
                            break;
                        case 1:
                            line.x = availableWidth - line.width | 0;
                            break;
                        case 2:
                            line.x = (availableWidth - line.width) / 2 | 0;
                            break;
                        }
                    }
                }
                this.invalidate();
                GFX.leaveTimeline('RenderableText.reflow');
            };
            RenderableText.roundBoundPoints = function (points) {
                release || assert(points === RenderableText.absoluteBoundPoints);
                for (var i = 0; i < points.length; i++) {
                    var point = points[i];
                    point.x = Math.floor(point.x + 0.1) + 0.5;
                    point.y = Math.floor(point.y + 0.1) + 0.5;
                }
            };
            RenderableText.prototype.render = function (context) {
                GFX.enterTimeline('RenderableText.render');
                context.save();
                var rect = this._textBounds;
                if (this._backgroundColor) {
                    context.fillStyle = Shumway.ColorUtilities.rgbaToCSSStyle(this._backgroundColor);
                    context.fillRect(rect.x, rect.y, rect.w, rect.h);
                }
                if (this._borderColor) {
                    context.strokeStyle = Shumway.ColorUtilities.rgbaToCSSStyle(this._borderColor);
                    context.lineCap = 'square';
                    context.lineWidth = 1;
                    // TextField bounds are always drawn as 1px lines on (global-space) pixel boundaries.
                    // Their rounding is a bit weird, though: fractions below .9 are rounded down.
                    // We can only fully implement this in browsers that support `currentTransform`.
                    var boundPoints = RenderableText.absoluteBoundPoints;
                    var m = context['currentTransform'];
                    if (m) {
                        rect = rect.clone();
                        var matrix = new Matrix(m.a, m.b, m.c, m.d, m.e, m.f);
                        matrix.transformRectangle(rect, boundPoints);
                        context.setTransform(1, 0, 0, 1, 0, 0);
                    } else {
                        boundPoints[0].x = rect.x;
                        boundPoints[0].y = rect.y;
                        boundPoints[1].x = rect.x + rect.w;
                        boundPoints[1].y = rect.y;
                        boundPoints[2].x = rect.x + rect.w;
                        boundPoints[2].y = rect.y + rect.h;
                        boundPoints[3].x = rect.x;
                        boundPoints[3].y = rect.y + rect.h;
                    }
                    RenderableText.roundBoundPoints(boundPoints);
                    var path = new Path2D();
                    path.moveTo(boundPoints[0].x, boundPoints[0].y);
                    path.lineTo(boundPoints[1].x, boundPoints[1].y);
                    path.lineTo(boundPoints[2].x, boundPoints[2].y);
                    path.lineTo(boundPoints[3].x, boundPoints[3].y);
                    path.lineTo(boundPoints[0].x, boundPoints[0].y);
                    context.stroke(path);
                    if (m) {
                        context.setTransform(m.a, m.b, m.c, m.d, m.e, m.f);
                    }
                }
                if (this._coords) {
                    this._renderChars(context);
                } else {
                    this._renderLines(context);
                }
                context.restore();
                GFX.leaveTimeline('RenderableText.render');
            };
            RenderableText.prototype._renderChars = function (context) {
                if (this._matrix) {
                    var m = this._matrix;
                    context.transform(m.a, m.b, m.c, m.d, m.tx, m.ty);
                }
                var lines = this.lines;
                var coords = this._coords;
                coords.position = 0;
                var font = '';
                var fillStyle = '';
                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i];
                    var runs = line.runs;
                    for (var j = 0; j < runs.length; j++) {
                        var run = runs[j];
                        if (run.font !== font) {
                            context.font = font = run.font;
                        }
                        if (run.fillStyle !== fillStyle) {
                            context.fillStyle = fillStyle = run.fillStyle;
                        }
                        var text = run.text;
                        for (var k = 0; k < text.length; k++) {
                            var x = coords.readInt() / 20;
                            var y = coords.readInt() / 20;
                            context.fillText(text[k], x, y);
                        }
                    }
                }
            };
            RenderableText.prototype._renderLines = function (context) {
                // TODO: Render bullet points.
                var bounds = this._textBounds;
                context.beginPath();
                context.rect(bounds.x + 2, bounds.y + 2, bounds.w - 4, bounds.h - 4);
                context.clip();
                context.translate(bounds.x - this._scrollH + 2, bounds.y + 2);
                var lines = this.lines;
                var scrollV = this._scrollV;
                var scrollY = 0;
                var font = '';
                var fillStyle = '';
                context.textAlign = 'left';
                context.textBaseline = 'alphabetic';
                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i];
                    var x = line.x;
                    var y = line.y;
                    // Skip lines until we are within the scroll view.
                    if (i + 1 < scrollV) {
                        scrollY = y + line.descent + line.leading;
                        continue;
                    }
                    y -= scrollY;
                    // Flash skips rendering lines that are not fully visible in height (except of the very
                    // first line within the scroll view).
                    if (i + 1 - scrollV && y > bounds.h) {
                        break;
                    }
                    var runs = line.runs;
                    for (var j = 0; j < runs.length; j++) {
                        var run = runs[j];
                        if (run.font !== font) {
                            context.font = font = run.font;
                        }
                        if (run.fillStyle !== fillStyle) {
                            context.fillStyle = fillStyle = run.fillStyle;
                        }
                        if (run.underline) {
                            context.fillRect(x, y + line.descent / 2 | 0, run.width, 1);
                        }
                        context.textAlign = 'left';
                        context.textBaseline = 'alphabetic';
                        if (run.letterSpacing > 0) {
                            var text = run.text;
                            for (var k = 0; k < text.length; k++) {
                                context.fillText(text[k], x, y);
                                x += measureText(context, text[k], run.letterSpacing);
                            }
                        } else {
                            context.fillText(run.text, x, y);
                            x += run.width;
                        }
                    }
                }
            };
            RenderableText.absoluteBoundPoints = [
                new Point(0, 0),
                new Point(0, 0),
                new Point(0, 0),
                new Point(0, 0)
            ];
            return RenderableText;
        }(Renderable);
        GFX.RenderableText = RenderableText;
        var Label = function (_super) {
            __extends(Label, _super);
            function Label(w, h) {
                _super.call(this);
                this._flags = 256    /* Dynamic */ | 512    /* Scalable */;
                this.properties = {};
                this.setBounds(new Rectangle(0, 0, w, h));
            }
            Object.defineProperty(Label.prototype, 'text', {
                get: function () {
                    return this._text;
                },
                set: function (value) {
                    this._text = value;
                },
                enumerable: true,
                configurable: true
            });
            Label.prototype.render = function (context, ratio, cullBounds) {
                context.save();
                context.textBaseline = 'top';
                context.fillStyle = 'white';
                context.fillText(this.text, 0, 0);
                context.restore();
            };
            return Label;
        }(Renderable);
        GFX.Label = Label;
        var clampByte = Shumway.ColorUtilities.clampByte;
        var assert = Shumway.Debug.assert;
        var Filter = function () {
            function Filter() {
            }
            Filter.prototype.expandBounds = function (bounds) {
            };
            return Filter;
        }();
        GFX.Filter = Filter;
        var EPS = 1e-9;
        // Step widths for blur based filters, for quality values 1..15:
        // If we plot the border width added by expandBlurBounds for each blurX (or blurY) value, the
        // step width is the amount of blurX that adds one pixel to the border width. I.e. for quality = 1,
        // the border width increments at blurX = 2, 4, 6, ...
        var blurFilterStepWidths = [
            2,
            1 / 1.05,
            1 / 1.35,
            1 / 1.55,
            1 / 1.75,
            1 / 1.9,
            1 / 2,
            1 / 2.1,
            1 / 2.2,
            1 / 2.3,
            1 / 2.5,
            1 / 3,
            1 / 3,
            1 / 3.5,
            1 / 3.5
        ];
        function expandBlurBounds(bounds, quality, blurX, blurY, isBlurFilter) {
            var stepWidth = blurFilterStepWidths[quality - 1];
            var bx = blurX;
            var by = blurY;
            if (isBlurFilter) {
                // BlurFilter behaves slightly different from other blur based filters:
                // Given ascending blurX/blurY values, a BlurFilter expands the source rect later than with
                // i.e. GlowFilter. The difference appears to be stepWidth / 4 for all quality values.
                var stepWidth4 = stepWidth / 4;
                bx -= stepWidth4;
                by -= stepWidth4;
            }
            // Calculate horizontal and vertical borders:
            // blurX/blurY values <= 1 are always rounded up to 1, which means that we always expand the
            // source rect, even when blurX/blurY is 0.
            var bh = Math.ceil((bx < 1 ? 1 : bx) / (stepWidth - EPS));
            var bv = Math.ceil((by < 1 ? 1 : by) / (stepWidth - EPS));
            bounds.x -= bh;
            bounds.w += bh * 2;
            bounds.y -= bv;
            bounds.h += bv * 2;
        }
        var BlurFilter = function (_super) {
            __extends(BlurFilter, _super);
            function BlurFilter(blurX, blurY, quality) {
                _super.call(this);
                this.blurX = blurX;
                this.blurY = blurY;
                this.quality = quality;
            }
            BlurFilter.prototype.expandBounds = function (bounds) {
                expandBlurBounds(bounds, this.quality, this.blurX, this.blurY, true);
            };
            return BlurFilter;
        }(Filter);
        GFX.BlurFilter = BlurFilter;
        var DropshadowFilter = function (_super) {
            __extends(DropshadowFilter, _super);
            function DropshadowFilter(alpha, angle, blurX, blurY, color, distance, hideObject, inner, knockout, quality, strength) {
                _super.call(this);
                this.alpha = alpha;
                this.angle = angle;
                this.blurX = blurX;
                this.blurY = blurY;
                this.color = color;
                this.distance = distance;
                this.hideObject = hideObject;
                this.inner = inner;
                this.knockout = knockout;
                this.quality = quality;
                this.strength = strength;
            }
            DropshadowFilter.prototype.expandBounds = function (bounds) {
                // TODO: Once we support inset drop shadows, bounds don't expand.
                //       For now, they will be rendered as normal drop shadows.
                // if (this.inner) {
                //   return;
                // }
                expandBlurBounds(bounds, this.quality, this.blurX, this.blurY, false);
                if (this.distance) {
                    var a = this.angle * Math.PI / 180;
                    var dx = Math.cos(a) * this.distance;
                    var dy = Math.sin(a) * this.distance;
                    var xMin = bounds.x + (dx >= 0 ? 0 : Math.floor(dx));
                    var xMax = bounds.x + bounds.w + Math.ceil(Math.abs(dx));
                    var yMin = bounds.y + (dy >= 0 ? 0 : Math.floor(dy));
                    var yMax = bounds.y + bounds.h + Math.ceil(Math.abs(dy));
                    bounds.x = xMin;
                    bounds.w = xMax - xMin;
                    bounds.y = yMin;
                    bounds.h = yMax - yMin;
                }
            };
            return DropshadowFilter;
        }(Filter);
        GFX.DropshadowFilter = DropshadowFilter;
        var GlowFilter = function (_super) {
            __extends(GlowFilter, _super);
            function GlowFilter(alpha, blurX, blurY, color, inner, knockout, quality, strength) {
                _super.call(this);
                this.alpha = alpha;
                this.blurX = blurX;
                this.blurY = blurY;
                this.color = color;
                this.inner = inner;
                this.knockout = knockout;
                this.quality = quality;
                this.strength = strength;
            }
            GlowFilter.prototype.expandBounds = function (bounds) {
                if (!this.inner) {
                    expandBlurBounds(bounds, this.quality, this.blurX, this.blurY, false);
                }
            };
            return GlowFilter;
        }(Filter);
        GFX.GlowFilter = GlowFilter;
        var ColorMatrix = function (_super) {
            __extends(ColorMatrix, _super);
            function ColorMatrix(data) {
                _super.call(this);
                release || assert(data.length === 20);
                this._data = new Float32Array(data);
                this._type = 0    /* Unknown */;
            }
            ColorMatrix.prototype.clone = function () {
                var colorMatrix = new ColorMatrix(this._data);
                colorMatrix._type = this._type;
                return colorMatrix;
            };
            ColorMatrix.prototype.set = function (other) {
                this._data.set(other._data);
                this._type = other._type;
            };
            ColorMatrix.prototype.toWebGLMatrix = function () {
                return new Float32Array(this._data);
            };
            ColorMatrix.prototype.asWebGLMatrix = function () {
                return this._data.subarray(0, 16);
            };
            ColorMatrix.prototype.asWebGLVector = function () {
                return this._data.subarray(16, 20);
            };
            ColorMatrix.prototype.isIdentity = function () {
                if (this._type & 1    /* Identity */) {
                    return true;
                }
                var m = this._data;
                return m[0] == 1 && m[1] == 0 && m[2] == 0 && m[3] == 0 && m[4] == 0 && m[5] == 1 && m[6] == 0 && m[7] == 0 && m[8] == 0 && m[9] == 0 && m[10] == 1 && m[11] == 0 && m[12] == 0 && m[13] == 0 && m[14] == 0 && m[15] == 1 && m[16] == 0 && m[17] == 0 && m[18] == 0 && m[19] == 0;
            };
            ColorMatrix.createIdentity = function () {
                var colorMatrix = new ColorMatrix([
                    1,
                    0,
                    0,
                    0,
                    0,
                    1,
                    0,
                    0,
                    0,
                    0,
                    1,
                    0,
                    0,
                    0,
                    0,
                    1,
                    0,
                    0,
                    0,
                    0
                ]);
                colorMatrix._type = 1    /* Identity */;
                return colorMatrix;
            };
            ColorMatrix.prototype.setMultipliersAndOffsets = function (redMultiplier, greenMultiplier, blueMultiplier, alphaMultiplier, redOffset, greenOffset, blueOffset, alphaOffset) {
                var m = this._data;
                for (var i = 0; i < m.length; i++) {
                    m[i] = 0;
                }
                m[0] = redMultiplier;
                m[5] = greenMultiplier;
                m[10] = blueMultiplier;
                m[15] = alphaMultiplier;
                m[16] = redOffset / 255;
                m[17] = greenOffset / 255;
                m[18] = blueOffset / 255;
                m[19] = alphaOffset / 255;
                this._type = 0    /* Unknown */;
            };
            ColorMatrix.prototype.transformRGBA = function (rgba) {
                var r = rgba >> 24 & 255;
                var g = rgba >> 16 & 255;
                var b = rgba >> 8 & 255;
                var a = rgba & 255;
                var m = this._data;
                var R = clampByte(r * m[0] + g * m[1] + b * m[2] + a * m[3] + m[16] * 255);
                var G = clampByte(r * m[4] + g * m[5] + b * m[6] + a * m[7] + m[17] * 255);
                var B = clampByte(r * m[8] + g * m[9] + b * m[10] + a * m[11] + m[18] * 255);
                var A = clampByte(r * m[12] + g * m[13] + b * m[14] + a * m[15] + m[19] * 255);
                return R << 24 | G << 16 | B << 8 | A;
            };
            ColorMatrix.prototype.multiply = function (other) {
                if (other._type & 1    /* Identity */) {
                    return;
                }
                var a = this._data, b = other._data;
                var a00 = a[0 * 4 + 0];
                var a01 = a[0 * 4 + 1];
                var a02 = a[0 * 4 + 2];
                var a03 = a[0 * 4 + 3];
                var a10 = a[1 * 4 + 0];
                var a11 = a[1 * 4 + 1];
                var a12 = a[1 * 4 + 2];
                var a13 = a[1 * 4 + 3];
                var a20 = a[2 * 4 + 0];
                var a21 = a[2 * 4 + 1];
                var a22 = a[2 * 4 + 2];
                var a23 = a[2 * 4 + 3];
                var a30 = a[3 * 4 + 0];
                var a31 = a[3 * 4 + 1];
                var a32 = a[3 * 4 + 2];
                var a33 = a[3 * 4 + 3];
                var a40 = a[4 * 4 + 0];
                var a41 = a[4 * 4 + 1];
                var a42 = a[4 * 4 + 2];
                var a43 = a[4 * 4 + 3];
                var b00 = b[0 * 4 + 0];
                var b01 = b[0 * 4 + 1];
                var b02 = b[0 * 4 + 2];
                var b03 = b[0 * 4 + 3];
                var b10 = b[1 * 4 + 0];
                var b11 = b[1 * 4 + 1];
                var b12 = b[1 * 4 + 2];
                var b13 = b[1 * 4 + 3];
                var b20 = b[2 * 4 + 0];
                var b21 = b[2 * 4 + 1];
                var b22 = b[2 * 4 + 2];
                var b23 = b[2 * 4 + 3];
                var b30 = b[3 * 4 + 0];
                var b31 = b[3 * 4 + 1];
                var b32 = b[3 * 4 + 2];
                var b33 = b[3 * 4 + 3];
                var b40 = b[4 * 4 + 0];
                var b41 = b[4 * 4 + 1];
                var b42 = b[4 * 4 + 2];
                var b43 = b[4 * 4 + 3];
                a[0 * 4 + 0] = a00 * b00 + a10 * b01 + a20 * b02 + a30 * b03;
                a[0 * 4 + 1] = a01 * b00 + a11 * b01 + a21 * b02 + a31 * b03;
                a[0 * 4 + 2] = a02 * b00 + a12 * b01 + a22 * b02 + a32 * b03;
                a[0 * 4 + 3] = a03 * b00 + a13 * b01 + a23 * b02 + a33 * b03;
                a[1 * 4 + 0] = a00 * b10 + a10 * b11 + a20 * b12 + a30 * b13;
                a[1 * 4 + 1] = a01 * b10 + a11 * b11 + a21 * b12 + a31 * b13;
                a[1 * 4 + 2] = a02 * b10 + a12 * b11 + a22 * b12 + a32 * b13;
                a[1 * 4 + 3] = a03 * b10 + a13 * b11 + a23 * b12 + a33 * b13;
                a[2 * 4 + 0] = a00 * b20 + a10 * b21 + a20 * b22 + a30 * b23;
                a[2 * 4 + 1] = a01 * b20 + a11 * b21 + a21 * b22 + a31 * b23;
                a[2 * 4 + 2] = a02 * b20 + a12 * b21 + a22 * b22 + a32 * b23;
                a[2 * 4 + 3] = a03 * b20 + a13 * b21 + a23 * b22 + a33 * b23;
                a[3 * 4 + 0] = a00 * b30 + a10 * b31 + a20 * b32 + a30 * b33;
                a[3 * 4 + 1] = a01 * b30 + a11 * b31 + a21 * b32 + a31 * b33;
                a[3 * 4 + 2] = a02 * b30 + a12 * b31 + a22 * b32 + a32 * b33;
                a[3 * 4 + 3] = a03 * b30 + a13 * b31 + a23 * b32 + a33 * b33;
                a[4 * 4 + 0] = a00 * b40 + a10 * b41 + a20 * b42 + a30 * b43 + a40;
                a[4 * 4 + 1] = a01 * b40 + a11 * b41 + a21 * b42 + a31 * b43 + a41;
                a[4 * 4 + 2] = a02 * b40 + a12 * b41 + a22 * b42 + a32 * b43 + a42;
                a[4 * 4 + 3] = a03 * b40 + a13 * b41 + a23 * b42 + a33 * b43 + a43;
                this._type = 0    /* Unknown */;
            };
            Object.defineProperty(ColorMatrix.prototype, 'alphaMultiplier', {
                get: function () {
                    return this._data[15];
                },
                enumerable: true,
                configurable: true
            });
            ColorMatrix.prototype.hasOnlyAlphaMultiplier = function () {
                var m = this._data;
                return m[0] == 1 && m[1] == 0 && m[2] == 0 && m[3] == 0 && m[4] == 0 && m[5] == 1 && m[6] == 0 && m[7] == 0 && m[8] == 0 && m[9] == 0 && m[10] == 1 && m[11] == 0 && m[12] == 0 && m[13] == 0 && m[14] == 0 && m[16] == 0 && m[17] == 0 && m[18] == 0 && m[19] == 0;
            };
            ColorMatrix.prototype.equals = function (other) {
                if (!other) {
                    return false;
                } else if (this._type === other._type && this._type === 1    /* Identity */) {
                    return true;
                }
                var a = this._data;
                var b = other._data;
                for (var i = 0; i < 20; i++) {
                    if (Math.abs(a[i] - b[i]) > 0.001) {
                        return false;
                    }
                }
                return true;
            };
            ColorMatrix.prototype.toSVGFilterMatrix = function () {
                var m = this._data;
                return [
                    m[0],
                    m[4],
                    m[8],
                    m[12],
                    m[16],
                    m[1],
                    m[5],
                    m[9],
                    m[13],
                    m[17],
                    m[2],
                    m[6],
                    m[10],
                    m[14],
                    m[18],
                    m[3],
                    m[7],
                    m[11],
                    m[15],
                    m[19]
                ].join(' ');
            };
            return ColorMatrix;
        }(Filter);
        GFX.ColorMatrix = ColorMatrix;
        var Canvas2D;
        (function (Canvas2D) {
            var assert = Shumway.Debug.assert;
            var originalSave = CanvasRenderingContext2D.prototype.save;
            var originalClip = CanvasRenderingContext2D.prototype.clip;
            var originalFill = CanvasRenderingContext2D.prototype.fill;
            var originalStroke = CanvasRenderingContext2D.prototype.stroke;
            var originalRestore = CanvasRenderingContext2D.prototype.restore;
            var originalBeginPath = CanvasRenderingContext2D.prototype.beginPath;
            function debugSave() {
                if (this.stackDepth === undefined) {
                    this.stackDepth = 0;
                }
                if (this.clipStack === undefined) {
                    this.clipStack = [0];
                } else {
                    this.clipStack.push(0);
                }
                this.stackDepth++;
                originalSave.call(this);
            }
            function debugRestore() {
                this.stackDepth--;
                this.clipStack.pop();
                originalRestore.call(this);
            }
            function debugFill() {
                assert(!this.buildingClippingRegionDepth);
                originalFill.apply(this, arguments);
            }
            function debugStroke() {
                assert(GFX.debugClipping.value || !this.buildingClippingRegionDepth);
                originalStroke.apply(this, arguments);
            }
            function debugBeginPath() {
                originalBeginPath.call(this);
            }
            function debugClip() {
                if (this.clipStack === undefined) {
                    this.clipStack = [0];
                }
                this.clipStack[this.clipStack.length - 1]++;
                if (GFX.debugClipping.value) {
                    this.strokeStyle = Shumway.ColorStyle.Pink;
                    this.stroke.apply(this, arguments);
                } else {
                    originalClip.apply(this, arguments);
                }
            }
            function notifyReleaseChanged() {
                if (release) {
                    CanvasRenderingContext2D.prototype.save = originalSave;
                    CanvasRenderingContext2D.prototype.clip = originalClip;
                    CanvasRenderingContext2D.prototype.fill = originalFill;
                    CanvasRenderingContext2D.prototype.stroke = originalStroke;
                    CanvasRenderingContext2D.prototype.restore = originalRestore;
                    CanvasRenderingContext2D.prototype.beginPath = originalBeginPath;
                } else {
                    CanvasRenderingContext2D.prototype.save = debugSave;
                    CanvasRenderingContext2D.prototype.clip = debugClip;
                    CanvasRenderingContext2D.prototype.fill = debugFill;
                    CanvasRenderingContext2D.prototype.stroke = debugStroke;
                    CanvasRenderingContext2D.prototype.restore = debugRestore;
                    CanvasRenderingContext2D.prototype.beginPath = debugBeginPath;
                }
            }
            Canvas2D.notifyReleaseChanged = notifyReleaseChanged;
            CanvasRenderingContext2D.prototype.enterBuildingClippingRegion = function () {
                if (!this.buildingClippingRegionDepth) {
                    this.buildingClippingRegionDepth = 0;
                }
                this.buildingClippingRegionDepth++;
            };
            CanvasRenderingContext2D.prototype.leaveBuildingClippingRegion = function () {
                this.buildingClippingRegionDepth--;
            };
            var clamp = Shumway.NumberUtilities.clamp;
            var isFirefox = navigator.userAgent.indexOf('Firefox') != -1;
            /**
              * Scale blur radius for each quality level. The scale constants were gathered
              * experimentally.
              */
            function getBlurScale(ratio, quality) {
                var blurScale = ratio / 2;
                // For some reason we always have to scale by 1/2 first.
                switch (quality) {
                case 0:
                    return 0;
                case 1:
                    return blurScale / 2.7;
                case 2:
                    return blurScale / 1.28;
                case 3:
                default:
                    return blurScale;
                }
            }
            var Filters = function () {
                function Filters() {
                }
                /**
                 * Creates an SVG element and defines filters that are referenced in |canvas.filter| properties. We cannot
                 * inline CSS filters because they don't expose independent blurX and blurY properties.
                 * This only works in Firefox, and you have to set the 'canvas.filters.enabled' equal to |true|.
                 */
                Filters._prepareSVGFilters = function () {
                    if (Filters._svgBlurFilter) {
                        return;
                    }
                    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                    svg.setAttribute('style', 'display:block;width:0px;height:0px');
                    var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
                    // Blur Filter
                    var blurFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
                    blurFilter.setAttribute('id', 'svgBlurFilter');
                    var feGaussianFilter = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
                    feGaussianFilter.setAttribute('stdDeviation', '0 0');
                    blurFilter.appendChild(feGaussianFilter);
                    defs.appendChild(blurFilter);
                    Filters._svgBlurFilter = feGaussianFilter;
                    // Drop Shadow Filter
                    var dropShadowFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
                    dropShadowFilter.setAttribute('id', 'svgDropShadowFilter');
                    var feGaussianFilter = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
                    feGaussianFilter.setAttribute('in', 'SourceAlpha');
                    feGaussianFilter.setAttribute('stdDeviation', '3');
                    dropShadowFilter.appendChild(feGaussianFilter);
                    Filters._svgDropshadowFilterBlur = feGaussianFilter;
                    var feOffset = document.createElementNS('http://www.w3.org/2000/svg', 'feOffset');
                    feOffset.setAttribute('dx', '0');
                    feOffset.setAttribute('dy', '0');
                    feOffset.setAttribute('result', 'offsetblur');
                    dropShadowFilter.appendChild(feOffset);
                    Filters._svgDropshadowFilterOffset = feOffset;
                    var feFlood = document.createElementNS('http://www.w3.org/2000/svg', 'feFlood');
                    feFlood.setAttribute('flood-color', 'rgba(0,0,0,1)');
                    dropShadowFilter.appendChild(feFlood);
                    Filters._svgDropshadowFilterFlood = feFlood;
                    var feComposite = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
                    feComposite.setAttribute('in2', 'offsetblur');
                    feComposite.setAttribute('operator', 'in');
                    dropShadowFilter.appendChild(feComposite);
                    var feComposite = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
                    feComposite.setAttribute('in2', 'SourceAlpha');
                    feComposite.setAttribute('operator', 'out');
                    feComposite.setAttribute('result', 'outer');
                    dropShadowFilter.appendChild(feComposite);
                    var feMerge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
                    var feMergeNode = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
                    feMerge.appendChild(feMergeNode);
                    var feMergeNode = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
                    feMerge.appendChild(feMergeNode);
                    Filters._svgDropshadowMergeNode = feMergeNode;
                    dropShadowFilter.appendChild(feMerge);
                    defs.appendChild(dropShadowFilter);
                    var colorMatrixFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
                    colorMatrixFilter.setAttribute('id', 'svgColorMatrixFilter');
                    var feColorMatrix = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
                    // Color interpolation in linear RGB doesn't seem to match Flash's results.
                    feColorMatrix.setAttribute('color-interpolation-filters', 'sRGB');
                    feColorMatrix.setAttribute('in', 'SourceGraphic');
                    feColorMatrix.setAttribute('type', 'matrix');
                    colorMatrixFilter.appendChild(feColorMatrix);
                    var feComposite = document.createElementNS('http://www.w3.org/2000/svg', 'feComposite');
                    feComposite.setAttribute('in2', 'SourceAlpha');
                    feComposite.setAttribute('operator', 'in');
                    colorMatrixFilter.appendChild(feComposite);
                    defs.appendChild(colorMatrixFilter);
                    Filters._svgColorMatrixFilter = feColorMatrix;
                    svg.appendChild(defs);
                    document.documentElement.appendChild(svg);
                };
                Filters._applyFilter = function (ratio, context, filter) {
                    if (!Filters._svgFiltersAreSupported) {
                        return;
                    }
                    Filters._prepareSVGFilters();
                    Filters._removeFilter(context);
                    var scale = ratio;
                    if (filter instanceof GFX.BlurFilter) {
                        var blurFilter = filter;
                        var blurScale = getBlurScale(ratio, blurFilter.quality);
                        Filters._svgBlurFilter.setAttribute('stdDeviation', blurFilter.blurX * blurScale + ' ' + blurFilter.blurY * blurScale);
                        context.filter = 'url(#svgBlurFilter)';
                    } else if (filter instanceof GFX.DropshadowFilter) {
                        var dropshadowFilter = filter;
                        var blurScale = getBlurScale(ratio, dropshadowFilter.quality);
                        Filters._svgDropshadowFilterBlur.setAttribute('stdDeviation', dropshadowFilter.blurX * blurScale + ' ' + dropshadowFilter.blurY * blurScale);
                        Filters._svgDropshadowFilterOffset.setAttribute('dx', String(Math.cos(dropshadowFilter.angle * Math.PI / 180) * dropshadowFilter.distance * scale));
                        Filters._svgDropshadowFilterOffset.setAttribute('dy', String(Math.sin(dropshadowFilter.angle * Math.PI / 180) * dropshadowFilter.distance * scale));
                        Filters._svgDropshadowFilterFlood.setAttribute('flood-color', Shumway.ColorUtilities.rgbaToCSSStyle(dropshadowFilter.color << 8 | Math.round(255 * dropshadowFilter.alpha)));
                        Filters._svgDropshadowMergeNode.setAttribute('in', dropshadowFilter.knockout ? 'outer' : 'SourceGraphic');
                        context.filter = 'url(#svgDropShadowFilter)';
                    } else if (filter instanceof GFX.ColorMatrix) {
                        var colorMatrix = filter;
                        Filters._svgColorMatrixFilter.setAttribute('values', colorMatrix.toSVGFilterMatrix());
                        context.filter = 'url(#svgColorMatrixFilter)';
                    }
                };
                Filters._removeFilter = function (context) {
                    // For some reason, setting this to the default empty string "" does
                    // not work, it expects "none".
                    context.filter = 'none';
                };
                Filters._applyColorMatrix = function (context, colorMatrix) {
                    if (colorMatrix.isIdentity()) {
                        context.globalAlpha = 1;
                        context.globalColorMatrix = null;
                    } else if (colorMatrix.hasOnlyAlphaMultiplier()) {
                        context.globalAlpha = clamp(colorMatrix.alphaMultiplier, 0, 1);
                        context.globalColorMatrix = null;
                    } else {
                        context.globalAlpha = 1;
                        if (Filters._svgFiltersAreSupported) {
                            Filters._applyFilter(1, context, colorMatrix);
                            context.globalColorMatrix = null;
                        } else {
                            context.globalColorMatrix = colorMatrix;
                        }
                    }
                };
                Filters._svgFiltersAreSupported = !!Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, 'filter');
                return Filters;
            }();
            Canvas2D.Filters = Filters;
            if (GFX.filters && Filters._svgFiltersAreSupported) {
                // Temporary hack to work around a bug that prevents SVG filters to work for off-screen canvases.
                if (!('registerScratchCanvas' in window)) {
                    window['registerScratchCanvas'] = function (scratchCanvas) {
                        scratchCanvas.style.display = 'none';
                        document.body.appendChild(scratchCanvas);
                    };
                }
            }
            /**
             * Match up FLash blend modes with Canvas blend operations:
             *
             * See: http://kaourantin.net/2005/09/some-word-on-blend-modes-in-flash.html
             */
            function getCompositeOperation(blendMode) {
                // TODO:
                // These Flash blend modes have no canvas equivalent:
                // - BlendMode.Subtract
                // - BlendMode.Invert
                // - BlendMode.Shader
                // - BlendMode.Add is similar to BlendMode.Screen
                // These blend modes are actually Porter-Duff compositing operators.
                // The backdrop is the nearest parent with blendMode set to layer.
                // When there is no LAYER parent, they are ignored (treated as NORMAL).
                // - BlendMode.Alpha (destination-in)
                // - BlendMode.Erase (destination-out)
                // - BlendMode.Layer [defines backdrop]
                var compositeOp = 'source-over';
                switch (blendMode) {
                case GFX.BlendMode.Normal:
                case GFX.BlendMode.Layer:
                    return compositeOp;
                case GFX.BlendMode.Multiply:
                    compositeOp = 'multiply';
                    break;
                case GFX.BlendMode.Add:
                case GFX.BlendMode.Screen:
                    compositeOp = 'screen';
                    break;
                case GFX.BlendMode.Lighten:
                    compositeOp = 'lighten';
                    break;
                case GFX.BlendMode.Darken:
                    compositeOp = 'darken';
                    break;
                case GFX.BlendMode.Difference:
                    compositeOp = 'difference';
                    break;
                case GFX.BlendMode.Overlay:
                    compositeOp = 'overlay';
                    break;
                case GFX.BlendMode.HardLight:
                    compositeOp = 'hard-light';
                    break;
                case GFX.BlendMode.Alpha:
                    compositeOp = 'destination-in';
                    break;
                case GFX.BlendMode.Erase:
                    compositeOp = 'destination-out';
                    break;
                default:
                    release || Shumway.Debug.somewhatImplemented('Blend Mode: ' + GFX.BlendMode[blendMode]);
                }
                return compositeOp;
            }
            /**
             * Clip target? Some blend modes like destination-in that affect all target pixels are very slow otherwise.
             */
            function blendModeShouldClip(blendMode) {
                switch (blendMode) {
                case GFX.BlendMode.Alpha:
                    return true;
                default:
                    return false;
                }
            }
            var Canvas2DSurfaceRegion = function () {
                function Canvas2DSurfaceRegion(surface, region, w, h) {
                    this.surface = surface;
                    this.region = region;
                    this.w = w;
                    this.h = h;    // ...
                }
                Canvas2DSurfaceRegion.prototype.free = function () {
                    this.surface.free(this);
                };
                Canvas2DSurfaceRegion._ensureCopyCanvasSize = function (w, h) {
                    var canvas;
                    if (!Canvas2DSurfaceRegion._copyCanvasContext) {
                        canvas = document.createElement('canvas');
                        if (typeof registerScratchCanvas !== 'undefined') {
                            registerScratchCanvas(canvas);
                        }
                        canvas.width = Shumway.IntegerUtilities.nearestPowerOfTwo(w);
                        canvas.height = Shumway.IntegerUtilities.nearestPowerOfTwo(h);
                        Canvas2DSurfaceRegion._copyCanvasContext = canvas.getContext('2d');
                    } else {
                        canvas = Canvas2DSurfaceRegion._copyCanvasContext.canvas;
                        if (canvas.width < w || canvas.height < h) {
                            canvas.width = Shumway.IntegerUtilities.nearestPowerOfTwo(w);
                            canvas.height = Shumway.IntegerUtilities.nearestPowerOfTwo(h);
                        }
                    }
                };
                Canvas2DSurfaceRegion.prototype.draw = function (source, x, y, w, h, colorMatrix, blendMode, filters, devicePixelRatio) {
                    this.context.setTransform(1, 0, 0, 1, 0, 0);
                    var sourceContext, copyContext, sx = 0, sy = 0;
                    // Handle copying from and to the same canvas.
                    if (source.context.canvas === this.context.canvas) {
                        Canvas2DSurfaceRegion._ensureCopyCanvasSize(w, h);
                        copyContext = Canvas2DSurfaceRegion._copyCanvasContext;
                        copyContext.clearRect(0, 0, w, h);
                        copyContext.drawImage(source.surface.canvas, source.region.x, source.region.y, w, h, 0, 0, w, h);
                        sourceContext = copyContext;
                        sx = 0;
                        sy = 0;
                    } else {
                        sourceContext = source.surface.context;
                        sx = source.region.x;
                        sy = source.region.y;
                    }
                    var canvas = this.context.canvas;
                    var clip = blendModeShouldClip(blendMode);
                    if (clip) {
                        this.context.save();
                        this.context.beginPath();
                        this.context.rect(x, y, w, h);
                        this.context.clip();
                    }
                    this.context.globalAlpha = 1;
                    this.context.globalCompositeOperation = getCompositeOperation(blendMode);
                    if (filters) {
                        if (colorMatrix && !colorMatrix.isIdentity()) {
                            filters = filters.concat(colorMatrix);
                        }
                        var i = 0;
                        if (filters.length > 1) {
                            // If there are more than one filter defined on this node, we create another temporary
                            // surface and keep drawing back and forth between them till all filters are applied,
                            // except of the last one which gets applied when actually drawing into the target after
                            // this block, to safe a drawImage call.
                            var dx, dy, _cc, _sx, _sy;
                            if (copyContext) {
                                _cc = copyContext;
                                copyContext = sourceContext;
                                sourceContext = _cc;
                            } else {
                                Canvas2DSurfaceRegion._ensureCopyCanvasSize(w, h);
                                copyContext = Canvas2DSurfaceRegion._copyCanvasContext;
                                dx = 0;
                                dy = 0;
                            }
                            for (; i < filters.length - 1; i++) {
                                copyContext.clearRect(0, 0, w, h);
                                Filters._applyFilter(devicePixelRatio, copyContext, filters[i]);
                                copyContext.drawImage(sourceContext.canvas, sx, sy, w, h, dx, dy, w, h);
                                Filters._removeFilter(copyContext);
                                _cc = copyContext;
                                _sx = sx;
                                _sy = sy;
                                copyContext = sourceContext;
                                sourceContext = _cc;
                                sx = dx;
                                sy = dx;
                                dx = _sx;
                                dy = _sy;
                            }
                            Filters._removeFilter(sourceContext);
                            Filters._removeFilter(copyContext);
                        }
                        Filters._applyFilter(devicePixelRatio, this.context, filters[i]);
                    }
                    this.context.drawImage(sourceContext.canvas, sx, sy, w, h, x, y, w, h);
                    this.context.globalCompositeOperation = getCompositeOperation(GFX.BlendMode.Normal);
                    Filters._removeFilter(this.context);
                    if (clip) {
                        this.context.restore();
                    }
                };
                Object.defineProperty(Canvas2DSurfaceRegion.prototype, 'context', {
                    get: function () {
                        return this.surface.context;
                    },
                    enumerable: true,
                    configurable: true
                });
                Canvas2DSurfaceRegion.prototype.resetTransform = function () {
                    this.surface.context.setTransform(1, 0, 0, 1, 0, 0);
                };
                Canvas2DSurfaceRegion.prototype.reset = function () {
                    var context = this.surface.context;
                    context.setTransform(1, 0, 0, 1, 0, 0);
                    context.fillStyle = '#000000';
                    context.strokeStyle = '#000000';
                    context.globalAlpha = 1;
                    context.globalColorMatrix = null;
                    context.globalCompositeOperation = getCompositeOperation(GFX.BlendMode.Normal);
                };
                Canvas2DSurfaceRegion.prototype.fill = function (fillStyle) {
                    var context = this.surface.context, region = this.region;
                    context.fillStyle = fillStyle;
                    context.fillRect(region.x, region.y, region.w, region.h);
                };
                Canvas2DSurfaceRegion.prototype.clear = function (rectangle) {
                    var context = this.surface.context, region = this.region;
                    if (!rectangle) {
                        rectangle = region;
                    }
                    context.clearRect(rectangle.x, rectangle.y, rectangle.w, rectangle.h);
                };
                return Canvas2DSurfaceRegion;
            }();
            Canvas2D.Canvas2DSurfaceRegion = Canvas2DSurfaceRegion;
            var Canvas2DSurface = function () {
                function Canvas2DSurface(canvas, regionAllocator) {
                    this.canvas = canvas;
                    this.context = canvas.getContext('2d');
                    this.w = canvas.width;
                    this.h = canvas.height;
                    this._regionAllocator = regionAllocator;
                }
                Canvas2DSurface.prototype.allocate = function (w, h) {
                    var region = this._regionAllocator.allocate(w, h);
                    if (region) {
                        return new Canvas2DSurfaceRegion(this, region, w, h);
                    }
                    return null;
                };
                Canvas2DSurface.prototype.free = function (surfaceRegion) {
                    this._regionAllocator.free(surfaceRegion.region);
                };
                return Canvas2DSurface;
            }();
            Canvas2D.Canvas2DSurface = Canvas2DSurface;
        }(Canvas2D = GFX.Canvas2D || (GFX.Canvas2D = {})));
    }(GFX = Shumway.GFX || (Shumway.GFX = {})));
}(Shumway || (Shumway = {})));
var __extends = this && this.__extends || function (d, b) {
    for (var p in b)
        if (b.hasOwnProperty(p))
            d[p] = b[p];
    function __() {
        this.constructor = d;
    }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Shumway;
(function (Shumway) {
    var GFX;
    (function (GFX) {
        var Canvas2D;
        (function (Canvas2D) {
            var assert = Shumway.Debug.assert;
            var Rectangle = Shumway.GFX.Geometry.Rectangle;
            var Point = Shumway.GFX.Geometry.Point;
            var Matrix = Shumway.GFX.Geometry.Matrix;
            var BlendMode = Shumway.GFX.BlendMode;
            var clamp = Shumway.NumberUtilities.clamp;
            var pow2 = Shumway.NumberUtilities.pow2;
            var writer = null;
            // new IndentingWriter(false, dumpLine);
            var MIN_CACHE_LEVELS = 5;
            var MAX_CACHE_LEVELS = 3;
            var MipMapLevel = function () {
                function MipMapLevel(surfaceRegion, scale) {
                    this.surfaceRegion = surfaceRegion;
                    this.scale = scale;    // ...
                }
                return MipMapLevel;
            }();
            Canvas2D.MipMapLevel = MipMapLevel;
            var MipMap = function () {
                function MipMap(renderer, node, surfaceRegionAllocator, size) {
                    this._node = node;
                    this._levels = [];
                    this._surfaceRegionAllocator = surfaceRegionAllocator;
                    this._size = size;
                    this._renderer = renderer;
                }
                MipMap.prototype.getLevel = function (matrix) {
                    var matrixScale = Math.max(matrix.getAbsoluteScaleX(), matrix.getAbsoluteScaleY());
                    var level = 0;
                    if (matrixScale !== 1) {
                        level = clamp(Math.round(Math.log(matrixScale) / Math.LN2), -MIN_CACHE_LEVELS, MAX_CACHE_LEVELS);
                    }
                    if (!this._node.hasFlags(512    /* Scalable */)) {
                        level = clamp(level, -MIN_CACHE_LEVELS, 0);
                    }
                    var scale = pow2(level);
                    var levelIndex = MIN_CACHE_LEVELS + level;
                    var mipLevel = this._levels[levelIndex];
                    if (!mipLevel) {
                        var bounds = this._node.getBounds();
                        var scaledBounds = bounds.clone();
                        scaledBounds.scale(scale, scale);
                        scaledBounds.snap();
                        var surfaceRegion = this._surfaceRegionAllocator.allocate(scaledBounds.w, scaledBounds.h, null);
                        // surfaceRegion.fill(ColorStyle.randomStyle());
                        var region = surfaceRegion.region;
                        mipLevel = this._levels[levelIndex] = new MipMapLevel(surfaceRegion, scale);
                        var surface = mipLevel.surfaceRegion.surface;
                        var context = surface.context;
                        //        context.save();
                        //        context.beginPath();
                        //        context.rect(region.x, region.y, region.w, region.h);
                        //        context.clip();
                        //        context.setTransform(scale, 0, 0, scale, region.x - scaledBounds.x, region.y - scaledBounds.y);
                        var state = new RenderState(surfaceRegion);
                        state.clip.set(region);
                        state.matrix.setElements(scale, 0, 0, scale, region.x - scaledBounds.x, region.y - scaledBounds.y);
                        state.flags |= 64    /* IgnoreNextRenderWithCache */;
                        this._renderer.renderNodeWithState(this._node, state);
                        state.free();
                    }
                    return mipLevel;
                };
                return MipMap;
            }();
            Canvas2D.MipMap = MipMap;
            var Canvas2DRendererOptions = function (_super) {
                __extends(Canvas2DRendererOptions, _super);
                function Canvas2DRendererOptions() {
                    _super.apply(this, arguments);
                    /**
                     * Whether to force snapping matrices to device pixels.
                     */
                    this.snapToDevicePixels = true;
                    /**
                     * Whether to force image smoothing when drawing images.
                     */
                    this.imageSmoothing = true;
                    /**
                     * Whether to enable blending.
                     */
                    this.blending = true;
                    /**
                     * Whether to enable debugging of layers.
                     */
                    this.debugLayers = false;
                    /**
                     * Whether to enable masking.
                     */
                    this.masking = true;
                    /**
                     * Whether to enable filters.
                     */
                    this.filters = true;
                    /**
                     * Whether to cache shapes as images.
                     */
                    this.cacheShapes = false;
                    /**
                     * Shapes above this size are not cached.
                     */
                    this.cacheShapesMaxSize = 256;
                    /**
                     * Number of times a shape is rendered before it's elligible for caching.
                     */
                    this.cacheShapesThreshold = 16;
                    /**
                     * Enables alpha layer for the canvas context.
                     */
                    this.alpha = false;
                }
                return Canvas2DRendererOptions;
            }(GFX.RendererOptions);
            Canvas2D.Canvas2DRendererOptions = Canvas2DRendererOptions;
            var MAX_VIEWPORT = Rectangle.createMaxI16();
            /**
             * Render state.
             */
            var RenderState = function (_super) {
                __extends(RenderState, _super);
                function RenderState(target) {
                    _super.call(this);
                    this.clip = Rectangle.createEmpty();
                    this.clipList = [];
                    this.clipPath = null;
                    this.flags = 0    /* None */;
                    this.target = null;
                    this.matrix = Matrix.createIdentity();
                    this.colorMatrix = GFX.ColorMatrix.createIdentity();
                    RenderState.allocationCount++;
                    this.target = target;
                }
                RenderState.prototype.set = function (state) {
                    this.clip.set(state.clip);
                    this.clipPath = state.clipPath;
                    this.target = state.target;
                    this.matrix.set(state.matrix);
                    this.colorMatrix.set(state.colorMatrix);
                    this.flags = state.flags;
                    Shumway.ArrayUtilities.copyFrom(this.clipList, state.clipList);
                };
                RenderState.prototype.clone = function () {
                    var state = RenderState.allocate();
                    if (!state) {
                        state = new RenderState(this.target);
                    }
                    state.set(this);
                    return state;
                };
                RenderState.allocate = function () {
                    var dirtyStack = RenderState._dirtyStack;
                    var state = null;
                    if (dirtyStack.length) {
                        state = dirtyStack.pop();
                    }
                    return state;
                };
                RenderState.prototype.free = function () {
                    this.clipPath = null;
                    RenderState._dirtyStack.push(this);
                };
                RenderState.prototype.transform = function (transform) {
                    var state = this.clone();
                    state.matrix.preMultiply(transform.getMatrix());
                    if (transform.hasColorMatrix()) {
                        state.colorMatrix.multiply(transform.getColorMatrix());
                    }
                    return state;
                };
                RenderState.prototype.hasFlags = function (flags) {
                    return (this.flags & flags) === flags;
                };
                RenderState.prototype.removeFlags = function (flags) {
                    this.flags &= ~flags;
                };
                RenderState.prototype.toggleFlags = function (flags, on) {
                    if (on) {
                        this.flags |= flags;
                    } else {
                        this.flags &= ~flags;
                    }
                };
                RenderState.prototype.beginClipPath = function (transform) {
                    this.target.context.save();
                    this.clipPath = new Path2D();
                };
                RenderState.prototype.applyClipPath = function () {
                    var context = this.target.context;
                    // Coords in clipPath are defined in global space, so have to reset the current transform, ...
                    context.setTransform(1, 0, 0, 1, 0, 0);
                    // ... apply the clip ...
                    context.clip(this.clipPath);
                    // ... and finally restore the current transform.
                    var matrix = this.matrix;
                    context.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
                };
                RenderState.prototype.closeClipPath = function () {
                    this.target.context.restore();
                };
                RenderState.allocationCount = 0;
                RenderState._dirtyStack = [];
                return RenderState;
            }(GFX.State);
            Canvas2D.RenderState = RenderState;
            /**
             * Stats for each rendered frame.
             */
            var FrameInfo = function () {
                function FrameInfo() {
                    this._count = 0;
                    this.shapes = 0;
                    this.groups = 0;
                    this.culledNodes = 0;
                }
                FrameInfo.prototype.enter = function (state) {
                    Shumway.GFX.enterTimeline('Frame', { frame: this._count });
                    this._count++;
                    if (!writer) {
                        return;
                    }
                    writer.enter('> Frame: ' + this._count);
                    this._enterTime = performance.now();
                    this.shapes = 0;
                    this.groups = 0;
                    this.culledNodes = 0;
                };
                FrameInfo.prototype.leave = function () {
                    Shumway.GFX.leaveTimeline('Frame');
                    if (!writer) {
                        return;
                    }
                    writer.writeLn('Shapes: ' + this.shapes + ', Groups: ' + this.groups + ', Culled Nodes: ' + this.culledNodes);
                    writer.writeLn('Elapsed: ' + (performance.now() - this._enterTime).toFixed(2));
                    writer.writeLn('Rectangle: ' + Rectangle.allocationCount + ', Matrix: ' + Matrix.allocationCount + ', State: ' + RenderState.allocationCount);
                    writer.leave('<');
                };
                return FrameInfo;
            }();
            Canvas2D.FrameInfo = FrameInfo;
            var Canvas2DRenderer = function (_super) {
                __extends(Canvas2DRenderer, _super);
                function Canvas2DRenderer(container, stage, options) {
                    if (options === void 0) {
                        options = new Canvas2DRendererOptions();
                    }
                    _super.call(this, container, stage, options);
                    this._visited = 0;
                    this._frameInfo = new FrameInfo();
                    this._fontSize = 0;
                    /**
                     * Stack of rendering layers. Stage video lives at the bottom of this stack.
                     */
                    this._layers = [];
                    if (container instanceof HTMLCanvasElement) {
                        var canvas = container;
                        this._viewport = new Rectangle(0, 0, canvas.width, canvas.height);
                        this._target = this._createTarget(canvas);
                    } else {
                        this._addLayer('Background Layer');
                        var canvasLayer = this._addLayer('Canvas Layer');
                        var canvas = document.createElement('canvas');
                        canvasLayer.appendChild(canvas);
                        this._viewport = new Rectangle(0, 0, container.scrollWidth, container.scrollHeight);
                        var self = this;
                        stage.addEventListener(1    /* OnStageBoundsChanged */, function () {
                            self._onStageBoundsChanged(canvas);
                        });
                        this._onStageBoundsChanged(canvas);
                    }
                    Canvas2DRenderer._prepareSurfaceAllocators();
                }
                Canvas2DRenderer.prototype._addLayer = function (name) {
                    var div = document.createElement('div');
                    div.style.position = 'absolute';
                    div.style.overflow = 'hidden';
                    div.style.width = '100%';
                    div.style.height = '100%';
                    div.style.zIndex = this._layers.length + '';
                    this._container.appendChild(div);
                    this._layers.push(div);
                    return div;
                };
                Object.defineProperty(Canvas2DRenderer.prototype, '_backgroundVideoLayer', {
                    get: function () {
                        return this._layers[0];
                    },
                    enumerable: true,
                    configurable: true
                });
                Canvas2DRenderer.prototype._createTarget = function (canvas) {
                    return new Canvas2D.Canvas2DSurfaceRegion(new Canvas2D.Canvas2DSurface(canvas), new GFX.RegionAllocator.Region(0, 0, canvas.width, canvas.height), canvas.width, canvas.height);
                };
                /**
                 * If the stage bounds have changed, we have to resize all of our layers, canvases and more ...
                 */
                Canvas2DRenderer.prototype._onStageBoundsChanged = function (canvas) {
                    var stageBounds = this._stage.getBounds(true);
                    stageBounds.snap();
                    var ratio = this._devicePixelRatio = window.devicePixelRatio || 1;
                    var w = stageBounds.w / ratio + 'px';
                    var h = stageBounds.h / ratio + 'px';
                    for (var i = 0; i < this._layers.length; i++) {
                        var layer = this._layers[i];
                        layer.style.width = w;
                        layer.style.height = h;
                    }
                    canvas.width = stageBounds.w;
                    canvas.height = stageBounds.h;
                    canvas.style.position = 'absolute';
                    canvas.style.width = w;
                    canvas.style.height = h;
                    this._target = this._createTarget(canvas);
                    this._fontSize = 10 * this._devicePixelRatio;
                };
                Canvas2DRenderer._prepareSurfaceAllocators = function () {
                    if (Canvas2DRenderer._initializedCaches) {
                        return;
                    }
                    var minSurfaceSize = 1024;
                    Canvas2DRenderer._surfaceCache = new GFX.SurfaceRegionAllocator.SimpleAllocator(function (w, h) {
                        var canvas = document.createElement('canvas');
                        if (typeof registerScratchCanvas !== 'undefined') {
                            registerScratchCanvas(canvas);
                        }
                        // Surface caches are at least this size.
                        var W = Math.max(minSurfaceSize, w);
                        var H = Math.max(minSurfaceSize, h);
                        canvas.width = W;
                        canvas.height = H;
                        var allocator = null;
                        if (w >= 1024 / 2 || h >= 1024 / 2) {
                            // The requested size is very large, so create a single grid allocator
                            // with there requested size. This will only hold one image.
                            allocator = new GFX.RegionAllocator.GridAllocator(W, H, W, H);
                        } else {
                            allocator = new GFX.RegionAllocator.BucketAllocator(W, H);
                        }
                        return new Canvas2D.Canvas2DSurface(canvas, allocator);
                    });
                    Canvas2DRenderer._shapeCache = new GFX.SurfaceRegionAllocator.SimpleAllocator(function (w, h) {
                        var canvas = document.createElement('canvas');
                        if (typeof registerScratchCanvas !== 'undefined') {
                            registerScratchCanvas(canvas);
                        }
                        var W = minSurfaceSize, H = minSurfaceSize;
                        canvas.width = W;
                        canvas.height = H;
                        // Shape caches can be compact since regions are never freed explicitly.
                        var allocator = allocator = new GFX.RegionAllocator.CompactAllocator(W, H);
                        return new Canvas2D.Canvas2DSurface(canvas, allocator);
                    });
                    Canvas2DRenderer._initializedCaches = true;
                };
                /**
                 * Main render function.
                 */
                Canvas2DRenderer.prototype.render = function () {
                    var stage = this._stage;
                    var target = this._target;
                    var options = this._options;
                    var viewport = this._viewport;
                    // stage.visit(new TracingNodeVisitor(new IndentingWriter()), null);
                    target.reset();
                    target.context.save();
                    target.context.beginPath();
                    target.context.rect(viewport.x, viewport.y, viewport.w, viewport.h);
                    target.context.clip();
                    this._renderStageToTarget(target, stage, viewport);
                    target.reset();
                    if (options.paintViewport) {
                        target.context.beginPath();
                        target.context.rect(viewport.x, viewport.y, viewport.w, viewport.h);
                        target.context.strokeStyle = '#FF4981';
                        target.context.lineWidth = 2;
                        target.context.stroke();
                    }
                    target.context.restore();
                };
                Canvas2DRenderer.prototype.renderNode = function (node, clip, matrix) {
                    var state = new RenderState(this._target);
                    state.clip.set(clip);
                    state.flags = 256    /* CacheShapes */;
                    state.matrix.set(matrix);
                    node.visit(this, state);
                    state.free();
                };
                Canvas2DRenderer.prototype.renderNodeWithState = function (node, state) {
                    node.visit(this, state);
                };
                Canvas2DRenderer.prototype._renderWithCache = function (node, state) {
                    var matrix = state.matrix;
                    var bounds = node.getBounds();
                    if (bounds.isEmpty()) {
                        return false;
                    }
                    var cacheShapesMaxSize = this._options.cacheShapesMaxSize;
                    var matrixScale = Math.max(matrix.getAbsoluteScaleX(), matrix.getAbsoluteScaleY());
                    var renderCount = 100;
                    var paintClip = !!(state.flags & 16    /* PaintClip */);
                    var paintStencil = !!(state.flags & 8    /* PaintStencil */);
                    var paintFlashing = !!(state.flags & 512    /* PaintFlashing */);
                    if (!state.hasFlags(256    /* CacheShapes */)) {
                        return;
                    }
                    if (paintStencil || paintClip || !state.colorMatrix.isIdentity() || node.hasFlags(256    /* Dynamic */)) {
                        return false;
                    }
                    if (renderCount < this._options.cacheShapesThreshold || bounds.w * matrixScale > cacheShapesMaxSize || bounds.h * matrixScale > cacheShapesMaxSize) {
                        return false;
                    }
                    var mipMap = node.properties['mipMap'];
                    if (!mipMap) {
                        mipMap = node.properties['mipMap'] = new MipMap(this, node, Canvas2DRenderer._shapeCache, cacheShapesMaxSize);
                    }
                    var mipMapLevel = mipMap.getLevel(matrix);
                    var mipMapLevelSurfaceRegion = mipMapLevel.surfaceRegion;
                    var region = mipMapLevelSurfaceRegion.region;
                    if (mipMapLevel) {
                        var context = state.target.context;
                        context.imageSmoothingEnabled = context.mozImageSmoothingEnabled = true;
                        context.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
                        context.drawImage(mipMapLevelSurfaceRegion.surface.canvas, region.x, region.y, region.w, region.h, bounds.x, bounds.y, bounds.w, bounds.h);
                        return true;
                    }
                    return false;
                };
                Canvas2DRenderer.prototype._intersectsClipList = function (node, state) {
                    var boundsAABB = node.getBounds(true);
                    var intersects = false;
                    state.matrix.transformRectangleAABB(boundsAABB);
                    if (state.clip.intersects(boundsAABB)) {
                        intersects = true;
                    }
                    var list = state.clipList;
                    if (intersects && list.length) {
                        intersects = false;
                        for (var i = 0; i < list.length; i++) {
                            if (boundsAABB.intersects(list[i])) {
                                intersects = true;
                                break;
                            }
                        }
                    }
                    boundsAABB.free();
                    return intersects;
                };
                Canvas2DRenderer.prototype.visitGroup = function (node, state) {
                    this._frameInfo.groups++;
                    var bounds = node.getBounds();
                    if (node.hasFlags(4    /* IsMask */) && !(state.flags & 4    /* IgnoreMask */)) {
                        return;
                    }
                    if (!node.hasFlags(1    /* Visible */)) {
                        return;
                    }
                    var ignoreNextLayer = state.flags & 1    /* IgnoreNextLayer */;
                    if (!ignoreNextLayer && ((node.getLayer().blendMode !== BlendMode.Normal || node.getLayer().mask) && this._options.blending || node.getLayer().filters && this._options.filters)) {
                        state = state.clone();
                        state.flags |= 1    /* IgnoreNextLayer */;
                        state.clipList = [];
                        this._renderLayer(node, state);
                        state.free();
                    } else {
                        if (ignoreNextLayer) {
                            state.removeFlags(1    /* IgnoreNextLayer */);
                        }
                        if (this._intersectsClipList(node, state)) {
                            var clips = null;
                            var children = node.getChildren();
                            for (var i = 0; i < children.length; i++) {
                                var child = children[i];
                                var transform = child.getTransform();
                                var childState = state.transform(transform);
                                childState.toggleFlags(4096    /* ImageSmoothing */, child.hasFlags(64    /* ImageSmoothing */));
                                if (child.clip > 0) {
                                    clips = clips || new Uint8Array(children.length);
                                    // MEMORY: Don't allocate here.
                                    clips[child.clip + i]++;
                                    var clipState = childState.clone();
                                    /*
                                     * We can't cull the clip because clips outside of the viewport still need to act
                                     * as clipping masks. For now we just expand the cull bounds, but a better approach
                                     * would be to cull the clipped nodes and skip creating the clipping region
                                     * alltogether. For this we would need to keep track of the bounds of the current
                                     * clipping region.
                                     */
                                    // clipState.clip.set(MAX_VIEWPORT);
                                    clipState.flags |= 16    /* PaintClip */;
                                    clipState.beginClipPath(transform.getMatrix());
                                    child.visit(this, clipState);
                                    clipState.applyClipPath();
                                    clipState.free();
                                } else {
                                    child.visit(this, childState);
                                }
                                if (clips && clips[i] > 0) {
                                    while (clips[i]--) {
                                        state.closeClipPath();
                                    }
                                }
                                childState.free();
                            }
                        } else {
                            this._frameInfo.culledNodes++;
                        }
                    }
                    this._renderDebugInfo(node, state);
                };
                Canvas2DRenderer.prototype._renderDebugInfo = function (node, state) {
                    if (!(state.flags & 1024    /* PaintBounds */)) {
                        return;
                    }
                    var context = state.target.context;
                    var bounds = node.getBounds(true);
                    var style = node.properties['style'];
                    if (!style) {
                        style = node.properties['style'] = Shumway.ColorStyle.randomStyle();
                    }
                    context.strokeStyle = style;
                    state.matrix.transformRectangleAABB(bounds);
                    context.setTransform(1, 0, 0, 1, 0, 0);
                    var drawDetails = false;
                    if (drawDetails && bounds.w > 32 && bounds.h > 32) {
                        context.textAlign = 'center';
                        context.textBaseline = 'middle';
                        context.font = this._fontSize + 'px Arial';
                        var debugText = '' + node.id;
                        context.fillText(debugText, bounds.x + bounds.w / 2, bounds.y + bounds.h / 2);
                    }
                    bounds.free();
                    var matrix = state.matrix;
                    bounds = node.getBounds();
                    var p = Canvas2DRenderer._debugPoints;
                    state.matrix.transformRectangle(bounds, p);
                    // Doing it this way is a lot faster than strokeRect.
                    context.lineWidth = 1;
                    context.beginPath();
                    context.moveTo(p[0].x, p[0].y);
                    context.lineTo(p[1].x, p[1].y);
                    context.lineTo(p[2].x, p[2].y);
                    context.lineTo(p[3].x, p[3].y);
                    context.lineTo(p[0].x, p[0].y);
                    context.stroke();
                };
                Canvas2DRenderer.prototype.visitStage = function (node, state) {
                    var context = state.target.context;
                    var bounds = node.getBounds(true);
                    state.matrix.transformRectangleAABB(bounds);
                    bounds.intersect(state.clip);
                    state.target.reset();
                    state = state.clone();
                    if (node.dirtyRegion) {
                        state.clipList.length = 0;
                        node.dirtyRegion.gatherOptimizedRegions(state.clipList);
                        context.save();
                        if (state.clipList.length) {
                            context.beginPath();
                            for (var i = 0; i < state.clipList.length; i++) {
                                var clip = state.clipList[i];
                                context.rect(clip.x, clip.y, clip.w, clip.h);
                            }
                            context.clip();
                        } else {
                            context.restore();
                            state.free();
                            return;
                        }
                    }
                    if (this._options.clear) {
                        state.target.clear(state.clip);
                    }
                    // Fill background
                    if (!node.hasFlags(2    /* Transparent */) && node.color) {
                        if (!(state.flags & 32    /* IgnoreRenderable */)) {
                            this._container.style.backgroundColor = node.color.toCSSStyle();
                        }
                    }
                    this.visitGroup(node, state);
                    if (node.dirtyRegion) {
                        context.restore();
                        state.target.reset();
                        context.globalAlpha = 0.8;
                        if (state.hasFlags(2048    /* PaintDirtyRegion */)) {
                            node.dirtyRegion.render(state.target.context);
                        }
                        node.dirtyRegion.clear();
                    }
                    state.free();
                };
                Canvas2DRenderer.prototype.visitShape = function (node, state) {
                    if (!this._intersectsClipList(node, state)) {
                        return;
                    }
                    var matrix = state.matrix;
                    if (state.flags & 8192    /* PixelSnapping */) {
                        matrix = matrix.clone();
                        matrix.snap();
                    }
                    var context = state.target.context;
                    Canvas2D.Filters._applyColorMatrix(context, state.colorMatrix);
                    // Only paint if it is visible.
                    if (node.source instanceof GFX.RenderableVideo) {
                        this.visitRenderableVideo(node.source, state);
                    } else if (context.globalAlpha > 0) {
                        this.visitRenderable(node.source, state, node.ratio);
                    }
                    if (state.flags & 8192    /* PixelSnapping */) {
                        matrix.free();
                    }
                    Canvas2D.Filters._removeFilter(context);
                };
                /**
                 * We don't actually draw the video like normal renderables, although we could.
                 * Instead, we add the video element underneeth the canvas at layer zero and set
                 * the appropriate css transform to move it into place.
                 */
                Canvas2DRenderer.prototype.visitRenderableVideo = function (node, state) {
                    if (!node.video || !node.video.videoWidth) {
                        return;    // video is not ready
                    }
                    var ratio = this._devicePixelRatio;
                    var matrix = state.matrix.clone();
                    matrix.scale(1 / ratio, 1 / ratio);
                    var bounds = node.getBounds();
                    var videoMatrix = Shumway.GFX.Geometry.Matrix.createIdentity();
                    videoMatrix.scale(bounds.w / node.video.videoWidth, bounds.h / node.video.videoHeight);
                    matrix.preMultiply(videoMatrix);
                    videoMatrix.free();
                    var cssTransform = matrix.toCSSTransform();
                    node.video.style.transformOrigin = '0 0';
                    node.video.style.transform = cssTransform;
                    var videoLayer = this._backgroundVideoLayer;
                    if (videoLayer !== node.video.parentElement) {
                        videoLayer.appendChild(node.video);
                        node.addEventListener(2    /* RemovedFromStage */, function removeVideo(node) {
                            release || assert(videoLayer === node.video.parentElement);
                            videoLayer.removeChild(node.video);
                            node.removeEventListener(2    /* RemovedFromStage */, removeVideo);
                        });
                    }
                    matrix.free();
                };
                Canvas2DRenderer.prototype.visitRenderable = function (node, state, ratio) {
                    var bounds = node.getBounds();
                    if (state.flags & 32    /* IgnoreRenderable */) {
                        return;
                    }
                    if (bounds.isEmpty()) {
                        return;
                    }
                    if (state.hasFlags(64    /* IgnoreNextRenderWithCache */)) {
                        state.removeFlags(64    /* IgnoreNextRenderWithCache */);
                    } else {
                        if (this._renderWithCache(node, state)) {
                            return;
                        }
                    }
                    var matrix = state.matrix;
                    var context = state.target.context;
                    var paintClip = !!(state.flags & 16    /* PaintClip */);
                    var paintStencil = !!(state.flags & 8    /* PaintStencil */);
                    var paintFlashing = !release && !!(state.flags & 512    /* PaintFlashing */);
                    context.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
                    var paintStart = 0;
                    if (paintFlashing) {
                        paintStart = performance.now();
                    }
                    this._frameInfo.shapes++;
                    context.imageSmoothingEnabled = context.mozImageSmoothingEnabled = state.hasFlags(4096    /* ImageSmoothing */);
                    var renderCount = node.properties['renderCount'] || 0;
                    var cacheShapesMaxSize = this._options.cacheShapesMaxSize;
                    node.properties['renderCount'] = ++renderCount;
                    node.render(context, ratio, null, paintClip ? state.clipPath : null, paintStencil);
                    if (paintFlashing) {
                        var elapsed = performance.now() - paintStart;
                        context.fillStyle = Shumway.ColorStyle.gradientColor(0.1 / elapsed);
                        context.globalAlpha = 0.3 + 0.1 * Math.random();
                        context.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);
                    }
                };
                Canvas2DRenderer.prototype._renderLayer = function (node, state) {
                    var layer = node.getLayer();
                    var mask = layer.mask;
                    if (!mask) {
                        var clip = Rectangle.allocate();
                        var target = this._renderToTemporarySurface(node, node.getLayerBounds(!!this._options.filters), state, clip, state.target.surface);
                        if (target) {
                            state.target.draw(target, clip.x, clip.y, clip.w, clip.h, state.colorMatrix, this._options.blending ? layer.blendMode : BlendMode.Normal, this._options.filters ? layer.filters : null, this._devicePixelRatio);
                            target.free();
                        }
                        clip.free();
                    } else {
                        var paintStencil = !node.hasFlags(16    /* CacheAsBitmap */) || !mask.hasFlags(16    /* CacheAsBitmap */);
                        this._renderWithMask(node, mask, layer.blendMode, paintStencil, state);
                    }
                };
                Canvas2DRenderer.prototype._renderWithMask = function (node, mask, blendMode, stencil, state) {
                    var maskMatrix = mask.getTransform().getConcatenatedMatrix(true);
                    // If the mask doesn't have a parent then it's matrix doesn't include the pixel density
                    // scaling and we have to factor it in separately.
                    if (!mask.parent) {
                        maskMatrix = maskMatrix.scale(this._devicePixelRatio, this._devicePixelRatio);
                    }
                    var aAABB = node.getBounds().clone();
                    state.matrix.transformRectangleAABB(aAABB);
                    aAABB.snap();
                    if (aAABB.isEmpty()) {
                        return;
                    }
                    var bAABB = mask.getBounds().clone();
                    maskMatrix.transformRectangleAABB(bAABB);
                    bAABB.snap();
                    if (bAABB.isEmpty()) {
                        return;
                    }
                    var clip = state.clip.clone();
                    clip.intersect(aAABB);
                    clip.intersect(bAABB);
                    clip.snap();
                    // The masked area is empty, so nothing to do here.
                    if (clip.isEmpty()) {
                        return;
                    }
                    var aState = state.clone();
                    aState.clip.set(clip);
                    var a = this._renderToTemporarySurface(node, node.getBounds(), aState, Rectangle.createEmpty(), null);
                    aState.free();
                    var bState = state.clone();
                    bState.clip.set(clip);
                    bState.matrix = maskMatrix;
                    bState.flags |= 4    /* IgnoreMask */;
                    if (stencil) {
                        bState.flags |= 8    /* PaintStencil */;
                    }
                    var b = this._renderToTemporarySurface(mask, mask.getBounds(), bState, Rectangle.createEmpty(), a.surface);
                    bState.free();
                    a.draw(b, 0, 0, clip.w, clip.h, bState.colorMatrix, BlendMode.Alpha, null, this._devicePixelRatio);
                    var matrix = state.matrix;
                    state.target.draw(a, clip.x, clip.y, clip.w, clip.h, aState.colorMatrix, blendMode, null, this._devicePixelRatio);
                    b.free();
                    a.free();
                };
                Canvas2DRenderer.prototype._renderStageToTarget = function (target, node, clip) {
                    Rectangle.allocationCount = Matrix.allocationCount = RenderState.allocationCount = 0;
                    var state = new RenderState(target);
                    state.clip.set(clip);
                    if (!this._options.paintRenderable) {
                        state.flags |= 32    /* IgnoreRenderable */;
                    }
                    if (this._options.paintBounds) {
                        state.flags |= 1024    /* PaintBounds */;
                    }
                    if (this._options.paintDirtyRegion) {
                        state.flags |= 2048    /* PaintDirtyRegion */;
                    }
                    if (this._options.paintFlashing) {
                        state.flags |= 512    /* PaintFlashing */;
                    }
                    if (this._options.cacheShapes) {
                        state.flags |= 256    /* CacheShapes */;
                    }
                    if (this._options.imageSmoothing) {
                        state.flags |= 4096    /* ImageSmoothing */;
                    }
                    if (this._options.snapToDevicePixels) {
                        state.flags |= 8192    /* PixelSnapping */;
                    }
                    this._frameInfo.enter(state);
                    node.visit(this, state);
                    this._frameInfo.leave();
                };
                Canvas2DRenderer.prototype._renderToTemporarySurface = function (node, bounds, state, clip, excludeSurface) {
                    var matrix = state.matrix;
                    var boundsAABB = bounds.clone();
                    matrix.transformRectangleAABB(boundsAABB);
                    boundsAABB.snap();
                    clip.set(boundsAABB);
                    clip.intersect(state.clip);
                    clip.snap();
                    if (clip.isEmpty()) {
                        return null;
                    }
                    var target = this._allocateSurface(clip.w, clip.h, excludeSurface);
                    var region = target.region;
                    // Region bounds may be smaller than the allocated surface region.
                    var surfaceRegionBounds = new Rectangle(region.x, region.y, clip.w, clip.h);
                    target.context.setTransform(1, 0, 0, 1, 0, 0);
                    target.clear();
                    matrix = matrix.clone();
                    matrix.translate(surfaceRegionBounds.x - clip.x, surfaceRegionBounds.y - clip.y);
                    // Clip region bounds so we don't paint outside.
                    target.context.save();
                    // We can't do this because we could be clipping some other temporary region in the same
                    // context.
                    // TODO: but we have to, otherwise we overwrite textures that we might need. This happens in
                    // _renderWithMask, which is why we currently force the allocation of a whole second surface
                    // to avoid it. So, we need to find a solution here.
                    //target.context.beginPath();
                    //target.context.rect(surfaceRegionBounds.x, surfaceRegionBounds.y, surfaceRegionBounds.w,
                    //                    surfaceRegionBounds.h);
                    //target.context.clip();
                    state = state.clone();
                    state.target = target;
                    state.matrix = matrix;
                    state.clip.set(surfaceRegionBounds);
                    node.visit(this, state);
                    state.free();
                    target.context.restore();
                    return target;
                };
                Canvas2DRenderer.prototype._allocateSurface = function (w, h, excludeSurface) {
                    var surface = Canvas2DRenderer._surfaceCache.allocate(w, h, excludeSurface);
                    if (!release) {
                        surface.fill('#FF4981');
                    }
                    // var color = "rgba(" + (Math.random() * 255 | 0) + ", " + (Math.random() * 255 | 0) + ", " + (Math.random() * 255 | 0) + ", 1)"
                    // surface.fill(color);
                    return surface;
                };
                Canvas2DRenderer.prototype.screenShot = function (bounds, stageContent, disableHidpi) {
                    if (stageContent) {
                        // HACK: Weird way to get to the real content, but oh well...
                        var contentStage = this._stage.content.groupChild.child;
                        assert(contentStage instanceof GFX.Stage);
                        bounds = contentStage.content.getBounds(true);
                        // Figure out the device bounds.
                        contentStage.content.getTransform().getConcatenatedMatrix().transformRectangleAABB(bounds);
                        // If it's zoomed in, clip by the viewport.
                        bounds.intersect(this._viewport);
                    }
                    if (!bounds) {
                        bounds = new Rectangle(0, 0, this._target.w, this._target.h);
                    }
                    var outputWidth = bounds.w;
                    var outputHeight = bounds.h;
                    var pixelRatio = this._devicePixelRatio;
                    if (disableHidpi) {
                        outputWidth /= pixelRatio;
                        outputHeight /= pixelRatio;
                        pixelRatio = 1;
                    }
                    var canvas = document.createElement('canvas');
                    canvas.width = outputWidth;
                    canvas.height = outputHeight;
                    var context = canvas.getContext('2d');
                    context.fillStyle = this._container.style.backgroundColor;
                    context.fillRect(0, 0, outputWidth, outputHeight);
                    context.drawImage(this._target.context.canvas, bounds.x, bounds.y, bounds.w, bounds.h, 0, 0, outputWidth, outputHeight);
                    return new GFX.ScreenShot(canvas.toDataURL('image/png'), outputWidth, outputHeight, pixelRatio);
                };
                Canvas2DRenderer._initializedCaches = false;
                Canvas2DRenderer._debugPoints = Point.createEmptyPoints(4);
                return Canvas2DRenderer;
            }(GFX.Renderer);
            Canvas2D.Canvas2DRenderer = Canvas2DRenderer;
        }(Canvas2D = GFX.Canvas2D || (GFX.Canvas2D = {})));
        var assert = Shumway.Debug.assert;
        var Point = GFX.Geometry.Point;
        var Matrix = GFX.Geometry.Matrix;
        var Rectangle = GFX.Geometry.Rectangle;
        var UIState = function () {
            function UIState() {
            }
            UIState.prototype.onMouseUp = function (easel, event) {
                easel.state = this;
            };
            UIState.prototype.onMouseDown = function (easel, event) {
                easel.state = this;
            };
            UIState.prototype.onMouseMove = function (easel, event) {
                easel.state = this;
            };
            UIState.prototype.onMouseWheel = function (easel, event) {
                easel.state = this;
            };
            UIState.prototype.onMouseClick = function (easel, event) {
                easel.state = this;
            };
            UIState.prototype.onKeyUp = function (easel, event) {
                easel.state = this;
            };
            UIState.prototype.onKeyDown = function (easel, event) {
                easel.state = this;
            };
            UIState.prototype.onKeyPress = function (easel, event) {
                easel.state = this;
            };
            return UIState;
        }();
        GFX.UIState = UIState;
        var StartState = function (_super) {
            __extends(StartState, _super);
            function StartState() {
                _super.apply(this, arguments);
                this._keyCodes = [];
            }
            StartState.prototype.onMouseDown = function (easel, event) {
                if (event.altKey) {
                    easel.state = new DragState(easel.worldView, easel.getMousePosition(event, null), easel.worldView.getTransform().getMatrix(true));
                } else {
                }
            };
            StartState.prototype.onMouseClick = function (easel, event) {
            };
            StartState.prototype.onKeyDown = function (easel, event) {
                this._keyCodes[event.keyCode] = true;
            };
            StartState.prototype.onKeyUp = function (easel, event) {
                this._keyCodes[event.keyCode] = false;
            };
            return StartState;
        }(UIState);
        function normalizeWheelSpeed(event) {
            var normalized;
            if (event.wheelDelta) {
                normalized = event.wheelDelta % 120 - 0 == -0 ? event.wheelDelta / 120 : event.wheelDelta / 12;
            } else {
                var rawAmmount = event.deltaY ? event.deltaY : event.detail;
                normalized = -(rawAmmount % 3 ? rawAmmount * 10 : rawAmmount / 3);
            }
            return normalized;
        }
        var PersistentState = function (_super) {
            __extends(PersistentState, _super);
            function PersistentState() {
                _super.apply(this, arguments);
                this._keyCodes = [];
                this._paused = false;
                this._mousePosition = new Point(0, 0);
            }
            PersistentState.prototype.onMouseMove = function (easel, event) {
                this._mousePosition = easel.getMousePosition(event, null);
                this._update(easel);
            };
            PersistentState.prototype.onMouseDown = function (easel, event) {
            };
            PersistentState.prototype.onMouseClick = function (easel, event) {
            };
            PersistentState.prototype.onMouseWheel = function (easel, event) {
                var ticks = event.type === 'DOMMouseScroll' ? -event.detail : event.wheelDelta / 40;
                if (event.altKey) {
                    event.preventDefault();
                    var p = easel.getMousePosition(event, null);
                    var m = easel.worldView.getTransform().getMatrix(true);
                    var s = 1 + ticks / 1000;
                    m.translate(-p.x, -p.y);
                    m.scale(s, s);
                    m.translate(p.x, p.y);
                    easel.worldView.getTransform().setMatrix(m);
                }
            };
            PersistentState.prototype.onKeyPress = function (easel, event) {
                if (!event.altKey) {
                    return;
                }
                var code = event.keyCode || event.which;
                console.info('onKeyPress Code: ' + code);
                switch (code) {
                case 248:
                    this._paused = !this._paused;
                    event.preventDefault();
                    break;
                case 223:
                    easel.toggleOption('paintRenderable');
                    event.preventDefault();
                    break;
                case 8730:
                    easel.toggleOption('paintViewport');
                    event.preventDefault();
                    break;
                case 8747:
                    easel.toggleOption('paintBounds');
                    event.preventDefault();
                    break;
                case 8706:
                    easel.toggleOption('paintDirtyRegion');
                    event.preventDefault();
                    break;
                case 231:
                    easel.toggleOption('clear');
                    event.preventDefault();
                    break;
                case 402:
                    easel.toggleOption('paintFlashing');
                    event.preventDefault();
                    break;
                }
                this._update(easel);
            };
            PersistentState.prototype.onKeyDown = function (easel, event) {
                this._keyCodes[event.keyCode] = true;
                this._update(easel);
            };
            PersistentState.prototype.onKeyUp = function (easel, event) {
                this._keyCodes[event.keyCode] = false;
                this._update(easel);
            };
            PersistentState.prototype._update = function (easel) {
                easel.paused = this._paused;
                if (easel.getOption('paintViewport')) {
                    var w = GFX.viewportLoupeDiameter.value, h = GFX.viewportLoupeDiameter.value;
                    easel.viewport = new Rectangle(this._mousePosition.x - w / 2, this._mousePosition.y - h / 2, w, h);
                } else {
                    easel.viewport = null;
                }
            };
            return PersistentState;
        }(UIState);
        var MouseDownState = function (_super) {
            __extends(MouseDownState, _super);
            function MouseDownState() {
                _super.apply(this, arguments);
                this._startTime = Date.now();
            }
            MouseDownState.prototype.onMouseMove = function (easel, event) {
                if (Date.now() - this._startTime < 10) {
                    return;
                }
                var node = easel.queryNodeUnderMouse(event);
                if (node) {
                    easel.state = new DragState(node, easel.getMousePosition(event, null), node.getTransform().getMatrix(true));
                }
            };
            MouseDownState.prototype.onMouseUp = function (easel, event) {
                easel.state = new StartState();
                easel.selectNodeUnderMouse(event);
            };
            return MouseDownState;
        }(UIState);
        var DragState = function (_super) {
            __extends(DragState, _super);
            function DragState(target, startPosition, startMatrix) {
                _super.call(this);
                this._target = target;
                this._startPosition = startPosition;
                this._startMatrix = startMatrix;
            }
            DragState.prototype.onMouseMove = function (easel, event) {
                event.preventDefault();
                var p = easel.getMousePosition(event, null);
                p.sub(this._startPosition);
                this._target.getTransform().setMatrix(this._startMatrix.clone().translate(p.x, p.y));
                easel.state = this;
            };
            DragState.prototype.onMouseUp = function (easel, event) {
                easel.state = new StartState();
            };
            return DragState;
        }(UIState);
        var Easel = function () {
            function Easel(container, disableHiDPI, backgroundColor) {
                if (disableHiDPI === void 0) {
                    disableHiDPI = false;
                }
                if (backgroundColor === void 0) {
                    backgroundColor = undefined;
                }
                this._state = new StartState();
                this._persistentState = new PersistentState();
                this.paused = false;
                this.viewport = null;
                this._selectedNodes = [];
                this._isRendering = false;
                this._rAF = undefined;
                this._eventListeners = Object.create(null);
                this._fullScreen = false;
                release || assert(container && container.children.length === 0, 'Easel container must be empty.');
                this._container = container;
                this._stage = new GFX.Stage(512, 512, false);
                this._worldView = this._stage.content;
                this._world = new GFX.Group();
                this._worldView.addChild(this._world);
                this._disableHiDPI = disableHiDPI;
                // Create stage container.
                var stageContainer = document.createElement('div');
                stageContainer.style.position = 'absolute';
                stageContainer.style.width = '100%';
                stageContainer.style.height = '100%';
                stageContainer.style.zIndex = '0';
                container.appendChild(stageContainer);
                // Create hud container, that lives on top of the stage.
                if (GFX.hud.value && Shumway.Tools) {
                    var hudContainer = document.createElement('div');
                    hudContainer.style.position = 'absolute';
                    hudContainer.style.width = '100%';
                    hudContainer.style.height = '100%';
                    hudContainer.style.pointerEvents = 'none';
                    var fpsContainer = document.createElement('div');
                    fpsContainer.style.position = 'absolute';
                    fpsContainer.style.width = '100%';
                    fpsContainer.style.height = '20px';
                    fpsContainer.style.pointerEvents = 'none';
                    hudContainer.appendChild(fpsContainer);
                    container.appendChild(hudContainer);
                    this._fps = new Shumway.Tools.Mini.FPS(fpsContainer);
                } else {
                    this._fps = null;
                }
                var transparent = backgroundColor === 0;
                this.transparent = transparent;
                var cssBackgroundColor = backgroundColor === undefined ? '#14171a' : backgroundColor === 0 ? 'transparent' : Shumway.ColorUtilities.rgbaToCSSStyle(backgroundColor);
                this._options = new GFX.Canvas2D.Canvas2DRendererOptions();
                this._options.alpha = transparent;
                this._renderer = new GFX.Canvas2D.Canvas2DRenderer(stageContainer, this._stage, this._options);
                this._listenForContainerSizeChanges();
                this._onMouseUp = this._onMouseUp.bind(this);
                this._onMouseDown = this._onMouseDown.bind(this);
                this._onMouseMove = this._onMouseMove.bind(this);
                var self = this;
                window.addEventListener('mouseup', function (event) {
                    self._state.onMouseUp(self, event);
                    self._render();
                }, false);
                window.addEventListener('mousemove', function (event) {
                    self._state.onMouseMove(self, event);
                    self._persistentState.onMouseMove(self, event);
                }, false);
                function handleMouseWheel(event) {
                    self._state.onMouseWheel(self, event);
                    self._persistentState.onMouseWheel(self, event);
                }
                window.addEventListener('DOMMouseScroll', handleMouseWheel);
                window.addEventListener('mousewheel', handleMouseWheel);
                container.addEventListener('mousedown', function (event) {
                    self._state.onMouseDown(self, event);
                });
                window.addEventListener('keydown', function (event) {
                    self._state.onKeyDown(self, event);
                    if (self._state !== self._persistentState) {
                        self._persistentState.onKeyDown(self, event);
                    }
                }, false);
                window.addEventListener('keypress', function (event) {
                    self._state.onKeyPress(self, event);
                    if (self._state !== self._persistentState) {
                        self._persistentState.onKeyPress(self, event);
                    }
                }, false);
                window.addEventListener('keyup', function (event) {
                    self._state.onKeyUp(self, event);
                    if (self._state !== self._persistentState) {
                        self._persistentState.onKeyUp(self, event);
                    }
                }, false);
            }
            Easel.prototype._listenForContainerSizeChanges = function () {
                var pollInterval = 1000;
                var w = this._containerWidth;
                var h = this._containerHeight;
                this._onContainerSizeChanged();
                var self = this;
                setInterval(function () {
                    if (w !== self._containerWidth || h !== self._containerHeight) {
                        self._onContainerSizeChanged();
                        w = self._containerWidth;
                        h = self._containerHeight;
                    }
                }, pollInterval);
            };
            Easel.prototype._onContainerSizeChanged = function () {
                var ratio = this.getRatio();
                var sw = Math.ceil(this._containerWidth * ratio);
                var sh = Math.ceil(this._containerHeight * ratio);
                this._stage.setBounds(new Rectangle(0, 0, sw, sh));
                this._stage.content.setBounds(new Rectangle(0, 0, sw, sh));
                this._worldView.getTransform().setMatrix(new Matrix(ratio, 0, 0, ratio, 0, 0));
                this._dispatchEvent('resize');
            };
            /**
             * Primitive event dispatching features.
             */
            Easel.prototype.addEventListener = function (type, listener) {
                if (!this._eventListeners[type]) {
                    this._eventListeners[type] = [];
                }
                this._eventListeners[type].push(listener);
            };
            Easel.prototype._dispatchEvent = function (type) {
                var listeners = this._eventListeners[type];
                if (!listeners) {
                    return;
                }
                for (var i = 0; i < listeners.length; i++) {
                    listeners[i]();
                }
            };
            Easel.prototype.startRendering = function () {
                if (this._isRendering) {
                    return;
                }
                this._isRendering = true;
                var self = this;
                this._rAF = requestAnimationFrame(function tick() {
                    self.render();
                    self._rAF = requestAnimationFrame(tick);
                });
            };
            Easel.prototype.stopRendering = function () {
                if (this._isRendering) {
                    this._isRendering = false;
                    cancelAnimationFrame(this._rAF);
                }
            };
            Object.defineProperty(Easel.prototype, 'state', {
                set: function (state) {
                    this._state = state;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Easel.prototype, 'cursor', {
                set: function (cursor) {
                    this._container.style.cursor = cursor;
                },
                enumerable: true,
                configurable: true
            });
            Easel.prototype._render = function () {
                GFX.RenderableVideo.checkForVideoUpdates();
                var mustRender = (this._stage.readyToRender() || GFX.forcePaint.value) && !this.paused;
                var renderTime = 0;
                if (mustRender) {
                    var renderer = this._renderer;
                    if (this.viewport) {
                        renderer.viewport = this.viewport;
                    } else {
                        renderer.viewport = this._stage.getBounds();
                    }
                    this._dispatchEvent('render');
                    GFX.enterTimeline('Render');
                    renderTime = performance.now();
                    renderer.render();
                    renderTime = performance.now() - renderTime;
                    GFX.leaveTimeline('Render');
                }
                if (this._fps) {
                    this._fps.tickAndRender(!mustRender, renderTime);
                }
            };
            Easel.prototype.render = function () {
                this._render();
            };
            Object.defineProperty(Easel.prototype, 'world', {
                get: function () {
                    return this._world;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Easel.prototype, 'worldView', {
                get: function () {
                    return this._worldView;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Easel.prototype, 'stage', {
                get: function () {
                    return this._stage;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Easel.prototype, 'options', {
                get: function () {
                    return this._options;
                },
                enumerable: true,
                configurable: true
            });
            Easel.prototype.getDisplayParameters = function () {
                var ratio = this.getRatio();
                return {
                    stageWidth: this._containerWidth,
                    stageHeight: this._containerHeight,
                    pixelRatio: ratio,
                    screenWidth: window.screen ? window.screen.width : 640,
                    screenHeight: window.screen ? window.screen.height : 480
                };
            };
            Easel.prototype.toggleOption = function (name) {
                var option = this._options;
                option[name] = !option[name];
            };
            Easel.prototype.getOption = function (name) {
                return this._options[name];
            };
            Easel.prototype.getRatio = function () {
                var devicePixelRatio = window.devicePixelRatio || 1;
                var backingStoreRatio = 1;
                var ratio = 1;
                if (devicePixelRatio !== backingStoreRatio && !this._disableHiDPI) {
                    ratio = devicePixelRatio / backingStoreRatio;
                }
                return ratio;
            };
            Object.defineProperty(Easel.prototype, '_containerWidth', {
                get: function () {
                    return this._container.clientWidth;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Easel.prototype, '_containerHeight', {
                get: function () {
                    return this._container.clientHeight;
                },
                enumerable: true,
                configurable: true
            });
            Easel.prototype.queryNodeUnderMouse = function (event) {
                return this._world;
            };
            Easel.prototype.selectNodeUnderMouse = function (event) {
                var frame = this.queryNodeUnderMouse(event);
                if (frame) {
                    this._selectedNodes.push(frame);
                }
                this._render();
            };
            Easel.prototype.getMousePosition = function (event, coordinateSpace) {
                var container = this._container;
                var bRect = container.getBoundingClientRect();
                var ratio = this.getRatio();
                var x = ratio * (event.clientX - bRect.left) * (container.scrollWidth / bRect.width);
                var y = ratio * (event.clientY - bRect.top) * (container.scrollHeight / bRect.height);
                var p = new Point(x, y);
                if (!coordinateSpace) {
                    return p;
                }
                var m = Matrix.createIdentity();
                coordinateSpace.getTransform().getConcatenatedMatrix().inverse(m);
                m.transformPoint(p);
                return p;
            };
            Easel.prototype.getMouseWorldPosition = function (event) {
                return this.getMousePosition(event, this._world);
            };
            Easel.prototype._onMouseDown = function (event) {
            };
            Easel.prototype._onMouseUp = function (event) {
            };
            Easel.prototype._onMouseMove = function (event) {
            };
            Easel.prototype.screenShot = function (bounds, stageContent, disableHidpi) {
                return this._renderer.screenShot(bounds, stageContent, disableHidpi);
            };
            return Easel;
        }();
        GFX.Easel = Easel;
        var Matrix = Shumway.GFX.Geometry.Matrix;
        var TreeRendererOptions = function (_super) {
            __extends(TreeRendererOptions, _super);
            function TreeRendererOptions() {
                _super.apply(this, arguments);
                this.layout = 0    /* Simple */;
            }
            return TreeRendererOptions;
        }(GFX.RendererOptions);
        GFX.TreeRendererOptions = TreeRendererOptions;
        var TreeRenderer = function (_super) {
            __extends(TreeRenderer, _super);
            function TreeRenderer(container, stage, options) {
                if (options === void 0) {
                    options = new TreeRendererOptions();
                }
                _super.call(this, container, stage, options);
                this._canvas = document.createElement('canvas');
                this._container.appendChild(this._canvas);
                this._context = this._canvas.getContext('2d');
                this._listenForContainerSizeChanges();
            }
            TreeRenderer.prototype._listenForContainerSizeChanges = function () {
                var pollInterval = 10;
                var w = this._containerWidth;
                var h = this._containerHeight;
                this._onContainerSizeChanged();
                var self = this;
                setInterval(function () {
                    if (w !== self._containerWidth || h !== self._containerHeight) {
                        self._onContainerSizeChanged();
                        w = self._containerWidth;
                        h = self._containerHeight;
                    }
                }, pollInterval);
            };
            TreeRenderer.prototype._getRatio = function () {
                var devicePixelRatio = window.devicePixelRatio || 1;
                var backingStoreRatio = 1;
                var ratio = 1;
                if (devicePixelRatio !== backingStoreRatio) {
                    ratio = devicePixelRatio / backingStoreRatio;
                }
                return ratio;
            };
            TreeRenderer.prototype._onContainerSizeChanged = function () {
                var ratio = this._getRatio();
                var w = Math.ceil(this._containerWidth * ratio);
                var h = Math.ceil(this._containerHeight * ratio);
                var canvas = this._canvas;
                if (ratio > 0) {
                    canvas.width = w * ratio;
                    canvas.height = h * ratio;
                    canvas.style.width = w + 'px';
                    canvas.style.height = h + 'px';
                } else {
                    canvas.width = w;
                    canvas.height = h;
                }
            };
            Object.defineProperty(TreeRenderer.prototype, '_containerWidth', {
                get: function () {
                    return this._container.clientWidth;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(TreeRenderer.prototype, '_containerHeight', {
                get: function () {
                    return this._container.clientHeight;
                },
                enumerable: true,
                configurable: true
            });
            TreeRenderer.prototype.render = function () {
                var context = this._context;
                context.save();
                context.clearRect(0, 0, this._canvas.width, this._canvas.height);
                context.scale(1, 1);
                if (this._options.layout === 0    /* Simple */) {
                    this._renderNodeSimple(this._context, this._stage, Matrix.createIdentity());
                }
                context.restore();
            };
            TreeRenderer.prototype._renderNodeSimple = function (context, root, transform) {
                var self = this;
                context.save();
                var fontHeight = 16;
                context.font = fontHeight + 'px Arial';
                context.fillStyle = 'white';
                var x = 0, y = 0;
                var w = 20, h = fontHeight, hPadding = 2, wColPadding = 8;
                var colX = 0;
                var maxX = 0;
                function visit(node) {
                    var children = node.getChildren();
                    if (node.hasFlags(4096    /* Dirty */)) {
                        context.fillStyle = 'red';
                    } else {
                        context.fillStyle = 'white';
                    }
                    var l = String(node.id);
                    if (node instanceof GFX.RenderableText) {
                        l = 'T' + l;
                    } else if (node instanceof GFX.RenderableShape) {
                        l = 'S' + l;
                    } else if (node instanceof GFX.RenderableBitmap) {
                        l = 'B' + l;
                    } else if (node instanceof GFX.RenderableVideo) {
                        l = 'V' + l;
                    }
                    if (node instanceof GFX.Renderable) {
                        l = l + ' [' + node._parents.length + ']';
                    }
                    var t = context.measureText(l).width;
                    // context.fillRect(x, y, t, h);
                    context.fillText(l, x, y);
                    if (children) {
                        x += t + 4;
                        maxX = Math.max(maxX, x + w);
                        for (var i = 0; i < children.length; i++) {
                            visit(children[i]);
                            if (i < children.length - 1) {
                                y += h + hPadding;
                                if (y > self._canvas.height) {
                                    context.fillStyle = 'gray';
                                    // context.fillRect(maxX + 4, 0, 2, self._canvas.height);
                                    x = x - colX + maxX + wColPadding;
                                    colX = maxX + wColPadding;
                                    y = 0;
                                    context.fillStyle = 'white';
                                }
                            }
                        }
                        x -= t + 4;
                    }
                }
                visit(root);
                context.restore();
            };
            return TreeRenderer;
        }(GFX.Renderer);
        GFX.TreeRenderer = TreeRenderer;
    }(GFX = Shumway.GFX || (Shumway.GFX = {})));
    var Remoting;
    (function (Remoting) {
        var GFX;
        (function (GFX) {
            var BlurFilter = Shumway.GFX.BlurFilter;
            var DropshadowFilter = Shumway.GFX.DropshadowFilter;
            var Shape = Shumway.GFX.Shape;
            var Group = Shumway.GFX.Group;
            var RenderableShape = Shumway.GFX.RenderableShape;
            var RenderableMorphShape = Shumway.GFX.RenderableMorphShape;
            var RenderableBitmap = Shumway.GFX.RenderableBitmap;
            var RenderableVideo = Shumway.GFX.RenderableVideo;
            var RenderableText = Shumway.GFX.RenderableText;
            var ColorMatrix = Shumway.GFX.ColorMatrix;
            var ShapeData = Shumway.ShapeData;
            var DataBuffer = Shumway.ArrayUtilities.DataBuffer;
            var Stage = Shumway.GFX.Stage;
            var Matrix = Shumway.GFX.Geometry.Matrix;
            var Rectangle = Shumway.GFX.Geometry.Rectangle;
            var assert = Shumway.Debug.assert;
            var writer = null;
            // new IndentingWriter();
            var GFXChannelSerializer = function () {
                function GFXChannelSerializer() {
                }
                GFXChannelSerializer.prototype.writeMouseEvent = function (event, point) {
                    var output = this.output;
                    output.writeInt(300    /* MouseEvent */);
                    var typeId = Shumway.Remoting.MouseEventNames.indexOf(event.type);
                    output.writeInt(typeId);
                    output.writeFloat(point.x);
                    output.writeFloat(point.y);
                    output.writeInt(event.buttons);
                    var flags = (event.ctrlKey ? 1    /* CtrlKey */ : 0) | (event.altKey ? 2    /* AltKey */ : 0) | (event.shiftKey ? 4    /* ShiftKey */ : 0);
                    output.writeInt(flags);
                };
                GFXChannelSerializer.prototype.writeKeyboardEvent = function (event) {
                    var output = this.output;
                    output.writeInt(301    /* KeyboardEvent */);
                    var typeId = Shumway.Remoting.KeyboardEventNames.indexOf(event.type);
                    output.writeInt(typeId);
                    output.writeInt(event.keyCode);
                    output.writeInt(event.charCode);
                    output.writeInt(event.location);
                    var flags = (event.ctrlKey ? 1    /* CtrlKey */ : 0) | (event.altKey ? 2    /* AltKey */ : 0) | (event.shiftKey ? 4    /* ShiftKey */ : 0);
                    output.writeInt(flags);
                };
                GFXChannelSerializer.prototype.writeFocusEvent = function (type) {
                    var output = this.output;
                    output.writeInt(302    /* FocusEvent */);
                    output.writeInt(type);
                };
                return GFXChannelSerializer;
            }();
            GFX.GFXChannelSerializer = GFXChannelSerializer;
            var GFXChannelDeserializerContext = function () {
                function GFXChannelDeserializerContext(easelHost, root, transparent) {
                    var stage = this.stage = new Stage(128, 512);
                    if (typeof registerInspectorStage !== 'undefined') {
                        registerInspectorStage(stage);
                    }
                    function updateStageBounds(node) {
                        var stageBounds = node.getBounds(true);
                        // Easel stage is the root stage and is not scaled, our stage is so
                        // we need to scale down.
                        var ratio = easelHost.easel.getRatio();
                        stageBounds.scale(1 / ratio, 1 / ratio);
                        stageBounds.snap();
                        stage.setBounds(stageBounds);
                    }
                    updateStageBounds(easelHost.stage);
                    easelHost.stage.addEventListener(1    /* OnStageBoundsChanged */, updateStageBounds);
                    easelHost.content = stage.content;
                    if (transparent) {
                        this.stage.setFlags(2    /* Transparent */);
                    }
                    root.addChild(this.stage);
                    this._nodes = [];
                    this._assets = [];
                    this._easelHost = easelHost;
                    this._canvas = document.createElement('canvas');
                    this._context = this._canvas.getContext('2d');
                }
                GFXChannelDeserializerContext.prototype._registerAsset = function (id, symbolId, asset) {
                    if (typeof registerInspectorAsset !== 'undefined') {
                        registerInspectorAsset(id, symbolId, asset);
                    }
                    if (!release && this._assets[id]) {
                        Shumway.Debug.warning('Asset already exists: ' + id + '. old:', this._assets[id], 'new: ' + asset);
                    }
                    this._assets[id] = asset;
                };
                GFXChannelDeserializerContext.prototype._makeNode = function (id) {
                    if (id === -1) {
                        return null;
                    }
                    var node = null;
                    if (id & 134217728    /* Asset */) {
                        id &= ~134217728    /* Asset */;
                        node = this._assets[id].wrap();
                    } else {
                        node = this._nodes[id];
                    }
                    release || assert(node, 'Node ' + node + ' of ' + id + ' has not been sent yet.');
                    return node;
                };
                GFXChannelDeserializerContext.prototype._getAsset = function (id) {
                    return this._assets[id];
                };
                GFXChannelDeserializerContext.prototype._getBitmapAsset = function (id) {
                    return this._assets[id];
                };
                GFXChannelDeserializerContext.prototype._getVideoAsset = function (id) {
                    return this._assets[id];
                };
                GFXChannelDeserializerContext.prototype._getTextAsset = function (id) {
                    return this._assets[id];
                };
                GFXChannelDeserializerContext.prototype.registerFont = function (syncId, data, resolve) {
                    Shumway.registerCSSFont(syncId, data, !inFirefox);
                    if (inFirefox) {
                        resolve(null);
                    } else {
                        window.setTimeout(resolve, 400);
                    }
                };
                GFXChannelDeserializerContext.prototype.registerImage = function (syncId, symbolId, imageType, data, alphaData, resolve) {
                    this._registerAsset(syncId, symbolId, this._decodeImage(imageType, data, alphaData, resolve));
                };
                GFXChannelDeserializerContext.prototype.registerVideo = function (syncId) {
                    this._registerAsset(syncId, 0, new RenderableVideo(syncId, this));
                };
                /**
                 * Creates an Image element to decode JPG|PNG|GIF data passed in as a buffer.
                 *
                 * The resulting image is stored as the drawing source of a new RenderableBitmap, which is
                 * returned.
                 * Once the image is loaded, the RenderableBitmap's bounds are updated and the provided
                 * oncomplete callback is invoked with the image dimensions.
                 */
                GFXChannelDeserializerContext.prototype._decodeImage = function (type, data, alphaData, oncomplete) {
                    var image = new Image();
                    var asset = RenderableBitmap.FromImage(image, -1, -1);
                    image.src = URL.createObjectURL(new Blob([data], { type: Shumway.getMIMETypeForImageType(type) }));
                    image.onload = function () {
                        release || assert(!asset.parent);
                        asset.setBounds(new Rectangle(0, 0, image.width, image.height));
                        if (alphaData) {
                            asset.mask(alphaData);
                        }
                        asset.invalidate();
                        oncomplete({
                            width: image.width,
                            height: image.height
                        });
                    };
                    image.onerror = function () {
                        oncomplete(null);
                    };
                    return asset;
                };
                GFXChannelDeserializerContext.prototype.sendVideoPlaybackEvent = function (assetId, eventType, data) {
                    this._easelHost.sendVideoPlaybackEvent(assetId, eventType, data);
                };
                return GFXChannelDeserializerContext;
            }();
            GFX.GFXChannelDeserializerContext = GFXChannelDeserializerContext;
            var GFXChannelDeserializer = function () {
                function GFXChannelDeserializer() {
                }
                GFXChannelDeserializer.prototype.read = function () {
                    var tag = 0;
                    var input = this.input;
                    var data = {
                        bytesAvailable: input.bytesAvailable,
                        updateGraphics: 0,
                        updateBitmapData: 0,
                        updateTextContent: 0,
                        updateFrame: 0,
                        updateStage: 0,
                        updateCurrentMouseTarget: 0,
                        updateNetStream: 0,
                        registerFont: 0,
                        drawToBitmap: 0,
                        requestBitmapData: 0,
                        decodeImage: 0
                    };
                    Shumway.GFX.enterTimeline('GFXChannelDeserializer.read', data);
                    while (input.bytesAvailable > 0) {
                        tag = input.readInt();
                        switch (tag) {
                        case 0    /* EOF */:
                            Shumway.GFX.leaveTimeline('GFXChannelDeserializer.read');
                            return;
                        case 101    /* UpdateGraphics */:
                            data.updateGraphics++;
                            this._readUpdateGraphics();
                            break;
                        case 102    /* UpdateBitmapData */:
                            data.updateBitmapData++;
                            this._readUpdateBitmapData();
                            break;
                        case 103    /* UpdateTextContent */:
                            data.updateTextContent++;
                            this._readUpdateTextContent();
                            break;
                        case 100    /* UpdateFrame */:
                            data.updateFrame++;
                            this._readUpdateFrame();
                            break;
                        case 104    /* UpdateStage */:
                            data.updateStage++;
                            this._readUpdateStage();
                            break;
                        case 107    /* UpdateCurrentMouseTarget */:
                            data.updateCurrentMouseTarget++;
                            this._readUpdateCurrentMouseTarget();
                            break;
                        case 105    /* UpdateNetStream */:
                            data.updateNetStream++;
                            this._readUpdateNetStream();
                            break;
                        case 200    /* DrawToBitmap */:
                            data.drawToBitmap++;
                            this._readDrawToBitmap();
                            break;
                        case 106    /* RequestBitmapData */:
                            data.requestBitmapData++;
                            this._readRequestBitmapData();
                            break;
                        default:
                            release || assert(false, 'Unknown MessageReader tag: ' + tag);
                            break;
                        }
                    }
                    Shumway.GFX.leaveTimeline('GFXChannelDeserializer.read');
                };
                GFXChannelDeserializer.prototype._readMatrix = function () {
                    var input = this.input;
                    var matrix = GFXChannelDeserializer._temporaryReadMatrix;
                    var a = 1, b = 0, c = 0, d = 1, tx = 0, ty = 0;
                    switch (input.readInt()) {
                    case 1    /* ScaleAndTranslationOnly */:
                        a = input.readFloat();
                        d = input.readFloat();
                    // Fallthrough
                    case 0    /* TranslationOnly */:
                        tx = input.readFloat() / 20;
                        ty = input.readFloat() / 20;
                        break;
                    case 2    /* UniformScaleAndTranslationOnly */:
                        a = d = input.readFloat();
                        tx = input.readFloat() / 20;
                        ty = input.readFloat() / 20;
                        break;
                    case 3    /* All */:
                        a = input.readFloat();
                        b = input.readFloat();
                        c = input.readFloat();
                        d = input.readFloat();
                        tx = input.readFloat() / 20;
                        ty = input.readFloat() / 20;
                        break;
                    }
                    matrix.setElements(a, b, c, d, tx, ty);
                    return matrix;
                };
                GFXChannelDeserializer.prototype._readRectangle = function () {
                    var input = this.input;
                    var rectangle = GFXChannelDeserializer._temporaryReadRectangle;
                    rectangle.setElements(input.readInt() / 20, input.readInt() / 20, input.readInt() / 20, input.readInt() / 20);
                    return rectangle;
                };
                GFXChannelDeserializer.prototype._readColorMatrix = function () {
                    var input = this.input;
                    var colorMatrix = GFXChannelDeserializer._temporaryReadColorMatrix;
                    var rm = 1, gm = 1, bm = 1, am = 1;
                    var ro = 0, go = 0, bo = 0, ao = 0;
                    switch (input.readInt()) {
                    case 0    /* Identity */:
                        return GFXChannelDeserializer._temporaryReadColorMatrixIdentity;
                        break;
                    case 1    /* AlphaMultiplierOnly */:
                        am = input.readFloat();
                        break;
                    case 2    /* AlphaMultiplierWithOffsets */:
                        rm = 0;
                        gm = 0;
                        bm = 0;
                        am = input.readFloat();
                        ro = input.readInt();
                        go = input.readInt();
                        bo = input.readInt();
                        ao = input.readInt();
                        break;
                    case 3    /* All */:
                        rm = input.readFloat();
                        gm = input.readFloat();
                        bm = input.readFloat();
                        am = input.readFloat();
                        ro = input.readInt();
                        go = input.readInt();
                        bo = input.readInt();
                        ao = input.readInt();
                        break;
                    }
                    colorMatrix.setMultipliersAndOffsets(rm, gm, bm, am, ro, go, bo, ao);
                    return colorMatrix;
                };
                GFXChannelDeserializer.prototype._readAsset = function () {
                    var assetId = this.input.readInt();
                    var asset = this.inputAssets[assetId];
                    this.inputAssets[assetId] = null;
                    return asset;
                };
                GFXChannelDeserializer.prototype._readUpdateGraphics = function () {
                    var input = this.input;
                    var context = this.context;
                    var id = input.readInt();
                    var symbolId = input.readInt();
                    var asset = context._getAsset(id);
                    var bounds = this._readRectangle();
                    var pathData = ShapeData.FromPlainObject(this._readAsset());
                    var numTextures = input.readInt();
                    var textures = [];
                    for (var i = 0; i < numTextures; i++) {
                        var bitmapId = input.readInt();
                        textures.push(context._getBitmapAsset(bitmapId));
                    }
                    if (asset) {
                        asset.update(pathData, textures, bounds);
                    } else {
                        var renderable;
                        if (pathData.morphCoordinates) {
                            renderable = new RenderableMorphShape(id, pathData, textures, bounds);
                        } else {
                            renderable = new RenderableShape(id, pathData, textures, bounds);
                        }
                        for (var i = 0; i < textures.length; i++) {
                            textures[i] && textures[i].addRenderableParent(renderable);
                        }
                        context._registerAsset(id, symbolId, renderable);
                    }
                };
                GFXChannelDeserializer.prototype._readUpdateBitmapData = function () {
                    var input = this.input;
                    var context = this.context;
                    var id = input.readInt();
                    var symbolId = input.readInt();
                    var asset = context._getBitmapAsset(id);
                    var bounds = this._readRectangle();
                    var type = input.readInt();
                    var dataBuffer = DataBuffer.FromPlainObject(this._readAsset());
                    if (!asset) {
                        asset = RenderableBitmap.FromDataBuffer(type, dataBuffer, bounds);
                        context._registerAsset(id, symbolId, asset);
                    } else {
                        asset.updateFromDataBuffer(type, dataBuffer);
                    }
                    if (this.output) {
                    }
                };
                GFXChannelDeserializer.prototype._readUpdateTextContent = function () {
                    var input = this.input;
                    var context = this.context;
                    var id = input.readInt();
                    var symbolId = input.readInt();
                    var asset = context._getTextAsset(id);
                    var bounds = this._readRectangle();
                    var matrix = this._readMatrix();
                    var backgroundColor = input.readInt();
                    var borderColor = input.readInt();
                    var autoSize = input.readInt();
                    var wordWrap = input.readBoolean();
                    var scrollV = input.readInt();
                    var scrollH = input.readInt();
                    var plainText = this._readAsset();
                    var textRunData = DataBuffer.FromPlainObject(this._readAsset());
                    var coords = null;
                    var numCoords = input.readInt();
                    if (numCoords) {
                        coords = new DataBuffer(numCoords * 4);
                        input.readBytes(coords, 0, numCoords * 4);
                    }
                    if (!asset) {
                        asset = new RenderableText(bounds);
                        asset.setContent(plainText, textRunData, matrix, coords);
                        asset.setStyle(backgroundColor, borderColor, scrollV, scrollH);
                        asset.reflow(autoSize, wordWrap);
                        context._registerAsset(id, symbolId, asset);
                    } else {
                        asset.setBounds(bounds);
                        asset.setContent(plainText, textRunData, matrix, coords);
                        asset.setStyle(backgroundColor, borderColor, scrollV, scrollH);
                        asset.reflow(autoSize, wordWrap);
                    }
                    if (this.output) {
                        var rect = asset.textRect;
                        this.output.writeInt(rect.w * 20);
                        this.output.writeInt(rect.h * 20);
                        this.output.writeInt(rect.x * 20);
                        var lines = asset.lines;
                        var numLines = lines.length;
                        this.output.writeInt(numLines);
                        for (var i = 0; i < numLines; i++) {
                            this._writeLineMetrics(lines[i]);
                        }
                    }
                };
                GFXChannelDeserializer.prototype._writeLineMetrics = function (line) {
                    release || assert(this.output);
                    this.output.writeInt(line.x);
                    this.output.writeInt(line.width);
                    this.output.writeInt(line.ascent);
                    this.output.writeInt(line.descent);
                    this.output.writeInt(line.leading);
                };
                GFXChannelDeserializer.prototype._readUpdateStage = function () {
                    var context = this.context;
                    var id = this.input.readInt();
                    if (!context._nodes[id]) {
                        context._nodes[id] = context.stage.content;
                    }
                    var color = this.input.readInt();
                    var bounds = this._readRectangle();
                    // TODO: Need to updateContentMatrix on stage here.
                    context.stage.content.setBounds(bounds);
                    context.stage.color = Shumway.Color.FromARGB(color);
                    context.stage.align = this.input.readInt();
                    context.stage.scaleMode = this.input.readInt();
                    var displayState = this.input.readInt();
                    context._easelHost.fullscreen = displayState === 0 || displayState === 1;
                };
                GFXChannelDeserializer.prototype._readUpdateCurrentMouseTarget = function () {
                    var context = this.context;
                    var currentMouseTarget = this.input.readInt();
                    var cursor = this.input.readInt();
                    context._easelHost.cursor = Shumway.UI.toCSSCursor(cursor);
                };
                GFXChannelDeserializer.prototype._readUpdateNetStream = function () {
                    var context = this.context;
                    var id = this.input.readInt();
                    var asset = context._getVideoAsset(id);
                    var rectangle = this._readRectangle();
                    if (!asset) {
                        context.registerVideo(id);
                        asset = context._getVideoAsset(id);
                    }
                    asset.setBounds(rectangle);
                };
                GFXChannelDeserializer.prototype._readFilters = function (node) {
                    var input = this.input;
                    var count = input.readInt();
                    var filters = [];
                    if (count) {
                        for (var i = 0; i < count; i++) {
                            var type = input.readInt();
                            switch (type) {
                            case Remoting.FilterType.Blur:
                                filters.push(new BlurFilter(input.readFloat(), input.readFloat(), input.readInt()    // quality
));
                                break;
                            case Remoting.FilterType.DropShadow:
                                filters.push(new DropshadowFilter(input.readFloat(), input.readFloat(), input.readFloat(), input.readFloat(), input.readInt(), input.readFloat(), input.readBoolean(), input.readBoolean(), input.readBoolean(), input.readInt(), input.readFloat()    // strength
));
                                break;
                            case Remoting.FilterType.ColorMatrix:
                                var matrix = new Float32Array(20);
                                matrix[0] = input.readFloat();
                                matrix[4] = input.readFloat();
                                matrix[8] = input.readFloat();
                                matrix[12] = input.readFloat();
                                matrix[16] = input.readFloat() / 255;
                                matrix[1] = input.readFloat();
                                matrix[5] = input.readFloat();
                                matrix[9] = input.readFloat();
                                matrix[13] = input.readFloat();
                                matrix[17] = input.readFloat() / 255;
                                ;
                                matrix[2] = input.readFloat();
                                matrix[6] = input.readFloat();
                                matrix[10] = input.readFloat();
                                matrix[14] = input.readFloat();
                                matrix[18] = input.readFloat() / 255;
                                ;
                                matrix[3] = input.readFloat();
                                matrix[7] = input.readFloat();
                                matrix[11] = input.readFloat();
                                matrix[15] = input.readFloat();
                                matrix[19] = input.readFloat() / 255;
                                filters.push(new ColorMatrix(matrix));
                                break;
                            default:
                                Shumway.Debug.somewhatImplemented(Remoting.FilterType[type]);
                                break;
                            }
                        }
                        node.getLayer().filters = filters;
                    }
                };
                GFXChannelDeserializer.prototype._readUpdateFrame = function () {
                    var input = this.input;
                    var context = this.context;
                    var id = input.readInt();
                    var ratio = 0;
                    writer && writer.writeLn('Receiving UpdateFrame: ' + id);
                    var node = context._nodes[id];
                    if (!node) {
                        node = context._nodes[id] = new Group();
                    }
                    var hasBits = input.readInt();
                    if (hasBits & 1    /* HasMatrix */) {
                        node.getTransform().setMatrix(this._readMatrix());
                    }
                    if (hasBits & 8    /* HasColorTransform */) {
                        node.getTransform().setColorMatrix(this._readColorMatrix());
                    }
                    if (hasBits & 64    /* HasMask */) {
                        var maskId = input.readInt();
                        node.getLayer().mask = maskId >= 0 ? context._makeNode(maskId) : null;
                    }
                    if (hasBits & 128    /* HasClip */) {
                        node.clip = input.readInt();
                    }
                    if (hasBits & 32    /* HasMiscellaneousProperties */) {
                        ratio = input.readInt() / 65535;
                        release || assert(ratio >= 0 && ratio <= 1);
                        node.getLayer().blendMode = input.readInt();
                        this._readFilters(node);
                        node.toggleFlags(1    /* Visible */, input.readBoolean());
                        node.toggleFlags(16    /* CacheAsBitmap */, input.readBoolean());
                        node.toggleFlags(32    /* PixelSnapping */, !!input.readInt());
                        // TODO: support `auto`.
                        node.toggleFlags(64    /* ImageSmoothing */, !!input.readInt());
                    }
                    if (hasBits & 4    /* HasChildren */) {
                        var count = input.readInt();
                        var container = node;
                        container.clearChildren();
                        for (var i = 0; i < count; i++) {
                            var childId = input.readInt();
                            var child = context._makeNode(childId);
                            release || assert(child, 'Child ' + childId + ' of ' + id + ' has not been sent yet.');
                            container.addChild(child);
                        }
                    }
                    if (ratio) {
                        var group = node;
                        var child = group.getChildren()[0];
                        if (child instanceof Shape) {
                            child.ratio = ratio;
                        }
                    }
                };
                GFXChannelDeserializer.prototype._readDrawToBitmap = function () {
                    var input = this.input;
                    var context = this.context;
                    var targetId = input.readInt();
                    var sourceId = input.readInt();
                    var hasBits = input.readInt();
                    var matrix;
                    var colorMatrix;
                    var clipRect;
                    if (hasBits & 1    /* HasMatrix */) {
                        matrix = this._readMatrix().clone();
                    } else {
                        matrix = Matrix.createIdentity();
                    }
                    if (hasBits & 8    /* HasColorTransform */) {
                        colorMatrix = this._readColorMatrix();
                    }
                    if (hasBits & 16    /* HasClipRect */) {
                        clipRect = this._readRectangle();
                    }
                    var blendMode = input.readInt();
                    input.readBoolean();
                    // Smoothing
                    var target = context._getBitmapAsset(targetId);
                    var source = context._makeNode(sourceId);
                    if (!target) {
                        context._registerAsset(targetId, -1, RenderableBitmap.FromNode(source, matrix, colorMatrix, blendMode, clipRect));
                    } else {
                        target.drawNode(source, matrix, colorMatrix, blendMode, clipRect);
                    }
                };
                GFXChannelDeserializer.prototype._readRequestBitmapData = function () {
                    var input = this.input;
                    var output = this.output;
                    var context = this.context;
                    var id = input.readInt();
                    var renderableBitmap = context._getBitmapAsset(id);
                    renderableBitmap.readImageData(output);
                };
                /**
                 * Used to avoid extra allocation, don't ever leak a reference to this object.
                 */
                GFXChannelDeserializer._temporaryReadMatrix = Matrix.createIdentity();
                /**
                 * Used to avoid extra allocation, don't ever leak a reference to this object.
                 */
                GFXChannelDeserializer._temporaryReadRectangle = Rectangle.createEmpty();
                /**
                 * Used to avoid extra allocation, don't ever leak a reference to this object.
                 */
                GFXChannelDeserializer._temporaryReadColorMatrix = ColorMatrix.createIdentity();
                GFXChannelDeserializer._temporaryReadColorMatrixIdentity = ColorMatrix.createIdentity();
                return GFXChannelDeserializer;
            }();
            GFX.GFXChannelDeserializer = GFXChannelDeserializer;
        }(GFX = Remoting.GFX || (Remoting.GFX = {})));
    }(Remoting = Shumway.Remoting || (Shumway.Remoting = {})));
    var GFX;
    (function (GFX) {
        var Point = Shumway.GFX.Geometry.Point;
        var DataBuffer = Shumway.ArrayUtilities.DataBuffer;
        // Set to -1 to enable events for right button.
        GFX.ContextMenuButton = 2;
        var EaselHost = function () {
            function EaselHost(easel) {
                this._easel = easel;
                var group = easel.world;
                var transparent = easel.transparent;
                this._group = group;
                this._content = null;
                this._fullscreen = false;
                this._context = new Shumway.Remoting.GFX.GFXChannelDeserializerContext(this, this._group, transparent);
                this._addEventListeners();
                Shumway.registerFallbackFont();
            }
            EaselHost.prototype.onSendUpdates = function (update, asssets) {
                throw new Error('This method is abstract');
            };
            Object.defineProperty(EaselHost.prototype, 'easel', {
                get: function () {
                    return this._easel;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(EaselHost.prototype, 'stage', {
                get: function () {
                    return this._easel.stage;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(EaselHost.prototype, 'content', {
                set: function (value) {
                    this._content = value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(EaselHost.prototype, 'cursor', {
                set: function (cursor) {
                    this._easel.cursor = cursor;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(EaselHost.prototype, 'fullscreen', {
                set: function (value) {
                    if (this._fullscreen !== value) {
                        this._fullscreen = value;
                        // TODO refactor to have a normal two-way communication service/api
                        // HACK for now
                        if (typeof ShumwayCom !== 'undefined' && ShumwayCom.setFullscreen) {
                            ShumwayCom.setFullscreen(value);
                        }
                    }
                },
                enumerable: true,
                configurable: true
            });
            EaselHost.prototype._mouseEventListener = function (event) {
                if (event.button === GFX.ContextMenuButton) {
                    // Disable all events for right button -- usually it triggers context menu.
                    return;
                }
                // var position = this._easel.getMouseWorldPosition(event);
                var position = this._easel.getMousePosition(event, this._content);
                var point = new Point(position.x, position.y);
                var buffer = new DataBuffer();
                var serializer = new Shumway.Remoting.GFX.GFXChannelSerializer();
                serializer.output = buffer;
                serializer.writeMouseEvent(event, point);
                this.onSendUpdates(buffer, []);
            };
            EaselHost.prototype._keyboardEventListener = function (event) {
                var buffer = new DataBuffer();
                var serializer = new Shumway.Remoting.GFX.GFXChannelSerializer();
                serializer.output = buffer;
                serializer.writeKeyboardEvent(event);
                this.onSendUpdates(buffer, []);
            };
            EaselHost.prototype._addEventListeners = function () {
                var mouseEventListener = this._mouseEventListener.bind(this);
                var keyboardEventListener = this._keyboardEventListener.bind(this);
                var mouseEvents = EaselHost._mouseEvents;
                for (var i = 0; i < mouseEvents.length; i++) {
                    window.addEventListener(mouseEvents[i], mouseEventListener);
                }
                var keyboardEvents = EaselHost._keyboardEvents;
                for (var i = 0; i < keyboardEvents.length; i++) {
                    window.addEventListener(keyboardEvents[i], keyboardEventListener);
                }
                this._addFocusEventListeners();
                this._easel.addEventListener('resize', this._resizeEventListener.bind(this));
            };
            EaselHost.prototype._sendFocusEvent = function (type) {
                var buffer = new DataBuffer();
                var serializer = new Shumway.Remoting.GFX.GFXChannelSerializer();
                serializer.output = buffer;
                serializer.writeFocusEvent(type);
                this.onSendUpdates(buffer, []);
            };
            EaselHost.prototype._addFocusEventListeners = function () {
                var self = this;
                document.addEventListener('visibilitychange', function (event) {
                    self._sendFocusEvent(document.hidden ? 0    /* DocumentHidden */ : 1    /* DocumentVisible */);
                });
                window.addEventListener('focus', function (event) {
                    self._sendFocusEvent(3    /* WindowFocus */);
                });
                window.addEventListener('blur', function (event) {
                    self._sendFocusEvent(2    /* WindowBlur */);
                });
            };
            EaselHost.prototype._resizeEventListener = function () {
                this.onDisplayParameters(this._easel.getDisplayParameters());
            };
            EaselHost.prototype.onDisplayParameters = function (params) {
                throw new Error('This method is abstract');
            };
            EaselHost.prototype.processUpdates = function (updates, assets, output) {
                if (output === void 0) {
                    output = null;
                }
                var deserializer = new Shumway.Remoting.GFX.GFXChannelDeserializer();
                deserializer.input = updates;
                deserializer.inputAssets = assets;
                deserializer.output = output;
                deserializer.context = this._context;
                deserializer.read();
            };
            EaselHost.prototype.processVideoControl = function (id, eventType, data) {
                var context = this._context;
                var asset = context._getVideoAsset(id);
                if (!asset) {
                    if (eventType !== 1    /* Init */) {
                        return undefined;
                    }
                    context.registerVideo(id);
                    asset = context._getVideoAsset(id);
                }
                return asset.processControlRequest(eventType, data);
            };
            EaselHost.prototype.processRegisterFont = function (syncId, data, resolve) {
                this._context.registerFont(syncId, data, resolve);
            };
            EaselHost.prototype.processRegisterImage = function (syncId, symbolId, imageType, data, alphaData, resolve) {
                this._context.registerImage(syncId, symbolId, imageType, data, alphaData, resolve);
            };
            EaselHost.prototype.processFSCommand = function (command, args) {
                if (typeof ShumwayCom !== 'undefined' && ShumwayCom.environment === ShumwayEnvironment.TEST) {
                    ShumwayCom.processFSCommand(command, args);
                }
            };
            EaselHost.prototype.processFrame = function () {
                if (typeof ShumwayCom !== 'undefined' && ShumwayCom.environment === ShumwayEnvironment.TEST) {
                    ShumwayCom.processFrame();
                }
            };
            EaselHost.prototype.onVideoPlaybackEvent = function (id, eventType, data) {
                throw new Error('This method is abstract');
            };
            EaselHost.prototype.sendVideoPlaybackEvent = function (id, eventType, data) {
                this.onVideoPlaybackEvent(id, eventType, data);
            };
            EaselHost._mouseEvents = Shumway.Remoting.MouseEventNames;
            EaselHost._keyboardEvents = Shumway.Remoting.KeyboardEventNames;
            return EaselHost;
        }();
        GFX.EaselHost = EaselHost;
        var Window;
        (function (Window) {
            var DataBuffer = Shumway.ArrayUtilities.DataBuffer;
            var WindowEaselHost = function (_super) {
                __extends(WindowEaselHost, _super);
                function WindowEaselHost(easel, peer) {
                    _super.call(this, easel);
                    this._peer = peer;
                    this._peer.onSyncMessage = function (msg) {
                        return this._onWindowMessage(msg, false);
                    }.bind(this);
                    this._peer.onAsyncMessage = function (msg) {
                        this._onWindowMessage(msg, true);
                    }.bind(this);
                }
                WindowEaselHost.prototype.onSendUpdates = function (updates, assets) {
                    var bytes = updates.getBytes();
                    this._peer.postAsyncMessage({
                        type: 'gfx',
                        updates: bytes,
                        assets: assets
                    }, [bytes.buffer]);
                };
                WindowEaselHost.prototype.onDisplayParameters = function (params) {
                    this._peer.postAsyncMessage({
                        type: 'displayParameters',
                        params: params
                    });
                };
                WindowEaselHost.prototype.onVideoPlaybackEvent = function (id, eventType, data) {
                    this._peer.postAsyncMessage({
                        type: 'videoPlayback',
                        id: id,
                        eventType: eventType,
                        data: data
                    });
                };
                WindowEaselHost.prototype._sendRegisterFontResponse = function (requestId, result) {
                    this._peer.postAsyncMessage({
                        type: 'registerFontResponse',
                        requestId: requestId,
                        result: result
                    });
                };
                WindowEaselHost.prototype._sendRegisterImageResponse = function (requestId, result) {
                    this._peer.postAsyncMessage({
                        type: 'registerImageResponse',
                        requestId: requestId,
                        result: result
                    });
                };
                WindowEaselHost.prototype._onWindowMessage = function (data, async) {
                    var result;
                    if (typeof data === 'object' && data !== null) {
                        if (data.type === 'player') {
                            var updates = DataBuffer.FromArrayBuffer(data.updates.buffer);
                            if (async) {
                                this.processUpdates(updates, data.assets);
                            } else {
                                var output = new DataBuffer();
                                this.processUpdates(updates, data.assets, output);
                                result = output.toPlainObject();
                            }
                        } else if (data.type === 'frame') {
                            this.processFrame();
                        } else if (data.type === 'videoControl') {
                            result = this.processVideoControl(data.id, data.eventType, data.data);
                        } else if (data.type === 'registerFont') {
                            this.processRegisterFont(data.syncId, data.data, this._sendRegisterFontResponse.bind(this, data.requestId));
                        } else if (data.type === 'registerImage') {
                            this.processRegisterImage(data.syncId, data.symbolId, data.imageType, data.data, data.alphaData, this._sendRegisterImageResponse.bind(this, data.requestId));
                        } else if (data.type === 'fscommand') {
                            this.processFSCommand(data.command, data.args);
                        } else {
                        }
                    }
                    return result;
                };
                return WindowEaselHost;
            }(GFX.EaselHost);
            Window.WindowEaselHost = WindowEaselHost;
        }(Window = GFX.Window || (GFX.Window = {})));
        var Test;
        (function (Test) {
            var DataBuffer = Shumway.ArrayUtilities.DataBuffer;
            var PlainObjectDataBuffer = Shumway.ArrayUtilities.PlainObjectDataBuffer;
            var MovieRecordObjectType;
            (function (MovieRecordObjectType) {
                MovieRecordObjectType[MovieRecordObjectType['Undefined'] = 0] = 'Undefined';
                MovieRecordObjectType[MovieRecordObjectType['Null'] = 1] = 'Null';
                MovieRecordObjectType[MovieRecordObjectType['True'] = 2] = 'True';
                MovieRecordObjectType[MovieRecordObjectType['False'] = 3] = 'False';
                MovieRecordObjectType[MovieRecordObjectType['Number'] = 4] = 'Number';
                MovieRecordObjectType[MovieRecordObjectType['String'] = 5] = 'String';
                MovieRecordObjectType[MovieRecordObjectType['Array'] = 6] = 'Array';
                MovieRecordObjectType[MovieRecordObjectType['Object'] = 7] = 'Object';
                MovieRecordObjectType[MovieRecordObjectType['ArrayBuffer'] = 8] = 'ArrayBuffer';
                MovieRecordObjectType[MovieRecordObjectType['Uint8Array'] = 9] = 'Uint8Array';
                MovieRecordObjectType[MovieRecordObjectType['PlainObjectDataBufferLE'] = 10] = 'PlainObjectDataBufferLE';
                MovieRecordObjectType[MovieRecordObjectType['PlainObjectDataBufferBE'] = 11] = 'PlainObjectDataBufferBE';
                MovieRecordObjectType[MovieRecordObjectType['Int32Array'] = 12] = 'Int32Array';
            }(MovieRecordObjectType || (MovieRecordObjectType = {})));
            function writeUint8Array(buffer, data) {
                buffer.writeInt(data.length);
                buffer.writeRawBytes(data);
            }
            // Borrowed from other frame typed arrays does not match current global
            // objects, so instanceof does not work.
            function isInstanceOfTypedArray(obj, name) {
                return 'byteLength' in obj && 'buffer' in obj && (obj.constructor && obj.constructor.name) === name;
            }
            function isInstanceOfArrayBuffer(obj) {
                return 'byteLength' in obj && (obj.constructor && obj.constructor.name) === 'ArrayBuffer';
            }
            function serializeObj(obj) {
                function serialize(item) {
                    switch (typeof item) {
                    case 'undefined':
                        buffer.writeByte(MovieRecordObjectType.Undefined);
                        break;
                    case 'boolean':
                        buffer.writeByte(item ? MovieRecordObjectType.True : MovieRecordObjectType.False);
                        break;
                    case 'number':
                        buffer.writeByte(MovieRecordObjectType.Number);
                        buffer.writeDouble(item);
                        break;
                    case 'string':
                        buffer.writeByte(MovieRecordObjectType.String);
                        buffer.writeUTF(item);
                        break;
                    default:
                        if (item === null) {
                            buffer.writeByte(MovieRecordObjectType.Null);
                            break;
                        }
                        if (Array.isArray(item)) {
                            buffer.writeByte(MovieRecordObjectType.Array);
                            buffer.writeInt(item.length);
                            for (var i = 0; i < item.length; i++) {
                                serialize(item[i]);
                            }
                        } else if (isInstanceOfTypedArray(item, 'Uint8Array')) {
                            buffer.writeByte(MovieRecordObjectType.Uint8Array);
                            writeUint8Array(buffer, item);
                        } else if ('length' in item && 'buffer' in item && 'littleEndian' in item) {
                            buffer.writeByte(item.littleEndian ? MovieRecordObjectType.PlainObjectDataBufferLE : MovieRecordObjectType.PlainObjectDataBufferBE);
                            writeUint8Array(buffer, new Uint8Array(item.buffer, 0, item.length));
                        } else if (isInstanceOfArrayBuffer(item)) {
                            buffer.writeByte(MovieRecordObjectType.ArrayBuffer);
                            writeUint8Array(buffer, new Uint8Array(item));
                        } else if (isInstanceOfTypedArray(item, 'Int32Array')) {
                            buffer.writeByte(MovieRecordObjectType.Int32Array);
                            writeUint8Array(buffer, new Uint8Array(item.buffer, item.byteOffset, item.byteLength));
                        } else {
                            if (!Shumway.isNullOrUndefined(item.buffer) && isInstanceOfArrayBuffer(item.buffer) && typeof item.byteOffset === 'number') {
                                throw new Error('Some unsupported TypedArray is used');
                            }
                            buffer.writeByte(MovieRecordObjectType.Object);
                            for (var key in item) {
                                buffer.writeUTF(key);
                                serialize(item[key]);
                            }
                            buffer.writeUTF('');
                        }
                        break;
                    }
                }
                var buffer = new DataBuffer();
                serialize(obj);
                return buffer.getBytes();
            }
            var MovieRecorder = function () {
                function MovieRecorder(maxRecordingSize) {
                    this._maxRecordingSize = maxRecordingSize;
                    this._recording = new DataBuffer();
                    this._recordingStarted = 0;
                    this._recording.writeRawBytes(new Uint8Array([
                        77,
                        83,
                        87,
                        70
                    ]));
                    this._stopped = false;
                }
                MovieRecorder.prototype.stop = function () {
                    this._stopped = true;
                };
                MovieRecorder.prototype.getRecording = function () {
                    return new Blob([this._recording.getBytes()], { type: 'application/octet-stream' });
                };
                MovieRecorder.prototype.dump = function () {
                    var parser = new MovieRecordParser(this._recording.getBytes());
                    parser.dump();
                };
                MovieRecorder.prototype._createRecord = function (type, buffer) {
                    if (this._stopped) {
                        return;
                    }
                    if (this._recording.length + 8 + (buffer ? buffer.length : 0) >= this._maxRecordingSize) {
                        console.error('Recording limit reached');
                        this._stopped = true;
                        return;
                    }
                    if (this._recordingStarted === 0) {
                        this._recordingStarted = Date.now();
                        this._recording.writeInt(0);
                    } else {
                        this._recording.writeInt(Date.now() - this._recordingStarted);
                    }
                    this._recording.writeInt(type);
                    if (buffer !== null) {
                        this._recording.writeInt(buffer.length);
                        this._recording.writeRawBytes(buffer.getBytes());
                    } else {
                        this._recording.writeInt(0);
                    }
                };
                MovieRecorder.prototype.recordPlayerCommand = function (async, updates, assets) {
                    var buffer = new DataBuffer();
                    writeUint8Array(buffer, updates);
                    buffer.writeInt(assets.length);
                    assets.forEach(function (a) {
                        var data = serializeObj(a);
                        writeUint8Array(buffer, data);
                    });
                    this._createRecord(async ? 2    /* PlayerCommandAsync */ : 1    /* PlayerCommand */, buffer);
                };
                MovieRecorder.prototype.recordFrame = function () {
                    this._createRecord(3    /* Frame */, null);
                };
                MovieRecorder.prototype.recordFont = function (syncId, data) {
                    var buffer = new DataBuffer();
                    buffer.writeInt(syncId);
                    writeUint8Array(buffer, serializeObj(data));
                    this._createRecord(4    /* Font */, buffer);
                };
                MovieRecorder.prototype.recordImage = function (syncId, symbolId, imageType, data, alphaData) {
                    var buffer = new DataBuffer();
                    buffer.writeInt(syncId);
                    buffer.writeInt(symbolId);
                    buffer.writeInt(imageType);
                    writeUint8Array(buffer, serializeObj(data));
                    writeUint8Array(buffer, serializeObj(alphaData));
                    this._createRecord(5    /* Image */, buffer);
                };
                MovieRecorder.prototype.recordFSCommand = function (command, args) {
                    var buffer = new DataBuffer();
                    buffer.writeUTF(command);
                    buffer.writeUTF(args || '');
                    this._createRecord(6    /* FSCommand */, buffer);
                };
                return MovieRecorder;
            }();
            Test.MovieRecorder = MovieRecorder;
            function readUint8Array(buffer) {
                var data = new DataBuffer();
                var length = buffer.readInt();
                buffer.readBytes(data, 0, length);
                return data.getBytes();
            }
            function deserializeObj(source) {
                var buffer = new DataBuffer();
                var length = source.readInt();
                source.readBytes(buffer, 0, length);
                return deserializeObjImpl(buffer);
            }
            function deserializeObjImpl(buffer) {
                var type = buffer.readByte();
                switch (type) {
                case MovieRecordObjectType.Undefined:
                    return undefined;
                case MovieRecordObjectType.Null:
                    return null;
                case MovieRecordObjectType.True:
                    return true;
                case MovieRecordObjectType.False:
                    return false;
                case MovieRecordObjectType.Number:
                    return buffer.readDouble();
                case MovieRecordObjectType.String:
                    return buffer.readUTF();
                case MovieRecordObjectType.Array:
                    var arr = [];
                    var length = buffer.readInt();
                    for (var i = 0; i < length; i++) {
                        arr[i] = deserializeObjImpl(buffer);
                    }
                    return arr;
                case MovieRecordObjectType.Object:
                    var obj = {};
                    var key;
                    while (key = buffer.readUTF()) {
                        obj[key] = deserializeObjImpl(buffer);
                    }
                    return obj;
                case MovieRecordObjectType.ArrayBuffer:
                    return readUint8Array(buffer).buffer;
                case MovieRecordObjectType.Uint8Array:
                    return readUint8Array(buffer);
                case MovieRecordObjectType.PlainObjectDataBufferBE:
                case MovieRecordObjectType.PlainObjectDataBufferLE:
                    var data = readUint8Array(buffer);
                    return new PlainObjectDataBuffer(data.buffer, data.length, type === MovieRecordObjectType.PlainObjectDataBufferLE);
                case MovieRecordObjectType.Int32Array:
                    return new Int32Array(readUint8Array(buffer).buffer);
                default:
                    release || Shumway.Debug.assert(false);
                    break;
                }
            }
            var MovieRecordParser = function () {
                function MovieRecordParser(data) {
                    this._buffer = new DataBuffer();
                    this._buffer.writeRawBytes(data);
                    this._buffer.position = 4;
                }
                MovieRecordParser.prototype.readNextRecord = function () {
                    if (this._buffer.position >= this._buffer.length) {
                        return 0    /* None */;
                    }
                    var timestamp = this._buffer.readInt();
                    var type = this._buffer.readInt();
                    var length = this._buffer.readInt();
                    var data = null;
                    if (length > 0) {
                        data = new DataBuffer();
                        this._buffer.readBytes(data, 0, length);
                    }
                    this.currentTimestamp = timestamp;
                    this.currentType = type;
                    this.currentData = data;
                    return type;
                };
                MovieRecordParser.prototype.parsePlayerCommand = function () {
                    var updates = readUint8Array(this.currentData);
                    var assetsLength = this.currentData.readInt();
                    var assets = [];
                    for (var i = 0; i < assetsLength; i++) {
                        assets.push(deserializeObj(this.currentData));
                    }
                    return {
                        updates: updates,
                        assets: assets
                    };
                };
                MovieRecordParser.prototype.parseFSCommand = function () {
                    var command = this.currentData.readUTF();
                    var args = this.currentData.readUTF();
                    return {
                        command: command,
                        args: args
                    };
                };
                MovieRecordParser.prototype.parseFont = function () {
                    var syncId = this.currentData.readInt();
                    var data = deserializeObj(this.currentData);
                    return {
                        syncId: syncId,
                        data: data
                    };
                };
                MovieRecordParser.prototype.parseImage = function () {
                    var syncId = this.currentData.readInt();
                    var symbolId = this.currentData.readInt();
                    var imageType = this.currentData.readInt();
                    var data = deserializeObj(this.currentData);
                    var alphaData = deserializeObj(this.currentData);
                    return {
                        syncId: syncId,
                        symbolId: symbolId,
                        imageType: imageType,
                        data: data,
                        alphaData: alphaData
                    };
                };
                MovieRecordParser.prototype.dump = function () {
                    var type;
                    while (type = this.readNextRecord()) {
                        console.log('record ' + type + ' @' + this.currentTimestamp);
                        switch (type) {
                        case 1    /* PlayerCommand */:
                        case 2    /* PlayerCommandAsync */:
                            console.log(this.parsePlayerCommand());
                            break;
                        case 6    /* FSCommand */:
                            console.log(this.parseFSCommand());
                            break;
                        case 4    /* Font */:
                            console.log(this.parseFont());
                            break;
                        case 5    /* Image */:
                            console.log(this.parseImage());
                            break;
                        }
                    }
                };
                return MovieRecordParser;
            }();
            Test.MovieRecordParser = MovieRecordParser;
            var DataBuffer = Shumway.ArrayUtilities.DataBuffer;
            var MINIMAL_TIMER_INTERVAL = 5;
            var PlaybackEaselHost = function (_super) {
                __extends(PlaybackEaselHost, _super);
                function PlaybackEaselHost(easel) {
                    _super.call(this, easel);
                    this.ignoreTimestamps = false;
                    this.alwaysRenderFrame = false;
                    this.cpuTimeUpdates = 0;
                    this.cpuTimeRendering = 0;
                    this.onComplete = null;
                }
                Object.defineProperty(PlaybackEaselHost.prototype, 'cpuTime', {
                    get: function () {
                        return this.cpuTimeUpdates + this.cpuTimeRendering;
                    },
                    enumerable: true,
                    configurable: true
                });
                PlaybackEaselHost.prototype.playUrl = function (url) {
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', url, true);
                    xhr.responseType = 'arraybuffer';
                    xhr.onload = function () {
                        this.playBytes(new Uint8Array(xhr.response));
                    }.bind(this);
                    xhr.send();
                };
                PlaybackEaselHost.prototype.playBytes = function (data) {
                    this._parser = new Test.MovieRecordParser(data);
                    this._lastTimestamp = 0;
                    this._parseNext();
                };
                PlaybackEaselHost.prototype.onSendUpdates = function (updates, assets) {
                };
                PlaybackEaselHost.prototype.onDisplayParameters = function (params) {
                };
                PlaybackEaselHost.prototype.onVideoPlaybackEvent = function (id, eventType, data) {
                };
                PlaybackEaselHost.prototype._parseNext = function () {
                    var type = this._parser.readNextRecord();
                    if (type !== 0    /* None */) {
                        var runRecordBound = this._runRecord.bind(this);
                        var interval = this._parser.currentTimestamp - this._lastTimestamp;
                        this._lastTimestamp = this._parser.currentTimestamp;
                        if (interval < MINIMAL_TIMER_INTERVAL) {
                            // Records are too close to each other, running on next script turn.
                            Promise.resolve(undefined).then(runRecordBound);
                        } else if (this.ignoreTimestamps) {
                            setTimeout(runRecordBound);
                        } else {
                            setTimeout(runRecordBound, interval);
                        }
                    } else {
                        if (this.onComplete) {
                            this.onComplete();
                        }
                    }
                };
                PlaybackEaselHost.prototype._runRecord = function () {
                    var data;
                    var start = performance.now();
                    switch (this._parser.currentType) {
                    case 1    /* PlayerCommand */:
                    case 2    /* PlayerCommandAsync */:
                        data = this._parser.parsePlayerCommand();
                        var async = this._parser.currentType === 2    /* PlayerCommandAsync */;
                        var updates = DataBuffer.FromArrayBuffer(data.updates.buffer);
                        if (async) {
                            this.processUpdates(updates, data.assets);
                        } else {
                            var output = new DataBuffer();
                            this.processUpdates(updates, data.assets, output);
                        }
                        break;
                    case 3    /* Frame */:
                        this.processFrame();
                        break;
                    case 4    /* Font */:
                        data = this._parser.parseFont();
                        this.processRegisterFont(data.syncId, data.data, function () {
                        });
                        break;
                    case 5    /* Image */:
                        data = this._parser.parseImage();
                        this.processRegisterImage(data.syncId, data.symbolId, data.imageType, data.data, data.alphaData, function () {
                        });
                        break;
                    case 6    /* FSCommand */:
                        data = this._parser.parseFSCommand();
                        this.processFSCommand(data.command, data.args);
                        break;
                    default:
                        throw new Error('Invalid movie record type');
                    }
                    this.cpuTimeUpdates += performance.now() - start;
                    if (this._parser.currentType === 3    /* Frame */ && this.alwaysRenderFrame) {
                        requestAnimationFrame(this._renderFrameJustAfterRAF.bind(this));
                    } else {
                        this._parseNext();
                    }
                };
                PlaybackEaselHost.prototype._renderFrameJustAfterRAF = function () {
                    var start = performance.now();
                    this.easel.render();
                    this.cpuTimeRendering += performance.now() - start;
                    this._parseNext();
                };
                return PlaybackEaselHost;
            }(GFX.EaselHost);
            Test.PlaybackEaselHost = PlaybackEaselHost;
            var WindowEaselHost = Shumway.GFX.Window.WindowEaselHost;
            var RecordingEaselHost = function (_super) {
                __extends(RecordingEaselHost, _super);
                function RecordingEaselHost(easel, peer, recordingLimit) {
                    if (recordingLimit === void 0) {
                        recordingLimit = 0;
                    }
                    _super.call(this, easel, peer);
                    this._recorder = null;
                    this._recorder = new Test.MovieRecorder(recordingLimit);
                }
                Object.defineProperty(RecordingEaselHost.prototype, 'recorder', {
                    get: function () {
                        return this._recorder;
                    },
                    enumerable: true,
                    configurable: true
                });
                RecordingEaselHost.prototype._onWindowMessage = function (data, async) {
                    release || Shumway.Debug.assert(typeof data === 'object' && data !== null);
                    var type = data.type;
                    switch (type) {
                    case 'player':
                        this._recorder.recordPlayerCommand(async, data.updates, data.assets);
                        break;
                    case 'frame':
                        this._recorder.recordFrame();
                        break;
                    case 'registerFont':
                        this._recorder.recordFont(data.syncId, data.data);
                        break;
                    case 'registerImage':
                        this._recorder.recordImage(data.syncId, data.symbolId, data.imageType, data.data, data.alphaData);
                        break;
                    case 'fscommand':
                        this._recorder.recordFSCommand(data.command, data.args);
                        break;
                    }
                    return _super.prototype._onWindowMessage.call(this, data, async);
                };
                return RecordingEaselHost;
            }(WindowEaselHost);
            Test.RecordingEaselHost = RecordingEaselHost;
        }(Test = GFX.Test || (GFX.Test = {})));
    }(GFX = Shumway.GFX || (Shumway.GFX = {})));
}(Shumway || (Shumway = {})));
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
/// <reference path='../../build/ts/base.d.ts' />
/// <reference path='../../build/ts/tools.d.ts' />
/// <reference path='../../build/ts/gfx-base.d.ts' />
/// <reference path='2d/debug.ts'/>
/// <reference path='2d/surface.ts'/>
/// <reference path='2d/2d.ts'/>
/// <reference path='easel.ts'/>
/// <reference path='debug/tree.ts'/>
/// <reference path='remotingGfx.ts' />
/// <reference path='easelHost.ts' />
/// <reference path='window/windowEaselHost.ts' />
/// <reference path='test/recorder.ts' />
/// <reference path='test/playbackEaselHost.ts' />
/// <reference path='test/recordingEaselHost.ts' />
//# sourceMappingURL=gfx.js.map
console.timeEnd('Load GFX Dependencies');