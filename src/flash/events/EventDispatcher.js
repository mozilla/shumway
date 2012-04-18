function EventDispatcher() { }
EventDispatcher.trimHeaderValue = function (headerValue) { notImplemented(); };

EventDispatcher.prototype;
EventDispatcher.prototype.ctor = function (target) { notImplemented(); };

EventDispatcher.prototype.addEventListener = function (type,
                                                       listener,
                                                       useCapture,
                                                       priority,
                                                       useWeakReference) {
  notImplemented();
};

EventDispatcher.prototype.removeEventListener = function (type, listener, useCapture) {
  notImplemented();
};
EventDispatcher.prototype.dispatchEvent = function (event) {
  notImplemented();
};
EventDispatcher.prototype.hasEventListener = function (type) {
  notImplemented();
};
EventDispatcher.prototype.willTrigger = function (type) { notImplemented(); };
EventDispatcher.prototype.dispatchEventFunction = function (event) {
  notImplemented();
};
EventDispatcher.prototype.dispatchHttpStatusEvent = function (status, responseLocation, headers) {
  notImplemented();
};

natives.EventDispatcherClass = function (scope, instance, baseClass) {
  var c = new Class(
    "EventDispatcher",
    EventDispatcher,
    Class.passthroughCallable(EventDispatcher)
  );
  c.baseClass = baseClass;
  c.nativeMethods = EventDispatcher.prototype;
  c.nativeStatics = EventDispatcher;
  return c;
};
