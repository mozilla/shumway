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
/*global slice, formatErrorMessage, throwErrorFromVM, AVM2 */

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

// e.g. throwError("ArgumentError", Errors.InvalidEnumError, "blendMode");
// "ArgumentError: Error #2008: Parameter blendMode must be one of the accepted values."
function throwError(name, error) {
  var message = formatErrorMessage.apply(null, slice.call(arguments, 1));
  throwErrorFromVM(AVM2.currentDomain(), name, message, error.code);
}

function sortByDepth(a, b) {
  var levelA = a._level;
  var levelB = b._level;

  if (a._parent !== b._parent && a._index > -1 && b._index > -1) {
    if (a._level > levelB) {
      while (a._level !== b._level) {
        a = a._parent;
      }
    } else {
      while (b._level !== levelA) {
        b = b._parent;
      }
    }
    while (a._level > 1) {
      if (a._parent === b._parent) {
        break;
      }
      a = a._parent;
      b = b._parent;
    }
  }

  if (a === b) {
    return levelA - levelB;
  }

  return a._index - b._index;
}

var Promise = (function PromiseClosure() {
  function isPromise(obj) {
    return typeof obj === 'object' && obj !== null &&
      typeof obj.then === 'function';
  }
  function defaultOnFulfilled(value) {
    return value;
  }
  function defaultOnRejected(reason) {
    throw reason;
  }

  function propagateFulfilled(subject, value) {
    subject.subpromisesValue = value;
    var subpromises = subject.subpromises;
    if (!subpromises) {
      return;
    }
    for (var i = 0; i < subpromises.length; i++) {
      subpromises[i].fulfill(value);
    }
    delete subject.subpromises;
  }
  function propagateRejected(subject, reason) {
    subject.subpromisesReason = reason;
    var subpromises = subject.subpromises;
    if (!subpromises) {
      return;
    }
    for (var i = 0; i < subpromises.length; i++) {
      subpromises[i].reject(reason);
    }
    delete subject.subpromises;
  }

  function performCall(callback, arg, subject) {
    try {
      var value = callback(arg);
      if (isPromise(value)) {
        value.then(function Promise_queueCall_onFulfilled(value) {
          propagateFulfilled(subject, value);
        }, function Promise_queueCall_onRejected(reason) {
          propagateRejected(subject, reason);
        });
        return;
      }

      propagateFulfilled(subject, value);
    } catch (ex) {
      propagateRejected(subject, ex);
    }
  }

  var queue = [];
  function processQueue() {
    while (queue.length > 0) {
      var task = queue[0];
      if (task.directCallback) {
        task.callback.call(task.subject, task.arg);
      } else {
        performCall(task.callback, task.arg, task.subject);
      }
      queue.shift();
    }
  }

  function queueCall(callback, arg, subject, directCallback) {
    if (queue.length === 0) {
      setTimeout(processQueue, 0);
    }
    queue.push({callback: callback, arg: arg, subject: subject,
                directCallback: directCallback});
  }

  function Promise(onFulfilled, onRejected) {
    this.state = 'pending';
    this.onFulfilled = typeof onFulfilled === 'function' ?
      onFulfilled : defaultOnFulfilled;
    this.onRejected = typeof onRejected === 'function' ?
      onRejected : defaultOnRejected;
  }
  Promise.prototype = {
    fulfill: function Promise_resolve(value) {
      if (this.state !== 'pending') {
        return;
      }
      this.state = 'fulfilled';
      this.value = value;
      queueCall(this.onFulfilled, value, this, false);
    },
    reject: function Promise_reject(reason) {
      if (this.state !== 'pending') {
        return;
      }
      this.state = 'rejected';
      this.reason = reason;
      queueCall(this.onRejected, reason, this, false);
    },
    then: function Promise_then(onFulfilled, onRejected) {
      var promise = new Promise(onFulfilled, onRejected);
      if ('subpromisesValue' in this) {
        queueCall(promise.fulfill, this.subpromisesValue, promise, true);
      } else if ('subpromisesReason' in this) {
        queueCall(promise.reject, this.subpromisesReason, promise, true);
      } else {
        var subpromises = this.subpromises || (this.subpromises = []);
        subpromises.push(promise);
      }
      return promise;
    },
    get resolved() {
      return this.state === 'fulfilled';
    },
    resolve: function (value) {
      this.fulfill(value);
    }
  };

  Promise.when = function Promise_when() {
    var promise = new Promise();
    if (arguments.length === 0) {
      promise.resolve();
      return promise;
    }
    var promises = slice.call(arguments, 0);
    var result = [];
    var i = 1;
    function fulfill(value) {
      result.push(value);
      if (i < promises.length) {
        promises[i++].then(fulfill, reject);
      } else {
        promise.resolve(result);
      }
      return value;
    }
    function reject(reason) {
      promise.reject(reason);
    }
    promises[0].then(fulfill, reject);
    return promise;
  };

  return Promise;
})();

var QuadTree = function (x, y, width, height) {
  this.x = x || 0;
  this.y = y || 0;
  this.width = width || 0;
  this.height = height || 0;
  this.children = [];
  this.stuckChildren = [];
  this.nodes = [];
};
QuadTree.prototype._findIndex = function (item) {
  var right = item.x > this.x + this.width / 2;
  var bottom = item.y > this.y + this.height / 2;

  var index = 0;
  if (right) {
    if (bottom) {
      index = 3;
    } else {
      index = 1;
    }
  } else if (bottom) {
    index = 2;
  }

  return index;
};
QuadTree.prototype.insert = function (item) {
  if (this.nodes.length) {
    var index = this._findIndex(item);
    var node = this.nodes[index];

    if (item.x >= node.x &&
        item.x + item.width <= node.x + node.width &&
        item.y >= node.y &&
        item.y + item.height <= node.y + node.height) {
      this.nodes[index].insert(item);
    } else {
      this.stuckChildren.push(item);
      item._qtree = this;
    }

    return;
  }

  var children = this.children;

  children.push(item);

  if (children.length > 4) {
    this._subdivide();

    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      this.insert(child);
    }

    children.length = 0;

    return;
  }

  item._qtree = this;
};
QuadTree.prototype._out = [];
QuadTree.prototype.retrieve = function (item) {
  var out = this._out;
  out.length = 0;

  if (this.nodes.length) {
    var index = this._findIndex(item);

    out.push.apply(out, this.nodes[index].retrieve(item));
  }

  out.push.apply(out, this.stuckChildren);
  out.push.apply(out, this.children);

  return out;
};
QuadTree.prototype._subdivide = function () {
  var halfWidth = this.width / 2;
  var halfHeight = this.height / 2;
  var midX = this.x + halfWidth;
  var midY = this.y + halfHeight;
  this.nodes[0] = new QuadTree(this.x, this.y, halfWidth, halfHeight);
  this.nodes[1] = new QuadTree(midX, this.y, halfWidth, halfHeight);
  this.nodes[2] = new QuadTree(this.x, midY, halfWidth, halfHeight);
  this.nodes[3] = new QuadTree(midX, midY, halfWidth, halfHeight);
};
