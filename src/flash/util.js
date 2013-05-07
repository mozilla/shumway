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

function describeProperty(val) {
  return { value: val, writable: true, configurable: true, enumerable: true };
}

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

function Promise() {
  this.resolved = false;
  this._callbacks = [];
}
Promise.when = function () {
  var numPromises = arguments.length;
  var promise = new Promise;
  if (!numPromises) {
    promise.resolve();
  } else {
    var values = [];
    for (var i = 0, n = numPromises; i < n; i++) {
      var item = arguments[i];
      if (item.resolved) {
        values[i] = item.value;
        --numPromises;
        continue;
      }
      // maintain dependencies between promises, see Promise.when
      var resolves = item._resolves || (item._resolves = []);
      resolves.push({promise: promise, itemIndex: i});
    }
    if (numPromises > 0) {
      promise._values = values;
      promise._unresolvedPromises = numPromises;
    } else {
      promise.resolve(values);
    }
  }
  return promise;
};
Promise.prototype.resolve = function (result) {
  if (this.resolved)
    return;

  this.resolved = true;
  this.value = result;

  var callbacks = this._callbacks;
  for (var i = 0, n = callbacks.length; i < n; i++) {
    var cb = callbacks[i];
    cb(result);
  }

  var resolves = this._resolves;
  if (!resolves)
    return;

  // this promise can resolve more group promises
  // collecting all resolved promises, so we can call
  // the callbacks later
  var resolvedPromises = [];
  var queue = [];
  for (var i = 0; i < resolves.length; i++) {
    if (!resolves[i].promise.resolved)
      queue.push(resolves[i], result);
  }
  while (queue.length > 0) {
    var item = queue.shift();
    var itemResult = queue.shift();
    var itemPromise = item.promise;
    var itemIndex = item.itemIndex;
    itemPromise._values[itemIndex] = itemResult;
    if (!--itemPromise._unresolvedPromises) {
      // all promises resolved in the group
      itemPromise.resolved = true;
      itemPromise.value = itemPromise._values;
      delete itemPromise._values;
      resolvedPromises.push(itemPromise);

      resolves = itemPromise._resolves;
      if (resolves) {
        // checking if more group promises can be resolved
        for (var i = 0; i < resolves.length; i++) {
          if (!resolves[i].promise.resolved)
            queue.push(resolves[i], itemPromise.value);
        }
      }
    }
  }
  // invokes callbacks for all resolved promises
  while (resolvedPromises.length > 0) {
    var itemPromise = resolvedPromises.shift();
    var callbacks = itemPromise._callbacks;
    for (var i = 0, n = callbacks.length; i < n; i++) {
      var cb = callbacks[i];
      cb(itemPromise.value);
    }
  }
};
Promise.prototype.then = function (cb) {
  if (this.resolved)
    cb(this.value);
  else
    this._callbacks.push(cb);
};

