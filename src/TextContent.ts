/**
 * Copyright 2014 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module Shumway {
  import notImplemented = Shumway.Debug.notImplemented;
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;

  import Bounds = Shumway.Bounds;
  import DataBuffer = Shumway.ArrayUtilities.DataBuffer;
  import ColorUtilities = Shumway.ColorUtilities;
  import flash = Shumway.AVM2.AS.flash;

  export enum TextContentFlags {
    None            = 0x0000,
    DirtyBounds     = 0x0001,
    DirtyContent    = 0x0002,
    DirtyStyle      = 0x0004,
    DirtyFlow       = 0x0008,
    Dirty           = DirtyBounds | DirtyContent | DirtyStyle | DirtyFlow
  }

  var _decodeHTMLMap = {
    lt:   '<',
    gt:   '>',
    amp:  '&',
    quot: '"',
    apos: "'"
  };

  /**
   * Decodes strings of the format:
   *
   * &#0000;
   * &#x0000;
   * &#x0000;
   * &amp;
   * &lthello
   *
   * This is complete enough to handle encoded HTML produced by the Flash IDE.
   */
  function decodeHTML(s: string): string {
    var r = "";
    for (var i = 0; i < s.length; i++) {
      var c = s.charAt(i);
      if (c !== '&') {
        r += c;
      } else {
        // Look for the first '&' or ';', both of these can terminate
        // the current char code.
        var j = StringUtilities.indexOfAny(s, ['&', ';'], i + 1);
        if (j > 0) {
          var v = s.substring(i + 1, j);
          if (v.length > 1 && v.charAt(0) === "#") {
            var n = 0;
            if (v.length > 2 && v.charAt(1) === "x") {
              n = parseInt(v.substring(1));
            } else {
              n = parseInt(v.substring(2), 16);
            }
            r += String.fromCharCode(n);
          } else {
            if (_decodeHTMLMap[v] !== undefined) {
              r += _decodeHTMLMap[v];
            } else {
              Debug.unexpected(v);
            }
          }
          i = j;
        } else {
          // Flash sometimes generates entities that don't have terminators,
          // like &bthello. Strong bad sometimes encodes this that way.
          for (var k in _decodeHTMLMap) {
            if (s.indexOf(k, i + 1) === i + 1) {
              r += _decodeHTMLMap[k];
              i += k.length;
              break;
            }
          }
        }
      }
    }
    return r;
  }

  export class TextContent implements Shumway.Remoting.IRemotable {
    _id: number;

    private _bounds: Bounds;
    private _plainText: string;
    private _backgroundColor: number;
    private _borderColor: number;
    private _autoSize: number;
    private _wordWrap: boolean;

    flags: number;
    defaultTextFormat: flash.text.TextFormat;
    textRuns: flash.text.TextRun[];
    textRunData: DataBuffer;
    matrix: flash.geom.Matrix;
    coords: number[];

    constructor(defaultTextFormat?: flash.text.TextFormat) {
      this._id = flash.display.DisplayObject.getNextSyncID();
      this._bounds = new Bounds(0, 0, 0, 0);
      this._plainText = '';
      this._backgroundColor = 0;
      this._borderColor = 0;
      this._autoSize = 0;
      this._wordWrap = false;
      this.flags = TextContentFlags.None;
      this.defaultTextFormat = defaultTextFormat || new flash.text.TextFormat();
      this.textRuns = [];
      this.textRunData = new DataBuffer();
      this.matrix = null;
      this.coords = null;
    }

    parseHtml(htmlText: string, multiline: boolean = false) {
      var plainText = '';
      var textRuns = this.textRuns;
      textRuns.length = 0;

      var beginIndex = 0;
      var endIndex = 0;
      var textFormat = this.defaultTextFormat.clone();
      var prevTextRun: flash.text.TextRun = null;
      var stack = [];

      var handler: HTMLParserHandler;
      Shumway.HTMLParser(htmlText, handler = {
        chars: (text) => {
          text = decodeHTML(text);
          plainText += text;
          endIndex += text.length;
          if (endIndex - beginIndex) {
            if (prevTextRun && prevTextRun.textFormat.equals(textFormat)) {
              prevTextRun.endIndex = endIndex;
            } else {
              prevTextRun = new flash.text.TextRun(beginIndex, endIndex, textFormat);
              textRuns.push(prevTextRun);
            }
            beginIndex = endIndex;
          }
        },
        start: (tagName, attributes) => {
          switch (tagName) {
            case 'a':
              stack.push(textFormat);
              somewhatImplemented('<a/>');
              var target = attributes.target || textFormat.target;
              var url = attributes.url || textFormat.url;
              if (target !== textFormat.target || url !== textFormat.url) {
                textFormat = textFormat.clone();
                textFormat.target = target;
                textFormat.url = url;
              }
              break;
            case 'b':
              stack.push(textFormat);
              if (!textFormat.bold) {
                textFormat = textFormat.clone();
                textFormat.bold = true;
              }
              break;
            case 'font':
              stack.push(textFormat);
              var color = ColorUtilities.isValidHexColor(attributes.color) ? ColorUtilities.hexToRGB(attributes.color) : textFormat.color;
              // TODO: the value of the face property can be a string specifying a list of
              // comma-delimited font names in which case the first available font should be used.
              var font = attributes.face || textFormat.font;
              var size = isNaN(attributes.size) ? textFormat.size : +attributes.size;
              if (color !== textFormat.color ||
                  font !== textFormat.font ||
                  size !== textFormat.size)
              {
                textFormat = textFormat.clone();
                textFormat.color = color;
                textFormat.font = font;
                textFormat.size = size;
              }
              break;
            case 'img':
              notImplemented('<img/>');
              break;
            case 'i':
              stack.push(textFormat);
              if (!prevTextRun) {
                textFormat = textFormat.clone();
                textFormat.italic = true;
              }
              break;
            case 'li':
              stack.push(textFormat);
              if (!textFormat.bullet) {
                textFormat = textFormat.clone();
                textFormat.bullet = true;
              }
              if (plainText[plainText.length - 1] === '\r') {
                break;
              }
            case 'br':
              if (multiline) {
                handler.chars('\r');
              }
              break;
            case 'p':
              stack.push(textFormat);
              var align = attributes.align;
              if (flash.text.TextFormatAlign.toNumber(align) > -1 && align !== textFormat.align) {
                textFormat = textFormat.clone();
                textFormat.align = align;
              }
              break;
            case 'span':
              // TODO: support CSS style classes.
              break;
            case 'textformat':
              stack.push(textFormat);
              var blockIndent = isNaN(attributes.blockindent) ? textFormat.blockIndent : +attributes.blockindent;
              var indent      = isNaN(attributes.indent)      ? textFormat.indent      : +attributes.indent;
              var leading     = isNaN(attributes.leading)     ? textFormat.leading     : +attributes.leading;
              var leftMargin  = isNaN(attributes.leftmargin)  ? textFormat.leftMargin  : +attributes.leftmargin;
              var rightMargin = isNaN(attributes.rightmargin) ? textFormat.rightMargin : +attributes.rightmargin;
              //var tabStops = attributes.tabstops || textFormat.tabStops;
              if (blockIndent !== textFormat.blockIndent ||
                  indent !== textFormat.indent ||
                  leading !== textFormat.leading ||
                  leftMargin !== textFormat.leftMargin ||
                  rightMargin !== textFormat.rightMargin /*||
                  tabStops !== textFormat.tabStops*/)
              {
                textFormat = textFormat.clone();
                textFormat.blockIndent = blockIndent;
                textFormat.indent = indent;
                textFormat.leading = leading;
                textFormat.leftMargin = leftMargin;
                textFormat.rightMargin = rightMargin;
                //textFormat.tabStops = tabStops;
              }
              break;
            case 'u':
              stack.push(textFormat);
              if (!textFormat.underline) {
                textFormat = textFormat.clone();
                textFormat.underline = true;
              }
              break;
          }
        },
        end: (tagName) => {
          switch (tagName) {
            case 'li':
            case 'p':
              if (multiline) {
                handler.chars('\r');
              }
            case 'a':
            case 'b':
            case 'font':
            case 'i':
            case 'textformat':
            case 'u':
              textFormat = stack.pop();
          }
        }
      });

      this._plainText = plainText;
      this.textRunData.clear();
      for (var i = 0; i < textRuns.length; i++) {
        this._writeTextRun(textRuns[i]);
      }
      this.flags |= TextContentFlags.DirtyContent;
    }

    get plainText(): string {
      return this._plainText;
    }

    set plainText(value: string) {
      this._plainText = value;
      this.textRuns.length = 0;
      var textRun = new flash.text.TextRun(0, value.length, this.defaultTextFormat);
      this.textRuns[0] = textRun;
      this.textRunData.clear();
      this._writeTextRun(textRun);
      this.flags |= TextContentFlags.DirtyContent;
    }

    get bounds(): Bounds {
      return this._bounds;
    }

    set bounds(bounds: Bounds) {
      this._bounds.copyFrom(bounds);
      this.flags |= TextContentFlags.DirtyBounds;
    }

    get autoSize(): number {
      return this._autoSize;
    }

    set autoSize(value: number) {
      if (value === this._autoSize) {
        return;
      }
      this._autoSize = value;
      if (this._plainText) {
        this.flags |= TextContentFlags.DirtyFlow;
      }
    }

    get wordWrap(): boolean {
      return this._wordWrap;
    }

    set wordWrap(value: boolean) {
      if (value === this._wordWrap) {
        return;
      }
      this._wordWrap = value;
      if (this._plainText) {
        this.flags |= TextContentFlags.DirtyFlow;
      }
    }

    get backgroundColor(): number {
      return this._backgroundColor;
    }

    set backgroundColor(value: number) {
      if (value === this._backgroundColor) {
        return;
      }
      this._backgroundColor = value;
      this.flags |= TextContentFlags.DirtyStyle;
    }

    get borderColor(): number {
      return this._borderColor;
    }

    set borderColor(value: number) {
      if (value === this._borderColor) {
        return;
      }
      this._borderColor = value;
      this.flags |= TextContentFlags.DirtyStyle;
    }

    private _writeTextRun(textRun: flash.text.TextRun) {
      var textRunData = this.textRunData;

      textRunData.writeInt(textRun.beginIndex);
      textRunData.writeInt(textRun.endIndex);

      var textFormat = textRun.textFormat;

      var size = +textFormat.size;
      textRunData.writeInt(size);

      var font = flash.text.Font.getByName(textFormat.font) || flash.text.Font.getDefaultFont();
      if (font.fontType === flash.text.FontType.EMBEDDED) {
        textRunData.writeInt(font._id);
      } else {
        textRunData.writeInt(0);
        textRunData.writeUTF(flash.text.Font.resolveFontName(font.fontName));
      }
      textRunData.writeInt(font.ascent * size);
      textRunData.writeInt(font.descent * size);
      textRunData.writeInt(textFormat.leading === null ? font.leading * size : +textFormat.leading);
      var bold: boolean;
      var italic: boolean;
      if (textFormat.bold === null) {
        bold = font.fontStyle === flash.text.FontStyle.BOLD || font.fontType === flash.text.FontStyle.BOLD_ITALIC;
      } else {
        bold = !!textFormat.bold;
      }
      if (textFormat.italic === null) {
        italic = font.fontStyle === flash.text.FontStyle.ITALIC || font.fontType === flash.text.FontStyle.BOLD_ITALIC;
      } else {
        italic = !!textFormat.italic;
      }
      textRunData.writeBoolean(bold);
      textRunData.writeBoolean(italic);

      textRunData.writeInt(+textFormat.color);
      textRunData.writeInt(flash.text.TextFormatAlign.toNumber(textFormat.align));
      textRunData.writeBoolean(!!textFormat.bullet);
      //textRunData.writeInt(textFormat.display);
      textRunData.writeInt(+textFormat.indent);
      //textRunData.writeInt(textFormat.blockIndent);
      textRunData.writeInt(+textFormat.kerning);
      textRunData.writeInt(+textFormat.leftMargin);
      textRunData.writeInt(+textFormat.letterSpacing);
      textRunData.writeInt(+textFormat.rightMargin);
      //textRunData.writeInt(textFormat.tabStops);
      textRunData.writeBoolean(!!textFormat.underline);
    }
  }
}
