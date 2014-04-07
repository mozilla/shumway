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
/*global avm1lib, rgbaObjToStr, rgbIntAlphaToStr, warning, FontDefinition,
  Errors, throwError */

var TextFieldDefinition = (function () {
  var def = {
    __class__: 'flash.text.TextField',

    initialize: function () {
      this._bbox = {xMin: 0, yMin: 0, xMax: 2000, yMax: 2000};
      var initialFormat = this._defaultTextFormat = {
        align: 'LEFT', face: 'serif', size: 12,
        letterspacing: 0, kerning: 0, color: 0, leading: 0
      };

      this._type = 'dynamic';
      this._embedFonts = false;
      this._selectable = true;
      this._autoSize = 'none';
      this._scrollV = 1;
      this._maxScrollV = 1;
      this._bottomScrollV = 1;
      this._background = false;
      this._border = false;
      this._backgroundColor = 0xffffff;
      this._backgroundColorStr = "#ffffff";
      this._borderColor = 0x0;
      this._borderColorStr = "#000000";
      this._text = '';
      this._htmlText = '';
      this._condenseWhite = false;
      this._multiline = false;
      this._wordWrap = false;
      this._textColor = 0;

      var s = this.symbol;
      if (!s) {
        this._currentTransform.tx -= 40;
        this._currentTransform.ty -= 40;
        this._text = '';
        return;
      }

      var tag = s.tag;

      var bbox = tag.bbox;
      this._currentTransform.tx += bbox.xMin;
      this._currentTransform.ty += bbox.yMin;
      this._bbox.xMax = bbox.xMax - bbox.xMin;
      this._bbox.yMax = bbox.yMax - bbox.yMin;

      if (tag.hasLayout) {
        initialFormat.size = tag.fontHeight / 20;
        initialFormat.leading = (tag.leading|0) / 20;
      }
      if (tag.hasColor) {
        var colorObj = tag.color;
        var color = (colorObj.red << 24) |
                    (colorObj.green << 16) |
                    (colorObj.blue << 8) |
                    colorObj.alpha;
        initialFormat.color = this._textColor = color;
      }
      if (tag.hasFont) {
        var font = FontDefinition.getFontBySymbolId(tag.fontId);
        initialFormat.font = font;
        initialFormat.face = font._fontName;
        initialFormat.bold = font.symbol.bold;
        initialFormat.italic = font.symbol.italic;
      }

      this._multiline = !!tag.multiline;
      this._wordWrap = !!tag.wordWrap;

      this._embedFonts = !!tag.useOutlines;
      this._selectable = !tag.noSelect;
      // TODO: Find out how the IDE causes textfields to have a background
      this._border = !!tag.border;

      switch (tag.align) {
        case 1: initialFormat.align = 'RIGHT'; break;
        case 2: initialFormat.align = 'CENTER'; break;
        case 3: initialFormat.align = 'JUSTIFIED'; break;
        default: // 'left' is pre-set
      }

      if (tag.initialText) {
        if (tag.html) {
          this._htmlText = tag.initialText;
        } else {
          this._text = tag.initialText;
        }
      } else {
        this._text = '';
      }
    },

    _getAS2Object: function () {
      if (!this.$as2Object) {
        new avm1lib.AS2TextField(this);
      }
      return this.$as2Object;
    },

    _serializeRenderableData: function (message) {
      message.ensureAdditionalCapacity(92);

      message.writeInt(Renderer.RENDERABLE_TYPE_TEXT);

      var bbox = this._bbox;
      message.writeIntUnsafe(bbox.xMin);
      message.writeIntUnsafe(bbox.xMax);
      message.writeIntUnsafe(bbox.yMin);
      message.writeIntUnsafe(bbox.yMax);

      var textFormat = this._defaultTextFormat;

      if (this._embedFonts) {
        message.writeIntUnsafe(1);
        message.writeIntUnsafe(textFormat.font._fontId);
      } else {
        message.writeIntUnsafe(0);
        message.writeIntUnsafe(0);
      }

      message.writeIntUnsafe(textFormat.bold);
      message.writeIntUnsafe(textFormat.italic);
      message.writeIntUnsafe(textFormat.size);

      message.writeIntUnsafe(this._textColor);

      message.writeIntUnsafe(this._background ?
                               (this._backgroundColor << 8) & 0xff : 0);
      message.writeIntUnsafe(this._border ?
                               (this._borderColor << 8) & 0xff : 0);
      message.writeIntUnsafe(this._autoSize);
      message.writeIntUnsafe(ALIGN_TYPES.indexOf(textFormat.align));
      message.writeIntUnsafe(this._wordWrap);
      message.writeIntUnsafe(this._multiline);
      message.writeIntUnsafe(textFormat.leading);
      message.writeIntUnsafe(textFormat.letterspacing);
      message.writeIntUnsafe(textFormat.kerning);

      var isHtml = !!this._htmlText;
      message.writeIntUnsafe(isHtml);

      message.writeIntUnsafe(this._condenseWhite);
      message.writeIntUnsafe(this._scrollV);

      var text = isHtml ? this._htmlText : this._text;
      var n = text.length;
      message.ensureAdditionalCapacity((1 + n) * 4);
      message.writeIntUnsafe(n);
      for (var i = 0; i < n; i++) {
        message.writeIntUnsafe(text.charCodeAt(i));
      }
    },

    replaceText: function(begin, end, str) {
      // TODO: preserve formatting
      var text = this._text;
      this.text = text.substring(0, begin) + str + text.substring(end);
    },

    invalidateDimensions: function() {
      this._invalidate();
      this._invalidateBounds();
      this._invalidateRenderable();
      this._dimensionsValid = false;
    },

    ensureDimensions: function() {
      if (this._dimensionsValid) {
        return;
      }

      var bounds = this._bbox;
      var diffX = 0;

      var that = this;
      var message = new BinaryMessage();
      message.syncRenderable(this, function (data) {
        that._lines = data.lines;
        that._textWidth = data.textWidth;
        that._textHeight = data.textHeight;
        diffX = data.diffX;
        that._text = data.text;
        that._htmlText = data.htmlText;
      });
      message.post('render', true);

      var lines = this._lines;

      this._scrollV = 1;
      this._maxScrollV = 1;
      this._bottomScrollV = 1;
      var autoSize = this._autoSize;
      if (autoSize === 'none') {
        var maxVisibleY = (bounds.yMax - 80) / 20;
        if (this._textHeight > maxVisibleY) {
          for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (line.y + line.height > maxVisibleY) {
              this._maxScrollV = i + 1;
              this._bottomScrollV = i === 0 ? 1 : i;
              break;
            }
          }
        }
      } else {
        if (diffX) {
          this._invalidateTransform();
          this._currentTransform.tx += diffX * 20 | 0;
          bounds.xMax = (targetWidth * 20 | 0) + 80;
        }
        bounds.yMax = (this._textHeight * 20 | 0) + 80;
        this._invalidateBounds();
      }

      this._dimensionsValid = true;
    },

    get text() {
      this.ensureDimensions();
      return this._text;
    },
    set text(val) {
      this._text = val;
      this._htmlText = '';
      this.invalidateDimensions();
    },

    get htmlText() {
      this.ensureDimensions();
      return this._htmlText;
    },
    set htmlText(val) {
      this._htmlText = val;
      this._text = '';
      this.invalidateDimensions();
    },

    get defaultTextFormat() {
      var format = this._defaultTextFormat;
      return new flash.text.TextFormat().fromObject(format);
    },
    set defaultTextFormat(val) {
      this._defaultTextFormat = val.toObject();
      this.invalidateDimensions();
    },

    getTextFormat: function (beginIndex /*:int = -1*/, endIndex /*:int = -1*/) {
      return this.defaultTextFormat; // TODO
    },
    setTextFormat: function (format, beginIndex /*:int = -1*/,
                             endIndex /*:int = -1*/)
    {
      this.defaultTextFormat = format;// TODO
      if (this.text === this.htmlText) {
        // HACK replacing format for non-html text
        this.text = this.text;
      }
      this.invalidateDimensions();
    },

    get x() {
      this.ensureDimensions();
      return this._currentTransform.tx;
    },
    set x(val) {
      if (val === this._currentTransform.tx) {
        return;
      }

      this._invalidate();
      this._invalidateBounds();
      this._invalidateTransform();

      this._currentTransform.tx = val;
    },

    get width() { // (void) -> Number
      this.ensureDimensions();
      return this._bbox.xMax;
    },
    set width(value) { // (Number) -> Number
      if (value < 0) {
        return;
      }
      this._bbox.xMax = value;
      // TODO: optimization potential: don't invalidate if !wordWrap and no \n
      this.invalidateDimensions();
    },

    get height() { // (void) -> Number
      this.ensureDimensions();
      return this._bbox.yMax;
    },
    set height(value) { // (Number) -> Number
      if (value < 0) {
        return;
      }
      this._bbox.yMax = value;
      this._invalidate();
    },
    _getContentBounds: function() {
      this.ensureDimensions();
      return this._bbox;
    },
    getLineMetrics: function(lineIndex) {
      this.ensureDimensions();
      if (lineIndex < 0 || lineIndex >= this._lines.length) {
        throwError('RangeError', Errors.ParamRangeError);
      }
      var line = this._lines[lineIndex];
      var format = line.largestFormat;
      var font = format.font;
      var size = format.size;
      // Rounding for metrics seems to be screwy. A descent of 3.5 gets
      // rounded to 3, but an ascent of 12.8338 gets rounded to 13.
      // For now, round up for things slightly above .5.
      var ascent = font.ascent * size + 0.49999 | 0;
      var descent = font.descent * size + 0.49999 | 0;
      var leading = font.leading * size + 0.49999 + line.leading | 0;
      // TODO: check if metrics values can be floats for embedded fonts
      return new flash.text.TextLineMetrics(line.x + 2, line.width,
                                            line.height,
                                            ascent, descent, leading);
    },
    getCharBoundaries: function getCharBoundaries(index) {
      somewhatImplemented("TextField.getCharBoundaries");
      return new flash.geom.Rectangle(0, 0, 0, 0);
    }
  };

  var desc = Object.getOwnPropertyDescriptor;

  def.__glue__ = {
    native: {
      instance: {
        text: desc(def, "text"),
        defaultTextFormat: desc(def, "defaultTextFormat"),
        htmlText: desc(def, "htmlText"),
        replaceText: def.replaceText,
        getTextFormat: def.getTextFormat,
        setTextFormat: def.setTextFormat,
        getCharBoundaries: def.getCharBoundaries,
        autoSize: {
          get: function autoSize() { // (void) -> String
            return this._autoSize;
          },
          set: function autoSize(value) { // (value:String) -> void
            if (this._autoSize === value) {
              return;
            }
            this._autoSize = value;
            this.invalidateDimensions();
          }
        },
        multiline: {
          get: function multiline() { // (void) -> Boolean
            return this._multiline;
          },
          set: function multiline(value) { // (value:Boolean) -> void
            if (this._multiline === value) {
              return;
            }
            this._multiline = value;
            this.invalidateDimensions();
          }
        },
        textColor: {
          get: function textColor() { // (void) -> uint
            return this._textColor;
          },
          set: function textColor(value) { // (value:uint) -> void
            if (this._textColor === value) {
              return;
            }
            this._textColor = value;
            this._invalidate();
          }
        },
        selectable: {
          get: function selectable() { // (void) -> Boolean
            return this._selectable;
          },
          set: function selectable(value) { // (value:Boolean) -> void
            somewhatImplemented("TextField.selectable");
            this._selectable = value;
          }
        },
        wordWrap: {
          get: function wordWrap() { // (void) -> Boolean
            return this._wordWrap;
          },
          set: function wordWrap(value) { // (value:Boolean) -> void
            if (this._wordWrap === value) {
              return;
            }
            this._wordWrap = value;
            this.invalidateDimensions();
          }
        },
        textHeight: {
          get: function textHeight() { // (void) -> Number
            this.ensureDimensions();
            return this._textHeight;
          }
        },
        textWidth: {
          get: function textWidth() { // (void) -> Number
            this.ensureDimensions();
            return this._textWidth;
          }
        },
        length: {
          get: function length() { // (void) -> uint
            return this.text.length;
          }
        },
        numLines: {
          get: function numLines() { // (void) -> uint
            this.ensureDimensions();
            return this._lines.length;
          }
        },
        getLineMetrics: function(lineIndex) {
          return this.getLineMetrics(lineIndex);
        },
        setSelection: function (beginIndex, endIndex) {
          somewhatImplemented("TextField.setSelection");
        },
        scrollV: {
          get: function scrollV() {
            return this._scrollV;
          },
          set: function scrollV(value) {
            this.ensureDimensions();
            value = Math.max(1, Math.min(this._maxScrollV, value));
            this._scrollV = value;
          }
        },
        bottomScrollV: {
          get: function bottomScrollV() {
            this.ensureDimensions();
            if (this._scrollV === 1) {
              return this._bottomScrollV;
            }
            var maxVisibleY = (this._bbox.yMax - 80) / 20;
            var lines = this._lines;
            var offsetY = lines[this._scrollV - 1].y;
            for (var i = this._bottomScrollV; i < lines.length; i++) {
              var line = lines[i];
              if (line.y + line.height + offsetY > maxVisibleY) {
                return i + 1;
              }
            }
          }
        },
        maxScrollV: {
          get: function maxScrollV() { // (void) -> Number
            this.ensureDimensions();
            return this._maxScrollV;
          }
        },
        maxScrollH: {
          get: function maxScrollH() { // (void) -> Number
            this.ensureDimensions();
            // For whatever reason, maxScrollH is always 8px more than expected.
            return Math.max(this._textWidth - this._bbox.xMax / 20 + 4,
                            0);
          }
        },
        background: {
          get: function background() { // (void) -> Boolean
            return this._background;
          },
          set: function background(value) { // (value:Boolean) -> void
            if (this._background === value) {
              return;
            }
            this._background = value;
            this._invalidate();
          }
        },
        backgroundColor: {
          get: function backgroundColor() { // (void) -> uint
            return this._backgroundColor;
          },
          set: function backgroundColor(value) { // (value:uint) -> void
            if (this._backgroundColor === value) {
              return;
            }
            this._backgroundColor = value;
            this._backgroundColorStr = rgbIntAlphaToStr(value, 1);
            if (this._background) {
              this._invalidate();
            }
          }
        },
        border: {
          get: function border() { // (void) -> Boolean
            return this._border;
          },
          set: function border(value) { // (value:Boolean) -> void
            if (this._border === value) {
              return;
            }
            this._border = value;
            this._invalidate();
          }
        },
        borderColor: {
          get: function borderColor() { // (void) -> uint
            return this._borderColor;
          },
          set: function borderColor(value) { // (value:uint) -> void
            if (this._borderColor === value) {
              return;
            }
            this._borderColor = value;
            this._borderColorStr = rgbIntAlphaToStr(value, 1);
            if (this._border) {
              this._invalidate();
            }
          }
        },
        type: {
          get: function borderColor() { // (void) -> String
            return this._type;
          },
          set: function borderColor(value) { // (value:String) -> void
            somewhatImplemented("TextField.type");
            this._type = value;
          }
        },
        embedFonts: {
          get: function embedFonts() { // (void) -> Boolean
            return this._embedFonts;
          },
          set: function embedFonts(value) { // (value:Boolean) -> void
            this.invalidateDimensions();
            this._embedFonts = value;
          }
        },
        condenseWhite: {
          get: function condenseWhite() { // (void) -> Boolean
            return this._condenseWhite;
          },
          set: function condenseWhite(value) { // (value:Boolean) -> void
            somewhatImplemented("TextField.condenseWhite");
            this._condenseWhite = value;
          }
        },
        sharpness: {
          get: function sharpness() { // (void) -> Number
            return this._sharpness;
          },
          set: function sharpness(value) { // (value:Number) -> void
            somewhatImplemented("TextField.sharpness");
            this._sharpness = value;
          }
        }
      }
    }
  };

  return def;
}).call(this);
