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
  return {
    // (bitmapData:BitmapData = null, pixelSnapping:String = "auto", smoothing:Boolean = false)
    __class__: "flash.display.Bitmap",
    draw : function(ctx, ratio) {
      ctx.drawImage(this._bitmapData._drawable, 0, 0);
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
            this._markAsDirty();
            this._pixelSnapping = pixelSnapping;
            this._smoothing = smoothing;

            var canvas = this._bitmapData._drawable;
            this._bbox = {
              left: 0,
              top: 0,
              right: canvas.width,
              bottom: canvas.height
            };
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
