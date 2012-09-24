natives.KeyboardClass = function EventDispatcherClass(runtime, scope, instance, baseClass) {
  var c = new runtime.domain.system.Class("Keyboard", instance, Domain.passthroughCallable(instance));
  c.extend(baseClass);

  c.nativeStatics = {
    // capsLock :: void -> Boolean
    "get capsLock": function capsLock() {
      notImplemented("Keyboard.capsLock");
    },

    // hasVirtualKeyboard :: void -> Boolean
    "get hasVirtualKeyboard": function hasVirtualKeyboard() {
      notImplemented("Keyboard.hasVirtualKeyboard");
    },

    // numLock :: void -> Boolean
    "get capsLock": function numLock() {
      notImplemented("Keyboard.numLock");
    },

    // 	physicalKeyboardType :: void -> String
    "get physicalKeyboardType": function	physicalKeyboardType() {
      notImplemented("Keyboard.physicalKeyboardType");
    },

    // isAccessible :: void -> Boolean
    "isAccessible": function isAccessible() {
      notImplemented("Keyboard.isAccessible");
    }
  };

  c.nativeMethods = {};

  return c;
};
