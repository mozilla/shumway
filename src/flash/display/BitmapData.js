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
    fillRect : function(rect, color) {
      if (!this._transparent) {
        color |= 0xff000000 >>> 0;
      }
      var ctx = this._ctx;
      ctx.fillStyle = ARGBtoCSSColor(color);
      ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    }
  };

def.__glue__ = {
  native: {
    instance: {
      ctor : def.ctor,
      fillRect : def.fillRect
    }
  }
};

return def;
}).call(this);


function ARGBtoRGBA(argb) {
  return (argb >>> 24 | argb << 8) >>> 0;
}
function ARGBtoCSSColor(argb) {
  return 'rgba(' + (argb >>> 16 & 0xff) + ',' + (argb >>> 8 & 0xff) + ',' +
               (argb & 0xff) + ',' + (argb >>> 24 & 0xff) / 0xff + ')';
}