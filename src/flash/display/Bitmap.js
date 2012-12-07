var BitmapDefinition = (function () {
  var def = {
    __class__: 'flash.display.Bitmap',
    draw : function(ctx, ratio) {
      ctx.drawImage(this._bitmapData._canvas, 0, 0);
    }
  };

def.__glue__ = {
  native: {
    instance: {
      ctor : function(bitmapData, pixelSnapping, smoothing) {
        this._bitmapData = bitmapData;
        this._pixelSnapping = pixelSnapping;
        this._smoothing = smoothing;
      }
    }
  }
};

return def;
}).call(this);
