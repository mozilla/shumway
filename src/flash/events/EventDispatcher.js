function EventDispatcher(target) {
  this._listeners = {};
}

EventDispatcher.prototype = Object.create(null, {
  addEventListener: descMethod(function (type,
                                         listener,
                                         useCapture,
                                         priority,
                                         useWeakReference) {
    var listeners = this._listeners[type];
    if (!listeners)
      listeners = this._listeners[type] = [];
    listeners.push(listener);
  }),
  dispatchEvent: descMethod(function (evt) {
    notImplemented();
  }),
  hasEventListener: descMethod(function (type) {
    return this._listeners[type] != false;
  }),
  removeEventListener: descMethod(function (type, listener, useCapture) {
    var listeners = this._listeners[type];
    if (listeners) {
      var i = listeners.indexOf(listener);
      if (i > -1)
        listeners.splice(i, 1);
    }
  }),
  toString: descMethod(function () {
    return '[object EventDispatcher]';
  }),
  willTrigger: descMethod(function (type) {
    notImplemented();
  })
});
