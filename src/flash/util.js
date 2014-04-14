/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
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
/*global formatErrorMessage, throwErrorFromVM, AVM2, $RELEASE, self */

var create = Object.create;
var defineProperty = Object.defineProperty;
var keys = Object.keys;
var isArray = Array.isArray;
var fromCharCode = String.fromCharCode;
var logE = Math.log;
var max = Math.max;
var min = Math.min;
var pow = Math.pow;
var push = Array.prototype.push;
var slice = Array.prototype.slice;
var splice = Array.prototype.splice;

function fail(msg, context) {
  throw new Error((context ? context + ': ' : '') + msg);
}
function assert(cond, msg, context) {
  if (!cond)
    fail(msg, context);
}

// e.g. throwError("ArgumentError", Errors.InvalidEnumError, "blendMode");
// "ArgumentError: Error #2008: Parameter blendMode must be one of the accepted values."

function scriptProperties(namespace, props) {
  return props.reduce(function (o, p) {
    o[p] = namespace + " " + p;
    return o;
  }, {});
}

function cloneObject(obj) {
  var clone = Object.create(null);
  for (var prop in obj)
    clone[prop] = obj[prop];
  return clone;
}

function sortNumeric(a, b) {
  return a - b;
}

function rgbaObjToStr(color) {
  return 'rgba(' + color.red + ',' + color.green + ',' + color.blue + ',' +
         color.alpha / 255 + ')';
}
function rgbIntAlphaToStr(color, alpha) {
  color |= 0;
  if (alpha >= 1) {
    var colorStr = color.toString(16);
    while (colorStr.length < 6) {
      colorStr = '0' + colorStr;
    }
    return "#" + colorStr;
  }
  var red = color >> 16 & 0xFF;
  var green = color >> 8 & 0xFF;
  var blue = color & 0xFF;
  return 'rgba(' + red + ',' + green + ',' + blue + ',' + alpha + ')';
}
function argbUintToStr(argb) {
  return 'rgba(' + (argb >>> 16 & 0xff) + ',' + (argb >>> 8 & 0xff) + ',' +
         (argb & 0xff) + ',' + (argb >>> 24 & 0xff) / 0xff + ')';
}

// Some browser feature testing
(function functionNameSupport() {
  /*jshint -W061 */
  if (eval("function t() {} t.name === 't'")) {
    return; // function name feature is supported
  }
  Object.defineProperty(Function.prototype, 'name', {
    get: function () {
      if (this.__name) {
        return this.__name;
      }
      var m = /function\s([^\(]+)/.exec(this.toString());
      var name = m && m[1] !== 'anonymous' ? m[1] : null;
      this.__name = name;
      return name;
    },
    configurable: true,
    enumerable: false
  });
})();

var randomStyleCache;

var nextStyle = 0;
function randomStyle() {
  if (!randomStyleCache) {
    randomStyleCache = [
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
  return randomStyleCache[(nextStyle ++) % randomStyleCache.length];
}

// Polyfill for Promises
(function PromiseClosure() {
  /*jshint -W061 */
  var global = Function("return this")();
  if (global.Promise) {
    // Promises existing in the DOM/Worker, checking presence of all/resolve
    if (typeof global.Promise.all !== 'function') {
      global.Promise.all = function (iterable) {
        var count = 0, results = [], resolve, reject;
        var promise = new global.Promise(function (resolve_, reject_) {
          resolve = resolve_;
          reject = reject_;
        });
        iterable.forEach(function (p, i) {
          count++;
          p.then(function (result) {
            results[i] = result;
            count--;
            if (count === 0) {
              resolve(results);
            }
          }, reject);
        });
        if (count === 0) {
          resolve(results);
        }
        return promise;
      };
    }
    if (typeof global.Promise.resolve !== 'function') {
      global.Promise.resolve = function (x) {
        return new global.Promise(function (resolve) { resolve(x); });
      };
    }
    return;
  }

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
    return {promise: promise, resolve: resolve, reject: reject};
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
    } catch (e) {
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
      queueMicrotask({reaction: reactions[i], argument: argument});
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
    } catch (e) {
      var reject = deferred.reject;
      return reject(e);
    }

    if (handlerResult === deferred.promise) {
      var reject = deferred.reject;
      return reject(new TypeError('Self resolution'));
    }

    try {
      updateResult = updateDeferredFromPotentialThenable(handlerResult,
        deferred);
      if (!updateResult) {
        var resolve = deferred.resolve;
        return resolve(handlerResult);
      }
    } catch (e) {
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
      } catch (e) {
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

  function createPromiseResolutionHandlerFunctions(promise,
                                                   fulfillmentHandler, rejectionHandler) {
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

  function createPromiseAllCountdownFunction(index, values, deferred,
                                             countdownHolder) {
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
    } catch (e) {
      rejectPromise(promise, e);
    }

    promise.promiseConstructor = Promise;
    return promise;
  }

  Promise.all = function (iterable) {
    var deferred = getDeferred(this);
    var values = [];
    var countdownHolder = {countdown: 0};
    var index = 0;
    iterable.forEach(function (nextValue) {
      var nextPromise = this.cast(nextValue);
      var fn = createPromiseAllCountdownFunction(index, values,
        deferred, countdownHolder);
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
      var resolutionHandler = createPromiseResolutionHandlerFunctions(promise,
        fulfillmentHandler, rejectionHandler);

      var resolveReaction = {deferred: deferred, handler: resolutionHandler};
      var rejectReaction = {deferred: deferred, handler: rejectionHandler};

      switch (promise.promiseStatus) {
        case 'unresolved':
          promise.resolveReactions.push(resolveReaction);
          promise.rejectReactions.push(rejectReaction);
          break;
        case 'has-resolution':
          var resolution = promise.result;
          queueMicrotask({reaction: resolveReaction, argument: resolution});
          break;
        case 'has-rejection':
          var rejection = promise.result;
          queueMicrotask({reaction: rejectReaction, argument: rejection});
          break;
      }
      return deferred.promise;
    }
  };

  global.Promise = Promise;
})();

var EXTERNAL_INTERFACE_FEATURE = 1;
var CLIPBOARD_FEATURE = 2;
var SHAREDOBJECT_FEATURE = 3;
var VIDEO_FEATURE = 4;
var SOUND_FEATURE = 5;
var NETCONNECTION_FEATURE = 6;

if (!this.performance) {
  this.performance = {};
}
if (!this.performance.now) {
  this.performance.now = Date.now;
}
