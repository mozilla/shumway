var BitmapDataDefinition = (function () {
  var def = {
    __class__: 'flash.display.BitmapData',

    ctor : function(width, height, transparent, backgroundColor) {
      if (isNaN(width + height) || width <= 0 || height <= 0)
      {
        avm2.throwErrorFromVM("ArgumentError");
      }
      this._transparent = !!transparent;
      this._canvas = document.createElement('canvas');
      this._ctx = this._canvas.getContext('2d');
      this._canvas.width = width | 0;
      this._canvas.height = height | 0;
      if (!transparent || backgroundColor | 0) {
        this.fillRect(new flash.geom.Rectangle(0, 0, width | 0, height | 0), backgroundColor);
      }
    },
    _checkCanvas: function() {
      if (this._canvas === null)
        avm2.throwErrorFromVM("ArgumentError");
    },
    dispose: function() {
      this._canvas.width = 0;
      this._canvas.height = 0;
      this._canvas = null;
      this._ctx = null;
    },
    fillRect : function(rect, color) {
      this._checkCanvas();
      if (!this._transparent) {
        color |= 0xff000000 >>> 0;
      }
      var ctx = this._ctx;
      ctx.fillStyle = ARGBtoCSSColor(color);
      ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    },
    getPixel : function(x, y) {
      this._checkCanvas();
      var data = this._ctx.getImageData(x, y, 1, 1);
      return dataToRGB(data);
    },
    getPixel32 : function(x, y) {
      this._checkCanvas();
      var data = this._ctx.getImageData(x, y, 1, 1);
      return dataToARGB(data);
    },
    setPixel : function(x, y, color) {
      this.fillRect({ x: x, y: y, width: 1, height: 1 }, color | 0xFF000000);
    },
    setPixel32 : function(x, y, color) {
      this.fillRect({ x: x, y: y, width: 1, height: 1 }, color);
    },
  };

def.__glue__ = {
  native: {
    instance: {
      ctor : def.ctor,
      fillRect : def.fillRect,
      dispose : def.dispose,
      getPixel : def.getPixel,
      getPixel32 : def.getPixel32,
      setPixel : def.setPixel,
      setPixel32 : def.setPixel32
    }
  }
};

return def;
}).call(this);

function dataToRGB(data) {
  return data[0] << 24 | data[1] << 16 | data[2];
}
function dataToARGB(data) {
  return data[3] << 32 | dataToRGB(data);
}
function ARGBtoRGBA(argb) {
  return (argb >>> 24 | argb << 8) >>> 0;
}
function ARGBtoCSSColor(argb) {
  return 'rgba(' + (argb >>> 16 & 0xff) + ',' + (argb >>> 8 & 0xff) + ',' +
               (argb & 0xff) + ',' + (argb >>> 24 & 0xff) / 0xff + ')';
}
