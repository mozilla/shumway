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

var DisplacementMapFilterDefinition = (function () {
  return {
    __class__: "flash.filters.DisplacementMapFilter",
    initialize: function () {

    },
    __glue__: {
      native: {
        instance: {
          alpha: {
            get: function alpha() { return this._alpha; },
            set: function alpha(value) { this._alpha = clamp(value, 0, 1); }
          },
          color: {
            get: function color() { return this._color; },
            set: function color(value) { this._color = value; }
          },
          componentX: {
            get: function componentX() { return this._componentX; },
            set: function componentX(value) { this._componentX = value; }
          },
          componentY: {
            get: function componentY() { return this._componentY; },
            set: function componentY(value) { this._componentY = value; }
          },
          mapBitmap: {
            get: function mapBitmap() { return this._mapBitmap; },
            set: function mapBitmap(value) { this._mapBitmap = value; }
          },
          mapPoint: {
            get: function mapPoint() { return this._mapPoint; },
            set: function mapPoint(value) { this._mapPoint = value; }
          },
          mode: {
            get: function mode() { return this._mode; },
            set: function mode(value) { this._mode = value; }
          },
          scaleX: {
            get: function scaleX() { return this._scaleX; },
            set: function scaleX(value) { this._scaleX = value; }
          },
          scaleY: {
            get: function scaleY() { return this._scaleY; },
            set: function scaleY(value) { this._scaleY = value; }
          }
        }
      }
    }
  };
}).call(this);
