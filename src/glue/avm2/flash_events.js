natives.EventDispatcherClass = function EventDispatcherClass(runtime, scope, instance, baseClass) {
  var c = new Class("EventDispatcher", instance, Class.passthroughCallable(instance));
  c.extend(baseClass);

  c.nativeStatics = {};

  c.nativeMethods = {
    // ctor :: target:IEventDispatcher -> void
    ctor: function ctor(target) {
      print("Ctor");
    },

    // addEventListener :: type:String, listener:Function, useCapture:Boolean=false, priority:int=0, useWeakReference:Boolean=false -> void
    addEventListener: function addEventListener(type, listener, useCapture, priority, useWeakReference) {
      notImplemented("EventDispatcher.addEventListener");
    },

    // removeEventListener :: type:String, listener:Function, useCapture:Boolean=false -> void
    removeEventListener: function removeEventListener(type, listener, useCapture) {
      notImplemented("EventDispatcher.removeEventListener");
    },

    // hasEventListener :: type:String -> Boolean
    hasEventListener: function hasEventListener(type) {
      notImplemented("EventDispatcher.hasEventListener");
    },

    // willTrigger :: type:String -> Boolean
    willTrigger: function willTrigger(type) {
      notImplemented("EventDispatcher.willTrigger");
    },

    // dispatchEventFunction :: event:Event -> Boolean
    dispatchEventFunction: function dispatchEventFunction(event) {
      notImplemented("EventDispatcher.dispatchEventFunction");
    }
  };

  return c;
};