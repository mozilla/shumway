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
/* global toNumber, isNullOrUndefined, throwError, Errors */

var ColorMatrixFilterDefinition = (function () {
  return {
    __class__: "flash.filters.ColorMatrixFilter",
    initialize: function () {
      this._matrix = [
        1, 0, 0, 0, 0,
        0, 1, 0, 0, 0,
        0, 0, 1, 0, 0,
        0, 0, 0, 1, 0
      ];
    },
    _applyFilter: function (imageData, width, height) {
      var pimg = Module._malloc(imageData.length);
      Module.HEAPU8.set(imageData, pimg);
      this._applyFilterMulti(pimg, width, height, false);
      imageData.set(Module.HEAPU8.subarray(pimg, pimg + imageData.length));
      Module._free(pimg);
    },
    _applyFilterMulti: function (pimg, width, height, isPremult) {
      if (isPremult) {
        FILTERS.unpreMultiplyAlpha(pimg, width, height);
      }
      var pm = Module._malloc(20 << 2);
      Module.HEAPF32.set(new Float32Array(this._matrix), pm >> 2);
      FILTERS.colormatrix(pimg, width, height, pm);
      Module._free(pm);
      return false;
    },
    __glue__: {
      native: {
        instance: {
          matrix: {
            get: function matrix() { return this._matrix; },
            set: function matrix(value) {
              if (!isNullOrUndefined(value)) {
                var matrix = [
                  0, 0, 0, 0, 0,
                  0, 0, 0, 0, 0,
                  0, 0, 0, 0, 0,
                  0, 0, 0, 0, 0
                ];
                for (var i = 0, n = Math.min(value.length, 20); i < n; i++) {
                  matrix[i] = toNumber(value[i]);
                }
                this._matrix = matrix;
              } else {
                throwError("TypeError", Errors.NullPointerError, "matrix");
              }
            }
          }
        }
      }
    }
  };
}).call(this);
