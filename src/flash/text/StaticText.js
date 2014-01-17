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

var StaticTextCache = { };

var StaticTextDefinition = (function () {
  var def = {
    __class__: 'flash.text.StaticText',

    initialize: function () {
      var s = this.symbol;
      if (s) {
        this.draw = s.draw;

        var renderable = StaticTextCache[s.symbolId];

        var bounds = this.getBounds(null);
        var rect = new Shumway.Geometry.Rectangle(bounds.xMin / 20,
                                                  bounds.yMin / 20,
                                                  (bounds.xMax - bounds.xMin) / 20,
                                                  (bounds.yMax - bounds.yMin) / 20);

        if (!renderable) {
          renderable = {
            source: this,
            getBounds: function () {
              return rect;
            },
            properties: { },
            render: function (ctx) {
              ctx.save();
              ctx.translate(-rect.x, -rect.y);
              this.source.draw(ctx, 0, new RenderingColorTransform());
              ctx.restore();
            }
          };

          StaticTextCache[s.symbolId] = renderable;
        }

        this._layer = new Shumway.Layers.Shape(renderable);
        this._layer.origin = new Shumway.Geometry.Point(rect.x, rect.y);
      }
    },

    get text() {
      return this._text;
    },
    set text(val) {
      this._text = val;
    }
  };

  var desc = Object.getOwnPropertyDescriptor;

  def.__glue__ = {
    native: {
      instance: {
        text: desc(def, "text")
      }
    }
  };

  return def;
}).call(this);
