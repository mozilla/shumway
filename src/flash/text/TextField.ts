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
// Class: TextField
module Shumway.AVM2.AS.flash.text {
  import notImplemented = Shumway.Debug.notImplemented;
  import somewhatImplemented = Shumway.Debug.somewhatImplemented;
  import throwError = Shumway.AVM2.Runtime.throwError;
  import asCoerceString = Shumway.AVM2.Runtime.asCoerceString;

  import clamp = Shumway.NumberUtilities.clamp;

  export class TextField extends flash.display.InteractiveObject {

    static classSymbols: string [] = null;
    static instanceSymbols: string [] = null;

    static classInitializer: any = null;

    static initializer: any = function (symbol: Shumway.Timeline.TextSymbol) {
      var self: TextField = this;

      self._alwaysShowSelection = false;
      self._antiAliasType = AntiAliasType.NORMAL;
      self._autoSize = TextFieldAutoSize.NONE;
      self._background = false;
      self._backgroundColor = 0xffffff;
      self._border = false;
      self._borderColor = 0;
      self._bottomScrollV = 1;
      self._caretIndex = 0;
      self._condenseWhite = false;
      self._defaultTextFormat = new flash.text.TextFormat();
      self._embedFonts = false;
      self._gridFitType = GridFitType.PIXEL;
      self._htmlText = '';
      self._length = 0;
      self._textInteractionMode = TextInteractionMode.NORMAL;
      self._maxChars = 0;
      self._maxScrollH = 0;
      self._maxScrollV = 1;
      self._mouseWheelEnabled = false;
      self._multiline = false;
      self._numLines = 1;
      self._displayAsPassword = false;
      self._restrict = null;
      self._scrollH = 0;
      self._scrollV = 1;
      self._selectable = true;
      self._selectedText = '';
      self._selectionBeginIndex = 0;
      self._selectionEndIndex = 0;
      self._sharpness = 0;
      self._styleSheet = null;
      self._textColor = -1;
      self._textHeight = 0;
      self._textWidth = 0;
      self._thickness = 0;
      self._type = TextFieldType.DYNAMIC;
      self._wordWrap = false;
      self._useRichTextClipboard = false;

      self._textContent = new Shumway.TextContent();

      if (symbol) {
        self._textColor = symbol.textColor;
        self._textHeight = symbol.textHeight;
        self._defaultTextFormat.font = symbol.font;
        self._defaultTextFormat.align = symbol.align;
        self._defaultTextFormat.leftMargin = symbol.leftMargin;
        self._defaultTextFormat.rightMargin = symbol.rightMargin;
        self._defaultTextFormat.indent = symbol.indent;
        self._defaultTextFormat.leading = symbol.leading;
        self._multiline = symbol.multiline;
        self._wordWrap = symbol.wordWrap;
        self._embedFonts = symbol.embedFonts;
        self._selectable = symbol.selectable;
        self._border = symbol.border;

        if (symbol.html) {
          self.htmlText = symbol.initialText;
        } else {
          self.text = symbol.initialText;
        }

        self._displayAsPassword = symbol.displayAsPassword;
        self._type = symbol.type;
        self._maxChars = symbol.maxChars;
        self._autoSize = symbol.autoSize;

        //var bounds = symbol.fillBounds;
        //if (bounds) {
        //  this._matrix.tx += bounds.xMin;
        //  this._matrix.ty += bounds.yMin;
        //  this._fillBounds.xMax = bounds.xMax - bounds.xMin;
        //  this._fillBounds.yMax = bounds.yMax - bounds.yMin;
        //}
      } else {
        //self._matrix.tx -= 40;
        //self._matrix.ty -= 40;
      }
    };

    constructor() {
      super();
      notImplemented("Dummy Constructor: public flash.text.TextField");
    }

    // JS -> AS Bindings

    //selectedText: string;
    //appendText: (newText: string) => void;
    //getXMLText: (beginIndex: number /*int*/ = 0, endIndex: number /*int*/ = 2147483647) => string;
    //insertXMLText: (beginIndex: number /*int*/, endIndex: number /*int*/, richText: string, pasting: boolean = false) => void;
    //copyRichText: () => string;
    //pasteRichText: (richText: string) => boolean;

    // AS -> JS Bindings
    static isFontCompatible(fontName: string, fontStyle: string): boolean {
      fontName = asCoerceString(fontName);
      fontStyle = asCoerceString(fontStyle);
      somewhatImplemented("flash.text.TextField.isFontCompatible");
      return true;
    }

    _alwaysShowSelection: boolean;
    _antiAliasType: string;
    _autoSize: string;
    _background: boolean;
    _backgroundColor: number /*uint*/;
    _border: boolean;
    _borderColor: number /*uint*/;
    _bottomScrollV: number /*int*/;
    _caretIndex: number /*int*/;
    _condenseWhite: boolean;
    _defaultTextFormat: flash.text.TextFormat;
    _embedFonts: boolean;
    _gridFitType: string;
    _htmlText: string;
    _length: number /*int*/;
    _textInteractionMode: string;
    _maxChars: number /*int*/;
    _maxScrollH: number /*int*/;
    _maxScrollV: number /*int*/;
    _mouseWheelEnabled: boolean;
    _multiline: boolean;
    _numLines: number /*int*/;
    _displayAsPassword: boolean;
    _restrict: string;
    _scrollH: number /*int*/;
    _scrollV: number /*int*/;
    _selectable: boolean;
    _selectedText: string;
    _selectionBeginIndex: number /*int*/;
    _selectionEndIndex: number /*int*/;
    _sharpness: number;
    _styleSheet: flash.text.StyleSheet;
    _textColor: number /*uint*/;
    _textHeight: number;
    _textWidth: number;
    _thickness: number;
    _type: string;
    _wordWrap: boolean;
    _useRichTextClipboard: boolean;

    _textContent: Shumway.TextContent;

    get alwaysShowSelection(): boolean {
      return this._alwaysShowSelection;
    }

    set alwaysShowSelection(value: boolean) {
      somewhatImplemented("public flash.text.TextField::set alwaysShowSelection");
      this._alwaysShowSelection = !!value;
    }

    get antiAliasType(): string {
      return this._antiAliasType;
    }

    set antiAliasType(antiAliasType: string) {
      somewhatImplemented("public flash.text.TextField::set antiAliasType");
      antiAliasType = asCoerceString(antiAliasType);
      if (AntiAliasType.toNumber(antiAliasType) < 0) {
        throwError("ArgumentError", Errors.InvalidParamError, "antiAliasType");
      }
      this._antiAliasType = antiAliasType;
    }

    get autoSize(): string {
      return this._autoSize;
    }

    set autoSize(value: string) {
      value = asCoerceString(value);
      if (TextFieldAutoSize.toNumber(value) < 0) {
        throwError("ArgumentError", Errors.InvalidParamError, "autoSize");
      }
      this._autoSize = value;
    }

    get background(): boolean {
      return this._background;
    }

    set background(value: boolean) {
      this._background = !!value;
    }

    get backgroundColor(): number /*uint*/ {
      return this._backgroundColor;
    }

    set backgroundColor(value: number /*uint*/) {
      this._backgroundColor = value >>> 0;
    }

    get border(): boolean {
      return this._border;
    }

    set border(value: boolean) {
      this._border = !!value;
    }

    get borderColor(): number /*uint*/ {
      return this._borderColor;
    }

    set borderColor(value: number /*uint*/) {
      this._borderColor = value >>> 0;
    }

    get bottomScrollV(): number /*int*/ {
      notImplemented("public flash.text.TextField::get bottomScrollV"); return;
      // return this._bottomScrollV;
    }
    get caretIndex(): number /*int*/ {
      notImplemented("public flash.text.TextField::get caretIndex"); return;
      // return this._caretIndex;
    }

    get condenseWhite(): boolean {
      somewhatImplemented("public flash.text.TextField::get condenseWhite");
      return this._condenseWhite;
    }

    set condenseWhite(value: boolean) {
      this._condenseWhite = !!value;
    }

    get defaultTextFormat(): flash.text.TextFormat {
      return this._defaultTextFormat;
    }

    set defaultTextFormat(format: flash.text.TextFormat) {
      somewhatImplemented("public flash.text.TextField::set defaultTextFormat");
      // this._defaultTextFormat = format;
    }

    get embedFonts(): boolean {
      return this._embedFonts;
    }

    set embedFonts(value: boolean) {
      this._embedFonts = !!value;
    }

    get gridFitType(): string {
      notImplemented("public flash.text.TextField::get gridFitType"); return;
      // return this._gridFitType;
    }
    set gridFitType(gridFitType: string) {
      gridFitType = "" + gridFitType;
      notImplemented("public flash.text.TextField::set gridFitType"); return;
      // this._gridFitType = gridFitType;
    }

    get htmlText(): string {
      return this._htmlText;
    }

    set htmlText(value: string) {
      somewhatImplemented("public flash.text.TextField::set htmlText");
      value = asCoerceString(value);

      var plainText = '';

      var textRuns = this._textContent.textRuns;
      textRuns.length = 0;

      var beginIndex = 0;
      var endIndex = 0;
      var textFormat = this._defaultTextFormat;

      var stack = [];

      Shumway.HTMLParser(value, {
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
              if (this._multiline) {
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
                  textFormat.color !== color)
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
          if ((tagName === 'li' || tagName === 'p') && this._multiline) {
            plainText += '\n';
            endIndex++;
          }
          if (tagName !== 'br' && tagName !== 'img') {
            var f = stack.pop();
            if (f === textFormat) {
              if (textRuns.length) {
                textRuns[textRuns.length - 1].endIndex = endIndex;
              } else {
                textRuns.push(new TextRun(beginIndex, endIndex, f));
              }
            } else {
              textRuns.push(new TextRun(beginIndex, endIndex, f));
              beginIndex = endIndex = endIndex + 1;
              textFormat = f;
            }
          }
        }
      });

      this._htmlText = value;
      this._textContent.plainText = plainText;
      this._textContent._isDirty = true;
    }

    get length(): number /*int*/ {
      return this._length;
    }

    get textInteractionMode(): string {
      notImplemented("public flash.text.TextField::get textInteractionMode"); return;
      // return this._textInteractionMode;
    }

    get maxChars(): number /*int*/ {
      return this._maxChars;
    }

    set maxChars(value: number /*int*/) {
      this._maxChars = value | 0;
    }

    get maxScrollH(): number /*int*/ {
      return this._maxScrollH;
    }

    get maxScrollV(): number /*int*/ {
      return this._maxScrollV;
    }

    get mouseWheelEnabled(): boolean {
      return this._mouseWheelEnabled;
    }

    set mouseWheelEnabled(value: boolean) {
      somewhatImplemented("public flash.text.TextField::set mouseWheelEnabled");
      this._mouseWheelEnabled = !!value;
    }

    get multiline(): boolean {
      return this._multiline;
    }

    set multiline(value: boolean) {
      this._multiline = !!value;
    }

    get numLines(): number /*int*/ {
      return this._numLines;
    }

    get displayAsPassword(): boolean {
      return this._displayAsPassword;
    }

    set displayAsPassword(value: boolean) {
      somewhatImplemented("public flash.text.TextField::set displayAsPassword");
      this._displayAsPassword = !!value;
    }

    get restrict(): string {
      return this._restrict;
    }

    set restrict(value: string) {
      somewhatImplemented("public flash.text.TextField::set restrict");
      this._restrict = asCoerceString(value);
    }

    get scrollH(): number /*int*/ {
      notImplemented("public flash.text.TextField::get scrollH"); return;
      // return this._scrollH;
    }
    set scrollH(value: number /*int*/) {
      value = value | 0;
      notImplemented("public flash.text.TextField::set scrollH"); return;
      // this._scrollH = value;
    }
    get scrollV(): number /*int*/ {
      notImplemented("public flash.text.TextField::get scrollV"); return;
      // return this._scrollV;
    }
    set scrollV(value: number /*int*/) {
      value = value | 0;
      notImplemented("public flash.text.TextField::set scrollV"); return;
      // this._scrollV = value;
    }

    get selectable(): boolean {
      return this._selectable;
    }

    set selectable(value: boolean) {
      somewhatImplemented("public flash.text.TextField::set selectable");
      this._selectable = !!value;
    }

    get selectionBeginIndex(): number /*int*/ {
      return this._selectionBeginIndex;
    }

    get selectionEndIndex(): number /*int*/ {
      return this._selectionEndIndex;
    }

    get sharpness(): number {
      return this._sharpness;
    }

    set sharpness(value: number) {
      this._sharpness = clamp(+value, -400, 400);
    }

    get styleSheet(): flash.text.StyleSheet {
      notImplemented("public flash.text.TextField::get styleSheet"); return;
      // return this._styleSheet;
    }
    set styleSheet(value: flash.text.StyleSheet) {
      value = value;
      notImplemented("public flash.text.TextField::set styleSheet"); return;
      // this._styleSheet = value;
    }

    get text(): string {
      return this._textContent.plainText;
    }

    set text(value: string) {
      somewhatImplemented("public flash.text.TextField::set text");
      var value = asCoerceString(value);
      this._textContent.plainText = value;
      this._textContent.textRuns.length = 0;
      this._textContent.textRuns[0] = new TextRun(0, value.length, this._defaultTextFormat);
      this._textContent._isDirty = true;
    }

    get textColor(): number /*uint*/ {
      return this._textColor < 0 ? +this._defaultTextFormat.color : this._textColor;
    }

    set textColor(value: number /*uint*/) {
      this._textColor = value >>> 0;
    }

    get textHeight(): number {
      somewhatImplemented("public flash.text.TextField::get textHeight");
      return this._textHeight;
    }

    get textWidth(): number {
      somewhatImplemented("public flash.text.TextField::get textWidth");
      return this._textWidth;
    }

    get thickness(): number {
      return this._thickness;
    }

    set thickness(value: number) {
      this._thickness = clamp(+value, -200, 200);
    }

    get type(): string {
      return this._type;
    }

    set type(value: string) {
      this._type = asCoerceString(value);
    }

    get wordWrap(): boolean {
      return this._wordWrap;
    }

    set wordWrap(value: boolean) {
      this._wordWrap = !!value;
    }

    get useRichTextClipboard(): boolean {
      notImplemented("public flash.text.TextField::get useRichTextClipboard"); return;
      // return this._useRichTextClipboard;
    }
    set useRichTextClipboard(value: boolean) {
      value = !!value;
      notImplemented("public flash.text.TextField::set useRichTextClipboard"); return;
      // this._useRichTextClipboard = value;
    }
    getCharBoundaries(charIndex: number /*int*/): flash.geom.Rectangle {
      charIndex = charIndex | 0;
      notImplemented("public flash.text.TextField::getCharBoundaries"); return;
    }
    getCharIndexAtPoint(x: number, y: number): number /*int*/ {
      x = +x; y = +y;
      notImplemented("public flash.text.TextField::getCharIndexAtPoint"); return;
    }
    getFirstCharInParagraph(charIndex: number /*int*/): number /*int*/ {
      charIndex = charIndex | 0;
      notImplemented("public flash.text.TextField::getFirstCharInParagraph"); return;
    }
    getLineIndexAtPoint(x: number, y: number): number /*int*/ {
      x = +x; y = +y;
      notImplemented("public flash.text.TextField::getLineIndexAtPoint"); return;
    }
    getLineIndexOfChar(charIndex: number /*int*/): number /*int*/ {
      charIndex = charIndex | 0;
      notImplemented("public flash.text.TextField::getLineIndexOfChar"); return;
    }
    getLineLength(lineIndex: number /*int*/): number /*int*/ {
      lineIndex = lineIndex | 0;
      notImplemented("public flash.text.TextField::getLineLength"); return;
    }
    getLineMetrics(lineIndex: number /*int*/): flash.text.TextLineMetrics {
      lineIndex = lineIndex | 0;
      notImplemented("public flash.text.TextField::getLineMetrics"); return;
    }
    getLineOffset(lineIndex: number /*int*/): number /*int*/ {
      lineIndex = lineIndex | 0;
      notImplemented("public flash.text.TextField::getLineOffset"); return;
    }
    getLineText(lineIndex: number /*int*/): string {
      lineIndex = lineIndex | 0;
      notImplemented("public flash.text.TextField::getLineText"); return;
    }
    getParagraphLength(charIndex: number /*int*/): number /*int*/ {
      charIndex = charIndex | 0;
      notImplemented("public flash.text.TextField::getParagraphLength"); return;
    }
    getTextFormat(beginIndex: number /*int*/ = -1, endIndex: number /*int*/ = -1): flash.text.TextFormat {
      beginIndex = beginIndex | 0; endIndex = endIndex | 0;
      notImplemented("public flash.text.TextField::getTextFormat"); return;
    }

    getTextRuns(beginIndex: number /*int*/ = 0, endIndex: number /*int*/ = 2147483647): any [] {
      var textRuns = this._textContent.textRuns;
      var result = [];
      for (var i = 0; i < textRuns.length; i++) {
        var textRun = textRuns[i];
        if (textRun.beginIndex >= beginIndex && textRun.endIndex <= endIndex) {
          result.push(textRun.clone());
        }
      }
      return result;
    }

    getRawText(): string {
      notImplemented("public flash.text.TextField::getRawText"); return;
    }
    replaceSelectedText(value: string): void {
      value = "" + value;
      notImplemented("public flash.text.TextField::replaceSelectedText"); return;
    }
    replaceText(beginIndex: number /*int*/, endIndex: number /*int*/, newText: string): void {
      beginIndex = beginIndex | 0; endIndex = endIndex | 0; newText = "" + newText;
      notImplemented("public flash.text.TextField::replaceText"); return;
    }
    setSelection(beginIndex: number /*int*/, endIndex: number /*int*/): void {
      beginIndex = beginIndex | 0; endIndex = endIndex | 0;
      notImplemented("public flash.text.TextField::setSelection"); return;
    }
    setTextFormat(format: flash.text.TextFormat, beginIndex: number /*int*/ = -1, endIndex: number /*int*/ = -1): void {
      format = format; beginIndex = beginIndex | 0; endIndex = endIndex | 0;
      notImplemented("public flash.text.TextField::setTextFormat"); return;
    }
    getImageReference(id: string): flash.display.DisplayObject {
      id = "" + id;
      notImplemented("public flash.text.TextField::getImageReference"); return;
    }
  }
}
