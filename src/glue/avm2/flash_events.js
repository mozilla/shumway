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
      // Creating proxy listeners to wrap an Event object into native one
      var listeners = new WeakMap();
      this._wrapListener = function (args) {
        var ar = Array.prototype.slice.call(args, 0);
        var obj = this;
        var vm = AVM2.currentVM();
        var listener = ar[1];
        var wrapper = listeners.get(listener);
        if (!wrapper) {
          wrapper = function (e) {
            // HACK create script object if one does not exist, using the loader
            var wrappedArg = e.scriptObject ||
              bindNativeObjectUsingAvm2(vm, e);
            listener(wrappedArg);
          };
          listeners.set(listener, wrapper);
        }
        ar[1] = wrapper;
        return ar;
      };
    },

    // addEventListener :: type:String, listener:Function, useCapture:Boolean=false, priority:int=0, useWeakReference:Boolean=false -> void
    addEventListener: function addEventListener(type, listener, useCapture, priority, useWeakReference) {
      this.nativeObject.addEventListener.apply(this.nativeObject, this._wrapListener(arguments));
    },

    // removeEventListener :: type:String, listener:Function, useCapture:Boolean=false -> void
    removeEventListener: function removeEventListener(type, listener, useCapture) {
      this.nativeObject.removeEventListener.apply(this.nativeObject, this._wrapListener(arguments));
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
      // print("Event.ctor");
    },

    // type :: void -> String
    "get type": function type() {
      return this.nativeObject.type;
    },

    // bubbles :: void -> Boolean
    "get bubbles": function bubbles() {
      return this.nativeObject.bubbles;
    },

    // cancelable :: void -> Boolean
    "get cancelable": function cancelable() {
      return this.nativeObject.cancelable;
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
      return this.nativeObject.eventPhase;
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

natives.KeyboardEventClass = function KeyboardEventClass(runtime, scope, instance, baseClass) {
  function constructorHook() {
    this.d = runtime.notifyConstruct(this, Array.prototype.slice.call(arguments, 0));
    return instance.apply(this, [this.nativeObject.type,
                                 this.nativeObject.bubbles,
                                 this.nativeObject.cancelable,
                                 this.nativeObject.charCode,
                                 this.nativeObject.keyCode,
                                 this.nativeObject.keyLocation,
                                 this.nativeObject.ctrlKey,
                                 this.nativeObject.altKey,
                                 this.nativeObject.shiftKey]);
  }

  var c = new runtime.domain.system.Class("KeyboardEvent", constructorHook, Domain.passthroughCallable(constructorHook));
  c.extend(baseClass);

  c.nativeStatics = {};

  c.nativeMethods = {
    // altKey :: void -> Boolean
    "get altKey": function altKey() {
      return this.nativeObject.altKey;
    },

    // altKey :: value:Boolean -> void
    "set altKey": function altKey(value) {
      this.nativeObject.altKey = value;
    },

    // charCode :: charCode -> Number
    "get charCode": function charCode() {
      return this.nativeObject.charCode;
    },

    // charCode :: value:Number -> void
    "set charCode": function charCode(value) {
      this.nativeObject.charCode = value;
    },

    // ctrlKey :: void -> Boolean
    "get ctrlKey": function ctrlKey() {
      return this.nativeObject.ctrlKey;
    },

    // ctrlKey :: value:Boolean -> void
    "set ctrlKey": function ctrlKey(value) {
      this.nativeObject.ctrlKey = value;
    },

    // shiftKey :: void -> Boolean
    "get shiftKey": function shiftKey() {
      return this.nativeObject.shiftKey;
    },

    // shiftKey :: value:Boolean -> void
    "set shiftKey": function shiftKey(value) {
      this.nativeObject.shiftKey = value;
    }
  };

  return c;
};

natives.MouseEventClass = function MouseEventClass(runtime, scope, instance, baseClass) {
  var c = new runtime.domain.system.Class("MouseEvent", instance, Domain.passthroughCallable(instance));
  c.extend(baseClass);

  c.nativeStatics = {};

  c.nativeMethods = {};

  return c;
};

natives.TimerEventClass = function TimerEventClass(runtime, scope, instance, baseClass) {
  var c = new runtime.domain.system.Class("TimerEvent", instance, Domain.passthroughCallable(instance));
  c.extend(baseClass);

  c.nativeStatics = {};

  c.nativeMethods = {};

  return c;
};

natives.TextEventClass = function TextEventClass(runtime, scope, instance, baseClass) {
  var c = new runtime.domain.system.Class("TextEvent", instance, Domain.passthroughCallable(instance));
  c.extend(baseClass);

  c.nativeStatics = {
  };

  c.nativeMethods = {
    // copyNativeData :: other:TextEvent -> void
    copyNativeData: function copyNativeData(other) {
      notImplemented("TextEvent.copyNativeData");
    }
  };

  return c;
};