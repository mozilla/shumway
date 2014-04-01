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
/* global clamp */

var DropShadowFilterDefinition = (function () {
  return {
    __class__: "flash.filters.DropShadowFilter",
    initialize: function () {

    },
    _generateFilterBounds: function () {
      var bounds = { xMin: 0, yMin: 0, xMax: 0, yMax: 0 };
      this._updateBlurBounds(bounds);
      if (this._distance !== 0) {
        var a = (this._inner ? this._angle + 180 : this._angle) * Math.PI / 180;
        var dx = Math.cos(a) * this._distance;
        var dy = Math.sin(a) * this._distance;
        bounds.xMin -= (dx >= 0 ? 0 : Math.floor(dx));
        bounds.xMax += Math.ceil(Math.abs(dx));
        bounds.yMin -= (dy >= 0 ? 0 : Math.floor(dy));
        bounds.yMax += Math.ceil(Math.abs(dy));
      }
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
      var a = this._angle * Math.PI / 180;
      var dx = Math.cos(a) * this._distance;
      var dy = Math.sin(a) * this._distance;
      var flags = 0;
      if (this._inner) { flags |= 0x01; }
      if (this._knockout) { flags |= 0x02; }
      if (this._hideObject) { flags |= 0x04; }
      FILTERS.dropshadow(pimg,
                         width, height,
                         dx, dy,
                         this._color, this._alpha,
                         Math.round(Math.ceil(this._blurX - 1) / 2),
                         Math.round(Math.ceil(this._blurY - 1) / 2),
                         this._strength,
                         this._quality,
                         flags);
      return true;
    },
    _serialize: function (message) {
      message.ensureAdditionalCapacity(48);
      message.writeIntUnsafe(0);
      message.writeFloatUnsafe(this._alpha);
      message.writeFloatUnsafe(this._angle);
      message.writeFloatUnsafe(this._blurX);
      message.writeFloatUnsafe(this._blurY);
      message.writeIntUnsafe(this._color);
      message.writeFloatUnsafe(this._distance);
      message.writeIntUnsafe(this._hideObject);
      message.writeIntUnsafe(this._inner);
      message.writeIntUnsafe(this._knockout);
      message.writeIntUnsafe(this._quality);
      message.writeFloatUnsafe(this._strength);
    },
    __glue__: {
      native: {
        instance: {
          alpha: {
            get: function alpha() { return this._alpha; },
            set: function alpha(value) { this._alpha = clamp(value, 0, 1); }
          },
          angle: {
            get: function angle() { return this._angle; },
            set: function angle(value) { this._angle = value % 360; }
          },
          blurX: {
            get: function blurX() { return this._blurX; },
            set: function blurX(value) { this._blurX = clamp(value, 0, 255); }
          },
          blurY: {
            get: function blurY() { return this._blurY; },
            set: function blurY(value) { this._blurY = clamp(value, 0, 255); }
          },
          color: {
            get: function color() { return this._color; },
            set: function color(value) { this._color = value; }
          },
          distance: {
            get: function distance() { return this._distance; },
            set: function distance(value) { this._distance = value; }
          },
          hideObject: {
            get: function hideObject() { return this._hideObject; },
            set: function hideObject(value) { this._hideObject = value; }
          },
          inner: {
            get: function inner() { return this._inner; },
            set: function inner(value) { this._inner = value; }
          },
          knockout: {
            get: function knockout() { return this._knockout; },
            set: function knockout(value) { this._knockout = value; }
          },
          quality: {
            get: function quality() { return this._quality; },
            set: function quality(value) { this._quality = clamp(value, 0, 15); }
          },
          strength: {
            get: function strength() { return this._strength; },
            set: function strength(value) { this._strength = clamp(value, 0, 255); }
          }
        }
      }
    }
  };
}).call(this);
