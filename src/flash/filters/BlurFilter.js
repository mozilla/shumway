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
/*global blurFilter */

var BlurFilterDefinition = (function () {
  return {
    __class__: "flash.filters.BlurFilter",
    initialize: function () {

    },
    _updateFilterBounds: function (bounds) {
      var bx = this._blurX * this._quality * 20;
      var by = this._blurY * this._quality * 20;
      bounds.xMin -= bx;
      bounds.xMax += bx;
      bounds.yMin -= by;
      bounds.yMax += by;
    },
    __glue__: {
      native: {
        static: {
        },
        instance: {
          blurX: {
            get: function blurX() { return this._blurX; },
            set: function blurX(value) { this._blurX = value; }
          },
          blurY: {
            get: function blurY() { return this._blurY; },
            set: function blurY(value) { this._blurY = value; }
          },
          quality: {
            get: function quality() { return this._quality; },
            set: function quality(value) { this._quality = value; }
          }
        }
      }
    }
  };
}).call(this);
