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
/* global clamp, Module, FILTERS */

var BlurFilterDefinition = (function () {
  return {
    __class__: "flash.filters.BlurFilter",
    initialize: function () {

    },
    _generateFilterBounds: function () {
      var bounds = { xMin: 0, yMin: 0, xMax: 0, yMax: 0 };
      this._updateBlurBounds(bounds, true);
      return bounds;
    },
    _applyFilter: function (imageData, width, height) {
      var pimg = Module._malloc(imageData.length);
      Module.HEAPU8.set(imageData, pimg);
      this._applyFilterMulti(pimg, width, height, false);
      FILTERS.unpreMultiplyAlpha(pimg, width, height);
      imageData.set(Module.HEAPU8.subarray(pimg, pimg + imageData.length));
      Module._free(pimg);
    },
    _applyFilterMulti: function (pimg, width, height, isPremult) {
      if (!isPremult) {
        FILTERS.preMultiplyAlpha(pimg, width, height);
      }
      FILTERS.blur(pimg,
                   width, height,
                   Math.round(Math.ceil(this._blurX - 1) / 2),
                   Math.round(Math.ceil(this._blurY - 1) / 2),
                   this._quality, 0);
      return true;
    },
    __glue__: {
      native: {
        instance: {
          blurX: {
            get: function blurX() { return this._blurX; },
            set: function blurX(value) { this._blurX = clamp(value, 0, 255); }
          },
          blurY: {
            get: function blurY() { return this._blurY; },
            set: function blurY(value) { this._blurY = clamp(value, 0, 255); }
          },
          quality: {
            get: function quality() { return this._quality; },
            set: function quality(value) { this._quality = clamp(value, 0, 15); }
          }
        }
      }
    }
  };
}).call(this);
