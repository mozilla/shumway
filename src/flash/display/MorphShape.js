var MorphShapeDefinition = (function () {
  var def = {
    __class__: 'flash.display.MorphShape',

    initialize: function () {
      this._graphics = new flash.display.Graphics;

      var s = this.symbol;
      if (s) {
        if (s.factory) {
          this._graphics._scale = 0.05;
          this._graphics.drawGraphicsData(s.factory(s.ratio || 0));
        }
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
