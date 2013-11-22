/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2013 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* global renderDisplayObject, RenderVisitor, argbUintToStr, getBlendModeName,
   Errors, throwError, URL, Counter */

var CACHE_DRAWABLE_AFTER = 10;

var BitmapDataDefinition = (function () {
  function replaceRect(ctx, x, y, w, h, alpha) {
    if (alpha < 255) {
      ctx.clearRect(x, y, w, h);
    }
    if (alpha > 0) {
      ctx.fillRect(x, y, w, h);
    }
  }

  var def = {
    __class__: 'flash.display.BitmapData',

    initialize: function () {
      this._changeNotificationTarget = null;
      this._locked = false;
      this._requested = 0;
      this._cache = null;

      if (this.symbol) {
        this._img = this.symbol.img;
        this._skipCopyToCanvas = this.symbol.skipCopyToCanvas;
      }
    },

    _checkCanvas: function() {
      if (this._drawable === null)
        throw ArgumentError();
    },

    ctor: function(width, height, transparent, backgroundColor) {
      if (this._img) {
        // the image can be HTML image or canvas
        width = this._img.naturalWidth || this._img.width;
        height = this._img.naturalHeight || this._img.height;
      } else if (isNaN(width + height) || width <= 0 || height <= 0) {
        throwError('ArgumentError', Errors.ArgumentError);
      }

      this._transparent = transparent === undefined ? true : !!transparent;
      this._backgroundColor = backgroundColor === undefined ? 0xffffffff : backgroundColor;
      if (!this._transparent) {
        this._backgroundColor |= 0xff000000;
      }

      if (this._skipCopyToCanvas) {
        this._drawable = this._img;
      } else {
        var canvas = document.createElement('canvas');
        this._ctx = canvas.getContext('2d');
        canvas.width = width | 0;
        canvas.height = height | 0;
        this._drawable = canvas;
        if (!this._transparent || (!this._img && this._backgroundColor)) {
          this.fillRect(new flash.geom.Rectangle(0, 0, width | 0, height | 0), this._backgroundColor);
        }
        if (this._img) {
          this._ctx.drawImage(this._img, 0, 0);
        }
      }
    },
    dispose: function() {
      this._ctx = null;
      this._drawable.width = 0;
      this._drawable.height = 0;
      this._drawable = null;
    },
    draw: function(source, matrix, colorTransform, blendMode, clipRect,
                   smoothing)
    {
      this._checkCanvas();
      var ctx = this._ctx;
      ctx.save();
      ctx.beginPath();
      if (clipRect && clipRect.width > 0 && clipRect.height > 0) {
        ctx.rect(clipRect.x, clipRect.y, clipRect.width, clipRect.height);
        ctx.clip();
      }
      if (matrix) {
        ctx.transform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx,
                      matrix.ty);
      }
      ctx.globalCompositeOperation = getBlendModeName(blendMode);
      ctx.imageSmoothingEnabled = ctx.mozImageSmoothingEnabled = !!smoothing;
      if (flash.display.BitmapData.class.isInstanceOf(source)) {
        ctx.drawImage(source._drawable, 0, 0);
      } else {
        (new RenderVisitor(source, ctx, null, true)).startFragment(matrix);
      }
      ctx.imageSmoothingEnabled = ctx.mozImageSmoothingEnabled = false;
      ctx.restore();
      this._invalidate();
    },
    fillRect: function(rect, color) {
      this._checkCanvas();
      if (!this._transparent) {
        color |= 0xff000000;
      }
      var ctx = this._ctx;
      ctx.fillStyle = argbUintToStr(color);
      replaceRect(ctx, rect.x, rect.y, rect.width, rect.height, color >>> 24 & 0xff);
      this._invalidate();
    },
    getPixel: function(x, y) {
      this._checkCanvas();
      var data = this._ctx.getImageData(x, y, 1, 1).data;
      return dataToRGB(data);
    },
    getPixel32: function(x, y) {
      this._checkCanvas();
      var data = this._ctx.getImageData(x, y, 1, 1).data;
      return dataToARGB(data);
    },
    _invalidate: function(changeRect) {
      if (changeRect) {
        somewhatImplemented("BitmapData._invalidate(changeRect)");
      }
      if (this._locked) {
        return;
      }
      if (this._changeNotificationTarget) {
        this._changeNotificationTarget._drawableChanged();
      }
      this._requested = 0;
      this._cache = null;
    },
    _getDrawable: function () {
      if (this._img === this._drawable) {
        return this._drawable;
      }
      this._requested++;
      if (this._requested >= CACHE_DRAWABLE_AFTER) {
        if (!this._cache) {
          Counter.count('Cache drawable');
          var img = document.createElement('img');
          if ('toBlob' in this._drawable) {
            this._drawable.toBlob(function (blob) {
              img.src = URL.createObjectURL(blob);
              img.onload = function () {
                URL.revokeObjectURL(blob);
              };
            });
          } else {
            img.src = this._drawable.toDataURL();
          }
          this._cache = img;
        }
        if (this._cache.width > 0) { // is image ready
          return this._cache;
        }
      }
      return this._drawable;
    },
    setPixel: function(x, y, color) {
      this.fillRect({ x: x, y: y, width: 1, height: 1 }, color | 0xFF000000);
      this._invalidate();
    },
    setPixel32: function(x, y, color) {
      this.fillRect({ x: x, y: y, width: 1, height: 1 }, color);
      this._invalidate();
    },
    /**
     * Provides a fast routine to perform pixel manipulation between images with no stretching, rotation, or color effects.
     */
    copyPixels: function copyPixels(sourceBitmapData, sourceRect, destPoint, alphaBitmapData, alphaPoint, mergeAlpha) {
      if (alphaBitmapData) {
        notImplemented("BitmapData.copyPixels w/ alpha");
      }
      var w = sourceRect.width;
      var h = sourceRect.height;
      var sx = sourceRect.x;
      var sy = sourceRect.y;
      var dx = destPoint.x;
      var dy = destPoint.y;
      if (!mergeAlpha) {
        this._ctx.clearRect(dx, dy, w, h);
      }
      this._ctx.drawImage(sourceBitmapData._drawable, sx, sy, w, h, dx, dy, w, h);
      this._invalidate();
    },
    /**
     * Locks an image so that any objects that reference the BitmapData object, such as Bitmap objects,
     * are not updated when this BitmapData object changes.
     */
    lock: function lock() { // (void) -> void
      this._locked = true;
    },
    /**
     * Unlocks an image so that any objects that reference the BitmapData object, such as Bitmap
     * objects, are updated when this BitmapData object changes.
     */
    unlock: function unlock(changeRect) { // (changeRect:Rectangle = null) -> void
      this._locked = false;
      this._invalidate(changeRect);
    },
    clone: function() {
      this._checkCanvas();
      var bd = new flash.display.BitmapData(this._drawable.width, this._drawable.height, true, 0);
      bd._ctx.drawImage(this._drawable, 0, 0);
      return bd;
    },
    scroll: function(x, y) {
      this._checkCanvas();
      this._ctx.draw(this._drawable, x, y);
      this._ctx.save();
      var color = this._img ? 0 : this._backgroundColor;
      if (!this._transparent) {
        color |= 0xff000000;
      }
      var alpha = color >>> 24 & 0xff;
      this._ctx.fillStyle = argbUintToStr(color);
      var w = this._drawable.width;
      var h = this._drawable.height;
      if (x > 0) {
        replaceRect(this._ctx, 0, 0, x, h, alpha);
      } else if (x < 0) {
        replaceRect(this._ctx, w + x, 0, -x, h, alpha);
      }
      if (y > 0) {
        replaceRect(this._ctx, 0, 0, w, y, alpha);
      } else if (y < 0) {
        replaceRect(this._ctx, h + y, w, -y, alpha);
      }
      this._ctx.restore();
      this._invalidate();
    },
    get width() {
      return this._drawable.width;
    },
    get height() {
      return this._drawable.height;
    }
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
        copyPixels: def.copyPixels,
        lock: def.lock,
        unlock: def.unlock,
        draw : def.draw,
        clone : def.clone,
        scroll : def.scroll,
        width : desc(def, "width"),
        height : desc(def, "height")
      }
    }
  };

  return def;
}).call(this);

function dataToRGB(data) {
  return data[0] << 16 | data[1] << 8 | data[2];
}
function dataToARGB(data) {
  return data[3] << 24 | dataToRGB(data);
}
