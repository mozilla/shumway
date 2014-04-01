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

var BitmapFilterDefinition = (function () {
  var EPS = 0.000000001;
  // Step widths for blur based filters, for quality values 1..15:
  // If we plot the border width added by generateFilterRect for each
  // blurX (or blurY) value, the step width is the amount of blurX
  // that adds one pixel to the border width. I.e. for quality = 1,
  // the border width increments at blurX = 2, 4, 6, ...
  var blurFilterStepWidths = [
    2,
    1 / 1.05,
    1 / 1.35,
    1 / 1.55,
    1 / 1.75,
    1 / 1.9,
    1 / 2,
    1 / 2.1,
    1 / 2.2,
    1 / 2.3,
    1 / 2.5,
    1 / 3,
    1 / 3,
    1 / 3.5,
    1 / 3.5
  ];
  var def = {
    __class__: 'flash.filters.BitmapFilter',

    initialize: function () {

    },
    _updateBlurBounds: function (bounds, isBlurFilter) {
      // Approximation of BitmapData.generateFilterRect()
      var stepWidth = blurFilterStepWidths[this._quality - 1];
      var bx = this._blurX;
      var by = this._blurY;
      if (isBlurFilter) {
        // BlurFilter behaves slightly different from other blur based filters:
        // Given ascending blurX/blurY values, generateFilterRect with BlurFilter
        // expands the source rect later than with i.e. GlowFilter. The difference
        // appears to be stepWidth / 4 for all quality values.
        var stepWidth4 = stepWidth / 4;
        bx -= stepWidth4;
        by -= stepWidth4;
      }
      // Calculate horizontal and vertical borders:
      // blurX/blurY values <= 1 are always rounded up to 1,
      // which means that generateFilterRect always expands the source rect,
      // even when blurX/blurY is 0.
      var bh = Math.ceil((bx < 1 ? 1 : bx) / (stepWidth - EPS));
      var bv = Math.ceil((by < 1 ? 1 : by) / (stepWidth - EPS));
      bounds.xMin -= bh;
      bounds.xMax += bh;
      bounds.yMin -= bv;
      bounds.yMax += bv;
    },
    _generateFilterBounds: function () {
      return null;
    },
    _updateFilterBounds: function (bounds) {
      var b = this._generateFilterBounds();
      if (b) {
        bounds.xMin += b.xMin * 20;
        bounds.xMax += b.xMax * 20;
        bounds.yMin += b.yMin * 20;
        bounds.yMax += b.yMax * 20;
      }
    },
    _applyFilter: function () {
    },
    _applyFilterMulti: function (pimg, width, height, isPremult) {
      return isPremult;
    }
  };

  def.__glue__ = { };

  return def;
}).call(this);
