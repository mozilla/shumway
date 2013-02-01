var ColorMatrixFilterDefinition = (function () {
  return {
    __class__: "flash.filters.ColorMatrixFilter",
    initialize: function () {
      this._matrix = null;
    },
    applyFilter: function (buffer, width, height) {
      if (this._matrix) {
        assert (buffer instanceof Uint8ClampedArray);
        assert (buffer.length === width * height * 4);
        colorFilter(buffer, width, height, this._matrix);
      }
    },
    computeFilterBounds: function (bounds) {
      return bounds;
    },
    __glue__: {
      native: {
        instance: {
          matrix: {
            get: function matrix() {
              return this._matrix;
            },
            set: function matrix(value) {
              this._matrix = value;
            }
          }
        }
      }
    }
  };
}).call(this);