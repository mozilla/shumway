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

  import flash = Shumway.AVM2.AS.flash;

  export class TextContent implements Shumway.Remoting.IRemotable {
    _id: number;
    _isDirty: boolean;

    private _plainText: string;
    defaultTextFormat: flash.text.TextFormat;
    textRuns: flash.text.TextRun[];

    constructor(defaultTextFormat?: flash.text.TextFormat) {
      this._id = flash.display.DisplayObject.getNextSyncID();
      this._isDirty = false;
      this._plainText = '';
      this.defaultTextFormat = defaultTextFormat || new flash.text.TextFormat();
      this.textRuns = [];
    }

    parseHtml(htmlText: string, multiline: boolean = false) {
      var plainText = '';

      var textRuns = this.textRuns;
      textRuns.length = 0;

      var beginIndex = 0;
      var endIndex = 0;
      var textFormat = this.defaultTextFormat;

      var stack = [];

      Shumway.HTMLParser(htmlText, {
        chars: (text) => {
          plainText += text;
          endIndex += text.length;
        },
        start: (tagName, attributes) => {
          switch (tagName) {
            case 'a':
              somewhatImplemented('<a/>');
              stack.push(textFormat);
              var target = attributes.target;
              var url = attributes.url;
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
            case 'br':
              if (multiline) {
                plainText += '\n';
                endIndex++;
              }
            case 'font':
              stack.push(textFormat);
              var color = attributes.color;
              // TODO: the value of the face property can be a string specifying a list of
              // comma-delimited font names in which case the first available font should be used.
              var font = attributes.face;
              var size = attributes.size;
              if (textFormat.color !== color ||
                textFormat.font !== font ||
                textFormat.size !== size)
              {
                textFormat = textFormat.clone();
                textFormat.align = align;
                textFormat.font = font;
                textFormat.color = color;
              }
              break;
            case 'img':
              notImplemented('<img/>');
              break;
            case 'i':
              stack.push(textFormat);
              if (!textFormat.italic) {
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
              break;
            case 'p':
              stack.push(textFormat);
              var align = attributes.align;
              if (textFormat.align !== align) {
                textFormat = textFormat.clone();
                textFormat.align = align;
              }
              break;
            case 'span':
              stack.push(textFormat);
              // TODO: support CSS style classes.
              break;
            case 'textformat':
              stack.push(textFormat);
              var blockIndent = attributes.blockindent;
              var indent = attributes.indent;
              var leading = attributes.leading;
              var leftMargin = attributes.leftmargin;
              var rightMargin = attributes.rightmargin;
              //var tabStops = attributes.tabstops || null;
              if (textFormat.blockIndent !== blockIndent ||
                textFormat.indent !== indent ||
                textFormat.leading !== leading ||
                textFormat.leftMargin !== leftMargin ||
                textFormat.rightMargin !== rightMargin /*||
               textFormat.tabStops !== tabStops*/)
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
          if ((tagName === 'li' || tagName === 'p') && multiline) {
            plainText += '\n';
            endIndex++;
          }
          if (tagName !== 'br' && tagName !== 'img') {
            var f = stack.pop();
            if (f === textFormat) {
              if (textRuns.length) {
                textRuns[textRuns.length - 1].endIndex = endIndex;
              } else {
                textRuns.push(new flash.text.TextRun(beginIndex, endIndex, f));
              }
            } else {
              textRuns.push(new flash.text.TextRun(beginIndex, endIndex, f));
              beginIndex = endIndex = endIndex + 1;
              textFormat = f;
            }
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
      this._plainText = value;
      this.textRuns.length = 0;
      this.textRuns[0] = new flash.text.TextRun(0, value.length, this.defaultTextFormat);
      this._isDirty = true;
    }
  }
}
