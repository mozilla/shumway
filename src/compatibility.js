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

// Misc patches to fix older/legacy browsers' deficiencies.

(function isStackPresentInError() {
  if (new Error().stack) {
    return; // stack present
  }

  // Fixes IE10,11
  Object.defineProperty(Error.prototype, 'stack', {
    get: function () {
      try {
        throw this;
      } catch (e) { }
      return this.stack;
    },
    enumerable: true,
    configurable: true
  });
})();

(function isURLConstructorPresent() {
  if (window.URL.length) {
    return; // URL is a constructor
  }

  // Fixes IE10,11
  function newURL(url, baseURL) {
    // Just enough to make viewer working.
    if (!baseURL || url.indexOf('://') >= 0) {
      this._setURL(url);
      return;
    }

    var base = baseURL.split(/[#\?]/g)[0];
    base = base.lastIndexOf('/') >= 0 ? base.substring(0, base.lastIndexOf('/') + 1) : '';
    if (url.indexOf('/') === 0) {
      var m = /^[^:]+:\/\/[^\/]+/.exec(base);
      if (m) {
        base = m[0];
      }
    }
    this._setURL(base + url);
  }
  newURL.prototype = {
    _setURL: function (url) {
      this.href = url;
      // Simple parsing to extract protocol, hostname and port.
      var m = /^(\w+:)\/\/([^:/]+)(:([0-9]+))?/.exec(url.toLowerCase());
      if (m) {
        this.protocol = m[1];
        this.hostname = m[2];
        this.port = m[4] || '';
      }
    },
    toString: function () {
      return this.href;
    }
  };

  var keys = Object.keys(window.URL);
  for (var i = 0; i < keys.length; i++) {
    newURL[keys[i]] = window.URL[keys[i]];
  }
  window.URL = newURL;
})();

// Polyfill for Promise for older browsers.
(function isPromisePresent() {
  var global = window;
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
        return new global.Promise(function (resolve) {
          resolve(x);
        });
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
        if (Promise.onerror === 'function') {
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

(function isPerformanceUtilsPresent() {
  var requiredConsoleFunctions = ["profile", "profileEnd", "markTimeline", "time", "timeEnd"];
  for (var i = 0; i < requiredConsoleFunctions.length; i++) {
    if (!(requiredConsoleFunctions[i] in console))
      console[requiredConsoleFunctions[i]] = function () {};
  }
  if (typeof performance === 'undefined') {
    window.performance = { now: Date.now };
  }
})();
