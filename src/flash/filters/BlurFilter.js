var BlurFilterDefinition = (function () {
  return {
    __class__: "flash.filters.BlurFilter",
    initialize: function () {

    },
    applyFilter: function (buffer, width, height) {
      assert (buffer instanceof Uint8ClampedArray);
      assert (buffer.length === width * height * 4);
      blurFilter(buffer, width, height, this._blurX, this._blurY);
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
          blurX: {
            get: function blurX() { return this._blurX; },
            set: function blurX(value) { this._blurX = value; }
          },
          blurY: {
            get: function blurY() { return this._blurY; },
            set: function blurY(value) { this._blurY = value; }
          },
          quality: {
            get: function quality() { return this._quality; },
            set: function quality(value) { this._quality = value; }
          }
        }
      }
    }
  };
}).call(this);