function Shape() {
  this.graphics = new Grapics;
}

Shape.prototype = new DisplayObject;

natives.ShapeClass = function (scope, instance, baseClass) {
  var c = new Class("Shape", Shape, Class.passthroughCallable(Shape));
  c.extend(baseClass);

  c.nativeMethods = Shape.prototype;
  c.nativeMethods["get graphics"] = function () { return this.graphics; };

  return c;
};
