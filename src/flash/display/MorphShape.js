var MorphShapeDefinition = (function () {
  var def = {
    __class__: 'flash.display.MorphShape',

    initialize: function () {
      this._graphics = new flash.display.Graphics;

      var s = this.symbol;
      if (s && s.graphicsFactory)
        this._graphics = s.graphicsFactory(s.ratio || 0);
      else
        this._graphics = new flash.display.Graphics;
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
