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

var TextFormatDefinition = (function () {
  var measureTextField;
  return {
    // (font:String = null, size:Object = null, color:Object = null, bold:Object = null,
    // italic:Object = null, underline:Object = null, url:String = null, target:String = null,
    // align:String = null, leftMargin:Object = null, rightMargin:Object = null,
    // indent:Object = null, leading:Object = null)
    __class__: "flash.text.TextFormat",
    initialize: function () {
    },
    // TODO: make this a static function and call the ctor with the right args
    fromObject: function(obj) {
      this._font = obj.face || null;
      this._size = typeof obj.size === 'number' ? obj.size : null;
      this._color = typeof obj.color === 'number' ? obj.color : null;
      this._bold = typeof obj.bold === 'boolean' ? obj.bold : null;
      this._italic = typeof obj.italic === 'boolean' ? obj.italic : null;
      this._underline = typeof obj.underline === 'boolean'
                        ? obj.underline
                        : null;
      this._url = obj.url || null;
      this._target = obj.target || null;
      this._align = obj.align || null;
      this._leftMargin = typeof obj.leftMargin === 'number'
                         ? obj.leftMargin
                         : null;
      this._rightMargin = typeof obj.rightMargin === 'number'
                          ? obj.rightMargin
                          : null;
      this._indent = typeof obj.indent === 'number' ? obj.indent : null;
      this._leading = typeof obj.leading === 'number' ? obj.leading : null;
      return this;
    },
    toObject: function() {
      return {
        face: this._font || 'serif',
        size: this._size || 12,
        color: this._color || 0x0,
        bold: this._bold || false,
        italic: this._italic || false,
        underline: this._underline || false,
        url: this._url,
        target: this._target,
        align: this._align || 'left',
        leftMargin: this._leftMargin || 0,
        rightMargin: this._rightMargin || 0,
        indent: this._indent || 0,
        leading: this._leading || 0
      };
    },
    as2GetTextExtent: function(text, width /* optional */) {
      if (!measureTextField) {
        measureTextField = new flash.text.TextField();
        measureTextField._multiline = true;
      }
      if (!isNaN(width) && width > 0) {
        measureTextField.width = width + 4;
        measureTextField._wordWrap = true;
      } else {
        measureTextField._wordWrap = false;
      }
      measureTextField.defaultTextFormat = this;
      measureTextField.text = text;
      measureTextField.ensureDimensions();
      var result = {};
      var textWidth = measureTextField._textWidth;
      var textHeight = measureTextField._textHeight;
      result.asSetPublicProperty('width', textWidth);
      result.asSetPublicProperty('height', textHeight);
      result.asSetPublicProperty('textFieldWidth', textWidth + 4);
      result.asSetPublicProperty('textFieldHeight', textHeight + 4);
      var metrics = measureTextField.getLineMetrics(0);
      result.asSetPublicProperty('ascent',
                                 metrics.asGetPublicProperty('ascent'));
      result.asSetPublicProperty('descent',
                                 metrics.asGetPublicProperty('descent'));
      return result;
    },

    __glue__: {
      native: {
        static: {
        },
        instance: {
          align: {
            get: function align() { // (void) -> String
              return this._align;
            },
            set: function align(value) { // (value:String) -> void
              this._align = value;
            }
          },
          blockIndent: {
            get: function blockIndent() { // (void) -> Object
              return this._blockIndent;
            },
            set: function blockIndent(value) { // (value:Object) -> void
              this._blockIndent = value;
            }
          },
          bold: {
            get: function bold() { // (void) -> Object
              return this._bold;
            },
            set: function bold(value) { // (value:Object) -> void
              this._bold = value;
            }
          },
          bullet: {
            get: function bullet() { // (void) -> Object
              return this._bullet;
            },
            set: function bullet(value) { // (value:Object) -> void
              this._bullet = value;
            }
          },
          color: {
            get: function color() { // (void) -> Object
              return this._color;
            },
            set: function color(value) { // (value:Object) -> void
              this._color = value;
            }
          },
          display: {
            get: function display() { // (void) -> String
              return this._display;
            },
            set: function display(value) { // (value:String) -> void
              this._display = value;
            }
          },
          font: {
            get: function font() { // (void) -> String
              return this._font;
            },
            set: function font(value) { // (value:String) -> void
              this._font = value;
            }
          },
          indent: {
            get: function indent() { // (void) -> Object
              return this._indent;
            },
            set: function indent(value) { // (value:Object) -> void
              this._indent = value;
            }
          },
          italic: {
            get: function italic() { // (void) -> Object
              return this._italic;
            },
            set: function italic(value) { // (value:Object) -> void
              this._italic = value;
            }
          },
          kerning: {
            get: function kerning() { // (void) -> Object
              return this._kerning;
            },
            set: function kerning(value) { // (value:Object) -> void
              this._kerning = value;
            }
          },
          leading: {
            get: function leading() { // (void) -> Object
              return this._leading;
            },
            set: function leading(value) { // (value:Object) -> void
              this._leading = value;
            }
          },
          leftMargin: {
            get: function leftMargin() { // (void) -> Object
              return this._leftMargin;
            },
            set: function leftMargin(value) { // (value:Object) -> void
              this._leftMargin = value;
            }
          },
          letterSpacing: {
            get: function letterSpacing() { // (void) -> Object
              return this._letterSpacing;
            },
            set: function letterSpacing(value) { // (value:Object) -> void
              this._letterSpacing = value;
            }
          },
          rightMargin: {
            get: function rightMargin() { // (void) -> Object
              return this._rightMargin;
            },
            set: function rightMargin(value) { // (value:Object) -> void
              this._rightMargin = value;
            }
          },
          size: {
            get: function size() { // (void) -> Object
              return this._size;
            },
            set: function size(value) { // (value:Object) -> void
              this._size = value;
            }
          },
          tabStops: {
            get: function tabStops() { // (void) -> Array
              return this._tabStops;
            },
            set: function tabStops(value) { // (value:Array) -> void
              this._tabStops = value;
            }
          },
          target: {
            get: function target() { // (void) -> String
              return this._target;
            },
            set: function target(value) { // (value:String) -> void
              this._target = value;
            }
          },
          underline: {
            get: function underline() { // (void) -> Object
              return this._underline;
            },
            set: function underline(value) { // (value:Object) -> void
              this._underline = value;
            }
          },
          url: {
            get: function url() { // (void) -> String
              return this._url;
            },
            set: function url(value) { // (value:String) -> void
              this._url = value;
            }
          }
        }
      }
    }
  };
}).call(this);
