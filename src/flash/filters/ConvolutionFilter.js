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
/* global clamp, isNullOrUndefined, toNumber, throwError, Errors */

var ConvolutionFilterDefinition = (function () {

  function expandArray(a, newLen) {
    var i = a.length;
    while (i < newLen) {
      a[i++] = 0;
    }
  }

  return {
    __class__: "flash.filters.ConvolutionFilter",
    initialize: function () {
      this._matrix = [];
      this._matrixX = 0;
      this._matrixY = 0;
    },
    __glue__: {
      native: {
        instance: {
          alpha: {
            get: function alpha() { return this._alpha; },
            set: function alpha(value) { this._alpha = clamp(value, 0, 1); }
          },
          bias: {
            get: function bias() { return this._bias; },
            set: function bias(value) { this._bias = value; }
          },
          clamp: {
            get: function clamp() { return this._clamp; },
            set: function clamp(value) { this._clamp = value; }
          },
          color: {
            get: function color() { return this._color; },
            set: function color(value) { this._color = value; }
          },
          divisor: {
            get: function divisor() { return this._divisor; },
            set: function divisor(value) { this._divisor = value; }
          },
          matrix: {
            get: function matrix() { return this._matrix; },
            set: function matrix(value) {
              if (!isNullOrUndefined(value)) {
                var actualLen = this._matrixX * this._matrixY;
                var minLen = Math.min(value.length, actualLen);
                var matrix = Array(minLen);
                for (var i = 0; i < minLen; i++) {
                  matrix[i] = toNumber(value[i]);
                }
                expandArray(matrix, actualLen);
                this._matrix = matrix;
              } else {
                throwError("TypeError", Errors.NullPointerError, "matrix");
              }
            }
          },
          matrixX: {
            get: function matrixX() { return this._matrixX; },
            set: function matrixX(value) {
              var mx = clamp(value, 0, 15);
              if (this._matrixX !== mx) {
                this._matrixX = mx;
                expandArray(this._matrix, mx * this._matrixY);
              }
            }
          },
          matrixY: {
            get: function matrixY() { return this._matrixY; },
            set: function matrixY(value) {
              var my = clamp(value, 0, 15);
              if (this._matrixY !== my) {
                this._matrixY = my;
                expandArray(this._matrix, my * this._matrixX);
              }
            }
          },
          preserveAlpha: {
            get: function preserveAlpha() { return this._preserveAlpha; },
            set: function preserveAlpha(value) { this._preserveAlpha = value; }
          }
        }
      }
    }
  };
}).call(this);
