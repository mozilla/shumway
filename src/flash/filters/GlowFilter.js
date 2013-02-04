var GlowFilterDefinition = (function () {
  return {
    __class__: "flash.filters.GlowFilter",
    initialize: function () {
    },
    applyFilter: function (buffer, width, height) {
      var color = [
        this._color >> 24 & 0xFF,
        this._color >> 16 & 0xFF,
        this._color >> 8  & 0xFF,
        this._color       & 0xFF
      ];
      glowFilter(buffer, width, height, color, this._blurX, this._blurY, this._strength);
    },
    updateFilterBounds: function (bounds) {
      assert (bounds instanceof flash.geom.Rectangle);
      bounds.inflate(this._blurX, this._blurY);
    },
    __glue__: {
      native: {
        static: {
        },
        instance: {
          color: {
            get: function color() { return this._color; },
            set: function color(value) { this._color = value; }
          },
          alpha: {
            get: function alpha() { return this._alpha; },
            set: function alpha(value) { this._alpha = value; }
          },
          blurX: {
            get: function blurX() { return this._blurX; },
            set: function blurX(value) { this._blurX = value; }
          },
          blurY: {
            get: function blurY() { return this._blurY; },
            set: function blurY(value) { this._blurY = value; }
          },
          inner: {
            get: function inner() { return this._inner; },
            set: function inner(value) { this._inner = value; }
          },
          knockout: {
            get: function knockout() { return this._knockout; },
            set: function knockout(value) { this._knockout = value; }
          },
          quality: {
            get: function quality() { return this._quality; },
            set: function quality(value) { this._quality = value; }
          },
          strength: {
            get: function strength() { return this._strength; },
            set: function strength(value) { this._strength = value; }
          }
        }
      }
    }
  };
}).call(this);
