var BitmapDataDefinition = (function () {
  var def = {
    __class__: 'flash.display.BitmapData',

    initialize: function () {
      var s = this.symbol;
      if (s) {
        this.ctor(s.width, s.height);
        this._ctx.drawImage(s.img, 0, 0);
      }
    },

    _checkCanvas: function() {
      if (this._drawable === null)
        throw ArgumentError();
    },

    ctor : function(width, height, transparent, backgroundColor) {
      if (isNaN(width + height) || width <= 0 || height <= 0)
        throw ArgumentError();

      this._transparent = !!transparent;
      var canvas = document.createElement('canvas');
      this._ctx = canvas.getContext('2d');
      canvas.width = width | 0;
      canvas.height = height | 0;
      this._drawable = canvas;
      this._backgroundColor = backgroundColor;

      if (!transparent || backgroundColor | 0)
        this.fillRect(new flash.geom.Rectangle(0, 0, width | 0, height | 0), backgroundColor);
    },
    dispose: function() {
      this._ctx = null;
      this._drawable.width = 0;
      this._drawable.height = 0;
      this._drawable = null;
    },
    draw : function(source, matrix, colorTransform, blendMode, clipRect) {
      this._checkCanvas();
      this._ctx.save();
      this._ctx.beginPath();
      this._ctx.rect(clipRect.x, clipRect.y, clipRect.width, clipRect.height);
      this._ctx.clip();
      renderDisplayObject(source, this._ctx, matrix, colorTransform);
      this._ctx.restore();
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
    clone : function() {
      this._checkCanvas();
      var bd = new flash.display.BitmapData(this._drawable.width, this._drawable.height, true, 0);
      bd._ctx.drawImage(this._drawable, 0, 0);
      return bd;
    },
    scroll : function(x, y) {
      this._checkCanvas();
      this._ctx.draw(this._drawable, x, y);
      this._ctx.save();
      this._ctx.fillStyle = ARGBtoCSSColor(this._backgroundColor);
      var w = this._drawable.width;
      var h = this._drawable.height;
      if (x > 0) {
        this._ctx.fillRect(0, 0, x, h);
      } else if (x < 0) {
        this._ctx.fillRect(x, 0, w, h);
      }
      if (y > 0) {
        this._ctx.fillRect(x, y, w, h);
      } else if (y < 0) {
        this._ctx.fillRect(0, y, w, h);
      }
      this._ctx.restore();
    },

    get width() {
      return this._drawable.width;
    },

    get height() {
      return this._drawable.height;
    },
  };

  var desc = Object.getOwnPropertyDescriptor;

  def.__glue__ = {
    native: {
      instance: {
        ctor : def.ctor,
        fillRect : def.fillRect,
        dispose : def.dispose,
        getPixel : def.getPixel,
        getPixel32 : def.getPixel32,
        setPixel : def.setPixel,
        setPixel32 : def.setPixel32,
        draw : def.draw,
        clone : def.clone,
        scroll : def.scroll,
        width : desc(def, "width"),
        height : desc(def, "height"),
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
