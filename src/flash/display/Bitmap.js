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
/*global FrameCounter, traceRenderer, frameWriter, URL, Counter */

var MAX_SNAP_DRAW_SCALE_TO_CACHE = 8;
var CACHE_SNAP_DRAW_AFTER = 3;

var BitmapDefinition = (function () {
  function setBitmapData(value) {
    if (this._bitmapData) {
      this._bitmapData._changeNotificationTarget = null;
    }
    this._bitmapData = value;
    if (this._bitmapData) {
      this._bitmapData._changeNotificationTarget = this;
    }

    if (value) {
      var canvas = value._drawable;
      this._bbox = {
        xMin: 0,
        yMin: 0,
        xMax: canvas.width * 20,
        yMax: canvas.height * 20
      };
    } else {
      this._bbox = { xMin: 0, yMin: 0, xMax: 0, yMax: 0 };
    }
    this._drawableChanged();
    this._invalidateBounds();
    this._invalidateTransform();
  }

  return {
    // (bitmapData:BitmapData = null, pixelSnapping:String = "auto", smoothing:Boolean = false)
    __class__: "flash.display.Bitmap",
    _drawableChanged: function () {
      this._invalidate();
      this._snapImageCache.image = null;
      this._snapImageCache.hints = 0;
    },
    _cacheSnapImage: function (sizeKey, xScale, yScale) {
      Counter.count('Cache scaled image');
      var original = this._bitmapData._getDrawable();
      var canvas = document.createElement('canvas');
      canvas.width = xScale * original.width;
      canvas.height = yScale * original.height;
      var ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = ctx.mozImageSmoothingEnabled =
        this._smoothing;
      ctx.drawImage(original, 0, 0, original.width, original.height,
                              0, 0, canvas.width, canvas.height);

      var cache = this._snapImageCache;
      var image = document.createElement('img');
      cache._tmp = [canvas, image];
      if ('toBlob' in canvas) {
        canvas.toBlob(function (blob) {
          if (cache.size !== sizeKey) {
            return;
          }
          image.onload = function () {
            URL.revokeObjectURL(blob);
            if (cache.size === sizeKey) {
              cache.image = image;
            }
          };
          image.src = URL.createObjectURL(blob);
        });
      } else {
        image.onload = function () {
          if (cache.size === sizeKey) {
            cache.image = image;
          }
        };
        image.src = canvas.toDataURL();
      }
    },
    initialize: function () {
    },
    __glue__: {
      native: {
        static: {
        },
        instance: {
          ctor : function(bitmapData, pixelSnapping, smoothing) {
            if (pixelSnapping === 'never' || pixelSnapping === 'always') {
              this._pixelSnapping = pixelSnapping;
            } else {
              this._pixelSnapping = 'auto';
            }
            this._smoothing = !!smoothing;
            this._snapImageCache = {
              hits: 0,
              size: '',
              image: null
            };

            if (!bitmapData && this.symbol) {
              var symbol = this.symbol;
              bitmapData = new flash.display.BitmapData(symbol.width,
                                                        symbol.height, true, 0);
              bitmapData._ctx.imageSmoothingEnabled = this._smoothing;
              bitmapData._ctx.mozImageSmoothingEnabled = this._smoothing;
              bitmapData._ctx.drawImage(symbol.img, 0, 0);
              bitmapData._ctx.imageSmoothingEnabled = false;
              bitmapData._ctx.mozImageSmoothingEnabled = false;
            }

            setBitmapData.call(this, bitmapData || null);
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
            set: setBitmapData // (value:BitmapData) -> void
          }
        }
      },
    }
  };
}).call(this);
