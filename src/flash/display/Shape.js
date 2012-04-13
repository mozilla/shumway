function Shape() {
  this.graphics = new Grapics;
}

Shape.prototype = new DisplayObject;

natives.ShapeClass = function (scope, instance, baseClass) {
  var c = new Class("Shape", Shape, C(Shape));
  c.extend(baseClass);

  c.getters = { graphics: function () { return this.graphics } };

  return c;
};
