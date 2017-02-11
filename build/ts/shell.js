var Shumway;
(function (Shumway) {
    Shumway.version = '0.11.622';
    Shumway.build = '16451d8';
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
var microTaskQueue = null;
this.self = this;
this.window = this;
this.console = {
    _print: print,
    log: print,
    info: function () {
        if (!Shumway.Shell.verbose) {
            return;
        }
        print(Shumway.IndentingWriter.YELLOW + Shumway.argumentsToString(arguments) +
            Shumway.IndentingWriter.ENDC);
    },
    warn: function () {
        print(Shumway.IndentingWriter.RED + Shumway.argumentsToString(arguments) +
            Shumway.IndentingWriter.ENDC);
    },
    error: function () {
        print(Shumway.IndentingWriter.BOLD_RED + Shumway.argumentsToString(arguments) +
            Shumway.IndentingWriter.ENDC + '\nstack:\n' + (new Error().stack));
    },
    time: function () { },
    timeEnd: function () { }
};
this.dump = function (message) {
    putstr(Shumway.argumentsToString(arguments));
};
this.addEventListener = function (type) {
    // console.log('Add listener: ' + type);
};
var defaultTimerArgs = [];
this.setTimeout = function (fn, interval) {
    var args = arguments.length > 2 ? Array.prototype.slice.call(arguments, 2) : defaultTimerArgs;
    var task = microTaskQueue.scheduleInterval(fn, args, interval, false);
    return task.id;
};
this.setInterval = function (fn, interval) {
    var args = arguments.length > 2 ? Array.prototype.slice.call(arguments, 2) : defaultTimerArgs;
    var task = microTaskQueue.scheduleInterval(fn, args, interval, true);
    return task.id;
};
this.clearTimeout = function (id) {
    microTaskQueue.remove(id);
};
this.clearInterval = clearTimeout;
this.navigator = {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.6; rv:4.0) Gecko/20100101 Firefox/4.0'
};
// TODO remove document stub
this.document = {
    createElementNS: function (ns, qname) {
        if (qname !== 'svg') {
            throw new Error('only supports svg and create SVGMatrix');
        }
        return {
            createSVGMatrix: function () {
                return { a: 0, b: 0, c: 0, d: 0, e: 0, f: 0 };
            }
        };
    },
    createElement: function (name) {
        if (name !== 'canvas') {
            throw new Error('only supports canvas');
        }
        return {
            getContext: function (type) {
                if (type !== '2d') {
                    throw new Error('only supports canvas 2d');
                }
                return {};
            }
        };
    },
    location: {
        href: {
            resource: "" //shumway/build/ts/shell.js"
        }
    }
};
this.Image = function () { };
this.Image.prototype = {};
this.URL = function (url, baseURL) {
    if (baseURL === void 0) { baseURL = ''; }
    url = url + '';
    baseURL = baseURL + '';
    if (url.indexOf('://') >= 0 || baseURL === url) {
        this._setURL(url);
        return;
    }
    var base = baseURL || '';
    var base = base.lastIndexOf('/') >= 0 ? base.substring(0, base.lastIndexOf('/') + 1) : '';
    if (url.indexOf('/') === 0) {
        var m = /^[^:]+:\/\/[^\/]+/.exec(base);
        if (m)
            base = m[0];
    }
    this._setURL(base + url);
};
this.URL.prototype = {
    _setURL: function (url) {
        this.href = url + '';
        // Simple parsing to extract protocol, hostname and port.
        var m = /^(\w+:)\/\/([^:/]+)(:([0-9]+))?/.exec(url.toLowerCase());
        if (m) {
            this.protocol = m[1];
            this.hostname = m[2];
            this.port = m[4] || '';
        }
        else {
            this.protocol = 'file:';
            this.hostname = '';
            this.port = '';
        }
    },
    toString: function () {
        return this.href;
    }
};
this.URL.createObjectURL = function createObjectURL() {
    return "";
};
this.Blob = function () { };
this.Blob.prototype = {};
this.XMLHttpRequest = function () { };
this.XMLHttpRequest.prototype = {
    open: function (method, url, async) {
        this.url = url;
        if (async === false) {
            throw new Error('Unsupported sync');
        }
    },
    send: function (data) {
        setTimeout(function () {
            try {
                console.log('XHR: ' + this.url);
                var response = this.responseType === 'arraybuffer' ?
                    read(this.url, 'binary').buffer : read(this.url);
                if (this.responseType === 'json') {
                    response = JSON.parse(response);
                }
                this.response = response;
                this.readyState = 4;
                this.status = 200;
                this.onreadystatechange && this.onreadystatechange();
                this.onload && this.onload();
            }
            catch (e) {
                this.error = e;
                this.readyState = 4;
                this.status = 404;
                this.onreadystatechange && this.onreadystatechange();
                this.onerror && this.onerror();
            }
        }.bind(this));
    }
};
this.window.screen = {
    width: 1024,
    height: 1024
};
/**
 * sessionStorage polyfill.
 */
var sessionStorageObject = {};
this.window.sessionStorage = {
    getItem: function (key) {
        return sessionStorageObject[key];
    },
    setItem: function (key, value) {
        sessionStorageObject[key] = value;
    },
    removeItem: function (key) {
        delete sessionStorageObject[key];
    }
};
/**
 * Promise polyfill.
 */
this.window.Promise = (function () {
    function getDeferred(C) {
        if (typeof C !== 'function') {
            throw new TypeError('Invalid deferred constructor');
        }
        var resolver = createDeferredConstructionFunctions();
        var promise = new C(resolver);
        var resolve = resolver.resolve;
        if (typeof resolve !== 'function') {
            throw new TypeError('Invalid resolve construction function');
        }
        var reject = resolver.reject;
        if (typeof reject !== 'function') {
            throw new TypeError('Invalid reject construction function');
        }
        return { promise: promise, resolve: resolve, reject: reject };
    }
    function updateDeferredFromPotentialThenable(x, deferred) {
        if (typeof x !== 'object' || x === null) {
            return false;
        }
        try {
            var then = x.then;
            if (typeof then !== 'function') {
                return false;
            }
            var thenCallResult = then.call(x, deferred.resolve, deferred.reject);
        }
        catch (e) {
            var reject = deferred.reject;
            reject(e);
        }
        return true;
    }
    function isPromise(x) {
        return typeof x === 'object' && x !== null &&
            typeof x.promiseStatus !== 'undefined';
    }
    function rejectPromise(promise, reason) {
        if (promise.promiseStatus !== 'unresolved') {
            return;
        }
        var reactions = promise.rejectReactions;
        promise.result = reason;
        promise.resolveReactions = undefined;
        promise.rejectReactions = undefined;
        promise.promiseStatus = 'has-rejection';
        triggerPromiseReactions(reactions, reason);
    }
    function resolvePromise(promise, resolution) {
        if (promise.promiseStatus !== 'unresolved') {
            return;
        }
        var reactions = promise.resolveReactions;
        promise.result = resolution;
        promise.resolveReactions = undefined;
        promise.rejectReactions = undefined;
        promise.promiseStatus = 'has-resolution';
        triggerPromiseReactions(reactions, resolution);
    }
    function triggerPromiseReactions(reactions, argument) {
        for (var i = 0; i < reactions.length; i++) {
            queueMicrotask({ reaction: reactions[i], argument: argument });
        }
    }
    function queueMicrotask(task) {
        if (microtasksQueue.length === 0) {
            setTimeout(handleMicrotasksQueue, 0);
        }
        microtasksQueue.push(task);
    }
    function executePromiseReaction(reaction, argument) {
        var deferred = reaction.deferred;
        var handler = reaction.handler;
        var handlerResult, updateResult;
        try {
            handlerResult = handler(argument);
        }
        catch (e) {
            var reject = deferred.reject;
            return reject(e);
        }
        if (handlerResult === deferred.promise) {
            var reject = deferred.reject;
            return reject(new TypeError('Self resolution'));
        }
        try {
            updateResult = updateDeferredFromPotentialThenable(handlerResult, deferred);
            if (!updateResult) {
                var resolve = deferred.resolve;
                return resolve(handlerResult);
            }
        }
        catch (e) {
            var reject = deferred.reject;
            return reject(e);
        }
    }
    var microtasksQueue = [];
    function handleMicrotasksQueue() {
        while (microtasksQueue.length > 0) {
            var task = microtasksQueue[0];
            try {
                executePromiseReaction(task.reaction, task.argument);
            }
            catch (e) {
                // unhandler onFulfillment/onRejection exception
                if (typeof Promise.onerror === 'function') {
                    Promise.onerror(e);
                }
            }
            microtasksQueue.shift();
        }
    }
    function throwerFunction(e) {
        throw e;
    }
    function identityFunction(x) {
        return x;
    }
    function createRejectPromiseFunction(promise) {
        return function (reason) {
            rejectPromise(promise, reason);
        };
    }
    function createResolvePromiseFunction(promise) {
        return function (resolution) {
            resolvePromise(promise, resolution);
        };
    }
    function createDeferredConstructionFunctions() {
        var fn = function (resolve, reject) {
            fn.resolve = resolve;
            fn.reject = reject;
        };
        return fn;
    }
    function createPromiseResolutionHandlerFunctions(promise, fulfillmentHandler, rejectionHandler) {
        return function (x) {
            if (x === promise) {
                return rejectionHandler(new TypeError('Self resolution'));
            }
            var cstr = promise.promiseConstructor;
            if (isPromise(x)) {
                var xConstructor = x.promiseConstructor;
                if (xConstructor === cstr) {
                    return x.then(fulfillmentHandler, rejectionHandler);
                }
            }
            var deferred = getDeferred(cstr);
            var updateResult = updateDeferredFromPotentialThenable(x, deferred);
            if (updateResult) {
                var deferredPromise = deferred.promise;
                return deferredPromise.then(fulfillmentHandler, rejectionHandler);
            }
            return fulfillmentHandler(x);
        };
    }
    function createPromiseAllCountdownFunction(index, values, deferred, countdownHolder) {
        return function (x) {
            values[index] = x;
            countdownHolder.countdown--;
            if (countdownHolder.countdown === 0) {
                deferred.resolve(values);
            }
        };
    }
    function Promise(resolver) {
        if (typeof resolver !== 'function') {
            throw new TypeError('resolver is not a function');
        }
        var promise = this;
        if (typeof promise !== 'object') {
            throw new TypeError('Promise to initialize is not an object');
        }
        promise.promiseStatus = 'unresolved';
        promise.resolveReactions = [];
        promise.rejectReactions = [];
        promise.result = undefined;
        var resolve = createResolvePromiseFunction(promise);
        var reject = createRejectPromiseFunction(promise);
        try {
            var result = resolver(resolve, reject);
        }
        catch (e) {
            rejectPromise(promise, e);
        }
        promise.promiseConstructor = Promise;
        return promise;
    }
    Promise.all = function (iterable) {
        var deferred = getDeferred(this);
        var values = [];
        var countdownHolder = { countdown: 0 };
        var index = 0;
        iterable.forEach(function (nextValue) {
            var nextPromise = this.cast(nextValue);
            var fn = createPromiseAllCountdownFunction(index, values, deferred, countdownHolder);
            nextPromise.then(fn, deferred.reject);
            index++;
            countdownHolder.countdown++;
        }, this);
        if (index === 0) {
            deferred.resolve(values);
        }
        return deferred.promise;
    };
    Promise.cast = function (x) {
        if (isPromise(x)) {
            return x;
        }
        var deferred = getDeferred(this);
        deferred.resolve(x);
        return deferred.promise;
    };
    Promise.reject = function (r) {
        var deferred = getDeferred(this);
        var rejectResult = deferred.reject(r);
        return deferred.promise;
    };
    Promise.resolve = function (x) {
        var deferred = getDeferred(this);
        var rejectResult = deferred.resolve(x);
        return deferred.promise;
    };
    Promise.prototype = {
        'catch': function (onRejected) {
            this.then(undefined, onRejected);
        },
        then: function (onFulfilled, onRejected) {
            var promise = this;
            if (!isPromise(promise)) {
                throw new TypeError('this is not a Promises');
            }
            var cstr = promise.promiseConstructor;
            var deferred = getDeferred(cstr);
            var rejectionHandler = typeof onRejected === 'function' ? onRejected :
                throwerFunction;
            var fulfillmentHandler = typeof onFulfilled === 'function' ? onFulfilled :
                identityFunction;
            var resolutionHandler = createPromiseResolutionHandlerFunctions(promise, fulfillmentHandler, rejectionHandler);
            var resolveReaction = { deferred: deferred, handler: resolutionHandler };
            var rejectReaction = { deferred: deferred, handler: rejectionHandler };
            switch (promise.promiseStatus) {
                case 'unresolved':
                    promise.resolveReactions.push(resolveReaction);
                    promise.rejectReactions.push(rejectReaction);
                    break;
                case 'has-resolution':
                    var resolution = promise.result;
                    queueMicrotask({ reaction: resolveReaction, argument: resolution });
                    break;
                case 'has-rejection':
                    var rejection = promise.result;
                    queueMicrotask({ reaction: rejectReaction, argument: rejection });
                    break;
            }
            return deferred.promise;
        }
    };
    return Promise;
})();
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
function addLogPrefix(prefix, args) {
    return [].concat.apply([prefix], args);
}
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
    var Unit;
    (function (Unit) {
        Unit.everFailed = false;
        Unit.testNumber = 0;
        Unit.writer;
        function fail(message) {
            Unit.everFailed = true;
            Unit.writer.errorLn(message);
        }
        Unit.fail = fail;
        function eqFloat(a, b, test, tolerance) {
            tolerance = typeof tolerance === "undefined" ? 0.1 : tolerance;
            test = description(test);
            var d = Math.abs(a - b);
            if (isNaN(d) || d >= tolerance) {
                return fail("FAIL" + test + ". Got " + a + ", expected " + b + failedLocation());
            }
            Unit.writer.debugLn("PASS" + test);
        }
        Unit.eqFloat = eqFloat;
        function neq(a, b, test) {
            test = description(test);
            if (a === b) {
                return fail("FAIL " + test + ". Got " + a + ", expected different (!==) value" +
                    failedLocation());
            }
            Unit.writer.debugLn("PASS" + test);
        }
        Unit.neq = neq;
        function eq(a, b, test) {
            test = description(test);
            if (a !== b) {
                return fail("FAIL" + test + ". Got " + a + ", expected " + b + failedLocation());
            }
            Unit.writer.debugLn("PASS" + test);
        }
        Unit.eq = eq;
        function eqArray(a, b, test) {
            test = description(test);
            if (a == undefined && b) {
                return fail("FAIL" + test + " Null Array: a" + failedLocation());
            }
            if (a && b == undefined) {
                return fail("FAIL" + test + " Null Array: b" + failedLocation());
            }
            if (a.length !== b.length) {
                return fail("FAIL" + test + " Array Length Mismatch, got " + a.length + ", expected " +
                    b.length + failedLocation());
            }
            for (var i = 0; i < a.length; i++) {
                if (a[i] !== b[i]) {
                    if (!(typeof a[i] == "number" && typeof b[i] == "number" && isNaN(a[i]) && isNaN(b[i]))) {
                        return fail("FAIL" + test + " Array Element " + i + ": got " + a[i] + ", expected " +
                            b[i] + failedLocation());
                    }
                }
            }
            Unit.writer.debugLn("PASS" + test);
        }
        Unit.eqArray = eqArray;
        function structEq(a, b, test) {
            test = description(test);
            if (a == undefined && b) {
                return fail("FAIL" + test + " Expected neither or both objects to be null/undefined, " +
                    "but only `a` was" + failedLocation());
            }
            if (a && b == undefined) {
                return fail("FAIL" + test + " Expected neither or both objects to be null/undefined, " +
                    "but only `b` was" + failedLocation());
            }
            var aKeys = Object.keys(a);
            var bKeys = Object.keys(b);
            for (var i = 0; i < aKeys.length; i++) {
                var key = aKeys[i];
                if (a[key] !== b[key]) {
                    return fail("FAIL" + test + " properties differ. a." + key + " = " + a[key] +
                        ", b." + key + " = " + b[key] + failedLocation());
                }
            }
            for (i = 0; i < bKeys.length; i++) {
                key = bKeys[i];
                if (a[key] !== b[key]) {
                    return fail("FAIL" + test + " properties differ. a." + key + " = " + a[key] +
                        ", b." + key + " = " + b[key] + failedLocation());
                }
            }
            Unit.writer.debugLn("PASS" + test);
        }
        Unit.structEq = structEq;
        function matrixEq(a, b, test) {
            test = description(test);
            if (a == undefined && b) {
                return fail("FAIL" + test + " Expected neither or both objects to be null/undefined, " +
                    "but only `a` was" + failedLocation());
            }
            if (a && b == undefined) {
                return fail("FAIL" + test + " Expected neither or both objects to be null/undefined, " +
                    "but only `b` was" + failedLocation());
            }
            if (a.a !== b.a || a.b !== b.b ||
                a.c !== b.c || a.d !== b.d ||
                a.tx !== b.tx || a.ty !== b.ty) {
                return fail("FAIL" + test + " matrices differ." + failedLocation());
            }
            Unit.writer.debugLn("PASS" + test);
        }
        Unit.matrixEq = matrixEq;
        function check(condition, test) {
            test = description(test);
            if (!condition) {
                return fail("FAIL" + test + ". Got " + condition + ", expected truthy value" +
                    failedLocation());
            }
            Unit.writer.debugLn("PASS" + test);
        }
        Unit.check = check;
        function assertThrowsInstanceOf(f, ctor, test) {
            test = description(test);
            var msg;
            try {
                f();
            }
            catch (exc) {
                if (exc instanceof ctor) {
                    return;
                }
                msg = "Expected exception " + ctor.name + ", got " + exc;
            }
            if (msg === undefined) {
                msg = "Expected exception " + ctor.name + ", no exception thrown";
            }
            return fail("FAIL " + test + ". " + msg + failedLocation());
        }
        Unit.assertThrowsInstanceOf = assertThrowsInstanceOf;
        function description(test) {
            Unit.testNumber++;
            return test ? ": " + test : " #" + Unit.testNumber;
        }
        Unit.description = description;
        function failedLocation() {
            return " (" + new Error().stack.split('\n')[2] + ")";
        }
        Unit.failedLocation = failedLocation;
        function info(s) {
            Unit.writer.infoLn("INFO: " + s);
        }
        Unit.info = info;
        function warn(s) {
            Unit.writer.warnLn("WARN: " + s);
        }
        Unit.warn = warn;
        function error(s) {
            Unit.writer.errorLn("ERROR: " + s);
        }
        Unit.error = error;
        var maxVarianceTime = 1;
        var minElapsedTime = 100;
        var maxElapsedTime = 1000;
        /**
         * Measures several runs of a test case and tries to ensure that the test case is reasonably fast, yet still accurate.
         */
        function checkTime(fn, test, threshold, iterations, help) {
            if (iterations === void 0) { iterations = 64; }
            if (help === void 0) { help = true; }
            iterations = iterations || 0;
            if (help && iterations < 5) {
                Unit.writer.warnLn("Test doesn't have enough iterations to get meaningful timing results: " + test);
            }
            else if (help && iterations > 1024) {
                Unit.writer.warnLn("Test has too many iterations, increase the complexity of the test case: " + test);
            }
            var start = new Date();
            var s = 0;
            var elapsedTimes = [];
            for (var i = 0; i < iterations; i++) {
                var iterationStart = Date.now();
                s += fn();
                elapsedTimes.push(Date.now() - iterationStart);
            }
            var elapsed = (new Date() - start);
            // Let's not make the test too short, or too long.
            if (help && elapsed < minElapsedTime) {
                Unit.writer.warnLn("Test doesn't run long enough (" + elapsed.toFixed(2) + " ms) to have meaningful timing results: " + test + ", must be at least " + minElapsedTime + " ms long.");
            }
            else if (help && elapsed > maxElapsedTime) {
                Unit.writer.warnLn("Test runs too long (" + elapsed.toFixed(2) + " ms), reduce the number of iterations: " + test + ", keep it below " + maxElapsedTime.toFixed(2) + " ms.");
            }
            var result = Math.min.apply(null, elapsedTimes);
            // Can we make the test smaller yet get the same result?
            if (help && elapsed > 500 && result === Math.min.apply(null, elapsedTimes.slice(0, elapsedTimes.length / 2 | 0))) {
                Unit.writer.warnLn("Test would have had the same result with half as many iterations.");
            }
            if (result > threshold) {
                return fail("FAIL " + test + ". Got " + result.toFixed(2) + " ms, expected less than " + threshold.toFixed(2) + " ms" +
                    failedLocation());
            }
            var details = "Iterations: " + iterations + ", Elapsed: " + elapsed.toFixed(2) + " ms (" + result.toFixed(2) + " ms / Iteration)";
            Unit.writer.debugLn("PASS " + test + " " + details);
            var min = Math.min.apply(null, elapsedTimes);
            var max = Math.max.apply(null, elapsedTimes);
            var maxBarWidth = 32;
            for (var i = 0; i < Math.min(elapsedTimes.length, 8); i++) {
                var j = elapsedTimes.length - i - 1;
                var time = (elapsedTimes[j] - min) / (max - min);
                var ticks = Math.round(time * maxBarWidth);
                Unit.writer.debugLn(String(j).padLeft(" ", 4) + ": =" + Shumway.StringUtilities.repeatString("=", ticks) + " " + elapsedTimes[j].toFixed(2) + " ms");
            }
        }
        Unit.checkTime = checkTime;
    })(Unit = Shumway.Unit || (Shumway.Unit = {}));
})(Shumway || (Shumway = {}));
/**
 * Exported on the global object since unit tests don't import them explicitly.
 */
var check = Shumway.Unit.check;
var checkTime = Shumway.Unit.checkTime;
var fail = Shumway.Unit.fail;
var eqFloat = Shumway.Unit.eqFloat;
var neq = Shumway.Unit.neq;
var eq = Shumway.Unit.eq;
var eqArray = Shumway.Unit.eqArray;
var structEq = Shumway.Unit.structEq;
var matrixEq = Shumway.Unit.matrixEq;
var assertThrowsInstanceOf = Shumway.Unit.assertThrowsInstanceOf;
var info = Shumway.Unit.info;
// import warn = Shumway.Unit.warn;
var error = Shumway.Unit.error;
var Shumway;
(function (Shumway) {
    var Shell;
    (function (Shell) {
        var Fuzz;
        (function (Fuzz) {
            var Mill = (function () {
                function Mill(writer, kind) {
                    this._writer = writer;
                    this._kind = kind;
                }
                Mill.prototype.fuzz = function () {
                    Shumway.Random.seed(Date.now());
                    for (var i = 0; i < 1; i++) {
                        writeSWF(this._writer, randomNumber(10, 17));
                    }
                };
                return Mill;
            })();
            Fuzz.Mill = Mill;
            function randomNumber(min, max, exclude) {
                if (exclude === void 0) { exclude = Infinity; }
                do {
                    var value = Math.floor(Math.random() * (max - min + 1)) + min;
                } while (value === exclude);
                return value;
            }
            function makeRandomNumber(min, max) {
                return randomNumber.bind(null, min, max);
            }
            function probaility(value) {
                return Math.random() <= value;
            }
            function writeSWF(writer, version) {
                writer.enter('<swf version="' + version + '" compressed="1">');
                writeHeader(writer);
                writer.leave('</swf>');
            }
            function writeHeader(writer) {
                var frameCount = randomNumber(10, 100);
                writer.enter('<Header framerate="120" frames="' + frameCount + '">');
                writer.enter('<size>');
                writer.writeLn('<Rectangle left="0" right="2000" top="0" bottom="2000"/>');
                writer.leave('</size>');
                writer.enter('<tags>');
                writer.writeLn('<FileAttributes hasMetaData="1" allowABC="0" suppressCrossDomainCaching="0" swfRelativeURLs="0" useNetwork="0"/>');
                var frameCount = randomNumber(1, 32);
                for (var i = 0; i < frameCount; i++) {
                    writeFrame(writer, true, frameCount, -1);
                }
                writeActions(writer, makeFSCommandQuit);
                writer.writeLn('<ShowFrame/>'); // Need a show frame here for this to execute.
                writer.leave('</tags>');
                writer.leave('</Header>');
            }
            function makeSequenceWriter(sequence) {
                return function (writer) {
                    for (var i = 0; i < sequence.length; i++) {
                        sequence[i](writer);
                    }
                };
            }
            function writeDefineSprite(writer, id, frameCount) {
                writer.enter('<DefineSprite objectID="' + id + '" frames="' + frameCount + '">');
                writer.enter('<tags>');
                for (var i = 0; i < frameCount; i++) {
                    writeFrame(writer, false, frameCount, id);
                }
                writer.leave('</tags>');
                writer.leave('</DefineSprite>');
            }
            var spriteCount = 1;
            function writeFrame(writer, root, frameCount, id) {
                if (probaility(0.5)) {
                    var sequence = [
                        writeTraceCurrentFrameAction
                    ];
                    if (!root) {
                        sequence.push(makeGotoFrameAction(makeRandomNumber(0, frameCount)));
                    }
                    writeActions(writer, makeSequenceWriter(sequence));
                }
                if (probaility(0.5) && (spriteCount - 1 !== id)) {
                    writePlaceObject2(writer, randomNumber(0, 1024), randomNumber(1, spriteCount - 1, id));
                }
                writer.writeLn('<ShowFrame/>');
                if (root) {
                    if (probaility(0.3)) {
                        writeDefineSprite(writer, spriteCount++, randomNumber(5, 10));
                    }
                }
            }
            function writeActions(writer, actionsWriter) {
                writer.enter('<DoAction>');
                writer.enter('<actions>');
                actionsWriter(writer);
                writer.writeLn('<EndAction/>');
                writer.leave('</actions>');
                writer.leave('</DoAction>');
            }
            function writePlaceObject2(writer, depth, id) {
                writer.enter('<PlaceObject2 replace="0" depth="' + depth + '" objectID="' + id + '">');
                writer.enter('<transform>');
                writer.writeLn('<Transform transX="0" transY="0"/>');
                writer.leave('</transform>');
                writer.leave('</PlaceObject2>');
            }
            function makeGotoFrameAction(frameNumber) {
                return function (writer) {
                    // writer.writeLn('<GotoFrame frame="' + frameNumber() + '"/>');
                };
            }
            function makeFSCommandQuit(writer) {
                writer.writeLn('<GetURL url="FSCommand:quit" target=""/>');
            }
            function writeTraceCurrentFrameAction(writer) {
                writer.writeLn('<PushData>');
                writer.writeLn('  <items>');
                writer.writeLn('    <StackString value="this"/>');
                writer.writeLn('  </items>');
                writer.writeLn('</PushData>');
                writer.writeLn('<GetVariable/>');
                writer.writeLn('  <PushData>');
                writer.writeLn('    <items>');
                writer.writeLn('      <StackString value="_currentframe"/>');
                writer.writeLn('    </items>');
                writer.writeLn('  </PushData>');
                writer.writeLn('<GetMember/>');
                writer.writeLn('<Trace/>');
            }
        })(Fuzz = Shell.Fuzz || (Shell.Fuzz = {}));
    })(Shell = Shumway.Shell || (Shumway.Shell = {}));
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
    var Shell;
    (function (Shell) {
        var MicroTask = (function () {
            function MicroTask(id, fn, args, interval, repeat) {
                this.id = id;
                this.fn = fn;
                this.args = args;
                this.interval = interval;
                this.repeat = repeat;
            }
            return MicroTask;
        })();
        Shell.MicroTask = MicroTask;
        var jsGlobal = (function () { return this || (1, eval)('this//# sourceURL=jsGlobal-getter'); })();
        var MicroTasksQueue = (function () {
            function MicroTasksQueue() {
                this.tasks = [];
                this.nextId = 1;
                this.time = 1388556000000; // 1-Jan-2014
                this.stopped = true;
            }
            Object.defineProperty(MicroTasksQueue.prototype, "isEmpty", {
                get: function () {
                    return this.tasks.length === 0;
                },
                enumerable: true,
                configurable: true
            });
            MicroTasksQueue.prototype.scheduleInterval = function (fn, args, interval, repeat) {
                var MIN_INTERVAL = 4;
                interval = Math.round((interval || 0) / 10) * 10;
                if (interval < MIN_INTERVAL) {
                    interval = MIN_INTERVAL;
                }
                var taskId = this.nextId++;
                var task = new MicroTask(taskId, fn, args, interval, repeat);
                this.enqueue(task);
                return task;
            };
            MicroTasksQueue.prototype.enqueue = function (task) {
                var tasks = this.tasks;
                task.runAt = this.time + task.interval;
                var i = tasks.length;
                while (i > 0 && tasks[i - 1].runAt > task.runAt) {
                    i--;
                }
                if (i === tasks.length) {
                    tasks.push(task);
                }
                else {
                    tasks.splice(i, 0, task);
                }
            };
            MicroTasksQueue.prototype.dequeue = function () {
                var task = this.tasks.shift();
                this.time = task.runAt;
                return task;
            };
            MicroTasksQueue.prototype.remove = function (id) {
                var tasks = this.tasks;
                for (var i = 0; i < tasks.length; i++) {
                    if (tasks[i].id === id) {
                        tasks.splice(i, 1);
                        return;
                    }
                }
            };
            MicroTasksQueue.prototype.clear = function () {
                this.tasks.length = 0;
            };
            /**
             * Runs micro tasks for a certain |duration| and |count| whichever comes first. Optionally,
             * if the |clear| option is specified, the micro task queue is cleared even if not all the
             * tasks have been executed.
             *
             * If a |preCallback| function is specified, only continue execution if |preCallback()| returns true.
             */
            MicroTasksQueue.prototype.run = function (duration, count, clear, preCallback) {
                if (duration === void 0) { duration = 0; }
                if (count === void 0) { count = 0; }
                if (clear === void 0) { clear = false; }
                if (preCallback === void 0) { preCallback = null; }
                this.stopped = false;
                var executedTasks = 0;
                var stopAt = Date.now() + duration;
                while (!this.isEmpty && !this.stopped) {
                    if (duration > 0 && Date.now() >= stopAt) {
                        break;
                    }
                    if (count > 0 && executedTasks >= count) {
                        break;
                    }
                    var task = this.dequeue();
                    if (preCallback && !preCallback(task)) {
                        return;
                    }
                    task.fn.apply(null, task.args);
                    executedTasks++;
                }
                if (clear) {
                    this.clear();
                }
                this.stopped = true;
            };
            MicroTasksQueue.prototype.stop = function () {
                this.stopped = true;
            };
            return MicroTasksQueue;
        })();
        Shell.MicroTasksQueue = MicroTasksQueue;
    })(Shell = Shumway.Shell || (Shumway.Shell = {}));
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
    var Shell;
    (function (Shell) {
        var ShellBinaryFileReader = (function () {
            function ShellBinaryFileReader(url, method, mimeType, data) {
                this.url = url;
                this.method = method;
                this.mimeType = mimeType;
                this.data = data;
            }
            ShellBinaryFileReader.prototype.readAll = function (progress, complete) {
                setTimeout(function () {
                    try {
                        var url = this.url + '';
                        var strippedUrl = url.indexOf('file://') === 0 ? url.substr(7) : url;
                        complete(read(strippedUrl, 'binary'));
                    }
                    catch (e) {
                        complete(null, 'Can\'t read ' + this.url);
                    }
                }.bind(this));
            };
            ShellBinaryFileReader.prototype.readAsync = function (ondata, onerror, onopen, oncomplete, onhttpstatus) {
                onopen && setTimeout(onopen);
                this.readAll(null, function (data, err) {
                    if (data) {
                        ondata(data, { loaded: data.byteLength, total: data.byteLength });
                        oncomplete();
                    }
                    else {
                        onerror(err);
                    }
                });
            };
            return ShellBinaryFileReader;
        })();
        var shellTelemetry = {
            reportTelemetry: function (data) {
            }
        };
        var shellFileLoadingService = {
            baseUrl: null,
            createSession: function () {
                return {
                    open: function (request) {
                        var self = this;
                        var path = Shumway.FileLoadingService.instance.resolveUrl(request.url);
                        new Shumway.BinaryFileReader(path, request.method, request.mimeType, request.data).readAsync(function (data, progress) {
                            self.onprogress(data, { bytesLoaded: progress.loaded, bytesTotal: progress.total });
                        }, function (e) {
                            self.onerror(e);
                        }, self.onopen, self.onclose, self.onhttpstatus);
                    },
                    close: function () {
                        // doing nothing in the shell
                    }
                };
            },
            setBaseUrl: function (url) {
                shellFileLoadingService.baseUrl = url;
                return url;
            },
            resolveUrl: function (url) {
                return new URL(url, shellFileLoadingService.baseUrl).href;
            },
            navigateTo: function (url, target) {
            }
        };
        function setFileServicesBaseUrl(baseUrl) {
            shellFileLoadingService.baseUrl = baseUrl;
        }
        Shell.setFileServicesBaseUrl = setFileServicesBaseUrl;
        function initializePlayerServices() {
            Shumway.BinaryFileReader = ShellBinaryFileReader;
            Shumway.Telemetry.instance = shellTelemetry;
            Shumway.FileLoadingService.instance = shellFileLoadingService;
            Shumway.LocalConnectionService.instance = new Shumway.Player.PlayerInternalLocalConnectionService();
        }
        Shell.initializePlayerServices = initializePlayerServices;
    })(Shell = Shumway.Shell || (Shumway.Shell = {}));
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
// Number of errors thrown, used for shell scripting to return non-zero exit codes.
var errors = 0;
var homePath = "";
//load(homePath + "build/libs/relooper.js");
var builtinABCPath = homePath + "build/libs/builtin.abc";
var shellABCPath = homePath + "build/libs/shell.abc";
var playerglobalInfo = {
    abcs: homePath + "build/playerglobal/playerglobal.abcs",
    catalog: homePath + "build/playerglobal/playerglobal.json"
};
var isV8 = typeof readbuffer !== 'undefined';
var isJSC = typeof readFile !== 'undefined';
if (isV8) {
    var oldread = read;
    read = function (path, type) {
        return type === 'binary' ? new Uint8Array(readbuffer(path)) : oldread(path);
    };
}
else if (isJSC) {
    if (typeof readBinaryFile === 'undefined') {
        throw new Error('readBinaryFile was not found');
    }
    read = function (path, type) {
        return type === 'binary' ? new Uint8Array(readBinaryFile(path)) : readFile(path);
    };
}
if (typeof read === 'undefined') {
    throw new Error('Unable to simulate read()');
}
if (isV8 || isJSC) {
    // v8 and jsc will fail for Promises
    this.Promise = undefined;
}
/**
 * Global unitTests array, unit tests add themselves to this. The list may have numbers, these indicate the
 * number of times to run the test following it. This makes it easy to disable test by pushing a zero in
 * front.
 */
var unitTests = [];
var commandLineArguments;
// SpiderMonkey
if (typeof scriptArgs === "undefined") {
    commandLineArguments = arguments;
}
else {
    commandLineArguments = scriptArgs;
}
var disableBundleSelection;
try {
    disableBundleSelection = read('build/ts/shell.conf') === 'dist';
}
catch (e) {
    disableBundleSelection = false;
}
// The command line parser isn't yet available, so do a rough manual check for whether the bundled
// player source should be used.
if (disableBundleSelection || commandLineArguments.indexOf('--bundle') >= 0) {
    load('build/bundles/shumway.player.js');
}
else if (commandLineArguments.indexOf('-b') >= 0 || commandLineArguments.indexOf('--closure-bundle') >= 0) {
    load('build/bundles-cc/shumway.player.js');
}
else {
    /* Autogenerated player references: base= */
    load("build/ts/base.js");
    load("build/ts/tools.js");
    load("build/ts/avm2.js");
    load("build/ts/swf.js");
    load("build/ts/flash.js");
    load("build/ts/avm1.js");
    load("build/ts/gfx-base.js");
    load("build/ts/player.js");
}
var Shumway;
(function (Shumway) {
    var Shell;
    (function (Shell) {
        var ABCFile = Shumway.AVMX.ABCFile;
        var WriterFlags = Shumway.AVMX.WriterFlags;
        var Option = Shumway.Options.Option;
        var ArgumentParser = Shumway.Options.ArgumentParser;
        var DataBuffer = Shumway.ArrayUtilities.DataBuffer;
        var ShellGFXServer = (function () {
            function ShellGFXServer() {
            }
            ShellGFXServer.prototype.addObserver = function (observer) {
                // Ignoring
            };
            ShellGFXServer.prototype.removeObserver = function (observer) {
                // Ignoring
            };
            ShellGFXServer.prototype.update = function (updates, assets) {
                var bytes = updates.getBytes();
                // console.log('Updates sent');
                return null;
            };
            ShellGFXServer.prototype.updateAndGet = function (updates, assets) {
                var bytes = updates.getBytes();
                // Simulating text field metrics
                var buffer = new DataBuffer();
                buffer.write2Ints(1, 1); // textWidth, textHeight
                buffer.writeInt(0); // offsetX
                buffer.writeInt(0); // numLines
                buffer.position = 0;
                return buffer;
            };
            ShellGFXServer.prototype.frame = function () {
                // console.log('Frame');
            };
            ShellGFXServer.prototype.videoControl = function (id, eventType, data) {
                // console.log('videoControl');
            };
            ShellGFXServer.prototype.registerFont = function (syncId, data) {
                // console.log('registerFont');
                return Promise.resolve(undefined);
            };
            ShellGFXServer.prototype.registerImage = function (syncId, symbolId, data, alphaData) {
                // console.log('registerImage');
                return Promise.resolve({ width: 100, height: 50 });
            };
            ShellGFXServer.prototype.fscommand = function (command, args) {
                if (command === 'quit') {
                    // console.log('Player quit');
                    microTaskQueue.stop();
                }
            };
            return ShellGFXServer;
        })();
        Shell.verbose = false;
        var writer = new Shumway.IndentingWriter();
        var parseOption;
        var scanParseOption;
        var disassembleOption;
        var compileOption;
        var verboseOption;
        var profileOption;
        var releaseOption;
        var deterministicOption;
        var executeOption;
        var freshSecurityDomainOption;
        var printABCFileNameOption;
        var interpreterOption;
        var symbolFilterOption;
        var microTaskDurationOption;
        var microTaskCountOption;
        var maxFrameCountOption;
        var repeatOption;
        var loadPlayerGlobalCatalogOption;
        var loadShellLibOption;
        var porcelainOutputOption;
        var usePlayerBundleOption;
        var usePlayerClosureBundleOption;
        var fuzzMillOption;
        var writersOption;
        function main(commandLineArguments) {
            var systemOptions = Shumway.Settings.shumwayOptions;
            var shellOptions = systemOptions.register(new Shumway.Options.OptionSet("Shell Options"));
            parseOption = shellOptions.register(new Option("p", "parse", "boolean", false, "Parse File(s)"));
            scanParseOption = shellOptions.register(new Option("sp", "scanParse", "boolean", false, "Scan/Parse File(s)"));
            disassembleOption = shellOptions.register(new Option("d", "disassemble", "boolean", false, "Disassemble File(s)"));
            compileOption = shellOptions.register(new Option("c", "compile", "boolean", false, "Compile File(s)"));
            verboseOption = shellOptions.register(new Option("v", "verbose", "boolean", false, "Verbose"));
            profileOption = shellOptions.register(new Option("o", "profile", "boolean", false, "Profile"));
            releaseOption = shellOptions.register(new Option("r", "release", "boolean", false, "Release mode"));
            deterministicOption = shellOptions.register(new Option("det", "deterministic", "boolean", false, "Deterministic execution, with rigged timers and random generator"));
            if (!disableBundleSelection) {
                usePlayerClosureBundleOption = shellOptions.register(new Option('b', "closure-bundle", "boolean", false, "Use bundled and closure compiled source file for the player."));
                usePlayerBundleOption = shellOptions.register(new Option('', "bundle", "boolean", false, "Use bundled source file for the player."));
            }
            executeOption = shellOptions.register(new Option("x", "execute", "boolean", false, "Execute File(s)"));
            freshSecurityDomainOption = shellOptions.register(new Option("fsd", "freshSecurityDomain", "boolean", false, "Creates a fresh security domain for each ABC file."));
            printABCFileNameOption = shellOptions.register(new Option("", "printABCFileName", "boolean", false, "Print each ABC filename before running it."));
            interpreterOption = shellOptions.register(new Option("i", "interpreter", "boolean", false, "Interpreter Only"));
            symbolFilterOption = shellOptions.register(new Option("f", "filter", "string", "", "Symbol Filter"));
            microTaskDurationOption = shellOptions.register(new Option("md", "duration", "number", 0, "Maximum micro task duration."));
            microTaskCountOption = shellOptions.register(new Option("mc", "count", "number", 64 * 1024, "Maximum micro task count."));
            maxFrameCountOption = shellOptions.register(new Option("fc", "frameCount", "number", 0, "Frame count."));
            repeatOption = shellOptions.register(new Option("rp", "rp", "number", 1, "Repeat count."));
            loadPlayerGlobalCatalogOption = shellOptions.register(new Option("g", "playerGlobal", "boolean", false, "Load Player Global"));
            loadShellLibOption = shellOptions.register(new Option("s", "shell", "boolean", false, "Load Shell Global"));
            porcelainOutputOption = shellOptions.register(new Option('', "porcelain", "boolean", false, "Keeps outputs free from the debug messages."));
            fuzzMillOption = shellOptions.register(new Option('', "fuzz", "string", "", "Generates random SWFs XML."));
            writersOption = shellOptions.register(new Option("w", "writers", "string", "", "Writers Filter [r: runtime, e: execution, i: interpreter]"));
            var argumentParser = new ArgumentParser();
            argumentParser.addBoundOptionSet(systemOptions);
            function printUsage() {
                writer.enter("Shumway Command Line Interface");
                systemOptions.trace(writer);
                writer.leave("");
            }
            argumentParser.addArgument("h", "help", "boolean", { parse: function (x) {
                    printUsage();
                } });
            var files = [];
            // Try and parse command line arguments.
            try {
                argumentParser.parse(commandLineArguments).filter(function (value, index, array) {
                    if (value[0] === "@" || value.endsWith(".abc") || value.endsWith(".swf") || value.endsWith(".js") || value.endsWith(".json")) {
                        files.push(value);
                    }
                    else {
                        return true;
                    }
                });
            }
            catch (x) {
                writer.writeLn(x.message);
                quit();
            }
            Shell.initializePlayerServices();
            microTaskQueue = new Shumway.Shell.MicroTasksQueue();
            if (porcelainOutputOption.value) {
                console.info = console.log = console.warn = console.error = function () { };
                writer.suppressOutput = true;
            }
            profile = profileOption.value;
            release = releaseOption.value;
            Shell.verbose = verboseOption.value;
            if (!Shell.verbose) {
                Shumway.IndentingWriter.logLevel = 1 /* Error */ | 2 /* Warn */;
            }
            if (fuzzMillOption.value) {
                var fuzzer = new Shumway.Shell.Fuzz.Mill(new Shumway.IndentingWriter(), fuzzMillOption.value);
                fuzzer.fuzz();
            }
            Shumway.Unit.writer = new Shumway.IndentingWriter();
            var writerFlags = WriterFlags.None;
            if (writersOption.value.indexOf("r") >= 0) {
                writerFlags |= WriterFlags.Runtime;
            }
            if (writersOption.value.indexOf("e") >= 0) {
                writerFlags |= WriterFlags.Execution;
            }
            if (writersOption.value.indexOf("i") >= 0) {
                writerFlags |= WriterFlags.Interpreter;
            }
            Shumway.AVMX.setWriters(writerFlags);
            if (compileOption.value) {
                var buffers = [];
                files.forEach(function (file) {
                    var buffer = new Uint8Array(read(file, "binary"));
                    if (file.endsWith(".abc")) {
                        buffers.push(buffer);
                    }
                    else if (file.endsWith(".swf")) {
                        buffers.push.apply(buffers, extractABCsFromSWF(buffer));
                    }
                });
                Shell.verbose && writer.writeLn("Loading " + buffers.length + " ABCs");
                release || Shumway.Debug.notImplemented("Compile");
                if (Shumway.AVMX.timelineBuffer) {
                    Shumway.AVMX.timelineBuffer.createSnapshot().trace(new Shumway.IndentingWriter());
                }
            }
            if (parseOption.value) {
                files.forEach(function (file) {
                    var start = Date.now();
                    writer.debugLn("Parsing: " + file);
                    profile && Shumway.SWF.timelineBuffer.reset();
                    try {
                        parsingCounter.clear();
                        parseFile(file, symbolFilterOption.value.split(","));
                        var elapsed = Date.now() - start;
                        if (Shell.verbose) {
                            writer.writeLn("Total Parse Time: " + (elapsed).toFixed(2) + " ms.");
                            profile && Shumway.SWF.timelineBuffer.createSnapshot().trace(writer);
                        }
                    }
                    catch (e) {
                        writer.writeLn("EXCEPTED: " + file);
                    }
                });
            }
            if (executeOption.value) {
                var shouldLoadPlayerGlobalCatalog = loadPlayerGlobalCatalogOption.value;
                if (!shouldLoadPlayerGlobalCatalog) {
                    // We need to load player globals if any swfs need to be executed.
                    files.forEach(function (file) {
                        if (file.endsWith(".swf")) {
                            shouldLoadPlayerGlobalCatalog = true;
                        }
                    });
                }
                executeFiles(files);
            }
            else if (disassembleOption.value) {
                var sec = createSecurityDomain(builtinABCPath, null, null);
                files.forEach(function (file) {
                    if (file.endsWith(".abc")) {
                        disassembleABCFile(sec, file);
                    }
                });
            }
            if (errors) {
                quit(1);
            }
            if (Shumway.Unit.everFailed) {
                writer.errorLn('Some unit tests failed');
                quit(1);
            }
        }
        Shell.main = main;
        function disassembleABCFile(sec, file) {
            try {
                var buffer = read(file, "binary");
                var env = { url: file, app: sec.application };
                var abc = new ABCFile(env, new Uint8Array(buffer));
                // We need to load the ABCFile in a |sec| because the parser may
                // throw verifier errors.
                sec.application.loadABC(abc);
                abc.trace(writer);
            }
            catch (x) {
                writer.redLn('Exception encountered while running ' + file + ': ' + '(' + x + ')');
                writer.redLns(x.stack);
                errors++;
            }
        }
        function executeFiles(files) {
            // If we're only dealign with .abc files, run them all in the same domain.
            if (files.every(function (file) {
                return file.endsWith(".abc") || file[0] === "@";
            })) {
                executeABCFiles(files);
                return;
            }
            files.forEach(function (file) {
                if (file.endsWith(".js")) {
                    executeUnitTestFile(file);
                }
                else if (file.endsWith(".json")) {
                    executeJSONFile(file);
                }
                else if (file.endsWith(".abc")) {
                    executeABCFiles([file]);
                }
                else if (file.endsWith(".swf")) {
                    executeSWFFile(file, microTaskDurationOption.value, microTaskCountOption.value, maxFrameCountOption.value);
                }
            });
            return true;
        }
        function executeSWFFile(file, runDuration, runCount, frameCount) {
            if (Shell.verbose) {
                writer.writeLn("executeSWF: " + file +
                    ", runDuration: " + runDuration +
                    ", runCount: " + runCount +
                    ", frameCount: " + frameCount);
            }
            function runSWF(file) {
                microTaskQueue.clear();
                if (deterministicOption.value) {
                    Shumway.Random.reset();
                    Shumway.installTimeWarper();
                }
                var sec = createSecurityDomain(builtinABCPath, null, null);
                var player = new Shumway.Player.Player(sec, new ShellGFXServer());
                try {
                    var buffer = read(file, 'binary');
                }
                catch (e) {
                    console.log("Error loading SWF: " + e.message);
                    quit(127);
                }
                player.load(file, buffer);
                // Set a default size for the stage container.
                player.stage.setStageContainerSize(512, 512, 1);
                return player;
            }
            var player = null;
            var asyncLoading = true;
            // TODO: resolve absolute file path for the base URL.
            Shumway.FileLoadingService.instance.setBaseUrl('file://' + file);
            if (asyncLoading) {
                player = runSWF(file);
            }
            else {
                player = runSWF(read(file, 'binary'));
            }
            try {
                var hash = 0;
                var lastFramesPlayed = 0;
                writer.writeLn("RUNNING:  " + file);
                microTaskQueue.run(runDuration, runCount, true, function () {
                    if (!frameCount) {
                        return true;
                    }
                    if (lastFramesPlayed < player.framesPlayed) {
                        hash = Shumway.HashUtilities.mixHash(hash, player.stage.hashCode());
                        // This dumps too much output and is not all that useful, unless you want to debug something.
                        // writer.writeLn("Frame: " + player.framesPlayed + " HASHCODE: " + file + ": " + IntegerUtilities.toHEX(hash));
                        // player.stage.debugTrace(writer);
                        lastFramesPlayed = player.framesPlayed;
                    }
                    // Exit if we've executed enough frames.
                    return player.framesPlayed <= frameCount;
                });
                if (Shell.verbose) {
                    writer.writeLn("executeSWF PASS: " + file);
                }
                writer.writeLn("HASHCODE: " + file + ": " + Shumway.IntegerUtilities.toHEX(hash));
            }
            catch (x) {
                writer.redLn('Exception: ' + '(' + x + ')');
                writer.redLns(x.stack);
            }
        }
        function executeJSONFile(file) {
            if (Shell.verbose) {
                writer.writeLn("executeJSON: " + file);
            }
            // Remove comments
            var json = JSON.parse(read(file, "text").split("\n").filter(function (line) {
                return line.trim().indexOf("//") !== 0;
            }).join("\n"));
            json.forEach(function (run, i) {
                printErr("Running batch " + (i + 1) + " of " + json.length + " (" + run[1].length + " tests)");
                var sec = createSecurityDomain(builtinABCPath, null, null);
                // Run libraries.
                run[0].forEach(function (file) {
                    var buffer = new Uint8Array(read(file, "binary"));
                    var env = { url: file, app: sec.application };
                    var abc = new ABCFile(env, buffer);
                    if (Shell.verbose) {
                        writer.writeLn("executeABC: " + file);
                    }
                    sec.application.loadAndExecuteABC(abc);
                });
                // Run files.
                run[1].forEach(function (file) {
                    try {
                        if (Shell.verbose) {
                            writer.writeLn("executeABC: " + file);
                        }
                        var buffer = new Uint8Array(read(file, "binary"));
                        var env = { url: file, app: sec.application };
                        var abc = new ABCFile(env, buffer);
                        sec.application.loadABC(abc);
                        var t = Date.now();
                        sec.application.executeABC(abc);
                        var e = (Date.now() - t);
                        if (e > 100) {
                            printErr("Test: " + file + " is very slow (" + e.toFixed() + " ms), consider disabling it.");
                        }
                    }
                    catch (x) {
                        //if (verbose) {
                        //  writer.writeLn("executeABC FAIL: " + file);
                        //}
                        writer.writeLn("EXCEPTED: " + file);
                        try {
                            writer.redLn('Exception: ' + '(' + x + ')');
                            writer.redLns(x.stack);
                        }
                        catch (y) {
                            writer.writeLn("Error printing error.");
                        }
                        errors++;
                    }
                    resetSecurityDomain(sec);
                });
            });
        }
        function resetSecurityDomain(sec) {
            // Only reset XML settings if AXXML has been initialized.
            if (sec.AXXML.resetSettings) {
                sec.AXXML.resetSettings();
            }
        }
        function executeABCFiles(files) {
            var sec = freshSecurityDomainOption.value ? null : createSecurityDomain(builtinABCPath, null, null);
            files.forEach(function (file) {
                if (file === "@createSecurityDomain") {
                    sec = createSecurityDomain(builtinABCPath, null, null);
                    return;
                }
                if (freshSecurityDomainOption.value) {
                    sec = createSecurityDomain(builtinABCPath, null, null);
                }
                try {
                    if (printABCFileNameOption.value) {
                        writer.writeLn("::: " + file + " :::");
                    }
                    var buffer = new Uint8Array(read(file, "binary"));
                    var env = { url: file, app: sec.application };
                    var abc = new ABCFile(env, buffer);
                    sec.application.loadAndExecuteABC(abc);
                    if (Shell.verbose) {
                        writer.writeLn("executeABC PASS: " + file);
                    }
                }
                catch (x) {
                    if (Shell.verbose) {
                        writer.writeLn("executeABC FAIL: " + file);
                    }
                    try {
                        writer.redLn('Exception encountered while running ' + file + ': ' + '(' + x + ')');
                        writer.redLns(x.stack);
                    }
                    catch (y) {
                        writer.writeLn("Error printing error.");
                    }
                    errors++;
                }
            });
        }
        function executeUnitTestFile(file) {
            var sec = createSecurityDomain(builtinABCPath, null, null);
            Shumway.AVMX.AS.installClassLoaders(sec.application, jsGlobal);
            // Make the sec available on the global object for ease of use
            // in unit tests.
            jsGlobal.sec = sec;
            writer.writeLn("Running test file: " + file + " ...");
            var start = Date.now();
            load(file);
            var testCount = 0;
            while (unitTests.length) {
                var test = unitTests.shift();
                var repeat = 1;
                if (typeof test === "number") {
                    repeat = test;
                    test = unitTests.shift();
                }
                if (Shell.verbose && test.name) {
                    writer.writeLn("Test: " + test.name);
                }
                testCount += repeat;
                try {
                    for (var i = 0; i < repeat; i++) {
                        test();
                    }
                }
                catch (x) {
                    writer.redLn('Exception encountered while running ' + file + ':' + '(' + x + ')');
                    writer.redLns(x.stack);
                }
            }
            writer.writeLn("Executed JS File: " + file);
            writer.outdent();
        }
        function extractABCsFromSWF(buffer) {
            var abcData = [];
            try {
                var loadListener = {
                    onLoadOpen: function (file) {
                        for (var i = 0; i < file.abcBlocks.length; i++) {
                            var abcBlock = file.abcBlocks[i];
                            abcData.push(abcBlock.data);
                        }
                    },
                    onLoadProgress: function (update) {
                    },
                    onLoadError: function () {
                    },
                    onLoadComplete: function () {
                    },
                    onNewEagerlyParsedSymbols: function (dictionaryEntries, delta) {
                        return Promise.resolve();
                    },
                    onImageBytesLoaded: function () { }
                };
                var loader = new Shumway.FileLoader(loadListener, null);
                loader.loadBytes(buffer);
            }
            catch (x) {
                writer.redLn("Cannot parse SWF, reason: " + x);
                return null;
            }
            return abcData;
        }
        var parsingCounter = new Shumway.Metrics.Counter(true);
        /**
         * Parses file.
         */
        function parseFile(file, symbolFilters) {
            var fileName = file.replace(/^.*[\\\/]/, '');
            function parseABC(buffer) {
                var env = { url: fileName, app: null };
                var abcFile = new ABCFile(env, buffer);
                // abcFile.trace(writer);
            }
            var buffers = [];
            if (file.endsWith(".swf")) {
                var fileNameWithoutExtension = fileName.substr(0, fileName.length - 4);
                var SWF_TAG_CODE_DO_ABC = 82 /* CODE_DO_ABC */;
                var SWF_TAG_CODE_DO_ABC_ = 72 /* CODE_DO_ABC_DEFINE */;
                try {
                    var buffer = read(file, "binary");
                    if (!((buffer[0] === 'Z'.charCodeAt(0) ||
                        buffer[0] === 'F'.charCodeAt(0) ||
                        buffer[0] === 'C'.charCodeAt(0)) &&
                        buffer[1] === 'W'.charCodeAt(0) &&
                        buffer[2] === 'S'.charCodeAt(0))) {
                        writer.redLn("Cannot parse: " + file + " because it doesn't have a valid header. " + buffer[0] + " " + buffer[1] + " " + buffer[2]);
                        return;
                    }
                    var startSWF = Date.now();
                    var swfFile;
                    var loadListener = {
                        onLoadOpen: function (swfFile) {
                            if (scanParseOption.value) {
                                return;
                            }
                            if (swfFile && swfFile.abcBlocks) {
                                for (var i = 0; i < swfFile.abcBlocks.length; i++) {
                                    parseABC(swfFile.abcBlocks[i].data);
                                }
                            }
                            if (swfFile instanceof Shumway.SWF.SWFFile) {
                                var dictionary = swfFile.dictionary;
                                for (var i = 0; i < dictionary.length; i++) {
                                    if (dictionary[i]) {
                                        var s = performance.now();
                                        var symbol = swfFile.getSymbol(dictionary[i].id);
                                        parsingCounter.count(symbol.type, performance.now() - s);
                                    }
                                }
                            }
                            else if (swfFile instanceof Shumway.ImageFile) {
                            }
                        },
                        onLoadProgress: function (update) {
                        },
                        onLoadError: function () {
                        },
                        onLoadComplete: function () {
                            writer.redLn("Load complete:");
                        },
                        onNewEagerlyParsedSymbols: function (dictionaryEntries, delta) {
                            return Promise.resolve();
                        },
                        onImageBytesLoaded: function () { }
                    };
                    var loader = new Shumway.FileLoader(loadListener, null);
                    loader.loadBytes(buffer);
                }
                catch (x) {
                    writer.redLn("Cannot parse: " + file + ", reason: " + x);
                    if (Shell.verbose) {
                        writer.redLns(x.stack);
                    }
                    errors++;
                    return false;
                }
            }
            else if (file.endsWith(".abc")) {
                parseABC(new Uint8Array(read(file, "binary")));
            }
            return true;
        }
        function createSecurityDomain(builtinABCPath, shellABCPath, libraryPathInfo) {
            var buffer = read(builtinABCPath, 'binary');
            var sec = new Shumway.AVMX.AXSecurityDomain();
            var env = { url: builtinABCPath, app: sec.system };
            var builtinABC = new ABCFile(env, new Uint8Array(buffer));
            sec.system.loadABC(builtinABC);
            sec.addCatalog(loadPlayerGlobalCatalog(sec.system));
            sec.initialize();
            sec.system.executeABC(builtinABC);
            return sec;
        }
        function loadPlayerGlobalCatalog(app) {
            var abcs = read(playerglobalInfo.abcs, 'binary');
            var index = JSON.parse(read(playerglobalInfo.catalog));
            return new Shumway.AVMX.ABCCatalog(app, abcs, index);
        }
    })(Shell = Shumway.Shell || (Shumway.Shell = {}));
})(Shumway || (Shumway = {}));
Shumway.Shell.main(commandLineArguments);
/// <reference path='../../build/ts/base.d.ts' />
/// <reference path='../../build/ts/tools.d.ts' />
/// <reference path='../../build/ts/swf.d.ts' />
/// <reference path='../../build/ts/flash.d.ts' />
/// <reference path='../../build/ts/player.d.ts' />
/// <reference path='../../build/version/version.ts' />
///<reference path='domstubs.ts' />
///<reference path='module.ts' />
///<reference path='unit.ts' />
///<reference path='fuzz.ts' />
///<reference path='microTaskQueue.ts' />
///<reference path='playerservices.ts' />
///<reference path='shell.ts' /> 
//# sourceMappingURL=shell.js.map