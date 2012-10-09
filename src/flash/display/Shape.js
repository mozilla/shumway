const ShapeDefinition = (function () {
  var def = {
    __class__: 'flash.display.Shape',

    initialize: function () {
      this.graphics = new Graphics;
    }
  };

  def.__glue__ = {
    instance: {
      graphics: {
        get: function () { return this.graphics; }
      }
    }
  };

  return def;
}).call(this);
