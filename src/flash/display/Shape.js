const ShapeDefinition = (function () {
  var def = {
    __class__: 'flash.display.Shape',

    initialize: function () {
      var s = this.symbol;
      if (s) {
        this._graphics = s.graphics || new flash.display.Graphics;
      } else {
        this._graphics = new flash.display.Graphics;
      }
    }
  };

  def.__glue__ = {
    native: {
      instance: {
        graphics: {
          get: function () { return this._graphics; }
        }
      }
    }
  };

  return def;
}).call(this);
