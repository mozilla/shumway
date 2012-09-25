natives.PointClass = function PointClass(runtime, scope, instance, baseClass) {
  var c = new runtime.domain.system.Class("Point", instance, Domain.passthroughCallable(instance));
  c.extend(baseClass, Point.prototype);

  c.nativeStatics = {
  };

  c.nativeMethods = {
  };

  return c;
};