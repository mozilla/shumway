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

var microTaskQueue: Shumway.Shell.MicroTasksQueue = null;

this.self = this;
this.window = this;

declare function print(message: string): void;
this.console = {
  _print: print,
  log: print,
  info: function() {
    if (!Shumway.Shell.verbose) {
      return;
    }
    print(Shumway.IndentingWriter.YELLOW + Shumway.argumentsToString(arguments) +
          Shumway.IndentingWriter.ENDC);
  },
  warn: function() {
    print(Shumway.IndentingWriter.RED + Shumway.argumentsToString(arguments) +
          Shumway.IndentingWriter.ENDC);
  },
  error: function() {
    print(Shumway.IndentingWriter.BOLD_RED + Shumway.argumentsToString(arguments) +
          Shumway.IndentingWriter.ENDC + '\nstack:\n' + (new Error().stack));
  },
  time: function () {},
  timeEnd: function () {}
};

declare var putstr;
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
        return {a: 0, b: 0, c: 0, d: 0, e: 0, f: 0};
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
    }
  },
  location: {
    href: {
      resource: ""//shumway/build/ts/shell.js"
    }
  }
};

this.Image = function () {};
this.Image.prototype = {
};

this.URL = function (url, baseURL = '') {
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
    if (m) base = m[0];
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
    } else {
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

this.Blob = function () {};
this.Blob.prototype = {
};

this.XMLHttpRequest = function () {};
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
      } catch (e) {
        this.error = e;
        this.readyState = 4;
        this.status = 404;
        this.onreadystatechange && this.onreadystatechange();
        this.onerror && this.onerror();
      }
    }.bind(this));
  }
}

this.window.screen = {
  width: 1024,
  height: 1024
};

/**
 * sessionStorage polyfill.
 */
var sessionStorageObject = {};
this.window.sessionStorage = {
  getItem: function (key: string): string {
    return sessionStorageObject[key];
  },
  setItem(key: string, value: string): void {
    sessionStorageObject[key] = value;
  },
  removeItem(key: string): void {
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
        if (typeof (<any>Promise).onerror === 'function') {
          (<any>Promise).onerror(e);
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

  function createDeferredConstructionFunctions(): any {
    var fn: any = function (resolve, reject) {
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

  (<any>Promise).all = function (iterable) {
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
  (<any>Promise).cast = function (x) {
    if (isPromise(x)) {
      return x;
    }
    var deferred = getDeferred(this);
    deferred.resolve(x);
    return deferred.promise;
  };
  (<any>Promise).reject = function (r) {
    var deferred = getDeferred(this);
    var rejectResult = deferred.reject(r);
    return deferred.promise;
  };
  (<any>Promise).resolve = function (x) {
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

  return Promise;
})();
