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
/* global clamp, isString, throwError, Errors */

var BevelFilterDefinition = (function () {
  return {
    __class__: 'flash.filters.BevelFilter',
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
          distance: {
            get: function distance() { return this._distance; },
            set: function distance(value) { this._distance = value; }
          },
          highlightAlpha: {
            get: function highlightAlpha() { return this._highlightAlpha; },
            set: function highlightAlpha(value) { this._highlightAlpha = clamp(value, 0, 1); }
          },
          highlightColor: {
            get: function highlightColor() { return this._highlightColor; },
            set: function highlightColor(value) { this._highlightColor = value; }
          },
          knockout: {
            get: function knockout() { return this._knockout; },
            set: function knockout(value) { this._knockout = value; }
          },
          quality: {
            get: function quality() { return this._quality; },
            set: function quality(value) { this._quality = clamp(value, 0, 15); }
          },
          shadowAlpha: {
            get: function shadowAlpha() { return this._shadowAlpha; },
            set: function shadowAlpha(value) { this._shadowAlpha = clamp(value, 0, 1); }
          },
          shadowColor: {
            get: function shadowColor() { return this._shadowColor; },
            set: function shadowColor(value) { this._shadowColor = value; }
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
