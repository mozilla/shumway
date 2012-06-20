natives.EventDispatcherClass = function EventDispatcherClass(scope, instance, baseClass) {
  function EventDispatcher() {};
  var c = new Class("EventDispatcher", EventDispatcher, Class.passthroughCallable(EventDispatcher));
  //
  // WARNING! This sets:
  //   EventDispatcher.prototype = Object.create(baseClass.instance.prototype)
  //
  // If you want to manage prototypes manually, do this instead:
  //   c.baseClass = baseClass
  //
  c.extend(baseClass);
  var m = EventDispatcher.prototype;
  var s = {};
  // Signature: headerValue:String -> String
  s.trimHeaderValue = function trimHeaderValue(headerValue) { notImplemented("EventDispatcher.trimHeaderValue"); };
  // Signature: target:IEventDispatcher -> void
  m.ctor = function ctor(target) { notImplemented("EventDispatcher.ctor"); };
  // Signature: type:String, listener:Function, useCapture:Boolean=false, priority:int=0, useWeakReference:Boolean=false -> void
  m.addEventListener = function addEventListener(type, listener, useCapture, priority, useWeakReference) { notImplemented("EventDispatcher.addEventListener"); };
  // Signature: type:String, listener:Function, useCapture:Boolean=false -> void
  m.removeEventListener = function removeEventListener(type, listener, useCapture) { notImplemented("EventDispatcher.removeEventListener"); };
  // Signature: event:Event -> Boolean
  m.dispatchEvent = function dispatchEvent(event) { notImplemented("EventDispatcher.dispatchEvent"); };
  // Signature: type:String -> Boolean
  m.hasEventListener = function hasEventListener(type) { notImplemented("EventDispatcher.hasEventListener"); };
  // Signature: type:String -> Boolean
  m.willTrigger = function willTrigger(type) { notImplemented("EventDispatcher.willTrigger"); };
  // Signature: event:Event -> Boolean
  m.dispatchEventFunction = function dispatchEventFunction(event) { notImplemented("EventDispatcher.dispatchEventFunction"); };
  // Signature: status:uint, responseLocation:String, headers:String -> void
  m.dispatchHttpStatusEvent = function dispatchHttpStatusEvent(status, responseLocation, headers) { notImplemented("EventDispatcher.dispatchHttpStatusEvent"); };
  c.nativeMethods = m;
  c.nativeStatics = s;
  return c;
};