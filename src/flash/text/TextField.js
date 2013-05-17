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

var TextFieldDefinition = (function () {
  var def = {
    __class__: 'flash.text.TextField',

    initialize: function () {
      this._defaultTextFormat = null;

      var s = this.symbol;
      if (s) {
        this.draw = s.draw || this.draw;
        this.text = s.text || '';
      }
    },

    _getAS2Object: function () {
      if (!this.$as2Object) {
        new AS2TextField().$attachNativeObject(this);
      }
      return this.$as2Object;
    },

    replaceText: function(begin, end, str) {
      this._text = this._text.substring(0, begin) + str + this._text.substring(end);
      this._markAsDirty();
    },

    draw: function (c) {
      // TODO
      var bbox = this._bbox;
      if (!bbox) {
        return;
      }
      c.save();
      c.beginPath();
      c.rect(bbox.left, bbox.top, bbox.right - bbox.left, bbox.bottom - bbox.top);
      c.clip();
      c.fillText(this.text, bbox.left, bbox.bottom);
      c.restore();
    },

    get text() {
      return this._text;
    },
    set text(val) {
      if (this._text !== val) {
        this._text = val;
        this._markAsDirty();
      }
    },

    get defaultTextFormat() {
      return this._defaultTextFormat;
    },
    set	defaultTextFormat(val) {
      this._defaultTextFormat = val;
    },

    getTextFormat: function (beginIndex /*:int = -1*/, endIndex /*:int = -1*/) {
      return null; // TODO
    },
    setTextFormat: function (format, beginIndex /*:int = -1*/, endIndex /*:int = -1*/) {
      // TODO
    },

    textHeight: function() {
      var bbox = this._bbox;
      if (!bbox) {
        return 0;
      }
      somewhatImplemented("TextField.textHeight");
      return bbox.bottom - bbox.top; // TODO: use canvas.measureText(txt).height
    }

  };

  var desc = Object.getOwnPropertyDescriptor;

  def.__glue__ = {
    native: {
      instance: {
        text: desc(def, "text"),
        defaultTextFormat: desc(def, "defaultTextFormat"),
        draw: def.draw,
        replaceText: def.replaceText,
        getTextFormat: def.getTextFormat,
        setTextFormat: def.setTextFormat,
        textHeight: def.textHeight,
        autoSize: {
          get: function autoSize() { // (void) -> String
            somewhatImplemented("TextField.autoSize");
            return this._autoSize;
          },
          set: function autoSize(value) { // (value:String) -> void
            somewhatImplemented("TextField.autoSize");
            this._autoSize = value;
          }
        },
        multiline: {
          get: function multiline() { // (void) -> Boolean
            somewhatImplemented("TextField.multiline");
            return this._multiline;
          },
          set: function multiline(value) { // (value:Boolean) -> void
            somewhatImplemented("TextField.multiline");
            this._multiline = value;
          }
        },
        textColor: {
          get: function textColor() { // (void) -> uint
            somewhatImplemented("TextField.textColor");
            return this._textColor;
          },
          set: function textColor(value) { // (value:uint) -> void
            somewhatImplemented("TextField.textColor");
            this._textColor = value;
          }
        },
        selectable: {
          get: function selectable() { // (void) -> Boolean
            somewhatImplemented("TextField.selectable");
            return this._selectable;
          },
          set: function selectable(value) { // (value:Boolean) -> void
            somewhatImplemented("TextField.selectable");
            this._selectable = value;
          }
        },
        wordWrap: {
          get: function wordWrap() { // (void) -> Boolean
            somewhatImplemented("TextField.wordWrap");
            return this._wordWrap;
          },
          set: function wordWrap(value) { // (value:Boolean) -> void
            somewhatImplemented("TextField.wordWrap");
            this._wordWrap = value;
          }
        },
        textHeight: {
          get: function textHeight() { // (void) -> Number
            somewhatImplemented("TextField.textHeight");
            return this._textHeight;
          }
        },
        textWidth: {
          get: function textWidth() { // (void) -> Number
            somewhatImplemented("TextField.textWidth");
            return this._textWidth;
          }
        },
        background: {
          get: function background() { // (void) -> Boolean
            somewhatImplemented("TextField.background");
            return this._background;
          },
          set: function background(value) { // (value:Boolean) -> void
            somewhatImplemented("TextField.background");
            this._background = value;
          }
        },
        backgroundColor: {
          get: function backgroundColor() { // (void) -> uint
            somewhatImplemented("TextField.backgroundColor");
            return this._backgroundColor;
          },
          set: function backgroundColor(value) { // (value:uint) -> void
            somewhatImplemented("TextField.backgroundColor");
            this._backgroundColor = value;
          }
        },
        border: {
          get: function border() { // (void) -> Boolean
            somewhatImplemented("TextField.border");
            return this._border;
          },
          set: function border(value) { // (value:Boolean) -> void
            somewhatImplemented("TextField.border");
            this._border = value;
          }
        },
        borderColor: {
          get: function borderColor() { // (void) -> uint
            somewhatImplemented("TextField.borderColor");
            return this._borderColor;
          },
          set: function borderColor(value) { // (value:uint) -> void
            somewhatImplemented("TextField.borderColor");
            this._borderColor = value;
          }
        }
      }
    }
  };

  return def;
}).call(this);
