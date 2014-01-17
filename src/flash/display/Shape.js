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

/* global finishShapePath */

var ShapeCache = { };

var ShapeDefinition = (function () {
  var def = {
    __class__: 'flash.display.Shape',

    initialize: function () {
      var graphics = this._graphics = new flash.display.Graphics();
      graphics._parent = this;
      var s = this.symbol;
      if (s && s.paths) {
        graphics._paths = s.paths;
        // TODO: this really should be done only once, but I don't know how I
        // can know when all the required data has been loaded.
        for (var i = 0; i < s.paths.length; i++) {
          s.paths[i] = finishShapePath(s.paths[i], s.dictionaryResolved);
        }
        graphics.bbox = s.bbox;
        graphics.strokeBbox = s.strokeBbox;
        if (this._stage && this._stage._quality === 'low' && !graphics._bitmap)
          graphics._cacheAsBitmap(this._bbox);
        this.ratio = s.ratio || 0;

        var renderable = ShapeCache[s.symbolId];

        var bounds = graphics._getBounds(true);
        var rect = new Shumway.Geometry.Rectangle(bounds.xMin / 20,
                                                  bounds.yMin / 20,
                                                  (bounds.xMax - bounds.xMin) / 20,
                                                  (bounds.yMax - bounds.yMin) / 20);

        if (!renderable) {
          renderable = {
            getBounds: function () {
              return rect;
            },
            properties: { },
            render: function (ctx) {
              ctx.save();
              ctx.translate(-rect.x, -rect.y);
              graphics.draw(ctx, false, 0, new RenderingColorTransform());
              ctx.restore();
            }
          };

          ShapeCache[s.symbolId] = renderable;
        }

        this._layer = new Shumway.Layers.Shape(renderable);
        this._layer.origin = new Shumway.Geometry.Point(rect.x, rect.y);
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
