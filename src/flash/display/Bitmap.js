var BitmapDefinition = (function () {
  return {
    // (bitmapData:BitmapData = null, pixelSnapping:String = "auto", smoothing:Boolean = false)
    __class__: "flash.display.Bitmap",
    draw : function(ctx, ratio) {
      ctx.drawImage(this._bitmapData._canvas, 0, 0);
    },
    initialize: function () {
    },
    __glue__: {
      native: {
        static: {
        },
        instance: {
          ctor : function(bitmapData, pixelSnapping, smoothing) {
            this._bitmapData = bitmapData;
            this._pixelSnapping = pixelSnapping;
            this._smoothing = smoothing;
          },
          pixelSnapping: {
            get: function pixelSnapping() { // (void) -> String
              return this._pixelSnapping;
            },
            set: function pixelSnapping(value) { // (value:String) -> void
              this._pixelSnapping = value;
            }
          },
          smoothing: {
            get: function smoothing() { // (void) -> Boolean
              return this._smoothing;
            },
            set: function smoothing(value) { // (value:Boolean) -> void
              this._smoothing = value;
            }
          },
          bitmapData: {
            get: function bitmapData() { // (void) -> BitmapData
              return this._bitmapData;
            },
            set: function bitmapData(value) { // (value:BitmapData) -> void
              this._bitmapData = value;
            }
          }
        }
      },
    }
  };
}).call(this);
