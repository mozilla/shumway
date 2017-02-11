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
var jsGlobal = (function () { return this || (1, eval)('this//# sourceURL=jsGlobal-getter'); })();
// Our polyfills for some DOM things make testing this slightly more onerous than it ought to be.
var inBrowser = typeof window !== 'undefined' && 'document' in window && 'plugins' in window.document;
var inFirefox = typeof navigator !== 'undefined' && navigator.userAgent.indexOf('Firefox') >= 0;
// declare var print;
// declare var console;
// declare var performance;
// declare var XMLHttpRequest;
// declare var document;
// declare var getComputedStyle;
/** @define {boolean} */ var release = false;
/** @define {boolean} */ var profile = false;
function dumpLine(line) {
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
var START_TIME = performance.now();
var Shumway;
(function (Shumway) {
    /**
     * The buffer length required to contain any unsigned 32-bit integer.
     */
    /** @const */ Shumway.UINT32_CHAR_BUFFER_LENGTH = 10; // "4294967295".length;
    /** @const */ Shumway.UINT32_MAX = 0xFFFFFFFF;
    /** @const */ Shumway.UINT32_MAX_DIV_10 = 0x19999999; // UINT32_MAX / 10;
    /** @const */ Shumway.UINT32_MAX_MOD_10 = 0x5; // UINT32_MAX % 10
    function isString(value) {
        return typeof value === "string";
    }
    Shumway.isString = isString;
    function isFunction(value) {
        return typeof value === "function";
    }
    Shumway.isFunction = isFunction;
    function isNumber(value) {
        return typeof value === "number";
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
        return typeof value === "number" || typeof value === "string";
    }
    Shumway.isNumberOrString = isNumberOrString;
    function isObject(value) {
        return typeof value === "object" || typeof value === 'function';
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
        if (typeof value === "number") {
            return true;
        }
        if (typeof value === "string") {
            // |value| is rarely numeric (it's usually an identifier), and the
            // isIndex()/isNumericString() pair is slow and expensive, so we do a
            // quick check for obvious non-numericalness first. Just checking if the
            // first char is a 7-bit identifier char catches most cases.
            var c = value.charCodeAt(0);
            if ((65 <= c && c <= 90) ||
                (97 <= c && c <= 122) ||
                (c === 36) ||
                (c === 95)) {
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
        if (length > Shumway.UINT32_CHAR_BUFFER_LENGTH) {
            return false;
        }
        var i = 0;
        index = value.charCodeAt(i++) - 48 /* _0 */;
        if (index < 1 || index > 9) {
            return false;
        }
        var oldIndex = 0;
        var c = 0;
        while (i < length) {
            c = value.charCodeAt(i++) - 48 /* _0 */;
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
        if ((oldIndex < Shumway.UINT32_MAX_DIV_10) || (oldIndex === Shumway.UINT32_MAX_DIV_10 && c <= Shumway.UINT32_MAX_MOD_10)) {
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
                }
                else if ('toString' in arg) {
                    argStr = arg.toString();
                }
                else {
                    argStr = Object.prototype.toString.call(arg);
                }
                resultList.push(argStr);
            }
            catch (e) {
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
            if (message === void 0) { message = "assertion failed"; }
            if (condition === "") {
                condition = true;
            }
            if (!condition) {
                if (typeof console !== 'undefined' && 'assert' in console) {
                    console.assert(false, message);
                    throw new Error(message);
                }
                else {
                    Debug.error(message.toString());
                }
            }
        }
        Debug.assert = assert;
        function assertUnreachable(msg) {
            var location = new Error().stack.split('\n')[1];
            throw new Error("Reached unreachable location " + location + msg);
        }
        Debug.assertUnreachable = assertUnreachable;
        function assertNotImplemented(condition, message) {
            if (!condition) {
                Debug.error("notImplemented: " + message);
            }
        }
        Debug.assertNotImplemented = assertNotImplemented;
        var _warnedCounts = Object.create(null);
        function warning(message, arg1, arg2 /*...messages: any[]*/) {
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
                list.push({ key: key, count: _warnedCounts[key] });
            }
            list.sort(function (entry, prev) { return prev.count - entry.count; });
            return list.reduce(function (result, entry) { return (result += '\n' + entry.count + '\t' + entry.key); }, '');
        }
        Debug.warnCounts = warnCounts;
        function notImplemented(message) {
            release || Debug.assert(false, "Not Implemented " + message);
        }
        Debug.notImplemented = notImplemented;
        function dummyConstructor(message) {
            release || Debug.assert(false, "Dummy Constructor: " + message);
        }
        Debug.dummyConstructor = dummyConstructor;
        function abstractMethod(message) {
            release || Debug.assert(false, "Abstract Method " + message);
        }
        Debug.abstractMethod = abstractMethod;
        var somewhatImplementedCache = {};
        function somewhatImplemented(message) {
            if (somewhatImplementedCache[message]) {
                return;
            }
            somewhatImplementedCache[message] = true;
            Debug.warning("somewhatImplemented: " + message);
        }
        Debug.somewhatImplemented = somewhatImplemented;
        function unexpected(message) {
            Debug.assert(false, "Unexpected: " + message);
        }
        Debug.unexpected = unexpected;
        function unexpectedCase(message) {
            Debug.assert(false, "Unexpected Case: " + message);
        }
        Debug.unexpectedCase = unexpectedCase;
    })(Debug = Shumway.Debug || (Shumway.Debug = {}));
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
            if (doffset === void 0) { doffset = 0; }
            if (soffset === void 0) { soffset = 0; }
            if (length === void 0) { length = 0; }
            if (soffset > 0 || (length > 0 && length < source.length)) {
                if (length <= 0) {
                    length = source.length - soffset;
                }
                destination.set(source.subarray(soffset, soffset + length), doffset);
            }
            else {
                destination.set(source, doffset);
            }
        }
        ArrayUtilities.memCopy = memCopy;
    })(ArrayUtilities = Shumway.ArrayUtilities || (Shumway.ArrayUtilities = {}));
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
                    array.push([k, object[k]]);
                }
            }
            return array;
        }
        ObjectUtilities.toKeyValueArray = toKeyValueArray;
        function isPrototypeWriteable(object) {
            return Object.getOwnPropertyDescriptor(object, "prototype").writable;
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
            if (filter === void 0) { filter = null; }
            if (overwrite === void 0) { overwrite = true; }
            if (makeWritable === void 0) { makeWritable = false; }
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
                    }
                    catch (e) {
                        Debug.assert("Can't define: " + property);
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
            Object.defineProperty(obj, name, { get: getter,
                configurable: true,
                enumerable: false
            });
        }
        ObjectUtilities.defineNonEnumerableGetter = defineNonEnumerableGetter;
        function defineNonEnumerableProperty(obj, name, value) {
            Object.defineProperty(obj, name, { value: value,
                writable: true,
                configurable: true,
                enumerable: false
            });
        }
        ObjectUtilities.defineNonEnumerableProperty = defineNonEnumerableProperty;
    })(ObjectUtilities = Shumway.ObjectUtilities || (Shumway.ObjectUtilities = {}));
    var FunctionUtilities;
    (function (FunctionUtilities) {
        function makeForwardingGetter(target) {
            return new Function("return this[\"" + target + "\"]//# sourceURL=fwd-get-" +
                target + ".as");
        }
        FunctionUtilities.makeForwardingGetter = makeForwardingGetter;
        function makeForwardingSetter(target) {
            return new Function("value", "this[\"" + target + "\"] = value;" +
                "//# sourceURL=fwd-set-" + target + ".as");
        }
        FunctionUtilities.makeForwardingSetter = makeForwardingSetter;
    })(FunctionUtilities = Shumway.FunctionUtilities || (Shumway.FunctionUtilities = {}));
    var StringUtilities;
    (function (StringUtilities) {
        var assert = Shumway.Debug.assert;
        function repeatString(c, n) {
            var s = "";
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
                return value + " B";
            }
            else if (value < M) {
                return (value / K).toFixed(2) + "KB";
            }
            else {
                return (value / M).toFixed(2) + "MB";
            }
        }
        StringUtilities.memorySizeToString = memorySizeToString;
        /**
         * Returns a reasonably sized description of the |value|, to be used for debugging purposes.
         */
        function toSafeString(value) {
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
        StringUtilities.toSafeString = toSafeString;
        function toSafeArrayString(array) {
            var str = [];
            for (var i = 0; i < array.length; i++) {
                str.push(toSafeString(array[i]));
            }
            return str.join(", ");
        }
        StringUtilities.toSafeArrayString = toSafeArrayString;
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
                }
                else if ((code & 0xFFFF0000) !== 0) {
                    bytes[b++] = 0xF0 | ((code >>> 18) & 0x07);
                    bytes[b++] = 0x80 | ((code >>> 12) & 0x3F);
                    bytes[b++] = 0x80 | ((code >>> 6) & 0x3F);
                    bytes[b++] = 0x80 | (code & 0x3F);
                }
                else if ((code & 0xFFFFF800) !== 0) {
                    bytes[b++] = 0xE0 | ((code >>> 12) & 0x0F);
                    bytes[b++] = 0x80 | ((code >>> 6) & 0x3F);
                    bytes[b++] = 0x80 | (code & 0x3F);
                }
                else {
                    bytes[b++] = 0xC0 | ((code >>> 6) & 0x1F);
                    bytes[b++] = 0x80 | (code & 0x3F);
                }
            }
            return bytes.subarray(0, b);
        }
        StringUtilities.utf8decode = utf8decode;
        function utf8encode(bytes) {
            var j = 0, str = "";
            while (j < bytes.length) {
                var b1 = bytes[j++] & 0xFF;
                if (b1 <= 0x7F) {
                    str += String.fromCharCode(b1);
                }
                else {
                    var currentPrefix = 0xC0;
                    var validBits = 5;
                    do {
                        var mask = (currentPrefix >> 1) | 0x80;
                        if ((b1 & mask) === currentPrefix)
                            break;
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
                    }
                    else {
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
                chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
                // Use bitmasks to extract 6-bit segments from the triplet
                a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
                b = (chunk & 258048) >> 12; // 258048 = (2^6 - 1) << 12
                c = (chunk & 4032) >> 6; // 4032 = (2^6 - 1) << 6
                d = chunk & 63; // 63 = 2^6 - 1
                // Convert the raw binary segments to the appropriate ASCII encoding
                base64 += concat4(encodings[a], encodings[b], encodings[c], encodings[d]);
            }
            // Deal with the remaining bytes and padding
            if (byteRemainder == 1) {
                chunk = bytes[mainLength];
                a = (chunk & 252) >> 2; // 252 = (2^6 - 1) << 2
                // Set the 4 least significant bits to zero
                b = (chunk & 3) << 4; // 3 = 2^2 - 1
                base64 += concat3(encodings[a], encodings[b], '==');
            }
            else if (byteRemainder == 2) {
                chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];
                a = (chunk & 64512) >> 10; // 64512 = (2^6 - 1) << 10
                b = (chunk & 1008) >> 4; // 1008 = (2^6 - 1) << 4
                // Set the 2 least significant bits to zero
                c = (chunk & 15) << 2; // 15 = 2^4 - 1
                base64 += concat4(encodings[a], encodings[b], encodings[c], '=');
            }
            return base64;
        }
        StringUtilities.base64EncodeBytes = base64EncodeBytes;
        var base64DecodeMap = [
            62, 0, 0, 0, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61,
            0, 0, 0, 0, 0, 0, 0,
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
            19, 20, 21, 22, 23, 24, 25, 0, 0, 0, 0, 0, 0,
            26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43,
            44, 45, 46, 47, 48, 49, 50, 51];
        var base64DecodeMapOffset = 0x2B;
        var base64EOF = 0x3D;
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
                decoded[j++] = (code << 2) | ((code2 & 0x30) >> 4);
                ch = encoded.charCodeAt(i++);
                if (ch == base64EOF) {
                    return decoded;
                }
                code = base64DecodeMap[ch - base64DecodeMapOffset];
                decoded[j++] = ((code2 & 0x0f) << 4) | ((code & 0x3c) >> 2);
                ch = encoded.charCodeAt(i++);
                if (ch == base64EOF) {
                    return decoded;
                }
                code2 = base64DecodeMap[ch - base64DecodeMapOffset];
                decoded[j++] = ((code & 0x03) << 6) | code2;
            }
            return decoded;
        }
        StringUtilities.decodeRestrictedBase64ToBytes = decodeRestrictedBase64ToBytes;
        function escapeString(str) {
            if (str !== undefined) {
                str = str.replace(/[^\w$]/gi, "$"); /* No dots, colons, dashes and /s */
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
            var str = "", SLICE = 1024 * 16;
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
            var bitCount = (32 - Math.clz32(n));
            release || assert(bitCount <= 32, bitCount);
            var l = Math.ceil(bitCount / 6);
            // Encode length followed by six bit chunks.
            var s = e[l];
            for (var i = l - 1; i >= 0; i--) {
                var offset = (i * 6);
                s += e[(n >> offset) & 0x3F];
            }
            release || assert(StringUtilities.variableLengthDecodeInt32(s) === n, n + " : " + s + " - " + l + " bits: " + bitCount);
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
            }
            else if (c >= 97 && c <= 122) {
                return c - 71;
            }
            else if (c >= 48 && c <= 57) {
                return c + 4;
            }
            else if (c === 36) {
                return 62;
            }
            else if (c === 95) {
                return 63;
            }
            release || assert(false, "Invalid Encoding");
        }
        StringUtilities.fromEncoding = fromEncoding;
        function variableLengthDecodeInt32(s) {
            var l = StringUtilities.fromEncoding(s.charCodeAt(0));
            var n = 0;
            for (var i = 0; i < l; i++) {
                var offset = ((l - i - 1) * 6);
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
            return s.substr(0, leftHalf) + "\u2026" + s.substr(s.length - rightHalf, rightHalf);
        }
        StringUtilities.trimMiddle = trimMiddle;
        function multiple(s, count) {
            var o = "";
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
    })(StringUtilities = Shumway.StringUtilities || (Shumway.StringUtilities = {}));
    var HashUtilities;
    (function (HashUtilities) {
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
        function hashBytesTo32BitsMD5(data, offset, length) {
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
                    }
                    else if (j < 32) {
                        f = (d & b) | ((~d) & c);
                        g = (5 * j + 1) & 15;
                    }
                    else if (j < 48) {
                        f = b ^ c ^ d;
                        g = (3 * j + 5) & 15;
                    }
                    else {
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
        HashUtilities.hashBytesTo32BitsMD5 = hashBytesTo32BitsMD5;
        function mixHash(a, b) {
            return (((31 * a) | 0) + b) | 0;
        }
        HashUtilities.mixHash = mixHash;
    })(HashUtilities = Shumway.HashUtilities || (Shumway.HashUtilities = {}));
    /**
     * An extremely naive cache with a maximum size.
     * TODO: LRU
     */
    var Cache = (function () {
        function Cache(maxSize) {
            this._data = Object.create(null);
            this._size = 0;
            this._maxSize = maxSize;
        }
        Cache.prototype.get = function (key) {
            return this._data[key];
        };
        Cache.prototype.set = function (key, value) {
            release || Debug.assert(!(key in this._data)); // Cannot mutate cache entries.
            if (this._size >= this._maxSize) {
                return false;
            }
            this._data[key] = value;
            this._size++;
            return true;
        };
        return Cache;
    })();
    Shumway.Cache = Cache;
    /**
     * Marsaglia's algorithm, adapted from V8. Use this if you want a deterministic random number.
     */
    var Random = (function () {
        function Random() {
        }
        Random.seed = function (seed) {
            Random._state[0] = seed;
            Random._state[1] = seed;
        };
        Random.reset = function () {
            Random._state[0] = 0xDEAD;
            Random._state[1] = 0xBEEF;
        };
        Random.next = function () {
            var s = this._state;
            var r0 = (Math.imul(18273, s[0] & 0xFFFF) + (s[0] >>> 16)) | 0;
            s[0] = r0;
            var r1 = (Math.imul(36969, s[1] & 0xFFFF) + (s[1] >>> 16)) | 0;
            s[1] = r1;
            var x = ((r0 << 16) + (r1 & 0xFFFF)) | 0;
            // Division by 0x100000000 through multiplication by reciprocal.
            return (x < 0 ? (x + 0x100000000) : x) * 2.3283064365386962890625e-10;
        };
        Random._state = new Uint32Array([0xDEAD, 0xBEEF]);
        return Random;
    })();
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
        var fakeTime = 1428107694580; // 3-Apr-2015
        // Overload
        jsGlobal.Date = function (yearOrTimevalue, month, date, hour, minute, second, millisecond) {
            switch (arguments.length) {
                case 0: return new RealDate(fakeTime);
                case 1: return new RealDate(yearOrTimevalue);
                case 2: return new RealDate(yearOrTimevalue, month);
                case 3: return new RealDate(yearOrTimevalue, month, date);
                case 4: return new RealDate(yearOrTimevalue, month, date, hour);
                case 5: return new RealDate(yearOrTimevalue, month, date, hour, minute);
                case 6: return new RealDate(yearOrTimevalue, month, date, hour, minute, second);
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
    Shumway.installTimeWarper = installTimeWarper;
    function polyfillWeakMap() {
        if (typeof jsGlobal.WeakMap === 'function') {
            return; // weak map is supported
        }
        var id = 0;
        function WeakMap() {
            this.id = '$weakmap' + (id++);
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
    var WeakList = (function () {
        function WeakList() {
            if (typeof ShumwayCom !== "undefined" && ShumwayCom.getWeakMapKeys) {
                this._map = new WeakMap();
                this._id = 0;
                this._newAdditions = [];
            }
            else {
                this._list = [];
            }
        }
        WeakList.prototype.clear = function () {
            if (this._map) {
                this._map.clear();
            }
            else {
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
            }
            else {
                release || Debug.assert(this._list.indexOf(value) === -1);
                this._list.push(value);
            }
        };
        WeakList.prototype.remove = function (value) {
            if (this._map) {
                release || Debug.assert(this._map.has(value));
                this._map.delete(value);
            }
            else {
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
                }
                else {
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
        };
        Object.defineProperty(WeakList.prototype, "length", {
            get: function () {
                if (this._map) {
                    // TODO: Implement this.
                    return -1;
                }
                else {
                    return this._list.length;
                }
            },
            enumerable: true,
            configurable: true
        });
        return WeakList;
    })();
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
            return Math.abs(value - other) < 0.0000001;
        }
        NumberUtilities.epsilonEquals = epsilonEquals;
    })(NumberUtilities = Shumway.NumberUtilities || (Shumway.NumberUtilities = {}));
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
            return ((i & 0xFF) << 8) | ((i >> 8) & 0xFF);
        }
        IntegerUtilities.swap16 = swap16;
        /**
         * Swap the bytes of a 32 bit number.
         */
        function swap32(i) {
            return ((i & 0xFF) << 24) | ((i & 0xFF00) << 8) | ((i >> 8) & 0xFF00) | ((i >> 24) & 0xFF);
        }
        IntegerUtilities.swap32 = swap32;
        /**
         * Converts a number to s8.u8 fixed point representation.
         */
        function toS8U8(v) {
            return ((v * 256) << 16) >> 16;
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
            return (v << 16) >> 16;
        }
        IntegerUtilities.toS16 = toS16;
        function bitCount(i) {
            i = i - ((i >> 1) & 0x55555555);
            i = (i & 0x33333333) + ((i >> 2) & 0x33333333);
            return (((i + (i >> 4)) & 0x0F0F0F0F) * 0x01010101) >> 24;
        }
        IntegerUtilities.bitCount = bitCount;
        function ones(i) {
            i = i - ((i >> 1) & 0x55555555);
            i = (i & 0x33333333) + ((i >> 2) & 0x33333333);
            return ((i + (i >> 4) & 0xF0F0F0F) * 0x1010101) >> 24;
        }
        IntegerUtilities.ones = ones;
        function trailingZeros(i) {
            return IntegerUtilities.ones((i & -i) - 1);
        }
        IntegerUtilities.trailingZeros = trailingZeros;
        function getFlags(i, flags) {
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
        IntegerUtilities.getFlags = getFlags;
        function isPowerOfTwo(x) {
            return x && ((x & (x - 1)) === 0);
        }
        IntegerUtilities.isPowerOfTwo = isPowerOfTwo;
        function roundToMultipleOfFour(x) {
            return (x + 3) & ~0x3;
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
            return (i + x) & ~x; // Round up to multiple of power of two.
        }
        IntegerUtilities.roundToMultipleOfPowerOfTwo = roundToMultipleOfPowerOfTwo;
        function toHEX(i) {
            var i = (i < 0 ? 0xFFFFFFFF + i + 1 : i);
            return "0x" + ("00000000" + i.toString(16)).substr(-8);
        }
        IntegerUtilities.toHEX = toHEX;
        /**
         * Polyfill imul.
         */
        if (!Math.imul) {
            Math.imul = function imul(a, b) {
                var ah = (a >>> 16) & 0xffff;
                var al = a & 0xffff;
                var bh = (b >>> 16) & 0xffff;
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
            Math.clz32 = function clz32(i) {
                i |= (i >> 1);
                i |= (i >> 2);
                i |= (i >> 4);
                i |= (i >> 8);
                i |= (i >> 16);
                return 32 - IntegerUtilities.ones(i);
            };
        }
    })(IntegerUtilities = Shumway.IntegerUtilities || (Shumway.IntegerUtilities = {}));
    var IndentingWriter = (function () {
        function IndentingWriter(suppressOutput, out) {
            if (suppressOutput === void 0) { suppressOutput = false; }
            this._tab = "  ";
            this._padding = "";
            this._suppressOutput = suppressOutput;
            this._out = out || IndentingWriter._consoleOut;
            this._outNoNewline = out || IndentingWriter._consoleOutNoNewline;
        }
        Object.defineProperty(IndentingWriter.prototype, "suppressOutput", {
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
            if (str === void 0) { str = ""; }
            if (writePadding === void 0) { writePadding = false; }
            if (!this._suppressOutput) {
                this._outNoNewline((writePadding ? this._padding : "") + str);
            }
        };
        IndentingWriter.prototype.writeLn = function (str) {
            if (str === void 0) { str = ""; }
            if (!this._suppressOutput) {
                this._out(this._padding + str);
            }
        };
        IndentingWriter.prototype.writeObject = function (str, object) {
            if (str === void 0) { str = ""; }
            if (!this._suppressOutput) {
                this._out(this._padding + str, object);
            }
        };
        IndentingWriter.prototype.writeTimeLn = function (str) {
            if (str === void 0) { str = ""; }
            if (!this._suppressOutput) {
                this._out(this._padding + performance.now().toFixed(2) + " " + str);
            }
        };
        IndentingWriter.prototype.writeComment = function (str) {
            var lines = (str || '').split("\n");
            if (lines.length === 1) {
                this.writeLn("// " + lines[0]);
            }
            else {
                this.writeLn("/**");
                for (var i = 0; i < lines.length; i++) {
                    this.writeLn(" * " + lines[i]);
                }
                this.writeLn(" */");
            }
        };
        IndentingWriter.prototype.writeLns = function (str) {
            var lines = (str || '').split("\n");
            for (var i = 0; i < lines.length; i++) {
                this.writeLn(lines[i]);
            }
        };
        IndentingWriter.prototype.errorLn = function (str) {
            if (IndentingWriter.logLevel & 1 /* Error */) {
                this.boldRedLn(str);
            }
        };
        IndentingWriter.prototype.warnLn = function (str) {
            if (IndentingWriter.logLevel & 2 /* Warn */) {
                this.yellowLn(str);
            }
        };
        IndentingWriter.prototype.debugLn = function (str) {
            if (IndentingWriter.logLevel & 4 /* Debug */) {
                this.purpleLn(str);
            }
        };
        IndentingWriter.prototype.logLn = function (str) {
            if (IndentingWriter.logLevel & 8 /* Log */) {
                this.writeLn(str);
            }
        };
        IndentingWriter.prototype.infoLn = function (str) {
            if (IndentingWriter.logLevel & 16 /* Info */) {
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
                }
                else {
                    this._out(this._padding + str);
                }
            }
        };
        IndentingWriter.prototype.redLns = function (str) {
            this.colorLns(IndentingWriter.RED, str);
        };
        IndentingWriter.prototype.colorLns = function (color, str) {
            var lines = (str || '').split("\n");
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
            if (detailed === void 0) { detailed = false; }
            if (noNumbers === void 0) { noNumbers = false; }
            detailed = detailed || false;
            for (var i = 0, j = arr.length; i < j; i++) {
                var prefix = "";
                if (detailed) {
                    if (arr[i] === null) {
                        prefix = "null";
                    }
                    else if (arr[i] === undefined) {
                        prefix = "undefined";
                    }
                    else {
                        prefix = arr[i].constructor.name;
                    }
                    prefix += " ";
                }
                var number = noNumbers ? "" : ("" + i).padRight(' ', 4);
                this.writeLn(number + prefix + arr[i]);
            }
        };
        IndentingWriter.PURPLE = '\033[94m';
        IndentingWriter.YELLOW = '\033[93m';
        IndentingWriter.GREEN = '\033[92m';
        IndentingWriter.RED = '\033[91m';
        IndentingWriter.BOLD_RED = '\033[1;91m';
        IndentingWriter.ENDC = '\033[0m';
        IndentingWriter.logLevel = 31 /* All */;
        IndentingWriter._consoleOut = console.log.bind(console);
        IndentingWriter._consoleOutNoNewline = console.log.bind(console);
        return IndentingWriter;
    })();
    Shumway.IndentingWriter = IndentingWriter;
    var CircularBuffer = (function () {
        function CircularBuffer(Type, sizeInBits) {
            if (sizeInBits === void 0) { sizeInBits = 12; }
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
            var end = (this.start - 1) & this._mask;
            while (i !== end) {
                if (visitor(this.array[i], i)) {
                    break;
                }
                i = i === 0 ? this._size - 1 : i - 1;
            }
        };
        CircularBuffer.prototype.write = function (value) {
            this.array[this.index] = value;
            this.index = (this.index + 1) & this._mask;
            if (this.index === this.start) {
                this.start = (this.start + 1) & this._mask;
            }
        };
        CircularBuffer.prototype.isFull = function () {
            return ((this.index + 1) & this._mask) === this.start;
        };
        CircularBuffer.prototype.isEmpty = function () {
            return this.index === this.start;
        };
        CircularBuffer.prototype.reset = function () {
            this.index = 0;
            this.start = 0;
        };
        return CircularBuffer;
    })();
    Shumway.CircularBuffer = CircularBuffer;
    var ColorStyle = (function () {
        function ColorStyle() {
        }
        ColorStyle.randomStyle = function () {
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
            return ColorStyle._randomStyleCache[(ColorStyle._nextStyle++) % ColorStyle._randomStyleCache.length];
        };
        ColorStyle.gradientColor = function (value) {
            return ColorStyle._gradient[ColorStyle._gradient.length * NumberUtilities.clamp(value, 0, 1) | 0];
        };
        ColorStyle.contrastStyle = function (rgb) {
            // http://www.w3.org/TR/AERT#color-contrast
            var c = parseInt(rgb.substr(1), 16);
            var yiq = (((c >> 16) * 299) + (((c >> 8) & 0xff) * 587) + ((c & 0xff) * 114)) / 1000;
            return (yiq >= 128) ? '#000000' : '#ffffff';
        };
        ColorStyle.reset = function () {
            ColorStyle._nextStyle = 0;
        };
        ColorStyle.TabToolbar = "#252c33";
        ColorStyle.Toolbars = "#343c45";
        ColorStyle.HighlightBlue = "#1d4f73";
        ColorStyle.LightText = "#f5f7fa";
        ColorStyle.ForegroundText = "#b6babf";
        ColorStyle.Black = "#000000";
        ColorStyle.VeryDark = "#14171a";
        ColorStyle.Dark = "#181d20";
        ColorStyle.Light = "#a9bacb";
        ColorStyle.Grey = "#8fa1b2";
        ColorStyle.DarkGrey = "#5f7387";
        ColorStyle.Blue = "#46afe3";
        ColorStyle.Purple = "#6b7abb";
        ColorStyle.Pink = "#df80ff";
        ColorStyle.Red = "#eb5368";
        ColorStyle.Orange = "#d96629";
        ColorStyle.LightOrange = "#d99b28";
        ColorStyle.Green = "#70bf53";
        ColorStyle.BlueGrey = "#5e88b0";
        ColorStyle._nextStyle = 0;
        ColorStyle._gradient = [
            "#FF0000",
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
            "#00FF00" // Green
        ];
        return ColorStyle;
    })();
    Shumway.ColorStyle = ColorStyle;
    /**
     * Faster release version of bounds.
     */
    var Bounds = (function () {
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
            return x < this.xMin !== x < this.xMax &&
                y < this.yMin !== y < this.yMax;
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
            if (this.xMin === 0x8000000) {
                this.xMin = this.xMax = x;
                return;
            }
            this.xMin = Math.min(this.xMin, x);
            this.xMax = Math.max(this.xMax, x);
        };
        Bounds.prototype.extendByY = function (y) {
            // Exclude default values.
            if (this.yMin === 0x8000000) {
                this.yMin = this.yMax = y;
                return;
            }
            this.yMin = Math.min(this.yMin, y);
            this.yMax = Math.max(this.yMax, y);
        };
        Bounds.prototype.intersects = function (toIntersect) {
            return this.contains(toIntersect.xMin, toIntersect.yMin) ||
                this.contains(toIntersect.xMax, toIntersect.yMax);
        };
        Bounds.prototype.isEmpty = function () {
            return this.xMax <= this.xMin || this.yMax <= this.yMin;
        };
        Object.defineProperty(Bounds.prototype, "width", {
            get: function () {
                return this.xMax - this.xMin;
            },
            set: function (value) {
                this.xMax = this.xMin + value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Bounds.prototype, "height", {
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
            this.xMin = this.yMin = this.xMax = this.yMax = 0x8000000;
        };
        Bounds.prototype.clone = function () {
            return new Bounds(this.xMin, this.yMin, this.xMax, this.yMax);
        };
        Bounds.prototype.toString = function () {
            return "{ " +
                "xMin: " + this.xMin + ", " +
                "xMin: " + this.yMin + ", " +
                "xMax: " + this.xMax + ", " +
                "xMax: " + this.yMax +
                " }";
        };
        return Bounds;
    })();
    Shumway.Bounds = Bounds;
    /**
     * Slower debug version of bounds, makes sure that all points have integer coordinates.
     */
    var DebugBounds = (function () {
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
            return x < this.xMin !== x < this.xMax &&
                y < this.yMin !== y < this.yMax;
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
            if (this.xMin === 0x8000000) {
                this.xMin = this.xMax = x;
                return;
            }
            this.xMin = Math.min(this.xMin, x);
            this.xMax = Math.max(this.xMax, x);
        };
        DebugBounds.prototype.extendByY = function (y) {
            if (this.yMin === 0x8000000) {
                this.yMin = this.yMax = y;
                return;
            }
            this.yMin = Math.min(this.yMin, y);
            this.yMax = Math.max(this.yMax, y);
        };
        DebugBounds.prototype.intersects = function (toIntersect) {
            return this.contains(toIntersect._xMin, toIntersect._yMin) ||
                this.contains(toIntersect._xMax, toIntersect._yMax);
        };
        DebugBounds.prototype.isEmpty = function () {
            return this._xMax <= this._xMin || this._yMax <= this._yMin;
        };
        Object.defineProperty(DebugBounds.prototype, "xMin", {
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
        Object.defineProperty(DebugBounds.prototype, "yMin", {
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
        Object.defineProperty(DebugBounds.prototype, "xMax", {
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
        Object.defineProperty(DebugBounds.prototype, "width", {
            get: function () {
                return this._xMax - this._xMin;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DebugBounds.prototype, "yMax", {
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
        Object.defineProperty(DebugBounds.prototype, "height", {
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
            return "{ " +
                "xMin: " + this._xMin + ", " +
                "yMin: " + this._yMin + ", " +
                "xMax: " + this._xMax + ", " +
                "yMax: " + this._yMax +
                " }";
        };
        DebugBounds.prototype.assertValid = function () {
            //      release || assert(this._xMax >= this._xMin);
            //      release || assert(this._yMax >= this._yMin);
        };
        return DebugBounds;
    })();
    Shumway.DebugBounds = DebugBounds;
    /**
     * Override Bounds with a slower by safer version, don't do this in release mode.
     */
    // Shumway.Bounds = DebugBounds;
    var Color = (function () {
        function Color(r, g, b, a) {
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = a;
        }
        Color.FromARGB = function (argb) {
            return new Color((argb >> 16 & 0xFF) / 255, (argb >> 8 & 0xFF) / 255, (argb >> 0 & 0xFF) / 255, (argb >> 24 & 0xFF) / 255);
        };
        Color.FromRGBA = function (rgba) {
            return Color.FromARGB(ColorUtilities.RGBAToARGB(rgba));
        };
        Color.prototype.toRGBA = function () {
            return (this.r * 255) << 24 | (this.g * 255) << 16 | (this.b * 255) << 8 | (this.a * 255);
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
            if (alpha === void 0) { alpha = 1; }
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
    })();
    Shumway.Color = Color;
    var ColorUtilities;
    (function (ColorUtilities) {
        function RGBAToARGB(rgba) {
            return ((rgba >> 8) & 0x00ffffff) | ((rgba & 0xff) << 24);
        }
        ColorUtilities.RGBAToARGB = RGBAToARGB;
        function ARGBToRGBA(argb) {
            return argb << 8 | ((argb >> 24) & 0xff);
        }
        ColorUtilities.ARGBToRGBA = ARGBToRGBA;
        /**
         * Cache frequently used rgba -> css style conversions.
         */
        var rgbaToCSSStyleCache = new Cache(1024);
        function rgbaToCSSStyle(rgba) {
            var result = rgbaToCSSStyleCache.get(rgba);
            if (typeof result === "string") {
                return result;
            }
            result = Shumway.StringUtilities.concat9('rgba(', rgba >> 24 & 0xff, ',', rgba >> 16 & 0xff, ',', rgba >> 8 & 0xff, ',', (rgba & 0xff) / 0xff, ')');
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
            if (typeof result === "number") {
                return result;
            }
            result = 0xff0000ff; // Red
            if (style[0] === "#") {
                if (style.length === 7) {
                    result = (parseInt(style.substring(1), 16) << 8) | 0xff;
                }
            }
            else if (style[0] === "r") {
                // We don't parse all types of rgba(....) color styles. We only handle the
                // ones we generate ourselves.
                var values = style.substring(5, style.length - 1).split(",");
                var r = parseInt(values[0]);
                var g = parseInt(values[1]);
                var b = parseInt(values[2]);
                var a = parseFloat(values[3]);
                result = (r & 0xff) << 24 |
                    (g & 0xff) << 16 |
                    (b & 0xff) << 8 |
                    ((a * 255) & 0xff);
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
            var b = (pARGB >> 0) & 0xff;
            var g = (pARGB >> 8) & 0xff;
            var r = (pARGB >> 16) & 0xff;
            var a = (pARGB >> 24) & 0xff;
            r = Math.imul(255, r) / a & 0xff;
            g = Math.imul(255, g) / a & 0xff;
            b = Math.imul(255, b) / a & 0xff;
            return a << 24 | r << 16 | g << 8 | b;
        }
        ColorUtilities.unpremultiplyARGB = unpremultiplyARGB;
        /**
         * Premultiplies the given |pARGB| color value.
         */
        function premultiplyARGB(uARGB) {
            var b = (uARGB >> 0) & 0xff;
            var g = (uARGB >> 8) & 0xff;
            var r = (uARGB >> 16) & 0xff;
            var a = (uARGB >> 24) & 0xff;
            r = ((Math.imul(r, a) + 127) / 255) | 0;
            g = ((Math.imul(g, a) + 127) / 255) | 0;
            b = ((Math.imul(b, a) + 127) / 255) | 0;
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
            var a = (pARGB >> 24) & 0xff;
            if (a === 0) {
                return 0;
            }
            else if (a === 0xff) {
                return pARGB;
            }
            var b = (pARGB >> 0) & 0xff;
            var g = (pARGB >> 8) & 0xff;
            var r = (pARGB >> 16) & 0xff;
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
            var sA = spBGRA & 0xff;
            var sGA = spBGRA & 0x00ff00ff;
            var sBR = spBGRA >> 8 & 0x00ff00ff;
            var tGA = tpBGRA & 0x00ff00ff;
            var tBR = tpBGRA >> 8 & 0x00ff00ff;
            var A = 256 - sA;
            tGA = Math.imul(tGA, A) >> 8;
            tBR = Math.imul(tBR, A) >> 8;
            return ((sBR + tBR & 0x00ff00ff) << 8) | (sGA + tGA & 0x00ff00ff);
        }
        ColorUtilities.blendPremultipliedBGRA = blendPremultipliedBGRA;
        var swap32 = IntegerUtilities.swap32;
        function convertImage(sourceFormat, targetFormat, source, target) {
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
                    }
                    else if (a === 0xff) {
                        target[i] = 0xff000000 | ((pBGRA >> 8) & 0x00ffffff);
                    }
                    else {
                        var b = (pBGRA >> 24) & 0xff;
                        var g = (pBGRA >> 16) & 0xff;
                        var r = (pBGRA >> 8) & 0xff;
                        var o = a << 8;
                        var T = unpremultiplyTable;
                        r = T[o + r];
                        g = T[o + g];
                        b = T[o + b];
                        target[i] = a << 24 | b << 16 | g << 8 | r;
                    }
                }
            }
            else if (sourceFormat === ImageType.StraightAlphaARGB &&
                targetFormat === ImageType.StraightAlphaRGBA) {
                for (var i = 0; i < length; i++) {
                    target[i] = swap32(source[i]);
                }
            }
            else if (sourceFormat === ImageType.StraightAlphaRGBA &&
                targetFormat === ImageType.PremultipliedAlphaARGB) {
                for (var i = 0; i < length; i++) {
                    var uABGR = source[i];
                    var uARGB = (uABGR & 0xFF00FF00) |
                        (uABGR >> 16) & 0xff |
                        (uABGR & 0xff) << 16; // ARGR
                    target[i] = swap32(premultiplyARGB(uARGB));
                }
            }
            else {
                release || Debug.somewhatImplemented("Image Format Conversion: " + ImageType[sourceFormat] + " -> " + ImageType[targetFormat]);
                // Copy the buffer over for now, we should at least get some image output.
                for (var i = 0; i < length; i++) {
                    target[i] = source[i];
                }
            }
            // leaveTimeline("convertImage");
        }
        ColorUtilities.convertImage = convertImage;
    })(ColorUtilities = Shumway.ColorUtilities || (Shumway.ColorUtilities = {}));
    /**
     * Simple pool allocator for ArrayBuffers. This reduces memory usage in data structures
     * that resize buffers.
     */
    var ArrayBufferPool = (function () {
        /**
         * Creates a pool that manages a pool of a |maxSize| number of array buffers.
         */
        function ArrayBufferPool(maxSize) {
            if (maxSize === void 0) { maxSize = 32; }
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
            var newLength = Math.max(array.length + length, ((array.length * 3) >> 1) + 1);
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
            var newLength = Math.max(array.length + length, ((array.length * 3) >> 1) + 1);
            var newArray = new Float64Array(this.acquire(newLength * Float64Array.BYTES_PER_ELEMENT), 0, newLength);
            newArray.set(array);
            this.release(array.buffer);
            return newArray;
        };
        ArrayBufferPool._enabled = true;
        return ArrayBufferPool;
    })();
    Shumway.ArrayBufferPool = ArrayBufferPool;
    var Telemetry;
    (function (Telemetry) {
        Telemetry.instance;
    })(Telemetry = Shumway.Telemetry || (Shumway.Telemetry = {}));
    var FileLoadingService;
    (function (FileLoadingService) {
        FileLoadingService.instance;
    })(FileLoadingService = Shumway.FileLoadingService || (Shumway.FileLoadingService = {}));
    var SystemResourcesLoadingService;
    (function (SystemResourcesLoadingService) {
        SystemResourcesLoadingService.instance;
    })(SystemResourcesLoadingService = Shumway.SystemResourcesLoadingService || (Shumway.SystemResourcesLoadingService = {}));
    function registerCSSFont(id, data, forceFontInit) {
        if (!inBrowser) {
            Debug.warning('Cannot register CSS font outside the browser');
            return;
        }
        var head = document.head;
        head.insertBefore(document.createElement('style'), head.firstChild);
        var style = document.styleSheets[0];
        var rule = '@font-face{font-family:swffont' + id + ';src:url(data:font/opentype;base64,' +
            Shumway.StringUtilities.base64EncodeBytes(data) + ')' + '}';
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
                // ...
            },
            registerCallback: function (functionName) {
                // ...
            },
            unregisterCallback: function (functionName) {
                // ...
            },
            eval: function (expression) {
                // ...
            },
            call: function (request) {
                // ...
            },
            getId: function () { return null; }
        };
    })(ExternalInterfaceService = Shumway.ExternalInterfaceService || (Shumway.ExternalInterfaceService = {}));
    var LocalConnectionService;
    (function (LocalConnectionService) {
        LocalConnectionService.instance;
    })(LocalConnectionService = Shumway.LocalConnectionService || (Shumway.LocalConnectionService = {}));
    var ClipboardService;
    (function (ClipboardService) {
        ClipboardService.instance = {
            setClipboard: function (data) { Debug.notImplemented('setClipboard'); }
        };
    })(ClipboardService = Shumway.ClipboardService || (Shumway.ClipboardService = {}));
    var Callback = (function () {
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
            }
            else {
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
    })();
    Shumway.Callback = Callback;
    (function (ImageType) {
        ImageType[ImageType["None"] = 0] = "None";
        /**
         * Premultiplied ARGB (byte-order).
         */
        ImageType[ImageType["PremultipliedAlphaARGB"] = 1] = "PremultipliedAlphaARGB";
        /**
         * Unpremultiplied ARGB (byte-order).
         */
        ImageType[ImageType["StraightAlphaARGB"] = 2] = "StraightAlphaARGB";
        /**
         * Unpremultiplied RGBA (byte-order), this is what putImageData expects.
         */
        ImageType[ImageType["StraightAlphaRGBA"] = 3] = "StraightAlphaRGBA";
        ImageType[ImageType["JPEG"] = 4] = "JPEG";
        ImageType[ImageType["PNG"] = 5] = "PNG";
        ImageType[ImageType["GIF"] = 6] = "GIF";
    })(Shumway.ImageType || (Shumway.ImageType = {}));
    var ImageType = Shumway.ImageType;
    function getMIMETypeForImageType(type) {
        switch (type) {
            case ImageType.JPEG: return "image/jpeg";
            case ImageType.PNG: return "image/png";
            case ImageType.GIF: return "image/gif";
            default: return "text/plain";
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
                case 1: // MouseCursor.ARROW
                default:
                    return 'default';
            }
        }
        UI.toCSSCursor = toCSSCursor;
    })(UI = Shumway.UI || (Shumway.UI = {}));
    var PromiseWrapper = (function () {
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
    })();
    Shumway.PromiseWrapper = PromiseWrapper;
})(Shumway || (Shumway = {}));
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
            Object.defineProperty(prototype, property, { value: value,
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
        return this.replace(/^\s+|\s+$/g, "");
    });
    extendBuiltin(String.prototype, "endsWith", function (str) {
        return this.indexOf(str, this.length - str.length) !== -1;
    });
    extendBuiltin(Array.prototype, "replace", function (x, y) {
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
})();
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
        var Argument = (function () {
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
                if (this.type === "boolean") {
                    release || assert(typeof value === "boolean");
                    this.value = value;
                }
                else if (this.type === "number") {
                    release || assert(!isNaN(value), value + " is not a number");
                    this.value = parseInt(value, 10);
                }
                else {
                    this.value = value;
                }
                if (this.parseFn) {
                    this.parseFn(this.value);
                }
            };
            return Argument;
        })();
        Options.Argument = Argument;
        var ArgumentParser = (function () {
            function ArgumentParser() {
                this.args = [];
            }
            ArgumentParser.prototype.addArgument = function (shortName, longName, type, options) {
                var argument = new Argument(shortName, longName, type, options);
                this.args.push(argument);
                return argument;
            };
            ArgumentParser.prototype.addBoundOption = function (option) {
                var options = { parse: function (x) {
                        option.value = x;
                    } };
                this.args.push(new Argument(option.shortName, option.longName, option.type, options));
            };
            ArgumentParser.prototype.addBoundOptionSet = function (optionSet) {
                var self = this;
                optionSet.options.forEach(function (x) {
                    if (OptionSet.isOptionSet(x)) {
                        self.addBoundOptionSet(x);
                    }
                    else {
                        release || assert(x);
                        self.addBoundOption(x);
                    }
                });
            };
            ArgumentParser.prototype.getUsage = function () {
                var str = "";
                this.args.forEach(function (x) {
                    if (!x.positional) {
                        str += "[-" + x.shortName + "|--" + x.longName + (x.type === "boolean" ? "" : " " + x.type[0].toUpperCase()) + "]";
                    }
                    else {
                        str += x.longName;
                    }
                    str += " ";
                });
                return str;
            };
            ArgumentParser.prototype.parse = function (args) {
                var nonPositionalArgumentMap = {};
                var positionalArgumentList = [];
                this.args.forEach(function (x) {
                    if (x.positional) {
                        positionalArgumentList.push(x);
                    }
                    else {
                        nonPositionalArgumentMap["-" + x.shortName] = x;
                        nonPositionalArgumentMap["--" + x.longName] = x;
                    }
                });
                var leftoverArguments = [];
                while (args.length) {
                    var argString = args.shift();
                    var argument = null, value = argString;
                    if (argString == '--') {
                        leftoverArguments = leftoverArguments.concat(args);
                        break;
                    }
                    else if (argString.slice(0, 1) == '-' || argString.slice(0, 2) == '--') {
                        argument = nonPositionalArgumentMap[argString];
                        // release || assert(argument, "Argument " + argString + " is unknown.");
                        if (!argument) {
                            continue;
                        }
                        if (argument.type !== "boolean") {
                            value = args.shift();
                            release || assert(value !== "-" && value !== "--", "Argument " + argString + " must have a value.");
                        }
                        else {
                            if (args.length && ["yes", "no", "true", "false", "t", "f"].indexOf(args[0]) >= 0) {
                                value = ["yes", "true", "t"].indexOf(args.shift()) >= 0;
                            }
                            else {
                                value = true;
                            }
                        }
                    }
                    else if (positionalArgumentList.length) {
                        argument = positionalArgumentList.shift();
                    }
                    else {
                        leftoverArguments.push(value);
                    }
                    if (argument) {
                        argument.parse(value);
                    }
                }
                release || assert(positionalArgumentList.length === 0, "Missing positional arguments.");
                return leftoverArguments;
            };
            return ArgumentParser;
        })();
        Options.ArgumentParser = ArgumentParser;
        var OptionSet = (function () {
            function OptionSet(name, settings) {
                if (settings === void 0) { settings = null; }
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
                if (typeof obj !== 'object' || obj === null ||
                    obj instanceof Option) {
                    return false;
                }
                return ('options' in obj) && ('name' in obj) && ('settings' in obj);
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
                    }
                    else {
                        // build_bundle chokes on this:
                        // if (!isNullOrUndefined(this.settings[option.longName])) {
                        if (typeof this.settings[option.longName] !== "undefined") {
                            switch (option.type) {
                                case "boolean":
                                    option.value = !!this.settings[option.longName];
                                    break;
                                case "number":
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
                writer.enter(this.name + " {");
                this.options.forEach(function (option) {
                    option.trace(writer);
                });
                writer.leave("}");
            };
            OptionSet.prototype.getSettings = function () {
                var settings = {};
                this.options.forEach(function (option) {
                    if (OptionSet.isOptionSet(option)) {
                        settings[option.name] = {
                            settings: option.getSettings(),
                            open: option.open
                        };
                    }
                    else {
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
                    }
                    else {
                        if (option.longName in settings) {
                            option.value = settings[option.longName];
                        }
                    }
                });
            };
            return OptionSet;
        })();
        Options.OptionSet = OptionSet;
        var Option = (function () {
            // config:
            //  { range: { min: 1, max: 5, step: 1 } }
            //  { list: [ "item 1", "item 2", "item 3" ] }
            //  { choices: { "choice 1": 1, "choice 2": 2, "choice 3": 3 } }
            function Option(shortName, longName, type, defaultValue, description, config) {
                if (config === void 0) { config = null; }
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
                writer.writeLn(("-" + this.shortName + "|--" + this.longName).padRight(" ", 30) +
                    " = " + this.type + " " + this.value + " [" + this.defaultValue + "]" +
                    " (" + this.description + ")");
            };
            return Option;
        })();
        Options.Option = Option;
    })(Options = Shumway.Options || (Shumway.Options = {}));
})(Shumway || (Shumway = {}));
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
var Shumway;
(function (Shumway) {
    var Settings;
    (function (Settings) {
        Settings.ROOT = "Shumway Options";
        Settings.shumwayOptions = new Shumway.Options.OptionSet(Settings.ROOT);
        function setSettings(settings) {
            Settings.shumwayOptions.setSettings(settings);
        }
        Settings.setSettings = setSettings;
        function getSettings() {
            return Settings.shumwayOptions.getSettings();
        }
        Settings.getSettings = getSettings;
    })(Settings = Shumway.Settings || (Shumway.Settings = {}));
    var Option = Shumway.Options.Option;
    var OptionSet = Shumway.Options.OptionSet;
    var shumwayOptions = Shumway.Settings.shumwayOptions;
    Shumway.loggingOptions = shumwayOptions.register(new OptionSet("Logging Options"));
    Shumway.omitRepeatedWarnings = Shumway.loggingOptions.register(new Option("wo", "warnOnce", "boolean", true, 'Omit Repeated Warnings'));
})(Shumway || (Shumway = {}));
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
var Shumway;
(function (Shumway) {
    var Metrics;
    (function (Metrics) {
        var Timer = (function () {
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
                return { name: this._name, total: this._total, timers: this._timers };
            };
            Timer.prototype.trace = function (writer) {
                writer.enter(this._name + ": " + this._total.toFixed(2) + " ms" +
                    ", count: " + this._count +
                    ", average: " + (this._total / this._count).toFixed(2) + " ms");
                for (var name in this._timers) {
                    this._timers[name].trace(writer);
                }
                writer.outdent();
            };
            Timer.trace = function (writer) {
                Timer._base.trace(writer);
                Timer._flat.trace(writer);
            };
            Timer._base = new Timer(null, "Total");
            Timer._top = Timer._base;
            Timer._flat = new Timer(null, "Flat");
            Timer._flatStack = [];
            return Timer;
        })();
        Metrics.Timer = Timer;
        /**
         * Quick way to count named events.
         */
        var Counter = (function () {
            function Counter(enabled) {
                this._enabled = enabled;
                this.clear();
            }
            Object.defineProperty(Counter.prototype, "counts", {
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
                if (increment === void 0) { increment = 1; }
                if (time === void 0) { time = 0; }
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
                    writer.writeLn(name + ": " + this._counts[name]);
                }
            };
            Counter.prototype._pairToString = function (times, pair) {
                var name = pair[0];
                var count = pair[1];
                var time = times[name];
                var line = name + ": " + count;
                if (time) {
                    line += ", " + time.toFixed(4);
                    if (count > 1) {
                        line += " (" + (time / count).toFixed(4) + ")";
                    }
                }
                return line;
            };
            Counter.prototype.toStringSorted = function () {
                var self = this;
                var times = this._times;
                var pairs = [];
                for (var name in this._counts) {
                    pairs.push([name, this._counts[name]]);
                }
                pairs.sort(function (a, b) {
                    return b[1] - a[1];
                });
                return (pairs.map(function (pair) {
                    return self._pairToString(times, pair);
                }).join(", "));
            };
            Counter.prototype.traceSorted = function (writer, inline) {
                if (inline === void 0) { inline = false; }
                var self = this;
                var times = this._times;
                var pairs = [];
                for (var name in this._counts) {
                    pairs.push([name, this._counts[name]]);
                }
                pairs.sort(function (a, b) {
                    return b[1] - a[1];
                });
                if (inline) {
                    writer.writeLn(pairs.map(function (pair) {
                        return self._pairToString(times, pair);
                    }).join(", "));
                }
                else {
                    pairs.forEach(function (pair) {
                        writer.writeLn(self._pairToString(times, pair));
                    });
                }
            };
            Counter.instance = new Counter(true);
            return Counter;
        })();
        Metrics.Counter = Counter;
        var Average = (function () {
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
        })();
        Metrics.Average = Average;
    })(Metrics = Shumway.Metrics || (Shumway.Metrics = {}));
})(Shumway || (Shumway = {}));
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
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Shumway;
(function (Shumway) {
    var ArrayUtilities;
    (function (ArrayUtilities) {
        var InflateState;
        (function (InflateState) {
            InflateState[InflateState["INIT"] = 0] = "INIT";
            InflateState[InflateState["BLOCK_0"] = 1] = "BLOCK_0";
            InflateState[InflateState["BLOCK_1"] = 2] = "BLOCK_1";
            InflateState[InflateState["BLOCK_2_PRE"] = 3] = "BLOCK_2_PRE";
            InflateState[InflateState["BLOCK_2"] = 4] = "BLOCK_2";
            InflateState[InflateState["DONE"] = 5] = "DONE";
            InflateState[InflateState["ERROR"] = 6] = "ERROR";
            InflateState[InflateState["VERIFY_HEADER"] = 7] = "VERIFY_HEADER";
        })(InflateState || (InflateState = {}));
        var WINDOW_SIZE = 32768;
        var WINDOW_SHIFT_POSITION = 65536;
        var MAX_WINDOW_SIZE = WINDOW_SHIFT_POSITION + 258; /* plus max copy len */
        var Inflate = (function () {
            function Inflate(verifyHeader) {
                //
            }
            Inflate.prototype.push = function (data) {
                Shumway.Debug.abstractMethod('Inflate.push');
            };
            Inflate.prototype.close = function () {
                //
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
                var header = (buffer[start] << 8) | buffer[start + 1];
                var error = null;
                if ((header & 0x0f00) !== 0x0800) {
                    error = 'inflate: unknown compression method';
                }
                else if ((header % 31) !== 0) {
                    error = 'inflate: bad FCHECK';
                }
                else if ((header & 0x20) !== 0) {
                    error = 'inflate: FDICT bit set';
                }
                if (error) {
                    if (this.onError) {
                        this.onError(error);
                    }
                    return -1;
                }
                else {
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
        })();
        ArrayUtilities.Inflate = Inflate;
        var BasicInflate = (function (_super) {
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
                            }
                            else if (processed === 0) {
                                incomplete = true;
                            }
                            else {
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
                        }
                        else {
                            this._window.set(this._window.subarray(this._windowPosition - WINDOW_SIZE, this._windowPosition));
                        }
                        this._windowPosition = WINDOW_SIZE;
                    }
                } while (!incomplete && this._bufferPosition < this._bufferSize);
                if (this._bufferPosition < this._bufferSize) {
                    // shift buffer
                    if ('copyWithin' in this._buffer) {
                        this._buffer['copyWithin'](0, this._bufferPosition, this._bufferSize);
                    }
                    else {
                        this._buffer.set(this._buffer.subarray(this._bufferPosition, this._bufferSize));
                    }
                    this._bufferSize -= this._bufferPosition;
                }
                else {
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
                if (((bufferSize - position) << 3) + bitLength < 3) {
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
                        var length = buffer[position] | (buffer[position + 1] << 8);
                        var length2 = buffer[position + 2] | (buffer[position + 3] << 8);
                        position += 4;
                        if ((length ^ length2) !== 0xFFFF) {
                            this._error('inflate: invalid block 0 length');
                            state = InflateState.ERROR;
                            break;
                        }
                        if (length === 0) {
                            state = InflateState.INIT;
                        }
                        else {
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
                        if (((bufferSize - position) << 3) + bitLength < 14 + 3 * 4) {
                            return true;
                        }
                        while (bitLength < 14) {
                            bitBuffer |= buffer[position++] << bitLength;
                            bitLength += 8;
                        }
                        var numLengthCodes = ((bitBuffer >> 10) & 15) + 4;
                        if (((bufferSize - position) << 3) + bitLength < 14 + 3 * numLengthCodes) {
                            return true;
                        }
                        var block2State = {
                            numLiteralCodes: (bitBuffer & 31) + 257,
                            numDistanceCodes: ((bitBuffer >> 5) & 31) + 1,
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
                        block2State.bitLengths =
                            new Uint8Array(block2State.numLiteralCodes + block2State.numDistanceCodes);
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
                return bitBuffer & ((1 << size) - 1);
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
                var code = codeTable.codes[bitBuffer & ((1 << maxBits) - 1)];
                var len = code >> 16;
                if ((code & 0x8000)) {
                    this._error('inflate: invalid encoding');
                    this._state = InflateState.ERROR;
                    return -1;
                }
                this._bitBuffer = bitBuffer >> len;
                this._bitLength = bitLength - len;
                return code & 0xffff;
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
                    }
                    else if (sym < 16) {
                        bitLengths[i++] = (prev = sym);
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
                    }
                    else if (sym < 256) {
                        output[pos++] = sym;
                    }
                    else if (sym > 256) {
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
                    }
                    else {
                        this._state = InflateState.INIT;
                        break; // end of block
                    }
                } while (pos < WINDOW_SHIFT_POSITION);
                this._windowPosition = pos;
                return false;
            };
            return BasicInflate;
        })(Inflate);
        var codeLengthOrder;
        var distanceCodes;
        var distanceExtraBits;
        var fixedDistanceTable;
        var lengthCodes;
        var lengthExtraBits;
        var fixedLiteralTable;
        var areTablesInitialized = false;
        function initializeTables() {
            codeLengthOrder = new Uint8Array([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
            distanceCodes = new Uint16Array(30);
            distanceExtraBits = new Uint8Array(30);
            for (var i = 0, j = 0, code = 1; i < 30; ++i) {
                distanceCodes[i] = code;
                code += 1 << (distanceExtraBits[i] = ~~((j += (i > 2 ? 1 : 0)) / 2));
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
                code += 1 << (lengthExtraBits[i] = ~~(((j += (i > 4 ? 1 : 0)) / 4) % 6));
            }
            for (var i = 0; i < 288; ++i) {
                bitLengths[i] = i < 144 || i > 279 ? 8 : (i < 256 ? 9 : 7);
            }
            fixedLiteralTable = makeHuffmanTable(bitLengths);
        }
        function makeHuffmanTable(bitLengths) {
            var maxBits = Math.max.apply(null, bitLengths);
            var numLengths = bitLengths.length;
            var size = 1 << maxBits;
            var codes = new Uint32Array(size);
            // avoiding len == 0: using max number of bits
            var dummyCode = (maxBits << 16) | 0xFFFF;
            for (var j = 0; j < size; j++) {
                codes[j] = dummyCode;
            }
            for (var code = 0, len = 1, skip = 2; len <= maxBits; code <<= 1, ++len, skip <<= 1) {
                for (var val = 0; val < numLengths; ++val) {
                    if (bitLengths[val] === len) {
                        var lsb = 0;
                        for (var i = 0; i < len; ++i)
                            lsb = (lsb * 2) + ((code >> i) & 1);
                        for (var i = lsb; i < size; i += skip)
                            codes[i] = (len << 16) | val;
                        ++code;
                    }
                }
            }
            return { codes: codes, maxBits: maxBits };
        }
        var SpecialInflateAdapter = (function (_super) {
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
                    }
                    else {
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
        })(Inflate);
        var DeflateState;
        (function (DeflateState) {
            DeflateState[DeflateState["WRITE"] = 0] = "WRITE";
            DeflateState[DeflateState["DONE"] = 1] = "DONE";
            DeflateState[DeflateState["ZLIB_HEADER"] = 2] = "ZLIB_HEADER";
        })(DeflateState || (DeflateState = {}));
        var Adler32 = (function () {
            function Adler32() {
                this.a = 1;
                this.b = 0;
            }
            Adler32.prototype.update = function (data, start, end) {
                var a = this.a;
                var b = this.b;
                for (var i = start; i < end; ++i) {
                    a = (a + (data[i] & 0xff)) % 65521;
                    b = (b + a) % 65521;
                }
                this.a = a;
                this.b = b;
            };
            Adler32.prototype.getChecksum = function () {
                return (this.b << 16) | this.a;
            };
            return Adler32;
        })();
        ArrayUtilities.Adler32 = Adler32;
        var Deflate = (function () {
            function Deflate(writeZlibHeader) {
                this._writeZlibHeader = writeZlibHeader;
                this._state = writeZlibHeader ? DeflateState.ZLIB_HEADER : DeflateState.WRITE;
                this._adler32 = writeZlibHeader ? new Adler32() : null;
            }
            Deflate.prototype.push = function (data) {
                if (this._state === DeflateState.ZLIB_HEADER) {
                    this.onData(new Uint8Array([0x78, 0x9C]));
                    this._state = DeflateState.WRITE;
                }
                // simple non-compressing algorithm for now
                var len = data.length;
                var outputSize = len + Math.ceil(len / 0xFFFF) * 5;
                var output = new Uint8Array(outputSize);
                var outputPos = 0;
                var pos = 0;
                while (len > 0xFFFF) {
                    output.set(new Uint8Array([
                        0x00,
                        0xFF, 0xFF,
                        0x00, 0x00
                    ]), outputPos);
                    outputPos += 5;
                    output.set(data.subarray(pos, pos + 0xFFFF), outputPos);
                    pos += 0xFFFF;
                    outputPos += 0xFFFF;
                    len -= 0xFFFF;
                }
                output.set(new Uint8Array([
                    0x00,
                    (len & 0xff), ((len >> 8) & 0xff),
                    ((~len) & 0xff), (((~len) >> 8) & 0xff)
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
                    0x01,
                    0x00, 0x00,
                    0xFF, 0xFF
                ]));
                if (this._adler32) {
                    var checksum = this._adler32.getChecksum();
                    this.onData(new Uint8Array([
                        checksum & 0xff, (checksum >> 8) & 0xff,
                        (checksum >> 16) & 0xff, (checksum >>> 24) & 0xff
                    ]));
                }
            };
            return Deflate;
        })();
        ArrayUtilities.Deflate = Deflate;
    })(ArrayUtilities = Shumway.ArrayUtilities || (Shumway.ArrayUtilities = {}));
})(Shumway || (Shumway = {}));
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
// The code derived from:
/* LzmaSpec.c -- LZMA Reference Decoder
 2013-07-28 : Igor Pavlov : Public domain */
var Shumway;
(function (Shumway) {
    var ArrayUtilities;
    (function (ArrayUtilities) {
        var InputStream = (function () {
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
                    throw new Error("Unexpected end of file");
                }
                this.available--;
                return this.buffer[this.pos++];
            };
            return InputStream;
        })();
        var OutputStream = (function () {
            function OutputStream(onData) {
                this.onData = onData;
                this.processed = 0;
            }
            OutputStream.prototype.writeBytes = function (data) {
                this.onData.call(null, data);
                this.processed += data.length;
            };
            return OutputStream;
        })();
        var OutWindow = (function () {
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
        })();
        var kNumBitModelTotalBits = 11;
        var kNumMoveBits = 5;
        var PROB_INIT_VAL = ((1 << kNumBitModelTotalBits) >> 1);
        function createProbsArray(length) {
            var p = new Uint16Array(length);
            for (var i = 0; i < length; i++) {
                p[i] = PROB_INIT_VAL;
            }
            return p;
        }
        var kTopValue = 1 << 24;
        var RangeDecoder = (function () {
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
                this.range = 0xFFFFFFFF | 0;
                var code = 0;
                for (var i = 0; i < 4; i++) {
                    code = (code << 8) | this.inStream.readByte();
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
                    range = (range >>> 1) | 0;
                    code = (code - range) | 0;
                    var t = code >> 31; // if high bit set -1, otherwise 0
                    code = (code + (range & t)) | 0;
                    if (code === range) {
                        this.corrupted = true;
                    }
                    if (range >= 0 && range < kTopValue) {
                        range = range << 8;
                        code = (code << 8) | this.inStream.readByte();
                    }
                    res = ((res << 1) + t + 1) | 0;
                } while (--numBits);
                this.range = range;
                this.code = code;
                return res;
            };
            RangeDecoder.prototype.decodeBit = function (prob, index) {
                var range = this.range;
                var code = this.code;
                var v = prob[index];
                var bound = (range >>> kNumBitModelTotalBits) * v; // keep unsigned
                var symbol;
                if ((code >>> 0) < bound) {
                    v = (v + (((1 << kNumBitModelTotalBits) - v) >> kNumMoveBits)) | 0;
                    range = bound | 0;
                    symbol = 0;
                }
                else {
                    v = (v - (v >> kNumMoveBits)) | 0;
                    code = (code - bound) | 0;
                    range = (range - bound) | 0;
                    symbol = 1;
                }
                prob[index] = v & 0xFFFF;
                if (range >= 0 && range < kTopValue) {
                    range = range << 8;
                    code = (code << 8) | this.inStream.readByte();
                }
                this.range = range;
                this.code = code;
                return symbol;
            };
            return RangeDecoder;
        })();
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
        var BitTreeDecoder = (function () {
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
        })();
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
        var LenDecoder = (function () {
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
        })();
        function updateState_Literal(state) {
            if (state < 4) {
                return 0;
            }
            else if (state < 10) {
                return state - 3;
            }
            else {
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
        var LzmaDecoderInternal = (function () {
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
                if (d >= (9 * 5 * 5)) {
                    throw new Error("Incorrect LZMA properties");
                }
                this.lc = d % 9;
                d = (d / 9) | 0;
                this.pb = (d / 5) | 0;
                this.lp = d % 5;
                this.dictSizeInProperties = 0;
                for (var i = 0; i < 4; i++) {
                    this.dictSizeInProperties |= properties[i + 1] << (8 * i);
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
                var litState = ((outWindow.totalPos & ((1 << this.lp) - 1)) << this.lc) + (prevByte >> (8 - this.lc));
                var probsIndex = 0x300 * litState;
                if (state >= 7) {
                    var matchByte = outWindow.getByte(rep0 + 1);
                    do {
                        var matchBit = (matchByte >> 7) & 1;
                        matchByte <<= 1;
                        var bit = rangeDec.decodeBit(this.litProbs, probsIndex + (((1 + matchBit) << 8) + symbol));
                        symbol = (symbol << 1) | bit;
                        if (matchBit !== bit) {
                            break;
                        }
                    } while (symbol < 0x100);
                }
                while (symbol < 0x100) {
                    symbol =
                        (symbol << 1) | rangeDec.decodeBit(this.litProbs, probsIndex + symbol);
                }
                return (symbol - 0x100) & 0xFF;
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
                var dist = (2 | (posSlot & 1)) << numDirectBits;
                if (posSlot < kEndPosModelIndex) {
                    dist =
                        (dist + bitTreeReverseDecode(this.posDecoders, dist - posSlot, numDirectBits, rangeDec)) | 0;
                }
                else {
                    dist =
                        (dist + (rangeDec.decodeDirectBits(numDirectBits - kNumAlignBits) << kNumAlignBits)) | 0;
                    dist = (dist + this.alignDecoder.reverseDecode(rangeDec)) | 0;
                }
                return dist;
            };
            LzmaDecoderInternal.prototype.init = function () {
                this.litProbs = createProbsArray(0x300 << (this.lc + this.lp));
                this.posSlotDecoder = createBitTreeDecoderArray(6, kNumLenToPosStates);
                this.alignDecoder = new BitTreeDecoder(kNumAlignBits);
                this.posDecoders =
                    createProbsArray(1 + kNumFullDistances - kEndPosModelIndex);
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
                    var posState = outWindow.totalPos & ((1 << pb) - 1);
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
                        }
                        else {
                            var dist;
                            if (rangeDec.decodeBit(isRepG1, state) === 0) {
                                dist = rep1;
                            }
                            else {
                                if (rangeDec.decodeBit(isRepG2, state) === 0) {
                                    dist = rep2;
                                }
                                else {
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
                    }
                    else {
                        rep3 = rep2;
                        rep2 = rep1;
                        rep1 = rep0;
                        len = lenDecoder.decode(rangeDec, posState);
                        state = updateState_Match(state);
                        rep0 = this.decodeDistance(len);
                        if (rep0 === -1) {
                            this.outWindow.flush();
                            return rangeDec.isFinishedOK() ?
                                LZMA_RES_FINISHED_WITH_MARKER :
                                LZMA_RES_ERROR;
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
        })();
        var LZMA_RES_ERROR = 0;
        var LZMA_RES_FINISHED_WITH_MARKER = 1;
        var LZMA_RES_FINISHED_WITHOUT_MARKER = 2;
        var LZMA_RES_NOT_COMPLETE = 3;
        var SWF_LZMA_HEADER_LENGTH = 17;
        var STANDARD_LZMA_HEADER_LENGTH = 13;
        var EXTRA_LZMA_BYTES_NEEDED = 5;
        var LzmaDecoderState;
        (function (LzmaDecoderState) {
            LzmaDecoderState[LzmaDecoderState["WAIT_FOR_LZMA_HEADER"] = 0] = "WAIT_FOR_LZMA_HEADER";
            LzmaDecoderState[LzmaDecoderState["WAIT_FOR_SWF_HEADER"] = 1] = "WAIT_FOR_SWF_HEADER";
            LzmaDecoderState[LzmaDecoderState["PROCESS_DATA"] = 2] = "PROCESS_DATA";
            LzmaDecoderState[LzmaDecoderState["CLOSED"] = 3] = "CLOSED";
            LzmaDecoderState[LzmaDecoderState["ERROR"] = 4] = "ERROR";
        })(LzmaDecoderState || (LzmaDecoderState = {}));
        var LzmaDecoder = (function () {
            function LzmaDecoder(swfHeader) {
                if (swfHeader === void 0) { swfHeader = false; }
                this._state = swfHeader ? LzmaDecoderState.WAIT_FOR_SWF_HEADER :
                    LzmaDecoderState.WAIT_FOR_LZMA_HEADER;
                this.buffer = null;
            }
            LzmaDecoder.prototype.push = function (data) {
                if (this._state < LzmaDecoderState.PROCESS_DATA) {
                    var buffered = this.buffer ? this.buffer.length : 0;
                    var headerBytesExpected = (this._state === LzmaDecoderState.WAIT_FOR_SWF_HEADER ?
                        SWF_LZMA_HEADER_LENGTH : STANDARD_LZMA_HEADER_LENGTH) +
                        EXTRA_LZMA_BYTES_NEEDED;
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
                        this._decoder.unpackSize = ((header[4] | (header[5] << 8) |
                            (header[6] << 16) | (header[7] << 24)) >>> 0) - 8;
                    }
                    else {
                        this._decoder.decodeProperties(header.subarray(0, 5));
                        var unpackSize = 0;
                        var unpackSizeDefined = false;
                        for (var i = 0; i < 8; i++) {
                            var b = header[5 + i];
                            if (b !== 0xFF) {
                                unpackSizeDefined = true;
                            }
                            unpackSize |= b << (8 * i);
                        }
                        this._decoder.markerIsMandatory = !unpackSizeDefined;
                        this._decoder.unpackSize = unpackSizeDefined ? unpackSize : undefined;
                    }
                    this._decoder.create();
                    data = data.subarray(headerBytesExpected);
                    this._state = LzmaDecoderState.PROCESS_DATA;
                }
                else if (this._state !== LzmaDecoderState.PROCESS_DATA) {
                    return;
                }
                try {
                    this._inStream.append(data);
                    var res = this._decoder.decode(true);
                    this._inStream.compact();
                    if (res !== LZMA_RES_NOT_COMPLETE) {
                        this._checkError(res);
                    }
                }
                catch (e) {
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
                }
                catch (e) {
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
                    error = "LZMA decoding error";
                }
                else if (res === LZMA_RES_NOT_COMPLETE) {
                    error = "Decoding is not complete";
                }
                else if (res === LZMA_RES_FINISHED_WITH_MARKER) {
                    if (this._decoder.unpackSize !== undefined &&
                        this._decoder.unpackSize !== this._outStream.processed) {
                        error = "Finished with end marker before than specified size";
                    }
                }
                else {
                    error = "Internal LZMA Error";
                }
                if (error) {
                    this._error(error);
                }
            };
            return LzmaDecoder;
        })();
        ArrayUtilities.LzmaDecoder = LzmaDecoder;
    })(ArrayUtilities = Shumway.ArrayUtilities || (Shumway.ArrayUtilities = {}));
})(Shumway || (Shumway = {}));
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
///<reference path='references.ts' />
var Shumway;
(function (Shumway) {
    var ArrayUtilities;
    (function (ArrayUtilities) {
        var notImplemented = Shumway.Debug.notImplemented;
        var assert = Shumway.Debug.assert;
        var utf8decode = Shumway.StringUtilities.utf8decode;
        var utf8encode = Shumway.StringUtilities.utf8encode;
        var clamp = Shumway.NumberUtilities.clamp;
        function axCoerceString(x) {
            if (typeof x === "string") {
                return x;
            }
            else if (x == undefined) {
                return null;
            }
            return x + '';
        }
        var PlainObjectDataBuffer = (function () {
            function PlainObjectDataBuffer(buffer, length, littleEndian) {
                this.buffer = buffer;
                this.length = length;
                this.littleEndian = littleEndian;
            }
            return PlainObjectDataBuffer;
        })();
        ArrayUtilities.PlainObjectDataBuffer = PlainObjectDataBuffer;
        var bitMasks = new Uint32Array(33);
        for (var i = 1, mask = 0; i <= 32; i++) {
            bitMasks[i] = mask = (mask << 1) | 1;
        }
        var TypedArrayViewFlags;
        (function (TypedArrayViewFlags) {
            TypedArrayViewFlags[TypedArrayViewFlags["U8"] = 1] = "U8";
            TypedArrayViewFlags[TypedArrayViewFlags["I32"] = 2] = "I32";
            TypedArrayViewFlags[TypedArrayViewFlags["F32"] = 4] = "F32";
        })(TypedArrayViewFlags || (TypedArrayViewFlags = {}));
        var DataBuffer = (function () {
            function DataBuffer(initialSize) {
                if (initialSize === void 0) { initialSize = DataBuffer.INITIAL_SIZE; }
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
                if (length === void 0) { length = -1; }
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
                if ((this._buffer.byteLength & 0x3) === 0) {
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
                if (newLength > 0xFFFFFFFF) {
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
            DataBuffer.prototype.readBytes = function (bytes, offset /*uint*/, length /*uint*/) {
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
                return this._littleEndian ? (b << 8) | a : (a << 8) | b;
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
                return this._littleEndian ?
                    (d << 24) | (c << 16) | (b << 8) | a :
                    (a << 24) | (b << 16) | (c << 8) | d;
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
                if (this._littleEndian && (position & 0x3) === 0 && this._f32) {
                    return this._f32[position >> 2];
                }
                else {
                    var u8 = this._u8;
                    var t8 = Shumway.IntegerUtilities.u8;
                    if (this._littleEndian) {
                        t8[0] = u8[position + 0];
                        t8[1] = u8[position + 1];
                        t8[2] = u8[position + 2];
                        t8[3] = u8[position + 3];
                    }
                    else {
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
                }
                else {
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
            DataBuffer.prototype.writeByte = function (value /*int*/) {
                var length = this._position + 1;
                this._ensureCapacity(length);
                this._u8[this._position++] = value;
                if (length > this._length) {
                    this._length = length;
                }
            };
            DataBuffer.prototype.writeUnsignedByte = function (value /*uint*/) {
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
            DataBuffer.prototype.writeBytes = function (bytes, offset /*uint*/, length /*uint*/) {
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
                if (offset !== clamp(offset, 0, bytes.length) ||
                    offset + length !== clamp(offset + length, 0, bytes.length)) {
                    release || assert(this.sec);
                    this.sec.throwError('RangeError', Errors.ParamRangeError);
                }
                if (length === 0) {
                    length = bytes.length - offset;
                }
                this.writeRawBytes(new Int8Array(bytes._buffer, offset, length));
            };
            DataBuffer.prototype.writeShort = function (value /*int*/) {
                this.writeUnsignedShort(value);
            };
            DataBuffer.prototype.writeUnsignedShort = function (value /*uint*/) {
                var position = this._position;
                this._ensureCapacity(position + 2);
                var u8 = this._u8;
                if (this._littleEndian) {
                    u8[position + 0] = value;
                    u8[position + 1] = value >> 8;
                }
                else {
                    u8[position + 0] = value >> 8;
                    u8[position + 1] = value;
                }
                position += 2;
                this._position = position;
                if (position > this._length) {
                    this._length = position;
                }
            };
            DataBuffer.prototype.writeInt = function (value /*int*/) {
                this.writeUnsignedInt(value);
            };
            DataBuffer.prototype.write2Ints = function (a, b) {
                this.write2UnsignedInts(a, b);
            };
            DataBuffer.prototype.write4Ints = function (a, b, c, d) {
                this.write4UnsignedInts(a, b, c, d);
            };
            DataBuffer.prototype.writeUnsignedInt = function (value /*uint*/) {
                var position = this._position;
                this._ensureCapacity(position + 4);
                this._requestViews(TypedArrayViewFlags.I32);
                if (this._littleEndian === DataBuffer._nativeLittleEndian && (position & 0x3) === 0 && this._i32) {
                    this._i32[position >> 2] = value;
                }
                else {
                    var u8 = this._u8;
                    if (this._littleEndian) {
                        u8[position + 0] = value;
                        u8[position + 1] = value >> 8;
                        u8[position + 2] = value >> 16;
                        u8[position + 3] = value >> 24;
                    }
                    else {
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
                if (this._littleEndian === DataBuffer._nativeLittleEndian && (position & 0x3) === 0 && this._i32) {
                    this._i32[(position >> 2) + 0] = a;
                    this._i32[(position >> 2) + 1] = b;
                    position += 8;
                    this._position = position;
                    if (position > this._length) {
                        this._length = position;
                    }
                }
                else {
                    this.writeUnsignedInt(a);
                    this.writeUnsignedInt(b);
                }
            };
            DataBuffer.prototype.write4UnsignedInts = function (a, b, c, d) {
                var position = this._position;
                this._ensureCapacity(position + 16);
                this._requestViews(TypedArrayViewFlags.I32);
                if (this._littleEndian === DataBuffer._nativeLittleEndian && (position & 0x3) === 0 && this._i32) {
                    this._i32[(position >> 2) + 0] = a;
                    this._i32[(position >> 2) + 1] = b;
                    this._i32[(position >> 2) + 2] = c;
                    this._i32[(position >> 2) + 3] = d;
                    position += 16;
                    this._position = position;
                    if (position > this._length) {
                        this._length = position;
                    }
                }
                else {
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
                if (this._littleEndian === DataBuffer._nativeLittleEndian && (position & 0x3) === 0 && this._f32) {
                    this._f32[position >> 2] = value;
                }
                else {
                    var u8 = this._u8;
                    Shumway.IntegerUtilities.f32[0] = value;
                    var t8 = Shumway.IntegerUtilities.u8;
                    if (this._littleEndian) {
                        u8[position + 0] = t8[0];
                        u8[position + 1] = t8[1];
                        u8[position + 2] = t8[2];
                        u8[position + 3] = t8[3];
                    }
                    else {
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
                if (this._littleEndian === DataBuffer._nativeLittleEndian && (position & 0x3) === 0 && this._f32) {
                    this._f32[(position >> 2) + 0] = a;
                    this._f32[(position >> 2) + 1] = b;
                    position += 8;
                    this._position = position;
                    if (position > this._length) {
                        this._length = position;
                    }
                }
                else {
                    this.writeFloat(a);
                    this.writeFloat(b);
                }
            };
            DataBuffer.prototype.write6Floats = function (a, b, c, d, e, f) {
                var position = this._position;
                this._ensureCapacity(position + 24);
                this._requestViews(TypedArrayViewFlags.F32);
                if (this._littleEndian === DataBuffer._nativeLittleEndian && (position & 0x3) === 0 && this._f32) {
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
                }
                else {
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
                }
                else {
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
            DataBuffer.prototype.readUTFBytes = function (length /*uint*/) {
                length = length >>> 0;
                var pos = this._position;
                if (pos + length > this._length) {
                    release || assert(this.sec);
                    this.sec.throwError('flash.errors.EOFError', Errors.EOFError);
                }
                this._position += length;
                return utf8encode(new Int8Array(this._buffer, pos, length));
            };
            Object.defineProperty(DataBuffer.prototype, "length", {
                get: function () {
                    return this._length;
                },
                set: function (value /*uint*/) {
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
            Object.defineProperty(DataBuffer.prototype, "bytesAvailable", {
                get: function () {
                    return this._length - this._position;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DataBuffer.prototype, "position", {
                get: function () {
                    return this._position;
                },
                set: function (position /*uint*/) {
                    this._position = position >>> 0;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DataBuffer.prototype, "buffer", {
                get: function () {
                    return this._buffer;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DataBuffer.prototype, "bytes", {
                get: function () {
                    return this._u8;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DataBuffer.prototype, "ints", {
                get: function () {
                    this._requestViews(TypedArrayViewFlags.I32);
                    return this._i32;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DataBuffer.prototype, "objectEncoding", {
                get: function () {
                    return this._objectEncoding;
                },
                set: function (version /*uint*/) {
                    version = version >>> 0;
                    this._objectEncoding = version;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(DataBuffer.prototype, "endian", {
                get: function () {
                    return this._littleEndian ? "littleEndian" : "bigEndian";
                },
                set: function (type) {
                    type = axCoerceString(type);
                    if (type === "auto") {
                        this._littleEndian = DataBuffer._nativeLittleEndian;
                    }
                    else {
                        this._littleEndian = type === "littleEndian";
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
                release || release || notImplemented("packageInternal flash.utils.ObjectOutput::writeMultiByte");
                return;
            };
            DataBuffer.prototype.readMultiByte = function (length /*uint*/, charSet) {
                length = length >>> 0;
                charSet = axCoerceString(charSet);
                release || release || notImplemented("packageInternal flash.utils.ObjectInput::readMultiByte");
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
                var exponent = (uint16 & 0x7c00) >> 10;
                var fraction = uint16 & 0x03ff;
                if (!exponent) {
                    return sign * Math.pow(2, -14) * (fraction / 1024);
                }
                if (exponent === 0x1f) {
                    return fraction ? NaN : sign * Infinity;
                }
                return sign * Math.pow(2, exponent - 15) * (1 + (fraction / 1024));
            };
            DataBuffer.prototype.readEncodedU32 = function () {
                var value = this.readUnsignedByte();
                if (!(value & 0x080)) {
                    return value;
                }
                value = (value & 0x7f) | this.readUnsignedByte() << 7;
                if (!(value & 0x4000)) {
                    return value;
                }
                value = (value & 0x3fff) | this.readUnsignedByte() << 14;
                if (!(value & 0x200000)) {
                    return value;
                }
                value = (value & 0x1FFFFF) | this.readUnsignedByte() << 21;
                if (!(value & 0x10000000)) {
                    return value;
                }
                return (value & 0xFFFFFFF) | (this.readUnsignedByte() << 28);
            };
            DataBuffer.prototype.readBits = function (size) {
                return (this.readUnsignedBits(size) << (32 - size)) >> (32 - size);
            };
            DataBuffer.prototype.readUnsignedBits = function (size) {
                var buffer = this._bitBuffer;
                var length = this._bitLength;
                while (size > length) {
                    buffer = (buffer << 8) | this.readUnsignedByte();
                    length += 8;
                }
                length -= size;
                var value = (buffer >>> length) & bitMasks[size];
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
                }
                else {
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
                }
                else {
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
                }
                else {
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
                inflate.onError = function (e) { return error = e; };
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
        })();
        ArrayUtilities.DataBuffer = DataBuffer;
    })(ArrayUtilities = Shumway.ArrayUtilities || (Shumway.ArrayUtilities = {}));
})(Shumway || (Shumway = {}));
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
/**
 * Serialization format for shape data:
 * (canonical, update this instead of anything else!)
 *
 * Shape data is serialized into a set of three buffers:
 * - `commands`: a Uint8Array for commands
 *  - valid values: [1-11] (i.e. one of the PathCommand enum values)
 * - `coordinates`: an Int32Array for path coordinates*
 *                  OR uint8 thickness iff the current command is PathCommand.LineStyleSolid
 *  - valid values: the full range of 32bit numbers, representing x,y coordinates in twips
 * - `styles`: a DataBuffer for style definitions
 *  - valid values: structs for the various style definitions as described below
 *
 * (*: with one exception: to make various things faster, stroke widths are stored in the
 * coordinates buffer, too.)
 *
 * All entries always contain all fields, default values aren't omitted.
 *
 * the various commands write the following sets of values into the various buffers:
 *
 * moveTo:
 * commands:      PathCommand.MoveTo
 * coordinates:   target x coordinate, in twips
 *                target y coordinate, in twips
 * styles:        n/a
 *
 * lineTo:
 * commands:      PathCommand.LineTo
 * coordinates:   target x coordinate, in twips
 *                target y coordinate, in twips
 * styles:        n/a
 *
 * curveTo:
 * commands:      PathCommand.CurveTo
 * coordinates:   control point x coordinate, in twips
 *                control point y coordinate, in twips
 *                target x coordinate, in twips
 *                target y coordinate, in twips
 * styles:        n/a
 *
 * cubicCurveTo:
 * commands:      PathCommand.CubicCurveTo
 * coordinates:   control point 1 x coordinate, in twips
 *                control point 1 y coordinate, in twips
 *                control point 2 x coordinate, in twips
 *                control point 2 y coordinate, in twips
 *                target x coordinate, in twips
 *                target y coordinate, in twips
 * styles:        n/a
 *
 * beginFill:
 * commands:      PathCommand.BeginSolidFill
 * coordinates:   n/a
 * styles:        uint32 - RGBA color
 *
 * beginGradientFill:
 * commands:      PathCommand.BeginGradientFill
 * coordinates:   n/a
 * Note: the style fields are ordered this way to optimize performance in the rendering backend
 * Note: the style record has a variable length depending on the number of color stops
 * styles:        uint8  - GradientType.{LINEAR,RADIAL}
 *                fix8   - focalPoint [-128.0xff,127.0xff]
 *                matrix - transform (see Matrix#writeExternal for details)
 *                uint8  - colorStops (Number of color stop records that follow)
 *                list of uint8,uint32 pairs:
 *                    uint8  - ratio [0-0xff]
 *                    uint32 - RGBA color
 *                uint8  - SpreadMethod.{PAD,REFLECT,REPEAT}
 *                uint8  - InterpolationMethod.{RGB,LINEAR_RGB}
 *
 * beginBitmapFill:
 * commands:      PathCommand.BeginBitmapFill
 * coordinates:   n/a
 * styles:        uint32 - Index of the bitmapData object in the Graphics object's `textures`
 *                         array
 *                matrix - transform (see Matrix#writeExternal for details)
 *                bool   - repeat
 *                bool   - smooth
 *
 * lineStyle:
 * commands:      PathCommand.LineStyleSolid
 * coordinates:   uint32 - thickness (!)
 * style:         uint32 - RGBA color
 *                bool   - pixelHinting
 *                uint8  - LineScaleMode, [0-3] see LineScaleMode.fromNumber for meaning
 *                uint8  - CapsStyle, [0-2] see CapsStyle.fromNumber for meaning
 *                uint8  - JointStyle, [0-2] see JointStyle.fromNumber for meaning
 *                uint8  - miterLimit
 *
 * lineGradientStyle:
 * commands:      PathCommand.LineStyleGradient
 * coordinates:   n/a
 * Note: the style fields are ordered this way to optimize performance in the rendering backend
 * Note: the style record has a variable length depending on the number of color stops
 * styles:        uint8  - GradientType.{LINEAR,RADIAL}
 *                int8   - focalPoint [-128,127]
 *                matrix - transform (see Matrix#writeExternal for details)
 *                uint8  - colorStops (Number of color stop records that follow)
 *                list of uint8,uint32 pairs:
 *                    uint8  - ratio [0-0xff]
 *                    uint32 - RGBA color
 *                uint8  - SpreadMethod.{PAD,REFLECT,REPEAT}
 *                uint8  - InterpolationMethod.{RGB,LINEAR_RGB}
 *
 * lineBitmapStyle:
 * commands:      PathCommand.LineBitmapStyle
 * coordinates:   n/a
 * styles:        uint32 - Index of the bitmapData object in the Graphics object's `textures`
 *                         array
 *                matrix - transform (see Matrix#writeExternal for details)
 *                bool   - repeat
 *                bool   - smooth
 *
 * lineEnd:
 * Note: emitted for invalid `lineStyle` calls
 * commands:      PathCommand.LineEnd
 * coordinates:   n/a
 * styles:        n/a
 *
 */
///<reference path='references.ts' />
var Shumway;
(function (Shumway) {
    var DataBuffer = Shumway.ArrayUtilities.DataBuffer;
    var ensureTypedArrayCapacity = Shumway.ArrayUtilities.ensureTypedArrayCapacity;
    var assert = Shumway.Debug.assert;
    var PlainObjectShapeData = (function () {
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
    })();
    Shumway.PlainObjectShapeData = PlainObjectShapeData;
    var DefaultSize;
    (function (DefaultSize) {
        DefaultSize[DefaultSize["Commands"] = 32] = "Commands";
        DefaultSize[DefaultSize["Coordinates"] = 128] = "Coordinates";
        DefaultSize[DefaultSize["Styles"] = 16] = "Styles";
    })(DefaultSize || (DefaultSize = {}));
    var ShapeData = (function () {
        function ShapeData(initialize) {
            if (initialize === void 0) { initialize = true; }
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
            this.commands[this.commandsPosition++] = 9 /* MoveTo */;
            this.coordinates[this.coordinatesPosition++] = x;
            this.coordinates[this.coordinatesPosition++] = y;
        };
        ShapeData.prototype.lineTo = function (x, y) {
            this.ensurePathCapacities(1, 2);
            this.commands[this.commandsPosition++] = 10 /* LineTo */;
            this.coordinates[this.coordinatesPosition++] = x;
            this.coordinates[this.coordinatesPosition++] = y;
        };
        ShapeData.prototype.curveTo = function (controlX, controlY, anchorX, anchorY) {
            this.ensurePathCapacities(1, 4);
            this.commands[this.commandsPosition++] = 11 /* CurveTo */;
            this.coordinates[this.coordinatesPosition++] = controlX;
            this.coordinates[this.coordinatesPosition++] = controlY;
            this.coordinates[this.coordinatesPosition++] = anchorX;
            this.coordinates[this.coordinatesPosition++] = anchorY;
        };
        ShapeData.prototype.cubicCurveTo = function (controlX1, controlY1, controlX2, controlY2, anchorX, anchorY) {
            this.ensurePathCapacities(1, 6);
            this.commands[this.commandsPosition++] = 12 /* CubicCurveTo */;
            this.coordinates[this.coordinatesPosition++] = controlX1;
            this.coordinates[this.coordinatesPosition++] = controlY1;
            this.coordinates[this.coordinatesPosition++] = controlX2;
            this.coordinates[this.coordinatesPosition++] = controlY2;
            this.coordinates[this.coordinatesPosition++] = anchorX;
            this.coordinates[this.coordinatesPosition++] = anchorY;
        };
        ShapeData.prototype.beginFill = function (color) {
            this.ensurePathCapacities(1, 0);
            this.commands[this.commandsPosition++] = 1 /* BeginSolidFill */;
            this.styles.writeUnsignedInt(color);
            this.hasFills = true;
        };
        ShapeData.prototype.writeMorphFill = function (color) {
            this.morphStyles.writeUnsignedInt(color);
        };
        ShapeData.prototype.endFill = function () {
            this.ensurePathCapacities(1, 0);
            this.commands[this.commandsPosition++] = 4 /* EndFill */;
        };
        ShapeData.prototype.endLine = function () {
            this.ensurePathCapacities(1, 0);
            this.commands[this.commandsPosition++] = 8 /* LineEnd */;
        };
        ShapeData.prototype.lineStyle = function (thickness, color, pixelHinting, scaleMode, caps, joints, miterLimit) {
            release || assert(thickness === (thickness | 0), thickness >= 0 && thickness <= 0xff * 20);
            this.ensurePathCapacities(2, 0);
            this.commands[this.commandsPosition++] = 5 /* LineStyleSolid */;
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
            release || assert(pathCommand === 3 /* BeginBitmapFill */ ||
                pathCommand === 7 /* LineStyleBitmap */);
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
            release || assert(pathCommand === 2 /* BeginGradientFill */ ||
                pathCommand === 6 /* LineStyleGradient */);
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
        Object.defineProperty(ShapeData.prototype, "buffers", {
            get: function () {
                var buffers = [this.commands.buffer, this.coordinates.buffer, this.styles.buffer];
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
    })();
    Shumway.ShapeData = ShapeData;
})(Shumway || (Shumway = {}));
/*
 * Copyright 2013 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License"),
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
var Shumway;
(function (Shumway) {
    var SWF;
    (function (SWF) {
        var Parser;
        (function (Parser) {
            var SwfTagCodeNames = ["CODE_END", "CODE_SHOW_FRAME", "CODE_DEFINE_SHAPE", "CODE_FREE_CHARACTER", "CODE_PLACE_OBJECT", "CODE_REMOVE_OBJECT", "CODE_DEFINE_BITS", "CODE_DEFINE_BUTTON", "CODE_JPEG_TABLES", "CODE_SET_BACKGROUND_COLOR", "CODE_DEFINE_FONT", "CODE_DEFINE_TEXT", "CODE_DO_ACTION", "CODE_DEFINE_FONT_INFO", "CODE_DEFINE_SOUND", "CODE_START_SOUND", "CODE_STOP_SOUND", "CODE_DEFINE_BUTTON_SOUND", "CODE_SOUND_STREAM_HEAD", "CODE_SOUND_STREAM_BLOCK", "CODE_DEFINE_BITS_LOSSLESS", "CODE_DEFINE_BITS_JPEG2", "CODE_DEFINE_SHAPE2", "CODE_DEFINE_BUTTON_CXFORM", "CODE_PROTECT", "CODE_PATHS_ARE_POSTSCRIPT", "CODE_PLACE_OBJECT2", "INVALID", "CODE_REMOVE_OBJECT2", "CODE_SYNC_FRAME", "INVALID", "CODE_FREE_ALL", "CODE_DEFINE_SHAPE3", "CODE_DEFINE_TEXT2", "CODE_DEFINE_BUTTON2", "CODE_DEFINE_BITS_JPEG3", "CODE_DEFINE_BITS_LOSSLESS2", "CODE_DEFINE_EDIT_TEXT", "CODE_DEFINE_VIDEO", "CODE_DEFINE_SPRITE", "CODE_NAME_CHARACTER", "CODE_PRODUCT_INFO", "CODE_DEFINE_TEXT_FORMAT", "CODE_FRAME_LABEL", "CODE_DEFINE_BEHAVIOUR", "CODE_SOUND_STREAM_HEAD2", "CODE_DEFINE_MORPH_SHAPE", "CODE_GENERATE_FRAME", "CODE_DEFINE_FONT2", "CODE_GEN_COMMAND", "CODE_DEFINE_COMMAND_OBJECT", "CODE_CHARACTER_SET", "CODE_EXTERNAL_FONT", "CODE_DEFINE_FUNCTION", "CODE_PLACE_FUNCTION", "CODE_GEN_TAG_OBJECTS", "CODE_EXPORT_ASSETS", "CODE_IMPORT_ASSETS", "CODE_ENABLE_DEBUGGER", "CODE_DO_INIT_ACTION", "CODE_DEFINE_VIDEO_STREAM", "CODE_VIDEO_FRAME", "CODE_DEFINE_FONT_INFO2", "CODE_DEBUG_ID", "CODE_ENABLE_DEBUGGER2", "CODE_SCRIPT_LIMITS", "CODE_SET_TAB_INDEX", "CODE_DEFINE_SHAPE4", "INVALID", "CODE_FILE_ATTRIBUTES", "CODE_PLACE_OBJECT3", "CODE_IMPORT_ASSETS2", "CODE_DO_ABC_DEFINE", "CODE_DEFINE_FONT_ALIGN_ZONES", "CODE_CSM_TEXT_SETTINGS", "CODE_DEFINE_FONT3", "CODE_SYMBOL_CLASS", "CODE_METADATA", "CODE_DEFINE_SCALING_GRID", "INVALID", "INVALID", "INVALID", "CODE_DO_ABC", "CODE_DEFINE_SHAPE4", "CODE_DEFINE_MORPH_SHAPE2", "INVALID", "CODE_DEFINE_SCENE_AND_FRAME_LABEL_DATA", "CODE_DEFINE_BINARY_DATA", "CODE_DEFINE_FONT_NAME", "CODE_START_SOUND2", "CODE_DEFINE_BITS_JPEG4", "CODE_DEFINE_FONT4", "CODE_TELEMETRY"];
            function getSwfTagCodeName(tagCode) {
                return release ? "SwfTagCode: " + tagCode : SwfTagCodeNames[tagCode];
            }
            Parser.getSwfTagCodeName = getSwfTagCodeName;
            (function (DefinitionTags) {
                DefinitionTags[DefinitionTags["CODE_DEFINE_SHAPE"] = 2] = "CODE_DEFINE_SHAPE";
                DefinitionTags[DefinitionTags["CODE_DEFINE_BITS"] = 6] = "CODE_DEFINE_BITS";
                DefinitionTags[DefinitionTags["CODE_DEFINE_BUTTON"] = 7] = "CODE_DEFINE_BUTTON";
                DefinitionTags[DefinitionTags["CODE_DEFINE_FONT"] = 10] = "CODE_DEFINE_FONT";
                DefinitionTags[DefinitionTags["CODE_DEFINE_TEXT"] = 11] = "CODE_DEFINE_TEXT";
                DefinitionTags[DefinitionTags["CODE_DEFINE_SOUND"] = 14] = "CODE_DEFINE_SOUND";
                DefinitionTags[DefinitionTags["CODE_DEFINE_BITS_LOSSLESS"] = 20] = "CODE_DEFINE_BITS_LOSSLESS";
                DefinitionTags[DefinitionTags["CODE_DEFINE_BITS_JPEG2"] = 21] = "CODE_DEFINE_BITS_JPEG2";
                DefinitionTags[DefinitionTags["CODE_DEFINE_SHAPE2"] = 22] = "CODE_DEFINE_SHAPE2";
                DefinitionTags[DefinitionTags["CODE_DEFINE_SHAPE3"] = 32] = "CODE_DEFINE_SHAPE3";
                DefinitionTags[DefinitionTags["CODE_DEFINE_TEXT2"] = 33] = "CODE_DEFINE_TEXT2";
                DefinitionTags[DefinitionTags["CODE_DEFINE_BUTTON2"] = 34] = "CODE_DEFINE_BUTTON2";
                DefinitionTags[DefinitionTags["CODE_DEFINE_BITS_JPEG3"] = 35] = "CODE_DEFINE_BITS_JPEG3";
                DefinitionTags[DefinitionTags["CODE_DEFINE_BITS_LOSSLESS2"] = 36] = "CODE_DEFINE_BITS_LOSSLESS2";
                DefinitionTags[DefinitionTags["CODE_DEFINE_EDIT_TEXT"] = 37] = "CODE_DEFINE_EDIT_TEXT";
                DefinitionTags[DefinitionTags["CODE_DEFINE_SPRITE"] = 39] = "CODE_DEFINE_SPRITE";
                DefinitionTags[DefinitionTags["CODE_DEFINE_MORPH_SHAPE"] = 46] = "CODE_DEFINE_MORPH_SHAPE";
                DefinitionTags[DefinitionTags["CODE_DEFINE_FONT2"] = 48] = "CODE_DEFINE_FONT2";
                DefinitionTags[DefinitionTags["CODE_DEFINE_VIDEO_STREAM"] = 60] = "CODE_DEFINE_VIDEO_STREAM";
                DefinitionTags[DefinitionTags["CODE_DEFINE_FONT3"] = 75] = "CODE_DEFINE_FONT3";
                DefinitionTags[DefinitionTags["CODE_DEFINE_SHAPE4"] = 83] = "CODE_DEFINE_SHAPE4";
                DefinitionTags[DefinitionTags["CODE_DEFINE_MORPH_SHAPE2"] = 84] = "CODE_DEFINE_MORPH_SHAPE2";
                DefinitionTags[DefinitionTags["CODE_DEFINE_BINARY_DATA"] = 87] = "CODE_DEFINE_BINARY_DATA";
                DefinitionTags[DefinitionTags["CODE_DEFINE_BITS_JPEG4"] = 90] = "CODE_DEFINE_BITS_JPEG4";
                DefinitionTags[DefinitionTags["CODE_DEFINE_FONT4"] = 91] = "CODE_DEFINE_FONT4";
            })(Parser.DefinitionTags || (Parser.DefinitionTags = {}));
            var DefinitionTags = Parser.DefinitionTags;
            (function (ImageDefinitionTags) {
                ImageDefinitionTags[ImageDefinitionTags["CODE_DEFINE_BITS"] = 6] = "CODE_DEFINE_BITS";
                ImageDefinitionTags[ImageDefinitionTags["CODE_DEFINE_BITS_JPEG2"] = 21] = "CODE_DEFINE_BITS_JPEG2";
                ImageDefinitionTags[ImageDefinitionTags["CODE_DEFINE_BITS_JPEG3"] = 35] = "CODE_DEFINE_BITS_JPEG3";
                ImageDefinitionTags[ImageDefinitionTags["CODE_DEFINE_BITS_JPEG4"] = 90] = "CODE_DEFINE_BITS_JPEG4";
            })(Parser.ImageDefinitionTags || (Parser.ImageDefinitionTags = {}));
            var ImageDefinitionTags = Parser.ImageDefinitionTags;
            (function (FontDefinitionTags) {
                FontDefinitionTags[FontDefinitionTags["CODE_DEFINE_FONT"] = 10] = "CODE_DEFINE_FONT";
                FontDefinitionTags[FontDefinitionTags["CODE_DEFINE_FONT2"] = 48] = "CODE_DEFINE_FONT2";
                FontDefinitionTags[FontDefinitionTags["CODE_DEFINE_FONT3"] = 75] = "CODE_DEFINE_FONT3";
                FontDefinitionTags[FontDefinitionTags["CODE_DEFINE_FONT4"] = 91] = "CODE_DEFINE_FONT4";
            })(Parser.FontDefinitionTags || (Parser.FontDefinitionTags = {}));
            var FontDefinitionTags = Parser.FontDefinitionTags;
            (function (ControlTags) {
                ControlTags[ControlTags["CODE_PLACE_OBJECT"] = 4] = "CODE_PLACE_OBJECT";
                ControlTags[ControlTags["CODE_PLACE_OBJECT2"] = 26] = "CODE_PLACE_OBJECT2";
                ControlTags[ControlTags["CODE_PLACE_OBJECT3"] = 70] = "CODE_PLACE_OBJECT3";
                ControlTags[ControlTags["CODE_REMOVE_OBJECT"] = 5] = "CODE_REMOVE_OBJECT";
                ControlTags[ControlTags["CODE_REMOVE_OBJECT2"] = 28] = "CODE_REMOVE_OBJECT2";
                ControlTags[ControlTags["CODE_START_SOUND"] = 15] = "CODE_START_SOUND";
                ControlTags[ControlTags["CODE_START_SOUND2"] = 89] = "CODE_START_SOUND2";
                ControlTags[ControlTags["CODE_VIDEO_FRAME"] = 61] = "CODE_VIDEO_FRAME";
            })(Parser.ControlTags || (Parser.ControlTags = {}));
            var ControlTags = Parser.ControlTags;
        })(Parser = SWF.Parser || (SWF.Parser = {}));
    })(SWF = Shumway.SWF || (Shumway.SWF = {}));
})(Shumway || (Shumway = {}));
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
var Shumway;
(function (Shumway) {
    var unexpected = Shumway.Debug.unexpected;
    var BinaryFileReader = (function () {
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
            xhr.open(this.method || "GET", this.url, async);
            xhr.responseType = "arraybuffer";
            if (progress) {
                xhr.onprogress = function (event) {
                    progress(xhr.response, event.loaded, event.total);
                };
            }
            xhr.onreadystatechange = function (event) {
                if (xhr.readyState === 4) {
                    if (xhr.status !== 200 && xhr.status !== 0 || xhr.response === null) {
                        unexpected("Path: " + url + " not found.");
                        complete(null, xhr.statusText);
                        return;
                    }
                    complete(xhr.response);
                }
            };
            if (this.mimeType) {
                xhr.setRequestHeader("Content-Type", this.mimeType);
            }
            xhr.send(this.data || null);
        };
        BinaryFileReader.prototype.readChunked = function (chunkSize /* int */, ondata, onerror, onopen, oncomplete, onhttpstatus) {
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
                    ondata(buffer, { loaded: read, total: total });
                    position = 0;
                }
                buffer.set(data.subarray(offset), position);
                position += left;
            }, onerror, onopen, function () {
                if (position > 0) {
                    read += position;
                    ondata(buffer.subarray(0, position), { loaded: read, total: total });
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
            xhr.open(this.method || "GET", url, true);
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
                ondata(bytes, { loaded: loaded, total: total });
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
                    if (xhr.status !== 200 && xhr.status !== 0 ||
                        xhr.response === null && (total === 0 || loaded !== total)) {
                        onerror(xhr.statusText);
                        return;
                    }
                    if (isNotProgressive) {
                        var buffer = xhr.response;
                        ondata(new Uint8Array(buffer), { loaded: buffer.byteLength, total: buffer.byteLength });
                    }
                }
            };
            xhr.onload = function () {
                if (oncomplete) {
                    oncomplete();
                }
            };
            if (this.mimeType) {
                xhr.setRequestHeader("Content-Type", this.mimeType);
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
    })();
    Shumway.BinaryFileReader = BinaryFileReader;
})(Shumway || (Shumway = {}));
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
var Shumway;
(function (Shumway) {
    // Produces similar output as flashlog.txt It can be produced by the
    // debug builds of Flash Player.
    // See https://github.com/mozilla/shumway/wiki/Trace-Output-with-Flash-Player-Debugger
    var FlashLog = (function () {
        function FlashLog() {
            this.isAS3TraceOn = true;
            this._startTime = Date.now();
        }
        Object.defineProperty(FlashLog.prototype, "currentTimestamp", {
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
    })();
    Shumway.FlashLog = FlashLog;
    Shumway.flashlog = null;
})(Shumway || (Shumway = {}));
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
    var Remoting;
    (function (Remoting) {
        (function (FilterType) {
            FilterType[FilterType["Blur"] = 0] = "Blur";
            FilterType[FilterType["DropShadow"] = 1] = "DropShadow";
            FilterType[FilterType["ColorMatrix"] = 2] = "ColorMatrix";
        })(Remoting.FilterType || (Remoting.FilterType = {}));
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
        var WindowTransportPeer = (function () {
            function WindowTransportPeer(window, target) {
                this.window = window;
                this.target = target;
                //
            }
            Object.defineProperty(WindowTransportPeer.prototype, "onAsyncMessage", {
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
            Object.defineProperty(WindowTransportPeer.prototype, "onSyncMessage", {
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
        })();
        Remoting.WindowTransportPeer = WindowTransportPeer;
        /**
         * Implementation of ITransportPeer that uses ShumwayCom API to exchange data
         * between messaging peers.
         */
        var ShumwayComTransportPeer = (function () {
            function ShumwayComTransportPeer() {
            }
            Object.defineProperty(ShumwayComTransportPeer.prototype, "onAsyncMessage", {
                set: function (callback) {
                    ShumwayCom.setAsyncMessageCallback(callback);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(ShumwayComTransportPeer.prototype, "onSyncMessage", {
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
        })();
        Remoting.ShumwayComTransportPeer = ShumwayComTransportPeer;
    })(Remoting = Shumway.Remoting || (Shumway.Remoting = {}));
})(Shumway || (Shumway = {}));
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