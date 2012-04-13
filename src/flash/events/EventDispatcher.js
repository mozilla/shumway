function EventDispatcher() { }
EventDispatcher.trimHeaderValue = function(headerValue) { };

var p = EventDispatcher.prototype;
p.ctor = function ctor(target) { };
p.addEventListener = function addEventListener(type, listener, useCapture, priority, useWeakReference) { };
p.removeEventListener = function removeEventListener(type, listener, useCapture) { };
p.hasEventListener = function hasEventListener(type) { };
p.willTrigger = function willTrigger(type) { };
p.dispatchEventFunction = function dispatchEventFunction(event) { };

natives.EventDispatcherClass = function(scope, instance, baseClass) {
  var c = new Class("EventDispatcher", EventDispatcher, C(EventDispatcher));
  c.extend(baseClass);

  return c;
};
