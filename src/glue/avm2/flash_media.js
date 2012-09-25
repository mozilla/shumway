natives.SoundTransformClass = function SoundTransformClass(runtime, scope, instance, baseClass) {
  function constructorHook() {
    this.d = runtime.notifyConstruct(this, Array.prototype.slice.call(arguments, 0));
    //this.nativeObject = new Timer_avm2(arguments[0], arguments[1]); // XXX constructing the native timer
    // TODO how to update iteration count in the script object?
    // TODO and in reverse, if repeatCount was updated how to update native object?
    return instance.apply(this, arguments);
  }

  var c = new runtime.domain.system.Class("SoundTransform", constructorHook, Domain.passthroughCallable(constructorHook));
  c.extend(baseClass);

  c.nativeStatics = {};

  c.nativeMethods = {};

  return c;
};
