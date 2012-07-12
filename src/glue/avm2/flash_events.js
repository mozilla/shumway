natives.EventDispatcherClass = function EventDispatcherClass(runtime, scope, instance, baseClass) {
  function constructorHook() {
    this.d = runtime.notifyConstruct(this, Array.prototype.slice.call(arguments, 0));
    return instance.apply(this, arguments);
  }

  var c = new runtime.domain.system.Class("EventDispatcher", constructorHook, Domain.passthroughCallable(constructorHook));
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

natives.EventClass = function EventClass(runtime, scope, instance, baseClass) {
  function constructorHook() {
    this.d = runtime.notifyConstruct(this, Array.prototype.slice.call(arguments, 0));
    return instance.apply(this, arguments);
  }

  var c = new runtime.domain.system.Class("Event", constructorHook, Domain.passthroughCallable(constructorHook));
  c.extend(baseClass);

  c.nativeStatics = {};

  c.nativeMethods = {
    // ctor :: type:String, bubbles:Boolean, cancelable:Boolean -> void
    ctor: function ctor(type, bubbles, cancelable) {
      notImplemented("Event.ctor");
    },

    // type :: void -> String
    "get type": function type() {
      notImplemented("Event.type");
    },

    // bubbles :: void -> Boolean
    "get bubbles": function bubbles() {
      notImplemented("Event.bubbles");
    },

    // cancelable :: void -> Boolean
    "get cancelable": function cancelable() {
      notImplemented("Event.cancelable");
    },

    // target :: void -> Object
    "get target": function target() {
      notImplemented("Event.target");
    },

    // currentTarget :: void -> Object
    "get currentTarget": function currentTarget() {
      notImplemented("Event.currentTarget");
    },

    // eventPhase :: void -> uint
    "get eventPhase": function eventPhase() {
      notImplemented("Event.eventPhase");
    },

    // stopPropagation :: void -> void
    stopPropagation: function stopPropagation() {
      notImplemented("Event.stopPropagation");
    },

    // stopImmediatePropagation :: void -> void
    stopImmediatePropagation: function stopImmediatePropagation() {
      notImplemented("Event.stopImmediatePropagation");
    },

    // preventDefault :: void -> void
    preventDefault: function preventDefault() {
      notImplemented("Event.preventDefault");
    },

    // isDefaultPrevented :: void -> Boolean
    isDefaultPrevented: function isDefaultPrevented() {
      // notImplemented("Event.isDefaultPrevented");
      return Boolean(false);
    }
  };

  return c;
};