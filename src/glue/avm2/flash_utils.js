natives.TimerClass = function TimerClass(runtime, scope, instance, baseClass) {
  function constructorHook() {
    this.d = runtime.notifyConstruct(this, Array.prototype.slice.call(arguments, 0));
    this.nativeObject = new Timer_avm2(arguments[0], arguments[1]); // XXX constructing the native timer
    // TODO how to update iteration count in the script object?
    // TODO and in reverse, if repeatCount was updated how to update native object?
    return instance.apply(this, arguments);
  }

  var c = new runtime.domain.system.Class("Timer", constructorHook, Domain.passthroughCallable(constructorHook));
  c.extend(baseClass);

  c.nativeStatics = {};

  c.nativeMethods = {
    // running:: void -> Boolean
    "get running": function running() {
      return this.nativeObject.running;
    },

    // _start:: void -> void
    _start: function start() {
      this.nativeObject._start();
    },

    // _timerDispatch:: void -> void
    _timerDispatch: function timerDispatch() {
      this.nativeObject._timerDispatch();
    },

    // _stop:: void -> void
    _stop: function stop() {
      this.nativeObject._stop();
    }
  };

  return c;
};
