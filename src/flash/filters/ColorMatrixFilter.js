var ColorMatrixFilterDefinition = (function () {
  return {
    __class__: "flash.filters.ColorMatrixFilter",
    initialize: function () {

    },
    applyFilter: function (buffer, width, height) {
      if (this._matrix) {
        assert (buffer instanceof Uint8ClampedArray);
        assert (buffer.length === width * height * 4);
        colorFilter(buffer, width, height, this._matrix);
      }
    },
    updateFilterBounds: function (bounds) {
      assert (bounds instanceof flash.geom.Rectangle);
      return bounds;
    },
    __glue__: {
      native: {
        instance: {
          matrix: {
            get: function matrix() { return this._matrix; },
            set: function matrix(value) { this._matrix = value; }
          }
        }
      }
    }
  };
}).call(this);