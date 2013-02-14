var ShapeDefinition = (function () {
  var def = {
    __class__: 'flash.display.Shape',

    initialize: function () {
      var s = this.symbol;
      if (s && s.graphicsFactory) {
        this._graphics = s.graphicsFactory(0);

        if (this._stage && this._stage._quality === 'low')
          this._graphics._cacheAsBitmap(this._bbox);
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
