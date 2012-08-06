function describeAccessor(get, set) {
  return { get: get, set: set, configurable: true, enumerable: true };
}
function describeConst(val) {
  return { value: val, configurable: true, enumerable: true };
}
function describeInternalProperty(val) {
  return { value: val, writable: true };
}
function describeLazyProperty(name, getter) {
  return describeAccessor(function () {
    var val = getter.call(this);
    Object.defineProperty(this, name, describeProperty(val));
    return val;
  });
}
function describeMethod(fn) {
  return describeProperty(fn);
}
function describeProperty(val) {
  return { value: val, writable: true, configurable: true, enumerable: true };
}

function illegalOperation() {
  throw Error('Illegal Operation');
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
    for (var i = 0; i < numPromises; i++) {
      var arg = arguments[i];
      arg.then(function (val) {
        values.push(val);
        if (!--numPromises)
          promise.resolve.apply(promise, values);
      });
    }
  }
  return promise;
};
Promise.prototype.resolve = function (val) {
  if (this.resolved)
    return;

  this.resolved = true;
  this.value = val;

  var callbacks = this._callbacks;
  for (var i = 0, n = callbacks.length; i < n; i++) {
    var cb = callbacks[i];
    cb(val);
  }
};
Promise.prototype.then = function (cb) {
  if (this.resolved)
    cb(this.value);
  else
   this._callbacks.push(cb);
};
