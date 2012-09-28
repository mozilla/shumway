natives.TextFieldClass = function TextFieldClass(runtime, scope, instance, baseClass) {
  var c = new runtime.domain.system.Class("TextField", instance, Domain.passthroughCallable(instance));
  c.extend(baseClass);

  c.nativeStatics = {
    // text :: void -> String
    "get text": function text() {
      notImplemented("TextField.text");
    },

    // text :: String -> void
    "set text": function text(value) {
      notImplemented("TextField.text");
    }
  };

  c.nativeMethods = {};

  return c;
};

natives.StaticTextClass = function StaticTextClass(runtime, scope, instance, baseClass) {
  var c = new runtime.domain.system.Class("StaticText", instance, Domain.passthroughCallable(instance));
  c.extend(baseClass);

  c.nativeStatics = {
    // text :: void -> String
    "get text": function text() {
      notImplemented("StaticText.text");
    }
  };

  c.nativeMethods = {};

  return c;
};
