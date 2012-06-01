function Shape() {
  this.graphics = {};
}

Shape.prototype = Object.create(new DisplayObject);
