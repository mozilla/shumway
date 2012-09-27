natives.NetConnectionClass = function EventDispatcherClass(runtime, scope, instance, baseClass) {
  var c = new runtime.domain.system.Class("NetConnection", instance, Domain.passthroughCallable(instance));
  c.extend(baseClass);

  c.nativeStatics = {};

  c.nativeMethods = {};

  return c;
};

natives.NetStreamClass = function EventDispatcherClass(runtime, scope, instance, baseClass) {
  var c = new runtime.domain.system.Class("NetStream", instance, Domain.passthroughCallable(instance));
  c.extend(baseClass);

  c.nativeStatics = {};

  c.nativeMethods = {};

  return c;
};
