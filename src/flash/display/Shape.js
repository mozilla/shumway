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

var ShapeDefinition = (function () {
  var def = {
    __class__: 'flash.display.Shape',

    initialize: function () {
      var graphics = this._graphics = new flash.display.Graphics();
      var s = this.symbol;
      if (s && s.paths) {
        initPathStyles(s.paths, s.dictionary);
        graphics._subpaths = s.paths;
        graphics.bbox = s.bbox;
        graphics.strokeBbox = s.strokeBbox;
        graphics.dictionary = s.dictionary;
        graphics._scale = 0.05;
        if (this._stage && this._stage._quality === 'low' && !graphics._bitmap)
          graphics._cacheAsBitmap(this._bbox);
        this.ratio = s.ratio || 0;
      }
    }
  };

  def.__glue__ = {
    native: {
      instance: {
        graphics: {
          get: function () { return this._graphics; }
        }
      }
    }
  };

  return def;
}).call(this);

function initPathStyles(paths, dictionary) {
  for (var i = paths.length; i--;) {
    var path = paths[i];
    path.fillStyle && initStyle(path.fillStyle, dictionary);
    path.lineStyle && initStyle(path.lineStyle, dictionary);
  }
}

// Used for creating gradients and patterns
var factoryCtx = document.createElement('canvas').getContext('kanvas-2d');

function initStyle(style, dictionary) {
  if (style.type === undefined) {
    return;
  }
  switch (style.type) {
    case GRAPHICS_FILL_SOLID:
    // Solid fill styles are fully processed in shape.js's processStyle
      break;
    case GRAPHICS_FILL_LINEAR_GRADIENT:
    case GRAPHICS_FILL_RADIAL_GRADIENT:
    case GRAPHICS_FILL_FOCAL_RADIAL_GRADIENT:
      var isLinear = style.type === GRAPHICS_FILL_LINEAR_GRADIENT;
      var gradient;
      if (isLinear) {
        gradient = factoryCtx.createLinearGradient(-1, 0, 1, 0);
      } else {
        gradient = factoryCtx.createRadialGradient(style.focalPoint || 0,
                                                   0, 0, 0, 0, 1);
      }
      var records = style.records;
      for (var j = 0, n = records.length; j < n; j++) {
        var record = records[j];
        var colorStr = toStringRgba(record.color);
        gradient.addColorStop(record.ratio / 255, colorStr);
      }
      style.style = gradient;
      break;
    case GRAPHICS_FILL_REPEATING_BITMAP:
    case GRAPHICS_FILL_CLIPPED_BITMAP:
    case GRAPHICS_FILL_NONSMOOTHED_REPEATING_BITMAP:
    case GRAPHICS_FILL_NONSMOOTHED_CLIPPED_BITMAP:
      var bitmap = dictionary[style.bitmapId];
      style.style = factoryCtx.createPattern(bitmap.value.props.img,
                                             style.repeat ? "repeat"
                                                          : "no-repeat");
      break;
    default:
      fail('invalid fill style', 'shape');
  }
}
