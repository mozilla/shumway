natives.TextFieldClass = function TextFieldClass(runtime, scope, instance, baseClass) {
  var c = new runtime.domain.system.Class("TextField", instance, Domain.passthroughCallable(instance));
  c.extend(baseClass);

  c.nativeStatics = {};

  c.nativeMethods = {
    // text :: void -> String
    "get text": function text() {
      return this.nativeObject.text;
    },

    // text :: String -> void
    "set text": function text(value) {
      this.nativeObject.text = value;
    }
  };

  return c;
};

natives.StaticTextClass = function StaticTextClass(runtime, scope, instance, baseClass) {
  var c = new runtime.domain.system.Class("StaticText", instance, Domain.passthroughCallable(instance));
  c.extend(baseClass);

  c.nativeStatics = {};

  c.nativeMethods = {
    // text :: void -> String
    "get text": function text() {
      notImplemented("StaticText.text");
    }
  };

  return c;
};
