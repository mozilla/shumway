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

/* global initPathStyles */

// TODO: share initialize method with ShapeDefinition
var MorphShapeDefinition = (function () {
  var def = {
    __class__: 'flash.display.MorphShape',

    initialize: function () {
      var graphics = this._graphics = new flash.display.Graphics();
      var s = this.symbol;
      if (s && s.paths) {
        initPathStyles(s.paths, s.dictionary);
        graphics._paths = s.paths;
        graphics.bbox = s.bbox;
        graphics.strokeBbox = s.strokeBbox;
        graphics.dictionary = s.dictionary;
        if (this._stage && this._stage._quality === 'low' && !graphics._bitmap)
          graphics._cacheAsBitmap(this._bbox);
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
