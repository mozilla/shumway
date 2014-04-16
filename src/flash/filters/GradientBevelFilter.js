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
/* global clamp, isString, isNullOrUndefined, throwError, Errors */

// colors  alphas  ratios
// [..]    [..]    [..]     minimum length of colors/alphas/ratios
// [..]    [..]    null     length of colors, alphas set to 1s, ratios set to 0s
// [..]    null    [..]     minimum length of colors/ratios, alphas set to 0s, ratios filled with 0s
// [..]    null    null     length of colors, alphas set to 0s, ratios set to 0s
// null    [..]    [..]     empty colors/alphas/ratios
// null    [..]    null     empty colors/alphas/ratios
// null    null    [..]     empty colors/alphas/ratios
// null    null    null     empty colors/alphas/ratios

var GradientBevelFilterDefinition = (function () {

  var ctorPhase = true;
  var ctorColors;
  var ctorAlphas;
  var ctorRatios;

  function ctorInit(self) {
    self._colors = ctorColors;
    self._alphas = ctorAlphas;
    self._ratios = ctorRatios;
  }

  return {
    __class__: 'flash.filters.GradientBevelFilter',
    initialize: function () {
    },
    _generateFilterBounds: function () {
      if (this.type === "inner") {
        return null;
      } else {
        var bounds = { xMin: 0, yMin: 0, xMax: 0, yMax: 0 };
        this._updateBlurBounds(bounds);
        if (this._distance !== 0) {
          var a = this._angle * Math.PI / 180;
          var dx = Math.cos(a) * this._distance;
          var dy = Math.sin(a) * this._distance;
          bounds.xMin -= (dx >= 0 ? 0 : Math.floor(dx));
          bounds.xMax += Math.ceil(Math.abs(dx));
          bounds.yMin -= (dy >= 0 ? 0 : Math.floor(dy));
          bounds.yMax += Math.ceil(Math.abs(dy));
        }
        return bounds;
      }
    },
    __glue__: {
      native: {
        instance: {
          alphas: {
            get: function alphas() { return this._alphas.concat(); },
            set: function alphas(value) {
              if (!isNullOrUndefined(value)) {
                if (ctorPhase) {
                  ctorAlphas = value;
                } else {
                  this._alphas = value;
                }
              } else {
                throwError("TypeError", Errors.NullPointerError, "alphas");
              }
            }
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
          colors: {
            get: function colors() { return this._colors.concat(); },
            set: function colors(value) {
              if (!isNullOrUndefined(value)) {
                if (ctorPhase) {
                  ctorColors = value;
                } else {
                  this._colors = value;
                }
              } else {
                throwError("TypeError", Errors.NullPointerError, "colors");
              }
            }
          },
          distance: {
            get: function distance() { return this._distance; },
            set: function distance(value) { this._distance = value; }
          },
          knockout: {
            get: function knockout() { return this._knockout; },
            set: function knockout(value) {
              if (ctorPhase) {
                ctorInit(this);
                ctorPhase = false;
              }
              this._knockout = value;
            }
          },
          quality: {
            get: function quality() { return this._quality; },
            set: function quality(value) { this._quality = clamp(value, 0, 15); }
          },
          ratios: {
            get: function ratios() { return this._ratios.concat(); },
            set: function ratios(value) {
              if (!isNullOrUndefined(value)) {
                if (ctorPhase) {
                  ctorRatios = value;
                } else {
                  this._ratios = value;
                }
              } else {
                throwError("TypeError", Errors.NullPointerError, "ratios");
              }
            }
          },
          strength: {
            get: function strength() { return this._strength; },
            set: function strength(value) { this._strength = clamp(value, 0, 255); }
          },
          type: {
            get: function type() { return this._type; },
            set: function type(value) {
              if (isString(value)) {
                if (value === "inner" || value === "outer") {
                  this._type = value;
                } else {
                  this._type = "full";
                }
              } else {
                throwError("TypeError", Errors.NullPointerError, "type");
              }
            }
          }
        }
      }
    }
  };
}).call(this);
