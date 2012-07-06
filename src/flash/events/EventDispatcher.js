function EventDispatcher(target) {
  this._handlers = { };
  this._captureHandlers = { };
  this._control = null;
}

EventDispatcher.prototype = Object.create(null, {
  addEventListener: descMethod(function (type, listener, useCapture, priority, useWeakReference) {
    if (typeof listener !== 'function')
      throw ArgumentError();

    var list = useCapture ? this._captureHandlers : this._handlers;
    var handler = list[type];
    if (!handler) {
      var target = this;
      handler = {
        listeners: [],

        handleEvent: function (evt) {
          if (!(evt instanceof Event)) {
            var domEvent = evt;
            evt = domEvent._originalEvent;
            evt._eventPhase = domEvent.eventPhase;
          }

          evt._currentTarget = this;

          var listeners = this.listeners;
          for (var i = 0, n = listeners.length; i < n; i++) {
            var listener = listeners[i];
            listener(evt);
          }
        }
      };

      if (this._control)
        this._control.addEventListener(type, handler, useCapture);

      list[type] = handler;
    }
    handler.listeners.push(listener);
  }),
  dispatchEvent: descMethod(function (evt) {
    evt.target = this;

    if (this._control) {
      var domEvent = document.createEvent('Event');
      domEvent.init(evt.type, evt.bubbles, evt.cancelable);
      domEvent._originalEvent = evt;
      this._control.dispatchEvent(domEvent);
    } else {
      var handler = this._handlers[evt.type];
      if (handler)
        handler.handleEvent(evt);
    }

    return !!evt.isDefaultPrevented;
  }),
  hasEventListener: descMethod(function (type) {
    return type in this._handlers || type in this._captureHandlers;
  }),
  removeEventListener: descMethod(function (type, listener, useCapture) {
    var list = useCapture ? this._captureHandlers : this._handlers;
    var handler = list[type];
    if (handler) {
      var listeners = handler.listeners;
      var i = listeners.indexOf(listener);
      if (i > -1)
        listeners.splice(i, 1);
      if (!listeners.length) {
        if (this._control)
          this._control.removeEventListener(type, handler, useCapture);

        delete list[type];
      }
    }
  }),
  toString: descMethod(function () {
    return '[object EventDispatcher]';
  }),
  willTrigger: descMethod(function (type) {
    var dispatcher = this;
    do {
      if (dispatcher.hasEventListener(type))
        return true;
    } while (dispatcher = dispatcher.parent);
    return false;
  })
});
