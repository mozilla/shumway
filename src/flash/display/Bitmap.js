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
      this._bbox = {
        xMin: 0,
        yMin: 0,
        xMax: value._width * 20,
        yMax: value._height * 20
      };
      if (value._renderableId) {
        this._renderableId = value._renderableId;
      } else {
        this._renderableId = 0;
      }
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
      this._invalidateRenderable();
    },
    initialize: function () { },

    _serializeRenderableData: function (message) {
      var bitmapData = this._bitmapData;

      if (!bitmapData) {
        return;
      }

      message.writeInt(Renderer.RENDERABLE_TYPE_BITMAP);

      message.ensureAdditionalCapacity(16);
      message.writeIntUnsafe(this._bbox.xMax / 20);
      message.writeIntUnsafe(this._bbox.yMax / 20);
      message.writeIntUnsafe(Renderer.BITMAP_TYPE_RAW);

      var imgData = bitmapData._imgData;
      var len = imgData.length;
      message.writeIntUnsafe(len);
      var offset = message.getIndex(1);
      message.reserve(len);
      message.subU8View().set(imgData, offset);

      if (!bitmapData._renderableId) {
        bitmapData._renderableId = this._renderableId;
      }
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
