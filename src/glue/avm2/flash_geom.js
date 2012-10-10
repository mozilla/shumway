natives.ColorTransformClass = function ColorTransformClass(runtime, scope, instance, baseClass) {
  var c = new runtime.domain.system.Class("ColorTransform", instance, Domain.passthroughCallable(instance));
  c.extend(baseClass, ColorTransform.prototype);

  c.nativeStatics = {
  };

  c.nativeMethods = {
  };

  return c;
};

natives.MatrixClass = function MatrixClass(runtime, scope, instance, baseClass) {
  var c = new runtime.domain.system.Class("Matrix", instance, Domain.passthroughCallable(instance));
  c.extend(baseClass, Matrix.prototype);

  c.nativeStatics = {
  };

  c.nativeMethods = {
  };

  return c;
};

natives.PointClass = function PointClass(runtime, scope, instance, baseClass) {
  function constructorHook() {
    this.d = runtime.notifyConstruct(this, Array.prototype.slice.call(arguments, 0));
    Object.defineProperties(this, {
      x: describeAccessor(
        function () { return this.public$x; },
        function (val) { this.public$x = val; }
      ),
      y: describeAccessor(
        function () { return this.public$y; },
        function (val) { this.public$y = val; }
      )
    });
    return instance.apply(this, arguments);
  }

  var c = new runtime.domain.system.Class("Point", constructorHook, Domain.passthroughCallable(constructorHook));
  c.extend(baseClass, Point.prototype);

  c.nativeStatics = {
  };

  c.nativeMethods = {
  };

  return c;
};

natives.RectangleClass = function RectangleClass(runtime, scope, instance, baseClass) {
  var c = new runtime.domain.system.Class("Rectangle", instance, Domain.passthroughCallable(instance));
  c.extend(baseClass, Rectangle.prototype);

  c.nativeStatics = {
  };

  c.nativeMethods = {
  };

  return c;
};

natives.TransformClass = function TransformClass(runtime, scope, instance, baseClass) {
  var c = new runtime.domain.system.Class("Transform", instance, Domain.passthroughCallable(instance));
  c.extend(baseClass, Transform.prototype);

  c.nativeStatics = {
  };

  c.nativeMethods = {
  };

  return c;
};

