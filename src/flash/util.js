function describeProperty(val) {
  return { value: val, writable: true, configurable: true, enumerable: true };
}

function scriptProperties(namespace, props) {
  return props.reduce(function (o, p) {
    o[p] = namespace + " " + p;
    return o;
  }, {});
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
