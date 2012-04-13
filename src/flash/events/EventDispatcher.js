function EventDispatcher() { }
EventDispatcher.trimHeaderValue = function(headerValue) { };

natives.EventDispatcherClass = function(scope, instance, baseClass) {
  var c = new Class("EventDispatcher", EventDispatcher, Class.passthroughCallable(EventDispatcher));
  c.extend(baseClass);

  var p = EventDispatcher.prototype;
  p.ctor = function ctor(target) { };
  p.addEventListener = function addEventListener(type, listener, useCapture, priority, useWeakReference) { };
  p.removeEventListener = function removeEventListener(type, listener, useCapture) { };
  p.hasEventListener = function hasEventListener(type) { };
  p.willTrigger = function willTrigger(type) { };
  p.dispatchEventFunction = function dispatchEventFunction(event) { };

  c.nativeMethods = p;
  c.nativeStatics = EventDispatcher;

  return c;
};
