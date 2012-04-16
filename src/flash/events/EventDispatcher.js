function EventDispatcher() { }
EventDispatcher.trimHeaderValue = function(headerValue) { notImplemented(); };

var p = EventDispatcher.prototype;
p.ctor = function ctor(target) { notImplemented(); };

p.addEventListener = function addEventListener(type,
                                               listener,
                                               useCapture,
                                               priority,
                                               useWeakReference) {
  notImplemented();
};

p.removeEventListener = function removeEventListener(type, listener, useCapture) {
  notImplemented();
};

p.hasEventListener = function hasEventListener(type) { notImplemented(); };
p.willTrigger = function willTrigger(type) { notImplemented(); };
p.dispatchEventFunction = function dispatchEventFunction(event) { notImplemented(); };

natives.EventDispatcherClass = function(scope, instance, baseClass) {
  var c = new Class(
    "EventDispatcher",
    EventDispatcher,
    Class.passthroughCallable(EventDispatcher)
  );
  c.baseClass = baseClass;
  c.nativeMethods = p;
  c.nativeStatics = EventDispatcher;
  return c;
};
