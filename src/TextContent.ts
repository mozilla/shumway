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

  import ColorUtilities = Shumway.ColorUtilities;
  import flash = Shumway.AVM2.AS.flash;

  export class TextContent implements Shumway.Remoting.IRemotable {
    _id: number;
    _isDirty: boolean;

    private _plainText: string;
    private _backgroundColor: number;
    private _borderColor: number;
    private _autoSize: boolean;
    private _wordWrap: boolean;
    defaultTextFormat: flash.text.TextFormat;
    textRuns: flash.text.TextRun[];
    matrix: flash.geom.Matrix;
    coords: number[];

    constructor(defaultTextFormat?: flash.text.TextFormat) {
      this._id = flash.display.DisplayObject.getNextSyncID();
      this._isDirty = false;
      this._plainText = '';
      this._backgroundColor = 0;
      this._borderColor = 0;
      this._autoSize = false;
      this._wordWrap = false;
      this.defaultTextFormat = defaultTextFormat || new flash.text.TextFormat();
      this.textRuns = [];
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
      this._isDirty = true;
    }

    get plainText(): string {
      return this._plainText;
    }

    set plainText(value: string) {
      if (value === this._plainText) {
        return;
      }
      this._plainText = value;
      this.textRuns.length = 0;
      this.textRuns[0] = new flash.text.TextRun(0, value.length, this.defaultTextFormat);
      this._isDirty = true;
    }

    get autoSize(): boolean {
      return this._autoSize;
    }

    set autoSize(value: boolean) {
      if (value === this._autoSize) {
        return;
      }
      this._autoSize = value;
      this._isDirty = true;
    }

    get wordWrap(): boolean {
      return this._wordWrap;
    }

    set wordWrap(value: boolean) {
      if (value === this._wordWrap) {
        return;
      }
      this._wordWrap = value;
      this._isDirty = true;
    }

    get backgroundColor(): number {
      return this._backgroundColor;
    }

    set backgroundColor(value: number) {
      if (value === this._backgroundColor) {
        return;
      }
      this._backgroundColor = value;
      this._isDirty = true;
    }

    get borderColor(): number {
      return this._borderColor;
    }

    set borderColor(value: number) {
      if (value === this._borderColor) {
        return;
      }
      this._borderColor = value;
      this._isDirty = true;
    }
  }
}
