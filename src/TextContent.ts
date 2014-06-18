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
      var textFormat = this.defaultTextFormat;

      var stack = [];

      var finishTextRun = function () {
        if (endIndex - beginIndex) {
          textRuns.push(new flash.text.TextRun(beginIndex, endIndex, textFormat));
          beginIndex = endIndex = endIndex;
        }
      };

      Shumway.HTMLParser(htmlText, {
        chars: (text) => {
          plainText += text;
          endIndex += text.length;
        },
        start: (tagName, attributes) => {
          var newTextFormat: flash.text.TextFormat;
          switch (tagName) {
            case 'a':
              somewhatImplemented('<a/>');
              stack.push(textFormat);
              var target = attributes.target || textFormat.target;
              var url = attributes.url || textFormat.url;
              if (target !== textFormat.target || url !== textFormat.url) {
                  newTextFormat = textFormat.clone();
                  newTextFormat.target = target;
                  newTextFormat.url = url;
              }
              break;
            case 'b':
              stack.push(textFormat);
              if (!textFormat.bold) {
                  newTextFormat = textFormat.clone();
                  newTextFormat.bold = true;
              }
              break;
            case 'br':
              if (multiline) {
                plainText += '\n';
                endIndex++;
              }
              break;
            case 'font':
              stack.push(textFormat);
              var color = attributes.color !== undefined ? ColorUtilities.hexToRGB(attributes.color) : textFormat.color;
              // TODO: the value of the face property can be a string specifying a list of
              // comma-delimited font names in which case the first available font should be used.
              var font = attributes.face || textFormat.font;
              var size = isNaN(attributes.size) ? textFormat.size : +attributes.size;
              if (color !== textFormat.color ||
                  font !== textFormat.font ||
                  size !== textFormat.size)
              {
                newTextFormat = textFormat.clone();
                newTextFormat.color = color;
                newTextFormat.font = font;
                newTextFormat.size = size;
              }
              break;
            case 'img':
              notImplemented('<img/>');
              break;
            case 'i':
              stack.push(textFormat);
              if (!textFormat.italic) {
                  newTextFormat = textFormat.clone();
                  newTextFormat.italic = true;
              }
              break;
            case 'li':
              stack.push(textFormat);
              if (!textFormat.bullet) {
                  newTextFormat = textFormat.clone();
                  newTextFormat.bullet = true;
              }
              break;
            case 'p':
              stack.push(textFormat);
              var align = attributes.align;
              if (align !== undefined && align !== textFormat.align) {
                  newTextFormat = textFormat.clone();
                  newTextFormat.align = align;
              }
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
                newTextFormat = textFormat.clone();
                newTextFormat.blockIndent = blockIndent;
                newTextFormat.indent = indent;
                newTextFormat.leading = leading;
                newTextFormat.leftMargin = leftMargin;
                newTextFormat.rightMargin = rightMargin;
                //newTextFormat.tabStops = tabStops;
              }
              break;
            case 'u':
              if (!textFormat.underline) {
                  newTextFormat = textFormat.clone();
                  newTextFormat.underline = true;
              }
              break;
          }
          if (newTextFormat) {
            finishTextRun();
            stack.push(newTextFormat);
            textFormat = newTextFormat;
          }
        },
        end: (tagName) => {
          switch (tagName) {
            case 'li':
            case 'p':
              if (multiline) {
                plainText += '\r';
                endIndex++;
              }
            case 'a':
            case 'b':
            case 'font':
            case 'i':
            case 'textformat':
            case 'u':
              var f = stack.pop();
              if (f !== textFormat) {
                finishTextRun();
              }
              textFormat = f;
          }
        }
      });
      finishTextRun();

      this._plainText = plainText;
      this._isDirty = true;
    }

    get plainText(): string {
      return this._plainText;
    }

    set plainText(value: string) {
      this._plainText = value;
      this.textRuns.length = 0;
      this.textRuns[0] = new flash.text.TextRun(0, value.length, this.defaultTextFormat);
      this._isDirty = true;
    }

    get backgroundColor(): number {
      return this._backgroundColor;
    }

    set backgroundColor(value: number) {
      this._backgroundColor = value;
      this._isDirty = true;
    }

    get borderColor(): number {
      return this._borderColor;
    }

    set borderColor(value: number) {
      this._borderColor = value;
      this._isDirty = true;
    }
  }
}
