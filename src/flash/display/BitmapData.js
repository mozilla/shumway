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
/* global renderDisplayObject, RenderVisitor, Errors, throwError */

var BitmapDataDefinition = (function () {
  var def = {
    __class__: 'flash.display.BitmapData',

    initialize: function () {
      this._changeNotificationTarget = null;
      this._locked = false;
      this._renderableId = 0;
    },

    ctor: function(width, height, transparent, backgroundColor) {
      if (isNaN(width + height) || width <= 0 || height <= 0) {
        throwError('ArgumentError', Errors.ArgumentError);
      }

      this._width = width;
      this._height = height;

      this._imgData = new Uint8ClampedArray(width * height * 4);
      this._pixels = new Uint32Array(this._imgData);

      this._transparent = transparent === undefined ? true : !!transparent;
      this._backgroundColor = backgroundColor === undefined ?
                                0xffffffff : backgroundColor;
      if (!this._transparent) {
        this._backgroundColor |= 0xff000000;
        this.fillRect({ x: 0, y: 0, width: this._width, height: this._height },
                      this._backgroundColor);
      }
    },
    dispose: function() {
      this._imgData = null;
      this._pixels = null;
    },
    draw: function(source, matrix, colorTransform, blendMode, clipRect,
                   smoothing)
    {
      if (!this._imgData) {
        throwError('ArgumentError', Errors.ArgumentError);
      }

      if (!source._visible || !source._alpha) {
        return;
      }

      // TODO: support smoothing and clipRect

      var container = new flash.display.DisplayObjectContainer;
      var transform = container.transform;
      if (matrix) {
        transform.matrix = matrix;
      }
      if (colorTransform) {
        transform.colorTransform = colorTransform;
      }
      if (blendMode) {
        transform.blendMode = blendMode;
      }

      container._children[0] = source;

      var message = new BinaryMessage();
      var that = this;
      message.cacheAsBitmap(container);
      this._renderableId = container._renderableId;
      message.syncRenderable(container, function (data) {
        that._imgData = data;
        that._pixels = new Uint32Array(that._imgData);
      });
      message.post('render', true);

      this._invalidate();
    },
    fillRect: function(rect, color) {
      //var imgData = this._imgData;

      //if (!imgData) {
      //  throwError('ArgumentError', Errors.ArgumentError);
      //}

      //if (!this._transparent) {
      //  color |= 0xff000000;
      //}

      //this._invalidate();

      //var xMin = rect.x;
      //var yMin = rect.y;
      //var xMax = xMin + rect.width;
      //var yMax = yMin + rect.height;

      //var a = (color >> 24 & 0xff) / 255;

      //var w = this._width;
      //var h = this._height;

      //if (a >= 1) {
      //  var pixels = this._pixels;
      //  for (var y = yMin; y < yMax; y++) {
      //    var p = y * w + x;
      //    for (var x = xMin; x < xMax; x++) {
      //      pixels[p++] = (color << 8) & 0xff;
      //    }
      //  }
      //  return;
      //}

      //var r = (color >> 16) & 0xff;
      //var g = (color >> 8) & 0xff;
      //var b = color & 0xff;

      //for (var y = yMin; y < yMax; y++) {
      //  var p = (y * w + x) * 4;
      //  for (var x = xMin; x < xMax; x++) {
      //    var alpha = imgData[p + 3] / 255;
      //    alpha += a * (1 - alpha);

      //    imgData[p] = (imgData[p] * a + r * alpha * (1 - a)) / alpha;
      //    imgData[p + 1] = (imgData[p + 1] * a + g * alpha * (1 - a)) / alpha;
      //    imgData[p + 2] = (imgData[p + 2] * a + b * alpha * (1 - a)) / alpha;
      //    imgData[p + 3] = alpha;

      //    p += 4;
      //  }
      //}
    },
    getPixel: function(x, y) {
      if (!this._imgData) {
        throwError('ArgumentError', Errors.ArgumentError);
      }

      return this._pixels[y * this._width + x] >> 8;
    },
    getPixel32: function(x, y) {
      if (!this._imgData) {
        throwError('ArgumentError', Errors.ArgumentError);
      }

      var color = this._pixels[y * this._width + x];
      return (color >> 8) | (color >> 24);
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
      if (!this._imgData) {
        throwError('ArgumentError', Errors.ArgumentError);
      }

      //if (alphaBitmapData) {
      //  notImplemented("BitmapData.copyPixels w/ alpha");
      //}

      //var w = sourceRect.width;
      //var h = sourceRect.height;
      //var sx = sourceRect.x;
      //var sy = sourceRect.y;
      //var dx = destPoint.x;
      //var dy = destPoint.y;

      //if (!mergeAlpha) {
      //  this._ctx.clearRect(dx, dy, w, h);
      //}
      //this._ctx.drawImage(sourceBitmapData._drawable, sx, sy, w, h, dx, dy, w, h);
      //this._invalidate();
    },
    /**
     * Locks an image so that any objects that reference the BitmapData object, such as Bitmap objects,
     * are not updated when this BitmapData object changes.
     */
    lock: function lock() { // (void) -> void
      if (!imgData) {
        throwError('ArgumentError', Errors.ArgumentError);
      }

      this._locked = true;
    },
    /**
     * Unlocks an image so that any objects that reference the BitmapData object, such as Bitmap
     * objects, are updated when this BitmapData object changes.
     */
    unlock: function unlock(changeRect) { // (changeRect:Rectangle = null) -> void
      if (!imgData) {
        throwError('ArgumentError', Errors.ArgumentError);
      }

      this._locked = false;
      this._invalidate(changeRect);
    },
    clone: function() {
      if (!this._imgData) {
        throwError('ArgumentError', Errors.ArgumentError);
      }

      var bd = new flash.display.BitmapData(this._width, this._height, true, 0);
      bd.copyPixels(this, { x: 0,
                            y: 0,
                            width: this._width,
                            height: this._height });
      return bd;
    },
    scroll: function(x, y) {
      if (!this._imgData) {
        throwError('ArgumentError', Errors.ArgumentError);
      }

      //this._checkCanvas();
      //this._ctx.draw(this._drawable, x, y);
      //this._ctx.save();
      //var color = this._img ? 0 : this._backgroundColor;
      //if (!this._transparent) {
      //  color |= 0xff000000;
      //}
      //var alpha = color >>> 24 & 0xff;
      //this._ctx.fillStyle = argbUintToStr(color);
      //var w = this._drawable.width;
      //var h = this._drawable.height;
      //if (x > 0) {
      //  replaceRect(this._ctx, 0, 0, x, h, alpha);
      //} else if (x < 0) {
      //  replaceRect(this._ctx, w + x, 0, -x, h, alpha);
      //}
      //if (y > 0) {
      //  replaceRect(this._ctx, 0, 0, w, y, alpha);
      //} else if (y < 0) {
      //  replaceRect(this._ctx, h + y, w, -y, alpha);
      //}
      //this._ctx.restore();

      this._invalidate();
    },
    get width() {
      if (!this._imgData) {
        throwError('ArgumentError', Errors.ArgumentError);
      }

      return this._width;
    },
    get height() {
      if (!this._imgData) {
        throwError('ArgumentError', Errors.ArgumentError);
      }

      return this._height;
    }
  };

  var desc = Object.getOwnPropertyDescriptor;

  def.__glue__ = {
    native: {
      instance: {
        ctor : def.ctor,
        fillRect : def.fillRect,
        dispose : def.dispose,
        draw : def.draw,
        getPixel : def.getPixel,
        getPixel32 : def.getPixel32,
        setPixel : def.setPixel,
        setPixel32 : def.setPixel32,
        copyPixels: def.copyPixels,
        lock: def.lock,
        unlock: def.unlock,
        clone : def.clone,
        scroll : def.scroll,
        width : desc(def, "width"),
        height : desc(def, "height")
      }
    }
  };

  return def;
}).call(this);
