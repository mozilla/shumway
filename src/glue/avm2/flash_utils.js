natives.TimerClass = function EventDispatcherClass(runtime, scope, instance, baseClass) {
  var c = new runtime.domain.system.Class("Timer", instance, Domain.passthroughCallable(instance));
  c.extend(baseClass);

  c.nativeStatics = {};

  c.nativeMethods = {};

  return c;
};
