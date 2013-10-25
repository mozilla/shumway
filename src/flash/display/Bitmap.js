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
/*global FrameCounter, traceRenderer, frameWriter */

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
    this._invalidate();
    this._invalidateBounds();
    this._invalidateTransform();
  }

  return {
    // (bitmapData:BitmapData = null, pixelSnapping:String = "auto", smoothing:Boolean = false)
    __class__: "flash.display.Bitmap",
    draw: function(ctx, ratio, colorTransform) {
      if (!this._bitmapData) {
        return;
      }
      ctx.save();
      if (this._pixelSnapping === 'auto' || this._pixelSnapping === 'always') {
        var transform = this._getConcatenatedTransform(true);
        var EPSILON = 0.001;
        if (Math.abs(Math.abs(transform.a) - 1) <= EPSILON &&
            Math.abs(Math.abs(transform.d) - 1) <= EPSILON &&
            Math.abs(transform.b) <= EPSILON && Math.abs(transform.c) <= EPSILON) {
          ctx.setTransform(transform.a < 0 ? -1 : 1, 0, 0, transform.d < 0 ? -1 : 1,
                           (transform.tx/20)|0, (transform.ty/20)|0);
        }
        // TODO this._pixelSnapping === 'always'; does it even make sense in other cases?
      }
      colorTransform.setAlpha(ctx, true);
      ctx.imageSmoothingEnabled = ctx.mozImageSmoothingEnabled =
                                  this._smoothing;
      ctx.drawImage(this._bitmapData._drawable, 0, 0);
      ctx.imageSmoothingEnabled = ctx.mozImageSmoothingEnabled = false;
      ctx.restore();
      traceRenderer.value && frameWriter.writeLn("Bitmap.draw() snapping: " + this._pixelSnapping +
        ", dimensions: " + this._bitmapData._drawable.width + " x " + this._bitmapData._drawable.height);
      FrameCounter.count("Bitmap.draw()");
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
