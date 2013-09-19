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

var FontDefinition = (function () {
  var fonts = [];

  var def = {
    __class__: 'flash.text.Font',

    initialize: function () {
      var s = this.symbol;
      if (s) {
        this._fontName = s.name || null;
        this._uniqueName = s.uniqueName;
        this._metrics = s.metrics;
        fonts.push(this);
      }
    },

    get fontName() {
      return this._fontName;
    },
    get fontStyle() {
      return this._fontStyle;
    },
    get fontType() {
      return this._fontType;
    },
    hasGlyphs: function hasGlyphs(str) {
      return true; // TODO
    },
  };

  function enumerateFonts(device) {
    return fonts.slice();
  }

  function registerFont(font) {
    throw 'Not implemented: registerFont';
  }

  function findFont(fn) {
    var font;
    fonts.some(function (f) {
      return fn(f) && (font = f, true);
    });
    return font;
  }

  var desc = Object.getOwnPropertyDescriptor;

  def.__glue__ = {
    native: {
      instance: {
        fontName: desc(def, "fontName"),
        fontStyle: desc(def, "fontStyle"),
        fontType: desc(def, "fontType"),
        hasGlyphs: def.hasGlyphs
      },
      static: {
        enumerateFonts: enumerateFonts,
        registerFont: registerFont,
        _findFont: findFont
      }
    }
  };

  return def;
}).call(this);
